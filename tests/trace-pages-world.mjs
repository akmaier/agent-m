// The world of the system tests of MOD-trace-pages (tests/system-itm-599-gaps-view.test.mjs): the browser's location, its local storage and its
// window, which announces a change of the fragment, and the GitHub the page meets — the REST and the GraphQL API of GitHub and its raw host as
// MOD-repository-hosts' real GitHub host calls them — the repository's information, the commit a branch or a tag stands at, that commit's tree, the repository's
// tags, a file's text through the contents API (with a token) or from the raw host (without), and a batch of files in one GraphQL query (with a token) —, answered by
// a fake of fetch over repositories that hold files at refs, so that the route meets a real host and nothing reaches the network. A request it has no answer for is
// answered "Not Found". Every request is recorded with the kind it is: `api` (a REST call), `graphql` (a batch, with the paths it asks for) or `raw` (a file from the
// raw host). The document is that of tests/trace-pages-harness.mjs. It is code only; it holds no expected result.
//
// Module: MOD-trace-pages
// Level: unit

import { createHash } from "node:crypto";
import { storedGraphBytes } from "./stored-graph-fake.mjs";

// The page of an instance at https://akmaier.github.io/agent-m/docs/index.html opened at `fragment`, with a fresh local storage and a window that announces a
// change of the fragment: -> { location, storage, go(fragment) } — `go` sets the fragment and announces it, as when a person follows a link.
export function installBrowser(fragment) {
  class Storage {
    constructor() { this.map = new Map(); }
    get length() { return this.map.size; }
    key(index) { return [...this.map.keys()][index] ?? null; }
    getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
    setItem(key, value) { this.map.set(key, String(value)); }
    removeItem(key) { this.map.delete(key); }
  }
  const storage = new Storage();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, writable: true, value: storage });
  const location = { hostname: "akmaier.github.io", pathname: "/agent-m/docs/index.html", host: "akmaier.github.io", protocol: "https:", hash: fragment };
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  const announcer = new EventTarget();
  Object.assign(globalThis.window, { addEventListener: announcer.addEventListener.bind(announcer) });
  return { location, storage, go(next) { location.hash = next; announcer.dispatchEvent(new Event("hashchange")); } };
}

const sha1 = (text) => createHash("sha1").update(text).digest("hex");
const blobSha = (text) => sha1(`blob ${Buffer.byteLength(text)}\0${text}`);
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// githubWorld({ "owner/name": { main: { path: text }, "<tag>": { path: text } } }) -> { fetch, requests, forRepository(name) }. The first key of a repository's refs is
// its default branch `main`; every other key is a tag, which the repository's tag list names. A ref's commit is a hash of the repository and the ref.
export function githubWorld(repositories) {
  const requests = [];
  const commitOf = (name, ref) => sha1(`${name}@${ref}`);
  const refOf = (name, commit) => Object.keys(repositories[name]).find((ref) => commitOf(name, ref) === commit);
  const asked = (name) => requests.filter((request) => request.repository === name);
  // The branch trace-cache of a repository holds `<commit>.json.gz` for the commit of each of its refs, as the workflow "main changed" stores it
  // (tests/stored-graph-fake.mjs): the gzipped graph of that ref's files, built once; null for a file it does not hold.
  const graphs = new Map();
  function storedFile(name, file) {
    const ref = Object.keys(repositories[name] ?? {}).find((each) => file === `${commitOf(name, each)}.json.gz`);
    if (ref === undefined) return null;
    const files = repositories[name][ref], key = `${name}@${ref}`;
    if (!graphs.has(key)) graphs.set(key, storedGraphBytes({ commit: commitOf(name, ref), paths: Object.keys(files), read: async (path) => files[path] ?? null }));
    return graphs.get(key);
  }

  async function fetch(input, init = {}) {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const method = String(init.method ?? "GET").toUpperCase();
    const headers = new Headers(init.headers ?? {});
    const authorization = headers.get("authorization");
    const note = (repository, kind, extra = {}) => requests.push({ repository, kind, method, path: `${url.pathname}${url.search}`, authorization, ...extra });
    if (url.origin === "https://raw.githubusercontent.com") {
      const [owner, name, commit, ...path] = url.pathname.split("/").filter(Boolean);
      const file = decodeURIComponent(path.join("/"));
      note(`${owner}/${name}`, "raw", { file });
      if (commit === "trace-cache") {
        const bytes = await storedFile(`${owner}/${name}`, file);
        return bytes ? new Response(bytes, { status: 200 }) : json({ message: "Not Found" }, 404);
      }
      const files = repositories[`${owner}/${name}`]?.[refOf(`${owner}/${name}`, commit)];
      return files && Object.hasOwn(files, file) ? new Response(files[file], { status: 200 }) : json({ message: "Not Found" }, 404);
    }
    if (url.origin !== "https://api.github.com") { requests.push({ repository: null, kind: "other", method, path: String(url), authorization }); return json({ message: "Not Found" }, 404); }
    if (url.pathname === "/graphql") {
      const query = JSON.parse(init.body).query;
      const { owner, name } = JSON.parse(init.body).variables;
      const asks = [...query.matchAll(/(f\d+):object\(expression:("(?:[^"\\]|\\.)*")\)/g)].map((match) => [match[1], JSON.parse(match[2])]);
      note(`${owner}/${name}`, "graphql", { files: asks.map(([, expression]) => expression.split(":").slice(1).join(":")) });
      const repository = {};
      for (const [alias, expression] of asks) {
        const [commit, ...path] = expression.split(":");
        const files = repositories[`${owner}/${name}`]?.[refOf(`${owner}/${name}`, commit)];
        const file = path.join(":");
        repository[alias] = files && Object.hasOwn(files, file) ? { text: files[file], isTruncated: false } : null;
      }
      return json({ data: { repository } });
    }
    const [, kind, owner, name, ...rest] = url.pathname.split("/");
    const repository = `${owner}/${name}`;
    const refs = repositories[repository];
    if (kind !== "repos" || !refs) { requests.push({ repository: null, kind: "other", method, path: `${url.pathname}${url.search}`, authorization }); return json({ message: "Not Found" }, 404); }
    note(repository, "api");
    const tail = rest.join("/");
    if (method === "GET" && tail === "") return json({ default_branch: "main", visibility: "public", private: false, archived: false, description: "", permissions: { push: false } });
    if (method === "GET" && tail.startsWith("commits/")) {
      const ref = decodeURIComponent(tail.slice("commits/".length));
      return Object.hasOwn(refs, ref) ? json({ sha: commitOf(repository, ref), commit: { tree: { sha: `tree-${ref}` } } }) : json({ message: "No commit found" }, 422);
    }
    if (method === "GET" && tail.startsWith("git/trees/")) {
      const files = refs[refOf(repository, tail.slice("git/trees/".length))];
      return json({ sha: "tree", truncated: false, tree: Object.entries(files ?? {}).map(([path, text]) => ({ path, type: "blob", sha: blobSha(text) })) });
    }
    if (method === "GET" && tail.startsWith("contents/") && url.searchParams.get("ref") === "trace-cache") {
      const bytes = await storedFile(repository, decodeURIComponent(tail.slice("contents/".length)));
      return bytes ? new Response(bytes, { status: 200 }) : json({ message: "Not Found" }, 404);
    }
    if (method === "GET" && tail.startsWith("contents/")) {
      const files = refs[refOf(repository, url.searchParams.get("ref"))];
      const file = decodeURIComponent(tail.slice("contents/".length));
      return files && Object.hasOwn(files, file) ? new Response(files[file], { status: 200 }) : json({ message: "Not Found" }, 404);
    }
    if (method === "GET" && tail === "tags") {
      return json(Object.keys(refs).filter((ref) => ref !== "main").map((ref) => ({ name: ref, commit: { sha: commitOf(repository, ref) } })));
    }
    return json({ message: "Not Found" }, 404);
  }

  return { fetch, requests, forRepository: asked };
}

// The count of the requests of each kind among `requests`, as { api, graphql, raw }.
export function counted(requests) {
  const count = (kind) => requests.filter((request) => request.kind === kind).length;
  return { api: count("api"), graphql: count("graphql"), raw: count("raw") };
}
