// MOD-implementation-pages' route `process` — ITM-780: what a new version of the declared model changes is shown before it is
// declared (UC-031 6a). When the catalogue as it stands holds another version of the declared model than the commit the
// declaration names, the route shows the workflows under each version side by side, the difference of the two model files,
// and what becomes invalid; when the model is unchanged, it shows none of them.
//
// Run: node --test tests/implementation-pages-model-version.test.mjs
//
// Module: MOD-implementation-pages
// Guards: UC-031; A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED
// Level: unit
//
// Each test states its given, its input and its expected result before it runs. Node has no DOM: this file brings the small
// one of tests/implementation-pages-process-groups.test.mjs (copied unchanged), so that schemaForm and explain run as they do
// in a browser. Nothing waits and nothing reaches the network: the repositories are fixtures held in memory, and a fixture
// host answers `readSnapshot(ref)` with the instance as it stood at that ref, as the route reaches the declared version.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";

// ---------------------------------------------------------------- the document: the part of a browser's DOM that is used
//
// Copied from tests/implementation-pages.test.mjs unchanged (itself tests/site-frame.test.mjs's and tests/markdown-render
// .test.mjs's): what DOMPurify reads through the prototypes, and node/EventTarget enough for schemaForm and explain.

const FOCUSABLE = new Set(["input", "textarea", "select", "button"]);
const HTML_NS = "http://www.w3.org/1999/xhtml";
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["script", "style", "textarea", "title", "xmp", "iframe", "noembed", "noframes", "noscript"]); // text until its end tag
const LITERAL = new Set(["script", "style", "xmp", "iframe", "noembed", "noframes", "noscript"]); // its text is neither decoded nor escaped
const SHOWN = { 1: 0x1, 3: 0x4, 8: 0x80 }; // NodeFilter's SHOW_ bit of an element, a text, a comment
const iterators = new Set();

const ENTITY = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => (e[0] !== "#" ? ENTITY[e.toLowerCase()] ?? m
  : String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1)))));
const escapeText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "&nbsp;");
const escapeAttribute = (s) => escapeText(s).replace(/"/g, "&quot;");

class Node extends EventTarget {
  constructor(doc, type, name) {
    super();
    Object.assign(this, { _doc: doc, _type: type, _name: name, _parent: null, _kids: [] });
  }
  get nodeType() { return this._type; }
  get nodeName() { return this._name; }
  get ownerDocument() { return this._type === 9 ? null : this._doc; }
  get parentNode() { return this._parent; }
  get childNodes() { return this._kids; }
  get firstChild() { return this._kids[0] ?? null; }
  get nextSibling() { const k = this._parent?._kids; return k ? k[k.indexOf(this) + 1] ?? null : null; }
  get previousSibling() { const k = this._parent?._kids; return k ? k[k.indexOf(this) - 1] ?? null : null; }
  get textContent() {
    return this._type === 3 || this._type === 8 ? this.data : this._kids.map((k) => (k._type === 8 ? "" : k.textContent)).join("");
  }
  set textContent(v) { if (this._type === 3 || this._type === 8) this.data = String(v); else this.replaceChildren(String(v)); }
  get innerHTML() { return this._kids.map(serialise).join(""); }
  set innerHTML(html) { this.replaceChildren(); parse(this._doc, String(html), this); }
  hasChildNodes() { return this._kids.length > 0; }
  contains(n) { for (; n; n = n._parent) if (n === this) return true; return false; }
  get isConnected() { let n = this; while (n._parent) n = n._parent; return n === this._doc; }
  insertBefore(n, before) {
    if (n._type === 11) { for (const k of [...n._kids]) this.insertBefore(k, before); return n; }
    n._parent?.removeChild(n);
    const at = before ? this._kids.indexOf(before) : -1;
    this._kids.splice(at < 0 ? this._kids.length : at, 0, n);
    n._parent = this;
    return n;
  }
  appendChild(n) { return this.insertBefore(n, null); }
  removeChild(n) {
    // The DOM's removing steps for a NodeIterator: one whose reference lies in what is removed moves back to the node before
    // it — the last node of its previous sibling, or its parent. Removing the iterator's root moves nothing.
    for (const it of iterators) {
      if (it.root === n || !n.contains(it.reference)) continue;
      let before = n.previousSibling;
      while (before?._kids.length) before = before._kids.at(-1);
      it.reference = before ?? n._parent;
    }
    this._kids.splice(this._kids.indexOf(n), 1);
    n._parent = null;
    return n;
  }
  remove() { this._parent?.removeChild(this); }
  append(...nodes) { for (const n of nodes) this.appendChild(typeof n === "string" ? this._doc.createTextNode(n) : n); }
  replaceChildren(...nodes) { for (const k of [...this._kids]) this.removeChild(k); this.append(...nodes); }
  cloneNode(deep = false) {
    const c = this._type === 1 ? this._doc.createElement(this.localName) : this._type === 3 ? this._doc.createTextNode(this.data)
      : this._type === 8 ? this._doc.createComment(this.data) : this._doc.createDocumentFragment();
    for (const a of this._attrs ?? []) c.setAttribute(a.name, a.value);
    if (deep) for (const k of this._kids) c.appendChild(k.cloneNode(true));
    return c;
  }
  getElementsByTagName(name) {
    const found = [];
    (function walk(n) { for (const k of n._kids) { if (k._type === 1 && k.localName === name) found.push(k); walk(k); } })(this);
    return found;
  }
}

class Text extends Node { constructor(doc, data) { super(doc, 3, "#text"); this.data = data; } }
class Comment extends Node { constructor(doc, data) { super(doc, 8, "#comment"); this.data = data; } }
class DocumentFragment extends Node { constructor(doc) { super(doc, 11, "#document-fragment"); } }

class Element extends Node {
  constructor(doc, name) { super(doc, 1, name.toUpperCase()); this.localName = name; this._attrs = []; }
  get tagName() { return this._name; }
  get namespaceURI() { return HTML_NS; }
  get attributes() { return this._attrs; }
  get children() { return this._kids.filter((k) => k._type === 1); }
  get firstElementChild() { return this.children[0] ?? null; }
  get className() { return this.getAttribute("class") ?? ""; }
  set className(v) { this.setAttribute("class", v); }
  getAttributeNode(name) { return this._attrs.find((a) => a.name === name.toLowerCase()) ?? null; }
  getAttribute(name) { return this.getAttributeNode(name)?.value ?? null; }
  hasAttribute(name) { return this.getAttributeNode(name) !== null; }
  setAttribute(name, value) {
    const a = this.getAttributeNode(name), lower = name.toLowerCase();
    if (a) a.value = String(value);
    else this._attrs.push({ name: lower, localName: lower, value: String(value), namespaceURI: null });
  }
  removeAttributeNode(a) {
    const at = this._attrs.indexOf(a);
    if (at < 0) throw new Error("NotFoundError: not an attribute of this element");
    this._attrs.splice(at, 1);
    return a;
  }
  removeAttribute(name) { const a = this.getAttributeNode(name); if (a) this.removeAttributeNode(a); }
  focus() { if (this.isConnected && FOCUSABLE.has(this.localName)) this._doc._focused = this; }
}

class Document extends Node {
  constructor() { super(null, 9, "#document"); this._doc = this; this.implementation = { createHTMLDocument: htmlDocument }; }
  get documentElement() { return this.children[0] ?? null; }
  get children() { return this._kids.filter((k) => k._type === 1); }
  get body() { return this.getElementsByTagName("body")[0] ?? null; }
  get activeElement() { return this._focused?.isConnected ? this._focused : this.body; }
  createElement(name) { return new Element(this, String(name).toLowerCase()); }
  createTextNode(data) { return new Text(this, String(data)); }
  createComment(data) { return new Comment(this, String(data)); }
  createDocumentFragment() { return new DocumentFragment(this); }
  importNode(n, deep) { return n.cloneNode(deep); }
  createNodeIterator(root, whatToShow = 0xffffffff) {
    const it = {
      root, reference: root, beforeReference: true,
      nextNode() {
        for (let n = this.reference; ;) {
          if (this.beforeReference) this.beforeReference = false;
          else n = following(n, this.root);
          if (!n) return null;
          this.reference = n;
          if (whatToShow & (SHOWN[n._type] ?? 0)) return n;
        }
      },
    };
    iterators.add(it);
    return it;
  }
}

// The node after `n` in tree order, within `root`.
function following(n, root) {
  if (n._kids.length) return n._kids[0];
  for (; n && n !== root; n = n._parent) if (n.nextSibling) return n.nextSibling;
  return null;
}

function htmlDocument() {
  const doc = new Document(), html = doc.createElement("html");
  doc.appendChild(html);
  html.append(doc.createElement("head"), doc.createElement("body"));
  return doc;
}

class DOMParser {
  parseFromString(html) { const doc = htmlDocument(); parse(doc, String(html), doc.body); return doc; }
}

// An HTML parser for well-formed HTML: elements, void elements, the text of script and its kin up to their end tag,
// attributes quoted or not, character references, comments.
const TAG = /^<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/;
const ATTRIBUTE = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function parse(doc, html, into) {
  const open = [into];
  for (let i = 0; i < html.length;) {
    const top = open.at(-1);
    if (html.startsWith("<!--", i)) {
      const close = html.indexOf("-->", i + 4), end = close < 0 ? html.length : close;
      top.appendChild(doc.createComment(html.slice(i + 4, end)));
      i = end + 3;
      continue;
    }
    const tag = TAG.exec(html.slice(i));
    if (!tag) {
      const next = html.indexOf("<", i + 1), end = next < 0 ? html.length : next;
      top.appendChild(doc.createTextNode(decode(html.slice(i, end))));
      i = end;
      continue;
    }
    i += tag[0].length;
    const name = tag[2].toLowerCase();
    if (tag[1]) {
      const at = open.findLastIndex((e, k) => k > 0 && e.localName === name);
      if (at > 0) open.length = at;
      continue;
    }
    const el = doc.createElement(name);
    for (const a of tag[3].matchAll(ATTRIBUTE)) if (!el.hasAttribute(a[1])) el.setAttribute(a[1], decode(a[2] ?? a[3] ?? a[4] ?? ""));
    top.appendChild(el);
    if (RAW.has(name)) {
      const close = html.toLowerCase().indexOf(`</${name}`, i), end = close < 0 ? html.length : close;
      if (end > i) el.appendChild(doc.createTextNode(LITERAL.has(name) ? html.slice(i, end) : decode(html.slice(i, end))));
      i = end + (TAG.exec(html.slice(end))?.[0].length ?? 0);
    } else if (!VOID.has(name)) open.push(el);
  }
}

// The HTML fragment serialisation of a node.
function serialise(n) {
  if (n._type === 3) return LITERAL.has(n._parent?.localName) ? n.data : escapeText(n.data);
  if (n._type === 8) return `<!--${n.data}-->`;
  if (n._type !== 1) return n.innerHTML;
  const start = `<${n.localName}${n._attrs.map((a) => ` ${a.name}="${escapeAttribute(a.value)}"`).join("")}>`;
  return VOID.has(n.localName) ? start : `${start}${n.innerHTML}</${n.localName}>`;
}

const document = htmlDocument();
globalThis.document = document;
globalThis.window = { document, Node, Element, Text, Comment, DocumentFragment, DOMParser,
  NodeFilter: { SHOW_ELEMENT: 0x1, SHOW_TEXT: 0x4, SHOW_CDATA_SECTION: 0x8, SHOW_PROCESSING_INSTRUCTION: 0x40, SHOW_COMMENT: 0x80 } };

// The modules, loaded once the document is there.
const { route } = await import("../src/implementation-pages/process.mjs");
const { showDifference } = await import("../src/markdown-render/index.mjs");

// ---------------------------------------------------------------- helpers: fixture repositories and the page's parts

function elements(root, match) {
  const found = [];
  (function walk(n) { for (const k of n.childNodes) if (k.nodeType === 1) { if (match(k)) found.push(k); walk(k); } })(root);
  return found;
}
const byClass = (root, name) => elements(root, (e) => e.className.split(" ").includes(name));
const itemsOf = (root, name) => byClass(root, name).flatMap((list) => elements(list, (e) => e.localName === "li").map((li) => li.textContent));

const sha1 = (text) => createHash("sha1").update(text).digest("hex");

function fakeSnapshot(files, commit) {
  return {
    repository: { server: "github", origin: "https://github.com", path: "fixture/repo", web: "https://github.com/fixture/repo" },
    ref: "main", commit, paths: Object.keys(files),
    async read(path) { return Object.hasOwn(files, path) ? files[path] : null; },
    blob(path) { return Object.hasOwn(files, path) ? sha1(`blob:${path}:${files[path]}`) : null; },
  };
}

// A host over the instance: `readSnapshot(ref)` gives the instance as it stood at the commit `ref` names, and otherwise as it stands.
function instanceHostOf(now, nowCommit, before, beforeCommit) {
  return {
    async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot(ref) { return ref === beforeCommit ? fakeSnapshot(before, beforeCommit) : fakeSnapshot(now, nowCommit); },
  };
}

function productHostOf(files) {
  return {
    async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot() { return fakeSnapshot(files, sha1("itm-780-product-head")); },
  };
}

const BEFORE_COMMIT = sha1("itm-780-instance-declared");
const NOW_COMMIT = sha1("itm-780-instance-head");
const MODEL_PATH = "docs/process-models/fixture-model.md";

const PARTICIPANTS = `# Participants of this instance

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| alice | person | — | — | — | draft text, write to the repository, run code and tests | — | account github/alice |
| bot-a | CI agent | fixture-endpoint | — | — | write to the repository, run code and tests | a lab | ci hosted secret BOT_A |
`;

const SPEC_TEXT = `# SPEC

## 1. Fixture

**A FIXTURE REQUIREMENT** *(PO Fixture)*
Fixture text for a test.
*Check:* no automatic check.
`;

// The model as the product declared it: phases Design and Build, the roles Owner, Reviewer and Developers.
const MODEL_BEFORE = `---
name: fixture-model
kind: planned
measure: plan entries per phase
---
# Fixture model

## Phases

| Name | Role | Produces |
|---|---|---|
| Design | Owner | ARC |
| Build | Developers | ITM |

## Transitions

| From | To | Kind |
|---|---|---|
| Design | Build | sequence |

## Verification pairs

| Phase | Checked by |
|---|---|

## Gates

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Design → Build | ARC | accepted | Owner |

## Roles

| Name | Filled by | How many | Capabilities |
|---|---|---|---|
| Owner | person | one | draft text |
| Reviewer | either | several | draft text |
| Developers | either | several | write to the repository, run code and tests |
`;

// The model as it stands: the phase Build is now Construct, and the role Reviewer is gone.
const MODEL_NOW = MODEL_BEFORE.replaceAll("Build", "Construct").replace("| Reviewer | either | several | draft text |\n", "");

const DECLARATION = `---
model: fixture-model
model_file: ${MODEL_PATH}
model_version: ${BEFORE_COMMIT}
---
# How the fixture product is developed

## Roles

The roles of fixture-model, filled in the product's role assignment.

## Practices

- none

## Branches

| Phase or time box | Branch |
|---|---|
| Build | build-branch |

## Definition of Done

The job rules hold; no condition is added.
`;

const ASSIGNMENT = `# Role assignment

## Roles

| Role | Participants |
|---|---|
| Owner | alice |
| Reviewer | alice |
| Developers | bot-a |
`;

const productFiles = { "docs/process.md": DECLARATION, "docs/role-assignments/product.md": ASSIGNMENT };
const instanceFiles = (model, extra = {}) => ({ "docs/participants.md": PARTICIPANTS, "SPEC.md": SPEC_TEXT, [MODEL_PATH]: model, ...extra });

// Renders the page of a product that declared the instance at BEFORE_COMMIT, over an instance that held `before` then and
// holds `now` now; returns the page's target.
async function pageOf(before, now) {
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, {
    page: "review",
    instance: { repository: "fixture/instance", host: instanceHostOf(now, NOW_COMMIT, before, BEFORE_COMMIT) },
    product: { address: "fixture/product", kind: "github", host: productHostOf(productFiles) },
    store: { async get() { return null; }, async set() {} },
    go() {},
  });
  return target;
}

const changed = () => pageOf(instanceFiles(MODEL_BEFORE), instanceFiles(MODEL_NOW));
const part = (target, name) => { const section = byClass(target, "version-change")[0]; return section ? byClass(section, name)[0] : undefined; };

// ---------------------------------------------------------------- the tests

// TST-780001 · level: unit · module: MOD-implementation-pages
// guards: UC-031 (6a: the phases, gates and roles of workflowOf under each version, side by side)
// given: a declaration naming commit B; the instance's model at B has phases Design and Build, the gate Design → Build and the roles Owner, Reviewer, Developers; as it stands it has Design and Construct, Design → Construct, Owner and Developers
// input: route.render
// expect: the version-change section holds a version-before part with the phases Design and Build, the gate Design → Build and the three roles, and a version-after part with Design and Construct, Design → Construct and two roles
test("process route — a changed model shows the workflows under both versions side by side", async () => {
  const target = await changed();
  assert.equal(byClass(target, "version-change").length, 1, "known positive: the section stands once");
  const before = part(target, "version-before"), after = part(target, "version-after");
  assert.deepEqual(itemsOf(before, "phases"), ["Design (Owner) → ARC", "Build (Developers) → ITM"]);
  assert.deepEqual(itemsOf(after, "phases"), ["Design (Owner) → ARC", "Construct (Developers) → ITM"]);
  assert.deepEqual(itemsOf(before, "gates").map((g) => g.split(":")[0]), ["Design → Build"]);
  assert.deepEqual(itemsOf(after, "gates").map((g) => g.split(":")[0]), ["Design → Construct"]);
  assert.deepEqual(itemsOf(before, "roles"), ["Owner (person)", "Reviewer (either)", "Developers (either)"]);
  assert.deepEqual(itemsOf(after, "roles"), ["Owner (person)", "Developers (either)"]);
});

// TST-780002 · level: unit · module: MOD-implementation-pages
// guards: UC-031 (6a: the difference of the two model files, with showDifference)
// given: the fixture of TST-780001: the model file at B and as it stands differ in the phase Build, its gate and its transition
// input: route.render
// expect: the version-difference part holds exactly what showDifference gives for the file at B and the file as it stands
test("process route — a changed model shows the difference of the two model files", async () => {
  const target = await changed();
  const shown = part(target, "version-difference");
  assert.ok(shown, "the difference part stands");
  assert.equal(shown.textContent, showDifference(MODEL_BEFORE, MODEL_NOW).textContent);
  assert.match(shown.textContent, /- \| Build \| Developers \| ITM \|/);
  assert.match(shown.textContent, /\+ \| Construct \| Developers \| ITM \|/);
});

// TST-780003 · level: unit · module: MOD-implementation-pages
// guards: UC-031 (6a: what becomes invalid — declarationFindings for the declaration as it would be saved, against the catalogue as it stands)
// given: the declaration's Branches name the phase Build, which the model as it stands lacks, and held at B
// input: route.render
// expect: the version-declaration-findings list holds exactly one error, naming Build
test("process route — a changed model lists what the declaration's findings say against the catalogue as it stands", async () => {
  const target = await changed();
  const found = itemsOf(target, "version-declaration-findings");
  assert.equal(found.length, 1, found.join(" | "));
  assert.match(found[0], /error/);
  assert.match(found[0], /Build/);
});

// TST-780004 · level: unit · module: MOD-implementation-pages
// guards: UC-031 (6a: what becomes invalid — roleAssignmentFindings for the role assignments against the new version's workflow)
// given: the product's one role assignment fills Owner, Reviewer and Developers; the model as it stands has no Reviewer
// input: route.render
// expect: the version-assignment-findings list holds exactly one error, naming Reviewer
test("process route — a changed model lists what the role assignments' findings say against the new workflow", async () => {
  const target = await changed();
  const found = itemsOf(target, "version-assignment-findings");
  assert.equal(found.length, 1, found.join(" | "));
  assert.match(found[0], /error/);
  assert.match(found[0], /Reviewer/);
});

// TST-780005 · level: unit · module: MOD-implementation-pages
// guards: UC-031 (6a: with an unchanged model none of it is shown)
// given: the instance's head moved on from B and another file changed, but the model's file is the same as at B
// input: route.render
// expect: no version-change section, no version-before, version-after or version-difference part, and no findings list of a version
test("process route — an unchanged model shows no comparison", async () => {
  const target = await pageOf(instanceFiles(MODEL_BEFORE), instanceFiles(MODEL_BEFORE, { "NOTES.md": "another file changed" }));
  assert.ok(byClass(target, "model-card").length > 0 || byClass(target, "phases-panel").length > 0, "known positive: the page rendered");
  for (const name of ["version-change", "version-before", "version-after", "version-difference", "version-declaration-findings", "version-assignment-findings"]) {
    assert.equal(byClass(target, name).length, 0, name);
  }
});

// TST-859001 · level: unit · module: MOD-implementation-pages
// guards: UC-031 (6a: the route does not throw when the commit the declaration names cannot be read)
// given: the declaration names commit B; the instance's host answers readSnapshot(B) with a rejection "NotFound: no such commit" and the head as usual
// input: route.render
// expect: render resolves; the models and the form stand as for an unchanged model; one warn line names commit B and holds the host's message; no version-change section and none of its parts; nothing is written
test("process route — an unreadable declared commit shows one warning line and no comparison", async () => {
  const target = document.createElement("div");
  document.body.append(target);
  const writes = [];
  const head = instanceFiles(MODEL_NOW);
  await route.render(target, {
    page: "review",
    instance: { repository: "fixture/instance", host: {
      async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
      async readSnapshot(ref) { if (ref === BEFORE_COMMIT) throw new Error("NotFound: no such commit"); return fakeSnapshot(head, NOW_COMMIT); },
    } },
    product: { address: "fixture/product", kind: "github", host: productHostOf(productFiles) },
    store: { async get() { return null; }, async set(...a) { writes.push(a); } },
    go() {},
  });
  assert.ok(byClass(target, "model-card").length > 0 || byClass(target, "phases-panel").length > 0, "known positive: the page rendered");
  assert.ok(target.querySelector("form"), "the form stands");
  const warned = byClass(target, "warn");
  assert.equal(warned.length, 1, warned.map((w) => w.textContent).join(" | "));
  assert.ok(warned[0].textContent.includes(BEFORE_COMMIT), warned[0].textContent);
  assert.ok(warned[0].textContent.includes("NotFound: no such commit"), warned[0].textContent);
  for (const name of ["version-change", "version-before", "version-after", "version-difference", "version-declaration-findings", "version-assignment-findings"]) {
    assert.equal(byClass(target, name).length, 0, name);
  }
  assert.equal(writes.length, 0);
});
