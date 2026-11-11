// The prompts and answers of the kinds whose writer is `branch-and-pull-request`, as docs/architecture/MOD-job-catalogue.md states them: "The prompts of the
// kinds whose writer is `branch-and-pull-request` — `implement`, `refactor`, `fix-bug` and `write-tests` — say the work, not the route it runs on. In
// `implement` and `fix-bug`, the job's first commit holds only its tests and is pushed before any code is written (`AN IMPLEMENTATION JOB BEGINS WITH A
// FAILING TEST`); in `refactor`, every commit pushed keeps the tests green (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`); and *red* and *green* are the
// product's CI run on the commit pushed, never a run of the agent's own, which it may make as often as it likes but which decides nothing. The agent pushes
// its branch and opens its pull request, follows its CI and merges it once the Definition of Done holds, as the description of its route says — a Bridge's
// relay (MOD-bridge-jobs) —; where its route offers none of this, the writer opens the pull request. The answer reports the branch and its commits, and for
// `write-tests` its tests, but no pull request: the writer takes that from the host. [...] no prompt asks the agent to write it." and its table ("the agent's
// report: branch, commits").
// Run: node --test tests/job-catalogue-branch-kinds.test.mjs
//
// Module: MOD-job-catalogue
// Guards: AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST; A REFACTORING JOB BEGINS WITHOUT A FAILING TEST; A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS; ONE DEFINITION, THREE DRIVERS
// Level: unit
//
// Readings the text leaves open, which the tests state: "says the work, not the route" is read as: no prompt names a Bridge, its relay, an outbox or the
// folders of its requests and answers — those are what relay.md tells the agent (MOD-bridge-jobs). A prompt's sentences are compared with whitespace folded.

import test from "node:test";
import assert from "node:assert/strict";
import { kindOf } from "../src/job-catalogue/index.mjs";

const KINDS = ["implement", "refactor", "fix-bug", "write-tests"];
const folded = (text) => text.replace(/\s+/g, " ");

// TST-2026111601 · level: unit · module: MOD-job-catalogue
// guards: A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS; ONE DEFINITION, THREE DRIVERS
// given: the catalogue's kinds implement, refactor, fix-bug and write-tests, each with the writer branch-and-pull-request
// input: kindOf(name) for each
// expect: each answer schema requires `branch` and `commits` — write-tests also `tests` — and neither requires nor declares `pullRequest`; no prompt asks to report a `pullRequest`; counter-proof: the prompt still names `branch` and `commits` as the fields of its answer
test("TST-2026111601: the coding kinds' answers report the branch and its commits, and no pull request", async () => {
  for (const name of KINDS) {
    const kind = await kindOf(name);
    assert.equal(kind.writer, "branch-and-pull-request", `${name}: known positive — the kind's writer`);
    assert.deepEqual(kind.answer.required, name === "write-tests" ? ["branch", "commits", "tests"] : ["branch", "commits"], `${name}: what the answer requires`);
    assert.equal(Object.hasOwn(kind.answer.properties, "pullRequest"), false, `${name}: the answer declares no pull request`);
    assert.equal(kind.prompt.includes("pullRequest"), false, `${name}: the prompt asks for no pull request`);
    assert.ok(kind.prompt.includes("`branch`") && kind.prompt.includes("`commits`"), `${name}: counter-proof — the prompt names the branch and its commits`);
  }
});

// TST-2026111602 · level: unit · module: MOD-job-catalogue
// guards: AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST; A REFACTORING JOB BEGINS WITHOUT A FAILING TEST; A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
// given: the prompts of implement, refactor, fix-bug and write-tests
// input: kindOf(name).prompt for each, whitespace folded
// expect: implement and fix-bug say that the first commit holds only the tests and is pushed before any code is written; refactor that every commit pushed keeps the tests green; every one that red and green are the product's CI run on the commit pushed, never a run of the agent's own, which decides nothing; that the agent pushes its branch, opens its pull request, follows its CI and merges it once the Definition of Done holds, as the description of where it works says, and that otherwise the pull request is opened for it; none names a Bridge, a relay or an outbox, and none asks the agent to write the CI; counter-proof: implement's prompt does not say what refactor's says of every commit, nor refactor's what implement's says of the first
test("TST-2026111602: the coding kinds' prompts say red and green are the product's CI run, and that the agent pushes, opens, follows and merges as its route says", async () => {
  const prompts = Object.fromEntries(await Promise.all(KINDS.map(async (name) => [name, folded((await kindOf(name)).prompt)])));
  const FIRST = "Your first commit holds only the tests, and you push it before you write any code";
  const EVERY = "Every commit you push keeps the tests green";
  for (const name of ["implement", "fix-bug"]) assert.ok(prompts[name].includes(FIRST), `${name}: the first commit holds only the tests and is pushed first`);
  assert.ok(prompts.refactor.includes(EVERY), "refactor: every commit pushed keeps the tests green");
  assert.equal(prompts.implement.includes(EVERY), false, "counter-proof: implement says nothing of every commit");
  assert.equal(prompts.refactor.includes(FIRST), false, "counter-proof: refactor says nothing of a tests-only first commit");
  for (const name of KINDS) {
    const prompt = prompts[name];
    assert.ok(prompt.includes("Red and green are the product's CI run on the commit you pushed, never a run of your own, which you may make as often as you like but which decides nothing."),
      `${name}: red and green are the product's CI run`);
    assert.ok(prompt.includes("Push your branch, open its pull request, follow its CI and merge it once the Definition of Done holds, as the description of where you work says;"),
      `${name}: the agent pushes, opens, follows and merges as its route says`);
    assert.ok(prompt.includes("where that description offers none of this, push your branch, and the pull request is opened for you."), `${name}: otherwise the writer opens it`);
    assert.equal(/\b(Bridge|relay|outbox)\b/i.test(prompt), false, `${name}: the prompt says the work, not the route`);
    assert.equal(/(write|set up|create) (the |a )?(CI|workflow)/i.test(prompt), false, `${name}: no prompt asks the agent to write the CI`);
  }
});
