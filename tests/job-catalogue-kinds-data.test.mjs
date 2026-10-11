// The kinds' data files follow the catalogue's table (ITM-396) — MOD-job-catalogue's table of kinds, column "Draft it expects", and the sentence
// under it on `change-requirements`, as the accepted text of docs/architecture/MOD-job-catalogue.md states them, against the data files of
// the three kinds: `derive-requirements`' candidates name, for a candidate, "the source of a rule it points to, where that is not the job's";
// `change-requirements` has "the same" draft and "takes as its parameter `source` the own source of the person who starts it"; `propose-groups`
// returns "moves, each a `GroupMove` of MOD-group-document". For UC-005 5a, UC-019 step 6, UC-021 1b.
// Run: node --test tests/job-catalogue-kinds-data.test.mjs
//
// Module: MOD-job-catalogue
// Guards: ONE DEFINITION, THREE DRIVERS; THE PERSON WHO PROMPTS IS A SOURCE; THE CATALOGUE IS DATA
// Level: unit
//
// The module file names no key for the source of a rule a candidate points to; these tests take `source`, an optional text beside `of`. It has
// no key of a definition for a job's parameter, so the parameter is read from the kind's purpose, the one free text of its definition. A
// GroupMove is read from MOD-group-document's file (its six operations and their fields); a draft's schema has five keywords only (type,
// properties, required, items, enum), so one object holds the six forms and says which fields can occur; which fields an operation needs is
// applyMoves' to refuse. A draft is checked against a schema by `fits` below, which reads those five keywords as the job runner does: a property
// that is not required may be left out. Each test states its input and its expected result before it runs (given / input / expect); where a test
// asserts a refusal, the same call is first shown to succeed. Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { kindOf } from "../src/job-catalogue/index.mjs";

const read = (relative) => readFileSync(new URL(relative, import.meta.url), "utf8");
const CATALOGUE = read("../docs/architecture/MOD-job-catalogue.md");
const GROUPS = read("../docs/architecture/MOD-group-document.md");

// The row of the table of kinds that a kind has, and its last cell.
const rowOf = (name) => CATALOGUE.split("\n").find((line) => line.startsWith(`| \`${name}\` |`));
const expects = (name) => rowOf(name).split("|").slice(1, -1).at(-1).trim();

// Why a value does not fit a schema of the five keywords, or null.
function fits(value, schema, at = "draft") {
  if (schema.type === "object") {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return `${at} is not an object`;
    for (const key of schema.required ?? []) if (value[key] === undefined || value[key] === null) return `${at} has no ${key}`;
    for (const [key, property] of Object.entries(schema.properties ?? {})) {
      if (value[key] === undefined || value[key] === null) continue;
      const why = fits(value[key], property, `${at}.${key}`);
      if (why) return why;
    }
    return null;
  }
  if (schema.type === "array") {
    if (!Array.isArray(value)) return `${at} is not a list`;
    for (const [index, item] of value.entries()) {
      const why = fits(item, schema.items, `${at}[${index}]`);
      if (why) return why;
    }
    return null;
  }
  if (schema.type === "string") {
    if (typeof value !== "string") return `${at} is not a text`;
    return schema.enum && !schema.enum.includes(value) ? `${at} is not one of ${schema.enum.join(", ")}` : null;
  }
  return `${at} has a type this check does not know`;
}

const CANDIDATE = { name: "A THING IS DONE", rule: "A thing is done.", check: "A test does it.", constrains: "product", passage: "§ 3", class: "new" };

// guards: ONE DEFINITION, THREE DRIVERS; UC-005 5a
// given: the table's cell "Draft it expects" of `derive-requirements`, which adds to a candidate's name, rule, check, what it constrains, source
//        passage and class "the source of a rule it points to, where that is not the job's"; and the draft's schema of the kind
// input: kindOf("derive-requirements").answer; candidates without and with a `source`, and with a `source` that is not a text
// expect: the candidate keeps its seven fields, the six required as before, and `source` is a text that may be left out; a candidate naming a
//         source is accepted and one without is too; a source that is a number is refused
test("derive-requirements — a candidate may name the source of the rule it points to", async () => {
  assert.match(expects("derive-requirements"), /source of a rule it points to, where that is not the job's/, "known positive: the table's cell is read");
  const { answer } = await kindOf("derive-requirements");
  const candidate = answer.properties.candidates.items;
  assert.deepEqual(Object.keys(candidate.properties).sort(), ["check", "class", "constrains", "name", "of", "passage", "rule", "source"]);
  assert.equal(candidate.properties.source.type, "string");
  assert.deepEqual(candidate.required, ["name", "rule", "check", "constrains", "passage", "class"]);
  assert.equal(fits({ candidates: [CANDIDATE] }, answer), null, "known positive: a candidate without a source");
  assert.equal(fits({ candidates: [{ ...CANDIDATE, source: "SRC-iec-62304, 5.1" }] }, answer), null);
  assert.match(fits({ candidates: [{ ...CANDIDATE, source: 7 }] }, answer), /source is not a text/);
});

// guards: ONE DEFINITION, THREE DRIVERS; THE PERSON WHO PROMPTS IS A SOURCE; UC-019 step 6
// given: the table's cell "Draft it expects" of `change-requirements`, "the same"; and the sentence under the table, "A job of `change-requirements`
//        takes as its parameter `source` the own source of the person who starts it"
// input: the draft's schema of both kinds; the purpose of both kinds
// expect: the two schemas equal; the purpose of `change-requirements` names the parameter `source` as the own source of the person who starts
//         the job; the purpose of `derive-requirements` names no such parameter
test("change-requirements — the same candidates as a derivation, and the parameter source is the own source of the person who starts it", async () => {
  assert.equal(expects("change-requirements"), "the same");
  assert.match(CATALOGUE, /A job of `change-requirements` takes as its parameter `source` the own source of the person who starts it/);
  const [derive, change] = [await kindOf("derive-requirements"), await kindOf("change-requirements")];
  assert.deepEqual(change.answer, derive.answer);
  assert.match(change.purpose, /parameter `source`/);
  assert.match(change.purpose, /own source of the person who starts it/);
  assert.doesNotMatch(derive.purpose, /parameter `source`/);
});

// The six operations of GroupMove, as MOD-group-document's file lists them.
const OPERATIONS = [...GROUPS.match(/- `GroupMove` —[\s\S]*?(?=\n- `Hierarchy`)/)[0].matchAll(/\{ op: "([a-z-]+)"/g)].map((m) => m[1]);

// guards: ONE DEFINITION, THREE DRIVERS; UC-021 1b
// given: the table's cell "Draft it expects" of `propose-groups`, "moves, each a `GroupMove` of MOD-group-document"; MOD-group-document's six forms
// input: kindOf("propose-groups").answer; one move of each form, and the old shape { item, group }
// expect: the six operations read from MOD-group-document are create, rename, move, move-group, delete and lift; a list of `moves` is the draft;
//         a move is an object that requires `op`, an enum of exactly these operations, with the texts title, item and the lists of texts in, group,
//         to; a move of each form is accepted, and so is the empty list
test("propose-groups — the draft is a list of GroupMoves of MOD-group-document", async () => {
  assert.match(expects("propose-groups"), /moves, each a `GroupMove` of MOD-group-document/, "known positive: the table's cell is read");
  assert.deepEqual(OPERATIONS, ["create", "rename", "move", "move-group", "delete", "lift"]);
  const { answer } = await kindOf("propose-groups");
  assert.deepEqual(answer.required, ["moves"]);
  const move = answer.properties.moves.items;
  assert.equal(move.type, "object");
  assert.deepEqual(move.required, ["op"]);
  assert.deepEqual(move.properties.op.enum, OPERATIONS);
  assert.deepEqual(Object.fromEntries(Object.entries(move.properties).filter(([key]) => key !== "op").map(([key, p]) => [key, p.type === "array" ? `${p.items.type}s` : p.type])),
    { title: "string", item: "string", in: "strings", group: "strings", to: "strings" });
  for (const each of [{ op: "create", title: "Safety", in: ["Requirements"] }, { op: "rename", group: ["Safety"], title: "Hazards" },
    { op: "move", item: "A THING IS DONE", to: ["Safety", "Alarms"] }, { op: "move-group", group: ["Alarms"], to: ["Safety"] },
    { op: "delete", group: ["Old"] }, { op: "lift", group: ["Safety"] }]) {
    assert.equal(fits({ moves: [each] }, answer), null, each.op);
  }
  assert.equal(fits({ moves: [] }, answer), null);
});

// guards: ONE DEFINITION, THREE DRIVERS; UC-021 1b
// given: the draft's schema of `propose-groups`; the answers the kind gave before — moves of the form { item, group } with the group as a text —,
//        and answers that are no GroupMove
// input: fits of each against the schema; a known positive first
// expect: the known positive is accepted; { item, group: "Safety / Alarms" } is refused for want of `op`; the same with an `op` and `group` as a
//         text is refused as not a list; an operation outside the six, `to` as a text, a move that is not an object and a missing `moves` are
//         refused
test("propose-groups — an answer of { item, group } is refused, and so is anything that is no GroupMove", async () => {
  const { answer } = await kindOf("propose-groups");
  assert.equal(fits({ moves: [{ op: "move", item: "R", to: ["Safety"] }] }, answer), null, "known positive");
  assert.match(fits({ moves: [{ item: "R", group: "Safety / Alarms" }] }, answer), /has no op/);
  assert.match(fits({ moves: [{ op: "move", item: "R", group: "Safety / Alarms" }] }, answer), /group is not a list/);
  assert.match(fits({ moves: [{ op: "shuffle", item: "R" }] }, answer), /op is not one of/);
  assert.match(fits({ moves: [{ op: "move", item: "R", to: "Safety" }] }, answer), /to is not a list/);
  assert.match(fits({ moves: ["R"] }, answer), /is not an object/);
  assert.match(fits({}, answer), /has no moves/);
});

// guards: ONE DEFINITION, THREE DRIVERS; UC-021 1b
// given: the prompt of `propose-groups`, which tells the participant what to return
// input: kindOf("propose-groups").prompt
// expect: it lists each of the six operations, one line each, and no longer asks for a move as an item with the titles of its group joined by ` / `
test("propose-groups — the prompt asks for GroupMoves, not for items with a group written as one text", async () => {
  const { prompt } = await kindOf("propose-groups");
  for (const op of OPERATIONS) assert.ok(prompt.includes(`\n- \`${op}\` `), `the prompt lists ${op} with what it does`);
  assert.ok(!prompt.includes("separated by ` / `"), "the group is no longer one text of titles joined by a slash");
});
