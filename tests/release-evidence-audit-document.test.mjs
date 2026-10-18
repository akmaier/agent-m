// ITM-757 — the audit document of a release: MOD-release-evidence's auditDocument(audit, release), as the file
// docs/architecture/MOD-release-evidence.md states it under Interfaces and under Data (the audit document): one
// self-contained Markdown document with the tag and its commit SHA, the summary, one row per requirement, the sources with
// their versions and hashes, the blob SHAs of the report and of the approval records, and the acceptance (UC-030 step 5).
// Run: node --test tests/release-evidence-audit-document.test.mjs
//
// Module: MOD-release-evidence
// Guards: UC-030; THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE; ARTIFACTS ARE MARKDOWN; THE PRODUCT REPOSITORY IS SELF-SUFFICIENT
// Level: unit
//
// The audit is a fixture written out in this file, in the shape auditRows gives (the interface of auditRows): a summary, rows —
// one of them with no test, one a process requirement with a gate record —, and the evidence. Each case states its input and
// expected result before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as evidenceModule from "../src/release-evidence/index.mjs";

// Looked up when it is called, so that a module without auditDocument fails the cases that call it, not the whole file.
const auditDocument = (...args) => evidenceModule.auditDocument(...args);

const TAG = "v2026.4.0", COMMIT = "c".repeat(40);
const REPORT_BLOB = "1234567890abcdef1234567890abcdef12345678", RECORD_BLOB = "fedcba0987654321fedcba0987654321fedcba09";
const REPORT = `docs/tests/releases/${TAG}.md`, RECORD = `docs/approvals/release-${TAG}-${REPORT_BLOB.slice(0, 12)}.md`;
const BOOK_VERSION_HASH = "b".repeat(64), BOOK_FILE_HASH = "d".repeat(64), IEC_VERSION_HASH = "e".repeat(64), IEC_FILE_HASH = "f".repeat(64);
const FIRST = "A FIRST RULE", NO_TEST = "A RULE NO TEST GUARDS", FLAKY = "A RULE WHOSE TEST FAILED", PROCESS = "A PROCESS RULE";
const LIMITATION = "TST-756104 — flaky on the CI runner";

const AUDIT = {
  summary: { passing: 1, noTest: 1, notPassed: 1, flaky: 1, worse: 0, byImplementer: 2, accepted: true, limitations: [LIMITATION] },
  rows: [
    { requirement: FIRST, constrains: "product",
      sources: [
        { id: "SRC-vibe-coding", authority: "advisory", version: "2026-10-05", hashes: [BOOK_VERSION_HASH, BOOK_FILE_HASH] },
        { id: "SRC-iec-62304", authority: "normative", version: "2015", hashes: [IEC_VERSION_HASH, IEC_FILE_HASH] }],
      tests: [{ id: "TST-756101", level: "unit", outcome: "passed", counterProof: "docs/tests/counter-proofs/TST-756101.md" },
        { id: "TST-756102", level: "release", outcome: "8 of 10", counterProof: null }],
      gates: [] },
    { requirement: NO_TEST, constrains: "product", sources: [], tests: [], gates: [] },
    { requirement: FLAKY, constrains: "product", sources: [{ id: "SRC-vibe-coding", authority: "advisory", version: "2026-10-05", hashes: [BOOK_VERSION_HASH] }],
      tests: [{ id: "TST-756106", level: "unit", outcome: "failed", counterProof: null }], gates: [] },
    { requirement: PROCESS, constrains: "process", sources: [], tests: [],
      gates: ["docs/gates/20261010-release-testing.md"] },
  ],
  evidence: {
    report: { path: REPORT, blob: REPORT_BLOB },
    records: [{ path: RECORD, blob: RECORD_BLOB }],
    acceptance: { person: "akmaier", date: "2026-10-12 08:30 UTC", blob: REPORT_BLOB },
  },
};
const document = (audit = AUDIT) => auditDocument(audit, { tag: TAG, commit: COMMIT });

// TST-757101 · level: unit · module: MOD-release-evidence
// guards: THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE; ARTIFACTS ARE MARKDOWN
// given: the fixture audit of the release v2026.4.0 at the commit of forty c's
// input: auditDocument(audit, { tag, commit })
// expect: a string of Markdown that begins with a front matter naming the tag and the commit, then a heading, and that names the tag and the full commit SHA
// counter-proof: a document that names the tag only, or shortens the SHA, fails the includes
test("TST-757101 auditDocument — one Markdown document naming the release tag and its full commit SHA", () => {
  const text = document();
  assert.equal(typeof text, "string");
  assert.ok(text.startsWith(`---\ntag: ${TAG}\ncommit: ${COMMIT}\n---\n`), text.slice(0, 120));
  assert.match(text, /^# .*v2026\.4\.0/m);
  assert.ok(text.endsWith("\n"));
});

// TST-757102 · level: unit · module: MOD-release-evidence
// guards: THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
// given: the fixture audit, with the summary counts 1, 1, 1, 1, 0 and 2, accepted, and one limitation
// input: auditDocument(audit, release)
// expect: the document holds the summary — each of its six counts with its label, whether the report is accepted, and the limitation as recorded
test("TST-757102 auditDocument — the summary with its counts and limitations", () => {
  const text = document();
  const summary = text.slice(text.indexOf("## Summary"), text.indexOf("## Evidence"));
  assert.ok(summary.length > 0);
  for (const label of [/passing evidence: 1\b/i, /without a test: 1\b/i, /did not pass: 1\b/i, /flaky test: 1\b/i, /worse than the previous release: 0\b/i,
    /written by the implementer: 2\b/i, /accepted: yes/i]) assert.match(summary, label);
  assert.ok(summary.includes(LIMITATION));
});

// TST-757103 · level: unit · module: MOD-release-evidence
// guards: THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE; A SOURCE DECLARES ITS AUTHORITY; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// given: the fixture audit with four rows — a product requirement with two sources and two tests, one with no test, one with a failed test, a process requirement with a gate record
// input: auditDocument(audit, release)
// expect: under `## Requirements`, one section per row in the audit's order; each holds what the requirement constrains; each source with its identifier, authority, version and every hash; each test with its identifier, level, outcome and counter-proof (the path, or none); the gate record of the process requirement
// counter-proof: a document that lists only the requirements that have tests loses the "no test" row and fails the section count
test("TST-757103 auditDocument — every row with its sources, tests and gate records", () => {
  const text = document();
  const rows = text.slice(text.indexOf("## Requirements")).split(/^### /m).slice(1);
  assert.deepEqual(rows.map((row) => row.split("\n")[0]), [FIRST, NO_TEST, FLAKY, PROCESS]);
  const [first, none, failed, process] = rows;
  assert.match(first, /constrains[^\n]*product/i);
  for (const part of ["SRC-vibe-coding", "advisory", "2026-10-05", BOOK_VERSION_HASH, BOOK_FILE_HASH, "SRC-iec-62304", "normative", "2015", IEC_VERSION_HASH, IEC_FILE_HASH]) {
    assert.ok(first.includes(part), `the first row lacks ${part}`);
  }
  assert.match(first, /TST-756101[^\n]*unit[^\n]*passed[^\n]*docs\/tests\/counter-proofs\/TST-756101\.md/);
  assert.match(first, /TST-756102[^\n]*release[^\n]*8 of 10[^\n]*no counter-proof/i);
  assert.match(none, /no test/i);
  assert.match(failed, /TST-756106[^\n]*unit[^\n]*failed/);
  assert.match(process, /constrains[^\n]*process/i);
  assert.ok(process.includes("docs/gates/20261010-release-testing.md"));
});

// TST-757104 · level: unit · module: MOD-release-evidence
// guards: AN APPROVAL NAMES THE EXACT TEXT; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
// given: the fixture audit whose evidence holds the report with its blob, one approval record with its blob, and the acceptance (who, when, the blob of the accepted text)
// input: auditDocument(audit, release)
// expect: under `## Evidence`, the report's path and blob; the record's path and blob; the acceptance with the person, the date and the blob of the accepted text
// counter-proof: a document without the evidence fails every includes
test("TST-757104 auditDocument — the blob SHAs of the report and the approval records, and the acceptance", () => {
  const text = document();
  const evidence = text.slice(text.indexOf("## Evidence"), text.indexOf("## Requirements"));
  for (const part of [REPORT, REPORT_BLOB, RECORD, RECORD_BLOB, "akmaier", "2026-10-12 08:30 UTC"]) assert.ok(evidence.includes(part), `the evidence lacks ${part}`);
  assert.match(evidence, /accepted text[^\n]*`?1234567890abcdef1234567890abcdef12345678/i);
});

// TST-757105 · level: unit · module: MOD-release-evidence
// guards: THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
// given: an audit of a release whose report has not been accepted: accepted false, no records, acceptance null, the report there, and the limitations naming the missing record
// input: auditDocument(audit, release)
// expect: the summary says the report is not accepted, the evidence says no approval record names the report and who accepted is not given, and each row says its evidence is not accepted (UC-030, 2a)
test("TST-757105 auditDocument — a report that is not accepted is said so at the top and in every row", () => {
  const text = document({ ...AUDIT,
    summary: { ...AUDIT.summary, accepted: false, limitations: ["missing: approval record naming blob 1234567890abcdef1234567890abcdef12345678"] },
    evidence: { report: AUDIT.evidence.report, records: [], acceptance: null } });
  assert.match(text.slice(text.indexOf("## Summary"), text.indexOf("## Evidence")), /accepted: no/i);
  assert.match(text.slice(text.indexOf("## Evidence"), text.indexOf("## Requirements")), /not accepted/i);
  const rows = text.slice(text.indexOf("## Requirements")).split(/^### /m).slice(1);
  assert.equal(rows.length, 4);
  for (const row of rows) assert.match(row, /evidence not accepted/i);
  assert.ok(!document().includes("evidence not accepted"), "the accepted audit says nothing of the kind");
});

// TST-757106 · level: unit · module: MOD-release-evidence
// guards: THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
// given: an audit with no report (evidence.report null, no records, acceptance null)
// input: auditDocument(audit, release)
// expect: the evidence says there is no release test report on the default branch; the document still holds every row
test("TST-757106 auditDocument — an audit with no report says so and keeps its rows", () => {
  const text = document({ ...AUDIT, evidence: { report: null, records: [], acceptance: null } });
  assert.match(text.slice(text.indexOf("## Evidence"), text.indexOf("## Requirements")), /no release test report/i);
  assert.equal(text.slice(text.indexOf("## Requirements")).split(/^### /m).length - 1, 4);
});

// TST-757107 · level: unit · module: MOD-release-evidence
// guards: THE PRODUCT REPOSITORY IS SELF-SUFFICIENT; ARTIFACTS ARE MARKDOWN
// given: the fixture audit
// input: auditDocument(audit, release)
// expect: the document holds no web address and does not name Agent M's dashboard, so that no statement can be checked only there; every statement names a path, an identifier or a hash of the repository
// counter-proof: a document that gives each row a link into the dashboard fails the address check
test("TST-757107 auditDocument — no address of the dashboard is the only way to check a statement", () => {
  const text = document();
  assert.ok(!/https?:\/\//i.test(text));
  assert.ok(!/dashboard|github\.io|#\//i.test(text));
});

// TST-757108 · level: unit · module: MOD-release-evidence
// guards: THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
// given: the fixture audit and the same audit with its rows in another order
// input: auditDocument twice
// expect: the documents differ only in the order of the sections — the first is the audit's own order, so the document is derived from the audit and holds no text of its own about a requirement
test("TST-757108 auditDocument — the rows stand in the audit's order", () => {
  const order = (text) => text.slice(text.indexOf("## Requirements")).split(/^### /m).slice(1).map((row) => row.split("\n")[0]);
  assert.deepEqual(order(document()), AUDIT.rows.map((row) => row.requirement));
  assert.deepEqual(order(document({ ...AUDIT, rows: [...AUDIT.rows].reverse() })), AUDIT.rows.map((row) => row.requirement).reverse());
});
