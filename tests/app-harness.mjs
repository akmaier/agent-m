// A browser for docs/assets/dashboard-app.mjs under node — used by the tests that load the dashboard (load-per-view, review-page,
// dashboard-shell, architecture, dashboard-review-flows, review-core.d/refused-save), no test of its own.
//
// The app is the real module, imported fresh for every page load. Around it: a DOM that keeps what the app writes into its
// elements, localStorage, the Cache Storage (shared between page loads when the test says so), and GitHub's REST API served
// from a set of files — every request counted by what it reads. The git-data endpoints a commit uses (ref, commit, tree, update
// of the ref, fast-forward only) are served too, and a commit changes the files; a test adds the servers its view talks to as
// request handlers of its own. A button the app wired is found by its
// attribute and clicked with an event the test gives — trusted or not. No request leaves this process.

import { gitBlobSha } from "../docs/assets/review-core.mjs";

const HEAD = "c0ffee".padEnd(40, "0");
export const REPO = "akmaier/agent-m";
export const TOKEN = "github_pat_HARNESS0123456789abcdefghij";

// files: { path: text } — the repository at its default branch. history: texts of earlier commits, readable by their blob SHA.
// dates: { path: ISO date } — when a record was committed. handlers: a test's own fakes, asked first and in order —
// (url: URL, init) -> Response, or nothing for a request the handler does not answer; each request it answers is counted as
// `handler <METHOD> <url>`. So a view's tests bring the servers that view talks to.
// empty: the repository has no commit yet — GitHub's Git database answers 409 "Git Repository is empty." until a file is created
// through the contents API (PUT …/contents/<path>), which makes the first commit.
export async function repoServer({ files: given, history = [], dates = {}, repo = REPO, handlers = [], empty = false }) {
  const files = { ...given };
  const shas = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([p, t]) => [p, await gitBlobSha(t)])));
  const bySha = Object.fromEntries(await Promise.all(history.map(async (t) => [await gitBlobSha(t), t])));
  for (const [p, s] of Object.entries(shas)) bySha[s] = files[p];
  const requests = [], writes = [];
  let pending = 0, head = empty ? null : HEAD, seq = 0;
  const trees = new Map(), commits = new Map();
  const next = (c) => `${c}${String(++seq).padStart(6, "0")}`.padEnd(40, "0");
  const put = async (path, text) => { files[path] = text; shas[path] = await gitBlobSha(text); bySha[shas[path]] = text; };
  const api = `/repos/${repo}`;
  const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });
  const fetchMock = async (u, init = {}) => {
    const url = new URL(String(u)), p = url.pathname, method = (init.method || "GET").toUpperCase();
    let what = `other ${method} ${url.origin}${p}${url.search}`;
    pending += 1;
    try {
      await new Promise((r) => setTimeout(r, 0));
      for (const handle of handlers) {
        const answer = await handle(url, { ...init, method });
        if (answer) { what = `handler ${method} ${url.origin}${p}${url.search}`; return answer; }
      }
      // Without a token a public repository's files come from GitHub's raw host, at the commit the page pinned.
      const rawFile = url.origin === "https://raw.githubusercontent.com" && method === "GET"
        && new RegExp(`^/${repo}/[0-9a-f]{40}/(.+)$`).exec(p);
      if (rawFile) {
        const path = rawFile[1].split("/").map(decodeURIComponent).join("/");
        what = `file ${path}`;
        return path in files ? new Response(files[path], { status: 200 }) : new Response("404: Not Found", { status: 404 });
      }
      if (url.origin !== "https://api.github.com") return new Response("{}", { status: 500 });
      if (head === null && (p === `${api}/commits` || p.startsWith(`${api}/commits/`) || p.startsWith(`${api}/git/`))) {
        what = `empty ${method} ${p}`;
        return json({ message: "Git Repository is empty.", documentation_url: "https://docs.github.com/rest", status: "409" }, 409);
      }
      if (method === "PUT" && p.startsWith(`${api}/contents/`)) {
        const path = p.slice(`${api}/contents/`.length).split("/").map(decodeURIComponent).join("/"), body = JSON.parse(init.body);
        what = `write file ${path}`;
        if (head !== null) return json({ message: 'Invalid request. "sha" wasn\'t supplied.' }, 422);
        const text = Buffer.from(body.content, "base64").toString("utf8");
        await put(path, text);
        head = next("c");
        writes.push({ message: body.message, files: { [path]: text } });
        return json({ content: { path, sha: shas[path] }, commit: { sha: head, html_url: `https://github.com/${repo}/commit/${head}` } }, 201);
      }
      if (method === "POST" && p === `${api}/git/trees`) {
        what = "write tree";
        const sha = next("7");
        trees.set(sha, JSON.parse(init.body).tree);
        return json({ sha });
      }
      if (method === "POST" && p === `${api}/git/commits`) {
        what = "write commit";
        const body = JSON.parse(init.body), sha = next("c");
        commits.set(sha, body);
        return json({ sha, html_url: `https://github.com/${repo}/commit/${sha}` });
      }
      if (method === "PATCH" && p === `${api}/git/refs/heads/main`) {
        what = "write ref";
        const body = JSON.parse(init.body), c = commits.get(body.sha);
        if (!c || c.parents[0] !== head) return json({ message: "Update is not a fast forward" }, 422);
        const tree = trees.get(c.tree);
        for (const f of tree) await put(f.path, f.content);
        writes.push({ message: c.message, files: Object.fromEntries(tree.map((f) => [f.path, f.content])) });
        head = body.sha;
        return json({ object: { sha: head } });
      }
      if (method !== "GET") return new Response("{}", { status: 500 });
      if (p === `${api}/commits/main`) { what = "commit"; return json({ sha: head }); }
      if (p === `${api}/git/ref/heads/main`) { what = "ref"; return json({ object: { sha: head } }); }
      if (p === `${api}/git/commits/${head}`) { what = "commit object"; return json({ sha: head, tree: { sha: "t".repeat(40) } }); }
      if (p === `${api}/git/trees/${head}`) {
        what = "tree";
        return json({ sha: "t".repeat(40), truncated: false,
          tree: Object.keys(files).sort().map((path) => ({ path, mode: "100644", type: "blob", sha: shas[path] })) });
      }
      if (p.startsWith(`${api}/contents/`)) {
        const path = p.slice(`${api}/contents/`.length).split("/").map(decodeURIComponent).join("/");
        what = `file ${path}`;
        return path in files ? new Response(files[path], { status: 200 }) : new Response('{"message":"Not Found"}', { status: 404 });
      }
      const blob = /^\/repos\/[^/]+\/[^/]+\/git\/blobs\/([0-9a-f]{40})$/.exec(p);
      if (blob) {
        what = `blob ${blob[1]}`;
        return blob[1] in bySha ? json({ sha: blob[1], encoding: "base64", content: Buffer.from(bySha[blob[1]], "utf8").toString("base64") })
          : new Response("{}", { status: 404 });
      }
      if (p === `${api}/commits`) {
        const path = url.searchParams.get("path");
        what = `history ${path}`;
        return json(dates[path] ? [{ sha: "d".repeat(40), commit: { committer: { date: dates[path] } } }] : []);
      }
      if (p === api) { what = "repository"; return json({ private: false, default_branch: "main" }); }
      return new Response("{}", { status: 404 });
    } finally {
      requests.push(what);
      pending -= 1;
    }
  };
  // Another commit on the branch: `path` gets `text`, and the branch moves on.
  const change = async (path, text) => { await put(path, text); head = next("e"); };
  return { files, shas, requests, writes, change, fetch: fetchMock, get head() { return head; }, get pending() { return pending; } };
}

// The Cache Storage of a browser, in memory.
export function fakeCaches() {
  const stores = new Map();
  const store = (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const m = stores.get(name);
    return {
      match: async (key) => (m.has(String(key)) ? new Response(m.get(String(key))) : undefined),
      put: async (key, res) => { m.set(String(key), await res.text()); },
    };
  };
  return { stores, open: async (name) => store(name), delete: async (name) => stores.delete(name), has: async (name) => stores.has(name) };
}

// A control the app finds by an attribute selector — `[data-x]` or `[data-x="v"]` — in an element's HTML: it keeps the listeners
// the app adds, and the test fires them. Any other selector finds nothing, as before.
const ATTR_SELECTOR = /^\[([\w-]+)(?:="([^"]*)")?\]$/;
export const reEsc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// The element a view last called focus() on, as a browser keeps document.activeElement (A FORM OPENS WITH ITS FIRST FIELD
// FOCUSED); read through richDocument().focused().
let focusedOne = null;

function control(tag) {
  const listeners = [], sink = { textContent: "", innerHTML: "", hidden: false, disabled: false };
  const dataset = {};
  for (const m of tag.matchAll(/\sdata-([\w-]+)(?:="([^"]*)")?/g)) {
    dataset[m[1].replace(/-(\w)/g, (_, c) => c.toUpperCase())] = (m[2] ?? "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  }
  const c = { tag, dataset, disabled: /\sdisabled\b/.test(tag), checked: /\schecked\b/.test(tag), textContent: "", innerHTML: "",
    value: "", hidden: false,
    addEventListener(type, f) { listeners.push([type, f]); },
    fire(type, ev) { for (const [t, f] of listeners) if (t === type) f({ ...ev, currentTarget: c, target: c }); },
    closest() { return c; }, querySelector: () => sink, querySelectorAll: () => [], focus() { focusedOne = c; },
    // An attribute of its tag, as a browser's element answers it (the settings page finds a remote session's line this way).
    getAttribute: (name) => attrOf(tag, name) };
  return c;
}
function find(html, sel, found) {
  const m = ATTR_SELECTOR.exec(sel);
  if (!m) return [];
  const needle = m[2] === undefined ? new RegExp(`\\s${m[1]}(?=[\\s=>])`, "g") : new RegExp(`\\s${m[1]}="${reEsc(m[2])}"`, "g");
  const out = [];
  let i = 0;
  for (const hit of html.matchAll(needle)) {
    const key = `${sel}#${i++}`;
    if (!found.has(key)) found.set(key, control(html.slice(html.lastIndexOf("<", hit.index), html.indexOf(">", hit.index) + 1)));
    out.push(found.get(key));
  }
  return out;
}

function domElement(localName) {
  const children = [], listeners = [];
  const node = {
    localName, children, className: "", value: "", checked: false, disabled: false, hidden: false,
    type: "", placeholder: "", autocomplete: "", spellcheck: true, href: "", target: "", rel: "", dataset: {}, style: {},
    append(...items) { children.push(...items); },
    replaceChildren(...items) { children.splice(0, children.length, ...items); },
    addEventListener(type, listener) { listeners.push([type, listener]); },
    fire(type, ev = {}) { return Promise.all(listeners.filter(([kind]) => kind === type).map(([, listener]) => listener({ ...ev, type, currentTarget: node, target: node }))); },
    dispatchEvent(ev) { return node.fire(ev.type, ev); },
    // Downloads are observed by the test-specific wrapper where one is installed; the shared browser fixture still
    // performs the anchor activation for settings exports that need only the browser's normal no-return click.
    click() {},
    focus() { focusedOne = node; },
    setAttribute(name, value) { node[name] = String(value); },
    getAttribute(name) { return node[name] ?? null; },
    get textContent() { return children.map((child) => typeof child === "string" ? child : child.textContent).join(""); },
    set textContent(value) { node.replaceChildren(String(value)); },
    get innerHTML() { return children.map(domHtml).join(""); },
    set innerHTML(value) { node.replaceChildren(String(value)); },
    querySelector(selector) { return domFind(node, selector)[0] ?? null; },
    querySelectorAll(selector) { return domFind(node, selector); },
    getElementsByTagName(name) { return domFind(node, name); },
  };
  return node;
}

function domHtml(node) {
  if (typeof node === "string") return node;
  const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const attrs = [node.className && ` class="${esc(node.className)}"`, node.type && ` type="${esc(node.type)}"`, node.value && ` value="${esc(node.value)}"`,
    node.href && ` href="${esc(node.href)}"`, node.disabled && " disabled", node.checked && " checked"].filter(Boolean).join("");
  return `<${node.localName}${attrs}>${node.innerHTML}</${node.localName}>`;
}

function domFind(root, selector) {
  const matches = (node) => {
    if (typeof node === "string") return false;
    const attribute = /^\[([\w-]+)(?:="([^"]*)")?\]$/.exec(selector);
    if (attribute) return attribute[2] === undefined ? node.getAttribute(attribute[1]) !== null : node.getAttribute(attribute[1]) === attribute[2];
    const match = /^([\w-]+)?(?:\.([\w-]+))?$/.exec(selector);
    return Boolean(match && (!match[1] || node.localName === match[1]) && (!match[2] || node.className.split(/\s+/).includes(match[2])));
  };
  const found = [];
  for (const child of root.children ?? []) {
    if (matches(child)) found.push(child);
    if (typeof child !== "string") found.push(...domFind(child, selector));
  }
  return found;
}

function element(id) {
  let html = "";
  let children = null;
  const found = new Map(); // the controls found in the HTML now; new HTML has new ones
  return {
    id, textContent: "", hidden: false, value: "", checked: false, disabled: false, dataset: {}, style: {},
    get innerHTML() { return children ? children.map(domHtml).join("") : html; },
    set innerHTML(v) { children = null; html = String(v); found.clear(); },
    append(...items) { children = (children ?? []); children.push(...items); },
    replaceChildren(...items) { children = [...items]; html = ""; found.clear(); },
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener() {},
    querySelectorAll(sel) { return children ? domFind({ children }, sel) : find(html, sel, found); },
    querySelector(sel) { return this.querySelectorAll(sel)[0] ?? null; },
    closest() { return this; },
    insertAdjacentHTML(where, x) { html = where === "afterbegin" ? x + html : html + x; },
    focus() { focusedOne = this; }, replaceWith() {}, click() {}, getAttribute: () => null,
  };
}

function localStorageWith(entries) {
  const mem = new Map(Object.entries(entries));
  return { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k),
    get length() { return mem.size; }, key: (i) => [...mem.keys()][i] ?? null };
}

// Until the page has had nothing in flight for a while: no request open, none new.
export async function settle(server) {
  let idle = 0, seen = server.requests.length;
  while (idle < 40) {
    await new Promise((r) => setTimeout(r, 0));
    if (server.pending === 0 && server.requests.length === seen) idle += 1;
    else { idle = 0; seen = server.requests.length; }
  }
}

let loads = 0;

// One page load of the dashboard at `hash`, with a stored GitHub token. caches: the browser's Cache Storage, or null for a
// browser without one. assets: the folder the app is served from (another checkout's, to measure it). search: the page's query,
// such as `?product=<address>` for a GitLab product (empty: the instance).
// -> { main() -> the HTML of <main>, el(id) -> the HTML of another element, requests since the load began,
//      go(hash) -> the requests that view made, click(selector, event) -> the requests the click made }
// entries: further settings in this browser when the page opens, { key: raw value } — a product's own token, for one.
export async function openDashboard({ server, hash = "", caches = null, token = TOKEN, search = "", entries = {},
  assets = new URL("../docs/assets/", import.meta.url) }) {
  const purify = (await import(new URL("vendor/purify.es.mjs", assets))).default;
  if (typeof purify.sanitize !== "function") purify.sanitize = (s) => String(s); // node has no DOM to sanitise in
  const els = new Map();
  const head = { children: [], append(x) { this.children.push(x); } }; // the stylesheets a view links into the page
  const doc = { getElementById: (id) => { if (!els.has(id)) els.set(id, element(id)); return els.get(id); },
    querySelectorAll: () => [], createElement: (tag) => domElement(tag), body: { contains: () => true }, head };
  const loc = { hostname: "akmaier.github.io", pathname: "/agent-m/", search, hash, origin: "https://akmaier.github.io",
    get href() { return `https://akmaier.github.io/agent-m/${this.search}${this.hash}`; } };
  const listeners = [];
  const g = globalThis;
  Object.defineProperty(g, "location", { value: loc, configurable: true, writable: true });
  Object.defineProperty(g, "document", { value: doc, configurable: true, writable: true });
  Object.defineProperty(g, "localStorage", { value: localStorageWith({ ...(token ? { "agent-m.github-token": token } : {}), ...entries }),
    configurable: true, writable: true });
  Object.defineProperty(g, "caches", { value: caches ?? undefined, configurable: true, writable: true });
  g.window = g;
  g.fetch = server.fetch;
  g.addEventListener = (type, f) => { if (type === "hashchange") listeners.push(f); };
  g.scrollTo = () => {};
  g.matchMedia = () => ({ matches: false });
  const start = server.requests.length;
  loads += 1;
  await import(new URL(`dashboard-app.mjs?load=${loads}`, assets));
  await settle(server);
  const page = {
    main: () => doc.getElementById("main").innerHTML,
    el: (id) => doc.getElementById(id).innerHTML, // a part the app fills after rendering, such as #impact
    stylesheets: () => head.children.map((l) => l.href), // the stylesheets the views linked, beside style.css
    requests: server.requests.slice(start),
    async go(next) {
      const from = server.requests.length;
      loc.hash = next;
      for (const f of listeners) f();
      await settle(server);
      return server.requests.slice(from);
    },
    // The first control in <main> that `selector` finds is clicked with `event`; { isTrusted: true } is a person's click.
    async click(selector, event = { isTrusted: true }) {
      const from = server.requests.length;
      const c = doc.getElementById("main").querySelector(selector);
      if (!c) throw new Error(`nothing on the page matches ${selector}`);
      c.fire("click", event);
      await settle(server);
      return server.requests.slice(from);
    },
  };
  return page;
}

// ---------------------------------------------------------------- what the harness's document lacks, added for the flows
//
// Moved here unchanged from tests/dashboard-review-flows.test.mjs (written by ITM-123), so that the checks of the dashboard's
// editor in other files (tests/review-core.d/refused-save.test.mjs) use the same document.
//
// The harness above keeps the listeners of the controls it finds in an element's HTML by an attribute selector ([data-x]),
// and page.click fires them in <main>. Three kinds of control these flows click are not reached that way; richDocument() adds
// them on top of the harness's document, whose own controls stay the objects they were (page.click works as before):
//  1. an element found by its id (document.getElementById) keeps the listeners a view adds and can be fired — Add product,
//     Store and check, Check, the settings page's Save buttons are wired that way. Its value, checked, disabled and hidden start
//     from its tag, and new HTML that writes the same id again makes it a new element, as in a browser;
//  2. the edit panel a view finds by its classes (`.panel.edit`), with its textarea, preview, result and buttons — no other class
//     selector is answered, so every other view behaves as under the harness alone;
//  3. a control whose HTML a view sets (a form built inside it) is searched in that HTML.
// It is installed after the first page load and before the view under test is opened (page.go), so that the view's wiring
// reaches it.

const ATTR = ATTR_SELECTOR;
export const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
export const attrOf = (tag, name) => { const m = new RegExp(`\\s${name}="([^"]*)"`).exec(tag); return m ? unesc(m[1]) : null; };
const flagOf = (tag, name) => new RegExp(`\\s${name}(?=[\\s>=/])`).test(tag);
// The positions the harness finds an attribute selector at, in the same order as its controls.
const needle = (sel) => {
  const m = ATTR.exec(sel);
  return m[2] === undefined ? new RegExp(`\\s${m[1]}(?=[\\s=>])`, "g") : new RegExp(`\\s${m[1]}="${reEsc(m[2])}"`, "g");
};

// A control of our own, of the harness's shape, for HTML a view writes into a control.
function ownControl(tag) {
  const listeners = [], dataset = {};
  for (const m of tag.matchAll(/\sdata-([\w-]+)(?:="([^"]*)")?/g)) dataset[m[1].replace(/-(\w)/g, (_, c) => c.toUpperCase())] = unesc(m[2] ?? "");
  const c = { tag, dataset, disabled: flagOf(tag, "disabled"), checked: flagOf(tag, "checked"), value: attrOf(tag, "value") ?? "",
    textContent: "", innerHTML: "", hidden: false,
    addEventListener(type, f) { listeners.push([type, f]); },
    fire(type, ev) { for (const [t, f] of [...listeners]) if (t === type) f({ ...ev, currentTarget: c, target: c }); },
    getAttribute: (n) => attrOf(tag, n), closest() { return c; }, focus() { focusedOne = c; } };
  return withInner(c);
}
// A control's querySelector searches the HTML a view set into it; an attribute selector it does not find, and any other
// selector, answer as before.
function withInner(c) {
  if (c.__inner) return c;
  const before = c.querySelector, beforeAll = c.querySelectorAll;
  let html = null, found = null;
  const all = (sel) => {
    if (html !== c.innerHTML) { html = c.innerHTML; found = new Map(); }
    const out = [];
    let i = 0;
    for (const hit of String(html).matchAll(needle(sel))) {
      const key = `${sel}#${i++}`;
      if (!found.has(key)) found.set(key, ownControl(html.slice(html.lastIndexOf("<", hit.index), html.indexOf(">", hit.index) + 1)));
      out.push(found.get(key));
    }
    return out;
  };
  c.__inner = true;
  c.querySelector = (sel) => (ATTR.test(sel) && all(sel)[0]) || (before ? before.call(c, sel) : null);
  c.querySelectorAll = (sel) => (ATTR.test(sel) ? all(sel) : beforeAll ? beforeAll.call(c, sel) : []);
  return c;
}

// The start tags of `html` in [from, to) that a simple selector — `tag`, `.a`, `.a.b`, `tag.a` — matches, with where each ends.
function tagsMatching(html, sel, from = 0, to = html.length) {
  const [, name, cls] = /^([a-z]*)((?:\.[\w-]+)*)$/.exec(sel) || [];
  if (name === undefined) return [];
  const want = cls.split(".").filter(Boolean), out = [];
  for (const m of html.slice(from, to).matchAll(/<([a-z][\w-]*)([^<>]*)>/g)) {
    const at = from + m.index, tag = m[0];
    const classes = (attrOf(tag, "class") || "").split(/\s+/);
    if ((name && m[1] !== name) || !want.every((k) => classes.includes(k))) continue;
    out.push({ at, tag, name: m[1], end: closing(html, m[1], at + tag.length) });
  }
  return out;
}
function closing(html, name, from) {
  if (["input", "br", "img"].includes(name)) return from;
  const re = new RegExp(`<(/?)${name}\\b[^<>]*>`, "g");
  re.lastIndex = from;
  let depth = 1;
  for (let m; (m = re.exec(html));) { depth += m[1] ? -1 : 1; if (depth === 0) return m.index; }
  return html.length;
}

export function richDocument() {
  const doc = globalThis.document, harnessGet = doc.getElementById;
  const els = new Map(), nodes = new WeakMap();
  const tagOf = (id) => {
    const re = new RegExp(`<[^<>]*\\sid="${reEsc(id)}"[^<>]*>`);
    for (const el of els.values()) { const m = re.exec(el.innerHTML); if (m) return m[0]; }
    return null;
  };
  const reset = (el, tag) => {
    el.listeners = [];
    el.disabled = flagOf(tag, "disabled");
    el.checked = flagOf(tag, "checked");
    el.hidden = flagOf(tag, "hidden");
    el.value = attrOf(tag, "value") ?? "";
  };
  // New HTML: an id it writes again is a new element; the nodes found in the old HTML are gone.
  const renew = (owner, html) => {
    nodes.set(owner, new Map());
    for (const m of html.matchAll(/<[^<>]*\sid="([^"]+)"[^<>]*>/g)) if (els.has(m[1]) && els.get(m[1]) !== owner) reset(els.get(m[1]), m[0]);
  };
  // A part of an element's HTML found by its classes — the edit panel —, and the parts and controls inside it.
  const node = (owner, from, to, tag, name) => {
    const listeners = [];
    const html = () => owner.innerHTML;
    const inside = (sel) => {
      if (ATTR.test(sel)) {
        const hits = [...html().matchAll(needle(sel))].map((h) => h.index);
        return owner.querySelectorAll(sel).filter((_, i) => hits[i] >= from && hits[i] < to);
      }
      return tagsMatching(html(), sel, from, to).map((t) => nodeAt(owner, t, sel));
    };
    const n = { tag, hidden: flagOf(tag, "hidden"), innerHTML: "", textContent: "", outerHTML: "",
      value: name === "textarea" ? unesc(html().slice(from + tag.length, to)) : attrOf(tag, "value") ?? "",
      addEventListener(type, f) { listeners.push([type, f]); },
      fire(type, ev = {}) { for (const [t, f] of [...listeners]) if (t === type) f({ ...ev, currentTarget: n, target: n }); },
      querySelector: (sel) => inside(sel)[0] ?? null, querySelectorAll: (sel) => (ATTR.test(sel) || /^[\w.-]+$/.test(sel) ? inside(sel) : []),
      closest() { return n; }, focus() { focusedOne = n; } };
    return n;
  };
  const nodeAt = (owner, t, sel) => {
    const kept = nodes.get(owner) ?? nodes.set(owner, new Map()).get(owner);
    const key = `${sel}@${t.at}`;
    if (!kept.has(key)) kept.set(key, node(owner, t.at, t.end, t.tag, t.name));
    return kept.get(key);
  };
  const augment = (el) => {
    if (el.__rich) return el;
    el.__rich = true;
    const d = Object.getOwnPropertyDescriptor(el, "innerHTML");
    Object.defineProperty(el, "innerHTML", { configurable: true, enumerable: true, get: d.get,
      set(v) { d.set.call(el, v); renew(el, String(v)); } });
    el.listeners = [];
    el.addEventListener = (type, f) => el.listeners.push([type, f]);
    el.fire = (type, ev = {}) => { for (const [t, f] of [...el.listeners]) if (t === type) f({ ...ev, currentTarget: el, target: el }); };
    const qs = el.querySelector, qsa = el.querySelectorAll;
    el.querySelector = (sel) => {
      if (ATTR.test(sel)) { const c = qs.call(el, sel); return c && withInner(c); }
      return sel === ".panel.edit" ? (tagsMatching(el.innerHTML, sel).map((t) => nodeAt(el, t, sel))[0] ?? null) : qs.call(el, sel);
    };
    el.querySelectorAll = (sel) => (ATTR.test(sel) ? qsa.call(el, sel).map(withInner) : qsa.call(el, sel));
    const tag = tagOf(el.id);
    if (tag) reset(el, tag);
    return el;
  };
  doc.getElementById = (id) => {
    const el = harnessGet(id);
    if (!els.has(id)) els.set(id, el);
    return augment(el);
  };
  for (const id of ["main", "product", "token-banner", "tabs", "repo-line"]) doc.getElementById(id);
  focusedOne = null;
  return {
    byId: (id) => doc.getElementById(id),
    focused: () => focusedOne,
    edit: () => doc.getElementById("main").querySelector(".panel.edit"),
  };
}

// A click on a control or an element, as a person makes it: a disabled one cannot be clicked. -> the requests it made.
export async function press(server, el, ev = { isTrusted: true }) {
  if (!el) throw new Error("nothing to click");
  if (el.disabled) throw new Error(`disabled — a person cannot click ${el.tag || el.id}`);
  const from = server.requests.length;
  el.fire("click", ev);
  await settle(server);
  return server.requests.slice(from);
}
