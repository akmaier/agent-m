// The review page — every open file of one area on one page, and one click that accepts everything it showed. Deterministic, no
// network: the core (docs/assets/review-core.mjs) on the fixture product of tests/fixtures/architecture, and the real app
// (docs/assets/review-app.mjs) in tests/app-harness.mjs against a GitHub API mock that counts every request and takes commits.
//
// SPEC §10 SEVERAL FILES ARE ACCEPTED IN ONE CLICK (extended 2026-10-01, queue 2026-10-01c) · AN APPROVAL NAMES THE EXACT TEXT ·
// A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT · THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK · EVERY STEP EXPLAINS
// ITSELF; §11 ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS · AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
// (UC-008 3e, UC-022 step 10, UC-023 step 5).

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "../docs/assets/review-core.mjs";
import { parseArchitecture, reviewedId } from "../docs/assets/artifacts.mjs";
import { repoServer, fakeCaches, openDashboard, REPO } from "./app-harness.mjs";

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

test("parseArchitecture: a withdrawn decision or module carries its date, its replacement and its note", () => {
  const p = "docs/architecture/ARC-008-correction-loop-as-one-harness.md";
  const w = parseArchitecture(p, readFileSync(new URL(`../${p}`, import.meta.url), "utf8")).withdrawn;
  assert.equal(w.date, "2026-10-01");
  assert.equal(w.replacedBy, "ARC-007");
  assert.match(w.note, /^Merged into ARC-007 on 2026-10-01/);
  assert.equal(parseArchitecture(ARC, base[ARC]).withdrawn, null, "counter-proof: a file not withdrawn has none");
});

// ---------------------------------------------------------------- the app: the page, the click, what it reads

const server = async (files) => repoServer({ files, history: EARLIER });
const files = (requests) => requests.filter((r) => r.startsWith("file ")).map((r) => r.slice(5)).sort();
const writesOf = (requests) => requests.filter((r) => /^write /.test(r) || r === "ref" || r === "commit object");
// The part of the page that shows one file.
function section(html, id) {
  const at = html.indexOf(`id="review-${id}"`);
  if (at < 0) return null;
  const end = html.indexOf('id="review-', at + 1);
  return html.slice(at, end < 0 ? html.length : end);
}

test("the architecture's review page shows every open or changed file in sequence — new in full, changed as a difference with its impact list, a waiting one marked", async () => {
  const repo = await product();
  const page = await openDashboard({ server: await server(repo), hash: "#review/arc" });
  const html = page.main();
  assert.equal(section(html, "ARC-001"), null, "an accepted file is not on the page");
  const order = ["MOD-page", "MOD-reader", "MOD-review"].map((id) => html.indexOf(`id="review-${id}"`));
  assert.ok(order.every((i) => i >= 0) && order[0] < order[1] && order[1] < order[2], `in sequence: ${order}`);
  // New: rendered in full.
  assert.match(section(html, "MOD-page"), /Shows what the other modules derive\./);
  // Changed: the difference to the text its last record names — the same diff as the single view — and its impact list.
  const reader = section(html, "MOD-reader");
  assert.match(reader, /<pre class="diff">/);
  assert.match(reader, /- title: Reads a file at a pinned commit/);
  assert.match(reader, /\+ title: Reads files at a pinned commit/);
  assert.match(reader, /Impact of this change/);
  assert.match(reader, /Affected modules/);
  // Waiting: shown, marked as not counted, and naming what is open.
  const review = section(html, "MOD-review");
  assert.match(review, /Derives open, accepted or changed from the approval records\./);
  assert.match(review, /not counted/i);
  assert.match(review, /UC-002/);
  // One button for the files counted, and the folded explanation.
  assert.match(html, /<button class="btn primary" data-accept-all[^>]*>Accept all 2 shown<\/button>/);
  assert.match(html, /<details class="explain"><summary>What is this\?<\/summary><div>[^]*exactly what this page shows/);
});

test("Accept all N shown: one commit with one record per file the page counted, each naming the blob of the text it rendered", async () => {
  const repo = await product(), caches = fakeCaches();
  const srv = await server(repo);
  const page = await openDashboard({ server: srv, hash: "#review/arc", caches });
  const made = await page.click("[data-accept-all]");
  assert.equal(srv.writes.length, 1, "one commit");
  const written = srv.writes[0].files;
  const want = {};
  for (const p of [PAGE, READER]) want[approvalPath(reviewedId(p), await gitBlobSha(repo[p]))] = recordText(reviewedRecord(p, await gitBlobSha(repo[p])));
  assert.deepEqual(written, want, "a record for MOD-page and MOD-reader, each naming the blob rendered — none for ARC-001, MOD-review or a use case");
  assert.match(srv.writes[0].message, /MOD-page/);
  // The acceptance path of SEVERAL FILES ARE ACCEPTED IN ONE CLICK: read again at the head, then one commit.
  assert.deepEqual(writesOf(made), ["ref", "commit object", "write tree", "write commit", "write ref"]);
  // After the commit the page reloads its statuses the cheap way: commit and tree, every text from this browser.
  const after = made.slice(made.indexOf("write ref") + 1);
  assert.deepEqual(after, ["commit", "tree"], `after the commit: ${after}`);
  assert.equal(section(page.main(), "MOD-page"), null, "accepted now");
  assert.equal(section(page.main(), "MOD-reader"), null, "accepted now");
  assert.ok(section(page.main(), "MOD-review"), "still waiting for UC-002");
  assert.match(page.main(), /Accepted MOD-page, MOD-reader/);
});

test("counter-proof: a file changed between building the page and the click is left out and named", async () => {
  const repo = await product();
  const srv = await server(repo);
  const page = await openDashboard({ server: srv, hash: "#review/arc" });
  await srv.change(PAGE, repo[PAGE] + "\nEdited by someone else.\n");
  await page.click("[data-accept-all]");
  assert.equal(srv.writes.length, 1);
  assert.deepEqual(Object.keys(srv.writes[0].files), [approvalPath("MOD-reader", await gitBlobSha(repo[READER]))]);
  assert.match(page.main(), /Left out <strong>MOD-page<\/strong>: the file changed after it was shown/);
  // The page shows the new text, to be decided on again.
  assert.match(section(page.main(), "MOD-page"), /Edited by someone else\./);
});

test("counter-proof: the write happens only on a trusted click — a click a script makes writes and reads nothing", async () => {
  const srv = await server(await product());
  const page = await openDashboard({ server: srv, hash: "#review/arc" });
  const made = await page.click("[data-accept-all]", { isTrusted: false });
  assert.deepEqual(made, [], "not even the branch head is read");
  assert.equal(srv.writes.length, 0);
  // Known positive: the same button with a person's click writes.
  await page.click("[data-accept-all]");
  assert.equal(srv.writes.length, 1);
});

test("request count: the architecture's review page reads that area's files, the records and the texts its differences need — and, warm, only commit and tree", async (t) => {
  const repo = await product(), caches = fakeCaches();
  const cold = await openDashboard({ server: await server(repo), hash: "#review/arc", caches });
  const recordOf = (id) => Object.keys(repo).filter((p) => p.startsWith(`docs/approvals/${id}-`));
  assert.deepEqual(files(cold.requests), [...ARCH, "SPEC.md", ...recordOf("MOD-reader"), ...recordOf("UC-002"),
    "src/late.js", "src/reader.js", "src/review.py", "tests/reader.test.js"].sort(),
    "the four architecture files (the impact list needs every module), the SPEC, the records that decide a status, the code's headers");
  assert.deepEqual(files(cold.requests).filter((p) => p.startsWith("docs/use-cases/") || p.startsWith("docs/spec-freigaben/")), [],
    "no use case and no queue file");
  const blobs = cold.requests.filter((r) => r.startsWith("blob "));
  assert.deepEqual(blobs, [`blob ${await gitBlobSha(repo[READER].replace("Reads files at", "Reads a file at"))}`], "MOD-reader's accepted text");
  assert.deepEqual(cold.requests.filter((r) => !/^(file|blob) /.test(r)), ["commit", "tree"]);
  const warm = await openDashboard({ server: await server(repo), hash: "#review/arc", caches });
  assert.deepEqual(warm.requests, ["commit", "tree"], "every text from this browser, by its blob SHA");
  assert.equal(warm.main(), cold.main(), "the same page");
  t.diagnostic(`architecture review page: cold ${cold.requests.length} requests (${files(cold.requests).length} files, ${blobs.length} blob, ` +
    `commit, tree); warm ${warm.requests.length} (${warm.requests.join(", ")})`);
});

test("the use cases' review page: a changed use case as its difference, no accepted one, no architecture file read; Accept all writes its record", async (t) => {
  const repo = await product();
  const srv = await server(repo);
  const page = await openDashboard({ server: srv, hash: "#review/uc" });
  const html = page.main();
  assert.equal(section(html, "UC-001"), null, "accepted");
  assert.match(section(html, "UC-002"), /- title: Show a status/);
  assert.match(section(html, "UC-002"), /\+ title: Show the status/);
  assert.match(html, /data-accept-all[^>]*>Accept all 1 shown</);
  assert.deepEqual(files(page.requests).filter((p) => !p.startsWith("docs/use-cases/") && !p.startsWith("docs/approvals/")), [],
    "nothing outside the use cases and their records");
  t.diagnostic(`use-case review page: ${page.requests.length} requests (${page.requests.join(", ")})`);
  await page.click("[data-accept-all]");
  const b = await gitBlobSha(repo[UC2]);
  assert.deepEqual(srv.writes.map((w) => w.files), [{ [approvalPath("UC-002", b)]: recordText(useCaseRecord(UC2, b)) }]);
});

test("without a token: no Accept all — GitHub's prefilled page for each record, as for a single Accept", async () => {
  const repo = await product();
  const page = await openDashboard({ server: await server(repo), hash: "#review/arc", token: null });
  const html = page.main();
  assert.ok(section(html, "MOD-page") && section(html, "MOD-reader"), "the files are shown");
  assert.doesNotMatch(html, /data-accept-all/);
  for (const p of [PAGE, READER]) {
    const path = approvalPath(reviewedId(p), await gitBlobSha(repo[p]));
    assert.ok(html.includes(`https://github.com/${REPO}/new/main?filename=${encodeURIComponent(path)}`), path);
  }
  assert.ok(!html.includes(encodeURIComponent(approvalPath("MOD-review", await gitBlobSha(repo[REVIEW])))), "none for the waiting file");
});

test("the use-case list and the architecture view link to their review page; reading the lists stays as it was", async () => {
  const repo = await product();
  const uc = await openDashboard({ server: await server(repo), hash: "#uc" });
  assert.match(uc.main(), /href="#review\/uc"[^>]*>Review all/);
  const arc = await openDashboard({ server: await server(repo), hash: "#arc" });
  assert.match(arc.main(), /href="#review\/arc"[^>]*>Review all/);
});
