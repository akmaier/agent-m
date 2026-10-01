// The dashboard's five writes (docs/assets/dashboard/writes.mjs) — saving an edit, accepting, adding a product, the
// pseudonymisation setting and the collaborators — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-dashboard-app
// Guards: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL; A STALE APPROVAL IS NOT APPLIED; SEVERAL FILES ARE ACCEPTED IN ONE CLICK; A QUEUE IS ACCEPTED IN ITS ORDER; ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON; AN APPROVAL NAMES THE EXACT TEXT; ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; AN EDITED FILE KEEPS ITS IDENTIFIER; ADDING A PRODUCT CREATES ITS LAYOUT; THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER; A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY; A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT; GITLAB PRODUCTS ARE SUPPORTED; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; UC-001; UC-006; UC-008; UC-022; UC-023; UC-042
// Level: unit
//
// Moved, unchanged, out of tests/review-core.test.mjs, tests/architecture.test.mjs and tests/review-page-core.test.mjs when
// the five writes left the kernel (ITM-124). Each file's checks stand in a block of their own below, with that file's
// fixtures under the names they had there: the three files used the same names for different fixtures (WHEN, fakeGitHub,
// readerOf, treeOf). Fixtures the checks staying behind use too are copied, not moved. Counter-proofs: the mutations listed
// in docs/measurements/2026-09-30_review-dashboard-mutations.md, and docs/measurements/2026-10-01_writes-leave-the-kernel.md.
// Since ITM-008 each write takes the authority the dashboard makes from a person's trusted click (clickAuthority) instead of
// the click event, and hands it to the git host's one write path: docs/measurements/2026-10-01_one-write-path-with-an-authority.md.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "../../docs/assets/review-core.mjs";
import {
  gitBlobSha, recordText, approvalPath, useCaseRecord, reviewedRecord, parseRecord, specRecord, planAcceptance,
  createReviewSession, sectionForEntry, missingNeeds, deriveUseCaseStatus, deriveReviewedStatus, architecturePrerequisites,
} from "../../docs/assets/review-core.mjs";
import * as writes from "../../docs/assets/dashboard/writes.mjs";
import { reviewedId, parseArchitecture } from "../../docs/assets/artifacts.mjs";
import { parseProductAddress } from "../../docs/assets/git-host.mjs";
import { createStore, PREFIX } from "../../docs/assets/settings-store.mjs";
import { pseudonymisationOn, parseCollaborators } from "../../docs/assets/pseudonymiser.mjs";
import {
  click, fakeGitHub, withFetch, fakeStorage, QD, WHEN, B_SPEC, B_P05, B_P06, B_INDEX, B_UC1, B_UC2, SETTINGS_OFF, PEOPLE,
  GL, GL_ADDR, GL_TOKEN, H0, H1, NEWC, fakeGitLab,
} from "./helpers.mjs";

// The five writes, and the one place a person's click becomes the authority they hand to the git host's write path (ITM-008).
const { saveReviewedFile, acceptItems, addProduct, savePseudonymisation, saveCollaborators, clickAuthority } = writes;

// ================================================================ from tests/review-core.test.mjs
{
function productGitHub(tree) {
  const g = fakeGitHub();
  const inner = g.fetchMock;
  g.fetchMock = async (u, init) => {
    const path = new URL(u).pathname;
    if (init.method === "GET" && /^\/repos\/[^/]+\/[^/]+$/.test(path)) {
      g.calls.push(["GET", path, init.headers?.Authorization, null]);
      return new Response(JSON.stringify({ default_branch: "main", private: true }), { status: 200 });
    }
    if (init.method === "GET" && path.includes("/git/trees/")) {
      g.calls.push(["GET", path, init.headers?.Authorization, null]);
      return new Response(JSON.stringify({ tree: tree.map((p) => ({ path: p, type: "blob" })) }), { status: 200 });
    }
    return inner(u, init);
  };
  return g;
}

function readerOf(files, seen = []) {
  return async (head, path) => { seen.push(head); return path in files ? files[path] : null; };
}

const treeOf = (calls) => Object.fromEntries(calls.find(([m, p]) => m === "POST" && p.endsWith("/git/trees"))[3].tree.map((f) => [f.path, f.content]));

function batchRepo(over = {}) {
  return { "SPEC.md": B_SPEC, [`${QD}/index.md`]: B_INDEX, [`${QD}/05-a.md`]: B_P05, [`${QD}/06-b.md`]: B_P06,
    [`${QD}/entscheidungen.md`]: "# Decisions\n\nAppend-only.\n\n",
    "docs/use-cases/UC-001-a.md": B_UC1, "docs/use-cases/UC-002-b.md": B_UC2, ...over };
}

// What the dashboard showed: the proposal and the section beside it, each by its blob SHA.
async function specItem(nr, proposalText, shownSection, anchor) {
  const nn = String(nr).padStart(2, "0");
  return { kind: "spec", queue: QD, qname: "2026-09-24g_x", nr, nn, proposalPath: `${QD}/${nn}-${nr === 5 ? "a" : "b"}.md`,
    proposalBlob: await gitBlobSha(proposalText), sectionBlob: await gitBlobSha(shownSection), targetPath: "SPEC.md",
    anchor, bis: null, needs: [] };
}
const ucItem = async (id, path, text) => ({ kind: "use-case", id, path, blob: await gitBlobSha(text) });

// ---------------------------------------------------------------- products in the browser (UC-001)
// THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER · ADDING A PRODUCT CREATES ITS LAYOUT (and writes nothing into the
// instance repository)

test("THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER — adding stores the address and commits nothing to the instance", async () => {
  const st = fakeStorage(), store = createStore(st);
  store.setToken("github_pat_t");
  const { calls, fetchMock } = productGitHub([]);
  const r = await withFetch(fetchMock, () => addProduct({ address: "https://github.com/reader/thesis", token: "github_pat_t", authority: clickAuthority(click), store }));
  assert.deepEqual(store.getProducts(), ["https://github.com/reader/thesis"]);
  assert.equal(JSON.parse(st.getItem(PREFIX + "products"))[0], "https://github.com/reader/thesis");
  assert.equal(r.commit.sha, "c1", "the layout is committed into the product");
  assert.ok(calls.length && calls.every(([, p]) => p.startsWith("/repos/reader/thesis")),
    "every request goes to the product repository — none to the instance");
  assert.deepEqual(Object.keys(treeOf(calls)).sort(),
    ["CHANGELOG.md", "SPEC.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md", "docs/use-cases/README.md"]);
  // Counter-proof: after a clear, the list is empty.
  store.clear();
  assert.deepEqual(store.getProducts(), []);
  assert.equal(st.mem.size, 0);
});

test("UC-001 5b: a product with the complete layout is only added to the list; no click, nothing at all", async () => {
  const store = createStore(fakeStorage());
  const full = ["CHANGELOG.md", "SPEC.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md", "docs/use-cases/UC-001-x.md"];
  const g = productGitHub(full);
  const r = await withFetch(g.fetchMock, () => addProduct({ address: "https://github.com/reader/thesis", token: "github_pat_t", authority: clickAuthority(click), store }));
  assert.equal(r.commit, null);
  assert.ok(!g.calls.some(([m]) => m === "POST" || m === "PATCH"), "nothing written");
  assert.deepEqual(store.getProducts(), ["https://github.com/reader/thesis"]);
  // A click a script makes becomes no authority, so the view starts no write and sends nothing (authority.test.mjs).
  assert.throws(() => clickAuthority({ isTrusted: false }), /click/);
  // addProduct has no click check of its own any more (ITM-008): without an authority the write path refuses the layout's
  // commit — nothing is written, and the address is not stored. The product is read before that, to find what is missing.
  const s2 = createStore(fakeStorage()), g2 = productGitHub([]);
  await withFetch(g2.fetchMock, () => assert.rejects(addProduct({ address: "https://github.com/reader/thesis", token: "github_pat_t",
    store: s2 }), /authority/));
  assert.ok(!g2.calls.some(([m]) => m === "POST" || m === "PATCH"), "nothing written");
  assert.deepEqual(s2.getProducts(), []);
  // Nor with the event handed over as before: it is no authority.
  const s3 = createStore(fakeStorage()), g3 = productGitHub([]);
  await withFetch(g3.fetchMock, () => assert.rejects(addProduct({ address: "https://github.com/reader/thesis", token: "github_pat_t",
    click, store: s3 }), /authority/));
  assert.ok(!g3.calls.some(([m]) => m === "POST" || m === "PATCH"), "nothing written");
  assert.deepEqual(s3.getProducts(), []);
});

test("THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK — each of the five writes hands the authority to the write path; without one, none writes", async () => {
  // Four writes go straight to the write path: without an authority — or with the event in its place — not one request is sent.
  const st = await fakeGitLab({ files: {} });
  for (const [name, call] of [
    ["saveReviewedFile", (a) => saveReviewedFile({ repo: "a/b", branch: "main", token: "github_pat_t", ...a, path: "docs/use-cases/UC-001-a.md",
      text: B_UC1, openedId: "UC-001", expectBlob: null })],
    ["acceptItems", async (a) => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", ...a,
      items: [{ kind: "use-case", id: "UC-001", path: "docs/use-cases/UC-001-a.md", blob: await gitBlobSha(B_UC1) }],
      readAt: async () => B_UC1, now: WHEN })],
    ["savePseudonymisation", (a) => savePseudonymisation({ repo: "alice/thesis", branch: "main", token: "github_pat_t", ...a,
      current: null, currentBlob: null, off: false, acknowledged: false })],
    ["saveCollaborators", (a) => saveCollaborators({ repo: "alice/thesis", branch: "main", token: "github_pat_t", ...a, list: PEOPLE,
      currentBlob: null })],
    ["acceptItems on GitLab", async (a) => acceptItems({ product: parseProductAddress(GL_ADDR), branch: "main", token: GL_TOKEN, ...a,
      items: [{ kind: "use-case", id: "UC-001", path: "docs/use-cases/UC-001-a.md", blob: await gitBlobSha(B_UC1) }],
      readAt: async () => B_UC1, now: WHEN })],
  ]) {
    for (const [label, a] of [["no authority", {}], ["the event", { click }], ["the event as the authority", { authority: click }]]) {
      const g = fakeGitHub();
      const mock = async (u, init) => (String(u).startsWith(GL) ? st.fetchMock(u, init) : g.fetchMock(u, init));
      const before = st.calls.length;
      await withFetch(mock, () => assert.rejects(call(a), /authority/, `${name}: ${label}`));
      assert.equal(g.calls.length + st.calls.length - before, 0, `${name}: ${label} — nothing sent`);
    }
    // Known positive: the click authority writes one commit.
    const g = fakeGitHub(), gl = await fakeGitLab({ files: { "docs/use-cases/UC-001-a.md": B_UC1 } });
    const mock = async (u, init) => (String(u).startsWith(GL) ? gl.fetchMock(u, init) : g.fetchMock(u, init));
    await withFetch(mock, () => call({ authority: clickAuthority(click) }));
    assert.equal(g.calls.filter(([m]) => m === "PATCH").length + gl.calls.filter((c) => c.method === "POST").length, 1, `${name}: one commit`);
  }
});

test("UC-001 5a: a refused write adds nothing to the list", async () => {
  const store = createStore(fakeStorage());
  const g = productGitHub([]);
  const inner = g.fetchMock;
  const mock = async (u, init) => (init.method === "POST" ? new Response(JSON.stringify({ message: "Resource not accessible" }), { status: 403 }) : inner(u, init));
  await withFetch(mock, () => assert.rejects(addProduct({ address: "https://github.com/reader/thesis", token: "github_pat_t", authority: clickAuthority(click), store }), /403/));
  assert.deepEqual(store.getProducts(), []);
});

// ---------------------------------------------------------------- one commit per decision (queue 2026-09-24g, entry 05)
// AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL · A STALE APPROVAL IS NOT APPLIED ·
// SEVERAL FILES ARE ACCEPTED IN ONE CLICK · A QUEUE IS ACCEPTED IN ITS ORDER (UC-006 4–7, 4d, 5a; UC-008 3d)

test("AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — one commit: record, section, decision row", async () => {
  const files = batchRepo(), heads = [];
  const it = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  const { calls, fetchMock } = fakeGitHub();
  const res = await withFetch(fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
    items: [it], readAt: readerOf(files, heads), now: WHEN }));
  const rec = `docs/approvals/spec-2026-09-24g_x-05-${it.proposalBlob.slice(0, 12)}.md`;
  assert.equal(res.commit.sha, "c1");
  assert.deepEqual(res.leftOut, []);
  assert.equal(calls.filter(([m, p]) => m === "POST" && p.endsWith("/git/commits")).length, 1, "exactly one commit");
  assert.ok(heads.length && heads.every((h) => h === "c0"), "every check reads the commit that is written on");
  const tree = treeOf(calls);
  assert.deepEqual(Object.keys(tree).sort(), [`${QD}/entscheidungen.md`, "SPEC.md", rec].sort());
  assert.equal(tree["SPEC.md"], "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\n\nold nine\n" + B_P05);
  assert.equal(tree[`${QD}/entscheidungen.md`], "# Decisions\n\nAppend-only.\n\n" +
    `| 2026-09-29 16:03 UTC | 5 | uebernommen | approval:${rec.split("/").pop()} |\n`);
  assert.equal(tree[rec], recordText(specRecord({ queue: QD, entry: 5, proposal: `${QD}/05-a.md`, blob: it.proposalBlob,
    target: "SPEC.md", anchor: "## 10. R", section: it.sectionBlob })));
});

test("A STALE APPROVAL IS NOT APPLIED — dashboard: proposal or section changed on the commit written on", async () => {
  const it = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  for (const [over, why] of [[{ [`${QD}/05-a.md`]: B_P05 + "edited\n" }, /proposal changed/],
    [{ "SPEC.md": B_SPEC.replace("old ten", "changed meanwhile") }, /SPEC section changed/]]) {
    const { calls, fetchMock } = fakeGitHub();
    const res = await withFetch(fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
      items: [it], readAt: readerOf(batchRepo(over)), now: WHEN }));
    assert.equal(res.commit, null);
    assert.deepEqual(res.leftOut.map((l) => l.label), ["2026-09-24g_x 05"]);
    assert.match(res.leftOut[0].reason, why);
    assert.ok(!calls.some(([m]) => m === "POST" || m === "PATCH"), "nothing written");
  }
});

test("SEVERAL FILES ARE ACCEPTED IN ONE CLICK — one record per ticked file, none for a file not opened", async () => {
  const s = createReviewSession();
  const u1 = await ucItem("UC-001", "docs/use-cases/UC-001-a.md", B_UC1), u2 = await ucItem("UC-002", "docs/use-cases/UC-002-b.md", B_UC2);
  s.show(u1); s.show(u2);
  assert.equal(s.tick("uc:docs/use-cases/UC-003-c.md", true), false, "a file that was not opened cannot be ticked");
  assert.equal(s.tick(s.key(u1), true), true);
  assert.equal(s.tick(s.key(u2), true), true);
  assert.deepEqual(s.items().map((i) => i.id), ["UC-001", "UC-002"]);
  const { calls, fetchMock } = fakeGitHub();
  const res = await withFetch(fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
    items: s.items(), readAt: readerOf(batchRepo()), now: WHEN }));
  const tree = treeOf(calls);
  assert.deepEqual(Object.keys(tree).sort(), [approvalPath("UC-001", u1.blob), approvalPath("UC-002", u2.blob)]);
  assert.equal(tree[approvalPath("UC-002", u2.blob)], recordText(useCaseRecord(u2.path, u2.blob)));
  assert.deepEqual(res.accepted, ["UC-001", "UC-002"]);
  // Counter-proof: UC-002 changed after it was shown — it is left out and named, UC-001 is still written.
  const g = fakeGitHub();
  const res2 = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
    items: s.items(), readAt: readerOf(batchRepo({ "docs/use-cases/UC-002-b.md": B_UC2 + "edited\n" })), now: WHEN }));
  assert.deepEqual(Object.keys(treeOf(g.calls)), [approvalPath("UC-001", u1.blob)]);
  assert.deepEqual(res2.leftOut.map((l) => l.label), ["UC-002"]);
  assert.match(res2.leftOut[0].reason, /changed after it was shown/);
});

test("A QUEUE IS ACCEPTED IN ITS ORDER — 05 and 06 together: one commit with both sections, rows in index order", async () => {
  const entries = [{ nr: 5, anchor: "## 10. R", bis: null, proposalText: B_P05 }, { nr: 6, anchor: "## 11. X", bis: null, proposalText: B_P06 }];
  const shown06 = sectionForEntry({ specText: B_SPEC, entries, nr: 6 });
  assert.deepEqual(shown06.needs, [5], "06 needs 05, which creates its heading");
  assert.equal(shown06.current, "## 11. X\n\n*(not yet approved)*\n", "06 is shown beside the heading 05 creates");
  assert.deepEqual(sectionForEntry({ specText: B_SPEC, entries, nr: 5 }).needs, []);
  const i05 = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  const i06 = { ...(await specItem(6, B_P06, shown06.current, "## 11. X")), needs: [5] };
  const { calls, fetchMock } = fakeGitHub();
  const res = await withFetch(fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
    items: [i06, i05], readAt: readerOf(batchRepo()), now: WHEN }));        // ticked in reverse order
  assert.deepEqual(res.leftOut, []);
  assert.equal(calls.filter(([m, p]) => m === "POST" && p.endsWith("/git/commits")).length, 1);
  const tree = treeOf(calls);
  assert.equal(tree["SPEC.md"], "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\n\nold nine\n## 10. R\n\nnew ten\n\n" + B_P06);
  const rows = tree[`${QD}/entscheidungen.md`].split("\n").filter((l) => l.startsWith("| 2026"));
  assert.deepEqual(rows.map((r) => r.split("|")[2].trim()), ["5", "6"]);
  assert.equal(Object.keys(tree).filter((p) => p.startsWith("docs/approvals/")).length, 2);
});

test("A QUEUE IS ACCEPTED IN ITS ORDER — counter-proof: 06 alone is not offered while its anchor is missing, and 05 is named", async () => {
  const i06 = { ...(await specItem(6, B_P06, "## 11. X\n\n*(not yet approved)*\n", "## 11. X")), needs: [5] };
  const gaps = missingNeeds([i06]);
  assert.equal(gaps.length, 1);
  assert.match(gaps[0].message, /entry 05/);
  assert.doesNotMatch(gaps[0].message, /times/);
  const { calls, fetchMock } = fakeGitHub();
  await withFetch(fetchMock, () => assert.rejects(acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
    items: [i06], readAt: readerOf(batchRepo()), now: WHEN }), /entry 05/));
  assert.equal(calls.length, 0, "nothing is read or written");
  assert.deepEqual(missingNeeds([i06, await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R")]), []);
  // And if 05 is ticked but left out as stale, 06 is left out too, naming 05 — not "anchor found 0 times".
  const i05 = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  const plan = await planAcceptance({ items: [i05, i06], now: WHEN,
    read: async (p) => batchRepo({ [`${QD}/05-a.md`]: B_P05 + "edited\n" })[p] ?? null });
  assert.deepEqual(plan.files, []);
  assert.deepEqual(plan.leftOut.map((l) => l.label), ["2026-09-24g_x 05", "2026-09-24g_x 06"]);
  assert.match(plan.leftOut[1].reason, /entry 05/);
  assert.doesNotMatch(plan.leftOut[1].reason, /times/);
});

// ---------------------------------------------------------------- settings in one place (UC-042)
// A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY · A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT

test("A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY — switching off commits docs/settings.md on a click, after the notice", async () => {
  const st = fakeStorage();
  createStore(st).setToken("github_pat_t");
  const before = [...st.mem.entries()];
  const { calls, fetchMock } = fakeGitHub({ "docs/settings.md": "b0" });
  const base = { repo: "alice/thesis", branch: "main", token: "github_pat_t", current: null, currentBlob: null, off: true };
  await withFetch(fetchMock, async () => {
    await assert.rejects(savePseudonymisation({ ...base, authority: clickAuthority(click), acknowledged: false }), /I have read this/);
    await assert.rejects(savePseudonymisation({ ...base, acknowledged: true }), /authority/);
  });
  assert.equal(calls.length, 0, "nothing sent without the acknowledgement and an authority");
  const r = await withFetch(fetchMock, () => savePseudonymisation({ ...base, authority: clickAuthority(click), acknowledged: true }));
  assert.equal(r.sha, "c1");
  assert.equal(pseudonymisationOn(treeOf(calls)["docs/settings.md"]), false);
  assert.deepEqual(Object.keys(treeOf(calls)), ["docs/settings.md"]);
  assert.deepEqual([...st.mem.entries()], before, "localStorage holds no product setting");
  // Switching back on needs no acknowledgement (UC-042 4a).
  const g = fakeGitHub({ "docs/settings.md": "b0" });
  await withFetch(g.fetchMock, () => savePseudonymisation({ ...base, authority: clickAuthority(click), off: false, acknowledged: false,
    current: SETTINGS_OFF, currentBlob: "b0" }));
  assert.equal(pseudonymisationOn(treeOf(g.calls)["docs/settings.md"]), true);
});

test("collaborators are saved by one commit of docs/collaborators.md, on a click", async () => {
  const { calls, fetchMock } = fakeGitHub();
  await withFetch(fetchMock, () => assert.rejects(saveCollaborators({ repo: "alice/thesis", branch: "main", token: "github_pat_t",
    list: PEOPLE, currentBlob: null }), /authority/));
  assert.equal(calls.length, 0);
  await withFetch(fetchMock, () => saveCollaborators({ repo: "alice/thesis", branch: "main", token: "github_pat_t",
    authority: clickAuthority(click), list: PEOPLE, currentBlob: null }));
  assert.deepEqual(parseCollaborators(treeOf(calls)["docs/collaborators.md"]), PEOPLE);
});

// ---------------------------------------------------------------- GitLab products (queue 2026-09-24b)
// GITLAB PRODUCTS ARE SUPPORTED · A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN · A PRODUCT IS NAMED BY ITS ADDRESS
// (UC-001 3c/3d, UC-006). The GitLab server is a mock of the REST API v4 as GitLab documents it
// (doc/api/repositories.md, repository_files.md, commits.md, branches.md); no request leaves this process.

test("GitLab: AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — record, section and decision row in one commit, checked at the head", async () => {
  const p = parseProductAddress(GL_ADDR);
  const files = batchRepo(), heads = [];
  const g = await fakeGitLab({ files });
  const it = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  const res = await withFetch(g.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, authority: clickAuthority(click), items: [it],
    readAt: readerOf(files, heads), now: WHEN }));
  assert.deepEqual(res.leftOut, []);
  assert.ok(heads.length && heads.every((h) => h === H0), "every check reads the commit the new one is written on");
  const posts = g.calls.filter((c) => c.method === "POST");
  assert.equal(posts.length, 1);
  const acts = Object.fromEntries(posts[0].body.actions.map((a) => [a.file_path, a]));
  const rec = `docs/approvals/spec-2026-09-24g_x-05-${it.proposalBlob.slice(0, 12)}.md`;
  assert.deepEqual(Object.keys(acts).sort(), [`${QD}/entscheidungen.md`, "SPEC.md", rec].sort());
  assert.equal(acts["SPEC.md"].content, "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\n\nold nine\n" + B_P05);
  assert.equal(acts["SPEC.md"].action, "update");
  assert.equal(acts["SPEC.md"].last_commit_id, H0);
  assert.equal(acts[rec].action, "create");
  assert.match(acts[`${QD}/entscheidungen.md`].content, /\| 5 \| uebernommen \| approval:/);
  // A STALE APPROVAL IS NOT APPLIED — the proposal changed on the head: nothing is written.
  const s = await fakeGitLab({ files: batchRepo({ [`${QD}/05-a.md`]: B_P05 + "edited\n" }) });
  const res2 = await withFetch(s.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, authority: clickAuthority(click), items: [it],
    readAt: readerOf(batchRepo({ [`${QD}/05-a.md`]: B_P05 + "edited\n" })), now: WHEN }));
  assert.equal(res2.commit, null);
  assert.match(res2.leftOut[0].reason, /proposal changed/);
  assert.ok(!s.calls.some((c) => c.method === "POST"), "nothing written");
});

test("GitLab: SEVERAL FILES ARE ACCEPTED IN ONE CLICK · A QUEUE IS ACCEPTED IN ITS ORDER — one commit", async () => {
  const p = parseProductAddress(GL_ADDR);
  const files = batchRepo();
  const u1 = await ucItem("UC-001", "docs/use-cases/UC-001-a.md", B_UC1), u2 = await ucItem("UC-002", "docs/use-cases/UC-002-b.md", B_UC2);
  const entries = [{ nr: 5, anchor: "## 10. R", bis: null, proposalText: B_P05 }, { nr: 6, anchor: "## 11. X", bis: null, proposalText: B_P06 }];
  const i05 = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  const i06 = { ...(await specItem(6, B_P06, sectionForEntry({ specText: B_SPEC, entries, nr: 6 }).current, "## 11. X")), needs: [5] };
  const g = await fakeGitLab({ files });
  const res = await withFetch(g.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, authority: clickAuthority(click),
    items: [u2, i06, u1, i05], readAt: readerOf(files), now: WHEN }));
  assert.deepEqual(res.leftOut, []);
  const posts = g.calls.filter((c) => c.method === "POST");
  assert.equal(posts.length, 1, "one commit for all four");
  const acts = posts[0].body.actions;
  assert.equal(acts.filter((a) => a.file_path.startsWith("docs/approvals/")).length, 4, "one record per ticked file");
  const spec = acts.find((a) => a.file_path === "SPEC.md").content;
  assert.equal(spec, "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\n\nold nine\n## 10. R\n\nnew ten\n\n" + B_P06);
  const rows = acts.find((a) => a.file_path.endsWith("entscheidungen.md")).content.split("\n").filter((l) => l.startsWith("| 2026"));
  assert.deepEqual(rows.map((r) => r.split("|")[2].trim()), ["5", "6"]);
});

test("GitLab: a commit GitLab wrote on a newer head than the one checked is reported with the files read that changed", async () => {
  const p = parseProductAddress(GL_ADDR);
  const files = batchRepo();
  const u1 = await ucItem("UC-001", "docs/use-cases/UC-001-a.md", B_UC1);
  // The branch did not move before the commit, but GitLab reports another parent: a commit arrived in between.
  const g = await fakeGitLab({ files, parent: H1, changed: ["docs/use-cases/UC-001-a.md"] });
  const res = await withFetch(g.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, authority: clickAuthority(click), items: [u1],
    readAt: readerOf(files), now: WHEN }));
  assert.equal(res.commit.sha, NEWC);
  assert.deepEqual(res.commit.changedMeanwhile, ["docs/use-cases/UC-001-a.md"]);
  assert.match(res.warning, /UC-001-a\.md/);
  const cmp = g.calls.find((c) => c.path.endsWith("/repository/compare"));
  assert.deepEqual([cmp.query.from, cmp.query.to], [H0, H1]);
  // Counter-proof: the other commit changed an unrelated file — no warning.
  const g2 = await fakeGitLab({ files, parent: H1, changed: ["README.md"] });
  const res2 = await withFetch(g2.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, authority: clickAuthority(click), items: [u1],
    readAt: readerOf(files), now: WHEN }));
  assert.equal(res2.warning, null);
});

test("ADDING A PRODUCT CREATES ITS LAYOUT — on GitLab, one commit of creates; the address stored; nothing to GitHub", async () => {
  const st = fakeStorage(), store = createStore(st);
  store.setGitLabToken(GL_ADDR, GL_TOKEN, "2026-12-29");
  const g = await fakeGitLab({ files: { "README.md": "# p\n", "SPEC.md": "# old\n" } });
  const r = await withFetch(g.fetchMock, () => addProduct({ address: GL_ADDR, token: GL_TOKEN, authority: clickAuthority(click), store }));
  assert.equal(r.commit.sha, NEWC);
  const posts = g.calls.filter((c) => c.method === "POST");
  assert.equal(posts.length, 1);
  assert.deepEqual(posts[0].body.actions.map((a) => [a.action, a.file_path]).sort(), [["create", "CHANGELOG.md"], ["create", "docs/approvals/README.md"],
    ["create", "docs/spec-freigaben/README.md"], ["create", "docs/use-cases/README.md"]]);
  assert.deepEqual(store.getProducts(), [GL_ADDR]);
  assert.ok(g.calls.every((c) => c.origin === GL && c.token === GL_TOKEN), "only the product's server, only its token");
  // Counter-proof: a refused write adds nothing to the list.
  const s2 = createStore(fakeStorage());
  const bad = await fakeGitLab({ files: {}, postStatus: 403, postBody: { message: "403 Forbidden" } });
  await withFetch(bad.fetchMock, () => assert.rejects(addProduct({ address: GL_ADDR, token: GL_TOKEN, authority: clickAuthority(click), store: s2 }), /403/));
  assert.deepEqual(s2.getProducts(), []);
});
}

// ================================================================ from tests/architecture.test.mjs
{
const FIX = fileURLToPath(new URL("../fixtures/architecture/", import.meta.url));
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
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
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
    const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
      items: [a], readAt: readerOf({ ...repo, ...over }), now: WHEN }));
    assert.equal(res.commit, null, String(why));
    assert.deepEqual(res.leftOut.map((l) => l.label), ["ARC-001"]);
    assert.match(res.leftOut[0].reason, why);
    assert.ok(!g.calls.some(([m]) => m === "POST" || m === "PATCH"), "nothing written");
  }
  // An item that carries no accepted use case for a UC its text names is left out too (the text decides, not the item).
  const g = fakeGitHub();
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
    items: [{ ...a, requires: [] }], readAt: readerOf(repo), now: WHEN }));
  assert.equal(res.commit, null);
  assert.match(res.leftOut[0].reason, /UC-001/);
});

test("AN APPROVAL NAMES THE EXACT TEXT — an ARC changed after it was shown is left out and named", async () => {
  const repo = { ...files, ...(await ucRecordFiles()) };
  const a = await archItem(ARC, files[ARC], repo), m = await archItem(READER, files[READER], repo);
  const g = fakeGitHub();
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
    items: [a, m], readAt: readerOf({ ...repo, [ARC]: files[ARC] + "more\n" }), now: WHEN }));
  assert.deepEqual(Object.keys(treeOf(g.calls)), [approvalPath("MOD-reader", m.blob)]);
  assert.deepEqual(res.leftOut.map((l) => l.label), ["ARC-001"]);
  assert.match(res.leftOut[0].reason, /changed after it was shown/);
});

test("AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST — a changed file whose impact list was not shown is left out", async () => {
  const repo = { ...files, ...(await ucRecordFiles()) };
  const m = await archItem(READER, files[READER], repo, { changed: true });
  const g = fakeGitHub();
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
    items: [m], readAt: readerOf(repo), now: WHEN }));
  assert.equal(res.commit, null);
  assert.match(res.leftOut[0].reason, /impact list/);
  // Counter-proof: shown with its impact list, it is accepted.
  const g2 = fakeGitHub();
  const res2 = await withFetch(g2.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
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
  const res = await withFetch(fetchMock, () => acceptItems({ product: p, branch: "main", token: TOKEN, authority: clickAuthority(click), items: [m],
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
  const c = await withFetch(g.fetchMock, () => saveReviewedFile({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
    path: READER, text: edited, openedId: "MOD-reader", expectBlob: blob }));
  assert.equal(c.sha, "c1");
  assert.deepEqual(treeOf(g.calls), { [READER]: edited });
  // Refused: the identifier in the text is not the one the file was opened with — nothing is sent.
  for (const [text, id] of [[edited.replace("id: MOD-reader", "id: MOD-reader2"), "MOD-reader"],
    [files[ARC].replace("id: ARC-001", "id: ARC-002"), "ARC-001"], [edited.replace("id: MOD-reader\n", ""), "MOD-reader"]]) {
    const g2 = fakeGitHub({ [READER]: blob });
    await withFetch(g2.fetchMock, () => assert.rejects(saveReviewedFile({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
      path: READER, text, openedId: id, expectBlob: blob }), /identifier/));
    assert.equal(g2.calls.length, 0, "nothing sent");
  }
  // Refused: the file on the branch is no longer the text the editor opened.
  const g3 = fakeGitHub({ [READER]: "f".repeat(40) });
  await withFetch(g3.fetchMock, () => assert.rejects(saveReviewedFile({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
    path: READER, text: edited, openedId: "MOD-reader", expectBlob: blob }), /changed since/));
  assert.ok(!g3.calls.some(([m]) => m === "PATCH"), "nothing written");
  // A file without an identifier (a SPEC proposal) is saved without that check.
  const g4 = fakeGitHub({ "docs/spec-freigaben/q/01-a.md": "x" });
  await withFetch(g4.fetchMock, () => saveReviewedFile({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
    path: "docs/spec-freigaben/q/01-a.md", text: "## 1\n", openedId: null, expectBlob: "x" }));
  assert.ok(g4.calls.some(([m]) => m === "PATCH"));
});
}

// ================================================================ from tests/review-page-core.test.mjs
{
// ---------------------------------------------------------------- the product: tests/fixtures/architecture, with records

const FIX = fileURLToPath(new URL("../fixtures/architecture/", import.meta.url));
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

test("SEVERAL FILES ARE ACCEPTED IN ONE CLICK — a review page's items: one commit, one record per file shown and counted, none for any other", async () => {
  const repo = await product();
  const page = core.reviewPage(await archEntries(repo));
  const g = fakeGitHub();
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
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
  const res2 = await withFetch(g2.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
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
  const res = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", authority: clickAuthority(click),
    items: page.items, readAt: readerOf({ ...repo, [PAGE]: repo[PAGE] + "edited\n" }), now: WHEN }));
  assert.deepEqual(Object.keys(treeOf(g.calls)), [approvalPath("MOD-reader", await gitBlobSha(repo[READER]))]);
  assert.deepEqual(res.leftOut.map((l) => l.label), ["MOD-page"]);
  assert.match(res.leftOut[0].reason, /changed after it was shown/);
});
}
