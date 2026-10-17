// MOD-implementation-pages' route `process` — ITM-812: the page groups the catalogue's models by what the catalogue says of
// them, not by a list of names in code (UC-002 step 2; THE CATALOGUE IS DATA). A shipped model of kind `planned` stands under
// "Plan-driven", one of kind `pulled` under "Agile", each in the catalogue's order; a model whose path is under
// docs/process-models/ — the instance's own — stands under "This instance"; and no name of a shipped model or practice is
// left in a code file of the module.
//
// Run: node --test tests/implementation-pages-process-groups.test.mjs
//
// Module: MOD-implementation-pages
// Guards: UC-002; THE CATALOGUE IS DATA
// Level: unit
//
// Each test states its given, its input and its expected result before it runs. Node has no DOM: this file brings the small
// one of tests/implementation-pages-uc-002-findings.test.mjs (copied unchanged), so that schemaForm and explain run as they
// do in a browser. Nothing waits and nothing reaches the network: the repositories are fixtures held in memory.

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
const { catalogue } = await import("../src/model-catalogue/index.mjs");

// ---------------------------------------------------------------- helpers: a fixture repository and the page's groups

function elements(root, match) {
  const found = [];
  (function walk(n) { for (const k of n.childNodes) if (k.nodeType === 1) { if (match(k)) found.push(k); walk(k); } })(root);
  return found;
}
const byClass = (root, name) => elements(root, (e) => e.className.split(" ").includes(name));

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

function fakeHost(files, commit) {
  const current = fakeSnapshot(files, commit);
  return {
    async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot() { return current; },
  };
}

const INSTANCE_COMMIT = sha1("itm-812-fixture-instance-head");

// An instance model of the given kind at docs/process-models/<file>.md, named `name` (which need not be its file's name).
function instanceModel(name, kind) {
  const flow = kind === "pulled"
    ? "\n## Flow control\n\n| Kind | Value |\n|---|---|\n| WIP limit | 3 |\n| Time box | none |\n| Sprints | no |\n" : "";
  return `---
name: ${name}
kind: ${kind}
measure: ${kind === "planned" ? "plan entries per phase" : "items per state over time"}
---
# ${name}

## Phases

| Name | Role | Produces |
|---|---|---|
| Work | Owner | ITM |

## Transitions

| From | To | Kind |
|---|---|---|

## Roles

| Name | Filled by | How many | Capabilities |
|---|---|---|---|
| Owner | person | one | draft text |
${flow}`;
}

function contextOf(instanceHost, productHost) {
  return {
    page: "review",
    instance: { repository: "fixture/instance", host: instanceHost },
    product: { address: "fixture/product", kind: "github", host: productHost },
    store: { async get() { return null; }, async set() {} },
    go() {},
  };
}

// Renders the page over an instance holding `files`, and returns its groups: label -> the models' names, in page order.
async function groupsOf(files) {
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, contextOf(fakeHost(files, INSTANCE_COMMIT), fakeHost({}, sha1("itm-812-product-head"))));
  const groups = new Map();
  for (const group of byClass(target, "model-group")) {
    const label = elements(group, (e) => e.localName === "h3")[0].textContent;
    groups.set(label, byClass(group, "model-card").map((card) => card.getAttribute("data-model")));
  }
  target.remove();
  return groups;
}

// ---------------------------------------------------------------- the tests

// TST-812001 · level: unit · module: MOD-implementation-pages
// guards: UC-002 (step 2: the book's models in the groups Plan-driven and Agile); THE CATALOGUE IS DATA
// given: an instance that holds no model of its own, over the shipped catalogue
// input: route.render
// expect: exactly the groups Plan-driven (waterfall, v-model, reuse-oriented) and Agile (scrum, kanban), in that order and with those models in that order, and no group This instance
test("process route — the shipped catalogue shows the same groups, models and order as before", async () => {
  const groups = await groupsOf({});
  assert.deepEqual([...groups.keys()], ["Plan-driven", "Agile"]);
  assert.deepEqual(groups.get("Plan-driven"), ["waterfall", "v-model", "reuse-oriented"]);
  assert.deepEqual(groups.get("Agile"), ["scrum", "kanban"]);
});

// TST-812002 · level: unit · module: MOD-implementation-pages
// guards: THE CATALOGUE IS DATA (a group is built from each model's kind, in the catalogue's order)
// given: the shipped catalogue as `catalogue` returns it
// input: route.render
// expect: Plan-driven lists the shipped models of kind planned and Agile those of kind pulled, each in the catalogue's order
test("process route — the shipped models stand in the group of their kind, in the catalogue's order", async () => {
  const shipped = (await catalogue(fakeSnapshot({}, INSTANCE_COMMIT))).models;
  const groups = await groupsOf({});
  assert.ok(shipped.length > 0, "known positive: the catalogue holds shipped models");
  assert.deepEqual(groups.get("Plan-driven"), shipped.filter((m) => m.kind === "planned").map((m) => m.name));
  assert.deepEqual(groups.get("Agile"), shipped.filter((m) => m.kind === "pulled").map((m) => m.name));
});

// TST-812003 · level: unit · module: MOD-implementation-pages
// guards: UC-002 (step 2); THE CATALOGUE IS DATA (an instance's model is found by its path)
// given: an instance with a planned model fixture-plan and a pulled model fixture-pull under docs/process-models/
// input: route.render
// expect: both stand under This instance, in the order of their paths, and neither stands in Plan-driven or Agile; the shipped groups are unchanged
test("process route — an instance's models of either kind stand under This instance", async () => {
  const groups = await groupsOf({
    "docs/process-models/fixture-plan.md": instanceModel("fixture-plan", "planned"),
    "docs/process-models/fixture-pull.md": instanceModel("fixture-pull", "pulled"),
  });
  assert.deepEqual(groups.get("This instance"), ["fixture-plan", "fixture-pull"]);
  assert.deepEqual(groups.get("Plan-driven"), ["waterfall", "v-model", "reuse-oriented"]);
  assert.deepEqual(groups.get("Agile"), ["scrum", "kanban"]);
});

// TST-812004 · level: unit · module: MOD-implementation-pages
// guards: THE CATALOGUE IS DATA (the instance's model is told from a shipped one by its path, not by its name)
// given: an instance whose own model, docs/process-models/mine.md, is named like a shipped model, kanban, but is planned
// input: route.render
// expect: that model stands under This instance, and the shipped kanban stays under Agile
test("process route — an instance's model named like a shipped one stands under This instance", async () => {
  const groups = await groupsOf({ "docs/process-models/mine.md": instanceModel("kanban", "planned") });
  assert.deepEqual(groups.get("This instance"), ["kanban"]);
  assert.deepEqual(groups.get("Plan-driven"), ["waterfall", "v-model", "reuse-oriented"]);
  assert.deepEqual(groups.get("Agile"), ["scrum", "kanban"]);
});

// TST-812005 · level: unit · module: MOD-implementation-pages
// guards: THE CATALOGUE IS DATA (no model and no practice is named in code)
// given: the shipped catalogue's model and practice names, and the files of src/implementation-pages/
// input: read each file
// expect: no file contains the name of a shipped model or practice, in any letter case
test("MOD-implementation-pages — no name of a shipped model or practice stays in the module's code", async () => {
  const cat = await catalogue(fakeSnapshot({}, INSTANCE_COMMIT));
  const names = [...cat.models.map((m) => m.name), ...cat.practices.map((p) => p.name)];
  const files = readdirSync("src/implementation-pages").filter((f) => f.endsWith(".mjs"));
  assert.ok(names.includes("scrum") && files.includes("process.mjs"), "known positive: names and files are found");
  for (const file of files) {
    const text = readFileSync(`src/implementation-pages/${file}`, "utf8").toLowerCase();
    for (const name of names) assert.equal(text.includes(name.toLowerCase()), false, `${file} names ${name}`);
  }
});
