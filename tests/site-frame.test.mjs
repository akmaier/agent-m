// A form from a schema, and the explanations (ITM-221) — MOD-site-frame's interface as docs/architecture/MOD-site-frame.md
// states it, for UC-002: schemaForm, a form built from a schema with its findings beside the fields and Save, and explain,
// the folded "What is this?" of a topic from the module's explanations.md, which holds UC-002's topics. The types View,
// Route and ViewContext, which ITM-221 also builds, are types only and have no test.
//
// ITM-255 adds explanations.md's topics for UC-001's add-product steps and UC-013's release panel (the view add-product,
// ITM-207, and the route release, ITM-256, name them; neither is built yet). Added to this file's "explain" tests below,
// rather than a file of its own, since this is the one place that already renders a topic through explain() — as
// tests/site-frame-book-pointers.test.mjs notes when it reads explanations.md's text directly instead.
// Run: node --test tests/site-frame.test.mjs
//
// Module: MOD-site-frame
// Guards: UC-002; UC-001; UC-013; EVERY STEP EXPLAINS ITSELF; A FORM OPENS WITH ITS FIRST FIELD FOCUSED; ONE CLICK PER
//   DECISION
// Level: unit
//
// Not part of ITM-221, and not tested here: PageSetup, startPage, embedRoute, menuOf, instanceOf, chosenProduct, runPanel,
// confirmDecision and notice; schemaForm's options secretKeys and readOnly; the frame's own check of the topics.
//
// Each test names the requirement it guards and states its input and its expected result before it runs (given / input /
// expect); where a test asserts that something is absent, the same check is first shown to find it on a known positive. The
// counter-proofs are recorded in the pull request. Nothing waits but for the turn of the event loop in which a form answers,
// and nothing reaches the network.
//
// The form is built from a schema as MOD-documents loads it, over a declaration as MOD-documents reads it — what the page of
// UC-002 hands it —, and is checked as a person meets it: the fields and their values, the findings beside them, the
// handed-over document written with MOD-documents' writeDocument, the focus. The module runs in a browser, and node has no
// DOM: this file brings the small one of tests/markdown-render.test.mjs, so that the editor of a section and the renderer of
// an explanation run as they are, and adds to it what a browser does with the focus.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// ---------------------------------------------------------------- the document: the part of a browser's DOM that is used
//
// What DOMPurify reads through the prototypes — parentNode, childNodes, nextSibling, nodeType, nodeName, ownerDocument,
// attributes, cloneNode, remove, removeAttributeNode — are getters and methods of the classes, as in a browser. Events are
// node's own EventTarget and Event.
//
// Added here to the document of tests/markdown-render.test.mjs, as a browser does it: an element takes the focus only while
// it is in its document, and only if a person can type in it or press it; the document's activeElement is the element that
// has the focus while it is still in the document, and its body otherwise.

const FOCUSABLE = new Set(["input", "textarea", "select", "button"]);
const HTML_NS = "http://www.w3.org/1999/xhtml";
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["script", "style", "textarea", "title", "xmp", "iframe", "noembed", "noframes", "noscript"]); // text until its end tag
const LITERAL = new Set(["script", "style", "xmp", "iframe", "noembed", "noframes", "noscript"]); // its text is neither decoded nor escaped
const SHOWN = { 1: 0x1, 3: 0x4, 8: 0x80 }; // NodeFilter's SHOW_ bit of an element, a text, a comment
const iterators = new Set();

const ENTITY = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => (e[0] !== "#" ? ENTITY[e.toLowerCase()] ?? m
  : String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1)))));
const escapeText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "&nbsp;");
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

// The modules, loaded once the document is there: DOMPurify, which the renderer uses, takes the window it finds when it is
// loaded. MOD-documents plays the page that hands the form its schema and its document, and writes what the form hands over.
const { schemaForm, explain, startPage, instanceOf, notice, confirmDecision } = await import("../src/site-frame/index.mjs");
const { renderArtifact } = await import("../src/markdown-render/index.mjs");
const { loadSchema, readDocument, writeDocument } = await import("../src/documents/index.mjs");

// ---------------------------------------------------------------- helpers

// The elements below `root`, in tree order, that `match` accepts.
function elements(root, match) {
  const found = [];
  (function walk(n) { for (const k of n.childNodes) if (k.nodeType === 1) { if (match(k)) found.push(k); walk(k); } })(root);
  return found;
}
const byTag = (root, name) => elements(root, (e) => e.localName === name);
const byClass = (root, name) => elements(root, (e) => e.className.split(" ").includes(name));
// What a person's typing does: the field holds the new text, and an input event follows.
const type = (field, text) => { field.value = text; field.dispatchEvent(new Event("input")); };
// The turn of the event loop in which a form answers what was done to it.
const turn = () => new Promise((resolve) => setImmediate(resolve));
// A person's click on a button, and the turn in which the form answers it.
const click = async (button) => { button.dispatchEvent(new Event("click")); await turn(); };

// The fields of a form, each named by its key or by its section's heading line.
const fieldsOf = (form) => byClass(form, "field");
const nameOf = (field) => field.getAttribute("data-key") ?? field.getAttribute("data-section");
const fieldOf = (form, name) => fieldsOf(form).find((field) => nameOf(field) === name);
const inputOf = (form, key) => byTag(fieldOf(form, key), "input")[0];
const areaOf = (form, heading) => byTag(fieldOf(form, heading), "textarea")[0];
// The findings shown beside a field, and the marks beside each line of a section's editor, one row per line.
const besideOf = (field) => [...byClass(field, "findings")[0].children].map((finding) => finding.textContent);
const marksOf = (field) => [...byClass(field, "marks")[0].children].map((row) => row.textContent);
// The findings at the end of the form, beside no field; and the form's Save, its last button.
const endOf = (form) => [...form.children.find((part) => part.localName === "ul").children].map((finding) => finding.textContent);
const saveOf = (form) => byTag(form, "button").at(-1);

// ---------------------------------------------------------------- the fixture: a declaration of UC-002 and its schema
//
// The schema of a product's declaration docs/process.md, cut down to what the form's tests need: two required keys and an
// optional one, a section holding a table, a section that may be left out, and a section of text. A section the schema does
// not name is allowed.

const SCHEMA = loadSchema([
  "# The declaration of a product's process, as the form's tests use it",
  "",
  "```json",
  JSON.stringify({
    schema: "declaration", shape: "document", rule: "THE PROCESS MODEL IS DECLARED PER PRODUCT", path: "docs/process.md",
    frontMatter: {
      model: { type: "text", required: true },
      model_version: { type: "sha", digits: 40, required: true },
      sprint_close: { type: "text" },
    },
    sections: [
      { heading: "## Roles", required: true, table: { columns: [
        { name: "Role", value: { type: "text", required: true } },
        { name: "Participants", value: { type: "list", item: { type: "text" } } }] } },
      { heading: "## Practices", required: false },
      { heading: "## Definition of Done", required: true },
    ],
    otherSections: "allowed",
  }, null, 2),
  "```",
  "",
].join("\n"), "the tests of MOD-site-frame");

const SHA = "0123456789abcdef0123456789abcdef01234567";
const ROLES = "\n| Role | Participants |\n|---|---|\n| Product Owner | po-opus |\n| Developers | developer-opus-a, developer-opus-b |\n\n";
const DONE = "\nThe job rules hold; no condition is added.\n\n";

// The declaration a product holds, line by line: the front matter on lines 1 to 4, the title on 5, ## Roles on 7 with the
// row of the Developers on 12, ## Definition of Done on 14, and ## Model on 18 — a section the schema does not name.
const declarationText = (version) => `---\nmodel: scrum\nmodel_version: ${version}\n---\n# How the fixture product is developed\n\n`
  + `## Roles\n${ROLES}## Definition of Done\n${DONE}## Model\n\nScrum, as the book describes it.\n`;
const DECLARATION = readDocument(SCHEMA, "docs/process.md", declarationText(SHA));

const nothingToSave = async () => {};

// ---------------------------------------------------------------- schemaForm (Interfaces: schemaForm)

// guards: UC-002 (the declaration is edited in a form built from its schema)
// given: SCHEMA — the keys model, model_version and sprint_close; the sections ## Roles, holding a table, ## Practices, which
//        may be left out, and ## Definition of Done — and DECLARATION, which holds model and model_version, ## Roles,
//        ## Definition of Done and ## Model, a section the schema does not name
// input: schemaForm(SCHEMA, DECLARATION, { onSave })
// expect: one field for each key and each section of the schema, in the schema's order — model, model_version, sprint_close,
//         ## Roles, ## Practices, ## Definition of Done —, and none for ## Model; the field of each key holds its value, that
//         of sprint_close none; the field of each section holds its text in an editor, that of ## Practices none
test("schemaForm — a field for each key and each section of the schema, holding the document's values", () => {
  const form = schemaForm(SCHEMA, DECLARATION, { onSave: nothingToSave });
  assert.deepEqual(fieldsOf(form).map(nameOf),
    ["model", "model_version", "sprint_close", "## Roles", "## Practices", "## Definition of Done"]);
  assert.deepEqual(["model", "model_version", "sprint_close"].map((key) => inputOf(form, key).value), ["scrum", SHA, ""]);
  assert.deepEqual(["## Roles", "## Practices", "## Definition of Done"].map((heading) => areaOf(form, heading).value),
    [ROLES, "", DONE]);
});

// guards: UC-002 (each finding of the declaration beside its field, and Save only while no error remains: 4a)
// given: DECLARATION with the model_version "0123abc", which MOD-documents' documentFindings finds not to be 40 hexadecimal
//        digits; and an extra check, as the page of UC-002 adds its own, that warns of the row of the Developers in
//        ## Roles — line 12 of the file
// input: schemaForm(SCHEMA, that declaration, { onSave, extraChecks }); then the person types SHA into model_version
// expect: beside model_version, its error; beside line 5 of the editor of ## Roles — the row of the Developers —, the
//         warning, in the one form of a finding; nothing beside any other field or line, nor at the end of the form; Save
//         not offered. After the typing: nothing beside model_version, the warning still beside its line, and Save offered:
//         a warning keeps nothing from being saved
test("schemaForm — a finding is shown beside its field, and Save is offered only while no error remains", () => {
  const extraChecks = (declaration) => declaration.sections.find((section) => section.heading === "## Roles").rows
    .filter((row) => row.cells.Role === "Developers")
    .map((row) => ({ artifact: declaration.path, line: row.line, kind: "warning", rule: "A ROLE NAMES THE CAPABILITIES IT NEEDS",
      what: "developer-opus-b cannot run code and tests", fix: "assign a participant who can" }));
  const form = schemaForm(SCHEMA, readDocument(SCHEMA, "docs/process.md", declarationText("0123abc")),
    { onSave: nothingToSave, extraChecks });
  const others = fieldsOf(form).filter((field) => nameOf(field) !== "model_version");
  const warned = ["", "", "", "", "docs/process.md:5: warning: developer-opus-b cannot run code and tests "
    + "[A ROLE NAMES THE CAPABILITIES IT NEEDS] — assign a participant who can.", "", ""];

  assert.deepEqual(besideOf(fieldOf(form, "model_version")), ['error: the key model_version does not fit: "0123abc" is not 40 '
    + "lowercase hexadecimal digits — correct the value of the key model_version [THE PROCESS MODEL IS DECLARED PER PRODUCT]"]);
  assert.deepEqual(marksOf(fieldOf(form, "## Roles")), warned);
  assert.deepEqual(others.map(besideOf), others.map(() => []), "nothing beside any other field");
  for (const heading of ["## Practices", "## Definition of Done"]) {
    assert.ok(marksOf(fieldOf(form, heading)).every((row) => row === ""), `nothing beside a line of ${heading}`);
  }
  assert.deepEqual(endOf(form), [], "nothing at the end of the form");
  assert.equal(saveOf(form).disabled, true, "Save is not offered while the error remains");

  type(inputOf(form, "model_version"), SHA);
  assert.deepEqual(besideOf(fieldOf(form, "model_version")), []);
  assert.deepEqual(marksOf(fieldOf(form, "## Roles")), warned);
  assert.equal(saveOf(form).disabled, false, "Save is offered: no error remains");
});

// The declaration as the person of the next test leaves it: sprint_close given, ## Practices added, and a condition in the
// Definition of Done.
const SAVED = [
  "---",
  "model: scrum",
  `model_version: ${SHA}`,
  "sprint_close: scrum-master-session",
  "---",
  "# How the fixture product is developed",
  "",
  "## Roles",
  "",
  "| Role | Participants |",
  "|---|---|",
  "| Product Owner | po-opus |",
  "| Developers | developer-opus-a, developer-opus-b |",
  "",
  "## Practices",
  "- none",
  "## Definition of Done",
  "",
  "review: 1 by participants other than the implementer",
  "",
  "## Model",
  "",
  "Scrum, as the book describes it.",
  "",
].join("\n");

// guards: ONE CLICK PER DECISION; UC-002 (step 9: one click on Save, and the declaration is handed over to be committed)
// given: the form of DECLARATION, whose caller's onSave keeps every document it is given
// input: the person types "scrum-master-session" into sprint_close, "- none" into ## Practices, which the declaration lacks,
//        and a condition in place of the text of ## Definition of Done; then clicks Save, once
// expect: nothing is handed over before the click; after it, exactly one document. Written with MOD-documents'
//         writeDocument, it is SAVED: the new key in the schema's order; ## Practices in the schema's place, its text with
//         the line end that keeps the next heading on a line of its own; the condition; every other part as it was, ## Model
//         included. Read back from SAVED, it is the same document, each section and row on its line — but for its body,
//         which stays the text it was read from, as writeDocument needs it
test("schemaForm — Save hands the document over once, on a person's click", async () => {
  const handed = [];
  const form = schemaForm(SCHEMA, DECLARATION, { onSave: async (declaration) => { handed.push(declaration); } });
  type(inputOf(form, "sprint_close"), "scrum-master-session");
  type(areaOf(form, "## Practices"), "- none");
  type(areaOf(form, "## Definition of Done"), "\nreview: 1 by participants other than the implementer\n\n");
  await turn();
  assert.deepEqual(handed, [], "nothing is handed over before the click");

  await click(saveOf(form));
  assert.equal(handed.length, 1, "handed over once");
  assert.equal(writeDocument(SCHEMA, handed[0]), SAVED);
  const { body, ...rest } = handed[0];
  const { body: _savedBody, ...read } = readDocument(SCHEMA, "docs/process.md", SAVED);
  assert.equal(body, DECLARATION.body, "the body is the text the document was read from");
  assert.deepEqual(rest, read);
});

// guards: A FORM OPENS WITH ITS FIRST FIELD FOCUSED
// given: a page whose focus is on the control that opens the form — known positive: the page tells that control apart from
//        the form's fields
// input: the form of DECLARATION, built and put into the page in the same turn
// expect: once that turn is over, the focus is in the field of model, the form's first field, and no longer on the control
test("schemaForm — the form opens with its first field focused", async () => {
  const opener = document.createElement("button");
  document.body.append(opener);
  opener.focus();
  assert.equal(document.activeElement, opener, "known positive: the control that opens the form has the focus");
  const form = schemaForm(SCHEMA, DECLARATION, { onSave: nothingToSave });
  document.body.append(form);
  await turn();
  assert.equal(document.activeElement, inputOf(form, "model"));
  form.remove();
  opener.remove();
});

// ---------------------------------------------------------------- explain (Interfaces: explain)
//
// The topics are read from the module's own explanations.md: one section `## <topic>` per topic, its body the Markdown shown
// when the explanation is unfolded.

const EXPLANATIONS = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8");
// The Markdown under `## <topic>`, up to the next such line; undefined where the file holds no such line.
const topicText = (topic) => EXPLANATIONS.split(/^## /m).slice(1).find((part) => part.startsWith(`${topic}\n`))
  ?.slice(topic.length + 1);

// guards: EVERY STEP EXPLAINS ITSELF; UC-002 (step 8: a folded explanation says that in Scrum the Developers meet the
//         Definition of Done, whoever presses merge)
// given: the topic definition-of-done, as explanations.md holds it
// input: explain("definition-of-done")
// expect: a <details class="explain">, folded — no open attribute —, holding <summary>What is this?</summary> and then the
//         topic's Markdown rendered, the HTML MOD-markdown-render's renderArtifact gives for it, which says that in Scrum
//         the Developers meet the Definition of Done, whoever presses merge
test("explain — the folded What is this? of a topic, rendered from explanations.md", () => {
  const text = topicText("definition-of-done");
  assert.ok(text?.trim(), "known positive: explanations.md holds the topic definition-of-done");
  const folded = explain("definition-of-done");
  assert.equal(folded.localName, "details");
  assert.equal(folded.className, "explain");
  assert.equal(folded.hasAttribute("open"), false, "folded");
  const [summary, body, ...more] = folded.children;
  assert.deepEqual([summary.localName, summary.textContent, more.length], ["summary", "What is this?", 0]);
  assert.equal(body.innerHTML, renderArtifact(text).innerHTML);
  assert.match(body.textContent, /In Scrum, the Developers meet the Definition of Done, whoever presses merge\./);
});

// guards: EVERY STEP EXPLAINS ITSELF (a topic the file does not hold shows nothing, and the page goes on)
// given: known positive — the search below finds the topic definition-of-done in explanations.md —; it finds no topic
//        no-such-topic
// input: explain("no-such-topic")
// expect: no exception; an element without any child
test("explain — an empty element for a topic the file does not hold", () => {
  assert.ok(topicText("definition-of-done") !== undefined, "known positive: the search finds a topic the file holds");
  assert.equal(topicText("no-such-topic"), undefined);
  const nothing = explain("no-such-topic");
  assert.equal(nothing.nodeType, 1, "an element");
  assert.equal(nothing.childNodes.length, 0, "without any child");
});

// ---------------------------------------------------------------- explain — UC-001's and UC-013's topics (ITM-255)
//
// UC-001's own text: "Every step carries a folded What is this? explanation for newcomers: what a repository is, why the
// product gets a key of its own, what the commit contains, how to undo it, and why the product list lives in this browser
// only." UC-013's own text: "Folded explanations say what each level checks, why release tests run with a different
// participant, and why a released version is never changed afterwards." ITM-255's Outcome names these eight topics; each
// gets a slug of its own, which the add-product view (ITM-207) and the release route (ITM-256) will name once built — the
// generic shape of explain()'s element (a folded <details>, rendered through renderArtifact) is already checked above, so
// each test below only checks the body text these two use cases ask of its topic.

// The folded body's rendered text, for a topic this block checks: the full textContent of the <div> that follows
// <summary>, the same destructuring the test above uses — with runs of whitespace collapsed to one space, since
// textContent keeps explanations.md's own line-wrap newlines, which a browser's rendering of the <p> does not show.
const bodyText = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/\s+/g, " ");

// guards: EVERY STEP EXPLAINS ITSELF; UC-001 (step 2: pasting the product repository's address)
// given: the topic repository, as ITM-255 adds it to explanations.md
// input: explain("repository")
// expect: text saying a repository holds a project's files and history, with an example address for a GitHub and for a
//         GitLab product, as UC-001 step 2 gives them
test("explain — repository: what a repository is (UC-001)", () => {
  assert.ok(topicText("repository")?.trim(), "known positive: explanations.md holds the topic repository");
  const text = bodyText("repository");
  assert.match(text, /folder on GitHub/);
  assert.match(text, /github\.com\/alice\/thesis-tool/);
  assert.match(text, /gitlab\.rrze\.fau\.de/);
});

// guards: EVERY STEP EXPLAINS ITSELF; UC-001 (Step A: a key for the product); A GITHUB PRODUCT USES A TOKEN OF ITS OWN
// given: the topic product-key
// input: explain("product-key")
// expect: text saying the product gets a key of its own, and naming the GitLab project access token as the same idea on
//         that kind of server
test("explain — product-key: why the product gets a key of its own (UC-001)", () => {
  assert.ok(topicText("product-key")?.trim(), "known positive: explanations.md holds the topic product-key");
  const text = bodyText("product-key");
  assert.match(text, /a key of its own/);
  assert.match(text, /project access token/);
});

// guards: EVERY STEP EXPLAINS ITSELF; UC-001 (Step C: Add the product, one click)
// given: the topic review-layout-commit
// input: explain("review-layout-commit")
// expect: text naming the folders and files UC-001 step 5 writes, and that only what is missing is written
test("explain — review-layout-commit: what the commit contains (UC-001)", () => {
  assert.ok(topicText("review-layout-commit")?.trim(), "known positive: explanations.md holds the topic review-layout-commit");
  const text = bodyText("review-layout-commit");
  assert.match(text, /docs\/use-cases\//);
  assert.match(text, /docs\/spec-freigaben\//);
  assert.match(text, /SPEC\.md/);
  assert.match(text, /CHANGELOG\.md/);
  assert.match(text, /only whatever of this is missing/);
});

// guards: EVERY STEP EXPLAINS ITSELF; UC-001 (5b: the product already has the complete layout — nothing is committed)
// given: the topic reverting-the-commit
// input: explain("reverting-the-commit")
// expect: text saying the commit is ordinary and can be reverted on GitHub, and that nothing is committed when nothing was
//         missing
test("explain — reverting-the-commit: how to undo it (UC-001)", () => {
  assert.ok(topicText("reverting-the-commit")?.trim(), "known positive: explanations.md holds the topic reverting-the-commit");
  const text = bodyText("reverting-the-commit");
  assert.match(text, /ordinary commit/);
  assert.match(text, /revert it/);
  assert.match(text, /nothing is committed in the first place/);
});

// guards: EVERY STEP EXPLAINS ITSELF; UC-001 (NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY; THE DASHBOARD KEEPS ITS
//   PRODUCTS IN THE BROWSER; 1a: another browser's list is empty)
// given: the topic the-product-list
// input: explain("the-product-list")
// expect: text saying the address is kept only in this browser, nothing is written into the instance repository, and
//         another browser starts with an empty list
test("explain — the-product-list: why the product list lives in this browser only (UC-001)", () => {
  assert.ok(topicText("the-product-list")?.trim(), "known positive: explanations.md holds the topic the-product-list");
  const text = bodyText("the-product-list");
  assert.match(text, /kept only in this browser's own storage/);
  assert.match(text, /instance repository/);
  assert.match(text, /empty list/);
});

// guards: EVERY STEP EXPLAINS ITSELF; UC-013 (step 2: the complete test suite, every level, on the release candidate)
// given: the topic release-test-levels
// input: explain("release-test-levels")
// expect: text naming the four levels UC-013 step 2 runs and what each checks
test("explain — release-test-levels: what each level checks (UC-013)", () => {
  assert.ok(topicText("release-test-levels")?.trim(), "known positive: explanations.md holds the topic release-test-levels");
  const text = bodyText("release-test-levels");
  assert.match(text, /paid external services mocked/);
  assert.match(text, /walk each use case end to end/);
  assert.match(text, /otherwise happens only nightly/);
  assert.match(text, /other than the one who implemented the behaviour/);
});

// guards: EVERY STEP EXPLAINS ITSELF; UC-013 (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER; 2a: only the implementing
//   participant is available)
// given: the topic independent-release-tests
// input: explain("independent-release-tests")
// expect: text saying release tests are written by someone other than the implementer, and what 2a asks the author to do
//         when only the implementer is available
test("explain — independent-release-tests: why a different participant writes them (UC-013)", () => {
  assert.ok(topicText("independent-release-tests")?.trim(), "known positive: explanations.md holds the topic independent-release-tests");
  const text = bodyText("independent-release-tests");
  assert.match(text, /other than the one who implemented/);
  assert.match(text, /assign a second participant/);
});

// guards: EVERY STEP EXPLAINS ITSELF; UC-013 (A VERSION IS NOT REWRITTEN; 4a: the tag already exists)
// given: the topic version-not-rewritten
// input: explain("version-not-rewritten")
// expect: text saying a tag is never moved once set, and that a correction becomes the next version
test("explain — version-not-rewritten: why a released version is never changed afterwards (UC-013)", () => {
  assert.ok(topicText("version-not-rewritten")?.trim(), "known positive: explanations.md holds the topic version-not-rewritten");
  const text = bodyText("version-not-rewritten");
  assert.match(text, /tag is never moved/);
  assert.match(text, /recovered, compared and relied on/);
  assert.match(text, /correction becomes the next version/);
});

// ---------------------------------------------------------------- Bridge frame (ITM-275)

// A Map-backed browser store, as the browser-store unit tests use. The frame opens it through the real public interface.
function bridgeStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    get length() { return values.size; },
    key: (index) => [...values.keys()][index] ?? null,
  };
}

// guards: UC-044; UC-003; MOD-site-frame; MOD-identifiers; EVERY STEP EXPLAINS ITSELF
// given: an own-protocol Bridge window whose location has the configured Pages hostname and path, an empty browser store,
//        and one loaded Bridge view whose route records the real context it receives
// input: startPage({ page: "bridge", views: [view], menuViews: [] }), then the route is changed through the fragment
// expect: the Bridge header and first route are drawn; the context names the configured fork, an empty product state, the
//         real store and host, and a go callback. The later fragment redraws that route. No repository request or strategy
//         registration occurs for this empty-strategy page.
test("startPage — Bridge-only frame routes its loaded view with the configured Pages instance and empty product", async () => {
  const priorLocation = globalThis.location;
  const priorStorage = globalThis.localStorage;
  const priorAdd = window.addEventListener;
  const listeners = new Map();
  const location = { hostname: "fork-owner.github.io", pathname: "/fork-agent-m/bridge.html", hash: "#pair" };
  const calls = [];
  let fetches = 0;
  const priorFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: bridgeStorage() });
  window.addEventListener = (type, listener) => listeners.set(type, listener);
  globalThis.fetch = async () => { fetches += 1; throw new Error("a Bridge frame with no strategy does not read a repository"); };
  document.body.replaceChildren();
  try {
    const view = { strategies: [], routes: [{ name: "pair", entry: null, title: "Pair the Bridge", async render(target, context, params) {
      calls.push({ context, params });
      target.replaceChildren(document.createElement("p"));
      target.firstChild.textContent = `pair:${params.code ?? ""}`;
    } }] };
    await startPage({ page: "bridge", views: [view], menuViews: [] });

    assert.match(document.body.textContent, /Agent M Bridge/, "the Bridge header is drawn");
    assert.equal(calls.length, 1, "the initial fragment renders once");
    assert.equal(calls[0].context.page, "bridge");
    assert.equal(calls[0].context.instance.repository, "fork-owner/fork-agent-m");
    assert.equal(calls[0].context.product, null, "the Bridge starts without a chosen product");
    assert.equal(calls[0].context.store.prefix, "agent-m:fork-owner/fork-agent-m:", "the real store is scoped to the fork");
    assert.equal(typeof calls[0].context.instance.host.repositoryInfo, "function", "the real repository host is supplied");
    assert.equal(typeof calls[0].context.go, "function");
    assert.equal(fetches, 0, "connecting the host does not read a repository");

    calls[0].context.go("pair", { code: "again" });
    assert.equal(location.hash, "#pair/code=again", "go writes the route in the fragment");
    await listeners.get("hashchange")();
    assert.equal(calls.length, 2, "the later fragment redraws the loaded route");
    assert.deepEqual(calls[1].params, { code: "again" });
    assert.equal(fetches, 0, "fragment navigation still makes no repository request");
  } finally {
    document.body.replaceChildren();
    Object.defineProperty(globalThis, "location", { configurable: true, value: priorLocation });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: priorStorage });
    globalThis.fetch = priorFetch;
    window.addEventListener = priorAdd;
  }
});

// guards: MOD-site-frame; MOD-identifiers
// given: a Pages location and an ordinary local location
// input: instanceOf(location)
// expect: the Pages address uses MOD-identifiers' owner/name result, and every other host takes the declared upstream fallback
test("instanceOf — Pages identity through MOD-identifiers and the upstream fallback", () => {
  assert.equal(instanceOf({ hostname: "alice.github.io", pathname: "/my-agent/" }), "alice/my-agent");
  assert.equal(instanceOf({ hostname: "127.0.0.1", pathname: "/bridge.html" }), "akmaier/agent-m");
});

// guards: UC-044; ONE CLICK PER DECISION; MOD-site-frame
// given: the started Bridge frame and a supplied notice, then a decision with a title, two lines and a reason field
// input: notice followed by confirmDecision, first cancelled and then confirmed with the person's reason
// expect: the notice preserves its text and link; cancellation remains cancelled, and confirmation returns only confirmed
//         plus the typed reason.
test("notice and confirmDecision — supplied notice text/link and the person's cancellation or reasoned confirmation", async () => {
  const priorLocation = globalThis.location;
  const priorStorage = globalThis.localStorage;
  Object.defineProperty(globalThis, "location", { configurable: true, value: { hostname: "alice.github.io", pathname: "/agent-m/", hash: "" } });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: bridgeStorage() });
  document.body.replaceChildren();
  try {
    await startPage({ page: "bridge", views: [], menuViews: [] });
    notice("info", { text: "Pair this Bridge with its dashboard.", link: { label: "Learn about pairing", href: "#pairing" } });
    const link = byTag(document.body, "a")[0];
    assert.equal(link.textContent, "Learn about pairing");
    assert.equal(link.getAttribute("href"), "#pairing");
    assert.match(document.body.textContent, /Pair this Bridge with its dashboard\./);

    const cancelled = confirmDecision({ title: "Replace the pairing", lines: ["The old token stops working.", "The new token is shown once."],
      confirm: "Replace", reason: true });
    const firstButtons = byTag(document.body, "button");
    assert.ok(document.body.textContent.includes("Replace the pairing"), "the title is shown");
    assert.ok(document.body.textContent.includes("The old token stops working."), "the supplied lines are shown");
    firstButtons.find((button) => button.textContent === "Cancel").dispatchEvent(new Event("click"));
    assert.deepEqual(await cancelled, { confirmed: false, reason: null });

    const confirmed = confirmDecision({ title: "Replace the pairing", lines: ["The old token stops working."], confirm: "Replace", reason: true });
    const field = byTag(document.body, "textarea").at(-1);
    field.value = "Rotating a misplaced token";
    const buttons = byTag(document.body, "button");
    buttons.find((button) => button.textContent === "Replace").dispatchEvent(new Event("click"));
    assert.deepEqual(await confirmed, { confirmed: true, reason: "Rotating a misplaced token" });
  } finally {
    document.body.replaceChildren();
    Object.defineProperty(globalThis, "location", { configurable: true, value: priorLocation });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: priorStorage });
  }
});

// guards: UC-044; EVERY STEP EXPLAINS ITSELF; MOD-site-frame
// given: the pairing explanation the Bridge shell names
// input: explain("bridge-pairing")
// expect: the shared renderer supplies the folded explanation and it tells the person that the displayed token pairs this
//         dashboard with this local Bridge.
test("explain — bridge-pairing gives the Bridge shell its shared folded pairing explanation", () => {
  assert.ok(topicText("bridge-pairing")?.trim(), "known positive: explanations.md holds bridge-pairing");
  const pairing = explain("bridge-pairing");
  assert.equal(pairing.localName, "details");
  assert.match(pairing.textContent, /pairs this dashboard with this Bridge/);
});
