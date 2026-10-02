// Release tests of sprint 02, strand C — the approval engine: the gates ITM-014 characterised, applyApprovals of ITM-016, and the
// architecture's acceptance on the reader ITM-128 moved (ITM-144). Written by tester-opus (claude-opus-5-5), the Release tester of
// docs/process.md, who implemented none of the strand's items, from the SPEC rules and use cases they realise; started on
// sprint/02 at a7b4b9f, 2026-10-01.
//
// Module: MOD-review-core
// Guards: A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN; THE APPROVED TEXT IS TAKEN VERBATIM; NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT; THE REPLACED TEXT STAYS REACHABLE; A GENERATED ARTIFACT IS A PROPOSAL; A RECORD IS EVIDENCE, NOT A PROPOSAL; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE; A STALE APPROVAL IS NOT APPLIED; ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; UC-006; UC-022
// Level: release
//
// Over a fixture repository written in this file — a made-up product's SPEC, one change queue, a use case, a decision, a module —
// held as a map of path to text. The engine reads it through the ports it takes; the dashboard's commit (planAcceptance, with a
// token) and the instance workflow's (applyApprovals, without one; tools/apply_approvals.py, which the workflow still runs) are
// both driven. Where git history is the evidence, the fixture is committed in a temporary git repository. Each expectation is
// stated before its case runs, from the rule or the use-case step it names. Known findings of the items are not re-tested here:
// F1–F3 (the Python tool reads CR LF as LF) and V1 (blank lines that end a proposal) — see the measurement record.

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  gitBlobSha, deriveReviewedStatus, deriveSpecStatus, statusByNames, recordIndex, sectionForEntry, planAcceptance,
  parseRecord, parseDecisions, architecturePrerequisites, reviewPage,
} from "../docs/assets/review-core.mjs";
import { applyApprovals } from "../docs/assets/review-core/apply-approvals.mjs";
import { kindOfPath, parseArchitecture } from "../docs/assets/artifacts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NOW = new Date("2026-10-01T09:30:00Z");

// ------------------------------------------------------------------------------------------------ the fixture repository

const req = (name, source, rule) => `**${name}** *(${source})*\n${rule}\n*Occasion:* reviewers print it.\n*Check:* \`tests/test_export.py\`\n`;
const SPEC = `# Thesis tool — Specification

**VERBINDLICH (SPEC)**

## 1. Export

${req("EXPORT IS A PDF", "PO B. Example, 2026-09-24", "The export is one PDF file.")}
## 2. Title page

${req("THE TITLE PAGE NAMES THE AUTHOR", "PO B. Example, 2026-09-24", "The title page names the author.")}
## 3. Old rules

**OLD EXPORT** *(PO B. Example, 2026-09-23 — withdrawn 2026-09-24)*
*Withdrawn:* replaced by \`EXPORT IS A PDF\`. The name is not reused.

## 4. Fonts

${req("THE BODY TEXT IS SERIF", "PO B. Example, 2026-09-24", "The body text is set in a serif font.")}`;
const SECTION_2 = `## 2. Title page\n\n${req("THE TITLE PAGE NAMES THE AUTHOR", "PO B. Example, 2026-09-24", "The title page names the author.")}`;

const QN = "2026-10-01_title-page", Q = `docs/spec-freigaben/${QN}`;
// Entry 01 rewrites section 2 — every kind of character the approval field may hold, a tab, trailing blanks, quotes, a dash,
// umlauts, a character outside the BMP — and creates the heading "## 5. Appendix", which entry 02 replaces. Entry 03 rewrites
// section 4.
const P01 = "## 2. Title page\n\n**THE TITLE PAGE NAMES THE AUTHOR AND THE SUPERVISOR** *(PO B. Example, 2026-10-01)*\n" +
  "The title page names the author — and „the supervisor“ — in that order.\t \n*Occasion:* Prüfungsamt 📄 asks for both.  \n" +
  "*Check:* `tests/test_title.py`\n\n## 5. Appendix\n\nTo be written.\n";
const P02 = "## 5. Appendix\n\nThe appendix lists the sources.\n";
const P03 = "## 4. Fonts\n\n" + req("THE BODY TEXT IS SANS", "PO B. Example, 2026-10-01", "The body text is set in a sans-serif font.");
const INDEX = `# SPEC approvals — queue ${QN} · title page\n\n**Zieldatei aller Einträge:** \`SPEC.md\`\n\n` +
  "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |\n|---|---|---|---|---|\n" +
  "| 01 | `SPEC.md` | ## 2. Title page | — | — |\n| 02 | `SPEC.md` | ## 5. Appendix | — | — |\n| 03 | `SPEC.md` | ## 4. Fonts | — | — |\n";
const DECISIONS = `# Decisions — queue ${QN}\n\nAppend-only.\n`;
const PROPOSALS = { 1: [`${Q}/01-title.md`, P01, "## 2. Title page"], 2: [`${Q}/02-appendix.md`, P02, "## 5. Appendix"],
  3: [`${Q}/03-fonts.md`, P03, "## 4. Fonts"] };

const UC = "docs/use-cases/UC-001-export-the-thesis.md";
const UC_TEXT = "---\nid: UC-001\ntitle: Export the thesis\nrealises:\n  - EXPORT IS A PDF\n---\n# UC-001 Export the thesis\n";
const arcText = (forcedBy) => `---\nid: ARC-001\ntitle: Export through the browser's print\nforced_by:\n${forcedBy.map((n) => `  - ${n}\n`).join("")}---\n` +
  "# ARC-001\n\n## Context\n\nc\n\n## Decision\n\nd\n\n## Alternatives\n\na\n\n## Consequences\n\nq\n";
const ARC = "docs/architecture/ARC-001-export-through-print.md";
const MOD = "docs/architecture/MOD-exporter.md";
const MOD_TEXT = "---\nid: MOD-exporter\ntitle: Exporter\nrealises:\n  - EXPORT IS A PDF\nfollows:\n  - ARC-001\nuses: []\n" +
  "provides:\n  - exportPdf\n---\n# MOD-exporter\n\n## Responsibility\n\nr\n\n## Interfaces\n\n- `exportPdf(thesis) -> pdf` — x\n";

function fixture(extra = {}) {
  return new Map(Object.entries({
    "SPEC.md": SPEC, [`${Q}/index.md`]: INDEX, [`${Q}/entscheidungen.md`]: DECISIONS,
    ...Object.fromEntries(Object.values(PROPOSALS).map(([p, t]) => [p, t])),
    [UC]: UC_TEXT, [ARC]: arcText(["EXPORT IS A PDF", "UC-001"]), [MOD]: MOD_TEXT, "docs/approvals/README.md": "# Approvals\n",
    ...extra,
  }));
}
// The port both engines read through: a file's text or null; for a folder (ending in "/") the names of its files.
const reader = (repo) => async (p) => {
  if (p.endsWith("/")) { const names = [...repo.keys()].filter((k) => k.startsWith(p) && !k.slice(p.length).includes("/")).map((k) => k.slice(p.length)); return names.length ? names : null; }
  return repo.has(p) ? repo.get(p) : null;
};
const sectionOf = (text, anchor) => { // the section as a reader sees it: from its heading to the next heading of its level
  const lines = text.split("\n"), from = lines.indexOf(anchor), level = anchor.match(/^#+/)[0].length;
  let to = lines.findIndex((l, i) => i > from && /^#+ /.test(l) && l.match(/^#+/)[0].length <= level);
  if (to < 0) to = lines.length;
  return lines.slice(from, to).join("\n").replace(/\n+$/, "") + "\n";
};
const blob = gitBlobSha;

// What the dashboard shows of an entry and the reviewer ticks: the proposal's and the section's blobs as shown.
async function specItem(repo, nr) {
  const [proposalPath, proposalText, anchor] = PROPOSALS[nr];
  const entries = Object.entries(PROPOSALS).map(([n, [, t, a]]) => ({ nr: Number(n), anchor: a, bis: null, proposalText: t }));
  const s = sectionForEntry({ specText: repo.get("SPEC.md"), entries, nr });
  return { kind: "spec", queue: Q, qname: QN, nr, nn: String(nr).padStart(2, "0"), anchor, bis: null, proposalPath,
    proposalBlob: await blob(proposalText), targetPath: "SPEC.md", sectionBlob: s.error ? null : await blob(s.current), needs: s.needs ?? [] };
}
// The approval record a person commits on GitHub's page without the dashboard (UC-006 4b, 4c).
async function specRecordFile(repo, nr, over = {}) {
  const it = await specItem(repo, nr);
  const r = { kind: "spec", queue: Q, entry: it.nn, proposal: it.proposalPath, blob: it.proposalBlob, target: "SPEC.md",
    anchor: it.anchor, section: it.sectionBlob, ...over };
  const name = `spec-${QN}-${it.nn}-${String(r.blob).slice(0, 12)}.md`;
  const text = Object.entries(r).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}\n`).join("");
  return [`docs/approvals/${name}`, text];
}
// The SPEC after a write holds `proposal` byte for byte where the section from `anchor` stood, and every byte before that
// section and from the heading `next` on as before. Between the proposal and `next` only line ends may differ: whether blank
// lines that end a proposal or a section are kept is finding V1, the Product Owner's call — not pinned here either way.
function assertInPlace(written, before, anchor, next, proposal, route) {
  const at = before.indexOf(`\n${anchor}\n`) + 1, end = before.indexOf(`\n${next}\n`) + 1;
  assert.equal(written.slice(0, at), before.slice(0, at), `${route}: every byte before the section unchanged`);
  assert.equal(written.slice(written.indexOf(`\n${next}\n`) + 1), before.slice(end), `${route}: every byte from ${next} on unchanged`);
  const between = written.slice(at, written.indexOf(`\n${next}\n`) + 1);
  assert.ok(between.startsWith(proposal), `${route}: the proposal stands in the SPEC byte for byte`);
  assert.match(between.slice(proposal.length), /^\n*$/, `${route}: nothing but the proposal in its place`);
}
const filesOf = (plan) => new Map(plan.files.map((f) => [f.path, f.content]));
const without = (text, section) => text.replace(section, "");

// ------------------------------------------------------------------------------------------------ ITM-014: the gates

// A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN — UC-006 main flow, steps 4–6: nothing is written before a person
// accepts, and what is written is written with the acceptance. Expected: an acceptance of nothing writes nothing; the instance
// workflow, with no approval record committed, writes nothing; accepting entry 03 writes SPEC.md in the same commit as its
// approval record and its decision row, and changes no byte outside section 4 — not the other sections, not the CR LF ends
// of a line in section 1 (the engine's two writers; F1 records that the Python tool does not keep them).
test("release · gates: a SPEC change is written only with its acceptance, and only its own section", async () => {
  const repo = fixture();
  assert.deepEqual((await planAcceptance({ items: [], read: reader(repo), now: NOW })).files, [], "no acceptance, no file");
  const none = await applyApprovals({ read: reader(repo), now: NOW });
  assert.deepEqual(none.files, [], "no record, nothing written by the workflow");
  const crlf = SPEC.replace("The export is one PDF file.\n", "The export is one PDF file.\r\n");
  for (const [route, run] of [
    ["dashboard", async (r) => filesOf(await planAcceptance({ items: [await specItem(r, 3)], read: reader(r), now: NOW }))],
    ["workflow", async (r) => { const [p, t] = await specRecordFile(r, 3); r.set(p, t); return filesOf(await applyApprovals({ read: reader(r), now: NOW })); }],
  ]) {
    const r = fixture({ "SPEC.md": crlf });
    const files = await run(r);
    const written = files.get("SPEC.md");
    assert.ok(written, `${route}: SPEC.md written`);
    assert.equal(without(written, P03), without(crlf, sectionOf(SPEC, "## 4. Fonts")), `${route}: every other byte unchanged`);
    assert.ok(written.includes("The export is one PDF file.\r\n"), `${route}: the CR LF of section 1 kept`);
    if (route === "dashboard") assert.ok([...files.keys()].some((p) => p.startsWith("docs/approvals/spec-")), "dashboard: the record in the same commit");
    assert.match(files.get(`${Q}/entscheidungen.md`), /\| 3 \| uebernommen \| approval:spec-2026-10-01_title-page-03-[0-9a-f]{12}\.md \|/, `${route}: decision row`);
  }
});

// THE APPROVED TEXT IS TAKEN VERBATIM — "what stands in the approval field is exactly what is written". Expected: on both
// writers, the section in the SPEC afterwards is the proposal byte for byte — tab, trailing blanks, typographic quotes, a dash,
// umlauts, an emoji, CR LF inside the proposal — ending in one newline (V1, blank lines ending a proposal, is left to the PO).
test("release · gates: the approved text is written byte for byte, on the dashboard's and on the workflow's route", async () => {
  const p01 = P01.replace("To be written.\n", "To be written.\r\nSecond line.\n");
  for (const route of ["dashboard", "workflow"]) {
    const r = fixture({ [PROPOSALS[1][0]]: p01 });
    PROPOSALS[1][1] = p01;
    try {
      let files;
      if (route === "dashboard") files = filesOf(await planAcceptance({ items: [await specItem(r, 1)], read: reader(r), now: NOW }));
      else { const [p, t] = await specRecordFile(r, 1); r.set(p, t); files = filesOf(await applyApprovals({ read: reader(r), now: NOW })); }
      const written = files.get("SPEC.md");
      assertInPlace(written, SPEC, "## 2. Title page", "## 3. Old rules", p01, route);
    } finally { PROPOSALS[1][1] = P01; }
  }
});

// NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT — UC-006 step 2: the current SPEC section beside the proposal, not a summary.
// Expected: the text the engine gives as current is the section as it stands, byte for byte; for entry 02, whose heading only
// entry 01 creates, it is the text that will stand there once 01 is written, and 01 is named; an approval names the blob of
// the current text shown, so a record naming another text is not applied.
test("release · gates: the current text beside a proposal is the section as it stands, byte for byte", async () => {
  const repo = fixture();
  const entries = Object.entries(PROPOSALS).map(([n, [, t, a]]) => ({ nr: Number(n), anchor: a, bis: null, proposalText: t }));
  const one = sectionForEntry({ specText: SPEC, entries, nr: 1 });
  assert.equal(one.current, SECTION_2);
  assert.deepEqual(one.needs, []);
  const two = sectionForEntry({ specText: SPEC, entries, nr: 2 });
  assert.equal(two.current, "## 5. Appendix\n\nTo be written.\n");
  assert.deepEqual(two.needs, [1]);
  const [p, t] = await specRecordFile(repo, 1, { section: await blob("## 2. Title page\n\n(a summary of the rule)\n") });
  repo.set(p, t);
  const out = await applyApprovals({ read: reader(repo), now: NOW });
  assert.deepEqual(out.files, [], "an approval of another current text writes nothing");
  assert.equal(out.refused.length, 1);
});

// THE REPLACED TEXT STAYS REACHABLE — "through the git history; no second copy is kept in the working tree" (UC-006
// postcondition). Expected: the commit of an acceptance holds only SPEC.md, the record and the decision row — none of them, and
// no other file of the tree, carries the replaced section —, and after the commit, `git show HEAD^:SPEC.md` holds the replaced
// section, whose blob is the one the record names.
test("release · gates: the replaced section is reachable in git history and kept nowhere in the tree", async () => {
  const repo = fixture();
  const item = await specItem(repo, 3);
  const plan = await planAcceptance({ items: [item], read: reader(repo), now: NOW });
  assert.deepEqual(plan.files.map((f) => f.path).sort(),
    [`${Q}/entscheidungen.md`, "SPEC.md", `docs/approvals/spec-${QN}-03-${item.proposalBlob.slice(0, 12)}.md`].sort());
  const old = sectionOf(SPEC, "## 4. Fonts");
  const d = mkdtempSync(join(tmpdir(), "release-02c-"));
  try {
    const git = (...a) => execFileSync("git", ["-C", d, ...a], { encoding: "utf8" });
    git("init", "-q"); git("config", "user.email", "t@example.org"); git("config", "user.name", "t");
    const put = (path, text) => { mkdirSync(dirname(join(d, path)), { recursive: true }); writeFileSync(join(d, path), text); };
    for (const [path, text] of repo) put(path, text);
    git("add", "-A"); git("commit", "-q", "-m", "before");
    for (const f of plan.files) put(f.path, f.content);
    git("add", "-A"); git("commit", "-q", "-m", "accept 03");
    const before = git("show", "HEAD^:SPEC.md");
    assert.ok(before.includes(old), "the replaced section is in the parent commit");
    const record = parseRecord(plan.files.find((f) => f.path.startsWith("docs/approvals/spec-")).content);
    assert.equal(record.section, await blob(old), "the record names the replaced text");
    const tracked = git("ls-files").split("\n").filter(Boolean);
    const copies = tracked.filter((f) => readFileSync(join(d, f), "utf8").includes("The body text is set in a serif font."));
    assert.deepEqual(copies, [], "no file of the tree keeps the replaced rule");
  } finally { rmSync(d, { recursive: true, force: true }); }
});

// A GENERATED ARTIFACT IS A PROPOSAL — "a file without an approval record naming its current text is shown as open".
// A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN — a use case, a decision, a module or a SPEC change proposal written
// directly to the default branch counts as open until an approval record names its text. Expected, for each of the three
// reviewed kinds: no record → open (from the records and from the names in the tree); a record of an earlier text → not
// accepted; a record of its current text → accepted. For the SPEC proposal: open → a record of another proposal text is not
// approved → a record of its text and of the section shown → approved.
test("release · gates: a file on the default branch is open until a record names its current text", async () => {
  for (const [path, text] of [[UC, UC_TEXT], [ARC, arcText(["EXPORT IS A PDF"])], [MOD, MOD_TEXT]]) {
    const kind = kindOfPath(path), b = await blob(text), earlier = await blob(text + "earlier\n");
    assert.equal(deriveReviewedStatus(path, b, []), "open", path);
    const byName = await statusByNames({ index: recordIndex(["docs/approvals/README.md", path]), path, blob: b, read: async () => [] });
    assert.equal(byName.status, "open", `${path} by names`);
    assert.notEqual(deriveReviewedStatus(path, b, [{ kind, file: path, blob: earlier }]), "accepted", `${path}: an earlier text's record`);
    assert.equal(deriveReviewedStatus(path, b, [{ kind, file: path, blob: b }]), "accepted", `${path}: its own record`);
  }
  const repo = fixture(), it = await specItem(repo, 3);
  const entry = { queue: Q, nr: 3, anchor: it.anchor, bis: null, proposalPath: it.proposalPath, proposalText: P03,
    proposalBlob: it.proposalBlob, sectionBlob: it.sectionBlob, specText: SPEC, decisions: parseDecisions(DECISIONS) };
  const rec = (over) => ({ kind: "spec", queue: Q, entry: "03", proposal: it.proposalPath, blob: it.proposalBlob, section: it.sectionBlob, ...over });
  assert.equal(deriveSpecStatus({ ...entry, records: [] }), "open");
  assert.notEqual(deriveSpecStatus({ ...entry, records: [rec({ blob: await blob("another proposal\n") })] }), "approved");
  assert.notEqual(deriveSpecStatus({ ...entry, records: [rec({ section: await blob("another section\n") })] }), "approved");
  assert.equal(deriveSpecStatus({ ...entry, records: [rec({})] }), "approved");
});

// A RECORD IS EVIDENCE, NOT A PROPOSAL — approval, gate, job and test result records "are never shown for acceptance". Expected:
// none of them is a reviewed kind of file, and the use case beside them is.
test("release · gates: records are not of a reviewed kind; a use case is", () => {
  for (const p of ["docs/jobs/JOB-20261001-0900-a1b2.md", "docs/approvals/UC-001-0123456789ab.md", "docs/gates/GATE-20261001-0900-c3d4.md",
    "docs/test-results/2026-10-01_a7b4b9f.md"]) assert.equal(kindOfPath(p), null, p);
  assert.equal(kindOfPath(UC), "use-case");
});

// A RECORD IS EVIDENCE, NOT A PROPOSAL — the SPEC's check: "a job record without approval is not listed as open; counter-proof:
// a use case without approval is." Expected: the engine's status of a job record and of an approval record without approval is
// not "open", and a review page given them shows neither; the use case is open and shown. Finding G1 of ITM-014.
test("release · gates: a job record without approval is not open; a use case without approval is",
  { todo: "finding G1 (ITM-014, docs/measurements/2026-10-01_approval-gates-counter-proofs.md) — back to Development: the engine answers \"open\" for a record" }, async () => {
    const files = [];
    for (const path of ["docs/jobs/JOB-20261001-0900-a1b2.md", "docs/approvals/UC-001-0123456789ab.md"]) {
      const b = await blob(`record ${path}\n`);
      assert.notEqual(deriveReviewedStatus(path, b, []), "open", path);
      files.push({ item: { kind: "use-case", id: path, path, blob: b }, status: deriveReviewedStatus(path, b, []), open: [], problem: null });
    }
    const ucBlob = await blob(UC_TEXT);
    assert.equal(deriveReviewedStatus(UC, ucBlob, []), "open");
    files.push({ item: { kind: "use-case", id: "UC-001", path: UC, blob: ucBlob }, status: "open", open: [], problem: null });
    assert.deepEqual(reviewPage(files).shown.map((f) => f.item.path), [UC]);
  });

// A RECORD IS EVIDENCE, NOT A PROPOSAL — never accepted: an acceptance handed a job record writes no approval record for it.
// Expected: no file of the commit names the job record. Finding G2 of ITM-014.
test("release · gates: an acceptance handed a job record writes no approval record for it",
  { todo: "finding G2 (ITM-014, docs/measurements/2026-10-01_approval-gates-counter-proofs.md) — back to Development: planAcceptance writes kind: use-case for it" }, async () => {
    const JOB = "docs/jobs/JOB-20261001-0900-a1b2.md", text = "# JOB-20261001-0900-a1b2\n\nstarted\n";
    const repo = fixture({ [JOB]: text });
    const plan = await planAcceptance({ items: [{ kind: "use-case", id: "JOB-20261001-0900-a1b2", path: JOB, blob: await blob(text) }], read: reader(repo), now: NOW });
    assert.deepEqual(plan.files.filter((f) => f.content.includes(JOB)), []);
  });

// ------------------------------------------------------------------------------------------------ ITM-016: applyApprovals

// UC-006 4c · WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE · A STALE APPROVAL IS NOT APPLIED: a record committed
// on GitHub's page; the workflow applies it with the same checks. Expected for each fault, one record at a time: nothing is
// written, and the record is refused under its own file name — proposal changed after approval, SPEC section changed after
// approval, a field missing, an anchor other than the queue's, a proposal outside the queue, an entry the queue does not have.
// A record already applied (its decision row exists) and a use case's record are passed over: nothing written, nothing refused.
test("release · applyApprovals: a stale or malformed record is refused by name and nothing is written", async () => {
  const cases = [
    ["the proposal changed after approval", (r) => r.set(PROPOSALS[3][0], P03 + "changed after\n"), {}, /proposal changed after approval/],
    ["the SPEC section changed after approval", (r) => r.set("SPEC.md", SPEC.replace("set in a serif", "set in a Serif")), {}, /SPEC section changed after approval/],
    ["a field is missing", () => {}, { anchor: undefined }, /missing anchor/],
    ["the anchor is not the queue's", () => {}, { anchor: "## 1. Export" }, /anchor/],
    ["the proposal is not a file of the queue", () => {}, { proposal: "SPEC.md" }, /not a file of queue/],
    ["the queue has no such entry", () => {}, { entry: "07" }, /no entry 7/],
  ];
  for (const [what, change, over, reason] of cases) {
    const r = fixture();
    const [p, t] = await specRecordFile(r, 3, over);
    r.set(p, t);
    change(r);
    const out = await applyApprovals({ read: reader(r), now: NOW });
    assert.deepEqual(out.files, [], `${what}: nothing written`);
    assert.equal(out.refused.length, 1, what);
    assert.equal(out.refused[0].record, p.split("/").pop(), `${what}: refused by its name`);
    assert.match(out.refused[0].reason, reason, what);
    assert.ok(out.report.startsWith(`${p.split("/").pop()}: refused — `), `${what}: the report names it`);
  }
  const r = fixture();
  const [p, t] = await specRecordFile(r, 3);
  r.set(p, t);
  r.set(`${Q}/entscheidungen.md`, `${DECISIONS}| 2026-10-01 09:00 UTC | 3 | uebernommen | approval:${p.split("/").pop()} |\n`);
  r.set(`docs/approvals/UC-001-${(await blob(UC_TEXT)).slice(0, 12)}.md`, `kind: use-case\nfile: ${UC}\nblob: ${await blob(UC_TEXT)}\n`);
  const out = await applyApprovals({ read: reader(r), now: NOW });
  assert.deepEqual([out.files, out.refused], [[], []], "already applied and a use case's record: passed over");
});

// UC-006 4c, 4d · UC-006 postcondition "The SPEC contains exactly the approved text": records of one queue committed together are
// applied in the order of their names, entry 02 after entry 01, which creates its heading. Expected: SPEC.md holds both
// proposals and every other byte as before; two decision rows, in that order; a third, stale record beside them refused by
// name without stopping the others.
test("release · applyApprovals: several records in one run — each written, in order, a stale one refused beside them", async () => {
  const r = fixture();
  const [p1, t1] = await specRecordFile(r, 1);
  const s2 = SPEC.replace(SECTION_2, P01);
  const two = { kind: "spec", queue: Q, entry: "02", proposal: PROPOSALS[2][0], blob: await blob(P02), target: "SPEC.md",
    anchor: "## 5. Appendix", section: await blob(sectionOf(s2, "## 5. Appendix")) };
  const p2 = `docs/approvals/spec-${QN}-02-${two.blob.slice(0, 12)}.md`;
  const [p3, t3] = await specRecordFile(r, 3, { blob: await blob("an older proposal\n") });
  for (const [p, t] of [[p1, t1], [p2, Object.entries(two).map(([k, v]) => `${k}: ${v}\n`).join("")], [p3, t3]]) r.set(p, t);
  const out = await applyApprovals({ read: reader(r), now: NOW });
  const files = filesOf(out);
  assertInPlace(files.get("SPEC.md"), SPEC, "## 2. Title page", "## 3. Old rules", P01.replace("## 5. Appendix\n\nTo be written.\n", P02), "workflow");
  const rows = [...parseDecisions(files.get(`${Q}/entscheidungen.md`)).entries()].map(([nr, d]) => [nr, d.ref]);
  assert.deepEqual(rows, [[1, `approval:${p1.split("/").pop()}`], [2, `approval:${p2.split("/").pop()}`]]);
  assert.deepEqual(out.refused.map((x) => x.record), [p3.split("/").pop()]);
});

// WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE — "byte for byte as tools/apply_approvals.py" (ITM-016): the same
// records on the same tree, given to applyApprovals and to the tool the workflow runs, at the same minute. Expected: the same
// files with the same bytes, the same report line for line, and a refusal on both sides exactly where one side refuses. The
// tree is LF throughout: on CR LF the tool differs by findings F1–F3, already marked in tests/test_apply_approvals.py.
test("release · applyApprovals: the same files, bytes and report as tools/apply_approvals.py", async () => {
  const r = fixture();
  const recs = [await specRecordFile(r, 1), await specRecordFile(r, 3, { blob: await blob("an older proposal\n") }),
    await specRecordFile(r, 3, { anchor: undefined, blob: (await blob(P03)).replace(/^./, "0") })];
  for (const [p, t] of recs) r.set(p, t);
  r.set(`docs/approvals/UC-001-${(await blob(UC_TEXT)).slice(0, 12)}.md`, `kind: use-case\nfile: ${UC}\nblob: ${await blob(UC_TEXT)}\n`);
  const engine = await applyApprovals({ read: reader(r), now: NOW });
  const d = mkdtempSync(join(tmpdir(), "release-02c-py-"));
  try {
    for (const [path, text] of r) { mkdirSync(dirname(join(d, path)), { recursive: true }); writeFileSync(join(d, path), text); }
    const before = new Map([...r]);
    const py = JSON.parse(execFileSync("python3", ["-c", `
import sys, json, datetime as d
sys.path.insert(0, ${JSON.stringify(join(ROOT, "tools"))})
import apply_approvals as ap
class Fixed(d.datetime):
    @classmethod
    def now(cls, tz=None): return d.datetime(2026, 10, 1, 9, 30, tzinfo=d.timezone.utc)
ap.dt = type("clock", (), {"datetime": Fixed, "timezone": d.timezone})
rc, report = ap.apply(${JSON.stringify(d)})
print(json.dumps({"rc": rc, "report": report}))`], { encoding: "utf8" }));
    const changed = new Map();
    const walk = (dir, rel = "") => { for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(join(dir, e.name), p);
      else { const t = readFileSync(join(dir, e.name), "utf8"); if (before.get(p) !== t) changed.set(p, t); } } };
    walk(d);
    assert.deepEqual(new Map(engine.files.map((f) => [f.path, f.content])), changed, "the same files with the same bytes");
    assert.equal(engine.report, py.report, "the same report");
    assert.equal(py.rc === 1, engine.refused.length > 0, "a refusal on both sides");
    assert.ok(changed.has("SPEC.md") && engine.refused.length === 2, "the case is not vacuous: one applied, two refused");
  } finally { rmSync(d, { recursive: true, force: true }); }
});

// ------------------------------------------------------------------------------------------------ UC-022: architecture rests on accepted artifacts

// ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — UC-022 step 10 and 10a: a decision or module is accepted only when every requirement
// and use case it names is accepted. Expected: a decision naming the withdrawn OLD EXPORT, a name that is only bold prose in the
// SPEC, or a use case not yet accepted lists each as open with its reason, and its acceptance is refused and names it; the same
// decision naming the live requirement and the accepted use case has nothing open and is accepted with one record.
test("release · UC-022: a decision is accepted only when everything it names is accepted", async () => {
  const ucBlob = await blob(UC_TEXT), ucRecord = `docs/approvals/UC-001-${ucBlob.slice(0, 12)}.md`;
  const accepted = { id: "UC-001", path: UC, blob: ucBlob, status: "accepted", record: ucRecord };
  const repoWith = (arc) => fixture({ [ARC]: arc, [ucRecord]: `kind: use-case\nfile: ${UC}\nblob: ${ucBlob}\n` });
  const tryAccept = async (names, ucs) => {
    const text = arcText(names), repo = repoWith(text), arch = parseArchitecture(ARC, text);
    const pre = architecturePrerequisites({ arch, specText: SPEC, useCases: ucs });
    const plan = await planAcceptance({ items: [{ kind: "architecture-decision", id: "ARC-001", path: ARC, blob: await blob(text),
      changed: false, requires: pre.useCases }], read: reader(repo), now: NOW });
    return { open: pre.open, plan };
  };
  for (const [names, ucs, openName] of [
    [["OLD EXPORT"], [accepted], "OLD EXPORT"],
    [["VERBINDLICH (SPEC)"], [accepted], "VERBINDLICH (SPEC)"],
    [["EXPORT IS A PDF", "UC-001"], [{ ...accepted, status: "open", record: null }], "UC-001"],
  ]) {
    const { open, plan } = await tryAccept(names, ucs);
    assert.deepEqual(open.map((o) => o.name), [openName], `${names}: listed as open`);
    assert.deepEqual(plan.files, [], `${names}: not accepted`);
    assert.equal(plan.leftOut.length, 1);
    assert.match(plan.leftOut[0].reason, new RegExp(openName.replace(/[()]/g, "\\$&")), `${names}: the refusal names it`);
  }
  const ok = await tryAccept(["EXPORT IS A PDF", "UC-001"], [accepted]);
  assert.deepEqual(ok.open, []);
  assert.deepEqual(ok.plan.files.map((f) => f.path), [`docs/approvals/ARC-001-${(await blob(arcText(["EXPORT IS A PDF", "UC-001"]))).slice(0, 12)}.md`]);
});
