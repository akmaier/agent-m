// MOD-repository-hosts' issueCounts (ITM-434), as the accepted text of docs/architecture/MOD-repository-hosts.md states it:
// "issueCounts() -> Promise<{ open: number, closed: number }> — the numbers of open and closed issues of the repository, pull
// requests not counted, without listing the issues — on GitHub through its search, which has a limit of its own, on a GitLab
// server through the project's issue statistics. Crosses the network; fails with RateLimited — on GitHub with the limit `search`
// —, NotFound, TokenRefused, Unreachable". Through GitHub's and GitLab's REST APIs, without a token where the repository is
// public. Deterministic, no network: the servers are fakes of `fetch` that answer as the real APIs do —
// GitHub: "Search issues and pull requests" (GET /search/issues: q, per_page — default 30, up to 100 —; the answer
// { total_count, incomplete_results, items }; the qualifiers repo:OWNER/NAME, is:issue, state:open and state:closed — a search
// without is:issue lists pull requests with the issues) (docs.github.com/en/rest/search/search and
// docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests, read 2026-10-11); the search limit of
// 30 requests a minute with a token and 10 without, whose use up is answered 403 with x-ratelimit-remaining 0 and
// x-ratelimit-resource search (docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api, read 2026-10-11, and the
// answer GitHub gave to the tenth search of an anonymous client, the same day); and the answer to a repository that does not
// exist or that the client may not see — 422 "Validation Failed", not 404 — as GitHub gave it the same day;
// GitLab: "Retrieve issues statistics for a project" (GET /projects/:id/issues_statistics: { statistics: { counts: { all,
// closed, opened } } }; docs.gitlab.com/api/issues_statistics, read 2026-10-11), which a public project serves without a token,
// and answers 404 for a project that does not exist or that a client may not see.
// Run: node --test tests/repository-hosts-issue-counts.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-022; A REUSE DECISION RECORDS ITS DUE DILIGENCE; DUE DILIGENCE IS FETCHED, NOT RECALLED; A REMOTE INTERFACE NAMES HOW IT FAILS; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect).

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect, HostError } from "../src/repository-hosts/index.mjs";

// ---------------------------------------------------------------- the fake servers

// One request as a server sees it: method, address, headers with their names in lower case, the query.
function seen(input, init = {}) {
  const isRequest = typeof input === "object" && !(input instanceof URL);
  const url = new URL(isRequest ? input.url : String(input));
  const raw = init.headers ?? (isRequest ? input.headers : {}) ?? {};
  const headers = raw instanceof Headers ? Object.fromEntries(raw.entries())
    : Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), String(v)]));
  return { method: String(init.method ?? (isRequest ? input.method : "GET")).toUpperCase(), url, href: url.href,
    origin: url.origin, path: url.pathname, query: Object.fromEntries(url.searchParams), headers };
}
const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status,
  headers: { "Content-Type": "application/json", ...headers } });

// Runs `run` with `fetchFn` in place of the platform's fetch.
async function using(fetchFn, run) {
  const real = globalThis.fetch;
  globalThis.fetch = fetchFn;
  try { return await run(); } finally { globalThis.fetch = real; }
}
// The failure a promise ends in, or null when it does not fail.
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);

const GH_WEB = "https://github.com/carol/release-tool";
const GH_API = "https://api.github.com";
const GH_TOKEN = "github_pat_CAROLreleaseTOOL0123456789abcdef";
const GH_TOKENS = "https://github.com/settings/personal-access-tokens";

const GL_ORIGIN = "https://gitlab.example.org";
const GL_WEB = `${GL_ORIGIN}/space/release-tool`;
const GL_PREFIX = "/api/v4/projects/space%2Frelease-tool";
const GL_TOKEN = "glpat-SPACEreleaseTOOLvalue0123456789";
const GL_TOKENS = `${GL_WEB}/-/settings/access_tokens`;

const GITHUB = parseAddress(GH_WEB);
const GITLAB = parseAddress(GL_WEB);
const RESET = 1790000000;

// ---------------------------------------------------------------- what the trackers hold

// A tracker: its issues and its pull requests — merge requests on GitLab —, each open or closed (a merged one is closed).
const tracker = (issues, pulls) => [
  ...Array.from({ length: issues.open }, (_, i) => ({ kind: "issue", state: "open", number: 1 + i })),
  ...Array.from({ length: issues.closed }, (_, i) => ({ kind: "issue", state: "closed", number: 1 + issues.open + i })),
  ...Array.from({ length: pulls.open }, (_, i) => ({ kind: "pull", state: "open", number: 1 + issues.open + issues.closed + i })),
  ...Array.from({ length: pulls.closed }, (_, i) => ({ kind: "pull", state: "closed", number: 1 + issues.open + issues.closed + pulls.open + i })),
];
// Three open and two closed issues, one open and three closed pull requests.
const USUAL = tracker({ open: 3, closed: 2 }, { open: 1, closed: 3 });
// One open issue, no closed one, and five open and seven closed pull requests.
const MOSTLY_PULLS = tracker({ open: 1, closed: 0 }, { open: 5, closed: 7 });
// What GitHub's search holds besides: the issues of another repository (seven open, eleven closed).
const OTHER_REPOSITORY = tracker({ open: 7, closed: 11 }, { open: 2, closed: 2 });

// A GitHub whose search serves the repository carol/release-tool, and another repository, as GitHub's does. tracker: the issues
// and pull requests of carol/release-tool; priv: the repository is private, found only by the token; searchesLeft: how many
// searches the window still allows, after which a search is answered as GitHub answers a used-up limit; answer(request): a canned
// answer in place of the usual one, for any request.
function fakeGitHub({ items = USUAL, priv = false, searchesLeft = null, answer = null } = {}) {
  const requests = [];
  const server = { requests, searches: () => requests.filter((r) => r.path === "/search/issues") };
  const world = { "carol/release-tool": items, "carol/other-tool": OTHER_REPOSITORY };
  let left = searchesLeft;
  server.fetch = async (input, init = {}) => {
    const r = seen(input, init);
    requests.push(r);
    const own = answer?.(r);
    if (own) return own;
    const auth = r.headers.authorization ?? null;
    if (auth !== null && auth !== `Bearer ${GH_TOKEN}`) return json(401, { message: "Bad credentials", status: "401" });
    if (r.origin !== GH_API || r.method !== "GET" || r.path !== "/search/issues") return json(404, { message: "Not Found", status: "404" });
    const limit = auth ? 30 : 10;
    const window = { "X-RateLimit-Limit": String(limit), "X-RateLimit-Resource": "search", "X-RateLimit-Reset": String(RESET) };
    if (left !== null && left <= 0) {
      return json(403, { message: auth ? "API rate limit exceeded for user ID 1." : "API rate limit exceeded for 203.0.113.9. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)",
        documentation_url: "https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting" },
      { ...window, "X-RateLimit-Remaining": "0", "X-RateLimit-Used": String(limit) });
    }
    if (left !== null) left -= 1;
    const served = { ...window, "X-RateLimit-Remaining": String(left ?? limit - 1), "X-RateLimit-Used": String(left === null ? 1 : limit - left) };
    // The qualifiers of q: repo:OWNER/NAME, is:issue (or type:issue), is:pr / is:pull-request / type:pr, state:open / is:open.
    const terms = String(r.query.q ?? "").split(/\s+/).filter(Boolean);
    const repo = terms.find((t) => t.startsWith("repo:"))?.slice("repo:".length).toLowerCase() ?? null;
    const kind = terms.some((t) => t === "is:issue" || t === "type:issue") ? "issue"
      : terms.some((t) => ["is:pr", "is:pull-request", "type:pr"].includes(t)) ? "pull" : null;
    const state = /^(?:state|is):(open|closed)$/.exec(terms.find((t) => /^(?:state|is):(?:open|closed)$/.test(t)) ?? "")?.[1] ?? null;
    if (repo !== null && (!Object.hasOwn(world, repo) || (repo === "carol/release-tool" && priv && auth === null))) {
      return json(422, { message: "Validation Failed", errors: [{ message: "The listed users and repositories cannot be searched either because the resources do not exist or you do not have permission to view them.", resource: "Search", field: "q", code: "invalid" }],
        documentation_url: "https://docs.github.com/v3/search/", status: "422" }, served);
    }
    const found = Object.entries(world).filter(([name]) => repo === null || name === repo)
      .flatMap(([name, held]) => held.map((i) => ({ ...i, repo: name })))
      .filter((i) => (kind === null || i.kind === kind) && (state === null || i.state === state));
    const per = Math.min(100, Number(r.query.per_page ?? 30));
    return json(200, { total_count: found.length, incomplete_results: false,
      items: found.slice(0, per).map((i) => ({ number: i.number, state: i.state, title: `Item ${i.number}`, repository_url: `${GH_API}/repos/${i.repo}`,
        ...(i.kind === "pull" ? { pull_request: { url: `${GH_API}/repos/${i.repo}/pulls/${i.number}` } } : {}) })) }, served);
  };
  return server;
}

// A GitLab server whose project space/release-tool holds `items` — its issues, and its merge requests, which are not issues —, and
// answers "Retrieve issues statistics for a project" as GitLab does. priv: the project is private, found only by the token;
// answer(request): a canned answer in place of the usual one, for any request.
function fakeGitLab({ items = USUAL, priv = false, answer = null } = {}) {
  const requests = [];
  const server = { requests, statistics: () => requests.filter((r) => r.path === `${GL_PREFIX}/issues_statistics`) };
  server.fetch = async (input, init = {}) => {
    const r = seen(input, init);
    requests.push(r);
    const own = answer?.(r);
    if (own) return own;
    const token = r.headers["private-token"] ?? null;
    if (token !== null && token !== GL_TOKEN) return json(401, { message: "401 Unauthorized" });
    if (r.origin !== GL_ORIGIN || r.method !== "GET" || !r.path.startsWith(GL_PREFIX)) return json(404, { message: "404 Not Found" });
    if (priv && token === null) return json(404, { message: "404 Project Not Found" });
    if (r.path === `${GL_PREFIX}/issues_statistics`) {
      const issues = items.filter((i) => i.kind === "issue");
      const opened = issues.filter((i) => i.state === "open").length, closed = issues.length - opened;
      return json(200, { statistics: { counts: { all: issues.length, closed, opened } } });
    }
    return json(404, { message: "404 Not Found" });
  };
  return server;
}

// Runs `read` against a fake GitHub and a fake GitLab, each built from the options given for it: [what GitHub gave, what GitLab
// gave, the two fakes]. read(address, fake) -> a promise.
async function onBoth(read, { gh = {}, gl = {} } = {}) {
  const github = fakeGitHub(gh), gitlab = fakeGitLab(gl);
  const fromGitHub = await using(github.fetch, () => read(GITHUB, github));
  const fromGitLab = await using(gitlab.fetch, () => read(GITLAB, gitlab));
  return [fromGitHub, fromGitLab, { github, gitlab }];
}

// ---------------------------------------------------------------- the two counts

// guards: UC-022; DUE DILIGENCE IS FETCHED, NOT RECALLED
// given: a public repository carol/release-tool on GitHub and a public project space/release-tool on a GitLab server, each
//        holding three open and two closed issues and — pull requests, merge requests — one open and three closed; GitHub's
//        search holds also the issues of another repository, carol/other-tool; no token is stored
// input: connect(address, {}).issueCounts()
// expect: { open: 3, closed: 2 } from each, a plain object of two numbers; no issue listed: GitHub is asked two searches, each
//         for one result a page, GitLab one request for the statistics; no token is sent to either
test("MOD-repository-hosts issueCounts — the open and closed issues of a public repository, without a token (GitHub, GitLab)", async () => {
  const [gh, gl, { github, gitlab }] = await onBoth((address) => connect(address, {}).issueCounts());
  assert.deepEqual(gh, { open: 3, closed: 2 }, "GitHub");
  assert.deepEqual(gl, { open: 3, closed: 2 }, "GitLab");
  assert.equal(github.searches().length, 2, "GitHub: one search for the open issues, one for the closed");
  assert.deepEqual(github.searches().map((r) => r.query.per_page), ["1", "1"], "GitHub: no issue is listed, one result a page");
  assert.equal(github.requests.length, 2, "GitHub: nothing else is asked");
  assert.equal(gitlab.statistics().length, 1, "GitLab: one request for the statistics");
  assert.equal(gitlab.requests.length, 1, "GitLab: nothing else is asked");
  assert.deepEqual([...github.requests, ...gitlab.requests].map((r) => r.headers.authorization ?? r.headers["private-token"] ?? null),
    [null, null, null], "no token is sent");
});

// ---------------------------------------------------------------- pull requests are not counted

// guards: UC-022; DUE DILIGENCE IS FETCHED, NOT RECALLED
// given: a public repository and a public project that hold one open issue, no closed one, and five open and seven closed pull
//        or merge requests — GitHub's search lists pull requests with the issues unless it is told to leave them out
// input: connect(address, {}).issueCounts()
// expect: { open: 1, closed: 0 } from each: not one of the twelve pull or merge requests is counted
test("MOD-repository-hosts issueCounts — pull requests are not counted (GitHub, GitLab)", async () => {
  const [gh, gl] = await onBoth((address) => connect(address, {}).issueCounts(), { gh: { items: MOSTLY_PULLS }, gl: { items: MOSTLY_PULLS } });
  assert.deepEqual(gh, { open: 1, closed: 0 }, "GitHub");
  assert.deepEqual(gl, { open: 1, closed: 0 }, "GitLab");
});

// ---------------------------------------------------------------- a private repository

// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-022
// given: a private repository on GitHub and a private project on a GitLab server, each serving a client only if it sends the right
//        token — to any other GitHub's search answers 422, as it does for a repository it does not hold, and GitLab 404 —, each
//        holding three open and two closed issues and pull or merge requests; a token stored for each
// input: connect(address, { token }).issueCounts(), and connect(address, {}).issueCounts() without a token
// expect: with the token { open: 3, closed: 2 } from each, the token sent to the API of the server that issued it, GitHub's search
//         included — Authorization: Bearer <token> on each of the two searches, PRIVATE-TOKEN on the request for the statistics;
//         without a token NotFound naming the repository or the project
test("MOD-repository-hosts issueCounts — a private repository is counted with the token, which is sent to the search too, and is not found without one (GitHub, GitLab)", async () => {
  const [gh, gl, { github, gitlab }] = await onBoth((address) => connect(address, { token: address === GITHUB ? GH_TOKEN : GL_TOKEN }).issueCounts(),
    { gh: { priv: true }, gl: { priv: true } });
  assert.deepEqual(gh, { open: 3, closed: 2 }, "GitHub");
  assert.deepEqual(gl, { open: 3, closed: 2 }, "GitLab");
  assert.deepEqual(github.searches().map((r) => r.headers.authorization), [`Bearer ${GH_TOKEN}`, `Bearer ${GH_TOKEN}`], "GitHub: the token is sent with each search");
  assert.deepEqual(gitlab.statistics().map((r) => r.headers["private-token"]), [GL_TOKEN], "GitLab: the token is sent with the request");

  const [ghWithout, glWithout] = await onBoth((address) => failure(connect(address, {}).issueCounts()), { gh: { priv: true }, gl: { priv: true } });
  assert.deepEqual([ghWithout?.name, /release-tool/.test(String(ghWithout?.what))], ["NotFound", true], "GitHub, without a token");
  assert.deepEqual([glWithout?.name, /release-tool/.test(String(glWithout?.what))], ["NotFound", true], "GitLab, without a token");
});

// ---------------------------------------------------------------- the search limit

// guards: A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: GitHub's search, whose window allows 30 searches a minute with a token and 10 without, answers a used-up limit as GitHub
//        does — 403, x-ratelimit-remaining 0, x-ratelimit-resource search, x-ratelimit-reset — (1) to the first search, with a
//        token; (2) to the first search, without one; (3) to the second search, after the first was served, with a token
// input: issueCounts() on each
// expect: HostError RateLimited whose limit is "search" — not "account" nor "network", though the limit is 30 or 10 — and whose
//         resetsAt is the time x-ratelimit-reset gives; not a refused token, and in (3) not the one count that was read
test("MOD-repository-hosts issueCounts — the search limit is named when it is used up (GitHub)", async () => {
  for (const [label, credentials, searchesLeft] of [
    ["with a token, none left", { token: GH_TOKEN }, 0],
    ["without a token, none left", {}, 0],
    ["with a token, the second search refused", { token: GH_TOKEN }, 1],
  ]) {
    const github = fakeGitHub({ searchesLeft });
    const e = await using(github.fetch, () => failure(connect(GITHUB, credentials).issueCounts()));
    assert.ok(e instanceof HostError, `${label}: a HostError, not ${e}`);
    assert.deepEqual([e.name, e.limit, e.resetsAt?.getTime()], ["RateLimited", "search", RESET * 1000], label);
  }
});

// ---------------------------------------------------------------- the module's named failures

// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
// given: servers that answer every request with a refused token (401), a server that knows no such repository or project — GitHub's
//        search answers 422, as it does for a repository it does not hold or the client may not see; GitLab 404 —, a GitLab server
//        that answers a used-up limit (429), servers that answer 502, and a fetch that fails as a browser's does
// input: issueCounts() on each
// expect: HostError TokenRefused naming the token and the page where it is renewed; NotFound naming the repository; on GitLab
//         RateLimited naming the account's limit; Unreachable with the server's status or the browser's reason
test("MOD-repository-hosts issueCounts — a refused token, a missing repository, a used-up limit and an unreachable server are the module's named failures (GitHub, GitLab)", async () => {
  const ghHost = (address = GITHUB) => connect(address, { token: GH_TOKEN, tokenName: "GitHub token" });
  const glHost = () => connect(GITLAB, { token: GL_TOKEN, tokenName: "GitLab project token" });

  const ghRefused = await using(fakeGitHub({ answer: () => json(401, { message: "Bad credentials" }) }).fetch, () => failure(ghHost().issueCounts()));
  assert.ok(ghRefused instanceof HostError, `a HostError, not ${ghRefused}`);
  assert.deepEqual([ghRefused.name, ghRefused.tokenName, ghRefused.renewal], ["TokenRefused", "GitHub token", GH_TOKENS], "GitHub");
  const glRefused = await using(fakeGitLab({ answer: () => json(401, { message: "401 Unauthorized" }) }).fetch, () => failure(glHost().issueCounts()));
  assert.deepEqual([glRefused?.name, glRefused?.tokenName, glRefused?.renewal], ["TokenRefused", "GitLab project token", GL_TOKENS], "GitLab");

  const ghMissing = await using(fakeGitHub().fetch, () => failure(ghHost(parseAddress("https://github.com/carol/no-such-tool")).issueCounts()));
  assert.equal(ghMissing?.name, "NotFound", "GitHub");
  assert.ok(/no-such-tool/.test(String(ghMissing?.what)), `GitHub: the repository is named: ${ghMissing?.what}`);
  const glMissing = await using(fakeGitLab({ answer: () => json(404, { message: "404 Project Not Found" }) }).fetch, () => failure(glHost().issueCounts()));
  assert.equal(glMissing?.name, "NotFound", "GitLab");
  assert.ok(/release-tool/.test(String(glMissing?.what)), `GitLab: the project is named: ${glMissing?.what}`);

  const glLimited = await using(fakeGitLab({ answer: () => json(429, { message: "Retry later" }, { "Retry-After": "60" }) }).fetch, () => failure(glHost().issueCounts()));
  assert.deepEqual([glLimited?.name, glLimited?.limit], ["RateLimited", "account"], "GitLab");

  const ghBad = await using(fakeGitHub({ answer: () => json(502, { message: "Bad Gateway" }) }).fetch, () => failure(ghHost().issueCounts()));
  assert.ok(ghBad?.name === "Unreachable" && /502/.test(ghBad.reason), `GitHub: Unreachable with the status: ${ghBad?.name} ${ghBad?.reason}`);
  const glBad = await using(fakeGitLab({ answer: () => json(502, { message: "Bad Gateway" }) }).fetch, () => failure(glHost().issueCounts()));
  assert.ok(glBad?.name === "Unreachable" && /502/.test(glBad.reason), `GitLab: Unreachable with the status: ${glBad?.name} ${glBad?.reason}`);
  const offline = async () => { throw new TypeError("Failed to fetch"); };
  for (const [label, host] of [["GitHub", ghHost()], ["GitLab", glHost()]]) {
    const e = await using(offline, () => failure(host.issueCounts()));
    assert.deepEqual([e instanceof HostError, e?.name, e?.reason], [true, "Unreachable", "Failed to fetch"], `${label}: the browser's reason is given`);
  }
});
