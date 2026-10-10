// TST-290114
// Module: MOD-settings-pages · MOD-browser-store
// Level: component
// Guards: UC-042; UC-003; UC-017; UC-047; EVERY SETTING IS REACHED FROM ONE PAGE
// Given: the actual dashboard dispatcher and canonical browser settings for every Settings tab.
// Input: the person opens #settings and selects each public tab without submitting a form.
// Expected: dashboard-app dispatches directly to MOD-settings-pages' public Settings Route; all four named tabs have
//           accessible selected state; selecting a tab neither stores a setting nor asks notification permission.

import test from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.env.AGENT_M_290_ROOT ?? new URL("..", import.meta.url).pathname;
const { repoServer, openDashboard, richDocument } = await import(pathToFileURL(join(root, "tests", "app-harness.mjs")).href);

const INSTANCE = "akmaier/agent-m";
const key = (name) => `agent-m:${INSTANCE}:${name}`;
const descendants = (root, className) => {
  const found = [];
  const visit = (node) => {
    for (const child of node.children ?? []) {
      if (typeof child !== "object") continue;
      if (child.className?.split(" ").includes(className)) found.push(child);
      visit(child);
    }
  };
  visit(root);
  return found;
};

test("TST-290114: dashboard composes the public Settings tabs without a setting or permission side effect", async () => {
  const server = await repoServer({ files: {} });
  const page = await openDashboard({ server, hash: "#uc", entries: {
    [key("endpoint:main")]: JSON.stringify({ url: "https://models.example.test/v1", kind: "openai-compatible", model: "small", key: "endpoint-key", throughBridge: false }),
    [key("bridge")]: JSON.stringify({ address: "https://bridge.example.test", token: "bridge-token" }),
    [key("products")]: JSON.stringify(["https://github.com/fixture/product"]),
  } });
  const dom = richDocument();
  const main = dom.byId("main");
  const replace = main.replaceChildren.bind(main);
  let mounted = [];
  main.replaceChildren = (...children) => { mounted = children; replace(...children); };
  const before = [...Array(globalThis.localStorage.length).keys()].map((index) => [globalThis.localStorage.key(index), globalThis.localStorage.getItem(globalThis.localStorage.key(index))]);
  const priorNotification = globalThis.Notification;
  let permissions = 0;
  Object.defineProperty(globalThis, "Notification", { configurable: true, value: { permission: "default", requestPermission: async () => { permissions += 1; return "denied"; } } });
  try {
    await page.go("#settings");
    const settings = mounted.find((node) => node.localName === "div" && node.className === "settings-tabs");
    assert.ok(settings, "failure node: dashboard-app passes #settings to the public Settings Route");
    const tabs = descendants(settings, "settings-tab");
    assert.deepEqual(tabs.map((tab) => tab.textContent), ["General", "Repositories", "Endpoints & Agents", "Usability"], "failure node: #settings renders the public route's complete tab list");
    for (const [index, tab] of tabs.entries()) {
      await tab.fire("click");
      assert.equal(tab.getAttribute("role"), "tab");
      assert.equal(tab.getAttribute("aria-selected"), "true", `failure node: ${tab.textContent} is the selected accessible tab`);
      const visible = mounted.filter((node) => node.className === "settings-tab-panel" && !node.hidden);
      assert.equal(visible.length, 1, "exactly one panel is shown after a tab selection");
      assert.equal(visible[0].id, tab.getAttribute("aria-controls"), "the shown panel belongs to the selected tab");
    }
    let prevented = false;
    await tabs[0].fire("keydown", { key: "ArrowRight", preventDefault() { prevented = true; } });
    assert.equal(prevented, true, "the arrow-key tab action prevents the page-level key behavior");
    assert.equal(tabs[1].getAttribute("aria-selected"), "true", "failure node: ArrowRight selects the next Settings tab");
    assert.equal(dom.focused(), tabs[1], "failure node: keyboard tab selection moves focus to the selected tab");
    const after = [...Array(globalThis.localStorage.length).keys()].map((index) => [globalThis.localStorage.key(index), globalThis.localStorage.getItem(globalThis.localStorage.key(index))]);
    assert.deepEqual(after, before, "tab selection is presentation only and writes no browser setting");
    assert.equal(permissions, 0, "tab selection never requests notification permission");
    assert.equal(server.writes.length, 0, "tab selection writes no repository");
  } finally {
    Object.defineProperty(globalThis, "Notification", { configurable: true, value: priorNotification });
  }
});
