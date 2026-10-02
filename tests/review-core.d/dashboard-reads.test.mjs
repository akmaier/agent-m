// The dashboard's reads that need both the git host and the kernel (docs/assets/dashboard/reads.mjs) — the last accepted text
// of an identifier and a text kept by its blob SHA — and the repository the page derives from its own address
// (docs/assets/dashboard-app.mjs deriveTarget). Deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-dashboard-app
// Guards: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; AN APPROVAL NAMES THE EXACT TEXT; STATUS IS DERIVED FROM THE RECORDS; GITLAB PRODUCTS ARE SUPPORTED; A PRODUCT IS NAMED BY ITS ADDRESS
// Level: unit
//
// Moved, unchanged, out of tests/review-core.test.mjs and tests/status-by-names.test.mjs when the kernel's reads left it
// (ITM-130): MOD-review-core's lastAccepted takes what it reads as ports, MOD-git-host reads (readBlob, commitsTouching), and
// docs/assets/dashboard/reads.mjs wires the two with the arguments the checks below pass, as the kernel took them before.
// The fixture memoryCache is copied, not moved: the checks staying in status-by-names.test.mjs use it too. The block from
// status-by-names.test.mjs reaches the module it checks as `core`, the name it had there. Counter-proofs: the mutations listed
// in docs/measurements/2026-09-30_review-dashboard-mutations.md.

import test from "node:test";
import assert from "node:assert/strict";
import {
  gitBlobSha, parseRecord, recordText, approvalPath, useCaseRecord, deriveUseCaseStatus, changedLines,
} from "../../docs/assets/review-core.mjs";
import { reviewedId } from "../../docs/assets/artifacts.mjs";
import { parseProductAddress, webFileUrl } from "../../docs/assets/git-host.mjs";
import { diffHtml, deriveTarget } from "../../docs/assets/dashboard-app.mjs";
import { lastAccepted, readBlob } from "../../docs/assets/dashboard/reads.mjs";
import * as core from "../../docs/assets/dashboard/reads.mjs";
import { withFetch, GL, GL_ADDR, GL_TOKEN, UC_OLD, UC_NEW } from "./helpers.mjs";

// ================================================================ from tests/review-core.test.mjs

const A_TEXT = "---\nid: UC-010\ntitle: Run a job\nstage: runtime\n---\n# UC-010\n\nBody line one.\nBody line two.\n";
const B_TEXT = A_TEXT.replace("stage: runtime", "area: runtime");
const OLDER_TEXT = A_TEXT.replace("Body line one.", "An older first line.");
const PIN = "f".repeat(40);

// records: [{ text, file (the use case it names), date }] -> parsed records as the app keeps them, with their own path
async function recordsOf(list) {
  return Promise.all(list.map(async (r) => {
    const blob = await gitBlobSha(r.text);
    return { ...parseRecord(recordText(useCaseRecord(r.file, blob))), _path: approvalPath(reviewedId(r.file), blob), _date: r.date, _text: r.text };
  }));
}

function fakeHistoryGitHub(recs, repo = "a/b") {
  const calls = [];
  const blobs = Object.fromEntries(recs.map((r) => [r.blob, r._text]));
  const dates = Object.fromEntries(recs.map((r) => [r._path, r._date]));
  const fetchMock = async (u, init = {}) => {
    const url = new URL(u), p = url.pathname;
    calls.push({ origin: url.origin, path: p, query: Object.fromEntries(url.searchParams), auth: init.headers?.Authorization, method: init.method });
    const ok = (o) => new Response(JSON.stringify(o), { status: 200 });
    if (p === `/repos/${repo}/commits`) {
      const d = dates[url.searchParams.get("path")];
      return ok(d ? [{ sha: "c".repeat(40), commit: { committer: { date: d }, author: { date: "2000-01-01T00:00:00Z" } } }] : []);
    }
    const m = p.match(new RegExp(`^/repos/${repo}/git/blobs/([0-9a-f]{40})$`));
    if (m && m[1] in blobs) {
      const b64 = Buffer.from(blobs[m[1]], "utf8").toString("base64").replace(/(.{60})/g, "$1\n");
      return ok({ sha: m[1], size: Buffer.byteLength(blobs[m[1]]), content: b64, encoding: "base64" });
    }
    return new Response('{"message":"Not Found"}', { status: 404, statusText: "Not Found" });
  };
  return { calls, fetchMock };
}

test("the dashboard is opened on a GitLab product by its address; its files link to GitLab", () => {
  const t = deriveTarget({ hostname: "reader.github.io", pathname: "/agent-m/", search: `?product=${encodeURIComponent(GL_ADDR)}` });
  assert.equal(t.instance, "reader/agent-m");
  assert.equal(t.repo, "grp/sub/proj");
  assert.equal(t.product.server, GL);
  assert.equal(t.refGiven, false);
  assert.equal(deriveTarget({ hostname: "reader.github.io", pathname: "/agent-m/", search: "?product=javascript:alert(1)" }).repo, "reader/agent-m");
  assert.equal(webFileUrl(parseProductAddress(GL_ADDR), "main", "docs/use-cases/UC-001 a.md"), `${GL_ADDR}/-/blob/main/docs/use-cases/UC-001%20a.md`);
  assert.equal(webFileUrl(parseProductAddress("https://github.com/a/b"), "main", "SPEC.md"), "https://github.com/a/b/blob/main/SPEC.md");
});

// ---------------------------------------------------------------- the last accepted text (queue 2026-09-30, entry 03)
// A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT · AN APPROVAL NAMES THE EXACT TEXT · STATUS IS DERIVED FROM THE
// RECORDS (UC-008 2a). The accepted text is read by the blob SHA its record names; "most recent" is the record committed last,
// read from the server's commits of the record's path at the pinned commit. The servers are mocks of the documented endpoints
// (GitHub: GET /repos/{o}/{r}/commits?path=&sha=, GET /repos/{o}/{r}/git/blobs/{sha}; GitLab: GET
// /projects/:id/repository/commits?path=&ref_name=, GET /projects/:id/repository/blobs/:sha/raw).

test("A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — one changed line shows exactly that line", async () => {
  const recs = await recordsOf([{ text: A_TEXT, file: UC_NEW, date: "2026-09-24T18:15:06Z" }]);
  const g = fakeHistoryGitHub(recs);
  const last = await withFetch(g.fetchMock, () => lastAccepted({ repo: "a/b", commit: PIN, token: "github_pat_t", records: recs, id: "UC-010" }));
  assert.equal(last.text, A_TEXT, "the text the record names, read by its blob SHA");
  assert.equal(last.record.blob, recs[0].blob);
  assert.deepEqual(changedLines(last.text, B_TEXT), [["+", "area: runtime"], ["-", "stage: runtime"]]);
  const html = diffHtml(last.text, B_TEXT);
  assert.deepEqual([...html.matchAll(/<span class="d(add|del)">([^<]*)<\/span>/g)].map((m) => [m[1], m[2]]),
    [["add", "+ area: runtime"], ["del", "- stage: runtime"]]);
  // One record: no commit history is needed, only the blob.
  assert.deepEqual(g.calls.map((c) => c.path), [`/repos/a/b/git/blobs/${recs[0].blob}`]);
  assert.ok(g.calls.every((c) => c.origin === "https://api.github.com" && c.auth === "Bearer github_pat_t" && c.method === "GET"));
  // Counter-proof: identical texts show no line at all.
  assert.deepEqual(changedLines(B_TEXT, B_TEXT), []);
});

test("A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — with two records, the older text is not the one compared", async () => {
  // Listed in both orders: only the commit date decides, not the order of the list or of the blob SHAs.
  const both = await recordsOf([{ text: A_TEXT, file: UC_NEW, date: "2026-09-30T13:05:52Z" },
    { text: OLDER_TEXT, file: UC_NEW, date: "2026-09-24T18:05:39Z" }]);
  for (const order of [[0, 1], [1, 0]]) {
    const recs = order.map((i) => both[i]);
    const g = fakeHistoryGitHub(recs);
    const last = await withFetch(g.fetchMock, () => lastAccepted({ repo: "a/b", commit: PIN, token: null, records: recs, id: "UC-010" }));
    assert.equal(last.text, A_TEXT, `order ${order}`);
    assert.equal(last.count, 2);
    assert.equal(last.committedAt, "2026-09-30T13:05:52Z");
    assert.deepEqual(changedLines(last.text, B_TEXT), [["+", "area: runtime"], ["-", "stage: runtime"]]);
    const blobCalls = g.calls.filter((c) => c.path.includes("/git/blobs/"));
    assert.deepEqual(blobCalls.map((c) => c.path.split("/").pop()), [both[0].blob], "the older text is never read");
    const commitCalls = g.calls.filter((c) => c.path.endsWith("/commits"));
    assert.deepEqual(commitCalls.map((c) => c.query.path).sort(), both.map((r) => r._path).sort(), "one history read per record");
    assert.ok(commitCalls.every((c) => c.query.sha === PIN && c.query.per_page === "1"), "at the pinned commit");
    assert.ok(g.calls.every((c) => c.auth === undefined), "without a token, none is sent");
  }
});

test("A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — a renamed file finds its records by identifier", async () => {
  // UC-010 as on 2026-09-30: two records name the old path; the file now has another name.
  const recs = await recordsOf([{ text: OLDER_TEXT, file: UC_OLD, date: "2026-09-24T18:15:06Z" },
    { text: A_TEXT, file: UC_OLD, date: "2026-09-30T13:02:39Z" },
    { text: "---\nid: UC-011\n---\n", file: "docs/use-cases/UC-011-x.md", date: "2026-09-30T13:30:00Z" }]);
  assert.equal(deriveUseCaseStatus(UC_NEW, await gitBlobSha(B_TEXT), recs), "open", "by path the renamed file has no record");
  const g = fakeHistoryGitHub(recs);
  const last = await withFetch(g.fetchMock, () => lastAccepted({ repo: "a/b", commit: PIN, token: "github_pat_t", records: recs, id: reviewedId(UC_NEW) }));
  assert.equal(last.record.file, UC_OLD);
  assert.equal(last.text, A_TEXT);
  assert.deepEqual(changedLines(last.text, B_TEXT), [["+", "area: runtime"], ["-", "stage: runtime"]]);
  assert.ok(!g.calls.some((c) => (c.query.path || "").includes("UC-011")), "another identifier's record is not consulted");
  // Counter-proof: an identifier without records has nothing to compare, and nothing is read.
  const g2 = fakeHistoryGitHub(recs);
  assert.equal(await withFetch(g2.fetchMock, () => lastAccepted({ repo: "a/b", commit: PIN, token: null, records: recs, id: "UC-012" })), null);
  assert.equal(g2.calls.length, 0);
});

test("the accepted text is the exact text its record names — a blob that does not hash to it is refused", async () => {
  const recs = await recordsOf([{ text: A_TEXT, file: UC_NEW, date: "2026-09-24T18:15:06Z" }]);
  const g = fakeHistoryGitHub([{ ...recs[0], _text: A_TEXT + "tampered\n" }]);
  await withFetch(g.fetchMock, () => assert.rejects(lastAccepted({ repo: "a/b", commit: PIN, token: null, records: recs, id: "UC-010" }), /blob/));
  // A record whose blob is not a SHA is not turned into a request.
  const n = g.calls.length;
  await withFetch(g.fetchMock, () => assert.rejects(readBlob({ repo: "a/b", blob: "../../x", token: null }), /blob SHA/));
  assert.equal(g.calls.length, n);
});

test("A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT — GitLab: its commits and blob endpoints, its own token only", async () => {
  const p = parseProductAddress(GL_ADDR);
  const recs = await recordsOf([{ text: OLDER_TEXT, file: UC_OLD, date: "2026-09-24T18:15:06.000+00:00" },
    { text: A_TEXT, file: UC_OLD, date: "2026-09-30T13:02:39.000+00:00" }]);
  const calls = [], base = `/api/v4/projects/${encodeURIComponent("grp/sub/proj")}`;
  const fetchMock = async (u, init = {}) => {
    const url = new URL(u), rest = url.pathname.slice(base.length);
    calls.push({ origin: url.origin, path: url.pathname, query: Object.fromEntries(url.searchParams), token: init.headers?.["PRIVATE-TOKEN"], auth: init.headers?.Authorization });
    if (url.origin !== GL || !url.pathname.startsWith(base)) return new Response("{}", { status: 404 });
    if (rest === "/repository/commits") {
      const r = recs.find((x) => x._path === url.searchParams.get("path"));
      return new Response(JSON.stringify(r ? [{ id: "c".repeat(40), committed_date: r._date, authored_date: "2000-01-01T00:00:00Z" }] : []));
    }
    const m = rest.match(/^\/repository\/blobs\/([0-9a-f]{40})\/raw$/);
    const r = m && recs.find((x) => x.blob === m[1]);
    return r ? new Response(r._text) : new Response("{}", { status: 404 });
  };
  const last = await withFetch(fetchMock, () => lastAccepted({ product: p, commit: PIN, token: GL_TOKEN, records: recs, id: "UC-010" }));
  assert.equal(last.text, A_TEXT);
  assert.deepEqual(changedLines(last.text, B_TEXT), [["+", "area: runtime"], ["-", "stage: runtime"]]);
  const commits = calls.filter((c) => c.path.endsWith("/repository/commits"));
  assert.equal(commits.length, 2);
  assert.ok(commits.every((c) => c.query.ref_name === PIN && c.query.per_page === "1"));
  assert.deepEqual(calls.filter((c) => c.path.includes("/blobs/")).map((c) => c.path), [`${base}/repository/blobs/${recs[1].blob}/raw`]);
  assert.ok(calls.every((c) => c.origin === GL && c.token === GL_TOKEN && c.auth === undefined), "only its server, only its project token");
});

// ================================================================ from tests/status-by-names.test.mjs

function memoryCache(init = {}) {
  const m = new Map(Object.entries(init)), log = [];
  return { m, log, get: async (k) => { log.push(`get ${k}`); return m.get(k) ?? null; }, put: async (k, t) => { log.push(`put ${k}`); m.set(k, t); } };
}
test("readBlob keeps the accepted text of a record by its blob SHA", async () => {
  const text = "---\nid: UC-001\n---\naccepted\n", sha = await gitBlobSha(text), c = memoryCache();
  const calls = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (u) => { calls.push(String(u)); return new Response(JSON.stringify({ encoding: "base64", content: Buffer.from(text).toString("base64") })); };
  try {
    assert.equal(await core.readBlob({ repo: "a/b", blob: sha, cache: c, cacheKey: `github.com/a/b/${sha}` }), text);
    assert.equal(await core.readBlob({ repo: "a/b", blob: sha, cache: c, cacheKey: `github.com/a/b/${sha}` }), text);
  } finally { globalThis.fetch = real; }
  assert.equal(calls.length, 1);
});
