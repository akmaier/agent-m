// MOD-implementation-pages' route `process` — the six gaps ITM-223's system and release tests of UC-002 found missing
// (ITM-223-F1 to ITM-223-F6; F7 is ITM-241's, on MOD-site-frame, and F8 and where the process requirements stand are
// change requests to akmaier — none of the three is built here, per the backlog commit that split the findings):
// - F1: the table that keeps the process model and the rules to be met apart opens unfolded the first time this route's
//   module renders, and folded at every later opening — kept in memory only, never the browser's storage, so it is no
//   setting (step 1);
// - F2: the model's transitions and its verification pairs, beside its phases and gates (step 5);
// - F3: beside a branch, the model's own gate at its end — the gate that leaves a phase, or, for the sprint, the gate
//   back to the model's first phase (step 5);
// - F4: for each practice, what it adds, read from the practice's file in the instance's snapshot with the catalogue's
//   practice schema, beside the models it fits (step 6);
// - F5: for a gate a process requirement adds, the two phases it stands between (step 7, 7b);
// - F6: the missing-capability notice of 4b links to the participants' page, `#participants` (UC-017).
//
// Run: node --test tests/implementation-pages-uc-002-findings.test.mjs
//
// Module: MOD-implementation-pages
// Guards: UC-002; THE MODEL DETERMINES THE PHASES AND THE GATES; A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN; A PRACTICE IS NOT A MODEL; A PROCESS REQUIREMENT ADDS TO THE MODEL
// Level: unit
//
// Each test names the requirement it guards and states its given, its input and its expected result before it runs.
// Node has no DOM: this file brings the small one of tests/implementation-pages.test.mjs (itself tests/site-frame.test.mjs's
// and tests/markdown-render.test.mjs's, copied unchanged), so that schemaForm, its editors and explain run as they do in a
// browser. Nothing waits but the turn of the event loop, and nothing reaches the network: the repositories the route reads
// are fixtures held in memory, through a Host of this file's own that answers MOD-repository-hosts' interface.
//
// The F1 test is the first test of this file and the only one that depends on definition order: the route module's own
// "shown before" flag (F1) is a plain module-level variable, shared by every test of this one file (one module instance
// per test file, as node --test loads it), and every other test here renders the page without caring whether that one
// table is folded or open. Placing the F1 test first keeps its own first render the very first render of the whole file.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

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

// The modules, loaded once the document is there. MOD-implementation-pages' route `process` is exercised through its
// Route; every other module is used as the route itself uses it.
const { route } = await import("../src/implementation-pages/process.mjs");

// ---------------------------------------------------------------- helpers: the DOM of a schemaForm, and a fixture repository
//
// Copied from tests/implementation-pages.test.mjs, trimmed to what this file's six tests use.

function elements(root, match) {
  const found = [];
  (function walk(n) { for (const k of n.childNodes) if (k.nodeType === 1) { if (match(k)) found.push(k); walk(k); } })(root);
  return found;
}
const byTag = (root, name) => elements(root, (e) => e.localName === name);
const byClass = (root, name) => elements(root, (e) => e.className.split(" ").includes(name));
const byData = (root, attr, value) => elements(root, (e) => e.getAttribute(attr) === value);

const sha1 = (text) => createHash("sha1").update(text).digest("hex");

// A Snapshot of MOD-repository-hosts, over a fixed map of path -> text.
function fakeSnapshot(files, commit) {
  return {
    repository: { server: "github", origin: "https://github.com", path: "fixture/repo", web: "https://github.com/fixture/repo" },
    ref: "main", commit, paths: Object.keys(files),
    async read(path) { return Object.hasOwn(files, path) ? files[path] : null; },
    blob(path) { return Object.hasOwn(files, path) ? sha1(`blob:${path}:${files[path]}`) : null; },
  };
}

// A Host of MOD-repository-hosts over a fixture repository held in memory: readSnapshot and repositoryInfo, which is all
// this file's reads call — none of these six tests saves.
function fakeHost(files, commit) {
  const current = fakeSnapshot(files, commit);
  return {
    async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot() { return current; },
  };
}

// ---------------------------------------------------------------- the fixture repositories: an instance and a product

const INSTANCE_COMMIT = sha1("itm-240-fixture-instance-head");

const PARTICIPANTS = `# Participants of this instance

Fixture participants for a test.

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| alice | person | — | — | — | draft text, write to the repository, run code and tests | — | account github/alice |
| bot-a | CI agent | fixture-endpoint | — | — | write to the repository, run code and tests | a lab | ci hosted secret BOT_A |
`;

// A fixture model with a "back" transition and two of its own gates — Build → Review and Review → Design — so that a
// branch given to a phase (Build) and a branch given to the sprint (whose end is the gate back to the first phase,
// Design) each have a model's own gate to show (F3), and so that there is a non-empty verification pair and more than
// one transition to show (F2). "pulled", with a time box and no WIP limit, as the book's Scrum is (MOD-model-catalogue's
// model.schema.md: a pulled model needs exactly one of the two).
const FIXTURE_MODEL_PATH = "docs/process-models/fixture-sprint-model.md";
const FIXTURE_MODEL = `---
name: fixture-sprint-model
kind: pulled
measure: remaining items per time box
---
# Fixture sprint model

## Phases

| Name | Role | Produces |
|---|---|---|
| Design | Owner | ARC |
| Build | Developers | ITM |
| Review | Owner | sprint record |

## Transitions

| From | To | Kind |
|---|---|---|
| Design | Build | sequence |
| Build | Review | sequence |
| Review | Design | back |

## Verification pairs

| Phase | Checked by |
|---|---|
| Build | Review |

## Gates

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Build → Review | ITM | every item meets its acceptance criteria | Owner |
| Review → Design | sprint record | the retrospective names an improvement | Owner |

## Roles

| Name | Filled by | Capabilities |
|---|---|---|
| Owner | person | draft text |
| Developers | either | write to the repository, run code and tests |
| Reviewer | either | use tools |

## Flow control

| Kind | Value |
|---|---|
| WIP limit | — |
| Time box | 1 week |
| Sprints | yes |
`;

// One fixture requirement, as the instance's SPEC.md — the process requirement F5's gate is added by.
const SPEC_TEXT = `# SPEC

## 1. Fixture

**A FIXTURE REQUIREMENT** *(PO Fixture)*
Fixture text for a test.
*Check:* no automatic check.
`;

// An instance snapshot with the participants, the fixture model and the instance's SPEC — and, when `practiceAdds` is
// given, a fixture body for the shipped practice devops at the path the catalogue reads it from (F4): the real file's
// name and fits come from MOD-model-catalogue's own shipped copy regardless of this fixture (it loads its shipped
// models and practices from its own files, not from the instance snapshot), but what it adds is read, by this item's
// Outcome, from the practice's file in the instance's snapshot — this fixture instance's own copy of it.
function instanceFiles({ practiceAdds } = {}) {
  const files = { "docs/participants.md": PARTICIPANTS, [FIXTURE_MODEL_PATH]: FIXTURE_MODEL, "SPEC.md": SPEC_TEXT };
  if (practiceAdds) {
    files["src/model-catalogue/practices/devops.md"] = `---
name: devops
fits:
  - scrum
  - kanban
---
# DevOps

## Adds

${practiceAdds}

## What it is

Fixture text.
`;
  }
  return files;
}

// A declaration text declaring fixture-sprint-model, with the given rows under ## Roles, ## Branches and, when given,
// ## Gates added by requirements.
function declarationText({ roles = [], branches = [], requirementGates = [] } = {}) {
  const roleRows = roles.map(({ role, holders = [] }) => `| ${role} | ${holders.join(", ")} |`).join("\n");
  const branchRows = branches.map(({ at, branch }) => `| ${at} | ${branch} |`).join("\n");
  const requirementsSection = requirementGates.length
    ? `\n\n## Gates added by requirements\n\n| Requirement | Between | Artifacts | Condition | Decider |\n|---|---|---|---|---|\n${
      requirementGates.map(({ requirement, between, artifacts, condition, decider }) =>
        `| ${requirement} | ${between} | ${artifacts} | ${condition} | ${decider} |`).join("\n")}`
    : "";
  return `---
model: fixture-sprint-model
model_file: ${FIXTURE_MODEL_PATH}
model_version: ${INSTANCE_COMMIT}
---
# How the fixture product is developed

## Roles

| Role | Participants |
|---|---|
${roleRows}

## Practices

- none

## Branches

| Phase or time box | Branch |
|---|---|
${branchRows}

## Definition of Done

The job rules hold; no condition is added.${requirementsSection}
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

// A product declaring fixture-sprint-model with Owner (alice) and Developers (bot-a) — every test below but F1 and F4
// needs at least this much declared, so that the roles, phases and gates panels render (`renderPanels` draws nothing
// without a declared model).
const BASE_ROLES = [{ role: "Owner", holders: ["alice"] }, { role: "Developers", holders: ["bot-a"] }];

// ---------------------------------------------------------------- F1: the table opens unfolded the first time, folded later

// guards: UC-002 (step 1: the page opens with the table of the process model and the rules to be met, unfolded after
//         the first reading, folded at every later one; ITM-223-F1)
// given: a product without a declaration; this is this test file's first render of the route
// input: route.render, twice, over two fresh targets of the same page
// expect: the "What is this?" holding that table is open on the first render, and folded (no open attribute) on the
//         second — a plain module-level flag, in memory only, never written to any store
test("process route — the process-model-vs-rules table opens unfolded the first time this module renders, folded at every later opening (F1)", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({}, sha1("f1-product-head"));

  const first = connectedTarget();
  await route.render(first, contextOf(instanceHost, productHost));
  const firstTable = byClass(first, "process-vs-rules")[0];
  assert.ok(firstTable, "known positive: the process-vs-rules explanation is on the page");
  const firstDetails = byTag(firstTable, "details")[0];
  assert.ok(firstDetails, "known positive: it is a folded What is this?");
  assert.equal(firstDetails.hasAttribute("open"), true, "unfolded on this module's first render");
  first.remove();

  const second = connectedTarget();
  await route.render(second, contextOf(instanceHost, productHost));
  const secondDetails = byTag(byClass(second, "process-vs-rules")[0], "details")[0];
  assert.equal(secondDetails.hasAttribute("open"), false, "folded at the later opening");
  second.remove();
});

// ---------------------------------------------------------------- F2: transitions and verification pairs

// guards: THE MODEL DETERMINES THE PHASES AND THE GATES; UC-002 (step 5: the workflow shows the model's transitions
//         and its verification pairs, beside its phases and gates; ITM-223-F2)
// given: fixture-sprint-model declared, whose transitions include a "back" one and whose verification pairs name
//        Build checked by Review
// input: route.render(target, context)
// expect: the phases panel names every transition, From, To and its kind, and the verification pair Build/Review
test("process route — the phases panel shows the model's transitions and its verification pairs (F2)", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText({ roles: BASE_ROLES }) }, sha1("f2-product-head"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const phasesPanel = byClass(target, "phases-panel")[0];
  assert.ok(phasesPanel, "known positive: the phases panel is shown");
  const transitionsEl = byClass(phasesPanel, "transitions")[0];
  assert.ok(transitionsEl, "known positive: a transitions list is shown");
  const transitions = transitionsEl.textContent;
  assert.match(transitions, /Design[^A-Za-z]+Build[^A-Za-z]+sequence/s, "the transition Design to Build, sequence");
  assert.match(transitions, /Review[^A-Za-z]+Design[^A-Za-z]+back/s, "the transition Review to Design, back");
  const pairsEl = byClass(phasesPanel, "verification-pairs")[0];
  assert.ok(pairsEl, "known positive: a verification-pairs list is shown");
  const pairs = pairsEl.textContent;
  assert.match(pairs, /Build/, "the verification pair names the checked phase, Build");
  assert.match(pairs, /Review/, "the verification pair names the phase that checks it, Review");

  target.remove();
});

// ---------------------------------------------------------------- F3: beside a branch, the gate at its end

// guards: A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN; UC-002 (step 5: beside a branch, the model's gate at its
//         end — for a phase, the gate that leaves it; for the sprint, the gate back to the model's first phase;
//         ITM-223-F3)
// given: fixture-sprint-model declared, Build given a branch of its own and the sprint given one too (two branch rows)
// input: route.render(target, context)
// expect: Build's branch line also shows Build's own gate, Build → Review; the sprint's branch line shows the gate
//         back to the model's first phase, Review → Design
test("process route — beside a branch, the model's own gate at its end is shown (F3)", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText({
    roles: BASE_ROLES,
    branches: [{ at: "Build", branch: "feature/build" }, { at: "Sprint", branch: "sprint/07" }],
  }) }, sha1("f3-product-head"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const branches = byClass(target, "branches")[0];
  assert.ok(branches, "known positive: the branches list is shown");
  const items = byTag(branches, "li").map((li) => li.textContent);
  const buildLine = items.find((text) => text.startsWith("Build:"));
  const sprintLine = items.find((text) => text.startsWith("Sprint:"));
  assert.ok(buildLine, "known positive: Build's branch line is shown");
  assert.ok(sprintLine, "known positive: the sprint's branch line is shown");
  assert.match(buildLine, /Build[^A-Za-z]+Review/s, "Build's own gate, which leaves it: Build → Review");
  assert.match(sprintLine, /Review[^A-Za-z]+Design/s, "the gate back to the first phase: Review → Design");

  target.remove();
});

// ---------------------------------------------------------------- F4: a practice's own "what it adds"

// guards: A PRACTICE IS NOT A MODEL; UC-002 (step 6: each practice is shown with what it adds, beside the models it
//         fits; ITM-223-F4)
// given: the shipped practice devops (fits: scrum, kanban, from MOD-model-catalogue's own copy), whose file in the
//        instance's snapshot holds a fixture "## Adds"
// input: route.render(target, context), fixture-sprint-model declared
// expect: the practices panel names devops beside the models it fits, and the fixture text of its "## Adds"
test("process route — each practice is shown with what it adds, beside the models it fits (F4)", async () => {
  const instanceHost = fakeHost(instanceFiles({ practiceAdds: "- fixture addition: a continuous pipeline" }), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText({ roles: BASE_ROLES }) }, sha1("f4-product-head"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const practicesPanel = byClass(target, "practices-panel")[0];
  assert.ok(practicesPanel, "known positive: the practices panel is shown");
  assert.match(practicesPanel.textContent, /devops/, "known positive: devops is listed");
  assert.match(practicesPanel.textContent, /scrum/, "known positive: the models it fits are named");
  assert.match(practicesPanel.textContent, /fixture addition: a continuous pipeline/, "what it adds is shown");

  target.remove();
});

// ---------------------------------------------------------------- F5: a process requirement's gate, the phases it stands between

// guards: A PROCESS REQUIREMENT ADDS TO THE MODEL; UC-002 (step 7, 7b: for a gate a process requirement adds, the two
//         phases it stands between; ITM-223-F5)
// given: fixture-sprint-model declared, its declaration adding a gate for A FIXTURE REQUIREMENT between Design and
//        Build — a pair the model's own gates do not use, so it is unambiguous
// input: route.render(target, context)
// expect: the process-requirements panel names the requirement and both phases, Design and Build
test("process route — a gate a process requirement adds is shown with the two phases it stands between (F5)", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText({
    roles: BASE_ROLES,
    requirementGates: [{ requirement: "A FIXTURE REQUIREMENT", between: "Design → Build", artifacts: "TST", condition: "documented", decider: "Owner" }],
  }) }, sha1("f5-product-head"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const panel = byClass(target, "process-requirements")[0];
  assert.ok(panel, "known positive: the process-requirements panel is shown");
  assert.match(panel.textContent, /A FIXTURE REQUIREMENT/, "known positive: the requirement is named");
  assert.match(panel.textContent, /Design[^A-Za-z]+Build/s, "the two phases the gate stands between");

  target.remove();
});

// ---------------------------------------------------------------- F6: the missing-capability link

// guards: UC-002 (4b: no participant has the capabilities a role needs; the missing capability links to the
//         participants' page, #participants, UC-017; ITM-223-F6)
// given: fixture-sprint-model declared; Reviewer needs "use tools", which no fixture participant declares
// input: route.render(target, context)
// expect: Reviewer's missing-capability notice carries a link whose href is exactly #participants
test("process route — the missing-capability notice links to the participants' page, #participants (F6)", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText({ roles: BASE_ROLES }) }, sha1("f6-product-head"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const reviewer = byData(target, "data-role", "Reviewer")[0];
  assert.ok(reviewer, "known positive: Reviewer, which no participant can hold, is shown");
  assert.match(reviewer.textContent, /use tools/, "known positive: the missing capability is named");
  const link = byTag(reviewer, "a")[0];
  assert.ok(link, "known positive: the notice carries a link");
  // This DOM has no reflected href attribute (as tests/system-uc-002-choose-a-process-model.test.mjs's own `role` reader
  // allows for too): a plain `a.href = …` sets the property, not the attribute.
  const href = link.getAttribute("href") ?? link.href;
  assert.equal(href, "#participants", "the link is to the participants' page, not #settings/participants");

  target.remove();
});
