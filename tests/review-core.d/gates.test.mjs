// The approval gates of the engine for reviewed files and records (docs/assets/review-core.mjs) — characterisation tests of
// ITM-014, a refactoring job: they pin what the engine does today. Deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-review-core
// Guards: A GENERATED ARTIFACT IS A PROPOSAL; A RECORD IS EVIDENCE, NOT A PROPOSAL; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
// Level: unit
//
// The product is tests/fixtures/gates/: a use case, an architecture decision, a module and a queue of two SPEC entries,
// all written straight to the branch without a record, and a job record. What this file adds to the status checks that
// exist (tests/status-by-names.test.mjs, tests/architecture.test.mjs, tests/review-core.test.mjs): the round trip from the
// engine's own acceptance commit (planAcceptance) to the status the engine then derives from the tree (recordIndex,
// statusByNames, specStatusByNames) — a file counts as accepted because the record the engine wrote names its text, and only
// that text — and how the engine treats a record that is no reviewed file. Two cases fail on the current code; they are
// marked { todo } with their finding and stay red until the finding is decided
// (docs/measurements/2026-10-01_approval-gates-counter-proofs.md).

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "../../docs/assets/review-core.mjs";
import { reviewedId } from "../../docs/assets/artifacts.mjs";

const { gitBlobSha, parseRecord, recordIndex, statusByNames, specStatusByNames, parseQueueIndex, parseDecisions, planAcceptance,
  sectionForEntry, deriveReviewedStatus, reviewedRecord, reviewPage } = core;

const FIX = fileURLToPath(new URL("../fixtures/gates/", import.meta.url));
function fixture() {
  const files = {};
  (function walk(dir) {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) walk(p); else files[relative(FIX, p).split("\\").join("/")] = readFileSync(p, "utf8");
    }
  })(FIX);
  return files;
}

const QD = "docs/spec-freigaben/2026-10-01a_gates", QNAME = "2026-10-01a_gates";
const UC = "docs/use-cases/UC-001-read-a-report.md", ARC = "docs/architecture/ARC-001-static-site.md";
const MOD = "docs/architecture/MOD-reader.md", JOB = "docs/jobs/JOB-20261001-0900-a1b2.md";
const REVIEWED = [UC, ARC, MOD];
const WHEN = new Date("2026-10-01T12:00:00Z");

// What the dashboard derives from one tree: the status of every reviewed file — from the names of the records and, as for a
// file that is opened, from their content — and of every SPEC entry of the queue.
async function statuses(tree) {
  const index = recordIndex(Object.keys(tree));
  const read = async (paths) => paths.map((p) => ({ ...parseRecord(tree[p]), _path: p }));
  const out = {};
  for (const path of REVIEWED) {
    const blob = await gitBlobSha(tree[path]);
    const byNames = await statusByNames({ index, path, blob, read });
    const verified = await statusByNames({ index, path, blob, read, verify: true });
    assert.equal(byNames.status, verified.status, `${path}: the names and the records' content agree`);
    out[path] = verified.status;
  }
  const idx = parseQueueIndex(tree[`${QD}/index.md`]), decisions = parseDecisions(tree[`${QD}/entscheidungen.md`]);
  for (const e of idx.entries) {
    const proposalPath = `${QD}/${String(e.nr).padStart(2, "0")}-${e.nr === 1 ? "more" : "last"}.md`;
    const proposalText = tree[proposalPath];
    const current = sectionForEntry({ specText: tree["SPEC.md"], entries: [{ nr: e.nr, anchor: e.anchor, bis: e.bis, proposalText }],
      nr: e.nr, accepted: decisions.get(e.nr)?.decision === "uebernommen" });
    const entry = { queue: QD, nr: e.nr, anchor: e.anchor, bis: e.bis, proposalPath, proposalText,
      proposalBlob: await gitBlobSha(proposalText), sectionBlob: current.error ? null : await gitBlobSha(current.current),
      specText: tree["SPEC.md"], decisions };
    out[`entry ${e.nr}`] = await specStatusByNames({ index, entry, read });
  }
  return out;
}

// The items a reviewer is shown — each naming the text shown by its blob SHA —, as the dashboard builds them.
async function item(tree, path) {
  const kind = path === UC ? "use-case" : path === ARC ? "architecture-decision" : "module";
  return { kind, id: reviewedId(path), path, blob: await gitBlobSha(tree[path]), requires: [] };
}
async function specItem(tree, nr) {
  const nn = String(nr).padStart(2, "0"), proposalPath = `${QD}/${nn}-${nr === 1 ? "more" : "last"}.md`;
  const anchor = nr === 1 ? "## 2. More" : "## 3. Last";
  const shown = sectionForEntry({ specText: tree["SPEC.md"], entries: [{ nr, anchor, bis: null, proposalText: tree[proposalPath] }], nr });
  return { kind: "spec", queue: QD, qname: QNAME, nr, nn, proposalPath, proposalBlob: await gitBlobSha(tree[proposalPath]),
    sectionBlob: await gitBlobSha(shown.current), targetPath: "SPEC.md", anchor, bis: null, needs: [] };
}
// The engine's acceptance commit applied to the tree, as the git host writes it.
async function accept(tree, items) {
  const plan = await planAcceptance({ items, now: WHEN, read: async (p) => (p in tree ? tree[p] : null) });
  return { tree: { ...tree, ...Object.fromEntries(plan.files.map((f) => [f.path, f.content])) }, plan };
}

// ---------------------------------------------------------------- reviewed files and SPEC entries on the default branch

// A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN · A GENERATED ARTIFACT IS A PROPOSAL. Expected: written straight to the
// branch with no record, the use case, the decision, the module and both SPEC entries are open; after the engine's own
// acceptance commit of the use case, the decision, the module and entry 01, those four are accepted (entry 01: applied) and
// entry 02, which nobody accepted, is still open; an edit committed straight to the branch afterwards makes the use case no
// longer accepted — no status was stored that would have to be reset — while the untouched module stays accepted.
test("A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN — every kind is open until the engine's acceptance commit names its text, and an edit committed afterwards is not accepted", async () => {
  const t0 = fixture();
  assert.deepEqual(await statuses(t0), { [UC]: "open", [ARC]: "open", [MOD]: "open", "entry 1": "open", "entry 2": "open" });

  const { tree: t1, plan } = await accept(t0, [await item(t0, UC), await item(t0, ARC), await item(t0, MOD), await specItem(t0, 1)]);
  assert.deepEqual(plan.leftOut, []);
  assert.deepEqual(await statuses(t1), { [UC]: "accepted", [ARC]: "accepted", [MOD]: "accepted", "entry 1": "applied", "entry 2": "open" });
  // Each record the commit holds names the path and the blob of the text the reviewer was shown — and nothing else is a record.
  const records = Object.keys(t1).filter((p) => p.startsWith("docs/approvals/") && !p.endsWith("README.md")).sort();
  assert.equal(records.length, 4);
  for (const path of REVIEWED) {
    const r = records.map((p) => parseRecord(t1[p])).find((x) => x.file === path);
    assert.equal(r?.blob, await gitBlobSha(t0[path]), `${path}: its record names the text shown`);
  }

  const t2 = { ...t1, [UC]: t1[UC].replace("The reader opens the report.", "The reader opens the report, GENERATED-EDIT.") };
  const s2 = await statuses(t2);
  assert.equal(s2[UC], "changed", "edited after acceptance: not accepted, and nobody reset a status");
  assert.equal(s2[MOD], "accepted", "the module's text did not change");
  // Accepted anew, the edited text is accepted by a second record; the first stays as it was.
  const { tree: t3 } = await accept(t2, [await item(t2, UC)]);
  assert.equal((await statuses(t3))[UC], "accepted");
  assert.equal(Object.keys(t3).filter((p) => p.startsWith("docs/approvals/UC-001-")).length, 2);
});

// A GENERATED ARTIFACT IS A PROPOSAL — what accepts a file is a record naming its current text, not one naming another text of
// it, another file's text, or a text the reviewer was not shown. Expected: a record naming the text before a generated edit,
// one naming another file with the same blob, and an acceptance whose shown text is not the branch's text each leave the file
// open; the engine's commit of such an acceptance holds no record.
test("A GENERATED ARTIFACT IS A PROPOSAL — a file is accepted by a record naming its current text, never by one naming another text or another file", async () => {
  const t0 = fixture();
  // The engine's record for the module as it was shown, then the module rewritten by a participant straight on the branch.
  const { tree: t1 } = await accept(t0, [await item(t0, MOD)]);
  const t2 = { ...t1, [MOD]: t1[MOD].replace("Reads the reports.", "Reads the reports and DRAFTED-BY-A-PARTICIPANT.") };
  assert.equal((await statuses(t2))[MOD], "changed");
  // Another file whose text is byte for byte the accepted one: that record is not its record.
  const copy = "docs/architecture/MOD-reader-copy.md";
  const t3 = { ...t1, [copy]: t1[MOD] };
  const index = recordIndex(Object.keys(t3)), read = async (ps) => ps.map((p) => ({ ...parseRecord(t3[p]), _path: p }));
  assert.equal((await statusByNames({ index, path: copy, blob: await gitBlobSha(t3[copy]), read, verify: true })).status, "open");
  // An acceptance of the text shown before the participant's rewrite, written on the rewritten branch: no record.
  const shownBefore = await item(t0, ARC);
  const t4 = { ...t0, [ARC]: t0[ARC].replace("A static site.", "A static site, DRAFTED-BY-A-PARTICIPANT.") };
  const { plan } = await accept(t4, [shownBefore]);
  assert.deepEqual(plan.files, []);
  assert.deepEqual(plan.leftOut.map((l) => l.label), ["ARC-001"]);
  assert.equal((await statuses(t4))[ARC], "open");
});

// ---------------------------------------------------------------- records are evidence

// A RECORD IS EVIDENCE, NOT A PROPOSAL — the engine makes no approval record for a record. Expected: reviewedRecord refuses a job
// record, a gate record below it and an approval record itself, naming the path; a use case gets its record (counter-proof).
test("A RECORD IS EVIDENCE, NOT A PROPOSAL — the engine makes an approval record for a reviewed file only, never for a job, gate or approval record", async () => {
  const blob = await gitBlobSha("x\n");
  for (const path of [JOB, "docs/jobs/JOB-20261001-0900-a1b2/gates/G-1.md", "docs/approvals/UC-001-0123456789ab.md"]) {
    assert.throws(() => reviewedRecord(path, blob), new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} is not a reviewed file`), path);
  }
  assert.deepEqual(reviewedRecord(UC, blob), { kind: "use-case", file: UC, blob });
});

// A RECORD IS EVIDENCE, NOT A PROPOSAL (SPEC check: "a job record without approval is not listed as open; counter-proof: a use
// case without approval is"). Expected: the use case without a record is open; the job record without one is given no status
// of a proposal by the engine — not "open" from its status derivation, and not shown or counted by its review page.
// FINDING G1: the engine derives "open" for any path — deriveReviewedStatus and statusByNames answer "open" for a job record,
// and reviewPage counts it — so only the views' path filters (MOD-dashboard-app) keep records out of the lists.
test("A RECORD IS EVIDENCE, NOT A PROPOSAL — a job record without approval is not listed as open; counter-proof: a use case without approval is",
  { todo: "FINDING G1 — the approval engine derives the status open for a job record (deriveReviewedStatus, statusByNames) and its review page counts it; MOD-review-core's deriveStatus has no value for a file that is no proposal" }, async () => {
    const t0 = fixture();
    const index = recordIndex(Object.keys(t0)), read = async () => [];
    const ucBlob = await gitBlobSha(t0[UC]), jobBlob = await gitBlobSha(t0[JOB]);
    assert.equal((await statusByNames({ index, path: UC, blob: ucBlob, read })).status, "open", "counter-proof: the use case is open");
    assert.equal(deriveReviewedStatus(UC, ucBlob, []), "open");
    assert.notEqual(deriveReviewedStatus(JOB, jobBlob, []), "open", "the job record is no proposal");
    assert.notEqual((await statusByNames({ index, path: JOB, blob: jobBlob, read })).status, "open", "the job record is no proposal");
    const page = reviewPage([{ item: { kind: "use-case", id: "UC-001", path: UC, blob: ucBlob }, status: deriveReviewedStatus(UC, ucBlob, []), open: [] },
      { item: { kind: null, id: reviewedId(JOB), path: JOB, blob: jobBlob }, status: deriveReviewedStatus(JOB, jobBlob, []), open: [] }]);
    assert.deepEqual(page.shown.map((f) => f.item.path), [UC], "the review page shows the use case and not the job record");
  });

// A RECORD IS EVIDENCE, NOT A PROPOSAL — an acceptance commit holds no approval record for a record. Expected: an acceptance
// that names a job record — under the kind the views give a use case — writes nothing and names the job record as left out.
// FINDING G2: planAcceptance takes the kind of a ticked file from the item, not from its path, and writes
// `kind: use-case` / `file: docs/jobs/JOB-….md` as an approval record.
test("A RECORD IS EVIDENCE, NOT A PROPOSAL — an acceptance that names a job record writes no approval record",
  { todo: "FINDING G2 — planAcceptance writes an approval record (kind: use-case, file: docs/jobs/JOB-….md) for a job record handed to it as a use case; the kind is taken from the item, not from the path" }, async () => {
    const t0 = fixture();
    const jobItem = { kind: "use-case", id: "JOB-20261001-0900-a1b2", path: JOB, blob: await gitBlobSha(t0[JOB]) };
    let plan;
    try { ({ plan } = await accept(t0, [jobItem])); } catch { plan = { files: [], leftOut: [{ label: jobItem.id }] }; }
    assert.deepEqual(plan.files, [], "no approval record for a job record");
    assert.deepEqual(plan.leftOut.map((l) => l.label), [jobItem.id]);
  });
