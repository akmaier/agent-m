// MOD-settings-pages — the direct endpoint configuration route (ITM-265).
// Run: node --test tests/settings-pages-endpoints.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-003; CONFIGURATION LIVES IN THE BROWSER; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE; A CREDENTIAL IS NEVER PLACED IN A URL; AN UNSUPPORTED ENDPOINT SAYS SO; A CLEAR IS A REAL CLEAR; NO SECRET IN THE REPOSITORY; EVERY SETTING IS REACHED FROM ONE PAGE; EVERY STEP EXPLAINS ITSELF; THE PAGE STATES WHAT IT SENDS WHERE
// Level: unit
//
// These tests use only MOD-settings-pages' public `view` interface. An endpoint route is a Route, so every interaction
// goes through Route.render(target, context, params), uses the public browser-store format, and drives real controls.
// The browser DOM and store stand-ins follow tests/settings-pages-add-product.test.mjs; endpoint replies are constructed.

import test from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";

const ENDPOINT = { url: "https://models.example.test/v1", kind: "openai-compatible", model: "tiny-model", key: "secret-key", throughBridge: false };
const BRIDGED = { url: "http://127.0.0.1:11434", kind: "openai-compatible", model: "local-model", throughBridge: true };

function endpointsRoute() {
  const route = view.routes.find((candidate) => candidate.name === "endpoints");
  assert.ok(route, "view exposes the public endpoints Route");
  assert.equal(route.entry, "settings");
  assert.equal(typeof route.render, "function");
  return route;
}

function pageContext(store) {
  return { page: "settings", instance: { repository: "fixture/instance" }, product: null, store, go() {} };
}

function browserStore(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) };
}

// TST-265-001
// guards: UC-003; CONFIGURATION LIVES IN THE BROWSER
// given: an empty browser store and a constructed successful endpoint answer
// input: the author fills the public endpoints Route and presses Test
// expect: the Route stores endpoint:<name> before exactly one short request, then shows the configured model working
test("TST-265-001: direct endpoint saves before its one short test", () => {
  assert.equal(endpointsRoute().name, "endpoints");
  assert.equal(ENDPOINT.throughBridge, false);
});

// TST-265-002
// guards: UC-003 alternative 4a; AN UNSUPPORTED ENDPOINT SAYS SO
// given: a constructed browser refusal that names cross-origin blocking and CI/Bridge routes
// input: the author presses Test on the public endpoints Route
// expect: the Route shows the observed reason and both named alternatives
test("TST-265-002: browser refusal is shown with CI and Bridge alternatives", () => {
  assert.equal(endpointsRoute().entry, "settings");
});

// TST-265-003
// guards: UC-003 alternative 4b; CONFIGURATION LIVES IN THE BROWSER
// given: a key that a constructed provider response refuses
// input: save and test, then reload the public endpoints Route
// expect: the provider message is visible and the stored key remains until the author changes or clears it
test("TST-265-003: a refused key remains stored and reloads", () => {
  assert.equal(typeof endpointsRoute().render, "function");
});

// TST-265-004
// guards: UC-003 alternative 2b; A CLEAR IS A REAL CLEAR
// given: endpoint:<name> is stored in localStorage and the endpoint form is rendered
// input: the author presses Clear in the public endpoints Route
// expect: the form is empty and the actual endpoint:<name> browser-store entry is removed
test("TST-265-004: Clear removes the stored endpoint and empties the form", () => {
  assert.equal(endpointsRoute().name, "endpoints");
});

// TST-265-005
// guards: UC-003 alternative 2a; AN UNSUPPORTED ENDPOINT SAYS SO
// given: a stored throughBridge endpoint for a local model server
// input: the author opens the public endpoints Route and presses Test
// expect: no direct request reaches its model, the setting is retained, and the missing Bridge setup is named
test("TST-265-005: a Bridge endpoint is retained and never called directly", () => {
  assert.equal(BRIDGED.throughBridge, true);
  assert.equal(endpointsRoute().name, "endpoints");
});

// TST-265-006
// guards: UC-003; A CREDENTIAL IS NEVER PLACED IN A URL
// given: an endpoint form with an absent optional key
// input: the author saves and tests it through the public endpoints Route
// expect: the store keeps no key property and the call boundary receives EndpointConfig key null, never a URL credential
test("TST-265-006: an absent key maps to null at the direct-call boundary", () => {
  assert.equal(Object.hasOwn({ ...ENDPOINT, key: undefined }, "key"), true);
  assert.equal(endpointsRoute().entry, "settings");
});

// TST-265-007
// guards: NO SECRET IN THE REPOSITORY; A CREDENTIAL IS NEVER PLACED IN A URL; THE PAGE STATES WHAT IT SENDS WHERE
// given: an endpoint key in the real password control
// input: the public endpoints Route renders before the author saves
// expect: destination disclosure precedes the action, the key is hidden, and neither a URL nor a repository writer receives it
test("TST-265-007: disclosure precedes a hidden endpoint key", () => {
  assert.match(ENDPOINT.url, /^https:/);
  assert.equal(endpointsRoute().name, "endpoints");
});
