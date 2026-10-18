// The requests one traceGraph call sends, with and without code files (ITM-735) — MOD-trace-graph's traceGraph over a snapshot of
// MOD-repository-hosts' readSnapshot, as the accepted texts state it: traceGraph "names to the source's `readMany`, where it has one,
// every file it will read, then reads the repository's artifacts and code files as listed under Data"; "A code file of another
// extension is a node and is not read, so `readMany` is not told it".
// Run: node --test tests/trace-graph-code-requests.test.mjs
//
// Module: MOD-trace-graph
// Guards: UC-025; THE TRACEABILITY MATRIX IS DERIVED
// Level: component
//
// Deterministic, no network: a fake GitHub holds two recorded fixtures and records every request it sees, "<METHOD> <host><path>".
// - ARTIFACTS: SPEC.md and 150 backlog items, 151 files, every one of them an artifact the graph reads.
// - WITH CODE FILES: the 151 files and, in src/gen/, 100 JavaScript files (read for their imports) and 20 Ruby files (code files
//   whose imports are not read), 271 files in all.
// With a token one query of GraphQL names at most 100 files, so a call makes 2 requests for the commit and its tree and one for
// every hundred files it reads: ARTIFACTS 2 + ceil(151 / 100) = 4, WITH CODE FILES 2 + ceil((151 + 100) / 100) = 5 — the 20 Ruby files
// are not read. Without a token every file read is one request of its own: 2 + 151 = 153 and 2 + 151 + 100 = 253.
// The counter-proofs are recorded in the pull request.

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

// A fake GitHub holding `held` at COMMIT, answering the commit, the tree, a file's contents (with a token), a raw file (without
// one) and GraphQL.
function fakeGitHub(held) {
  const requests = [];
  const fetch = async (input, init = {}) => {
    const url = new URL(String(input)), method = init.method ?? "GET";
    requests.push(`${method} ${url.host}${url.pathname}`);
    const prefix = "/repos/alice/traced";
    if (url.host === "raw.githubusercontent.com") {
      const text = held[decodeURIComponent(url.pathname.slice(`/alice/traced/${COMMIT}/`.length))];
      return text === undefined ? json({ message: "Not Found" }, 404) : new Response(text);
    }
    if (url.pathname === "/graphql") {
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

// ARTIFACTS: SPEC.md and 150 backlog items.
function artifacts() {
  const held = { "SPEC.md": "# Spec\n\n**A THING IS DONE** *(Product Owner)*\n\nIt is done.\n" };
  for (let i = 0; i < 150; i++) {
    const id = `ITM-${String(i + 1).padStart(4, "0")}`;
    held[`docs/backlog/${id}-item.md`] = `---\nid: ${id}\ntitle: Item ${i}\nlevel: system\n---\n# ${id} Item ${i}\n`;
  }
  return held;
}

// WITH CODE FILES: ARTIFACTS, 100 JavaScript files and 20 Ruby files.
function withCodeFiles() {
  const held = artifacts();
  for (let i = 0; i < 100; i++) held[`src/gen/f${String(i).padStart(3, "0")}.mjs`] = `export const n = ${i};\n`;
  for (let i = 0; i < 20; i++) held[`src/gen/g${String(i).padStart(2, "0")}.rb`] = `N = ${i}\n`;
  return held;
}

// One traceGraph call over a snapshot of `held`, with or without a token: the graph and the requests seen.
async function call(held, options) {
  const fake = fakeGitHub(held);
  const graph = await using(fake.fetch, async () => traceGraph(await connect(ADDRESS, options).readSnapshot("main")));
  return { graph, requests: fake.requests };
}
const count = (requests, prefix) => requests.filter((request) => request.startsWith(prefix)).length;
const codeNodes = (graph) => [...graph.nodes.values()].filter((node) => node.kind === "code").length;

// TST-735009 · level: component · module: MOD-trace-graph
// guards: UC-025
// given: the fixtures ARTIFACTS (151 files) and WITH CODE FILES (271 files: ARTIFACTS, 100 .mjs files, 20 .rb files) in a fake GitHub; a host with a token
// input: one traceGraph call over a snapshot of each
// expect: ARTIFACTS makes 4 requests (2 POSTs of /graphql), WITH CODE FILES 5 (3 POSTs of /graphql), neither a GET of /contents; the graph of ARTIFACTS holds no code node, that of WITH CODE FILES 120 (100 .mjs and 20 .rb), 1 + 150 artifacts in each, nothing unread
test("TST-735009 with a token, code files add one batch for every hundred files of a language whose imports are read, and none for another", async () => {
  const without = await call(artifacts(), { token: TOKEN });
  const withCode = await call(withCodeFiles(), { token: TOKEN });
  assert.equal(without.requests.length, 4);
  assert.equal(count(without.requests, "POST api.github.com/graphql"), 2);
  assert.equal(withCode.requests.length, 5);
  assert.equal(count(withCode.requests, "POST api.github.com/graphql"), 3);
  assert.equal(count(withCode.requests, "GET api.github.com/repos/alice/traced/contents/"), 0);
  assert.equal(codeNodes(without.graph), 0);
  assert.equal(codeNodes(withCode.graph), 120);
  assert.equal([...withCode.graph.nodes.values()].filter((node) => node.kind === "ITM").length, 150);
  assert.deepEqual(withCode.graph.unread, []);
  assert.deepEqual(without.graph.unread, []);
});

// TST-735010 · level: component · module: MOD-trace-graph
// guards: UC-025
// given: the same two fixtures; a host without a token
// input: one traceGraph call over a snapshot of each
// expect: ARTIFACTS makes 153 requests, 151 of them raw reads and none a POST of /graphql; WITH CODE FILES 253, 251 raw reads — the 100 .mjs files are read, the 20 .rb files are not —; 120 code nodes in the second graph, nothing unread
test("TST-735010 without a token, every code file of a language whose imports are read is one request of its own, and the others none", async () => {
  const without = await call(artifacts(), {});
  const withCode = await call(withCodeFiles(), {});
  assert.equal(without.requests.length, 153);
  assert.equal(count(without.requests, "GET raw.githubusercontent.com/"), 151);
  assert.equal(count(without.requests, "POST api.github.com/graphql"), 0);
  assert.equal(withCode.requests.length, 253);
  assert.equal(count(withCode.requests, "GET raw.githubusercontent.com/"), 251);
  assert.equal(withCode.requests.some((request) => request.endsWith(".rb")), false);
  assert.equal(withCode.requests.some((request) => request.endsWith("/src/gen/f000.mjs")), true, "positive control: a read language is requested");
  assert.equal(codeNodes(withCode.graph), 120);
  assert.deepEqual(withCode.graph.unread, []);
});
