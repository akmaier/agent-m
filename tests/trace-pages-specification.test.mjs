// MOD-trace-pages' public specification route — the SPEC overview of ITM-277 and the version choice above it (ITM-594).
//
// Run: node --test tests/trace-pages-specification.test.mjs
//
// Module: MOD-trace-pages
// Guards: UC-020; A REQUIREMENT HAS FOUR FIELDS; THE BROWSER SHOWS ANY RELEASED VERSION
// Level: unit
//
// This test calls the public trace/specification Route.render with a Host/Snapshot-shaped fake. The fixture has two
// sections and a requirement before every section. The fake has no write method, so rendering has no write path.
// Readings the version-choice cases take: the ref the caller hands is "current" when the Host names it the default branch, else it is
// offered under its own name; the tags are those listTags gives, newest first by their vYYYY.MINOR.PATCH numbers, a tag of another form
// after them; a Host whose listTags fails offers no tag; any ref that is not the default branch is read-only and the view says "as of" it.

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

// tags: what listTags names; specs: the SPEC at a ref, where it differs; defaultBranch: what repositoryInfo names (null: no repositoryInfo);
// gates: a promise a ref's snapshot waits for; unreadable: refs whose snapshot cannot be read; tagsFail: listTags fails.
function host(text = SPEC, { tags = [], specs = {}, defaultBranch = null, gates = {}, unreadable = [], tagsFail = false } = {}) {
  const calls = [];
  const fake = {
    calls,
    async readSnapshot(ref) {
      calls.push(ref);
      await gates[ref];
      if (unreadable.includes(ref)) throw Object.assign(new Error("unreachable"), { name: "Unreachable" });
      const at = specs[ref] ?? text;
      return { ref, commit: ref, paths: at === null ? [] : ["SPEC.md"], read: async (path) => path === "SPEC.md" ? at : null, blob: () => null };
    },
    async listTags() { if (tagsFail) throw new Error("tags unavailable"); return tags.map((name) => ({ name, commit: `commit-of-${name}` })); },
  };
  if (defaultBranch !== null) fake.repositoryInfo = async () => ({ defaultBranch, visibility: "public", canWrite: false, archived: false, description: "" });
  return fake;
}
function find(root, match) { const found = []; (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { if (match(kid)) found.push(kid); walk(kid); } } })(root); return found; }
// Polls until `done()` holds, at most `ms` by the clock.
async function until(done, ms = 2000) { const end = Date.now() + ms; while (!done() && Date.now() < end) await new Promise((resolve) => setTimeout(resolve, 1)); }
function render(productHost, params = { key: "specification", ref: "pinned-commit" }) { const target = document.createElement("div"); document.body.append(target); return route.render(target, { product: { host: productHost } }, params).then(() => target); }

// CASE ITM-277-01
// TST-473163 · level: unit · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// given: a public trace Route and a Host whose pinned snapshot has one unsectioned requirement and two sections
// input: Route.render(target, { product: { host } }, { key: "specification", ref: "pinned-commit" })
// expect: the Host receives exactly that ref; current requirement names appear once, before/within their sections in SPEC order
test("the public trace/specification route reads the pinned SPEC and lists each requirement in file order", async () => {
  assert.ok(route, "the public trace route is exposed");
  const productHost = host();
  const target = await render(productHost);
  assert.deepEqual(productHost.calls, ["pinned-commit"]);
  const names = find(target, (node) => node.localName === "button" && node.className.includes("requirement-name"));
  assert.deepEqual(names.map((node) => node.textContent), ["OUTSIDE REQUIREMENT", "FIRST REQUIREMENT", "SECOND REQUIREMENT"]);
  assert.equal(new Set(names.map((node) => node.textContent)).size, 3);
  const visible = target.textContent;
  assert.ok(visible.indexOf("OUTSIDE REQUIREMENT") < visible.indexOf("First section"));
  assert.ok(visible.indexOf("First section") < visible.indexOf("FIRST REQUIREMENT"));
  assert.ok(visible.indexOf("FIRST REQUIREMENT") < visible.indexOf("Second section"));
  assert.deepEqual(find(target, (node) => node.localName === "h3").map((node) => node.textContent), ["First section", "Second section"]);
});

// CASE ITM-277-02
// TST-473164 · level: unit · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
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

// CASE ITM-278-01
// TST-473165 · level: unit · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// given: the public trace/specification route with two sectioned requirements and one outside a section
// input: a fresh render, then each readable section-heading control is clicked to open, close and reopen its own list
// expect: section lists start hidden, each toggle changes only its own list, and the outside requirement stays reachable
test("section headings start collapsed and independently toggle their requirement lists", async () => {
  const target = await render(host());
  const sections = find(target, (node) => node.localName === "section" && node.className.includes("spec-section"));
  const toggles = sections.map((section) => find(section, (node) => node.localName === "button" && node.className.includes("spec-section-toggle"))[0]);
  const tables = sections.map((section) => find(section, (node) => node.localName === "table")[0]);
  assert.deepEqual(toggles.map((toggle) => toggle?.textContent), ["First section", "Second section"]);
  assert.ok(tables.every((table) => table.getAttribute("hidden") === "hidden"), "a fresh render hides every section list");
  assert.ok(find(target, (node) => node.localName === "button" && node.textContent === "OUTSIDE REQUIREMENT").length === 1,
    "the requirement outside sections remains reachable");
  toggles[0].dispatchEvent(new Event("click"));
  assert.equal(tables[0].getAttribute("hidden"), null, "the first heading opens its own list");
  assert.equal(tables[1].getAttribute("hidden"), "hidden", "the second list stays collapsed");
  toggles[0].dispatchEvent(new Event("click"));
  assert.equal(tables[0].getAttribute("hidden"), "hidden", "the same heading closes its list");
  toggles[0].dispatchEvent(new Event("click"));
  assert.equal(tables[0].getAttribute("hidden"), null, "the same heading reopens its list");
});

// CASE ITM-278-02
// TST-473166 · level: unit · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// given: a displayed current requirement in a row-local closed detail
// input: click its existing requirement-name button three times
// expect: the first click opens readable four fields, the second closes them, and the third reopens them without changing another section
test("a requirement name toggles its row-local detail closed and open again", async () => {
  const target = await render(host());
  const name = find(target, (node) => node.localName === "button" && node.textContent === "FIRST REQUIREMENT")[0];
  const opened = name.parentNode.parentNode.nextSibling;
  assert.equal(opened.textContent, "", "the row-local detail starts closed");
  name.dispatchEvent(new Event("click"));
  for (const text of ["FIRST REQUIREMENT", "Source", "Source one", "Rule", "First rule.", "Check", "tests/first.test.mjs"]) {
    assert.match(opened.textContent, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "the first click opens the readable fields");
  }
  name.dispatchEvent(new Event("click"));
  assert.equal(opened.textContent, "", "the second click closes that detail");
  name.dispatchEvent(new Event("click"));
  assert.match(opened.textContent, /FIRST REQUIREMENT/, "the third click reopens the same detail");
});

// CASE ITM-277-03
// TST-473167 · level: unit · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// given: a Host whose pinned snapshot has no SPEC.md, no tags, and no default branch it can name
// input: the same public specification route
// expect: the version choice offers only the handed ref (UC-020 1c) and says "as of" it; the page then states that the current requirements are empty; no write operation is called
test("an absent or empty SPEC has an explicit empty state and rendering offers no write", async () => {
  const productHost = host(null);
  const target = await render(productHost, { key: "specification", ref: "pinned-empty" });
  assert.equal(target.textContent, "Version pinned-emptyNo release is tagged yet (UC-013); only the current text can be shown.as of pinned-emptyCurrent requirementsNo current requirements are recorded in SPEC.md.");
  assert.equal(Object.hasOwn(productHost, "commitFiles"), false);
});

// The version choice (ITM-594). The Host names main the default branch; main has the SPEC above, the tag v2026.1.0 an older one.
const OLD_SPEC = `# Fixture — Specification

## Old section

**OLD REQUIREMENT** *(Source old)*
Old rule.
*Check:* \`tests/old.test.mjs\`
`;
const options = (target) => find(target, (node) => node.localName === "option");
const selectOf = (target) => find(target, (node) => node.localName === "select")[0];
const names = (target) => find(target, (node) => node.localName === "button" && node.className.includes("requirement-name")).map((node) => node.textContent);
const choose = (target, ref) => { const select = selectOf(target); select.value = ref; select.dispatchEvent(new Event("change")); };
const editLinks = (target) => find(target, (node) => node.localName === "a" && /requirement-(edit|new)/.test(node.className));
const asOf = (target) => find(target, (node) => node.localName === "p" && node.className === "version-as-of").map((node) => node.textContent);
const tagged = (extra = {}) => host(SPEC, { defaultBranch: "main", tags: ["v2026.1.0"], specs: { "v2026.1.0": OLD_SPEC }, ...extra });
const mainParams = { key: "specification", ref: "main" };
const CURRENT_NAMES = ["OUTSIDE REQUIREMENT", "FIRST REQUIREMENT", "SECOND REQUIREMENT"];

// CASE ITM-594-01
// TST-594000 · level: unit · module: MOD-trace-pages
// guards: UC-020 (steps 1, 1a); THE BROWSER SHOWS ANY RELEASED VERSION
// given: a Host that names main the default branch and gives the tags v2026.1.9, v2026.10.0, nightly, v2026.2.0, v2025.12.3 in that order
// input: the route rendered at main
// expect: the options are, in this order, main (shown as "current"), v2026.10.0, v2026.2.0, v2026.1.9, v2025.12.3, nightly (shown by their names); main is selected; no "as of" line
test("the version choice offers the default branch as current and every tag, newest first by number", async () => {
  const target = await render(host(SPEC, { defaultBranch: "main", tags: ["v2026.1.9", "v2026.10.0", "nightly", "v2026.2.0", "v2025.12.3"] }), mainParams);
  assert.deepEqual(options(target).map((node) => node.value), ["main", "v2026.10.0", "v2026.2.0", "v2026.1.9", "v2025.12.3", "nightly"]);
  assert.deepEqual(options(target).map((node) => node.textContent), ["current", "v2026.10.0", "v2026.2.0", "v2026.1.9", "v2025.12.3", "nightly"]);
  assert.equal(selectOf(target).value, "main");
  assert.deepEqual(asOf(target), []);
});

// CASE ITM-594-02
// TST-594001 · level: unit · module: MOD-trace-pages
// guards: UC-020 (step 1c); THE BROWSER SHOWS ANY RELEASED VERSION
// given: a Host that names main the default branch and gives no tag; and one whose listTags fails
// input: the route rendered at main with each
// expect: for each, the only option is main shown as "current", and a note says that no release is tagged yet and points to UC-013
test("a product without tags is offered only current, with a pointer to UC-013", async () => {
  for (const productHost of [host(SPEC, { defaultBranch: "main" }), host(SPEC, { defaultBranch: "main", tagsFail: true })]) {
    const target = await render(productHost, mainParams);
    assert.deepEqual(options(target).map((node) => [node.value, node.textContent]), [["main", "current"]]);
    assert.deepEqual(find(target, (node) => node.localName === "p" && node.className === "version-none").map((node) => node.textContent),
      ["No release is tagged yet (UC-013); only the current text can be shown."]);
  }
});

// CASE ITM-594-03
// TST-594002 · level: unit · module: MOD-trace-pages
// guards: UC-020 (steps 1, 1a); THE BROWSER SHOWS ANY RELEASED VERSION
// given: main has OUTSIDE, FIRST and SECOND REQUIREMENT and is the default branch; the tag v2026.1.0 has OLD REQUIREMENT only
// input: the route rendered at main, then v2026.1.0 chosen
// expect: at main three Edit links, two + Requirement links and no "as of"; readSnapshot is then asked main, v2026.1.0 and nothing else; the tree lists only OLD REQUIREMENT; v2026.1.0 is selected; the view says "as of v2026.1.0"; no Edit and no + Requirement link
test("choosing a tag draws the SPEC of that tag, read-only and as of it", async () => {
  const productHost = tagged();
  const target = await render(productHost, mainParams);
  assert.deepEqual(names(target), CURRENT_NAMES);
  assert.equal(editLinks(target).filter((node) => node.className.includes("requirement-edit")).length, 3);
  assert.equal(editLinks(target).filter((node) => node.className.includes("requirement-new")).length, 2);
  assert.deepEqual(asOf(target), []);
  choose(target, "v2026.1.0");
  await until(() => names(target)[0] === "OLD REQUIREMENT");
  assert.deepEqual(productHost.calls, ["main", "v2026.1.0"]);
  assert.deepEqual(names(target), ["OLD REQUIREMENT"]);
  assert.equal(selectOf(target).value, "v2026.1.0");
  assert.deepEqual(asOf(target), ["as of v2026.1.0"]);
  assert.deepEqual(editLinks(target), []);
});

// CASE ITM-594-04
// TST-594003 · level: unit · module: MOD-trace-pages
// guards: UC-020 (steps 1, 1a); THE BROWSER SHOWS ANY RELEASED VERSION
// given: the route rendered at main and the tag v2026.1.0 chosen
// input: main chosen again
// expect: readSnapshot is asked main, v2026.1.0, main; the three current requirements are listed with five Edit and + Requirement links; main is selected; no "as of" line
test("choosing current again draws the default branch editable", async () => {
  const productHost = tagged();
  const target = await render(productHost, mainParams);
  choose(target, "v2026.1.0");
  await until(() => names(target)[0] === "OLD REQUIREMENT");
  choose(target, "main");
  await until(() => names(target).length === 3);
  assert.deepEqual(productHost.calls, ["main", "v2026.1.0", "main"]);
  assert.equal(selectOf(target).value, "main");
  assert.equal(editLinks(target).length, 5);
  assert.deepEqual(asOf(target), []);
});

// CASE ITM-594-05
// TST-594004 · level: unit · module: MOD-trace-pages
// guards: UC-020 (step 1a); THE BROWSER SHOWS ANY RELEASED VERSION
// given: the route rendered at main (the params keep ref main), v2026.1.0 chosen, OLD REQUIREMENT opened
// input: route.subject(params, context) with the context the route was drawn with
// expect: kind "converse", no draft route, title "OLD REQUIREMENT at v2026.1.0", a key holding ref=v2026.1.0, and a page text holding "Version: v2026.1.0" and "Old rule."
test("the subject of a chosen tag is about the version shown, not the ref the caller handed", async () => {
  const context = { product: { address: "https://github.com/acme/library", host: tagged() } };
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, context, mainParams);
  choose(target, "v2026.1.0");
  await until(() => names(target)[0] === "OLD REQUIREMENT");
  find(target, (node) => node.localName === "button" && node.textContent === "OLD REQUIREMENT")[0].dispatchEvent(new Event("click"));
  const subject = route.subject(mainParams, context);
  assert.equal(subject.kind, "converse");
  assert.equal(subject.draftRoute, null);
  assert.equal(subject.title, "OLD REQUIREMENT at v2026.1.0");
  assert.ok(subject.key.includes("ref=v2026.1.0"), subject.key);
  const page = subject.paramsFor({}).page;
  assert.ok(page.includes("Version: v2026.1.0") && page.includes("Old rule."), page);
});

// CASE ITM-594-06
// TST-594005 · level: unit · module: MOD-trace-pages
// guards: UC-020 (step 1a); THE BROWSER SHOWS ANY RELEASED VERSION
// given: a Host that gives the tags v2026.1.0 and v2026.0.1 and cannot read the snapshot of v2026.0.1
// input: the route rendered at main, v2026.0.1 chosen, then v2026.1.0
// expect: after the first choice the page says "v2026.0.1 could not be read: unreachable", lists no requirement and keeps the choice with v2026.0.1 selected; after the second it lists OLD REQUIREMENT and no problem line
test("a chosen tag that cannot be read is named in place of the tree and the choice stays", async () => {
  const problems = (target) => find(target, (node) => node.localName === "p" && node.className === "version-problem").map((node) => node.textContent);
  const target = await render(tagged({ tags: ["v2026.1.0", "v2026.0.1"], unreadable: ["v2026.0.1"] }), mainParams);
  choose(target, "v2026.0.1");
  await until(() => problems(target).length === 1);
  assert.deepEqual(problems(target), ["v2026.0.1 could not be read: unreachable"]);
  assert.deepEqual(names(target), []);
  assert.equal(selectOf(target).value, "v2026.0.1");
  choose(target, "v2026.1.0");
  await until(() => names(target)[0] === "OLD REQUIREMENT");
  assert.deepEqual(problems(target), []);
});

// CASE ITM-594-07
// TST-594006 · level: unit · module: MOD-trace-pages
// guards: UC-020 (step 1); THE BROWSER SHOWS ANY RELEASED VERSION
// given: a Host whose snapshot of v2026.1.0 waits for a gate that opens later
// input: v2026.1.0 chosen, then main chosen before the gate opens; then the gate opens and 50 ms of the clock pass
// expect: the page shows main's three requirements with main selected and no "as of" line; the slower, earlier choice does not replace it
test("of two choices made in a row, the later one stays when the earlier answers last", async () => {
  let open;
  const gate = new Promise((resolve) => { open = resolve; });
  const productHost = tagged({ gates: { "v2026.1.0": gate } });
  const target = await render(productHost, mainParams);
  choose(target, "v2026.1.0");
  await until(() => productHost.calls.length === 2);
  choose(target, "main");
  await until(() => names(target).length === 3);
  open();
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.deepEqual(names(target), CURRENT_NAMES);
  assert.equal(selectOf(target).value, "main");
  assert.deepEqual(asOf(target), []);
});
