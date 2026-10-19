// The writer of `scheduleStrategies` (MOD-test-schedule, Parts: strategies.mjs; Interfaces: scheduleStrategies): `ci-configuration`,
// the writer of the kind `set-up-ci`. Strategies, JobContext, JobResult and WriteOutcome are MOD-job-runner's types.
//
// Module: MOD-test-schedule

import { readDocument } from "../documents/index.mjs";
import { provenanceLines } from "../job-runner/index.mjs";
import { participantSchema } from "../participant-list/index.mjs";
import { resourceSchema } from "../resource-list/index.mjs";
import { defaultSchedule, scheduleSchema } from "./index.mjs";
import { filesOf, proposeSchedule } from "./propose.mjs";

const SCHEDULE = "docs/tests/schedule.md";
const RESOURCES = "docs/resources.md";
const PARTICIPANTS = "docs/participants.md";

/**
 * The writer ci-configuration(result, context) -> WriteOutcome — proposes the product's schedule, or the book's default where the
 * product has none, through proposeSchedule, with the job's provenance lines on its commit. The product is read at its snapshot; the
 * participants at the instance's; the instance is the repository the job runs from, on the same server as the product, at Agent M's
 * commit. Commits nothing, and returns an outcome without a commit, when every file already stands on the head byte for byte
 * (UC-010 4a). Throws what proposeSchedule throws.
 */
async function ciConfiguration(result, context) {
  const { snapshot, host } = context.product;
  const server = snapshot.repository.server;
  const stored = await snapshot.read(SCHEDULE);
  const schedule = typeof stored === "string" ? readDocument(scheduleSchema, SCHEDULE, stored) : defaultSchedule();
  const instanceAddress = context.instance.snapshot.repository;
  const proposal = {
    server, instance: server === "github" ? instanceAddress.path : instanceAddress.web, instanceCommit: context.agentM.commit,
    resources: readDocument(resourceSchema(), RESOURCES, (await snapshot.read(RESOURCES)) ?? ""),
    participants: readDocument(participantSchema(), PARTICIPANTS, (await context.instance.snapshot.read(PARTICIPANTS)) ?? ""),
    head: snapshot.commit,
    trailers: provenanceLines({ agentM: context.agentM, jobId: context.jobId, kind: context.kind.name,
      participant: result.drafter ?? { name: "none", model: null }, rounds: result.rounds.length }),
  };
  const { files } = await filesOf(schedule, proposal, snapshot);
  const standing = await Promise.all(files.map(async ({ path, text }) => (await snapshot.read(path)) === text));
  if (standing.every(Boolean)) return { commits: [], files: [], pullRequest: null, shown: null, notes: [] };
  const { pullRequest } = await proposeSchedule(host, schedule, proposal);
  return { commits: [pullRequest.head], files: files.map((file) => file.path), pullRequest: pullRequest.url, shown: null, notes: [] };
}

/** scheduleStrategies — the strategies this module offers the job runner (ARC-046). */
export const scheduleStrategies = { recipes: {}, checks: {}, preconditions: {}, steps: {}, writers: { "ci-configuration": ciConfiguration }, tools: {} };
