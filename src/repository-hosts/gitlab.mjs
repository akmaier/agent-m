// The adapter for GitLab's REST API v4: one project on the GitLab server its address names, read and written with its project
// access token, sent only to that project's API on that server (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT); a public
// project is read without one.
//
// Module: MOD-repository-hosts
//
// Private to the module: index.mjs builds the host from what this returns — repositoryInfo(), snapshot(ref),
// readFile(commit, path), listTags(), commitFiles(change), createTag(name, commit) — and adds what both adapters share.

import { HostError, send, json, refusal } from "./failures.mjs";

const PAGE = 100, MAX_PAGES = 1000;
// GitLab's role Maintainer: the access level that may push to a protected default branch (A GITLAB PRODUCT USES A PROJECT
// ACCESS TOKEN); GitLab's default branch protection lets no Developer push.
const MAINTAINER = 40;

function base64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// address: a RepositoryAddress on a GitLab server; token: the project's access token, or none; tokenName: the name it was
// stored under; links: the host's WebLinks, whose Access tokens page is where the token is renewed.
export function gitlabAdapter(address, { token, tokenName }, links) {
  const host = new URL(address.origin).host;
  const api = `${address.origin}/api/v4/projects/${encodeURIComponent(address.path)}`;
  const gate = { allowed: [api], tokenAt: api, header: "PRIVATE-TOKEN", value: token || null, token };
  const context = { server: "gitlab", host, web: address.web, authenticated: Boolean(token), tokenName,
    renewal: links.projectTokens, permission: "the role Maintainer with the scope api", what: address.web };

  // One request to the project's API -> its answer when the server served it; `on` as in github.mjs.
  async function call(method, url, { body, on = {}, ...more } = {}) {
    const answer = await send(url, { method, headers: body ? { "Content-Type": "application/json" } : {},
      body: body === undefined ? undefined : JSON.stringify(body) }, gate);
    if (answer.ok) return answer;
    if (on[answer.status]) return on[answer.status](answer);
    throw await refusal(answer, { ...context, write: method !== "GET", ...more });
  }
  const read = async (url, options) => {
    const answer = await call("GET", url, options);
    return answer instanceof Response ? json(answer, address.origin) : answer;
  };
  const page = async (url, options) => {
    const answer = await call("GET", url, options);
    return { items: await json(answer, address.origin), next: answer.headers.get("x-next-page") || null };
  };
  const pull = (m) => ({ number: m.iid, title: m.title ?? "", branch: m.source_branch ?? "", base: m.target_branch ?? "", head: m.sha ?? "",
    state: ({ opened: "open", locked: "open", merged: "merged", closed: "closed" }[m.state] ?? "closed"), draft: m.draft === true,
    url: m.web_url ?? "", opened: m.created_at, merged: m.merged_at ?? null, closed: m.closed_at ?? null });
  const ci = (states) => states.some((s) => /running|pending|created|preparing|waiting/.test(s.status)) ? "running" : states.some((s) => /failed|failure/.test(s.status)) ? "failure" : states.some((s) => s.status === "success") ? "success" : "none";
  const change = (f) => ({ path: f.new_path ?? f.old_path, change: f.new_file ? "added" : f.deleted_file ? "deleted" : f.renamed_file ? "renamed" : "modified" });

  // The commit the branch stands at now, or null when there is no such branch.
  const branchHead = async (branch) =>
    (await read(`${api}/repository/branches/${encodeURIComponent(branch)}`, { on: { 404: () => null } }))?.commit?.id ?? null;
  const moved = (branch, head) => new HostError("Moved", { head },
    `${branch} has moved on${head ? ` to ${head.slice(0, 12)}` : ""} since it was read — nothing was written; read it again.`);

  // "Get a single repository tag", read after a refused creation, to name the commit the tag already stands on.
  const tagExists = async (name) => {
    const r = await read(`${api}/repository/tags/${encodeURIComponent(name)}`, { on: { 404: () => null } });
    const commit = r?.commit?.id ?? null;
    return new HostError("TagExists", { commit },
      `${name} exists already, on ${commit ? commit.slice(0, 12) : "a commit this page could not read"} — a release is never ` +
      "re-tagged (A VERSION IS NOT REWRITTEN).");
  };

  return {
    // An answer that names neither a visibility nor a default branch did not come from a GitLab server.
    async repositoryInfo() {
      const r = await read(api);
      if (!r || typeof r !== "object" || (!r.visibility && !r.default_branch)) {
        const reason = `${host} did not answer as a GitLab server`;
        throw new HostError("Unreachable", { reason }, reason);
      }
      const level = Math.max(r.permissions?.project_access?.access_level ?? 0, r.permissions?.group_access?.access_level ?? 0);
      return { defaultBranch: r.default_branch ?? null, visibility: r.visibility, canWrite: Boolean(token) && level >= MAINTAINER,
        archived: r.archived === true, description: r.description ?? "" };
    },

    // The branch, tag or commit resolved to one commit, then that commit's tree, page by page: every file, by its blob SHA.
    async snapshot(name) {
      const what = `${address.web} at ${name}`;
      const commit = (await read(`${api}/repository/commits/${encodeURIComponent(name)}`, { what })).id;
      const blobs = new Map();
      for (let page = 1; page <= MAX_PAGES; page++) {
        const items = await read(`${api}/repository/tree?ref=${commit}&recursive=true&per_page=${PAGE}&page=${page}`, { what });
        for (const e of items) if (e.type === "blob") blobs.set(e.path, e.id);
        if (items.length < PAGE) break;
      }
      return { commit, blobs };
    },

    // Every tag of the project, with the commit it points to, page by page ("List project repository tags": commit.id is the
    // commit an annotated tag is already dereferenced to; at most 100 a page, the next page named in X-Next-Page, empty on the
    // last page — a project with more tags than that is read page by page, exactly as snapshot above reads its tree).
    async listTags() {
      const tags = [];
      for (let page = 1; page <= MAX_PAGES; page++) {
        const items = await read(`${api}/repository/tags?per_page=${PAGE}&page=${page}`);
        for (const t of items) tags.push({ name: t.name, commit: t.commit.id });
        if (items.length < PAGE) break;
      }
      return tags;
    },

    async listPullRequests({ state = "all", branch } = {}) {
      if (!["open", "merged", "closed", "all"].includes(state)) throw new TypeError("state is open, merged, closed or all");
      if (branch !== undefined && (typeof branch !== "string" || !branch)) throw new TypeError("branch is a text");
      const wanted = state === "open" ? "opened" : state;
      let pageNumber = 1, next = "1", pulls = [];
      while (next && pageNumber <= MAX_PAGES) {
        const p = await page(`${api}/merge_requests?state=${wanted}&per_page=${PAGE}&page=${pageNumber}` + (branch ? `&source_branch=${encodeURIComponent(branch)}` : ""));
        pulls.push(...p.items.map(pull)); next = p.next; pageNumber = next ? Number(next) : MAX_PAGES + 1;
      }
      return pulls.filter((p) => state === "all" || p.state === state);
    },

    async pullRequestFacts(number) {
      if (!Number.isInteger(number) || number < 1) throw new TypeError("pullRequestFacts names a pull request number");
      const raw = await read(`${api}/merge_requests/${number}`), request = pull(raw), base = raw.diff_refs?.base_sha, head = raw.sha;
      const commits = await read(`${api}/merge_requests/${number}/commits`), facts = [];
      for (const c of commits) {
        const diff = await read(`${api}/repository/commits/${c.id}/diff`), states = await read(`${api}/repository/commits/${c.id}/statuses`);
        facts.push({ sha: c.id, message: c.message ?? "", files: diff.map((f) => change(f).path), ci: ci(states) });
      }
      const files = (await read(`${api}/merge_requests/${number}/changes`)).changes.map(change);
      const approval = await read(`${api}/merge_requests/${number}/approvals`);
      const reviews = (approval.approved_by ?? []).map((a) => ({ reviewer: a.user?.username ?? a.user?.name ?? "", verdict: "approved", commit: head, date: approval.approved_at ?? raw.updated_at ?? raw.created_at }));
      const pipelines = await read(`${api}/merge_requests/${number}/pipelines`), checks = [];
      for (const pipeline of pipelines.filter((p) => p.sha === head)) {
        for (const job of await read(`${api}/pipelines/${pipeline.id}/jobs`)) checks.push({ name: job.name, state: ({ success: "success", failed: "failure", running: "running", pending: "queued", canceled: "cancelled", skipped: "skipped" }[job.status] ?? "neutral"), url: job.web_url ?? "" });
      }
      return { pullRequest: request, commits: facts, files, reviews, checks, read: (path, side) => {
        if (side !== "base" && side !== "head") throw new TypeError("side is base or head");
        return this.readFile(side === "base" ? base : head, path);
      } };
    },

    // One file's text at a commit, or null where the commit does not hold it.
    async readFile(commit, path) {
      const answer = await call("GET", `${api}/repository/files/${encodeURIComponent(path)}/raw?ref=${commit}`,
        { what: `${path} at ${commit}`, on: { 404: () => null } });
      return answer === null ? null : answer.text();
    },

    // One commit of all the files, through "Create a commit with multiple files and actions". GitLab has no write that holds
    // only if the branch still stands at a commit, so: the branch is checked to stand at expectedHead before the files are
    // read, and again just before the write; each file is created where expectedHead does not hold it — GitLab refuses that
    // if the file exists by then —, and updated or deleted with `last_commit_id`, the commit that last changed it as of
    // expectedHead — GitLab refuses that if the file changed on the branch since (validate_file_status!). Each refusal is
    // Moved, and nothing is written. What remains, and what no write of GitLab's API can close: a commit that lands after the
    // last check of the head and before GitLab's own write, and touches none of these files; this one is then written on top
    // of it, without losing any change.
    async commitFiles({ branch, expectedHead, files, message }) {
      // A project without a commit is refused, with the advice to push a first commit to it (MOD-repository-hosts commitFiles).
      if (expectedHead === null) {
        throw new HostError("NotFound", { what: address.web }, `${address.web} has no commit yet — push a first commit to it, then add it here.`);
      }
      const now = await branchHead(branch);
      if (now !== expectedHead) throw moved(branch, now);
      const actions = [];
      for (const f of files) {
        const meta = await read(`${api}/repository/files/${encodeURIComponent(f.path)}?ref=${expectedHead}`, { on: { 404: () => null } });
        const content = f.bytes ? { content: base64(f.bytes), encoding: "base64" } : { content: f.text, encoding: "text" };
        if (f.delete) {
          if (meta) actions.push({ action: "delete", file_path: f.path, last_commit_id: meta.last_commit_id });
        } else if (meta) actions.push({ action: "update", file_path: f.path, ...content, last_commit_id: meta.last_commit_id });
        else actions.push({ action: "create", file_path: f.path, ...content });
      }
      // The head again, just before the write: a commit that landed while the files were read is found here, whether or not
      // it touches them.
      const last = await branchHead(branch);
      if (last !== expectedHead) throw moved(branch, last);
      const refused =/changed since you started editing|already exists|doesn't exist|does not exist/i;
      const answer = await call("POST", `${api}/repository/commits`, { body: { branch, commit_message: message, actions },
        on: { 400: async (a) => {
          const said = await a.clone().json().then((j) => String(j.message ?? j.error ?? ""), () => "");
          if (refused.test(said)) throw moved(branch, await branchHead(branch).catch(() => null));
          throw await refusal(a, { ...context, write: true });
        } } });
      const c = await json(answer, address.origin);
      return { commit: c.id, url: c.web_url ?? `${address.web}/-/commit/${c.id}` };
    },

    // Sets a tag on a commit ("Create a new tag", tag_name + ref). A GitLab server answers an existing tag's creation with 400
    // "Tag <name> already exists": that tag's current commit is then read and the call fails with TagExists, the tag never
    // moved (A VERSION IS NOT REWRITTEN).
    async createTag(name, commit) {
      await call("POST", `${api}/repository/tags`, { body: { tag_name: name, ref: commit },
        on: { 400: async (a) => {
          const said = await a.clone().json().then((j) => String(j.message ?? j.error ?? ""), () => "");
          if (!/already exists/i.test(said)) throw await refusal(a, { ...context, write: true });
          throw await tagExists(name);
        } } });
    },
  };
}
