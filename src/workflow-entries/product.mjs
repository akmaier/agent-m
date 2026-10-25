// product.mjs — the entries of a product's job workflow (MOD-workflow-entries, Parts): ITM-365 builds onRecordsChanged and onDispatch, which take
// and run the queued jobs of this CI route; ITM-498 adds to onDispatch the job whose task travels with a conversation's hand-over (UC-049 4a), which onRecordsChanged
// leaves queued. ITM-791 adds to onRecordsChanged the resumption of the jobs of this route whose gate is recorded (A JOB STOPS AT EVERY GATE). The runs' next actions, onDoneCheck, onPullRequestClosed, onCheckCompleted,
// onTestsFinished is another item's. ITM-1032 builds onSchedule: the close of a sprint an agent closes.
//
// Module: MOD-workflow-entries
//
// A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A CI AGENT'S DRAFT ENTERS AS
// OPEN; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; NO SECRET IN THE REPOSITORY. No person attends a job in CI: the job runner calls the kind's
// writer at once. The entry keeps nothing between runs.

import { appendToRecord, jobCost, jobState, newJobId, recordsNewestFirst, startRecord, takeJob } from "../job-ledger/index.mjs";
import { kindOf } from "../job-catalogue/index.mjs";
import { prepareJob, provenanceLines, runJob } from "../job-runner/index.mjs";
import { endpointDriver, testEndpoint } from "../endpoint-calls/index.mjs";
import { agentDriver, installedAgents } from "../agent-processes/index.mjs";
import { participantSchema, participantsOf } from "../participant-list/index.mjs";
import { readDocument } from "../documents/index.mjs";
import { productFacts } from "../progress-measures/index.mjs";
import { recordGateDecision } from "../product-process/index.mjs";
import { queueJob } from "../runtimes/index.mjs";
import { sprintsToClose } from "../work-plans/index.mjs";
import { composeProduct } from "./compose.mjs";
import { packResult, readResult, checkResult, writeBranches, pendingPullRequest } from "./result.mjs";

const fs = globalThis.process?.getBuiltinModule?.("node:fs");

// The route of this CI service's jobs, as MOD-job-ledger writes a record's route, and the form of a CI agent's route in the register.
const routeOf = (runner) => (runner === "hosted" ? "ci hosted" : `ci runner:${runner}`);
const CI_ROUTE = /^ci (?:hosted|runner:\S+) secret (\S+)$/;
// The secret a participant's route names, of any route that names one (`endpoint <name> secret <NAME>`, `ci hosted secret <NAME>`), and the words of a record whose task a hand-over brings.
const SECRET_OF = / secret (\S+)$/;
const WITH_HAND_OVER = "with the hand-over";
const NO_TASK = "the task travels with its hand-over, and this run was started without it";
// A run a page or a hand-over started: GitHub's workflow_dispatch; on GitLab a pipeline whose source is `web` or `api`, as the job workflow's rules start onDispatch.
const dispatched = (env) => (env.service === "gitlab" ? ["web", "api"].includes(env.event?.name) : env.event?.name === "workflow_dispatch");
const failedStatus = (summary) => ({ outcome: "failed", summary, findings: [] });
const notRun = (summary) => ({ outcome: "not run", summary, findings: [] });

// The sum of the usage the participants reported, or null where none reported any.
function usageOf(usages) {
  const reported = usages.map((each) => each.usage).filter(Boolean);
  if (reported.length === 0) return null;
  const sum = (field) => (reported.every((each) => each[field] == null) ? null : reported.reduce((total, each) => total + (each[field] ?? 0), 0));
  return { inputTokens: sum("inputTokens"), outputTokens: sum("outputTokens"), minutes: sum("minutes"), cost: reported.find((each) => each.cost)?.cost ?? null };
}

// The driver of a participant for a job: a model endpoint from the endpoint the job's record names, its key the participant's secret; or a coding
// agent the record names, its key variable that secret's name.
async function driverOf(participant, params, secretName, key, workdir) {
  if (params.endpoint) return endpointDriver({ ...params.endpoint, key }, participant);
  if (typeof params.agent === "string") {
    const agent = (await installedAgents()).find((each) => each.name === params.agent);
    if (!agent?.installed) throw Object.assign(new Error(`The agent ${params.agent} is not installed on this runner.`), { name: "AgentMissing" });
    return agentDriver(agent, { workdir, keyVariable: secretName }, participant);
  }
  throw Object.assign(new Error("The job's record names no endpoint and no agent for its participant."), { name: "NoDriver" });
}

// Ends a taken job in its record, on the current head: the End part appended to the record as it stands there, committed through the product's
// host, with the provenance lines of the job.
async function endRecord(host, path, part, trailers) {
  for (let attempt = 1; ; attempt++) {
    const head = await host.readSnapshot("HEAD");
    const id = /([^/]+)\.md$/.exec(path)?.[1] ?? path;
    try {
      await host.commitFiles({ branch: part.branch, expectedHead: head.commit, files: [{ path, text: appendToRecord(await head.read(path), part.part) }],
        message: `end ${id}: ${part.part.state}${trailers.length ? `\n\n${trailers.join("\n")}` : ""}` });
      return;
    } catch (error) {
      if (error?.name !== "Moved" || attempt >= 5) throw error;
    }
  }
}

// How a job's end is written: on the agent's machine kept for the writing machine, which writes it once the result is written (result.mjs); elsewhere at once.
const endOf = (composed) => (composed.result ? (path, part, trailers) => composed.result.end(path, part, trailers) : (path, part, trailers) => endRecord(composed.product.host, path, part, trailers));

// The driver of a model endpoint a hand-over names: opencode working with that endpoint, its key the variable the participant's secret names (MOD-agent-processes).
async function opencodeDriver(participant, endpoint, secretName, workdir) {
  const agent = (await installedAgents()).find((each) => each.name === "opencode");
  if (!agent?.installed) throw Object.assign(new Error("opencode is not installed on this runner."), { name: "AgentMissing" });
  return agentDriver(agent, { workdir, keyVariable: secretName ?? null, endpoint }, participant);
}

// The endpoint a hand-over's input names: { kind, baseUrl, model } read from its JSON text.
function endpointOf(text) {
  let read = null;
  try { read = JSON.parse(text); } catch { /* refused below */ }
  if (!read || typeof read.kind !== "string" || typeof read.baseUrl !== "string" || typeof read.model !== "string") {
    throw Object.assign(new Error("the input endpoint is not the JSON text of { kind, baseUrl, model }."), { name: "BadEndpoint" });
  }
  return { kind: read.kind, baseUrl: read.baseUrl, model: read.model };
}

// The task, trimmed, must not appear in a run's PR text or new branch commit messages. Without a PR, compare the reported branch at one
// pinned commit against the job's pre-run snapshot by complete commit identities, including merge-side history. -> { branch, where } or null.
async function refusedBranch(host, written, task, baseCommit) {
  const number = /\/(?:pull|merge_requests)\/(\d+)\b/.exec(written?.pullRequest ?? "")?.[1];
  const holds = (value) => typeof value === "string" && value.includes(task.trim());
  if (number) {
    const facts = await host.pullRequestFacts(Number(number));
    const where = facts.commits.some((commit) => holds(commit.message)) ? "a commit message" : Object.values(facts.pullRequest).some(holds) ? "the pull request's text" : null;
    return where ? { branch: facts.pullRequest.branch, where } : null;
  }
  const branch = written?.shown?.branch;
  if (typeof branch !== "string" || !branch) return null;
  const pinned = await host.readSnapshot(branch);
  const history = await host.readHistory(null, { ref: pinned.commit, changes: false });
  const before = new Set((await host.readHistory(null, { ref: baseCommit, changes: false })).map((entry) => entry.commit));
  return history.some((entry) => !before.has(entry.commit) && holds(entry.message)) ? { branch, where: "a commit message" } : null;
}

// The participant's answer: the draft's `answer` where it is a text, else the draft as it stands, as JSON.
function answerOf(draft) {
  if (typeof draft === "string") return draft;
  if (typeof draft?.answer === "string") return draft.answer;
  return draft == null ? "" : JSON.stringify(draft, null, 2);
}

// A hand-over's answer, left in the run's summary — the file GITHUB_STEP_SUMMARY names where it is set — and in the log, between the lines
// `--- answer of <id> ---` and `--- end of the answer of <id> ---`, by which the prompt bar finds it in the run's log (MOD-prompt-bar). It goes to no record.
function leaveAnswer(env, id, answer) {
  if (!answer) return;
  console.log(`--- answer of ${id} ---\n${answer}\n--- end of the answer of ${id} ---`);
  if (env.job.summaryFile) fs.appendFileSync(env.job.summaryFile, `## ${id}\n\n${answer}\n`);
}

// One job: taken, prepared, run, ended in its record. -> { id, state, summary }. `handOver` is { task, endpoint } for a job whose task travels with its hand-over: the
// task is the job's instruction in memory only, the record keeps none, and what is written about the run hides the task and every secret.
async function runJobOf(env, composed, participants, row, handOver = null) {
  const { record, path } = row;
  const { job } = env;
  const product = composed.product, instance = composed.instance;
  const participant = participants.find((each) => each.name === record.participant);
  const taking = await takeJob(product.host, path, job.runUrl ?? `ci ${job.runner}`, (await product.host.readSnapshot("HEAD")).commit);
  if (!taking.taken) return { id: record.id, state: "skipped", summary: `${record.id} was taken by ${taking.by}` };
  // A hand-over with an endpoint reads its key from the secret the input `secret` names, and no other; every other job from the secret its participant's route names.
  const secretName = handOver?.endpoint ? (handOver.secret ?? undefined) : (handOver ? SECRET_OF : CI_ROUTE).exec(participant.route ?? "")?.[1];
  const hidden = (value) => {
    let said = String(value);
    if (handOver) said = said.split(handOver.task.trim()).join("[the task]");
    for (const secret of [env.job.personToken, ...Object.values(env.job.keys)].filter(Boolean)) said = said.split(secret).join("[secret]");
    return said;
  };
  const context = { kind: null, params: handOver ? { ...(record.params ?? {}), instruction: handOver.task } : record.params ?? {}, product: { address: product.address, snapshot: await product.host.readSnapshot("HEAD"), host: product.host },
    instance: { snapshot: await instance.host.readSnapshot("HEAD"), host: instance.host, checkout: instance.checkout },
    connect: async (address) => product.host, participants, places: { sources: {}, mailbox: null }, gates: [], person: record.startedBy ?? null, now: env.now,
    agentM: record.agentM, jobId: record.id };
  let ended = { state: "failed", results: [], draft: null, rounds: [], usage: null, reason: null }, outcome = null, endpoint = null;
  try {
    context.kind = await kindOf(record.kind);
    const prepared = await prepareJob(record.kind, context, { drafter: participant, reviewers: [], limit: record.limit });
    if (prepared.blocking.length > 0 || prepared.notFitting.length > 0) {
      throw Object.assign(new Error(prepared.blocking.map((found) => found.what).join("; ") || "the job does not fit its participant"), { name: "NotStartable" });
    }
    endpoint = handOver?.endpoint ? endpointOf(handOver.endpoint) : null;
    const driver = endpoint ? await opencodeDriver(participant, endpoint, secretName, job.productDir ?? instance.checkout)
      : await driverOf(participant, record.params ?? {}, secretName, job.keys[secretName], instance.checkout);
    const result = await runJob(prepared, { drafter: driver, reviewers: [] }, { attended: false, context });
    outcome = result.written;
    // On the agent's machine the branch is not on the server yet: the writing machine refuses a result whose commits or pull request hold the task (result.mjs).
    if (handOver && !composed.result) {
      const refused = await refusedBranch(product.host, outcome, handOver.task, context.product.snapshot.commit);
      if (refused) throw Object.assign(new Error(`the branch ${refused.branch} is refused: ${refused.where} holds the task of the hand-over.`), { name: "TaskInBranch" });
    }
    if (handOver) leaveAnswer(env, record.id, answerOf(outcome?.shown ?? result.draft));
    const handedBack = context.kind.writer === "return-draft";
    const made = outcome ? [...outcome.commits, ...(handOver ? [...outcome.files, ...(outcome.pullRequest ? [outcome.pullRequest] : [])] : [])] : [];
    ended = { state: "done", results: handOver ? (made.length > 0 ? [...made, ...outcome.notes.map((note) => `note: ${note}`)] : handedBack ? [] : ["no change"])
        : handedBack ? [] : outcome && outcome.commits.length > 0 ? [...outcome.commits, ...outcome.notes.map((note) => `note: ${note}`)] : ["no change"],
      draft: handOver ? null : handedBack ? (outcome?.shown ?? result.draft) : null, rounds: result.rounds, usage: usageOf(result.usage), reason: null,
      stoppedBecause: result.stoppedBecause, drafter: result.drafter };
  } catch (error) {
    let reason = error?.message ?? String(error);
    if (endpoint && error?.name === "AgentFailed") {
      const said = String(error.lastOutput ?? "").trim().split("\n").filter(Boolean).at(-1) ?? error.message;
      // One short request to the endpoint, with the key the agent was given: where it fails, its diagnosis is the reason; where it works, the run reached it and the failure is the agent's.
      const probe = await testEndpoint({ name: "hand-over", ...endpoint, key: job.keys[secretName] ?? null });
      reason = probe.works ? `the agent failed (exit code ${error.exitCode}) working with the endpoint ${endpoint.baseUrl} (${endpoint.model}): ${said}`
        : `the run failed against the endpoint ${endpoint.baseUrl} (${endpoint.model}): ${probe.diagnosis.reason} — ${probe.diagnosis.message}. The routes that would work: a self-hosted runner, or a Bridge.`;
    }
    ended = { ...ended, reason: handOver ? hidden(reason) : reason };
  }
  const part = { part: { part: "end", at: env.now, state: ended.state, results: ended.results, draft: ended.draft, rounds: ended.rounds, usage: ended.usage,
    cost: jobCost(ended.usage, participant), reason: ended.reason, log: job.runUrl ?? null, ...(ended.stoppedBecause ? { stoppedBecause: ended.stoppedBecause } : {}) }, branch: env.branch };
  const trailers = provenanceLines({ agentM: record.agentM, jobId: record.id, kind: record.kind, participant, rounds: ended.rounds.length, instruction: record.params?.instruction ?? null });
  await endOf(composed)(path, part, trailers);
  const noChange = ended.state === "done" && ended.results.length === 1 && ended.results[0] === "no change";
  return { id: record.id, state: ended.state, summary: ended.state === "failed" ? `${record.id} failed: ${ended.reason}` : `${record.id} ${noChange ? "ended done, no change" : "ended done"}` };
}

// The queued jobs of this route in the product's checkout, oldest first, each with its path. A job whose task travels with its hand-over is one only `onDispatch` takes.
async function queuedOf(env, snapshot, { handedOver = false } = {}) {
  const wanted = routeOf(env.job.runner);
  const rows = [];
  for await (const record of recordsNewestFirst(snapshot)) {
    if (record.route === wanted && jobState(record, null) === "queued" && (handedOver || record.task !== WITH_HAND_OVER)) rows.push({ record, path: record.path });
  }
  return rows.reverse();
}

// The key secret a queued job's participant reads, as its route names it — `ci <runner> secret <NAME>` —, or null.
const keyOfRow = (participants, { record }) => CI_ROUTE.exec(participants.find((each) => each.name === record.participant)?.route ?? "")?.[1] ?? null;

// The jobs this machine runs: on the agent's machine, those whose key is the one it was given, or none the job workflow reads; a job whose key is another of
// those the file reads is left queued for the run its own key's machine makes. Elsewhere every job.
function ofThisMachine(env, participants, rows) {
  if (env.job.part !== "agent") return rows;
  return rows.filter((row) => {
    const key = keyOfRow(participants, row);
    return key === null || key === env.job.agentKey || !Object.hasOwn(env.job.keys, key);
  });
}

// The product's facts of the scope `work`, read once: the workflow, the jobs and the states of the gates (gateStates).
async function workFacts(env, composed) {
  const { instance, product } = composed;
  // The facts are read through the clone alone: the gates and jobs need no pull request, and the server's answer is not asked for (productFacts takes a refusal as `unknown`).
  const clone = { ...product.host, listPullRequests: async () => { throw Object.assign(new Error("pull requests are not read here"), { name: "NotSupported" }); } };
  return productFacts(clone, await instance.host.readSnapshot("HEAD"), (commit) => instance.host.readSnapshot(commit), env.now, { scope: "work" });
}

// The jobs of this route waiting at a gate that is now passed, each with the gate record that passed it. A gate record whose decider is the job's own participant —
// whose work the gate checks — does not resume the job.
async function resumable(env, composed) {
  const facts = await workFacts(env, composed);
  const wanted = routeOf(env.job.runner);
  const rows = [];
  for (const { record, state } of facts.jobs) {
    if (state !== "waiting at a gate" || record.route !== wanted) continue;
    const reached = record.gates.at(-1)?.gate;
    const passed = facts.gateStates.find((each) => each.gate === reached && each.state === "passed");
    const decided = passed && facts.gates.find((each) => each.path === passed.record);
    if (decided && decided.fields.decider !== record.participant) rows.push({ record, path: record.path, gateRecord: passed.record });
  }
  return rows;
}

// Resumes a job: the `Resumed` part naming the gate record, committed on the current head.
async function resume(host, branch, now, { record, path, gateRecord }) {
  const head = await host.readSnapshot("HEAD");
  await host.commitFiles({ branch, expectedHead: head.commit, files: [{ path, text: appendToRecord(await head.read(path), { part: "resumed", at: now, gateRecord }) }],
    message: `resume ${record.id}: ${gateRecord}` });
  return `${record.id} resumed by ${gateRecord}`;
}

// The participants of the instance's register, read from its checkout.
async function participantsOfInstance(snapshot) {
  const register = await snapshot.read("docs/participants.md");
  return register === null ? [] : participantsOf(readDocument(participantSchema(), "docs/participants.md", register));
}

// The secrets a job needs, as a status when one is missing: the person's token, and the key of each participant whose route names a secret.
function missingSecret(env, participants, rows) {
  if (!env.job.personToken && env.job.part !== "agent") return `${env.job.tokenName} is missing: the person's Agent M token is a secret of this repository, passed to the job as ${env.job.tokenName}. Nothing was written.`;
  for (const { record } of rows) {
    const participant = participants.find((each) => each.name === record.participant);
    const secret = CI_ROUTE.exec(participant?.route ?? "")?.[1];
    if (secret && !env.job.keys[secret]) return `${secret} is missing: the key of ${participant.name} is a secret of this repository, passed to the job as ${secret}. Nothing was written.`;
  }
  return null;
}

// Takes and runs the jobs given by `rows` — the queued ones of this route, or the one dispatched — and ends with a status.
async function runRows(env, composed, participants, rows, handOver = null) {
  const results = [];
  for (const row of rows) results.push(await runJobOf(env, composed, participants, row, handOver));
  const ran = results.filter((each) => each.state !== "skipped");
  if (ran.length === 0) return { outcome: "nothing to do", summary: "No queued job of this route was taken.", findings: [] };
  return { outcome: ran.some((each) => each.state === "failed") ? "failed" : "done", summary: results.map((each) => each.summary).join("; "), findings: [] };
}

/**
 * onRecordsChanged(env: CiEnvironment) -> Promise<EntryStatus> — on a push to docs/jobs/ or docs/gates/ of a product: takes each queued job whose
 * route is this CI service's and runs it from its record alone with the driver of its participant, its key from its secret, unattended; the kind's
 * writer writes at once and the job's end is appended; a job whose writer committed nothing ends done with `no change`. A secret that is missing
 * ends the entry at once, `not run`, naming it, before anything is written.
 */
export async function onRecordsChanged(env) {
  const composed = composeProduct(env);
  const participants = await participantsOfInstance(await composed.instance.host.readSnapshot("HEAD"));
  const rows = ofThisMachine(env, participants, await queuedOf(env, await composed.product.host.readSnapshot("HEAD")));
  const missing = missingSecret(env, participants, rows);
  if (missing) return notRun(missing);
  const resumed = [];
  for (const row of await resumable(env, composed)) resumed.push(await resume(composed.product.host, env.branch, env.now, row));
  const status = await runRows(env, composed, participants, rows);
  if (resumed.length === 0) return status;
  return { ...status, outcome: status.outcome === "nothing to do" ? "done" : status.outcome, summary: [...resumed, ...(status.outcome === "nothing to do" ? [] : [status.summary])].join("; ") };
}

/**
 * onCheckCompleted(env: CiEnvironment) -> Promise<EntryStatus> — on a completed CI check (GitHub's check_run event, action completed) that a gate of the product's workflow
 * names as its decider, `check: <name>`: the gate's record, decided by that check — `passed` for the conclusion `success`, else `rejected` with the reason "the check <name>
 * concluded <conclusion>" —, on the check's commit, written through recordGateDecision, whose push resumes the job waiting at the gate. A check no gate names, a check that is
 * not completed and a gate that is passed already write nothing (`nothing to do`). A missing token ends the entry at once as `not run`.
 */
export async function onCheckCompleted(env) {
  const check = env.event?.payload?.check_run;
  if (!check || check.status !== "completed" || typeof check.name !== "string") return { outcome: "nothing to do", summary: "No completed check is named by the event.", findings: [] };
  if (!env.job.personToken) return notRun(`${env.job.tokenName} is missing: the person's Agent M token is a secret of this repository, passed to the job as ${env.job.tokenName}. Nothing was written.`);
  const composed = composeProduct(env);
  const facts = await workFacts(env, composed);
  const gates = (Array.isArray(facts.workflow?.gates) ? facts.workflow.gates : []).filter((gate) => /^check:[ \t]*(.+?)[ \t]*$/.exec(gate.decider ?? "")?.[1] === check.name);
  const written = [];
  for (const gate of gates) {
    if (facts.gateStates.some((each) => each.gate === gate.name && each.state === "passed")) continue;
    const waiting = facts.jobs.find(({ record, state }) => state === "waiting at a gate" && record.gates.at(-1)?.gate === gate.name);
    const passed = check.conclusion === "success";
    const head = await composed.product.host.readSnapshot("HEAD");
    const { path } = await recordGateDecision(composed.product.host, { gate: gate.name, job: waiting?.record.id ?? null, decider: { name: check.name, kind: "check" }, role: "check",
      decision: passed ? "passed" : "rejected", reason: passed ? null : `the check ${check.name} concluded ${check.conclusion}`, on: [check.head_sha] },
    { workflow: facts.workflow, assignment: null, workBy: [], head: head.commit, now: env.now, trailers: [] });
    written.push(`${gate.name} ${passed ? "passed" : "rejected"} by ${check.name}: ${path}`);
  }
  if (written.length === 0) return { outcome: "nothing to do", summary: `No gate of the workflow awaits the check ${check.name}.`, findings: [] };
  return { outcome: "done", summary: written.join("; "), findings: [] };
}

/**
 * onDispatch(env: CiEnvironment) -> Promise<EntryStatus> — on a run started from the server's own page: the input `job` names the job; a record of
 * that identifier that exists is run; otherwise the inputs `kind`, `participant`, `works_on` and `parameters` (a JSON text) make its start record, written in
 * one commit with the actor as the one who started it — its `works_on` the input of that name, identifiers separated by commas —, and it is run as onRecordsChanged runs a job.
 */
export async function onDispatch(env) {
  const inputs = env.event.payload?.inputs ?? {};
  if (!inputs.job) return notRun("The input job is missing: the identifier of the job to start. Nothing was written.");
  const composed = composeProduct(env);
  const participants = await participantsOfInstance(await composed.instance.host.readSnapshot("HEAD"));
  const path = `docs/jobs/${inputs.job}.md`;
  let snapshot = await composed.product.host.readSnapshot("HEAD");
  if ((await snapshot.read(path)) === null) {
    const participant = participants.find((each) => each.name === inputs.participant);
    const worksOn = String(inputs.works_on ?? "").split(/\s*,\s*/).filter(Boolean);
    if (!inputs.kind || !participant || worksOn.length === 0) {
      return failedStatus(`There is no record ${inputs.job}, and the inputs kind, participant and works_on do not name one to write.`);
    }
    const missingFirst = missingSecret(env, participants, [{ record: { participant: participant.name } }]);
    if (missingFirst) return notRun(missingFirst);
    const { text } = startRecord({ id: inputs.job, kind: inputs.kind, worksOn, participant: participant.name, model: participant.model, route: routeOf(env.job.runner), run: null,
      retries: null, startedBy: env.job.actor ?? "unknown", start: env.now, agentM: { version: "unreleased", commit: (await composed.instance.host.readSnapshot("HEAD")).commit }, inputs: [], limit: (await kindOf(inputs.kind)).limit,
      destinations: [{ participant: participant.name, place: participant.place ?? "", parts: [] }], params: inputs.parameters ? JSON.parse(inputs.parameters) : {} });
    await composed.product.host.commitFiles({ branch: env.branch, expectedHead: snapshot.commit, files: [{ path, text }], message: `Queue job ${inputs.job}: ${inputs.kind}` });
    snapshot = await composed.product.host.readSnapshot("HEAD");
  }
  const rows = (await queuedOf(env, snapshot, { handedOver: true })).filter(({ record }) => record.id === inputs.job);
  const handed = rows.find(({ record }) => record.task === WITH_HAND_OVER);
  if (handed) return runHandOver(env, composed, participants, handed, inputs);
  const missing = missingSecret(env, participants, ofThisMachine(env, participants, rows));
  if (missing) return notRun(missing);
  return runRows(env, composed, participants, ofThisMachine(env, participants, rows));
}

// A run a hand-over started (UC-049 4a), for the queued job whose task travels with it: without the input `task` the job ends failed with the reason, and nothing is written
// but the end; with it the job is run with the task as its instruction and, for a model endpoint, with the input `endpoint`.
async function runHandOver(env, composed, listed, row, inputs) {
  const { record, path } = row;
  // A job that is a model endpoint's own, which the prompt bar offered from a browser's configuration (THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND
  // AS PARTICIPANTS ARE): the instance does not list it, so it is the participant its record declares — its name, model, place (## Destinations), context and
  // capabilities (`declares`) — with the route of the endpoint the input names. Any other job goes only to a participant the instance lists.
  const own = !listed.some((each) => each.name === record.participant) && inputs.endpoint && record.declares ? declaredParticipant(record, inputs) : null;
  const participants = own ? [...listed, own] : listed;
  const participant = participants.find((each) => each.name === record.participant);
  if (!participant) return failedStatus(`${record.id} names the participant ${record.participant}, whom the instance does not list.`);
  const noToken = missingSecret(env, participants, []);
  if (noToken) return notRun(noToken);
  const task = typeof inputs.task === "string" ? inputs.task : "";
  if (!task.trim()) {
    const part = { part: { part: "end", at: env.now, state: "failed", results: [], draft: null, rounds: [], usage: null, cost: jobCost(null, participant), reason: NO_TASK, log: env.job.runUrl ?? null }, branch: env.branch };
    await endOf(composed)(path, part, provenanceLines({ agentM: record.agentM, jobId: record.id, kind: record.kind, participant, rounds: 0 }));
    return failedStatus(`${record.id} failed: ${NO_TASK}`);
  }
  // The key: for a model endpoint, the secret the input `secret` names, which the job workflow must name among its keys (`AGENT_M_KEY_NAMES`, by own property, so that no other
  // variable is read); for any other hand-over, the secret the participant's route names.
  const secret = inputs.endpoint ? (typeof inputs.secret === "string" && inputs.secret ? inputs.secret : null) : SECRET_OF.exec(participant.route ?? "")?.[1];
  if (secret && !(Object.hasOwn(env.job.keys, secret) && env.job.keys[secret])) {
    const unnamed = !Object.hasOwn(env.job.keys, secret);
    return notRun(unnamed
      ? `${secret} is missing: the job workflow names no such key, so no secret of that name reaches the run; the job workflow is installed again from Settings, which names the keys of the participants' routes and of this browser's endpoints. Nothing was written.`
      : `${secret} is missing: the key of ${participant.name} is a secret of this repository, passed to the job as ${secret}. Nothing was written.`);
  }
  return runRows(env, composed, participants, [row], { task, endpoint: inputs.endpoint ?? null, secret });
}

// The participant a record declares for a model endpoint the instance does not list (MOD-job-ledger's `declares`).
function declaredParticipant(record, inputs) {
  const secret = typeof inputs.secret === "string" && inputs.secret ? ` secret ${inputs.secret}` : "";
  return { name: record.participant, type: "model endpoint", model: record.model ?? null, context: record.declares.context ?? null, price: null,
    capabilities: Array.isArray(record.declares.capabilities) ? record.declares.capabilities : [], place: record.destinations?.[0]?.place || null,
    route: `endpoint ${record.participant}${secret}` };
}

// The items a sprint selects, as its record lists them in its front matter: what its close works on (a job's `works_on` names items, not a sprint).
const itemsOf = (sprints, name) => [].concat(sprints.find((record) => record.path === `docs/backlog/sprints/${name}.md`)?.fields?.selection ?? []);

// The route a participant's register row names, as queueJob takes it: a CI route, hosted or a self-hosted runner's label; null for a route CI cannot queue for (a person's account, a model endpoint called from a tab).
function queueRouteOf(participant) {
  const ci = /^ci (hosted|runner:(\S+))(?: |$)/.exec(participant?.route ?? "");
  return ci ? { kind: "ci", runner: ci[2] ?? "hosted" } : null;
}

/**
 * onSchedule(env: CiEnvironment) -> Promise<EntryStatus> — on the product's schedule: each sprint MOD-work-plans' sprintsToClose names, at the day of `env.now`, whose closer is a participant of the instance's register that is no person,
 * gets its close — a job of kind `close-sprint`, working on the items of its selection (`works_on`; the parameter `sprint` names the sprint `<team>/<nn>`), started by the schedule — queued for that agent's route, in one commit each, unless a close
 * of the sprint is queued, taken or waiting at a gate already (a record without an end). A closer who is a person, or no participant, gets none; neither does an agent whose route CI cannot queue for. A missing person's token ends
 * the entry `not run`, before anything is written.
 */
export async function onSchedule(env) {
  if (!env.job.personToken) return notRun(`${env.job.tokenName} is missing: the person's Agent M token is a secret of this repository, passed to the job as ${env.job.tokenName}. Nothing was written.`);
  const composed = composeProduct(env);
  const { product, instance } = composed;
  const participants = await participantsOfInstance(await instance.host.readSnapshot("HEAD"));
  const facts = await workFacts(env, composed);
  const states = Array.isArray(facts.plan?.states) ? facts.plan.states : [];
  const open = new Set(facts.jobs.filter(({ record }) => record.kind === "close-sprint" && !record.end).map(({ record }) => String(record.params?.sprint ?? "")));
  const agentM = { version: "unreleased", commit: (await instance.host.readSnapshot("HEAD")).commit };
  const limit = (await kindOf("close-sprint")).limit;
  const queued = [], skipped = [];
  for (const due of sprintsToClose(Array.isArray(facts.sprints) ? facts.sprints : [], states, env.now.toISOString().slice(0, 10))) {
    const closer = participants.find((each) => each.name === due.closer);
    if (!closer || closer.type === "person") continue;
    if (open.has(due.sprint)) { skipped.push(`${due.sprint}: its close is queued or running`); continue; }
    const route = queueRouteOf(closer);
    if (!route) { skipped.push(`${due.sprint}: the route of ${closer.name} is no route of CI`); continue; }
    const head = await product.host.readSnapshot("HEAD");
    const id = newJobId(env.now, new Set(head.paths.map((path) => /^docs\/jobs\/(JOB-[^/]+)\.md$/.exec(path)?.[1]).filter(Boolean)));
    await queueJob(product.host, { id, kind: "close-sprint", worksOn: itemsOf(facts.sprints, due.sprint), participant: closer.name, model: closer.model, route: routeOf(route.runner), run: null, retries: null, startedBy: "schedule", start: env.now, agentM,
      inputs: [], limit, destinations: [{ participant: closer.name, place: closer.place ?? "", parts: [] }], params: { sprint: due.sprint } }, route, head.commit);
    queued.push(`${id}: the close of ${due.sprint} (${due.because}) for ${closer.name}`);
  }
  if (queued.length === 0) return { outcome: "nothing to do", summary: skipped.length ? skipped.join("; ") : "No sprint that an agent closes has ended.", findings: [] };
  return { outcome: "done", summary: [...queued, ...skipped].join("; "), findings: [] };
}

// ---------------------------------------------------------------- the machines of the job workflow

/**
 * chooseAgentKey(env: CiEnvironment) -> Promise<EntryStatus> — before the agent's machine starts: which of the job workflow's agent jobs runs, given to the
 * workflow — on GitHub as the step's output `agent`, on GitLab as the line `AGENT_M_AGENT=<n>` of the dotenv file the job's output names — the place, from 1, of
 * the key the run's job reads among AGENT_M_KEY_NAMES, or 0 for none. The key is the one the input
 * `secret` names for a hand-over to a model endpoint; for any other dispatch the one the route of the job's participant names; on a push the one of the oldest queued
 * job of this route. A key the file does not read is none: the agent's machine then reports it missing, as it reports a missing key. Holds no secret; writes nothing.
 */
export async function chooseAgentKey(env) {
  const composed = composeProduct(env);
  const participants = await participantsOfInstance(await composed.instance.host.readSnapshot("HEAD"));
  const snapshot = await composed.product.host.readSnapshot("HEAD");
  const inputs = dispatched(env) ? env.event.payload?.inputs ?? {} : null;
  let key = null;
  if (inputs?.endpoint) key = typeof inputs.secret === "string" && inputs.secret ? inputs.secret : null;
  else if (inputs) {
    const row = (await queuedOf(env, snapshot, { handedOver: true })).find(({ record }) => record.id === inputs.job);
    const participant = participants.find((each) => each.name === (row?.record.participant ?? inputs.participant));
    key = (row?.record.task === WITH_HAND_OVER ? SECRET_OF : CI_ROUTE).exec(participant?.route ?? "")?.[1] ?? null;
  } else {
    const [first] = await queuedOf(env, snapshot);
    key = first ? keyOfRow(participants, first) : null;
  }
  const at = key !== null && Object.hasOwn(env.job.keys, key) ? Object.keys(env.job.keys).indexOf(key) + 1 : 0;
  if (env.job.outputFile) fs.appendFileSync(env.job.outputFile, env.service === "gitlab" ? `AGENT_M_AGENT=${at}\n` : `agent=${at}\n`);
  return { outcome: "done", findings: [], summary: at > 0 ? `The agent's machine receives the key ${key}.`
    : key ? `${key} is not a key this job workflow reads: the agent's machine receives none.` : "The agent's machine receives no key." };
}

/**
 * leaveResult(env: CiEnvironment) -> Promise<EntryStatus> — on the agent's machine, after its entry, whether that ended well or not: the run's result packed for the
 * writing machine (result.mjs' packResult); `nothing to do` where the entry made none.
 */
export async function leaveResult(env) {
  if (env.job.part !== "agent" || !env.job.resultDir) return notRun("This is not the agent's machine of a job workflow: AGENT_M_PART is not agent, or AGENT_M_RESULT_DIR is not set.");
  const packed = packResult(env.job.resultDir);
  if (!packed) return { outcome: "nothing to do", summary: "The entry left no result.", findings: [] };
  return { outcome: "done", findings: [], summary: `The result holds ${packed.refs.length} branch(es), ${packed.ends} end(s) of jobs and ${packed.pullRequests} pull request(s) to open.` };
}

/**
 * writeResult(env: CiEnvironment) -> Promise<EntryStatus> — on the writing machine, which runs no agent, with the person's token: reads the result the agent's machine
 * left (readResult) and checks it (checkResult) against the token and every key of the file and, for a hand-over, its task. A result that passes is written:
 * its branches pushed (writeBranches), each pull request kept for later opened — or the open or merged one of its branch taken —, and each job's end appended, its
 * commits and pull requests named as they now stand. A result that is refused, or that does not apply, writes no branch; each job it ended is ended failed, naming
 * why — except one another run has taken or ended meanwhile. `nothing to do` where no result was left; `not run` without the token.
 */
export async function writeResult(env) {
  if (!env.job.personToken) return notRun(`${env.job.tokenName} is missing: the person's Agent M token is a secret of this repository, passed to the job as ${env.job.tokenName}. Nothing was written.`);
  const path = globalThis.process.getBuiltinModule("node:path");
  const out = env.job.resultDir ? path.join(env.job.resultDir, "out") : null;
  const resultFile = out ? path.join(out, "result.json") : null;
  if (!resultFile || !fs.existsSync(resultFile)) return { outcome: "nothing to do", summary: "The agent's machine left no result.", findings: [] };
  const composed = composeProduct(env);
  const task = dispatched(env) && typeof env.event.payload?.inputs?.task === "string" ? env.event.payload.inputs.task : null;
  let result = JSON.parse(fs.readFileSync(resultFile, "utf8")), refused = null, notApplied = null, renamed = new Map();
  const pulls = new Map();
  try {
    const read = readResult(env.job.productDir, out);
    result = read.result;
    refused = checkResult(read, [env.job.personToken, ...Object.values(env.job.keys)].filter(Boolean), task);
  } catch (error) { refused = error.message; }
  if (!refused) {
    try {
      renamed = writeBranches(env.job.productDir, result);
      for (const request of result.pullRequests) {
        const open = (await composed.product.host.listPullRequests({ branch: request.branch, state: "all" })).find((pull) => pull.state === "open" || pull.state === "merged");
        pulls.set(pendingPullRequest(request.branch), open?.url ?? (await composed.product.host.openPullRequest(request)).url);
      }
    } catch (error) { notApplied = error.message; }
  }
  const why = refused ? `the result of the agent's machine is refused: ${refused}` : notApplied ? `the result of the agent's machine was not written: ${notApplied}` : null;
  // Where nothing was written, a record another run has taken or ended meanwhile is that run's.
  const others = new Set();
  if (why) {
    for await (const record of recordsNewestFirst(await composed.product.host.readSnapshot("HEAD"))) if (record.taken || record.end) others.add(record.path);
  }
  const ended = [];
  for (const { path: recordPath, part, trailers } of result.ends) {
    if (why && others.has(recordPath)) continue;
    const end = why ? { ...part.part, at: new Date(part.part.at), state: "failed", results: [], draft: null, reason: why }
      : { ...part.part, at: new Date(part.part.at), results: part.part.results.map((each) => renamed.get(each) ?? pulls.get(each) ?? each) };
    await endRecord(composed.product.host, recordPath, { part: end, branch: part.branch }, trailers);
    ended.push(`${/([^/]+)\.md$/.exec(recordPath)?.[1] ?? recordPath} ${end.state}`);
  }
  if (why) return failedStatus(`${why}${ended.length ? `; ended: ${ended.join(", ")}` : ""}.`);
  return { outcome: "done", findings: [], summary: `Written: ${result.refs.length} branch(es)${pulls.size ? `, ${pulls.size} pull request(s)` : ""}${ended.length ? `; ended: ${ended.join(", ")}` : ""}.` };
}
