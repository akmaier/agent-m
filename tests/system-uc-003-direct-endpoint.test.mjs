// UC-003 direct endpoint system tests (ITM-270).
// Run: node --test tests/system-uc-003-direct-endpoint.test.mjs
//
// Module: MOD-settings-pages · MOD-browser-store · MOD-endpoint-calls · MOD-site-frame
// Level: system
// Guards: UC-003; CONFIGURATION LIVES IN THE BROWSER; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE;
//         A CREDENTIAL IS NEVER PLACED IN A URL; AN UNSUPPORTED ENDPOINT SAYS SO; A CLEAR IS A REAL CLEAR;
//         NO SECRET IN THE REPOSITORY
//
// The endpoint servers below are controlled in-process handlers of the existing dashboard harness. No provider is called.
// Counter-proofs: each TST's named source fault was planted, its case failed at the stated assertion, and the byte was restored.

import test from "node:test";
import assert from "node:assert/strict";
import { openDashboard, press, repoServer, richDocument } from "./app-harness.mjs";

const INSTANCE = "akmaier/agent-m";
const prefix = `agent-m:${INSTANCE}:`;
const OPENAI = { name: "campus", url: "https://models.example.test/v1", kind: "openai-compatible", model: "tiny-model", key: "system-openai-key", throughBridge: false };
const ANTHROPIC = { name: "claude", url: "https://claude.example.test/v1", kind: "anthropic", model: "claude-tiny", key: "system-anthropic-key", throughBridge: false };

const stored = (name) => JSON.parse(globalThis.localStorage.getItem(`${prefix}endpoint:${name}`));
const type = (control, value) => { control.value = value; };

async function mountedDashboard(handlers = []) {
  const server = await repoServer({ files: {}, handlers });
  const page = await openDashboard({ server, hash: "#uc" });
  const dom = richDocument();
  const main = dom.byId("main"), original = main.querySelector.bind(main);
  let section = [];
  main.querySelector = (selector) => selector === '[data-settings-section="endpoints"]'
    ? { replaceChildren(...children) { section = children; } }
    : original(selector);
  await page.go("#settings");
  assert.equal(section.length, 2, "the public endpoint Settings adapter mounted its Configure control and endpoint slice");
  return { server, page, main, configure: section[0] };
}

async function configure(page, server, main, endpoint) {
  await press(server, main.querySelector(".endpoint-test"));
  return main.querySelector(".endpoint-result");
}

async function enterEndpoint(page, server, start) {
  await press(server, start);
  assert.equal(globalThis.location.hash, "#endpoints", "Configure selects the owned public endpoint route");
  // The harness's hash listener starts an async render; page.go waits for its mounted DOM just as a browser route load does.
  await page.go("#endpoints");
}

function fill(main, endpoint) {
  type(main.querySelector(".endpoint-name"), endpoint.name);
  type(main.querySelector(".endpoint-url"), endpoint.url);
  type(main.querySelector(".endpoint-kind"), endpoint.kind);
  type(main.querySelector(".endpoint-model"), endpoint.model);
  type(main.querySelector(".endpoint-key"), endpoint.key);
}

// TST-292001
// Module: MOD-settings-pages → MOD-browser-store → MOD-endpoint-calls
// Level: system
// Guards: UC-003; CONFIGURATION LIVES IN THE BROWSER; A CREDENTIAL IS NEVER PLACED IN A URL
// Precondition: Settings is open in a dashboard browser with no endpoint configuration.
// Input: the author presses Configure a model endpoint, fills an OpenAI-compatible endpoint, and presses Save and test.
// Expected: the dashboard stores the record before one short authorised request and shows the model working.
// Planted fault: moving writeSetting below testEndpoint in src/settings-pages/endpoints.mjs makes the handler's stored assertion fail.
test("TST-292001: Settings Configure saves an OpenAI-compatible endpoint before one short request", async () => {
  let calls = 0;
  const { server, page, main, configure: start } = await mountedDashboard([async (url, init) => {
    if (url.href !== `${OPENAI.url}/chat/completions`) return null;
    calls += 1;
    assert.deepEqual(stored(OPENAI.name), { url: OPENAI.url, kind: OPENAI.kind, model: OPENAI.model, key: OPENAI.key, throughBridge: false }, "failure node: browser-store already holds the form record when endpoint-calls starts");
    assert.equal(init.headers.Authorization, `Bearer ${OPENAI.key}`);
    assert.deepEqual(JSON.parse(init.body), { model: OPENAI.model, messages: [{ role: "user", content: "Reply with one word: ok." }], max_tokens: 1 });
    return new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }), { status: 200 });
  }]);
  await enterEndpoint(page, server, start);
  fill(main, OPENAI);
  const result = await configure(null, server, main, OPENAI);
  assert.equal(calls, 1, "one Save and test sends exactly one request");
  assert.match(result.textContent, /tiny-model is working/);
  assert.equal(globalThis.location.hash, "#endpoints", "Settings owns the public configuration route");
});

// TST-292002
// Module: MOD-settings-pages → MOD-endpoint-calls
// Level: system
// Guards: UC-003; A CREDENTIAL IS NEVER PLACED IN A URL
// Precondition: the dashboard has reached the public endpoint form from Settings.
// Input: the author stores and tests a controlled Anthropic endpoint.
// Expected: one Anthropic Messages request succeeds with its key in x-api-key and never in the request URL.
// Planted fault: replacing "/messages" by "/chat/completions" in src/endpoint-calls/index.mjs leaves the handler unanswered and this case fails.
test("TST-292002: the dashboard sends Anthropic's one short Messages request", async () => {
  let observed = null;
  const { server, page, main, configure: start } = await mountedDashboard([async (url, init) => {
    if (url.href !== `${ANTHROPIC.url}/messages`) return null;
    observed = { url: url.href, init };
    return new Response(JSON.stringify({ content: [{ type: "text", text: "ok" }] }), { status: 200 });
  }]);
  await enterEndpoint(page, server, start);
  fill(main, ANTHROPIC);
  const result = await configure(null, server, main, ANTHROPIC);
  assert.ok(observed, "failure node: endpoint-calls selected Anthropic's actual /messages destination");
  assert.equal(observed.init.headers["x-api-key"], ANTHROPIC.key);
  assert.equal(observed.init.headers["anthropic-version"], "2023-06-01");
  assert.equal(observed.url.includes(ANTHROPIC.key), false);
  assert.match(result.textContent, /claude-tiny is working/);
});

// TST-292003
// Module: MOD-settings-pages → MOD-endpoint-calls
// Level: system
// Guards: UC-003 alternative 4a; AN UNSUPPORTED ENDPOINT SAYS SO
// Precondition: an author has filled a direct endpoint in the dashboard's public form.
// Input: Save and test meets a browser-visible cross-origin refusal.
// Expected: the observed reason and both usable CI and Bridge alternatives are shown.
// Planted fault: changing diagnoseEndpoint's browser routes to [] in src/endpoint-calls/index.mjs makes the CI assertion fail.
test("TST-292003: a browser refusal is actionable through CI and Bridge", async () => {
  const { server, page, main, configure: start } = await mountedDashboard([async (url) => {
    if (url.href === `${OPENAI.url}/chat/completions`) throw new TypeError("Blocked by CORS policy");
    return null;
  }]);
  await enterEndpoint(page, server, start);
  fill(main, OPENAI);
  const result = await configure(null, server, main, OPENAI);
  assert.match(result.textContent, /Blocked by CORS policy/);
  assert.match(result.textContent, /CI/);
  assert.match(result.textContent, /Bridge/);
});

// TST-292004
// Module: MOD-settings-pages → MOD-browser-store
// Level: system
// Guards: UC-003 alternative 4b; UC-003 alternative 2b; CONFIGURATION LIVES IN THE BROWSER; A CLEAR IS A REAL CLEAR
// Precondition: an author can reach the dashboard's endpoint form from Settings.
// Input: a provider refuses the key, the page reloads, and the author presses Clear.
// Expected: the provider message is shown and the key survives reload; Clear removes the actual localStorage entry and empties the form.
// Planted fault: replacing clearSetting with applySetting in src/settings-pages/endpoints.mjs leaves the stored-entry assertion failing.
test("TST-292004: refused key persists through reload until Clear removes the stored endpoint", async () => {
  const { server, page, main, configure: start } = await mountedDashboard([async (url) => {
    if (url.href === `${OPENAI.url}/chat/completions`) return new Response(JSON.stringify({ error: { message: "Invalid API key." } }), { status: 401 });
    return null;
  }]);
  await enterEndpoint(page, server, start);
  fill(main, OPENAI);
  let result = await configure(null, server, main, OPENAI);
  assert.match(result.textContent, /Invalid API key\./);
  assert.equal(stored(OPENAI.name).key, OPENAI.key);
  await page.go("#endpoints/campus");
  assert.equal(main.querySelector(".endpoint-key").value, OPENAI.key, "the form reloaded from the browser-store record");
  await press(server, main.querySelector(".endpoint-clear"));
  assert.equal(globalThis.localStorage.getItem(`${prefix}endpoint:${OPENAI.name}`), null, "failure node: clearSetting removed localStorage, not merely form values");
  assert.equal(main.querySelector(".endpoint-url").value, "");
  result = main.querySelector(".endpoint-result");
  assert.match(result.textContent, /cleared from this browser/i);
});

// TST-292011
// Module: MOD-settings-pages → MOD-browser-store
// Level: system
// Guards: UC-003; CONFIGURATION LIVES IN THE BROWSER
// Precondition: Settings lists a stored named endpoint.
// Input: the author presses that endpoint's Change control.
// Expected: the dashboard selects only the named public endpoint route, whose form reads that record.
// Planted fault: removing context.go from Change in src/settings-pages/settings.mjs leaves the named-route assertion failing.
test("TST-292011: Settings Change opens the stored endpoint's named public route", async () => {
  const entries = { [`${prefix}endpoint:${OPENAI.name}`]: JSON.stringify({ url: OPENAI.url, kind: OPENAI.kind, model: OPENAI.model, key: OPENAI.key, throughBridge: false }) };
  const server = await repoServer({ files: {} });
  const page = await openDashboard({ server, hash: "#uc", entries });
  const dom = richDocument(), main = dom.byId("main"), original = main.querySelector.bind(main);
  let section = [];
  main.querySelector = (selector) => selector === '[data-settings-section="endpoints"]' ? { replaceChildren(...children) { section = children; } } : original(selector);
  await page.go("#settings");
  await press(server, section[1].querySelector("button.settings-endpoint-change"));
  assert.equal(globalThis.location.hash, "#endpoints/campus");
  await page.go("#endpoints/campus");
  assert.equal(main.querySelector(".endpoint-name").value, OPENAI.name);
  assert.equal(main.querySelector(".endpoint-model").value, OPENAI.model);
});
