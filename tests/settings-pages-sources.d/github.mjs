// The GitHub of the tests of MOD-settings-pages' route `sources` (tests/settings-pages-sources.test.mjs, tests/system-uc-015-sources-through-the-frame.test.mjs): GitHub's REST
// API as MOD-repository-hosts' real GitHub host calls it — the repository's information, the head of a branch, a commit's tree, a file's text, many files' texts in one query of GitHub's
// GraphQL API (Snapshot.readMany, with a token), and the commit that a write makes (a tree, a commit, and the move of the branch) — answered by a fake of fetch over repositories that hold
// files, so that the route meets a real host and nothing reaches the network. A request it has not been scripted for throws; every request is recorded; a write without an authorisation header is answered 401. It also holds the small pieces both test files use: a register entry written as the library
// writes it, the fixture DOM's finders, and a context as the frame hands it to a route. It is code only; it holds no expected result.
//
// Module: MOD-settings-pages; MOD-site-frame
// Level: unit

import { createHash } from "node:crypto";

const sha1 = (text) => createHash("sha1").update(text).digest("hex");
// The blob SHA git gives a file's text.
export const blobSha = (text) => sha1(`blob ${Buffer.byteLength(text)}\0${text}`);
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const plain = (text) => new Response(text, { status: 200 });

// githubWorld({ "owner/name": { files: { path: text }, visibility? } }) -> { fetch, requests, files(repository), commits(repository), change(repository, path, text) }.
// A write moves the branch main to a new head; `commits` lists them oldest first as { sha, message, authorization, files }. `change` is another person's commit, made while a page is open.
export function githubWorld(repositories) {
  const state = new Map(Object.entries(repositories).map(([name, { files, visibility = "public" }]) =>
    [name, { files: new Map(Object.entries(files)), visibility, count: 0, trees: new Map(), made: new Map(), blobs: new Map(), commits: [], head: null }]));
  const requests = [];
  const headOf = (name, count) => sha1(`${name}#${count}`);
  for (const [name, repository] of state) repository.head = headOf(name, 0);

  async function fetch(input, init = {}) {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const method = String(init.method ?? "GET").toUpperCase();
    const headers = new Headers(init.headers ?? {});
    const body = typeof init.body === "string" ? JSON.parse(init.body) : null;
    // Each request is recorded with the repository it concerns ("owner/name") and, for a query of GitHub's GraphQL API, the paths of the files it names.
    const graphql = url.origin === "https://api.github.com" && url.pathname === "/graphql";
    const asked = graphql ? [...String(body?.query ?? "").matchAll(/(\w+):object\(expression:("(?:[^"\\]|\\.)*")\)/g)].map(([, alias, expression]) => ({ alias, path: JSON.parse(expression).slice(41) })) : [];
    const segments = url.pathname.split("/").filter(Boolean);
    const concerned = graphql ? `${body?.variables?.owner}/${body?.variables?.name}` : url.origin === "https://raw.githubusercontent.com" ? segments.slice(0, 2).join("/") : segments.slice(1, 3).join("/");
    requests.push({ method, url, authorization: headers.get("authorization"), repository: concerned, named: asked.map((each) => each.path) });
    if (graphql) {
      const held = state.get(concerned);
      if (!held || !headers.get("authorization")) return json({ message: "Requires authentication" }, 401);
      const repository = {};
      for (const { alias, path } of asked) { const text = held.files.get(path); repository[alias] = text === undefined ? null : { text, isTruncated: false }; }
      return json({ data: { repository } });
    }
    if (url.origin === "https://raw.githubusercontent.com") {
      const [owner, name, , ...path] = url.pathname.split("/").filter(Boolean);
      const text = state.get(`${owner}/${name}`)?.files.get(decodeURIComponent(path.join("/")));
      return text === undefined ? json({ message: "Not Found" }, 404) : plain(text);
    }
    if (url.origin !== "https://api.github.com") throw new Error(`unscripted request: ${method} ${url}`);
    if (method !== "GET" && !headers.get("authorization")) return json({ message: "Requires authentication" }, 401);
    const [, , owner, name, ...rest] = url.pathname.split("/");
    const repository = state.get(`${owner}/${name}`);
    if (url.pathname.split("/")[1] !== "repos" || !repository) return json({ message: "Not Found" }, 404);
    const tail = rest.join("/");
    if (method === "GET" && tail === "") {
      return json({ default_branch: "main", visibility: repository.visibility, private: repository.visibility !== "public", archived: false, description: "", permissions: { push: true } });
    }
    if (method === "GET" && tail === "commits/main") return json({ sha: repository.head, commit: { tree: { sha: `tree-${repository.head}` } } });
    if (method === "GET" && tail === `git/trees/${repository.head}`) {
      return json({ sha: `tree-${repository.head}`, truncated: false, tree: [...repository.files].map(([path, text]) => ({ path, type: "blob", sha: blobSha(text) })) });
    }
    if (method === "GET" && tail === "git/ref/heads/main") return json({ object: { sha: repository.head } });
    if (method === "GET" && tail === `git/commits/${repository.head}`) return json({ tree: { sha: `tree-${repository.head}` } });
    if (method === "GET" && tail.startsWith("contents/")) {
      const text = repository.files.get(decodeURIComponent(tail.slice("contents/".length)));
      return text === undefined ? json({ message: "Not Found" }, 404) : plain(text);
    }
    if (method === "GET" && tail.startsWith("actions/")) return json({ workflow_runs: [] });
    if (method === "POST" && tail === "git/blobs") {
      const sha = sha1(body.content);
      repository.blobs.set(sha, Buffer.from(body.content, "base64").toString("utf8"));
      return json({ sha }, 201);
    }
    if (method === "POST" && tail === "git/trees") {
      const sha = sha1(JSON.stringify(body));
      repository.trees.set(sha, body.tree);
      return json({ sha }, 201);
    }
    if (method === "POST" && tail === "git/commits") {
      repository.count += 1;
      const sha = headOf(`${owner}/${name}`, repository.count);
      repository.made.set(sha, { message: body.message, tree: repository.trees.get(body.tree), parents: body.parents });
      return json({ sha, html_url: `https://github.com/${owner}/${name}/commit/${sha}` }, 201);
    }
    if (method === "PATCH" && tail === "git/refs/heads/main") {
      const made = repository.made.get(body.sha);
      if (!made || !made.parents.includes(repository.head)) return json({ message: "Update is not a fast forward" }, 422);
      const textOf = (entry) => entry.content ?? repository.blobs.get(entry.sha);
      for (const entry of made.tree) repository.files.set(entry.path, textOf(entry));
      repository.commits.push({ sha: body.sha, message: made.message, authorization: headers.get("authorization"), files: Object.fromEntries(made.tree.map((entry) => [entry.path, textOf(entry)])) });
      repository.head = body.sha;
      return json({ object: { sha: body.sha } });
    }
    throw new Error(`unscripted request: ${method} ${url.pathname}`);
  }

  return {
    fetch, requests,
    files: (repository) => Object.fromEntries(state.get(repository).files),
    commits: (repository) => state.get(repository).commits,
    change(repository, path, text) {
      const held = state.get(repository);
      held.count += 1;
      held.files.set(path, text);
      held.head = headOf(repository, held.count);
    },
  };
}

// A request that writes. A query of GitHub's GraphQL API is a POST that reads.
export const isWrite = (request) => request.method !== "GET" && request.url.pathname !== "/graphql";

// ---------------------------------------------------------------- a register entry as the library writes it
// register({ id, title, kind, authority, licence, designation?, content_repository?, versions: [{ version, date, hash, files?: [{ name, sha256 }], notStored?: [name] }], parts? }) -> the text of `docs/sources/<id>.md`.
// A version without `files` lists one file `file-<version>.md`.
export function registerEntry({ id, title, kind, authority, licence, designation, content_repository, versions, parts }) {
  const front = Object.entries({ id, title, kind, authority, licence, designation, content_repository }).filter(([, value]) => value !== undefined).map(([key, value]) => `${key}: ${value}`);
  const rows = versions.map(({ version, date, hash, notStored }) => `| \`${version}\` | ${date} | — | fixture | 1 file, listed below; version hash \`${hash}\`${notStored ? `; not stored: ${notStored.join(", ")}` : ""} |`);
  const files = versions.flatMap(({ version, files: listed }) => ["", `### Files of ${version}`, "", "| File | SHA-256 |", "|---|---|",
    ...(listed ?? [{ name: `file-${version}.md`, sha256: "f".repeat(64) }]).map((file) => `| \`${file.name}\` | \`${file.sha256}\` |`)]);
  return [...(front.length ? ["---", ...front, "---"] : []), `# ${id} ${title}`, "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|", ...rows, ...files, "",
    ...(parts ? ["## Parts", "", ...parts.map((part) => `- ${part}`), ""] : [])].join("\n");
}

// ---------------------------------------------------------------- the fixture DOM's finders and the frame's context
export const walk = (root, match) => {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) if (child.nodeType === 1) { if (match(child)) found.push(child); visit(child); } })(root);
  return found;
};
export const withClass = (root, name) => walk(root, (node) => node.className.split(" ").includes(name));
export const sectionOf = (root, id) => walk(root, (node) => node.getAttribute("data-source") === id)[0];

// Resolves once the world has been asked nothing for three timer ticks in a row: the reads, the tree, the commit and the move of a save take as many turns as the host's responses take.
export async function settled(world) {
  let last = -1, quiet = 0;
  while (quiet < 3) {
    await new Promise((resolve) => setTimeout(resolve, 10));
    if (world.requests.length === last) quiet += 1;
    else { quiet = 0; last = world.requests.length; }
  }
}

// Fetch replaced by the world's for the length of the test `t`; the fetch of the module's load is the one put back.
const original = globalThis.fetch;
export function installWorld(t, world) {
  globalThis.fetch = world.fetch;
  t.after(() => { globalThis.fetch = original; });
}
