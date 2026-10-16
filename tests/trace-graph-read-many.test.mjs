// MOD-trace-graph's traceGraph with MOD-repository-hosts' Snapshot.readMany (ITM-479), as the accepted texts state it:
// TextSource — "`readMany`, where the source offers it, is told every path the graph will read before the first `read`, so that
// a source on a server reads them in batches"; traceGraph — "names to the source's `readMany`, where it has one, every file it
// will read, then reads the repository's artifacts and code files as listed under Data".
// Run: node --test tests/trace-graph-read-many.test.mjs
//
// Module: MOD-trace-graph
// Guards: UC-006; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// Level: component
//
// Deterministic, no network: the first test builds one trace graph over a snapshot of a fake GitHub that holds 1,332 files, the
// number of files of this repository's one trace graph, and counts the requests the fake sees; the others give traceGraph a
// TextSource built here. One query of GraphQL names 100 files (the value ITM-479's pull request records with the page it was
// read from), so the bound is written out: 2 + ceil(1332 / 100) = 2 + 14 = 16 requests.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { traceGraph } from "../src/trace-graph/index.mjs";

const TOKEN = "github_pat_ALICEtraceGRAPH0123456789abcdef";
const ADDRESS = parseAddress("https://github.com/alice/traced");
const COMMIT = "abcdef00abcdef00abcdef00abcdef00abcdef00";
const sha1 = (s) => createHash("sha1").update(s).digest("hex");
const blobSha = (t) => sha1(`blob ${Buffer.byteLength(t)}\0${t}`);
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// A fake GitHub holding `held` at COMMIT, answering the commit, the tree, a file's contents and GraphQL; `requests` lists the
// requests seen, "<METHOD> <path>".
function fakeGitHub(held, { graphql = true } = {}) {
  const requests = [];
  const fetch = async (input, init = {}) => {
    const url = new URL(String(input)), method = init.method ?? "GET";
    requests.push(`${method} ${url.pathname}`);
    const prefix = "/repos/alice/traced";
    if (url.pathname === "/graphql") {
      if (!graphql) return json({ message: "Not Found" }, 404);
      const repository = {};
      for (const [, alias, expression] of JSON.parse(init.body).query.matchAll(/(\w+):object\(expression:("(?:[^"\\]|\\.)*")\)/g)) {
        const text = held[JSON.parse(expression).slice(41)];
        repository[alias] = text === undefined ? null : { text, isTruncated: false, isBinary: false, byteSize: Buffer.byteLength(text) };
      }
      return json({ data: { repository } });
    }
    if (url.pathname === `${prefix}/commits/main`) return json({ sha: COMMIT, commit: { tree: { sha: "t" } } });
    if (url.pathname === `${prefix}/git/trees/${COMMIT}`) {
      return json({ tree: Object.entries(held).map(([path, text]) => ({ path, type: "blob", sha: blobSha(text) })) });
    }
    if (url.pathname.startsWith(`${prefix}/contents/`)) {
      const text = held[decodeURIComponent(url.pathname.slice(`${prefix}/contents/`.length))];
      return text === undefined ? json({ message: "Not Found" }, 404) : new Response(text);
    }
    return json({ message: "Not Found" }, 404);
  };
  return { fetch, requests };
}

async function using(fetchFn, run) {
  const real = globalThis.fetch;
  globalThis.fetch = fetchFn;
  try { return await run(); } finally { globalThis.fetch = real; }
}

// SPEC.md and 1,331 backlog items: 1,332 files, every one of them an artifact the graph reads.
function repositoryOf1332Files() {
  const held = { "SPEC.md": "# Spec\n\n**A THING IS DONE** *(Product Owner)*\n\nIt is done.\n" };
  for (let i = 0; i < 1331; i++) {
    const id = `ITM-${String(i + 1).padStart(4, "0")}`;
    held[`docs/backlog/${id}-item.md`] = `---\nid: ${id}\ntitle: Item ${i}\nlevel: system\n---\n# ${id} Item ${i}\n`;
  }
  return held;
}

// The regression of akmaier's report: one trace graph over 1,332 files made 2 + 1,332 requests, one for each file.
// TST-479006 · level: component · module: MOD-trace-graph
// guards: UC-006
// given: a fake GitHub holding 1,332 files (SPEC.md and 1,331 backlog items); a host with a token; a snapshot of its main branch
// input: traceGraph(snapshot)
// expect: at most 2 + ceil(1332 / 100) = 16 requests in all, from the host connect to the finished graph, of which none is a GET of /contents and 14 are POSTs of /graphql; the graph holds 1,331 items and the requirement, and lists nothing as unread
test("traceGraph over a snapshot of 1,332 files makes at most 16 requests", async () => {
  const held = repositoryOf1332Files();
  assert.equal(Object.keys(held).length, 1332);
  const fake = fakeGitHub(held);
  const graph = await using(fake.fetch, async () => traceGraph(await connect(ADDRESS, { token: TOKEN }).readSnapshot("main")));
  assert.ok(fake.requests.length <= 16, `${fake.requests.length} requests`);
  assert.equal(fake.requests.filter((r) => r.includes("/contents/")).length, 0);
  assert.equal(fake.requests.filter((r) => r === "POST /graphql").length, 14);
  assert.equal([...graph.nodes.values()].filter((n) => n.kind === "ITM").length, 1331);
  assert.equal(graph.nodes.has("A THING IS DONE"), true);
  assert.deepEqual(graph.unread, []);
});

// Where the server serves no GraphQL, the same graph is built with a request for each file, as before.
// TST-479007 · level: component · module: MOD-trace-graph
// guards: UC-006
// given: a fake GitHub holding 12 files (SPEC.md and 11 backlog items) whose /graphql answers 404
// input: traceGraph(snapshot)
// expect: the graph holds the 11 items and the requirement, nothing unread; 12 GETs of /contents and 1 failed POST of /graphql
test("traceGraph on a server that serves no GraphQL reads each file on its own", async () => {
  const held = {};
  const all = repositoryOf1332Files();
  for (const path of Object.keys(all).slice(0, 12)) held[path] = all[path];
  const fake = fakeGitHub(held, { graphql: false });
  const graph = await using(fake.fetch, async () => traceGraph(await connect(ADDRESS, { token: TOKEN }).readSnapshot("main")));
  assert.equal([...graph.nodes.values()].filter((n) => n.kind === "ITM").length, 11);
  assert.deepEqual(graph.unread, []);
  assert.equal(fake.requests.filter((r) => r.includes("/contents/")).length, 12);
  assert.equal(fake.requests.filter((r) => r === "POST /graphql").length, 1);
});

// traceGraph names to readMany every path it will read, once, before its first read: the artifacts, not the other files.
// TST-479008 · level: unit · module: MOD-trace-graph
// guards: UC-006
// given: a TextSource listing SPEC.md, a use case, a backlog item, a README and a code file, with readMany and read that record their calls in one log
// input: traceGraph(source)
// expect: the log starts with one call readMany(["SPEC.md", "docs/use-cases/UC-001-a.md", "docs/backlog/ITM-001-a.md"]) — the three artifacts the graph reads, in the order of source.paths — and all reads come after it; README.md and src/a.mjs are not named
test("traceGraph tells readMany every path it will read, once, before the first read", async () => {
  const held = {
    "SPEC.md": "# Spec\n\n**A THING IS DONE** *(Product Owner)*\n\nIt is done.\n",
    "docs/use-cases/UC-001-a.md": "---\nid: UC-001\ntitle: A\nrealises:\n  - A THING IS DONE\n---\n# UC-001 A\n",
    "docs/backlog/ITM-001-a.md": "---\nid: ITM-001\ntitle: A\nlevel: system\n---\n# ITM-001 A\n",
    "README.md": "# readme\n",
    "src/a.mjs": "export const a = 1;\n",
  };
  const log = [];
  const source = { paths: Object.keys(held),
    readMany: async (paths) => { log.push(["readMany", [...paths]]); },
    read: async (path) => { log.push(["read", path]); return held[path] ?? null; } };
  const graph = await traceGraph(source);
  assert.deepEqual(log[0], ["readMany", ["SPEC.md", "docs/use-cases/UC-001-a.md", "docs/backlog/ITM-001-a.md"]]);
  assert.equal(log.filter(([what]) => what === "readMany").length, 1);
  assert.deepEqual(log.slice(1).map(([, path]) => path), ["SPEC.md", "docs/use-cases/UC-001-a.md", "docs/backlog/ITM-001-a.md"]);
  assert.equal(graph.nodes.has("UC-001"), true);
});

// A source without readMany is read as before; a readMany that fails is the failure of traceGraph.
// TST-479009 · level: unit · module: MOD-trace-graph
// guards: UC-006; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// given: a TextSource without readMany; one whose readMany rejects with an error named RateLimited
// input: traceGraph of each
// expect: the first builds its graph (the item is a node); the second rejects with that same error, and no read was made
test("traceGraph reads a source without readMany as before, and passes on a failure of readMany", async () => {
  const held = { "docs/backlog/ITM-001-a.md": "---\nid: ITM-001\ntitle: A\nlevel: system\n---\n# ITM-001 A\n" };
  const plain = await traceGraph({ paths: Object.keys(held), read: async (path) => held[path] });
  assert.equal(plain.nodes.has("ITM-001"), true);
  const limit = Object.assign(new Error("limit used up"), { name: "RateLimited" });
  let reads = 0;
  const e = await traceGraph({ paths: Object.keys(held), readMany: async () => { throw limit; }, read: async () => { reads += 1; return null; } })
    .then(() => null, (error) => error);
  assert.equal(e, limit);
  assert.equal(reads, 0);
});
