// The kinds a conversation hands on for running code or tests take the handed-over task — MOD-job-catalogue's table of kinds, as
// docs/architecture/MOD-job-catalogue.md states it: `propose-tests`, `run-tests` and `check-resource` name the recipe `instruction?` first among their recipes,
// and their prompts hold the named place `{{instruction}}` under the heading `## The task as the person gave it`, as `implement`'s does — so that the task a
// hand-over carries reaches the prompt (UC-049 4a). The recipe itself is built into MOD-job-runner: the job's parameter `instruction` as one part.
// Run: node --test tests/job-catalogue-hand-over-instruction.test.mjs
//
// Module: MOD-job-catalogue
// Guards: UC-049; ONE DEFINITION, THREE DRIVERS
// Level: unit
//
// The strategies the three kinds name besides `instruction` belong to other modules; this file registers a stand-in for each, giving no part, no finding and
// writing nothing. The drafter is a stand-in driver that keeps the input it is sent and then fails, so that no answer is needed and nothing is written; the prompt
// it is sent is the one the runner composed. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { kindOf } from "../src/job-catalogue/index.mjs";
import { prepareJob, registerStrategies, runJob } from "../src/job-runner/index.mjs";

const KINDS = ["propose-tests", "run-tests", "check-resource"];
const TASK = "Run only the component level, token heron-8048";
const HEADING = "## The task as the person gave it";

const nothing = async () => [];
for (const [category, name] of [["preconditions", "rests-on-accepted"], ["recipes", "test-selection"], ["recipes", "chapters-for-tests"],
  ["recipes", "commit-and-levels"], ["recipes", "resource-pins"], ["recipes", "resource-check"], ["checks", "test-proposals"],
  ["writers", "result-record"]]) {
  const stand = category === "preconditions" ? async () => null : nothing;
  try {
    registerStrategies("tests/job-catalogue-hand-over-instruction.test.mjs", { [category]: { [name]: stand } });
  } catch (error) {
    if (error.name !== "DuplicateStrategy") throw error;
  }
}

const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["write to the repository", "run code and tests", "read the repository"], place: "this machine", route: "bridge lab-pc agent claude" };
const contextOf = (params) => ({ kind: null, params, product: { address: "https://github.com/alice/product", snapshot: null, host: null },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [DRAFTER], places: { sources: {}, mailbox: null }, gates: [],
  person: "alice", now: new Date("2026-10-27T15:29:00Z"), agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null });

// The prompt the runner sends the drafter of a job of `kind` with the parameters `params`: the first exchange's input, kept by a driver that then fails.
async function promptSent(kind, params) {
  const context = contextOf(params);
  const prepared = await prepareJob(kind, context, { drafter: DRAFTER, reviewers: [] });
  let sent = null;
  const driver = { participant: DRAFTER, send: async (input) => { sent = input; throw Object.assign(new Error("the stand-in drafter stops here"), { name: "Stopped" }); } };
  await assert.rejects(runJob(prepared, { drafter: driver, reviewers: [] }, { attended: false, context: { ...context, kind: prepared.kind } }), { name: "Stopped" });
  return sent.prompt;
}

// TST-8048003 · level: unit · module: MOD-job-catalogue
// guards: UC-049; ONE DEFINITION, THREE DRIVERS
// given: the kinds propose-tests, run-tests and check-resource of the catalogue
// input: kindOf of each
// expect: `instruction` is the first recipe, optional; the recipes after it are, for propose-tests test-selection and chapters-for-tests, for run-tests commit-and-levels and resource-pins, for check-resource resource-check, none optional
test("kindOf — propose-tests, run-tests and check-resource name the recipe instruction? first, then the recipes they named before", async () => {
  const expected = {
    "propose-tests": ["test-selection", "chapters-for-tests"],
    "run-tests": ["commit-and-levels", "resource-pins"],
    "check-resource": ["resource-check"],
  };
  assert.deepEqual(Object.keys(expected), KINDS);
  for (const name of KINDS) {
    assert.deepEqual((await kindOf(name)).recipes,
      [{ name: "instruction", optional: true }, ...expected[name].map((recipe) => ({ name: recipe, optional: false }))], name);
  }
});

// TST-8048004 · level: unit · module: MOD-job-catalogue
// guards: UC-049; ONE DEFINITION, THREE DRIVERS
// given: the prompts of propose-tests, run-tests and check-resource; known positive first — the prompt of implement
// input: the prompt text of kindOf of each
// expect: the text from the heading `## The task as the person gave it` up to and including the line `{{instruction}}` is the same as implement's, character for character; it stands once; the place `{{instruction}}` comes before the place of every other recipe
test("kindOf — each of the three prompts holds the slot {{instruction}} exactly as implement's prompt has it, before the inputs", async () => {
  const slotOf = (prompt) => {
    const start = prompt.indexOf(HEADING);
    return start < 0 ? null : prompt.slice(start, prompt.indexOf("{{instruction}}", start) + "{{instruction}}".length);
  };
  const slot = slotOf((await kindOf("implement")).prompt);
  assert.match(slot ?? "", /^## The task as the person gave it\n\n[^\n]+\n\n\{\{instruction\}\}$/, "known positive: implement's slot");
  for (const name of KINDS) {
    const { prompt } = await kindOf(name);
    assert.equal(slotOf(prompt), slot, `${name}: the slot as implement has it`);
    assert.equal(prompt.split(HEADING).length, 2, `${name}: the heading once`);
    const others = [...prompt.matchAll(/\{\{(?!instruction\}\})[a-z-]+\}\}/g)].map((match) => match.index);
    assert.ok(others.length > 0 && Math.min(...others) > prompt.indexOf("{{instruction}}"), `${name}: before the inputs`);
  }
});

// TST-8048005 · level: unit · module: MOD-job-catalogue
// guards: UC-049
// given: a job of each of propose-tests, run-tests and check-resource whose parameters hold the instruction "Run only the component level, token heron-8048"; and the same job without it
// input: prepareJob, then runJob with a stand-in drafter that keeps what it is sent
// expect: with the instruction, the prompt the drafter is sent holds the token heron-8048 exactly once, under the heading `## The task as the person gave it`; without it, the prompt holds no heron-8048 and `(none)` in that place — the search finds the token where it is, and only there
test("runJob — the task given to propose-tests, run-tests and check-resource is in the prompt their drafter is sent", async () => {
  for (const name of KINDS) {
    const given = await promptSent(name, { instruction: TASK });
    assert.equal(given.split("heron-8048").length - 1, 1, `${name}: the task once`);
    assert.ok(given.indexOf("heron-8048") > given.indexOf(HEADING), `${name}: under its heading`);
    const without = await promptSent(name, {});
    assert.equal(without.includes("heron-8048"), false, `${name}: no task without one`);
    assert.match(without.slice(without.indexOf(HEADING)), /^## The task as the person gave it\n\n[^\n]+\n\n\(none\)/, `${name}: (none) in its place`);
  }
});
