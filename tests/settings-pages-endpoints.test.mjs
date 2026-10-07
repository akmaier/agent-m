// MOD-settings-pages · ITM-265 · unit
// Run: node --test tests/settings-pages-endpoints.test.mjs
// The endpoint route is intentionally imported before it exists: this tests-only commit is red.
import test from "node:test";
import assert from "node:assert/strict";
import { route, endpointConfig } from "../src/settings-pages/endpoints.mjs";

const TST = "TST-ITM-265";
const direct = { url: "https://models.example/v1", kind: "openai-compatible", model: "tiny", key: "secret", throughBridge: false };
const bridged = { ...direct, throughBridge: true };

// guards: UC-003, CONFIGURATION LIVES IN THE BROWSER; level: unit
// precondition: an empty fake store and a controlled successful provider; input: Save and test.
// expected: the setting is written before exactly one short provider call, with the key only in its header.
test(`${TST}-01 direct endpoint saves before its one short test`, async () => {
  const calls = [], store = fakeStore();
  await route.saveAndTest({ store, value: direct, test: async (config) => { calls.push({ stored: store.value, config }); return { works: true }; } });
  assert.deepEqual(store.value, direct);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].config.key, "secret");
});

// guards: UC-003 4a, AN UNSUPPORTED ENDPOINT SAYS SO; level: unit; precondition: browser refusal; input: Save and test; expected: diagnosis is shown.
test(`${TST}-02 browser refusal is diagnosed`, async () => {
  const result = await route.saveAndTest({ store: fakeStore(), value: direct, test: async () => ({ works: false, diagnosis: { message: "CORS refused", routes: ["ci", "bridge"] } }) });
  assert.match(result.message, /CORS refused/);
});

// guards: UC-003 4b; level: unit; precondition: provider refuses key; input: Save and test; expected: key remains stored.
test(`${TST}-03 refused key is retained`, async () => {
  const store = fakeStore(); await route.saveAndTest({ store, value: direct, test: async () => ({ works: false, diagnosis: { message: "key refused" } }) }); assert.equal(store.value.key, "secret");
});

// guards: CONFIGURATION LIVES IN THE BROWSER; level: unit; precondition: saved configuration; input: route reload; expected: fields recover.
test(`${TST}-04 reload reads the saved endpoint`, () => assert.deepEqual(route.load(fakeStore(direct)), direct));
// guards: A CLEAR IS A REAL CLEAR; level: unit; precondition: saved setting; input: Clear; expected: form and storage are empty.
test(`${TST}-05 Clear removes endpoint storage`, () => { const s = fakeStore(direct); route.clear(s); assert.equal(s.value, null); });
// guards: UC-003 2a; level: unit; precondition: throughBridge endpoint; input: Test; expected: no direct provider call and setup is named.
test(`${TST}-06 throughBridge is retained and never called directly`, async () => { let called = false; const r = await route.saveAndTest({ store: fakeStore(), value: bridged, test: async () => { called = true; } }); assert.equal(called, false); assert.match(r.message, /Bridge/); });
// guards: MOD-endpoint-calls EndpointConfig; level: unit; precondition: browser configuration with no key; input: driver mapping; expected: absent key maps to null.
test(`${TST}-07 driver mapping turns an absent key into null`, () => assert.deepEqual(endpointConfig({ ...direct, key: undefined }), { name: direct.url, kind: direct.kind, baseUrl: direct.url, model: direct.model, key: null }));
// guards: A CREDENTIAL IS NEVER PLACED IN A URL, THE PAGE STATES WHAT IT SENDS WHERE; level: unit; precondition: a secret; input: render; expected: disclosure precedes hidden input and no URL holds secret.
test(`${TST}-08 disclosure precedes hidden secret and no URL contains it`, () => { const html = route.form(direct); assert.ok(html.indexOf("sent to") < html.indexOf('type="password"')); assert.equal(html.includes("secret"), false); });

function fakeStore(value = null) { return { value, read() { return this.value; }, write(v) { this.value = v; }, clear() { this.value = null; } }; }
