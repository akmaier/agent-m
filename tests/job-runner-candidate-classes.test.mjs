// The built-in check candidate-classes, and the artifacts a part carries — MOD-job-runner as its file now states them under
// Data (Built-in strategies) and Interfaces (Part, JobResult): the existing artifacts that a recipe's part shows, each with
// its identifier and the values of its format's key, against which MOD-documents' classifyCandidates classifies the drafted
// candidates in every round. An error goes back to the drafter for a candidate the rule finds a duplicate of an existing
// artifact while the drafter classed it otherwise, and for a change, a duplicate or a conflict that names no artifact a part
// carries; the classes of the last round are the result's `classes`, and null for a kind without the check.
// Run: node --test tests/job-runner-candidate-classes.test.mjs
//
// Module: MOD-job-runner
// Guards: A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT; EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
// Guards: CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
// Guards: UC-005; UC-019
// Level: unit
//
// The kinds are this file's own, so that the check runs alone, in the loop of one drafter. The part of the job is the one a
// recipe gives for a product with two requirements — a requirement's key being its name and its rule, as the module file
// says — as prepareJob keeps it: sized, required, naming its recipe. The driver is a fixture that answers from a list and
// keeps every input it was sent. A finding the module file words not at all is compared as [error or warning, the
// requirement it is reported under] and by the candidates and the existing artifacts its line names; of its words a test
// asks only that `what` and `fix` each say something in one line, and the artifact and the line it stands on are left open.
// Each test states its input and its expected result before it runs (given / input / expect). Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { formatFinding } from "../src/text-tools/index.mjs";
import { runJob } from "../src/job-runner/index.mjs";

// ---------------------------------------------------------------- the kinds, the part, the driver, the context

const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };

// The answer of a kind that derives requirements: candidates, each with the fields the catalogue's kinds ask for.
const CANDIDATES = { type: "object", required: ["candidates"], properties: { candidates: { type: "array", items: {
  type: "object", required: ["name", "rule", "check", "constrains", "passage", "class"], properties: {
    name: { type: "string" }, rule: { type: "string" }, check: { type: "string" },
    constrains: { type: "string", enum: ["product", "process"] }, passage: { type: "string" },
    class: { type: "string", enum: ["new", "change", "duplicate", "conflict"] }, of: { type: "string" } } } } } };

// A kind that names the checks given and gets the part of the recipe existing-requirements: a person reviews its result, so
// runJob returns it and writes nothing.
const kindNaming = (checks) => ({ name: "fixture-requirements", serves: [], participant: "one", needs: ["draft text"],
  resources: "none", preconditions: [], recipes: [{ name: "existing-requirements", optional: false }], checks,
  personDecides: [], reviewer: null, reviewers: 0, steps: [], gatePoints: [], review: "person", writer: "return-draft",
  limit: 5, purpose: "Derives requirements, for a test.", prompt: "Derive the requirements.\n\n{{existing-requirements}}",
  answer: CANDIDATES });

// The fixture recipe: one part that shows the product's two requirements, each as an artifact with its identifier — the
// requirement's name — and the values of its key, its name and its rule.
const EXISTING = [
  { id: "EXPORT IS A PDF", keys: ["EXPORT IS A PDF", "An export is a PDF file."] },
  { id: "PRINT IS DOUBLE-SIDED", keys: ["PRINT IS DOUBLE-SIDED", "A print is double-sided."] },
];
const existingRequirements = async () => [{ name: "SPEC.md", size: 0, sources: [], required: true, artifacts: EXISTING,
  text: EXISTING.map(({ keys }) => `**${keys[0]}**\n${keys[1]}`).join("\n\n") }];
const PARTS = (await existingRequirements()).map((part) => ({ ...part, size: 30, recipe: "existing-requirements" }));

const contextOf = (kind) => ({ kind, params: {},
  product: { address: "https://github.com/alice/product", snapshot: null, host: null },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [DRAFTER],
  places: { sources: {}, mailbox: null }, gates: [], person: "alice", now: new Date("2026-10-11T08:00:00Z"),
  agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null });

// A job of a kind that names `checks`, run for a person: with a drafter, or — without one — on the draft `from`, which is
// checked once.
function run(checks, { drafter = null, from, parts = PARTS } = {}) {
  const kind = kindNaming(checks);
  const job = { kind, params: {}, drafter: DRAFTER, reviewers: [], parts, destinations: [], fits: true,
    notFitting: [], leftOut: [], blocking: [], limit: 5 };
  return runJob(job, { drafter, reviewers: [] }, { attended: true, context: contextOf(kind), from });
}

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
// What a drafter that corrects answers: `draft`, and each finding it was sent fixed.
const correcting = (draft) => (input) => ({ draft,
  answers: input.findings.map((found) => ({ finding: formatFinding(found), how: "fixed" })) });

// ---------------------------------------------------------------- the candidates

const candidate = (name, rule, passage, cls = "new", of) => ({ name, rule,
  check: "`tests/test_fixture.py` — opens the result", constrains: "product", passage, class: cls,
  ...(of === undefined ? {} : { of }) });

const CSV = candidate("EXPORT AS CSV", "An export may be a CSV file.", "An export may be a CSV file.");
// The rule of EXPORT IS A PDF under another name: an exact duplicate of it, whatever its drafter classes it.
const AS_PDF = candidate("EXPORT AS PDF", "An export is a PDF file.", "Exports are PDF files.");
const AS_XML = candidate("EXPORT AS XML", "An export may be an XML file.", "Exports may be XML files.");
// A change of a requirement that a part shows.
const TWO_COPIES = candidate("PRINT TWO COPIES", "A print has two copies.", "Prints have two copies.", "change",
  "PRINT IS DOUBLE-SIDED");

const kindsOf = (findings) => findings.map((found) => [found.kind, found.rule]);
const bySecond = (a, b) => a[1].localeCompare(b[1]);
// The lines of `findings`, and those of them that name `name`.
const linesOf = (findings) => findings.map(formatFinding);
const naming = (lines, name) => lines.filter((line) => line.includes(name));
// A finding says what is wrong and what correction is expected, each in one line, and names a line.
function sayItInOneLine(found) {
  assert.ok(Number.isInteger(found.line) && found.line >= 1, `${found.artifact} names a line`);
  for (const text of [found.what, found.fix]) assert.match(text, /^[^\n]+$/, `${found.artifact}: ${text}`);
}

const EXACT = "EXACT DUPLICATES ARE FOUND WITHOUT A MODEL";
const NAMED = "A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT";

// ---------------------------------------------------------------- the check

// guards: EXACT DUPLICATES ARE FOUND WITHOUT A MODEL; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; UC-005
// given: a kind that names candidate-classes alone, for a job whose one part shows two existing requirements, EXPORT IS A PDF
//        ("An export is a PDF file.") and PRINT IS DOUBLE-SIDED ("A print is double-sided."); a drafter that drafts three
//        candidates — EXPORT AS CSV, which neither states, classed new; EXPORT AS PDF, with the rule of EXPORT IS A PDF,
//        classed new; and "Print is double-sided", the name of PRINT IS DOUBLE-SIDED in other letters and another rule,
//        classed a duplicate that names nothing — and, told of the findings, drafts the same three again
// input: runJob of it, a person attending
// expect: the drafter asked twice, the second time with two findings, both errors under EXACT DUPLICATES ARE FOUND WITHOUT A
//         MODEL, each in one line: one names EXPORT AS PDF and the existing EXPORT IS A PDF, the other "Print is double-sided"
//         and the existing PRINT IS DOUBLE-SIDED — each its own, not the other's —, and none names EXPORT AS CSV; both rounds
//         hold those findings; the second draft changes nothing, so the loop stops unchanged with them remaining
test("candidate-classes — an exact duplicate not classed a duplicate of the existing requirement goes back, naming it", async () => {
  const draft = { candidates: [CSV, AS_PDF,
    candidate("Print is double-sided", "Printing uses both sides of the paper.", "Prints use both sides.", "duplicate")] };
  const drafter = driver([{ draft }, { draft }]);

  const result = await run(["candidate-classes"], { drafter });

  const wrong = [["error", EXACT], ["error", EXACT]];
  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(kindsOf(drafter.inputs[1].findings), wrong);
  const lines = linesOf(drafter.inputs[1].findings);
  const [pdf] = naming(lines, "EXPORT AS PDF"), [print] = naming(lines, "Print is double-sided");
  assert.deepEqual([naming(lines, "EXPORT AS PDF").length, naming(lines, "Print is double-sided").length,
    naming(lines, "EXPORT AS CSV").length], [1, 1, 0], lines.join("\n"));
  assert.ok(pdf.includes("EXPORT IS A PDF") && !pdf.includes("PRINT IS DOUBLE-SIDED"), pdf);
  assert.ok(print.includes("PRINT IS DOUBLE-SIDED") && !print.includes("EXPORT IS A PDF"), print);
  assert.deepEqual(result.rounds.map((round) => [round.number, kindsOf(round.findings)]), [[1, wrong], [2, wrong]]);
  assert.deepEqual([result.stoppedBecause, kindsOf(result.remaining)], ["unchanged", wrong]);
  drafter.inputs[1].findings.forEach(sayItInOneLine);
});

// guards: A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; UC-019
// given: the same job; a drafter that drafts five candidates — EXPORT AS CSV, classed new; EXPORT AS XML, a change of EXPORT
//        IS AN XML FILE, which no part shows; EXPORT IS SIGNED, a duplicate that names nothing; PRINT IN COLOUR, a conflict with
//        PRINT IS BLACK, which no part shows; and PRINT TWO COPIES, a change of PRINT IS DOUBLE-SIDED, which a part shows —
//        and, told of the findings, drafts the same five again
// input: runJob of it, a person attending
// expect: the drafter asked twice, the second time with three findings, each an error under A CANDIDATE IS NEW, A CHANGE, A
//         DUPLICATE OR A CONFLICT, in one line, one naming EXPORT AS XML, one EXPORT IS SIGNED and one PRINT IN COLOUR — and
//         none naming EXPORT AS CSV or PRINT TWO COPIES, the change of a requirement a part shows —; the loop stops unchanged
//         with those three remaining
test("candidate-classes — a change, a duplicate or a conflict naming no artifact a part carries goes back to the drafter", async () => {
  const draft = { candidates: [CSV,
    candidate("EXPORT AS XML", AS_XML.rule, AS_XML.passage, "change", "EXPORT IS AN XML FILE"),
    candidate("EXPORT IS SIGNED", "An export is signed.", "Exports are signed.", "duplicate"),
    candidate("PRINT IN COLOUR", "A print is in colour.", "Prints are in colour.", "conflict", "PRINT IS BLACK"),
    TWO_COPIES] };
  const drafter = driver([{ draft }, { draft }]);

  const result = await run(["candidate-classes"], { drafter });

  const wrong = [["error", NAMED], ["error", NAMED], ["error", NAMED]];
  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(kindsOf(drafter.inputs[1].findings), wrong);
  const lines = linesOf(drafter.inputs[1].findings);
  assert.deepEqual(["EXPORT AS CSV", "EXPORT AS XML", "EXPORT IS SIGNED", "PRINT IN COLOUR", "PRINT TWO COPIES"]
    .map((name) => naming(lines, name).length), [0, 1, 1, 1, 0], lines.join("\n"));
  assert.deepEqual([result.stoppedBecause, kindsOf(result.remaining)], ["unchanged", wrong]);
  drafter.inputs[1].findings.forEach(sayItInOneLine);
});

// guards: CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES; UC-005
// given: the same job; a drafter that drafts three candidates classed new — SAVE ON EXIT from "SRC-law, Art. 1", EXPORT AS
//        CSV, and STORE WORK WHEN LEAVING from "SRC-law, Art. 3", which states the rule of SAVE ON EXIT under another name
// input: runJob of it, a person attending
// expect: nothing found, so the drafter asked once and the loop stopped because passed; two classes in the order of their
//         first candidates: the first merges SAVE ON EXIT and STORE WORK WHEN LEAVING, naming both and both passages, new, of
//         nothing, decided by the participant; the second is EXPORT AS CSV alone, with its passage
test("candidate-classes — two candidates that state one rule are merged into one class naming both", async () => {
  const save = candidate("SAVE ON EXIT", "Unsaved work is saved on exit.", "SRC-law, Art. 1");
  const store = candidate("STORE WORK WHEN LEAVING", "Unsaved work is saved on exit.", "SRC-law, Art. 3");
  const drafter = driver([{ draft: { candidates: [save, CSV, store] } }]);

  const result = await run(["candidate-classes"], { drafter });

  assert.equal(drafter.inputs.length, 1);
  assert.deepEqual([result.stoppedBecause, result.remaining], ["passed", []]);
  assert.deepEqual(result.classes, [
    { refs: ["SAVE ON EXIT", "STORE WORK WHEN LEAVING"], from: ["SRC-law, Art. 1", "SRC-law, Art. 3"], class: "new",
      of: null, decidedBy: "participant" },
    { refs: ["EXPORT AS CSV"], from: [CSV.passage], class: "new", of: null, decidedBy: "participant" },
  ]);
});

// guards: EXACT DUPLICATES ARE FOUND WITHOUT A MODEL; A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT; UC-005; UC-019
// given: the same job; a drafter that first drafts EXPORT AS CSV, EXPORT AS PDF classed new — an exact duplicate —, EXPORT AS
//        XML, a change of EXPORT IS AN XML FILE, which no part shows, and PRINT TWO COPIES, a change of PRINT IS DOUBLE-SIDED,
//        which a part shows, and then, told of the findings, the same with EXPORT AS PDF classed a duplicate of EXPORT IS A PDF
//        and EXPORT AS XML classed new, answering each finding fixed
// input: runJob of it, a person attending
// expect: the drafter asked twice; two findings in the first round, one under each rule, each answered fixed, and none in
//         the second; stopped because passed with nothing remaining and the corrected draft the result's; the result's
//         classes those of the second round: EXPORT AS CSV new, EXPORT AS PDF a duplicate of EXPORT IS A PDF decided by rule,
//         EXPORT AS XML new, PRINT TWO COPIES a change of PRINT IS DOUBLE-SIDED, as its drafter classed it
test("candidate-classes — a draft fixed as the findings say passes, and its classes are those of the last round", async () => {
  const first = { candidates: [CSV, AS_PDF,
    candidate("EXPORT AS XML", AS_XML.rule, AS_XML.passage, "change", "EXPORT IS AN XML FILE"), TWO_COPIES] };
  const fixed = { candidates: [CSV, { ...AS_PDF, class: "duplicate", of: "EXPORT IS A PDF" }, AS_XML, TWO_COPIES] };
  const drafter = driver([{ draft: first }, correcting(fixed)]);

  const result = await run(["candidate-classes"], { drafter });

  const both = [["error", NAMED], ["error", EXACT]].sort(bySecond);
  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(result.rounds.map((round) => [round.number, kindsOf(round.findings).sort(bySecond),
    round.answers.map((answer) => answer.how)]), [[1, both, ["fixed", "fixed"]], [2, [], []]]);
  assert.deepEqual([result.draft, result.stoppedBecause, result.remaining], [fixed, "passed", []]);
  assert.deepEqual(result.classes, [
    { refs: ["EXPORT AS CSV"], from: [CSV.passage], class: "new", of: null, decidedBy: "participant" },
    { refs: ["EXPORT AS PDF"], from: [AS_PDF.passage], class: "duplicate", of: "EXPORT IS A PDF", decidedBy: "rule" },
    { refs: ["EXPORT AS XML"], from: [AS_XML.passage], class: "new", of: null, decidedBy: "participant" },
    { refs: ["PRINT TWO COPIES"], from: [TWO_COPIES.passage], class: "change", of: "PRINT IS DOUBLE-SIDED",
      decidedBy: "participant" },
  ]);
});

// guards: A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT
// given: the same part, and a draft whose EXPORT AS PDF is an exact duplicate classed new; a kind that names no check, and —
//        the known positive — the same kind naming candidate-classes; and the same kind with a job whose parts carry no artifact
// input: runJob of each, the draft given as `from` and no drafter: the draft is checked once
// expect: the kind without the check: no finding, the loop stopped because passed, and the result's classes null — not an
//         empty list; the kind with it: the finding of the exact duplicate, and the result's classes a list; the job whose parts
//         carry no artifact: nothing to classify, so no finding and no class — an empty list, not null
test("candidate-classes — a kind without the check has no classes, a kind with it has a list", async () => {
  const draft = { candidates: [CSV, AS_PDF] };

  const without = await run([], { from: draft });
  assert.equal(without.classes, null);
  assert.deepEqual([without.rounds.map((round) => round.findings.length), without.stoppedBecause], [[0], "passed"]);

  const checked = await run(["candidate-classes"], { from: draft });
  assert.deepEqual(kindsOf(checked.remaining), [["error", EXACT]], "known positive: the check ran");
  assert.ok(Array.isArray(checked.classes) && checked.classes.length > 0, `classes are ${JSON.stringify(checked.classes)}`);

  const bare = await run(["candidate-classes"], { from: draft, parts: [] });
  assert.deepEqual([bare.remaining, bare.classes, bare.stoppedBecause], [[], [], "passed"]);
});
