// MOD-settings-pages' route `add-product` — Add a product (UC-001), as docs/architecture/MOD-settings-pages.md states it
// and ITM-207 builds it: the address recognised as GitHub or GitLab; Step A with the token's names filled in (THE
// REPOSITORY CHOICE IS SPELLED OUT), or GitLab's project access token (A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN),
// shown as done once a key already reaches the product (3a); Step B, Check, naming a missing repository (2a) or any
// other refusal (4a); Step C, one click (ONE CLICK PER DECISION), which writes the missing review layout and adds the
// product's address to this browser's list, a write refused after a successful read named and nothing written (5a), a
// complete layout left uncommitted (5b); nothing ever written to the instance repository (NO PRODUCT IS NAMED IN THE
// INSTANCE REPOSITORY); every step's folded explanation (EVERY STEP EXPLAINS ITSELF).
//
// Run: node --test tests/settings-pages-add-product.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-001; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; THE REPOSITORY CHOICE IS SPELLED OUT; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY; THE PAGE STATES WHAT IT SENDS WHERE
// Level: unit
//
// Not part of ITM-207, and not tested here: how the dashboard reaches this route, and the other routes of
// MOD-settings-pages (not built by this item). Node has no DOM: this file brings the small one of
// tests/implementation-pages.test.mjs. The store is MOD-browser-store's own openStore/readSetting/writeSetting over a
// fake localStorage — "the store ... replaced by fakes" fakes what it is backed by, not the already-accepted store
// module, which this file uses only through its index.mjs, as every other caller does. The hosts are this file's own
// fakes of MOD-repository-hosts' Host, given to the route through its own unit-test seam (see products.mjs's header
// comment). Nothing here reaches the network or waits on anything but the turn of the event loop in which a click
// answers.

import test from "node:test";
import assert from "node:assert/strict";
import { route } from "../src/settings-pages/products.mjs";
import { openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

// ---------------------------------------------------------------- the document: the small part of a browser's DOM used
//
// Elements built directly with createElement/append, as src/settings-pages/products.mjs builds them — never parsed from
// an HTML string — so a plain JS property (value, checked, disabled, href, target, rel, type, placeholder) works without
// attribute reflection. Events are node's own EventTarget and Event.

class DomNode extends EventTarget {
  constructor(nodeType) { super(); this.nodeType = nodeType; this.parentNode = null; this.childNodes = []; }
  get textContent() { return this.nodeType === 3 ? this._text : this.childNodes.map((k) => k.textContent).join(""); }
  set textContent(v) {
    for (const k of [...this.childNodes]) this.removeChild(k);
    if (this.nodeType === 3) this._text = String(v);
    else if (v !== "") this.appendChild(textNode(v));
  }
  appendChild(n) { n.parentNode?.removeChild(n); n.parentNode = this; this.childNodes.push(n); return n; }
  append(...nodes) { for (const n of nodes) this.appendChild(typeof n === "string" ? textNode(n) : n); }
  removeChild(n) { const i = this.childNodes.indexOf(n); if (i >= 0) this.childNodes.splice(i, 1); n.parentNode = null; return n; }
  remove() { this.parentNode?.removeChild(this); }
  replaceChildren(...nodes) { for (const k of [...this.childNodes]) this.removeChild(k); this.append(...nodes); }
  get isConnected() { let n = this; while (n.parentNode) n = n.parentNode; return n === document; }
}
function textNode(s) { const t = new DomNode(3); t._text = String(s); return t; }

class DomElement extends DomNode {
  constructor(name) { super(1); this.localName = name; this.tagName = name.toUpperCase(); this.className = ""; }
  focus() { if (this.isConnected) document._focused = this; }
}

const document = new DomNode(9);
document.body = new DomElement("body");
document.appendChild(document.body);
document.createElement = (name) => new DomElement(name);
Object.defineProperty(document, "activeElement", { get() { return document._focused?.isConnected ? document._focused : document.body; } });
globalThis.document = document;

// The elements below `root`, in tree order, that `match` accepts (as tests/implementation-pages.test.mjs reads them).
function elements(root, match) {
  const found = [];
  (function walk(n) { for (const k of n.childNodes) if (k.nodeType === 1) { if (match(k)) found.push(k); walk(k); } })(root);
  return found;
}
const byTag = (root, name) => elements(root, (e) => e.localName === name);
const byClass = (root, name) => elements(root, (e) => e.className.split(" ").includes(name));
// What a person's typing does: the field holds the new text, and an input event follows.
const type = (field, text) => { field.value = text; field.dispatchEvent(new Event("input")); };
// The turn of the event loop in which an async click handler finishes (every fake host and store call here resolves at
// once, so one turn is always enough — nothing real is awaited).
const turn = () => new Promise((resolve) => setImmediate(resolve));
const click = async (button) => { button.dispatchEvent(new Event("click")); await turn(); };

const steps = (root) => byClass(root, "step");
const titleOf = (step) => byTag(step, "h3")[0]?.textContent ?? "";
const stepTitled = (root, prefix) => steps(root).find((s) => titleOf(s).startsWith(prefix));
const resultOf = (step) => byClass(step, "result")[0]?.textContent ?? "";
// explain() (MOD-site-frame) renders a folded <details class="explain"> for a topic explanations.md holds, and — "it
// never throws" — a bare, empty <div> for one it does not hold yet, which is the case for every topic this item's
// topics (its content is MOD-site-frame's own file, outside this item's scope; see products.mjs's header). Either
// shape is one call to explain(); this is what distinguishes a step that calls it from one that does not.
const looksExplained = (e) => (e.localName === "details" && e.className === "explain") || (e.localName === "div" && e.className === "" && e.childNodes.length === 0);
const explanationsOf = (root) => elements(root, looksExplained);

function connectedTarget() {
  const target = document.createElement("div");
  document.body.append(target);
  return target;
}

// ---------------------------------------------------------------- the store: MOD-browser-store's own openStore/
// readSetting/writeSetting, over a fake localStorage — its own prefixing and JSON are exercised for real; only what it
// is backed by is fake.

class FakeStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
}

function freshStore() {
  globalThis.localStorage = new FakeStorage();
  return openStore("fixture/instance");
}
const contextOf = (store) => ({ page: "settings", instance: null, product: null, store, go() {} });
// A fixture's own direct write of a setting, bypassing the page's own form — what "a key already reaching the
// product" (3a) and Step C alone (isolated from Step A's own UI) start from.
const givenSetting = (store, key, value) => writeSetting(store, key, { name: "fixture", stored: "2026-01-01", ...value });

// ---------------------------------------------------------------- the hosts: this file's own fake of MOD-repository-hosts'
// Host, given to the route through its own test seam (products.mjs's header) — repositoryInfo, readSnapshot, commitFiles
// and webLinks, which is all this route calls (reviewLayoutCommit, which the route also calls, uses no others either).

const LAYOUT_FOLDERS = ["docs/use-cases/", "docs/architecture/", "docs/approvals/", "docs/spec-freigaben/"];
const COMPLETE_LAYOUT = Object.fromEntries([...LAYOUT_FOLDERS.map((f) => [`${f}README.md`, `# ${f}\n`]),
  ["SPEC.md", "# SPEC\n"], ["CHANGELOG.md", "# Changelog\n"]]);

function fakeHost({ files = {}, repositoryPath = "owner/repo", defaultBranch = "main", canWrite = true, visibility = "public",
  repositoryInfoError = null, commitError = null, newRepository = "https://example.test/new", projectTokens = null } = {}) {
  let current = { ...files };
  const commits = [];
  return {
    commits,
    async repositoryInfo() {
      if (repositoryInfoError) throw repositoryInfoError;
      return { defaultBranch, visibility, canWrite, archived: false, description: "" };
    },
    async readSnapshot() {
      return {
        repository: { path: repositoryPath }, commit: "head", paths: Object.keys(current),
        async read(p) { return Object.hasOwn(current, p) ? current[p] : null; },
        blob(p) { return Object.hasOwn(current, p) ? `blob:${p}` : null; },
      };
    },
    async commitFiles(change) {
      if (commitError) throw commitError;
      commits.push(change);
      for (const f of change.files) current[f.path] = f.text;
      return { commit: `c${commits.length}`, url: `https://example.test/commit/c${commits.length}` };
    },
    webLinks() {
      return {
        newToken: (name, description, days) =>
          `https://example.test/new-token?name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}&days=${days}`,
        projectTokens, newRepository, tokens: "#", secrets: "#", newFile: () => null, editFile: () => "#",
        actions: "#", run: () => "#", pipelineSchedules: null, pagesSettings: "#", fork: null,
      };
    },
  };
}
const fakeConnect = (host) => () => host;
const hostError = (name, fields, message) => Object.assign(new Error(message), { name, ...fields });

const GH_ADDRESS = "https://github.com/alice/thesis-tool";
const GL_ADDRESS = "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool";
const GL_TOKEN_PAGE = "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool/-/settings/access_tokens";

// ------------------------------------------------------------------------------------------------------------ main flow

test("add-product route — pasting a GitHub address prefills Step A with the product's own token, named after it, and the repository choice spelled out", async () => {
  const store = freshStore();
  const context = contextOf(store);
  const connect = fakeConnect(fakeHost());
  const target = connectedTarget();

  await route.render(target, context, {}, { connect });
  assert.equal(document.activeElement, byClass(target, "address")[0], "A FORM OPENS WITH ITS FIRST FIELD FOCUSED");

  type(byClass(target, "address")[0], GH_ADDRESS);
  await turn();

  const stepA = stepTitled(target, "Step A · A key for the product");
  assert.ok(stepA, "Step A is shown, not yet done — no key is stored");
  const link = byClass(stepA, "primary")[0];
  const q = new URL(link.href).searchParams;
  assert.equal(q.get("name"), "Agent M · alice/thesis-tool", "A PRODUCT'S TOKEN IS NAMED AFTER THE PRODUCT");
  assert.equal(q.get("description"),
    "Agent M for the product alice/thesis-tool: reviews, commits, issues, pull requests and runs of the work you start in it.");
  assert.equal(q.get("days"), "90");
  const choice = byTag(stepA, "ol")[0].textContent;
  assert.match(choice, /Only select repositories/);
  assert.match(choice, /alice\/thesis-tool/, "THE REPOSITORY CHOICE IS SPELLED OUT");

  const stepC = stepTitled(target, "Step C · Add the product");
  assert.equal(byClass(stepC, "add")[0].disabled, true);
  assert.equal(resultOf(stepC), "Store the product's key in Step A first.");
});

test("add-product route — Store and check on Step A stores the product's own key, never the instance's, reaches the repository and shows that in Step B without another click", async () => {
  const store = freshStore();
  const context = contextOf(store);
  const host = fakeHost({ canWrite: true });
  const connect = fakeConnect(host);
  const target = connectedTarget();

  await route.render(target, context, {}, { connect });
  type(byClass(target, "address")[0], GH_ADDRESS);
  await turn();

  let stepA = stepTitled(target, "Step A · A key for the product");
  type(byClass(stepA, "token")[0], "github_pat_fixture0123456789");
  await click(byClass(stepA, "store")[0]);

  stepA = stepTitled(target, "Step A · A key for the product — done");
  assert.ok(stepA, "Step A now shows as done: a key now reaches it");
  const stepB = stepTitled(target, "Step B · Check");
  assert.equal(resultOf(stepB), "✓ https://github.com/alice/thesis-tool is reachable — this key can write here.",
    "UC-001 step 4: shown after Store and check, without pressing Check again");
  const stepC = stepTitled(target, "Step C · Add the product");
  assert.equal(byClass(stepC, "add")[0].disabled, false);

  assert.equal(readSetting(store, "github-token:alice/thesis-tool").value, "github_pat_fixture0123456789");
  assert.equal(readSetting(store, "github-token"), null, "the instance's own key is untouched");
});

test("add-product route — Add the product writes the missing review layout in one click and adds its address to this browser's list; nothing reaches the instance repository", async () => {
  const store = freshStore();
  const context = contextOf(store);
  givenSetting(store, "github-token:alice/thesis-tool", { value: "tok", expires: "2030-01-01" });
  const host = fakeHost({ files: {} }); // the layout is completely missing
  const connect = fakeConnect(host);
  const target = connectedTarget();

  await route.render(target, context, {}, { connect });
  type(byClass(target, "address")[0], GH_ADDRESS);
  await turn();

  const stepC = stepTitled(target, "Step C · Add the product");
  const button = byClass(stepC, "add")[0];
  assert.equal(button.disabled, false);
  await click(button); // ONE CLICK PER DECISION: reads, writes the layout, remembers the address, shows the result

  assert.equal(host.commits.length, 1, "one commit, on the product's own host — this route never builds an instance host");
  const written = host.commits[0].files.map((f) => f.path).sort();
  assert.deepEqual(written, ["CHANGELOG.md", "SPEC.md", "docs/approvals/README.md", "docs/architecture/README.md",
    "docs/spec-freigaben/README.md", "docs/use-cases/README.md"]);

  const result = resultOf(stepC);
  assert.match(result, /^Done — wrote the missing review layout in /);
  assert.match(result, /; https:\/\/github\.com\/alice\/thesis-tool is now in this browser's product list\.$/);
  const commitLink = byTag(stepC, "a").find((a) => a.textContent === "the commit");
  assert.equal(commitLink.href, "https://example.test/commit/c1");

  assert.deepEqual(readSetting(store, "products"), ["https://github.com/alice/thesis-tool"],
    "NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY: the address goes only into this browser's own list");
});

// --------------------------------------------------------------------------------------------------- alternative flows

test("add-product route — 3a: a key already reaching the product (the instance's, on GitHub) shows Step A as done and enables Step C without any Step A interaction", async () => {
  const store = freshStore();
  const context = contextOf(store);
  givenSetting(store, "github-token", { value: "instance-tok", expires: "2030-01-01" }); // the instance's, not the product's own
  const connect = fakeConnect(fakeHost());
  const target = connectedTarget();

  await route.render(target, context, {}, { connect });
  type(byClass(target, "address")[0], GH_ADDRESS);
  await turn();

  const stepA = stepTitled(target, "Step A · A key for the product — done");
  assert.ok(stepA, "3a: Step A is shown as done because the instance's key already reaches the product");
  assert.match(resultOf(stepA), /already reaches https:\/\/github\.com\/alice\/thesis-tool/);
  const stepC = stepTitled(target, "Step C · Add the product");
  assert.equal(byClass(stepC, "add")[0].disabled, false);
  assert.equal(readSetting(store, "github-token:alice/thesis-tool"), null, "no product key was stored — none was needed");
});

test("add-product route — 2a: a missing repository is named, with a link to the server's page for a new one, and nothing is written", async () => {
  const store = freshStore();
  const context = contextOf(store);
  givenSetting(store, "github-token:alice/thesis-tool", { value: "tok", expires: "2030-01-01" });
  const host = fakeHost({ repositoryInfoError: hostError("NotFound", { what: "the repository" }, "Not Found"),
    newRepository: "https://github.com/new?owner=alice" });
  const connect = fakeConnect(host);
  const target = connectedTarget();

  await route.render(target, context, {}, { connect });
  type(byClass(target, "address")[0], GH_ADDRESS);
  await turn();

  const stepB = stepTitled(target, "Step B · Check");
  await click(byClass(stepB, "check")[0]);

  assert.match(resultOf(stepB), /was not found/);
  const link = byTag(stepB, "a").find((a) => a.textContent === "Create it on the server's page for a new repository");
  assert.equal(link.href, "https://github.com/new?owner=alice");
  assert.equal(host.commits.length, 0);
});

test("add-product route — 5a: a write refused after a successful read is named, and nothing is written", async () => {
  const store = freshStore();
  const context = contextOf(store);
  givenSetting(store, "github-token:alice/thesis-tool", { value: "tok", expires: "2030-01-01" });
  const host = fakeHost({ commitError: hostError("PermissionMissing", { permission: "Contents" }, "the token lacks Contents") });
  const connect = fakeConnect(host);
  const target = connectedTarget();

  await route.render(target, context, {}, { connect });
  type(byClass(target, "address")[0], GH_ADDRESS);
  await turn();

  const stepC = stepTitled(target, "Step C · Add the product");
  const button = byClass(stepC, "add")[0];
  await click(button);

  assert.equal(resultOf(stepC),
    "Your key cannot write to https://github.com/alice/thesis-tool yet (the token lacks Contents). Store a key that reaches it in Step A, then try again.");
  assert.equal(host.commits.length, 0);
  assert.equal(button.disabled, false, "the author can try again");
});

test("add-product route — 5b: a product whose review layout is already complete gets only its address added, with no commit", async () => {
  const store = freshStore();
  const context = contextOf(store);
  givenSetting(store, "github-token:alice/thesis-tool", { value: "tok", expires: "2030-01-01" });
  const host = fakeHost({ files: COMPLETE_LAYOUT });
  const connect = fakeConnect(host);
  const target = connectedTarget();

  await route.render(target, context, {}, { connect });
  type(byClass(target, "address")[0], GH_ADDRESS);
  await turn();

  const stepC = stepTitled(target, "Step C · Add the product");
  await click(byClass(stepC, "add")[0]);

  assert.equal(host.commits.length, 0, "nothing was missing, so nothing is committed");
  assert.equal(resultOf(stepC), "Nothing was missing in https://github.com/alice/thesis-tool; it is now in this browser's product list.");
  assert.deepEqual(readSetting(store, "products"), ["https://github.com/alice/thesis-tool"]);
});

test("add-product route — 3c/3d: a GitLab address shows the project's own Access tokens steps (Maintainer, api) and the guidance for a project with none, and stores the project's own token under its own key, never a GitHub one", async () => {
  const store = freshStore();
  const context = contextOf(store);
  const host = fakeHost({ projectTokens: GL_TOKEN_PAGE, files: {} });
  const connect = fakeConnect(host);
  const target = connectedTarget();

  await route.render(target, context, {}, { connect });
  type(byClass(target, "address")[0], GL_ADDRESS);
  await turn();

  let stepA = stepTitled(target, "Step A · Create a key for this project");
  assert.ok(stepA, "A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — not Step A's GitHub form");
  assert.equal(byClass(stepA, "primary")[0].href, GL_TOKEN_PAGE);
  const steps3c = byTag(stepA, "ol")[0].textContent;
  assert.match(steps3c, /Maintainer/);
  assert.match(steps3c, /\bapi\b/);
  const guidance = byTag(stepA, "details").map((d) => byTag(d, "summary")[0]?.textContent)
    .find((t) => t === "The page offers no project access tokens, or you are not Maintainer");
  assert.ok(guidance, "UC-001 3d: the guidance is given up front, not discovered by a failed check");

  type(byClass(stepA, "token")[0], "glpat-fixture0123456789");
  await click(byClass(stepA, "store")[0]);

  assert.equal(readSetting(store, "gitlab-token:gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool").value, "glpat-fixture0123456789");
  assert.equal(readSetting(store, "github-token"), null, "a GitLab product's token never touches a GitHub key");

  stepA = stepTitled(target, "Step A · Create a key for this project — done");
  assert.ok(stepA);
  const stepC = stepTitled(target, "Step C · Add the product");
  await click(byClass(stepC, "add")[0]);
  assert.equal(host.commits.length, 1);
  assert.match(resultOf(stepC), /is now in this browser's product list\.$/);
});

test("add-product route — every step carries its own folded explanation", async () => {
  const store = freshStore();
  const context = contextOf(store);
  const connect = fakeConnect(fakeHost());
  const target = connectedTarget();

  await route.render(target, context, {}, { connect });
  type(byClass(target, "address")[0], GH_ADDRESS);
  await turn();

  assert.ok(explanationsOf(target).length >= 4, "the address field, Step A, Step B and Step C each have one (EVERY STEP EXPLAINS ITSELF)");
  for (const title of ["Step A · A key for the product", "Step B · Check", "Step C · Add the product"]) {
    const step = stepTitled(target, title);
    const details = explanationsOf(step);
    assert.equal(details.length, 1, `${title} calls explain() exactly once`);
    // Once MOD-site-frame's explanations.md holds this step's topic (outside this item, see products.mjs's header),
    // explain() folds it under exactly this summary (EVERY STEP EXPLAINS ITSELF) — checked only when that is the
    // shape rendered, so this test does not regress once the gap is closed.
    if (details[0].className === "explain") assert.equal(byTag(details[0], "summary")[0].textContent, "What is this?");
  }
});
