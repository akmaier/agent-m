// A drafting kind's prompt does not restate the form its draft is checked by — MOD-job-catalogue, as docs/architecture/MOD-job-catalogue.md states it: "A
// prompt says what the job does and names the fields of its answer; it never states the form of what it drafts … The form so has one definition, the one its
// check reads: the prompts of `derive-requirements` and `change-requirements` hold no wording of a name, a rule, a check or of one statement per requirement,
// those of `derive-use-cases` and `change-use-case` none of the parts of a use case, and those of `derive-architecture` and `change-architecture` none of the
// sections of a decision or a module file"; and of change-requirements: "Its candidates name no passage … so that its prompt asks for none and its answer's
// schema has none".
// Run: node --test tests/job-catalogue-form-not-restated.test.mjs
//
// Module: MOD-job-catalogue
// Guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY; THE PERSON WHO PROMPTS IS A SOURCE
// Level: unit
//
// The readings this file takes, each a wording that states a part of the form, as the form's own texts state it: of a requirement, a name "in capitals", a
// rule as "one statement" or in the "target state" or "without justification", a check "without example values" or saying "how and what a test verifies",
// and a rule that needs "and"; of a use case its parts — actors, precondition, main flow, alternative flows, postcondition, a Mermaid diagram — and its path
// pattern; of a decision its sections — context, decision, alternatives and consequences named together — and the requirements "that force it"; of a module
// file its parts and data, the interface with "the types of every parameter and result", the files "it reads or writes" and "the interfaces it uses". Each
// test first shows the same detector naming the wording on a known positive. Each test states its input and its expected result before it runs (given /
// input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { kindOf } from "../src/job-catalogue/index.mjs";

// A wording matches over line breaks: its words may be separated by any white space.
const wording = (text) => new RegExp(text.split(" ").join("\\s+"), "i");
const WORDINGS = {
  requirement: ["in capitals", "one statement", "target state", "justification", "example values", "how and what a test verifies", "\"and\""].map(wording),
  "use case": ["\\bactors\\b", "precondition", "main flow", "alternative flows", "postcondition", "mermaid", "UC-<nnn>"].map(wording),
  architecture: ["context, decision, alternatives", "alternatives and consequences", "that force it", "parts and data", "types of every parameter and result",
    "reads or writes", "interfaces it uses"].map(wording),
};
const KINDS = { requirement: ["derive-requirements", "change-requirements"], "use case": ["derive-use-cases", "change-use-case"],
  architecture: ["derive-architecture", "change-architecture"] };
const stated = (prompt, form) => WORDINGS[form].filter((wording) => wording.test(prompt)).map(String);

// TST-1792050 · level: unit · module: MOD-job-catalogue
// guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY
// given: the prompts of derive-requirements, change-requirements, derive-use-cases, change-use-case, derive-architecture and change-architecture; known
//   positives, one sentence of each form: "Each candidate has a `name` in capitals", "its actors, its precondition, its main flow", "with context, decision,
//   alternatives and consequences"
// input: the wordings of its form each prompt holds
// expect: the detector names each known positive; no prompt holds a wording of its form
test("a drafting kind's prompt states nothing of the form its draft is checked by", async () => {
  assert.ok(stated("Each candidate has a `name` in\ncapitals", "requirement").length > 0, "known positive: a requirement's form, over a line break");
  assert.ok(stated("its actors, its precondition, its main flow", "use case").length > 0, "known positive: a use case's parts");
  assert.ok(stated("with context, decision, alternatives and consequences", "architecture").length > 0, "known positive: a decision's sections");
  for (const [form, kinds] of Object.entries(KINDS)) {
    for (const name of kinds) assert.deepEqual(stated((await kindOf(name)).prompt, form), [], name);
  }
});

// TST-1792051 · level: unit · module: MOD-job-catalogue
// guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY
// given: the same six prompts
// input: whether each still names the fields of its answer
// expect: derive-requirements names `name`, `rule`, `check` and `class`; change-requirements, whose draft is the new text of what it changes, `sections`, `proposals`, `path`, `text`, `groups` and `why`; the file kinds name `path`, `text` and `class`
test("a drafting kind's prompt still names the fields of its answer", async () => {
  const fields = { "derive-requirements": ["name", "rule", "check", "class"], "change-requirements": ["sections", "proposals", "path", "text", "groups", "why"] };
  for (const name of KINDS.requirement) {
    const { prompt } = await kindOf(name);
    for (const field of fields[name]) assert.ok(prompt.includes(`\`${field}\``), `${name}: ${field}`);
  }
  for (const name of [...KINDS["use case"], ...KINDS.architecture]) {
    const { prompt } = await kindOf(name);
    for (const field of ["path", "text", "class"]) assert.ok(prompt.includes(`\`${field}\``), `${name}: ${field}`);
  }
});

// TST-1792052 · level: unit · module: MOD-job-catalogue
// guards: THE PERSON WHO PROMPTS IS A SOURCE
// given: the kinds change-requirements and, as the known positive, derive-requirements, whose candidates name the passage of their source
// input: whether the prompt names `passage`, and whether the answer's schema of a candidate holds or requires it
// expect: derive-requirements names it and its schema requires it; change-requirements' prompt does not name it, and its schema holds no candidate and so no passage
test("change-requirements asks for no passage, and its answer's schema has none", async () => {
  const candidateOf = (kind) => kind.answer.properties.candidates.items;
  const derive = await kindOf("derive-requirements");
  assert.ok(derive.prompt.includes("`passage`") && candidateOf(derive).required.includes("passage"), "known positive: derive-requirements asks for it");
  const change = await kindOf("change-requirements");
  assert.ok(!change.prompt.includes("passage"), change.prompt);
  assert.ok(!("candidates" in change.answer.properties) && !JSON.stringify(change.answer).includes("passage"));
});
