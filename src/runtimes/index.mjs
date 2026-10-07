// MOD-runtimes — the three routes a job takes (docs/architecture/MOD-runtimes.md): its interface. Of it, this item
// (ITM-253) builds Route and queueJob for the CI route alone: the job's start record committed on the head that was
// read, as the person's commit, whose push starts the product's job workflow; WorkflowMissing, naming the job
// workflow's file, for a product without it; and the host's other failures, by name. RouteOffer, ResourceNeed,
// routesFor, runOnTab, bridgeAgentDriver, resumeJob, liveState, jobLog, cancelJob, retryJob, jobWorkflowFiles and
// routeStrategies are not part of this item (UC-010, UC-011, UC-036) and are not built yet; neither is queueJob's tab
// or Bridge route, nor a job of a run (start.run, MOD-job-ledger's appendToRecord).
//
// Module: MOD-runtimes
//
// It belongs to Participants and jobs (ARC-046). It uses MOD-job-ledger and MOD-repository-hosts only through their
// index.mjs. ci.mjs is private to it, besides the RuntimeError it re-exports here.

import { queueOnCi } from "./ci.mjs";

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
 * branch moved, a refused token, a used-up rate limit —, and with WorkflowMissing of its own. The tab's and the
 * Bridge's routes are UC-010's and UC-011's and are not built yet.
 * @param {import("../repository-hosts/index.mjs").Host} host
 * @param {import("../job-ledger/index.mjs").JobStart} start
 * @param {Route} route
 * @param {string} head
 * @param {unknown} [bridge]
 * @returns {Promise<{ path: string, commit: string }>}
 */
export async function queueJob(host, start, route, head, bridge) {
  if (route.kind === "ci") return queueOnCi(host, start, head);
  throw new Error(`queueJob: the "${route.kind}" route is not built yet (UC-010, UC-011)`);
}
