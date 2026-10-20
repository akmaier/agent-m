// MOD-trace-pages' public route drawn for the audit view of a release (ITM-768): the release tags only as the choice; for the tag chosen the summary at
// the top with the limitations first, each number opening the rows it counts; the filters; one row per requirement valid at the tag, with its sources,
// its tests and their outcomes and counter-proofs, its gates, and its detail linked to the test, its run on the server and the approval commit; the
// report not accepted (2a) with the offer to accept; a requirement with no test, counted (2c); a CI server that offers no run page (2d); a release that
// predates Agent M's test records (1a) (UC-030 steps 1 to 4).
//
// Run: node --test tests/trace-pages-audit.test.mjs
//
// Module: MOD-trace-pages
// Guards: UC-030; THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED; THE TRACEABILITY MATRIX IS DERIVED
// Level: component
//
// The route is called through its public Route.render with the key "audit" and a Host/Snapshot-shaped fake (tests/trace-pages-harness.mjs): a product at the
// tag v2026.4.0 whose SPEC has five requirements, the tests that guard four of them, three job records, a counter-proof, the links to two sources, a process
// declaration and one gate record; its default branch, which alone holds the release test report and its approval record; the branch `test-results`; and
// an instance whose SPEC holds one process requirement, whose register holds the two sources and which holds, at the commit the declaration names, the
// process model. Every expected text is stated in the case; none is read from a document. The fixture of the rows is the one of
// tests/release-evidence-audit.test.mjs, whose summary is passing 1, no test 2, not passed 1, flaky 1, worse 1, by the implementer 1.
// Readings the cases take, each from the sentence quoted:
// - "the auditor opens Tests → Audit and picks a release tag" (UC-030 1): the choice `version-choice` offers the tags of the form vYYYY.MINOR.PATCH, newest
//   first, and no other tag and no `current`; a ref that is not a release tag shows the newest release tag; a product with no release tag says so and draws no row.
// - "Agent M summarises ... Each number opens the rows it counts" (UC-030 3): an element `audit-count` with `data-kind` passing, noTest, notPassed, flaky, worse and
//   byImplementer shows each number; pressing the passing, noTest, notPassed and flaky ones leaves the rows they count, which the rows alone tell (a row with a test
//   and only passed outcomes is passing; one without a test is no test; one with a failed or not run outcome is not passed; one with a flaky outcome is flaky).
// - "The limitations stand at the top of the summary" (UC-030 2b): `ul.audit-limitations` comes before the first `audit-count` in the page.
// - "the auditor filters - only normative sources, one source, one level, only gaps" (UC-030 4): the selects `audit-filter-normative` (all, normative), `audit-filter-source`
//   (all and the identifiers of the sources the rows cite), `audit-filter-level` (all and the levels the rows' tests have) and the checkbox `audit-filter-gaps`; a row
//   is a gap where it is not passing; the filters narrow together.
// - "opens a row to follow the links to the test, its run on the server, and the approval commit" (UC-030 4): each `tr.audit-row` (attribute `data-requirement`)
//   holds `a.audit-test` (the test's identifier, to the tests page: #trace/key=tests/row=<id>), `a.audit-run` (WebLinks.commitRuns of the release commit) and
//   `a.audit-approval` (WebLinks.file of the approval record at the commit that added it).
// - "The release test report has not been accepted. Every row shows evidence not accepted, and the summary says so first. ... Agent M offers the report with Accept"
//   (UC-030 2a): `audit-evidence` of every row reads `evidence not accepted`; MOD-trace-pages' Uses do not name acceptAndRelease, so the offer is `p.audit-not-accepted`
//   holding `a.audit-accept`, a link to MOD-test-pages' route release (#release), where Accept stands.
// - "Its row says no test; it is counted, not hidden" (UC-030 2c): `audit-no-test` reads `no test`.
// - "only the link to the server's log is marked unavailable" (UC-030 2d): where the host offers no run page, `audit-run-unavailable` reads `unavailable` in place of the link.
// - "Agent M says which parts cannot be derived for this tag and shows the rest" (UC-030 1a): the limitations name `cannot be derived`, every outcome reads so, and the rows stand.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { writeDocument } from "../src/documents/index.mjs";
import { approvalSchema } from "../src/approvals/index.mjs";
import { document, find, treeHost, until } from "./trace-pages-harness.mjs";

const { view } = await import("../src/trace-pages/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "trace");

const hex = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const versionHash = (files) => hex([...files].sort(([a], [b]) => (a < b ? -1 : 1)).map(([name, text]) => `${hex(text)}  ${name}\n`).join(""));
const gitBlob = (text) => createHash("sha1").update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest("hex");

const TAG = "v2026.4.0", OLDER = "v2026.3.0", REPORT = `docs/tests/releases/${TAG}.md`;
const COMMIT = "c".repeat(40), OLD = "e".repeat(40), HEAD = "f".repeat(40), ACCEPTING = "d".repeat(40), MODEL_COMMIT = "a1".repeat(20);
const R1 = "A FIRST RULE", R2 = "A SECOND RULE", R3 = "A THIRD RULE", R4 = "A FOURTH RULE", R5 = "A FIFTH RULE", PROCESS = "A PROCESS RULE";
const ADDRESS = "https://github.com/acme/product";

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
const RECORD = `docs/approvals/release-${TAG}-${gitBlob(REPORT_TEXT).slice(0, 12)}.md`;

const counterProof = ["---", "test: TST-756101", `commit: ${COMMIT}`, "participant: dev-a", "date: 2026-10-01 09:30 UTC", "outcome: failed", "---",
  "## Fault", "", "src/widget/index.mjs: the check removed.", "", "## Result", "", "Failed with the fault, passed without it.", ""].join("\n");

// The process the product declared: the instance's model at MODEL_COMMIT (phases Plan and Build, one gate between them) and one gate that A PROCESS RULE adds.
const MODEL_PATH = "docs/process-models/mini.md";
const model = ["---", "name: mini", "kind: planned", "measure: plan entries per phase", "---", "# Mini", "", "## Phases", "", "| Name | Role | Produces |", "|---|---|---|",
  "| Plan | Lead | ITM |", "| Build | Lead | MOD |", "", "## Transitions", "", "| From | To | Kind |", "|---|---|---|", "| Plan | Build | sequence |", "",
  "## Verification pairs", "", "| Phase | Checked by |", "|---|---|", "| Plan | Build |", "",
  "## Gates", "", "| Between | Artifacts | Condition | Decider |", "|---|---|---|---|", "| Plan → Build | the plan | it is complete | Lead |", "",
  "## Roles", "", "| Name | Filled by | How many | Capabilities |", "|---|---|---|---|", "| Lead | either | one | read the repository |", "",
  "## Flow control", "", "| Kind | Value |", "|---|---|", "| WIP limit | — |", "| Time box | none |", "| Sprints | no |", ""].join("\n");
const PROCESS_MD = ["---", "model: mini", `model_file: ${MODEL_PATH}`, `model_version: ${MODEL_COMMIT}`, "---", "# Process", "",
  "## Practices", "", "- none", "", "## Branches", "", "| Phase or time box | Branch |", "|---|---|", "| Plan | plan |", "",
  "## Gates added by requirements", "", "| Requirement | Between | Artifacts | Condition | Decider |", "|---|---|---|---|---|",
  `| ${PROCESS} | Plan → Build | SPEC.md | the process rule holds | Lead |`, "", "## Definition of Done", "", "The job rules hold.", ""].join("\n");
const GATE_PATH = "docs/gates/20261010-1000-a-process-rule-alic.md";
const GATE_RECORD = ["---", `gate: ${PROCESS}`, "job:", "decider: alice", "role: Lead", "decision: passed", "on:", `  - SPEC.md@${gitBlob(SPEC)}`, "date: 2026-10-10 10:00 UTC", "---",
  `# ${PROCESS}: the fixture`, "", "**REGISTER**", ""].join("\n");

const productFiles = () => ({
  "SPEC.md": SPEC, "docs/sources.md": LINKS,
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
  "docs/process.md": PROCESS_MD, [GATE_PATH]: GATE_RECORD,
});
const headFiles = (accepted = true) => ({ "SPEC.md": SPEC, [REPORT]: REPORT_TEXT, ...(accepted ? { [RECORD]: approvalOf(LIMITATIONS) } : {}) });
const resultFiles = () => ({
  [`runs/${COMMIT}/a.md`]: run(COMMIT, [["TST-756101", "unit", "passed", ""], ["TST-756102", "release", "passed", ""], ["TST-756103", "release", "passed", ""],
    ["TST-756104", "unit", "passed", ""], ["TST-756105", "unit", "passed", "6 of 10"]]),
  [`runs/${COMMIT}/b.md`]: run(COMMIT, [["TST-756104", "unit", "failed", ""], ["TST-756106", "unit", "failed", ""]]),
  [`runs/${OLD}/old.md`]: run(OLD, [["TST-756105", "unit", "passed", "8 of 10"]]),
});
const instanceFiles = () => ({ "SPEC.md": INSTANCE_SPEC, "docs/sources/SRC-vibe-coding.md": BOOK, "docs/sources/SRC-iec-62304.md": IEC });

// The product's host: refs by name, the commit of a tag as COMMIT, the run page and the file page a server offers (`links` false: it offers none), and the history of the
// approval record, which the commit ACCEPTING added.
const ACCEPTED_BY = { commit: ACCEPTING, parents: [], author: { account: "akmaier", name: "Andreas Maier" }, date: "2026-10-12 08:30 UTC", message: "", changes: [] };
function productHost({ product = productFiles(), head = headFiles(), results = resultFiles(), tags = [TAG, OLDER, "nightly"], links = true, recordHistory = [ACCEPTED_BY] } = {}) {
  const base = treeHost({ trees: { [TAG]: product, main: head, "test-results": results }, tags });
  const commits = { [TAG]: COMMIT, main: HEAD };
  const log = { runs: [], files: [], histories: [] };
  return {
    ...base, log,
    async readSnapshot(ref) { const snapshot = await base.readSnapshot(ref); return { ...snapshot, commit: commits[ref] ?? ref, repository: { path: "acme/product", web: ADDRESS } }; },
    async listTags() { return tags.map((name) => ({ name, commit: name === TAG ? COMMIT : `commit-of-${name}` })); },
    async readHistory(path, options = {}) {
      log.histories.push([path, options]);
      return path === RECORD && head[RECORD] !== undefined ? recordHistory : [];
    },
    webLinks: links ? () => ({ commitRuns: (commit) => { log.runs.push(commit); return `${ADDRESS}/commit/${commit}/checks`; },
      file: (path, ref) => { log.files.push([path, ref]); return `${ADDRESS}/blob/${ref}/${path}`; } }) : undefined,
  };
}
const instanceHost = () => treeHost({ trees: { main: instanceFiles(), [MODEL_COMMIT]: { [MODEL_PATH]: model } } });

async function render(host = productHost(), params = { key: "audit", ref: TAG }) {
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { product: { address: ADDRESS, host }, instance: { host: instanceHost() } }, params);
  return target;
}
const withClass = (root, name) => find(root, (node) => String(node.className).split(" ").includes(name));
const textsOf = (root, name) => withClass(root, name).map((node) => node.textContent);
const rows = (root) => withClass(root, "audit-row");
const names = (root) => rows(root).map((row) => row.getAttribute("data-requirement"));
const rowOf = (root, name) => rows(root).find((row) => row.getAttribute("data-requirement") === name);
const countOf = (root, kind) => withClass(root, "audit-count").find((node) => node.getAttribute("data-kind") === kind);
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));
async function choose(target, className, value) {
  const select = withClass(target, className)[0];
  select.value = value;
  select.dispatchEvent(new Event("change"));
  await until(() => select.value === value);
  await settle();
}
async function press(node) { node.dispatchEvent(new Event("click")); await settle(); }
const ALL = [R1, R2, R3, R4, R5, PROCESS];

// TST-768001 · level: component · module: MOD-trace-pages
// guards: UC-030
// given: a product whose Host names the tags v2026.4.0, v2026.3.0 and nightly
// input: Route.render with the key "audit" at the ref v2026.4.0, and at the ref main
// expect: the version choice offers v2026.4.0 and v2026.3.0 in that order and no other, with no `current`; at v2026.4.0 it is selected; at main the newest release tag, v2026.4.0, is the one drawn and selected
// Planted fault: offering the branch or the tag nightly in the choice fails the first assertion; drawing main fails the last.
test("the audit offers release tags only, and a ref that is no release tag shows the newest one", async () => {
  const target = await render();
  const select = withClass(target, "version-choice")[0];
  assert.deepEqual(find(select, (node) => node.localName === "option").map((node) => node.getAttribute("value") ?? node.value), [TAG, OLDER]);
  assert.equal(select.value, TAG);
  assert.equal(textsOf(target, "version-bar").join("").includes("current"), false);
  const onMain = await render(productHost(), { key: "audit", ref: "main" });
  assert.equal(withClass(onMain, "version-choice")[0].value, TAG);
  assert.deepEqual(names(onMain), ALL);
});

// TST-768002 · level: component · module: MOD-trace-pages
// guards: UC-030; THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
// given: a product with no release tag, only the tag nightly
// input: Route.render with the key "audit"
// expect: the page says that no release is tagged and draws no row
// Planted fault: drawing rows for the branch fails the second assertion.
test("a product with no release tag says so and draws no row", async () => {
  const target = await render(productHost({ tags: ["nightly"] }));
  assert.match(target.textContent, /No release is tagged yet/);
  assert.equal(rows(target).length, 0);
});

// TST-768003 · level: component · module: MOD-trace-pages
// guards: UC-030; THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// given: the fixture at v2026.4.0, whose approval records two limitations
// input: Route.render with the key "audit"
// expect: the limitations list holds the two limitations and stands before the first number; the numbers read passing 1, no test 2, not passed 1, flaky 1, worse 1, by the implementer 1; one row for each of the five product requirements and the process requirement, in that order
// Planted fault: dropping the limitations, listing them after the numbers, or reading the numbers from anything but the audit fails.
test("the summary stands at the top with the limitations first, and a row stands for every requirement of the release", async () => {
  const target = await render();
  assert.deepEqual(textsOf(target, "audit-limitations")[0].includes(LIMITATIONS[0]) && textsOf(target, "audit-limitations")[0].includes(LIMITATIONS[1]), true);
  const order = find(target, (node) => ["audit-limitations", "audit-count"].some((name) => String(node.className).split(" ").includes(name))).map((node) => node.className.split(" ")[0]);
  assert.equal(order[0], "audit-limitations");
  assert.deepEqual(["passing", "noTest", "notPassed", "flaky", "worse", "byImplementer"].map((kind) => countOf(target, kind).textContent), ["1", "2", "1", "1", "1", "1"]);
  assert.deepEqual(names(target), ALL);
});

// TST-768004 · level: component · module: MOD-trace-pages
// guards: UC-030; THE TRACEABILITY MATRIX IS DERIVED
// given: the fixture
// input: the numbers passing, no test, not passed and flaky are pressed, each after the page is drawn
// expect: passing leaves A FIRST RULE; no test leaves A THIRD RULE and A PROCESS RULE; not passed leaves A SECOND RULE; flaky leaves A FOURTH RULE
// Planted fault: a number that opens every row, or the wrong rows, fails.
test("each number opens the rows it counts", async () => {
  const wanted = { passing: [R1], noTest: [R3, PROCESS], notPassed: [R2], flaky: [R4] };
  for (const [kind, expected] of Object.entries(wanted)) {
    const target = await render();
    await press(countOf(target, kind));
    assert.deepEqual(names(target), expected, kind);
  }
});

// TST-768005 · level: component · module: MOD-trace-pages
// guards: UC-030; THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE; THE TRACEABILITY MATRIX IS DERIVED
// given: the fixture; A FIRST RULE cites the book and IEC 62304 (normative), is guarded by 756101 (unit, a counter-proof) and 756102 and 756103 (release); A FOURTH RULE by 756104, flaky
// input: the rows are read
// expect: A FIRST RULE constrains the product, cites SRC-vibe-coding and SRC-iec-62304, shows the tests TST-756101 (unit, passed, counter-proof docs/tests/counter-proofs/TST-756101.md), TST-756102 and TST-756103 (release, passed); A FOURTH RULE shows TST-756104 as flaky; A SIXTH is not there
// Planted fault: a row without its tests, outcomes or counter-proof fails.
test("a product row shows what it constrains, its sources, and its tests with outcome, level and counter-proof", async () => {
  const target = await render();
  const first = rowOf(target, R1);
  assert.equal(textsOf(first, "audit-constrains")[0], "product");
  assert.deepEqual(textsOf(first, "audit-source"), ["SRC-vibe-coding", "SRC-iec-62304"]);
  assert.deepEqual(withClass(first, "audit-test-line").map((line) => [textsOf(line, "audit-test")[0], textsOf(line, "audit-level")[0], textsOf(line, "audit-outcome")[0], textsOf(line, "audit-counter-proof")[0] ?? null]),
    [["TST-756101", "unit", "passed", "docs/tests/counter-proofs/TST-756101.md"], ["TST-756102", "release", "passed", null], ["TST-756103", "release", "passed", null]]);
  assert.deepEqual(textsOf(rowOf(target, R4), "audit-outcome"), ["flaky"]);
});

// TST-768006 · level: component · module: MOD-trace-pages
// guards: UC-030; THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
// given: the fixture; A PROCESS RULE is a requirement of the instance's SPEC that the declaration docs/process.md adds as a gate, and the gate record docs/gates/20261010-1000-a-process-rule-alic.md names it
// input: the row of A PROCESS RULE is read
// expect: it constrains the process, cites SRC-vibe-coding, and lists the gate record; a product row lists no gate
// Planted fault: reading the gates from the wrong model, or none, leaves no process row.
test("a process row shows that it constrains the process and the gate records it added", async () => {
  const target = await render();
  const process = rowOf(target, PROCESS);
  assert.equal(textsOf(process, "audit-constrains")[0], "process");
  assert.deepEqual(textsOf(process, "audit-source"), ["SRC-vibe-coding"]);
  assert.deepEqual(textsOf(process, "audit-gate"), [GATE_PATH]);
  assert.deepEqual(textsOf(rowOf(target, R1), "audit-gate"), []);
});

// TST-768007 · level: component · module: MOD-trace-pages
// guards: UC-030; THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
// given: the fixture; A THIRD RULE has no test at any level
// input: its row is read
// expect: the row exists, reads `no test`, shows no test line, and is counted in the number no test; a row with tests has no such text
// Planted fault: hiding the row, or leaving the text out, fails.
test("a requirement with no test has its row, which says no test", async () => {
  const target = await render();
  assert.equal(textsOf(rowOf(target, R3), "audit-no-test")[0], "no test");
  assert.equal(withClass(rowOf(target, R3), "audit-test-line").length, 0);
  assert.deepEqual(textsOf(rowOf(target, R1), "audit-no-test"), []);
  assert.equal(countOf(target, "noTest").textContent, "2");
});

// TST-768008 · level: component · module: MOD-trace-pages
// guards: UC-030
// given: the fixture; only SRC-iec-62304 is normative
// input: the select audit-filter-normative is set to `normative`
// expect: only A FIRST RULE stays; set back to `all`, every row is back
// Planted fault: a filter that keeps the rows citing any source fails.
test("the filter normative sources keeps the rows that cite a normative source", async () => {
  const target = await render();
  await choose(target, "audit-filter-normative", "normative");
  assert.deepEqual(names(target), [R1]);
  await choose(target, "audit-filter-normative", "all");
  assert.deepEqual(names(target), ALL);
});

// TST-768009 · level: component · module: MOD-trace-pages
// guards: UC-030
// given: the fixture; the rows cite SRC-vibe-coding (all six) and SRC-iec-62304 (A FIRST RULE)
// input: the select audit-filter-source offers its choices, then is set to SRC-iec-62304, then to SRC-vibe-coding
// expect: the choices are all, SRC-iec-62304 and SRC-vibe-coding; SRC-iec-62304 leaves A FIRST RULE; SRC-vibe-coding leaves all six
// Planted fault: comparing a part of the identifier, or leaving the source unfiltered, fails.
test("the filter one source keeps the rows that cite it", async () => {
  const target = await render();
  const select = withClass(target, "audit-filter-source")[0];
  assert.deepEqual(find(select, (node) => node.localName === "option").map((node) => node.value), ["all", "SRC-iec-62304", "SRC-vibe-coding"]);
  await choose(target, "audit-filter-source", "SRC-iec-62304");
  assert.deepEqual(names(target), [R1]);
  await choose(target, "audit-filter-source", "SRC-vibe-coding");
  assert.deepEqual(names(target), ALL);
});

// TST-768010 · level: component · module: MOD-trace-pages
// guards: UC-030
// given: the fixture; the tests of A FIRST RULE are unit and release, those of the rows A SECOND, A FOURTH and A FIFTH are unit
// input: the select audit-filter-level offers its choices, then is set to release, then to unit
// expect: the choices are all, unit and release; release leaves A FIRST RULE; unit leaves A FIRST, A SECOND, A FOURTH and A FIFTH RULE
// Planted fault: matching the level against the outcome, or ignoring it, fails.
test("the filter one level keeps the rows that have a test of it", async () => {
  const target = await render();
  const select = withClass(target, "audit-filter-level")[0];
  assert.deepEqual(find(select, (node) => node.localName === "option").map((node) => node.value), ["all", "unit", "release"]);
  await choose(target, "audit-filter-level", "release");
  assert.deepEqual(names(target), [R1]);
  await choose(target, "audit-filter-level", "unit");
  assert.deepEqual(names(target), [R1, R2, R4, R5]);
});

// TST-768011 · level: component · module: MOD-trace-pages
// guards: UC-030; THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
// given: the fixture; only A FIRST RULE has passing evidence
// input: the checkbox audit-filter-gaps is checked, then the level release is chosen as well, then the box is unchecked
// expect: the gaps are A SECOND, A THIRD, A FOURTH, A FIFTH and A PROCESS RULE; with the level release none is left (the filters narrow together); unchecked, A FIRST RULE returns
// Planted fault: a gaps filter that keeps the passing row, or one that drops the other filters, fails.
test("the filter only gaps keeps the rows that are not passing, and the filters narrow together", async () => {
  const target = await render();
  const box = withClass(target, "audit-filter-gaps")[0];
  box.checked = true;
  box.dispatchEvent(new Event("change"));
  await settle();
  assert.deepEqual(names(target), [R2, R3, R4, R5, PROCESS]);
  await choose(target, "audit-filter-level", "release");
  assert.deepEqual(names(target), []);
  box.checked = false;
  box.dispatchEvent(new Event("change"));
  await settle();
  assert.deepEqual(names(target), [R1]);
});

// TST-768012 · level: component · module: MOD-trace-pages
// guards: UC-030
// given: the fixture, accepted by akmaier on 2026-10-12 08:30 UTC with the approval record added by the commit dddd…; a server that offers the run page and the file page
// input: the detail of A FIRST RULE is read
// expect: each test is a link to #trace/key=tests/row=<id>; the run link is the commit page of the release commit (WebLinks.commitRuns(COMMIT)); the approval link is WebLinks.file of the approval record at the accepting commit; the evidence reads accepted by akmaier on 2026-10-12 08:30 UTC; the history was asked for the record's path with changes false
// Planted fault: linking the run of another commit, the approval record at the tag, or leaving the acceptance out fails.
test("a row's detail links the test, its run on the server and the approval commit, and names who accepted the report", async () => {
  const host = productHost();
  const target = await render(host);
  const first = rowOf(target, R1);
  assert.deepEqual(withClass(first, "audit-test").map((node) => node.getAttribute("href")),
    ["TST-756101", "TST-756102", "TST-756103"].map((id) => `#trace/key=tests/row=${id}`));
  assert.equal(withClass(first, "audit-run")[0].getAttribute("href"), `${ADDRESS}/commit/${COMMIT}/checks`);
  assert.equal(withClass(first, "audit-approval")[0].getAttribute("href"), `${ADDRESS}/blob/${ACCEPTING}/${RECORD}`);
  assert.match(textsOf(first, "audit-evidence")[0], /accepted by akmaier on 2026-10-12 08:30 UTC/);
  assert.deepEqual(host.log.histories.filter(([path]) => path === RECORD).map(([, options]) => options.changes), [false]);
  assert.equal(withClass(target, "audit-not-accepted").length, 0);
});

// TST-768013 · level: component · module: MOD-trace-pages
// guards: UC-030; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
// given: the fixture whose default branch holds the report but no approval record
// input: Route.render with the key "audit"
// expect: every row's evidence reads `evidence not accepted` and none reads accepted; the page offers the report with a link audit-accept to #release; the limitations name the missing approval record; the rows stand
// Planted fault: showing acceptance without a record, or leaving the offer out, fails.
test("where the report is not accepted every row says so and the page links to Accept", async () => {
  const target = await render(productHost({ head: headFiles(false) }));
  assert.deepEqual(names(target), ALL);
  assert.deepEqual(rows(target).map((row) => textsOf(row, "audit-evidence")[0]), ALL.map(() => "evidence not accepted"));
  assert.equal(withClass(target, "audit-accept")[0].getAttribute("href"), "#release");
  assert.equal(withClass(target, "audit-not-accepted").length, 1);
  assert.match(textsOf(target, "audit-limitations")[0], /missing: approval record naming blob/);
  assert.equal(withClass(target, "audit-approval").length, 0);
});

// TST-768014 · level: component · module: MOD-trace-pages
// guards: UC-030
// given: the fixture on a server that offers no run page (the Host has no webLinks)
// input: Route.render with the key "audit"
// expect: no row has a run link; each row with a test reads `unavailable` in its place; the outcomes are still read from the branch test-results
// Planted fault: a link to an undefined page, or dropping the outcomes with the link, fails.
test("where the server offers no run page the link is marked unavailable and the outcomes stand", async () => {
  const target = await render(productHost({ links: false }));
  assert.equal(withClass(target, "audit-run").length, 0);
  assert.deepEqual(textsOf(rowOf(target, R1), "audit-run-unavailable"), ["unavailable"]);
  assert.deepEqual(textsOf(rowOf(target, R2), "audit-outcome"), ["failed"]);
});

// TST-768015 · level: component · module: MOD-trace-pages
// guards: UC-030
// given: a release that predates Agent M's records: the tagged product has no result record, and its default branch no report
// input: Route.render with the key "audit"
// expect: the limitations name `cannot be derived` for the outcomes and for the acceptance; the six rows stand and every test outcome reads `cannot be derived`
// Planted fault: drawing outcomes as failed, or no rows, fails.
test("a release before the test records says which parts cannot be derived and shows the rest", async () => {
  const target = await render(productHost({ results: { "README.md": "none\n" }, head: { "SPEC.md": SPEC } }));
  const limitations = textsOf(target, "audit-limitations")[0];
  assert.match(limitations, /cannot be derived: outcomes/);
  assert.match(limitations, /cannot be derived: acceptance/);
  assert.deepEqual(names(target), ALL);
  assert.deepEqual([...new Set(textsOf(target, "audit-outcome"))], ["cannot be derived"]);
});

// TST-768016 · level: component · module: MOD-trace-pages
// guards: UC-030; THE TRACEABILITY MATRIX IS DERIVED
// given: the fixture, with no result record of TST-756106 (A SECOND RULE's only test) on the release commit
// input: the number a test did not pass is pressed
// expect: its outcome reads `not run` and the rows left are A SECOND RULE alone: a test that did not run is a test that did not pass
// Planted fault: counting only the failed outcomes leaves no row.
test("a test with no result on the release commit reads not run and is counted among the tests that did not pass", async () => {
  const results = resultFiles();
  results[`runs/${COMMIT}/b.md`] = run(COMMIT, [["TST-756104", "unit", "failed", ""]]);
  const target = await render(productHost({ results }));
  assert.deepEqual(textsOf(rowOf(target, R2), "audit-outcome"), ["not run"]);
  await press(countOf(target, "notPassed"));
  assert.deepEqual(names(target), [R2]);
});

// TST-768017 · level: component · module: MOD-trace-pages
// guards: UC-030; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
// given: the fixture, whose approval record was added by akmaier at ACCEPTING and changed later by another person at a newer commit (history newest first)
// input: Route.render with the key "audit"
// expect: the report was accepted by akmaier on 2026-10-12 08:30 UTC, and the approval link is the record at ACCEPTING: the commit that added the record, the oldest
// Planted fault: reading the newest commit of the record's history names the other person and the newer commit.
test("the acceptance is the commit that added the approval record, not a later change of it", async () => {
  const later = { ...ACCEPTED_BY, commit: "9".repeat(40), author: { account: "other", name: "Other" }, date: "2026-10-13 09:00 UTC" };
  const target = await render(productHost({ recordHistory: [later, ACCEPTED_BY] }));
  assert.match(textsOf(rowOf(target, R1), "audit-evidence")[0], /accepted by akmaier on 2026-10-12 08:30 UTC/);
  assert.equal(withClass(rowOf(target, R1), "audit-approval")[0].getAttribute("href"), `${ADDRESS}/blob/${ACCEPTING}/${RECORD}`);
});

// TST-768018 · level: component · module: MOD-trace-pages
// guards: UC-030; THE GATE IS RECORDED; THE TRACEABILITY MATRIX IS DERIVED
// given: a product whose declaration adds the gate of A PROCESS RULE between Build and Release, which the workflow reaches only through the gate Plan → Build; that gate's record names SPEC.md at the blob the tag holds
// input: Route.render with the key "audit"
// expect: A PROCESS RULE is a row and lists its gate record; the gate Plan → Build is read as passed on the text the tag holds
// Planted fault: reading the gate records against another text than the tag's leaves Plan → Build passed on an earlier text, the gate after it not reached, and no process row.
test("a gate behind another gate is read against the texts the tag holds", async () => {
  const later = PROCESS_MD.replace("| Plan → Build | SPEC.md |", "| Build → Release | SPEC.md |");
  const through = GATE_RECORD.replace(`gate: ${PROCESS}`, "gate: Plan → Build").replace("role: Lead", "role: Lead");
  const product = { ...productFiles(), "docs/process.md": later, "docs/gates/20261010-0900-plan-build-alic.md": through };
  const target = await render(productHost({ product }));
  assert.deepEqual(names(target), ALL);
  assert.deepEqual(textsOf(rowOf(target, PROCESS), "audit-gate"), [GATE_PATH]);
});

// TST-768019 · level: component · module: MOD-trace-pages
// guards: UC-030
// given: the fixture; A THIRD RULE has no test, so no run of its tests exists
// input: the rows A THIRD RULE and A FIRST RULE are read, with a server that offers the run page, and without one
// expect: A THIRD RULE has neither a run link nor the mark unavailable; A FIRST RULE has the one or the other
// Planted fault: a run link on a row with no test fails.
test("a row with no test links no run", async () => {
  const target = await render();
  assert.equal(withClass(rowOf(target, R3), "audit-run").length + withClass(rowOf(target, R3), "audit-run-unavailable").length, 0);
  const without = await render(productHost({ links: false }));
  assert.equal(withClass(rowOf(without, R3), "audit-run-unavailable").length, 0);
});

// TST-658002 · level: component · module: MOD-trace-pages
// guards: UC-020 (2a); EVERY STEP EXPLAINS ITSELF
// given: a product whose listTags fails with a plain error; and one whose listTags fails as a Host does when the repository is not found, in a context that says no token is stored
// input: Route.render with the key "audit"
// expect: the page says "The tags could not be read: This page could not be drawn: tags unavailable" and never that no release is tagged; for the Host's failure without a stored token it names the private or missing repository and offers "Store a token"; it draws no row
// Planted fault: reading a failed listTags as no tags makes the page say that no release is tagged.
test("a failed listTags is named through the frame in the audit view, never read as no release", async () => {
  const { HostError } = await import("../src/repository-hosts/index.mjs");
  const drawn = async (failure, product) => {
    const target = document.createElement("div");
    document.body.append(target);
    const host = { ...productHost(), async listTags() { throw failure; } };
    await route.render(target, { product: { address: ADDRESS, host, ...product }, instance: { host: instanceHost() } }, { key: "audit", ref: TAG });
    return target;
  };
  const plain = await drawn(new Error("tags unavailable"), {});
  assert.match(plain.textContent, /The tags could not be read: This page could not be drawn: tags unavailable/);
  assert.doesNotMatch(plain.textContent, /No release is tagged/);
  assert.equal(rows(plain).length, 0);
  const missing = await drawn(new HostError("NotFound", {}, "Not Found"), { tokenStored: false });
  assert.match(missing.textContent, /The tags could not be read: This repository is private or does not exist/);
  assert.equal(withClass(missing, "token-step").length, 1);
  assert.doesNotMatch(missing.textContent, /No release is tagged/);
});
