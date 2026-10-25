// The setup-specific fixture of the tests of MOD-settings-pages' route `setup` (tests/settings-pages-setup.test.mjs): pressing and ticking, a fake localStorage and a store opened
// over it, a context as the frame hands it to a route, and a fake of fetch that records every request and answers the status a case names. Nothing reaches the network: a
// request the case has not scripted answers 599. The document of the part of a browser's DOM that MOD-site-frame's explain() needs is not here: it is that of
// tests/settings-pages-harness.mjs, the helper file of the tests of MOD-settings-pages, from which this file hands on installDocument. It is code only; it holds no expected result.
//
// Module: MOD-settings-pages; MOD-site-frame
// Level: unit

import { openStore } from "../../src/browser-store/index.mjs";
import { byTag, turn } from "../settings-pages-harness.mjs";

export { installDocument } from "../settings-pages-harness.mjs";

// ---------------------------------------------------------------- finding, pressing, ticking

export const buttonLabelled = (root, text) => byTag(root, "button").find((button) => button.textContent === text);
export async function press(element) { element.dispatchEvent(new Event("click")); await turn(); }
export async function tick(box) { box.checked = true; box.dispatchEvent(new Event("change")); await turn(); }
export async function untick(box) { box.checked = false; box.dispatchEvent(new Event("change")); await turn(); }

// A target element in the body, where a route is rendered and a focus can stand.
export function attachedTarget() {
  const target = document.createElement("div");
  document.body.replaceChildren(target);
  return target;
}

class FakeStorage {
  constructor() { this.map = new Map(); }
  get length() { return this.map.size; }
  key(index) { return [...this.map.keys()][index] ?? null; }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

// A fresh localStorage and the store of the instance over it.
export function freshStore(instance = "akmaier/agent-m") {
  Object.defineProperty(globalThis, "localStorage", { value: new FakeStorage(), configurable: true, writable: true });
  return openStore(instance);
}
export const storedKeys = () => [...globalThis.localStorage.map.keys()].sort();

// The context the frame hands a route; `went` records every go(route, params).
export function contextOf(store, repository = "akmaier/agent-m") {
  const went = [];
  return { page: "main", instance: { repository }, product: null, store, went, go(route, params) { went.push([route, params]); } };
}

// Every request answered by `answer(url, init) -> { status, body }` for the length of `run`; the requests are returned
// as { url, method, authorization }.
export async function withServer(answer, run) {
  const real = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, init = {}) => {
    const headers = new Headers(init.headers ?? {});
    requests.push({ url: String(url), method: init.method ?? "GET", authorization: headers.get("authorization") });
    const { status, body } = answer(String(url), init) ?? { status: 599, body: {} };
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  };
  try { await run(requests); } finally { globalThis.fetch = real; }
  return requests;
}
