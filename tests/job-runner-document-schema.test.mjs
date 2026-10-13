// The built-in check document-schema — MOD-job-runner's correction loop with a kind that names it, as
// docs/architecture/MOD-job-runner.md states it under Data (Built-in strategies): MOD-documents' documentFindings on every
// drafted document, each read by the artifact schema whose path it matches. A draft with a document that lacks a required
// section is sent back to its drafter with the finding in the compiler form, and the corrected draft ends the loop.
// Run: node --test tests/job-runner-document-schema.test.mjs
//
// Module: MOD-job-runner
// Guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A FINDING READS LIKE A COMPILER MESSAGE
// Guards: A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION; UC-007; UC-019
// Guards: AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES
// Level: unit
//
// The kind is this file's own, so that the check runs alone, in the loop of one drafter; the driver is a fixture that answers
// from a list and keeps every input it was sent. The documents are the smallest that fit their schemas — a use case, an
// architecture decision, a module's file and an item, the four formats MOD-documents' artifactSchemas gives —, and the first
// draft leaves each without its last section. Each test states its input and its expected result before it runs (given /
// input / expect). Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { formatFinding } from "../src/text-tools/index.mjs";
import { runJob } from "../src/job-runner/index.mjs";

// ---------------------------------------------------------------- the kind, the driver, the context

const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };

// The answer of a kind that drafts documents: files, each with its path, its whole text and its class.
const FILES = { type: "object", required: ["files"], properties: { files: { type: "array", items: { type: "object",
  required: ["path", "text", "class"], properties: { path: { type: "string" }, text: { type: "string" },
    class: { type: "string", enum: ["new", "change", "duplicate", "conflict"] } } } } } };

// A kind that names the check and no other: a person reviews its result, so runJob returns it and writes nothing.
const KIND = { name: "fixture-documents", serves: [], participant: "one", needs: ["draft text"], resources: "none",
  preconditions: [], recipes: [], checks: ["document-schema"], personDecides: [], reviewer: null, reviewers: 0, steps: [],
  gatePoints: [], review: "person", writer: "return-draft", limit: 5, purpose: "Drafts documents, for a test.",
  prompt: "Draft the documents.", answer: FILES };
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

const DECISION = `---
id: ARC-001
title: Fixture decision
forced_by:
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
---
# ARC-001 Fixture decision

## Context

A situation.

## Decision

A decision.

## Alternatives

An alternative.

## Consequences

A consequence.
`;

const MODULE = `---
id: MOD-fixture
title: Fixture module
folder: src/fixture/
realises:
follows:
  - ARC-001
uses:
provides:
  - fixture
---
# MOD-fixture Fixture module

## Responsibility

It is a fixture.

## Parts

- \`index.mjs\` — the interface.

## Data

It keeps nothing.

## Interfaces

- \`fixture\` — does nothing.

## Files

It reads and writes nothing.

## Uses

- Nothing.
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

// Each document with its path, the last of its required sections — which the first draft leaves out — and the finding that
// leaving it out is: its artifact and line, its kind, what is missing, the requirement of its format by name, the fix.
const DOCUMENTS = [
  { path: "docs/use-cases/UC-001-fixture.md", text: USE_CASE, last: "## Postcondition",
    found: "UC-001:1: error: the section ## Postcondition is required, and missing "
      + "[A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION] — add the section ## Postcondition." },
  { path: "docs/architecture/ARC-001-fixture.md", text: DECISION, last: "## Consequences",
    found: "ARC-001:1: error: the section ## Consequences is required, and missing "
      + "[AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES] "
      + "— add the section ## Consequences." },
  { path: "docs/architecture/MOD-fixture.md", text: MODULE, last: "## Uses",
    found: "MOD-fixture:1: error: the section ## Uses is required, and missing "
      + "[A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES] — add the section ## Uses." },
  { path: "docs/backlog/ITM-001-fixture.md", text: ITEM, last: "## Acceptance",
    found: "ITM-001:1: error: the section ## Acceptance is required, and missing "
      + "[THE BACKLOG LIVES IN THE PRODUCT REPOSITORY] — add the section ## Acceptance." },
];
const whole = ({ path, text }) => ({ path, text, class: "new" });
const lacking = ({ path, text, last }) => ({ path, text: `${text.slice(0, text.indexOf(last)).trimEnd()}\n`, class: "new" });

// ---------------------------------------------------------------- the correction loop

// TST-472324 · level: unit · module: MOD-job-runner
// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A FINDING READS LIKE A COMPILER MESSAGE; A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION; AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES
// given: a kind that names document-schema and no other check, its result reviewed by a person; a drafter that first drafts four files — a use case without its ## Postcondition, an architecture decision without its ## Consequences, a module's file without its ## Uses and an item without its ## Acceptance —, then the same four whole, answering each finding as fixed; known positive: the check passes the four whole documents
// input: runJob of it, a person attending
// expect: the drafter asked twice, the second time with the four findings and the first draft; each finding an error in the compiler form — artifact:line, kind, what, [the requirement of its document's format], the correction —, in the order of the files; two rounds, the first with the four findings each answered fixed, the second with none; stopped because passed; the corrected draft the result's draft, nothing remaining
test("document-schema — documents that lack a required section go back to the drafter in the compiler form, and the corrected draft ends the loop", async () => {
  const lines = DOCUMENTS.map((document) => document.found);
  const first = { files: DOCUMENTS.map(lacking) };
  const corrected = { files: DOCUMENTS.map(whole) };
  const drafter = driver([
    { draft: first },
    { draft: corrected, answers: lines.map((finding) => ({ finding, how: "fixed" })) },
  ]);

  const result = await runJob(JOB, { drafter, reviewers: [] }, { attended: true, context: CONTEXT });

  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(drafter.inputs[1].findings.map(formatFinding), lines);
  assert.equal(drafter.inputs[1].previous, JSON.stringify(first, null, 2));
  assert.deepEqual(result.rounds.map((round) => [round.number, round.findings.map(formatFinding),
    round.answers.map((answer) => answer.how)]), [[1, lines, ["fixed", "fixed", "fixed", "fixed"]], [2, [], []]]);
  assert.deepEqual([result.draft, result.stoppedBecause, result.remaining], [corrected, "passed", []]);
});
