// The start of a job record says where its task travels (ITM-490) — MOD-job-ledger's JobStart fields `task` and
// `conversation`, as the accepted text of docs/architecture/MOD-job-ledger.md states them.
// Run: node --test tests/job-ledger-task.test.mjs
//
// Module: MOD-job-ledger
// Guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// Level: unit
//
// Every expected value stands in the test's own text. Records are read back through listJobs of an in-memory snapshot;
// nothing reaches the network or waits.

import test from "node:test";
import assert from "node:assert/strict";
import { startRecord, appendToRecord, listJobs } from "../src/job-ledger/index.mjs";

const snapshotOf = (files) => ({ paths: Object.keys(files), read: async (path) => (Object.hasOwn(files, path) ? files[path] : null) });
const readBack = async (path, text) => (await listJobs([{ address: "org/repo", snapshot: snapshotOf({ [path]: text }) }], new Map()))[0].record;

const MESSAGE = "please rename the Export button to Download";

const BASE = {
  id: "JOB-20261016-0900-c3d4", kind: "write-tests", worksOn: ["EXPORT IS A PDF"], participant: "drafter-a",
  model: "example-model", route: "ci hosted", run: null, retries: null, startedBy: "alice",
  start: new Date("2026-10-16T09:00:00Z"), agentM: { version: "2026.10.0", commit: "abc123def456" }, inputs: [], limit: 5,
  destinations: [{ participant: "drafter-a", place: "CI", parts: ["the chosen requirements"] }],
  params: { requirements: ["EXPORT IS A PDF"] },
};

// The finding a planted message gives: whether the record's text holds the message.
const holds = (text, message) => text.includes(message);

// TST-490001 · level: unit · module: MOD-job-ledger
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a JobStart whose task is "with the hand-over" and whose conversation is "docs/conversations/CONV-1.md", and one whose task is "in parameters" with no conversation
// input: startRecord of each, read back through listJobs
// expect: the first record reads task "with the hand-over" and conversation "docs/conversations/CONV-1.md"; the second reads task "in parameters" and conversation null
test("startRecord — a start of each kind is written and read back with task and conversation", async () => {
  const handed = startRecord({ ...BASE, task: "with the hand-over", conversation: "docs/conversations/CONV-1.md" });
  const first = await readBack(handed.path, handed.text);
  assert.equal(first.task, "with the hand-over");
  assert.equal(first.conversation, "docs/conversations/CONV-1.md");

  const plain = startRecord({ ...BASE, task: "in parameters", conversation: null });
  const second = await readBack(plain.path, plain.text);
  assert.equal(second.task, "in parameters");
  assert.equal(second.conversation, null);
});

// TST-490002 · level: unit · module: MOD-job-ledger
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: an earlier record's text, written before `task` and `conversation` existed: its front matter has neither key
// input: listJobs of a snapshot holding that text
// expect: the record reads task "in parameters" and conversation null
test("an earlier record without task and conversation reads as in parameters and no conversation", async () => {
  const text = ["---", "id: JOB-20261001-0800-aaaa", "kind: run-tests", "works_on:", "  - aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "route: ci hosted", "started_by: akmaier", "start: 2026-10-01 08:00 UTC", "agent_m: unknown, commit unknown", "limit: 1", "---",
    "## Destinations", "", "## Parameters", "", "```json", "{}", "```", ""].join("\n");
  const record = await readBack("docs/jobs/JOB-20261001-0800-aaaa.md", text);
  assert.equal(record.task, "in parameters");
  assert.equal(record.conversation, null);
});

// TST-490003 · level: unit · module: MOD-job-ledger
// guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: a hand-over start whose parameters hold no message, ended with a done part whose draft is null
// input: startRecord, then appendToRecord of a done end; the message of the conversation is "please rename the Export button to Download"
// expect: the record's text does not hold the message; its parameters equal {"requirements":["EXPORT IS A PDF"]}; its end holds no draft (null)
test("a job whose task travels with the hand-over holds no message in its parameters and no draft in its end", async () => {
  const { path, text } = startRecord({ ...BASE, task: "with the hand-over", conversation: "docs/conversations/CONV-1.md" });
  const ended = appendToRecord(text, { part: "end", at: new Date("2026-10-16T09:30:00Z"), state: "done", results: ["waits for a person"],
    draft: null, rounds: [], usage: null, cost: { known: false, usage: null }, reason: null, log: null });
  assert.equal(holds(ended, MESSAGE), false);
  const record = await readBack(path, ended);
  assert.deepEqual(record.params, { requirements: ["EXPORT IS A PDF"] });
  assert.equal(record.end.draft, null);
});

// TST-490004 · level: unit · module: MOD-job-ledger
// guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: a hand-over start whose parameters carry a planted message "please rename the Export button to Download"
// input: startRecord, then the finding of the planted message in its text
// expect: the message is found (true) — the counter-proof that TST-490003's finding of no message can fail
test("counter-proof — a message planted in the parameters of a hand-over record is found", () => {
  const { text } = startRecord({ ...BASE, task: "with the hand-over", conversation: "docs/conversations/CONV-1.md",
    params: { requirements: ["EXPORT IS A PDF"], instruction: MESSAGE } });
  assert.equal(holds(text, MESSAGE), true);
});
