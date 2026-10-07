// MOD-implementation-pages' route `process` — How this product is developed (UC-002), as docs/architecture/
// MOD-implementation-pages.md states it and ITM-222 builds it: the five catalogue models with what their `about` holds
// (step 2); the model's roles, each with the participants that hold every capability it needs and where they process
// data, a role no participant can hold named by its missing capability (4b), a role that needs a person left without
// one disabling Save (4a); the findings of declarationFindings beside the form's fields, among them a warning for a
// holder at a place a linked source does not permit (4c); phases, gates and branches; practices; what the product's
// process requirements add, or that it has none (7a); the Definition of Done; Save, which writes the product's
// docs/process.md with saveFile as the person's own commit, naming model_version by the commit the catalogue's instance
// was read at (step 9); selecting another model lists the kinds of artifact the declared model's phases produce that
// the selected one's do not, deleting nothing (3b); and a refused save keeps the person's edit.
//
// Run: node --test tests/implementation-pages.test.mjs
//
// Module: MOD-implementation-pages
// Guards: UC-002; THE PROCESS MODEL IS DECLARED PER PRODUCT; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; A ROLE NAMES THE CAPABILITIES IT NEEDS
// Level: unit
//
// Not part of ITM-222, and not tested here: the comparison of two versions of the declared model when the catalogue's
// version differs from the one the declaration names (UC-031 6a), and how the dashboard reaches this route.
//
// Each test names the requirement it guards and states its input and its expected result before it runs (given / input
// / expect). Node has no DOM: this file brings the small one of tests/site-frame.test.mjs and tests/markdown-render.test.mjs,
// so that schemaForm, its editors and explain run as they do in a browser. Nothing waits but the turn of the event loop
// in which a form answers, and nothing reaches the network: the repositories the route reads and writes are fixtures
// held in memory, through a Host of this file's own that answers MOD-repository-hosts' interface.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

// ---------------------------------------------------------------- the document: the part of a browser's DOM that is used
//
// What DOMPurify reads through the prototypes — parentNode, childNodes, nextSibling, nodeType, nodeName, ownerDocument,
// attributes, cloneNode, remove, removeAttributeNode — are getters and methods of the classes, as in a browser. Events are
// node's own EventTarget and Event.
//
// Brought in, as tests/site-frame.test.mjs brings it in from tests/markdown-render.test.mjs: an element takes the focus
// only while it is in its document, and only if a person can type in it or press it; the document's activeElement is the
// element that has the focus while it is still in the document, and its body otherwise.

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

// The modules, loaded once the document is there. MOD-implementation-pages' route `process` is exercised through its
// Route; every other module is used as the route itself uses it.
const { route } = await import("../src/implementation-pages/process.mjs");
const { loadSchema, readDocument, writeDocument } = await import("../src/documents/index.mjs");
const { declarationSchema } = await import("../src/product-process/index.mjs");
const { participantSchema } = await import("../src/participant-list/index.mjs");
const { sourceSchemas } = await import("../src/source-register/index.mjs");
const { modelSchema, catalogue } = await import("../src/model-catalogue/index.mjs");

// ---------------------------------------------------------------- helpers: the DOM of a schemaForm (as tests/site-frame
// ---------------------------------------------------------------- .test.mjs reads it), and a fixture repository

// The elements below `root`, in tree order, that `match` accepts.
function elements(root, match) {
  const found = [];
  (function walk(n) { for (const k of n.childNodes) if (k.nodeType === 1) { if (match(k)) found.push(k); walk(k); } })(root);
  return found;
}
const byTag = (root, name) => elements(root, (e) => e.localName === name);
const byClass = (root, name) => elements(root, (e) => e.className.split(" ").includes(name));
const byData = (root, attr, value) => elements(root, (e) => e.getAttribute(attr) === value);
// What a person's typing does: the field holds the new text, and an input event follows.
const type = (field, text) => { field.value = text; field.dispatchEvent(new Event("input")); };
// The turn of the event loop in which a form answers what was done to it.
const turn = () => new Promise((resolve) => setImmediate(resolve));
// A person's click, and the turn in which the page answers it.
const click = async (button) => { button.dispatchEvent(new Event("click")); await turn(); };

const fieldsOf = (form) => byClass(form, "field");
const nameOf = (field) => field.getAttribute("data-key") ?? field.getAttribute("data-section");
const fieldOf = (form, name) => fieldsOf(form).find((field) => nameOf(field) === name);
const inputOf = (form, key) => byTag(fieldOf(form, key), "input")[0];
const areaOf = (form, heading) => byTag(fieldOf(form, heading), "textarea")[0];
const besideOf = (field) => [...byClass(field, "findings")[0].children].map((finding) => finding.textContent);
// The form's own Save, as tests/site-frame.test.mjs finds it: each section's editor brings a Save of its own (not
// hooked up: "the form's one Save does"), appended before the fields that follow it, so the form's own Save — which
// schemaForm appends last, after every field — is the last button in tree order, even once this route's own panels,
// which hold none, are appended after it.
const saveOf = (form) => byTag(form, "button").at(-1);

// A 40-hex-digit sha1, as MOD-documents' type "sha" digits 40 needs for model_version, and a 64-hex-digit one for a
// link's Hash.
const sha1 = (text) => createHash("sha1").update(text).digest("hex");
const sha256 = (text) => createHash("sha256").update(text).digest("hex");

// A Snapshot of MOD-repository-hosts, over a fixed map of path -> text.
function fakeSnapshot(files, commit) {
  return {
    repository: { server: "github", origin: "https://github.com", path: "fixture/repo", web: "https://github.com/fixture/repo" },
    ref: "main", commit, paths: Object.keys(files),
    async read(path) { return Object.hasOwn(files, path) ? files[path] : null; },
    blob(path) { return Object.hasOwn(files, path) ? sha1(`blob:${path}:${files[path]}`) : null; },
  };
}

// A Host of MOD-repository-hosts over a fixture repository held in memory: readSnapshot, repositoryInfo and commitFiles,
// which is all saveFile and the route's own reads call. _setFile simulates a change made elsewhere, outside this page.
function fakeHost(files, commit) {
  let current = fakeSnapshot(files, commit);
  const commits = [];
  return {
    commits,
    async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot() { return current; },
    async commitFiles(change) {
      commits.push(change);
      const next = { ...current.paths.reduce((o, p) => ({ ...o, [p]: files[p] }), {}) };
      for (const f of change.files) { if (f.delete) delete next[f.path]; else next[f.path] = f.text; }
      files = next;
      current = fakeSnapshot(files, sha1(`commit:${commits.length}:${JSON.stringify(next)}`));
      return { commit: current.commit, url: "https://example.test/commit" };
    },
    _setFile(path, text) { files = { ...files, [path]: text }; current = fakeSnapshot(files, sha1(`external:${path}:${text}`)); },
  };
}

// ---------------------------------------------------------------- the fixture repositories: an instance and a product

const INSTANCE_COMMIT = sha1("fixture-instance-head");

const PARTICIPANTS = `# Participants of this instance

Fixture participants for a test.

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| alice | person | — | — | — | draft text, write to the repository, run code and tests | — | account github/alice |
| bot-a | CI agent | fixture-endpoint | — | — | write to the repository, run code and tests | a lab | ci hosted secret BOT_A |
| bot-b | CI agent | fixture-endpoint | — | — | draft text | NHR@FAU, Erlangen | ci hosted secret BOT_B |
`;

const FIXTURE_MODEL_PATH = "docs/process-models/fixture-model.md";
const FIXTURE_MODEL = `---
name: fixture-model
kind: planned
measure: plan entries per phase
---
# Fixture model

## About

manages: the fixture risk it manages
accepts: the fixture risk it accepts
example: a fixture project
chapter: 9, Fixtures

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

| Name | Filled by | Capabilities |
|---|---|---|
| Owner | person | draft text |
| Reviewer | either | use tools |
| Developers | either | write to the repository, run code and tests |
`;

const SPEC_TEXT = `# SPEC

## 1. Fixture

**A FIXTURE REQUIREMENT** *(PO Fixture)*
Fixture text for a test.
*Check:* no automatic check.
`;

const SOURCE_PATH = "docs/sources/SRC-fixture.md";
const SOURCE_ENTRY = `---
id: SRC-fixture
title: A fixture source
kind: standard
authority: normative
licence: restricted — fixture terms
designation: FIX 1:2026
places:
  - NHR@FAU, Erlangen
---
# SRC-fixture A fixture source

## Versions

| Version | Date | Edition | Read from | Files |
|---|---|---|---|---|
| 1 | 2026-01-01 | — | — | fixture.txt |
`;

const LINKS = `# Fixture product's linked sources

| Source | Version | Hash | Part |
|---|---|---|---|
| SRC-fixture | 1 | ${"a".repeat(64)} | |
`;

// An instance snapshot with the participants, the fixture model, the instance's SPEC, and, when `linked` is given, the
// fixture source entry.
function instanceFiles({ withSource = false } = {}) {
  const files = { "docs/participants.md": PARTICIPANTS, [FIXTURE_MODEL_PATH]: FIXTURE_MODEL, "SPEC.md": SPEC_TEXT };
  if (withSource) files[SOURCE_PATH] = SOURCE_ENTRY;
  return files;
}

// A declaration text declaring fixture-model, with the given rows under ## Roles (each "Role | Participants").
function declarationText({ roles = [], sources = false } = {}) {
  const rows = roles.map(({ role, holders = [] }) => `| ${role} | ${holders.join(", ")} |`).join("\n");
  return `---
model: fixture-model
model_file: ${FIXTURE_MODEL_PATH}
model_version: ${INSTANCE_COMMIT}
---
# How the fixture product is developed

## Roles

| Role | Participants |
|---|---|
${rows}

## Practices

- none

## Branches

| Phase or time box | Branch |
|---|---|

## Definition of Done

The job rules hold; no condition is added.
`;
}

// A ViewContext of MOD-site-frame over two fake hosts: the instance's and the product's.
function contextOf(instanceHost, productHost) {
  return {
    page: "review",
    instance: { repository: "fixture/instance", host: instanceHost },
    product: { address: "fixture/product", kind: "github", host: productHost },
    store: { async get() { return null; }, async set() {} },
    go() {},
  };
}

// A target connected to the document, as a route's render expects, removed after the test.
function connectedTarget() {
  const target = document.createElement("div");
  document.body.append(target);
  return target;
}

// ---------------------------------------------------------------- the five catalogue models (step 2)

// guards: UC-002 (step 1-2: the page opens, and shows the book's five models in two groups, each with what its about
//         holds)
// given: a product without docs/process.md, an instance with no custom model of its own
// input: route.render(target, context)
// expect: the page shows a card for each of the five shipped models — waterfall, v-model and reuse-oriented in the
//         plan-driven group, scrum and kanban in the agile one —, each naming what catalogue() itself gives for its
//         about: the risk it manages, the risk it accepts, the example project and the chapter
test("process route — the five catalogue models, in two groups, each with what its about holds", async () => {
  const instanceHost = fakeHost({ "docs/participants.md": PARTICIPANTS, "SPEC.md": SPEC_TEXT }, INSTANCE_COMMIT);
  const productHost = fakeHost({}, sha1("product-head"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const cat = await catalogue(fakeSnapshot({ "docs/participants.md": PARTICIPANTS }, INSTANCE_COMMIT));
  const cards = byClass(target, "model-card");
  assert.deepEqual(cards.map((card) => card.getAttribute("data-model")).sort(),
    ["kanban", "reuse-oriented", "scrum", "v-model", "waterfall"].sort());
  for (const card of cards) {
    const model = cat.models.find((m) => m.name === card.getAttribute("data-model"));
    assert.ok(model.about, `known positive: the shipped model ${model.name} has an About`);
    for (const value of [model.about.manages, model.about.accepts, model.about.example, model.about.chapter]) {
      assert.ok(card.textContent.includes(value), `the card of ${model.name} shows "${value}"`);
    }
  }
  // assert.ok on a plain === , not assert.equal/notEqual: on a mismatch, these are DOM-like objects, not worth
  // formatting a diff of.
  const groups = byClass(target, "model-group");
  const groupOf = (name) => groups.find((g) => byClass(g, "model-card").some((c) => c.getAttribute("data-model") === name));
  assert.ok(groupOf("scrum") !== groupOf("waterfall"), "the agile and the plan-driven models stand in different groups");
  assert.ok(groupOf("v-model") === groupOf("waterfall"), "waterfall and v-model stand in the same, plan-driven group");
  assert.ok(groupOf("kanban") === groupOf("scrum"), "scrum and kanban stand in the same, agile group");

  target.remove();
});

// ---------------------------------------------------------------- a product without, and one with, a declaration (1)

// guards: UC-002 (step 1: the page opens; a product's declaration need not exist yet)
// given: a product whose repository holds no docs/process.md
// input: route.render(target, context)
// expect: no exception; the form shows an empty field for the declaration's keys, model among them, holding no value
test("process route — the page of a product without a declaration", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({}, sha1("empty-product-head"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const form = byClass(target, "schema-form")[0];
  assert.ok(form, "the page holds a form");
  assert.equal(inputOf(form, "model").value, "");
  const offered = byClass(target, "model-card").map((card) => card.getAttribute("data-model"));
  for (const name of ["waterfall", "v-model", "reuse-oriented", "scrum", "kanban"]) {
    assert.ok(offered.includes(name), `${name} is offered to choose from`);
  }

  target.remove();
});

// guards: UC-002 (steps 1, 4, 5, 8: the page of a product that already declared its process shows the model, the
//         roles' holders and the Definition of Done; the route inserts the form in the same turn schemaForm returns
//         it, so that its first field is focused)
// given: a product declaring fixture-model, Owner held by alice, Developers by bot-a
// input: route.render(target, context), built and inserted in the one turn of its own microtask queue
// expect: the model and model_file fields hold the declared model; the ## Roles editor holds the declared rows; once
//         the turn in which render awaited is over, the page's first field has the focus — known positive: before
//         render, the document's active element is its body, not a form field
test("process route — the page of a product with a declaration, its first field focused", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText({
    roles: [{ role: "Owner", holders: ["alice"] }, { role: "Developers", holders: ["bot-a"] }] }) }, sha1("product-head-2"));
  const target = connectedTarget();
  assert.notEqual(document.activeElement.localName, "input", "known positive: nothing is focused before the page renders");

  await route.render(target, contextOf(instanceHost, productHost));
  await turn();

  const form = byClass(target, "schema-form")[0];
  assert.equal(inputOf(form, "model").value, "fixture-model");
  assert.equal(inputOf(form, "model_file").value, FIXTURE_MODEL_PATH);
  assert.match(areaOf(form, "## Roles").value, /Owner \| alice/);
  assert.match(areaOf(form, "## Roles").value, /Developers \| bot-a/);
  // assert.ok, not assert.equal: on a mismatch, formatting these DOM-like objects for a diff is not worth the cost.
  assert.ok(document.activeElement === inputOf(form, "model"), "the form's first field is focused");

  target.remove();
});

// ---------------------------------------------------------------- roles: eligible participants and a missing capability (4b)

// guards: A ROLE NAMES THE CAPABILITIES IT NEEDS; UC-002 (step 4, and 4b: the participants offered for a role are only
//         those with every capability it needs, each with its place; for a role none can hold, the missing capability)
// given: fixture-model's Developers, needing "write to the repository" and "run code and tests" — alice and bot-a have
//        both, bot-b only "draft text" —, and Reviewer, needing "use tools", which no fixture participant declares
// input: route.render(target, context)
// expect: Developers' offered participants are exactly alice and bot-a, each shown with its processing place (alice's
//         is none, shown as "—"); bot-b is not offered; Reviewer names "use tools" as the capability no one has
test("process route — a role's offered participants are those with every capability, each with its place; a role none can hold names the missing capability", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText({ roles: [{ role: "Owner", holders: ["alice"] }] }) },
    sha1("product-head-3"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const developers = byData(target, "data-role", "Developers")[0];
  const reviewer = byData(target, "data-role", "Reviewer")[0];
  assert.ok(developers && reviewer, "both roles are shown");
  assert.ok(developers.textContent.includes("alice"), "alice is offered to Developers");
  assert.ok(developers.textContent.includes("bot-a"), "bot-a is offered to Developers");
  assert.ok(developers.textContent.includes("a lab"), "bot-a's place is shown");
  assert.ok(developers.textContent.includes("—"), "alice's place, which it does not declare, is shown as —");
  assert.ok(!developers.textContent.includes("bot-b"), "bot-b, who lacks a capability Developers needs, is not offered");
  assert.ok(reviewer.textContent.includes("use tools"), "Reviewer names the capability no participant has");

  target.remove();
});

// ---------------------------------------------------------------- findings beside the fields, a disallowed place (4c)

// guards: A ROLE NAMES THE CAPABILITIES IT NEEDS; UC-002 (step 4c: a holder processing data where a linked source does
//         not permit it is named, and the assignment stays possible)
// given: fixture-model declared, Developers held by bot-a — who has every capability Developers needs —, the product
//        linking SRC-fixture, whose entry permits only "NHR@FAU, Erlangen"; bot-a's processing place is "a lab"
// input: route.render(target, context)
// expect: among the findings shown before Save, a warning beside ## Roles naming bot-a, Developers and SRC-fixture
test("process route — the declaration's findings are shown before Save, among them a holder at a place a linked source does not permit", async () => {
  const instanceHost = fakeHost(instanceFiles({ withSource: true }), INSTANCE_COMMIT);
  const productHost = fakeHost({
    "docs/process.md": declarationText({ roles: [{ role: "Owner", holders: ["alice"] }, { role: "Developers", holders: ["bot-a"] }] }),
    "docs/sources.md": LINKS,
  }, sha1("product-head-4"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const form = byClass(target, "schema-form")[0];
  const marks = [...byClass(fieldOf(form, "## Roles"), "marks")[0]?.children ?? []].map((m) => m.textContent).join("\n");
  assert.match(marks, /warning/);
  assert.match(marks, /bot-a/);
  assert.match(marks, /Developers/);
  assert.match(marks, /SRC-fixture/);

  target.remove();
});

// ---------------------------------------------------------------- Save disabled while a role needing a person has none (4a)

// guards: A ROLE NAMES THE CAPABILITIES IT NEEDS; UC-002 (4a: a role that needs a person has none, and Save stays
//         disabled, the role named)
// given: fixture-model declared, its Owner — filled by a person only — left without a holder
// input: route.render(target, context)
// expect: Save is disabled; a finding beside ## Roles names Owner and that it needs a person
test("process route — Save is disabled while a role that needs a person has none, naming it", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText({ roles: [{ role: "Developers", holders: ["bot-a"] }] }) },
    sha1("product-head-5"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const form = byClass(target, "schema-form")[0];
  assert.equal(saveOf(form).disabled, true, "Save is disabled");
  const marks = [...byClass(fieldOf(form, "## Roles"), "marks")[0]?.children ?? []].map((m) => m.textContent).join("\n");
  const beside = besideOf(fieldOf(form, "## Roles")).join("\n");
  assert.match(marks + beside, /Owner/);
  assert.match(marks + beside, /person/);

  target.remove();
});

// ---------------------------------------------------------------- a product with no process requirements yet (7a)

// guards: UC-002 (7a: a product without process requirements yet is told so)
// given: fixture-model declared, its declaration naming no gate added by a requirement
// input: route.render(target, context)
// expect: the process-requirements panel says the product has none yet
test("process route — a product without process requirements is told so", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText({ roles: [{ role: "Owner", holders: ["alice"] }] }) },
    sha1("product-head-6"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const panel = byClass(target, "process-requirements")[0];
  assert.ok(panel, "the panel is shown");
  assert.match(panel.textContent, /no process requirement/i);

  target.remove();
});

// ---------------------------------------------------------------- selecting another model (3b)

// guards: UC-002 (3b: the author changes the model; the page lists which artifacts the new model no longer requires,
//         and deletes none)
// given: fixture-model declared — phases producing ARC and ITM —; waterfall, a shipped model that produces
//        requirements, ARC, MOD and TST, but not ITM
// input: route.render(target, context); the author chooses waterfall's card
// expect: the lost-artifacts notice names ITM, which fixture-model's phases produce and waterfall's do not, and not
//         ARC, which both produce
test("process route — selecting another model lists the kinds of artifact the declared model's phases produce and the selected one's do not", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText({ roles: [{ role: "Owner", holders: ["alice"] }] }) },
    sha1("product-head-7"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const waterfallCard = byClass(target, "model-card").find((c) => c.getAttribute("data-model") === "waterfall");
  assert.ok(waterfallCard, "known positive: waterfall is offered");
  await click(byTag(waterfallCard, "button")[0]);

  const lost = byClass(target, "lost-artifacts")[0];
  assert.match(lost.textContent, /ITM/);
  assert.ok(!lost.textContent.includes("ARC"), "ARC, which both models produce, is not named as lost");

  target.remove();
});

// ---------------------------------------------------------------- Save (step 9) and a refused save

// guards: A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; UC-002 (step 9: one click commits the
//         declaration; the model's version is the commit the catalogue was read at)
// given: a product without a declaration; the author picks fixture-model and fills in the required sections
// input: typing the roles, practices, branches and Definition of Done, then one click on Save
// expect: nothing is committed before the click; after it, exactly one commit of docs/process.md, whose model_version
//         is the instance commit the route read the catalogue at
test("process route — Save commits docs/process.md once, naming model_version by the commit the catalogue was read at", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({}, sha1("new-product-head"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));
  const form = byClass(target, "schema-form")[0];

  const card = byClass(target, "model-card").find((c) => c.getAttribute("data-model") === "fixture-model");
  byTag(card, "button")[0].dispatchEvent(new Event("click"));
  type(areaOf(form, "## Roles"), "\n| Role | Participants |\n|---|---|\n| Owner | alice |\n");
  type(areaOf(form, "## Practices"), "\n- none\n");
  type(areaOf(form, "## Branches"), "\n| Phase or time box | Branch |\n|---|---|\n");
  type(areaOf(form, "## Definition of Done"), "\nThe job rules hold; no condition is added.\n");
  await turn();

  assert.equal(productHost.commits.length, 0, "nothing is committed before the click");
  assert.equal(saveOf(form).disabled, false, "known positive: Save is offered once the required fields are filled");

  await click(saveOf(form));

  assert.equal(productHost.commits.length, 1, "committed once");
  const written = productHost.commits[0].files.find((f) => f.path === "docs/process.md").text;
  const saved = readDocument(declarationSchema, "docs/process.md", written);
  assert.equal(saved.fields.model, "fixture-model");
  assert.equal(saved.fields.model_file, FIXTURE_MODEL_PATH);
  assert.equal(saved.fields.model_version, INSTANCE_COMMIT);

  target.remove();
});

// guards: A PERSON'S OWN INPUT IS COMMITTED DIRECTLY (a refused save keeps the person's edit, as the module file of
//         MOD-artifact-edits states for saveFile)
// given: a product declaring fixture-model; after the page opened, the file is changed elsewhere, outside this page
// input: typing into sprint_close, then one click on Save
// expect: nothing new is committed; the typed text stays in the field
test("process route — a refused save keeps the person's edit", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText({ roles: [{ role: "Owner", holders: ["alice"] }] }) },
    sha1("product-head-8"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));
  const form = byClass(target, "schema-form")[0];
  type(inputOf(form, "sprint_close"), "scrum-master-session");
  await turn();

  // Changed elsewhere, after the page opened it.
  productHost._setFile("docs/process.md", declarationText({ roles: [{ role: "Owner", holders: ["alice"] }, { role: "Developers", holders: ["bot-a"] }] }));

  await click(saveOf(form));

  assert.equal(productHost.commits.length, 0, "nothing is committed on a refused save");
  assert.equal(inputOf(form, "sprint_close").value, "scrum-master-session", "the person's edit stays in the field");

  target.remove();
});
