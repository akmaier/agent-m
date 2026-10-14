// MOD-review-pages' routes for use cases (ITM-355), as the accepted text of docs/architecture/MOD-review-pages.md states them:
// the view `view` with the route `use-case` — "the files of the kind with their status — open, accepted, changed since
// acceptance —, each with a tick", and, for one file, "the file rendered, with its diagram; changed since acceptance, its
// difference to the text the most recent approval record of its identifier names; Accept … Without a token for GitHub, Accept
// opens GitHub's prefilled page, the text never in the address; for a GitLab product without a token, neither is offered, and the
// token's step is linked" — and the item's Outcome: Accept names the blob of the text shown, with a token one commit with one
// record per ticked file; without write access the GitHub path; a private repository without a token that reaches it named, and
// nothing shown. For UC-008 steps 1 to 5 and the alternative flows 1a, 2a, 3b, 3c, 3d, 4a, 5a.
// Run: node --test tests/review-pages-use-cases.test.mjs
//
// Module: MOD-review-pages
// Guards: UC-008; STATUS IS DERIVED FROM THE RECORDS; AN APPROVAL NAMES THE EXACT TEXT; ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL; A GITLAB PRODUCT IS WRITTEN WITH A TOKEN; SEVERAL FILES ARE ACCEPTED IN ONE CLICK; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; EVERY STEP EXPLAINS ITSELF
// Level: unit
//
// The module runs in a browser, and node has no DOM: this file brings the one of tests/markdown-render.test.mjs,
// with which the renderer runs as it is. The repository is a fixture behind a Host of the tests' own, which keeps to
// MOD-repository-hosts' interface as docs/architecture/MOD-repository-hosts.md states it — one repository in memory with a
// history of commits, whose default branch is `main`; repositoryInfo, readSnapshot at the branch or at a commit, readHistory of a
// path and commitFiles, a commit of all its files made only if the branch still stands at the expected head, else `Moved { head }`
// —; every call recorded. The store is MOD-browser-store's, over a localStorage of the file's own. The routes' views of the
// product are read through the real MOD-approvals and MOD-documents. Nothing reaches the network. A click is answered by a
// handler that waits for the host; the tests wait for the turns of the event loop in which it answers, nothing else. Each test
// states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull
// request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

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

// A localStorage of the file's own, for MOD-browser-store.
let kept = new Map();
globalThis.localStorage = { getItem: (k) => (kept.has(k) ? kept.get(k) : null), setItem: (k, v) => { kept.set(k, String(v)); },
  removeItem: (k) => { kept.delete(k); }, key: (i) => [...kept.keys()][i] ?? null, get length() { return kept.size; } };

const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");
const pages = await import("../src/review-pages/index.mjs").catch((error) => ({ error }));
const route = pages.view?.routes.find((candidate) => candidate.name === "use-case");

// ---------------------------------------------------------------- the product

const text = (...lines) => `${lines.join("\n")}\n`;
// The blob SHA git gives a text, as a snapshot's blob() gives it from the tree.
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const failure = (name, message, fields = {}) => Object.assign(new Error(message), { name }, fields);

const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool", web: "https://github.com/alice/thesis-tool" };
const ON_GITLAB = { server: "gitlab", origin: "https://gitlab.example.org", path: "team/product", web: "https://gitlab.example.org/team/product" };
const TOKEN = { value: "github_pat_ALICEthesisTOOL0123456789abcdef", name: "Agent M · thesis-tool", expires: "2027-01-01" };

const SPEC = text("# Thesis tool — Specification", "", "## Lending", "", "**A LOAN HAS A DUE DATE** *(Product Owner)*",
  "Every loan states the date by which the book is returned.", "*Check:* `tests/loan.test.mjs`");
const useCase = (id, title, sentence, extra = []) => text("---", `id: ${id}`, `title: ${title}`, "area: lending", "actors:", "  - Member",
  "realises:", "  - A LOAN HAS A DUE DATE", "---", `# ${id} ${title}`, "", `**Goal.** ${sentence}`, ...extra);
const DIAGRAM = ["", "```mermaid", "sequenceDiagram", "    Member->>Desk: borrow", "```"];
const P41 = "docs/use-cases/UC-041-check-out-a-book.md", P42 = "docs/use-cases/UC-042-extend-a-loan.md";
const P43 = "docs/use-cases/UC-043-return-a-book.md", P44 = "docs/use-cases/UC-044-reserve-a-book.md";
const UC41 = useCase("UC-041", "Check out a book", "The member borrows a book at the desk.", DIAGRAM);
const UC42 = useCase("UC-042", "Extend a loan", "The member extends a loan once.");
const UC43_OLD = useCase("UC-043", "Return a book", "The member returns a book at the desk.");
const UC43 = useCase("UC-043", "Return a book", "The member returns a book and the card at the desk.");
const UC44 = useCase("UC-044", "Reserve a book", "The member reserves a book that is out.");
const UC44_EDITED = useCase("UC-044", "Reserve a book", "The member reserves a book that is out, for a week.");

const recordOf = (id, path, body) => [`docs/approvals/${id}-${blobOf(body).slice(0, 12)}.md`,
  text("kind: use-case", `file: ${path}`, `blob: ${blobOf(body)}`)];
// The history: the use cases and the SPEC; then the records of UC-042 (its current text) and of UC-043 (its earlier text); then
// UC-043 edited. So UC-041 and UC-044 are open, UC-042 accepted, UC-043 changed since acceptance.
const STEPS = [
  { "README.md": "# Thesis tool\n", "SPEC.md": SPEC, [P41]: UC41, [P42]: UC42, [P43]: UC43_OLD, [P44]: UC44 },
  Object.fromEntries([recordOf("UC-042", P42, UC42), recordOf("UC-043", P43, UC43_OLD)]),
  { [P43]: UC43 },
];

// ---------------------------------------------------------------- the fake host

// A host over a repository in memory with its history; `main` is its default branch. refuse: a failure commitFiles answers with
// instead of writing. unreadable: a failure every read answers with, as a private repository answers a client without a token.
function fakeHost({ steps = STEPS, repository = ON_GITHUB, refuse = null, unreadable = null } = {}) {
  const calls = [], commits = new Map();
  let made = 0, head = null;
  const commitOf = (tree, parent, files = []) => {
    const sha = createHash("sha1").update(`commit ${++made}`).digest("hex");
    commits.set(sha, { tree, parent, date: `2026-10-0${made}T10:00:00Z` });
    return sha;
  };
  for (const files of steps) head = commitOf(new Map([...(head ? commits.get(head).tree : []), ...Object.entries(files)]), head);
  const snapshotAt = (sha) => {
    const { tree } = commits.get(sha);
    return { repository, ref: sha, commit: sha, paths: [...tree.keys()].sort(), read: async (path) => (tree.has(path) ? tree.get(path) : null),
      blob: (path) => (tree.has(path) ? blobOf(tree.get(path)) : null) };
  };
  const fake = {
    head: () => head,
    files: () => Object.fromEntries(commits.get(head).tree),
    writes: () => calls.filter((call) => call.fn === "commitFiles"),
    // Another writer's commit on `main`: each path of `changed` set to its text.
    land(changed) { head = commitOf(new Map([...commits.get(head).tree, ...Object.entries(changed)]), head); },
    host: {
      async repositoryInfo() {
        calls.push({ fn: "repositoryInfo" });
        if (unreadable) throw unreadable;
        return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" };
      },
      async readSnapshot(ref) {
        calls.push({ fn: "readSnapshot", ref });
        if (unreadable) throw unreadable;
        if (ref === "main") return { ...snapshotAt(head), ref };
        if (commits.has(ref)) return snapshotAt(ref);
        throw failure("NotFound", `${ref} was not found`, { what: ref });
      },
      // The commits that changed a path, newest first, from `ref` (the branch or a commit).
      async readHistory(path, { ref = "main", limit } = {}) {
        calls.push({ fn: "readHistory", path });
        const found = [];
        for (let sha = ref === "main" ? head : ref; sha; sha = commits.get(sha).parent) {
          const here = commits.get(sha), before = here.parent ? commits.get(here.parent).tree.get(path) : undefined;
          if (here.tree.get(path) !== before) found.push({ commit: sha, parents: here.parent ? [here.parent] : [], date: here.date, message: "", author: { account: null, name: "x" }, changes: [] });
        }
        return limit ? found.slice(0, limit) : found;
      },
      async commitFiles(change) {
        calls.push({ fn: "commitFiles", change: structuredClone(change) });
        if (refuse) throw refuse;
        if (change.branch !== "main" || change.expectedHead !== head) throw failure("Moved", "the branch moved", { head });
        head = commitOf(new Map([...commits.get(head).tree, ...change.files.map((f) => [f.path, f.text])]), head);
        return { commit: head, url: `${repository.web}/commit/${head}` };
      },
    },
  };
  return fake;
}

// ---------------------------------------------------------------- the page

// What the frame hands a route: the product (or the instance), the store with the token this browser keeps, go.
function contextOf(fake, { token = true, gitlab = false, instanceToken = false } = {}) {
  kept = new Map();
  const store = openStore("alice/agent-m");
  const address = gitlab ? ON_GITLAB.web : ON_GITHUB.web;
  if (token) writeSetting(store, gitlab ? "gitlab-token:gitlab.example.org/team/product" : "github-token:alice/thesis-tool", TOKEN);
  if (instanceToken) writeSetting(store, "github-token", TOKEN);
  return { page: "review", instance: { repository: "alice/agent-m", host: fake.host }, store, go() {},
    product: { address, kind: gitlab ? "gitlab" : "github", host: fake.host } };
}
async function show(fake, params = {}, options = {}) {
  const target = document.createElement("div");
  document.body.append(target);
  const context = contextOf(fake, options);
  await route.render(target, context, params);
  return { target, context };
}
function find(root, match) {
  const found = [];
  (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { if (match(kid)) found.push(kid); walk(kid); } } })(root);
  return found;
}
const byClass = (root, name, className) => find(root, (node) => node.localName === name && node.className.split(" ").includes(className));
const click = (node) => node.dispatchEvent(new Event("click"));
const tick = (box, on = true) => { box.checked = on; box.dispatchEvent(new Event("change")); };
// Waits for the turns of the event loop in which a handler answers.
async function until(condition, what) {
  for (let turn = 0; turn < 400; turn++) {
    if (condition()) return;
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.fail(`waited for ${what}`);
}
const rowOf = (target, id) => find(target, (node) => node.localName === "tr" && node.getAttribute("data-id") === id)[0];
const badgeOf = (row) => byClass(row, "span", "badge")[0]?.textContent;
const recordTextOf = (id, path, body) => recordOf(id, path, body)[1];
const areaOf = (target) => find(target, (node) => node.localName === "textarea")[0];
const saveButton = (target) => find(target, (node) => node.localName === "button" && node.textContent === "Save")[0];
const type = (target, text) => {
  const area = areaOf(target);
  area.value = text;
  area.dispatchEvent(new Event("input"));
};

// ---------------------------------------------------------------- the list

// TST-472678 · level: unit · module: MOD-review-pages
// guards: STATUS IS DERIVED FROM THE RECORDS; SEVERAL FILES ARE ACCEPTED IN ONE CLICK; EVERY STEP EXPLAINS ITSELF
// given: a product whose `main` holds four use cases — UC-041 and UC-044 with no record, UC-042 with a record naming its current text, UC-043 with a record naming an earlier text —, and a token stored in this browser
// input: the route `use-case` rendered with no id; and again for the instance itself, no product chosen
// expect: a row for each use case with its id as a link to its page, its title and its status — open, accepted, changed since acceptance —; a tick on each use case that is not accepted, none on UC-042; the folded "What is this?"; for the instance the same rows; nothing written
test("MOD-review-pages use-case — the list: every use case with its status and a tick", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const fake = fakeHost();
  const { target, context } = await show(fake);
  const rows = find(target, (node) => node.localName === "tr" && node.getAttribute("data-id")).map((row) => row.getAttribute("data-id"));
  assert.deepEqual(rows, ["UC-041", "UC-042", "UC-043", "UC-044"], "a row for each use case");
  assert.deepEqual(["UC-041", "UC-042", "UC-043", "UC-044"].map((id) => badgeOf(rowOf(target, id))),
    ["open", "accepted", "changed since acceptance", "open"]);
  assert.match(rowOf(target, "UC-043").textContent, /Return a book/, "its title");
  assert.equal(find(rowOf(target, "UC-043"), (node) => node.localName === "a")[0].getAttribute("href"), "#use-case/id=UC-043", "a link to its page");
  assert.deepEqual(["UC-041", "UC-042", "UC-043", "UC-044"].filter((id) => byClass(rowOf(target, id), "input", "tick").length),
    ["UC-041", "UC-043", "UC-044"], "a tick on each use case that is not accepted");
  assert.ok(byClass(target, "details", "explain").length >= 1, "a folded What is this?");
  assert.equal(fake.writes().length, 0, "nothing written");

  const instance = document.createElement("div");
  await route.render(instance, { ...context, product: null }, {});
  assert.deepEqual(find(instance, (node) => node.localName === "tr" && node.getAttribute("data-id")).map((row) => row.getAttribute("data-id")),
    rows, "the instance itself: the same rows");
});

// ---------------------------------------------------------------- one use case

// TST-472679 · level: unit · module: MOD-review-pages
// guards: UC-008; THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW; AN APPROVAL NAMES THE EXACT TEXT; EVERY STEP EXPLAINS ITSELF
// given: the product above, UC-041 open, its text holding a Mermaid diagram, and a token stored
// input: the route `use-case` rendered with the id UC-041
// expect: its identifier, title and status open; its prose rendered, and its diagram handed to the renderer; the first twelve digits of the blob of the text shown; one Accept button, pressable; no difference to a last accepted text; the folded "What is this?"; nothing written
test("MOD-review-pages use-case/<id> — one use case with its text, its diagram and Accept", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const fake = fakeHost();
  const { target } = await show(fake, { id: "UC-041" });
  assert.match(find(target, (node) => node.localName === "h2")[0].textContent, /^UC-041 Check out a book/, "identifier and title");
  assert.equal(badgeOf(target), "open", "its status");
  assert.match(target.textContent, /The member borrows a book at the desk\./, "its prose");
  // MOD-markdown-render draws a diagram, or, in a page that cannot draw it, shows its source with the reason — the prose stays.
  const unrendered = byClass(target, "div", "unrendered");
  assert.equal(unrendered.length, 1, "its diagram is handed to the renderer");
  assert.match(unrendered[0].textContent, /This diagram is not drawn[^]*sequenceDiagram/, "the diagram's source with the reason");
  assert.ok(target.textContent.includes(blobOf(UC41).slice(0, 12)), "the blob of the text shown");
  const accept = byClass(target, "button", "accept");
  assert.equal(accept.length, 1, "one Accept");
  assert.equal(accept[0].textContent, "Accept");
  assert.notEqual(accept[0].disabled, true, "pressable");
  assert.equal(byClass(target, "section", "accepted-diff").length, 0, "no difference: the use case was never accepted");
  assert.ok(byClass(target, "details", "explain").length >= 1, "a folded What is this?");
  assert.equal(fake.writes().length, 0, "nothing written");
});

// ---------------------------------------------------------------- editing a use case

// TST-358001 · level: unit · module: MOD-review-pages
// guards: UC-018; EDITS ARE PREPARED ON THE DASHBOARD; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; ONE CLICK PER DECISION
// given: UC-041 open on the review page, with a token stored
// input: follow Edit to use-case/id=UC-041/edit=1, change its text, and click Save
// expect: the editor opens on the use-case text with schema marks beside it; Save writes exactly the use-case file, on the head and blob the editor opened, with no approval record; the saved link names the commit
test("MOD-review-pages use-case/<id>/edit — Save commits the edited use case as an open reviewed file", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const fake = fakeHost();
  const one = (await show(fake, { id: "UC-041" })).target;
  const edit = byClass(one, "a", "edit-link")[0];
  assert.equal(edit.getAttribute("href"), "#use-case/id=UC-041/edit=1", "one Edit link to the edit route");

  const read = fake.head();
  const { target } = await show(fake, { id: "UC-041", edit: "1" });
  assert.equal(areaOf(target).value, UC41, "the editor holds the use case byte for byte");
  assert.ok(byClass(target, "ol", "marks")[0].textContent.includes("A USE CASE HAS ACTOR"), "schema marks are shown");
  assert.equal(saveButton(target).disabled, false, "Save is offered while marks remain");
  const edited = UC41.replace("borrows a book at the desk.", "borrows a book at the desk, with a receipt.");
  type(target, edited);
  click(saveButton(target));
  await until(() => fake.writes().length === 1, "the edit commit");
  const [{ change }] = fake.writes();
  assert.equal(change.branch, "main");
  assert.equal(change.expectedHead, read, "on the head the editor opened");
  assert.deepEqual(change.files, [{ path: P41, text: edited }], "only the use case is written");
  assert.ok(!change.files.some((file) => file.path.startsWith("docs/approvals/")), "no approval record");
  await until(() => byClass(target, "p", "result")[0].textContent.includes("Saved"), "the saved result");
  assert.ok(byClass(target, "p", "result")[0].textContent.includes(fake.head()), "the commit is linked");
});

// TST-358002 · level: unit · module: MOD-review-pages
// guards: AN EDITED FILE KEEPS ITS IDENTIFIER
// given: the editor opened for UC-041
// input: change the front-matter id to UC-099
// expect: Save is disabled and the page names the identifier to keep; no commit is attempted
test("MOD-review-pages use-case/<id>/edit — a changed id disables Save and names the reason", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const fake = fakeHost();
  const { target } = await show(fake, { id: "UC-041", edit: "1" });
  type(target, UC41.replace("id: UC-041", "id: UC-099"));
  assert.equal(saveButton(target).disabled, true, "Save disabled");
  assert.match(byClass(target, "p", "result")[0].textContent, /identifier changed from UC-041 to UC-099/i);
  assert.equal(fake.writes().length, 0, "nothing written");
});

// TST-358003 · level: unit · module: MOD-review-pages
// guards: A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT
// given: UC-041 opened in the editor, then another writer changes it on main
// input: click Save
// expect: no commit is attempted; the edit stays and the newer text is shown beside it
test("MOD-review-pages use-case/<id>/edit — a changed file refuses Save and keeps the edit beside the newer text", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const fake = fakeHost();
  const { target } = await show(fake, { id: "UC-041", edit: "1" });
  const edited = UC41.replace("borrows a book at the desk.", "borrows a book at the desk, with a receipt.");
  type(target, edited);
  fake.land({ [P41]: UC41.replace("borrows a book at the desk.", "borrows one book.") });
  click(saveButton(target));
  await until(() => byClass(target, "div", "newer").length && byClass(target, "div", "newer")[0].textContent.includes("borrows one book"), "the newer text");
  assert.equal(areaOf(target).value, edited, "the edit stays");
  assert.equal(fake.writes().length, 0, "no commit attempted");
});

// TST-358004 · level: unit · module: MOD-review-pages
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL
// given: a GitHub product without a token, and UC-041 opened in the editor
// input: edit and Save
// expect: no commit from the dashboard; GitHub's editor page is offered with only the path in the URL, while the edited text is shown for the clipboard
test("MOD-review-pages use-case/<id>/edit — without a token on GitHub, Save offers GitHub's editor without text in the URL", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const fake = fakeHost();
  const { target } = await show(fake, { id: "UC-041", edit: "1" }, { token: false });
  const edited = UC41.replace("borrows a book at the desk.", "borrows a book at the desk, with a receipt.");
  type(target, edited);
  click(saveButton(target));
  await until(() => byClass(target, "a", "github-page").length === 1, "GitHub's editor page");
  const page = new URL(byClass(target, "a", "github-page")[0].getAttribute("href"));
  assert.equal(page.origin + page.pathname, "https://github.com/alice/thesis-tool/edit/main/" + P41);
  assert.equal([...page.searchParams.keys()].length, 0, "no text-bearing query");
  assert.ok(!decodeURIComponent(byClass(target, "a", "github-page")[0].getAttribute("href")).includes("with a receipt"), "the URL holds no edited text");
  assert.equal(byClass(target, "pre", "clipboard-text")[0].textContent, edited, "the text is shown for the clipboard");
  assert.equal(fake.writes().length, 0, "nothing written");
});

// TST-358005 · level: unit · module: MOD-review-pages
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
// given: a token stored that may not write to the repository, and UC-041 opened in the editor
// input: edit and Save
// expect: the refusal is shown, GitHub's editor page is offered, no dashboard commit lands
test("MOD-review-pages use-case/<id>/edit — PermissionMissing offers GitHub's editor for the edit", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const refusal = failure("PermissionMissing", "Your token may not write to https://github.com/alice/thesis-tool: it lacks Contents.", { permission: "Contents" });
  const fake = fakeHost({ refuse: refusal });
  const before = fake.head();
  const { target } = await show(fake, { id: "UC-041", edit: "1" });
  const edited = UC41.replace("borrows a book at the desk.", "borrows a book at the desk, with a receipt.");
  type(target, edited);
  click(saveButton(target));
  await until(() => byClass(target, "a", "github-page").length === 1, "GitHub's editor page");
  assert.match(byClass(target, "p", "result")[0].textContent, /lacks Contents/, "the refusal is shown");
  const page = new URL(byClass(target, "a", "github-page")[0].getAttribute("href"));
  assert.equal(page.origin + page.pathname, "https://github.com/alice/thesis-tool/edit/main/" + P41);
  assert.equal(fake.head(), before, "no dashboard commit lands");
});

// TST-358006 · level: unit · module: MOD-review-pages
// guards: A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
// given: a GitLab product without a token
// input: the edit route of UC-041
// expect: the use case is shown, no editor and no Save are opened, and the token step is linked
test("MOD-review-pages use-case/<id>/edit — on GitLab without a token there is no Save", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const fake = fakeHost({ repository: ON_GITLAB });
  const { target } = await show(fake, { id: "UC-041", edit: "1" }, { token: false, gitlab: true, instanceToken: true });
  assert.match(target.textContent, /The member borrows a book at the desk\./, "the use case is shown");
  assert.equal(find(target, (node) => node.localName === "textarea").length, 0, "no editor");
  assert.equal(saveButton(target), undefined, "no Save");
  assert.equal(find(target, (node) => node.localName === "a" && node.getAttribute("href") === "#add-product").length, 1, "the token's step");
  assert.equal(fake.writes().length, 0, "nothing written");
});

// TST-472680 · level: unit · module: MOD-review-pages
// guards: ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON; AN APPROVAL NAMES THE EXACT TEXT; STATUS IS DERIVED FROM THE RECORDS; ONE CLICK PER DECISION
// given: UC-041 shown with its Accept, the token stored
// input: a click on Accept
// expect: one commit on `main`, on the head that was read, whose message names the person the token is stored under, holding one file, the record docs/approvals/UC-041-<blob12>.md whose text is "kind: use-case", "file: <the use case's path>", "blob: <the blob of the text shown>"; the page then shows UC-041 as accepted, with no Accept, and says which commit accepted it
test("MOD-review-pages use-case/<id> — Accept writes one record naming the blob shown, and the use case is accepted", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const fake = fakeHost();
  const read = fake.head();
  const { target } = await show(fake, { id: "UC-041" });
  click(byClass(target, "button", "accept")[0]);
  await until(() => fake.writes().length === 1, "the commit");
  const [{ change }] = fake.writes();
  const [recordPath, recordText] = recordOf("UC-041", P41, UC41);
  assert.equal(change.branch, "main");
  assert.equal(change.expectedHead, read, "on the head that was read");
  assert.deepEqual(change.files, [{ path: recordPath, text: recordText }], "one record, naming the blob shown");
  assert.match(change.message, new RegExp(`Accepted by ${TOKEN.name}`), "the commit names the accepting person");
  await until(() => badgeOf(target) === "accepted", "the page to show it accepted");
  assert.equal(byClass(target, "button", "accept").length, 0, "no Accept any more");
  assert.match(target.textContent, new RegExp(fake.head().slice(0, 7)), "the commit is named");
});

// ---------------------------------------------------------------- several at once

// TST-472681 · level: unit · module: MOD-review-pages
// guards: SEVERAL FILES ARE ACCEPTED IN ONE CLICK; AN APPROVAL NAMES THE EXACT TEXT
// given: the list shown with a token; UC-041, UC-043 and UC-044 ticked, and UC-043 unticked again; then another writer's commit changed UC-044 on `main`
// input: a click on Accept ticked
// expect: the number ticked 2, then one commit holding one record, UC-041's — not UC-043's —, naming the blob that was shown; UC-044 left out and named with the reason that it changed since it was shown, and still open; UC-041 accepted
test("MOD-review-pages use-case — two ticked use cases are accepted in one commit, the one changed after it was shown is left out and named", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const fake = fakeHost();
  const { target } = await show(fake);
  const bar = byClass(target, "button", "accept-ticked")[0];
  assert.equal(bar.disabled, true, "nothing ticked: Accept ticked is not pressable");
  tick(byClass(rowOf(target, "UC-041"), "input", "tick")[0]);
  tick(byClass(rowOf(target, "UC-041"), "input", "tick")[0], false);
  assert.equal(byClass(target, "button", "accept-ticked")[0].disabled, true, "ticked and unticked again: not pressable");
  const third = byClass(rowOf(target, "UC-043"), "input", "tick")[0];
  for (const id of ["UC-041", "UC-044"]) tick(byClass(rowOf(target, id), "input", "tick")[0]);
  tick(third);
  tick(third, false);
  assert.equal(byClass(target, "button", "accept-ticked")[0].disabled, false, "two ticked: pressable");
  assert.match(byClass(target, "button", "accept-ticked")[0].textContent, /\(2\)/, "the number ticked");
  fake.land({ [P44]: UC44_EDITED });
  click(byClass(target, "button", "accept-ticked")[0]);
  await until(() => fake.writes().length === 1, "the commit");
  assert.deepEqual(fake.writes()[0].change.files, [{ path: recordOf("UC-041", P41, UC41)[0], text: recordOf("UC-041", P41, UC41)[1] }],
    "one record, UC-041's, naming the blob shown");
  await until(() => badgeOf(rowOf(target, "UC-041")) === "accepted", "the list to show UC-041 accepted");
  assert.match(target.textContent, /UC-044[^]*changed since shown|changed since shown[^]*UC-044/, "UC-044 is named with the reason");
  assert.equal(badgeOf(rowOf(target, "UC-044")), "open", "UC-044 is still open");
});

// ---------------------------------------------------------------- changed since acceptance

// TST-472682 · level: unit · module: MOD-review-pages
// guards: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; EVERY STEP EXPLAINS ITSELF
// given: UC-043, changed since its text was accepted — the record names an earlier text —, and UC-042, accepted
// input: the route use-case rendered for each
// expect: for UC-043 above its text a difference from the last accepted text to the text shown — the earlier sentence marked removed, the new one added —, headed "Changed since it was last accepted", and Accept; for UC-042 no difference
test("MOD-review-pages use-case/<id> — a changed use case is shown with its difference to the last accepted text", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const fake = fakeHost();
  const { target } = await show(fake, { id: "UC-043" });
  assert.equal(badgeOf(target), "changed since acceptance");
  const diff = byClass(target, "section", "accepted-diff")[0];
  assert.ok(diff, "a difference");
  assert.match(diff.textContent, /Changed since it was last accepted/);
  const shown = byClass(diff, "pre", "diff")[0].textContent;
  assert.match(shown, /- \*\*Goal\.\*\* The member returns a book at the desk\./, "the earlier sentence removed");
  assert.match(shown, /\+ \*\*Goal\.\*\* The member returns a book and the card at the desk\./, "the new sentence added");
  assert.ok(target.textContent.indexOf("Changed since it was last accepted") < target.textContent.indexOf("Goal.", target.textContent.indexOf("Changed since")
    + 600), "above the text");
  assert.equal(byClass(target, "button", "accept").length, 1, "Accept");
  const accepted = (await show(fake, { id: "UC-042" })).target;
  assert.equal(byClass(accepted, "section", "accepted-diff").length, 0, "an accepted use case has no difference");
});

// ---------------------------------------------------------------- without a token

// TST-472683 · level: unit · module: MOD-review-pages
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL
// given: a GitHub product and no token stored in this browser; UC-041 open
// input: the route use-case rendered with the id UC-041
// expect: no Accept; a link to GitHub's new-file page of the repository whose address holds the record's path as `filename` and the record as `value` and nothing else — no line of the use case's text, not its title —; and, beside it, the record with its path to copy; nothing written
test("MOD-review-pages use-case/<id> — without a token on GitHub: GitHub's prefilled page, a link that holds no text, and the record to copy", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const fake = fakeHost();
  const { target } = await show(fake, { id: "UC-041" }, { token: false });
  assert.equal(byClass(target, "button", "accept").length, 0, "no Accept");
  const link = byClass(target, "a", "github-page")[0];
  assert.ok(link, "a link to GitHub's page");
  const page = new URL(link.getAttribute("href"));
  const [recordPath, recordText] = recordOf("UC-041", P41, UC41);
  assert.equal(page.origin + page.pathname, "https://github.com/alice/thesis-tool/new/main", "GitHub's new-file page of the repository");
  assert.deepEqual([...page.searchParams.keys()].sort(), ["filename", "value"], "the path and the record, nothing else");
  assert.equal(page.searchParams.get("filename"), recordPath);
  assert.equal(page.searchParams.get("value"), recordText);
  const address = decodeURIComponent(link.getAttribute("href"));
  for (const part of ["borrows a book", "Goal.", "Check out a book", "sequenceDiagram"]) assert.ok(!address.includes(part), `the address holds no "${part}"`);
  assert.equal(byClass(target, "code", "record-path")[0]?.textContent, recordPath, "the exact path");
  assert.equal(byClass(target, "pre", "record")[0]?.textContent, recordText, "the record");
  assert.ok(byClass(target, "button", "copy").length >= 2, "copy buttons for the path and the record");
  assert.equal(fake.writes().length, 0, "nothing written");
});

// TST-472684 · level: unit · module: MOD-review-pages
// guards: WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK; NO TEXT TRAVELS IN A URL (A GITHUB PRODUCT USES A TOKEN OF ITS OWN)
// given: a GitHub product with no token of its own stored in this browser; the instance's own token is stored, and is no token of this product; UC-041 open
// input: the route use-case rendered with the id UC-041, and the list
// expect: no Accept, no tick, no Accept ticked; the link to GitHub's new-file page with the record's path and the record, nothing else; nothing written
test("MOD-review-pages use-case/<id> — a GitHub product without a token of its own: the instance's token is none, GitHub's page is offered", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const fake = fakeHost();
  const one = (await show(fake, { id: "UC-041" }, { token: false, instanceToken: true })).target;
  assert.equal(byClass(one, "button", "accept").length, 0, "no Accept");
  const link = byClass(one, "a", "github-page")[0];
  assert.ok(link, "a link to GitHub's page");
  const page = new URL(link.getAttribute("href"));
  assert.deepEqual([...page.searchParams.keys()].sort(), ["filename", "value"], "the path and the record, nothing else");
  assert.equal(page.searchParams.get("filename"), recordOf("UC-041", P41, UC41)[0]);
  const list = (await show(fake, {}, { token: false, instanceToken: true })).target;
  assert.equal(find(list, (node) => node.localName === "input").length + byClass(list, "button", "accept-ticked").length, 0, "no tick, no Accept ticked");
  assert.equal(fake.writes().length, 0, "nothing written");
});

// TST-472685 · level: unit · module: MOD-review-pages
// guards: A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
// given: a product on a GitLab server, no token of its own stored in this browser — the instance's GitHub token is stored, and is no token for a GitLab server; the list and UC-041
// input: the route use-case rendered for the list and for UC-041
// expect: the use case read and shown; no Accept, no tick, no Accept ticked, no link to a GitHub page; a link to the step that stores the project's token, #add-product
test("MOD-review-pages use-case — a GitLab product without a token: no Accept, and the token's step linked", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const fake = fakeHost({ repository: ON_GITLAB });
  const one = (await show(fake, { id: "UC-041" }, { token: false, gitlab: true, instanceToken: true })).target;
  assert.match(one.textContent, /The member borrows a book at the desk\./, "the use case is shown");
  assert.equal(byClass(one, "button", "accept").length, 0, "no Accept");
  assert.equal(find(one, (node) => node.localName === "a" && /github\.com/.test(node.getAttribute("href") ?? "")).length, 0, "no GitHub page");
  assert.equal(find(one, (node) => node.localName === "a" && node.getAttribute("href") === "#add-product").length, 1, "the token's step");
  const list = (await show(fake, {}, { token: false, gitlab: true, instanceToken: true })).target;
  assert.equal(find(list, (node) => node.localName === "input").length + byClass(list, "button", "accept-ticked").length, 0, "no tick, no Accept ticked");
  assert.equal(rowOf(list, "UC-041") !== undefined, true, "the list is shown");
  assert.equal(fake.writes().length, 0, "nothing written");
});

// ---------------------------------------------------------------- no write access

// TST-472686 · level: unit · module: MOD-review-pages
// guards: ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON; WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
// given: a token stored that may not write to the repository: the host refuses the commit with PermissionMissing
// input: a click on Accept of UC-041
// expect: the refusal said in the host's words; the GitHub path offered — the link to GitHub's new-file page with the record; nothing written, UC-041 still open
test("MOD-review-pages use-case/<id> — PermissionMissing: the GitHub path is offered", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const refusal = failure("PermissionMissing", "Your token may not write to https://github.com/alice/thesis-tool: it lacks Contents.", { permission: "Contents" });
  const fake = fakeHost({ refuse: refusal });
  const before = fake.head();
  const { target } = await show(fake, { id: "UC-041" });
  click(byClass(target, "button", "accept")[0]);
  await until(() => byClass(target, "a", "github-page").length === 1, "the GitHub path");
  assert.match(byClass(target, "p", "result")[0].textContent, /lacks Contents/, "the refusal in the host's words");
  const page = new URL(byClass(target, "a", "github-page")[0].getAttribute("href"));
  assert.equal(page.origin + page.pathname, "https://github.com/alice/thesis-tool/new/main");
  assert.equal(page.searchParams.get("filename"), recordOf("UC-041", P41, UC41)[0]);
  assert.equal(fake.head(), before, "nothing written");
  assert.equal(badgeOf(target), "open", "still open");
});

// ---------------------------------------------------------------- only on the person's click

// TST-472687 · level: unit · module: MOD-review-pages
// guards: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: a token stored; the list, an open use case and a changed one rendered, and the ticks changed
// input: rendering, ticking and unticking — no click on Accept or on Accept ticked
// expect: no commit attempted
test("MOD-review-pages use-case — nothing is written without the person's click", async () => {
  assert.ok(route, `the route use-case: ${pages.error?.message}`);
  const fake = fakeHost();
  const list = (await show(fake)).target;
  tick(byClass(rowOf(list, "UC-041"), "input", "tick")[0]);
  tick(byClass(rowOf(list, "UC-041"), "input", "tick")[0], false);
  await show(fake, { id: "UC-041" });
  await show(fake, { id: "UC-043" });
  assert.ok(byClass(list, "button", "accept-ticked").length === 1, "known positive: the button that would write stands on the page");
  assert.equal(fake.writes().length, 0, "no commit attempted");
});
