// MOD-trace-pages' public specification route — the current, pinned SPEC overview of ITM-277.
//
// Run: node --test tests/trace-pages-specification.test.mjs
//
// Module: MOD-trace-pages
// Guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// Level: unit
//
// This test calls the public trace/specification Route.render with a Host/Snapshot-shaped fake.  The fixture has two
// sections and a requirement before every section. The fake has no write method: rendering has no write path.

import test from "node:test";
import assert from "node:assert/strict";

// A small browser DOM, adapted from the working MOD-test-pages route test.  renderArtifact needs the DOMPurify surface
// of a browser; this harness provides it without a browser or a request.
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const ENTITY = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => (e[0] !== "#" ? ENTITY[e.toLowerCase()] ?? m
  : String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1)))));
const escapeText = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

class Node extends EventTarget {
  constructor(doc, type, name) { super(); Object.assign(this, { _doc: doc, _type: type, _name: name, _parent: null, _kids: [] }); }
  get nodeType() { return this._type; }
  get nodeName() { return this._name; }
  get ownerDocument() { return this._type === 9 ? null : this._doc; }
  get parentNode() { return this._parent; }
  get childNodes() { return this._kids; }
  get firstChild() { return this._kids[0] ?? null; }
  get nextSibling() { const kids = this._parent?._kids; return kids ? kids[kids.indexOf(this) + 1] ?? null : null; }
  get textContent() { return this._type === 3 ? this.data : this._kids.map((kid) => kid.textContent).join(""); }
  set textContent(value) { if (this._type === 3) this.data = String(value); else this.replaceChildren(String(value)); }
  get innerHTML() { return this._kids.map(serialise).join(""); }
  set innerHTML(value) { this.replaceChildren(); parse(this._doc, String(value), this); }
  get isConnected() { let node = this; while (node._parent) node = node._parent; return node === this._doc; }
  appendChild(node) { return this.insertBefore(node, null); }
  insertBefore(node, before) {
    if (node._type === 11) { for (const kid of [...node._kids]) this.insertBefore(kid, before); return node; }
    node._parent?.removeChild(node);
    const at = before ? this._kids.indexOf(before) : -1;
    this._kids.splice(at < 0 ? this._kids.length : at, 0, node); node._parent = this;
    return node;
  }
  removeChild(node) { this._kids.splice(this._kids.indexOf(node), 1); node._parent = null; return node; }
  append(...nodes) { for (const node of nodes) this.appendChild(typeof node === "string" ? this._doc.createTextNode(node) : node); }
  replaceChildren(...nodes) { for (const node of [...this._kids]) this.removeChild(node); this.append(...nodes); }
  cloneNode(deep = false) {
    const copy = this._type === 1 ? this._doc.createElement(this.localName) : this._type === 3 ? this._doc.createTextNode(this.data) : this._doc.createDocumentFragment();
    for (const attr of this._attrs ?? []) copy.setAttribute(attr.name, attr.value);
    if (deep) for (const kid of this._kids) copy.appendChild(kid.cloneNode(true));
    return copy;
  }
  getElementsByTagName(name) { const found = []; (function walk(node) { for (const kid of node._kids) { if (kid._type === 1 && kid.localName === name) found.push(kid); walk(kid); } })(this); return found; }
}
class Text extends Node { constructor(doc, text) { super(doc, 3, "#text"); this.data = text; } }
class Fragment extends Node { constructor(doc) { super(doc, 11, "#document-fragment"); } }
class Element extends Node {
  constructor(doc, name) { super(doc, 1, name.toUpperCase()); this.localName = name; this._attrs = []; }
  get tagName() { return this._name; }
  get namespaceURI() { return "http://www.w3.org/1999/xhtml"; }
  get attributes() { return this._attrs; }
  get className() { return this.getAttribute("class") ?? ""; }
  set className(value) { this.setAttribute("class", value); }
  getAttributeNode(name) { return this._attrs.find((attr) => attr.name === name.toLowerCase()) ?? null; }
  getAttribute(name) { return this.getAttributeNode(name)?.value ?? null; }
  hasAttribute(name) { return this.getAttributeNode(name) !== null; }
  setAttribute(name, value) { const old = this.getAttributeNode(name), lower = name.toLowerCase(); if (old) old.value = String(value); else this._attrs.push({ name: lower, value: String(value), localName: lower, namespaceURI: null }); }
  removeAttribute(name) { const old = this.getAttributeNode(name); if (old) this._attrs.splice(this._attrs.indexOf(old), 1); }
}
class Document extends Node {
  constructor() { super(null, 9, "#document"); this._doc = this; this.implementation = { createHTMLDocument: htmlDocument }; }
  get children() { return this._kids.filter((kid) => kid._type === 1); }
  get body() { return this.getElementsByTagName("body")[0] ?? null; }
  createElement(name) { return new Element(this, String(name).toLowerCase()); }
  createTextNode(text) { return new Text(this, String(text)); }
  createDocumentFragment() { return new Fragment(this); }
  importNode(node, deep) { return node.cloneNode(deep); }
}
function htmlDocument() { const doc = new Document(), html = doc.createElement("html"); doc.append(html); html.append(doc.createElement("head"), doc.createElement("body")); return doc; }
class DOMParser { parseFromString(html) { const doc = htmlDocument(); parse(doc, String(html), doc.body); return doc; } }
const TAG = /^<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/;
const ATTRIBUTE = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
function parse(doc, html, into) {
  const open = [into];
  for (let i = 0; i < html.length;) {
    const tag = TAG.exec(html.slice(i));
    if (!tag) { const next = html.indexOf("<", i + 1), end = next < 0 ? html.length : next; open.at(-1).append(doc.createTextNode(decode(html.slice(i, end)))); i = end; continue; }
    i += tag[0].length;
    const name = tag[2].toLowerCase();
    if (tag[1]) { const at = open.findLastIndex((node, index) => index > 0 && node.localName === name); if (at > 0) open.length = at; continue; }
    const node = doc.createElement(name);
    for (const attr of tag[3].matchAll(ATTRIBUTE)) if (!node.hasAttribute(attr[1])) node.setAttribute(attr[1], decode(attr[2] ?? attr[3] ?? attr[4] ?? ""));
    open.at(-1).append(node); if (!VOID.has(name)) open.push(node);
  }
}
function serialise(node) { if (node._type === 3) return escapeText(node.data); if (node._type !== 1) return node.innerHTML; const start = `<${node.localName}${node._attrs.map((attr) => ` ${attr.name}="${attr.value}"`).join("")}>`; return VOID.has(node.localName) ? start : `${start}${node.innerHTML}</${node.localName}>`; }

const document = htmlDocument();
globalThis.document = document;
globalThis.window = { document, Node, Element, Text, DocumentFragment: Fragment, DOMParser, NodeFilter: { SHOW_ELEMENT: 1, SHOW_TEXT: 4 } };

const { view } = await import("../src/trace-pages/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "trace");

const SPEC = `# Fixture — Specification

**OUTSIDE REQUIREMENT** *(Source outside)*
Outside rule.
*Check:* at review.

## First section

**FIRST REQUIREMENT** *(Source one)*
First rule.
*Check:* \`tests/first.test.mjs\`

## Second section

**SECOND REQUIREMENT** *(Source two)*
Second <img src=x onerror=alert(1)> rule.
*Check:* \`tests/second.test.mjs\`
`;

function host(text = SPEC) {
  const calls = [];
  return { calls, async readSnapshot(ref) { calls.push(ref); return { ref, commit: ref, paths: text === null ? [] : ["SPEC.md"], read: async (path) => path === "SPEC.md" ? text : null, blob: () => null }; } };
}
function find(root, match) { const found = []; (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { if (match(kid)) found.push(kid); walk(kid); } } })(root); return found; }
function render(productHost, params = { key: "specification", ref: "pinned-commit" }) { const target = document.createElement("div"); document.body.append(target); return route.render(target, { product: { host: productHost } }, params).then(() => target); }

// CASE ITM-277-01
// given: a public trace Route and a Host whose pinned snapshot has one unsectioned requirement and two sections
// input: Route.render(target, { product: { host } }, { key: "specification", ref: "pinned-commit" })
// expect: the Host receives exactly that ref; current requirement names appear once, before/within their sections in SPEC order
test("the public trace/specification route reads the pinned SPEC and lists each requirement in file order", async () => {
  assert.ok(route, "the public trace route is exposed");
  const productHost = host();
  const target = await render(productHost);
  assert.deepEqual(productHost.calls, ["pinned-commit"]);
  const names = find(target, (node) => node.localName === "button");
  assert.deepEqual(names.map((node) => node.textContent), ["OUTSIDE REQUIREMENT", "FIRST REQUIREMENT", "SECOND REQUIREMENT"]);
  assert.equal(new Set(names.map((node) => node.textContent)).size, 3);
  const visible = target.textContent;
  assert.ok(visible.indexOf("OUTSIDE REQUIREMENT") < visible.indexOf("First section"));
  assert.ok(visible.indexOf("First section") < visible.indexOf("FIRST REQUIREMENT"));
  assert.ok(visible.indexOf("FIRST REQUIREMENT") < visible.indexOf("Second section"));
  assert.deepEqual(find(target, (node) => node.localName === "h3").map((node) => node.textContent), ["First section", "Second section"]);
});

// CASE ITM-277-02
// given: the rendered overview and an unsafe HTML image in SECOND REQUIREMENT's rule (known positive: SPEC contains both `<img` and `onerror`)
// input: a click on SECOND REQUIREMENT's displayed name
// expect: its name, source, rule and check are readable in the detail, no image node is created, and no route/navigation context is needed
test("selecting a requirement renders its four fields safely without navigating to a queue", async () => {
  assert.match(SPEC, /<img[^>]+onerror=/, "known positive: the fixture has unsafe HTML");
  const target = await render(host());
  const name = find(target, (node) => node.localName === "button" && node.textContent === "SECOND REQUIREMENT")[0];
  name.dispatchEvent(new Event("click"));
  const opened = name.parentNode.parentNode.nextSibling;
  for (const text of ["SECOND REQUIREMENT", "Source", "Source two", "Rule", "Second <img src=x onerror=alert(1)> rule.", "Check", "tests/second.test.mjs"]) {
    assert.match(opened.textContent, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.equal(find(opened, (node) => node.localName === "img").length, 0);
  assert.equal(find(opened, (node) => node.localName === "a" && node.getAttribute("href")?.includes("queue")).length, 0);
});

// CASE ITM-277-03
// given: a Host whose pinned snapshot has no SPEC.md
// input: the same public specification route
// expect: it states that the current requirements are empty and calls no write operation
test("an absent or empty SPEC has an explicit empty state and rendering offers no write", async () => {
  const productHost = host(null);
  const target = await render(productHost, { key: "specification", ref: "pinned-empty" });
  assert.equal(target.textContent, "Current requirementsNo current requirements are recorded in SPEC.md.");
  assert.equal(Object.hasOwn(productHost, "commitFiles"), false);
});
