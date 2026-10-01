// Architecture on the review dashboard: the status of ARC and MOD files, and what they rest on — deterministic, no network.
// Run: node --test tests/*.test.mjs
//
// Module: MOD-review-core
// Guards: STATUS IS DERIVED FROM THE RECORDS; ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; UC-022; UC-023
// Level: unit
//
// SPEC §11 ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS; §10 STATUS IS DERIVED FROM THE RECORDS (UC-022 step 10a; UC-023 step 4b).
// The format of the files is checked in tests/architecture-format.test.mjs, the impact list and the component diagram in
// tests/architecture-impact.test.mjs, the dashboard's Architecture view in tests/architecture-view.test.mjs. Accepting and
// editing ARC and MOD files — the dashboard's writes — are checked in tests/review-core.d/dashboard-writes.test.mjs (ITM-124).
//
// The product is the fixture under tests/fixtures/architecture/. Counter-proofs are listed in
// docs/measurements/2026-09-30_review-dashboard-mutations.md §8.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  gitBlobSha, approvalPath, recordText, parseRecord, reviewedRecord,
  deriveReviewedStatus, deriveUseCaseStatus, architecturePrerequisites,
  useCaseRecord,
} from "../docs/assets/review-core.mjs";
import { reviewedId, parseArchitecture } from "../docs/assets/artifacts.mjs";

const FIX = fileURLToPath(new URL("./fixtures/architecture/", import.meta.url));
const files = {};
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p); else files[relative(FIX, p).split("\\").join("/")] = readFileSync(p, "utf8");
  }
})(FIX);
const ARC = "docs/architecture/ARC-001-static-client.md", READER = "docs/architecture/MOD-reader.md";
const REVIEW = "docs/architecture/MOD-review.md", PAGE = "docs/architecture/MOD-page.md";
const UC1 = "docs/use-cases/UC-001-read-a-file.md", UC2 = "docs/use-cases/UC-002-show-the-status.md";
const archPaths = [ARC, READER, REVIEW, PAGE];
// The use cases as the app holds them: path, blob, status, and the record naming the current text.
async function ucRecordFiles(which = [UC1, UC2]) {
  const out = {};
  for (const p of which) {
    const blob = await gitBlobSha(files[p]);
    out[approvalPath(reviewedId(p), blob)] = recordText(useCaseRecord(p, blob));
  }
  return out;
}
async function useCasesOf(repo) {
  const records = Object.entries(repo).filter(([p]) => p.startsWith("docs/approvals/")).map(([p, t]) => ({ ...parseRecord(t), _path: p }));
  return Promise.all([UC1, UC2].filter((p) => p in repo).map(async (p) => {
    const blob = await gitBlobSha(repo[p]);
    const status = deriveUseCaseStatus(p, blob, records);
    const record = records.find((r) => r.kind === "use-case" && r.file === p && r.blob === blob)?._path ?? null;
    return { id: reviewedId(p), path: p, blob, status, record };
  }));
}
// ---------------------------------------------------------------- identifiers, records, status

test("STATUS IS DERIVED FROM THE RECORDS — ARC and MOD: open, accepted, changed; only records of their own kind count", async () => {
  const b = await gitBlobSha(files[READER]);
  assert.equal(deriveReviewedStatus(READER, b, []), "open");
  assert.equal(deriveReviewedStatus(READER, b, [reviewedRecord(READER, b)]), "accepted");
  assert.equal(deriveReviewedStatus(READER, b, [reviewedRecord(READER, "e".repeat(40))]), "changed");
  // Counter-proof: a record of another kind naming the same path and text does not accept it.
  assert.equal(deriveReviewedStatus(READER, b, [{ kind: "use-case", file: READER, blob: b }]), "open");
  assert.equal(deriveReviewedStatus(UC1, b, [reviewedRecord(UC1, b)]), "accepted", "use cases derive the same way");
});

// ---------------------------------------------------------------- ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS

test("ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS — every named requirement in the SPEC, every named use case accepted", async () => {
  const repo = { ...files, ...(await ucRecordFiles()) };
  const useCases = await useCasesOf(repo);
  const ok = architecturePrerequisites({ arch: parseArchitecture(ARC, files[ARC]), specText: files["SPEC.md"], useCases });
  assert.deepEqual(ok.open, []);
  assert.deepEqual(ok.useCases.map((u) => u.id), ["UC-001"], "the accepted use cases the file rests on, with their records");
  assert.ok(ok.useCases[0].record && ok.useCases[0].blob);
  // UC-022 10a / UC-023 4b: each open item is named.
  const open = (text, ucs = useCases) => architecturePrerequisites({ arch: parseArchitecture(ARC, text), specText: files["SPEC.md"], useCases: ucs }).open;
  assert.deepEqual(open(files[ARC].replace("  - RULE ONE\n", "  - OLD RULE\n")).map((o) => o.name), ["OLD RULE"]);
  assert.match(open(files[ARC].replace("  - RULE ONE\n", "  - OLD RULE\n"))[0].reason, /withdrawn/);
  assert.deepEqual(open(files[ARC].replace("  - RULE ONE\n", "  - NO SUCH RULE\n")).map((o) => o.name), ["NO SUCH RULE"]);
  assert.match(open(files[ARC].replace("  - RULE ONE\n", "  - NO SUCH RULE\n"))[0].reason, /not in SPEC\.md/);
  assert.deepEqual(open(files[ARC].replace("  - UC-001\n", "  - UC-009\n")).map((o) => o.name), ["UC-009"]);
  const changedUc = useCases.map((u) => (u.id === "UC-001" ? { ...u, status: "changed", record: null } : u));
  assert.deepEqual(open(files[ARC], changedUc).map((o) => [o.name, o.reason]), [["UC-001", "changed since it was accepted"]]);
  const openUc = useCases.map((u) => (u.id === "UC-001" ? { ...u, status: "open", record: null } : u));
  assert.deepEqual(open(files[ARC], openUc).map((o) => [o.name, o.reason]), [["UC-001", "not accepted yet"]]);
  // A module's `realises` counts the same; `follows` (decisions) is not a prerequisite of the rule.
  assert.deepEqual(architecturePrerequisites({ arch: parseArchitecture(REVIEW, files[REVIEW]), specText: files["SPEC.md"], useCases }).open, []);
});
