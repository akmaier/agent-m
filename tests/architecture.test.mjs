// Architecture on the review dashboard: status, acceptance and editing of ARC and MOD files — deterministic, no network.
// Run: node --test tests/*.test.mjs
//
// Module: MOD-review-core
// Guards: STATUS IS DERIVED FROM THE RECORDS; ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON; SEVERAL FILES ARE ACCEPTED IN ONE CLICK; AN APPROVAL NAMES THE EXACT TEXT; AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; GITLAB PRODUCTS ARE SUPPORTED; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; AN EDITED FILE KEEPS ITS IDENTIFIER; UC-022; UC-023
// Level: unit
//
// SPEC §11 ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS · AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; §10
// ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON · AN APPROVAL NAMES THE EXACT TEXT · STATUS IS DERIVED FROM THE RECORDS ·
// SEVERAL FILES ARE ACCEPTED IN ONE CLICK · A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE · AN EDITED FILE KEEPS ITS
// IDENTIFIER · GITLAB PRODUCTS ARE SUPPORTED (UC-022 step 8, 10, 10a; UC-023 steps 4–5, 4a–4c).
// The format of the files is checked in tests/architecture-format.test.mjs, the impact list and the component diagram in
// tests/architecture-impact.test.mjs, the dashboard's Architecture view in tests/architecture-view.test.mjs.
//
// The product is the fixture under tests/fixtures/architecture/. Counter-proofs are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md §8.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  gitBlobSha, approvalPath, recordText, parseRecord, reviewedRecord,
  deriveReviewedStatus, deriveUseCaseStatus, architecturePrerequisites,
  acceptItems, createReviewSession, saveReviewedFile,
  useCaseRecord,
} from "../docs/assets/review-core.mjs";
import { reviewedId, parseArchitecture } from "../docs/assets/artifacts.mjs";
import { parseProductAddress } from "../docs/assets/git-host.mjs";

const FIX = fileURLToPath(new URL("./fixtures/architecture/", import.meta.url));
const files = {};
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p); else files[relative(FIX, p).split("\\").join("/")] = readFileSync(p, "utf8");
  }
})(FIX);
const ARC = "docs/architecture/ARC-001-static-client.md", READER = "docs/architecture/MOD-reader.md";
const REVIEW = "docs/architecture/MOD-review.md", PAGE = "docs/architecture/MOD-page.md";
const UC1 = "docs/use-cases/UC-001-read-a-file.md", UC2 = "docs/use-cases/UC-002-show-the-status.md";
const archPaths = [ARC, READER, REVIEW, PAGE];
const click = { isTrusted: true };
const WHEN = new Date("2026-09-30T16:00:00Z");

async function withFetch(mock, f) {
  const real = globalThis.fetch;
  globalThis.fetch = mock;
  try { return await f(); } finally { globalThis.fetch = real; }
}

// A GitHub git-data API with branch main at c0; records the tree it is asked to commit.
function fakeGitHub(blobs = {}) {
  const calls = [];
  const fetchMock = async (u, init) => {
    const url = new URL(u), m = init.method, path = url.pathname;
    calls.push([m, path, init.headers?.Authorization, init.body ? JSON.parse(init.body) : null]);
    const ok = (o) => new Response(JSON.stringify(o), { status: 200 });
    if (m === "GET" && path.endsWith("/git/ref/heads/main")) return ok({ object: { sha: "c0" } });
    if (m === "GET" && path.endsWith("/git/commits/c0")) return ok({ tree: { sha: "t0" } });
    if (m === "GET" && path.includes("/contents/")) {
      const p = decodeURIComponent(path.split("/contents/")[1]);
      return p in blobs ? ok({ sha: blobs[p] }) : new Response("{}", { status: 404 });
    }
    if (m === "POST" && path.endsWith("/git/trees")) return ok({ sha: "t1" });
    if (m === "POST" && path.endsWith("/git/commits")) return ok({ sha: "c1", html_url: "https://github.com/a/b/commit/c1" });
    if (m === "PATCH" && path.endsWith("/git/refs/heads/main")) return ok({ object: { sha: "c1" } });
    return new Response("{}", { status: 500 });
  };
  return { calls, fetchMock };
}
const treeOf = (calls) => Object.fromEntries((calls.find(([m, p]) => m === "POST" && p.endsWith("/git/trees"))?.[3].tree ?? [])
  .map((f) => [f.path, f.content]));

// The use cases as the app holds them: path, blob, status, and the record naming the current text.
async function ucRecordFiles(which = [UC1, UC2]) {
  const out = {};
  for (const p of which) {
    const blob = await gitBlobSha(files[p]);
    out[approvalPath(reviewedId(p), blob)] = recordText(useCaseRecord(p, blob));
  }
  return out;
}
async function useCasesOf(repo) {
  const records = Object.entries(repo).filter(([p]) => p.startsWith("docs/approvals/")).map(([p, t]) => ({ ...parseRecord(t), _path: p }));
  return Promise.all([UC1, UC2].filter((p) => p in repo).map(async (p) => {
    const blob = await gitBlobSha(repo[p]);
    const status = deriveUseCaseStatus(p, blob, records);
    const record = records.find((r) => r.kind === "use-case" && r.file === p && r.blob === blob)?._path ?? null;
    return { id: reviewedId(p), path: p, blob, status, record };
  }));
}
const readerOf = (repo) => async (_head, p) => (p in repo ? repo[p] : null);

// ---------------------------------------------------------------- identifiers, records, status

test("STATUS IS DERIVED FROM THE RECORDS — ARC and MOD: open, accepted, changed; only records of their own kind count", async () => {
  const b = await gitBlobSha(files[READER]);
  assert.equal(deriveReviewedStatus(READER, b, []), "open");
  assert.equal(deriveReviewedStatus(READER, b, [reviewedRecord(READER, b)]), "accepted");
  assert.equal(deriveReviewedStatus(READER, b, [reviewedRecord(READER, "e".repeat(40))]), "changed");
  // Counter-proof: a record of another kind naming the same path and text does not accept it.
  assert.equal(deriveReviewedStatus(READER, b, [{ kind: "use-case", file: READER, blob: b }]), "open");
  assert.equal(deriveReviewedStatus(UC1, b, [reviewedRecord(UC1, b)]), "accepted", "use cases derive the same way");
});

// ---------------------------------------------------------------- ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS

test("ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — every named requirement in the SPEC, every named use case accepted", async () => {
  const repo = { ...files, ...(await ucRecordFiles()) };
  const useCases = await useCasesOf(repo);
  const ok = architecturePrerequisites({ arch: parseArchitecture(ARC, files[ARC]), specText: files["SPEC.md"], useCases });
  assert.deepEqual(ok.open, []);
  assert.deepEqual(ok.useCases.map((u) => u.id), ["UC-001"], "the accepted use cases the file rests on, with their records");
  assert.ok(ok.useCases[0].record && ok.useCases[0].blob);
  // UC-022 10a / UC-023 4b: each open item is named.
  const open = (text, ucs = useCases) => architecturePrerequisites({ arch: parseArchitecture(ARC, text), specText: files["SPEC.md"], useCases: ucs }).open;
  assert.deepEqual(open(files[ARC].replace("  - RULE ONE\n", "  - OLD RULE\n")).map((o) => o.name), ["OLD RULE"]);
  assert.match(open(files[ARC].replace("  - RULE ONE\n", "  - OLD RULE\n"))[0].reason, /withdrawn/);
  assert.deepEqual(open(files[ARC].replace("  - RULE ONE\n", "  - NO SUCH RULE\n")).map((o) => o.name), ["NO SUCH RULE"]);
  assert.match(open(files[ARC].replace("  - RULE ONE\n", "  - NO SUCH RULE\n"))[0].reason, /not in SPEC\.md/);
  assert.deepEqual(open(files[ARC].replace("  - UC-001\n", "  - UC-009\n")).map((o) => o.name), ["UC-009"]);
  const changedUc = useCases.map((u) => (u.id === "UC-001" ? { ...u, status: "changed", record: null } : u));
  assert.deepEqual(open(files[ARC], changedUc).map((o) => [o.name, o.reason]), [["UC-001", "changed since it was accepted"]]);
  const openUc = useCases.map((u) => (u.id === "UC-001" ? { ...u, status: "open", record: null } : u));
  assert.deepEqual(open(files[ARC], openUc).map((o) => [o.name, o.reason]), [["UC-001", "not accepted yet"]]);
  // A module's `realises` counts the same; `follows` (decisions) is not a prerequisite of the rule.
  assert.deepEqual(architecturePrerequisites({ arch: parseArchitecture(REVIEW, files[REVIEW]), specText: files["SPEC.md"], useCases }).open, []);
});

// ---------------------------------------------------------------- accepting

async function archItem(path, text, repo, extra = {}) {
  const arch = parseArchitecture(path, text);
  const pre = architecturePrerequisites({ arch, specText: repo["SPEC.md"], useCases: await useCasesOf(repo) });
  return { kind: arch.kind, id: arch.id, path, blob: await gitBlobSha(text), requires: pre.useCases, ...extra };
}
test("ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON — accepting an ARC and a MOD in one click: one commit, one record each", async () => {
  const repo = { ...files, ...(await ucRecordFiles()) };
  const s = createReviewSession();
  const a = await archItem(ARC, files[ARC], repo), m = await archItem(READER, files[READER], repo);
  s.show(a); s.show(m);
  assert.equal(s.tick(s.key(a), true), true);
  assert.equal(s.tick(s.key(m), true), true);
  assert.equal(s.tick("uc:" + REVIEW, true), false, "a file that was not shown cannot be ticked");
  const g = fakeGitHub();
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: s.items(), readAt: readerOf(repo), now: WHEN }));
  assert.deepEqual(res.leftOut, []);
  assert.deepEqual(res.accepted, ["ARC-001", "MOD-reader"]);
  const tree = treeOf(g.calls);
  assert.deepEqual(Object.keys(tree).sort(), [approvalPath("ARC-001", a.blob), approvalPath("MOD-reader", m.blob)].sort());
  assert.equal(tree[approvalPath("ARC-001", a.blob)], recordText(reviewedRecord(ARC, a.blob)));
  assert.equal(tree[approvalPath("MOD-reader", m.blob)], `kind: module\nfile: ${READER}\nblob: ${m.blob}\n`);
  assert.equal(g.calls.filter(([mm, p]) => mm === "POST" && p.endsWith("/git/commits")).length, 1);
  assert.ok(g.calls.every(([, , auth]) => auth === "Bearer github_pat_t"));
});

test("ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — checked again on the commit written on: a use case changed or a requirement withdrawn meanwhile leaves the file out", async () => {
  const repo = { ...files, ...(await ucRecordFiles()) };
  const a = await archItem(ARC, files[ARC], repo);
  // Meanwhile on the branch: UC-001 edited (no record names its new text).
  for (const [over, why] of [
    [{ [UC1]: files[UC1] + "edited\n" }, /UC-001/],
    [{ "SPEC.md": files["SPEC.md"].replace("**RULE ONE** *(PO, 2026-09-30)*", "**RULE ONE** *(PO, 2026-09-30 — withdrawn 2026-10-01)*") }, /RULE ONE/],
    [{ "SPEC.md": files["SPEC.md"].replace("**RULE ONE**", "**RULE 1**") }, /RULE ONE/],
  ]) {
    const g = fakeGitHub();
    const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
      items: [a], readAt: readerOf({ ...repo, ...over }), now: WHEN }));
    assert.equal(res.commit, null, String(why));
    assert.deepEqual(res.leftOut.map((l) => l.label), ["ARC-001"]);
    assert.match(res.leftOut[0].reason, why);
    assert.ok(!g.calls.some(([m]) => m === "POST" || m === "PATCH"), "nothing written");
  }
  // An item that carries no accepted use case for a UC its text names is left out too (the text decides, not the item).
  const g = fakeGitHub();
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: [{ ...a, requires: [] }], readAt: readerOf(repo), now: WHEN }));
  assert.equal(res.commit, null);
  assert.match(res.leftOut[0].reason, /UC-001/);
});

test("AN APPROVAL NAMES THE EXACT TEXT — an ARC changed after it was shown is left out and named", async () => {
  const repo = { ...files, ...(await ucRecordFiles()) };
  const a = await archItem(ARC, files[ARC], repo), m = await archItem(READER, files[READER], repo);
  const g = fakeGitHub();
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: [a, m], readAt: readerOf({ ...repo, [ARC]: files[ARC] + "more\n" }), now: WHEN }));
  assert.deepEqual(Object.keys(treeOf(g.calls)), [approvalPath("MOD-reader", m.blob)]);
  assert.deepEqual(res.leftOut.map((l) => l.label), ["ARC-001"]);
  assert.match(res.leftOut[0].reason, /changed after it was shown/);
});

test("AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a changed file whose impact list was not shown is left out", async () => {
  const repo = { ...files, ...(await ucRecordFiles()) };
  const m = await archItem(READER, files[READER], repo, { changed: true });
  const g = fakeGitHub();
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: [m], readAt: readerOf(repo), now: WHEN }));
  assert.equal(res.commit, null);
  assert.match(res.leftOut[0].reason, /impact list/);
  // Counter-proof: shown with its impact list, it is accepted.
  const g2 = fakeGitHub();
  const res2 = await withFetch(g2.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: [{ ...m, impactShown: true }], readAt: readerOf(repo), now: WHEN }));
  assert.deepEqual(res2.accepted, ["MOD-reader"]);
});

test("GITLAB PRODUCTS ARE SUPPORTED — an architecture file is accepted on GitLab by one commit with its project token", async () => {
  const GL = "https://gitlab.example.org", project = "grp/sub/proj", TOKEN = "glpat-projectTOKENvalue0123456789";
  const p = parseProductAddress(`${GL}/${project}`);
  const repo = { ...files, ...(await ucRecordFiles()) };
  const m = await archItem(READER, files[READER], repo);
  const calls = [], base = `/api/v4/projects/${encodeURIComponent(project)}`, H0 = "a".repeat(40);
  const ok = (o, status = 200) => new Response(JSON.stringify(o), { status });
  const fetchMock = async (u, init = {}) => {
    const url = new URL(u), rest = url.pathname.slice(base.length), method = (init.method || "GET").toUpperCase();
    calls.push({ origin: url.origin, method, rest, token: init.headers?.["PRIVATE-TOKEN"], auth: init.headers?.Authorization,
      body: init.body ? JSON.parse(init.body) : null });
    if (rest === "/repository/branches/main") return ok({ name: "main", commit: { id: H0 } });
    if (rest.startsWith("/repository/files/")) return ok({ message: "404 File Not Found" }, 404);
    if (rest === "/repository/commits" && method === "POST") return ok({ id: "c".repeat(40), parent_ids: [H0], web_url: `${GL}/${project}/-/commit/c` }, 201);
    return ok({ message: "unexpected" }, 500);
  };
  const res = await withFetch(fetchMock, () => acceptItems({ product: p, branch: "main", token: TOKEN, click, items: [m],
    readAt: readerOf(repo), now: WHEN }));
  assert.deepEqual(res.accepted, ["MOD-reader"]);
  const post = calls.filter((c) => c.method === "POST");
  assert.equal(post.length, 1);
  assert.deepEqual(post[0].body.actions, [{ action: "create", file_path: approvalPath("MOD-reader", m.blob),
    content: recordText(reviewedRecord(READER, m.blob)), encoding: "text" }]);
  assert.ok(calls.every((c) => c.origin === GL && c.token === TOKEN && c.auth === undefined), "only its server, only its token");
});

// ---------------------------------------------------------------- editing

test("AN EDITED FILE KEEPS ITS IDENTIFIER · A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE — ARC and MOD", async () => {
  const blob = await gitBlobSha(files[READER]);
  const edited = files[READER].replace("Reads the product's files", "Reads every file of the product");
  const g = fakeGitHub({ [READER]: blob });
  const c = await withFetch(g.fetchMock, () => saveReviewedFile({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    path: READER, text: edited, openedId: "MOD-reader", expectBlob: blob }));
  assert.equal(c.sha, "c1");
  assert.deepEqual(treeOf(g.calls), { [READER]: edited });
  // Refused: the identifier in the text is not the one the file was opened with — nothing is sent.
  for (const [text, id] of [[edited.replace("id: MOD-reader", "id: MOD-reader2"), "MOD-reader"],
    [files[ARC].replace("id: ARC-001", "id: ARC-002"), "ARC-001"], [edited.replace("id: MOD-reader\n", ""), "MOD-reader"]]) {
    const g2 = fakeGitHub({ [READER]: blob });
    await withFetch(g2.fetchMock, () => assert.rejects(saveReviewedFile({ repo: "a/b", branch: "main", token: "github_pat_t", click,
      path: READER, text, openedId: id, expectBlob: blob }), /identifier/));
    assert.equal(g2.calls.length, 0, "nothing sent");
  }
  // Refused: the file on the branch is no longer the text the editor opened.
  const g3 = fakeGitHub({ [READER]: "f".repeat(40) });
  await withFetch(g3.fetchMock, () => assert.rejects(saveReviewedFile({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    path: READER, text: edited, openedId: "MOD-reader", expectBlob: blob }), /changed since/));
  assert.ok(!g3.calls.some(([m]) => m === "PATCH"), "nothing written");
  // A file without an identifier (a SPEC proposal) is saved without that check.
  const g4 = fakeGitHub({ "docs/spec-freigaben/q/01-a.md": "x" });
  await withFetch(g4.fetchMock, () => saveReviewedFile({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    path: "docs/spec-freigaben/q/01-a.md", text: "## 1\n", openedId: null, expectBlob: "x" }));
  assert.ok(g4.calls.some(([m]) => m === "PATCH"));
});
