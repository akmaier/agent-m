// The built-in check document-schema reads a conversation's proposed edits — MOD-job-runner, Data (Built-in strategies):
// MOD-documents' documentFindings on every drafted document. The documents of a draft are those of its `files` and of its
// `edits`, each { path, text }; a draft with neither has no document and no finding. The kind `converse` answers an `answer`
// and `edits` and no `files`.
// Run: node --test tests/job-runner-document-schema-edits.test.mjs
//
// Module: MOD-job-runner
// Guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A FINDING READS LIKE A COMPILER MESSAGE
// Guards: A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION
// Level: unit
//
// The kind is this file's own, so that the check runs alone, in the loop of one drafter; its answer is that of `converse`. The
// driver is a fixture that answers from a list. The expected findings are written out in each test, not read from a document.
// Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { formatFinding } from "../src/text-tools/index.mjs";
import { runJob } from "../src/job-runner/index.mjs";

const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };

// The answer of the kind converse: an answer, and edits, each with its path and its whole new text. `files` is allowed so that
// a test can draft both.
const ANSWER = { type: "object", required: ["answer"], properties: { answer: { type: "string" }, edits: { type: "array",
  items: { type: "object", required: ["path", "text"], properties: { path: { type: "string" }, text: { type: "string" } } } },
  files: { type: "array" } } };

const KIND = { name: "fixture-edits", serves: [], participant: "one", needs: ["draft text"], resources: "none",
  preconditions: [], recipes: [], checks: ["document-schema"], personDecides: [], reviewer: null, reviewers: 0, steps: [],
  gatePoints: [], review: "person", writer: "return-draft", limit: 5, purpose: "Answers and edits, for a test.",
  prompt: "Answer.", answer: ANSWER };
const JOB = { kind: KIND, params: {}, drafter: DRAFTER, reviewers: [], parts: [], destinations: [], fits: true,
  notFitting: [], leftOut: [], blocking: [], limit: 5 };
const CONTEXT = { kind: KIND, params: {}, product: { address: "https://github.com/alice/product", snapshot: null, host: null },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [DRAFTER],
  places: { sources: {}, mailbox: null }, gates: [], person: "alice", now: new Date("2026-10-11T08:00:00Z"),
  agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null };

// A driver that answers from `answers` in turn, each as its JSON, and keeps every input it was sent.
function driver(answers) {
  const inputs = [];
  return { participant: DRAFTER, inputs, async send(input) {
    inputs.push(input);
    if (answers.length === 0) throw new Error("the drafter was asked more often than the test expects");
    return { text: JSON.stringify(answers.shift()), usage: null };
  } };
}

async function run(answers) {
  const drafter = driver(answers);
  const result = await runJob(JOB, { drafter, reviewers: [] }, { attended: true, context: CONTEXT });
  return { drafter, result };
}

// ---------------------------------------------------------------- the documents

const FENCE = "```";
const USE_CASE = `---
id: UC-001
title: Fixture use case
area: fixtures
actors:
  - Author
realises:
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
---
# UC-001 Fixture use case

## Actors

- **Author** — starts it.

## Precondition

- Nothing.

## Main flow

1. The author starts it.

${FENCE}mermaid
flowchart LR
    A[Author] --> B[Agent M]
${FENCE}

## Alternative flows

- None.

## Postcondition

- It has run.
`;

const ITEM = `---
id: ITM-001
title: Fixture item
level: module
realises:
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
modules:
  - MOD-fixture
tests:
  - unit
origin:
  - fixture
---
# ITM-001 Fixture item

## Outcome

An outcome.

## Acceptance

- An acceptance.
`;

const UC_PATH = "docs/use-cases/UC-001-fixture.md";
const ITEM_PATH = "docs/backlog/ITM-001-fixture.md";
const withoutLast = (text, last) => `${text.slice(0, text.indexOf(last)).trimEnd()}\n`;
const UC_LACKING = withoutLast(USE_CASE, "## Postcondition");
const ITEM_LACKING = withoutLast(ITEM, "## Acceptance");
const UC_FINDING = "UC-001:1: error: the section ## Postcondition is required, and missing "
  + "[A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION] — add the section ## Postcondition.";
const ITEM_FINDING = "ITM-001:1: error: the section ## Acceptance is required, and missing "
  + "[THE BACKLOG LIVES IN THE PRODUCT REPOSITORY] — add the section ## Acceptance.";

// ---------------------------------------------------------------- the tests

// TST-525101 · level: unit · module: MOD-job-runner
// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
// given: a kind that names document-schema, whose answer is that of converse — an answer and edits, no files; a drafter that answers a message with text and no edits key
// input: runJob of it, a person attending
// expect: the drafter asked once; one round with no finding; stopped because passed; the draft, the answer as given, the result's draft; nothing remaining
test("document-schema — a conversation's answer with no edits passes with no finding", async () => {
  const given = { answer: "It shows the use cases." };
  const { drafter, result } = await run([{ draft: given }]);

  assert.equal(drafter.inputs.length, 1);
  assert.deepEqual(result.rounds.map((round) => [round.number, round.findings.map(formatFinding)]), [[1, []]]);
  assert.deepEqual([result.draft, result.stoppedBecause, result.remaining], [given, "passed", []]);
});

// TST-525102 · level: unit · module: MOD-job-runner
// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A FINDING READS LIKE A COMPILER MESSAGE; A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION
// given: the same kind; a drafter that first answers with one edit of a use case without its ## Postcondition, then with the edit whole, answering the finding as fixed
// input: runJob of it, a person attending
// expect: the drafter asked twice, the second time with one finding and the first draft; the finding "UC-001:1: error: the section ## Postcondition is required, and missing [A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION] — add the section ## Postcondition." as a drafted file would get it; two rounds, the second with none; stopped because passed
test("document-schema — an edit of a use case without its Postcondition gets the finding a drafted file would get", async () => {
  const first = { answer: "Changed.", edits: [{ path: UC_PATH, text: UC_LACKING }] };
  const corrected = { answer: "Changed.", edits: [{ path: UC_PATH, text: USE_CASE }] };
  const { drafter, result } = await run([{ draft: first },
    { draft: corrected, answers: [{ finding: UC_FINDING, how: "fixed" }] }]);

  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(drafter.inputs[1].findings.map(formatFinding), [UC_FINDING]);
  assert.equal(drafter.inputs[1].previous, JSON.stringify(first, null, 2));
  assert.deepEqual(result.rounds.map((round) => [round.number, round.findings.map(formatFinding)]),
    [[1, [UC_FINDING]], [2, []]]);
  assert.deepEqual([result.draft, result.stoppedBecause, result.remaining], [corrected, "passed", []]);
});

// TST-525103 · level: unit · module: MOD-job-runner
// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
// given: the same kind; a drafter that answers with a use case lacking its ## Postcondition under files and an item lacking its ## Acceptance under edits, then with neither
// input: runJob of it, a person attending
// expect: the first round holds exactly two findings, the use case's and the item's, each once (compared in sorted order), so that files and edits are both read
test("document-schema — the documents of files and of edits are both judged", async () => {
  const first = { answer: "Both.", files: [{ path: UC_PATH, text: UC_LACKING, class: "new" }],
    edits: [{ path: ITEM_PATH, text: ITEM_LACKING }] };
  const { result } = await run([{ draft: first }, { draft: { answer: "Both." } }]);

  assert.deepEqual(result.rounds[0].findings.map(formatFinding).sort(), [ITEM_FINDING, UC_FINDING]);
});

// TST-525104 · level: unit · module: MOD-job-runner
// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
// given: the same kind; a drafter that answers with an answer alone, which holds neither files nor edits; and one that answers with an edit at a path no schema matches
// input: runJob of each, a person attending
// expect: each has one round with no finding, stops because passed, and its draft is the result's draft
test("document-schema — a draft with no document, or with an edit no schema matches, has no finding", async () => {
  const bare = { answer: "Nothing to change." };
  const elsewhere = { answer: "Noted.", edits: [{ path: "docs/notes/readme.md", text: "# Notes\n" }] };
  for (const given of [bare, elsewhere]) {
    const { result } = await run([{ draft: given }]);
    assert.deepEqual(result.rounds.map((round) => [round.number, round.findings.map(formatFinding)]), [[1, []]]);
    assert.deepEqual([result.draft, result.stoppedBecause], [given, "passed"]);
  }
});
