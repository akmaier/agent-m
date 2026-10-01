// The pull requests of a product (docs/assets/git-host/pull-requests.mjs) — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-git-host
// Guards: GITLAB PRODUCTS ARE SUPPORTED; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-032
// Level: component
//
// The servers are fakes of the APIs as their documentation states them (read 2026-10-01): GitHub's "List pull requests"
// (state open|closed|all, base, sort, direction, per_page at most 100, page; merge_commit_sha of an open pull request is the
// SHA of GitHub's test merge commit; merged_at null until merged), "Get a pull request", and "List workflow runs for a
// repository" (head_sha); GitLab's "List project merge requests" (state opened|closed|locked|merged|all, target_branch,
// order_by created_at, sort desc; no head_pipeline in the list) and "Get single MR" (head_pipeline with its status), and the
// pipeline statuses of GitLab's pipelines API. Each check was first red on the commit that held only these tests (ITM-146);
// the faults planted afterwards are recorded in docs/measurements/2026-10-01_pull-requests-on-both-hosts.md.

import test from "node:test";
import assert from "node:assert/strict";
import { parseProductAddress } from "../../docs/assets/git-host.mjs";
import { pullRequests, PAGE } from "../../docs/assets/git-host/pull-requests.mjs";
import { withFetch, GL, GL_ADDR, GL_TOKEN } from "./helpers.mjs";

const GH_TOKEN = "github_pat_11PULLSTOKEN0123456789";
const GH = parseProductAddress("https://github.com/akmaier/agent-m");
const GLP = parseProductAddress(GL_ADDR);
const GL_BASE = `/api/v4/projects/${encodeURIComponent("grp/sub/proj")}`;
const sha = (c) => c.repeat(40);

// One pull request, told once and served by both fakes in each host's own words. ci: what the head's CI says.
const SPRINT = [
  { n: 47, title: "ITM-146: pull requests", head: "team/ITM-146", base: "sprint/02", state: "open",
    opened: "2026-10-01T12:00:00Z", merged: null, merge: null, headSha: sha("1"), ci: "running",
    body: "developer-opus-c (claude-opus-5-5), start a248d8a, 2026-10-01\r\n\nThe reads." },
  { n: 46, title: "ITM-128: no test reads SPEC.md", head: "team/ITM-128", base: "sprint/02", state: "merged",
    opened: "2026-10-01T09:00:00Z", merged: "2026-10-01T11:00:00Z", merge: sha("a"), headSha: sha("2"), ci: "passed",
    body: "developer-opus-c (claude-opus-5-5), start 37ed922, 2026-10-01\n\nbody" },
  { n: 45, title: "a tried idea", head: "team/x", base: "sprint/02", state: "closed",
    opened: "2026-10-01T08:00:00Z", merged: null, merge: null, headSha: sha("3"), ci: "failed", body: "" },
  { n: 44, title: "ITM-125: grant sentence", head: "team/ITM-125", base: "sprint/02", state: "merged",
    opened: "2026-10-01T07:00:00Z", merged: "2026-10-01T07:30:00Z", merge: sha("b"), headSha: sha("4"), ci: null, body: null },
];

// What both hosts must give for them — one shape, the CI state read only by get(n).
const expected = (p, { ci = false } = {}) => ({
  number: p.n, title: p.title, head: p.head, base: p.base, state: p.state,
  openedAt: new Date(p.opened).toISOString(), mergedAt: p.merged && new Date(p.merged).toISOString(), mergeCommit: p.merge,
  participantLine: p.body ? p.body.split(/\r?\n/)[0] : null, ci: ci ? p.ci : null,
});

const ghRuns = { passed: [{ status: "completed", conclusion: "success" }],
  running: [{ status: "completed", conclusion: "success" }, { status: "in_progress", conclusion: null }],
  failed: [{ status: "completed", conclusion: "success" }, { status: "completed", conclusion: "failure" }], null: [] };
const glPipeline = { passed: { status: "success" }, running: { status: "running" }, failed: { status: "failed" }, null: null };

const asGitHub = (p) => ({ number: p.n, title: p.title, state: p.state === "open" ? "open" : "closed", body: p.body,
  created_at: p.opened, updated_at: "2026-10-01T23:00:00Z", merged_at: p.merged,
  // GitHub names its test merge commit for an open pull request: that is no merge commit.
  merge_commit_sha: p.merge ?? sha("f"), user: { login: "akmaier" },
  head: { ref: p.head, sha: p.headSha }, base: { ref: p.base } });
// GitLab writes its times with an offset; the same instant.
const offset = (iso) => iso && new Date(new Date(iso).getTime() + 2 * 3600e3).toISOString().replace("Z", "+02:00");
const asGitLab = (p) => ({ iid: p.n, title: p.title, state: { open: "opened", merged: "merged", closed: "closed" }[p.state],
  description: p.body, created_at: offset(p.opened), updated_at: "2026-10-01T23:00:00.000Z", merged_at: offset(p.merged),
  merge_commit_sha: p.merge, squash_commit_sha: null, source_branch: p.head, target_branch: p.base, sha: p.headSha,
  author: { username: "akmaier" } });

// A recorder in front of a fake GitHub: pulls (newest first), one pull, the workflow runs of a head commit.
function fakeGitHubPulls(prs) {
  const calls = [];
  const fetchMock = async (u, init = {}) => {
    const url = new URL(u), q = Object.fromEntries(url.searchParams);
    calls.push({ origin: url.origin, method: init.method, path: url.pathname, query: q, href: url.href, headers: { ...init.headers } });
    const ok = (o) => new Response(JSON.stringify(o), { status: 200 });
    if (url.origin !== "https://api.github.com") return new Response("{}", { status: 404 });
    if (url.pathname === "/repos/akmaier/agent-m/pulls") {
      const per = Number(q.per_page || 30), page = Number(q.page || 1);
      const all = prs.filter((p) => !q.base || p.base === q.base)
        .filter((p) => (q.state || "open") === "all" || (q.state === "closed" ? p.state !== "open" : p.state === "open"))
        .sort((a, b) => (q.direction === "asc" ? 1 : -1) * (Date.parse(a.opened) - Date.parse(b.opened)));
      return ok(all.slice((page - 1) * per, page * per).map(asGitHub));
    }
    const one = url.pathname.match(/^\/repos\/akmaier\/agent-m\/pulls\/(\d+)$/);
    if (one) { const p = prs.find((x) => x.n === Number(one[1])); return p ? ok(asGitHub(p)) : new Response("{}", { status: 404 }); }
    if (url.pathname === "/repos/akmaier/agent-m/actions/runs") {
      const p = prs.find((x) => x.headSha === q.head_sha);
      const runs = p ? (p.runs ?? ghRuns[p.ci]) : [];
      return ok({ total_count: runs.length, workflow_runs: runs.map((r, i) => ({ id: i + 1, head_sha: q.head_sha, ...r })) });
    }
    return new Response("{}", { status: 500 });
  };
  return { calls, fetchMock };
}

// A recorder in front of a fake GitLab server (project grp/sub/proj on GL): merge requests, and one with its head pipeline.
function fakeGitLabMRs(prs, { server = GL, project = "grp/sub/proj", raw = null } = {}) {
  const calls = [];
  const base = `/api/v4/projects/${encodeURIComponent(project)}`;
  const fetchMock = async (u, init = {}) => {
    const url = new URL(u), q = Object.fromEntries(url.searchParams);
    calls.push({ origin: url.origin, method: init.method, path: url.pathname, query: q, href: url.href, headers: { ...init.headers } });
    const ok = (o, status = 200) => new Response(JSON.stringify(o), { status });
    if (url.origin !== server || !url.pathname.startsWith(base)) return ok({ message: "404 Project Not Found" }, 404);
    const rest = url.pathname.slice(base.length);
    if (rest === "/merge_requests") {
      const per = Number(q.per_page || 20), page = Number(q.page || 1);
      const st = { opened: "open", merged: "merged", closed: "closed" };
      const all = prs.filter((p) => !q.target_branch || p.base === q.target_branch)
        .filter((p) => !q.state || q.state === "all" || st[q.state] === p.state)
        .sort((a, b) => (q.sort === "asc" ? 1 : -1) * (Date.parse(a.opened) - Date.parse(b.opened)));
      return ok(all.slice((page - 1) * per, page * per).map(raw ?? asGitLab));
    }
    const one = rest.match(/^\/merge_requests\/(\d+)$/);
    if (one) {
      const p = prs.find((x) => x.n === Number(one[1]));
      if (!p) return new Response(JSON.stringify({ message: "404 Not found" }), { status: 404 });
      return ok({ ...(raw ?? asGitLab)(p), head_pipeline: p.pipeline !== undefined ? p.pipeline : glPipeline[p.ci] });
    }
    return new Response("{}", { status: 500 });
  };
  return { calls, fetchMock };
}

// ---------------------------------------------------------------- one data shape on both hosts

test("GITLAB PRODUCTS ARE SUPPORTED — list and get give the same data on GitHub and on a GitLab server", async () => {
  const gh = fakeGitHubPulls(SPRINT), gl = fakeGitLabMRs(SPRINT);
  const ghList = await withFetch(gh.fetchMock, () => pullRequests({ product: GH, token: GH_TOKEN }).list({ base: "sprint/02" }));
  const glList = await withFetch(gl.fetchMock, () => pullRequests({ product: GLP, token: GL_TOKEN }).list({ base: "sprint/02" }));
  assert.deepEqual(ghList, SPRINT.map((p) => expected(p)), "GitHub: every pull request of the base, newest first");
  assert.deepEqual(glList, ghList, "GitLab: the same data in the same shape");
  for (const p of SPRINT) {
    const a = await withFetch(gh.fetchMock, () => pullRequests({ product: GH, token: GH_TOKEN }).get(p.n));
    const b = await withFetch(gl.fetchMock, () => pullRequests({ product: GLP, token: GL_TOKEN }).get(p.n));
    assert.deepEqual(a, expected(p, { ci: true }), `GitHub #${p.n}`);
    assert.deepEqual(b, a, `GitLab !${p.n}`);
  }
});

test("GITLAB PRODUCTS ARE SUPPORTED — counter-proof: a field the answer lacks is null, never invented", async () => {
  // A merged merge request whose answer carries no merged_at, no merge_commit_sha and no description — but an updated_at, a
  // squash commit and a title that could be taken for them — and no head pipeline.
  const bare = (p) => ({ iid: p.n, title: p.title, state: "merged", created_at: p.opened, updated_at: "2026-10-01T23:00:00Z",
    squash_commit_sha: sha("e"), source_branch: p.head, target_branch: p.base, sha: p.headSha });
  const p = { ...SPRINT[1], pipeline: null };
  const gl = fakeGitLabMRs([p], { raw: bare });
  const one = await withFetch(gl.fetchMock, () => pullRequests({ product: GLP, token: GL_TOKEN }).get(p.n));
  assert.deepEqual(one, { number: p.n, title: p.title, head: p.head, base: p.base, state: "merged",
    openedAt: new Date(p.opened).toISOString(), mergedAt: null, mergeCommit: null, participantLine: null, ci: null });
  const [listed] = await withFetch(gl.fetchMock, () => pullRequests({ product: GLP, token: GL_TOKEN }).list({}));
  assert.deepEqual(listed, one);
  // GitHub's test merge commit of an open pull request is no merge commit.
  const gh = fakeGitHubPulls([SPRINT[0]]);
  const open = await withFetch(gh.fetchMock, () => pullRequests({ product: GH, token: GH_TOKEN }).get(47));
  assert.equal(open.mergeCommit, null);
  assert.equal(open.mergedAt, null);
});

// ---------------------------------------------------------------- each token only to its own server

test("A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — the GitHub token only at api.github.com, the GitLab token only at its project's API", async () => {
  const gh = fakeGitHubPulls(SPRINT), gl = fakeGitLabMRs(SPRINT);
  await withFetch(gh.fetchMock, async () => {
    const prs = pullRequests({ product: GH, token: GH_TOKEN });
    await prs.list({ base: "sprint/02", state: "all" });
    await prs.get(46);
  });
  await withFetch(gl.fetchMock, async () => {
    const prs = pullRequests({ product: GLP, token: GL_TOKEN });
    await prs.list({ base: "sprint/02", state: "all" });
    await prs.get(46);
  });
  assert.ok(gh.calls.length >= 3 && gl.calls.length >= 2, "both servers were asked");
  for (const c of gh.calls) {
    assert.equal(c.origin, "https://api.github.com");
    assert.deepEqual(c.headers, { Authorization: `Bearer ${GH_TOKEN}` }, "the one header, built by the request helper");
  }
  for (const c of gl.calls) {
    assert.equal(c.origin, GL);
    assert.ok(c.path.startsWith(`${GL_BASE}/`), c.path);
    assert.deepEqual(c.headers, { "PRIVATE-TOKEN": GL_TOKEN });
  }
  for (const c of [...gh.calls, ...gl.calls]) {
    assert.equal(c.method, "GET", "a read only");
    assert.ok(!c.href.includes(GH_TOKEN) && !c.href.includes(GL_TOKEN), "no token in a URL");
    assert.ok(c.href.length < 400, "no text in a URL");
  }
});

test("A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT — counter-proof: a product on another GitLab server gets neither token", async () => {
  const OTHER = "https://gitlab.other.org";
  const other = parseProductAddress(`${OTHER}/team/tool`);
  const OTHER_TOKEN = "glpat-otherSERVERtoken0123456789";
  const seen = [];
  const recorder = async (u, init = {}) => {
    seen.push({ origin: new URL(u).origin, href: String(u), headers: { ...init.headers } });
    return new Response("[]", { status: 200 });
  };
  await withFetch(recorder, async () => {
    await pullRequests({ product: other, token: OTHER_TOKEN }).list({ base: "main" });
    // A token of another server, handed to this product, is refused before anything is sent.
    await assert.rejects(pullRequests({ product: other, token: GH_TOKEN }).list({}), /GitHub token|GitLab/);
    await assert.rejects(pullRequests({ product: GH, token: GL_TOKEN }).list({}), /GitLab|GitHub token/);
  });
  assert.equal(seen.length, 1, "only the one read of the other server's project");
  assert.equal(seen[0].origin, OTHER);
  assert.ok(seen[0].href.startsWith(`${OTHER}/api/v4/projects/${encodeURIComponent("team/tool")}/merge_requests?`));
  assert.deepEqual(seen[0].headers, { "PRIVATE-TOKEN": OTHER_TOKEN });
  const all = JSON.stringify(seen);
  assert.ok(!all.includes(GH_TOKEN) && !all.includes(GL_TOKEN), "neither the GitHub token nor the first GitLab product's token");
});

// ---------------------------------------------------------------- one request per page, and no more pages than the filter needs

const MANY = Array.from({ length: 250 }, (_, i) => ({ n: i + 1, title: `PR ${i + 1}`, head: `team/x-${i + 1}`, base: "sprint/02",
  state: i % 3 === 0 ? "merged" : i % 3 === 1 ? "closed" : "open",
  opened: new Date(Date.UTC(2026, 8, 1) + i * 3600e3).toISOString(), // #1 oldest, #250 newest, one an hour
  merged: i % 3 === 0 ? new Date(Date.UTC(2026, 8, 1) + i * 3600e3 + 600e3).toISOString() : null,
  merge: i % 3 === 0 ? sha("c") : null, headSha: sha("9"), ci: null, body: null }));
const openedOf = (n) => MANY[n - 1].opened;

test("UC-032 — list reads pages of 100, newest first, and stops at the page that reaches back past since", async () => {
  for (const [host, product, token, fake, listPath] of [
    ["GitHub", GH, GH_TOKEN, fakeGitHubPulls, "/repos/akmaier/agent-m/pulls"],
    ["GitLab", GLP, GL_TOKEN, fakeGitLabMRs, `${GL_BASE}/merge_requests`]]) {
    const run = async (filter) => {
      const f = fake(MANY);
      const r = await withFetch(f.fetchMock, () => pullRequests({ product, token }).list(filter));
      return { r, calls: f.calls };
    };
    // since within the newest 100: one request, and only what was opened since.
    const one = await run({ base: "sprint/02", since: openedOf(200) });
    assert.equal(one.calls.length, 1, `${host}: one page`);
    assert.deepEqual(one.r.map((p) => p.number), Array.from({ length: 51 }, (_, i) => 250 - i), `${host}: #250 down to #200`);
    // since within the second hundred: two requests.
    const two = await run({ base: "sprint/02", since: openedOf(120) });
    assert.equal(two.calls.length, 2, `${host}: two pages`);
    assert.equal(two.r.length, 131);
    // Counter-proof: without since it reads to the end — three pages for 250.
    const all = await run({ base: "sprint/02" });
    assert.equal(all.calls.length, 3, `${host}: to the end`);
    assert.equal(all.r.length, 250);
    for (const c of [...one.calls, ...two.calls, ...all.calls]) {
      assert.equal(c.path, listPath);
      assert.equal(c.query.per_page, String(PAGE));
    }
    assert.equal(PAGE, 100);
    assert.deepEqual(all.calls.map((c) => c.query.page), ["1", "2", "3"]);
    const q = all.calls[0].query;
    if (host === "GitHub") assert.deepEqual([q.base, q.state, q.sort, q.direction], ["sprint/02", "all", "created", "desc"]);
    else assert.deepEqual([q.target_branch, q.state, q.order_by, q.sort], ["sprint/02", "all", "created_at", "desc"]);
  }
});

test("UC-032 — the state filter: open, merged, closed, all — merged told from closed on GitHub by merged_at", async () => {
  for (const [product, token, fake] of [[GH, GH_TOKEN, fakeGitHubPulls], [GLP, GL_TOKEN, fakeGitLabMRs]]) {
    for (const state of ["open", "merged", "closed", "all"]) {
      const f = fake(MANY);
      const r = await withFetch(f.fetchMock, () => pullRequests({ product, token }).list({ base: "sprint/02", state }));
      const want = MANY.filter((p) => state === "all" || p.state === state).map((p) => p.n).reverse();
      assert.deepEqual(r.map((p) => p.number), want, `${product.host} ${state}`);
      assert.ok(r.every((p) => state === "all" || p.state === state));
      assert.ok(f.calls.length <= 3, "still one request per page");
    }
  }
  // GitHub knows no state "merged": it is asked for the closed ones.
  const f = fakeGitHubPulls(MANY);
  await withFetch(f.fetchMock, () => pullRequests({ product: GH, token: GH_TOKEN }).list({ state: "merged" }));
  assert.ok(f.calls.every((c) => c.query.state === "closed"));
});

test("UC-032 — get(n) costs one request on GitLab and two on GitHub, the second for the workflow runs of the head commit", async () => {
  const gh = fakeGitHubPulls(SPRINT), gl = fakeGitLabMRs(SPRINT);
  await withFetch(gh.fetchMock, () => pullRequests({ product: GH, token: GH_TOKEN }).get(46));
  await withFetch(gl.fetchMock, () => pullRequests({ product: GLP, token: GL_TOKEN }).get(46));
  assert.deepEqual(gh.calls.map((c) => c.path), ["/repos/akmaier/agent-m/pulls/46", "/repos/akmaier/agent-m/actions/runs"]);
  assert.equal(gh.calls[1].query.head_sha, sha("2"));
  assert.deepEqual(gl.calls.map((c) => c.path), [`${GL_BASE}/merge_requests/46`]);
  // A list reads no CI at all.
  const l = fakeGitHubPulls(SPRINT);
  await withFetch(l.fetchMock, () => pullRequests({ product: GH, token: GH_TOKEN }).list({ base: "sprint/02" }));
  assert.equal(l.calls.length, 1);
});

test("UC-032 — the CI state of the head: running, passed, failed, cancelled, or null where the server names none", async () => {
  const base = { ...SPRINT[0] };
  const gh = [
    [[{ status: "queued", conclusion: null }], "running"], [[{ status: "completed", conclusion: "action_required" }], "running"],
    [[{ status: "completed", conclusion: "success" }, { status: "completed", conclusion: "skipped" }], "passed"],
    [[{ status: "completed", conclusion: "timed_out" }], "failed"], [[{ status: "completed", conclusion: "startup_failure" }], "failed"],
    [[{ status: "completed", conclusion: "cancelled" }, { status: "completed", conclusion: "success" }], "cancelled"],
    [[{ status: "completed", conclusion: "failure" }, { status: "waiting", conclusion: null }], "running"],
    [[{ status: "completed", conclusion: "skipped" }, { status: "completed", conclusion: "neutral" }], null], [[], null]];
  for (const [runs, want] of gh) {
    const f = fakeGitHubPulls([{ ...base, runs }]);
    const r = await withFetch(f.fetchMock, () => pullRequests({ product: GH, token: GH_TOKEN }).get(base.n));
    assert.equal(r.ci, want, JSON.stringify(runs));
  }
  const gl = [["success", "passed"], ["failed", "failed"], ["running", "running"], ["pending", "running"], ["created", "running"],
    ["waiting_for_resource", "running"], ["preparing", "running"], ["waiting_for_callback", "running"], ["scheduled", "running"],
    ["manual", "running"], ["canceling", "cancelled"], ["canceled", "cancelled"], ["skipped", null]];
  for (const [status, want] of gl) {
    const f = fakeGitLabMRs([{ ...base, pipeline: { id: 1, status } }]);
    const r = await withFetch(f.fetchMock, () => pullRequests({ product: GLP, token: GL_TOKEN }).get(base.n));
    assert.equal(r.ci, want, status);
  }
});

test("a filter or a number that is not one is refused before anything is sent", async () => {
  const f = fakeGitHubPulls(SPRINT);
  await withFetch(f.fetchMock, async () => {
    const prs = pullRequests({ product: GH, token: GH_TOKEN });
    await assert.rejects(prs.list({ state: "opened" }), /state/);
    await assert.rejects(prs.list({ since: "not a date" }), /since/);
    for (const n of [0, -1, 1.5, "46/../../x", "46", NaN]) await assert.rejects(prs.get(n), /number/, String(n));
  });
  assert.equal(f.calls.length, 0);
  assert.throws(() => pullRequests({ product: { repo: "a/b" }, token: null }), /product/);
});

test("a read needs no token: a public repository's pull requests are read without one, and no header is sent", async () => {
  const gh = fakeGitHubPulls(SPRINT), gl = fakeGitLabMRs(SPRINT);
  await withFetch(gh.fetchMock, () => pullRequests({ product: GH, token: null }).list({ base: "sprint/02" }));
  await withFetch(gl.fetchMock, () => pullRequests({ product: GLP }).list({ base: "sprint/02" }));
  assert.deepEqual([...gh.calls, ...gl.calls].map((c) => c.headers), [{}, {}]);
});
