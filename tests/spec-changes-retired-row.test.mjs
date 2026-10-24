// An entry whose decision row names its SPEC commit reads as decided (ITM-454) — MOD-spec-changes' `queues` and `entryView`, as the accepted texts state it: the SPEC's STATUS IS DERIVED
// FROM THE RECORDS ("a SPEC change entry also counts as decided when its queue's decision row names the commit that wrote it into the SPEC") and docs/architecture/MOD-spec-changes.md,
// Data: `in SPEC` — a decision row `uebernommen` names its record, or names the commit that wrote it into the SPEC; `open` — no approval record names its proposal and no decision row
// names the commit that wrote it into the SPEC.
// Run: node --test tests/spec-changes-retired-row.test.mjs
//
// Module: MOD-spec-changes
// Guards: STATUS IS DERIVED FROM THE RECORDS; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN; THE GATE IS RECORDED; UC-006
// Level: unit
//
// The fixture is one queue of a repository of ours, never Agent M's own: its SPEC of one section and the queue's index, five entries, the rows of its `entscheidungen.md` and the
// approval records it needs, given as a snapshot held in memory (paths, blob SHAs as `git hash-object` gives them, a read of the texts). The rows are in the two forms the real queues hold:
// `| 2026-03-01 10:00 UTC | 2 | uebernommen | approval:<record file> |` and the retired `| 2026-03-01 10:01 | 1 | uebernommen | e2ce99d |` — its time with no `UTC`, its fourth cell a commit.
// Where the texts leave a reading open, the test states the reading it takes, and the pull request names it:
//   - A row names the commit that wrote its entry into the SPEC when its decision is `uebernommen` and its fourth cell is a commit as git writes it, 7 to 40 hexadecimal digits; any other
//     cell that is no `approval:` reference decides nothing.
//   - Such an entry's `decision` is that commit, as an entry's `decision` is the record a row names; its `record` is null, since no record names it. acceptEntries refuses an entry whose
//     `decision` is set, so no section is written over one a person edited since.
//   - A decision row decides whatever else the snapshot shows, a record that names another proposal blob included.
// A name the module does not provide yet fails each test by itself. The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as specChanges from "../src/spec-changes/index.mjs";
import { withStoredGraph } from "./stored-graph-fake.mjs";

const { queues, entryView } = specChanges;

const gitBlob = (body) => { const bytes = Buffer.from(body, "utf8"); return createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex"); };
const text = (...lines) => `${lines.join("\n")}\n`;
const pad2 = (n) => String(n).padStart(2, "0");
// A snapshot of the files at one commit, whose graph is stored on trace-cache as the workflow "main changed" stores it (tests/stored-graph-fake.mjs).
const snapshotOf = (files) => withStoredGraph({ commit: "e".repeat(40), paths: Object.keys(files), blob: (path) => (Object.hasOwn(files, path) ? gitBlob(files[path]) : null), read: async (path) => (Object.hasOwn(files, path) ? files[path] : null) });

const FOLDER = "2026-03-01_retired";
const BASE = `docs/spec-freigaben/${FOLDER}`;
const SPEC = text("# Fixture — Specification", "", "## 1. First", "", "**A FIRST RULE** *(Product Owner)*", "A thing holds.", "*Check:* no automatic check; at review", "",
  "## 2. Second", "", "**A SECOND RULE** *(Product Owner)*", "Another thing holds.", "*Check:* no automatic check; at review", "",
  "## 3. Third", "", "**A THIRD RULE** *(Product Owner)*", "A third thing holds.", "*Check:* no automatic check; at review", "",
  "## 4. Fourth", "", "**A FOURTH RULE** *(Product Owner)*", "A fourth thing holds.", "*Check:* no automatic check; at review", "",
  "## 5. Fifth", "", "**A FIFTH RULE** *(Product Owner)*", "A fifth thing holds.", "*Check:* no automatic check; at review");
const proposal = (n) => text(`## ${n}. ${["", "First", "Second", "Third", "Fourth", "Fifth"][n]}`, "", `**A ${["", "FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH"][n]} RULE** *(Product Owner)*`, "A changed thing holds.", "*Check:* no automatic check; at review");
const SLUGS = ["", "first", "second", "third", "fourth", "fifth"];

function fixture({ rows, records = [] }) {
  const files = { "SPEC.md": SPEC,
    [`${BASE}/index.md`]: text("# SPEC approvals — queue 2026-03-01 · retired rows", "", "**Zieldatei aller Einträge:** `SPEC.md`", "", "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|",
      ...[1, 2, 3, 4, 5].map((n) => `| ${pad2(n)} | \`SPEC.md\` | ## ${n}. ${["", "First", "Second", "Third", "Fourth", "Fifth"][n]} | — | — |`)),
    [`${BASE}/entscheidungen.md`]: text("# Decisions — queue 2026-03-01 retired rows", "", "Append-only.", ...rows) };
  for (const n of [1, 2, 3, 4, 5]) files[`${BASE}/${pad2(n)}-${SLUGS[n]}.md`] = proposal(n);
  for (const record of records) files[record.path] = record.text ?? "kind: spec\n";
  return snapshotOf(files);
}
const recordFor = (n, blobOf = proposal(n)) => ({ path: `docs/approvals/spec-${FOLDER}-${pad2(n)}-${gitBlob(blobOf).slice(0, 12)}.md` });
const entryOf = async (snapshot, number) => (await queues(snapshot)).find((queue) => queue.folder === BASE).entries.find((entry) => entry.number === number);

const ROWS = [
  "| 2026-03-01 10:01 | 1 | uebernommen | e2ce99d |",
  `| 2026-03-01 10:00 UTC | 2 | uebernommen | approval:${recordFor(2).path.split("/").pop()} |`,
  "| 2026-03-01 10:02 | 4 | uebernommen | not-a-commit |",
];

// TST-473021 · level: unit · module: MOD-spec-changes
// guards: STATUS IS DERIVED FROM THE RECORDS; THE GATE IS RECORDED; UC-006
// given: a queue of five entries: 01 decided by a row of the retired form that names a commit and no record; 02 by a row that names its record; 03 by neither; 04 by a row whose fourth cell is no commit and no record; 05 by neither
// input: queues
// expect: 01 `in SPEC`, its decision the commit, its record null; 02 `in SPEC` as before, its decision and record the record's path; 03, 04 and 05 `open`
test("queues — an entry whose decision row names the commit that wrote it into the SPEC reads in SPEC", async () => {
  const snapshot = fixture({ rows: ROWS, records: [recordFor(2)] });
  const retired = await entryOf(snapshot, 1);
  assert.deepEqual([retired.state, retired.decision, retired.record], ["in SPEC", "e2ce99d", null]);
  const named = await entryOf(snapshot, 2);
  assert.deepEqual([named.state, named.decision, named.record], ["in SPEC", recordFor(2).path, recordFor(2).path]);
  for (const number of [3, 4, 5]) {
    const open = await entryOf(snapshot, number);
    assert.deepEqual([open.state, open.decision, open.record], ["open", null, null], `entry ${number}`);
  }
});

// TST-473022 · level: unit · module: MOD-spec-changes
// guards: STATUS IS DERIVED FROM THE RECORDS; UC-006
// given: the same queue
// input: entryView for each entry
// expect: the state `in SPEC` for 01 and 02 and `open` for 03; the current section beside the proposal as before
test("entryView — the state of an entry decided by a row of the retired form is in SPEC", async () => {
  const snapshot = fixture({ rows: ROWS, records: [recordFor(2)] });
  assert.equal((await entryView(BASE, 1, snapshot)).state, "in SPEC");
  assert.equal((await entryView(BASE, 2, snapshot)).state, "in SPEC");
  assert.equal((await entryView(BASE, 3, snapshot)).state, "open");
  assert.equal((await entryView(BASE, 1, snapshot)).proposal.text, proposal(1));
});

// TST-473023 · level: unit · module: MOD-spec-changes
// guards: STATUS IS DERIVED FROM THE RECORDS; A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
// given: rows in other forms: a full 40-digit commit, a short 7-digit one, a commit in capitals, a six-digit cell, a cell of 41 digits, and a row whose decision is not `uebernommen`
// input: queues
// expect: the 40-digit and the 7-digit commits decide; capitals, six digits, 41 digits and another decision do not
test("queues — a commit as git writes it decides, any other cell does not", async () => {
  const full = "a".repeat(40);
  const rows = [`| 2026-03-01 10:00 | 1 | uebernommen | ${full} |`, "| 2026-03-01 10:00 | 2 | uebernommen | 1234567 |", "| 2026-03-01 10:00 | 3 | uebernommen | ABCDEF1 |",
    "| 2026-03-01 10:00 | 4 | uebernommen | 12345 6 |", `| 2026-03-01 10:00 | 5 | uebernommen | ${"b".repeat(41)} |`];
  const snapshot = fixture({ rows });
  const states = await Promise.all([1, 2, 3, 4, 5].map(async (n) => (await entryOf(snapshot, n)).state));
  assert.deepEqual(states, ["in SPEC", "in SPEC", "open", "open", "open"]);
  const other = fixture({ rows: ["| 2026-03-01 10:00 | 1 | zurueckgestellt | e2ce99d |"] });
  assert.equal((await entryOf(other, 1)).state, "open", "a row that is not an acceptance decides nothing");
});

// TST-473024 · level: unit · module: MOD-spec-changes
// guards: STATUS IS DERIVED FROM THE RECORDS; A STALE APPROVAL IS NOT APPLIED
// given: entry 01 decided by a retired row, and a record that names another proposal blob (a stale record); entry 03 with such a record and no row
// input: queues
// expect: 01 `in SPEC` — the row decides whatever the record shows —; 03 `stale`
test("queues — a decision row decides whatever else the snapshot shows", async () => {
  const stale = (n) => ({ path: `docs/approvals/spec-${FOLDER}-${pad2(n)}-${"0".repeat(12)}.md` });
  const snapshot = fixture({ rows: ["| 2026-03-01 10:01 | 1 | uebernommen | e2ce99d |"], records: [stale(1), stale(3)] });
  assert.equal((await entryOf(snapshot, 1)).state, "in SPEC");
  assert.equal((await entryOf(snapshot, 3)).state, "stale");
});
