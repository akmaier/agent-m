// StatusOf — MOD-approvals' statusOf, as the accepted text of docs/architecture/MOD-approvals.md states it: the status of
// one reviewed file — open, accepted or changed — from the approval records of the same snapshot, matched by the identifier
// in the file name; a record of another kind is not counted; NotReviewed for a path that is no reviewed file (ITM-887).
// Run: node --test tests/approvals-status-of.test.mjs
//
// Module: MOD-approvals
// Guards: UC-030; STATUS IS DERIVED FROM THE RECORDS
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). statusOf is given a snapshot
// already held in memory (paths and blob SHAs, as MOD-repository-hosts' Snapshot gives them) and reaches no network; the
// fixture below is a plain object of that shape. Nothing sleeps or waits. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { statusOf } from "../src/approvals/index.mjs";

const UC_BLOB = "a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1";
const UC_OLD12 = "a1a1a1a1a100"; // an earlier text of the use case: not the first twelve digits of UC_BLOB
const ARC_BLOB = "b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2";
const MOD_BLOB = "c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3";
const REPORT_BLOB = "d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4";

// A fixture snapshot: the files and records named by `blobs` (path -> blob) and `records` (record paths).
function snapshotOf(blobs, records = []) {
  return { paths: [...Object.keys(blobs), ...records], blob: (path) => blobs[path] ?? null };
}

// TST-887001 · level: unit · module: MOD-approvals
// guards: STATUS IS DERIVED FROM THE RECORDS
// given: a snapshot holding the use case docs/use-cases/UC-010-sample-flow.md and no record of UC-010 (only a record of UC-011)
// input: statusOf("docs/use-cases/UC-010-sample-flow.md", UC_BLOB, that snapshot)
// expect: "open"
test("statusOf — a file with no record is open", () => {
  const snap = snapshotOf({ "docs/use-cases/UC-010-sample-flow.md": UC_BLOB }, ["docs/approvals/UC-011-111111111111.md"]);
  assert.equal(statusOf("docs/use-cases/UC-010-sample-flow.md", UC_BLOB, snap), "open");
});

// TST-887002 · level: unit · module: MOD-approvals
// guards: STATUS IS DERIVED FROM THE RECORDS
// given: a snapshot holding docs/architecture/ARC-020-sample-decision.md and the record docs/approvals/ARC-020-b2b2b2b2b2b2.md, whose twelve digits are the first twelve of the file's blob
// input: statusOf("docs/architecture/ARC-020-sample-decision.md", ARC_BLOB, that snapshot)
// expect: "accepted"
test("statusOf — a record naming the file's blob makes it accepted", () => {
  const snap = snapshotOf({ "docs/architecture/ARC-020-sample-decision.md": ARC_BLOB }, ["docs/approvals/ARC-020-b2b2b2b2b2b2.md"]);
  assert.equal(statusOf("docs/architecture/ARC-020-sample-decision.md", ARC_BLOB, snap), "accepted");
});

// TST-887003 · level: unit · module: MOD-approvals
// guards: STATUS IS DERIVED FROM THE RECORDS
// given: a snapshot holding docs/architecture/MOD-sample.md and only the record docs/approvals/MOD-sample-c3c3c3c3c300.md, which names an earlier blob
// input: statusOf("docs/architecture/MOD-sample.md", MOD_BLOB, that snapshot)
// expect: "changed"
test("statusOf — a record naming only an earlier blob makes the file changed", () => {
  const snap = snapshotOf({ "docs/architecture/MOD-sample.md": MOD_BLOB }, ["docs/approvals/MOD-sample-c3c3c3c3c300.md"]);
  assert.equal(statusOf("docs/architecture/MOD-sample.md", MOD_BLOB, snap), "changed");
});

// TST-887004 · level: unit · module: MOD-approvals
// guards: STATUS IS DERIVED FROM THE RECORDS
// given: the use case UC-010 accepted under the path docs/use-cases/UC-010-sample-flow.md with the same blob, then held in the snapshot under the new path docs/use-cases/UC-010-renamed-flow.md; the record is docs/approvals/UC-010-a1a1a1a1a1a1.md
// input: statusOf("docs/use-cases/UC-010-renamed-flow.md", UC_BLOB, that snapshot)
// expect: "accepted" — the record is matched by the identifier UC-010, not by the old name
test("statusOf — a renamed file keeps its status", () => {
  const snap = snapshotOf({ "docs/use-cases/UC-010-renamed-flow.md": UC_BLOB }, ["docs/approvals/UC-010-a1a1a1a1a1a1.md"]);
  assert.equal(statusOf("docs/use-cases/UC-010-renamed-flow.md", UC_BLOB, snap), "accepted");
});

// TST-887005 · level: unit · module: MOD-approvals
// guards: STATUS IS DERIVED FROM THE RECORDS
// given: a snapshot holding docs/architecture/ARC-020-sample-decision.md and, of other kinds, the records docs/approvals/UC-020-b2b2b2b2b2b2.md, docs/approvals/MOD-020-b2b2b2b2b2b2.md and docs/approvals/spec-queue-020-b2b2b2b2b2b2.md, each with the first twelve digits of the file's blob
// input: statusOf of the decision in the first snapshot
// expect: "open" — none of the three records is of the kind architecture-decision, so none is counted
test("statusOf — a record of another kind is not counted", () => {
  const path = "docs/architecture/ARC-020-sample-decision.md";
  const snap = snapshotOf({ [path]: ARC_BLOB }, [
    "docs/approvals/UC-020-b2b2b2b2b2b2.md",
    "docs/approvals/MOD-020-b2b2b2b2b2b2.md",
    "docs/approvals/spec-queue-020-b2b2b2b2b2b2.md",
  ]);
  assert.equal(statusOf(path, ARC_BLOB, snap), "open");
});

// TST-887006 · level: unit · module: MOD-approvals
// guards: STATUS IS DERIVED FROM THE RECORDS
// given: a snapshot holding the release test report docs/tests/releases/v2026.1.0.md and the record docs/approvals/release-v2026.1.0-d4d4d4d4d4d4.md; a second snapshot holding docs/tests/releases/v2026.1.1.md and the record docs/approvals/release-v2026.1.0-d4d4d4d4d4d4.md only
// input: statusOf of each report with REPORT_BLOB
// expect: "accepted" for v2026.1.0; "open" for v2026.1.1 — the record of another release does not count
test("statusOf — a release test report is accepted by its release-v<version> record", () => {
  const record = "docs/approvals/release-v2026.1.0-d4d4d4d4d4d4.md";
  const accepted = snapshotOf({ "docs/tests/releases/v2026.1.0.md": REPORT_BLOB }, [record]);
  assert.equal(statusOf("docs/tests/releases/v2026.1.0.md", REPORT_BLOB, accepted), "accepted");
  const other = snapshotOf({ "docs/tests/releases/v2026.1.1.md": REPORT_BLOB }, [record]);
  assert.equal(statusOf("docs/tests/releases/v2026.1.1.md", REPORT_BLOB, other), "open");
});

// TST-887007 · level: unit · module: MOD-approvals
// guards: STATUS IS DERIVED FROM THE RECORDS
// given: a snapshot holding docs/use-cases/UC-010-sample-flow.md, docs/approvals/README.md, SPEC.md and a use case's name in the folder of architecture
// input: statusOf of docs/approvals/README.md, of SPEC.md and of docs/architecture/UC-010-misplaced.md
// expect: each throws an error named NotReviewed
test("statusOf — a path that is no reviewed file throws NotReviewed", () => {
  const snap = snapshotOf({
    "docs/use-cases/UC-010-sample-flow.md": UC_BLOB, "SPEC.md": UC_BLOB, "docs/approvals/README.md": UC_BLOB,
    "docs/architecture/UC-010-misplaced.md": UC_BLOB,
  }, [`docs/approvals/UC-010-${UC_OLD12}.md`]);
  for (const path of ["docs/approvals/README.md", "SPEC.md", "docs/architecture/UC-010-misplaced.md"]) {
    assert.throws(() => statusOf(path, UC_BLOB, snap), (e) => e.name === "NotReviewed", path);
  }
});
