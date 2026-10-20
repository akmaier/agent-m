// MOD-runtimes' retryJob (ITM-973), as docs/architecture/MOD-runtimes.md states it: "`retryJob(record: JobRecord, choice: { participant: Participant, route: Route }, host: Host, head: string)
// -> Promise<{ path: string, commit: string }>` — queues a new job with a new identifier and the same inputs and parameters, which names the one it retries; the participant is the same or
// another holder of the role. A job whose task travelled with its hand-over is not retried here, since its record holds no task … Fails with `TaskNotInRecord` for such a job."
// For UC-036 (step 7), A JOB IDENTIFIER IS NEVER REUSED, A JOB IS RECORDED IN ITS PRODUCT REPOSITORY.
// Run: node --test tests/runtimes-retry.test.mjs
//
// Module: MOD-runtimes
// Guards: UC-036; A JOB IDENTIFIER IS NEVER REUSED; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// Level: unit
//
// The repository server is a fake host in memory (MOD-repository-hosts' interface: repositoryInfo, readSnapshot, commitFiles with an expected head), default branch `trunk`, holding the job
// workflow. Where the texts leave a reading open, the tests state the one they take, and the pull request names it:
//   - The participant is the caller's choice; retryJob refuses only a job whose task travelled with its hand-over, and what queueJob and the host refuse.
//   - The new start copies the record's kind, works_on, inputs, limit, destinations and parameters; its participant and model are the chosen participant's; its route is the chosen route as a record writes it
//     (`ci hosted`, `ci runner:<label>`, `bridge <name>`, `tab`); `retries` is the earlier identifier; it is no job of a run (`run` empty); `startedBy` and the Agent M version are the record's.
//   - The identifier is new: none that the product's `docs/jobs/` holds.
// Each test states its input and its expected result before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { retryJob } from "../src/runtimes/index.mjs";
import { appendToRecord, listJobs, startRecord } from "../src/job-ledger/index.mjs";

const WORKFLOW = ".github/workflows/agent-m-jobs.yml";
const REPO = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };
const START = {
  id: "JOB-20261007-0930-abcd", kind: "write-tests", worksOn: ["UC-026"], participant: "drafter-a", model: "example-model", route: "ci hosted", run: null, retries: null,
  startedBy: "alice", start: new Date("2026-10-07T09:30:00Z"), agentM: { version: "2026.10.0", commit: "abc1234" }, inputs: ["SPEC.md@deadbeef", "docs/resources.md@cafe"], limit: 5,
  task: "in parameters", conversation: null, destinations: [{ participant: "drafter-a", place: "CI", parts: ["the tests"] }], params: { requirements: ["UC-026"], instruction: "Write them." },
};
const CAPABILITIES = ["read the repository", "write to the repository", "run code and tests"];
const participant = (name, capabilities = CAPABILITIES) => ({ name, type: "CI agent", model: `${name}-model`, context: 200000, price: null, capabilities, place: "CI", route: "ci runner:hosted" });
const DRAFTER = participant("drafter-a"), OTHER = participant("drafter-b");
const HOSTED = { kind: "ci", runner: "hosted" };

// A product whose default branch holds the job workflow and the given job records, as the fake host serves them.
function world(starts) {
  const files = new Map([[WORKFLOW, "name: agent-m-jobs\n"]]);
  for (const [start, end] of starts) {
    const { path, text } = startRecord(start);
    files.set(path, end ? appendToRecord(text, { part: "end", at: new Date("2026-10-07T09:40:00Z"), state: end, results: [], draft: null, rounds: [], usage: null, cost: { known: false, usage: null }, reason: "x", log: null }) : text);
  }
  const writes = [];
  let head = "c0", made = 0;
  const snapshot = () => ({ repository: REPO, ref: "trunk", commit: head, paths: [...files.keys()], read: async (p) => files.get(p) ?? null, blob: (p) => (files.has(p) ? `blob-${p}` : null) });
  const host = {
    async repositoryInfo() { return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot() { return snapshot(); },
    async commitFiles(change) {
      if (change.expectedHead !== head) throw Object.assign(new Error("Moved"), { name: "Moved", head });
      writes.push(structuredClone(change));
      head = `c${++made}`;
      for (const file of change.files) files.set(file.path, file.text);
      return { commit: head, url: `${REPO.web}/commit/${head}` };
    },
  };
  const recordOf = async (id) => (await listJobs([{ address: REPO.web, snapshot: snapshot() }], new Map())).find((row) => row.record.id === id).record;
  return { host, writes, files, recordOf, head: () => head };
}

// TST-973001 · level: unit · module: MOD-runtimes
// guards: UC-036; A JOB IDENTIFIER IS NEVER REUSED; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a product holding a failed job JOB-20261007-0930-abcd (inputs, parameters, destinations as in START) and the job workflow
// input: retryJob(record, { participant: drafter-b, route: ci hosted }, host, head)
// expect: one commit on trunk, on the head read, creating a new start record whose identifier is another than the earlier job's, whose `retries` is the earlier identifier, whose participant is drafter-b, and whose inputs, parameters, kind, works_on and limit are the earlier job's; the earlier record is unchanged; the result is { path, commit } of the new record
test("retryJob — queues a new job with a new identifier, the same inputs and parameters, naming the job it retries", async () => {
  const w = world([[START, "failed"]]);
  const record = await w.recordOf(START.id);
  const before = w.files.get(record.path);
  const queued = await retryJob(record, { participant: OTHER, route: HOSTED }, w.host, w.head());
  assert.equal(w.writes.length, 1);
  assert.equal(w.writes[0].expectedHead, "c0");
  assert.deepEqual(w.writes[0].files.map((file) => file.path), [queued.path]);
  assert.notEqual(queued.path, record.path);
  assert.equal(queued.commit, "c1");
  const again = (await listJobs([{ address: REPO.web, snapshot: { repository: REPO, ref: "trunk", commit: "c1", paths: [...w.files.keys()], read: async (p) => w.files.get(p) ?? null, blob: () => null } }], new Map())).map((row) => row.record);
  const fresh = again.find((each) => each.path === queued.path);
  assert.notEqual(fresh.id, START.id);
  assert.equal(fresh.retries, START.id);
  assert.equal(fresh.participant, "drafter-b");
  assert.equal(fresh.route, "ci hosted");
  assert.deepEqual([fresh.kind, fresh.worksOn, fresh.inputs, fresh.limit, fresh.params, fresh.task], [START.kind, START.worksOn, START.inputs, START.limit, START.params, "in parameters"]);
  assert.equal(w.files.get(record.path), before);
});

// TST-973002 · level: unit · module: MOD-runtimes
// guards: UC-036; A JOB IDENTIFIER IS NEVER REUSED
// given: the product of TST-973001, and a second retry of the same job on the head the first left
// input: retryJob twice for the same record
// expect: two records beyond the earlier one, with three different identifiers in all, both naming the earlier job (counter-proof: a retry that reuses an identifier would write the earlier job's path again and be refused by the host or overwrite it; the paths differ here)
test("retryJob — every retry has an identifier of its own", async () => {
  const w = world([[START, "failed"]]);
  const record = await w.recordOf(START.id);
  const first = await retryJob(record, { participant: DRAFTER, route: HOSTED }, w.host, w.head());
  const second = await retryJob(record, { participant: DRAFTER, route: HOSTED }, w.host, w.head());
  assert.equal(new Set([record.path, first.path, second.path]).size, 3);
  assert.equal([...w.files.keys()].filter((path) => path.startsWith("docs/jobs/")).length, 3);
});

// TST-973003 · level: unit · module: MOD-runtimes
// guards: UC-036; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: a failed job whose record says `task: with the hand-over`
// input: retryJob(record, { participant: drafter-a, route: ci hosted }, host, head)
// expect: fails with TaskNotInRecord; nothing written
test("retryJob — a job whose task travelled with its hand-over is not retried here", async () => {
  const w = world([[{ ...START, task: "with the hand-over" }, "failed"]]);
  const record = await w.recordOf(START.id);
  assert.equal(record.task, "with the hand-over");
  await assert.rejects(retryJob(record, { participant: DRAFTER, route: HOSTED }, w.host, w.head()), (error) => error.name === "TaskNotInRecord");
  assert.equal(w.writes.length, 0);
});

// TST-973004 · level: unit · module: MOD-runtimes
// guards: UC-036; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: the product of TST-973001, with another writer's commit made after the head was read
// input: retryJob with the head read before
// expect: fails with Moved as the host names it; nothing written
test("retryJob — a head that moved is refused as the host refuses it", async () => {
  const w = world([[START, "failed"]]);
  const record = await w.recordOf(START.id);
  await assert.rejects(retryJob(record, { participant: DRAFTER, route: HOSTED }, w.host, "older-head"), (error) => error.name === "Moved");
  assert.equal(w.writes.length, 0);
});
