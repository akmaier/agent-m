// UC-003 direct endpoint release tests (ITM-270).
// Run: node --test tests/release-uc-003-direct-endpoint.test.mjs
//
// Module: MOD-dashboard-app · MOD-settings-pages · MOD-browser-store · MOD-endpoint-calls
// Level: release
// Guards: UC-003; CONFIGURATION LIVES IN THE BROWSER; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE;
//         A CREDENTIAL IS NEVER PLACED IN A URL; AN UNSUPPORTED ENDPOINT SAYS SO; A CLEAR IS A REAL CLEAR; NO SECRET IN THE REPOSITORY
//
// Each endpoint server is a harness handler. The release suite has no network route to a paid endpoint.

import test from "node:test";
import assert from "node:assert/strict";
import { openDashboard, press, repoServer, richDocument } from "./app-harness.mjs";

const INSTANCE = "akmaier/agent-m";
const prefix = `agent-m:${INSTANCE}:`;
const ENDPOINT = { name: "release", url: "https://release-model.example.test/v1", kind: "openai-compatible", model: "release-model", key: "release-browser-only-key", throughBridge: false };
const BRIDGED = { name: "local", url: "http://127.0.0.1:11434", kind: "openai-compatible", model: "local-model", key: "local-key", throughBridge: true };
const type = (control, value) => { control.value = value; };
const setting = (name) => globalThis.localStorage.getItem(`${prefix}endpoint:${name}`);

async function openEndpointDashboard({ entries = {}, handlers = [] } = {}) {
  const server = await repoServer({ files: {}, handlers });
  const page = await openDashboard({ server, hash: "#uc", entries });
  const dom = richDocument();
  const main = dom.byId("main"), base = main.querySelector.bind(main);
  let mounted = [];
  main.querySelector = (selector) => selector === '[data-settings-section="endpoints"]'
    ? { replaceChildren(...children) { mounted = children; } }
    : base(selector);
  await page.go("#settings");
  await press(server, mounted[0]);
  assert.equal(globalThis.location.hash, "#endpoints", "Configure selects the dashboard's endpoint route");
  await page.go("#endpoints");
  return { server, page, main };
}

function fill(main, endpoint = ENDPOINT) {
  type(main.querySelector(".endpoint-name"), endpoint.name);
  type(main.querySelector(".endpoint-url"), endpoint.url);
  type(main.querySelector(".endpoint-model"), endpoint.model);
  type(main.querySelector(".endpoint-key"), endpoint.key);
}

// TST-292005
// Module: MOD-dashboard-app → MOD-settings-pages → MOD-browser-store
// Level: release
// Guards: UC-003; CONFIGURATION LIVES IN THE BROWSER; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
// Precondition: two dashboard browsers begin with no endpoint record.
// Input: one browser saves a successful endpoint through Settings → Configure.
// Expected: only that browser's localStorage owns the configuration and no cookie is set.
// Planted fault: changing openStore's prefix in src/browser-store/store.mjs to a global key makes the second-browser isolation assertion fail.
test("TST-292005: a direct configuration is browser-local localStorage state, never a cookie", async () => {
  const handler = async (url) => url.href === `${ENDPOINT.url}/chat/completions`
    ? new Response(JSON.stringify({ choices: [] }), { status: 200 }) : null;
  const first = await openEndpointDashboard({ handlers: [handler] });
  globalThis.document.cookie = "";
  fill(first.main);
  await press(first.server, first.main.querySelector(".endpoint-test"));
  assert.match(setting(ENDPOINT.name), /release-model/);
  assert.equal(globalThis.document.cookie, "", "failure node: endpoint save did not write document.cookie");
  globalThis.localStorage.setItem("agent-m:other/instance:endpoint:release", JSON.stringify({ ...ENDPOINT, model: "other-model" }));
  await first.page.go("#endpoints/release");
  assert.equal(first.main.querySelector(".endpoint-model").value, ENDPOINT.model, "the actual route reads only this instance namespace, never other/instance");
  assert.match(globalThis.localStorage.getItem("agent-m:other/instance:endpoint:release"), /other-model/, "the second instance record remains isolated in the same browser storage");
});

// TST-292006
// Module: MOD-dashboard-app → MOD-settings-pages → MOD-endpoint-calls
// Level: release
// Guards: UC-003; A CREDENTIAL IS NEVER PLACED IN A URL; NO SECRET IN THE REPOSITORY
// Precondition: an author has supplied an optional key on the public endpoint form.
// Input: Save and test reaches the controlled endpoint.
// Expected: the key is confined to Authorization; no repository write or request URL contains it.
// Planted fault: moving the key into endpointUrl in src/endpoint-calls/index.mjs makes the URL assertion fail.
test("TST-292006: an endpoint credential stays out of URLs and repository writes", async () => {
  let observed = null;
  const { server, main } = await openEndpointDashboard({ handlers: [async (url, init) => {
    if (url.href !== `${ENDPOINT.url}/chat/completions`) return null;
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
// Module: MOD-dashboard-app → MOD-settings-pages → MOD-endpoint-calls
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
// Module: MOD-dashboard-app → MOD-settings-pages → MOD-browser-store
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
// Module: MOD-dashboard-app → MOD-settings-pages → MOD-browser-store
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
  const key = main.querySelector(".endpoint-key");
  assert.equal(key.type, "password");
  await press(server, main.querySelector(".endpoint-show"));
  assert.equal(key.type, "text", "Show reveals the real password control only after the author's click");
  fill(main, BRIDGED);
  main.querySelector(".endpoint-through-bridge").checked = true;
  await press(server, action);
  assert.match(main.querySelector(".endpoint-result").textContent, /Bridge setup/i);
  assert.equal(direct, 0, "failure node: throughBridge returns before MOD-endpoint-calls");
  assert.match(setting(BRIDGED.name), /throughBridge/);
});
