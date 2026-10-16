// The adapter for GitHub's REST API: one repository on github.com, read and written with the person's token, sent only to
// GitHub's API for this repository; a public repository is read without one, its files from GitHub's raw host.
//
// Module: MOD-repository-hosts
//
// Private to the module: index.mjs builds the host from what this returns — repositoryInfo(), snapshot(ref),
// readFile(commit, path), history(path, { ref, limit }), listTags(), issueCounts(), commitFiles(change), createTag(name, commit),
// createBranch(name, from), startWorkflow(workflow, ref, inputs), listCiRuns(filter), cancelCiRun(id), jobLogs(id), listPullRequests(filter), openPullRequest(request), pullRequestFacts(number) — and adds what both adapters share.

import { HostError, send, json, refusal } from "./failures.mjs";

const API = "https://api.github.com", GRAPHQL = `${API}/graphql`, RAW = "https://raw.githubusercontent.com";
// GitHub's search of issues and pull requests: an address of the API outside the repository's own, which the token reaches too.
const SEARCH = `${API}/search/issues`;
const PAGE = 100, MAX_PAGES = 1000;
// Files one GraphQL query names. GitHub's documentation ("Rate limits and node limits for the GraphQL API") gives no number of
// aliased fields; it limits a call to 500,000 nodes and 10 seconds, and counts a call without connections as 1 point. 100 is
// the largest first/last the same page allows, and a query of 101 files was answered whole at a cost of 1 (ITM-479's pull request).
export const BATCH = 100;
const JSON_ACCEPT = "application/vnd.github+json", RAW_ACCEPT = "application/vnd.github.raw+json";
const encPath = (p) => p.split("/").map(encodeURIComponent).join("/");

// A file of "Get a commit" as the change the commit made to it: its status — a copy is an addition, a change of mode a
// modification —, and for a rename the path it came from. A file the commit left unchanged is no change.
const CHANGES = { added: "added", copied: "added", removed: "deleted", renamed: "renamed", modified: "modified", changed: "modified" };
const changeOf = (f) => (CHANGES[f.status]
  ? [{ path: f.filename, change: CHANGES[f.status], ...(f.status === "renamed" ? { from: f.previous_filename } : {}) }] : []);

// A review's state as the verdict (GraphQL's enum PullRequestReviewState, docs.github.com/en/graphql/reference/pulls; the REST page of the reviews names no values). PENDING, "a review
// that has not yet been submitted", is no review.
const VERDICTS = { APPROVED: "approved", CHANGES_REQUESTED: "changes requested", COMMENTED: "commented", DISMISSED: "dismissed" };

// A check run's state ("List check runs for a Git reference": status queued, in_progress, completed, waiting, requested, pending; conclusion success, failure, neutral, cancelled,
// skipped, timed_out, action_required or null — a conclusion that wants an action has not passed, so it is a failure) and a commit status's ("List commit statuses for a reference":
// pending, success, error, failure).
const CONCLUSIONS = { success: "success", failure: "failure", neutral: "neutral", cancelled: "cancelled", skipped: "skipped", timed_out: "timed out", action_required: "failure" };
const runState = (r) => (r.status === "completed" ? CONCLUSIONS[r.conclusion] ?? "neutral" : r.status === "in_progress" ? "running" : "queued");
const STATUS_STATES = { pending: "running", success: "success", error: "failure", failure: "failure" };

// A workflow run's state ("List workflow runs for a repository": status queued, in_progress, completed, waiting, requested, pending; conclusion success, failure, neutral, cancelled,
// skipped, timed_out, action_required, stale, startup_failure): waiting is waiting, in_progress running, queued, requested and pending queued; a completed run takes its conclusion — success,
// cancelled and skipped as named, every other conclusion failure. The run is a CiRun: the workflow is the file name, the last part of its path; the address is html_url, the one startWorkflow
// returns; it ends at updated_at once it is completed.
const RUN_STATUS = { waiting: "waiting", in_progress: "running" };
const RUN_CONCLUSIONS = { success: "success", cancelled: "cancelled", skipped: "skipped" };
const ciRunOf = (r) => ({ id: String(r.id), workflow: String(r.path ?? "").split("/").pop(), commit: r.head_sha, event: r.event,
  state: r.status === "completed" ? RUN_CONCLUSIONS[r.conclusion] ?? "failure" : RUN_STATUS[r.status] ?? "queued", url: r.html_url, started: r.run_started_at ?? null,
  ended: r.status === "completed" ? r.updated_at ?? null : null });

// A commit's ci from its checks: failure when any failed, was cancelled or timed out; else running when any is queued or running; else success when it has any; else none.
function ciOf(checks) {
  if (checks.some((c) => ["failure", "cancelled", "timed out"].includes(c.state))) return "failure";
  if (checks.some((c) => ["queued", "running"].includes(c.state))) return "running";
  return checks.length ? "success" : "none";
}

// A pull request of "List pull requests" / "Get a pull request" as the PullRequest: a closed one with a merged_at is merged.
const pullOf = (p) => ({ number: p.number, title: p.title, branch: p.head.ref, base: p.base.ref, head: p.head.sha, state: p.state === "open" ? "open" : p.merged_at ? "merged" : "closed",
  draft: p.draft === true, url: p.html_url, opened: p.created_at, merged: p.merged_at ?? null, closed: p.closed_at ?? null, body: p.body ?? "" });

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
  const gate = { allowed: [repo, SEARCH, GRAPHQL, `${RAW}/${address.path}`], tokenAt: [repo, SEARCH, GRAPHQL], header: "Authorization",
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

  // The files a commit changed ("Get a commit": up to 100 to a page, read page by page for a commit that changed more).
  const commitChanges = async (sha) => {
    const changes = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { files } = await read(`${repo}/commits/${sha}?per_page=${PAGE}&page=${page}`, { what: `${address.web} at ${sha}` });
      changes.push(...files.flatMap(changeOf));
      if (files.length < PAGE) break;
    }
    return changes;
  };
  // Every item of a list the server pages (at most 100 to a page), read page by page; `items` picks the list out of an answer.
  const everyPage = async (url, options = {}, items = (answer) => answer) => {
    const out = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const got = items(await read(`${url}${url.includes("?") ? "&" : "?"}per_page=${PAGE}&page=${page}`, options));
      out.push(...got);
      if (got.length < PAGE) break;
    }
    return out;
  };
  // The checks of a commit: its check runs, then the latest commit status of each context ("List commit statuses for a reference" lists the latest first).
  const checksOf = async (sha) => {
    const options = { what: `${address.web} at ${sha}` };
    const runs = await everyPage(`${repo}/commits/${sha}/check-runs`, options, (answer) => answer.check_runs);
    const statuses = await everyPage(`${repo}/commits/${sha}/statuses`, options);
    const latest = new Map();
    for (const status of statuses) if (!latest.has(status.context)) latest.set(status.context, status);
    return [...runs.map((r) => ({ name: r.name, state: runState(r), url: r.html_url })),
      ...[...latest.values()].map((c) => ({ name: c.context, state: STATUS_STATES[c.state] ?? "neutral", url: c.target_url ?? "" }))];
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
        const changes = await commitChanges(c.sha);
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

    // Many files' texts at a commit in one request of GitHub's GraphQL API ("repository.object(expression: "<commit>:<path>")" on a
    // Blob; one aliased field for each path, a call without connections costing 1 point): the token alone reaches it, so only with
    // one. -> Map(path -> text) of the files the answer gave whole; a file that is absent, binary (its text is null) or
    // truncated (isTruncated) is left out, and its own readFile reads it. At most BATCH paths. A used-up limit is told by the
    // headers of the answer, which GraphQL gives also on its 200 with the error type RATE_LIMITED.
    readFiles: token ? async (commit, paths) => {
      const query = `query($owner:String!,$name:String!){repository(owner:$owner,name:$name){${paths.map((p, i) =>
        `f${i}:object(expression:${JSON.stringify(`${commit}:${p}`)}){...on Blob{text isTruncated}}`).join(" ")}}}`;
      const [owner, name] = address.path.split("/");
      const answer = await call("POST", GRAPHQL, { body: { query, variables: { owner, name } }, write: false, permission: "Contents", what: address.web });
      const said = await json(answer, API);
      if ((said?.errors ?? []).some((e) => e?.type === "RATE_LIMITED")) {
        throw await refusal(new Response(null, { status: 403, headers: { ...Object.fromEntries(answer.headers), "x-ratelimit-remaining": "0" } }),
          { ...context, write: false });
      }
      const found = said?.data?.repository;
      const texts = new Map();
      if (!found) return texts;
      paths.forEach((p, i) => {
        const blob = found[`f${i}`];
        if (blob && typeof blob.text === "string" && !blob.isTruncated) texts.set(p, blob.text);
      });
      return texts;
    } : undefined,

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

    // The runs ("List workflow runs for a workflow" where a workflow is given, else "List workflow runs for a repository"; branch and head_sha from the filter's branch and commit; the
    // answer's workflow_runs, 100 to a page, read page by page).
    async listCiRuns({ workflow, branch, commit } = {}) {
      const query = new URLSearchParams();
      if (branch) query.set("branch", branch);
      if (commit) query.set("head_sha", commit);
      const list = workflow ? `${repo}/actions/workflows/${encodeURIComponent(workflow)}/runs` : `${repo}/actions/runs`;
      return (await everyPage(`${list}${query.size ? `?${query}` : ""}`, { permission: "Actions" }, (answer) => answer.workflow_runs)).map(ciRunOf);
    },

    // Cancels a run ("Cancel a workflow run": POST …/actions/runs/{run_id}/cancel, 202). The page documents 409 for a run that cannot be cancelled: where the run is completed already, that is
    // no failure and the call returns; for a run that is not, and for every other refusal, the host's own failure.
    async cancelCiRun(id) {
      const run = `${repo}/actions/runs/${encodeURIComponent(id)}`, options = { permission: "Actions", what: `run ${id} of ${address.web}` };
      await call("POST", `${run}/cancel`, { ...options, on: { 409: async (a) => {
        if ((await read(run, options)).status === "completed") return null;
        throw await refusal(a, { ...context, write: true, ...options });
      } } });
    },

    // The jobs of a run in the order the server lists them ("List jobs for a workflow run": the answer's jobs, page by page), each with its log ("Download job logs for a workflow run": the
    // server answers with a redirect to the log's text, which fetch follows) -> [{ name, text }] of the jobs that have one; a log answered 404 or 410 is not kept.
    async jobLogs(id) {
      const options = { permission: "Actions", what: `run ${id} of ${address.web}` };
      const logs = [];
      for (const job of await everyPage(`${repo}/actions/runs/${encodeURIComponent(id)}/jobs`, options, (answer) => answer.jobs)) {
        const answer = await call("GET", `${repo}/actions/jobs/${encodeURIComponent(job.id)}/logs`, { ...options, on: { 404: () => null, 410: () => null } });
        if (answer !== null) logs.push({ name: job.name, text: await answer.text() });
      }
      return logs;
    },

    // The pull requests ("List pull requests": state open, closed or all — a merged one is a closed one with a merged_at —, head `<owner>:<branch>`, 100 to a page, read page by page).
    async listPullRequests({ state = "all", branch } = {}) {
      const ask = state === "open" ? "open" : state === "all" ? "all" : "closed";
      const head = branch ? `&head=${encodeURIComponent(`${address.path.split("/")[0]}:${branch}`)}` : "";
      const listed = await everyPage(`${repo}/pulls?state=${ask}${head}`);
      return listed.map(pullOf).filter((p) => state === "all" || state === "open" || p.state === state);
    },

    // Opens a pull request ("Create a pull request": POST …/pulls, body title, head, base, body, draft; 201 with the pull request, read with pullOf as listPullRequests reads it). Every refusal is the host's own
    // failure: the page documents 403 and 422, a write's 404 is a missing permission (failures.mjs).
    async openPullRequest({ branch, base, title, body, draft }) {
      const made = await call("POST", `${repo}/pulls`, { body: { title, head: branch, base, body, draft: draft === true }, permission: "Pull requests", what: address.web });
      return pullOf(await json(made, API));
    },

    // Whether the branch's history holds the commit ("Compare two commits": GET …/compare/{basehead}, basehead BASE...HEAD, here the commit
    // ... the branch): behind_by counts the commits of the base the head lacks, so the branch holds the commit when it is 0 (status ahead or
    // identical). The page documents 404 and 422 for what it cannot compare, here a commit the server does not know: not contained.
    async containsCommit(branch, commit) {
      const compared = await read(`${repo}/compare/${encodeURIComponent(commit)}...${encodeURIComponent(branch)}`,
        { on: { 404: () => null, 422: () => null } });
      return compared !== null && compared.behind_by === 0;
    },

    // What a Definition-of-Done check sees of one pull request ("Get a pull request", "List commits on a pull request", "List pull requests files", "List reviews for a pull request",
    // and a commit's files and checks): the commits as the server lists them, with their parents and dates for index.mjs to order, and readFile for the two commits.
    async pullRequestFacts(number) {
      const what = `pull request #${number} of ${address.web}`;
      const pull = await read(`${repo}/pulls/${number}`, { what });
      const listed = await everyPage(`${repo}/pulls/${number}/commits`, { what });
      const commits = [];
      for (const c of listed) {
        const checks = await checksOf(c.sha);
        commits.push({ sha: c.sha, message: c.commit.message, files: (await commitChanges(c.sha)).map((change) => change.path), ci: ciOf(checks),
          parents: c.parents.map((x) => x.sha), date: c.commit.committer?.date ?? "" });
      }
      const files = (await everyPage(`${repo}/pulls/${number}/files`, { what })).flatMap((f) => changeOf(f).map(({ path, change }) => ({ path, change })));
      const reviews = (await everyPage(`${repo}/pulls/${number}/reviews`, { what })).filter((r) => VERDICTS[r.state])
        .map((r) => ({ reviewer: r.user?.login ?? "", verdict: VERDICTS[r.state], commit: r.commit_id, date: r.submitted_at }));
      return { pullRequest: pullOf(pull), baseCommit: pull.base.sha, headCommit: pull.head.sha, commits, files, reviews, checks: await checksOf(pull.head.sha),
        readFile: (commit, path) => this.readFile(commit, path) };
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
