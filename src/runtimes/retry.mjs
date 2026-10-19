// retry.mjs — a failed or cancelled job started again (docs/architecture/MOD-runtimes.md, Interfaces: retryJob; UC-036 step 7). ITM-973 builds retryJob.
//
// Module: MOD-runtimes
//
// It writes only through queueJob, MOD-job-ledger's startRecord being what the routes commit. Where the text leaves a reading open, this file states the one it takes:
//   - A participant holds the role when MOD-participant-list's `eligible` leaves it in for the capabilities the job's kind needs (`A ROLE NAMES THE CAPABILITIES IT NEEDS`); the kind is read with
//     MOD-job-catalogue's `kindOf`.
//   - The new start copies the record's kind, works_on, inputs, limit, destinations, task and parameters; its participant and model are the chosen participant's, its route the chosen route as a
//     record writes it, `retries` the earlier identifier, `run` empty (a retry is no job of a run), and `startedBy` and the Agent M version the record's.
//   - The new identifier is none that the product's `docs/jobs/` holds.

import { kindOf } from "../job-catalogue/index.mjs";
import { newJobId } from "../job-ledger/index.mjs";
import { eligible } from "../participant-list/index.mjs";
import { RuntimeError } from "./ci.mjs";

const JOB_RECORD = /^docs\/jobs\/(JOB-[^/]+)\.md$/;

// The route as a job's record writes it: `tab`, `ci hosted`, `ci runner:<label>`, `bridge <name>`.
const recordRoute = (route) => (route.kind === "tab" ? "tab" : route.kind === "bridge" ? `bridge ${route.bridge}` : route.runner === "hosted" ? "ci hosted" : `ci runner:${route.runner}`);

/**
 * retryJob(record, choice, host, head, queue) -> Promise<{ path, commit }> — queues a new job with a new identifier and the record's inputs and parameters, which names the one it retries.
 * Fails with TaskNotInRecord for a job whose task travelled with its hand-over, with NotHolderOfRole { participant, lacks } for a participant that does not hold the role, and as `queue`
 * (queueJob) and the host fail.
 */
export async function retryJob(record, choice, host, head, queue) {
  if (record.task === "with the hand-over") {
    throw new RuntimeError("TaskNotInRecord", { job: record.id }, `the job ${record.id} was handed over with its task, which its record does not hold: hand it over again from the prompt bar`);
  }
  const { participant, route } = choice;
  const { needs } = await kindOf(record.kind);
  const verdict = eligible([participant], { capabilities: needs });
  if (verdict.leftOut.length > 0) {
    const lacks = verdict.leftOut[0].reasons;
    throw new RuntimeError("NotHolderOfRole", { participant: participant.name, lacks }, `${participant.name} does not hold the role of ${record.kind}: ${lacks.join("; ")}`);
  }
  const { defaultBranch } = await host.repositoryInfo();
  const snapshot = await host.readSnapshot(defaultBranch);
  const taken = new Set(snapshot.paths.map((path) => JOB_RECORD.exec(path)?.[1]).filter(Boolean));
  const start = {
    id: newJobId(new Date(), taken), kind: record.kind, worksOn: [...record.worksOn], participant: participant.name, model: participant.model ?? null, route: recordRoute(route), run: null,
    retries: record.id, startedBy: record.startedBy, start: new Date(), agentM: { ...record.agentM }, inputs: [...record.inputs], limit: record.limit, task: record.task,
    conversation: record.conversation, destinations: record.destinations.map((each) => ({ ...each, parts: [...each.parts] })), params: structuredClone(record.params),
  };
  return queue(host, start, route, head);
}
