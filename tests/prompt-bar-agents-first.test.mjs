// A message of the prompt bar reaches the model with Agent M's AGENTS.md first — MOD-prompt-bar's message, prepared with prepareMessage
// (src/prompt-bar/send.mjs) and run by MOD-job-runner, sent to a model endpoint by MOD-endpoint-calls' endpointDriver in the execution loop. The proposed
// requirement EVERY MODEL READS AGENT M'S AGENTS.MD FIRST (docs/spec-freigaben/2026-10-25_every-model-reads-agents-md-first/01-process-execution-and-jobs.md):
// "The input Agent M sends to a language model — with a job, or with a message of the prompt bar — begins with Agent M's own `AGENTS.md`, the one at the
// root of the instance repository, in full, whatever repository the job or the page works on".
// Run: node --test tests/prompt-bar-agents-first.test.mjs
//
// Module: MOD-prompt-bar
// Guards: EVERY MODEL READS AGENT M'S AGENTS.MD FIRST; A CLI SESSION IS TOLD AGAIN EVERY FIFTH MESSAGE TO READ AGENTS.MD; UC-049
// Level: unit
//
// The instance and the product are fixtures in memory behind hosts that only give their default branch, each with an AGENTS.md of its own text. The
// endpoint's requests are a fake `exchange` (endpointDriver's third argument) that records the messages of each request and answers with no tool call;
// nothing reaches the network. Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded
// in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { prepareMessage, runSession } from "../src/prompt-bar/send.mjs";
import { writeSetting } from "../src/browser-store/index.mjs";
import { estimate, registerStrategies, runJob } from "../src/job-runner/index.mjs";
import { routeStrategies } from "../src/runtimes/index.mjs";
import { endpointDriver } from "../src/endpoint-calls/index.mjs";
import { freshStore } from "./settings-pages-setup.d/dom.mjs";

// The strategy of another module that the kind `converse` names.
try {
  registerStrategies("tests/prompt-bar-agents-first.test.mjs", { checks: routeStrategies.checks, recipes: { "chapters-for-page": async () => [] } });
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

// ---------------------------------------------------------------- a CLI session of the prompt bar (UC-049 step 4; ARC-055)

// TST-20261112611 · level: unit · module: MOD-prompt-bar
// guards: EVERY MODEL READS AGENT M'S AGENTS.MD FIRST; A CLI SESSION IS TOLD AGAIN EVERY FIFTH MESSAGE TO READ AGENTS.MD; UC-049
// given: a message to the CLI session mac:opencode on a page of the instance, whose chapters for the page are the part "09_system-modeling.md — SRC-vibe-coding 2026-10-05, version hash abc123" with the chapter's text CHAPTER-TEXT; this browser keeps the Bridge mac, behind a fake fetch that answers every message done with "ok", the first starting the session JOB-1
// input: runSession eleven times, each with the session the previous one kept
// expect: the first, the sixth and the eleventh input begin with the instruction that the agent must read, in full, `../../AGENTS.md` and `../../docs/sources/SRC-vibe-coding/2026-10-05/09_system-modeling.md` — the instance's AGENTS.md and the chapter in the Bridge's clone of the instance, from the session's checkout —; the sixth and the eleventh also say that they need not be read again while still in the agent's context, the first does not; the others carry no instruction and name neither file; no input gives the AGENTS.md's text or the chapter's; the first gives the conversation so far, the others do not; the session kept counts the messages sent to it; counter-proof: a sixth message without the instruction fails this test
test("TST-20261112611: the message that starts a CLI session and every fifth after it tell the agent to read AGENTS.md and the chapters by their paths", async () => {
  const store = freshStore("acme/instance");
  writeSetting(store, "bridge:mac", { address: "http://127.0.0.1:7777", token: "token-mac" });
  const SESSION = { name: "mac:opencode", type: "CLI agent", model: "model-opencode", context: 200000, capabilities: ["draft text"], place: "this machine", route: "bridge mac agent opencode" };
  const ready = await prepareMessage({ subject, participant: SESSION, instruction: "PERSON-WORDS", conversation: [{ from: "person", who: "alice", text: "EARLIER-WORDS", at: new Date() }],
    store, instance: { host: hostOf(INSTANCE) }, product: null });
  // The chapters for the page, as MOD-source-register's recipe names its part in the tab: the file, the version and its hash, with the chapter's text.
  ready.prepared.parts.push({ name: "09_system-modeling.md — SRC-vibe-coding 2026-10-05, version hash abc123", text: "CHAPTER-TEXT", recipe: "chapters-for-page", size: 1, sources: ["SRC-vibe-coding"], required: true });
  const inputs = [];
  const prior = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const { pathname } = new URL(String(url));
    const json = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
    if (pathname === "/v1/ask") { const body = JSON.parse(init.body); inputs.push(body.input); return json({ ask: `ask-${inputs.length}`, session: body.session ?? "JOB-1" }); }
    if (pathname.startsWith("/v1/ask/")) return json({ state: "done", text: "ok", calls: [], usage: null, error: null });
    return json({ lines: [], next: 0, partial: "", ended: true });
  };
  try {
    let kept = null;
    for (let message = 1; message <= 11; message += 1) await runSession(ready, { kept, keep: (session) => { kept = session; } });
    assert.deepEqual(kept, { bridge: "mac", agent: "opencode", id: "JOB-1", sent: 11 });
  } finally { globalThis.fetch = prior; }
  const instruction = "Before anything else, you must read these files of Agent M in full";
  const files = ["- `../../AGENTS.md`", "- `../../docs/sources/SRC-vibe-coding/2026-10-05/09_system-modeling.md`"];
  inputs.forEach((input, at) => {
    const told = [0, 5, 10].includes(at);
    assert.equal(input.startsWith(instruction), told, `message ${at + 1}: ${input.slice(0, 80)}`);
    for (const file of files) assert.equal(input.includes(file), told, `message ${at + 1} names ${file}`);
    assert.equal(/need not read them again while they are\s+still in your context/.test(input), at === 5 || at === 10, `message ${at + 1}: the note`);
    assert.equal(input.includes("INSTANCE-RULES-TEXT") || input.includes("CHAPTER-TEXT"), false, `message ${at + 1} gives no file's text`);
    assert.equal(input.includes("EARLIER-WORDS"), at === 0, `message ${at + 1}: the conversation so far only where the session starts`);
    assert.ok(input.includes("PERSON-WORDS"));
  });
});
