// The form of a requirement, for a drafter to read — MOD-spec-document's requirementForm, as docs/architecture/MOD-spec-document.md states it:
// "requirementForm(specText: string) -> string — what `requirementFindings` judges a requirement by, cut from the text of Agent M's own `SPEC.md`, for a
// drafter to read (`A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY`): the preamble's paragraph that begins `**Form of a requirement:**`, then
// the block of each requirement `requirementFindings` cites, from its head line to the end of its check, in the order that function lists them, each byte
// for byte and separated by one empty line. … Throws `FormMissing { missing }`, naming the paragraph or each requirement the text does not hold"; and of
// requirementFindings: "an error under `EVERY ARTIFACT HAS AN IDENTIFIER` for a name that MOD-identifiers' scheme does not read as a requirement's name —
// one not in capitals, or one with a character the scheme does not allow, such as an underscore —, its correction asking for the name in the scheme's form".
// Run: node --test tests/spec-document-requirement-form.test.mjs
//
// Module: MOD-spec-document
// Guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY; EVERY ARTIFACT HAS AN IDENTIFIER
// Level: unit
//
// The SPEC is a fixture this file writes: a preamble with the paragraph, and the six requirements requirementFindings cites — in another order than its
// findings list them, with one requirement it does not cite between them —, each block written here, so that the expected text is this file's, not the
// function's. Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { parseSpec, requirementFindings, requirementForm } from "../src/spec-document/index.mjs";

const PARAGRAPH = "**Form of a requirement:** a **name** in capitals, its **source**, one **rule** and the **check** that guards it.\nOne statement per requirement.";
const block = (name, rule) => `**${name}** *(PO A. Maier)*\n${rule}\n*Check:* \`tests/fixture.test.mjs\` — the fixture's check of ${name.toLowerCase()},\nover two lines.`;
// The six requirements requirementFindings cites, in the order its findings list them (MOD-spec-document, Interfaces: requirementFindings).
const CITED = ["A REQUIREMENT HAS FOUR FIELDS", "A REQUIREMENT NAMES ITS CHECK", "ONE STATEMENT PER REQUIREMENT", "THE NAME IS THE ID AND IT SURVIVES",
  "EVERY ARTIFACT HAS AN IDENTIFIER", "A DOCUMENT HOLDS NO HISTORY"];
const BLOCKS = Object.fromEntries(CITED.map((name) => [name, block(name, `The rule of ${name.toLowerCase()}.`)]));
const specWith = (paragraph, names) => ["# Fixture instance — Specification", "", "**VERBINDLICH (SPEC)**", "", ...(paragraph ? [paragraph, ""] : []), "---", "## 1. One",
  "", BLOCKS[names[5]] ?? "", "", block("A RULE NOT CITED", "A rule nobody cites."), "", ...names.slice(0, 5).map((name) => `${BLOCKS[name]}\n`), "## 2. Two", ""].join("\n");
const SPEC = specWith(PARAGRAPH, ["EVERY ARTIFACT HAS AN IDENTIFIER", "A REQUIREMENT HAS FOUR FIELDS", "A DOCUMENT HOLDS NO HISTORY", "ONE STATEMENT PER REQUIREMENT",
  "A REQUIREMENT NAMES ITS CHECK", "THE NAME IS THE ID AND IT SURVIVES"]);

// TST-1792010 · level: unit · module: MOD-spec-document
// guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY
// given: the fixture SPEC: the paragraph, then the six cited requirements in another order, with A RULE NOT CITED among them
// input: requirementForm(SPEC)
// expect: exactly the paragraph, then the six blocks in the order requirementFindings lists them, each byte for byte, separated by one empty line; A RULE
//   NOT CITED is not in it
test("requirementForm — the paragraph and each cited requirement, byte for byte, in the order of the findings", () => {
  assert.ok(SPEC.includes(BLOCKS["A DOCUMENT HOLDS NO HISTORY"]) && SPEC.includes("A RULE NOT CITED"), "known positive: the fixture holds every block");
  const form = requirementForm(SPEC);
  assert.equal(form, [PARAGRAPH, ...CITED.map((name) => BLOCKS[name])].join("\n\n"));
  assert.ok(!form.includes("A RULE NOT CITED"));
});

// TST-1792011 · level: unit · module: MOD-spec-document
// guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY
// given: the fixture SPEC without the paragraph; the fixture SPEC without A REQUIREMENT NAMES ITS CHECK and A DOCUMENT HOLDS NO HISTORY
// input: requirementForm of each
// expect: FormMissing, whose missing names the paragraph for the first, and the two requirements for the second, in the order of the findings
test("requirementForm — FormMissing names the paragraph or each requirement the text does not hold", () => {
  assert.doesNotThrow(() => requirementForm(SPEC), "known positive: the whole form is there");
  assert.throws(() => requirementForm(SPEC.replace(`${PARAGRAPH}\n`, "")), (error) => error.name === "FormMissing"
    && error.missing.length === 1 && /Form of a requirement/.test(error.missing[0]));
  const without = SPEC.replace(`${BLOCKS["A REQUIREMENT NAMES ITS CHECK"]}\n`, "").replace(`${BLOCKS["A DOCUMENT HOLDS NO HISTORY"]}\n`, "");
  assert.throws(() => requirementForm(without), (error) => error.name === "FormMissing"
    && JSON.stringify(error.missing) === JSON.stringify(["A REQUIREMENT NAMES ITS CHECK", "A DOCUMENT HOLDS NO HISTORY"]));
});

// TST-1792012 · level: unit · module: MOD-spec-document
// guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY
// given: Agent M's own SPEC.md, the instance's, read from this repository
// input: requirementForm of it
// expect: it begins with the SPEC's paragraph that begins **Form of a requirement:**, as the file holds it, and holds the head line of each requirement
//   requirementFindings cites
test("requirementForm — Agent M's own SPEC holds the whole form", async () => {
  const { readFileSync } = await import("node:fs");
  const text = readFileSync(new URL("../SPEC.md", import.meta.url), "utf8");
  const paragraph = text.slice(text.indexOf("**Form of a requirement:**"), text.indexOf("\n\n", text.indexOf("**Form of a requirement:**")));
  const form = requirementForm(text);
  assert.ok(form.startsWith(`${paragraph}\n\n`));
  for (const name of CITED) assert.match(form, new RegExp(`^\\*\\*${name}\\*\\* \\*\\(`, "m"), name);
});

// TST-1792013 · level: unit · module: MOD-spec-document
// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: a SPEC of one requirement named A_NAME_WITH_UNDERSCORES, and one named A NAME IN ITS FORM as the known positive
// input: requirementFindings(parseSpec(each)) under EVERY ARTIFACT HAS AN IDENTIFIER
// expect: none for the known positive; one error for the underscore, whose fix asks for the name in the scheme's form: words of capital letters, digits,
//   apostrophes, commas, hyphens and dots, separated by single spaces
test("requirementFindings — a name with an underscore is no requirement's name, and the fix states the scheme's form", () => {
  const findingsOf = (name) => requirementFindings(parseSpec(`# P — Specification\n\n## 1. One\n\n${block(name, "A rule.")}\n`))
    .filter((f) => f.rule === "EVERY ARTIFACT HAS AN IDENTIFIER");
  assert.deepEqual(findingsOf("A NAME IN ITS FORM"), []);
  const found = findingsOf("A_NAME_WITH_UNDERSCORES");
  assert.equal(found.length, 1);
  assert.equal(found[0].kind, "error");
  assert.match(found[0].fix, /capital letters, digits, apostrophes, commas, hyphens and dots, separated by single spaces/);
});
