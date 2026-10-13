// MOD-implementation-pages' route `process` — How this product is developed (UC-002), as docs/architecture/
// MOD-implementation-pages.md states it and ITM-222 builds it: the five catalogue models with what their `about` holds
// (step 2); the model's roles, each with how many fill it and the participants that hold every capability it needs and
// where they process data, a role no participant can hold named by its missing capability; the findings of
// declarationFindings beside the form's fields, among them a participant the declaration names, which disables Save — a
// declaration names roles, never a participant, and the role assignments fill them (UC-048); phases, gates and branches;
// practices; what the product's process requirements add, or that it has none (7a); the Definition of Done; Save, which
// writes the product's
// docs/process.md with saveFile as the person's own commit, naming model_version by the commit the catalogue's instance
// was read at (step 9); selecting another model lists the kinds of artifact the declared model's phases produce that
// the selected one's do not, deleting nothing (3b); and a refused save keeps the person's edit.
//
// Run: node --test tests/implementation-pages.test.mjs
//
// Module: MOD-implementation-pages
// Guards: UC-002; THE PROCESS MODEL IS DECLARED PER PRODUCT; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; A ROLE NAMES THE CAPABILITIES IT NEEDS; THE PROCESS NAMES ROLES, NOT PARTICIPANTS
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
const { modelSchema, catalogue, modelFindings } = await import("../src/model-catalogue/index.mjs");

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

| Name | Filled by | How many | Capabilities |
|---|---|---|---|
| Owner | person | one | draft text |
| Reviewer | either | several | use tools |
| Developers | either | several | write to the repository, run code and tests |
`;

const SPEC_TEXT = `# SPEC

## 1. Fixture

**A FIXTURE REQUIREMENT** *(PO Fixture)*
Fixture text for a test.
*Check:* no automatic check.
`;

// An instance snapshot with the participants, the fixture model, the instance's SPEC, and, when `practiceAdds` is given,
// a devops practice that adds it.
function instanceFiles({ practiceAdds = null, participants = PARTICIPANTS } = {}) {
  const files = { "docs/participants.md": participants, [FIXTURE_MODEL_PATH]: FIXTURE_MODEL, "SPEC.md": SPEC_TEXT };
  if (practiceAdds !== null) files["src/model-catalogue/practices/devops.md"] = `---
name: devops
fits:
  - scrum
  - kanban
---
# DevOps

## Adds

${practiceAdds}

## What it is

Fixture practice.
`;
  return files;
}

// A declaration text declaring fixture-model: it names the model's roles, never a participant; `done` is its Definition of
// Done.
function declarationText({ done = "The job rules hold; no condition is added." } = {}) {
  return `---
model: fixture-model
model_file: ${FIXTURE_MODEL_PATH}
model_version: ${INSTANCE_COMMIT}
---
# How the fixture product is developed

## Roles

The roles of fixture-model — Owner, Reviewer and Developers —, filled in the product's role assignment.

## Practices

- none

## Branches

| Phase or time box | Branch |
|---|---|

## Definition of Done

${done}
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

// TST-472266 · level: unit · module: MOD-implementation-pages
// guards: UC-002 (step 1-2: the page opens, and shows the book's five models in two groups, each with what its about holds)
// given: a product without docs/process.md, an instance with no custom model of its own
// input: route.render(target, context)
// expect: the page shows a card for each of the five shipped models — waterfall, v-model and reuse-oriented in the plan-driven group, scrum and kanban in the agile one —, each naming what catalogue() itself gives for its about: the risk it manages, the risk it accepts, the example project and the chapter
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

// TST-472267 · level: unit · module: MOD-implementation-pages
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

// TST-472268 · level: unit · module: MOD-implementation-pages
// guards: UC-002 (steps 1, 4, 5, 8: the page of a product that already declared its process shows the model, its roles and the Definition of Done; the route inserts the form in the same turn schemaForm returns it, so that its first field is focused); THE PROCESS NAMES ROLES, NOT PARTICIPANTS
// given: a product declaring fixture-model, its roles named and no participant
// input: route.render(target, context), built and inserted in the one turn of its own microtask queue
// expect: the model and model_file fields hold the declared model; the form has no field that assigns participants to roles; each role of the model is shown with how many fill it; once the turn in which render awaited is over, the page's first field has the focus — known positive: before render, the document's active element is its body, not a form field
test("process route — the page of a product with a declaration, its first field focused", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText() }, sha1("product-head-2"));
  const target = connectedTarget();
  assert.notEqual(document.activeElement.localName, "input", "known positive: nothing is focused before the page renders");

  await route.render(target, contextOf(instanceHost, productHost));
  await turn();

  const form = byClass(target, "schema-form")[0];
  assert.equal(inputOf(form, "model").value, "fixture-model");
  assert.equal(inputOf(form, "model_file").value, FIXTURE_MODEL_PATH);
  assert.ok(!fieldOf(form, "sprint_close"), "the form has no field that names a participant");
  assert.ok(!byTag(form, "textarea").some((area) => /\| Role \| Participants \|/.test(area.value)),
    "no field of the form holds a table of roles and participants");
  assert.match(byClass(byData(target, "data-role", "Owner")[0], "how-many")[0].textContent, /one participant fills it/);
  assert.match(byClass(byData(target, "data-role", "Developers")[0], "how-many")[0].textContent, /several participants may fill it/);
  // assert.ok, not assert.equal: on a mismatch, formatting these DOM-like objects for a diff is not worth the cost.
  assert.ok(document.activeElement === inputOf(form, "model"), "the form's first field is focused");

  target.remove();
});

// ---------------------------------------------------------------- the page of a product with Agent M's own declaration
//
// This repository's own files as they stood on origin/sprint/06 — docs/participants.md, and, at the commit the
// declaration's model_version names (4c60cfe5a8bc8c00dcf6705b5decb42823b73a63), docs/process-models/scrum-wip.md with the
// column How many that the model schema now requires —, and its docs/process.md in the form a declaration has now: the
// model, practices, branches and Definition of Done, its roles named and no participant. The instance SPEC is fixture text
// (SPEC_TEXT, above): no test opens SPEC.md.

const AGENT_M_MODEL_VERSION = "4c60cfe5a8bc8c00dcf6705b5decb42823b73a63";
const AGENT_M_SCRUM_WIP_PATH = "docs/process-models/scrum-wip.md";

// docs/process-models/scrum-wip.md as it stood at commit 4c60cfe5a8bc8c00dcf6705b5decb42823b73a63 (git show), with the
// column How many of its roles.
const AGENT_M_SCRUM_WIP = `---
name: scrum-wip
kind: pulled
adapted_from: scrum
measure: items per state over time
---

# Scrum with a work-in-progress limit

**REGISTER**

A process model of this instance (UC-031), adapted from the shipped Scrum model: the flow is controlled by a
work-in-progress limit of 4 instead of a time box; sprints keep a selection the Product Owner makes and have no fixed
length; release tests have a role of their own.

An item counts as in progress from the moment its team starts it until its pull request is merged into the sprint
branch; an item waiting for review counts. A sprint works on the selection the Product Owner made at Sprint planning.
It ends when every selected item is done or the Product Owner ends it; then the review of its increment and the
retrospective are recorded, and then the Product Owner decides the merge of the sprint branch into \`main\`.

## Phases

| Name | Role | Produces |
|---|---|---|
| Sprint planning | Product Owner | ITM (the sprint's selection of backlog items) |
| Development | Developers | MOD (code of the item's modules), TST |
| Release testing | Release tester | TST (release tests of the selected items) |
| Sprint review | Product Owner | sprint record (the review of the increment) |
| Retrospective | Product Owner | sprint record (the retrospective) |

## Transitions

| From | To | Kind |
|---|---|---|
| Sprint planning | Development | sequence |
| Development | Release testing | sequence |
| Release testing | Development | back |
| Release testing | Sprint review | sequence |
| Sprint review | Retrospective | sequence |
| Retrospective | Sprint planning | sequence |

## Verification pairs

| Phase | Checked by |
|---|---|
| Development | Release testing |
| Sprint planning | Sprint review |

## Gates

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Development → Release testing | the item's pull request into the sprint branch, with its code and TST | CI is green on it and the Definition of Done holds | Product Owner |
| Release testing → Sprint review | the release tests (TST) of the selected items | written by a participant other than the implementer of the behaviour they test, green on the sprint branch | Product Owner |
| Retrospective → Sprint planning | the pull request of the sprint branch into \`main\`; the sprint record | the review and the retrospective are recorded, CI is green on the pull request | Product Owner |

## Roles

| Name | Filled by | How many | Capabilities |
|---|---|---|---|
| Product Owner | either | one | read the repository, write to the repository |
| Scrum Master | either | one | read the repository |
| Developers | either | several | read the repository, write to the repository, run code and tests, use tools |
| Release tester | either | several | read the repository, write to the repository, run code and tests |

## Flow control

| Kind | Value |
|---|---|
| WIP limit | 4 |
| Time box | none |
| Sprints | yes |
`;

// docs/process.md of origin/sprint/06 in the form a declaration has now: its roles named, and no participant.
const AGENT_M_PROCESS = `---
model: scrum-wip
model_file: ${AGENT_M_SCRUM_WIP_PATH}
model_version: ${AGENT_M_MODEL_VERSION}
---

# How Agent M is developed

**REGISTER**

The declaration of Agent M's process (UC-002, ARC-019): the model by name and version — the commit of this instance that
holds its file —, practices, branches and the Definition of Done. The role assignments under
\`docs/role-assignments/\` fill its roles from the instance's participants (\`docs/participants.md\`).

## Roles

- Product Owner
- Scrum Master
- Developers
- Release tester

## Practices

- none

## Branches

| Phase or time box | Branch |
|---|---|
| Sprint | \`sprint/<nn>\` |

## Definition of Done

The job rules hold for every pull request; no condition is added.

## Model

\`scrum-wip\` — Scrum with a work-in-progress limit of 4 and no time box, adapted from the shipped Scrum model.
`;

// docs/participants.md on origin/sprint/06, cut to its one table (the register's own prose above and below it is not
// read by any schema field this test checks).
const AGENT_M_PARTICIPANTS = `# Participants of this instance

Capabilities are those of \`A PARTICIPANT DECLARES ITS CAPABILITIES\`: draft text, read the repository, write to
the repository, run code and tests, use tools, reach the web.

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| akmaier | person | — | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | — | the GitHub account \`akmaier\`, on the dashboard and on GitHub's own pages |
| po-opus | CLI agent | claude-opus-5-5 | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | Claude Code on the Mac of \`akmaier\`, started by \`akmaier\`; reached without the Agent M Bridge until it exists (ITM-102) |
| scrum-master-session | CLI agent | claude-opus-5-5 | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | the Claude Code session on the Mac of \`akmaier\` that \`akmaier\` talks to and that starts the other agents; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-sonnet-a | CLI agent | claude-sonnet-5 | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | Claude Code on the Mac of \`akmaier\`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-sonnet-b | CLI agent | claude-sonnet-5 | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | Claude Code on the Mac of \`akmaier\`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-sonnet-c | CLI agent | claude-sonnet-5 | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | Claude Code on the Mac of \`akmaier\`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| developer-sonnet-d | CLI agent | claude-sonnet-5 | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | Claude Code on the Mac of \`akmaier\`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| tester-opus | CLI agent | claude-opus-5-5 | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | Claude Code on the Mac of \`akmaier\`, in a git worktree of its own; reached without the Agent M Bridge until it exists (ITM-102) |
| reviewer-sonnet | CLI agent | claude-sonnet-5 | — | — | draft text, read the repository, write to the repository, run code and tests, use tools, reach the web | Anthropic, a provider in the USA | a Claude Code subagent that \`scrum-master-session\` starts on the Mac of \`akmaier\` to review architecture drafts, reading only; reached without the Agent M Bridge until it exists (ITM-102) |
`;

// TST-472269 · level: unit · module: MOD-implementation-pages
// guards: UC-002 (step 1: the page of a product with Agent M's own declaration)
// given: Agent M's own docs/process.md and docs/participants.md, and, at the commit its model_version names, docs/process-models/scrum-wip.md — five Produces cells carrying a kind's explanation in parentheses, and Flow control naming a WIP limit of 4 and a stated (not dashed) Time box of none
// input: route.render(target, context)
// expect: the model and model_file fields hold scrum-wip and its path; scrum-wip is offered beside the shipped five; its four roles are shown; no participant is named in the declaration. Known positive, run directly against this same text: modelFindings names no error — MOD-model-catalogue, as akmaier's accepted change states it, reads a kind's explanation in parentheses as the kind alone, so the gate Retrospective → Sprint planning finds the sprint record it checks produced, and reads a stated Time box of none as no time box, so Flow control names only the WIP limit. declarationFindings therefore names no error finding beside model_file, and Save is enabled: this settles the review's point that Agent M's own Save stayed disabled (ITM-258).
test("process route — the page of a product with Agent M's own declaration", async () => {
  const instanceHost = fakeHost({
    "docs/participants.md": AGENT_M_PARTICIPANTS,
    [AGENT_M_SCRUM_WIP_PATH]: AGENT_M_SCRUM_WIP,
    "SPEC.md": SPEC_TEXT,
  }, AGENT_M_MODEL_VERSION);
  const productHost = fakeHost({ "docs/process.md": AGENT_M_PROCESS }, sha1("agent-m-product-head"));
  const target = connectedTarget();

  const direct = modelFindings(readDocument(modelSchema.model, AGENT_M_SCRUM_WIP_PATH, AGENT_M_SCRUM_WIP))
    .filter((f) => f.kind === "error");
  assert.equal(direct.length, 0, "known positive: scrum-wip.md has no error finding as it stands");

  await route.render(target, contextOf(instanceHost, productHost));

  const form = byClass(target, "schema-form")[0];
  assert.equal(inputOf(form, "model").value, "scrum-wip");
  assert.equal(inputOf(form, "model_file").value, AGENT_M_SCRUM_WIP_PATH);
  assert.ok(byClass(target, "model-card").some((card) => card.getAttribute("data-model") === "scrum-wip"),
    "scrum-wip is offered beside the shipped five");
  for (const role of ["Product Owner", "Scrum Master", "Developers", "Release tester"]) {
    assert.ok(byData(target, "data-role", role)[0], `the role ${role} is shown`);
  }

  const beside = besideOf(fieldOf(form, "model_file"));
  assert.deepEqual(beside, [], "declarationFindings names no error finding beside model_file");
  assert.equal(saveOf(form).disabled, false, "Save is enabled now that the declared model has no error finding");

  target.remove();
});

// ---------------------------------------------------------------- roles: what each needs; who fills it is the Roles page's (4b)

// TST-472270 · level: unit · module: MOD-implementation-pages
// guards: A ROLE NAMES THE CAPABILITIES IT NEEDS; UC-002 step 4: "Agent M shows the model's roles; for each, whether a person, an agent or either may fill it, which capabilities it needs, and whether one participant fills it or several may … Who fills them is set in the product's role assignment (UC-048)."
// given: fixture-model's Developers, needing "write to the repository" and "run code and tests" — alice and bot-a have both —, and Reviewer, needing "use tools", which no fixture participant declares
// input: route.render(target, context)
// expect: Developers shown with what it needs and how many fill it, and no participant — not alice, not bot-a, who hold its capabilities —; Reviewer shown with "use tools", and no notice of a missing participant; each role links to the Roles page, #roles, where its participants are chosen
test("process route — a role shows who may fill it, how many and what it needs; who fills it is the Roles page's", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText() }, sha1("product-head-3"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const developers = byData(target, "data-role", "Developers")[0];
  const reviewer = byData(target, "data-role", "Reviewer")[0];
  assert.ok(developers && reviewer, "both roles are shown");
  assert.ok(developers.textContent.includes("run code and tests"), "what Developers need");
  assert.ok(!developers.textContent.includes("alice") && !developers.textContent.includes("bot-a"), "no participant is offered here");
  assert.ok(reviewer.textContent.includes("use tools"), "what Reviewer needs");
  for (const role of [developers, reviewer]) {
    const link = byTag(role, "a")[0];
    assert.ok(link, "the role links to where it is filled");
    assert.equal(link.getAttribute("href") ?? link.href, "#roles");
  }

  target.remove();
});

// ---------------------------------------------------------------- findings beside the fields: a participant named

// TST-472271 · level: unit · module: MOD-implementation-pages
// guards: THE PROCESS NAMES ROLES, NOT PARTICIPANTS; UC-002 (postcondition: the declaration names the roles that participants fill, never a participant)
// given: known positive first — fixture-model declared, naming no participant; then the same declaration whose Definition of Done names bot-a, a participant of the instance's list
// input: route.render(target, context) of each
// expect: for the first, Save is offered; for the second, Save is disabled, and a finding beside ## Definition of Done names bot-a and THE PROCESS NAMES ROLES, NOT PARTICIPANTS
test("process route — the declaration's findings are shown before Save: a participant it names disables Save and is named beside its field", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const clean = connectedTarget();
  await route.render(clean, contextOf(instanceHost, fakeHost({ "docs/process.md": declarationText() }, sha1("product-head-4"))));
  assert.equal(saveOf(byClass(clean, "schema-form")[0]).disabled, false, "known positive: a declaration naming no participant can be saved");
  clean.remove();

  const productHost = fakeHost({ "docs/process.md": declarationText({ done: "The job rules hold; bot-a reviews every pull request." }) },
    sha1("product-head-5"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const form = byClass(target, "schema-form")[0];
  assert.equal(saveOf(form).disabled, true, "Save is disabled");
  const field = fieldOf(form, "## Definition of Done");
  const shown = [...[...byClass(field, "marks")[0]?.children ?? []].map((m) => m.textContent), ...besideOf(field)].join("\n");
  assert.match(shown, /bot-a/);
  assert.match(shown, /THE PROCESS NAMES ROLES, NOT PARTICIPANTS/);

  target.remove();
});

// ---------------------------------------------------------------- a product with no process requirements yet (7a)

// TST-472272 · level: unit · module: MOD-implementation-pages
// guards: UC-002 (7a: a product without process requirements yet is told so)
// given: fixture-model declared, its declaration naming no gate added by a requirement
// input: route.render(target, context)
// expect: the process-requirements panel says the product has none yet
test("process route — a product without process requirements is told so", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText() }, sha1("product-head-6"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const panel = byClass(target, "process-requirements")[0];
  assert.ok(panel, "the panel is shown");
  assert.match(panel.textContent, /no process requirement/i);

  target.remove();
});

// ---------------------------------------------------------------- selecting another model (3b)

// TST-472273 · level: unit · module: MOD-implementation-pages
// guards: UC-002 (3b: the author changes the model; the page lists which artifacts the new model no longer requires, and deletes none)
// given: fixture-model declared — phases producing ARC and ITM —; waterfall, a shipped model that produces requirements, ARC, MOD and TST, but not ITM
// input: route.render(target, context); the author chooses waterfall's card
// expect: the lost-artifacts notice names ITM, which fixture-model's phases produce and waterfall's do not, and not ARC, which both produce
test("process route — selecting another model lists the kinds of artifact the declared model's phases produce and the selected one's do not", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText() }, sha1("product-head-7"));
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

// TST-472274 · level: unit · module: MOD-implementation-pages
// guards: A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; UC-002 (step 9: one click commits the declaration; the model's version is the commit the catalogue was read at)
// given: a product without a declaration; the author picks fixture-model and fills in the required sections
// input: typing the practices, branches and Definition of Done, then one click on Save
// expect: nothing is committed before the click; after it, exactly one commit of docs/process.md, whose model_version is the instance commit the route read the catalogue at
test("process route — Save commits docs/process.md once, naming model_version by the commit the catalogue was read at", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({}, sha1("new-product-head"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));
  const form = byClass(target, "schema-form")[0];

  const card = byClass(target, "model-card").find((c) => c.getAttribute("data-model") === "fixture-model");
  byTag(card, "button")[0].dispatchEvent(new Event("click"));
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

// TST-472275 · level: unit · module: MOD-implementation-pages
// guards: UC-002; A PRACTICE IS NOT A MODEL; ONE CLICK PER DECISION; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; MOD-implementation-pages
// given: one valid Scrum declaration rendered through the public route with no selected practice; the same instance snapshot carries devops' explicit gate table, and the route's normal form caller edits ## Practices
// input: select devops, deselect it, then press the form's one Save
// expect: the live workflow gains then loses the marked gate before any write; the one save writes docs/process.md only and preserves the final no-practice selection
test("process route — changing a practice in one live form updates the workflow before Save and Save preserves the selection", async () => {
  const practiceAdds = `| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Development → Evidence review | evidence TST | evidence is reviewed | Product Owner |`;
  const declaration = `---
model: scrum
model_file: src/model-catalogue/models/scrum.md
model_version: ${INSTANCE_COMMIT}
---
# How the fixture product is developed

## Roles

The roles of Scrum — Product Owner, Scrum Master and Developers —, filled in the product's role assignment.

## Practices

- none

## Branches

| Phase or time box | Branch |
|---|---|

## Definition of Done

The job rules hold; no condition is added.
`;
  const instanceHost = fakeHost(instanceFiles({ practiceAdds }), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declaration }, sha1("live-practice-selection"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));
  const form = byClass(target, "schema-form")[0];
  const phases = () => byClass(target, "phases-panel")[0].textContent;
  assert.doesNotMatch(phases(), /practice: devops/, "known positive: no practice gate starts in the workflow");
  assert.equal(saveOf(form).disabled, false, "known positive: the valid declaration can be saved");

  type(areaOf(form, "## Practices"), "\n- devops\n");
  await turn();
  assert.match(phases(), /practice: devops/, "the selected practice gate enters before Save");
  assert.equal(productHost.commits.length, 0, "selection writes nothing before Save");

  type(areaOf(form, "## Practices"), "\n- none\n");
  await turn();
  assert.doesNotMatch(phases(), /practice: devops/, "deselecting removes the practice gate before Save");
  assert.equal(productHost.commits.length, 0, "deselection still writes nothing before Save");

  await click(saveOf(form));
  assert.equal(productHost.commits.length, 1, "one Save writes once");
  assert.deepEqual(productHost.commits[0].files.map((file) => file.path), ["docs/process.md"], "Save writes the declaration only");
  assert.match(productHost.commits[0].files[0].text, /## Practices\n\n- none/, "Save preserves the final practice selection");
  target.remove();
});

// TST-472276 · level: unit · module: MOD-implementation-pages
// guards: A PERSON'S OWN INPUT IS COMMITTED DIRECTLY (a refused save keeps the person's edit, as the module file of MOD-artifact-edits states for saveFile)
// given: a product declaring fixture-model; after the page opened, the file is changed elsewhere, outside this page
// input: typing a condition into ## Definition of Done, then one click on Save
// expect: nothing new is committed; the typed text stays in the field
test("process route — a refused save keeps the person's edit", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText() }, sha1("product-head-8"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));
  const form = byClass(target, "schema-form")[0];
  const typed = "\nreview: 1 by participants other than the implementer\n";
  type(areaOf(form, "## Definition of Done"), typed);
  await turn();
  assert.equal(saveOf(form).disabled, false, "known positive: the edited declaration can be saved");

  // Changed elsewhere, after the page opened it.
  productHost._setFile("docs/process.md", declarationText({ done: "The job rules hold for every pull request." }));

  await click(saveOf(form));

  assert.equal(productHost.commits.length, 0, "nothing is committed on a refused save");
  assert.equal(areaOf(form, "## Definition of Done").value, typed, "the person's edit stays in the field");

  target.remove();
});
