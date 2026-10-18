// Statuses of a release test report — MOD-approvals' statuses, as the accepted text of docs/architecture/MOD-approvals.md
// states it: "the status of every reviewed file of a snapshot", and its Responsibility counts a release test report among
// the reviewed files (ITM-913). statuses gives the report as statusOf does: the identifier release-v<version>, the kind
// release-report and the status derived from the records.
// Run: node --test tests/approvals-statuses-release-report.test.mjs
//
// Module: MOD-approvals
// Guards: UC-030; STATUS IS DERIVED FROM THE RECORDS
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). statuses and statusOf are given
// a snapshot already held in memory (paths and blob SHAs, as MOD-repository-hosts' Snapshot gives them) and reach no network;
// the fixture is a plain object of that shape. Nothing sleeps or waits. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { statuses, statusOf } from "../src/approvals/index.mjs";

const REPORT = "docs/tests/releases/v2026.1.0.md";
const USE_CASE = "docs/use-cases/UC-001-sample-flow.md";
const REPORT_BLOB = "d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4";
const REPORT_OLD12 = "d4d4d4d4d400"; // an earlier text of the report: not the first twelve digits of REPORT_BLOB
const UC_BLOB = "a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1";

// A fixture snapshot: the files named by `blobs` (path -> blob) and the record paths in `records`.
function snapshotOf(blobs, records = []) {
  return { paths: [...Object.keys(blobs), ...records], blob: (path) => blobs[path] ?? null };
}

// TST-913001 · level: unit · module: MOD-approvals
// guards: STATUS IS DERIVED FROM THE RECORDS
// given: a snapshot holding the release test report docs/tests/releases/v2026.1.0.md and the use case docs/use-cases/UC-001-sample-flow.md, in three states: (1) no record of either; (2) the records docs/approvals/release-v2026.1.0-d4d4d4d4d4d4.md and docs/approvals/UC-001-a1a1a1a1a1a1.md, each the first twelve digits of its file's blob; (3) the report's blob differs: only the record docs/approvals/release-v2026.1.0-d4d4d4d4d400.md, which names an earlier text
// input: statuses of each snapshot, and statusOf(report path, its blob, the same snapshot)
// expect: statuses gives the report as { id: "release-v2026.1.0", kind: "release-report", status } with status "open" in (1), "accepted" in (2), "changed" in (3), and in each state the status equals statusOf's for the same path and blob; the use case is listed too, as before
test("statuses — a release test report is open, accepted, then changed, as statusOf gives it", () => {
  const blobs = { [REPORT]: REPORT_BLOB, [USE_CASE]: UC_BLOB };
  const states = [
    ["open", snapshotOf(blobs)],
    ["accepted", snapshotOf(blobs, ["docs/approvals/release-v2026.1.0-d4d4d4d4d4d4.md", "docs/approvals/UC-001-a1a1a1a1a1a1.md"])],
    ["changed", snapshotOf(blobs, [`docs/approvals/release-v2026.1.0-${REPORT_OLD12}.md`])],
  ];
  for (const [status, snapshot] of states) {
    const result = statuses(snapshot);
    assert.deepEqual(result.get(REPORT), { id: "release-v2026.1.0", kind: "release-report", status }, status);
    assert.equal(result.get(REPORT).status, statusOf(REPORT, REPORT_BLOB, snapshot), `${status}: equals statusOf`);
    assert.equal(result.get(USE_CASE)?.kind, "use-case", `${status}: the use case is listed`);
    assert.equal(result.size, 2, `${status}: exactly the report and the use case`);
  }
});

// TST-913002 · level: unit · module: MOD-approvals
// guards: STATUS IS DERIVED FROM THE RECORDS
// given: a snapshot holding docs/tests/releases/v2026.1.0.md (the known positive) and, under docs/tests/releases/, the paths README.md, v2026.1.md, v2026.1.0.txt, v26.1.0.md, v2026.1.0.md.bak, notes/v2026.1.1.md
// input: statuses of that snapshot
// expect: exactly one entry, docs/tests/releases/v2026.1.0.md; none of the other paths is listed
test("statuses — a path under docs/tests/releases/ that is no v<YYYY.MINOR.PATCH>.md is not listed", () => {
  const others = ["README.md", "v2026.1.md", "v2026.1.0.txt", "v26.1.0.md", "v2026.1.0.md.bak", "notes/v2026.1.1.md"]
    .map((name) => `docs/tests/releases/${name}`);
  const result = statuses(snapshotOf(Object.fromEntries([REPORT, ...others].map((path) => [path, REPORT_BLOB]))));
  assert.deepEqual([...result.keys()], [REPORT]);
});
