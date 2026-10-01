// A browser for docs/assets/dashboard-app.mjs under node — used by tests/load-per-view.test.mjs and tests/review-page.test.mjs, no
// test of its own.
//
// The app is the real module, imported fresh for every page load. Around it: a DOM that keeps what the app writes into its
// elements, localStorage, the Cache Storage (shared between page loads when the test says so), and GitHub's REST API served
// from a set of files — every request counted by what it reads. The git-data endpoints a commit uses (ref, commit, tree, update
// of the ref, fast-forward only) are served too, and a commit changes the files. A button the app wired is found by its
// attribute and clicked with an event the test gives — trusted or not. No request leaves this process.

import { gitBlobSha } from "../docs/assets/review-core.mjs";

const HEAD = "c0ffee".padEnd(40, "0");
export const REPO = "akmaier/agent-m";
export const TOKEN = "github_pat_HARNESS0123456789abcdefghij";

// files: { path: text } — the repository at its default branch. history: texts of earlier commits, readable by their blob SHA.
// dates: { path: ISO date } — when a record was committed.
export async function repoServer({ files: given, history = [], dates = {}, repo = REPO }) {
  const files = { ...given };
  const shas = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([p, t]) => [p, await gitBlobSha(t)])));
  const bySha = Object.fromEntries(await Promise.all(history.map(async (t) => [await gitBlobSha(t), t])));
  for (const [p, s] of Object.entries(shas)) bySha[s] = files[p];
  const requests = [], writes = [];
  let pending = 0, head = HEAD, seq = 0;
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
      // Without a token a public repository's files come from GitHub's raw host, at the commit the page pinned.
      const rawFile = url.origin === "https://raw.githubusercontent.com" && method === "GET"
        && new RegExp(`^/${repo}/[0-9a-f]{40}/(.+)$`).exec(p);
      if (rawFile) {
        const path = rawFile[1].split("/").map(decodeURIComponent).join("/");
        what = `file ${path}`;
        return path in files ? new Response(files[path], { status: 200 }) : new Response("404: Not Found", { status: 404 });
      }
      if (url.origin !== "https://api.github.com") return new Response("{}", { status: 500 });
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
const reEsc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    closest() { return c; }, querySelector: () => sink, querySelectorAll: () => [], focus() {} };
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

function element(id) {
  let html = "";
  const found = new Map(); // the controls found in the HTML now; new HTML has new ones
  return {
    id, textContent: "", hidden: false, value: "", checked: false, disabled: false, dataset: {}, style: {},
    get innerHTML() { return html; },
    set innerHTML(v) { html = String(v); found.clear(); },
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener() {},
    querySelectorAll(sel) { return find(html, sel, found); },
    querySelector(sel) { return find(html, sel, found)[0] ?? null; },
    closest() { return this; },
    insertAdjacentHTML(where, x) { html = where === "afterbegin" ? x + html : html + x; },
    focus() {}, replaceWith() {}, click() {}, getAttribute: () => null,
  };
}

function localStorageWith(entries) {
  const mem = new Map(Object.entries(entries));
  return { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k),
    get length() { return mem.size; }, key: (i) => [...mem.keys()][i] ?? null };
}

// Until the page has had nothing in flight for a while: no request open, none new.
async function settle(server) {
  let idle = 0, seen = server.requests.length;
  while (idle < 40) {
    await new Promise((r) => setTimeout(r, 0));
    if (server.pending === 0 && server.requests.length === seen) idle += 1;
    else { idle = 0; seen = server.requests.length; }
  }
}

let loads = 0;

// One page load of the dashboard at `hash`, with a stored GitHub token. caches: the browser's Cache Storage, or null for a
// browser without one. assets: the folder the app is served from (another checkout's, to measure it).
// -> { main() -> the HTML of <main>, el(id) -> the HTML of another element, requests since the load began,
//      go(hash) -> the requests that view made, click(selector, event) -> the requests the click made }
export async function openDashboard({ server, hash = "", caches = null, token = TOKEN,
  assets = new URL("../docs/assets/", import.meta.url) }) {
  const purify = (await import(new URL("vendor/purify.es.mjs", assets))).default;
  if (typeof purify.sanitize !== "function") purify.sanitize = (s) => String(s); // node has no DOM to sanitise in
  const els = new Map();
  const doc = { getElementById: (id) => { if (!els.has(id)) els.set(id, element(id)); return els.get(id); },
    querySelectorAll: () => [], createElement: () => element(""), body: { contains: () => true } };
  const loc = { hostname: "akmaier.github.io", pathname: "/agent-m/", search: "", hash, origin: "https://akmaier.github.io",
    get href() { return `https://akmaier.github.io/agent-m/${this.search}${this.hash}`; } };
  const listeners = [];
  const g = globalThis;
  Object.defineProperty(g, "location", { value: loc, configurable: true, writable: true });
  Object.defineProperty(g, "document", { value: doc, configurable: true, writable: true });
  Object.defineProperty(g, "localStorage", { value: localStorageWith(token ? { "agent-m.github-token": token } : {}), configurable: true, writable: true });
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
