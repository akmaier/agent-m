// The built-in check requirement-form — MOD-job-runner's correction loop with a kind that names it, as
// docs/architecture/MOD-job-runner.md states it under Data (Built-in strategies): MOD-spec-document's requirementFindings on
// every drafted requirement. Each candidate of a draft is read as the requirement it proposes — written as the SPEC writes a
// requirement, with the source the job names, and read as a SPEC is —, and what is found goes back to the drafter.
// Run: node --test tests/job-runner-requirement-form.test.mjs
//
// Module: MOD-job-runner
// Guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A REQUIREMENT HAS FOUR FIELDS; UC-005; UC-019
// Guards: ONE STATEMENT PER REQUIREMENT; AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED
// Level: unit
//
// The kind is this file's own, so that the check runs alone, in the loop of one drafter, for a job whose source is
// SRC-fixture; the driver is a fixture that answers from a list — a function there answers what it is sent — and keeps
// every input it was sent. A finding is compared as [the requirement it names, error or warning, the requirement it is
// reported under], since the module file of MOD-spec-document does not word `what` and `fix`: of those a test asks only
// that each says something in one line, and the drafter answers whatever finding it is sent. The line a finding names is
// that of its candidate in the text the candidates are written as; of it a test asks only that it is a line. Each test
// states its input and its expected result before it runs (given / input / expect). Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { formatFinding } from "../src/text-tools/index.mjs";
import { runJob } from "../src/job-runner/index.mjs";

// ---------------------------------------------------------------- the kind, the driver, the context

const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };

// The answer of a kind that derives requirements: candidates, each with the fields the catalogue's kinds ask for.
const CANDIDATES = { type: "object", required: ["candidates"], properties: { candidates: { type: "array", items: {
  type: "object", required: ["name", "rule", "check", "constrains", "passage", "class"], properties: {
    name: { type: "string" }, rule: { type: "string" }, check: { type: "string" },
    constrains: { type: "string", enum: ["product", "process"] }, passage: { type: "string" },
    class: { type: "string", enum: ["new", "change", "duplicate", "conflict"] }, of: { type: "string" } } } } } };

// A kind that names the check and no other: a person reviews its result, so runJob returns it and writes nothing.
const KIND = { name: "fixture-requirements", serves: [], participant: "one", needs: ["draft text"], resources: "none",
  preconditions: [], recipes: [], checks: ["requirement-form"], personDecides: [], reviewer: null, reviewers: 0, steps: [],
  gatePoints: [], review: "person", writer: "return-draft", limit: 5, purpose: "Derives requirements, for a test.",
  prompt: "Derive the requirements.", answer: CANDIDATES };
const PARAMS = { source: "SRC-fixture" };
const JOB = { kind: KIND, params: PARAMS, drafter: DRAFTER, reviewers: [], parts: [], destinations: [], fits: true,
  notFitting: [], leftOut: [], blocking: [], limit: 5 };
const CONTEXT = { kind: KIND, params: PARAMS,
  product: { address: "https://github.com/alice/product", snapshot: null, host: null },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [DRAFTER],
  places: { sources: {}, mailbox: null }, gates: [], person: "alice", now: new Date("2026-10-11T08:00:00Z"),
  agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null };

// A driver that answers from `answers` in turn — a value is sent as its JSON, a function is called with the input the driver
// was sent and its value sent — and keeps every input it was sent.
function driver(answers) {
  const inputs = [];
  return { participant: DRAFTER, inputs, async send(input) {
    inputs.push(input);
    if (answers.length === 0) throw new Error("the drafter was asked more often than the test expects");
    const next = answers.shift();
    return { text: JSON.stringify(typeof next === "function" ? next(input) : next), usage: null };
  } };
}
// What a drafter that returns `draft` answers each finding it was sent with: `how`, and the reason where it gives one.
const answering = (draft, how, text) => (input) => ({ draft,
  answers: input.findings.map((found) => ({ finding: formatFinding(found), how, text })) });

// ---------------------------------------------------------------- the candidates

const PDF = { name: "EXPORT IS A PDF", rule: "An export is a PDF file.", check: "`tests/test_export.py` — opens the export",
  constrains: "product", passage: "An export shall be a PDF file.", class: "new" };
const CSV = { name: "EXPORT AS CSV", rule: "An export may be a CSV file.",
  check: "`tests/test_export.py` — reads the export as CSV", constrains: "product",
  passage: "An export may be a CSV file.", class: "new" };

const brief = (findings) => findings.map((found) => [found.artifact, found.kind, found.rule]);
// A finding says what is wrong and what correction is expected, each in one line, and names a line.
function sayItInOneLine(found) {
  assert.ok(Number.isInteger(found.line) && found.line >= 1, `${found.artifact} names a line`);
  for (const text of [found.what, found.fix]) assert.match(text, /^[^\n]+$/, `${found.artifact}: ${text}`);
}

// ---------------------------------------------------------------- the correction loop

// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A REQUIREMENT HAS FOUR FIELDS
// given: a kind that names requirement-form and no other check, its result reviewed by a person, for a job whose source is
//        SRC-fixture; a drafter that first drafts two candidates — EXPORT IS A PDF whole and EXPORT AS CSV with an empty
//        check —, then the same two with the check of EXPORT AS CSV given, answering each finding as fixed; known positive:
//        the whole candidate, written and read the same way, is found in neither round
// input: runJob of it, a person attending
// expect: the drafter asked twice, the second time with the one finding and the first draft; the finding an error naming
//         EXPORT AS CSV under A REQUIREMENT HAS FOUR FIELDS, in one line; two rounds, the first with that finding answered
//         fixed, the second with none; stopped because passed; the corrected draft the result's draft, nothing remaining
test("requirement-form — a candidate without a check goes back to the drafter as an error, and the corrected draft ends the loop", async () => {
  const first = { candidates: [PDF, { ...CSV, check: "" }] };
  const corrected = { candidates: [PDF, CSV] };
  const drafter = driver([{ draft: first }, answering(corrected, "fixed")]);

  const result = await runJob(JOB, { drafter, reviewers: [] }, { attended: true, context: CONTEXT });

  const missing = [["EXPORT AS CSV", "error", "A REQUIREMENT HAS FOUR FIELDS"]];
  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(brief(drafter.inputs[1].findings), missing);
  assert.equal(drafter.inputs[1].previous, JSON.stringify(first, null, 2));
  assert.deepEqual(result.rounds.map((round) => [round.number, brief(round.findings), round.answers.map((a) => a.how)]),
    [[1, missing, ["fixed"]], [2, [], []]]);
  assert.deepEqual([result.draft, result.stoppedBecause, result.remaining], [corrected, "passed", []]);
  result.rounds[0].findings.forEach(sayItInOneLine);
});

// guards: ONE STATEMENT PER REQUIREMENT; AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED
// given: the same kind and job; a drafter that drafts one candidate, EXPORT BOTH, whose rule contains "and", otherwise whole,
//        and then the same draft again, answering the finding with a one-line justification
// input: runJob of it, a person attending
// expect: the drafter asked twice, the second time with the one finding; the finding a warning naming EXPORT BOTH under ONE
//         STATEMENT PER REQUIREMENT, in one line; the first round answered justified with the drafter's reason; the check
//         finds the same warning again in the second round; stopped because passed with nothing remaining — a warning
//         answered with a justification ends the loop; the draft the result's draft, unchanged
test("requirement-form — a rule with \"and\" goes back as a warning, and a one-line justification ends the loop", async () => {
  const both = { candidates: [{ ...PDF, name: "EXPORT BOTH", rule: "An export is a PDF file and a CSV file." }] };
  const reason = "the two clauses name one condition";
  const drafter = driver([{ draft: both }, answering(both, "justified", reason)]);

  const result = await runJob(JOB, { drafter, reviewers: [] }, { attended: true, context: CONTEXT });

  const conjunction = [["EXPORT BOTH", "warning", "ONE STATEMENT PER REQUIREMENT"]];
  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(brief(drafter.inputs[1].findings), conjunction);
  assert.deepEqual(result.rounds.map((round) => [round.number, brief(round.findings)]), [[1, conjunction], [2, conjunction]]);
  assert.deepEqual(result.rounds[0].answers.map((answer) => [answer.how, answer.text]), [["justified", reason]]);
  assert.deepEqual([result.draft, result.stoppedBecause, result.remaining], [both, "passed", []]);
  result.rounds[0].findings.forEach(sayItInOneLine);
});
