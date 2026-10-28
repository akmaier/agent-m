// MOD-repository-hosts' listPullRequests asks the pages of a listing at once (ITM-1252), as the accepted text of docs/architecture/MOD-repository-hosts.md states it:
// "listPullRequests(filter: { state?: "open" | "merged" | "closed" | "all", branch?: string, updatedSince?: string }) -> Promise<PullRequest[]> — with `updatedSince`, a date, only
// the pull requests last updated on or after it. The pages of a listing are asked for at once, once the server has said how many there are, never one after the other."
// Deterministic, no network: the servers are fakes of `fetch` that answer as the real APIs document, and that count how many requests are in flight at once —
//   GitHub — docs.github.com/en/rest/pulls/pulls "List pull requests" (state open | closed | all, sort created | updated, direction asc | desc, per_page up to 100, page; the
//     `Link` response header names the next and the last page, rel="next" and rel="last", docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api);
//     docs.github.com/en/rest/search/search "Search issues and pull requests" (q with repo:, is:pr, is:closed, updated:>=YYYY-MM-DD; total_count).
//   GitLab — docs.gitlab.com/api/merge_requests/ "List project merge requests" (state, updated_after — "Return merge requests updated on or after the given time", ISO 8601 —,
//     per_page, page) and docs.gitlab.com/api/rest/#pagination-link-header (X-Total-Pages, X-Next-Page).
// Run: node --test tests/repository-hosts-pull-request-pages.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-035; UC-032; A PAGE LOAD READS THE REPOSITORY IN BATCHES; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit
//
// Where the texts leave a reading open, the test states the one it takes: the pull requests come in the order the server lists them, page after page; a pull request is
// "updated on or after" a date when the server's updated_at is not before that date's midnight in UTC; on GitHub, a listing bounded by `updatedSince` lists no
// `state=all` (the item ITM-1252) and asks no page of closed pull requests unsorted by their update; on GitLab, every request of such a listing carries the bound,
// `updated_after`. Each test states its input and its expected result before it runs (given / input / expect). Counter-proof, recorded in the commit: the `everyPage`
// of today, which asks page 2 only once page 1 has come, keeps one request in flight and fails the first case of each server.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const GH_TOKEN = "github_pat_CAROLsprintTOOL0123456789abcdef";
const GL_TOKEN = "glpat-SPACEsprintTOOLvalue0123456789";
const GITHUB = parseAddress("https://github.com/carol/sprint-tool");
const GITLAB = parseAddress("https://gitlab.example.org/space/sprint-tool");
const GH = "/repos/carol/sprint-tool";
const GL = "/api/v4/projects/space%2Fsprint-tool";
const SINCE = "2026-10-20";

const json = (body, headers = {}) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json", ...headers } });

// A fake server: `answer(url)` gives the Response; every request is recorded with the number of requests in flight when it was sent, and the most in flight at once is kept.
async function serving(answer, run) {
  const requests = [], real = globalThis.fetch;
  let inFlight = 0, most = 0;
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    inFlight += 1;
    most = Math.max(most, inFlight);
    requests.push({ url, inFlight });
    try {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return answer(url);
    } finally { inFlight -= 1; }
  };
  try { return { result: await run(), requests, most: () => most }; } finally { globalThis.fetch = real; }
}

// ---------------------------------------------------------------- GitHub

// 1,370 pull requests, numbered 1 to 1370 in the order they were created: the newest three are open, the others closed — every fourth merged. Pull request n was last
// updated on 2026-08-01 plus a day for every ten; `fresh` names those updated on 2026-10-21 instead.
const ghPull = (n, total, fresh) => {
  const open = n > total - 3, merged = !open && n % 4 === 0;
  const updated = fresh.has(n) ? "2026-10-21T09:00:00Z" : new Date(Date.parse("2026-08-01T00:00:00Z") + Math.floor(n / 10) * 86_400_000 % (70 * 86_400_000)).toISOString();
  return { number: n, title: `Pull ${n}`, state: open ? "open" : "closed", draft: false, html_url: `https://github.com/carol/sprint-tool/pull/${n}`, created_at: "2026-08-01T00:00:00Z",
    updated_at: updated, body: "", merged_at: merged ? "2026-08-02T00:00:00Z" : null, merge_commit_sha: merged ? "f".repeat(40) : null, closed_at: open ? null : "2026-08-02T00:00:00Z",
    head: { ref: `feature-${n}`, sha: "2".repeat(40) }, base: { ref: "main", sha: "b".repeat(40) } };
};
function github(total, fresh = new Set()) {
  const all = Array.from({ length: total }, (_, i) => ghPull(total - i, total, fresh)); // newest first, as GitHub lists them by default
  return (url) => {
    const q = url.searchParams;
    if (url.pathname === "/search/issues") {
      const query = q.get("q") ?? "";
      const since = /updated:>=(\S+)/.exec(query)?.[1];
      assert.ok(query.includes("repo:carol/sprint-tool") && query.includes("is:pr"), `a search of this repository's pull requests: ${query}`);
      const found = all.filter((p) => (!query.includes("is:closed") || p.state === "closed") && (!query.includes("is:open") || p.state === "open")
        && (!since || Date.parse(p.updated_at) >= Date.parse(since)));
      return json({ total_count: found.length, incomplete_results: false, items: found.slice(0, Number(q.get("per_page") ?? 30)).map((p) => ({ number: p.number })) });
    }
    assert.equal(url.pathname, `${GH}/pulls`, `a request this fake does not serve: ${url.href}`);
    const state = q.get("state") ?? "open", per = Number(q.get("per_page") ?? 30), page = Number(q.get("page") ?? 1);
    let list = all.filter((p) => state === "all" || p.state === state);
    if (q.get("sort") === "updated") list = [...list].sort((a, b) => (q.get("direction") === "asc" ? 1 : -1) * a.updated_at.localeCompare(b.updated_at));
    const last = Math.max(1, Math.ceil(list.length / per));
    const at = (n) => { const next = new URL(url); next.searchParams.set("page", String(n)); return next.href; };
    const link = last > 1 ? [...(page < last ? [`<${at(page + 1)}>; rel="next"`, `<${at(last)}>; rel="last"`] : []), ...(page > 1 ? [`<${at(1)}>; rel="first"`, `<${at(page - 1)}>; rel="prev"`] : [])].join(", ") : "";
    return json(list.slice((page - 1) * per, page * per), link ? { Link: link } : {});
  };
}

// TST-1252001 · level: unit · module: MOD-repository-hosts
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-032
// given: a GitHub repository with 1,370 pull requests — 14 pages of 100, the last of 70 —, whose Link header names the last page
// input: listPullRequests()
// expect: 14 requests of /pulls with state=all: page 1 first and alone, then pages 2 to 14 together — at least 13 in flight at once —; all 1,370 returned, in the order the
//         server lists them (1370 first, 1 last), none twice
test("listPullRequests on GitHub — page 1, then every other page at once", async () => {
  const host = connect(GITHUB, { token: GH_TOKEN });
  const { result, requests, most } = await serving(github(1370), () => host.listPullRequests());
  assert.equal(requests.length, 14, requests.map((r) => r.url.search).join(" "));
  assert.deepEqual([requests[0].url.searchParams.get("page"), requests[0].inFlight], ["1", 1], "page 1 is asked first, alone");
  assert.deepEqual(requests.slice(1).map((r) => Number(r.url.searchParams.get("page"))).sort((a, b) => a - b), Array.from({ length: 13 }, (_, i) => i + 2));
  assert.ok(requests.every((r) => r.url.searchParams.get("state") === "all" && r.url.searchParams.get("per_page") === "100"));
  assert.ok(most() >= 13, `pages 2 to 14 are in flight together: at most ${most()} were`);
  assert.equal(result.length, 1370);
  assert.deepEqual([result[0].number, result[99].number, result[100].number, result.at(-1).number], [1370, 1271, 1270, 1]);
  assert.equal(new Set(result.map((p) => p.number)).size, 1370);
});

// TST-1252002 · level: unit · module: MOD-repository-hosts
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-035
// given: the same repository, of whose pull requests 4 are updated on or after 2026-10-20 — 1 of the 3 open ones (1369) and 3 closed ones (1000 merged, 999 and 7 closed) —; and, as a second repository, one with 2,740 pull requests and the same 4 updated since
// input: listPullRequests({ updatedSince: "2026-10-20" }) on each
// expect: those 4 and no other, each with its state — 1369 open, 1000 merged, 999 and 7 closed —; no request with state=all, and no request of closed pull requests that
//         is not sorted by their update, newest first; the same number of requests for both repositories, however many pull requests each holds
test("listPullRequests on GitHub — updatedSince: the pull requests updated since, without listing them all", async () => {
  const fresh = (total) => new Set([total - 1, 1000, 999, 7]);
  const host = connect(GITHUB, { token: GH_TOKEN });
  const small = await serving(github(1370, fresh(1370)), () => host.listPullRequests({ updatedSince: SINCE }));
  assert.deepEqual(small.result.map((p) => [p.number, p.state]).sort((a, b) => a[0] - b[0]), [[7, "closed"], [999, "closed"], [1000, "merged"], [1369, "open"]]);
  const pulls = small.requests.filter((r) => r.url.pathname === `${GH}/pulls`);
  assert.ok(pulls.length > 0, "known positive: the pull requests are listed");
  assert.deepEqual(small.requests.filter((r) => r.url.searchParams.get("state") === "all").map((r) => r.url.href), [], "no state=all");
  assert.deepEqual(pulls.filter((r) => r.url.searchParams.get("state") === "closed" && !(r.url.searchParams.get("sort") === "updated" && r.url.searchParams.get("direction") === "desc"))
    .map((r) => r.url.href), [], "every page of closed pull requests is bounded: sorted by its update, newest first");
  const large = await serving(github(2740, fresh(2740)), () => host.listPullRequests({ updatedSince: SINCE }));
  assert.deepEqual(large.result.map((p) => p.number).sort((a, b) => a - b), [7, 999, 1000, 2739]);
  assert.equal(large.requests.length, small.requests.length, `as many requests for 2,740 pull requests as for 1,370: ${large.requests.length} and ${small.requests.length}`);
});

// ---------------------------------------------------------------- GitLab

const glMr = (iid, total, fresh) => {
  const open = iid > total - 3, merged = !open && iid % 4 === 0;
  return { iid, title: `Merge ${iid}`, state: open ? "opened" : merged ? "merged" : "closed", draft: false, web_url: `https://gitlab.example.org/space/sprint-tool/-/merge_requests/${iid}`,
    created_at: "2026-08-01T00:00:00.000Z", updated_at: fresh.has(iid) ? "2026-10-21T09:00:00.000Z" : "2026-08-15T00:00:00.000Z", description: "", merged_at: merged ? "2026-08-02T00:00:00.000Z" : null,
    closed_at: open || merged ? null : "2026-08-02T00:00:00.000Z", source_branch: `feature-${iid}`, target_branch: "main", sha: "2".repeat(40), merge_commit_sha: merged ? "f".repeat(40) : null };
};
function gitlab(total, fresh = new Set()) {
  const all = Array.from({ length: total }, (_, i) => glMr(total - i, total, fresh));
  return (url) => {
    assert.equal(url.pathname, `${GL}/merge_requests`, `a request this fake does not serve: ${url.href}`);
    const q = url.searchParams, state = q.get("state") ?? "all", per = Number(q.get("per_page") ?? 20), page = Number(q.get("page") ?? 1);
    const after = q.get("updated_after");
    const list = all.filter((m) => (state === "all" || m.state === state) && (!after || Date.parse(m.updated_at) >= Date.parse(after)));
    const pages = Math.max(1, Math.ceil(list.length / per));
    return json(list.slice((page - 1) * per, page * per), { "X-Total": String(list.length), "X-Total-Pages": String(pages), "X-Per-Page": String(per), "X-Page": String(page),
      "X-Next-Page": page < pages ? String(page + 1) : "" });
  };
}

// TST-1252003 · level: unit · module: MOD-repository-hosts
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-032
// given: a GitLab project with 1,370 merge requests, 14 pages of 100, whose X-Total-Pages says so
// input: listPullRequests()
// expect: 14 requests of /merge_requests with state=all: page 1 first and alone, then pages 2 to 14 together — at least 13 in flight at once —; all 1,370 returned, in the
//         order the server lists them, none twice
test("listPullRequests on GitLab — page 1, then every other page at once", async () => {
  const host = connect(GITLAB, { token: GL_TOKEN });
  const { result, requests, most } = await serving(gitlab(1370), () => host.listPullRequests());
  assert.equal(requests.length, 14, requests.map((r) => r.url.search).join(" "));
  assert.deepEqual([requests[0].url.searchParams.get("page"), requests[0].inFlight], ["1", 1], "page 1 is asked first, alone");
  assert.deepEqual(requests.slice(1).map((r) => Number(r.url.searchParams.get("page"))).sort((a, b) => a - b), Array.from({ length: 13 }, (_, i) => i + 2));
  assert.ok(requests.every((r) => r.url.searchParams.get("state") === "all" && r.url.searchParams.get("per_page") === "100"));
  assert.ok(most() >= 13, `pages 2 to 14 are in flight together: at most ${most()} were`);
  assert.equal(result.length, 1370);
  assert.deepEqual([result[0].number, result.at(-1).number], [1370, 1]);
  assert.equal(new Set(result.map((p) => p.number)).size, 1370);
});

// TST-1252004 · level: unit · module: MOD-repository-hosts
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-035
// given: the same project, of whose merge requests 4 are updated on or after 2026-10-20 — 1369 open, 1000 merged, 999 and 7 closed
// input: listPullRequests({ updatedSince: "2026-10-20" })
// expect: those 4 and no other, each with its state; every request carries the bound updated_after, at 2026-10-20 or later, and one request suffices
test("listPullRequests on GitLab — updatedSince: the merge requests updated since, bounded by the server", async () => {
  const host = connect(GITLAB, { token: GL_TOKEN });
  const { result, requests } = await serving(gitlab(1370, new Set([1369, 1000, 999, 7])), () => host.listPullRequests({ updatedSince: SINCE }));
  assert.deepEqual(result.map((p) => [p.number, p.state]).sort((a, b) => a[0] - b[0]), [[7, "closed"], [999, "closed"], [1000, "merged"], [1369, "open"]]);
  assert.ok(requests.length > 0, "known positive: the merge requests are listed");
  assert.ok(requests.every((r) => Date.parse(r.url.searchParams.get("updated_after")) >= Date.parse(SINCE)), requests.map((r) => r.url.search).join(" "));
  assert.equal(requests.length, 1);
});

// TST-1252005 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a GitHub repository
// input: listPullRequests({ updatedSince: "last week" }), and, as the known positive, the same call with "2026-10-20"
// expect: the first is a TypeError naming the date, before any request; the second is answered
test("listPullRequests — updatedSince is a date", async () => {
  const host = connect(GITHUB, { token: GH_TOKEN });
  const good = await serving(github(10, new Set([5])), () => host.listPullRequests({ updatedSince: SINCE }));
  assert.deepEqual(good.result.map((p) => p.number), [5]);
  const bad = await serving(github(10), () => host.listPullRequests({ updatedSince: "last week" }).then(() => null, (e) => e));
  assert.equal(bad.result?.name, "TypeError");
  assert.match(bad.result.message, /date/);
  assert.equal(bad.requests.length, 0);
});
