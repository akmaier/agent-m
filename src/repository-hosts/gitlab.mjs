// The adapter for GitLab's REST API v4: one project on the GitLab server its address names, read and written with its project
// access token, sent only to that project's API on that server (A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT); a public
// project is read without one.
//
// Module: MOD-repository-hosts
//
// Private to the module: index.mjs builds the host from what this returns — repositoryInfo(), snapshot(ref),
// readFile(commit, path), history(path, { ref, limit }), listTags(), issueCounts(), commitFiles(change), createTag(name, commit),
// createBranch(name, from), startWorkflow(workflow, ref, inputs), listPullRequests(filter), pullRequestFacts(number) — and adds what both adapters share.

import { HostError, send, json, refusal } from "./failures.mjs";

const PAGE = 100, MAX_PAGES = 1000;
// GitLab's role Maintainer: the access level that may push to a protected default branch (A GITLAB PRODUCT USES A PROJECT
// ACCESS TOKEN); GitLab's default branch protection lets no Developer push.
const MAINTAINER = 40;

// A pipeline's status as the run's state ("Create a new pipeline" answers the pipeline: its status, among GitLab's others).
const STATES = { created: "queued", waiting_for_resource: "queued", preparing: "queued", pending: "queued", scheduled: "queued", running: "running",
  manual: "waiting", success: "success", failed: "failure", canceled: "cancelled", canceling: "cancelled", skipped: "skipped" };

// A job's state ("List all jobs by pipeline": created, pending, preparing, waiting_for_resource, waiting_for_callback, scheduled, manual, running, success, failed, canceled, canceling,
// skipped) and a commit's ci from its newest pipeline's status (those of "List project pipelines"): a pipeline that failed or was cancelled failed, a skipped one says nothing.
const JOB_STATES = { running: "running", success: "success", failed: "failure", canceled: "cancelled", canceling: "cancelled", skipped: "skipped" };
const jobState = (status) => JOB_STATES[status] ?? "queued";
const PIPELINE_CI = { success: "success", failed: "failure", canceled: "failure", canceling: "failure", skipped: "none" };
// A merge request ("List project merge requests"): locked, one being merged, is still open.
const MR_STATES = { opened: "open", locked: "open", merged: "merged", closed: "closed" };
const pullOf = (m) => ({ number: m.iid, title: m.title, branch: m.source_branch, base: m.target_branch, head: m.sha, state: MR_STATES[m.state] ?? "closed", draft: m.draft === true,
  url: m.web_url, opened: m.created_at, merged: m.merged_at ?? null, closed: m.closed_at ?? null });

// An entry of the diff of a commit as the change the commit made to the file: added, deleted, renamed — with the path it came
// from — or modified.
const changeOf = (d) => (d.new_file ? { path: d.new_path, change: "added" }
  : d.deleted_file ? { path: d.old_path, change: "deleted" }
    : d.renamed_file ? { path: d.new_path, change: "renamed", from: d.old_path } : { path: d.new_path, change: "modified" });

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

  // The files a commit changed (the diff of a commit, up to 100 to a page, read page by page).
  const commitChanges = async (sha) => {
    const changes = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const diffs = await read(`${api}/repository/commits/${sha}/diff?per_page=${PAGE}&page=${page}`, { what: `${address.web} at ${sha}` });
      changes.push(...diffs.map(changeOf));
      if (diffs.length < PAGE) break;
    }
    return changes;
  };
  // Every item of a list the server pages (100 to a page), read page by page; a page that brings nothing new ends the list, for an endpoint that takes no page.
  const everyPage = async (url, options = {}, key = (item) => JSON.stringify(item)) => {
    const out = [], known = new Set();
    for (let page = 1; page <= MAX_PAGES; page++) {
      const got = (await read(`${url}${url.includes("?") ? "&" : "?"}per_page=${PAGE}&page=${page}`, options)).filter((item) => !known.has(key(item)));
      for (const item of got) known.add(key(item));
      out.push(...got);
      if (got.length < PAGE) break;
    }
    return out;
  };
  // The newest pipeline of a commit ("List project pipelines": sha, order_by id, sort desc), or null.
  const pipelineOf = async (sha) => (await read(`${api}/pipelines?sha=${sha}&order_by=id&sort=desc&per_page=1`, { what: `${address.web} at ${sha}` }))[0] ?? null;

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

    // The numbers of open and closed issues, from the project's issue statistics ("Retrieve issues statistics for a project":
    // counts.opened and counts.closed). They count issues alone: a merge request is no issue. A public project serves them
    // without a token.
    async issueCounts() {
      const { counts } = (await read(`${api}/issues_statistics`)).statistics;
      return { open: counts.opened, closed: counts.closed };
    },

    // The commits that changed a path — the project where the path is null —, newest first, from `ref` (the default branch where
    // none is given), at most `limit` of them (all where none is given), each with the files it changed. "List repository
    // commits" (ref_name, path, follow, per_page up to 100, page) names the commits, page by page; the diff of a commit gives
    // its files, up to 100 to a page, read page by page for a commit that changed more. A server of GitLab 18.10 or later
    // follows a file across a rename unless `follow` is false: the commits asked for are those of the path itself, as GitHub's
    // `path` gives them. A commit's author is named by name and e-mail, not by account: the entry's account is null.
    async history(path, { ref, limit } = {}) {
      const what = ref ? `${address.web} at ${ref}` : address.web;
      const per = limit === undefined ? PAGE : Math.max(1, Math.min(PAGE, limit));
      const query = `per_page=${per}${ref ? `&ref_name=${encodeURIComponent(ref)}` : ""}${path ? `&path=${encodeURIComponent(path)}&follow=false` : ""}`;
      const listed = [];
      for (let page = 1; page <= MAX_PAGES && (limit === undefined || listed.length < limit); page++) {
        const items = await read(`${api}/repository/commits?${query}&page=${page}`, { what });
        listed.push(...items);
        if (items.length < per) break;
      }
      const entries = [];
      for (const c of limit === undefined ? listed : listed.slice(0, limit)) {
        const changes = await commitChanges(c.id);
        entries.push({ commit: c.id, parents: c.parent_ids, author: { account: null, name: c.author_name },
          date: c.committed_date, message: c.message, changes });
      }
      return entries;
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

    // Starts a pipeline ("Create a new pipeline": POST …/pipeline, ref and inputs in the JSON body). The answer is the pipeline, which is the run: its
    // sha the commit, its source — "api" where the answer names none — the event, its status the state, its web_url the address.
    async startWorkflow(workflow, ref, inputs) {
      const p = await json(await call("POST", `${api}/pipeline`, { body: { ref, inputs } }), address.origin);
      return { id: String(p.id), workflow, commit: p.sha, event: p.source ?? "api", state: STATES[p.status] ?? "queued", url: p.web_url,
        started: p.started_at ?? null, ended: p.finished_at ?? null };
    },

    // The merge requests ("List project merge requests": state opened, closed, merged or all, source_branch, 100 to a page, read page by page).
    async listPullRequests({ state = "all", branch } = {}) {
      const ask = state === "open" ? "opened" : state;
      const listed = await everyPage(`${api}/merge_requests?state=${ask}${branch ? `&source_branch=${encodeURIComponent(branch)}` : ""}`, {}, (m) => m.iid);
      return listed.map(pullOf).filter((p) => state === "all" || p.state === state);
    },

    // What a Definition-of-Done check sees of one merge request (the merge request, its commits, diffs and approvals, and for a commit its files and newest pipeline, for the head the
    // jobs of that pipeline). The approvals carry no commit: each is given on the merge request's head commit. See github.mjs.
    async pullRequestFacts(number) {
      const what = `merge request !${number} of ${address.web}`;
      const mr = await read(`${api}/merge_requests/${number}`, { what });
      const listed = await everyPage(`${api}/merge_requests/${number}/commits`, { what }, (c) => c.id);
      const commits = [];
      for (const c of listed) {
        const pipeline = await pipelineOf(c.id);
        commits.push({ sha: c.id, message: c.message, files: (await commitChanges(c.id)).map((change) => change.path), ci: pipeline ? PIPELINE_CI[pipeline.status] ?? "running" : "none",
          parents: c.parent_ids ?? [], date: c.committed_date ?? c.created_at ?? "" });
      }
      const files = (await everyPage(`${api}/merge_requests/${number}/diffs`, { what }, (d) => `${d.old_path}>${d.new_path}`)).map((d) => { const { path, change } = changeOf(d); return { path, change }; });
      const approvals = await read(`${api}/merge_requests/${number}/approvals`, { what });
      const reviews = (approvals.approved_by ?? []).map((a) => ({ reviewer: a.user?.username ?? "", verdict: "approved", commit: mr.sha, date: a.approved_at }));
      const head = await pipelineOf(mr.sha);
      const checks = head ? (await everyPage(`${api}/pipelines/${head.id}/jobs`, { what }, (j) => j.id ?? j.name)).map((j) => ({ name: j.name, state: jobState(j.status), url: j.web_url })) : [];
      return { pullRequest: pullOf(mr), baseCommit: mr.diff_refs?.base_sha ?? null, headCommit: mr.sha, commits, files, reviews, checks,
        readFile: (commit, path) => this.readFile(commit, path) };
    },

    // Creates a branch at a commit ("Create repository branch"). A branch that stands already — 400 "Branch already exists" —
    // is left where it stands, never moved; any other 400 stays the failure it is.
    async createBranch(name, from) {
      await call("POST", `${api}/repository/branches`, { body: { branch: name, ref: from },
        on: { 400: async (a) => {
          const said = await a.clone().json().then((j) => String(j.message ?? j.error ?? ""), () => "");
          if (!/already exists/i.test(said)) throw await refusal(a, { ...context, write: true });
          return null;
        } } });
    },
  };
}
