// Release tests of sprint 02, strand C — the pull requests of a product, read on both hosts (ITM-146, tested by ITM-144). Written by
// tester-opus (claude-opus-5-5), the Release tester of docs/process.md, who implemented none of the strand's items, from the SPEC
// rules and the use-case step they realise; started on sprint/02 at a7b4b9f, 2026-10-01.
//
// Module: MOD-git-host
// Guards: GITLAB PRODUCTS ARE SUPPORTED; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CREDENTIAL IS NEVER PLACED IN A URL; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-032
// Level: release
//
// UC-032 step 1 derives an item's state from the product's pull requests — *in progress* while one is open, *done* once one is
// merged —, on GitHub and on a GitLab server alike. The servers are fakes in this file that answer as GitHub's REST API ("List
// pull requests": state open|closed|all, base, sort, direction, per_page, page; a closed pull request carries merged_at when it
// was merged) and GitLab's API v4 ("List project merge requests": state opened|closed|merged|all, target_branch, order_by,
// sort, per_page, page; iid, source_branch, target_branch, description) are documented to answer. No request leaves the process.

import test from "node:test";
import assert from "node:assert/strict";
import { pullRequests } from "../docs/assets/git-host/pull-requests.mjs";
import { parseProductAddress } from "../docs/assets/git-host.mjs";

const GH = parseProductAddress("https://github.com/alice/thesis-tool");
const GL = parseProductAddress("https://gitlab.example.org/team/thesis-tool");
const GH_TOKEN = "github_pat_ALICE0123456789abcdefghijklmn";
const GL_TOKEN = "glpat-TEAMPROJECT0123456789xyz";
const GL_API = "https://gitlab.example.org/api/v4/projects/team%2Fthesis-tool";

// One pull request as both hosts keep it. n: its number; at: when it was opened; state: open, merged or closed.
const pr = (n, at, state, base = "sprint/02", body = `tester-opus (claude-opus-5-5), ITM-${n}\n\nmore`) =>
  ({ n, at: new Date(at).toISOString(), state, base, head: `team/ITM-${n}`, body, title: `ITM-${n}: title ${n}`,
    mergedAt: state === "merged" ? new Date(new Date(at).getTime() + 3600e3).toISOString() : null,
    mergeSha: state === "merged" ? String(n).padStart(40, "a") : null });

const asGitHub = (p) => ({ number: p.n, title: p.title, state: p.state === "open" ? "open" : "closed", created_at: p.at,
  merged_at: p.mergedAt, merge_commit_sha: p.mergeSha ?? "f".repeat(40), body: p.body,
  head: { ref: p.head, sha: `${p.n}`.padStart(40, "b") }, base: { ref: p.base } });
const asGitLab = (p) => ({ iid: p.n, title: p.title, state: p.state === "open" ? "opened" : p.state, created_at: p.at,
  merged_at: p.mergedAt, merge_commit_sha: p.mergeSha, description: p.body, source_branch: p.head, target_branch: p.base });

// A fake of both servers; every request recorded with its method, address and every header.
function servers({ github = [], gitlab = [], runs = {}, pipelines = {} } = {}) {
  const requests = [];
  globalThis.fetch = async (u, init = {}) => {
    const url = new URL(String(u)), method = (init.method || "GET").toUpperCase();
    const headers = Object.fromEntries(Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
    requests.push({ method, url: url.href, origin: url.origin, path: url.pathname, query: url.searchParams, headers });
    const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });
    const q = url.searchParams, page = Number(q.get("page") || 1), per = Number(q.get("per_page") || 30);
    const pageOf = (xs) => xs.slice((page - 1) * per, page * per);
    const newest = (xs, asc) => [...xs].sort((a, b) => (asc ? 1 : -1) * (Date.parse(a.at) - Date.parse(b.at)));
    if (url.origin === "https://api.github.com" && url.pathname === "/repos/alice/thesis-tool/pulls") {
      const st = q.get("state") || "open";
      const xs = github.filter((p) => (st === "all" || (st === "open") === (p.state === "open")) && (!q.get("base") || p.base === q.get("base")));
      return json(pageOf(newest(xs, q.get("direction") === "asc")).map(asGitHub));
    }
    let m = /^\/repos\/alice\/thesis-tool\/pulls\/(\d+)$/.exec(url.pathname);
    if (url.origin === "https://api.github.com" && m) {
      const p = github.find((x) => x.n === Number(m[1]));
      return p ? json(asGitHub(p)) : json({ message: "Not Found" }, 404);
    }
    if (url.origin === "https://api.github.com" && url.pathname === "/repos/alice/thesis-tool/actions/runs") {
      return json({ workflow_runs: runs[q.get("head_sha")] ?? [] });
    }
    if (url.origin === "https://gitlab.example.org" && url.pathname === "/api/v4/projects/team%2Fthesis-tool/merge_requests") {
      const st = q.get("state") || "all";
      const xs = gitlab.filter((p) => (st === "all" || asGitLab(p).state === st) && (!q.get("target_branch") || p.base === q.get("target_branch")));
      return json(pageOf(newest(xs, q.get("sort") === "asc")).map(asGitLab));
    }
    m = /^\/api\/v4\/projects\/team%2Fthesis-tool\/merge_requests\/(\d+)$/.exec(url.pathname);
    if (url.origin === "https://gitlab.example.org" && m) {
      const p = gitlab.find((x) => x.n === Number(m[1]));
      return p ? json({ ...asGitLab(p), head_pipeline: pipelines[p.n] ? { status: pipelines[p.n] } : null }) : json({ message: "404" }, 404);
    }
    return json({ message: "Not Found" }, 404);
  };
  return requests;
}

const THREE = [pr(41, "2026-10-01T08:00:00Z", "open"), pr(40, "2026-09-30T08:00:00Z", "merged"), pr(39, "2026-09-29T08:00:00Z", "closed")];

// GITLAB PRODUCTS ARE SUPPORTED — "reads and writes products on any GitLab server": the same reads give the same data. Expected:
// the same three pull requests, newest first, in one shape — number, title, head and base branch, state open/merged/closed,
// opened and merged at in UTC, the merge commit of the merged one only, the participant line the body opens with, no CI in a
// list — identical on GitHub and on GitLab; and get(n) of the merged one, with a failed run of its head, identical too.
test("release · pull requests: GitHub and GitLab give the same pull requests in one shape", async () => {
  const runs = { [`40`.padStart(40, "b")]: [{ status: "completed", conclusion: "failure" }] };
  servers({ github: THREE, gitlab: THREE, runs, pipelines: { 40: "failed" } });
  const gh = await pullRequests({ product: GH, token: GH_TOKEN }).list();
  const gl = await pullRequests({ product: GL, token: GL_TOKEN }).list();
  const expected = THREE.map((p) => ({ number: p.n, title: p.title, head: p.head, base: p.base, state: p.state, openedAt: p.at,
    mergedAt: p.mergedAt, mergeCommit: p.mergeSha, participantLine: `tester-opus (claude-opus-5-5), ITM-${p.n}`, ci: null }));
  assert.deepEqual(gh, expected, "GitHub");
  assert.deepEqual(gl, expected, "GitLab");
  const one = await pullRequests({ product: GH, token: GH_TOKEN }).get(40);
  assert.deepEqual(one, { ...expected[1], ci: "failed" });
  assert.deepEqual(await pullRequests({ product: GL, token: GL_TOKEN }).get(40), one);
});

// GITLAB PRODUCTS ARE SUPPORTED — a field GitLab's answer does not carry is not made up from another one. Expected: a merged
// merge request without merge_commit_sha (merged by fast-forward, its squash commit named) has mergeCommit null; one without a
// description has participantLine null; one without a head pipeline has ci null.
test("release · pull requests: a field the GitLab answer lacks is null, never taken from another field", async () => {
  const p = { ...pr(7, "2026-09-30T10:00:00Z", "merged"), mergeSha: null };
  servers({ gitlab: [{ ...p, body: null }] });
  globalThis.fetch = ((orig) => async (u, i) => {
    const r = await orig(u, i), body = await r.json();
    const strip = (m) => { const { merge_commit_sha, description, ...rest } = m; return { ...rest, squash_commit_sha: "c".repeat(40) }; };
    return new Response(JSON.stringify(Array.isArray(body) ? body.map(strip) : strip(body)), { status: r.status });
  })(globalThis.fetch);
  const [listed] = await pullRequests({ product: GL, token: GL_TOKEN }).list();
  assert.equal(listed.state, "merged");
  assert.equal(listed.mergeCommit, null);
  assert.equal(listed.participantLine, null);
  assert.equal((await pullRequests({ product: GL, token: GL_TOKEN }).get(7)).ci, null);
});

// UC-032 step 1 — *in progress*: a pull request is open; *done*: one is merged; a closed, unmerged one is neither. Expected, on
// both hosts: asking for open gives the open one only, for merged the merged one only, for closed the closed-unmerged one only,
// and asking for a base branch gives only the pull requests into it.
test("release · pull requests: open, merged and closed are told apart on both hosts, and a base branch is kept to", async () => {
  const xs = [...THREE, pr(38, "2026-09-28T08:00:00Z", "merged", "main")];
  servers({ github: xs, gitlab: xs });
  for (const product of [GH, GL]) {
    const reads = pullRequests({ product, token: product === GH ? GH_TOKEN : GL_TOKEN });
    assert.deepEqual((await reads.list({ state: "open" })).map((p) => p.number), [41], `${product.host} open`);
    assert.deepEqual((await reads.list({ state: "merged" })).map((p) => p.number), [40, 38], `${product.host} merged`);
    assert.deepEqual((await reads.list({ state: "closed" })).map((p) => p.number), [39], `${product.host} closed`);
    assert.deepEqual((await reads.list({ base: "sprint/02", state: "merged" })).map((p) => p.number), [40], `${product.host} base`);
  }
});

// A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT · A CREDENTIAL IS NEVER PLACED IN A URL · no write. Expected: every request of
// a GitHub product goes to api.github.com and carries the GitHub token and nothing of the GitLab token; every request of the
// GitLab product goes to its project's API on its own server and carries its token and nothing of the GitHub token; no address
// holds a token; every request is a GET. Counter-proofs: the GitHub token handed to the GitLab product, or the GitLab token to
// the GitHub product, reaches no server at all; a public product read without a token sends no authorisation.
test("release · pull requests: each token is seen only at its own server, never in a URL, and nothing is written", async () => {
  const requests = servers({ github: THREE, gitlab: THREE, pipelines: { 40: "success" } });
  const gh = pullRequests({ product: GH, token: GH_TOKEN }), gl = pullRequests({ product: GL, token: GL_TOKEN });
  await gh.list(); await gh.get(40); await gl.list(); await gl.get(40);
  const carries = (r, token) => r.url.includes(token) || Object.values(r.headers).some((v) => v.includes(token));
  const toGitHub = requests.filter((r) => r.origin === "https://api.github.com");
  const toGitLab = requests.filter((r) => r.origin === "https://gitlab.example.org");
  assert.equal(toGitHub.length + toGitLab.length, requests.length, "no other server");
  assert.ok(toGitHub.length >= 2 && toGitLab.length >= 2, "both servers were read");
  for (const r of toGitHub) {
    assert.ok(Object.values(r.headers).some((v) => v.includes(GH_TOKEN)), `GitHub token at ${r.url}`);
    assert.ok(!carries(r, GL_TOKEN), `no GitLab token at ${r.url}`);
  }
  for (const r of toGitLab) {
    assert.ok(r.url.startsWith(GL_API), `the project's own API: ${r.url}`);
    assert.ok(Object.values(r.headers).some((v) => v.includes(GL_TOKEN)), `GitLab token at ${r.url}`);
    assert.ok(!carries(r, GH_TOKEN), `no GitHub token at ${r.url}`);
  }
  for (const r of requests) {
    assert.equal(r.method, "GET", r.url);
    assert.ok(!r.url.includes(GH_TOKEN) && !r.url.includes(GL_TOKEN), `no token in ${r.url}`);
  }
  for (const [product, foreign] of [[GL, GH_TOKEN], [GH, GL_TOKEN]]) {
    const seen = servers({ github: THREE, gitlab: THREE });
    for (const read of [() => pullRequests({ product, token: foreign }).list(), () => pullRequests({ product, token: foreign }).get(40)]) {
      try { await read(); } catch { /* refusing is one way not to send it */ }
    }
    assert.deepEqual(seen.filter((r) => carries(r, foreign)).map((r) => r.url), [], `${product.host}: the other host's token is sent nowhere`);
  }
  const open = servers({ github: THREE, gitlab: THREE });
  await pullRequests({ product: GH }).list(); await pullRequests({ product: GL }).list();
  assert.deepEqual(open.filter((r) => r.headers.authorization || r.headers["private-token"]).map((r) => r.url), [], "no token, no authorisation");
});

// PROGRESS AND JOB STATE ARE DERIVED, NOT STORED, at a cost a load can bear: "the list stopping at the date the filter names"
// (ITM-144). 250 pull requests, one opened every hour, newest first, in pages of 100. Expected, on both hosts: with `since` at
// #120, exactly #250 … #120 come back, newest first, and no page is read beyond the one that reaches back before #120 — page 3
// is never asked for; with `since` after the newest, one page and nothing; without `since`, all 250 from three pages.
test("release · pull requests: a list with a date reads only as far back as that date", async () => {
  const xs = Array.from({ length: 250 }, (_, i) => pr(i + 1, Date.parse("2026-09-01T00:00:00Z") + (i + 1) * 3600e3, i % 3 ? "merged" : "open"));
  const since = xs[119].at;
  for (const product of [GH, GL]) {
    const token = product === GH ? GH_TOKEN : GL_TOKEN;
    const pages = (rs) => rs.filter((r) => /\/(pulls|merge_requests)$/.test(r.path)).map((r) => Number(r.query.get("page")));
    let rs = servers({ github: xs, gitlab: xs });
    const got = await pullRequests({ product, token }).list({ since });
    assert.deepEqual(got.map((p) => p.number), Array.from({ length: 131 }, (_, i) => 250 - i), `${product.host}: #250 … #120`);
    assert.ok(!pages(rs).includes(3), `${product.host}: page 3 not read (${pages(rs)})`);
    rs = servers({ github: xs, gitlab: xs });
    assert.deepEqual(await pullRequests({ product, token }).list({ since: "2026-12-01T00:00:00Z" }), []);
    assert.deepEqual(pages(rs), [1], `${product.host}: one page when nothing is that new`);
    rs = servers({ github: xs, gitlab: xs });
    assert.equal((await pullRequests({ product, token }).list()).length, 250);
    assert.deepEqual(pages(rs), [1, 2, 3], `${product.host}: without a date, to the end`);
  }
});
