// Between-jobs dashboard migration.
// Module: MOD-browser-store
// Guards: UC-001; UC-047; CONFIGURATION LIVES IN THE BROWSER
// Level: component

import test from "node:test";
import assert from "node:assert/strict";
import { productStore } from "../docs/assets/product-store-adapter.mjs";
import { openStore, readSetting } from "../src/browser-store/index.mjs";

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
