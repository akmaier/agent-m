// MOD-settings-pages' route `add-product` — Add a product (UC-001), as docs/architecture/MOD-settings-pages.md states
// it and ITM-207 builds it: the address recognised as GitHub or a GitLab server; Step A with the token's names filled
// in (THE REPOSITORY CHOICE IS SPELLED OUT), or GitLab's project access token (A GITLAB PRODUCT USES A PROJECT ACCESS
// TOKEN, 3c/3d); Step A shown done only once an actual check proves a key reaches the product with write access —
// its own, or, on GitHub only, the instance's (3a) — never merely because some token is stored, and never for a
// public repository (step 4); Step B, Check, naming a missing repository with the server's page for a new one (2a),
// or any other refusal, and reverting a Step A shown done once a later check fails; Step C, one click (ONE CLICK PER
// DECISION), which writes the missing review layout and adds the product's address to this browser's list, a write
// refused after a successful read named and nothing written, with Step A repainted (5a), a complete layout left
// uncommitted (5b); nothing ever written to the instance repository (NO PRODUCT IS NAMED IN THE INSTANCE
// REPOSITORY); every step's folded explanation with ITM-255's own topic names (EVERY STEP EXPLAINS ITSELF).
//
// Run: node --test tests/settings-pages-add-product.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-001; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; THE REPOSITORY CHOICE IS SPELLED OUT; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY; THE PAGE STATES WHAT IT SENDS WHERE
// Level: unit
//
// Not part of ITM-207, and not tested here: how the dashboard reaches this route, and the other routes of
// MOD-settings-pages (not built by this item); explain()'s own rendering of a topic's Markdown — tests/
// site-frame.test.mjs already checks these exact topics word for word (repository, product-key,
// review-layout-commit, reverting-the-commit, the-product-list; ITM-255) — here only that this route calls explain()
// with the topic explanations.md in fact holds for each step, compared against calling the same, real explain() with
// the topic named in the comments above; MOD-repository-hosts' and MOD-artifact-edits' own correctness (parsing an
// address, a host's HTTP calls, the parts a layout lacks), each already guarded by its own item's tests.
//
// Node has no DOM: this file brings the one of tests/site-frame.test.mjs (itself tests/markdown-render.test.mjs's),
// so that explain()'s renderer (MOD-markdown-render, DOMPurify) runs as it does in a browser — set up before the
// dynamic imports below, since a static import of this route would run before any such setup could take effect.
// MOD-settings-pages' own code builds every element with createElement/append, never parsed from an HTML string, as
// tests/implementation-pages.test.mjs's own view does. The store is MOD-browser-store's own openStore/readSetting/
// writeSetting over a fake localStorage, as tests/notifications.test.mjs's own — "the store ... replaced by fakes"
// fakes what it is backed by, never the already-accepted store module itself, which this file uses only through its
// index.mjs. The hosts are GitHub's and GitLab's REST APIs answered by a fake of fetch, as tests/repository-
// hosts.test.mjs's own — MOD-repository-hosts' parseAddress, connect and the host it returns are the real,
// already-accepted ones; no request leaves the process, and an unscripted one throws. Nothing here sleeps or waits
// on anything but the turn of the event loop in which a click or an input answers. The counter-proofs are recorded
// in the pull request's description.

import test from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------- the document: the part of a browser's DOM that
// explain()'s renderer needs, brought in exactly as tests/site-frame.test.mjs (itself tests/markdown-render.test.mjs)
// brings it in: what DOMPurify reads through the prototypes — parentNode, childNodes, nextSibling, nodeType, nodeName,
// ownerDocument, attributes, cloneNode, remove, removeAttributeNode — are getters and methods of the classes, as in a
// browser. Events are node's own EventTarget and Event.

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

function serialise(n) {
  if (n._type === 3) return LITERAL.has(n._parent?.localName) ? n.data : escapeText(n.data);
  if (n._type === 8) return `<!--${n.data}-->`;
  if (n._type !== 1) return n.innerHTML;
  const start = `<${n.localName}${n._attrs.map((a) => ` ${a.name}="${escapeAttribute(a.value)}"`).join("")}>`;
  return VOID.has(n.localName) ? start : `${start}${n.innerHTML}</${n.localName}>`;
}

const document = htmlDocument();
globalThis.document = document;
globalThis.window = {
  document, Node, Element, Text, Comment, DocumentFragment, DOMParser,
  NodeFilter: { SHOW_ELEMENT: 0x1, SHOW_TEXT: 0x4, SHOW_CDATA_SECTION: 0x8, SHOW_PROCESSING_INSTRUCTION: 0x40, SHOW_COMMENT: 0x80 },
};

// The modules, loaded once the document is there (a static import of them would run before the lines above could set
// it up).
const { route } = await import("../src/settings-pages/products.mjs");
const { explain } = await import("../src/site-frame/index.mjs");
const { openStore, readSetting, writeSetting } = await import("../src/browser-store/index.mjs");

// ---------------------------------------------------------------- DOM helpers: elements, typing, clicking

function elements(root, match) {
  const found = [];
  (function walk(n) { for (const k of n.childNodes) if (k.nodeType === 1) { if (match(k)) found.push(k); walk(k); } })(root);
  return found;
}
const byTag = (root, name) => elements(root, (e) => e.localName === name);
const byClass = (root, name) => elements(root, (e) => e.className.split(" ").includes(name));
const type = (field, text) => { field.value = text; field.dispatchEvent(new Event("input")); };
const turn = () => new Promise((resolve) => setImmediate(resolve));
const click = async (button) => { button.dispatchEvent(new Event("click")); await turn(); };

const steps = (root) => byClass(root, "step");
const titleOf = (step) => byTag(step, "h3")[0]?.textContent ?? "";
const stepTitled = (root, prefix) => steps(root).find((s) => titleOf(s).startsWith(prefix));
const resultsOf = (step) => byClass(step, "result").map((p) => p.textContent);
const lastResultOf = (step) => resultsOf(step).at(-1) ?? "";

function connectedTarget() {
  const target = document.createElement("div");
  document.body.append(target);
  return target;
}

async function renderPage(context) {
  const target = connectedTarget();
  await route.render(target, context, {});
  return target;
}

async function renderAddress(context, address) {
  const target = await renderPage(context);
  type(byClass(target, "address")[0], address);
  await turn();
  return target;
}

// ---------------------------------------------------------------- the store: MOD-browser-store's own openStore/
// readSetting/writeSetting over a fake localStorage (as tests/notifications.test.mjs's own) — its prefixing and its
// JSON are exercised for real; only what it is backed by is fake.

class FakeStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
}
function freshStore() {
  Object.defineProperty(globalThis, "localStorage", { value: new FakeStorage(), configurable: true, writable: true });
  return openStore("fixture/instance");
}
const contextOf = (store) => ({ page: "settings", instance: { repository: "akmaier/agent-m" }, product: null, store, go() {} });
const seedToken = (store, key, fields) => writeSetting(store, key, { name: "fixture", expires: "2027-06-01", stored: "2026-01-01", ...fields });

// ---------------------------------------------------------------- the hosts: GitHub's and GitLab's REST APIs,
// answered by a fake of fetch (as tests/repository-hosts.test.mjs's own); MOD-repository-hosts' parseAddress, connect
// and its host are real. A fixed, ordered script of requests — an unscripted one, or one out of order, throws, so an
// extra write (NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY: nothing beyond the product's own address) fails loud.

function jsonAnswer(status, body, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}

function scripted(steps) {
  const remaining = [...steps];
  return async (input, init = {}) => {
    // `input` is a string, a Request (its own `.url`) or — as MOD-repository-hosts' own `send` passes it — a URL
    // object already (whose own `String()` is its href), as tests/repository-hosts.test.mjs's own `seen` reads it.
    const isRequest = typeof input === "object" && !(input instanceof URL);
    const url = new URL(isRequest ? input.url : String(input));
    const method = String(init.method ?? "GET").toUpperCase();
    const step = remaining.shift();
    if (!step) throw new Error(`unscripted request: ${method} ${url.pathname}${url.search}`);
    assert.equal(`${method} ${url.pathname}`, `${step.method} ${step.path}`, "the request does not match the script");
    return jsonAnswer(step.status ?? 200, step.body ?? {}, step.headers ?? {});
  };
}

async function withFetch(fetchFake, run) {
  const real = globalThis.fetch;
  globalThis.fetch = fetchFake;
  try { return await run(); } finally { globalThis.fetch = real; }
}

const GH_OWNER = "alice", GH_NAME = "thesis-tool", GH_PATH = `${GH_OWNER}/${GH_NAME}`;
const GH_WEB = `https://github.com/${GH_PATH}`;
const GH_PREFIX = `/repos/${GH_PATH}`;
const HEAD = "a".repeat(40), TREE = "b".repeat(40), NEW_TREE = "c".repeat(40), NEW_COMMIT = "d".repeat(40);

// repositoryInfo's one request, scripted alone where a test only checks.
const repoInfoStep = ({ visibility = "private", canWrite = true, status = 200 } = {}) => ({
  method: "GET", path: GH_PREFIX, status,
  body: status === 200
    ? { default_branch: "main", visibility, private: visibility !== "public", archived: false, description: "",
      permissions: { push: canWrite } }
    : { message: "Not Found" },
});

// readSnapshot's two requests: the head commit, then its tree — github.mjs's own snapshot() asks for the tree at the
// *commit's* sha (`/git/trees/${c.sha}`, c being the answer of `/commits/main`), which GitHub's API resolves to that
// commit's tree; `paths` the files already in the product.
const snapshotSteps = (paths) => [
  { method: "GET", path: `${GH_PREFIX}/commits/main`, body: { sha: HEAD, commit: { tree: { sha: TREE } } } },
  { method: "GET", path: `${GH_PREFIX}/git/trees/${HEAD}`,
    body: { sha: HEAD, truncated: false, tree: paths.map((p) => ({ path: p, type: "blob", sha: "e".repeat(40) })) } },
];

// commitFiles' requests on a non-empty repository: the branch checked twice (MOD-repository-hosts.index.mjs calls it
// once directly; github.mjs's own commitFiles calls branchHead once more before writing), the base tree, the new
// tree, the new commit, the branch moved onto it.
const commitSteps = () => [
  { method: "GET", path: `${GH_PREFIX}/git/ref/heads/main`, body: { object: { sha: HEAD } } },
  { method: "GET", path: `${GH_PREFIX}/git/commits/${HEAD}`, body: { tree: { sha: TREE } } },
  { method: "POST", path: `${GH_PREFIX}/git/trees`, body: { sha: NEW_TREE } },
  { method: "POST", path: `${GH_PREFIX}/git/commits`, body: { sha: NEW_COMMIT, html_url: `${GH_WEB}/commit/${NEW_COMMIT}` } },
  { method: "PATCH", path: `${GH_PREFIX}/git/refs/heads/main`, body: { object: { sha: NEW_COMMIT } } },
];

// The complete review layout (5b): every part missingParts (MOD-artifact-edits) checks for is already there.
const COMPLETE_LAYOUT = ["docs/use-cases/README.md", "docs/architecture/README.md", "docs/approvals/README.md",
  "docs/spec-freigaben/README.md", "SPEC.md", "CHANGELOG.md"];

const GL_ORIGIN = "https://gitlab.example.org", GL_GROUP_PATH = "grp/sub/thesis-tool";
const GL_WEB = `${GL_ORIGIN}/${GL_GROUP_PATH}`;
const GL_API_PREFIX = `/api/v4/projects/${encodeURIComponent(GL_GROUP_PATH)}`;

const gitlabInfoStep = ({ level = 40, status = 200 } = {}) => ({
  method: "GET", path: GL_API_PREFIX, status,
  body: status === 200
    ? { default_branch: "main", visibility: "private", archived: false, description: "",
      permissions: { project_access: { access_level: level } } }
    : { message: "404 Project Not Found" },
});

// ---------------------------------------------------------------- explanation topics (ITM-255): the real explain(),
// compared by its text against what the route puts where — not its own rendering, which tests/site-frame.test.mjs
// already checks.
const explainedAs = (topic) => explain(topic).textContent;
const looksExplained = (e) => (e.localName === "details" && e.className === "explain")
  || (e.localName === "div" && e.className === "" && e.childNodes.length === 0);

// ==================================================================================================================

// guards: UC-001 (step 2, the placeholder before an address is valid)
// given: a fresh page, no address typed
// input: render, then type an address that is not a repository's address ("not a url")
// expect: Steps A, B and C are shown, none calling explain() with a known topic; Step C names the address's own
//         parse error and stays disabled
test("add-product — before a valid address, a placeholder with no known explanation, Step C disabled", async () => {
  const context = contextOf(freshStore());
  const target = await renderPage(context);
  assert.equal(steps(target).length, 3);
  for (const s of steps(target)) for (const e of elements(s, looksExplained)) assert.equal(e.localName, "div");
  const invalid = await renderAddress(context, "not a url");
  const c = stepTitled(invalid, "Step C");
  assert.match(lastResultOf(c), /repository's address/);
  assert.equal(byTag(c, "button")[0].disabled, true);
});

// guards: UC-001 main flow (steps 1-5), THE REPOSITORY CHOICE IS SPELLED OUT, A PRODUCT'S TOKEN IS NAMED AFTER THE
// PRODUCT, THE PAGE STATES WHAT IT SENDS WHERE, EVERY STEP EXPLAINS ITSELF, ONE CLICK PER DECISION, NO PRODUCT IS
// NAMED IN THE INSTANCE REPOSITORY, THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER
// given: a fresh store, a GitHub address with nothing stored for it
// input: type the address; Step A's prefilled link and repository-choice steps; store a token, which runs the
//        check — a private, writable repository — without another click; Step C, one click
// expect: the token page is prefilled with the product's own name/description/owner/days; the three choice steps
//         name the repository; the key and the commit are each stated to go to GitHub alone; Step B shows the check's
//         result without a second click, and Step A flips to "done"; Add product writes the missing layout in one
//         commit and remembers the address, with no further, unscripted request
test("add-product — main flow: Step A prefilled and spelled out, Store and check flips Step A done, Add product writes and remembers", async () => {
  const store = freshStore();
  seedToken(store, "github-token", { value: "github_pat_INSTANCE" });
  const context = contextOf(store);
  const target = await renderAddress(context, GH_WEB);

  const a = stepTitled(target, "Step A · A key for the product");
  assert.equal(titleOf(a), "Step A · A key for the product");
  const open = byTag(a, "a")[0];
  const page = new URL(open.href);
  assert.equal(page.origin + page.pathname, "https://github.com/settings/personal-access-tokens/new");
  assert.equal(page.searchParams.get("name"), "Agent M · alice/thesis-tool");
  assert.equal(page.searchParams.get("description"),
    "Agent M for the product alice/thesis-tool: reviews, commits, issues, pull requests and runs of the work you start in it.");
  assert.equal(page.searchParams.get("target_name"), "alice");
  assert.equal(page.searchParams.get("expires_in"), "90");
  const choices = byTag(a, "li").map((li) => li.textContent);
  assert.equal(choices.length, 3);
  assert.ok(choices.some((c) => c.includes("Only select repositories")));
  assert.ok(choices.some((c) => c.includes(GH_PATH)));
  const sendsA = byClass(a, "muted").map((p) => p.textContent).join(" ");
  assert.match(sendsA, /sent only to GitHub's API/);
  assert.deepEqual(elements(a, looksExplained).map((e) => e.textContent), [explainedAs("product-key")]);

  const b = stepTitled(target, "Step B · Check");
  const c = stepTitled(target, "Step C · Add the product");
  assert.equal(lastResultOf(c), "", "the stored instance key may be tried while Step A still asks for the product key");

  // UC-001 step 3 and THE SHARED PAGES ORIGIN IS DISCLOSED: the instance's Pages origin — never the product
  // owner — is stated and acknowledged before the paste field can accept a key. A click on disabled controls must
  // also leave the store untouched, so a synthetic event cannot bypass the browser's disabled UI.
  const notice = byClass(a, "notice")[0];
  const [ack, tokenField, expiresField] = byTag(a, "input");
  const storeBtn = byTag(a, "button")[0];
  assert.match(notice.textContent, /akmaier\.github\.io/);
  assert.ok(a.textContent.indexOf(notice.textContent) < a.textContent.indexOf("Token "));
  assert.equal(ack.checked, false);
  assert.equal(tokenField.disabled, true);
  assert.equal(expiresField.disabled, true);
  assert.equal(storeBtn.disabled, true);
  tokenField.value = "github_pat_ALICE0123456789";
  await click(storeBtn);
  assert.equal(readSetting(store, "github-token:alice/thesis-tool"), null, "no token is stored before acknowledgement");
  ack.checked = true;
  ack.dispatchEvent(new Event("change"));
  assert.equal(tokenField.disabled, false);
  assert.equal(expiresField.disabled, false);
  assert.equal(storeBtn.disabled, false);

  await withFetch(scripted([repoInfoStep({ visibility: "private", canWrite: true })]), () => click(storeBtn));

  assert.match(lastResultOf(b), /is reachable/);
  assert.match(lastResultOf(b), /this key can write here/);
  assert.equal(readSetting(store, "github-token:alice/thesis-tool").value, "github_pat_ALICE0123456789");
  assert.equal(readSetting(store, "github-token:alice/thesis-tool").expires, expiresField.value);
  assert.equal(readSetting(store, "github-token").value, "github_pat_INSTANCE", "the instance token is unchanged");

  const done = stepTitled(target, "Step A · A key for the product — done");
  assert.ok(done, "Step A is repainted as done once the check proves the key reaches the product");
  assert.match(lastResultOf(done), new RegExp(`already reaches ${GH_WEB}`));

  const addBtn = byTag(c, "button")[0];
  assert.equal(addBtn.disabled, false);
  const sendsC = byClass(c, "muted").map((p) => p.textContent).join(" ");
  assert.match(sendsC, /writes the missing review layout/);
  assert.deepEqual(elements(c, looksExplained).map((e) => e.textContent),
    [explainedAs("review-layout-commit"), explainedAs("reverting-the-commit"), explainedAs("the-product-list")]);

  await withFetch(scripted([repoInfoStep({ visibility: "private", canWrite: true }), ...snapshotSteps([]), ...commitSteps()]),
    () => click(addBtn));

  assert.match(lastResultOf(c), /Done — wrote the missing review layout/);
  assert.equal(byTag(c, "a")[0].href, `${GH_WEB}/commit/${NEW_COMMIT}`);
  assert.deepEqual(readSetting(store, "products"), [GH_WEB]);
  // NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY: nothing but this product's own token and the products list was
  // ever written to this browser's store.
  assert.deepEqual(new Set(store.storage.map.keys()),
    new Set(["agent-m:fixture/instance:github-token", `agent-m:fixture/instance:github-token:${GH_PATH}`,
      "agent-m:fixture/instance:products"]));
});

// guards: UC-001 2a (Check), counter to 4a
// given: a fresh store, a GitHub address that does not exist (or is private to a key that cannot see it)
// input: Check
// expect: the repository is named as not found, with a link to GitHub's page for a new repository; Step A is not
//         shown done
test("add-product — 2a: Check on a 404 names the repository and links a new one; Step A stays not done", async () => {
  const context = contextOf(freshStore());
  const target = await renderAddress(context, GH_WEB);
  const b = stepTitled(target, "Step B · Check");
  await withFetch(scripted([repoInfoStep({ status: 404 })]), () => click(byTag(b, "button")[0]));
  assert.match(lastResultOf(b), new RegExp(`${GH_WEB} was not found`));
  const newRepo = byTag(b, "a").find((x) => /new repository/.test(x.textContent));
  assert.equal(newRepo.href, "https://github.com/new");
  assert.ok(!stepTitled(target, "Step A · A key for the product — done"));
});

// guards: UC-001 2a (Add product)
// given: a product's own token already stored, a repository that does not exist (or is private to it)
// input: Add product
// expect: the repository is named as not found, with the link to a new one; nothing is written to the product list
test("add-product — 2a: Add product on a 404 names the repository, links a new one, writes nothing", async () => {
  const store = freshStore();
  seedToken(store, "github-token:alice/thesis-tool", { value: "github_pat_X" });
  const context = contextOf(store);
  const target = await renderAddress(context, GH_WEB);
  const c = stepTitled(target, "Step C · Add the product");
  await withFetch(scripted([repoInfoStep({ status: 404 })]), () => click(byTag(c, "button")[0]));
  assert.match(lastResultOf(c), new RegExp(`${GH_WEB} was not found`));
  assert.ok(byTag(c, "a").some((x) => x.href === "https://github.com/new"));
  assert.equal(readSetting(store, "products"), null);
});

// guards: UC-001 3a (own key already reaches it, the instance's while the product has none), 4a, the gate of pull
// request #150 — a stored instance token alone is never Step A done, and never survives a later failed check
// given: only the instance's GitHub token stored, no product-specific key
// input: Step B's Check (3a) proves a private, writable repository — without pasting a new key; Check again, now
//        refused (token revoked)
// expect: before any check, Step A shows its instructions (not done) although the instance's token is already
//         stored, and Step C is already enabled from that same stored key; after the first check, Step A is done;
//         after the second, Step A is not done again — a "done" never survives a later failed check
test("add-product — 3a/4a: a stored instance token alone never marks Step A done; a later failed check un-marks it", async () => {
  const store = freshStore();
  seedToken(store, "github-token", { value: "github_pat_INSTANCE" });
  const context = contextOf(store);
  const target = await renderAddress(context, GH_WEB);

  assert.ok(stepTitled(target, "Step A · A key for the product"), "Step A still shows its instructions, unchecked");
  assert.ok(!stepTitled(target, "Step A · A key for the product — done"));
  const c = stepTitled(target, "Step C · Add the product");
  assert.equal(byTag(c, "button")[0].disabled, false, "Step C needs no check first — the instance's key is already there to try");

  const b = stepTitled(target, "Step B · Check");
  const checkBtn = byTag(b, "button")[0];
  await withFetch(scripted([repoInfoStep({ visibility: "private", canWrite: true })]), () => click(checkBtn));
  assert.ok(stepTitled(target, "Step A · A key for the product — done"), "the check proved the instance's key reaches it");

  await withFetch(scripted([repoInfoStep({ status: 401 })]), () => click(checkBtn));
  assert.ok(!stepTitled(target, "Step A · A key for the product — done"), "a refused check un-marks a Step A shown done earlier");
  assert.ok(stepTitled(target, "Step A · A key for the product"), "Step A shows its instructions again");
});

// guards: UC-001 step 4 (a public repository's read proves nothing; write access is confirmed only by the first
// write), 3a (a private repository only)
// given: a product's own token stored, a public repository
// input: Check
// expect: the check succeeds, but Step A is never shown done for a public repository
test("add-product — step 4: a public repository's successful check never marks Step A done", async () => {
  const store = freshStore();
  seedToken(store, "github-token:alice/thesis-tool", { value: "github_pat_X" });
  const context = contextOf(store);
  const target = await renderAddress(context, GH_WEB);
  const b = stepTitled(target, "Step B · Check");
  await withFetch(scripted([repoInfoStep({ visibility: "public", canWrite: true })]), () => click(byTag(b, "button")[0]));
  assert.match(lastResultOf(b), /is reachable/);
  assert.match(lastResultOf(b), /confirmed only by the first write/);
  assert.ok(!stepTitled(target, "Step A · A key for the product — done"));
});

// guards: UC-001 5a (a write refused after a successful read), the gate of pull request #150 — "so a failed check
// or a refused write leaves no way to store a key"
// given: a product's own token stored and already proved by Check (Step A done); the write itself is then refused
// input: Add product
// expect: nothing is written to the product list; the refusal is named and keeps Step A's "done" from surviving —
//         Step A is repainted with its instructions, so the author can store a key that actually reaches it
test("add-product — 5a: a write refused after a successful check un-marks Step A done; nothing is written", async () => {
  const store = freshStore();
  seedToken(store, "github-token:alice/thesis-tool", { value: "github_pat_X" });
  const context = contextOf(store);
  const target = await renderAddress(context, GH_WEB);
  const b = stepTitled(target, "Step B · Check");
  await withFetch(scripted([repoInfoStep({ visibility: "private", canWrite: true })]), () => click(byTag(b, "button")[0]));
  assert.ok(stepTitled(target, "Step A · A key for the product — done"));

  const c = stepTitled(target, "Step C · Add the product");
  const refusal = [repoInfoStep({ visibility: "public", canWrite: false }), ...snapshotSteps([]),
    { method: "GET", path: `${GH_PREFIX}/git/ref/heads/main`, status: 403, body: { message: "Resource not accessible" } }];
  await withFetch(scripted(refusal), () => click(byTag(c, "button")[0]));

  assert.match(lastResultOf(c), /Your key cannot write to/);
  assert.equal(readSetting(store, "products"), null);
  assert.ok(!stepTitled(target, "Step A · A key for the product — done"), "a refused write un-marks a Step A shown done earlier");
  assert.ok(stepTitled(target, "Step A · A key for the product"));
});

// guards: UC-001 5b (the product already has the complete layout)
// given: a product's own token stored, a repository that already holds every part of the layout
// input: Add product
// expect: nothing is committed, and no request beyond the three reads is made; the address is still added to this
//         browser's product list
test("add-product — 5b: a complete layout is left uncommitted, the address is still remembered", async () => {
  const store = freshStore();
  seedToken(store, "github-token:alice/thesis-tool", { value: "github_pat_X" });
  const context = contextOf(store);
  const target = await renderAddress(context, GH_WEB);
  const c = stepTitled(target, "Step C · Add the product");
  await withFetch(scripted([repoInfoStep({}), ...snapshotSteps(COMPLETE_LAYOUT)]), () => click(byTag(c, "button")[0]));
  assert.match(lastResultOf(c), /Nothing was missing/);
  assert.deepEqual(readSetting(store, "products"), [GH_WEB]);
});

// guards: UC-001 3c (A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN), 3d, EVERY STEP EXPLAINS ITSELF
// given: a fresh store, a GitLab project's address
// input: type the address; store the project's token, which runs the check
// expect: Step A only opens the project's Access tokens page and spells out role Maintainer/scope api, with the 3d
//         fallback folded beneath it, and is never shown done; Step B is "Give the key to Agent M", sends the key
//         only to that project's own API, and shows the check's result; Step C is enabled once the token is stored
test("add-product — 3c/3d: GitLab's Step A is instructions only, Step B stores and checks the project's own token", async () => {
  const store = freshStore();
  const context = contextOf(store);
  const target = await renderAddress(context, GL_WEB);

  const a = stepTitled(target, "Step A · Create a key for this project");
  assert.ok(a);
  assert.equal(byTag(a, "a")[0].href, `${GL_WEB}/-/settings/access_tokens`);
  const steps3c = byTag(a, "li").map((li) => li.textContent).join(" ");
  assert.match(steps3c, /Maintainer/);
  assert.match(steps3c, /scope: api/);
  const fallback = byTag(a, "details")[0];
  assert.match(byTag(fallback, "p")[0].textContent, /Maintainer/);
  assert.deepEqual(elements(a, looksExplained).map((e) => e.textContent), [explainedAs("product-key")]);

  const b = stepTitled(target, "Step B · Give the key to Agent M");
  assert.ok(b, "GitLab's Step B is titled differently from GitHub's");
  assert.ok(!stepTitled(target, "Step A · Create a key for this project — done"));
  const sendsB = byClass(b, "muted").map((p) => p.textContent).join(" ");
  assert.match(sendsB, new RegExp(`only to this project's own API on gitlab\\.example\\.org`));
  assert.equal(resultsOf(b).some((r) => /already stored/.test(r)), false, "nothing is stored for this project yet");

  // UC-001 3c calls this Step B the familiar notice, paste field and Store and check. The warning names the
  // dashboard's Pages origin (from the instance), rather than the GitLab project's owner or host, and comes first.
  const notice = byClass(b, "notice")[0];
  const [ack, tokenField, expiresField] = byTag(b, "input");
  const storeBtn = byTag(b, "button").at(-1);
  assert.match(notice.textContent, /akmaier\.github\.io/);
  assert.doesNotMatch(notice.textContent, /gitlab\.example\.org/);
  assert.ok(b.textContent.indexOf(notice.textContent) < b.textContent.indexOf("Token "));
  assert.equal(tokenField.disabled, true);
  assert.equal(expiresField.disabled, true);
  assert.equal(storeBtn.disabled, true);
  tokenField.value = "glpat-TEAM0123456789";
  await click(storeBtn);
  assert.equal(readSetting(store, `gitlab-token:gitlab.example.org/${GL_GROUP_PATH}`), null,
    "no GitLab token is stored before acknowledgement");
  ack.checked = true;
  ack.dispatchEvent(new Event("change"));
  assert.equal(tokenField.disabled, false);
  assert.equal(expiresField.disabled, false);
  assert.equal(storeBtn.disabled, false);
  await withFetch(scripted([gitlabInfoStep({ level: 40 })]), () => click(storeBtn));
  assert.match(lastResultOf(b), /is reachable/);
  assert.equal(readSetting(store, `gitlab-token:gitlab.example.org/${GL_GROUP_PATH}`).value, "glpat-TEAM0123456789");
  assert.ok(!stepTitled(target, "Step A · Create a key for this project — done"), "GitLab's Step A has no done state");

  const c = stepTitled(target, "Step C · Add the product");
  assert.equal(byTag(c, "button")[0].disabled, false, "Step C is enabled once the GitLab project's token is stored");
});

// guards: UC-001 3a applied to a GitLab project — "its own" key already stored offers Check directly
// given: a project's own token already stored in this browser
// input: render
// expect: Step B shows that a token is stored, with its own Check button, beside the paste form, which is still
//         there for a new one
test("add-product — GitLab: a project's own token already stored offers Check beside pasting a new one", async () => {
  const store = freshStore();
  seedToken(store, `gitlab-token:gitlab.example.org/${GL_GROUP_PATH}`, { value: "glpat-OLD0123456789", expires: "2027-03-01" });
  const context = contextOf(store);
  const target = await renderAddress(context, GL_WEB);
  const b = stepTitled(target, "Step B · Give the key to Agent M");
  assert.match(resultsOf(b)[0], /already stored.*expires on 2027-03-01/s);
  assert.ok(byTag(b, "input").some((input) => input.type === "password"), "the paste form is still there for a new token");
  const [checkBtn] = byTag(b, "button");
  await withFetch(scripted([gitlabInfoStep({ level: 40 })]), () => click(checkBtn));
  assert.match(lastResultOf(b), /is reachable/);
});

// guards: EVERY STEP EXPLAINS ITSELF (ITM-255) — the field above the steps
// given: a fresh page
// expect: the repository-address field's own explanation is explain("repository")
test("add-product — the address field's folded explanation is the 'repository' topic", async () => {
  const context = contextOf(freshStore());
  const target = await renderPage(context);
  const near = elements(target, looksExplained)[0];
  assert.equal(near.textContent, explainedAs("repository"));
});
