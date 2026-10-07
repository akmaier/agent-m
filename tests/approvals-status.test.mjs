// Statuses — MOD-approvals' approvalSchema and statuses, as the accepted text of docs/architecture/MOD-approvals.md states
// them: a snapshot's one pass over docs/approvals/ gives the status — open, accepted or changed — of every reviewed file
// (a use case, an architecture decision, a module), each with its kind; and a record of the schema is read with
// approvalSchema. Nothing else of the module is part of this item (ITM-233).
// Run: node --test tests/approvals-status.test.mjs
//
// Module: MOD-approvals
// Guards: UC-047; STATUS IS DERIVED FROM THE RECORDS
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). statuses is given a
// snapshot already held in memory (paths and blob SHAs, as MOD-repository-hosts' Snapshot gives them) and reaches no
// network; the fixture below is a plain object of that shape — no readSnapshot, no fetch. Nothing sleeps or waits. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { statuses, approvalSchema } from "../src/approvals/index.mjs";
import { readDocument } from "../src/documents/index.mjs";

const UC_BLOB = "a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1";
const ARC_BLOB = "b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2";
const MOD_BLOB = "c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3";
const MOD_OLD_BLOB12 = "c3c3c3c3c300"; // an earlier text of MOD-sample — not MOD_BLOB's own first twelve hex digits

// A fixture snapshot (MOD-repository-hosts' Snapshot: only paths and blob, which is all statuses reads) of one use case
// with no record at all (open), one architecture decision whose record names its current blob (accepted), and one module
// whose record names an earlier blob of it (changed) — plus docs/approvals/README.md, which names no reviewed file.
function fixtureSnapshot() {
  const blobs = {
    "docs/use-cases/UC-010-sample-flow.md": UC_BLOB,
    "docs/architecture/ARC-020-sample-decision.md": ARC_BLOB,
    "docs/architecture/MOD-sample.md": MOD_BLOB,
  };
  const paths = [
    ...Object.keys(blobs),
    `docs/approvals/ARC-020-${ARC_BLOB.slice(0, 12)}.md`,
    `docs/approvals/MOD-sample-${MOD_OLD_BLOB12}.md`,
    "docs/approvals/README.md",
  ];
  return { paths, blob: (path) => blobs[path] ?? null };
}

// guards: STATUS IS DERIVED FROM THE RECORDS
// given: the fixture snapshot above
// input: statuses(fixtureSnapshot())
// expect: the use case open (its id has no record), the decision accepted (its record names ARC_BLOB), the module
//         changed (its record names an earlier blob, not MOD_BLOB) — each keyed by path and carrying its id and kind —,
//         and exactly these three entries: docs/approvals/README.md names no reviewed file
test("statuses — the status of a use case, a decision and a module that are open, accepted and changed, each with its kind", () => {
  const result = statuses(fixtureSnapshot());
  assert.deepEqual(result.get("docs/use-cases/UC-010-sample-flow.md"),
    { id: "UC-010", kind: "use-case", status: "open" });
  assert.deepEqual(result.get("docs/architecture/ARC-020-sample-decision.md"),
    { id: "ARC-020", kind: "architecture-decision", status: "accepted" });
  assert.deepEqual(result.get("docs/architecture/MOD-sample.md"),
    { id: "MOD-sample", kind: "module", status: "changed" });
  assert.equal(result.size, 3, "docs/approvals/README.md names no reviewed file");
});

// guards: STATUS IS DERIVED FROM THE RECORDS
// given: a record text of the schema's format (MOD-approvals, Data) — kind, file and blob, as a use-case record states
//        them
// input: readDocument(approvalSchema, its path, that text).fields
// expect: kind "use-case", file and blob exactly as the text states them — nothing else, since the text holds no other
//         key
test("approvalSchema — a record is read by its schema, as MOD-documents' readDocument gives it", () => {
  const text = `kind: use-case\nfile: docs/use-cases/UC-010-sample-flow.md\nblob: ${UC_BLOB}\n`;
  const doc = readDocument(approvalSchema, `docs/approvals/UC-010-${UC_BLOB.slice(0, 12)}.md`, text);
  assert.deepEqual(doc.fields, { kind: "use-case", file: "docs/use-cases/UC-010-sample-flow.md", blob: UC_BLOB });
});
