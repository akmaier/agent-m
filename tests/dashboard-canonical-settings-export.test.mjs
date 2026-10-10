// TST-288101
// level: component
// module: MOD-settings-pages
// guards: UC-042; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPORT STATES THAT IT CONTAINS SECRETS; AN EXPORT CAN BE LOCKED WITH A PASSPHRASE
// given: the actual dashboard Settings section and canonical endpoint, Bridge, jump-host, and remote-session browser records
// input: the person opens that public section, downloads its canonical export, clears those four browser records, and imports that file.
// expect: one public control states the secret grants, downloads every delivered record, restores their exact bytes, and writes no repository.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument } from "./app-harness.mjs";

const INSTANCE = "akmaier/agent-m";
const key = (name) => `agent-m:${INSTANCE}:${name}`;
const byClass = (root, name) => {
  const found = [];
  const visit = (node) => { for (const child of node.children ?? []) { if (typeof child !== "object") continue; if (child.className?.split(" ").includes(name)) found.push(child); visit(child); } };
  visit(root); return found;
};

test("TST-288101: dashboard Settings exports and restores every delivered setup secret through its canonical route", async () => {
  const entries = {
    [key("endpoint:campus")]: JSON.stringify({ url: "https://models.example.test/v1", kind: "openai-compatible", model: "campus", key: "endpoint-secret", throughBridge: false }),
    [key("bridge")]: JSON.stringify({ address: "https://bridge.example.test", token: "bridge-secret" }),
    [key("jump-host")]: JSON.stringify({ hostname: "jump.example.test", user: "agent", sshPort: 22, portRange: [40100, 40199], login: { user: "web", password: "jump-secret" } }),
    [key("remote-session:gpu")]: JSON.stringify({ port: 40100, token: "session-secret" }),
  };
  const server = await repoServer({ files: {} });
  const page = await openDashboard({ server, hash: "#uc", entries });
  const dom = richDocument(), main = dom.byId("main"), replace = main.replaceChildren.bind(main);
  let mounted = [];
  main.replaceChildren = (...children) => { mounted = children; replace(...children); };
  await page.go("#settings");
  const route = mounted.find((node) => node.className === "settings-tab-panel" && /General/.test(node.textContent));
  assert.ok(route, "actual dashboard dispatch mounts the public General tab");
  assert.match(route.textContent, /Export and import settings/);
  assert.match(route.textContent, /Endpoint: campus.*Bridge.*Jump host.*Remote session: gpu/s);
  assert.match(route.textContent, /contains every stored token, key and password/);
  assert.equal(page.main().includes('id="export-go"') || page.main().includes('id="import-go"'), false, "the dashboard no longer renders its duplicate legacy export controls");
  const downloads = [], oldUrl = globalThis.URL;
  globalThis.URL = { createObjectURL(blob) { downloads.push(blob); return "blob:controlled-settings"; }, revokeObjectURL() {} };
  try { await byClass(route, "settings-export-download")[0].fire("click"); } finally { globalThis.URL = oldUrl; }
  assert.equal(downloads.length, 1, "the public Settings control creates its one controlled download");
  const exported = await downloads[0].text();
  const expected = Object.fromEntries(Object.entries(entries).map(([stored, raw]) => [stored.slice(key("").length), JSON.parse(raw)]));
  for (const [name, value] of Object.entries(expected)) assert.deepEqual(JSON.parse(exported).settings[name], value, `${name} is present in the canonical download`);
  for (const stored of Object.keys(entries)) globalThis.localStorage.removeItem(stored);
  const file = byClass(route, "settings-import-file")[0];
  file.files = [{ text: async () => exported }];
  await file.fire("change");
  for (const [stored, raw] of Object.entries(entries)) assert.equal(globalThis.localStorage.getItem(stored), raw, `${stored} is restored by the public import control`);
  assert.match(byClass(route, "settings-import-result")[0].textContent, /Added:.*endpoint:campus.*bridge.*jump-host.*remote-session:gpu/s);
  assert.deepEqual(server.writes, [], "opening, exporting, and importing settings does not write the selected repository");
});
