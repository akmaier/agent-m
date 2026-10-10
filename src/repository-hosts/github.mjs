// The adapter for GitHub's REST API: one repository on github.com, read and written with the person's token, sent only to
// GitHub's API for this repository; a public repository is read without one, its files from GitHub's raw host.
//
// Module: MOD-repository-hosts
//
// Private to the module: index.mjs builds the host from what this returns — repositoryInfo(), snapshot(ref),
// readFile(commit, path), listTags(), commitFiles(change), createTag(name, commit) — and adds what both adapters share.

import { HostError, send, json, refusal } from "./failures.mjs";

const API = "https://api.github.com", RAW = "https://raw.githubusercontent.com";
const PAGE = 100, MAX_PAGES = 1000;
const JSON_ACCEPT = "application/vnd.github+json", RAW_ACCEPT = "application/vnd.github.raw+json";
const encPath = (p) => p.split("/").map(encodeURIComponent).join("/");

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
  const gate = { allowed: [repo, `${RAW}/${address.path}`], tokenAt: repo, header: "Authorization",
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
  const page = async (url, options) => {
    const answer = await call("GET", url, options);
    return { items: await json(answer, API), link: answer.headers.get("link") ?? "" };
  };
  const nextLink = (link) => /<([^>]+)>;\s*rel="?next"?/i.exec(link)?.[1] ?? null;
  const pull = (p) => ({ number: p.number, title: p.title ?? "", branch: p.head?.ref ?? "", base: p.base?.ref ?? "",
    head: p.head?.sha ?? "", state: p.state === "open" ? "open" : p.merged_at ? "merged" : "closed", draft: p.draft === true,
    url: p.html_url ?? "", opened: p.created_at, merged: p.merged_at ?? null, closed: p.closed_at ?? null });
  const ci = (runs) => runs.some((r) => r.status !== "completed") ? "running" : runs.some((r) => r.conclusion === "failure" || r.conclusion === "timed_out") ? "failure" : runs.some((r) => r.conclusion === "success") ? "success" : "none";
  const check = (r) => ({ name: r.name, state: r.status !== "completed" ? "running" : ({ success: "success", failure: "failure", neutral: "neutral", cancelled: "cancelled", skipped: "skipped", timed_out: "timed out" }[r.conclusion] ?? "failure"), url: r.details_url ?? "" });

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

    async listPullRequests({ state = "all", branch } = {}) {
      if (!["open", "merged", "closed", "all"].includes(state)) throw new TypeError("state is open, merged, closed or all");
      if (branch !== undefined && (typeof branch !== "string" || !branch)) throw new TypeError("branch is a text");
      const owner = address.path.split("/")[0];
      let url = `${repo}/pulls?state=${state === "open" ? "open" : state === "all" ? "all" : "closed"}&per_page=${PAGE}` + (branch ? `&head=${encodeURIComponent(`${owner}:${branch}`)}` : "");
      const pulls = [];
      for (let i = 0; url && i < MAX_PAGES; i += 1) {
        const p = await page(url); pulls.push(...p.items.map(pull)); url = nextLink(p.link);
      }
      return pulls.filter((p) => state === "all" || p.state === state);
    },

    async pullRequestFacts(number) {
      if (!Number.isInteger(number) || number < 1) throw new TypeError("pullRequestFacts names a pull request number");
      const raw = await read(`${repo}/pulls/${number}`), request = pull(raw), base = raw.base?.sha, head = raw.head?.sha;
      const commits = await read(`${repo}/pulls/${number}/commits?per_page=${PAGE}`);
      const facts = [];
      for (const c of commits) {
        const detail = await read(`${repo}/commits/${c.sha}`), runs = (await read(`${repo}/actions/runs?head_sha=${c.sha}&per_page=${PAGE}`)).workflow_runs ?? [];
        facts.push({ sha: c.sha, message: c.commit?.message ?? "", files: (detail.files ?? []).map((f) => f.filename), ci: ci(runs) });
      }
      const files = (await read(`${repo}/pulls/${number}/files?per_page=${PAGE}`)).map((f) => ({ path: f.filename, change: f.status }));
      const reviews = (await read(`${repo}/pulls/${number}/reviews?per_page=${PAGE}`)).map((r) => ({ reviewer: r.user?.login ?? "", verdict: ({ APPROVED: "approved", CHANGES_REQUESTED: "changes requested", COMMENTED: "commented", DISMISSED: "dismissed" }[r.state] ?? "commented"), commit: r.commit_id ?? head, date: r.submitted_at }));
      const checks = [...((await read(`${repo}/commits/${head}/check-runs?per_page=${PAGE}`)).check_runs ?? []).map(check), ...((await read(`${repo}/commits/${head}/status`)).statuses ?? []).map((s) => ({ name: s.context, state: s.state === "success" ? "success" : s.state === "pending" ? "queued" : s.state === "failure" || s.state === "error" ? "failure" : "neutral", url: s.target_url ?? "" }))];
      return { pullRequest: request, commits: facts, files, reviews, checks, read: (path, side) => {
        if (side !== "base" && side !== "head") throw new TypeError("side is base or head");
        return this.readFile(side === "base" ? base : head, path);
      } };
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
  };
}
