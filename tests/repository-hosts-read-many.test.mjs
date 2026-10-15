// MOD-repository-hosts' Snapshot.readMany (ITM-479), as the accepted text of docs/architecture/MOD-repository-hosts.md states it:
// "`readMany` fetches the texts of many files ahead of their `read`s, in as few requests as the server allows — on GitHub with a
// token, many files in one request of the same server's GraphQL API, which the token alone reaches (`A TOKEN GOES ONLY TO THE
// SERVER THAT ISSUED IT`) … on any other server, in a clone or without a token, it reads nothing ahead and each `read` fetches
// its file as before —, so that a caller that reads hundreds of files makes a handful of requests; a file the batch could not
// give is fetched by its own `read`, and `readMany` fails only as `readSnapshot` fails".
// Run: node --test tests/repository-hosts-read-many.test.mjs
//
// Module: MOD-repository-hosts
// Guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-006
// Level: unit
//
// Deterministic, no network: the GitHub server is a fake of `fetch` that answers as GitHub's REST API and GraphQL API answer
// ("Get a commit", "Get a tree", "Get repository content"; GraphQL `repository.object(expression:)` on a `Blob`, whose `text` is
// null for a binary file and whose `isTruncated` marks a file too large to give whole; a call costs 1 point however many files
// it names). The number of files one query names is 100, the value ITM-479's pull request records with the page it was read
// from; each test writes its expected numbers itself.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const TOKEN = "github_pat_BOBreadMANY0123456789abcdef";
const ADDRESS = parseAddress("https://github.com/bob/reader");
const COMMIT = "c0ffee00c0ffee00c0ffee00c0ffee00c0ffee00";
const sha1 = (s) => createHash("sha1").update(s).digest("hex");
const blobSha = (t) => sha1(`blob ${Buffer.byteLength(t)}\0${t}`);
const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);

async function using(fetchFn, run) {
  const real = globalThis.fetch;
  globalThis.fetch = fetchFn;
  try { return await run(); } finally { globalThis.fetch = real; }
}

// n files "f000.md" … with their own text, and the paths.
function files(n) {
  const out = {};
  for (let i = 0; i < n; i++) out[`docs/f${String(i).padStart(3, "0")}.md`] = `file number ${i} — ä\n`;
  return out;
}

// A fake GitHub holding `held` at COMMIT. `graphql(query, body, headers)` may answer instead; `special` maps a path to how the
// GraphQL API answers it: "truncated", "binary". Every request is recorded as { method, url, headers, body }.
function fakeGitHub(held, { graphql = null, special = {} } = {}) {
  const requests = [];
  const fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const headers = Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
    const method = init.method ?? "GET";
    const body = typeof init.body === "string" ? JSON.parse(init.body) : null;
    requests.push({ method, url, headers, body });
    const prefix = "/repos/bob/reader";
    if (url.origin === "https://api.github.com" && url.pathname === "/graphql") {
      if (graphql) { const own = graphql(body, headers); if (own) return own; }
      const repository = {};
      for (const [, alias, expression] of body.query.matchAll(/(\w+):object\(expression:("(?:[^"\\]|\\.)*")\)/g)) {
        const [commit, path] = [JSON.parse(expression).slice(0, 40), JSON.parse(expression).slice(41)];
        const text = commit === COMMIT ? held[path] : undefined;
        if (text === undefined || special[path] === "absent") repository[alias] = null;
        else if (special[path] === "binary") repository[alias] = { text: null, isTruncated: false, isBinary: true, byteSize: 3 };
        else if (special[path] === "truncated") repository[alias] = { text: text.slice(0, 5), isTruncated: true, isBinary: false, byteSize: 600000 };
        else repository[alias] = { text, isTruncated: false, isBinary: false, byteSize: Buffer.byteLength(text) };
      }
      return json(200, { data: { rateLimit: { cost: 1, remaining: 4999 }, repository } });
    }
    if (url.pathname === `${prefix}/commits/main`) return json(200, { sha: COMMIT, commit: { tree: { sha: "t" } } });
    if (url.pathname === `${prefix}/git/trees/${COMMIT}`) {
      return json(200, { tree: Object.entries(held).map(([path, text]) => ({ path, type: "blob", sha: blobSha(text) })) });
    }
    const contents = url.pathname.startsWith(`${prefix}/contents/`) ? decodeURIComponent(url.pathname.slice(`${prefix}/contents/`.length)) : null;
    if (contents !== null) return held[contents] === undefined ? json(404, { message: "Not Found" }) : new Response(held[contents], { status: 200 });
    return json(404, { message: "Not Found" });
  };
  return { fetch, requests, graphqlRequests: () => requests.filter((r) => r.url.pathname === "/graphql"),
    contentRequests: () => requests.filter((r) => r.url.pathname.includes("/contents/")) };
}

// With a token, 250 files are read in 3 requests of GraphQL (100 + 100 + 50), each to https://api.github.com/graphql with the
// token in the Authorization header only; then each read gives the exact text and makes no request.
// TST-479001 · level: unit · module: MOD-repository-hosts
// guards: UC-006; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a fake GitHub holding 250 files; a host with a token
// input: readSnapshot("main"), readMany of all 250 paths, then read of each path
// expect: exactly 3 requests to https://api.github.com/graphql (100, 100 and 50 files named), each POST with "Authorization: Bearer <token>" and the token in neither address nor body; 0 requests to /contents; every read gives its file's exact text; the 2 requests of readSnapshot were made before
test("readMany: 250 files in 3 GraphQL requests with the token in the header; the reads then make no request", async () => {
  const held = files(250), paths = Object.keys(held);
  const fake = fakeGitHub(held);
  await using(fake.fetch, async () => {
    const snap = await connect(ADDRESS, { token: TOKEN }).readSnapshot("main");
    assert.equal(fake.requests.length, 2, "the commit and the tree");
    await snap.readMany(paths);
    const queries = fake.graphqlRequests();
    assert.equal(queries.length, 3);
    assert.deepEqual(queries.map((q) => [...q.body.query.matchAll(/:object\(expression:/g)].length), [100, 100, 50]);
    for (const q of queries) {
      assert.equal(q.method, "POST");
      assert.equal(q.url.href, "https://api.github.com/graphql");
      assert.equal(q.headers.authorization, `Bearer ${TOKEN}`);
      assert.equal(q.url.href.includes(TOKEN) || JSON.stringify(q.body).includes(TOKEN), false);
    }
    for (const path of paths) assert.equal(await snap.read(path), held[path], path);
  });
  assert.equal(fake.contentRequests().length, 0);
  assert.equal(fake.requests.length, 5);
});

// A file the batch could not give — truncated, binary, or absent from the answer — is fetched by its own read; the others are not.
// TST-479002 · level: unit · module: MOD-repository-hosts
// guards: UC-006
// given: a fake GitHub holding 4 files; GraphQL answers one as truncated (text cut short), one as binary (text null), one whole, and the fourth as not given (null)
// input: readMany of the 4 paths, then read of each
// expect: 1 GraphQL request; reads give the exact full text of all 4; exactly 3 requests to /contents, one for each of the truncated, the binary and the not-given file, none for the whole one
test("readMany: a truncated, a binary or a not-given file is fetched by its own read", async () => {
  const held = { "a.md": "whole text\n", "b.md": "x".repeat(40), "c.bin": "binary-ish", "d.md": "not given\n" };
  const fake = fakeGitHub(held, { special: { "b.md": "truncated", "c.bin": "binary", "d.md": "absent" } });
  await using(fake.fetch, async () => {
    const snap = await connect(ADDRESS, { token: TOKEN }).readSnapshot("main");
    await snap.readMany(Object.keys(held));
    assert.equal(fake.graphqlRequests().length, 1);
    for (const path of Object.keys(held)) assert.equal(await snap.read(path), held[path], path);
  });
  const own = fake.contentRequests().map((r) => decodeURIComponent(r.url.pathname.split("/contents/")[1])).sort();
  assert.deepEqual(own, ["b.md", "c.bin", "d.md"]);
});

// On any other server, without a token, and in a clone, nothing is read ahead, and each read behaves as before.
// TST-479003 · level: unit · module: MOD-repository-hosts
// guards: UC-006; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a fake GitHub read without a token (its files come from the raw host), a fake GitLab project with a token, and a local clone with a token
// input: readMany of 3 paths, then read of each
// expect: readMany makes 0 requests in each case and resolves; no request goes to a /graphql address; each read gives the file's exact text
test("readMany: without a token, on GitLab and in a clone it reads nothing ahead", async () => {
  const held = files(3), paths = Object.keys(held);
  const raw = [];
  const noToken = async (input) => {
    const url = new URL(String(input));
    raw.push(url.href);
    const prefix = "/repos/bob/reader";
    if (url.pathname === `${prefix}/commits/main`) return json(200, { sha: COMMIT, commit: { tree: { sha: "t" } } });
    if (url.pathname === `${prefix}/git/trees/${COMMIT}`) return json(200, { tree: paths.map((path) => ({ path, type: "blob", sha: blobSha(held[path]) })) });
    const file = decodeURIComponent(url.pathname.split(`/${COMMIT}/`)[1] ?? "");
    return held[file] === undefined ? new Response("404", { status: 404 }) : new Response(held[file]);
  };
  await using(noToken, async () => {
    const snap = await connect(ADDRESS, {}).readSnapshot("main");
    const before = raw.length;
    await snap.readMany(paths);
    assert.equal(raw.length, before, "no request ahead");
    for (const path of paths) assert.equal(await snap.read(path), held[path]);
  });
  assert.equal(raw.some((href) => href.includes("/graphql")), false);

  const gitlab = [];
  const lab = async (input) => {
    const url = new URL(String(input));
    gitlab.push(url.href);
    const p = decodeURIComponent(url.pathname);
    if (p.endsWith("/repository/commits/main")) return json(200, { id: COMMIT });
    if (p.endsWith("/repository/tree")) return json(200, paths.map((path) => ({ path, type: "blob", id: blobSha(held[path]) })));
    const m = /\/repository\/files\/(.+)\/raw$/.exec(p);
    return m && held[m[1]] !== undefined ? new Response(held[m[1]]) : json(404, { message: "404 File Not Found" });
  };
  await using(lab, async () => {
    const snap = await connect(parseAddress("https://gitlab.example.org/bob/reader"), { token: "glpat-BOBreadMANY0123456789" }).readSnapshot("main");
    const before = gitlab.length;
    await snap.readMany(paths);
    assert.equal(gitlab.length, before, "no request ahead");
    for (const path of paths) assert.equal(await snap.read(path), held[path]);
  });
  assert.equal(gitlab.some((href) => href.includes("graphql")), false);

  const root = mkdtempSync(join(tmpdir(), "agent-m-read-many-"));
  try {
    const run = (...args) => { const r = spawnSync("git", args, { cwd: root, encoding: "utf8", env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" } }); assert.equal(r.status, 0, r.stderr); };
    run("init", "-q", "-b", "main");
    run("config", "user.email", "a@example.org");
    run("config", "user.name", "a");
    writeFileSync(join(root, "one.md"), "one\n");
    run("add", "-A");
    run("commit", "-q", "-m", "one");
    const seen = [];
    await using(async (input) => { seen.push(String(input)); return json(404, {}); }, async () => {
      const snap = await connect(ADDRESS, { token: TOKEN, clone: root }).readSnapshot("main");
      await snap.readMany(["one.md"]);
      assert.equal(await snap.read("one.md"), "one\n");
    });
    assert.deepEqual(seen, [], "a clone reaches no server");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// A batch request that fails in a way readSnapshot does not know leaves every file to its own read.
// TST-479004 · level: unit · module: MOD-repository-hosts
// guards: UC-006
// given: a fake GitHub with 3 files whose /graphql answers 404 (a server that serves none); a second whose /graphql answers 200 with something that is no GraphQL answer
// input: readMany of the 3 paths, then read of each
// expect: readMany resolves; the reads give the exact texts and each makes its own request to /contents (3)
test("readMany: a batch that fails in an unknown way reads nothing ahead; each read fetches its file", async () => {
  const held = files(3), paths = Object.keys(held);
  for (const answer of [() => json(404, { message: "Not Found" }), () => json(200, { data: null, errors: [{ message: "Something else" }] })]) {
    const fake = fakeGitHub(held, { graphql: answer });
    await using(fake.fetch, async () => {
      const snap = await connect(ADDRESS, { token: TOKEN }).readSnapshot("main");
      await snap.readMany(paths);
      for (const path of paths) assert.equal(await snap.read(path), held[path]);
    });
    assert.equal(fake.graphqlRequests().length, 1, "the batch is tried once");
    assert.equal(fake.contentRequests().length, 3);
  }
});

// A failure readSnapshot knows is the failure of readMany; a used-up limit is named, not blamed on the token.
// TST-479005 · level: unit · module: MOD-repository-hosts
// guards: UC-006; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a fake GitHub whose /graphql answers (a) 403 with X-RateLimit-Remaining: 0, (b) 200 with the error type RATE_LIMITED and X-RateLimit-Remaining: 0, (c) 401, (d) 403 without limit headers
// input: readMany of 3 paths for each
// expect: (a) and (b) fail with RateLimited, limit "account", never TokenRefused or PermissionMissing; (c) TokenRefused; (d) PermissionMissing; no read request to /contents is made by readMany itself
test("readMany: a used-up limit is named RateLimited, a refused token TokenRefused, a missing permission PermissionMissing", async () => {
  const held = files(3), paths = Object.keys(held);
  const limitHeaders = { "x-ratelimit-remaining": "0", "x-ratelimit-limit": "5000", "x-ratelimit-reset": "1893456000" };
  const cases = [
    [() => json(403, { message: "API rate limit exceeded" }, limitHeaders), "RateLimited"],
    [() => json(200, { data: null, errors: [{ type: "RATE_LIMITED", message: "API rate limit exceeded for user ID 1." }] }, limitHeaders), "RateLimited"],
    [() => json(401, { message: "Bad credentials" }), "TokenRefused"],
    [() => json(403, { message: "Resource not accessible by personal access token" }), "PermissionMissing"],
  ];
  for (const [answer, name] of cases) {
    const fake = fakeGitHub(held, { graphql: answer });
    const e = await using(fake.fetch, async () => {
      const snap = await connect(ADDRESS, { token: TOKEN }).readSnapshot("main");
      return failure(snap.readMany(paths));
    });
    assert.equal(e?.name, name);
    if (name === "RateLimited") {
      assert.equal(e.limit, "account");
      assert.equal(e.resetsAt.toISOString(), "2030-01-01T00:00:00.000Z");
    }
    assert.equal(fake.contentRequests().length, 0);
  }
});
