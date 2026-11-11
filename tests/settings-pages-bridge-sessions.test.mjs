// The CLI sessions a Bridge offers, declared on the route `bridge` (ITM-1186) — docs/architecture/MOD-settings-pages.md, `bridge`: "for each CLI session a Bridge offers (MOD-bridge-client's `testBridge`), the place where it
// processes data, preset to *this machine* for a Bridge on this computer, its capabilities, preset to every capability, and each model it can run, with its context in tokens (UC-044 step 5), as the
// Bridge keeps them, saved to the Bridge with MOD-bridge-client's `declareAgent`, and one lacking a place, a model or a model's context named as not offered (UC-049 1b)."
// Run: node --test tests/settings-pages-bridge-sessions.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-049; UC-044; THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE; A CONNECTION NAMES THE MODELS IT OFFERS; A CONNECTION DECLARES ITS CAPABILITIES; A CONNECTION DECLARES WHERE IT PROCESSES DATA
// Level: unit
//
// These tests use only MOD-settings-pages' public `view`: the route `bridge` is drawn with Route.render(target, context, params) in the small DOM of tests/site-frame-dom.mjs, over a Map-backed localStorage and a stand-in for `fetch`
// that answers as a Bridge does — GET /v1/pair, GET /v1/agents listing each agent with the declaration it keeps, and PUT /v1/agents/{agent}, which it keeps
// (MOD-bridge-http) — and records every request. That DOM has no querySelector; this file adds it for a selector of one class, as a browser answers it. The readings, named in the pull request: both Bridges this browser keeps
// are reached at a loopback address, so each is a Bridge on this computer; a session is declared to the Bridge with the body of PUT /v1/agents/{agent} — { place, capabilities, models: [{ model, context }] } —, the place only
// where it is written, a model only where it is written and its context only where it is a whole number of tokens, and a declaration that lacks something is not sent; what a session lacks is said in the words of `endpointLacks` for a session, and the form says it of what is kept.
// Each test states its input and its expected result before it runs (given / input / expect). Nothing reaches the network. The counter-proofs are recorded in the pull request.

import { installDocument, byClass, click, type, until } from "./settings-pages-harness.mjs";
import test from "node:test";
import assert from "node:assert/strict";

installDocument();
// querySelector and querySelectorAll for a selector of one class (".name"), as a browser answers it.
{
  const { Element } = globalThis.window;
  Element.prototype.querySelectorAll = function querySelectorAll(selector) {
    const name = /^\.([\w-]+)$/.exec(selector)?.[1];
    if (!name) throw new Error(`this fixture answers a selector of one class only: ${selector}`);
    return byClass(this, name);
  };
  Element.prototype.querySelector = function querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; };
}
const { view } = await import("../src/settings-pages/index.mjs");
const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");

class Storage { constructor() { this.values = new Map(); } getItem(key) { return this.values.get(key) ?? null; } setItem(key, value) { this.values.set(key, String(value)); } removeItem(key) { this.values.delete(key); }
  key(at) { return [...this.values.keys()][at] ?? null; } get length() { return this.values.size; } }
const ORIGIN = "https://published.example.test";
const ALL = ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools", "reach the web"];
const json = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
const UNDECLARED = { place: null, capabilities: [], models: [] };
// The fake Bridges, by address: each keeps the declaration of each agent it offers, as the Bridge's settings do (MOD-bridge-http, GET and PUT /v1/agents).
function bridges(declared = {}) {
  const kept = { "http://127.0.0.1:4711": { ...declared["http://127.0.0.1:4711"] }, "http://127.0.0.1:9222": { ...declared["http://127.0.0.1:9222"] } };
  return async (url, init = {}) => {
    const { origin, pathname } = new URL(url);
    const method = String(init.method ?? "GET").toUpperCase();
    if (method === "GET" && pathname === "/v1/pair") return json({ bridge: { name: "Bridge", version: "1", platform: "linux" }, origin: ORIGIN });
    if (method === "GET" && pathname === "/v1/agents") {
      return json({ agents: [{ name: "claude", version: "2", ready: true, loggedIn: true, ...(kept[origin].claude ?? UNDECLARED) },
        { name: "codex", version: "1", ready: false, loggedIn: false, ...(kept[origin].codex ?? UNDECLARED) }], missing: [{ name: "opencode" }] });
    }
    if (method === "PUT" && pathname.startsWith("/v1/agents/")) {
      kept[origin][decodeURIComponent(pathname.slice("/v1/agents/".length))] = JSON.parse(init.body);
      return json({ declared: true });
    }
    return new Response(JSON.stringify({ error: "not-found", message: pathname }), { status: 404, headers: { "Content-Type": "application/json" } });
  };
}

function freshStore() {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const store = openStore("fixture/instance");
  writeSetting(store, "bridge:laptop", { address: "http://127.0.0.1:4711", token: "laptop-token" });
  writeSetting(store, "bridge:lab", { address: "http://127.0.0.1:9222", token: "lab-token" });
  return store;
}
function stand(t, declared) {
  const calls = [];
  const answer = bridges(declared);
  const prior = globalThis.fetch, priorLocation = Object.getOwnPropertyDescriptor(globalThis, "location");
  globalThis.fetch = async (url, init = {}) => { calls.push({ url: String(url), init }); return answer(String(url), init); };
  Object.defineProperty(globalThis, "location", { configurable: true, value: { origin: ORIGIN } });
  t.after(() => { globalThis.fetch = prior; if (priorLocation) Object.defineProperty(globalThis, "location", priorLocation); else delete globalThis.location; });
  return calls;
}
async function bridgePage(store) {
  const target = document.createElement("div");
  document.body.append(target);
  await view.routes.find((route) => route.name === "bridge").render(target, { instance: { repository: "fixture/instance" }, store, go() {} }, {});
  return target;
}
const kept = (page, name) => byClass(page, "bridge-kept").find((section) => byClass(section, "bridge-kept-name")[0]?.textContent === name);
const sessionOf = (page, name, agent) => byClass(kept(page, name), "bridge-session").find((form) => byClass(form, "bridge-session-agent")[0]?.textContent === agent);
const tested = async (page, name) => { await click(byClass(kept(page, name), "bridge-kept-test")[0]); await until(() => byClass(kept(page, name), "bridge-session").length > 0, `the sessions of ${name}`); };
const checked = (form) => byClass(form, "bridge-session-capability").filter((box) => box.checked).map((box) => box.value);
const field = (form, name, at = 0) => byClass(form, `bridge-session-${name}`)[at];
// The model rows of a form, as [model, context] each.
const rows = (form) => byClass(form, "bridge-session-model-row").map((row) => [byClass(row, "bridge-session-model")[0].value, byClass(row, "bridge-session-context")[0].value]);
const declare = (form, { place, models }) => {
  type(field(form, "place"), place);
  models.forEach(([model, context], at) => { type(field(form, "model", at), model); type(field(form, "context", at), context); });
};
// The declarations sent, as [url, body] each (PUT /v1/agents/{agent}).
const puts = (calls) => calls.filter((call) => call.init.method === "PUT").map((call) => [call.url, JSON.parse(call.init.body)]);
const lacksOf = (form) => byClass(form, "bridge-session-lacks").map((node) => node.textContent).join(" ");

// TST-1186001 · level: unit · module: MOD-settings-pages
// guards: UC-044; UC-049
// given: a browser that keeps two Bridges, laptop and lab, and a Bridge behind each address that answers and records every request
// input: the route bridge drawn
// expect: a Test for each Bridge under its name and no form of a CLI session before a Test; no request has been sent
// Planted fault: drawing the route with a request to each Bridge fails the request count; drawing no Test fails the Tests.
test("TST-1186001: the route bridge draws a Test for each Bridge this browser keeps and sends no request", async (t) => {
  const store = freshStore();
  const calls = stand(t);
  const page = await bridgePage(store);
  assert.deepEqual(byClass(page, "bridge-kept").map((section) => byClass(section, "bridge-kept-name")[0].textContent).sort(), ["lab", "laptop"]);
  for (const name of ["lab", "laptop"]) assert.equal(byClass(kept(page, name), "bridge-kept-test").length, 1, `${name} has one Test`);
  assert.equal(byClass(page, "bridge-session").length, 0, "no form of a CLI session before a Test");
  assert.equal(calls.length, 0, "drawing the route sends no request");
});

// TST-1186002 · level: unit · module: MOD-settings-pages
// guards: UC-049; UC-044
// given: the Bridge laptop on this computer (a loopback address), which lists the agent claude ready and the agent codex not ready, and the Bridge lab, which is not tested
// input: Test on the line of laptop
// expect: exactly two requests, /v1/pair and /v1/agents of the address of laptop, with its token; a form for claude and none for codex; its place preset to "this machine"; every one of the six capabilities checked; one row of a model, its
//   model and context empty, and + Add model; no request to lab
// Planted fault: a form for the agent that is not ready, a request to another Bridge, a third request, a capability left unchecked or an empty place fail it.
test("TST-1186002: Test of a Bridge sends the two requests of testBridge and draws a form for each ready agent, its place this machine and every capability preset", async (t) => {
  const store = freshStore();
  const calls = stand(t);
  const page = await bridgePage(store);
  await tested(page, "laptop");
  assert.deepEqual(calls.map((call) => call.url), ["http://127.0.0.1:4711/v1/pair", "http://127.0.0.1:4711/v1/agents"]);
  assert.ok(calls.every((call) => call.init.headers["x-agent-m-bridge-token"] === "laptop-token"), "each request carries the token of laptop");
  assert.deepEqual(byClass(kept(page, "laptop"), "bridge-session").map((form) => byClass(form, "bridge-session-agent")[0].textContent), ["claude"]);
  const form = sessionOf(page, "laptop", "claude");
  assert.deepEqual(checked(form), ALL, "every capability is preset");
  assert.deepEqual(byClass(form, "bridge-session-capability").map((box) => box.value).sort(), [...ALL].sort(), "every capability can be chosen");
  assert.equal(field(form, "place").value, "this machine");
  assert.deepEqual(rows(form), [["", ""]], "one row of a model, empty");
  assert.equal(byClass(form, "bridge-session-add-model").length, 1, "+ Add model is offered");
  assert.equal(byClass(kept(page, "lab"), "bridge-session").length, 0);
});

// TST-1186003 · level: unit · module: MOD-settings-pages
// guards: THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE; A CONNECTION NAMES THE MODELS IT OFFERS; UC-044; UC-049
// given: the tested Bridge laptop with the form of claude
// input: place "this machine", the model "claude-opus-5-5" with context "200000", + Add model and the model "claude-sonnet-5-5" with context "1000000", Save session; then the first model's context "12.5", Save session; then its context "200000" again and run code and tests unchecked, Save session
// expect: the first save sends PUT /v1/agents/claude to laptop, with its token, and { place: "this machine", capabilities: all six, models: [{ model: "claude-opus-5-5", context: 200000 }, { model: "claude-sonnet-5-5", context: 1000000 }] }; the second sends nothing and names the context of claude-opus-5-5 as lacking (a number of tokens is whole); the third sends the declaration without run code and tests; no declaration goes to lab or for codex, and no setting of this browser names a session
// Planted fault: sending the context as the text typed, sending 12.5, sending one model only, sending to another agent or Bridge, or keeping the declaration in this browser fails.
test("TST-1186003: Save session sends the declaration to the Bridge with declareAgent, each model with its context, and sends none whose context is not a whole number of tokens", async (t) => {
  const store = freshStore();
  const calls = stand(t);
  const page = await bridgePage(store);
  await tested(page, "laptop");
  const form = sessionOf(page, "laptop", "claude");
  await click(field(form, "add-model"));
  declare(form, { place: "this machine", models: [["claude-opus-5-5", "200000"], ["claude-sonnet-5-5", "1000000"]] });
  await click(field(form, "save"));
  const all = { place: "this machine", capabilities: ALL, models: [{ model: "claude-opus-5-5", context: 200000 }, { model: "claude-sonnet-5-5", context: 1000000 }] };
  assert.deepEqual(puts(calls), [["http://127.0.0.1:4711/v1/agents/claude", all]]);
  assert.equal(calls.at(-1).init.headers["x-agent-m-bridge-token"], "laptop-token", "the declaration carries the token of laptop");
  type(field(form, "context"), "12.5");
  await click(field(form, "save"));
  assert.equal(puts(calls).length, 1, "a declaration whose model lacks a whole context is not sent");
  assert.match(lacksOf(form), /the context in tokens of claude-opus-5-5/);
  type(field(form, "context"), "200000");
  byClass(form, "bridge-session-capability").find((box) => box.value === "run code and tests").checked = false;
  await click(field(form, "save"));
  assert.deepEqual(puts(calls), [["http://127.0.0.1:4711/v1/agents/claude", all],
    ["http://127.0.0.1:4711/v1/agents/claude", { ...all, capabilities: ["draft text", "read the repository", "write to the repository", "use tools", "reach the web"] }]]);
  assert.deepEqual([...localStorage.values.keys()].filter((key) => key.includes("session")), [], "no setting of this browser names a session");
});

// TST-1186004 · level: unit · module: MOD-settings-pages
// guards: UC-049; THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE
// given: the tested Bridge laptop with the form of claude, nothing declared for it
// input: the form as drawn; then Save session with a place and the model claude-opus-5-5 with no context; then with its context written and no place; then with the place and no model
// expect: the drawn form names the session as not offered in the prompt bar, lacking the place where it processes data and a model; after the first save it names only the context in tokens of claude-opus-5-5; after the
//   second only the place where it processes data; after the third only a model; no declaration is sent to the Bridge
// Planted fault: naming nothing, naming everything after the first save, naming a field that is written, or sending a declaration that lacks something fails it.
test("TST-1186004: a session lacking a place, a model or a model's context is named as not offered in the prompt bar, with what it lacks, and is not sent", async (t) => {
  const store = freshStore();
  const calls = stand(t);
  const page = await bridgePage(store);
  await tested(page, "laptop");
  const form = sessionOf(page, "laptop", "claude");
  const drawn = lacksOf(form);
  assert.match(drawn, /prompt bar does not offer claude/);
  for (const lacking of ["the place where it processes data", "a model"]) assert.ok(drawn.includes(lacking), `drawn: ${lacking} in ${drawn}`);
  declare(form, { place: "this machine", models: [["claude-opus-5-5", ""]] });
  await click(field(form, "save"));
  const first = lacksOf(form);
  assert.ok(first.includes("the context in tokens of claude-opus-5-5"), first);
  assert.ok(!first.includes("the place where it processes data") && !first.includes("a model"), first);
  declare(form, { place: "", models: [["claude-opus-5-5", "200000"]] });
  await click(field(form, "save"));
  const second = lacksOf(form);
  assert.ok(second.includes("the place where it processes data"), second);
  assert.ok(!second.includes("context in tokens") && !second.includes("a model"), second);
  declare(form, { place: "this machine", models: [["", "200000"]] });
  await click(field(form, "save"));
  const third = lacksOf(form);
  assert.ok(third.includes("a model"), third);
  assert.ok(!third.includes("the place where it processes data") && !third.includes("context in tokens"), third);
  assert.deepEqual(puts(calls), [], "no declaration that lacks something is sent");
});

// TST-1186005 · level: unit · module: MOD-settings-pages
// guards: UC-049; THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE
// given: the tested Bridge laptop; a session claude declared with a place and a model with its context; the Bridge lab, which keeps for claude a place, five capabilities and a model without its context
// input: Save session on laptop's form; then the route drawn anew and Test on laptop and on lab
// expect: laptop's form names nothing as lacking after the save and again after the second Test, where it shows what the Bridge keeps (place, the model with its context, capabilities); lab's form, drawn from what lab keeps,
//   shows its five capabilities and names the context in tokens of its model as lacking
// Planted fault: naming a session that declares all as lacking, or drawing the form again without what the Bridge lists, fails it.
test("TST-1186005: a session declared with a place and a model with its context is not named as lacking, and a Test shows what the Bridge keeps", async (t) => {
  const store = freshStore();
  const FIVE = ALL.filter((capability) => capability !== "reach the web");
  stand(t, { "http://127.0.0.1:9222": { claude: { place: "this machine", capabilities: FIVE, models: [{ model: "claude-opus-5-5", context: null }] } } });
  const page = await bridgePage(store);
  await tested(page, "laptop");
  const form = sessionOf(page, "laptop", "claude");
  declare(form, { place: "this machine", models: [["claude-opus-5-5", "200000"]] });
  await click(field(form, "save"));
  assert.equal(lacksOf(form), "", "nothing is lacking");
  const again = await bridgePage(store);
  await tested(again, "laptop");
  await tested(again, "lab");
  const laptop = sessionOf(again, "laptop", "claude");
  assert.equal(field(laptop, "place").value, "this machine");
  assert.deepEqual(rows(laptop), [["claude-opus-5-5", "200000"]]);
  assert.deepEqual(checked(laptop), ALL);
  assert.equal(lacksOf(laptop), "");
  const lab = sessionOf(again, "lab", "claude");
  assert.deepEqual(checked(lab), FIVE, "what the Bridge keeps prefills the form");
  assert.match(lacksOf(lab), /the context in tokens of claude-opus-5-5/);
  assert.ok(!/place|a model/.test(lacksOf(lab)), lacksOf(lab));
});
