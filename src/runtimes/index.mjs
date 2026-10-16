// MOD-runtimes — the three routes a job takes (docs/architecture/MOD-runtimes.md): its interface. Of it, this item
// (ITM-253) builds Route and queueJob for the CI route alone: the job's start record committed on the head that was
// read, as the person's commit, whose push starts the product's job workflow; WorkflowMissing, naming the job
// workflow's file, for a product without it; and the host's other failures, by name. ITM-318 builds RouteOffer, ResourceNeed
// and routesFor (routes.mjs): the routes a participant offers, with the reason of each that cannot be taken. ITM-322 builds
// jobWorkflowFiles (ci.mjs) with the templates workflow/github.yml and workflow/gitlab.yml. bridgeAgentDriver,
// resumeJob, liveState, jobLog, cancelJob, retryJob and routeStrategies are not part of
// this item (UC-010, UC-011, UC-036) and are not built yet; nor is a job of a run
// (start.run, MOD-job-ledger's appendToRecord). ITM-319 builds queueJob's tab route and runOnTab (tab.mjs); ITM-325 its Bridge route and bridgeDriver (bridge.mjs).
//
// Module: MOD-runtimes
//
// It belongs to Participants and jobs (ARC-046). It uses MOD-job-ledger and MOD-repository-hosts only through their
// index.mjs. ci.mjs is private to it, besides the RuntimeError it re-exports here.

import { queueOnCi } from "./ci.mjs";
import { queueOnTab } from "./tab.mjs";
import { queueOnBridge } from "./bridge.mjs";

export { routesFor } from "./routes.mjs";
export { jobWorkflowFiles } from "./ci.mjs";
export { tabContext, runOnTab } from "./tab.mjs";
export { bridgeDriver } from "./bridge.mjs";

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
