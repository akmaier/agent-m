// The built-in recipes `conversation` and `page` (ITM-485) — MOD-job-runner's table of built-in strategies as
// docs/architecture/MOD-job-runner.md states it: `conversation` — "the conversation so far, from the job's parameters, each message with who
// wrote it, as one part; none for the first message" — and `page` — "the page the person sees, as its route's subject gives it in the job's
// parameters (MOD-prompt-bar), as one part; for a job whose parameters hold no `page` — one run from its record, which holds no page text (UC-049 4a.3, 4f) —, the repository it
// works on instead: the context's `product.address` and the commit of its `snapshot`, the files `list-files`, `read-file` and `search-files` read, as one part". For UC-049.
// Run: node --test tests/job-runner-conversation-recipes.test.mjs
//
// Module: MOD-job-runner
// Guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// Level: unit
//
// The recipes are reached as the prompt bar reaches them: prepareJob of the catalogue's kind `converse`, whose recipes name both. Its other
// recipe, `chapters-for-page?`, and its check `plan-works-on` belong to other modules; this file registers a stand-in for each. The parameters are those MOD-prompt-bar's `Send`
// builds: `conversation`, the messages so far as `Message` gives them (`from`, `who`, `text`), and `page`, a text. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { prepareJob, registerStrategies } from "../src/job-runner/index.mjs";

const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };
try {
  registerStrategies("tests/job-runner-conversation-recipes.test.mjs", { recipes: { "chapters-for-page": async () => [] }, checks: { "plan-works-on": () => [] } });
} catch (error) {
  if (error.name !== "DuplicateStrategy") throw error;
}

const COMMIT = "c".repeat(40);
const contextOf = (params) => ({ kind: null, params, product: { address: "https://github.com/alice/product", snapshot: { commit: COMMIT }, host: null },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [DRAFTER], places: { sources: {}, mailbox: null }, gates: [],
  person: "alice", now: new Date("2026-10-15T08:00:00Z"), agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null });
const partsOf = async (params, recipe) => (await prepareJob("converse", contextOf(params), { drafter: DRAFTER, reviewers: [] }))
  .parts.filter((each) => each.recipe === recipe);

const MESSAGES = [
  { at: new Date("2026-10-15T07:58:00Z"), from: "person", who: "alice", text: "Which requirement names the limit?", subject: "SPEC" },
  { at: new Date("2026-10-15T07:59:00Z"), from: "participant", who: "drafter-a", text: "THE CORRECTION LOOP HAS A FIXED LIMIT.", subject: "SPEC" },
];

// TST-590101 · level: unit · module: MOD-job-runner
// guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: the kind converse; a job whose parameters hold a conversation of two messages — alice's question, drafter-a's answer —; then the same job with an empty conversation (the first message)
// input: prepareJob("converse", …)
// expect: one part of the recipe conversation, named conversation, whose text holds each message's author and words, alice's before drafter-a's; for the empty conversation, no part of that recipe
test("recipe conversation — the conversation so far as one part, each message with who wrote it, none for a first message", async () => {
  const given = await partsOf({ conversation: MESSAGES }, "conversation");
  assert.equal(given.length, 1);
  assert.equal(given[0].name, "conversation");
  const text = given[0].text;
  for (const message of MESSAGES) assert.ok(text.includes(message.who) && text.includes(message.text), message.who);
  assert.ok(text.indexOf("alice") < text.indexOf("drafter-a"), "in the order of the conversation");
  assert.deepEqual(await partsOf({ conversation: [] }, "conversation"), []);
  assert.deepEqual(await partsOf({}, "conversation"), []);
});

// TST-590102 · level: unit · module: MOD-job-runner
// guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: the kind converse; a job whose parameters hold the page "# Requirements\nTHE CORRECTION LOOP HAS A FIXED LIMIT"; then the same job without a page
// input: prepareJob("converse", …)
// expect: one part of the recipe page, named page, whose text is exactly that page
test("recipe page — the page as the route's subject gives it, as one part", async () => {
  const page = "# Requirements\nTHE CORRECTION LOOP HAS A FIXED LIMIT";
  const given = await partsOf({ page }, "page");
  assert.equal(given.length, 1);
  assert.deepEqual([given[0].name, given[0].text], ["page", page]);
});

// TST-590103 · level: unit · module: MOD-job-runner
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: the kind converse; a job whose parameters hold no page — one run from its record —, its context's product https://github.com/alice/product at the commit cccc…c; then a page of blanks
// input: prepareJob("converse", …)
// expect: one part of the recipe page, named page, whose text names the address, the whole commit and the tools list-files, read-file and search-files; the page of blanks the same
// counter-proof: before this change, the recipe gave no part without a page, and the test fails at the count
test("TST-590103: recipe page — without a page, the repository the job works on, its address and commit, as one part", async () => {
  for (const params of [{}, { page: "  " }]) {
    const given = await partsOf(params, "page");
    assert.equal(given.length, 1, JSON.stringify(params));
    assert.equal(given[0].name, "page");
    for (const named of ["https://github.com/alice/product", COMMIT, "list-files", "read-file", "search-files"]) assert.ok(given[0].text.includes(named), named);
  }
});
