// The dashboard's Bridge-settings composition (ITM-280).
// Run: node --test tests/dashboard-bridge-settings-wiring.test.mjs
//
// Module: MOD-settings-pages · MOD-browser-store
// Level: component
// Guards: UC-003; UC-044; EVERY SETTING IS REACHED FROM ONE PAGE

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument } from "./app-harness.mjs";

const INSTANCE = "akmaier/agent-m";
const BRIDGE_KEY = `agent-m:${INSTANCE}:bridge`;
const BRIDGE = { address: "http://127.0.0.1:4711", token: "copied-pairing-token" };

async function mountedSettings(entries = {}) {
  const server = await repoServer({ files: {} });
  const page = await openDashboard({ server, hash: "#uc", entries });
  richDocument();
  await page.go("#settings");
  return { page };
}

// TST-280003
// Module: MOD-settings-pages · MOD-browser-store
// Level: component
// Guards: UC-003; UC-044; EVERY SETTING IS REACHED FROM ONE PAGE
// Precondition: the dashboard browser has no endpoint, Bridge, or jump-host setting.
// Input: the person opens Settings and presses Configure the Agent M Bridge.
// Expected: the existing endpoint-first, two-child Settings mount is retained; the new control selects #bridge; and the
//           dashboard's actual dispatcher renders MOD-settings-pages' public Bridge Route.
test("TST-280003: empty Settings reaches the public Bridge configuration route", async () => {
  const { page } = await mountedSettings();

  assert.match(page.main(), /Endpoints &amp; Agents/, "the public Settings Route owns the Bridge entry point");
  assert.match(page.main(), /Configure the Agent M Bridge/, "empty Settings offers Bridge configuration without seeded browser storage");
  await page.go("#bridge");
  assert.match(page.main(), /Connect a Bridge/, "failure node: #bridge dispatches to MOD-settings-pages' public Bridge Route");
  assert.match(page.main(), /Pairing token/, "the public route, rather than a dashboard-local form, owns pairing input");
});

// TST-280004
// Module: MOD-settings-pages · MOD-browser-store
// Level: component
// Guards: UC-044; CONFIGURATION LIVES IN THE BROWSER; EVERY SETTING IS REACHED FROM ONE PAGE
// Precondition: this dashboard browser stores a successful Bridge pairing in MOD-browser-store's canonical instance key.
// Input: the person opens Settings and presses the saved Bridge setting's Change control.
// Expected: Change uses the adapter's context.go to select #bridge, whose public route reloads the stored Bridge address;
//           no dashboard-specific form or endpoint request is needed.
test("TST-280004: saved Bridge Change reaches the public route through dashboard go", async () => {
  const { page } = await mountedSettings({ [BRIDGE_KEY]: JSON.stringify(BRIDGE) });

  assert.match(page.main(), /Bridge/, "the public Settings route renders the stored Bridge entry");
  await page.go("#bridge");
  assert.match(page.main(), new RegExp(BRIDGE.address.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "the public Bridge Route reloads the canonical browser-store address");
});
