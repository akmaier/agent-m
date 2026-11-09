// candidate.mjs — the release candidate and its complete run (MOD-release-evidence, Parts). Of it, ITM-254 builds
// startReleaseCandidate, as the module file states it: tags the commit v<version>-rc.<N>, the next free N, and queues
// the complete run on it through MOD-runtimes' queueJob, whose parameters keep the candidate's version, tag and
// changelog entry, for every level the product's schedule names.
//
// Module: MOD-release-evidence
//
// The complete run is a job without a participant, on the runner each row of the schedule names — `hosted` or `runner:<label>` (MOD-test-schedule) —, so that no
// implementer runs the release tests (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER). A level whose row names no runner is refused with NoRunner, naming it.

import { newJobId } from "../job-ledger/index.mjs";
import { queueJob } from "../runtimes/index.mjs";
import { ReleaseEvidenceError } from "./errors.mjs";
import { scheduleAt, levelRows } from "./schedule.mjs";

const JOB_PATH = /^docs\/jobs\/(JOB-[^/]+)\.md$/;

// The next free N of a candidate tag v<version>-rc.<N>: the greatest N already tagged for this version, plus one, or 1
// where none stands yet.
async function nextCandidateNumber(host, version) {
  const pattern = `v${version}-rc.*`;
  const tagged = await host.listTags(pattern);
  const n = new RegExp(`^v${version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-rc\\.(\\d+)$`);
  let highest = 0;
  for (const { name } of tagged) {
    const m = n.exec(name);
    if (m) highest = Math.max(highest, Number(m[1]));
  }
  return highest + 1;
}

// NoRunner where a level's row of the schedule names no runner.
function checkRunners(rows) {
  for (const row of rows) {
    if (String(row.cells["runs on"] ?? "").trim()) continue;
    const level = row.cells.Row;
    throw new ReleaseEvidenceError("NoRunner", { level }, `No runner runs the level "${level}" — its row of the schedule names none.`);
  }
}

// startReleaseCandidate(host, version, commit, changelog, person) -> Promise<{ candidate: string, run: string }>
// (MOD-release-evidence, Interfaces): tags `commit` v<version>-rc.<N>, the next free N, then queues the complete run —
// every level of the product's schedule — as a job of kind "run-tests" through MOD-runtimes' queueJob, its
// parameters naming the candidate's version, tag and commit and keeping the changelog entry given. Errors: TagExists
// (from the host's createTag — A VERSION IS NOT REWRITTEN), NoRunner (above).
export async function startReleaseCandidate(host, version, commit, changelog, person) {
  const [info, atCommit] = await Promise.all([host.repositoryInfo(), host.readSnapshot(commit)]);
  const schedule = await scheduleAt(atCommit);
  const rows = levelRows(schedule);
  const branchSnapshot = await host.readSnapshot(info.defaultBranch);
  checkRunners(rows);

  const n = await nextCandidateNumber(host, version);
  const tag = `v${version}-rc.${n}`;
  await host.createTag(tag, commit); // TagExists propagates from here, unchanged.

  const taken = new Set(branchSnapshot.paths.map((p) => JOB_PATH.exec(p)?.[1]).filter(Boolean));
  const id = newJobId(new Date(), taken);
  // Gap: JobStart.agentM names Agent M's own version and the instance commit it ran at (MOD-job-ledger.md); neither
  // reaches this function's signature (MOD-release-evidence.md, Interfaces: startReleaseCandidate names host, version,
  // commit, changelog, person only), so it is recorded unknown here — no item needs the signature changed now.
  const start = {
    id, kind: "run-tests", worksOn: [commit], participant: null, model: null, route: "ci hosted", run: null, retries: null,
    startedBy: person, start: new Date(), agentM: { version: "unknown", commit: "unknown" },
    inputs: [], limit: 1, destinations: [], params: { candidate: { version, tag, commit }, changelog },
  };
  await queueJob(host, start, { kind: "ci", runner: "hosted" }, branchSnapshot.commit);
  return { candidate: tag, run: id };
}
