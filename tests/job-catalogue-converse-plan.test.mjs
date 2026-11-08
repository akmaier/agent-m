// A conversation plans the work it hands on (UC-049 4a, as accepted: "The endpoint or CLI session plans the work in the round that answers the message: it selects
// the pieces the request needs, each naming the kind, what it works on and the task in its words, and, for a piece that rests on the result of an earlier one — a use
// case on the requirements it realises, an architecture on the use cases it serves —, that earlier piece"). As docs/architecture/MOD-job-catalogue.md states it:
// converse's draft "may hold, beside `answer` and `edits`, a `handOver`, the plan: a list of the tool's arguments, `{ kind, works_on, task, after }`, stated once in its
// answer schema, … its prompt asks it to plan in the round that answers the message — the pieces the request needs, the requirements before the use cases that realise
// them and those before the architecture, each with what it rests on —"; and the tools' table: `hand-over` — "add one piece to the plan of the work: … naming what it works
// on, the task in its words, and the earlier pieces whose accepted result it rests on". No limit on the number of pieces stands in the accepted text.
// Run: node --test tests/job-catalogue-converse-plan.test.mjs
//
// Module: MOD-job-catalogue
// Guards: UC-049; ONE DEFINITION, THREE DRIVERS
// Level: unit
//
// The catalogue is read as every caller reads it, through its index.mjs. Each test states its input and its expected result before it runs (given / input / expect).
// Counter-proof: on the catalogue as it stood before this change — `handOver` one object `{ kind, works_on, task }`, the prompt asking to hand work on "once" —, each test fails.

import test from "node:test";
import assert from "node:assert/strict";
import { kindOf, toolsOf } from "../src/job-catalogue/index.mjs";

// TST-2026114901 · level: unit · module: MOD-job-catalogue
// given: the catalogue as shipped
// input: kindOf("converse").answer
// expect: `handOver` is a list — no maxItems — whose items are objects with the properties kind (text), works_on (a list of texts), task (text) and after (a list of
//   numbers), all four required; `answer` stays the one required key of the answer
test("TST-2026114901: converse's answer schema holds the plan, a list of { kind, works_on, task, after }, without a limit", async () => {
  const { answer } = await kindOf("converse");
  assert.deepEqual(answer.required, ["answer"]);
  const plan = answer.properties.handOver;
  assert.equal(plan.type, "array", "handOver is a list");
  assert.equal(plan.maxItems, undefined, "no limit on the number of pieces");
  assert.equal(plan.items.type, "object");
  assert.deepEqual(Object.keys(plan.items.properties).sort(), ["after", "kind", "task", "works_on"]);
  assert.equal(plan.items.properties.kind.type, "string");
  assert.equal(plan.items.properties.task.type, "string");
  assert.equal(plan.items.properties.works_on.type, "array");
  assert.equal(plan.items.properties.works_on.items.type, "string");
  assert.equal(plan.items.properties.after.type, "array");
  assert.equal(plan.items.properties.after.items.type, "number");
  assert.deepEqual([...plan.items.required].sort(), ["after", "kind", "task", "works_on"]);
});

// TST-2026114902 · level: unit · module: MOD-job-catalogue
// given: the catalogue as shipped
// input: toolsOf(["hand-over"])
// expect: its input schema is that of one piece — kind, works_on, task and after, after a list of numbers, all four required —; its description says that it adds one
//   piece to the plan and names `after`, the earlier pieces whose accepted result it rests on
test("TST-2026114902: the tool hand-over adds one piece of the plan, with after", async () => {
  const [tool] = await toolsOf(["hand-over"]);
  assert.deepEqual(Object.keys(tool.input.properties).sort(), ["after", "kind", "task", "works_on"]);
  assert.equal(tool.input.properties.after.type, "array");
  assert.equal(tool.input.properties.after.items.type, "number");
  assert.deepEqual([...tool.input.required].sort(), ["after", "kind", "task", "works_on"]);
  assert.match(tool.description, /one piece/);
  assert.match(tool.description, /`after`/);
  assert.match(tool.description, /accepted result it rests on/);
});

// TST-2026114903 · level: unit · module: MOD-job-catalogue
// given: the prompt of converse, as kindOf reads it
// input: none
// expect: it asks the participant to plan the work in the answer — the pieces the message needs, the requirements before the use cases that realise them, those before
//   the architecture, each piece naming in `after` the earlier pieces it rests on —; it names `handOver` as a list in the answer's form with `after`; it sets no limit on
//   the pieces and no longer asks to hand work on "once"
test("TST-2026114903: converse's prompt asks for a plan of pieces in their order, each with what it rests on, and sets no limit", async () => {
  const prompt = (await kindOf("converse")).prompt.replace(/\s+/g, " ");
  assert.match(prompt, /[Pp]lan/);
  assert.match(prompt, /the pieces the message needs/);
  assert.match(prompt, /the requirements before the use cases that realise them, and those before the architecture/);
  assert.match(prompt, /"after": \[/);
  assert.match(prompt, /`after`/);
  assert.doesNotMatch(prompt, /at most \w+ pieces/);
  assert.doesNotMatch(prompt, /\bonce, with the tool\b/);
});
