// A message of the prompt bar reaches the model with Agent M's AGENTS.md first — MOD-prompt-bar's message, prepared with prepareMessage
// (src/prompt-bar/send.mjs) and run by MOD-job-runner, sent to a model endpoint by MOD-endpoint-calls' endpointDriver in the execution loop. The proposed
// requirement EVERY MODEL READS AGENT M'S AGENTS.MD FIRST (docs/spec-freigaben/2026-10-25_every-model-reads-agents-md-first/01-process-execution-and-jobs.md):
// "The input Agent M sends to a language model — with a job, or with a message of the prompt bar — begins with Agent M's own `AGENTS.md`, the one at the
// root of the instance repository, in full, whatever repository the job or the page works on".
// Run: node --test tests/prompt-bar-agents-first.test.mjs
//
// Module: MOD-prompt-bar
// Guards: EVERY MODEL READS AGENT M'S AGENTS.MD FIRST
// Level: unit
//
// The instance and the product are fixtures in memory behind hosts that only give their default branch, each with an AGENTS.md of its own text. The
// endpoint's requests are a fake `exchange` (endpointDriver's third argument) that records the messages of each request and answers with no tool call;
// nothing reaches the network. Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded
// in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { prepareMessage } from "../src/prompt-bar/send.mjs";
import { estimate, registerStrategies, runJob } from "../src/job-runner/index.mjs";
import { endpointDriver } from "../src/endpoint-calls/index.mjs";
import { freshStore } from "./settings-pages-setup.d/dom.mjs";

// The strategy of another module that the kind `converse` names.
try {
  registerStrategies("tests/prompt-bar-agents-first.test.mjs", { recipes: { "chapters-for-page": async () => [] } });
} catch (error) {
  if (error.name !== "DuplicateStrategy") throw error;
}

const INSTANCE_RULES = "# AGENTS.md — the instance's rules\n\nINSTANCE-RULES-TEXT: read the SPEC first.\n";
const PRODUCT_RULES = "# AGENTS.md — the product's rules\n\nPRODUCT-RULES-TEXT.\n";
const snapshotOf = (path, files) => ({ repository: { server: "github", origin: "https://github.com", path, web: `https://github.com/${path}` }, ref: "main",
  commit: "c".repeat(40), paths: Object.keys(files), blob: () => null, read: async (name) => files[name] ?? null });
const hostOf = (snapshot) => ({ repositoryInfo: async () => ({ defaultBranch: "main" }), readSnapshot: async () => snapshot });
const INSTANCE = snapshotOf("acme/instance", { "AGENTS.md": INSTANCE_RULES, "docs/participants.md": "# Participants\n" });
const PRODUCT = snapshotOf("acme/product", { "AGENTS.md": PRODUCT_RULES });
const PARTICIPANT = { name: "tooler", type: "model endpoint", model: "gpt-oss", context: 100000, capabilities: ["draft text", "read the repository", "use tools"],
  place: "this machine", route: "endpoint e1" };
const subject = { kind: "converse", entry: "settings", refuses: [], paramsFor: () => ({ page: "a page" }) };

// The messages of every request the endpoint receives for one message of the bar, on the page of `product` (null: a page of the instance).
async function requestsFor(product) {
  const ready = await prepareMessage({ subject, participant: PARTICIPANT, instruction: "PERSON-WORDS", conversation: "", store: freshStore("acme/instance"),
    instance: { host: hostOf(INSTANCE) }, product: product ? { address: product.repository.web, host: hostOf(product) } : null });
  const requests = [];
  const exchange = async (config, { messages }) => {
    requests.push(messages.map((message) => ({ role: message.role, text: message.text })));
    return { text: "not JSON", calls: [], usage: null };
  };
  const driver = endpointDriver({ name: "e1", kind: "openai-compatible", baseUrl: "http://localhost:1", model: "gpt-oss", key: null }, PARTICIPANT, exchange);
  await runJob(ready.prepared, { drafter: driver, reviewers: [] }, { attended: true, context: ready.context });
  return { ready, requests };
}

// TST-1350011 · level: unit · module: MOD-prompt-bar
// guards: EVERY MODEL READS AGENT M'S AGENTS.MD FIRST
// given: a message on the page of a product whose repository has an AGENTS.md of its own; the instance's AGENTS.md another text; an endpoint that calls tools
// input: prepareMessage, then runJob through endpointDriver's execution loop with a recording exchange
// expect: the first request has one message, from the user, whose text begins with the instance's AGENTS.md in full and holds the person's words after it; the product's AGENTS.md is not in it
test("a message on a product's page reaches the endpoint with the instance's AGENTS.md first", async () => {
  const { requests } = await requestsFor(PRODUCT);
  assert.ok(requests.length >= 1, "the endpoint was asked");
  const [first] = requests[0];
  assert.equal(first.role, "user");
  assert.ok(first.text.startsWith(INSTANCE_RULES), first.text.slice(0, 120));
  assert.ok(first.text.indexOf("PERSON-WORDS") > INSTANCE_RULES.length, "known positive: the person's words follow the file");
  assert.ok(!first.text.includes("PRODUCT-RULES-TEXT"), "the product's file is not given in its place");
});

// TST-1350012 · level: unit · module: MOD-prompt-bar
// guards: EVERY MODEL READS AGENT M'S AGENTS.MD FIRST
// given: a message on a page of the instance
// input: prepareMessage, then runJob through endpointDriver's execution loop
// expect: the first request's user message begins with the instance's AGENTS.md; the prepared destination counts its size
test("a message on the instance's page reaches the endpoint with the instance's AGENTS.md first, counted in its size", async () => {
  const { ready, requests } = await requestsFor(null);
  assert.ok(requests[0][0].text.startsWith(INSTANCE_RULES));
  assert.ok(ready.prepared.destinations[0].size >= estimate(INSTANCE_RULES) + estimate(ready.prepared.kind.prompt));
});
