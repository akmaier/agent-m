// The live dashboard's entries #add and #settings mount MOD-settings-pages' routes over this browser's MOD-browser-store store.
// Module: MOD-browser-store
// Guards: UC-001; UC-047; CONFIGURATION LIVES IN THE BROWSER
// Level: component

import test from "node:test";
import assert from "node:assert/strict";
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

// TST-266 · level: component · module: MOD-browser-store
// guards: UC-001; UC-047; CONFIGURATION LIVES IN THE BROWSER
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

// TST-477004 · level: component · module: MOD-browser-store
// guards: UC-001; UC-047; CONFIGURATION LIVES IN THE BROWSER
// given: the public dashboard entry and an instance-prefixed canonical store
// input: navigate to #settings through the dashboard dispatcher
// expect: the current public Settings route, rather than the retired dashboard settings composition, is mounted with all four named panes.
test("the dashboard #settings entry mounts the public Settings route", async () => {
  const { repoServer, openDashboard } = await import("./app-harness.mjs");
  const page = await openDashboard({ server: await repoServer({ files: { "SPEC.md": "# Agent M\n" } }), hash: "#uc", token: "github_pat_INSTANCE" });
  const main = globalThis.document.getElementById("main");
  routeDom(main);
  await page.go("#settings");
  assert.match(main.innerHTML, /General.*Repositories.*Endpoints &amp; Agents.*Usability/s);
  assert.doesNotMatch(main.innerHTML, /id="browser-settings"|id="product-settings"/);
});

// TST-268 · level: component · module: MOD-browser-store
// guards: UC-001; UC-047; CONFIGURATION LIVES IN THE BROWSER
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
