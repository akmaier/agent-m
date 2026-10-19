// Edit of the instance's resources on the Settings page, from a product's page (ITM-1042) — MOD-settings-pages: "A repository setting has a summary and *Edit*, opening its form
// here or the page where it is kept", and the module's route `resources`, "a product's or the instance's resources", the instance's where the page names no product.
// Run: node --test tests/settings-pages-instance-resources-edit.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-042; UC-040; EVERY SETTING IS REACHED FROM ONE PAGE
// Level: unit
//
// The page is drawn by MOD-site-frame's real startPage in the small DOM of tests/site-frame-dom.mjs, at the fragment of a product the browser keeps, so that the `go` the Settings page
// receives is the frame's own, which writes the fragment. The real Settings route is drawn by a probe route of this test with fixture hosts for the instance and the product (nothing
// reaches the network); the route `resources` is a recorder that notes the product the frame hands it. Reading the test takes: the instance's resources are opened when the frame
// hands the route `resources` no product.
//
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import "./site-frame-dom.mjs";

const { startPage } = await import("../src/site-frame/index.mjs");
const { view: settingsView } = await import("../src/settings-pages/index.mjs");
const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");

const turn = () => new Promise((resolve) => setImmediate(resolve));
const settled = async () => { for (let count = 0; count < 8; count += 1) await turn(); };
const descendants = (root, match) => {
  const found = [];
  (function walk(node) { for (const child of node.childNodes) if (child.nodeType === 1) { if (match(child)) found.push(child); walk(child); } })(root);
  return found;
};
const byClass = (root, name) => descendants(root, (node) => node.className.split(" ").includes(name));
const storage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key),
    get length() { return values.size; }, key: (index) => [...values.keys()][index] ?? null };
};
const fixtureHost = () => ({
  async repositoryInfo() { return { defaultBranch: "main", canWrite: false, visibility: "private" }; },
  async readSnapshot() { return { commit: "1".repeat(40), paths: [], blob: () => null, async read() { return null; } }; },
});

// TST-104204 · level: unit · module: MOD-settings-pages
// guards: UC-042 (step 3); UC-040 (the instance's own list); EVERY SETTING IS REACHED FROM ONE PAGE
// given: the frame started at the Settings page of a product the browser keeps, whose view holds the real Settings route and a recorder of the route resources
// input: the person opens the tab Repositories and presses Edit on the instance's Resources line; the frame answers the new fragment
// expect: known positive — the product's own Resources line, pressed the same way, makes the recorder see the product; Edit of the instance's line makes it see no product (null)
test("Edit of the instance's resources, pressed on a product's page, opens the instance's resources and not the product's", async () => {
  const product = "https://github.com/acme/product";
  const priorLocation = globalThis.location, priorStorage = globalThis.localStorage, priorAdd = window.addEventListener;
  const listeners = new Map();
  const location = { hostname: "fork-owner.github.io", pathname: "/fork-agent-m/index.html", hash: `#probe/product=${encodeURIComponent(product)}` };
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage() });
  writeSetting(openStore("fork-owner/fork-agent-m"), "products", [product]);
  window.addEventListener = (type, listener) => listeners.set(type, listener);
  // The frame's page checks (MOD-notifications) repeat by the clock; here they must not keep the process alive.
  const priorInterval = globalThis.setInterval;
  globalThis.setInterval = (...given) => { const timer = priorInterval(...given); timer.unref?.(); return timer; };
  const seen = [];
  const realSettings = settingsView.routes.find((candidate) => candidate.name === "settings");
  const views = [{ strategies: [], routes: [
    { name: "probe", entry: null, title: "Probe", async render(target, context, params) {
      await realSettings.render(target, { ...context, instance: { ...context.instance, host: fixtureHost() }, product: context.product && { ...context.product, host: fixtureHost() } }, params);
    } },
    { name: "resources", entry: null, title: "Resources", async render(target, context) { seen.push(context.product?.address ?? null); target.replaceChildren(); } },
  ] }];
  try {
    await startPage({ page: "main", views, menuViews: [] });
    await settled();
    const target = byClass(document.body, "site-frame-route")[0];
    byClass(target, "settings-tab")[1].dispatchEvent(new Event("click"));
    await settled();
    const editOf = (section) => descendants(byClass(target, section)[0], (node) => node.localName === "button" && node.className.includes("settings-repository-setting-edit") && node.parentNode.textContent.startsWith("Resources"))[0];
    editOf("settings-product-settings").dispatchEvent(new Event("click"));
    await listeners.get("hashchange")();
    assert.deepEqual(seen, [product], "known positive: the product's own line opens the product's resources");
    location.hash = `#probe/product=${encodeURIComponent(product)}`;
    await listeners.get("hashchange")();
    await settled();
    byClass(target, "settings-tab")[1].dispatchEvent(new Event("click"));
    await settled();
    editOf("settings-instance-settings").dispatchEvent(new Event("click"));
    await listeners.get("hashchange")();
    assert.deepEqual(seen, [product, null], `the instance's line opens the instance's resources (fragment ${location.hash})`);
  } finally {
    document.body.replaceChildren();
    Object.defineProperty(globalThis, "location", { configurable: true, value: priorLocation });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: priorStorage });
    window.addEventListener = priorAdd;
    globalThis.setInterval = priorInterval;
  }
});
