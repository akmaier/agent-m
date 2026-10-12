// The adapter for GitHub's REST API: one repository on github.com, read and written with the person's token, sent only to
// GitHub's API for this repository; a public repository is read without one, its files from GitHub's raw host.
//
// Module: MOD-repository-hosts
//
// Private to the module: index.mjs builds the host from what this returns — repositoryInfo(), snapshot(ref),
// readFile(commit, path), history(path, { ref, limit }), listTags(), issueCounts(), commitFiles(change), createTag(name, commit),
// createBranch(name, from), startWorkflow(workflow, ref, inputs) — and adds what both adapters share.

import { HostError, send, json, refusal } from "./failures.mjs";

const API = "https://api.github.com", RAW = "https://raw.githubusercontent.com";
// GitHub's search of issues and pull requests: an address of the API outside the repository's own, which the token reaches too.
const SEARCH = `${API}/search/issues`;
const PAGE = 100, MAX_PAGES = 1000;
const JSON_ACCEPT = "application/vnd.github+json", RAW_ACCEPT = "application/vnd.github.raw+json";
const encPath = (p) => p.split("/").map(encodeURIComponent).join("/");

// A file of "Get a commit" as the change the commit made to it: its status — a copy is an addition, a change of mode a
// modification —, and for a rename the path it came from. A file the commit left unchanged is no change.
const CHANGES = { added: "added", copied: "added", removed: "deleted", renamed: "renamed", modified: "modified", changed: "modified" };
const changeOf = (f) => (CHANGES[f.status]
  ? [{ path: f.filename, change: CHANGES[f.status], ...(f.status === "renamed" ? { from: f.previous_filename } : {}) }] : []);

// The bytes of a file as base64, in pieces small enough for String.fromCharCode.
function base64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// address: a RepositoryAddress on github.com; token: the person's GitHub token, or none; tokenName: the name it was stored
// under; links: the host's WebLinks, whose list of tokens is where a refused token is renewed and a repository added to it.
export function githubAdapter(address, { token, tokenName }, links) {
  const repo = `${API}/repos/${address.path}`;
  const gate = { allowed: [repo, SEARCH, `${RAW}/${address.path}`], tokenAt: [repo, SEARCH], header: "Authorization",
    value: token ? `Bearer ${token}` : null, token };
  const context = { server: "github", host: "GitHub", web: address.web, authenticated: Boolean(token), tokenName,
    renewal: links.tokens, permission: "Contents", what: address.web };

  // One request to the repository's API -> its answer when the server served it. on: { status: (answer) -> value } for the
  // answers a call names itself; every other refusal becomes its failure (failures.mjs refusal).
  async function call(method, url, { body, accept = JSON_ACCEPT, on = {}, ...more } = {}) {
    const answer = await send(url, { method, headers: { Accept: accept, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body) }, gate);
    if (answer.ok) return answer;
    if (on[answer.status]) return on[answer.status](answer);
    throw await refusal(answer, { ...context, write: method !== "GET", ...more });
  }
  // A read's JSON; what an `on` handler returns instead of an answer is passed on as it is.
  const read = async (url, options) => {
    const answer = await call("GET", url, options);
    return answer instanceof Response ? json(answer, API) : answer;
  };

  // An empty repository: GitHub's Git database answers 409 "Git Repository is empty." while a repository has no commit ("Using
  // the REST API to interact with your Git database", read 2026-10-06). Any other 409 — a repository GitHub is still creating —
  // stays the failure it is.
  const EMPTY = Symbol("an empty repository");
  const emptyOr = (more = {}) => async (answer) => {
    const said = await answer.clone().json().catch(() => null);
    if (said?.message === "Git Repository is empty.") return EMPTY;
    throw await refusal(answer, { ...context, write: false, ...more });
  };

  // A branch's reference: read at git/ref/heads/…, moved at git/refs/heads/… ("Get a reference", "Update a reference").
  const heads = (branch) => `heads/${encodeURIComponent(branch).replace(/%2F/g, "/")}`;
  // The commit the branch stands at now, or null when there is no such branch — in an empty repository there is none.
  const branchHead = async (branch) => {
    const r = await read(`${repo}/git/ref/${heads(branch)}`, { on: { 404: () => null, 409: emptyOr() } });
    return r === EMPTY ? null : r?.object?.sha ?? null;
  };
  const moved = (branch, head) => new HostError("Moved", { head },
    `${branch} has moved on${head ? ` to ${head.slice(0, 12)}` : ""} since it was read — nothing was written; read it again.`);

  // A tag's reference: read at git/ref/tags/…, created at git/refs ("Get a reference", "Create a reference").
  const tagRef = (name) => `tags/${encodeURIComponent(name)}`;
  // The tag's own commit, read back after its creation was refused because it stands already (A VERSION IS NOT REWRITTEN).
  const tagExists = async (name) => {
    const r = await read(`${repo}/git/ref/${tagRef(name)}`, { on: { 404: () => null } });
    const commit = r?.object?.sha ?? null;
    return new HostError("TagExists", { commit },
      `${name} exists already, on ${commit ? commit.slice(0, 12) : "a commit this page could not read"} — a release is never ` +
      "re-tagged (A VERSION IS NOT REWRITTEN).");
  };

  return {
    async repositoryInfo() {
      const r = await read(repo, { permission: "Metadata" });
      return { defaultBranch: r.default_branch ?? null, visibility: r.visibility ?? (r.private ? "private" : "public"),
        canWrite: Boolean(token) && r.permissions?.push === true, archived: r.archived === true, description: r.description ?? "" };
    },

    // The branch, tag or commit resolved to one commit, then that commit's tree: every file, by its blob SHA.
    async snapshot(name) {
      const what = `${address.web} at ${name}`;
      const notFound = () => { throw new HostError("NotFound", { what }, `${what} was not found.`); };
      const c = await read(`${repo}/commits/${encodeURIComponent(name)}`, { what, on: { 422: notFound, 409: emptyOr({ what }) } });
      // An empty repository is a snapshot without a commit and without a file (MOD-repository-hosts Snapshot).
      if (c === EMPTY) return { commit: null, blobs: new Map() };
      const t = await read(`${repo}/git/trees/${c.sha}?recursive=1`, { what });
      return { commit: c.sha, blobs: new Map(t.tree.filter((e) => e.type === "blob").map((e) => [e.path, e.sha])) };
    },

    // Every tag of the repository, with the commit it points to, page by page ("List repository tags": GitHub dereferences an
    // annotated tag to its commit already, so commit.sha is always a commit; at most 100 a page, the next page named in the
    // Link response header, rel="next" — a repository with more is read page by page, as this module's own GitLab snapshot
    // already reads a project's tree).
    async listTags() {
      const tags = [];
      for (let page = 1; page <= MAX_PAGES; page++) {
        const items = await read(`${repo}/tags?per_page=${PAGE}&page=${page}`);
        for (const t of items) tags.push({ name: t.name, commit: t.commit.sha });
        if (items.length < PAGE) break;
      }
      return tags;
    },

    // The numbers of open and closed issues, from GitHub's search ("Search issues and pull requests"): one search for each
    // state, "repo:… is:issue state:…", asking for one result a page, since only its total_count is read — no issue is listed.
    // is:issue leaves out the pull requests, which the search lists with the issues otherwise. The search has a limit of its
    // own (failures.mjs), and answers 422, not 404, for a repository it does not hold or the client may not see.
    async issueCounts() {
      const count = async (state) => {
        const query = new URLSearchParams({ q: `repo:${address.path} is:issue state:${state}`, per_page: "1" });
        return (await read(`${SEARCH}?${query}`, { search: true })).total_count;
      };
      return { open: await count("open"), closed: await count("closed") };
    },

    // The commits that changed a path — the repository where the path is null —, newest first, from `ref` (the default branch where
    // none is given), at most `limit` of them (all where none is given), each with the files it changed. "List commits" (sha,
    // path, per_page up to 100, page) names the commits, page by page as listTags reads the tags; "Get a commit" gives the
    // files of one, up to 100 to a page here, read page by page for a commit that changed more.
    async history(path, { ref, limit } = {}) {
      const what = ref ? `${address.web} at ${ref}` : address.web;
      const per = limit === undefined ? PAGE : Math.max(1, Math.min(PAGE, limit));
      const query = `per_page=${per}${ref ? `&sha=${encodeURIComponent(ref)}` : ""}${path ? `&path=${encodeURIComponent(path)}` : ""}`;
      const listed = [];
      for (let page = 1; page <= MAX_PAGES && (limit === undefined || listed.length < limit); page++) {
        const items = await read(`${repo}/commits?${query}&page=${page}`, { what });
        listed.push(...items);
        if (items.length < per) break;
      }
      const entries = [];
      for (const c of limit === undefined ? listed : listed.slice(0, limit)) {
        const changes = [];
        for (let page = 1; page <= MAX_PAGES; page++) {
          const { files } = await read(`${repo}/commits/${c.sha}?per_page=${PAGE}&page=${page}`, { what: `${address.web} at ${c.sha}` });
          changes.push(...files.flatMap(changeOf));
          if (files.length < PAGE) break;
        }
        entries.push({ commit: c.sha, parents: c.parents.map((p) => p.sha), author: { account: c.author?.login ?? null, name: c.commit.author.name },
          date: c.commit.committer.date, message: c.commit.message, changes });
      }
      return entries;
    },

    // One file's text at a commit, or null where the commit does not hold it: with a token through the API — the only place
    // the token may go, which is also what reads a private repository —, without one from GitHub's raw host.
    async readFile(commit, path) {
      const url = token ? `${repo}/contents/${encPath(path)}?ref=${commit}` : `${RAW}/${address.path}/${commit}/${encPath(path)}`;
      const answer = await call("GET", url, { accept: RAW_ACCEPT, what: `${path} at ${commit}`, on: { 404: () => null } });
      return answer === null ? null : answer.text();
    },

    // One commit of all the files on the head that was read: the branch is checked to stand at expectedHead, the tree is built
    // on that commit's tree, the commit's only parent is expectedHead, and the branch is moved to it only as a fast-forward —
    // GitHub refuses that with 422 when the branch moved meanwhile, and nothing is written.
    // expectedHead null: the repository's first commit, only while it has none. GitHub's Git database answers 409 until a
    // repository holds a commit, so the first file is written through the contents API, which makes that commit; the others
    // follow in one commit on it, on the same condition, and that second commit is returned (MOD-repository-hosts commitFiles).
    async commitFiles({ branch, expectedHead, files, message }) {
      const now = await branchHead(branch);
      if (now !== expectedHead) throw moved(branch, now);
      if (expectedHead === null) {
        const [first, ...others] = files.filter((f) => !f.delete);
        if (!first) throw new TypeError("a repository's first commit writes a file");
        const content = base64(first.bytes ?? new TextEncoder().encode(first.text));
        const made = await json(await call("PUT", `${repo}/contents/${encPath(first.path)}`, { body: { message, content, branch },
          on: { 422: async () => { throw moved(branch, await branchHead(branch).catch(() => null)); } } }), API);
        const head = made.commit.sha;
        if (!others.length) return { commit: head, url: made.commit.html_url ?? `${address.web}/commit/${head}` };
        return this.commitFiles({ branch, expectedHead: head, files: others, message });
      }
      const base = (await read(`${repo}/git/commits/${expectedHead}`)).tree.sha;
      const tree = [];
      for (const f of files) {
        if (f.delete) tree.push({ path: f.path, mode: "100644", type: "blob", sha: null });
        else if (f.bytes) {
          const blob = await json(await call("POST", `${repo}/git/blobs`, { body: { content: base64(f.bytes), encoding: "base64" } }), API);
          tree.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
        } else tree.push({ path: f.path, mode: "100644", type: "blob", content: f.text });
      }
      const written = await json(await call("POST", `${repo}/git/trees`, { body: { base_tree: base, tree } }), API);
      const commit = await json(await call("POST", `${repo}/git/commits`, { body: { message, tree: written.sha, parents: [expectedHead] } }), API);
      await call("PATCH", `${repo}/git/refs/${heads(branch)}`, { body: { sha: commit.sha, force: false },
        on: { 422: async () => { throw moved(branch, await branchHead(branch).catch(() => null)); } } });
      return { commit: commit.sha, url: commit.html_url ?? `${address.web}/commit/${commit.sha}` };
    },

    // Sets a tag on a commit ("Create a reference", ref: "refs/tags/<name>"). GitHub answers an existing reference's creation
    // with 422 "Reference already exists", never 409 (github.com/orgs/community/discussions/72695, read 2026-10-07): that
    // tag's current commit is then read and the call fails with TagExists, the tag never moved (A VERSION IS NOT REWRITTEN).
    async createTag(name, commit) {
      await call("POST", `${repo}/git/refs`, { body: { ref: `refs/${tagRef(name)}`, sha: commit },
        on: { 422: async (a) => {
          const said = await a.clone().json().then((j) => String(j.message ?? ""), () => "");
          if (!/reference already exists/i.test(said)) throw await refusal(a, { ...context, write: true });
          throw await tagExists(name);
        } } });
    },

    // Starts a workflow ("Create a workflow dispatch event": POST …/actions/workflows/{workflow}/dispatches, ref and inputs). The server
    // answers 200 with the run it started — workflow_run_id, run_url, html_url —, or 204 with no body where it names none: null. The run's
    // commit is not in that answer: it is "", for listCiRuns to fill. Every refusal is the host's own failure; the page documents no 422 for this call.
    async startWorkflow(workflow, ref, inputs) {
      const answer = await call("POST", `${repo}/actions/workflows/${encodeURIComponent(workflow)}/dispatches`, { body: { ref, inputs } });
      if (answer.status === 204) return null;
      const run = await json(answer, API);
      if (run?.workflow_run_id === undefined) return null;
      return { id: String(run.workflow_run_id), workflow, commit: "", event: "workflow_dispatch", state: "queued", url: run.html_url, started: null, ended: null };
    },

    // Creates a branch at a commit ("Create a reference", ref: "refs/heads/<name>"). A branch that stands already — 422
    // "Reference already exists", as for a tag — is left where it stands, never moved; any other 422 stays the failure it is.
    async createBranch(name, from) {
      await call("POST", `${repo}/git/refs`, { body: { ref: `refs/heads/${name}`, sha: from },
        on: { 422: async (a) => {
          const said = await a.clone().json().then((j) => String(j.message ?? ""), () => "");
          if (!/reference already exists/i.test(said)) throw await refusal(a, { ...context, write: true });
          return null;
        } } });
    },
  };
}
