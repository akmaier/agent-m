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
  gitlabRole,
} from "../docs/assets/review-core.mjs";
import {
  dashboardText, QD, WHEN, B_SPEC, B_P05, B_P06, B_INDEX, B_UC1, B_UC2,
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
  assert.deepEqual(all, ["CHANGELOG.md", "SPEC.md", "docs/approvals/README.md", "docs/architecture/README.md",
    "docs/spec-freigaben/README.md", "docs/use-cases/README.md"]);
  const some = missingLayout(["SPEC.md", "docs/use-cases/UC-001-x.md"], "alice/thesis").map((f) => f.path).sort();
  assert.deepEqual(some, ["CHANGELOG.md", "docs/approvals/README.md", "docs/architecture/README.md", "docs/spec-freigaben/README.md"]);
  assert.match(missingLayout([], "alice/thesis").find((f) => f.path === "SPEC.md").content, /VERBINDLICH \(SPEC\)/);
  // ONE REVIEW LAYOUT FOR EVERY PRODUCT (UC-001 5, ITM-148): docs/architecture/ holds the decisions and modules; its README
  // says so, as the other three READMEs say what their folders hold.
  assert.match(missingLayout([], "alice/thesis").find((f) => f.path === "docs/architecture/README.md").content,
    /`ARC-<nnn>-<slug>\.md`[\s\S]*`MOD-<slug>\.md`[\s\S]*Agent M dashboard/);
  // Counter-proof: a product with any file under docs/architecture/ gets no README there (the prefix rule).
  const arch = missingLayout(["docs/architecture/ARC-001-x.md"], "alice/thesis").map((f) => f.path).sort();
  assert.deepEqual(arch, ["CHANGELOG.md", "SPEC.md", "docs/approvals/README.md", "docs/spec-freigaben/README.md", "docs/use-cases/README.md"]);
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

// ---------------------------------------------------------------- the checks of the other modules (tests/review-core.d/)

const FOLDER = new URL("./review-core.d/", import.meta.url);
for (const f of readdirSync(FOLDER).filter((n) => n.endsWith(".mjs")).sort()) await import(new URL(f, FOLDER));
