// The dashboard's endpoint-settings composition (Sprint 09, between/09-endpoint-settings).
// Run: node --test tests/dashboard-endpoint-settings-wiring.test.mjs
//
// Module: MOD-settings-pages · MOD-browser-store · MOD-site-frame
// Level: component
// Guards: UC-003; UC-001; UC-047; EVERY SETTING IS REACHED FROM ONE PAGE
//
// Counter-proof: with the completed wiring, removing renderSection's public settings-route call
// failed TST-290 while TST-291 passed; suppressing dashboard-app's `#endpoints` dispatch failed
// TST-291 while TST-290 passed. Both faults were restored before this commit.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument } from "./app-harness.mjs";

const INSTANCE = "akmaier/agent-m";
const ENDPOINT_KEY = `agent-m:${INSTANCE}:endpoint:campus`;
const ENDPOINT = {
  url: "https://models.example.test/v1",
  kind: "openai-compatible",
  model: "tiny-model",
  key: "endpoint-key-kept-in-this-browser",
  throughBridge: false,
};

// TST-290
// Module: MOD-settings-pages · MOD-browser-store · MOD-site-frame
// Level: component
// Guards: UC-003; UC-001; UC-047; EVERY SETTING IS REACHED FROM ONE PAGE
// Precondition: this dashboard browser already stores one direct endpoint under MOD-browser-store's instance key.
// Input: the author opens the dashboard's public Settings entry.
// Expected: the Settings page retains the legacy browser and notification areas and renders the endpoint slice in its own
//           endpoints container, where the creation and named-edit controls reach the public UC-003 route.
test("TST-290: Settings composes the stored endpoint slice beside legacy browser settings", async () => {
  const server = await repoServer({ files: {} });
  const page = await openDashboard({ server, hash: "#uc", entries: { [ENDPOINT_KEY]: JSON.stringify(ENDPOINT) } });
  richDocument();

  await page.go("#settings");

  const html = page.main();
  assert.match(html, /General/, "the public route replaces the legacy browser-settings mount");
  assert.match(html, /Usability/, "the public route keeps UC-047 in its named tab");
  assert.match(html, /Endpoints &amp; Agents/, "the endpoint slice has its named public tab");
  assert.match(html, /Endpoint: campus/, "the public endpoint settings route reaches the stored endpoint");
  assert.match(html, /tiny-model/, "the endpoint slice reads the canonical browser-store record");
});

// TST-291
// Module: MOD-settings-pages · MOD-browser-store
// Level: component
// Guards: UC-003; EVERY SETTING IS REACHED FROM ONE PAGE
// Precondition: this browser stores one endpoint under the instance's canonical browser-store key.
// Input: the author opens the public creation route, then the same route with the endpoint name as its only parameter.
// Expected: creation renders the public endpoint form, and named editing loads that endpoint without a dashboard-specific form.
test("TST-291: dashboard dispatches public endpoint creation and named editing routes", async () => {
  const server = await repoServer({ files: {} });
  const page = await openDashboard({ server, hash: "#uc", entries: { [ENDPOINT_KEY]: JSON.stringify({ ...ENDPOINT, key: undefined }) } });
  richDocument();

  await page.go("#endpoints");
  assert.match(page.main(), /Configure a model endpoint/, "the creation address reaches MOD-settings-pages' public form");
  await page.go("#endpoints/campus");
  assert.match(page.main(), /Configure a model endpoint/, "the named address stays on the same public form");
  assert.match(page.main(), /tiny-model/, "the named address supplies only campus to load its browser-store record");
});
