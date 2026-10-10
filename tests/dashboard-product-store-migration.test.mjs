// Between-jobs dashboard migration.
// Module: MOD-browser-store
// Guards: UC-001; UC-047; CONFIGURATION LIVES IN THE BROWSER
// Level: component

import test from "node:test";
import assert from "node:assert/strict";
import { productStore } from "../docs/assets/product-store-adapter.mjs";
import { openStore, readSetting } from "../src/browser-store/index.mjs";

function routeDom(main) {
  const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const node = (name) => {
    const children = [], listeners = new Map(), attributes = new Map();
    const n = { localName: name, children, className: "", value: "", disabled: false, checked: false, type: "", placeholder: "", autocomplete: "",
      append(...items) { children.push(...items); }, replaceChildren(...items) { children.splice(0, children.length, ...items); },
      addEventListener(kind, fn) { listeners.set(kind, fn); }, dispatchEvent(event) { listeners.get(event.type)?.({ target: n, currentTarget: n }); },
      setAttribute(key, value) { attributes.set(key, value); }, get innerHTML() { return children.map(html).join(""); },
      set innerHTML(value) { n.replaceChildren(String(value)); },
      get textContent() { return children.map((x) => typeof x === "string" ? x : x.textContent).join(""); },
      set textContent(value) { n.replaceChildren(String(value)); },
      querySelector(selector) { return find(n, selector); }, focus() {},
    };
    return n;
  };
  const html = (n) => typeof n === "string" ? esc(n) : `<${n.localName}${n.className ? ` class="${n.className}"` : ""}${n.type ? ` type="${n.type}"` : ""}${n.value ? ` value="${esc(n.value)}"` : ""}>${n.innerHTML}</${n.localName}>`;
  const find = (n, selector) => { for (const child of n.children ?? []) { if (typeof child !== "string") { if (selector === "input.address" && child.localName === "input" && child.className === "address") return child; const found = find(child, selector); if (found) return found; } } return null; };
  Object.defineProperty(main, "children", { value: [] });
  main.append = (...items) => main.children.push(...items);
  main.replaceChildren = (...items) => { main.children.splice(0, main.children.length, ...items); };
  Object.defineProperty(main, "innerHTML", { configurable: true, get: () => main.children.map(html).join(""), set: (value) => main.replaceChildren(String(value)) });
  main.querySelector = (selector) => find(main, selector);
  globalThis.document.createElement = node;
}

function storage(entries = {}) {
  const values = new Map(Object.entries(entries));
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key), get length() { return values.size; }, key: (i) => [...values.keys()][i] ?? null };
}

// TST-265
// Module: MOD-browser-store
// Level: component
// given: a dashboard browser containing its established token, product list and product token
// input: open the dashboard adapter for that instance
// expect: the same values are available through MOD-browser-store's instance-prefixed catalogue
test("the dashboard migrates its product list and tokens into MOD-browser-store", () => {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage({
    "agent-m.github-token": "github_pat_INSTANCE", "agent-m.github-token-expires": "2027-01-01",
    "agent-m.products": JSON.stringify(["https://github.com/alice/tool"]),
    "agent-m.github-product-tokens": JSON.stringify({ "https://github.com/alice/tool": { token: "github_pat_PRODUCT", expires: "2027-02-01" } }),
  }) });
  const dashboard = productStore("akmaier/agent-m");
  const store = openStore("akmaier/agent-m");
  assert.equal(readSetting(store, "github-token").value, "github_pat_INSTANCE");
  // The established dashboard renewal/test callers write the canonical record after migration.
  dashboard.setToken("github_pat_INSTANCE", "2028-01-01");
  dashboard.setTokenTest({ ok: "2026-10-07" });
  assert.equal(readSetting(store, "github-token").expires, "2028-01-01", "renewal keeps its date in the canonical setting");
  assert.equal(readSetting(store, "last-test:github-token").outcome, "working", "the established Test caller keeps a canonical successful outcome");
  assert.deepEqual(readSetting(store, "products"), ["https://github.com/alice/tool"]);
  assert.equal(readSetting(store, "github-token:alice/tool").value, "github_pat_PRODUCT");
});

// TST-267
// Module: MOD-browser-store
// Level: component
// given: a legacy GitLab project token, including its last test, without a legacy product-list entry
// input: open the adapter, then import a second product through its established settings API
// expect: both addresses and token metadata remain visible to the settings/export API and MOD-browser-store
test("the adapter discovers token-only GitLab products and preserves imported public values", () => {
  const first = "https://gitlab.example.org/team/first", second = "https://gitlab.example.org/team/second";
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage({
    "agent-m.gitlab-tokens": JSON.stringify({ [first]: { token: "glpat_FIRST0123456789", expires: "2027-01-01", tested: { ok: "2026-10-07" } } }),
  }) });
  const dashboard = productStore("akmaier/agent-m"), store = openStore("akmaier/agent-m");
  assert.deepEqual(readSetting(store, "products"), [first]);
  assert.deepEqual(readSetting(store, "last-test:gitlab-token:gitlab.example.org/team/first"), { at: "2026-10-07", outcome: "working" });
  dashboard.putEntries({
    "agent-m.products": JSON.stringify([second]),
    "agent-m.gitlab-tokens": JSON.stringify({ [second]: { token: "glpat_SECOND012345678", expires: "2027-02-01", tested: { refused: true } } }),
  });
  assert.deepEqual(dashboard.getProducts(), [first, second]);
  const entries = dashboard.entries();
  assert.deepEqual(Object.keys(JSON.parse(entries["agent-m.gitlab-tokens"])).sort(), [first, second]);
  const canonicalSecond = readSetting(store, "gitlab-token:gitlab.example.org/team/second");
  assert.equal(canonicalSecond?.value, "glpat_SECOND012345678", "the imported token reaches MOD-browser-store's canonical record");
  assert.equal(canonicalSecond?.expires, "2027-02-01", "the imported expiry reaches MOD-browser-store's canonical record");
  const imported = dashboard.getGitLabToken(second);
  assert.equal(imported.token, "glpat_SECOND012345678", "the imported token remains visible through the established adapter");
  assert.equal(imported.expires, "2027-02-01", "the imported expiry remains visible through the established adapter");
  assert.deepEqual(imported.tested, { refused: true }, "the undated legacy refusal remains visible without inventing an observation time");
});

// TST-266
// Module: MOD-dashboard-app
// Level: integration
// given: an instance-prefixed GitHub token and the dashboard's established page harness
// input: navigate through the public dashboard entry to #add/<address>
// expect: MOD-settings-pages renders its actual route, prefills the address, and receives the instance token through its store
test("the dashboard #add entry renders the settings-pages route with its instance token", async () => {
  const { repoServer, openDashboard } = await import("./app-harness.mjs");
  const instance = "akmaier/agent-m", address = "https://github.com/alice/tool";
  const page = await openDashboard({ server: await repoServer({ files: { "SPEC.md": "# Agent M\n" } }), hash: "", token: "github_pat_INSTANCE" });
  const main = globalThis.document.getElementById("main");
  routeDom(main);
  await page.go(`#add/${encodeURIComponent(address)}`);
  const input = main.querySelector("input.address");
  assert.equal(input?.value, address, "the dashboard prefilled the actual settings-pages address field");
  assert.match(main.innerHTML, /Add a product/, "the settings-pages route rendered in the dashboard");
  assert.equal(readSetting(openStore(instance), "github-token")?.value, "github_pat_INSTANCE");
});

// TST-266A
// given: the public dashboard entry and an instance-prefixed canonical store
// input: navigate to #settings through the dashboard dispatcher
// expect: the current public Settings route, rather than the retired dashboard
// settings composition, is mounted with all four named panes.
test("the dashboard #settings entry mounts the public Settings route", async () => {
  const { repoServer, openDashboard } = await import("./app-harness.mjs");
  const page = await openDashboard({ server: await repoServer({ files: { "SPEC.md": "# Agent M\n" } }), hash: "#uc", token: "github_pat_INSTANCE" });
  const main = globalThis.document.getElementById("main");
  routeDom(main);
  await page.go("#settings");
  assert.match(main.innerHTML, /General.*Repositories.*Endpoints &amp; Agents.*Usability/s);
  assert.doesNotMatch(main.innerHTML, /id="browser-settings"|id="product-settings"/);
});

// TST-268
// Module: MOD-dashboard-app
// Level: integration
// given: a configured instance and the public add-product route for its repository
// input: a synthetic click on the route's Add product control
// expect: no product commit is attempted; only a person's trusted click may write
test("the public add-product route rejects a synthetic Add product click", async () => {
  const { repoServer, openDashboard } = await import("./app-harness.mjs");
  const server = await repoServer({ files: { "README.md": "# Agent M\n" } });
  const page = await openDashboard({ server, hash: "", token: "github_pat_INSTANCE" });
  const main = globalThis.document.getElementById("main"), address = "https://github.com/akmaier/agent-m";
  await page.go(`#add/${encodeURIComponent(address)}`);
  const addProduct = main.querySelector("button.add");
  assert.ok(addProduct && !addProduct.disabled, "the public route enables Add product for the configured instance token");
  await page.click("button.add", { isTrusted: false });
  assert.equal(server.writes.length, 0, "a synthetic click must not commit the product layout");
});

// TST-269
// Module: MOD-browser-store
// Guards: UC-042; A CLEAR IS A REAL CLEAR
// Level: component
// given: GitHub and GitLab product tokens mirrored through the dashboard adapter
// input: the existing Settings clear-token callers clear each product token, then the adapter reloads
// expect: both the public catalogue and the legacy settings view stay clear
test("clearing product tokens clears their canonical values and cannot resurrect them on reload", () => {
  const github = "https://github.com/alice/tool", gitlab = "https://gitlab.example.org/team/tool", instance = "akmaier/agent-m";
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage() });
  const dashboard = productStore(instance), store = openStore(instance);
  dashboard.addProduct(github); dashboard.setGitHubProductToken(github, "github_pat_PRODUCT", "2027-01-01");
  dashboard.addProduct(gitlab); dashboard.setGitLabToken(gitlab, "glpat_PRODUCT012345678", "2027-01-02");
  assert.ok(readSetting(store, "github-token:alice/tool")?.value, "known positive: GitHub token reached the public catalogue");
  assert.ok(readSetting(store, "gitlab-token:gitlab.example.org/team/tool")?.value, "known positive: GitLab token reached the public catalogue");
  dashboard.clearGitHubProductToken(github); dashboard.clearGitLabToken(gitlab);
  assert.equal(readSetting(store, "github-token:alice/tool"), null, "GitHub clear removes the public value");
  assert.equal(readSetting(store, "gitlab-token:gitlab.example.org/team/tool"), null, "GitLab clear removes the public value");
  const reloaded = productStore(instance);
  assert.equal(reloaded.getGitHubProductToken(github), null, "reload cannot restore the cleared GitHub token");
  assert.equal(reloaded.getGitLabToken(gitlab), null, "reload cannot restore the cleared GitLab token");
});

// TST-270
// Module: MOD-browser-store
// Guards: UC-042; A CLEAR IS A REAL CLEAR; THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER
// Level: component
// given: GitHub and GitLab products with their own canonical tokens
// input: the existing Settings remove-product caller removes each product, then the adapter reloads
// expect: each address and its token are absent from both stores
test("removing a product clears its canonical address and token without reload resurrection", () => {
  const github = "https://github.com/alice/tool", gitlab = "https://gitlab.example.org/team/tool", instance = "akmaier/agent-m";
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage() });
  const dashboard = productStore(instance), store = openStore(instance);
  dashboard.addProduct(github); dashboard.setGitHubProductToken(github, "github_pat_PRODUCT", "2027-01-01");
  dashboard.addProduct(gitlab); dashboard.setGitLabToken(gitlab, "glpat_PRODUCT012345678", "2027-01-02");
  assert.deepEqual(readSetting(store, "products"), [github, gitlab], "known positive: public product list contains both addresses");
  dashboard.removeProduct(github);
  assert.deepEqual(readSetting(store, "products"), [gitlab], "removing one product retains the other public address");
  assert.equal(readSetting(store, "github-token:alice/tool"), null, "removing one product clears only its GitHub public token");
  assert.ok(readSetting(store, "gitlab-token:gitlab.example.org/team/tool")?.value, "removing one product retains the other public token");
  dashboard.removeProduct(gitlab);
  assert.equal(readSetting(store, "products"), null, "removal clears the public product list");
  assert.equal(readSetting(store, "github-token:alice/tool"), null, "removal clears the GitHub public token");
  assert.equal(readSetting(store, "gitlab-token:gitlab.example.org/team/tool"), null, "removal clears the GitLab public token");
  const reloaded = productStore(instance);
  assert.deepEqual(reloaded.getProducts(), [], "reload cannot restore removed products");
  assert.equal(reloaded.getGitHubProductToken(github), null);
  assert.equal(reloaded.getGitLabToken(gitlab), null);
});
