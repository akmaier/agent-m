// Git host — the requests to GitHub and to GitLab servers: reading with GET only, writing one commit on the authority it is
// given, and each token only as the authorisation header of requests to the API of the server that issued it.
//
// Module: MOD-git-host
//
// Adapter (ARC-003, ARC-004). Tokens are passed in by the caller; this module reads no store and imports no other module.
// Besides the requests: a product's address, the links that open GitHub's or GitLab's own pages, and the name of a token a
// server refused, with where it is renewed, and a used-up rate limit, told apart from a refused token.
//
// The request helper (request, fetchText) and the authority check (requireAuthority) are exported for the module's other
// files: a later file of the git host — issues, pull requests, workflows, tags — sends through the same helper and takes the
// same authority. Other modules read through the reads it provides (readSnapshot, readFile, readBlob, commitsTouching,
// repositoryInfo), not through the helper.

export const ALLOWED_ORIGINS = new Set(["https://api.github.com", "https://raw.githubusercontent.com"]);
export const MAX_URL_VALUE = 1000; // NO TEXT TRAVELS IN A URL — a record is ~400 bytes

// ---------------------------------------------------------------- the authority a write is made on (ARC-003 decision 3)

// One value of one shape, { kind }, of three kinds: a person's click (made by the dashboard, from a trusted event), the
// person's token in a CI secret (made by the CI entry) and an agent's own login (made by the bridge app). This module makes
// none and knows nothing of a page or a click; it refuses a write without one. Which kind exists in a runtime is decided by
// that runtime's shell.
const AUTHORITY_KINDS = Object.freeze(["click", "ci-secret", "agent-login"]);

export function requireAuthority(authority) {
  const ok = authority !== null && typeof authority === "object" && !Array.isArray(authority)
    && Object.keys(authority).length === 1 && AUTHORITY_KINDS.includes(authority.kind);
  if (!ok) throw new Error("a write needs an authority — a person's click, a CI secret or an agent's own login");
  return authority;
}

// ---------------------------------------------------------------- the one request helper, and where tokens go

export const TOKEN_DESTINATIONS = ["https://api.github.com"];

// A GitLab product is reached through its own server's REST API v4, and only through the API of its own
// project: `auth` for a GitLab product is { gitlab: server origin, project: path, token | null } (gitlabAuth).
// The server is the one in the product's address, which the person typed or chose (A PRODUCT IS NAMED BY
// ITS ADDRESS); no other GitLab origin is ever reachable.
const isGitLabAuth = (a) => Boolean(a) && typeof a === "object" && typeof a.gitlab === "string" && typeof a.project === "string";
const gitlabPrefix = (a) => `${a.gitlab}/api/v4/projects/${encodeURIComponent(a.project)}`;
const underPrefix = (u, prefix) => { const x = u.origin + u.pathname; return x === prefix || x.startsWith(prefix + "/"); };

// The checks every request passes before it is sent, and the request itself. A TOKEN GOES ONLY TO THE SERVER THAT ISSUED
// IT: the GitHub token (a string) only to GitHub's API as `Authorization`; a GitLab project token (in `auth`) only to its own
// project's API on its own server as `PRIVATE-TOKEN` — headers built here, never in a URL, never to another origin, never set
// by a caller. A read (GET) needs no authority; every other method is a write and needs one (requireAuthority). readOnly: a
// request that may only read (fetchText). -> [url, init, whether a token was sent]
function prepare(url, { method = "GET", headers = {}, credentials, body, auth = null, authority = null, readOnly = false } = {}) {
  const u = new URL(url, globalThis.location?.href);
  const sameOrigin = globalThis.location && u.origin === globalThis.location.origin;
  const gl = isGitLabAuth(auth) ? auth : null;
  if (!sameOrigin && !ALLOWED_ORIGINS.has(u.origin) && !(gl && underPrefix(u, gitlabPrefix(gl)))) {
    throw new Error(`origin not allowed: ${u.origin}${gl ? ` (this product's API is ${gitlabPrefix(gl)})` : ""}`);
  }
  const m = String(method || "GET").toUpperCase();
  if (m !== "GET") {
    if (readOnly) throw new Error("only GET is allowed");
    requireAuthority(authority);
  }
  const h = { ...(headers || {}) };
  if (Object.keys(h).some((k) => /^(authorization|private-token)$/i.test(k))) throw new Error("no caller-set authorization header");
  if (credentials === "include") throw new Error("the dashboard sends no browser credential");
  const token = gl ? gl.token : typeof auth === "string" ? auth : null;
  if (token) {
    if (u.href.includes(token)) throw new Error("A credential is never placed in a URL");
    const a = authHeaders(u.href, auth);
    if (!Object.keys(a).length) {
      throw new Error(gl ? `the GitLab project token may only go to ${gitlabPrefix(gl)}` : `the token may only go to ${TOKEN_DESTINATIONS.join(", ")}`);
    }
    Object.assign(h, a);
  }
  return [u, { method: m, headers: h, credentials: "omit", cache: "no-store", ...(body === undefined ? {} : { body }) }, Boolean(token)];
}

// The request helper: one request to a git server -> the server's Response, whatever its status. A write (any method but GET)
// is sent only on an authority. The helper of every write of this module, and of its later files.
export async function request(url, opts = {}) {
  const [u, init] = prepare(url, opts);
  return fetch(u, init);
}

// The only way the dashboard reads. SPEC §7/§10: GET only.
export async function fetchText(url, init = {}, auth = null) {
  const [u, req, sent] = prepare(url, { method: init.method, headers: init.headers, credentials: init.credentials, auth, readOnly: true });
  const r = await fetch(u, req);
  // The error keeps the server's answer headers — a used-up rate limit is told by them (usedUpLimit) — and whether a token
  // was sent, which decides whose limit it is where the headers do not say.
  if (!r.ok) {
    throw Object.assign(new Error(`${r.status} ${r.statusText} — ${u.origin}${u.pathname}`),
      { status: r.status, headers: r.headers, authenticated: sent });
  }
  return r.text();
}

// The authorisation header for one request, or none. A GitHub token (string) for GitHub's API only; a GitLab
// auth only for its own project's API on its own server.
export function authHeaders(url, auth) {
  if (!auth) return {};
  const u = new URL(url);
  if (isGitLabAuth(auth)) return auth.token && underPrefix(u, gitlabPrefix(auth)) ? { "PRIVATE-TOKEN": auth.token } : {};
  if (typeof auth !== "string") return {};
  return TOKEN_DESTINATIONS.includes(u.origin) ? { Authorization: `Bearer ${auth}` } : {};
}

// ---------------------------------------------------------------- products by their address (SPEC §10)

export const REPO_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/;

// A PRODUCT IS NAMED BY ITS ADDRESS: the web address of its repository, as copied from the browser.
// -> { address, host, repo } for a github.com repository; { address, host, repo, server, kind: "gitlab" } for a
// project on any other server, which is taken for a GitLab server (GITLAB PRODUCTS ARE SUPPORTED) — the check in
// UC-001 step B confirms that it answers as one. GitLab projects sit in nested groups: `repo` is the whole path
// up to GitLab's `/-/` separator. { error } for anything else.
const GITLAB_SEGMENT = /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/;

export function parseProductAddress(input) {
  const s = String(input ?? "").trim();
  let u;
  try { u = new URL(s); } catch { return { error: "Paste the repository's address, e.g. https://github.com/owner/name." }; }
  if (u.protocol !== "https:") return { error: "The address must use https." };
  if (u.username || u.password) return { error: "The address must not contain a user name or token (A CREDENTIAL IS NEVER PLACED IN A URL)." };
  const parts = u.pathname.split("/").filter(Boolean);
  if (u.hostname === "github.com") {
    if (parts.length < 2) return { error: "The address names an owner and a repository: https://github.com/owner/name." };
    const repo = `${parts[0]}/${parts[1].replace(/\.git$/, "")}`;
    if (!REPO_RE.test(repo) || repo.includes("..")) return { error: `not a repository: ${repo}` };
    return { address: `https://github.com/${repo}`, host: "github.com", repo };
  }
  const dash = parts.indexOf("-");
  const path = dash >= 0 ? parts.slice(0, dash) : parts;
  if (path.length) path[path.length - 1] = path[path.length - 1].replace(/\.git$/, "");
  if (path.length < 2) return { error: `The address names a group and a project on ${u.host}, like ${u.origin}/group/project.` };
  if (!path.every((x) => GITLAB_SEGMENT.test(x) && !x.includes(".."))) return { error: `not a GitLab project path: ${path.join("/")}` };
  const repo = path.join("/");
  return { address: `${u.origin}/${repo}`, host: u.host, repo, server: u.origin, kind: "gitlab" };
}

export const isGitLab = (p) => p?.kind === "gitlab";

// ---------------------------------------------------------------- GitHub links (navigation only)

const encPath = (p) => p.split("/").map(encodeURIComponent).join("/");

export function newFileUrl(repo, ref, path, value) {
  if (value.length > MAX_URL_VALUE) throw new Error("NO TEXT TRAVELS IN A URL: value too long for a record");
  return `https://github.com/${repo}/new/${encPath(ref)}?filename=${encodeURIComponent(path)}&value=${encodeURIComponent(value)}`;
}

export function editUrl(repo, ref, path) {
  return `https://github.com/${repo}/edit/${encPath(ref)}/${encPath(path)}`;
}

export function blobUrl(repo, ref, path) {
  return `https://github.com/${repo}/blob/${encPath(ref)}/${encPath(path)}`;
}

// A file on the web page of its product's server (navigation only).
export function webFileUrl(product, ref, path) {
  return isGitLab(product) ? `${product.address}/-/blob/${encPath(ref)}/${encPath(path)}` : blobUrl(product.repo, ref, path);
}

// Where a token is created and renewed (navigation only): the list of the person's GitHub tokens, and a GitLab project's
// Access tokens page.

export const tokenListUrl = () => "https://github.com/settings/personal-access-tokens";

// UC-001 3c · A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN: one token for this one project, role Maintainer, scope
// api — GitLab's default branch protection lets Developers push nothing (queue 2026-09-30c). The page and the fields as GitLab documents them (doc/user/project/settings/project_access_tokens.md,
// "Create a project access token"; route /-/settings/access_tokens in config/routes/project.rb).
export const gitlabTokenPageUrl = (product) => `${product.address}/-/settings/access_tokens`;

// ---------------------------------------------------------------- the one list of a token's permissions

// ONE GITHUB TOKEN SERVES EVERY FEATURE: the permissions of the one fine-grained token, in GitHub's display names (`permission`)
// and the parameter names and access levels of GitHub's prefilled token page (`param`, `access`) — read on 2026-10-01 in the
// table "Repository permissions" of docs.github.com, "Pre-filling fine-grained personal access token details using URL
// parameters": pull_requests read/write, workflows write only, metadata read only; "write always includes read".
const GITHUB_PERMISSIONS = Object.freeze([
  { permission: "Contents", param: "contents", access: "write",
    why: "to save and accept: every edit and acceptance is a commit you ask for by clicking" },
  { permission: "Issues", param: "issues", access: "write",
    why: "for reports that become issues in a product" },
  { permission: "Pull requests", param: "pull_requests", access: "write",
    why: "for a job on GitHub's machines to open and merge its pull request" },
  { permission: "Actions", param: "actions", access: "write",
    why: "to start a run of a workflow, such as the tests" },
  { permission: "Workflows", param: "workflows", access: "write",
    why: "for a job that writes a product's CI configuration, the files under .github/workflows/" },
  { permission: "Metadata", param: "metadata", access: "read",
    why: "GitHub requires it for every token; it reads names and settings, nothing else" },
].map(Object.freeze));

// A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN: role Maintainer, scope api, for the one project.
const GITLAB_PERMISSIONS = Object.freeze({ role: "Maintainer", scope: "api",
  why: "GitLab protects a project's default branch against pushes by Developers, so only a Maintainer token can write there" });

// requiredPermissions(host) — host a server name ("github.com", "gitlab.rrze.fau.de") or a product (parseProductAddress):
// on GitHub { github: [{ permission, param, access, why }] }, on a GitLab server { gitlab: { role, scope, why } }. The one list
// the prefilled token link, the guidance, the steps and the settings page are written from.
export function requiredPermissions(host) {
  const name = typeof host === "string" ? host : host?.host;
  return name === "github.com" ? { github: GITHUB_PERMISSIONS } : { gitlab: GITLAB_PERMISSIONS };
}

// ---------------------------------------------------------------- writing (SPEC §9, §10)

// The one write path (ARC-003 decision 3): every write needs an authority — on the dashboard the one it makes from a
// person's trusted click (THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK) —, and refuses without one before anything is sent.
// All files go into ONE commit, fast-forward only — nobody else's work is ever overwritten.
// `files` may be a function of the branch head: it then computes the files from that very commit, so
// that every check it makes is made on the commit the new one is written on (A STALE APPROVAL IS NOT
// APPLIED). A later commit on the branch makes the fast-forward fail, and nothing is written.
export async function commitFiles({ repo, branch, files, message, token, authority }) {
  requireAuthority(authority);
  if (!token) throw new Error("writing needs a stored token");
  if (!REPO_RE.test(repo) || repo.includes("..")) throw new Error(`not a repository: ${repo}`);
  if (typeof files !== "function" && !files.length) throw new Error("nothing to write");
  const api = `https://api.github.com/repos/${repo}`;
  const call = async (method, path, body) => {
    const r = await request(api + path, { method, auth: token, authority,
      headers: { Accept: "application/vnd.github+json", ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined });
    const text = await r.text();
    if (!r.ok) {
      let msg = text;
      try { msg = JSON.parse(text).message || text; } catch { /* keep raw */ }
      const e = new Error(`${method} ${path}: ${r.status} ${msg}`);
      Object.assign(e, { status: r.status, headers: r.headers, authenticated: true });
      throw e;
    }
    return text ? JSON.parse(text) : {};
  };
  const ref = encodeURIComponent(branch).replace(/%2F/g, "/");
  const head = (await call("GET", `/git/ref/heads/${ref}`)).object.sha;
  if (typeof files === "function") files = await files(head);
  if (!files.length) throw new Error("nothing to write");
  for (const f of files) {
    if (!f.expectBlob) continue;
    let current = null;
    try {
      current = (await call("GET", `/contents/${f.path.split("/").map(encodeURIComponent).join("/")}?ref=${head}`)).sha;
    } catch (e) { if (e.status !== 404) throw e; }
    if (current !== f.expectBlob) throw new Error(`${f.path} changed since you opened it — reload and look at the new text first`);
  }
  const baseTree = (await call("GET", `/git/commits/${head}`)).tree.sha;
  const tree = await call("POST", "/git/trees", { base_tree: baseTree,
    tree: files.map((f) => ({ path: f.path, mode: "100644", type: "blob", content: f.content })) });
  if (typeof message === "function") message = message();
  const commit = await call("POST", "/git/commits", { message, tree: tree.sha, parents: [head] });
  await call("PATCH", `/git/refs/heads/${ref}`, { sha: commit.sha, force: false });
  return { sha: commit.sha, url: commit.html_url || `https://github.com/${repo}/commit/${commit.sha}` };
}

// ---------------------------------------------------------------- GitLab products (SPEC §10, queue 2026-09-24b)
//
// GITLAB PRODUCTS ARE SUPPORTED: a GitLab product is read and written through the REST API v4 of the server
// in its address. Reading pins one commit, as on GitHub: the branch is resolved to a commit once, and the tree
// and every file are read at that commit.

export function gitlabAuth(product, token = null) {
  if (!isGitLab(product)) throw new Error("not a GitLab product");
  return { gitlab: product.server, project: product.repo, token: token || null };
}

export const gitlabApiBase = (product) => `${product.server}/api/v4/projects/${encodeURIComponent(product.repo)}`;

export async function gitlabProject({ product, token = null }) {
  return JSON.parse(await fetchText(gitlabApiBase(product), {}, gitlabAuth(product, token)));
}

const GITLAB_PAGE = 100;

// -> { commit, tree: [{ path, sha }] } — the blobs of `ref` resolved to one commit, every page of the tree.
export async function gitlabSnapshot({ product, ref, token = null }) {
  const auth = gitlabAuth(product, token), api = gitlabApiBase(product);
  const commit = JSON.parse(await fetchText(`${api}/repository/commits/${encodeURIComponent(ref)}`, {}, auth)).id;
  const tree = [];
  for (let page = 1; page <= 1000; page++) {
    const items = JSON.parse(await fetchText(`${api}/repository/tree?ref=${encodeURIComponent(commit)}&recursive=true` +
      `&per_page=${GITLAB_PAGE}&page=${page}`, {}, auth));
    tree.push(...items.filter((e) => e.type === "blob").map((e) => ({ path: e.path, sha: e.id })));
    if (items.length < GITLAB_PAGE) break;
  }
  return { commit, tree };
}

// A file's exact text at a commit, or null if it does not exist there.
export async function gitlabReadFile({ product, commit, path, token = null }) {
  try {
    return await fetchText(`${gitlabApiBase(product)}/repository/files/${encodeURIComponent(path)}/raw?ref=${encodeURIComponent(commit)}`,
      {}, gitlabAuth(product, token));
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

// ---------------------------------------------------------------- reading a product, on either host
//
// The reads this module provides (MOD-git-host): a pinned snapshot, one file at a commit, a text by its blob SHA, the commits
// that touch a path, and what the server reports about the repository. Each goes through the one request helper (fetchText,
// GET only), each token only to the server that issued it. product: as parseProductAddress gives it — a GitLab product by its
// server and project, a github.com one by its `repo`. Moved here from docs/assets/review-core.mjs and the dashboard's files,
// which read through these since ITM-130; the requests are the ones they made.

const GITHUB_API = "https://api.github.com", GITHUB_RAW = "https://raw.githubusercontent.com";
const GITHUB_JSON = { Accept: "application/vnd.github+json" };
const HEX40 = /^[0-9a-f]{40}$/;

// The git blob SHA of a text, as `git hash-object` computes it — what readBlob checks a text it read against.
async function blobSha(text) {
  const body = new TextEncoder().encode(text);
  const head = new TextEncoder().encode(`blob ${body.length}\0`);
  const all = new Uint8Array(head.length + body.length);
  all.set(head);
  all.set(body, head.length);
  return [...new Uint8Array(await crypto.subtle.digest("SHA-1", all))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const b64text = (s) => new TextDecoder().decode(Uint8Array.from(atob(String(s).replace(/\s+/g, "")), (c) => c.charCodeAt(0)));

// The branch, tag or commit `ref` resolved to one commit, and every blob of it — so that a view shows one state.
// -> { commit, tree: [{ path, sha }] }
export async function readSnapshot({ product, ref, token = null }) {
  if (isGitLab(product)) return gitlabSnapshot({ product, ref, token });
  const api = `${GITHUB_API}/repos/${product.repo}`;
  const commit = JSON.parse(await fetchText(`${api}/commits/${encodeURIComponent(ref)}`, { headers: GITHUB_JSON }, token)).sha;
  const tree = JSON.parse(await fetchText(`${api}/git/trees/${commit}?recursive=1`, {}, token));
  return { commit, tree: tree.tree.filter((e) => e.type === "blob").map((e) => ({ path: e.path, sha: e.sha })) };
}

// One file's exact text at a commit, or null if it does not exist there. On GitHub with a token through the API — the only
// place the token may go, which is also what makes a private repository readable —, without one from GitHub's raw host.
export async function readFile({ product, commit, path, token = null }) {
  if (isGitLab(product)) return gitlabReadFile({ product, commit, path, token });
  try {
    return token
      ? await fetchText(`${GITHUB_API}/repos/${product.repo}/contents/${encPath(path)}?ref=${encodeURIComponent(commit)}`,
        { headers: { Accept: "application/vnd.github.raw+json" } }, token)
      : await fetchText(`${GITHUB_RAW}/${product.repo}/${commit}/${encPath(path)}`);
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

// A text by its blob SHA, from the product's server; refused unless it hashes to that SHA (AN APPROVAL NAMES THE EXACT TEXT).
// A blob that is not a SHA, or a GitHub repository that is not one, is refused before anything is sent.
export async function readBlob({ product, blob, token = null }) {
  if (!HEX40.test(String(blob))) throw new Error(`not a blob SHA: ${blob}`);
  let text;
  if (isGitLab(product)) {
    text = await fetchText(`${gitlabApiBase(product)}/repository/blobs/${blob}/raw`, {}, gitlabAuth(product, token));
  } else {
    const r = product?.repo;
    if (!REPO_RE.test(r) || r.includes("..")) throw new Error(`not a repository: ${r}`);
    const j = JSON.parse(await fetchText(`${GITHUB_API}/repos/${r}/git/blobs/${blob}`, { headers: GITHUB_JSON }, token));
    text = j.encoding === "base64" ? b64text(j.content) : String(j.content ?? "");
  }
  if (await blobSha(text) !== blob) throw new Error(`the text read for blob ${blob.slice(0, 12)} does not match that blob SHA`);
  return text;
}

// The newest commits, at most `limit`, that touch `path` at `commit`, newest first -> [{ sha, date, author }]: date is when
// the commit was committed. GitHub: GET /repos/{o}/{r}/commits?path=&sha=&per_page=; GitLab:
// GET /projects/:id/repository/commits?path=&ref_name=&per_page=.
export async function commitsTouching({ product, commit, path, token = null, limit }) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error("commitsTouching needs a limit of at least one commit");
  const q = (ref) => `path=${encodeURIComponent(path)}&${ref}=${encodeURIComponent(commit)}&per_page=${limit}`;
  if (isGitLab(product)) {
    const list = JSON.parse(await fetchText(`${gitlabApiBase(product)}/repository/commits?${q("ref_name")}`, {}, gitlabAuth(product, token)));
    return list.map((c) => ({ sha: c.id, date: c.committed_date, author: c.author_name ?? null }));
  }
  const list = JSON.parse(await fetchText(`${GITHUB_API}/repos/${product.repo}/commits?${q("sha")}`, { headers: GITHUB_JSON }, token));
  return list.map((c) => ({ sha: c.sha, date: c.commit?.committer?.date, author: c.author?.login ?? c.commit?.author?.name ?? null }));
}

// The release tags of the repository, vYYYY.MINOR.PATCH (A RELEASE IS TAGGED AND LOGGED) -> [name]. One request: GitHub's
// refs under tags/v, GitLab's tags whose name begins with v (the first hundred).
export async function releaseTags({ product, token = null }) {
  const names = isGitLab(product)
    ? JSON.parse(await fetchText(`${gitlabApiBase(product)}/repository/tags?search=${encodeURIComponent("^v")}&per_page=100`, {},
      gitlabAuth(product, token))).map((t) => t.name)
    : JSON.parse(await fetchText(`${GITHUB_API}/repos/${product.repo}/git/matching-refs/tags/v`, { headers: GITHUB_JSON }, token))
      .map((r) => String(r.ref).replace(/^refs\/tags\//, ""));
  return names.filter((n) => /^v\d{4}\.\d+\.\d+$/.test(n));
}

// What the server reports about the repository -> { visibility: "public" | "private" | "internal", defaultBranch, role? }.
// role: on GitLab the access level the token acts with (10 Guest … 50 Owner), null when the server names none.
export async function repositoryInfo({ product, token = null }) {
  if (isGitLab(product)) {
    const r = await gitlabProject({ product, token });
    return { visibility: r?.visibility, defaultBranch: r?.default_branch,
      role: r?.permissions?.project_access?.access_level ?? r?.permissions?.group_access?.access_level ?? null };
  }
  const r = JSON.parse(await fetchText(`${GITHUB_API}/repos/${product.repo}`, { headers: GITHUB_JSON }, token));
  return { visibility: r.visibility ?? (r.private ? "private" : "public"), defaultBranch: r.default_branch };
}

// ONE commit on a GitLab product, made with the person's project token on the authority it is given (as commitFiles), through
// POST /projects/:id/repository/commits with one action per file.
//
// GitLab offers no "write only if the branch is still at the commit I read" for an existing branch (on GitHub:
// the fast-forward-only ref update in commitFiles): `start_sha` on an existing branch is refused unless `force`
// is set, and `force` would discard every commit made meanwhile (app/services/commits/create_service.rb
// validate_branch_existence!; doc/api/commits.md). What is done instead:
//   1. the head of the branch is read, and `files(head)` computes the files from that commit — every check the
//      caller makes (a STALE APPROVAL, a changed text) is made on it;
//   2. each file that exists there is written with `update` and `last_commit_id: head` — GitLab refuses the whole
//      commit if that file has changed on the branch since then (Files::MultiService#validate_file_status!);
//      each file that does not exist is written with `create` — GitLab refuses it if the file exists by then;
//   3. the branch is read again just before the commit; if it moved, nothing is written;
//   4. GitLab's answer names the commit it was written on; if that is not the head read in 1, the files changed
//      by the commits in between are returned (`changedMeanwhile`) so that the caller can name the ones it read.
// What remains: a file that is only READ (a use case being accepted, a proposal) and changed by a commit that
// lands between step 3 and GitLab's own write is not refused — step 4 reports it after the fact.
export async function commitFilesGitLab({ product, branch, files, message, token, authority }) {
  requireAuthority(authority);
  if (!token) throw new Error("A GitLab product is written with its project token — store it first.");
  if (!isGitLab(product)) throw new Error("not a GitLab product");
  if (typeof files !== "function" && !files.length) throw new Error("nothing to write");
  const auth = gitlabAuth(product, token), api = gitlabApiBase(product);
  const branchHead = async () => JSON.parse(await fetchText(`${api}/repository/branches/${encodeURIComponent(branch)}`, {}, auth)).commit.id;
  const head = await branchHead();
  if (typeof files === "function") files = await files(head);
  if (!files.length) throw new Error("nothing to write");
  const actions = [];
  for (const f of files) {
    let meta = null;
    try {
      meta = JSON.parse(await fetchText(`${api}/repository/files/${encodeURIComponent(f.path)}?ref=${encodeURIComponent(head)}`, {}, auth));
    } catch (e) { if (e.status !== 404) throw e; }
    if (f.expectBlob && (meta?.blob_id ?? null) !== f.expectBlob) {
      throw new Error(`${f.path} changed since you opened it — reload and look at the new text first`);
    }
    actions.push(meta ? { action: "update", file_path: f.path, content: f.content, encoding: "text", last_commit_id: head }
      : { action: "create", file_path: f.path, content: f.content, encoding: "text" });
  }
  if (await branchHead() !== head) throw new Error(`${branch} moved on while this commit was prepared — nothing was written; reload and look again`);
  if (typeof message === "function") message = message();
  const url = `${api}/repository/commits`;
  const r = await request(url, { method: "POST", auth, authority, headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ branch, commit_message: message, actions }) });
  const text = await r.text();
  if (!r.ok) {
    let msg = text;
    try { const j = JSON.parse(text); msg = j.message ?? j.error ?? text; } catch { /* keep raw */ }
    if (typeof msg !== "string") msg = JSON.stringify(msg);
    throw Object.assign(new Error(`POST ${new URL(url).pathname}: ${r.status} ${msg}`), { status: r.status, headers: r.headers, authenticated: true });
  }
  const c = JSON.parse(text);
  const parent = c.parent_ids?.[0] ?? null;
  let changedMeanwhile = [];
  if (parent && parent !== head) {
    const cmp = JSON.parse(await fetchText(`${api}/repository/compare?from=${encodeURIComponent(head)}&to=${encodeURIComponent(parent)}`, {}, auth));
    changedMeanwhile = [...new Set((cmp.diffs || []).flatMap((d) => [d.old_path, d.new_path]).filter(Boolean))];
  }
  return { sha: c.id, url: c.web_url || `${product.address}/-/commit/${c.id}`, base: head, parent, changedMeanwhile };
}

// The write path for a product of either host, on the authority it is given: to GitHub (commitFiles) or to a GitLab product
// (commitFilesGitLab), which is written only with its own project token (A GITLAB PRODUCT IS WRITTEN WITH A TOKEN).
export async function writeFiles(args) {
  const product = args.product;
  if (isGitLab(product)) {
    requireAuthority(args.authority);
    if (!args.token) throw new Error("A GitLab product is written with its project token — store it first (Settings, or + Add product).");
    if (/^(github_pat_|ghp_)/.test(args.token)) throw new Error("That is the GitHub token; a GitLab product is written with its own GitLab project token.");
    return commitFilesGitLab(args);
  }
  return commitFiles({ ...args, repo: args.repo ?? product?.repo });
}

// How Accept and Save work for a product: a commit with a stored token; without one, GitHub's web interface
// (WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK), or on GitLab the step that stores the project's
// token — GitLab has no page that could be prefilled (A GITLAB PRODUCT IS WRITTEN WITH A TOKEN).
export function writeRoute(product, token) {
  if (token) return "commit";
  return isGitLab(product) ? "token-step" : "github-web";
}

// ---------------------------------------------------------------- a refused token, named, with where it is renewed

export const RENEW_TEXT = "On GitHub's list of your tokens, open this one and press “Regenerate token”: the new value keeps the " +
  "token's permissions and repositories. Then paste it under Settings → GitHub token → Change.";

// A GitLab project token is renewed on its project's Access tokens page: "Rotate a token to create a new token with
// the same permissions and scope as the original" (doc/user/project/settings/project_access_tokens.md).
export const GITLAB_RENEW_TEXT = "On the project's Access tokens page, press “Rotate” next to the token Agent M: the new value keeps " +
  "its role and scope. Then paste it, with the expiry date GitLab shows, under Settings → GitLab project tokens → Change.";

// Which token, and where it is renewed: the GitHub token, or the GitLab project token of a GitLab product.
export function tokenIdentity(product) {
  return isGitLab(product)
    ? { token: `GitLab project token for ${product.address}`, renewUrl: gitlabTokenPageUrl(product), renew: GITLAB_RENEW_TEXT, server: product.host }
    : { token: "GitHub token", renewUrl: tokenListUrl(), renew: RENEW_TEXT, server: "GitHub" };
}

// ---------------------------------------------------------------- a used-up rate limit, named (queue 2026-10-01b)

// One header of a refused request's answer: from the Headers the error keeps, or a plain object of them.
function answerHeader(e, name) {
  const hs = e?.headers;
  if (!hs) return null;
  if (typeof hs.get === "function") return hs.get(name);
  const k = Object.keys(hs).find((x) => x.toLowerCase() === name);
  return k === undefined ? null : String(hs[k]);
}
const resetDate = (v) => (Number(v) > 0 ? new Date(Number(v) * 1000) : null);

// A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN: a 403 or 429 that the server's rate-limit headers mark as a used-up
// limit -> { limit: "account" | "network", resetsAt: Date | null }; anything else -> null.
// GitHub answers a used-up primary limit with 403 or 429 and exposes X-RateLimit-Limit, -Remaining and -Reset to pages: the
// limit is used up when Remaining is 0; it is the account's (5000 an hour, every token of the account counted together) or,
// without a token, the network's (60 an hour); Reset is when it starts again, in seconds since 1970. gitlab.com answers 429
// and exposes no rate-limit header to pages (measured 2026-10-01), so a GitLab product's limit comes back without a time —
// with one only where its server lets the page read RateLimit-Remaining and RateLimit-Reset. Whose limit it is, where no
// header says: the account's when the request carried a token, else the network's.
// product: the GitLab product the request went to; none for GitHub. A failure of MOD-repository-hosts carries no status: it
// names a used-up limit RateLimited, with the limit and when it resets.
export function usedUpLimit(e, product = null) {
  if (e?.name === "RateLimited") return { limit: e.limit, resetsAt: e.resetsAt ?? null };
  const status = e?.status;
  if (status !== 403 && status !== 429) return null;
  const whose = e.authenticated === false ? "network" : "account";
  if (isGitLab(product)) {
    const remaining = answerHeader(e, "ratelimit-remaining");
    if (status !== 429 && remaining !== "0") return null;
    return { limit: whose, resetsAt: remaining === "0" ? resetDate(answerHeader(e, "ratelimit-reset")) : null };
  }
  if (answerHeader(e, "x-ratelimit-remaining") !== "0") return null;
  const perHour = Number(answerHeader(e, "x-ratelimit-limit"));
  return { limit: perHour > 0 ? (perHour <= 60 ? "network" : "account") : whose, resetsAt: resetDate(answerHeader(e, "x-ratelimit-reset")) };
}

// ---------------------------------------------------------------- a refused token, named

// AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED: GitHub and GitLab answer 401 to a token they no longer accept
// (expired, regenerated, rotated, revoked or deleted). 403 and 404 are a missing permission or repository, not this — nor is a
// used-up rate limit (403 or 429, usedUpLimit), which a caller names before it asks this.
// product: the GitLab product whose token was used; none for the GitHub token. A failure of MOD-repository-hosts carries no
// status: it names a refused token TokenRefused.
export function tokenRefusal(e, product = null) {
  const status = e?.name === "TokenRefused" ? 401 : e?.status ?? Number((/(?:^|: )(\d{3})\b/.exec(e?.message || "") || [])[1]);
  if (status !== 401) return null;
  const id = tokenIdentity(product);
  return { token: id.token, renewUrl: id.renewUrl, renew: id.renew,
    text: isGitLab(product)
      ? `${id.server} refused your ${id.token} — it has expired, or was rotated or revoked on GitLab.`
      : "GitHub refused your GitHub token — it has expired, or was regenerated or deleted on GitHub." };
}
