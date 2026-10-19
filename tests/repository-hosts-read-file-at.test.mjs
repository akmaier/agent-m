// MOD-repository-hosts' readFileAt (ITM-652), as the accepted text of docs/architecture/MOD-repository-hosts.md states it: "`readFileAt(path: string, commits: string[]) -> Promise<Map<string, string | null>>` — the text
// of one file at each of several commits, keyed by commit, `null` where the file does not exist there. It reads in batches, not one snapshot per commit: with a token, one request per batch of commits through the
// server's batch query, as `readMany` reads; without a token, one read of the file's raw text per commit, outside the server's API. Crosses the network; fails as `readSnapshot`." And `readHistory(…, { changes: false })`,
// whose entries' `changes` are empty at one request per page of commits (built; tests/repository-hosts-history.test.mjs). UC-020: a requirement's history is the text of SPEC.md at every commit that changed it.
// Run: node --test tests/repository-hosts-read-file-at.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A REMOTE INTERFACE NAMES HOW IT FAILS; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// Level: unit
//
// The servers are fakes of `fetch`, deterministic, no network, answering as the APIs document: GitHub's GraphQL `repository.object(expression: "<commit>:<path>")` on a `Blob` (text, which is null for a binary file;
// isTruncated), one aliased field for each commit, 100 to a request (the number readMany's batch is, BATCH); "Get repository content" with the raw media type; GitHub's raw host (raw.githubusercontent.com/{repo}/{commit}/{path},
// 404 for a file the commit does not hold); GitLab's "Get raw file from repository" (GET /projects/:id/repository/files/:path/raw?ref=…, 404 for a file the commit does not hold).
// Readings the texts leave open, which the tests state (the pull request names them): the Map has an entry for each commit given, in the order given, a commit named twice is read once; GitLab has no batch query, so
// it reads one request for each commit with or without a token; a file the batch gives as truncated or as binary is read by its own request, as readMany's is; through a clone each commit is read in the clone.
// Each test states its input and its expected result before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
async function using(fetchFn, run) {
  const real = globalThis.fetch;
  globalThis.fetch = fetchFn;
  try { return await run(); } finally { globalThis.fetch = real; }
}
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);

const GH_WEB = "https://github.com/carol/release-tool";
const GH_TOKEN = "github_pat_CAROLreleaseTOOL0123456789abcdef";
const GL_WEB = "https://gitlab.example.org/space/release-tool";
const GL_TOKEN = "glpat-SPACEreleaseTOOL0123456789";
const commitOf = (n) => n.toString(16).padStart(40, "0");
const TEXT = (commit) => `SPEC at ${commit.slice(-4)}\n`;

// What a server holds: the text of SPEC.md at each commit, `null` where the commit has none; `odd` marks commits whose file the batch gives as truncated (it is then read by its own request).
function fakeGitHub({ held = (c) => TEXT(c), odd = new Set(), refuse = null } = {}) {
  const requests = [];
  const fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const headers = Object.fromEntries(new Headers(init.headers ?? {}).entries());
    const request = { method: init.method ?? "GET", href: url.href, origin: url.origin, path: url.pathname, query: Object.fromEntries(url.searchParams), headers, body: init.body === undefined ? null : JSON.parse(init.body) };
    requests.push(request);
    if (refuse) return refuse(request);
    if (url.origin === "https://api.github.com" && url.pathname === "/graphql") {
      const fields = [...request.body.query.matchAll(/f(\d+):object\(expression:"([0-9a-f]{40}):SPEC\.md"\)/g)];
      return json(200, { data: { repository: Object.fromEntries(fields.map(([, i, commit]) => {
        const text = held(commit);
        return [`f${i}`, text === null ? null : odd.has(commit) ? { text: null, isTruncated: true } : { text, isTruncated: false }];
      })) } });
    }
    const raw = /^\/carol\/release-tool\/([0-9a-f]{40})\/SPEC\.md$/.exec(url.pathname);
    if (url.origin === "https://raw.githubusercontent.com" && raw) return held(raw[1]) === null ? json(404, { message: "404: Not Found" }) : new Response(held(raw[1]), { status: 200 });
    const content = /^\/repos\/carol\/release-tool\/contents\/SPEC\.md$/.exec(url.pathname);
    if (content) return held(request.query.ref) === null ? json(404, { message: "Not Found" }) : new Response(held(request.query.ref), { status: 200 });
    return json(404, { message: "Not Found" });
  };
  return { requests, fetch };
}
function fakeGitLab({ held = (c) => TEXT(c) } = {}) {
  const requests = [];
  const fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    requests.push({ href: url.href, origin: url.origin, path: url.pathname, query: Object.fromEntries(url.searchParams), headers: Object.fromEntries(new Headers(init.headers ?? {}).entries()) });
    if (url.pathname === "/api/v4/projects/space%2Frelease-tool/repository/files/SPEC.md/raw") {
      const text = held(url.searchParams.get("ref"));
      return text === null ? json(404, { message: "404 File Not Found" }) : new Response(text, { status: 200 });
    }
    return json(404, { message: "404 Not found" });
  };
  return { requests, fetch };
}
const hub = (credentials = { token: GH_TOKEN }) => connect(parseAddress(GH_WEB), credentials);

// TST-652001 · level: unit · module: MOD-repository-hosts
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: a GitHub repository, a token, and SPEC.md at three commits a, b and c, where commit b does not hold the file
// input: readFileAt("SPEC.md", [a, b, c])
// expect: a Map with the three commits in this order: the text at a, null at b, the text at c; exactly one request, a POST to GitHub's GraphQL API, which names the three commits and the path; no snapshot is read
test("readFileAt — with a token, three commits are read in one request of the batch query, null where a commit has no file", async () => {
  const [a, b, c] = [commitOf(1), commitOf(2), commitOf(3)];
  const server = fakeGitHub({ held: (commit) => (commit === b ? null : TEXT(commit)) });
  const texts = await using(server.fetch, () => hub().readFileAt("SPEC.md", [a, b, c]));
  assert.ok(texts instanceof Map);
  assert.deepEqual([...texts], [[a, TEXT(a)], [b, null], [c, TEXT(c)]]);
  assert.deepEqual(server.requests.map((r) => [r.method, r.path]), [["POST", "/graphql"]]);
  for (const commit of [a, b, c]) assert.ok(server.requests[0].body.query.includes(`${commit}:SPEC.md`));
});

// TST-652002 · level: unit · module: MOD-repository-hosts
// guards: UC-020; A REQUIREMENT SHOWS ITS HISTORY
// given: a GitHub repository, a token, and 250 distinct commits, one of them named twice in the list; known positive: TST-652001
// input: readFileAt("SPEC.md", the commits)
// expect: 250 entries; three requests, to the GraphQL API, of 100, 100 and 50 commits; the commit named twice is in the Map once and read once
test("readFileAt — 250 commits are read in three requests of at most 100, each commit once", async () => {
  const commits = Array.from({ length: 250 }, (_, i) => commitOf(i + 1));
  const server = fakeGitHub();
  const texts = await using(server.fetch, () => hub().readFileAt("SPEC.md", [...commits, commits[7]]));
  assert.equal(texts.size, 250);
  assert.deepEqual(server.requests.map((r) => (r.body.query.match(/object\(expression/g) ?? []).length), [100, 100, 50]);
  assert.ok(server.requests.every((r) => r.path === "/graphql"));
  assert.equal(texts.get(commits[249]), TEXT(commits[249]));
});

// TST-652003 · level: unit · module: MOD-repository-hosts
// guards: UC-020; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitHub repository without a token, SPEC.md at three commits of which one has no file
// input: readFileAt("SPEC.md", the three commits)
// expect: the texts and null as in TST-652001; three requests, each to GitHub's raw host, none to api.github.com, none with an authorisation header
test("readFileAt — without a token each commit is one raw read outside the API", async () => {
  const [a, b, c] = [commitOf(1), commitOf(2), commitOf(3)];
  const server = fakeGitHub({ held: (commit) => (commit === b ? null : TEXT(commit)) });
  const texts = await using(server.fetch, () => hub({}).readFileAt("SPEC.md", [a, b, c]));
  assert.deepEqual([...texts], [[a, TEXT(a)], [b, null], [c, TEXT(c)]]);
  assert.equal(server.requests.length, 3);
  assert.deepEqual([...new Set(server.requests.map((r) => r.origin))], ["https://raw.githubusercontent.com"]);
  assert.deepEqual(server.requests.filter((r) => "authorization" in r.headers), []);
});

// TST-652004 · level: unit · module: MOD-repository-hosts
// guards: UC-020
// given: a GitHub repository, a token; the batch gives the file at commit b as truncated
// input: readFileAt("SPEC.md", [a, b, c])
// expect: the texts at all three commits, the one at b read by its own request to the contents API; two requests in all
test("readFileAt — a file the batch gives as truncated is read by its own request", async () => {
  const [a, b, c] = [commitOf(1), commitOf(2), commitOf(3)];
  const server = fakeGitHub({ odd: new Set([b]) });
  const texts = await using(server.fetch, () => hub().readFileAt("SPEC.md", [a, b, c]));
  assert.deepEqual([...texts], [[a, TEXT(a)], [b, TEXT(b)], [c, TEXT(c)]]);
  assert.deepEqual(server.requests.map((r) => [r.method, r.path, r.query.ref ?? null]), [["POST", "/graphql", null], ["GET", "/repos/carol/release-tool/contents/SPEC.md", b]]);
});

// TST-652005 · level: unit · module: MOD-repository-hosts
// guards: UC-020; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitLab project with SPEC.md at three commits of which one has no file, with a token and without
// input: readFileAt("SPEC.md", [a, b, c]) on each
// expect: the texts and null; one request to the project's raw file for each commit (GitLab has no batch query), with the commit as ref; the token in the private-token header with a token and no header without
test("readFileAt — on a GitLab server each commit is one request for the raw file, with the token only in its header", async () => {
  const [a, b, c] = [commitOf(1), commitOf(2), commitOf(3)];
  const held = (commit) => (commit === b ? null : TEXT(commit));
  const withToken = fakeGitLab({ held }), without = fakeGitLab({ held });
  const first = await using(withToken.fetch, () => connect(parseAddress(GL_WEB), { token: GL_TOKEN }).readFileAt("SPEC.md", [a, b, c]));
  const second = await using(without.fetch, () => connect(parseAddress(GL_WEB)).readFileAt("SPEC.md", [a, b, c]));
  for (const texts of [first, second]) assert.deepEqual([...texts], [[a, TEXT(a)], [b, null], [c, TEXT(c)]]);
  assert.deepEqual(withToken.requests.map((r) => r.query.ref), [a, b, c]);
  assert.deepEqual(without.requests.map((r) => r.query.ref), [a, b, c]);
  assert.ok(withToken.requests.every((r) => r.headers["private-token"] === GL_TOKEN && r.origin === "https://gitlab.example.org"));
  assert.ok(without.requests.every((r) => !("private-token" in r.headers)));
});

// TST-652006 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
// given: a GitHub repository whose server answers the batch with 401, with 403 and a used-up limit, and cannot be reached
// input: readFileAt
// expect: TokenRefused, RateLimited and Unreachable, each by its name
test("readFileAt — fails as readSnapshot does: TokenRefused, RateLimited, Unreachable", async () => {
  const commits = [commitOf(1)];
  const run = (refuse) => using(fakeGitHub({ refuse }).fetch, () => failure(hub().readFileAt("SPEC.md", commits)));
  assert.equal((await run(() => json(401, { message: "Bad credentials" })))?.name, "TokenRefused");
  assert.equal((await run(() => json(403, { message: "rate limit" }, { "x-ratelimit-remaining": "0", "x-ratelimit-limit": "5000", "x-ratelimit-reset": "1790000000" })))?.name, "RateLimited");
  assert.equal((await using(async () => { throw new TypeError("Failed to fetch"); }, () => failure(hub().readFileAt("SPEC.md", commits))))?.name, "Unreachable");
});

// TST-652007 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: no path, a commit that is no commit identifier, a list that is no list, and an empty list of commits
// input: readFileAt with each
// expect: a TypeError naming what is wrong for the first three, and no request; an empty Map for the empty list, and no request
test("readFileAt — a wrong argument is a TypeError, and no commit is an empty Map, with no request", async () => {
  const server = fakeGitHub();
  await using(server.fetch, async () => {
    for (const bad of [() => hub().readFileAt("", [commitOf(1)]), () => hub().readFileAt("SPEC.md", ["main"]), () => hub().readFileAt("SPEC.md", "abc")]) assert.ok((await failure(bad())) instanceof TypeError);
    assert.deepEqual([...await hub().readFileAt("SPEC.md", [])], []);
  });
  assert.deepEqual(server.requests, []);
});

// TST-652008 · level: unit · module: MOD-repository-hosts
// guards: UC-020
// given: a local clone holding SPEC.md at one commit and none at the one before; a token whose server would fail the test if it were asked
// input: readFileAt("SPEC.md", [the earlier commit, the later one])
// expect: null at the earlier commit, the text at the later; no request reaches a server
test("readFileAt — through a clone each commit is read in the clone, with no request", async () => {
  const root = mkdtempSync(join(tmpdir(), "agent-m-read-file-at-"));
  try {
    const run = (...args) => {
      const r = spawnSync("git", args, { cwd: root, encoding: "utf8", env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" } });
      assert.equal(r.status, 0, r.stderr);
      return r.stdout.trim();
    };
    run("init", "-q", "-b", "main");
    run("config", "user.email", "a@example.org");
    run("config", "user.name", "a");
    writeFileSync(join(root, "other.md"), "other\n");
    run("add", "-A");
    run("commit", "-q", "-m", "one");
    const earlier = run("rev-parse", "HEAD");
    writeFileSync(join(root, "SPEC.md"), "spec\n");
    run("add", "-A");
    run("commit", "-q", "-m", "two");
    const later = run("rev-parse", "HEAD");
    const seen = [];
    const texts = await using(async (input) => { seen.push(String(input)); return json(404, {}); }, () => connect(parseAddress(GH_WEB), { token: GH_TOKEN, clone: root }).readFileAt("SPEC.md", [earlier, later]));
    assert.deepEqual([...texts], [[earlier, null], [later, "spec\n"]]);
    assert.deepEqual(seen, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
