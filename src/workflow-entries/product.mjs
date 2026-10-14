// product.mjs — the entries of a product's job workflow (MOD-workflow-entries, Parts): running queued and dispatched jobs,
// checking the Definition of Done and recording test outcomes. The check and result entries are composed in their own files.
//
// Module: MOD-workflow-entries
//
// A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A CI AGENT'S DRAFT ENTERS AS
// OPEN; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; NO SECRET IN THE REPOSITORY. No person attends a job in CI: the job runner calls the kind's
// writer at once. The entry keeps nothing between runs.

import { appendToRecord, jobCost, jobState, recordsNewestFirst, startRecord, takeJob } from "../job-ledger/index.mjs";
import { kindOf } from "../job-catalogue/index.mjs";
import { prepareJob, provenanceLines, runJob } from "../job-runner/index.mjs";
import { endpointDriver } from "../endpoint-calls/index.mjs";
import { agentDriver, installedAgents } from "../agent-processes/index.mjs";
import { participantSchema, participantsOf } from "../participant-list/index.mjs";
import { readDocument } from "../documents/index.mjs";
import { composeProduct } from "./compose.mjs";

export { onDoneCheck } from "./done-check.mjs";
export { onTestsFinished } from "./test-results.mjs";

// The route of this CI service's jobs, as MOD-job-ledger writes a record's route, and the form of a CI agent's route in the register.
const routeOf = (runner) => (runner === "hosted" ? "ci hosted" : `ci runner:${runner}`);
const CI_ROUTE = /^ci (?:hosted|runner:\S+) secret (\S+)$/;
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

// One job: taken, prepared, run, ended in its record. -> { id, state, summary }.
async function runJobOf(env, composed, participants, row) {
  const { record, path } = row;
  const { job } = env;
  const product = composed.product, instance = composed.instance;
  const participant = participants.find((each) => each.name === record.participant);
  const taking = await takeJob(product.host, path, job.runUrl ?? `ci ${job.runner}`, (await product.host.readSnapshot("HEAD")).commit);
  if (!taking.taken) return { id: record.id, state: "skipped", summary: `${record.id} was taken by ${taking.by}` };
  const secretName = CI_ROUTE.exec(participant.route ?? "")?.[1];
  const context = { kind: null, params: record.params ?? {}, product: { address: product.address, snapshot: await product.host.readSnapshot("HEAD"), host: product.host },
    instance: { snapshot: await instance.host.readSnapshot("HEAD"), host: instance.host, checkout: instance.checkout },
    connect: async (address) => product.host, participants, places: { sources: {}, mailbox: null }, gates: [], person: record.startedBy ?? null, now: env.now,
    agentM: record.agentM, jobId: record.id };
  let ended = { state: "failed", results: [], draft: null, rounds: [], usage: null, reason: null }, outcome = null;
  try {
    context.kind = await kindOf(record.kind);
    const prepared = await prepareJob(record.kind, context, { drafter: participant, reviewers: [], limit: record.limit });
    if (prepared.blocking.length > 0 || prepared.notFitting.length > 0) {
      throw Object.assign(new Error(prepared.blocking.map((found) => found.what).join("; ") || "the job does not fit its participant"), { name: "NotStartable" });
    }
    const driver = await driverOf(participant, record.params ?? {}, secretName, job.keys[secretName], instance.checkout);
    const result = await runJob(prepared, { drafter: driver, reviewers: [] }, { attended: false, context });
    outcome = result.written;
    const handedBack = context.kind.writer === "return-draft";
    ended = { state: "done", results: handedBack ? [] : outcome && outcome.commits.length > 0 ? [...outcome.commits, ...outcome.notes.map((note) => `note: ${note}`)] : ["no change"],
      draft: handedBack ? (outcome?.shown ?? result.draft) : null, rounds: result.rounds, usage: usageOf(result.usage), reason: null,
      stoppedBecause: result.stoppedBecause, drafter: result.drafter };
  } catch (error) {
    ended = { ...ended, reason: error?.message ?? String(error) };
  }
  const part = { part: { part: "end", at: env.now, state: ended.state, results: ended.results, draft: ended.draft, rounds: ended.rounds, usage: ended.usage,
    cost: jobCost(ended.usage, participant), reason: ended.reason, log: job.runUrl ?? null, ...(ended.stoppedBecause ? { stoppedBecause: ended.stoppedBecause } : {}) }, branch: env.branch };
  const trailers = provenanceLines({ agentM: record.agentM, jobId: record.id, kind: record.kind, participant, rounds: ended.rounds.length, instruction: record.params?.instruction ?? null });
  await endRecord(product.host, path, part, trailers);
  const noChange = ended.state === "done" && ended.results.length === 1 && ended.results[0] === "no change";
  return { id: record.id, state: ended.state, summary: ended.state === "failed" ? `${record.id} failed: ${ended.reason}` : `${record.id} ${noChange ? "ended done, no change" : "ended done"}` };
}

// The queued jobs of this route in the product's checkout, oldest first, each with its path.
async function queuedOf(env, snapshot) {
  const wanted = routeOf(env.job.runner);
  const rows = [];
  for await (const record of recordsNewestFirst(snapshot)) if (record.route === wanted && jobState(record, null) === "queued") rows.push({ record, path: record.path });
  return rows.reverse();
}

// The participants of the instance's register, read from its checkout.
async function participantsOfInstance(snapshot) {
  const register = await snapshot.read("docs/participants.md");
  return register === null ? [] : participantsOf(readDocument(participantSchema(), "docs/participants.md", register));
}

// The secrets a job needs, as a status when one is missing: the person's token, and the key of each participant whose route names a secret.
function missingSecret(env, participants, rows) {
  if (!env.job.personToken) return `${env.job.tokenName} is missing: the person's Agent M token is a secret of this repository, passed to the job as ${env.job.tokenName}. Nothing was written.`;
  for (const { record } of rows) {
    const participant = participants.find((each) => each.name === record.participant);
    const secret = CI_ROUTE.exec(participant?.route ?? "")?.[1];
    if (secret && !env.job.keys[secret]) return `${secret} is missing: the key of ${participant.name} is a secret of this repository, passed to the job as ${secret}. Nothing was written.`;
  }
  return null;
}

// Takes and runs the jobs given by `rows` — the queued ones of this route, or the one dispatched — and ends with a status.
async function runRows(env, composed, participants, rows) {
  const results = [];
  for (const row of rows) results.push(await runJobOf(env, composed, participants, row));
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
  const rows = await queuedOf(env, await composed.product.host.readSnapshot("HEAD"));
  const missing = missingSecret(env, participants, rows);
  if (missing) return notRun(missing);
  return runRows(env, composed, participants, rows);
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
  const rows = (await queuedOf(env, snapshot)).filter(({ record }) => record.id === inputs.job);
  const missing = missingSecret(env, participants, rows);
  if (missing) return notRun(missing);
  return runRows(env, composed, participants, rows);
}
