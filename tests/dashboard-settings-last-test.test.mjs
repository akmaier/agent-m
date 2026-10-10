// UC-042 public Settings outcome coverage.
// Module: MOD-settings-pages · MOD-browser-store
// Guards: UC-042; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; EVERY SETTING IS REACHED FROM ONE PAGE; A CLEAR IS A REAL CLEAR

import test from "node:test";
import assert from "node:assert/strict";
import { openDashboard, repoServer } from "./app-harness.mjs";

const instance = "akmaier/agent-m", key = (name) => `agent-m:${instance}:${name}`;
const walk = (root, className, found = []) => { for (const child of root?.children ?? []) { if (typeof child !== "object") continue; if (child.className?.split(" ").includes(className)) found.push(child); walk(child, className, found); } return found; };
const one = (root, className) => walk(root, className)[0];

async function settings(entries = {}) {
  const server = await repoServer({ files: {}, handlers: [(url) => url.origin === "https://api.github.com" ? new Response(JSON.stringify({ private: false, default_branch: "main" }), { status: 200, headers: { "content-type": "application/json" } }) : undefined] });
  const page = await openDashboard({ server, hash: "#uc", entries });
  const main = globalThis.document.getElementById("main"), replace = main.replaceChildren.bind(main); let mounted = [];
  main.replaceChildren = (...children) => { mounted = children; replace(...children); };
  await page.go("#settings");
  const pane = (name) => mounted.find((node) => node.className === "settings-tab-panel" && node.textContent.includes(name));
  return { main, pane };
}

test("UC-042: public Repositories reads the canonical repository last-test outcome", async () => {
  const { pane } = await settings({
    [key("github-token")]: JSON.stringify({ value: "github_pat_PUBLIC", name: "GitHub token", expires: "2027-01-01", stored: "2026-10-01" }),
    [key("last-test:github-token")]: JSON.stringify({ at: "2026-10-10T08:00:00.000Z", outcome: "working" }),
  });
  const repositories = pane("Repositories");
  assert.ok(repositories, "public Repositories is mounted");
  assert.match(repositories.textContent, /Works\. Last successful test: 2026-10-10T08:00:00.000Z/);
  assert.equal(globalThis.localStorage.getItem("agent-m.github-token-tested"), null, "the retired dashboard key is absent");
});

test("UC-042: public Repositories Clear removes token and canonical outcome", async () => {
  const prior = globalThis.confirm; globalThis.confirm = () => true;
  try {
    const { pane } = await settings({ [key("github-token")]: JSON.stringify({ value: "github_pat_PUBLIC", name: "GitHub token", expires: "2027-01-01" }), [key("last-test:github-token")]: JSON.stringify({ at: "2026-10-10T08:00:00.000Z", outcome: "refused" }) });
    const row = walk(pane("Repositories"), "settings-repository").find((node) => node.textContent.includes("GitHub token"));
    const clear = one(row, "settings-repository-clear"); assert.ok(clear, "public row exposes Clear");
    await clear.fire("click");
    assert.equal(globalThis.localStorage.getItem(key("github-token")), null);
    assert.equal(globalThis.localStorage.getItem(key("last-test:github-token")), null, "outcome is cleared with the token");
  } finally { globalThis.confirm = prior; }
});

test("UC-042: Settings exposes exactly its four public panes", async () => {
  const { main, pane } = await settings({ [key("endpoint:campus")]: JSON.stringify({ url: "https://models.example.test/v1", kind: "openai-compatible", model: "campus", key: "secret", throughBridge: false }) });
  assert.deepEqual(walk(main, "settings-tab").map((tab) => tab.textContent), ["General", "Repositories", "Endpoints & Agents", "Usability"]);
  assert.match(pane("Endpoints & Agents").textContent, /campus/);
  assert.equal(main.innerHTML.includes('id="browser-settings"') || main.innerHTML.includes('id="product-settings"'), false);
});
