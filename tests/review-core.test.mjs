// Review core — deterministic, no network. Run: node --test tests/*.test.mjs
//
// Module: MOD-review-core
// Guards: STATUS IS DERIVED FROM THE RECORDS; AN APPROVAL NAMES THE EXACT TEXT; AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL; A STALE APPROVAL IS NOT APPLIED; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; ADDING A PRODUCT CREATES ITS LAYOUT; GITLAB PRODUCTS ARE SUPPORTED; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN; A PRODUCT IS NAMED BY ITS ADDRESS; UC-001; UC-006; UC-008
// Level: unit
//
// Every check here was run once against a deliberately broken implementation (SOFTWARE_MAINTENANCE
// §4.0a rule 5): a check that cannot fail checks nothing. The mutations are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md.
//
// SPEC.md names this file as the check of requirements of several modules. The checks of the other modules live in
// tests/review-core.d/, one file per module, and this file runs every file of that folder (at its end): a failing check there
// makes this file red. Those files are not matched by tests/*.test.mjs, so CI runs each check once. The checks of the dashboard's
// five writes (saving an edit, accepting, adding a product, the product settings) are there too, in dashboard-writes.test.mjs.

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import {
  gitBlobSha, parseRecord, recordText, approvalPath, useCaseRecord,
  specRecord, extractSection, sectionText, parseQueueIndex, parseDecisions,
  deriveUseCaseStatus, deriveSpecStatus, missingLayout,
  planAcceptance, decisionRow, replaceSection, sectionForEntry,
  deriveTarget, gitlabRole,
  lastAccepted, changedLines, readBlob,
} from "../docs/assets/review-core.mjs";
import { reviewedId } from "../docs/assets/artifacts.mjs";
import { parseProductAddress, webFileUrl } from "../docs/assets/git-host.mjs";
import { diffHtml } from "../docs/assets/dashboard-app.mjs";
import {
  dashboardText, withFetch, QD, WHEN, B_SPEC, B_P05, B_P06, B_INDEX, B_UC1, B_UC2,
  GL, GL_ADDR, GL_TOKEN, UC_OLD, UC_NEW,
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

test("an entry already written in the queue's decisions is not written twice", async () => {
  const it = await specItem(5, B_P05, "## 10. R\n\nold ten\n", "## 10. R");
  const name = approvalPath("spec-2026-09-24g_x-05", it.proposalBlob).split("/").pop();
  const plan = await planAcceptance({ items: [it], now: WHEN, read: async (p) => batchRepo({
    [`${QD}/entscheidungen.md`]: `# D\n\n${decisionRow(5, name, WHEN)}` })[p] ?? null });
  assert.deepEqual(plan.files, []);
  assert.match(plan.leftOut[0].reason, /already/);
});

// ---------------------------------------------------------------- GitLab products (queue 2026-09-24b)
// GITLAB PRODUCTS ARE SUPPORTED · A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN · A PRODUCT IS NAMED BY ITS ADDRESS
// (UC-001 3c/3d, UC-006). The GitLab server is a mock of the REST API v4 as GitLab documents it
// (doc/api/repositories.md, repository_files.md, commits.md, branches.md); no request leaves this process.

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
