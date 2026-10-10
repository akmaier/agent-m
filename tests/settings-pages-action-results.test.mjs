// Module: MOD-settings-pages
// Level: component
// Guards: UC-042; A CLEAR IS A REAL CLEAR; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN

import test from "node:test";
import assert from "node:assert/strict";
import { openDashboard, repoServer, richDocument, press, settle } from "./app-harness.mjs";

const INSTANCE = "akmaier/agent-m";
const key = (name) => `agent-m:${INSTANCE}:${name}`;
const product = "https://github.com/alice/thesis-tool";
const token = "github_pat_COMPONENT0123456789abcdef";
const controls = (root, className, found = []) => {
  for (const child of root?.children ?? []) {
    if (typeof child !== "object") continue;
    if (child.className?.split(" ").includes(className)) found.push(child);
    controls(child, className, found);
  }
  return found;
};

async function publicSettings({ entries = {}, handlers = [], selectedProduct = null } = {}) {
  const server = await repoServer({ files: {}, handlers });
  const page = await openDashboard({ server, search: selectedProduct ? `?product=${encodeURIComponent(selectedProduct)}` : "", hash: "#uc", entries });
  const dom = richDocument();
  const main = dom.byId("main"), replace = main.replaceChildren.bind(main);
  let mounted = [];
  main.replaceChildren = (...nodes) => { mounted = nodes; replace(...nodes); };
  await page.go("#settings");
  const pane = (name) => mounted.find((node) => node.className === "settings-tab-panel" && node.textContent.includes(name));
  return { page, server, pane };
}

// TST-290125
// Module: MOD-settings-pages
// Level: component
// Guards: UC-042; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// Precondition: a chosen product's repository refuses its browser token on the Settings reload.
// Input: the person opens the dashboard's public Settings route.
// Expected: Settings still mounts the Repositories pane and exposes the stored token's refused state and renewal path.
test("TST-290125: refused product metadata does not replace public Settings with a route warning", async () => {
  const { pane } = await publicSettings({
    entries: {
      [key("products")]: JSON.stringify([product]),
      [key("github-token:alice/thesis-tool")]: JSON.stringify({ value: token, name: "Product token", expires: "2027-02-01" }),
      [key("last-test:github-token:alice/thesis-tool")]: JSON.stringify({ at: "2026-10-10T18:00:00.000Z", outcome: "refused" }),
    },
    selectedProduct: product,
    handlers: [(url, init) => (url.origin === "https://api.github.com" && init.headers?.Authorization === `Bearer ${token}`
      ? new Response(JSON.stringify({ message: "Bad credentials" }), { status: 401, headers: { "content-type": "application/json" } }) : undefined)],
  });
  const repositories = pane("Repositories");
  assert.ok(repositories, "failure node: route.render keeps the public Repositories pane mounted after product metadata refusal");
  assert.match(repositories.textContent, /Refused/, "the stored refusal remains visible where the token is shown");
  assert.match(repositories.textContent, /Renew token/, "the public token row retains its renewal path");
});

// TST-290126
// Module: MOD-settings-pages
// Level: component
// Guards: UC-042; A CLEAR IS A REAL CLEAR; EVERY SETTING IS REACHED FROM ONE PAGE
// Precondition: this browser holds one managed product and its product token.
// Input: the person confirms Clear in the public Repositories pane.
// Expected: the canonical product and token records are removed and the mounted product list redraws empty.
test("TST-290126: product Clear redraws the public managed-product list", async () => {
  const priorConfirm = globalThis.confirm;
  globalThis.confirm = () => true;
  try {
    const { pane, server } = await publicSettings({ entries: {
      [key("products")]: JSON.stringify([product]),
      [key("github-token:alice/thesis-tool")]: JSON.stringify({ value: token, name: "Product token", expires: "2027-02-01" }),
    } });
    const repositories = pane("Repositories");
    const products = controls(repositories, "settings-repository").find((node) => /Managed products/.test(node.textContent));
    assert.ok(products, "known positive: the public Repositories pane contains the populated Managed products section");
    assert.equal(controls(repositories, "settings-product-list-item").length, 1, "known positive: the product row is mounted before Clear");
    const clear = controls(products, "settings-repository-clear")[0];
    await press(server, clear);
    await settle(server);
    assert.equal(globalThis.localStorage.getItem(key("products")), null, "failure node: product list storage is cleared");
    assert.equal(globalThis.localStorage.getItem(key("github-token:alice/thesis-tool")), null, "the product token is cleared with its address");
    assert.equal(controls(pane("Repositories"), "settings-product-list-item").length, 0, "failure node: the public mounted list redraws without cleared rows");
  } finally { globalThis.confirm = priorConfirm; }
});

// TST-290127
// Module: MOD-settings-pages
// Level: component
// Guards: UC-042; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// Precondition: a public remote-session setting has a forwarded port and copied Bridge token.
// Input: the person uses its Test control after the controlled bridge answers, then reloads Settings.
// Expected: Test records canonical last-test state and the reloaded public line shows the saved outcome.
test("TST-290127: remote-session Test persists its public result for reload", async () => {
  const { pane, server } = await publicSettings({ entries: {
    [key("remote-session:lab")]: JSON.stringify({ port: 20001, token: "copied-bridge-token" }),
  }, handlers: [(url) => (url.href === "http://localhost:20001/v1/pair" ? new Response("", { status: 200 }) : undefined)] });
  const session = controls(pane("Endpoints & Agents"), "settings-remote-session")[0];
  await press(server, controls(session, "settings-remote-session-test")[0]);
  await settle(server);
  const saved = JSON.parse(globalThis.localStorage.getItem(key("last-test:remote-session:lab")));
  assert.equal(saved.outcome, "working", "failure node: Test records its canonical working result");
  const reloaded = await publicSettings({ entries: Object.fromEntries(Array.from({ length: globalThis.localStorage.length }, (_, index) => {
    const stored = globalThis.localStorage.key(index); return [stored, globalThis.localStorage.getItem(stored)];
  })) });
  assert.match(controls(reloaded.pane("Endpoints & Agents"), "settings-remote-session")[0].textContent, /Last successful test/, "the public line reloads its persisted result");
});
