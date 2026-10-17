// Clear everything on the live Settings page removes every entry of Agent M after the page has read file texts
// (ITM-819). The real app (src/site-frame/dashboard-app.mjs) runs in tests/app-harness.mjs against a GitHub fake that records
// every request; the person reads a use case, so the page holds file texts, opens Settings, ticks the confirmation and presses
// Clear everything in this browser.
// Run: node --test tests/settings-pages-clear-everything-live.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-042
// Guards: A CLEAR IS A REAL CLEAR
// Level: component
//
// The expected results are written here from UC-042 step 6 ("Clear everything in this browser removes all of Agent M's entries
// from `localStorage`") and from A CLEAR IS A REAL CLEAR; none is read from a document. An entry of Agent M is a localStorage key
// that begins with `agent-m:akmaier/agent-m:`, the instance's prefix, or a Cache Storage named `agent-m-file-texts`, where an
// earlier version kept file texts.
// The callers read first (AGENTS.md 6a.1): tests/dashboard-review-flows.test.mjs:649 `publicSettingsPage` opens the live
// Settings page in this harness and :1129 presses Clear everything there; this file copies their pattern and adds the read of
// file texts before the press and the count of requests the press makes.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, fakeCaches, openDashboard, richDocument, press, settle, TOKEN } from "./app-harness.mjs";

const PREFIX = "agent-m:akmaier/agent-m:";
const USE_CASE = "docs/use-cases/UC-001-read-a-file.md";
const FILES = {
  [USE_CASE]: "---\nid: UC-001\ntitle: Read a file\narea: 1\nactors:\n  - Reader\nrealises: []\n---\n# UC-001 Read a file\n",
  "docs/use-cases/README.md": "# Use cases\n",
  "docs/approvals/README.md": "# Approval records\n",
};
const entriesOf = () => [...Array(globalThis.localStorage.length).keys()].map((index) => globalThis.localStorage.key(index)).filter((key) => key.startsWith(PREFIX));
const controls = (root, name, out = []) => { for (const child of root?.children ?? []) { if (typeof child !== "object") continue; if (child.className?.split(" ").includes(name)) out.push(child); controls(child, name, out); } return out; };

// The live page, opened on a use case so that it reads file texts, and then on Settings. `token`: the GitHub token stored, or null.
async function settingsAfterReading({ token }) {
  const caches = fakeCaches();
  const retired = await caches.open("agent-m-file-texts");
  await retired.put("old-file-text", new Response("a file text an earlier version kept"));
  const srv = await repoServer({ files: FILES });
  const entries = {
    ...(token ? { [`${PREFIX}github-token`]: JSON.stringify({ value: token, name: "GitHub token", expires: null, stored: "2026-10-17" }) } : {}),
    [`${PREFIX}products`]: JSON.stringify(["https://github.com/someone/product"]),
    [`${PREFIX}endpoint:main`]: JSON.stringify({ url: "https://models.example.test/v1", model: "small", key: "endpoint-key" }),
    [`${PREFIX}file-text:${"a".repeat(40)}`]: JSON.stringify("a file text an earlier version kept in localStorage"),
  };
  const page = await openDashboard({ server: srv, hash: "#uc/UC-001", token, entries, caches });
  const read = srv.requests.filter((request) => request.startsWith("file ") || request.startsWith("batch ")).length;
  const dom = richDocument(), createElement = globalThis.document.createElement.bind(globalThis.document), main = dom.byId("main"), replace = main.replaceChildren.bind(main);
  let mounted = [];
  globalThis.document.createElement = (name) => {
    const node = createElement(name);
    if (!("childNodes" in node)) Object.defineProperty(node, "childNodes", { get: () => node.children ?? [] });
    return node;
  };
  main.replaceChildren = (...children) => { mounted = children; replace(...children); };
  globalThis.confirm = () => true;
  await page.go("#settings");
  const pane = mounted.find((node) => node.className === "settings-tab-panel" && node.textContent.includes("General"));
  return { srv, caches, general: pane, read };
}

for (const [name, token] of [["with a token", TOKEN], ["without a token", null]]) {
  // TST-819001
  // level: component
  // module: MOD-settings-pages
  // guards: UC-042; A CLEAR IS A REAL CLEAR
  // given: the live page that has read a use case's file text, Agent M's settings in localStorage beside another site's entry, and a retired Cache Storage of file texts
  // input: open Settings, tick the confirmation, press Clear everything in this browser
  // expect: no localStorage key of Agent M's prefix and no Cache Storage is left, another site's entry stays, and the press sends no request
  test(`TST-819001 · Clear everything ${name} leaves no entry of Agent M after file texts were read, and sends no request`, async () => {
    const { srv, caches, general, read } = await settingsAfterReading({ token });
    globalThis.localStorage.setItem("another-site.setting", "kept");
    assert.ok(read > 0, "the page read file texts before Clear");
    assert.ok(entriesOf().length >= 3, "Agent M has entries before Clear, a kept file text among them");
    const acknowledgement = controls(general, "settings-clear-ack")[0], clear = controls(general, "settings-clear-everything")[0];
    assert.ok(clear, "the page offers Clear everything in this browser");
    acknowledgement.checked = true; acknowledgement.fire("change", {});
    const before = srv.requests.length;
    await press(srv, clear);
    assert.deepEqual(entriesOf(), [], "no localStorage entry of Agent M is left");
    assert.equal(caches.stores.size, 0, "no Cache Storage of file texts is left");
    assert.equal(globalThis.localStorage.getItem("another-site.setting"), "kept", "only Agent M's entries go");
    assert.equal(srv.requests.length - before, 0, "Clear everything sends no request");
  });
}
