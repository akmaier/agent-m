// MOD-runtimes — the three routes a job takes (docs/architecture/MOD-runtimes.md): its interface. Of it, this item
// (ITM-253) builds Route and queueJob for the CI route alone: the job's start record committed on the head that was
// read, as the person's commit, whose push starts the product's job workflow; WorkflowMissing, naming the job
// workflow's file, for a product without it; and the host's other failures, by name. ITM-318 builds RouteOffer, ResourceNeed
// and routesFor (routes.mjs): the routes a participant offers, with the reason of each that cannot be taken. ITM-322 builds
// jobWorkflowFiles (ci.mjs) with the templates workflow/github.yml and workflow/gitlab.yml. bridgeAgentDriver,
// resumeJob, retryJob and routeStrategies are not part of
// this item (UC-010, UC-011, UC-036) and are not built yet; nor is a job of a run
// (start.run, MOD-job-ledger's appendToRecord). ITM-319 builds queueJob's tab route and runOnTab (tab.mjs); ITM-325 its Bridge route and bridgeDriver (bridge.mjs).
// ITM-535 builds liveState, jobLog and cancelJob for the CI route, the tab's route and a job no runtime has taken; a job taken on a Bridge waits for MOD-bridge-client's bridgeJobs, bridgeJobLog and cancelOnBridge (ITM-544, ITM-545).
// ITM-495 builds handOverJob (hand-over.mjs) and the inputs task and endpoint of the GitHub template; retryJob is not built yet.
//
// Module: MOD-runtimes
//
// It belongs to Participants and jobs (ARC-046). It uses MOD-job-ledger and MOD-repository-hosts only through their
// index.mjs. ci.mjs is private to it, besides the RuntimeError it re-exports here.

import { appendToRecord } from "../job-ledger/index.mjs";
import { RuntimeError, cancelRun, queueOnCi, runOfAddress } from "./ci.mjs";
import { abortOnTab, heldOnTab, queueOnTab } from "./tab.mjs";
import { queueOnBridge } from "./bridge.mjs";

export { routesFor } from "./routes.mjs";
export { jobWorkflowFiles } from "./ci.mjs";
export { tabContext, runOnTab } from "./tab.mjs";
export { bridgeDriver } from "./bridge.mjs";
export { handOverJob } from "./hand-over.mjs";

export { RuntimeError } from "./ci.mjs";

/**
 * Route: where a job runs; a runner other than "hosted" is a self-hosted runner's label (MOD-runtimes, Interfaces).
 * @typedef {{ kind: "tab" } | { kind: "ci", runner: "hosted" | string } | { kind: "bridge", bridge: string }} Route
 */

/**
 * queueJob(host, start, route, head, bridge?) -> Promise<{ path: string, commit: string }> (MOD-runtimes,
 * Interfaces). This item (ITM-253) builds the CI route alone: commits the job's start record, through MOD-job-
 * ledger's startRecord, on the head that was read, as the person's commit, on the branch the host's repositoryInfo
 * names; refused with WorkflowMissing, naming the job workflow's file, when the head read does not hold it. The push
 * starts the product's job workflow. Crosses the network through the host; fails with what the host names — the
 * branch moved, a refused token, a used-up rate limit —, and with WorkflowMissing of its own. The tab's route (ITM-319) commits the start and its
 * taking in one commit; the Bridge's route is UC-011's and is not built yet.
 * @param {unknown} host MOD-repository-hosts' Host.
 * @param {unknown} start MOD-job-ledger's JobStart.
 * @param {Route} route
 * @param {string} head
 * @param {unknown} [bridge]
 * @returns {Promise<{ path: string, commit: string }>}
 */
export async function queueJob(host, start, route, head, bridge) {
  if (route.kind === "ci") return queueOnCi(host, start, head);
  if (route.kind === "tab") return queueOnTab(host, start, head);
  if (route.kind === "bridge") return queueOnBridge(host, start, head, bridge);
  throw new Error(`queueJob: the "${route.kind}" route is not built yet (UC-010, UC-011)`);
}


// ---------------------------------------------------------------- a job's live state, its log and its cancel (ITM-535)

const UNKNOWN = { reachable: true, reason: null, known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] };
const BRIDGE_NOT_READ = "the Bridge's jobs are not read yet";

// Which runtime took the job, from the `by:` of its `## Taken` (MOD-job-ledger, Data: "a CI run's address, a Bridge's name, this tab"): none; the tab; CI — a run's address, or `ci <runner>` where the
// run's address was not known —; any other is a Bridge's name.
function takenOn(record) {
  const by = record.taken?.by ?? null;
  if (by === null) return "none";
  if (by === "tab") return "tab";
  return /^https?:\/\//.test(by) || by.startsWith("ci ") ? "ci" : "bridge";
}

/**
 * liveState(record, product, bridges) -> Promise<LiveState> — what the runtime that took the job reports (MOD-runtimes, Interfaces). A job no runtime has taken is unknown; a job taken on CI is running while its run
 * is queued, running or waiting, with the run's address as its log; one taken by this tab is running while the tab holds it; one taken on a Bridge is not read yet (`reachable: false`). A failure of the host gives
 * `reachable: false` and its reason, never an error. `writtenAfterCancel` is always empty: no way to read a branch's commits is among this module's Uses.
 */
export async function liveState(record, product, bridges) {
  void bridges;
  switch (takenOn(record)) {
    case "none": return { ...UNKNOWN };
    case "tab": return heldOnTab(record.id) ? { ...UNKNOWN, known: true, running: true } : { ...UNKNOWN };
    case "bridge": return { ...UNKNOWN, reachable: false, reason: BRIDGE_NOT_READ };
    default:
      try {
        const run = await runOfAddress(product.host, record.taken.by);
        if (!run) return { ...UNKNOWN };
        return { ...UNKNOWN, known: true, running: ["queued", "running", "waiting"].includes(run.state), log: run.url };
      } catch (error) {
        return { ...UNKNOWN, reachable: false, reason: String(error?.message ?? error) };
      }
  }
}

/**
 * jobLog(record, product, bridges) -> Promise<{ address: string } | { gone: true }> — the CI run's log by the run's address; `{ gone: true }` for a run the server no longer lists, for the tab, which keeps no log apart from
 * the page, and for a job no runtime has taken. A job taken on a Bridge fails with NotSupported. A CI job fails as the host fails.
 */
export async function jobLog(record, product, bridges) {
  void bridges;
  switch (takenOn(record)) {
    case "bridge": throw new RuntimeError("NotSupported", { reason: BRIDGE_NOT_READ }, BRIDGE_NOT_READ);
    case "ci": {
      const run = await runOfAddress(product.host, record.taken.by);
      return run ? { address: run.url } : { gone: true };
    }
    default: return { gone: true };
  }
}

// The record's end, `cancelled`, appended as a commit on the head read, as hand-over.mjs appends a failed end (and runOnTab its parts).
async function endAsCancelled(host, record, log) {
  const { defaultBranch } = await host.repositoryInfo();
  const snapshot = await host.readSnapshot(defaultBranch);
  const text = appendToRecord(await snapshot.read(record.path), { part: "end", at: new Date(), state: "cancelled", results: [], draft: null, rounds: [], usage: null,
    cost: { known: false, usage: null }, reason: "cancelled by a person", log });
  await host.commitFiles({ branch: defaultBranch, expectedHead: snapshot.commit, files: [{ path: record.path, text }], message: `Job ${record.id}: end` });
}

/**
 * cancelJob(record, product, bridges) -> Promise<"cancelled" | "cancelling"> — stops the job at its runtime (MOD-runtimes, Interfaces). On CI it asks the run to cancel and reads it once: where it is cancelled it appends
 * the end `cancelled` and gives "cancelled", else "cancelling" with nothing appended. A job in the tab is aborted; a job no runtime has taken, and one the tab does not hold, is ended at once. A job taken on a Bridge
 * fails with NotSupported. Fails with NotFound { what } for a CI run the server does not list, with the host's failures, and with RecordEnded for a record that has its end.
 */
export async function cancelJob(record, product, bridges) {
  void bridges;
  switch (takenOn(record)) {
    case "bridge": throw new RuntimeError("NotSupported", { reason: BRIDGE_NOT_READ }, BRIDGE_NOT_READ);
    case "ci": {
      const { cancelled, address } = await cancelRun(product.host, record.taken.by);
      if (!cancelled) return "cancelling";
      await endAsCancelled(product.host, record, address);
      return "cancelled";
    }
    case "tab": abortOnTab(record.id); // falls through: the end follows the abort
    default:
      await endAsCancelled(product.host, record, null);
      return "cancelled";
  }
}
