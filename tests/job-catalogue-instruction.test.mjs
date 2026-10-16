// A handed-over task reaches the prompt of the work kinds (ITM-529) — MOD-job-catalogue's accepted table of kinds: `implement`,
// `refactor`, `write-tests` and `fix-bug` name the recipe `instruction?` first among their recipes; their prompts hold the named place
// `{{instruction}}`. The recipe itself is built into MOD-job-runner: the job's parameter `instruction` as one part, none without it.
// Run: node --test tests/job-catalogue-instruction.test.mjs
//
// Module: MOD-job-catalogue
// Guards: ONE DEFINITION, THREE DRIVERS
// Level: unit
//
// The strategies the four kinds name besides `instruction` and `draft` belong to other modules; this file registers a stand-in for each,
// giving no part and no finding. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { kindOf } from "../src/job-catalogue/index.mjs";
import { prepareJob, registerStrategies } from "../src/job-runner/index.mjs";

const WORK_KINDS = ["implement", "refactor", "write-tests", "fix-bug"];

const nothing = async () => [];
for (const [category, name] of [["preconditions", "rests-on-accepted"], ["recipes", "implementation-inputs"],
  ["recipes", "chapters-for-implementation"], ["recipes", "test-selection"], ["recipes", "chapters-for-tests"],
  ["recipes", "fix-inputs"], ["checks", "test-declarations"], ["checks", "test-proposals"], ["writers", "branch-and-pull-request"]]) {
  try {
    registerStrategies("tests/job-catalogue-instruction.test.mjs", { [category]: { [name]: nothing } });
  } catch (error) {
    if (error.name !== "DuplicateStrategy") throw error;
  }
}

const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["write to the repository", "run code and tests", "read the repository"], place: "this machine", route: "bridge lab-pc agent claude" };
const contextOf = (params) => ({ kind: null, params, product: { address: "https://github.com/alice/product", snapshot: null, host: null },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [DRAFTER], places: { sources: {}, mailbox: null }, gates: [],
  person: "alice", now: new Date("2026-10-16T08:00:00Z"), agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null });
const prepare = (kind, params) => prepareJob(kind, contextOf(params), { drafter: DRAFTER, reviewers: [] });

// TST-529001 · level: unit · module: MOD-job-catalogue
// guards: ONE DEFINITION, THREE DRIVERS
// given: the kinds implement, refactor, write-tests and fix-bug of the catalogue
// input: kindOf of each
// expect: `instruction` is the first recipe, optional; the recipes after it are, for implement implementation-inputs and chapters-for-implementation, for refactor implementation-inputs, for write-tests draft, test-selection and chapters-for-tests, for fix-bug fix-inputs and chapters-for-tests, none optional
test("kindOf — the four work kinds name the recipe instruction? first, then the recipes they named before", async () => {
  const expected = {
    implement: ["implementation-inputs", "chapters-for-implementation"],
    refactor: ["implementation-inputs"],
    "write-tests": ["draft", "test-selection", "chapters-for-tests"],
    "fix-bug": ["fix-inputs", "chapters-for-tests"],
  };
  assert.deepEqual(Object.keys(expected), WORK_KINDS, "known positive: the four kinds are those expected here");
  for (const name of WORK_KINDS) {
    assert.deepEqual((await kindOf(name)).recipes,
      [{ name: "instruction", optional: true }, ...expected[name].map((recipe) => ({ name: recipe, optional: false }))], name);
  }
});

// TST-529002 · level: unit · module: MOD-job-catalogue
// guards: ONE DEFINITION, THREE DRIVERS
// given: the prompts of implement, refactor, write-tests and fix-bug
// input: the prompt text of kindOf of each
// expect: the heading `## The task as the person gave it` stands exactly once, then one paragraph saying that the task, where one is given, is the work asked for, within what the inputs below allow, then the place `{{instruction}}`, which comes before the place of every other recipe
test("kindOf — each work kind's prompt holds {{instruction}} under its own heading, before the inputs", async () => {
  const heading = "## The task as the person gave it";
  for (const name of WORK_KINDS) {
    const { prompt } = await kindOf(name);
    assert.equal(prompt.split(heading).length, 2, `${name}: the heading once`);
    const after = prompt.slice(prompt.indexOf(heading) + heading.length);
    assert.match(after, /^\n\n[^\n]+\n\n\{\{instruction\}\}\n/, `${name}: one paragraph, then the place`);
    assert.match(after.split("{{instruction}}")[0], /task.*where one is given.*within what the inputs below allow/s, name);
    const others = [...prompt.matchAll(/\{\{(?!instruction\}\})[a-z-]+\}\}/g)].map((match) => match.index);
    assert.ok(others.length > 0 && Math.min(...others) > prompt.indexOf("{{instruction}}"), `${name}: before the inputs`);
  }
});

// TST-529003 · level: unit · module: MOD-job-catalogue
// guards: ONE DEFINITION, THREE DRIVERS
// given: a job of implement whose parameters hold instruction "Add a footer"; then the same job without the parameter, and with one of blanks
// input: prepareJob("implement", …)
// expect: with it, exactly one part of the recipe instruction, named instruction, whose text is "Add a footer"; without it or with blanks, no part of that recipe; in every case nothing is left out
test("prepareJob of implement — the handed-over task is the part instruction; without it there is none and nothing is left out", async () => {
  const given = await prepare("implement", { instruction: "Add a footer" });
  assert.deepEqual(given.parts.filter((part) => part.recipe === "instruction").map((part) => [part.name, part.text]),
    [["instruction", "Add a footer"]]);
  assert.deepEqual(given.leftOut, []);
  for (const params of [{}, { instruction: "   " }]) {
    const without = await prepare("implement", params);
    assert.deepEqual(without.parts.filter((part) => part.recipe === "instruction"), [], JSON.stringify(params));
    assert.deepEqual(without.leftOut, [], JSON.stringify(params));
  }
});
