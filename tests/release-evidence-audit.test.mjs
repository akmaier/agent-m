// ITM-756 — the audit rows of a release: MOD-release-evidence's auditRows, as docs/architecture/MOD-release-evidence.md
// states it (UC-030 steps 2 and 3; alternative flows 1a, 2a, 2b, 2c).
// Run: node --test tests/release-evidence-audit.test.mjs
//
// Module: MOD-release-evidence
// Guards: UC-030; THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED;
//         RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER; A SOURCE DECLARES ITS AUTHORITY; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH;
//         THE TRACEABILITY MATRIX IS DERIVED
// Level: unit
//
// The fixture is a small product repository at the tag v2026.4.0, held as Snapshot-shaped plain objects: its SPEC of five
// requirements, the tests that guard four of them, a backlog item, two job records, a counter-proof, the links to two sources and the
// instance's register entries, an earlier release's report, the release test report with its approval record; the branch
// test-results; the instance's SPEC with one process requirement and the gate record given for it. Each test states its input and
// expected result before it runs. Nothing reaches the network, the clock or a host. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { auditRows } from "../src/release-evidence/index.mjs";
import { writeDocument } from "../src/documents/index.mjs";
import { approvalSchema } from "../src/approvals/index.mjs";

const hex = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const versionHash = (files) => hex([...files].sort(([a], [b]) => (a < b ? -1 : 1)).map(([name, text]) => `${hex(text)}  ${name}\n`).join(""));
const gitBlob = (text) => createHash("sha1").update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest("hex");
const snapshotOf = (files, commit) => ({
  repository: { path: "fixture/product" }, commit, paths: Object.keys(files),
  read: async (path) => (Object.hasOwn(files, path) ? files[path] : null),
  blob: (path) => (Object.hasOwn(files, path) ? gitBlob(files[path]) : null),
});

const VERSION = "2026.4.0", TAG = `v${VERSION}`, REPORT = `docs/tests/releases/${TAG}.md`;
const COMMIT = "c".repeat(40), OLD = "e".repeat(40);
const R1 = "A FIRST RULE", R2 = "A SECOND RULE", R3 = "A THIRD RULE", R4 = "A FOURTH RULE", R5 = "A FIFTH RULE", PROCESS = "A PROCESS RULE";

const BOOK_FILES = [["08_requirements-engineering.md", "Chapter 8 of the book.\n"]];
const IEC_FILES = [["iec-62304.txt", "5.5.5 Software unit verification.\n"]];
const entry = ({ id, title, kind, authority, extra = [], version, files }) => [
  "---", `id: ${id}`, `title: ${title}`, `kind: ${kind}`, `authority: ${authority}`, "licence: may be republished — fixture", ...extra, "---",
  `# ${id} ${title}`, "", "A fixture source.", "", "## Versions", "",
  "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  `| \`${version}\` | 2026-10-01 | fixture | fixture only | listed below |`, "",
  `### Files of ${version}`, "", "| File | SHA-256 |", "|---|---|",
  ...files.map(([name, text]) => `| \`${name}\` | \`${hex(text)}\` |`), "",
].join("\n");
const BOOK = entry({ id: "SRC-vibe-coding", title: "Vibe Coding", kind: "document", authority: "advisory", version: "2026-10-05", files: BOOK_FILES });
const IEC = entry({ id: "SRC-iec-62304", title: "Medical device software", kind: "standard", authority: "normative",
  extra: ["designation: IEC 62304:2006+AMD1:2015"], version: "2015", files: IEC_FILES });
const LINKS = ["# The sources this product meets", "", "| Source | Version | Hash | Part |", "|---|---|---|---|",
  `| SRC-vibe-coding | 2026-10-05 | ${versionHash(BOOK_FILES)} | |`, `| SRC-iec-62304 | 2015 | ${versionHash(IEC_FILES)} | class B |`, ""].join("\n");

const SPEC = ["# Fixture product — Specification", "", "## Rules", "",
  `**${R1}** *(Vibe Coding, ch. 9; IEC 62304:2006+AMD1:2015, 5.5.5)*`, "The first rule.", "*Check:* `tests/unit.test.mjs`", "",
  `**${R2}** *(Vibe Coding)*`, "The second rule.", "*Check:* `tests/failing.test.mjs`", "",
  `**${R3}** *(Vibe Coding)*`, "The third rule, which no test guards.", "*Check:* no automatic check; at review", "",
  `**${R4}** *(Vibe Coding)*`, "The fourth rule.", "*Check:* `tests/unit.test.mjs`", "",
  `**${R5}** *(Vibe Coding)*`, "The fifth rule.", "*Check:* `tests/unit.test.mjs`", ""].join("\n");
const INSTANCE_SPEC = ["# Fixture instance — Specification", "", "## Process", "",
  `**${PROCESS}** *(Vibe Coding)*`, "The process rule.", "*Check:* no automatic check; at review", ""].join("\n");

const declaration = (id, level, guards, module, extra = []) => [
  `// ${id} · level: ${level} · module: ${module}`, `// guards: ${guards}`, "// given: a fixture", "// input: a call", "// expect: a result", ...extra, ""].join("\n");
const UNIT_TESTS = [
  declaration("TST-756101", "unit", R1, "MOD-widget"), declaration("TST-756104", "unit", R4, "MOD-widget"),
  declaration("TST-756105", "unit", R5, "MOD-widget", ["// runs: 10", "// phrasings: 2"])].join("\n");

const jobRecord = ({ id, kind, worksOn, participant, results }) => ["---", `id: ${id}`, `kind: ${kind}`, "works_on:", `  - ${worksOn}`,
  `participant: ${participant}`, "route: tab", "started_by: akmaier", "start: 2026-10-01 09:00 UTC", "agent_m: fixture, commit fixture", "limit: 1", "---",
  "## Destinations", "", "## Parameters", "", "```json", "{}", "```", "", "## End", "", "at: 2026-10-01 10:00 UTC", "state: done", `results: ${results}`, ""].join("\n");

const run = (commit, rows) => ["---", `commit: ${commit}`, "levels:", "  - unit", "  - release", "occasion: release-candidate", "participant: ci",
  "date: 2026-10-11 21:00 UTC", "---", "## Outcomes", "", "| Test | Level | Outcome | Runs |", "|---|---|---|---|",
  ...rows.map((row) => `| ${row.join(" | ")} |`), ""].join("\n");

const priorReport = ["---", "version: 2026.3.0", "candidate: v2026.3.0-rc.1", `commit: ${OLD}`, "date: 2026-10-01", "---", "## Limitations", "", "## Levels", "",
  "| Level | Passed | Failed | Flaky | Not run |", "|---|---|---|---|---|", "| unit | 1 | 0 | 0 | 0 |", "", "## Tests", "",
  "| Test | Level | Outcome | Guards |", "|---|---|---|---|", `| TST-756105 | unit | 8 of 10 | ${R5} |`, "", "## Requirements", "",
  "| Requirement | Level | Tests | Outcome |", "|---|---|---|---|", `| ${R5} | unit | TST-756105 | passed |`, "", "## Changelog entry", "", "Earlier.", ""].join("\n");

const REPORT_TEXT = "# Report of the fixture release\n\nThe report as accepted.\n";
const approvalOf = (limitation) => writeDocument(approvalSchema, { fields: { kind: "release-report", file: REPORT, blob: gitBlob(REPORT_TEXT), limitation } });
const LIMITATIONS = ["TST-756104 — flaky on the CI runner", "TST-756105 — the model answers slower"];

const counterProof = ["---", "test: TST-756101", `commit: ${COMMIT}`, "participant: dev-a", "date: 2026-10-01 09:30 UTC", "outcome: failed", "---",
  "## Fault", "", "src/widget/index.mjs: the check removed.", "", "## Result", "", "Failed with the fault, passed without it.", ""].join("\n");

function productFiles() {
  return {
    "SPEC.md": SPEC, "docs/sources.md": LINKS,
    "docs/sources/SRC-vibe-coding.md": BOOK, "docs/sources/SRC-iec-62304.md": IEC,
    "tests/unit.test.mjs": UNIT_TESTS, "tests/failing.test.mjs": declaration("TST-756106", "unit", R2, "MOD-widget"),
    "tests/release-a.test.mjs": declaration("TST-756102", "release", R1, "system"),
    "tests/release-b.test.mjs": declaration("TST-756103", "release", R1, "system"),
    "docs/backlog/ITM-900-widget.md": ["---", "id: ITM-900", "title: The widget", "level: module", "realises:", `  - ${R1}`, "modules:", "  - MOD-widget",
      "tests:", "  - unit", "origin:", "  - akmaier", "---", "# ITM-900 The widget", ""].join("\n"),
    "docs/jobs/JOB-20261001-0900-aaaa.md": jobRecord({ id: "JOB-20261001-0900-aaaa", kind: "implement", worksOn: "ITM-900", participant: "dev-a", results: "src/widget/index.mjs" }),
    "docs/jobs/JOB-20261001-0901-bbbb.md": jobRecord({ id: "JOB-20261001-0901-bbbb", kind: "write-tests", worksOn: "UC-001", participant: "dev-a", results: "tests/release-a.test.mjs" }),
    "docs/jobs/JOB-20261001-0902-cccc.md": jobRecord({ id: "JOB-20261001-0902-cccc", kind: "write-tests", worksOn: "UC-001", participant: "dev-b", results: "tests/release-b.test.mjs" }),
    "docs/tests/counter-proofs/TST-756101.md": counterProof,
    "docs/tests/releases/v2026.3.0.md": priorReport,
    [REPORT]: REPORT_TEXT,
    [`docs/approvals/release-${TAG}-${gitBlob(REPORT_TEXT).slice(0, 12)}.md`]: approvalOf(LIMITATIONS),
  };
}
function resultFiles() {
  return {
    [`runs/${COMMIT}/a.md`]: run(COMMIT, [["TST-756101", "unit", "passed", ""], ["TST-756102", "release", "passed", ""], ["TST-756103", "release", "passed", ""],
      ["TST-756104", "unit", "passed", ""], ["TST-756105", "unit", "passed", "6 of 10"]]),
    [`runs/${COMMIT}/b.md`]: run(COMMIT, [["TST-756104", "unit", "failed", ""], ["TST-756106", "unit", "failed", ""]]),
    [`runs/${OLD}/old.md`]: run(OLD, [["TST-756105", "unit", "passed", "8 of 10"]]),
  };
}
const GATES = [{ requirement: PROCESS, gate: "Release testing", record: "docs/gates/20261010-release-testing.md" }];

// The call under test, with the parts of the fixture a case changes.
function audit({ product = {}, results = resultFiles(), gates = GATES, instanceSpec = INSTANCE_SPEC } = {}) {
  const files = { ...productFiles(), ...product };
  for (const [path, text] of Object.entries(files)) if (text === null) delete files[path];
  return auditRows(snapshotOf(files, COMMIT), snapshotOf(results, "test-results"), { tag: TAG, commit: COMMIT }, gates, instanceSpec);
}
const rowOf = (result, requirement) => result.rows.find((row) => row.requirement === requirement);

// TST-756001 · level: unit · module: MOD-release-evidence
// guards: THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
// given: the fixture at v2026.4.0 — five requirements of the product's SPEC and one process requirement of the instance's SPEC, whose gate the workflow holds
// input: auditRows(at, results, { tag, commit }, gates, instanceSpec)
// expect: six rows in the order the SPEC lists them, the process requirement last; the five product requirements constrain "product", the process requirement "process"
test("auditRows — one row per requirement valid at the release, product and process", async () => {
  const result = await audit();
  assert.deepEqual(result.rows.map((row) => [row.requirement, row.constrains]),
    [[R1, "product"], [R2, "product"], [R3, "product"], [R4, "product"], [R5, "product"], [PROCESS, "process"]]);
});

// TST-756002 · level: unit · module: MOD-release-evidence
// guards: A SOURCE DECLARES ITS AUTHORITY; A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
// given: the fixture; the first requirement names the book (advisory) and the standard (normative) in its source, the product links both
// input: auditRows(...); the sources of the rows of the first and the third requirement
// expect: the first row lists SRC-vibe-coding (advisory, 2026-10-05) and SRC-iec-62304 (normative, 2015), each with the version's hash then the SHA-256 of each of its files; no source is invented for the others' (all name the book once)
test("auditRows — a row's sources with authority, version and hashes", async () => {
  const result = await audit();
  assert.deepEqual(rowOf(result, R1).sources, [
    { id: "SRC-vibe-coding", authority: "advisory", version: "2026-10-05", hashes: [versionHash(BOOK_FILES), hex(BOOK_FILES[0][1])] },
    { id: "SRC-iec-62304", authority: "normative", version: "2015", hashes: [versionHash(IEC_FILES), hex(IEC_FILES[0][1])] },
  ]);
  assert.deepEqual(rowOf(result, R3).sources.map((source) => source.id), ["SRC-vibe-coding"]);
});

// TST-756003 · level: unit · module: MOD-release-evidence
// guards: THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE; A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
// given: the fixture; the first requirement is guarded by two unit... one unit test and two release tests; the fifth by a model-dependent test run 6 of 10; the second by a failing test; the counter-proof record exists for TST-756101 only
// input: auditRows(...); the tests of those rows
// expect: the first row lists TST-756101 (unit, passed, counter-proof docs/tests/counter-proofs/TST-756101.md), TST-756102 and TST-756103 (release, passed, none); the fifth row's test has the outcome "6 of 10"; the second's is "failed"
test("auditRows — a row's tests by level with outcome or rate and counter-proof", async () => {
  const result = await audit();
  assert.deepEqual(rowOf(result, R1).tests, [
    { id: "TST-756101", level: "unit", outcome: "passed", counterProof: "docs/tests/counter-proofs/TST-756101.md" },
    { id: "TST-756102", level: "release", outcome: "passed", counterProof: null },
    { id: "TST-756103", level: "release", outcome: "passed", counterProof: null },
  ]);
  assert.deepEqual(rowOf(result, R5).tests.map((t) => [t.id, t.outcome]), [["TST-756105", "6 of 10"]]);
  assert.deepEqual(rowOf(result, R2).tests.map((t) => [t.id, t.outcome]), [["TST-756106", "failed"]]);
});

// TST-756004 · level: unit · module: MOD-release-evidence
// guards: THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
// given: the fixture; the process requirement's gate record is docs/gates/20261010-release-testing.md; a product requirement has none
// input: auditRows(...), the rows of the process requirement and of the first requirement
// expect: the process row carries the gate record; the first row's gates are empty; the process requirement's source (the book) is listed too
test("auditRows — a process requirement's row holds the gate records it is given", async () => {
  const result = await audit();
  assert.deepEqual(rowOf(result, PROCESS).gates, ["docs/gates/20261010-release-testing.md"]);
  assert.deepEqual(rowOf(result, R1).gates, []);
  assert.deepEqual(rowOf(result, PROCESS).sources.map((source) => source.id), ["SRC-vibe-coding"]);
});

// TST-756005 · level: unit · module: MOD-release-evidence
// guards: THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
// given: the fixture: first requirement all tests passed; second a failing test; third no test; fourth a test recorded both passing and failing on the commit; fifth a rate of 6 of 10 against 8 of 10 at the last release; the process requirement no test
// input: auditRows(...).summary
// expect: passing 1, noTest 2 (the third and the process requirement), notPassed 1, flaky 1, worse 1, byImplementer 1, accepted true
test("auditRows — the summary counts passing, no test, not passed, flaky and worse requirements", async () => {
  const { summary } = await audit();
  assert.deepEqual([summary.passing, summary.noTest, summary.notPassed, summary.flaky, summary.worse, summary.byImplementer, summary.accepted],
    [1, 2, 1, 1, 1, 1, true]);
});

// TST-756006 · level: unit · module: MOD-release-evidence
// guards: THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
// given: the fixture; the third requirement is guarded by no test at any level
// input: auditRows(...)
// expect: the third requirement has a row with no tests and no gates; it is counted in noTest, and the rows number all six requirements
test("auditRows — a requirement without a test has a row and is counted", async () => {
  const result = await audit();
  assert.equal(result.rows.length, 6);
  assert.deepEqual(rowOf(result, R3).tests, []);
  assert.equal(result.summary.noTest, 2);
});

// TST-756007 · level: unit · module: MOD-release-evidence
// guards: RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
// given: the job ledger of the fixture — dev-a implemented ITM-900, which realises the first requirement, and wrote TST-756102's file; dev-b wrote TST-756103's file
// input: auditRows(...).summary.byImplementer; then the same with the job that wrote tests/release-a.test.mjs done by dev-c
// expect: 1 (only TST-756102); then 0
test("auditRows — a release test whose author is the implementer by the job ledger is counted", async () => {
  assert.equal((await audit()).summary.byImplementer, 1);
  const other = jobRecord({ id: "JOB-20261001-0901-bbbb", kind: "write-tests", worksOn: "UC-001", participant: "dev-c", results: "tests/release-a.test.mjs" });
  assert.equal((await audit({ product: { "docs/jobs/JOB-20261001-0901-bbbb.md": other } })).summary.byImplementer, 0);
});

// TST-756008 · level: unit · module: MOD-release-evidence
// guards: A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// given: the fixture, whose report has an approval record naming its blob and two limitations; then the same with the report's text changed after it was accepted; then with no approval record
// input: auditRows(...).summary
// expect: accepted true with the two limitations as recorded, in order; accepted false and no limitations for the changed report (UC-030 2a); the same for the missing record
test("auditRows — whether the report is accepted, and the limitations of an accepted one", async () => {
  const accepted = (await audit()).summary;
  assert.equal(accepted.accepted, true);
  assert.deepEqual(accepted.limitations, LIMITATIONS);
  const changed = (await audit({ product: { [REPORT]: `${REPORT_TEXT}Changed afterwards.\n` } })).summary;
  assert.deepEqual([changed.accepted, changed.limitations], [false, []]);
  const record = `docs/approvals/release-${TAG}-${gitBlob(REPORT_TEXT).slice(0, 12)}.md`;
  const missing = (await audit({ product: { [record]: null } })).summary;
  assert.deepEqual([missing.accepted, missing.limitations], [false, []]);
});

// TST-756009 · level: unit · module: MOD-release-evidence
// guards: THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
// given: a release before Agent M's records — the branch test-results holds no record of the commit and the tag holds no release test report; the SPEC and tests are there
// input: auditRows(...) with the known positive first (the full fixture lists no "cannot be derived")
// expect: every test's outcome reads "cannot be derived", accepted false, summary.limitations says which parts cannot be derived (the outcomes, the acceptance), the rows are still there
test("auditRows — a release before Agent M's records says which parts cannot be derived", async () => {
  const full = await audit();
  assert.ok(full.summary.limitations.every((line) => !line.startsWith("cannot be derived")));
  const record = `docs/approvals/release-${TAG}-${gitBlob(REPORT_TEXT).slice(0, 12)}.md`;
  const old = await audit({ results: {}, product: { [REPORT]: null, [record]: null } });
  assert.equal(old.rows.length, 6);
  assert.deepEqual(rowOf(old, R1).tests.map((t) => t.outcome), ["cannot be derived", "cannot be derived", "cannot be derived"]);
  assert.equal(old.summary.accepted, false);
  assert.deepEqual(old.summary.limitations.filter((line) => line.startsWith("cannot be derived")).length, 2);
  assert.match(old.summary.limitations.join("\n"), /outcomes/);
  assert.match(old.summary.limitations.join("\n"), /acceptance/);
});
