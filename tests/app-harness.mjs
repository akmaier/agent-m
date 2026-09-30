// A browser for docs/assets/review-app.mjs under node — used by tests/load-per-view.test.mjs, no test of its own.
//
// The app is the real module, imported fresh for every page load. Around it: a DOM that keeps what the app writes into its
// elements, localStorage, the Cache Storage (shared between page loads when the test says so), and GitHub's REST API served
// from a set of files — every request counted by what it reads. No request leaves this process.

import { gitBlobSha } from "../docs/assets/review-core.mjs";

const HEAD = "c0ffee".padEnd(40, "0");
export const REPO = "akmaier/agent-m";
export const TOKEN = "github_pat_HARNESS0123456789abcdefghij";

// files: { path: text } — the repository at its default branch. history: texts of earlier commits, readable by their blob SHA.
// dates: { path: ISO date } — when a record was committed.
export async function repoServer({ files, history = [], dates = {}, repo = REPO }) {
  const shas = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([p, t]) => [p, await gitBlobSha(t)])));
  const bySha = Object.fromEntries(await Promise.all(history.map(async (t) => [await gitBlobSha(t), t])));
  for (const [p, s] of Object.entries(shas)) bySha[s] = files[p];
  const requests = [];
  let pending = 0;
  const api = `/repos/${repo}`;
  const json = (o) => new Response(JSON.stringify(o), { status: 200, headers: { "Content-Type": "application/json" } });
  const fetchMock = async (u, init = {}) => {
    const url = new URL(String(u)), p = url.pathname, method = (init.method || "GET").toUpperCase();
    let what = `other ${method} ${url.origin}${p}${url.search}`;
    pending += 1;
    try {
      await new Promise((r) => setTimeout(r, 0));
      if (url.origin !== "https://api.github.com" || method !== "GET") return new Response("{}", { status: 500 });
      if (p === `${api}/commits/main`) { what = "commit"; return json({ sha: HEAD }); }
      if (p === `${api}/git/trees/${HEAD}`) {
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
  return { files, shas, requests, fetch: fetchMock, get pending() { return pending; } };
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

function element(id) {
  return {
    id, innerHTML: "", textContent: "", hidden: false, value: "", checked: false, disabled: false, dataset: {}, style: {},
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener() {}, querySelectorAll: () => [], querySelector: () => null, closest() { return this; },
    insertAdjacentHTML(where, html) { this.innerHTML = where === "afterbegin" ? html + this.innerHTML : this.innerHTML + html; },
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
//      go(hash) -> the requests that view made }
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
  await import(new URL(`review-app.mjs?load=${loads}`, assets));
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
  };
  return page;
}
