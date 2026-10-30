// MOD-repository-hosts' readSnapshot with `folders` (ITM-1266), as the accepted text of docs/architecture/MOD-repository-hosts.md states it:
// "With `folders` — paths of folders or files —, the snapshot's `paths` are only the files at every depth of those folders and the files
// named, each with its blob: with a token on GitHub, two requests, the commit and then the entries of all of them in one request of the
// server's batch query; elsewhere the whole tree is read and narrowed to them. A read of a path outside them fails with `OutsideSnapshot`,
// naming the path, and never answers as if the file did not exist." The whole-tree read refuses a tree GitHub answers as truncated
// (ITM-1266's Outcome: "The whole-tree read refuses a truncated tree with an error that names it, never a partial list").
// Run: node --test tests/repository-hosts-snapshot-folders.test.mjs
//
// Module: MOD-repository-hosts
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit
//
// Deterministic, no network: the GitHub server is a fake of `fetch` that answers as GitHub's REST API ("Get a commit", "Get a tree" with
// recursive=1 and its `truncated` flag, "Get repository content") and its GraphQL API answer: `repository.object(expression: "<commit>:<path>")`
// on a Tree gives its `entries` — each with its `name`, `type` ("blob" or "tree") and `oid`, and a tree entry's `object` with its own entries
// only as deep as the query nests them —, on a Blob its `oid`. It records every request. Each test states its expected paths and requests.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const TOKEN = "github_pat_BOBfolders0123456789abcdefgh";
const ADDRESS = parseAddress("https://github.com/bob/reader");
const COMMIT = "c0ffee00c0ffee00c0ffee00c0ffee00c0ffee00";
const blobSha = (t) => createHash("sha1").update(`blob ${Buffer.byteLength(t)}\0${t}`).digest("hex");
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);

// The repository at COMMIT: two use cases, one of them a folder deep, two records, the SPEC, a job record, a README, and a source seven folders deep.
const FILES = {
  "README.md": "# Reader\n",
  "SPEC.md": "# SPEC\n",
  "docs/use-cases/UC-001-read.md": "# UC-001 Read\n",
  "docs/use-cases/drafts/UC-002-show.md": "# UC-002 Show\n",
  "docs/approvals/UC-001-0123456789ab.md": "kind: use-case\n",
  "docs/approvals/README.md": "# Records\n",
  "docs/jobs/JOB-1.md": "# JOB-1\n",
  "docs/sources/SRC-a/v1/part/one/two/three/four.md": "# deep\n",
};

async function using(fetchFn, run) {
  const real = globalThis.fetch;
  globalThis.fetch = fetchFn;
  try { return await run(); } finally { globalThis.fetch = real; }
}

// A fake GitHub holding FILES at COMMIT; `truncated` marks the recursive tree as GitHub marks a tree it did not give whole.
function fakeGitHub({ truncated = false } = {}) {
  const requests = [];
  const entriesOf = (folder, depth) => {
    const below = new Map();
    for (const path of Object.keys(FILES)) {
      if (!path.startsWith(`${folder}/`)) continue;
      const [name, ...rest] = path.slice(folder.length + 1).split("/");
      below.set(name, rest.length ? "tree" : "blob");
    }
    return [...below].map(([name, type]) => (type === "blob" ? { name, type, oid: blobSha(FILES[`${folder}/${name}`]) }
      : { name, type, oid: "e".repeat(40), ...(depth > 1 ? { object: { entries: entriesOf(`${folder}/${name}`, depth - 1) } } : {}) }));
  };
  const fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    const headers = Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
    const method = init.method ?? "GET";
    const body = typeof init.body === "string" ? JSON.parse(init.body) : null;
    requests.push({ method, url, headers, body });
    const prefix = "/repos/bob/reader";
    if (method === "GET" && url.pathname === `${prefix}/commits/main`) return json(200, { sha: COMMIT, commit: { tree: { sha: "t".repeat(40) } } });
    if (method === "GET" && url.pathname === `${prefix}/git/trees/${COMMIT}`) {
      return json(200, { sha: "t".repeat(40), truncated, tree: Object.keys(FILES).map((path) => ({ path, type: "blob", sha: blobSha(FILES[path]) })) });
    }
    if (method === "GET" && url.pathname.startsWith(`${prefix}/contents/`)) {
      const path = decodeURIComponent(url.pathname.slice(`${prefix}/contents/`.length));
      return path in FILES ? new Response(FILES[path], { status: 200 }) : json(404, { message: "Not Found" });
    }
    if (method === "POST" && url.href === "https://api.github.com/graphql") {
      const query = body.query, fields = [...query.matchAll(/(\w+):object\(expression:("(?:[^"\\]|\\.)*")\)/g)];
      const repository = {};
      for (const [i, m] of fields.entries()) {
        const expression = JSON.parse(m[2]), path = expression.slice(expression.indexOf(":") + 1);
        const depth = (query.slice(m.index, fields[i + 1]?.index ?? query.length).match(/entries\{/g) ?? []).length;
        repository[m[1]] = path in FILES ? { oid: blobSha(FILES[path]) }
          : Object.keys(FILES).some((each) => each.startsWith(`${path}/`)) ? { entries: entriesOf(path, depth) } : null;
      }
      return json(200, { data: { repository } });
    }
    return json(404, { message: "Not Found" });
  };
  return { fetch, requests };
}

const asked = (requests) => requests.map((r) => `${r.method} ${r.url.origin}${r.url.pathname}`);
const sorted = (list) => [...list].sort();

// TST-1266001 · level: unit · module: MOD-repository-hosts
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a fake GitHub holding two use cases (one a folder deep), two records, the SPEC, a job record, a README and a deep source; a host with a token
// input: readSnapshot("main", { folders: ["docs/use-cases", "docs/approvals", "SPEC.md"] })
// expect: two requests — the commit (GET …/commits/main) and one POST https://api.github.com/graphql with the token —, no request of git/trees; the snapshot's paths exactly the two use cases, the two records and SPEC.md, each with its blob SHA
test("readSnapshot with folders sends the commit and one GraphQL request, and holds exactly the files of those folders", async () => {
  const fake = fakeGitHub();
  await using(fake.fetch, async () => {
    const snapshot = await connect(ADDRESS, { token: TOKEN }).readSnapshot("main", { folders: ["docs/use-cases", "docs/approvals", "SPEC.md"] });
    assert.deepEqual(asked(fake.requests), ["GET https://api.github.com/repos/bob/reader/commits/main", "POST https://api.github.com/graphql"]);
    assert.equal(fake.requests[1].headers.authorization, `Bearer ${TOKEN}`);
    const held = ["SPEC.md", "docs/approvals/README.md", "docs/approvals/UC-001-0123456789ab.md", "docs/use-cases/UC-001-read.md", "docs/use-cases/drafts/UC-002-show.md"];
    assert.equal(snapshot.commit, COMMIT);
    assert.deepEqual(sorted(snapshot.paths), held);
    for (const path of held) assert.equal(snapshot.blob(path), blobSha(FILES[path]), path);
  });
});

// TST-1266002 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: the snapshot of TST-1266001, of docs/use-cases, docs/approvals and SPEC.md
// input: read("docs/jobs/JOB-1.md"), blob("docs/jobs/JOB-1.md") and readMany(["docs/jobs/JOB-1.md"]) — a file the commit holds outside them; read of a file inside
// expect: each fails with OutsideSnapshot naming docs/jobs/JOB-1.md, none answers as if the file did not exist, and no request is sent for them; counter-proof: the read of docs/use-cases/UC-001-read.md gives its text
test("a read outside the folders fails with OutsideSnapshot, naming the path", async () => {
  const fake = fakeGitHub();
  await using(fake.fetch, async () => {
    const snapshot = await connect(ADDRESS, { token: TOKEN }).readSnapshot("main", { folders: ["docs/use-cases", "docs/approvals", "SPEC.md"] });
    const before = fake.requests.length;
    const outside = "docs/jobs/JOB-1.md";
    for (const refused of [await failure(snapshot.read(outside)), (() => { try { snapshot.blob(outside); return null; } catch (e) { return e; } })(),
      await failure(snapshot.readMany([outside]))]) {
      assert.equal(refused?.name, "OutsideSnapshot");
      assert.equal(refused.path, outside);
      assert.match(refused.message, /docs\/jobs\/JOB-1\.md/);
    }
    assert.equal(fake.requests.length, before, "no request for a path outside the folders");
    assert.equal(await snapshot.read("docs/use-cases/UC-001-read.md"), FILES["docs/use-cases/UC-001-read.md"]);
  });
});

// TST-1266003 · level: unit · module: MOD-repository-hosts
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fake GitHub, whose source docs/sources/SRC-a/v1/part/one/two/three/four.md lies seven folders below docs/sources, deeper than one query of entries nests
// input: readSnapshot("main", { folders: ["docs/sources"] }) with a token
// expect: the snapshot holds that file with its blob; no request of git/trees is sent
test("readSnapshot with folders finds a file at every depth of a folder", async () => {
  const fake = fakeGitHub();
  await using(fake.fetch, async () => {
    const snapshot = await connect(ADDRESS, { token: TOKEN }).readSnapshot("main", { folders: ["docs/sources"] });
    const deep = "docs/sources/SRC-a/v1/part/one/two/three/four.md";
    assert.deepEqual(snapshot.paths, [deep]);
    assert.equal(snapshot.blob(deep), blobSha(FILES[deep]));
    assert.deepEqual(asked(fake.requests).filter((r) => r.includes("/git/trees/")), []);
  });
});

// TST-1266004 · level: unit · module: MOD-repository-hosts
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the fake GitHub; a host with a token
// input: readSnapshot("main") — no folders
// expect: counter-proof of TST-1266001, unchanged: the commit and the recursive tree (GET …/git/trees/<commit>?recursive=1), no GraphQL request, and every file of the commit among the paths
test("readSnapshot without folders reads the commit and the whole recursive tree, as before", async () => {
  const fake = fakeGitHub();
  await using(fake.fetch, async () => {
    const snapshot = await connect(ADDRESS, { token: TOKEN }).readSnapshot("main");
    assert.deepEqual(asked(fake.requests), ["GET https://api.github.com/repos/bob/reader/commits/main", `GET https://api.github.com/repos/bob/reader/git/trees/${COMMIT}`]);
    assert.equal(fake.requests[1].url.searchParams.get("recursive"), "1");
    assert.deepEqual(sorted(snapshot.paths), sorted(Object.keys(FILES)));
    assert.equal(await snapshot.read("docs/jobs/JOB-1.md"), FILES["docs/jobs/JOB-1.md"]);
  });
});

// TST-1266005 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a fake GitHub that answers the recursive tree with truncated: true, as GitHub does above 100,000 entries or 7 MB
// input: readSnapshot("main") with a token, and without one
// expect: each fails with Unreachable, its reason naming the truncated tree of the commit — never a snapshot of the partial list
test("readSnapshot refuses a tree GitHub answers as truncated, by name", async () => {
  for (const credentials of [{ token: TOKEN }, {}]) {
    const fake = fakeGitHub({ truncated: true });
    await using(fake.fetch, async () => {
      const refused = await failure(connect(ADDRESS, credentials).readSnapshot("main"));
      assert.equal(refused?.name, "Unreachable");
      assert.match(refused.reason, /truncated/);
      assert.match(refused.reason, new RegExp(COMMIT));
    });
  }
});

// TST-1266006 · level: unit · module: MOD-repository-hosts
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: the fake GitHub; a host without a token, which cannot send GitHub's GraphQL request
// input: readSnapshot("main", { folders: ["docs/use-cases", "SPEC.md"] }), then read("README.md")
// expect: the whole tree is read (the commit and the recursive tree, no GraphQL request) and narrowed: the paths are the two use cases and SPEC.md; README.md, outside them, fails with OutsideSnapshot
test("without a token readSnapshot with folders reads the whole tree and narrows it", async () => {
  const fake = fakeGitHub();
  await using(fake.fetch, async () => {
    const snapshot = await connect(ADDRESS).readSnapshot("main", { folders: ["docs/use-cases", "SPEC.md"] });
    assert.deepEqual(asked(fake.requests), ["GET https://api.github.com/repos/bob/reader/commits/main", `GET https://api.github.com/repos/bob/reader/git/trees/${COMMIT}`]);
    assert.deepEqual(sorted(snapshot.paths), ["SPEC.md", "docs/use-cases/UC-001-read.md", "docs/use-cases/drafts/UC-002-show.md"]);
    assert.equal((await failure(snapshot.read("README.md")))?.name, "OutsideSnapshot");
  });
});
