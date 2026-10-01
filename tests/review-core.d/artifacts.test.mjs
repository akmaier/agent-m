// The artifact formats (docs/assets/artifacts.mjs) — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-artifacts
// Guards: A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT; UC-008
// Level: unit
//
// Every check here was run once against a deliberately broken implementation (SOFTWARE_MAINTENANCE
// §4.0a rule 5): a check that cannot fail checks nothing. The mutations are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md.

import test from "node:test";
import assert from "node:assert/strict";
import { parseFrontMatter, reviewedId } from "../../docs/assets/artifacts.mjs";
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
