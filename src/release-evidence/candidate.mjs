// candidate.mjs — the release candidate and its complete run (MOD-release-evidence, Parts). Of it, ITM-254 builds
// startReleaseCandidate, as the module file states it: tags the commit v<version>-rc.<N>, the next free N, and queues
// the complete run on it through MOD-runtimes' queueJob, whose parameters keep the candidate's version, tag and
// changelog entry, for every level the product's schedule names.
//
// Module: MOD-release-evidence
//
// Gap, noted rather than designed around (developers.md, "Where the item ... is unclear"): the schedule's "runs on"
// cell is documented (schedule.schema.md) for the automated levels — hosted CI or a self-hosted runner — and left out
// where a row names none, which a valid schedule allows (scheduleFindings does not flag an empty cell). The levels
// "release" and "user" are run by a person as a checklist (this item's own Outcome and MOD-release-evidence.md,
// Interfaces: startReleaseCandidate), never by CI, so for these two rows alone an empty cell means no one is assigned
// at all, and NoRunner names the row. For "release" alone, RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER (UC-013
// 2a) is checked against MOD-job-ledger's listJobs: every job of kind "implement" recorded for this product gives its
// participant; when the row's named runner is the only one among them (and at least one is recorded), only the
// implementer could run the release tests, and NoRunner names "release" the same way. Nothing in MOD-job-ledger.md or
// MOD-release-evidence.md's Interfaces narrows "implementer" further than a job's own kind and participant, so no
// finer match (by module or by requirement) is built; no item needs either file changed for this.
//
// listJobs is async (MOD-job-ledger.md types it JobRow[], without Promise<>; src/job-ledger/index.mjs:373 names the
// gap and awaits it the same way) — awaited here at the call below, for the same reason this sprint's own record
// already names (docs/backlog/sprints/12.md, "notes of earlier gates").

import { listJobs, newJobId } from "../job-ledger/index.mjs";
import { queueJob } from "../runtimes/index.mjs";
import { ReleaseEvidenceError } from "./errors.mjs";
import { scheduleAt, levelRows } from "./schedule.mjs";

const JOB_PATH = /^docs\/jobs\/(JOB-[^/]+)\.md$/;
// The levels a person runs as a checklist, never CI (this item's Outcome; MOD-test-schedule.md, Data: "user-level
// tests as a checklist for the people assigned to them").
const PERSON_RUN_LEVELS = new Set(["release", "user"]);

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

// NoRunner where a person-run level's schedule row names no one, or where "release" names only the implementer
// (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER).
async function checkRunners(rows, host, branchSnapshot) {
  for (const row of rows) {
    const level = row.cells.Row;
    if (!PERSON_RUN_LEVELS.has(level)) continue;
    const runner = row.cells["runs on"];
    if (!runner) {
      throw new ReleaseEvidenceError("NoRunner", { level },
        `No participant can run the level "${level}" — the schedule names none.`);
    }
    if (level !== "release") continue;
    const jobs = await listJobs([{ address: branchSnapshot.repository.path, snapshot: branchSnapshot }], new Map());
    const implementers = new Set(
      jobs.filter((row2) => row2.record.kind === "implement" && row2.record.participant).map((row2) => row2.record.participant));
    if (implementers.size > 0 && [...implementers].every((p) => p === runner)) {
      throw new ReleaseEvidenceError("NoRunner", { level },
        `Only the implementer (${runner}) could run the release tests — RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER.`);
    }
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
  await checkRunners(rows, host, branchSnapshot);

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
