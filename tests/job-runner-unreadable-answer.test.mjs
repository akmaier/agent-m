// The finding on an answer that is not JSON says where the reading stopped, so that the drafter can find its slip — as docs/architecture/MOD-job-runner.md states
// the loop's findings on an answer that cannot be read.
// Run: node --test tests/job-runner-unreadable-answer.test.mjs
//
// Module: MOD-job-runner
// Guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A FINDING READS LIKE A COMPILER MESSAGE
// Level: unit

import test from "node:test";
import assert from "node:assert/strict";
import { runJob } from "../src/job-runner/index.mjs";
import { kindOf } from "../src/job-catalogue/index.mjs";

const PARTICIPANT = { name: "fixture-drafter", type: "model endpoint", model: "fixture-model", capabilities: ["draft text"], place: "this machine" };
const answering = (text) => ({ participant: PARTICIPANT, send: async () => ({ text, usage: null }) });
const findingsOf = async (text) => {
  const kind = await kindOf("derive-use-cases");
  const prepared = { kind, parts: [], rules: null, blocking: [], notFitting: [], limit: 1, drafter: PARTICIPANT };
  const result = await runJob(prepared, { drafter: answering(text), reviewers: [] }, { attended: true, context: { gates: [], params: {} } });
  return result.rounds[0].findings.map((f) => f.what);
};

// TST-2026111004 · level: unit · module: MOD-job-runner
// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A FINDING READS LIKE A COMPILER MESSAGE
// given: a drafter that answers a JSON object one closing brace short; one that answers a comma too many in the middle; one that answers nothing
// input: runJob attended, limit 1, once for each
// expect: the first's finding says the answer is not JSON, that the text ends before its object is closed, and how long the text is; the second's names the
//   position where reading stopped and the text just before it; the third's stays "the answer cannot be read: it is not JSON". Counter-proof: on the loop as it
//   stood every one said only "it is not JSON", and Nemotron answered its 24,312 characters one brace short twice, the job failing (akmaier/AlienInvasion,
//   JOB-20261110-0825-0ffb).
test("TST-2026111004: an answer that is not JSON is named with where its reading stopped", async () => {
  const short = await findingsOf('{"draft": {"files": [], "why": "none"}, "answers": []');
  assert.equal(short.length, 1);
  assert.match(short[0], /^the answer cannot be read: it is not JSON/);
  assert.match(short[0], /ends before its object is closed/);
  assert.match(short[0], /\b53\b/);
  const comma = await findingsOf('{"draft": {"files": [], , "why": "none"}, "answers": []}');
  assert.match(comma[0], /at character 25\b/);
  assert.ok(comma[0].includes('{"draft": {"files": [],'), comma[0]);
  assert.deepEqual(await findingsOf(""), ["the answer cannot be read: it is not JSON"]);
});

// TST-2026111005 · level: unit · module: MOD-job-runner
// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A FINDING READS LIKE A COMPILER MESSAGE
// given: a drafter that leaves the object of `draft` open, so that `answers` stands inside it and the text ends one brace short
// input: runJob attended, limit 1
// expect: the finding names the outermost object as never closed, the character it opens at, and `draft` as the last key it holds, so that `answers`, meant beside
//   `draft`, stands inside it. Counter-proof: the finding said
//   only that the text ends before its object is closed, and Nemotron left `draft` open in the same way in its next answer (akmaier/AlienInvasion,
//   JOB-20261110-0903-3021).
test("TST-2026111005: an object left open is named, with where it opens and the last key it holds", async () => {
  const [one] = await findingsOf('{"draft": {"files": [], "why": "none", "answers": []}');
  assert.match(one, /the outermost object, opened at character 1\b/);
  assert.match(one, /`draft` is the last key it holds/);
  assert.match(one, /stands inside it/);
});
