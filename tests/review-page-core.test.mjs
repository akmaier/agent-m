// The review page in the core — which files of one area a review page shows, which it counts, and the one commit that accepts
// them (docs/assets/review-core.mjs reviewPage, acceptItems). Deterministic, no network. Run: node --test tests/*.test.mjs
//
// Module: MOD-review-core
// Guards: SEVERAL FILES ARE ACCEPTED IN ONE CLICK; AN APPROVAL NAMES THE EXACT TEXT; ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-008; UC-022; UC-023
// Level: unit
//
// SPEC §10 SEVERAL FILES ARE ACCEPTED IN ONE CLICK (extended 2026-10-01, queue 2026-10-01c) · AN APPROVAL NAMES THE EXACT TEXT;
// §11 ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS · AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST (UC-008 3e,
// UC-022 step 10, UC-023 step 5). Moved out of tests/review-page.test.mjs, unchanged, when it was split by module; the page
// itself is checked there.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "../docs/assets/review-core.mjs";
import { parseArchitecture, reviewedId } from "../docs/assets/artifacts.mjs";

const { gitBlobSha, recordText, useCaseRecord, reviewedRecord, approvalPath, parseRecord,
  architecturePrerequisites, deriveReviewedStatus, deriveUseCaseStatus, acceptItems } = core;

// ---------------------------------------------------------------- the product: tests/fixtures/architecture, with records

const FIX = fileURLToPath(new URL("./fixtures/architecture/", import.meta.url));
const base = {};
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p); else base[relative(FIX, p).split("\\").join("/")] = readFileSync(p, "utf8");
  }
})(FIX);
const UC1 = "docs/use-cases/UC-001-read-a-file.md", UC2 = "docs/use-cases/UC-002-show-the-status.md";
const ARC = "docs/architecture/ARC-001-static-client.md", READER = "docs/architecture/MOD-reader.md";
const REVIEW = "docs/architecture/MOD-review.md", PAGE = "docs/architecture/MOD-page.md";
const ARCH = [ARC, PAGE, READER, REVIEW];
const click = { isTrusted: true };
const WHEN = new Date("2026-10-01T12:00:00Z");

// The texts accepted earlier, which the server still holds by their blob SHA.
const EARLIER = [];
// UC-001 and ARC-001 accepted; UC-002 and MOD-reader changed since acceptance; MOD-page and MOD-review never accepted.
// MOD-review realises UC-002, which is not accepted in its current text: it cannot be accepted (ARCHITECTURE RESTS ON
// ACCEPTED ARTIFACTS). MOD-page names nothing; MOD-reader names RULE ONE and UC-001, both accepted.
async function product() {
  const f = { ...base, "docs/use-cases/README.md": "# Use cases\n", "docs/approvals/README.md": "# Approval records\n" };
  const rec = async (id, path, text) => {
    const b = await gitBlobSha(text);
    if (text !== f[path]) EARLIER.push(text);
    f[approvalPath(id, b)] = recordText(path.includes("/use-cases/") ? useCaseRecord(path, b) : reviewedRecord(path, b));
  };
  await rec("UC-001", UC1, f[UC1]);
  await rec("UC-002", UC2, f[UC2].replace("Show the status", "Show a status"));
  await rec("ARC-001", ARC, f[ARC]);
  await rec("MOD-reader", READER, f[READER].replace("Reads files at", "Reads a file at"));
  return f;
}
const records = (repo) => Object.entries(repo).filter(([p]) => p.startsWith("docs/approvals/") && !p.endsWith("README.md"))
  .map(([p, t]) => ({ ...parseRecord(t), _path: p }));


// ---------------------------------------------------------------- the core: which files a review page counts

// A GitHub git-data API with branch main at c0; records the tree it is asked to commit.
function fakeGitHub() {
  const calls = [];
  const fetchMock = async (u, init) => {
    const url = new URL(u), m = init.method, path = url.pathname;
    calls.push([m, path, init.headers?.Authorization, init.body ? JSON.parse(init.body) : null]);
    const ok = (o) => new Response(JSON.stringify(o), { status: 200 });
    if (m === "GET" && path.endsWith("/git/ref/heads/main")) return ok({ object: { sha: "c0" } });
    if (m === "GET" && path.endsWith("/git/commits/c0")) return ok({ tree: { sha: "t0" } });
    if (m === "POST" && path.endsWith("/git/trees")) return ok({ sha: "t1" });
    if (m === "POST" && path.endsWith("/git/commits")) return ok({ sha: "c1", html_url: "https://github.com/a/b/commit/c1" });
    if (m === "PATCH" && path.endsWith("/git/refs/heads/main")) return ok({ object: { sha: "c1" } });
    return new Response("{}", { status: 500 });
  };
  return { calls, fetchMock };
}
async function withFetch(mock, f) {
  const real = globalThis.fetch;
  globalThis.fetch = mock;
  try { return await f(); } finally { globalThis.fetch = real; }
}
const treeOf = (calls) => Object.fromEntries((calls.find(([m, p]) => m === "POST" && p.endsWith("/git/trees"))?.[3].tree ?? [])
  .map((f) => [f.path, f.content]));
const readerOf = (repo) => async (_head, p) => (p in repo ? repo[p] : null);

// The architecture files as the page holds them: the item it would accept, the status, what the file waits for.
async function archEntries(repo) {
  const recs = records(repo);
  const useCases = await Promise.all([UC1, UC2].map(async (p) => {
    const blob = await gitBlobSha(repo[p]);
    return { id: reviewedId(p), path: p, blob, status: deriveUseCaseStatus(p, blob, recs),
      record: recs.find((r) => r.kind === "use-case" && r.file === p && r.blob === blob)?._path ?? null };
  }));
  return Promise.all(ARCH.map(async (path) => {
    const arch = parseArchitecture(path, repo[path]), blob = await gitBlobSha(repo[path]);
    const pre = architecturePrerequisites({ arch, specText: repo["SPEC.md"], useCases });
    const status = deriveReviewedStatus(path, blob, recs), changed = status !== "accepted" && core.recordsForId(recs, arch.id).length > 0;
    return { item: { kind: arch.kind, id: arch.id, path, blob, requires: pre.useCases, changed, ...(changed ? { impactShown: true } : {}) },
      status, open: pre.open };
  }));
}
test("reviewPage: every file that is not accepted is shown; those that can be accepted are counted; one that waits is named with what is open", async () => {
  const page = core.reviewPage(await archEntries(await product()));
  assert.deepEqual(page.shown.map((f) => f.item.id), ["MOD-page", "MOD-reader", "MOD-review"], "in the page's order; ARC-001 is accepted");
  assert.deepEqual(page.items.map((i) => i.id), ["MOD-page", "MOD-reader"]);
  assert.deepEqual(page.blocked.map((b) => [b.label, b.open.map((o) => o.name)]), [["MOD-review", ["UC-002"]]]);
  // A file the page could not show as it must be — here a change without its impact list — is shown, not counted, and named.
  const entries = await archEntries(await product());
  const noImpact = entries.map((e) => (e.item.id === "MOD-reader" ? { ...e, item: { ...e.item, impactShown: false } } : e));
  const p2 = core.reviewPage(noImpact);
  assert.deepEqual(p2.items.map((i) => i.id), ["MOD-page"]);
  assert.deepEqual(p2.blocked.map((b) => b.label), ["MOD-reader", "MOD-review"]);
  assert.match(p2.blocked[0].problem, /impact list/);
  const p3 = core.reviewPage(entries.map((e) => (e.item.id === "MOD-page" ? { ...e, problem: "the text read differs from the tree" } : e)));
  assert.deepEqual(p3.items.map((i) => i.id), ["MOD-reader"]);
  assert.deepEqual(p3.blocked.map((b) => [b.label, b.problem]), [["MOD-page", "the text read differs from the tree"], ["MOD-review", null]]);
});

test("SEVERAL FILES ARE ACCEPTED IN ONE CLICK — a review page's items: one commit, one record per file shown and counted, none for any other", async () => {
  const repo = await product();
  const page = core.reviewPage(await archEntries(repo));
  const g = fakeGitHub();
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: page.items, readAt: readerOf(repo), now: WHEN }));
  assert.deepEqual(res.leftOut, []);
  assert.equal(g.calls.filter(([m, p]) => m === "POST" && p.endsWith("/git/commits")).length, 1, "one commit");
  const tree = treeOf(g.calls);
  const want = await Promise.all([PAGE, READER].map(async (p) => approvalPath(reviewedId(p), await gitBlobSha(repo[p]))));
  assert.deepEqual(Object.keys(tree).sort(), want.sort(), "no record for ARC-001 (accepted), MOD-review (waits) or a use case");
  for (const p of [PAGE, READER]) {
    assert.equal(tree[approvalPath(reviewedId(p), await gitBlobSha(repo[p]))], recordText(reviewedRecord(p, await gitBlobSha(repo[p]))),
      `${p}: the record names the text shown`);
  }
  // Counter-proof: MOD-review, passed in anyway, is left out on the commit written on and named with the use case it waits for.
  const blocked = page.shown.find((f) => f.item.id === "MOD-review").item;
  const g2 = fakeGitHub();
  const res2 = await withFetch(g2.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: [blocked], readAt: readerOf(repo), now: WHEN }));
  assert.equal(res2.commit, null);
  assert.match(res2.leftOut[0].reason, /UC-002/);
  // Counter-proof of the counter-proof: with UC-002 accepted in its current text, MOD-review is counted.
  const accepted = { ...repo, [approvalPath("UC-002", await gitBlobSha(repo[UC2]))]: recordText(useCaseRecord(UC2, await gitBlobSha(repo[UC2]))) };
  assert.deepEqual(core.reviewPage(await archEntries(accepted)).items.map((i) => i.id), ["MOD-page", "MOD-reader", "MOD-review"]);
});

test("counter-proof: a file changed after the review page was built is left out and named; the others are still written", async () => {
  const repo = await product();
  const page = core.reviewPage(await archEntries(repo));
  const g = fakeGitHub();
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: page.items, readAt: readerOf({ ...repo, [PAGE]: repo[PAGE] + "edited\n" }), now: WHEN }));
  assert.deepEqual(Object.keys(treeOf(g.calls)), [approvalPath("MOD-reader", await gitBlobSha(repo[READER]))]);
  assert.deepEqual(res.leftOut.map((l) => l.label), ["MOD-page"]);
  assert.match(res.leftOut[0].reason, /changed after it was shown/);
});
