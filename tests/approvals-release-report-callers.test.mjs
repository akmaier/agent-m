// MOD-approvals' own uses of statuses, for a release test report (ITM-913) — acceptanceBlockers, the precondition `architecture-ready`
// and the precondition `rests-on-accepted`, as the accepted text of docs/architecture/MOD-approvals.md states them. A release test report
// is a reviewed file (Responsibility) that names no requirement and no use case, so acceptanceBlockers gives [] for it; and it is no
// architecture decision and no module file, so it is no existing architecture (`architecture-ready`) and no architecture file that is
// not accepted (`rests-on-accepted` with the parameter `architecture`).
// Run: node --test tests/approvals-release-report-callers.test.mjs
//
// Module: MOD-approvals
// Guards: UC-030; STATUS IS DERIVED FROM THE RECORDS; THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE
// Level: unit
//
// The product is a small repository this file holds, in memory, behind a snapshot of its own (paths, blob and read, as MOD-repository-hosts'
// Snapshot gives them): a SPEC of one requirement, one accepted use case and one release test report. Each test states its input and its
// expected result before it runs (given / input / expect). Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { acceptanceBlockers, approvalStrategies } from "../src/approvals/index.mjs";

const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const SPEC = text("# Fixture product — Specification", "", "## Section", "", "**A SAMPLE RULE** *(Product Owner)*", "A sample rule.", "*Check:* `tests/sample.test.mjs`");
const useCase = (id, rule) => text("---", `id: ${id}`, "title: Read a file", "area: files", "actors:", "  - Reader", "realises:", `  - ${rule}`, "---", `# ${id} Read a file`, "", "**Goal.** Read a file.");
const UC = useCase("UC-001", "A SAMPLE RULE"), UC_PATH = "docs/use-cases/UC-001-read-a-file.md";
const UC_BAD = useCase("UC-002", "A MISSING RULE"), UC_BAD_PATH = "docs/use-cases/UC-002-read-more.md";
const REPORT_PATH = "docs/tests/releases/v2026.1.0.md";
const REPORT = text("# Release test report v2026.1.0", "", "All tests ran.");
const MODULE_PATH = "docs/architecture/MOD-sample.md";
const MODULE = text("---", "id: MOD-sample", "title: Sample", "folder: src/sample/", "realises:", "  - A SAMPLE RULE", "follows:", "uses:", "provides:", "---", "# MOD-sample Sample", "", "## Responsibility", "", "It samples.");
const acceptedRecord = (id, path, body, kind) => ({ [`docs/approvals/${id}-${blobOf(body).slice(0, 12)}.md`]: text(`kind: ${kind}`, `file: ${path}`, `blob: ${blobOf(body)}`) });

const snapshotOf = (files) => ({ repository: { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" },
  ref: "main", commit: null, paths: Object.keys(files), read: async (path) => (path in files ? files[path] : null),
  blob: (path) => (path in files ? blobOf(files[path]) : null) });
const BASE = { "SPEC.md": SPEC, [UC_PATH]: UC, [REPORT_PATH]: REPORT, ...acceptedRecord("UC-001", UC_PATH, UC, "use-case") };
const contextOf = (files, params = {}) => ({ params, product: { address: "https://github.com/alice/product", host: null, snapshot: snapshotOf(files) } });

// TST-913003 · level: unit · module: MOD-approvals
// guards: STATUS IS DERIVED FROM THE RECORDS
// given: a snapshot holding the SPEC, the use case UC-002 realising a requirement the SPEC lacks (the known positive), and the release test report docs/tests/releases/v2026.1.0.md
// input: acceptanceBlockers of the use case, and of the report
// expect: ["A MISSING RULE"] for the use case; [] for the report — it names no requirement and no use case, and the call does not throw
test("acceptanceBlockers — a release test report rests on nothing: []", async () => {
  const snapshot = snapshotOf({ "SPEC.md": SPEC, [UC_BAD_PATH]: UC_BAD, [REPORT_PATH]: REPORT });
  assert.deepEqual(await acceptanceBlockers(UC_BAD_PATH, snapshot), ["A MISSING RULE"], "known positive");
  assert.deepEqual(await acceptanceBlockers(REPORT_PATH, snapshot), []);
});

// TST-913004 · level: unit · module: MOD-approvals
// guards: THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE
// given: a product with one accepted use case, one release test report and no architecture; a second product that also holds the module file MOD-sample (the known positive)
// input: the precondition `architecture-ready` for each
// expect: null for the first — a report is no architecture; an error finding of the rule THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE for the second
test("architecture-ready — a release test report is not an existing architecture", async () => {
  const ready = approvalStrategies.preconditions["architecture-ready"];
  const withModule = { ...BASE, [MODULE_PATH]: MODULE };
  const found = await ready(contextOf(withModule));
  assert.equal(found?.kind, "error", "known positive");
  assert.equal(found.rule, "THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE");
  assert.equal(await ready(contextOf(BASE)), null);
});

// TST-913005 · level: unit · module: MOD-approvals
// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
// given: a product with one accepted use case and one release test report that is open, and no architecture file; a second product that also holds the open module file MOD-sample (the known positive)
// input: the precondition `rests-on-accepted` with the parameters useCases UC-001 and architecture true, for each
// expect: null for the first — an open report is no architecture file; an error finding naming docs/architecture/MOD-sample.md for the second, and not the report
test("rests-on-accepted — an open release test report is no architecture file that is not accepted", async () => {
  const rests = approvalStrategies.preconditions["rests-on-accepted"];
  const params = { useCases: ["UC-001"], architecture: true };
  const found = await rests(contextOf({ ...BASE, [MODULE_PATH]: MODULE }, params));
  assert.match(found?.what ?? "", /docs\/architecture\/MOD-sample\.md/, "known positive");
  assert.doesNotMatch(found.what, /releases/);
  assert.equal(await rests(contextOf(BASE, params)), null);
});
