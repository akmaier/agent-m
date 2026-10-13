// Clearing a Bridge names the resources that name it (ITM-464) — MOD-settings-pages' settings lines, as docs/architecture/MOD-settings-pages.md states them: a Bridge's Clear
// names first the endpoints, participants and mailbox that name it (UC-042, 2a); this item adds the resources — the rows of the instance's docs/resources.md and of the chosen
// product's whose route is `bridge <name>` for that Bridge, read with MOD-resource-list's resourceSchema (through its index.mjs) — so that the person sees what stops working in this browser.
// Run: node --test tests/settings-pages-clear-names-resources.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-042
// Guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// Level: unit
//
// The instance and the product are fixtures, each a host whose docs/resources.md lists a resource on lab-pc and one on laptop, beside rows whose route only looks like theirs
// (`bridge lab-pc2`, `runner:lab-pc`, a name or address that says lab-pc); each host records every commit and every file read. The store is a Map-backed localStorage; the DOM is the
// small one the other tests of this module use. Where the texts leave a reading open, the test states the reading it takes, and the pull request names it:
//   - A resource names a Bridge when its route is exactly `bridge <name>` (MOD-resource-list, Data: Route); it is named by its name. The question says which list holds it: the
//     instance's or the product's.
//   - A list that cannot be read — its host fails, with the host's own words — is said with that reason, and the question is still asked: it never claims that no resource names the
//     Bridge. A list the repository does not hold — its snapshot's paths lack docs/resources.md — is a list with no resource, and is not read. A page with no product, or no instance host, says nothing of that list.
//   - The question is asked before anything is cleared; Clear changes nothing but the Bridge's entry and its test record, and writes nothing to either list.
// The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.files = []; this.attributes = new Map(); }
  append(...nodes) { for (const node of nodes.flat()) this.childNodes.push(typeof node === "string" ? new Text(node) : node); }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
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
const click = async (button) => { button.dispatchEvent(new Event("click")); await new Promise((resolve) => setTimeout(resolve, 5)); };
const lineOf = (page, name) => byClass(page, "settings-bridge-named").find((line) => byClass(line, "settings-bridge-named-name")[0]?.textContent === name);


const LIST = (rows) => `# Resources

What this is built with and runs on.

| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |
|---|---|---|---|---|---|---|---|---|---|
${rows.map(([name, route], at) => `| ${name} | compute | machine-${at}.example.test | — | — | — | ${route} | this machine | — | — |`).join("\n")}
`;
const INSTANCE_LIST = LIST([["inst-lab", "bridge lab-pc"], ["inst-laptop", "bridge laptop"], ["inst-near", "bridge lab-pc2"], ["inst-runner", "runner:lab-pc"], ["lab-pc-named", "bridge elsewhere"]]);
const PRODUCT_LIST = LIST([["prod-lab", "bridge lab-pc"], ["prod-laptop", "bridge laptop"], ["prod-near", "bridge lab-pc2"]]);

// A host whose default branch is trunk and whose docs/resources.md is `list` (null: the repository holds none); `failure`: the server refuses to serve that file (the page itself is built).
function listHost(list, events, label, failure) {
  return {
    repositoryInfo: async () => ({ defaultBranch: "trunk", canWrite: true }),
    readSnapshot: async () => {
      return { paths: list === null && !failure ? [] : ["docs/resources.md"], blob: () => "b".repeat(40), read: async (path) => {
        events.reads.push(`${label}:${path}`);
        if (failure && path === "docs/resources.md") throw Object.assign(new Error(failure), { name: "RateLimited" });
        return path === "docs/resources.md" ? list : null;
      } };
    },
    commitFiles: async (...args) => { events.commits.push([label, ...args]); return { commit: "c".repeat(40) }; },
  };
}

function fixture(t, { instance = INSTANCE_LIST, product = PRODUCT_LIST, instanceFails, productFails, withProduct = true, withInstanceHost = true } = {}) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const store = openStore("fixture/instance");
  writeSetting(store, "bridge:lab-pc", { port: 40100, token: "lab-token" });
  writeSetting(store, "bridge:laptop", { address: "http://127.0.0.1:4711", token: "laptop-token" });
  writeSetting(store, "jump-host", { hostname: "jump.example.test", user: "agentm", sshPort: 22, portRange: [40100, 40102] });
  writeSetting(store, "last-test:bridge:lab-pc", { at: "2026-10-11T08:00:00.000Z", outcome: "working" });
  const events = { commits: [], reads: [], questions: [] };
  const prior = globalThis.confirm;
  t.after(() => { globalThis.confirm = prior; });
  const answers = { next: false };
  globalThis.confirm = (message) => { events.questions.push({ message, stored: readSetting(store, "bridge:lab-pc") !== null || readSetting(store, "bridge:laptop") !== null }); return answers.next; };
  const context = { instance: { repository: "fixture/instance", ...(withInstanceHost ? { host: listHost(instance, events, "instance", instanceFails) } : {}) },
    product: withProduct ? { address: "https://github.com/fixture/product", host: listHost(product, events, "product", productFails) } : null, store, go() {} };
  return { store, events, answers, async page() { const target = document.createElement("div"); await view.routes.find((route) => route.name === "settings").render(target, context, {}); return target; } };
}
const NAMES = ["inst-lab", "inst-laptop", "inst-near", "inst-runner", "lab-pc-named", "prod-lab", "prod-laptop", "prod-near"];
const askedAbout = async (f, name) => { await click(byClass(lineOf(await f.page(), name), "settings-bridge-named-clear")[0]); return f.events.questions.at(-1); };

// TST-472743 · level: unit · module: MOD-settings-pages
// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// given: an instance and a product that each list a resource on lab-pc and one on laptop, beside resources on lab-pc2, on a runner, and one whose name says lab-pc
// input: Clear on the line of lab-pc, answered no, then yes; Clear on the line of laptop
// expect: the question, asked before anything is cleared, names inst-lab and prod-lab, each with its list, and none of the other resources; a no clears nothing; a yes clears the Bridge and its test record and leaves both lists as they were, with no commit; the question for laptop names inst-laptop and prod-laptop and no lab-pc resource
test("Settings — Clear of a Bridge names the resources of the instance and of the product that name it, and changes neither list", async (t) => {
  const f = fixture(t);
  const { message, stored } = await askedAbout(f, "lab-pc");
  assert.ok(stored, "the question is asked before anything is cleared");
  assert.equal(f.events.questions.length, 1);
  assert.match(message, /inst-lab/);
  assert.match(message, /prod-lab/);
  assert.match(message, /instance/i);
  assert.match(message, /product/i);
  for (const other of NAMES.filter((n) => n !== "inst-lab" && n !== "prod-lab")) assert.ok(!message.includes(other), `${other} is not named`);
  assert.deepEqual(readSetting(f.store, "bridge:lab-pc"), { port: 40100, token: "lab-token" }, "a no clears nothing");
  assert.deepEqual(f.events.commits, []);

  f.answers.next = true;
  await click(byClass(lineOf(await f.page(), "lab-pc"), "settings-bridge-named-clear")[0]);
  assert.equal(readSetting(f.store, "bridge:lab-pc"), null);
  assert.equal(readSetting(f.store, "last-test:bridge:lab-pc"), null);
  assert.deepEqual(f.events.commits, [], "nothing is written to either list");
  assert.ok(f.events.reads.some((read) => read.startsWith("instance:")) && f.events.reads.some((read) => read.startsWith("product:")), "both lists were read");

  f.answers.next = false;
  const laptop = (await askedAbout(f, "laptop")).message;
  assert.match(laptop, /inst-laptop/);
  assert.match(laptop, /prod-laptop/);
  for (const other of NAMES.filter((n) => n !== "inst-laptop" && n !== "prod-laptop")) assert.ok(!laptop.includes(other), `${other} is not named for laptop`);
});

// TST-472744 · level: unit · module: MOD-settings-pages
// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// given: a Bridge no resource names; a repository that holds no list; a page with no product; a page whose instance has no host
// input: Clear
// expect: the question for the unnamed Bridge says that nothing names it; a missing list is a list with no resource and no unread notice; with no product the product is not mentioned; with no instance host the instance's list is not mentioned and no request is made for it
test("Settings — Clear says nothing of a list that is missing, absent or not there", async (t) => {
  const none = fixture(t, { instance: LIST([["inst-laptop", "bridge laptop"]]), product: LIST([["prod-laptop", "bridge laptop"]]) });
  assert.match((await askedAbout(none, "lab-pc")).message, /Nothing in this browser names this Bridge/);
  const missing = fixture(t, { instance: null, product: null });
  const m = (await askedAbout(missing, "lab-pc")).message;
  assert.match(m, /Nothing in this browser names this Bridge/);
  assert.doesNotMatch(m, /could not be read/);
  assert.deepEqual(missing.events.reads.filter((read) => read.endsWith("resources.md")), [], "a list the snapshot does not hold is not read");
  const bare = fixture(t, { withProduct: false });
  const b = (await askedAbout(bare, "lab-pc")).message;
  assert.match(b, /inst-lab/);
  assert.doesNotMatch(b, /prod-/);
  assert.doesNotMatch(b, /product/i);
  const noHost = fixture(t, { withInstanceHost: false });
  const h = (await askedAbout(noHost, "lab-pc")).message;
  assert.match(h, /prod-lab/);
  assert.doesNotMatch(h, /inst-|instance/i);
  assert.ok(noHost.events.reads.every((read) => read.startsWith("product:")), "no request for the instance without a host");
});

// TST-472745 · level: unit · module: MOD-settings-pages
// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// given: first both lists readable; then the instance's host failing with "rate limited", and then the product's with "unreachable"
// input: Clear on the line of lab-pc
// expect: the readable lists name their resources (known positive); with a list unreadable the question is still asked and says that list could not be read, with the reason, so that its resources are not listed — never that nothing names the Bridge; the other list is still named; a no clears nothing
test("Settings — a list that cannot be read is said with its reason, and the question is still asked", async (t) => {
  assert.match((await askedAbout(fixture(t), "lab-pc")).message, /inst-lab.*prod-lab|prod-lab.*inst-lab/s);
  const instance = fixture(t, { instanceFails: "rate limited" });
  const i = (await askedAbout(instance, "lab-pc")).message;
  assert.match(i, /instance.*could not be read.*rate limited/is);
  assert.match(i, /prod-lab/);
  assert.doesNotMatch(i, /inst-lab/);
  assert.doesNotMatch(i, /Nothing in this browser names this Bridge/);
  assert.deepEqual(readSetting(instance.store, "bridge:lab-pc"), { port: 40100, token: "lab-token" });
  const product = fixture(t, { productFails: "unreachable" });
  const p = (await askedAbout(product, "lab-pc")).message;
  assert.match(p, /product.*could not be read.*unreachable/is);
  assert.match(p, /inst-lab/);
  assert.doesNotMatch(p, /prod-lab/);
  const both = fixture(t, { instanceFails: "rate limited", productFails: "unreachable" });
  const q = (await askedAbout(both, "lab-pc")).message;
  assert.match(q, /rate limited/);
  assert.match(q, /unreachable/);
  assert.doesNotMatch(q, /Nothing in this browser names this Bridge/);
});
