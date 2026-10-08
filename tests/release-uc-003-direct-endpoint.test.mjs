// UC-003 direct endpoint release tests (ITM-270).
// Run: node --test tests/release-uc-003-direct-endpoint.test.mjs
//
// Module: MOD-settings-pages · MOD-browser-store · MOD-endpoint-calls · MOD-site-frame
// Level: release
// Guards: UC-003; CONFIGURATION LIVES IN THE BROWSER; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE;
//         A CREDENTIAL IS NEVER PLACED IN A URL; AN UNSUPPORTED ENDPOINT SAYS SO; A CLEAR IS A REAL CLEAR; NO SECRET IN THE REPOSITORY
//
// Each endpoint server is a harness handler. The release suite has no network route to a paid endpoint.

import test from "node:test";
import assert from "node:assert/strict";
import { openDashboard, press, repoServer, richDocument, settle } from "./app-harness.mjs";

const INSTANCE = "akmaier/agent-m";
const prefix = `agent-m:${INSTANCE}:`;
const ENDPOINT = { name: "release", url: "https://release-model.example.test/v1", kind: "openai-compatible", model: "release-model", key: "release-browser-only-key", throughBridge: false };
const BRIDGED = { name: "local", url: "http://127.0.0.1:11434", kind: "openai-compatible", model: "local-model", key: "local-key", throughBridge: true };
const type = (control, value) => { control.value = value; };
const setting = (name) => globalThis.localStorage.getItem(`${prefix}endpoint:${name}`);

function activate(browser) {
  Object.defineProperties(globalThis, {
    document: { value: browser.document, configurable: true, writable: true },
    location: { value: browser.location, configurable: true, writable: true },
    localStorage: { value: browser.storage, configurable: true, writable: true },
  });
  globalThis.fetch = browser.fetch;
}

async function openEndpointDashboard({ entries = {}, handlers = [], pathname = null, storage = null } = {}) {
  const server = await repoServer({ files: {}, handlers });
  const page = await openDashboard({ server, hash: "#uc", entries });
  if (storage) globalThis.localStorage = storage;
  const dom = richDocument();
  const main = dom.byId("main"), base = main.querySelector.bind(main);
  let mounted = [];
  main.querySelector = (selector) => selector === '[data-settings-section="endpoints"]'
    ? { replaceChildren(...children) { mounted = children; } }
    : base(selector);
  if (pathname) {
    globalThis.location.pathname = pathname;
    globalThis.location.hash = "#settings";
    await import(`../docs/assets/dashboard-app.mjs?itm270-instance=${encodeURIComponent(pathname)}`);
    await settle(server);
  } else await page.go("#settings");
  await press(server, mounted[0]);
  assert.equal(globalThis.location.hash, "#endpoints", "Configure selects the dashboard's endpoint route");
  await page.go("#endpoints");
  return { server, page, main, browser: { document: globalThis.document, location: globalThis.location,
    storage: globalThis.localStorage, fetch: globalThis.fetch } };
}

function fill(main, endpoint = ENDPOINT) {
  type(main.querySelector(".endpoint-name"), endpoint.name);
  type(main.querySelector(".endpoint-url"), endpoint.url);
  type(main.querySelector(".endpoint-model"), endpoint.model);
  type(main.querySelector(".endpoint-key"), endpoint.key);
}

// TST-292005
// Module: MOD-settings-pages → MOD-browser-store
// Level: release
// Guards: UC-003; CONFIGURATION LIVES IN THE BROWSER; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
// Precondition: two actual dashboard instances reuse one same-origin browser localStorage object.
// Input: each instance saves its own endpoint through Settings → Configure, then its active public named route reloads.
// Expected: both active public routes retain only their own instance record, and no cookie is set.
// Planted fault: fixing prefixOf to agent-m:akmaier/agent-m: makes akmaier/other load the first instance record.
test("TST-292005: a direct configuration is browser-local localStorage state, never a cookie", async () => {
  const handler = async (url) => url.href === `${ENDPOINT.url}/chat/completions`
    ? new Response(JSON.stringify({ choices: [] }), { status: 200 }) : null;
  const first = await openEndpointDashboard({ handlers: [handler] });
  const sharedStorage = first.browser.storage;
  globalThis.document.cookie = "";
  fill(first.main);
  await press(first.server, first.main.querySelector(".endpoint-test"));
  assert.match(setting(ENDPOINT.name), /release-model/);
  assert.equal(globalThis.document.cookie, "", "failure node: endpoint save did not write document.cookie");
  const second = await openEndpointDashboard({ pathname: "/other/instance/", handlers: [handler], storage: sharedStorage });
  assert.equal(second.browser.storage, sharedStorage, "both actual instance callers use the same browser localStorage object");
  fill(second.main, { ...ENDPOINT, model: "other-model" });
  await press(second.server, second.main.querySelector(".endpoint-test"));
  assert.match(sharedStorage.getItem("agent-m:akmaier/other:endpoint:release"), /other-model/);
  assert.match(sharedStorage.getItem(`${prefix}endpoint:release`), /release-model/);
  activate(second.browser);
  await second.page.go("#endpoints/release");
  assert.equal(richDocument().byId("main").querySelector(".endpoint-model").value, "other-model", "the active second-instance route retains its own endpoint record");
  activate(first.browser);
  first.main.querySelector(".endpoint-model").value = "stale-first-model";
  await first.page.go("#endpoints/release");
  assert.equal(richDocument().byId("main").querySelector(".endpoint-model").value, ENDPOINT.model, "the active first-instance route reloads only its own namespace, never akmaier/other");
});

// TST-292006
// Module: MOD-settings-pages → MOD-endpoint-calls
// Level: release
// Guards: UC-003; A CREDENTIAL IS NEVER PLACED IN A URL; NO SECRET IN THE REPOSITORY
// Precondition: an author has supplied an optional key on the public endpoint form.
// Input: Save and test reaches the controlled endpoint.
// Expected: the key is confined to Authorization; no repository write or request URL contains it.
// Planted fault: moving the key into endpointUrl in src/endpoint-calls/index.mjs makes the URL assertion fail.
test("TST-292006: an endpoint credential stays out of URLs and repository writes", async () => {
  let observed = null;
  const { server, main } = await openEndpointDashboard({ handlers: [async (url, init) => {
    if (!url.href.startsWith(ENDPOINT.url)) return null;
    observed = { url: url.href, headers: init.headers };
    return new Response(JSON.stringify({ choices: [] }), { status: 200 });
  }] });
  fill(main);
  await press(server, main.querySelector(".endpoint-test"));
  assert.equal(observed.url.includes(ENDPOINT.key), false, "failure node: endpoint-calls URL excludes the browser credential");
  assert.equal(observed.headers.Authorization, `Bearer ${ENDPOINT.key}`);
  assert.equal(server.writes.length, 0, "the dashboard made no repository write");
  assert.equal(server.requests.some((request) => request.includes(ENDPOINT.key)), false, "the harness request ledger contains no secret");
});

// TST-292007
// Module: MOD-settings-pages → MOD-endpoint-calls
// Level: release
// Guards: UC-003 alternative 4a; AN UNSUPPORTED ENDPOINT SAYS SO
// Precondition: the configured endpoint is blocked by the browser before a response is available.
// Input: the author presses Save and test.
// Expected: the observable diagnosis names the browser block and CI and Bridge as routes that work.
// Planted fault: deleting resultText's alternatives from src/settings-pages/endpoints.mjs makes the Bridge assertion fail.
test("TST-292007: browser blocking remains actionable at the release route", async () => {
  const { server, main } = await openEndpointDashboard({ handlers: [async (url) => {
    if (url.href === `${ENDPOINT.url}/chat/completions`) throw new TypeError("Failed to fetch");
    return null;
  }] });
  fill(main);
  await press(server, main.querySelector(".endpoint-test"));
  const shown = main.querySelector(".endpoint-result").textContent;
  assert.match(shown, /Failed to fetch/);
  assert.match(shown, /CI/);
  assert.match(shown, /Bridge/);
});

// TST-292008
// Module: MOD-settings-pages → MOD-browser-store
// Level: release
// Guards: UC-003 alternative 2b; A CLEAR IS A REAL CLEAR
// Precondition: a real endpoint record exists in the dashboard browser's localStorage.
// Input: the author reloads the named route and presses Clear.
// Expected: localStorage no longer has the record after a further route reload.
// Planted fault: removing clearSetting in src/settings-pages/endpoints.mjs leaves the post-reload record assertion failing.
test("TST-292008: Clear removes the persistent endpoint record", async () => {
  const entries = { [`${prefix}endpoint:${ENDPOINT.name}`]: JSON.stringify({ url: ENDPOINT.url, kind: ENDPOINT.kind, model: ENDPOINT.model, key: ENDPOINT.key, throughBridge: false }) };
  const { server, page, main } = await openEndpointDashboard({ entries });
  await page.go(`#endpoints/${ENDPOINT.name}`);
  await press(server, main.querySelector(".endpoint-clear"));
  assert.equal(setting(ENDPOINT.name), null, "failure node: clearSetting removed the stored record");
  await page.go(`#endpoints/${ENDPOINT.name}`);
  assert.equal(main.querySelector(".endpoint-url").value, "", "reload cannot restore a cleared endpoint");
});

// TST-292009
// Module: MOD-settings-pages → MOD-browser-store
// Level: release
// Guards: UC-003; CONFIGURATION LIVES IN THE BROWSER; A CREDENTIAL IS NEVER PLACED IN A URL
// Precondition: the public endpoint form has an optional key and destination disclosure.
// Input: the author reads the route, reveals the key, then stores a through-Bridge endpoint.
// Expected: disclosure precedes the control, Show changes only the password control, and Bridge setup is required with zero direct requests.
// Planted fault: removing the throughBridge return in src/settings-pages/endpoints.mjs makes the zero-request assertion fail.
test("TST-292009: disclosure and key controls precede a retained Bridge configuration without a direct call", async () => {
  let direct = 0;
  const { server, main } = await openEndpointDashboard({ handlers: [async (url) => {
    if (url.href === `${BRIDGED.url}/chat/completions`) direct += 1;
    return null;
  }] });
  const disclosure = main.querySelector(".endpoint-disclosure");
  const action = main.querySelector(".endpoint-test");
  assert.match(disclosure.textContent, /short test request.*authorisation header/i);
  assert.ok(main.innerHTML.indexOf("endpoint-disclosure") < main.innerHTML.indexOf("endpoint-test"), "the route renders disclosure before Save and test");
  fill(main, BRIDGED);
  const key = main.querySelector(".endpoint-key");
  assert.equal(key.type, "password");
  await press(server, main.querySelector(".endpoint-show"));
  assert.equal(key.type, "text", "Show reveals the real password control only after the author's click");
  assert.equal(key.value, BRIDGED.key, "Show retains the stored key while changing only its visibility");
  main.querySelector(".endpoint-through-bridge").checked = true;
  await press(server, action);
  assert.match(main.querySelector(".endpoint-result").textContent, /Bridge setup/i);
  assert.equal(direct, 0, "failure node: throughBridge returns before MOD-endpoint-calls");
  assert.deepEqual(JSON.parse(setting(BRIDGED.name)), { url: BRIDGED.url, kind: BRIDGED.kind, model: BRIDGED.model, key: BRIDGED.key, throughBridge: true }, "the retained browser-store record preserves the Bridge route");
});

// TST-292010
// Module: MOD-settings-pages → MOD-browser-store → MOD-endpoint-calls
// Level: release
// Guards: UC-003; A CREDENTIAL IS NEVER PLACED IN A URL
// Precondition: the author has an endpoint that permits an absent optional key.
// Input: the author saves and tests it through the mounted dashboard form.
// Expected: the one successful direct request has no Authorization header and the stored record has no key field.
// Planted fault: making settingFrom always write key in src/settings-pages/endpoints.mjs makes the stored-record assertion fail.
test("TST-292010: an endpoint without an optional key succeeds without sending one", async () => {
  let request = null;
  const { server, main } = await openEndpointDashboard({ handlers: [async (url, init) => {
    if (url.href !== `${ENDPOINT.url}/chat/completions`) return null;
    request = init;
    return new Response(JSON.stringify({ choices: [] }), { status: 200 });
  }] });
  fill(main);
  main.querySelector(".endpoint-key").value = "";
  await press(server, main.querySelector(".endpoint-test"));
  assert.equal(request.headers.Authorization, undefined, "failure node: endpoint-calls omits credentials when no key was configured");
  assert.equal(Object.hasOwn(JSON.parse(setting(ENDPOINT.name)), "key"), false);
  assert.match(main.querySelector(".endpoint-result").textContent, /working/);
});
