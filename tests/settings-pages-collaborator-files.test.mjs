// A withdrawn collaborator's Remove lists the files that still name them (ITM-1043), as UC-042 5a states it (docs/use-cases/UC-042*.md:147-149: "**Remove** takes them off the list with one click and lists the files on the default
// branch that still name them, for the person to change; the page says that earlier commits keep the name in the history") and MOD-settings-pages' Uses name it (docs/architecture/MOD-settings-pages.md:287-288:
// "MOD-personal-data.namedPersonFindings — … the files that still name a collaborator who withdrew"). The Settings route over a writable product, as tests/settings-pages-settings-regressions.test.mjs has it.
// Run: node --test tests/settings-pages-collaborator-files.test.mjs
//
// Module: MOD-settings-pages
// Guards: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT; UC-042
// Level: unit
//
// Readings taken, named in the pull request: the files are read from the default branch as it stands after the removal's commit; `docs/collaborators.md` itself is not listed (it is the register of consent, and the
// rows of the others would name the person's name by a part of it); a file is listed once, in the order of the repository's paths; the list is under the class `settings-collaborator-named-files`, one `li` per path, and
// where no file names the person the class `settings-collaborator-named-none` says so. Each test states its input and its expected result before it runs (given / input / expect). Nothing reaches the network.
// The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";

class Element {
  constructor(name) { this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.disabled = false; this.attributes = new Map(); this.listeners = []; }
  append(...nodes) { for (const node of nodes.flat()) this.childNodes.push(typeof node === "string" ? new Text(node) : node); }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  addEventListener(type, listener) { this.listeners.push([type, listener]); }
  fire(type, event = {}) { return Promise.all(this.listeners.filter(([kind]) => kind === type).map(([, listener]) => listener({ type, target: this, currentTarget: this, ...event }))); }
  focus() {}
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
}
class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}
globalThis.document = { createElement: (name) => new Element(name) };
function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => node.className.split(" ").includes(name));
const click = (node) => node.fire("click", { isTrusted: true });
const settingsRoute = () => view.routes.find((candidate) => candidate.name === "settings");

const COLLABORATORS = "# Collaborators of this product\n\n| Name | Account | Agreed on |\n|---|---|---|\n| Ada Lovelace | @ada | 2026-09-01 |\n| Bea Quimby | @bea | 2026-09-02 |\n";
// A writable product whose default branch holds `extra` besides the register of consent; commitFiles updates it, and readSnapshot gives the state at that moment.
function product(extra) {
  const files = new Map([["docs/collaborators.md", COLLABORATORS], ["docs/settings.md", "# Settings of this product\n\n- pseudonymisation: on\n"], ...Object.entries(extra)]);
  const blob = (text) => createHash("sha1").update(`blob ${Buffer.byteLength(text)}\0${text}`).digest("hex");
  let commit = "0".repeat(40);
  return { address: "https://github.com/fixture/product", host: {
    async repositoryInfo() { return { defaultBranch: "main", canWrite: true, visibility: "public" }; },
    async readSnapshot() {
      const opened = new Map(files);
      return { commit, paths: [...opened.keys()].sort(), blob: (path) => (opened.has(path) ? blob(opened.get(path)) : null), async read(path) { return opened.get(path) ?? null; }, async readMany() {} };
    },
    async commitFiles(change) {
      for (const file of change.files) files.set(file.path, file.text);
      commit = `${Number(commit) + 1}`.padStart(40, "0");
      return { commit, url: `https://github.com/fixture/product/commit/${commit}` };
    },
  } };
}
async function removed(extra) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const store = openStore("fixture/instance");
  writeSetting(store, "github-token:fixture/product", { value: "ghp_fixture" });
  const target = document.createElement("div");
  await settingsRoute().render(target, { instance: { repository: "fixture/instance" }, product: product(extra), store, go() {} }, {});
  click(byClass(target, "settings-tab")[1]);
  byClass(target, "settings-collaborator-remove-name")[0].value = "Bea Quimby";
  byClass(target, "settings-collaborator-remove-account")[0].value = "@bea";
  await click(byClass(target, "settings-collaborator-remove")[0]);
  return target;
}

// TST-1043101 · level: unit · module: MOD-settings-pages
// guards: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT; UC-042
// given: a writable product whose default branch has docs/notes.md and docs/thanks.md naming Bea Quimby (the second in other case), docs/clean.md naming Ada Lovelace only, and the register with both collaborators
// input: Remove for Bea Quimby, account @bea
// expect: the result line says the consent was removed and that earlier commits keep the name in the history (known positive: built before this item); the list of the class settings-collaborator-named-files holds exactly docs/notes.md and docs/thanks.md, in that order, and no none-line
test("Remove lists exactly the files on the default branch that still name the collaborator", async () => {
  const target = await removed({ "docs/notes.md": "Thanks to Bea Quimby for the review.\n", "docs/thanks.md": "Credits\n\nbea quimby, reviewer\n", "docs/clean.md": "Written with Ada Lovelace.\n" });
  assert.match(byClass(target, "settings-collaborator-result")[0].textContent, /earlier commits.*history/i);
  const list = byClass(target, "settings-collaborator-named-files")[0];
  assert.ok(list, "the list of files is there");
  assert.deepEqual(descendants(list, (node) => node.localName === "li").map((item) => item.textContent), ["docs/notes.md", "docs/thanks.md"]);
  assert.equal(byClass(target, "settings-collaborator-named-none").length, 0);
});

// TST-1043102 · level: unit · module: MOD-settings-pages
// guards: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT; UC-042
// given: a writable product whose default branch has docs/clean.md naming Ada Lovelace only and docs/account.md naming the account @bea but not the name
// input: Remove for Bea Quimby, account @bea
// expect: no list of files; the line of the class settings-collaborator-named-none says that no file on the default branch still names them; the history note stays in the result line
test("Remove says so when no file names the collaborator", async () => {
  const target = await removed({ "docs/clean.md": "Written with Ada Lovelace.\n", "docs/account.md": "Reviewed by @bea.\n" });
  assert.match(byClass(target, "settings-collaborator-result")[0].textContent, /earlier commits.*history/i);
  assert.equal(byClass(target, "settings-collaborator-named-files").length, 0);
  assert.match(byClass(target, "settings-collaborator-named-none")[0].textContent, /no file.*(names|name)/i);
});
