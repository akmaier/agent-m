// The small browser fixture of the tests of MOD-settings-pages' route `setup` (tests/settings-pages-setup.test.mjs): a global document
// whose elements hold children, attributes, text and listeners, a fake localStorage, a store opened over it, a context as the frame
// hands it to a route, and a fake of fetch that records every request and answers the status and the JSON a case names. Nothing reaches
// the network: a request the case has not scripted answers 599. It is code only; it holds no expected result.
//
// Module: MOD-settings-pages
// Level: unit

import { openStore } from "../../src/browser-store/index.mjs";

export class FixtureElement extends EventTarget {
  constructor(localName) {
    super();
    this.localName = localName;
    this.children = [];
    this.className = "";
    this.value = "";
    this.checked = false;
    this.disabled = false;
    this.hidden = false;
    this.parent = null;
  }
  get textContent() { return this.children.map((child) => typeof child === "string" ? child : child.textContent).join(""); }
  set textContent(text) { this.replaceChildren(String(text)); }
  append(...children) { for (const child of children) { this.children.push(child); if (typeof child !== "string") child.parent = this; } }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  setAttribute(name, value) { this[name] = String(value); }
  focus() { globalThis.document.activeElement = this; }
}

export function installDocument() {
  const document = { activeElement: null, createElement: (name) => new FixtureElement(name) };
  Object.defineProperty(globalThis, "document", { value: document, configurable: true, writable: true });
  return document;
}

export function elements(root, match) {
  const found = [];
  (function walk(node) { for (const child of node.children) if (typeof child !== "string") { if (match(child)) found.push(child); walk(child); } })(root);
  return found;
}
export const byTag = (root, name) => elements(root, (element) => element.localName === name);
export const byClass = (root, name) => elements(root, (element) => element.className.split(" ").includes(name));
export const buttonLabelled = (root, text) => byTag(root, "button").find((button) => button.textContent === text);
export const turn = () => new Promise((resolve) => setImmediate(resolve));
export async function press(element) { element.dispatchEvent(new Event("click")); await turn(); }
export async function tick(box) { box.checked = true; box.dispatchEvent(new Event("change")); await turn(); }
export async function untick(box) { box.checked = false; box.dispatchEvent(new Event("change")); await turn(); }

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
