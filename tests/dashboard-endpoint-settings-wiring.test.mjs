// The dashboard's endpoint-settings composition (Sprint 09, between/09-endpoint-settings).
// Run: node --test tests/dashboard-endpoint-settings-wiring.test.mjs
//
// Module: MOD-settings-pages · MOD-browser-store · MOD-dashboard-app
// Level: component
// Guards: UC-003; UC-001; UC-047; EVERY SETTING IS REACHED FROM ONE PAGE
//
// Counter-proof: recorded with this test's red first commit. Removing the public Settings
// route call leaves the endpoint setting absent from the dashboard page while the legacy
// UC-001 and UC-047 controls still render.

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

// TST-09-ENDPOINT-WIRING-001
// Precondition: this dashboard browser already stores one direct endpoint under MOD-browser-store's instance key.
// Input: the author opens the dashboard's public Settings entry.
// Expected: the Settings page retains the legacy browser and notification areas and renders the endpoint slice in its own
//           endpoints container, where the stored endpoint is reachable for UC-003.
test("TST-09-ENDPOINT-WIRING-001: Settings composes the stored endpoint slice beside legacy browser settings", async () => {
  const server = await repoServer({ files: {} });
  const page = await openDashboard({ server, hash: "#uc", entries: { [ENDPOINT_KEY]: JSON.stringify(ENDPOINT) } });
  richDocument();

  await page.go("#settings");

  const html = page.main();
  assert.match(html, /<div id="browser-settings"><\/div>/, "UC-001 browser settings remain on Settings");
  assert.match(html, /<div class="panel" id="notifications-settings"><\/div>/, "UC-047 notifications remain on Settings");
  assert.match(html, /<section class="panel" data-settings-section="endpoints">/, "the endpoint slice has its dedicated Settings container");
  assert.match(html, /Endpoint: campus/, "the public endpoint settings route reaches the stored endpoint");
  assert.match(html, /tiny-model/, "the endpoint slice reads the canonical browser-store record");
});
