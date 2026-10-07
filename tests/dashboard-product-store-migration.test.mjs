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

// TST-09-MIGRATION-01
// given: a dashboard browser containing its established token, product list and product token
// input: open the dashboard adapter for that instance
// expect: the same values are available through MOD-browser-store's instance-prefixed catalogue
test("the dashboard migrates its product list and tokens into MOD-browser-store", () => {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage({
    "agent-m.github-token": "github_pat_INSTANCE", "agent-m.github-token-expires": "2027-01-01",
    "agent-m.products": JSON.stringify(["https://github.com/alice/tool"]),
    "agent-m.github-product-tokens": JSON.stringify({ "https://github.com/alice/tool": { token: "github_pat_PRODUCT", expires: "2027-02-01" } }),
  }) });
  productStore("akmaier/agent-m");
  const store = openStore("akmaier/agent-m");
  assert.equal(readSetting(store, "github-token").value, "github_pat_INSTANCE");
  assert.deepEqual(readSetting(store, "products"), ["https://github.com/alice/tool"]);
  assert.equal(readSetting(store, "github-token:alice/tool").value, "github_pat_PRODUCT");
});

// TST-09-MIGRATION-02
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
