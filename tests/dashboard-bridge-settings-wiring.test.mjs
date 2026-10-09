// The dashboard's Bridge-settings composition (ITM-280).
// Run: node --test tests/dashboard-bridge-settings-wiring.test.mjs
//
// Module: MOD-dashboard-app · MOD-settings-pages · MOD-browser-store
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
  const dom = richDocument();
  const main = dom.byId("main"), findSection = main.querySelector.bind(main);
  let mounted = [];
  main.querySelector = (selector) => selector === '[data-settings-section="endpoints"]'
    ? { replaceChildren(...children) { mounted = children; } }
    : findSection(selector);
  await page.go("#settings");
  return { page, mounted };
}

// TST-280003
// Module: MOD-dashboard-app · MOD-settings-pages · MOD-browser-store
// Level: component
// Guards: UC-003; UC-044; EVERY SETTING IS REACHED FROM ONE PAGE
// Precondition: the dashboard browser has no endpoint, Bridge, or jump-host setting.
// Input: the person opens Settings and presses Configure the Agent M Bridge.
// Expected: the existing endpoint-first, two-child Settings mount is retained; the new control selects #bridge; and the
//           dashboard's actual dispatcher renders MOD-settings-pages' public Bridge Route.
test("TST-280003: empty Settings reaches the public Bridge configuration route", async () => {
  const { page, mounted } = await mountedSettings();

  assert.equal(mounted.length, 2, "the existing two-child Settings mount is retained");
  assert.match(mounted[0].textContent, /Configure a model endpoint/, "the existing endpoint creation control remains first");
  const configureBridge = mounted[1].querySelector("button.settings-bridge-configure");
  assert.ok(configureBridge, "empty Settings offers Bridge configuration without seeded browser storage");

  await configureBridge.fire("click");
  assert.equal(globalThis.location.hash, "#bridge", "Configure delegates to the public Bridge route");
  await page.go("#bridge");
  assert.match(page.main(), /Pair your Agent M Bridge/, "failure node: #bridge dispatches to MOD-settings-pages' public Bridge Route");
  assert.match(page.main(), /Pairing token/, "the public route, rather than a dashboard-local form, owns pairing input");
});

// TST-280004
// Module: MOD-dashboard-app · MOD-settings-pages · MOD-browser-store
// Level: component
// Guards: UC-044; CONFIGURATION LIVES IN THE BROWSER; EVERY SETTING IS REACHED FROM ONE PAGE
// Precondition: this dashboard browser stores a successful Bridge pairing in MOD-browser-store's canonical instance key.
// Input: the person opens Settings and presses the saved Bridge setting's Change control.
// Expected: Change uses the adapter's context.go to select #bridge, whose public route reloads the stored Bridge address;
//           no dashboard-specific form or endpoint request is needed.
test("TST-280004: saved Bridge Change reaches the public route through dashboard go", async () => {
  const { page, mounted } = await mountedSettings({ [BRIDGE_KEY]: JSON.stringify(BRIDGE) });

  assert.equal(mounted.length, 2, "saved Bridge settings preserve the existing mount shape");
  const change = mounted[1].querySelector("button.settings-bridge-change");
  assert.ok(change, "the public Settings route renders the stored Bridge Change control");
  await change.fire("click");
  assert.equal(globalThis.location.hash, "#bridge", "failure node: saved Change uses context.go to select the dashboard Bridge dispatcher");
  await page.go("#bridge");
  assert.match(page.main(), new RegExp(BRIDGE.address.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "the public Bridge Route reloads the canonical browser-store address");
});
