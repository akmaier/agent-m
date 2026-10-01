// The artifact formats (docs/assets/artifacts.mjs) — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-artifacts
// Guards: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; AN EDITED FILE KEEPS ITS IDENTIFIER; A FINDING READS LIKE A COMPILER MESSAGE; UC-008
// Level: unit
//
// Every check here was run once against a deliberately broken implementation (SOFTWARE_MAINTENANCE
// §4.0a rule 5): a check that cannot fail checks nothing. The mutations are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseFrontMatter, reviewedId, identifierKept } from "../../docs/assets/artifacts.mjs";
import { useCaseRecord, specRecord, recordsForId } from "../../docs/assets/review-core.mjs";
import { UC_OLD, UC_NEW } from "./helpers.mjs";

test("front matter: scalars and lists, body separated", () => {
  const { fields, body } = parseFrontMatter(
    "---\nid: UC-001\ntitle: Register a source\nrealises:\n  - NO SERVER\n  - A SOURCE DECLARES ITS AUTHORITY\n---\n# Body\n");
  assert.equal(fields.id, "UC-001");
  assert.deepEqual(fields.realises, ["NO SERVER", "A SOURCE DECLARES ITS AUTHORITY"]);
  assert.equal(body, "# Body\n");
  assert.deepEqual(parseFrontMatter("# no front matter\n").fields, {});
});

// ---------------------------------------------------------------- the last accepted text (queue 2026-09-30, entry 03)
// A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT finds the records of a renamed file by its identifier (UC-008 2a).

test("reviewedId: a reviewed file's identifier from its path — the same for a renamed file", () => {
  assert.equal(reviewedId(UC_OLD), "UC-010");
  assert.equal(reviewedId(UC_NEW), "UC-010");
  assert.equal(reviewedId("docs/use-cases/README.md"), null);
  const recs = [useCaseRecord(UC_OLD, "a".repeat(40)), useCaseRecord("docs/use-cases/UC-011-x.md", "b".repeat(40)),
    specRecord({ queue: "q", entry: 1, proposal: "q/UC-010-named-like-a-use-case.md", blob: "c".repeat(40), target: "SPEC.md", anchor: "## 1", section: "d".repeat(40) })];
  assert.deepEqual(recordsForId(recs, "UC-010"), [recs[0]], "only the records of that identifier, and no SPEC record");
});

// ---------------------------------------------------------------- an edited use case keeps its identifier (ITM-010, ITM-126)
// AN EDITED FILE KEEPS ITS IDENTIFIER for a use case, as tests/architecture.test.mjs checks it for ARC and MOD files through
// saveReviewedFile. Counter-proofs: docs/measurements/2026-10-01_use-case-checks.md, and for the finding's shape (ITM-126)
// docs/measurements/2026-10-01_identifier-kept-finding.md.
//
// A FINDING READS LIKE A COMPILER MESSAGE: identifierKept returns null or a finding of the one shape of MOD-artifacts —
// { artifact, line, kind, what, rule, fix } — naming the rule, the line of the `id`, what is wrong and the fix; the sentence a
// person reads is written by the dashboard from it (ARC-003 decision 5).

const KEPT = "AN EDITED FILE KEEPS ITS IDENTIFIER";

test("AN EDITED FILE KEEPS ITS IDENTIFIER — a use case whose text carries another identifier, or none, is refused with a finding", () => {
  const text = readFileSync(new URL("../fixtures/use-cases/UC-001-complete.md", import.meta.url), "utf8");
  assert.equal(identifierKept("UC-001", text), null, "the same identifier: no finding");
  assert.equal(identifierKept("UC-001", text.replace("Export the list", "Export the whole list")), null, "an edit keeping the id passes");
  // Another identifier: the finding names the line of the `id` (line 2, under the opening ---).
  assert.deepEqual(identifierKept("UC-001", text.replace("id: UC-001", "id: UC-002")), {
    artifact: "UC-001", line: 2, kind: "error", rule: KEPT,
    what: "the file was opened as UC-001, but the text carries the identifier UC-002",
    fix: "put back id: UC-001; a new identifier is a new file, proposed as such.",
  });
  // The `id` line further down the front matter: the finding names that line.
  assert.equal(identifierKept("UC-001", text.replace("id: UC-001\n", "").replace("\n---\n", "\nid: UC-003\n---\n")).line,
    text.slice(0, text.indexOf("\n---\n", 4)).split("\n").length, "the line of the moved id");
  // No identifier: there is no `id` line, so the finding names line 1.
  assert.deepEqual(identifierKept("UC-001", text.replace("id: UC-001\n", "")), {
    artifact: "UC-001", line: 1, kind: "error", rule: KEPT,
    what: "the file was opened as UC-001, but the text carries no identifier",
    fix: "put back id: UC-001; a new identifier is a new file, proposed as such.",
  });
  assert.equal(identifierKept(null, "## 1\n"), null, "a file without an identifier, such as a SPEC proposal, is not checked");
});
