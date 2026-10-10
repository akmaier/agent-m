// Module: MOD-settings-pages · MOD-browser-store
// Level: component
// Guards: UC-042; CONFIGURATION LIVES IN THE BROWSER; EVERY SETTING IS REACHED FROM ONE PAGE

import test from "node:test";
import assert from "node:assert/strict";
import { openDashboard, repoServer, richDocument, press, settle } from "./app-harness.mjs";

const INSTANCE = "akmaier/agent-m";
const key = (name) => `agent-m:${INSTANCE}:${name}`;
const controls = (root, className, found = []) => {
  for (const child of root?.children ?? []) {
    if (typeof child !== "object") continue;
    if (child.className?.split(" ").includes(className)) found.push(child);
    controls(child, className, found);
  }
  return found;
};

async function settings(entries) {
  const server = await repoServer({ files: {} });
  const page = await openDashboard({ server, hash: "#uc", entries });
  const dom = richDocument(), main = dom.byId("main"), replace = main.replaceChildren.bind(main);
  let mounted = [];
  main.replaceChildren = (...nodes) => { mounted = nodes; replace(...nodes); };
  await page.go("#settings");
  const repositories = mounted.find((node) => node.className === "settings-tab-panel" && /Repositories/.test(node.textContent));
  const github = controls(repositories, "settings-repository").find((node) => /GitHub token/.test(node.textContent));
  return { server, github };
}

// TST-290128
// Module: MOD-settings-pages · MOD-browser-store
// Level: component
// Guards: UC-042; CONFIGURATION LIVES IN THE BROWSER; EVERY SETTING IS REACHED FROM ONE PAGE
// Precondition: this browser has the public Settings GitHub-token row and no shared-origin acknowledgement.
// Input: the person presses Change, explicitly ticks I have read this, reloads Settings, then unchecks it.
// Expected: the accepted canonical acknowledgement date is stored only by the tick, restores the checkbox on reload,
// and unchecking removes its browser record without a repository write.
test("TST-290128: shared-origin acknowledgement persists only for the explicit checkbox choice", async () => {
  const first = await settings({});
  const change = controls(first.github, "settings-repository-change")[0];
  const acknowledgement = controls(first.github, "settings-repository-ack")[0];
  await press(first.server, change);
  assert.equal(globalThis.localStorage.getItem(key("acknowledged:shared-origin")), null, "opening Change does not store an acknowledgement");
  acknowledgement.checked = true;
  await acknowledgement.fire("change");
  await settle(first.server);
  const recorded = JSON.parse(globalThis.localStorage.getItem(key("acknowledged:shared-origin")));
  assert.match(recorded, /^\d{4}-\d{2}-\d{2}$/, "the explicit tick stores the canonical acknowledgement date");
  const entries = Object.fromEntries(Array.from({ length: globalThis.localStorage.length }, (_, index) => {
    const stored = globalThis.localStorage.key(index); return [stored, globalThis.localStorage.getItem(stored)];
  }));
  const reloaded = await settings(entries);
  const restored = controls(reloaded.github, "settings-repository-ack")[0];
  assert.equal(restored.checked, true, "the public Settings row restores the recorded acknowledgement");
  restored.checked = false;
  await restored.fire("change");
  assert.equal(globalThis.localStorage.getItem(key("acknowledged:shared-origin")), null, "unchecking removes the acknowledgement record");
});
