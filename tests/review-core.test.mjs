// Review core — deterministic, no network. Run: node --test tests/*.test.mjs
//
// Module: MOD-review-core
// Guards: STATUS IS DERIVED FROM THE RECORDS; AN APPROVAL NAMES THE EXACT TEXT; AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL; A STALE APPROVAL IS NOT APPLIED; SEVERAL FILES ARE ACCEPTED IN ONE CLICK; A QUEUE IS ACCEPTED IN ITS ORDER; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; ADDING A PRODUCT CREATES ITS LAYOUT; THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER; A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY; A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT; GITLAB PRODUCTS ARE SUPPORTED; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; A PRODUCT IS NAMED BY ITS ADDRESS; UC-001; UC-006; UC-008; UC-042
// Level: unit
//
// Every check here was run once against a deliberately broken implementation (SOFTWARE_MAINTENANCE
// §4.0a rule 5): a check that cannot fail checks nothing. The mutations are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md.
//
// SPEC.md names this file as the check of requirements of several modules. The checks of the other modules live in
// tests/review-core.d/, one file per module, and this file runs every file of that folder (at its end): a failing check there
// makes this file red. Those files are not matched by tests/*.test.mjs, so CI runs each check once.

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import {
  gitBlobSha, parseRecord, recordText, approvalPath, useCaseRecord,
  specRecord, extractSection, sectionText, parseQueueIndex, parseDecisions,
  deriveUseCaseStatus, deriveSpecStatus, missingLayout, addProduct,
  acceptItems, planAcceptance, createReviewSession, decisionRow, replaceSection, sectionForEntry, missingNeeds,
  savePseudonymisation, saveCollaborators, deriveTarget, gitlabRole,
  lastAccepted, changedLines, readBlob,
} from "../docs/assets/review-core.mjs";
import { reviewedId } from "../docs/assets/artifacts.mjs";
import { parseProductAddress, webFileUrl } from "../docs/assets/git-host.mjs";
import { createStore, PREFIX } from "../docs/assets/settings-store.mjs";
import { pseudonymisationOn, parseCollaborators } from "../docs/assets/pseudonymiser.mjs";
import { diffHtml } from "../docs/assets/dashboard-app.mjs";
import {
  dashboardText, click, fakeGitHub, withFetch, fakeStorage, QD, WHEN, B_SPEC, B_P05, B_P06, B_INDEX, B_UC1, B_UC2, SETTINGS_OFF, PEOPLE,
  GL, GL_ADDR, GL_TOKEN, H0, H1, NEWC, fakeGitLab, UC_OLD, UC_NEW,
} from "./review-core.d/helpers.mjs";

const gitHash = (s) => execFileSync("git", ["hash-object", "--stdin"], { input: s }).toString().trim();

// Queue 2026-09-30g entry 01: the anchor is a requirement's bold line, and the accepted proposal rewrote that very line
// ("…, 2026-09-24)*" -> "…, 2026-09-24, narrowed 2026-09-30)*"). The anchor as it stood before acceptance is gone from the
// SPEC; the entry's text stands where it was written, starting with the proposal's first line.
const R_ANCHOR = "**A DRAFTED RULE** *(PO A. Maier, 2026-09-24)*", R_BIS = "## 11. A";
const R_BEFORE = "# T\n\n## 10. R\n\n**AN EARLIER RULE** *(PO, 2026-09-23)*\nearlier.\n\n" +
  `${R_ANCHOR}\nold text.\n*Check:* x\n\n**A LATER RULE** *(PO, 2026-09-24)*\nlater.\n${R_BIS}\n\neleven\n`;
const R_PROPOSAL = "**A DRAFTED RULE** *(PO A. Maier, 2026-09-24, narrowed 2026-09-30)*\nnew text.\n*Check:* x\n\n" +
  "**A LATER RULE** *(PO, 2026-09-24)*\nlater.\n";
const R_AFTER = replaceSection(R_BEFORE, R_ANCHOR, R_BIS, R_PROPOSAL);

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

function readerOf(files, seen = []) {
  return async (head, path) => { seen.push(head); return path in files ? files[path] : null; };
}

const treeOf = (calls) => Object.fromEntries(calls.find(([m, p]) => m === "POST" && p.endsWith("/git/trees"))[3].tree.map((f) => [f.path, f.content]));

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

test("gitBlobSha equals git hash-object, byte for byte", async () => {
  for (const s of ["", "a\n", "no trailing newline", "Umlaute äöü — und ✓\n", "x".repeat(5000)]) {
    assert.equal(await gitBlobSha(s), gitHash(s), JSON.stringify(s.slice(0, 20)));
  }
});

test("records round-trip and carry no text", () => {
  const r = useCaseRecord("docs/use-cases/UC-001-x.md", "a".repeat(40));
  assert.deepEqual(parseRecord(recordText(r)), r);
  assert.equal(approvalPath("UC-001", "0123456789abcdef".padEnd(40, "0")),
    "docs/approvals/UC-001-0123456789ab.md");
  const s = specRecord({ queue: "docs/spec-freigaben/q", entry: 1, proposal: "docs/spec-freigaben/q/01-a.md",
    blob: "b".repeat(40), target: "SPEC.md", anchor: "## 9. Human gates", section: "c".repeat(40) });
  assert.deepEqual(parseRecord(recordText(s)), s);
  assert.equal(s.entry, "01");
});

test("extractSection: heading to next heading of same level, code fences masked", () => {
  const spec = "# T\n\n## 1. A\ntext\n```\n## not a heading\n```\n### sub\nmore\n## 2. B\nb\n";
  const s = extractSection(spec, "## 1. A");
  assert.equal(sectionText(s), "## 1. A\ntext\n```\n## not a heading\n```\n### sub\nmore\n");
  assert.match(extractSection(spec, "## 3. C").error, /0 times/);
  assert.match(extractSection(spec + "## 1. A\n", "## 1. A").error, /2 times/);
  assert.equal(sectionText(extractSection(spec, "## 2. B")), "## 2. B\nb\n");
  assert.equal(sectionText(extractSection(spec, "## 1. A", "### sub")), "## 1. A\ntext\n```\n## not a heading\n```\n");
});

test("sectionText is the same bytes the Python applier hashes", async () => {
  const spec = readFileSync(new URL("./fixtures/spec.md", import.meta.url), "utf8");
  const py = execFileSync("python3", ["-c",
    "import sys; sys.path.insert(0,'tools'); import apply_approvals as a;" +
    "t=open('tests/fixtures/spec.md').read(); print(a.blob_sha(a.section_text(a.extract_section(t,'## 1. First'))))"]).toString().trim();
  assert.equal(await gitBlobSha(sectionText(extractSection(spec, "## 1. First"))), py);
});

test("queue index and decisions parse like scripts/spec_dashboard.py", () => {
  const idx = parseQueueIndex("x\n**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`\n\n| Nr | Datei | Anker | bis | Commits |\n|---|---|---|---|---|\n| 01 | `SPEC.md` | ## 9. Human gates | — | — |\n| 02 | `SPEC.md` | ## 2. X | ## 3. Y | — |\n");
  assert.equal(idx.target, "products/agent-m/SPEC.md");
  assert.deepEqual(idx.entries.map(e => [e.nr, e.anchor, e.bis]), [[1, "## 9. Human gates", null], [2, "## 2. X", "## 3. Y"]]);
  const d = parseDecisions("# D\n| 2026-09-23 21:53 | 1 | uebernommen | e2ce99d |\n| 2026-09-23 22:00 | 1 | zurueckgestellt | — |\n");
  assert.equal(d.get(1).decision, "zurueckgestellt");
});

test("STATUS IS DERIVED FROM THE RECORDS: use cases", () => {
  const rec = (blob) => useCaseRecord("docs/use-cases/UC-001-x.md", blob);
  const f = "docs/use-cases/UC-001-x.md";
  assert.equal(deriveUseCaseStatus(f, "a".repeat(40), []), "open");
  assert.equal(deriveUseCaseStatus(f, "a".repeat(40), [rec("a".repeat(40))]), "accepted");
  assert.equal(deriveUseCaseStatus(f, "b".repeat(40), [rec("a".repeat(40))]), "changed");
  assert.equal(deriveUseCaseStatus(f, "a".repeat(40), [useCaseRecord("docs/use-cases/UC-002-y.md", "a".repeat(40))]), "open");
});

test("STATUS IS DERIVED FROM THE RECORDS: SPEC proposals", () => {
  const base = { queue: "q", nr: 1, anchor: "## 9. G", bis: null, proposalPath: "q/01-a.md", proposalText: "## 9. G\nnew\n",
    proposalBlob: "p".repeat(40), sectionBlob: "s".repeat(40), specText: "## 9. G\nold\n", decisions: new Map(), records: [] };
  const rec = (o = {}) => specRecord({ queue: "q", entry: 1, proposal: "q/01-a.md", blob: "p".repeat(40),
    target: "SPEC.md", anchor: "## 9. G", section: "s".repeat(40), ...o });
  assert.equal(deriveSpecStatus(base), "open");
  assert.equal(deriveSpecStatus({ ...base, records: [rec()] }), "approved");
  assert.equal(deriveSpecStatus({ ...base, records: [rec({ blob: "x".repeat(40) })] }), "stale");
  assert.equal(deriveSpecStatus({ ...base, records: [rec({ section: "x".repeat(40) })] }), "stale");
  const done = new Map([[1, { decision: "uebernommen" }]]);
  assert.equal(deriveSpecStatus({ ...base, decisions: done, specText: "x\n## 9. G\nnew\n" }), "applied");
  assert.equal(deriveSpecStatus({ ...base, decisions: done }), "superseded");
});

test("an applied entry is judged by its own section, not by headings later entries filled", () => {
  // Queue 2026-09-24g entry 05 replaced §10 and added placeholder headings §11–§15, which entries
  // 06–10 then filled. §10 stayed exactly as accepted, so the entry is applied, not superseded.
  const done = new Map([[5, { decision: "uebernommen" }]]);
  const base = { queue: "q", nr: 5, anchor: "## 10. R", bis: null, proposalPath: "q/05-a.md",
    proposalBlob: "p".repeat(40), sectionBlob: "s".repeat(40), decisions: done, records: [],
    proposalText: "## 10. R\nrule A\n\n## 11. X\n\n*(not yet approved)*\n" };
  assert.equal(deriveSpecStatus({ ...base, specText: "## 9. G\nx\n## 10. R\nrule A\n\n## 11. X\n\nrule B\n" }), "applied");
  // Counter-proof: §10 itself was changed after the acceptance.
  assert.equal(deriveSpecStatus({ ...base, specText: "## 10. R\nrule C\n\n## 11. X\n\nrule B\n" }), "superseded");
  // An entry with an end anchor (the preamble, entry 12) is compared as a whole, up to that anchor.
  const pre = { ...base, anchor: "# T", bis: "## 0. H", proposalText: "# T\n\nnew preamble\n" };
  assert.equal(deriveSpecStatus({ ...pre, specText: "# T\n\nnew preamble\n## 0. H\nrule\n" }), "applied");
  assert.equal(deriveSpecStatus({ ...pre, specText: "# T\n\nolder preamble\n## 0. H\nrule\n" }), "superseded");
});

test("an accepted entry whose proposal rewrites its own anchor line is applied while the SPEC holds its text", () => {
  const done = new Map([[1, { decision: "uebernommen" }]]);
  const base = { queue: "q", nr: 1, anchor: R_ANCHOR, bis: R_BIS, proposalPath: "q/01-a.md", proposalText: R_PROPOSAL,
    proposalBlob: "p".repeat(40), sectionBlob: "s".repeat(40), decisions: done, records: [] };
  assert.match(extractSection(R_AFTER, R_ANCHOR, R_BIS).error, /0 times/, "the anchor before acceptance is gone from the SPEC");
  assert.equal(deriveSpecStatus({ ...base, specText: R_AFTER }), "applied");
  // Counter-proof: the text the entry wrote changed after the acceptance, or its first line is gone — superseded.
  assert.equal(deriveSpecStatus({ ...base, specText: R_AFTER.replace("new text.", "changed later.") }), "superseded");
  assert.equal(deriveSpecStatus({ ...base, specText: R_AFTER.replace("narrowed 2026-09-30", "narrowed 2026-10-02") }), "superseded");
  // Not accepted yet, the same entry is judged by its records as before.
  assert.equal(deriveSpecStatus({ ...base, decisions: new Map(), specText: R_BEFORE }), "open");
  // A heading-anchored entry whose first line is its anchor is applied as before; one that renames its heading is found
  // under the new heading.
  const h = { ...base, anchor: "## 11. A", bis: null, proposalText: "## 11. A\n\neleven, new\n" };
  assert.equal(deriveSpecStatus({ ...h, specText: replaceSection(R_BEFORE, "## 11. A", null, h.proposalText) }), "applied");
  assert.equal(deriveSpecStatus({ ...h, specText: R_BEFORE }), "superseded");
  const renamed = { ...h, proposalText: "## 11. B\n\neleven, renamed\n" };
  assert.equal(deriveSpecStatus({ ...renamed, specText: replaceSection(R_BEFORE, "## 11. A", null, renamed.proposalText) }), "applied");
});

test("the current text of an accepted entry is read where the entry wrote it, not at its anchor before acceptance", () => {
  const entries = [{ nr: 1, anchor: R_ANCHOR, bis: R_BIS, proposalText: R_PROPOSAL }];
  const shown = sectionForEntry({ specText: R_AFTER, entries, nr: 1, accepted: true });
  assert.equal(shown.error, undefined);
  assert.equal(shown.current, R_PROPOSAL);
  assert.deepEqual(shown.needs, []);
  // Counter-proof: an entry not yet accepted is still read at its anchor.
  assert.equal(sectionForEntry({ specText: R_BEFORE, entries, nr: 1 }).current,
    `${R_ANCHOR}\nold text.\n*Check:* x\n\n**A LATER RULE** *(PO, 2026-09-24)*\nlater.\n`);
  assert.match(sectionForEntry({ specText: R_AFTER.replace("narrowed 2026-09-30", "narrowed 2026-10-02"), entries, nr: 1,
    accepted: true }).error, /0 times/, "its text gone from the SPEC: nothing to show, and the page says why");
});

// ---------------------------------------------------------------- one click per decision (queue 2026-09-24)

test("ADDING A PRODUCT CREATES ITS LAYOUT — only what is missing", () => {
  const all = missingLayout([], "alice/thesis").map((f) => f.path).sort();
  assert.deepEqual(all, ["CHANGELOG.md", "SPEC.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md", "docs/use-cases/README.md"]);
  const some = missingLayout(["SPEC.md", "docs/use-cases/UC-001-x.md"], "alice/thesis").map((f) => f.path).sort();
  assert.deepEqual(some, ["CHANGELOG.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md"]);
  assert.match(missingLayout([], "alice/thesis").find((f) => f.path === "SPEC.md").content, /VERBINDLICH \(SPEC\)/);
});

// ---------------------------------------------------------------- products in the browser (UC-001)
// THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER · ADDING A PRODUCT CREATES ITS LAYOUT (and writes nothing into the
// instance repository)

test("THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER — adding stores the address and commits nothing to the instance", async () => {
  const st = fakeStorage(), store = createStore(st);
  store.setToken("github_pat_t");
  const { calls, fetchMock } = productGitHub([]);
  const r = await withFetch(fetchMock, () => addProduct({ address: "https://github.com/reader/thesis", token: "github_pat_t", click, store }));
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
  const r = await withFetch(g.fetchMock, () => addProduct({ address: "https://github.com/reader/thesis", token: "github_pat_t", click, store }));
  assert.equal(r.commit, null);
  assert.ok(!g.calls.some(([m]) => m === "POST" || m === "PATCH"), "nothing written");
  assert.deepEqual(store.getProducts(), ["https://github.com/reader/thesis"]);
  const s2 = createStore(fakeStorage()), g2 = productGitHub([]);
  await withFetch(g2.fetchMock, () => assert.rejects(addProduct({ address: "https://github.com/reader/thesis", token: "github_pat_t",
    click: { isTrusted: false }, store: s2 }), /click/));
  assert.equal(g2.calls.length, 0);
  assert.deepEqual(s2.getProducts(), []);
});

test("UC-001 5a: a refused write adds nothing to the list", async () => {
  const store = createStore(fakeStorage());
  const g = productGitHub([]);
  const inner = g.fetchMock;
  const mock = async (u, init) => (init.method === "POST" ? new Response(JSON.stringify({ message: "Resource not accessible" }), { status: 403 }) : inner(u, init));
  await withFetch(mock, () => assert.rejects(addProduct({ address: "https://github.com/reader/thesis", token: "github_pat_t", click, store }), /403/));
  assert.deepEqual(store.getProducts(), []);
});

// ---------------------------------------------------------------- one commit per decision (queue 2026-09-24g, entry 05)
// AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL · A STALE APPROVAL IS NOT APPLIED ·
// SEVERAL FILES ARE ACCEPTED IN ONE CLICK · A QUEUE IS ACCEPTED IN ITS ORDER (UC-006 4–7, 4d, 5a; UC-008 3d)

test("decisionRow is the row tools/apply_approvals.py writes", () => {
  assert.equal(decisionRow(7, "spec-q-07-a99553a7b6f9.md", WHEN), "| 2026-09-29 16:03 UTC | 7 | uebernommen | approval:spec-q-07-a99553a7b6f9.md |\n");
});

test("replaceSection writes the proposal byte for byte and keeps the file's final newline", () => {
  assert.equal(replaceSection(B_SPEC, "## 10. R", null, "## 10. R\n\nnew\n"), "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\n\nold nine\n## 10. R\n\nnew\n");
  assert.equal(replaceSection(B_SPEC, "## 9. G", null, "## 9. G\nnine\n"), "# S\n\n**VERBINDLICH (SPEC)**\n\n## 9. G\nnine\n## 10. R\n\nold ten\n");
  assert.throws(() => replaceSection(B_SPEC, "## 11. X", null, "x\n"), /0 times/);
});

test("AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL — one commit: record, section, decision row", async () => {
  const files = batchRepo(), heads = [];
  const it = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  const { calls, fetchMock } = fakeGitHub();
  const res = await withFetch(fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
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
    const res = await withFetch(fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
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
  const res = await withFetch(fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
    items: s.items(), readAt: readerOf(batchRepo()), now: WHEN }));
  const tree = treeOf(calls);
  assert.deepEqual(Object.keys(tree).sort(), [approvalPath("UC-001", u1.blob), approvalPath("UC-002", u2.blob)]);
  assert.equal(tree[approvalPath("UC-002", u2.blob)], recordText(useCaseRecord(u2.path, u2.blob)));
  assert.deepEqual(res.accepted, ["UC-001", "UC-002"]);
  // Counter-proof: UC-002 changed after it was shown — it is left out and named, UC-001 is still written.
  const g = fakeGitHub();
  const res2 = await withFetch(g.fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
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
  const res = await withFetch(fetchMock, () => acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
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
  await withFetch(fetchMock, () => assert.rejects(acceptItems({ repo: "a/b", branch: "main", token: "github_pat_t", click,
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

test("an entry already written in the queue's decisions is not written twice", async () => {
  const it = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  const name = approvalPath("spec-2026-09-24g_x-05", it.proposalBlob).split("/").pop();
  const plan = await planAcceptance({ items: [it], now: WHEN, read: async (p) => batchRepo({
    [`${QD}/entscheidungen.md`]: `# D\n\n${decisionRow(5, name, WHEN)}` })[p] ?? null });
  assert.deepEqual(plan.files, []);
  assert.match(plan.leftOut[0].reason, /already/);
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
    await assert.rejects(savePseudonymisation({ ...base, click, acknowledged: false }), /I have read this/);
    await assert.rejects(savePseudonymisation({ ...base, click: { isTrusted: false }, acknowledged: true }), /click/);
  });
  assert.equal(calls.length, 0, "nothing sent without the acknowledgement and a real click");
  const r = await withFetch(fetchMock, () => savePseudonymisation({ ...base, click, acknowledged: true }));
  assert.equal(r.sha, "c1");
  assert.equal(pseudonymisationOn(treeOf(calls)["docs/settings.md"]), false);
  assert.deepEqual(Object.keys(treeOf(calls)), ["docs/settings.md"]);
  assert.deepEqual([...st.mem.entries()], before, "localStorage holds no product setting");
  // Switching back on needs no acknowledgement (UC-042 4a).
  const g = fakeGitHub({ "docs/settings.md": "b0" });
  await withFetch(g.fetchMock, () => savePseudonymisation({ ...base, click, off: false, acknowledged: false,
    current: SETTINGS_OFF, currentBlob: "b0" }));
  assert.equal(pseudonymisationOn(treeOf(g.calls)["docs/settings.md"]), true);
});

test("collaborators are saved by one commit of docs/collaborators.md, on a click", async () => {
  const { calls, fetchMock } = fakeGitHub();
  await withFetch(fetchMock, () => assert.rejects(saveCollaborators({ repo: "alice/thesis", branch: "main", token: "github_pat_t",
    click: { isTrusted: false }, list: PEOPLE, currentBlob: null }), /click/));
  assert.equal(calls.length, 0);
  await withFetch(fetchMock, () => saveCollaborators({ repo: "alice/thesis", branch: "main", token: "github_pat_t",
    click, list: PEOPLE, currentBlob: null }));
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
  const res = await withFetch(g.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, click, items: [it],
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
  const res2 = await withFetch(s.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, click, items: [it],
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
  const res = await withFetch(g.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, click,
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
  const res = await withFetch(g.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, click, items: [u1],
    readAt: readerOf(files), now: WHEN }));
  assert.equal(res.commit.sha, NEWC);
  assert.deepEqual(res.commit.changedMeanwhile, ["docs/use-cases/UC-001-a.md"]);
  assert.match(res.warning, /UC-001-a\.md/);
  const cmp = g.calls.find((c) => c.path.endsWith("/repository/compare"));
  assert.deepEqual([cmp.query.from, cmp.query.to], [H0, H1]);
  // Counter-proof: the other commit changed an unrelated file — no warning.
  const g2 = await fakeGitLab({ files, parent: H1, changed: ["README.md"] });
  const res2 = await withFetch(g2.fetchMock, () => acceptItems({ product: p, branch: "main", token: GL_TOKEN, click, items: [u1],
    readAt: readerOf(files), now: WHEN }));
  assert.equal(res2.warning, null);
});

test("ADDING A PRODUCT CREATES ITS LAYOUT — on GitLab, one commit of creates; the address stored; nothing to GitHub", async () => {
  const st = fakeStorage(), store = createStore(st);
  store.setGitLabToken(GL_ADDR, GL_TOKEN, "2026-12-29");
  const g = await fakeGitLab({ files: { "README.md": "# p\n", "SPEC.md": "# old\n" } });
  const r = await withFetch(g.fetchMock, () => addProduct({ address: GL_ADDR, token: GL_TOKEN, click, store }));
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
  await withFetch(bad.fetchMock, () => assert.rejects(addProduct({ address: GL_ADDR, token: GL_TOKEN, click, store: s2 }), /403/));
  assert.deepEqual(s2.getProducts(), []);
});

test("A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN — a token below Maintainer is shown as unable to write to a protected default branch", () => {
  assert.deepEqual(gitlabRole(40), { role: "Maintainer", canWrite: true, note: "" });
  assert.equal(gitlabRole(50).canWrite, true);
  for (const level of [30, 20, 10, null]) {
    const r = gitlabRole(level);
    assert.equal(r.canWrite, false, String(level));
    assert.match(r.note, /protected default branch/);
    assert.match(r.note, /Maintainer/);
  }
  assert.equal(gitlabRole(30).role, "Developer");
  const app = dashboardText();
  assert.match(app, /gitlabRole\(/, "the settings page takes the role check from the core");
  assert.doesNotMatch(app, /role Developer|role <em>Developer<\/em>|>= 30/, "the app names no Developer token any more");
});

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

// ---------------------------------------------------------------- the checks of the other modules (tests/review-core.d/)

const FOLDER = new URL("./review-core.d/", import.meta.url);
for (const f of readdirSync(FOLDER).filter((n) => n.endsWith(".mjs")).sort()) await import(new URL(f, FOLDER));
