// MOD-trace-pages' public route drawn for the tests view (ITM-766): the tests of a product as a tree by level, test file and test case, or grouped by
// requirement, by use case or by module, each test with its identifier, its title and its outcome on the latest commit of the version shown; the filters;
// the Incomplete group; a guarded name that matches nothing; and a private repository no token reaches (UC-029 steps 1 to 3, 1a, 1b, 2a).
//
// Run: node --test tests/trace-pages-tests-view.test.mjs
//
// Module: MOD-trace-pages
// Guards: UC-029; EVERY TEST HAS ONE LEVEL; THE TRACEABILITY MATRIX IS DERIVED; UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN; A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY; THE NAME IS THE ID AND IT SURVIVES
// Level: component
//
// The route is called through its public Route.render with the key "tests", with a Host/Snapshot-shaped fake that holds the files of a small product and the
// branch `test-results` (tests/trace-pages-harness.mjs); it has no write method. The fixture is a product of its own: a SPEC of three requirements, two use cases,
// two modules, nine tests in three files, one counter-proof, and the run records of two commits. Each case states its expected texts; none is read from a document.
// Readings the cases take, each from the sentence quoted:
// - "a tree grouped by level, then by test file, then by test case; each test shows its `TST-` identifier, a one-line title and its outcome on the latest commit
//   of the default branch" (UC-029 1): the levels that hold a test, in the order of MOD-test-document's Data (unit, component, system, release, user), each with its
//   test files in the order of their paths and their cases in the order of their lines; the title is TestDeclaration's `title`; the outcome is resultsAt's for the
//   commit of the version shown, read from the branch `test-results`, with the runs `(<k> of <n>)` of a model-dependent test after it.
// - "Each group shows which levels guard it; a missing level is shown as empty, not hidden" (UC-029 2): the groupings by requirement, use case and module list, in
//   each group, all five levels in that order as `<level>: <number of tests>` or `<level>: empty`. The groups are the requirements of the SPEC in its order, the use
//   cases in the order of their identifiers, the modules in the order of their identifiers and then `system`; a group nothing guards is shown, with every level empty.
//   A test is in the group of each name it guards (a name beginning `UC-` is a use case, any other a requirement), or of its module.
// - "filters: failed, flaky, not run, model-dependent, calls a paid service, without counter-proof, guards nothing" (UC-029 3): a select `tests-filter` with those
//   seven values and `all`; a filter keeps the test cases whose outcome is that (failed, flaky, not run), whose declaration has `runs` (model-dependent) or `paid` (calls
//   a paid service), whose file docs/tests/counter-proofs/<TST>.md the version does not hold (without counter-proof; MOD-result-records' counter-proof path), or whose
//   declaration guards nothing; it narrows the tree and the Incomplete group alike.
// - "It is listed under Incomplete, with what is missing" (UC-029 1a): a test whose declaration has no level or guards no name, with `level`, `guards` or `level, guards`
//   as what is missing; testDeclarations yields a declaration only where its first line names an identifier, so a block with no identifier is not seen by it.
// - "The link is shown as broken, with the identifier; the test is not moved to another group" (UC-029 2a): a guarded name that matches no requirement (or, for `UC-`,
//   no use case) of the version is a group of its own, marked broken, holding the test; the test keeps its place in the tree.
// - "The page says so and shows nothing" (UC-029 1b): the first read of the version handed fails as the host fails for a private repository (NotFound); the route lets
//   it reach the frame, whose readProblem names the missing token, as the other trace views do, and has drawn no test.
// The class names are the contract the cases read: `tests-grouping`, `tests-filter`, `tests-group`, `tests-group-name`, `tests-file`, `tests-file-name`, `tests-case`,
// `tests-id`, `tests-title`, `tests-outcome`, `tests-levels`, `tests-level`, `tests-incomplete`, `tests-missing`, `tests-broken`, `version-as-of`.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { HostError } from "../src/repository-hosts/index.mjs";
import { document, doc, find, treeHost, until } from "./trace-pages-harness.mjs";

const { view } = await import("../src/trace-pages/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "trace");

const MAIN = "a".repeat(40), OLD = "c".repeat(40), TAG = "b".repeat(40);
const COMMITS = { main: MAIN, "v2026.1.0": TAG };

const SPEC = [
  "# Tests fixture — Specification", "", "## Only section", "",
  "**ALPHA RULE** *(Vibe Coding)*", "Alpha rule.", "*Check:* at review.", "",
  "**BETA RULE** *(Vibe Coding)*", "Beta rule.", "*Check:* at review.", "",
  "**GAMMA RULE** *(Vibe Coding)*", "Gamma rule.", "*Check:* at review.", "",
].join("\n");

// A declaration as MOD-test-document reads it: the first line packs the identifier, the level and the module; the title is the first string literal after it.
const declared = (id, parts, title) => [
  `// ${id} · ${parts.level ? `level: ${parts.level}` : "level:"}${parts.module ? ` · module: ${parts.module}` : ""}`,
  ...(parts.guards ? [`// guards: ${parts.guards}`] : []),
  ...(parts.runs ? [`// runs: ${parts.runs}`, "// phrasings: 2"] : []),
  ...(parts.paid ? [`// paid: ${parts.paid}`] : []),
  "// given: a fixture", "// input: a call", "// expect: a result",
  `test("${title}", () => {});`, "",
].join("\n");
const withoutLevel = (id, title) => [`// ${id}`, "// given: a fixture", "// input: a call", "// expect: a result", `test("${title}", () => {});`, ""].join("\n");

const ALPHA_TESTS = [
  declared("TST-501", { level: "unit", module: "MOD-direct", guards: "ALPHA RULE" }, "alpha holds"),
  declared("TST-502", { level: "unit", module: "MOD-direct", guards: "ALPHA RULE; UC-001" }, "alpha again"),
  declared("TST-503", { level: "release", module: "system", guards: "ALPHA RULE" }, "alpha releases"),
].join("\n");
const BETA_TESTS = [
  declared("TST-504", { level: "component", module: "MOD-other", guards: "BETA RULE" }, "beta flips"),
  declared("TST-505", { level: "unit", module: "MOD-other", guards: "BETA RULE", runs: "5", paid: "Fixture AI" }, "beta asks a model"),
].join("\n");
const ODD_TESTS = [
  declared("TST-506", { level: "unit", module: "MOD-other", guards: "NO SUCH RULE" }, "odd names nothing"),
  declared("TST-509", { level: "unit", module: "MOD-direct", guards: "UC-099" }, "odd names a use case"),
  declared("TST-507", { level: "unit", module: "MOD-other" }, "odd without guards"),
  withoutLevel("TST-508", "odd with nothing"),
].join("\n");

const FILES = {
  "SPEC.md": SPEC,
  "docs/use-cases/UC-001-first.md": doc("UC-001", "First use case", { realises: ["ALPHA RULE"] }),
  "docs/use-cases/UC-002-second.md": doc("UC-002", "Second use case", { realises: ["BETA RULE"] }),
  "docs/architecture/MOD-direct.md": doc("MOD-direct", "Direct module", { folder: "src/direct/", realises: ["ALPHA RULE"] }),
  "docs/architecture/MOD-other.md": doc("MOD-other", "Other module", { folder: "src/other/", realises: ["BETA RULE"] }),
  "docs/tests/counter-proofs/TST-501.md": "---\ntest: TST-501\n---\n",
  "tests/alpha.test.mjs": ALPHA_TESTS,
  "tests/beta.test.mjs": BETA_TESTS,
  "tests/odd.test.mjs": ODD_TESTS,
};
// The tag v2026.1.0 holds one test only.
const TAGGED = { "SPEC.md": SPEC, "tests/alpha.test.mjs": declared("TST-501", { level: "unit", module: "MOD-direct", guards: "ALPHA RULE" }, "alpha holds") };

// A run record in result-record.schema.md's form: front matter, then its ## Outcomes table.
function record(commit, rows) {
  const front = ["---", `commit: ${commit}`, "levels:", "  - unit", "occasion: commit", "participant: ci", "date: 2026-10-07 10:00 UTC", "---"].join("\n");
  const table = ["| Test | Level | Outcome | Runs |", "|---|---|---|---|", ...rows.map((row) => `| ${row.join(" | ")} |`)].join("\n");
  return `${front}\n## Outcomes\n\n${table}\n`;
}
const RESULTS = {
  [`runs/${MAIN}/20261007-1000-commit-aaaa.md`]: record(MAIN, [["TST-501", "unit", "passed", ""], ["TST-502", "unit", "failed", ""], ["TST-503", "release", "passed", ""],
    ["TST-504", "component", "passed", ""], ["TST-505", "unit", "passed", "4 of 5"], ["TST-506", "unit", "passed", ""]]),
  [`runs/${MAIN}/20261007-1005-commit-bbbb.md`]: record(MAIN, [["TST-504", "component", "failed", ""]]),
  // An earlier commit's record: it says 502 passed, which is not the latest commit's outcome.
  [`runs/${OLD}/20261006-1000-commit-cccc.md`]: record(OLD, [["TST-502", "unit", "passed", ""], ["TST-509", "unit", "passed", ""]]),
};

function hostOf(extra = {}) {
  const base = treeHost({ trees: { main: FILES, "v2026.1.0": TAGGED, "test-results": RESULTS }, tags: ["v2026.1.0"], ...extra });
  return { ...base, async readSnapshot(ref) { const snapshot = await base.readSnapshot(ref); return { ...snapshot, commit: COMMITS[ref] ?? ref }; } };
}
const ADDRESS = "https://github.com/acme/product";
async function render(productHost = hostOf(), params = { key: "tests", ref: "main" }) {
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { product: { address: ADDRESS, host: productHost } }, params);
  return target;
}
const withClass = (root, name) => find(root, (node) => String(node.className).split(" ").includes(name));
const textsOf = (root, name) => withClass(root, name).map((node) => node.textContent);
const casesOf = (root) => withClass(root, "tests-case");
const lineOf = (node) => [textsOf(node, "tests-id")[0], textsOf(node, "tests-title")[0], textsOf(node, "tests-outcome")[0]];
const idsOf = (root) => casesOf(root).map((node) => textsOf(node, "tests-id")[0]);
const groups = (root) => withClass(root, "tests-group");
const groupNamed = (root, name) => groups(root).find((group) => textsOf(group, "tests-group-name")[0] === name);
const levelsOf = (group) => textsOf(group, "tests-level");
async function set(target, className, value) {
  const select = withClass(target, className)[0];
  select.value = value;
  select.dispatchEvent(new Event("change"));
  await until(() => select.value === value);
  await new Promise((resolve) => setTimeout(resolve, 20));
}
const grouped = async (by) => { const target = await render(); await set(target, "tests-grouping", by); return target; };

// TST-766001 · level: component · module: MOD-trace-pages
// guards: UC-029; EVERY TEST HAS ONE LEVEL; THE TRACEABILITY MATRIX IS DERIVED
// given: the fixture product at main, whose latest commit has two run records (502 failed, 504 passed in one and failed in the other, 505 passed "4 of 5") and an earlier commit's record that says 502 passed
// input: Route.render with the key "tests" at main
// expect: the groups unit, component, release (no system, no user test); unit holds the files alpha, beta, odd in that order; each case shows its identifier, its title and its outcome on the latest commit alone: 501 passed, 502 failed, 505 "passed (4 of 5)", 506 passed, 509 not run, 504 flaky, 503 passed; the Incomplete tests are not in the tree
test("the tests page is a tree by level, test file and test case, each test with its identifier, title and outcome on the latest commit", async () => {
  const target = await render();
  assert.deepEqual(textsOf(target, "tests-group-name"), ["unit", "component", "release"]);
  const unit = groupNamed(target, "unit");
  assert.deepEqual(textsOf(unit, "tests-file-name"), ["tests/alpha.test.mjs", "tests/beta.test.mjs", "tests/odd.test.mjs"]);
  assert.deepEqual(casesOf(unit).map(lineOf), [["TST-501", "alpha holds", "passed"], ["TST-502", "alpha again", "failed"],
    ["TST-505", "beta asks a model", "passed (4 of 5)"], ["TST-506", "odd names nothing", "passed"], ["TST-509", "odd names a use case", "not run"]]);
  assert.deepEqual(casesOf(groupNamed(target, "component")).map(lineOf), [["TST-504", "beta flips", "flaky"]]);
  assert.deepEqual(casesOf(groupNamed(target, "release")).map(lineOf), [["TST-503", "alpha releases", "passed"]]);
  assert.deepEqual(idsOf(withClass(target, "tests-incomplete")[0]), ["TST-507", "TST-508"]);
  assert.equal(idsOf(target).filter((id) => id === "TST-507").length, 1, "an incomplete test is listed once, under Incomplete");
});

// TST-766002 · level: component · module: MOD-trace-pages
// guards: UC-029; THE TRACEABILITY MATRIX IS DERIVED; UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
// given: the fixture; ALPHA RULE is guarded by 501 and 502 (unit) and 503 (release), BETA RULE by 504 (component) and 505 (unit), GAMMA RULE by none, NO SUCH RULE by 506
// input: the grouping "requirement" is chosen
// expect: the groups ALPHA RULE, BETA RULE, GAMMA RULE (the SPEC's order), NO SUCH RULE; each lists all five levels as `<level>: <n>` or `<level>: empty`; ALPHA RULE: unit 2, release 1 and the others empty; GAMMA RULE every level empty and no case; the cases of ALPHA RULE are 501, 502, 503
test("grouped by requirement, each group shows the levels that guard it and a missing level as empty", async () => {
  const target = await grouped("requirement");
  assert.deepEqual(textsOf(target, "tests-group-name"), ["ALPHA RULE", "BETA RULE", "GAMMA RULE", "NO SUCH RULE"]);
  assert.deepEqual(levelsOf(groupNamed(target, "ALPHA RULE")), ["unit: 2", "component: empty", "system: empty", "release: 1", "user: empty"]);
  assert.deepEqual(idsOf(groupNamed(target, "ALPHA RULE")), ["TST-501", "TST-502", "TST-503"]);
  assert.deepEqual(levelsOf(groupNamed(target, "BETA RULE")), ["unit: 1", "component: 1", "system: empty", "release: empty", "user: empty"]);
  assert.deepEqual(levelsOf(groupNamed(target, "GAMMA RULE")), ["unit: empty", "component: empty", "system: empty", "release: empty", "user: empty"]);
  assert.deepEqual(idsOf(groupNamed(target, "GAMMA RULE")), []);
});

// TST-766003 · level: component · module: MOD-trace-pages
// guards: UC-029; THE TRACEABILITY MATRIX IS DERIVED
// given: the fixture; UC-001 is guarded by 502 (unit), UC-002 by none, UC-099 (no such use case) by 509
// input: the grouping "use case" is chosen
// expect: the groups UC-001, UC-002, UC-099 in that order; UC-001: unit 1 and the other levels empty, its case 502; UC-002 every level empty
test("grouped by use case, a use case nothing guards is shown with every level empty", async () => {
  const target = await grouped("use case");
  assert.deepEqual(textsOf(target, "tests-group-name"), ["UC-001", "UC-002", "UC-099"]);
  assert.deepEqual(levelsOf(groupNamed(target, "UC-001")), ["unit: 1", "component: empty", "system: empty", "release: empty", "user: empty"]);
  assert.deepEqual(idsOf(groupNamed(target, "UC-001")), ["TST-502"]);
  assert.deepEqual(levelsOf(groupNamed(target, "UC-002")), ["unit: empty", "component: empty", "system: empty", "release: empty", "user: empty"]);
});

// TST-766004 · level: component · module: MOD-trace-pages
// guards: UC-029; THE TRACEABILITY MATRIX IS DERIVED
// given: the fixture; MOD-direct is the module of 501, 502 and 509 (unit); MOD-other of 504 (component), 505 and 506 (unit); 503 names `system`; 507 and 508 are incomplete
// input: the grouping "module" is chosen
// expect: the groups MOD-direct, MOD-other, system; MOD-direct: unit 3, the others empty; MOD-other: unit 2, component 1; system: release 1, its case 503; the Incomplete tests are in no group
test("grouped by module, the modules in their order and then system", async () => {
  const target = await grouped("module");
  assert.deepEqual(textsOf(target, "tests-group-name"), ["MOD-direct", "MOD-other", "system"]);
  assert.deepEqual(levelsOf(groupNamed(target, "MOD-direct")), ["unit: 3", "component: empty", "system: empty", "release: empty", "user: empty"]);
  assert.deepEqual(levelsOf(groupNamed(target, "MOD-other")), ["unit: 2", "component: 1", "system: empty", "release: empty", "user: empty"]);
  assert.deepEqual(levelsOf(groupNamed(target, "system")), ["unit: empty", "component: empty", "system: empty", "release: 1", "user: empty"]);
  assert.deepEqual(idsOf(groupNamed(target, "system")), ["TST-503"]);
  assert.equal(groups(target).flatMap((group) => idsOf(group)).includes("TST-507"), false);
});

// TST-766005 · level: component · module: MOD-trace-pages
// guards: UC-029
// given: the fixture; outcomes failed: 502; flaky: 504; not run: 509, 507, 508; runs declared: 505; paid declared: 505; no docs/tests/counter-proofs/<TST>.md: every test but 501; guards nothing: 507, 508
// input: each filter of the select `tests-filter` is chosen in turn, from `all`; known positive first: `all` shows all nine
// expect: the test cases shown, in the order of the tree and then Incomplete: all: 501 502 505 506 509 504 503 507 508; failed: 502; flaky: 504; not run: 509 507 508; model-dependent: 505; calls a paid service: 505; without counter-proof: every case but 501; guards nothing: 507 508
test("each filter keeps the tests that are failed, flaky, not run, model-dependent, paid, without counter-proof or guard nothing", async () => {
  const target = await render();
  const every = ["TST-501", "TST-502", "TST-505", "TST-506", "TST-509", "TST-504", "TST-503", "TST-507", "TST-508"];
  assert.deepEqual(idsOf(target), every);
  const expected = [["failed", ["TST-502"]], ["flaky", ["TST-504"]], ["not run", ["TST-509", "TST-507", "TST-508"]], ["model-dependent", ["TST-505"]],
    ["calls a paid service", ["TST-505"]], ["without counter-proof", every.filter((id) => id !== "TST-501")], ["guards nothing", ["TST-507", "TST-508"]], ["all", every]];
  for (const [filter, ids] of expected) {
    await set(target, "tests-filter", filter);
    assert.deepEqual(idsOf(target), ids, filter);
  }
});

// TST-766006 · level: component · module: MOD-trace-pages
// guards: UC-029; EVERY TEST HAS ONE LEVEL
// given: the fixture; 507 declares a level and a module and guards nothing, 508 declares an identifier and nothing else
// input: Route.render at main
// expect: one Incomplete group with 507 (missing: guards) and 508 (missing: level, guards); the page still shows the complete tests
test("a test whose declaration lacks its level or guards is listed under Incomplete with what is missing", async () => {
  const target = await render();
  const [incomplete] = withClass(target, "tests-incomplete");
  assert.deepEqual(casesOf(incomplete).map((node) => [textsOf(node, "tests-id")[0], textsOf(node, "tests-missing")[0]]), [["TST-507", "guards"], ["TST-508", "level, guards"]]);
  assert.equal(withClass(target, "tests-incomplete").length, 1);
  assert.ok(idsOf(target).includes("TST-501"));
});

// TST-766007 · level: component · module: MOD-trace-pages
// guards: UC-029; UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
// given: the fixture; 506 guards NO SUCH RULE, which the SPEC does not hold, and 509 guards UC-099, which no use case file holds; 501 guards ALPHA RULE, which exists
// input: the groupings "requirement" and "use case"; known positive: ALPHA RULE and UC-001 are not marked
// expect: the group NO SUCH RULE is marked broken (class tests-broken) and holds 506; the group UC-099 is marked broken and holds 509; the groups ALPHA RULE and UC-001 are not marked; in the level tree 506 stays in unit
test("a guarded name that matches nothing is a broken link, and the test stays in its group", async () => {
  const requirement = await grouped("requirement");
  const broken = (target) => withClass(target, "tests-broken").map((node) => node.textContent);
  assert.deepEqual(broken(requirement), ["NO SUCH RULE"]);
  assert.deepEqual(idsOf(groupNamed(requirement, "NO SUCH RULE")), ["TST-506"]);
  const useCase = await grouped("use case");
  assert.deepEqual(broken(useCase), ["UC-099"]);
  assert.deepEqual(idsOf(groupNamed(useCase, "UC-099")), ["TST-509"]);
  const tree = await render();
  assert.ok(idsOf(groupNamed(tree, "unit")).includes("TST-506"));
});

// TST-766008 · level: component · module: MOD-trace-pages
// guards: UC-029; THE BROWSER SHOWS ANY RELEASED VERSION
// given: the fixture and its tag v2026.1.0, whose commit has no run record and which holds the test 501 alone; the version choice offers main and the tag
// input: v2026.1.0 is chosen
// expect: the page shows one case, 501, with the outcome "not run" (no record of that commit; the records of main do not count) and says "as of v2026.1.0"; choosing main again shows 501 as passed among nine cases
test("a tag shows its tests with their outcomes on the tag's commit", async () => {
  const target = await render();
  const select = find(target, (node) => node.localName === "select" && node.getAttribute("aria-label") === "Version")[0];
  select.value = "v2026.1.0";
  select.dispatchEvent(new Event("change"));
  await until(() => idsOf(target).length === 1);
  assert.deepEqual(casesOf(target).map(lineOf), [["TST-501", "alpha holds", "not run"]]);
  assert.deepEqual(textsOf(target, "version-as-of"), ["as of v2026.1.0"]);
  select.value = "main";
  select.dispatchEvent(new Event("change"));
  await until(() => idsOf(target).length === 9);
  assert.equal(casesOf(target).map(lineOf)[0][2], "passed");
});

// TST-766009 · level: component · module: MOD-trace-pages
// guards: UC-029
// given: a product whose host answers the first read of any version with NotFound, as GitHub does for a private repository the token does not reach
// input: Route.render with the key "tests" at main; known positive: the same render against the fixture draws nine cases
// expect: the render rejects with that NotFound, for the frame's readProblem to name the missing token, and the target holds no test case, group or filter
test("a private repository no token reaches is left to the frame to say, and no test is drawn", async () => {
  assert.equal(idsOf(await render()).length, 9);
  const refused = { async readSnapshot() { throw new HostError("NotFound", {}, "Not Found"); }, async listTags() { return []; },
    async repositoryInfo() { return { defaultBranch: "main", visibility: "private", canWrite: false, archived: false, description: "" }; } };
  const target = document.createElement("div");
  await assert.rejects(route.render(target, { product: { address: ADDRESS, host: refused } }, { key: "tests", ref: "main" }), (error) => error.name === "NotFound");
  assert.equal(casesOf(target).length + groups(target).length + withClass(target, "tests-filter").length, 0);
});
