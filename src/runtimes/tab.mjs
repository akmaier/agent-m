// tab.mjs — jobs running in this tab (docs/architecture/MOD-runtimes.md, Parts: "tab.mjs — jobs running in this tab"). Of it, ITM-319 builds queueOnTab,
// the tab route of queueJob, and runOnTab. The Bridge's drivers (bridgeDriver, ITM-325, bridge.mjs) are built for an agent on a Bridge and for an endpoint a Bridge calls.
//
// Module: MOD-runtimes
//
// It writes the job's record through the host only by MOD-job-ledger's startRecord and appendToRecord. A part is appended on the head read just before, as the
// person's commit. The results of an end read: a line `commit <sha>`, `file <path>` and `pull request <address>` for what the writer did, a line `note: <note>` for
// each note it made (MOD-job-runner's WriteOutcome), `no change` where it committed nothing (UC-010 4a), and `waits for a person` where nothing was written, or a
// kind handed its draft back (MOD-job-ledger, Data). A gate's `decider` is the context's gate's own where it carries one, else the gate's name.

import { endpointDriver } from "../endpoint-calls/index.mjs";
import { appendToRecord, jobCost, startRecord } from "../job-ledger/index.mjs";
import { runJob } from "../job-runner/index.mjs";
import { formatFinding } from "../text-tools/index.mjs";
import { bridgeDriver } from "./bridge.mjs";
import { RuntimeError } from "./ci.mjs";

/**
 * queueOnTab(host, start, head) -> Promise<{ path, commit }> — MOD-runtimes' queueJob for the tab's route: the job's start record and its taking (`## Taken`, by
 * `tab`, at the job's start) in one commit, on the head that was read, as the person's commit, on the branch the host's repositoryInfo names. Fails as the host
 * fails — Moved, TokenRefused, RateLimited, Unreachable — unchanged; nothing is written then.
 */
export async function queueOnTab(host, start, head) {
  const { defaultBranch } = await host.repositoryInfo();
  const { path, text } = startRecord(start);
  const { commit } = await host.commitFiles({
    branch: defaultBranch, expectedHead: head, files: [{ path, text: appendToRecord(text, { part: "taken", at: start.start, by: "tab" }) }],
    message: `Queue job ${start.id}: ${start.kind}`,
  });
  return { path, commit };
}

// The transient correction context is part of the prepared prompt every tab driver receives. The drivers themselves keep
// their one-exchange interface and therefore behave alike for a direct endpoint, an endpoint on a Bridge and an agent.
function exchangePrompt(input) {
  const sections = [input.prompt];
  if (input.previous !== null && input.previous !== undefined) sections.push(`## Current draft to change\n\n${input.previous}`);
  if (input.findings?.length) sections.push(`## Findings to fix or answer\n\n${input.findings.map(formatFinding).join("\n")}`);
  return sections.join("\n\n");
}

const withExchangePrompt = (driver) => ({ ...driver, async send(input, options) {
  return driver.send({ ...input, prompt: exchangePrompt(input) }, options);
} });

// The driver of a participant, from its route: an endpoint it names, from its configuration — `endpointDriver` where the endpoint is called from this tab, `bridgeDriver` with the endpoint
// on the Bridge its `bridge` names —, or an agent on the Bridge its route names. Each Bridge is found by its name among `connections.bridges`.
function driverOf(participant, connections) {
  const bridgeOf = (name) => {
    const bridge = connections.bridges?.[name];
    if (!bridge) throw new RuntimeError("BridgeNotConnected", { bridge: name }, `the Bridge ${name} is not among the connected Bridges`);
    return bridge;
  };
  const agent = /^bridge\s+(\S+)\s+agent\s+(\S+)/.exec(participant.route ?? "");
  if (agent) return withExchangePrompt(bridgeDriver(bridgeOf(agent[1]), { agent: agent[2] }, participant));
  const endpoint = /^endpoint\s+(\S+)/.exec(participant.route ?? "")?.[1];
  const entry = endpoint === undefined ? undefined : connections.endpoints[endpoint];
  if (!entry) throw new RuntimeError("EndpointNotConfigured", { endpoint }, `the endpoint ${endpoint} has no configuration`);
  if (entry.bridge !== null) return withExchangePrompt(bridgeDriver(bridgeOf(entry.bridge), { endpoint: entry.config }, participant));
  return withExchangePrompt(endpointDriver(entry.config, participant));
}

// The usage of a job: the tokens its exchanges reported, summed; null while none reported any.
function usageOf(exchanges) {
  const known = exchanges.map((each) => each.usage).filter(Boolean);
  if (known.length === 0) return null;
  const sum = (key) => (known.some((usage) => usage[key] !== null) ? known.reduce((total, usage) => total + (usage[key] ?? 0), 0) : null);
  return { inputTokens: sum("inputTokens"), outputTokens: sum("outputTokens"), minutes: null, cost: null };
}

// What an end says of the writer's outcome.
function resultsOf(written) {
  if (!written || (written.commits.length === 0 && written.shown !== null && written.shown !== undefined)) return ["waits for a person"];
  const notes = (written.notes ?? []).map((note) => `note: ${note}`);
  if (written.commits.length === 0 && !written.pullRequest) return ["no change", ...notes];
  return [...written.commits.map((commit) => `commit ${commit}`), ...written.files.map((file) => `file ${file}`),
    ...(written.pullRequest ? [`pull request ${written.pullRequest}`] : []), ...notes];
}

/**
 * runOnTab(prepared, context, connections, hooks) -> Promise<JobResult> — runs the prepared job in this tab with MOD-job-runner, attended unless its record names a
 * run: the drafter's and the reviewers' drivers from their routes (an endpoint's driver from its configuration, `endpointDriver`), a gate reached and the end
 * appended to the job's record through the host, and the result returned for the page. A job that waits at a gate has no end. A failure — a driver's, by its name —
 * ends the record as failed, with the failure's name and message as the reason, and is thrown again unchanged; a cancelled job is ended by cancelJob, not here.
 */
export async function runOnTab(prepared, context, connections, hooks) {
  const { host, record, refine, onOutput, signal } = hooks;
  const append = async (part) => {
    const { defaultBranch } = await host.repositoryInfo();
    const snapshot = await host.readSnapshot(defaultBranch);
    const text = appendToRecord(await snapshot.read(record.path), part);
    await host.commitFiles({ branch: defaultBranch, expectedHead: snapshot.commit, files: [{ path: record.path, text }],
      message: `Job ${record.id}: ${part.part}` });
  };
  const ended = (fields) => ({ part: "end", at: new Date(), draft: null, rounds: [], usage: null, reason: null, log: null, results: [], ...fields });
  const onGate = async (name) => {
    const gate = context.gates.find((each) => each.name === name);
    await append({ part: "gate reached", at: new Date(), gate: name, decider: gate?.decider ?? name });
  };
  let result;
  try {
    const drivers = { drafter: prepared.drafter ? driverOf(prepared.drafter, connections) : null,
      reviewers: prepared.reviewers.map((reviewer) => driverOf(reviewer, connections)) };
    result = await runJob(prepared, drivers, { attended: !record.run, context, refine, onOutput, onGate, signal });
  } catch (error) {
    if (error.name === "Cancelled") throw error;
    // The job's own failure is what the caller must see: a record that cannot be appended to does not hide it.
    await append(ended({ state: "failed", reason: `${error.name}: ${error.message}`, cost: jobCost(null, prepared.drafter) })).catch(() => {});
    throw error;
  }
  if (result.stoppedBecause === "gate") return result;
  const usage = usageOf(result.usage);
  const failed = result.stoppedBecause === "unusable";
  await append(ended({
    state: failed ? "failed" : "done", reason: failed ? "the participant's answer could not be read" : null, results: failed ? [] : resultsOf(result.written),
    draft: result.written?.shown ?? null, rounds: result.rounds, forPerson: result.forPerson, stoppedBecause: result.stoppedBecause, usage,
    cost: jobCost(usage, prepared.drafter),
  }));
  return result;
}
