// What a job leaves behind — MOD-job-runner's provenanceLines and roundsText as docs/architecture/MOD-job-runner.md states
// them under Data: the git trailers every commit a job makes carries, and the text form of the round record, whose schema
// is the module's rounds.schema.md.
// Run: node --test tests/job-runner-records.test.mjs
//
// Module: MOD-job-runner
// Guards: AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; THE ROUNDS ARE COUNTED AND SHOWN; A FINDING READS LIKE A COMPILER MESSAGE
// Level: unit
//
// The expected trailer lines are stated in the test itself; the round record's expected text is read from the module file's Data: its
// example — a round with two findings, one fixed and one justified, a round with no finding, and the line naming what is
// left, why the loop stopped and its limit. Each test states its input and its expected result before it runs.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { documentFindings, loadSchema, readDocument } from "../src/documents/index.mjs";
import { provenanceLines, roundsText } from "../src/job-runner/index.mjs";

const MODULE_FILE = readFileSync(new URL("../docs/architecture/MOD-job-runner.md", import.meta.url), "utf8");
const ROUNDS_SCHEMA = loadSchema(readFileSync(new URL("../src/job-runner/rounds.schema.md", import.meta.url), "utf8"), "tests");

const PARTICIPANT = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };

// The module file's example of the round record, between its ```markdown fence and the fence's end.
const EXAMPLE = MODULE_FILE.slice(MODULE_FILE.indexOf("```markdown\n## Rounds") + "```markdown\n".length,
  MODULE_FILE.indexOf("```", MODULE_FILE.indexOf("```markdown\n## Rounds") + 3));

// ---------------------------------------------------------------- provenanceLines

// TST-472342 · level: unit · module: MOD-job-runner
// guards: AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: a job of the kind change-use-case by drafter-a with example-model, two rounds, Agent M unreleased at a commit, and a person's instruction over two lines passed with it; then the same job with `jobId: null`
// input: provenanceLines of each
// expect: exactly the six lines Agent-M-Version, Agent-M-Job, Agent-M-Kind, Agent-M-Participant, Agent-M-Model and Agent-M-Rounds in this order, none naming the instruction or any word of it; for `jobId: null` the same without the Agent-M-Job line
test("provenanceLines — six trailers in order, none naming the person's instruction, no job line without a job", () => {
  const job = { agentM: { version: "unreleased", commit: "a".repeat(40) }, jobId: "JOB-20261011-0800-abcd",
    kind: "change-use-case", participant: PARTICIPANT, rounds: 2, instruction: "Add an alternative flow\nfor a refused token." };
  const lines = provenanceLines(job);
  assert.deepEqual(lines, [
    `Agent-M-Version: unreleased, commit ${"a".repeat(40)}`,
    "Agent-M-Job: JOB-20261011-0800-abcd",
    "Agent-M-Kind: change-use-case",
    "Agent-M-Participant: drafter-a",
    "Agent-M-Model: example-model",
    "Agent-M-Rounds: 2",
  ]);
  assert.ok(lines.every((line) => !line.startsWith("Agent-M-Instruction") && !/refused token/.test(line)), "no line names the instruction");
  assert.deepEqual(provenanceLines({ ...job, jobId: null }), [lines[0], ...lines.slice(2)], "without a job, no Agent-M-Job line");
});

// ---------------------------------------------------------------- roundsText

// TST-472343 · level: unit · module: MOD-job-runner
// guards: THE ROUNDS ARE COUNTED AND SHOWN; A FINDING READS LIKE A COMPILER MESSAGE
// given: the rounds of the module file's example: round 1 with an error answered fixed and a warning answered justified, round 2 with no finding; nothing left; stopped because passed; limit 5
// input: roundsText of them
// expect: the module file's example, byte for byte; and the text fits the round record's schema, rounds.schema.md
test("roundsText — the round record's text form, as the module file's example writes it", () => {
  const error = { artifact: "UC-007", line: 12, kind: "error", rule: "A USE CASE REALISES NAMED REQUIREMENTS",
    what: "realises \"EXPORT AS PDF\" matches no requirement", fix: "use an existing name or remove the line" };
  const warning = { artifact: "SPEC", line: 3, kind: "warning", rule: "ONE STATEMENT PER REQUIREMENT",
    what: "rule contains \"and\"", fix: "split it, or keep it and give a one-line reason" };
  const rounds = [
    { number: 1, findings: [error, warning], answers: [{ finding: error, how: "fixed", text: null },
      { finding: warning, how: "justified", text: "the two clauses name one condition." }], changed: true },
    { number: 2, findings: [], answers: [], changed: true },
  ];
  const text = roundsText(rounds, [], [], "passed", 5);
  assert.ok(EXAMPLE.startsWith("## Rounds"), "known positive: the module file's example is read");
  assert.equal(text, EXAMPLE);
  assert.deepEqual(documentFindings(ROUNDS_SCHEMA, readDocument(ROUNDS_SCHEMA, "rounds.md", text)), []);
});

// TST-472344 · level: unit · module: MOD-job-runner
// guards: THE ROUNDS ARE COUNTED AND SHOWN; WHAT A PERSON DECIDES IS NOT SENT BACK
// given: one round with one error left unanswered, one finding a person decides, stopped because of the limit 1
// input: roundsText of it
// expect: the round with its finding and no answer under it; the line naming one finding left, the limit as the reason; and the finding a person decides under `For a person:`, after that line
test("roundsText — what is left, why the loop stopped, and what a person decides", () => {
  const error = { artifact: "UC-007", line: 4, kind: "error", rule: "AN EDITED FILE KEEPS ITS IDENTIFIER",
    what: "id changed from UC-007 to UC-043", fix: "keep UC-007" };
  const conflict = { artifact: "SPEC", line: 9, kind: "error", rule: "A CONFLICT IS DECIDED BY A PERSON",
    what: "\"EXPORT AS CSV\" contradicts EXPORT IS A PDF", fix: "decide which holds" };
  const text = roundsText([{ number: 1, findings: [error], answers: [], changed: true }], [error], [conflict], "limit", 1);
  assert.equal(text, [
    "## Rounds", "",
    "### Round 1 — 1 finding",
    "- UC-007:4: error: id changed from UC-007 to UC-043 [AN EDITED FILE KEEPS ITS IDENTIFIER] — keep UC-007.", "",
    "Left: 1 finding · stopped because: limit · limit: 1", "",
    "For a person:",
    "- SPEC:9: error: \"EXPORT AS CSV\" contradicts EXPORT IS A PDF [A CONFLICT IS DECIDED BY A PERSON] — decide which holds.",
    "",
  ].join("\n"));
});
