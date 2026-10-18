// MOD-settings-pages' route `add-product` tells the page that holds it when a product's token is stored (ITM-860). The Settings page opens
// the route in place with a context of its own, which offers `tokenStored`, as it offers `endpointsChanged` to the endpoints route; the page
// connects its hosts anew with what the store holds when it is told (tests/settings-pages-stored-token-followed.test.mjs pins what the open
// page then sends). This file pins the route's side of that: on Step A of a GitHub product and on Step B of a GitLab product, *Store and
// check* tells the context once that a token was stored, after the token is in the store and not before.
// Run: node --test tests/settings-pages-add-product-token-stored.test.mjs
//
// Module: MOD-settings-pages
// Guards: A GITHUB PRODUCT USES A TOKEN OF ITS OWN
// Guards: A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
// Guards: A CLEAR IS A REAL CLEAR
// Level: unit
//
// The expected results are written here from A GITHUB PRODUCT USES A TOKEN OF ITS OWN ("after *Store and check* the product is read with that
// token") and A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN (the person pastes the project's token into Agent M); none is read from a
// document. A page that holds hosts can read the product with the pasted token only if it is told at the moment the token is stored, so the
// test states the moment: when the context is told, the store holds the pasted token. The callers read first (AGENTS.md 6a.1):
// tests/settings-pages-add-product.test.mjs (the document, the store over a fake localStorage, the fake of fetch and the GitLab project's
// shapes below are written again here from it; a test file imports no other test file) and src/settings-pages/endpoints.mjs, which tells
// its context `endpointsChanged` after a save. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { installDocument, byClass, type, until } from "./settings-pages-harness.mjs";

installDocument();
const { view } = await import("../src/settings-pages/index.mjs");
const { openStore, readSetting } = await import("../src/browser-store/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "add-product");

class FakeStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
}
const freshStore = () => {
  Object.defineProperty(globalThis, "localStorage", { value: new FakeStorage(), configurable: true, writable: true });
  return openStore("akmaier/agent-m");
};
const GITHUB_ADDRESS = "https://github.com/alice/thesis-tool", GITHUB_KEY = "github-token:alice/thesis-tool", GITHUB_TOKEN = "github_pat_ALICE0123456789abcdefghij";
const GITLAB_ADDRESS = "https://gitlab.example.org/grp/sub/thesis-tool", GITLAB_KEY = "gitlab-token:gitlab.example.org/grp/sub/thesis-tool", GITLAB_TOKEN = "glpat-TEAM0123456789";
const answerFor = (url) => {
  const body = url.hostname === "api.github.com"
    ? { default_branch: "main", visibility: "private", private: true, archived: false, description: "", permissions: { push: true } }
    : { default_branch: "main", visibility: "private", archived: false, description: "", permissions: { project_access: { access_level: 40 } } };
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
};

// The route drawn with a context that records, at the moment it is told, what the store holds under `key`; the address typed; the notice
// ticked; the token pasted; Store and check pressed by a person. -> what the store held at each telling.
async function storeThrough({ address, key, token }) {
  const store = freshStore();
  const told = [];
  const context = { page: "settings", instance: { repository: "akmaier/agent-m" }, product: null, store, go() {}, tokenStored() { told.push(readSetting(store, key)?.value ?? null); } };
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, context, {});
  type(byClass(target, "address")[0], address);
  const ack = byClass(target, "ack")[0];
  ack.checked = true;
  ack.dispatchEvent(new Event("change"));
  type(byClass(target, "token")[0], token);
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input) => answerFor(new URL(String(input instanceof URL ? input.href : input)));
  try {
    const press = new Event("click");
    Object.defineProperty(press, "isTrusted", { value: true });
    byClass(target, "store")[0].dispatchEvent(press);
    await until(() => byClass(target, "result").some((paragraph) => /reachable/.test(paragraph.textContent)), "the product is read with the stored token");
  } finally { globalThis.fetch = realFetch; }
  return told;
}

// TST-860002
// level: unit
// module: MOD-settings-pages
// guards: A GITHUB PRODUCT USES A TOKEN OF ITS OWN
// given: the route add-product drawn with a context that offers tokenStored, a fresh store, a GitHub product's address
// input: tick the notice, paste a token, press Store and check
// expect: the context is told exactly once, and when it is told the store holds the pasted token under the product's key
test("TST-860002 · add-product tells its context once, with the GitHub product's token already stored", async () => {
  assert.deepEqual(await storeThrough({ address: GITHUB_ADDRESS, key: GITHUB_KEY, token: GITHUB_TOKEN }), [GITHUB_TOKEN]);
});

// TST-860003
// level: unit
// module: MOD-settings-pages
// guards: A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
// given: the route add-product drawn with a context that offers tokenStored, a fresh store, a GitLab project's address
// input: tick the notice, paste the project's token, press Store and check
// expect: the context is told exactly once, and when it is told the store holds the pasted token under the project's key
test("TST-860003 · add-product tells its context once, with the GitLab project's token already stored", async () => {
  assert.deepEqual(await storeThrough({ address: GITLAB_ADDRESS, key: GITLAB_KEY, token: GITLAB_TOKEN }), [GITLAB_TOKEN]);
});
