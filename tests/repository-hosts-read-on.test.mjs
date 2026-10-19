// MOD-repository-hosts' Snapshot.readOn (ITM-907), as the accepted text of docs/architecture/MOD-repository-hosts.md states it: "`readOn`
// gives the text of a file on another branch of the same repository, in one request, and `null` when the branch or the file does not
// exist".
// Run: node --test tests/repository-hosts-read-on.test.mjs
//
// Module: MOD-repository-hosts
// Guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A PAGE LOAD READS THE REPOSITORY IN BATCHES
// Level: unit
//
// Deterministic, no network: the GitHub server is a fake of `fetch` that answers as GitHub's REST API and its raw host answer
// ("Get a commit", "Get a tree", "Get repository content" with the raw media type; raw.githubusercontent.com/<owner>/<repo>/<ref>/<path>).
// It records every request. Each test states its expected requests and texts in its own text.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const TOKEN = "github_pat_BOBreadON0123456789abcdefghij";
const ADDRESS = parseAddress("https://github.com/bob/reader");
const COMMIT = "c0ffee00c0ffee00c0ffee00c0ffee00c0ffee00";
const STORED = '{"stored":"graph"}\n';
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// A fake GitHub whose default branch main holds README.md at COMMIT, and whose branch trace-cache holds `<COMMIT>.json` (STORED).
function fakeGitHub() {
  const requests = [];
  const fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const headers = Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
    requests.push({ method: init.method ?? "GET", url, headers });
    const prefix = "/repos/bob/reader";
    if (url.pathname === `${prefix}/commits/main`) return json(200, { sha: COMMIT, commit: { tree: { sha: "t" } } });
    if (url.pathname === `${prefix}/git/trees/${COMMIT}`) return json(200, { tree: [{ path: "README.md", type: "blob", sha: "a".repeat(40) }] });
    const onApi = url.pathname === `${prefix}/contents/${COMMIT}.json` && url.searchParams.get("ref") === "trace-cache";
    const onRaw = url.origin === "https://raw.githubusercontent.com" && url.pathname === `/bob/reader/trace-cache/${COMMIT}.json`;
    if (onApi || onRaw) return new Response(STORED, { status: 200 });
    return json(404, { message: "Not Found" });
  };
  return { fetch, requests };
}

async function using(fetchFn, run) {
  const real = globalThis.fetch;
  globalThis.fetch = fetchFn;
  try { return await run(); } finally { globalThis.fetch = real; }
}

// TST-907001 · level: unit · module: MOD-repository-hosts
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: a fake GitHub whose branch trace-cache holds c0ffee….json; a host with a token and a snapshot of main
// input: readOn("trace-cache", "c0ffee00c0ffee00c0ffee00c0ffee00c0ffee00.json")
// expect: the file's text; exactly one request more than the snapshot's two — a GET of https://api.github.com/repos/bob/reader/contents/c0ffee….json?ref=trace-cache with "Authorization: Bearer <token>" and the token in no address
test("readOn with a token reads a file of another branch in one request of the API", async () => {
  const fake = fakeGitHub();
  await using(fake.fetch, async () => {
    const snapshot = await connect(ADDRESS, { token: TOKEN }).readSnapshot("main");
    assert.equal(fake.requests.length, 2, "the commit and the tree");
    assert.equal(await snapshot.readOn("trace-cache", `${COMMIT}.json`), STORED);
    const [request] = fake.requests.slice(2);
    assert.equal(fake.requests.length, 3);
    assert.equal(request.method, "GET");
    assert.equal(request.url.href, `https://api.github.com/repos/bob/reader/contents/${COMMIT}.json?ref=trace-cache`);
    assert.equal(request.headers.authorization, `Bearer ${TOKEN}`);
  });
});

// TST-907002 · level: unit · module: MOD-repository-hosts
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: the same fake GitHub; a host without a token and a snapshot of main
// input: readOn("trace-cache", "c0ffee….json")
// expect: the file's text; exactly one request more than the snapshot's — a GET of https://raw.githubusercontent.com/bob/reader/trace-cache/c0ffee….json carrying no authorisation
test("readOn without a token reads a file of another branch from the raw host in one request", async () => {
  const fake = fakeGitHub();
  await using(fake.fetch, async () => {
    const snapshot = await connect(ADDRESS).readSnapshot("main");
    const before = fake.requests.length;
    assert.equal(await snapshot.readOn("trace-cache", `${COMMIT}.json`), STORED);
    const added = fake.requests.slice(before);
    assert.deepEqual(added.map((r) => [r.method, r.url.href, r.headers.authorization ?? null]),
      [["GET", `https://raw.githubusercontent.com/bob/reader/trace-cache/${COMMIT}.json`, null]]);
  });
});

// TST-907003 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: the same fake GitHub, with and without a token; the branch trace-cache holds only c0ffee….json
// input: readOn("trace-cache", "other.json") (a missing file); readOn("no-such-branch", "c0ffee….json") (a missing branch)
// expect: null for each, with and without a token, one request each, and no rejection
test("readOn gives null for a missing file and for a missing branch", async () => {
  for (const credentials of [{ token: TOKEN }, {}]) {
    const fake = fakeGitHub();
    await using(fake.fetch, async () => {
      const snapshot = await connect(ADDRESS, credentials).readSnapshot("main");
      const before = fake.requests.length;
      assert.equal(await snapshot.readOn("trace-cache", "other.json"), null);
      assert.equal(await snapshot.readOn("no-such-branch", `${COMMIT}.json`), null);
      assert.equal(fake.requests.length - before, 2);
    });
  }
});
