// The built-in recipes `conversation` and `page` (ITM-485) — MOD-job-runner's table of built-in strategies as
// docs/architecture/MOD-job-runner.md states it: `conversation` — "the conversation so far, from the job's parameters, each message with who
// wrote it, as one part; none for the first message" — and `page` — "the page the person sees, as its route's subject gives it in the job's
// parameters (MOD-prompt-bar), as one part". For UC-049.
// Run: node --test tests/job-runner-conversation-recipes.test.mjs
//
// Module: MOD-job-runner
// Guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// Level: unit
//
// The recipes are reached as the prompt bar reaches them: prepareJob of the catalogue's kind `converse`, whose recipes name both. Its other
// recipe, `chapters-for-page?`, belongs to another module; this file registers a stand-in. The parameters are those MOD-prompt-bar's `Send`
// builds: `conversation`, the messages so far as `Message` gives them (`from`, `who`, `text`), and `page`, a text. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { prepareJob, registerStrategies } from "../src/job-runner/index.mjs";

const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };
try {
  registerStrategies("tests/job-runner-conversation-recipes.test.mjs", { recipes: { "chapters-for-page": async () => [] } });
} catch (error) {
  if (error.name !== "DuplicateStrategy") throw error;
}

const contextOf = (params) => ({ kind: null, params, product: { address: "https://github.com/alice/product", snapshot: null, host: null },
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
// expect: one part of the recipe page, named page, whose text is exactly that page; without a page, no part of that recipe
test("recipe page — the page as the route's subject gives it, as one part", async () => {
  const page = "# Requirements\nTHE CORRECTION LOOP HAS A FIXED LIMIT";
  const given = await partsOf({ page }, "page");
  assert.equal(given.length, 1);
  assert.deepEqual([given[0].name, given[0].text], ["page", page]);
  assert.deepEqual(await partsOf({}, "page"), []);
});
