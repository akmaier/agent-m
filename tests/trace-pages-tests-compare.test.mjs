// MOD-trace-pages' tests view compares two releases (ITM-769), as UC-029 step 6 states it: "The reviewer picks two releases to compare: tests added, removed, changed in what they guard or expect, and
// changed in outcome", and as the accepted text of docs/architecture/MOD-trace-pages.md has it for the tests view ("comparing two releases"), the descriptor's versions letting "a second version" compare.
//
// Run: node --test tests/trace-pages-tests-compare.test.mjs
//
// Module: MOD-trace-pages
// Guards: UC-029; THE TRACEABILITY MATRIX IS DERIVED; THE NAME IS THE ID AND IT SURVIVES
// Level: unit
//
// The route is called through its public Route.render with the key "tests" and a Host of the test's own (tests/trace-pages-harness.mjs) that holds the files of two release tags and the branch `test-results`
// with a run record for each tagged commit. The fixture: TST-701 unchanged; TST-702 only in the older release; TST-703 only in the newer; TST-704 whose guards change; TST-705 whose expected result changes;
// TST-706 whose outcome changes; TST-707, a model-dependent test whose runs change with its outcome. The expected values are written in each case; none is read from a document. Readings the cases take where the
// texts leave one open, each named in the pull request:
//   - the control is the select `tests-compare-with` in the bar of the tests page, offered when the version shown is a release tag and another tag exists, with "none" first and the other tags after it;
//     the param `compare` names the second release a page is drawn with;
//   - the older release is the one that comes later in the list of tags (newest first), whichever of the two is shown, so that "added" is what the newer release holds and the older does not;
//   - the result is the section `tests-compare` with four sections, `tests-compare-added`, `tests-compare-removed`, `tests-compare-changed` (guards or expected result) and `tests-compare-outcome`, each a list of
//     items `tests-compared` that begin with the identifier (`tests-compared-id`) and, for a change, say it (`tests-compared-change`: "<what>: <before> → <after>"); a test changed in both ways is in both lists;
//   - the outcome of a test is compared as the tests page shows it, with the runs of a model-dependent test; a test that holds no record at a release is "not run" there;
//   - a second release that cannot be read is said in a line `traces-problem` and no list is drawn.
// Each case states its input and its expected result before it runs (given / input / expect). The counter-proofs are run as mutations and recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { document, find, treeHost, until } from "./trace-pages-harness.mjs";

const { view } = await import("../src/trace-pages/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "trace");

const MAIN = "a".repeat(40), OLD = "1".repeat(40), NEW = "2".repeat(40);
const COMMITS = { main: MAIN, "v2026.1.0": OLD, "v2026.2.0": NEW };
const SPEC = ["# Compare fixture — Specification", "", "## Only section", "",
  "**ALPHA RULE** *(Vibe Coding)*", "Alpha rule.", "*Check:* at review.", "",
  "**BETA RULE** *(Vibe Coding)*", "Beta rule.", "*Check:* at review.", ""].join("\n");

const declared = (id, { level = "unit", guards = "ALPHA RULE", expect = "a result", runs = null }, title) => [
  `// ${id} · level: ${level} · module: system`, `// guards: ${guards}`, ...(runs ? [`// runs: ${runs}`, "// phrasings: 2"] : []),
  "// given: a fixture", "// input: a call", `// expect: ${expect}`, `test("${title}", () => {});`, ""].join("\n");
const file = (...tests) => ({ "SPEC.md": SPEC, "tests/all.test.mjs": tests.join("\n") });

const OLDER = file(
  declared("TST-701", {}, "unchanged"),
  declared("TST-702", {}, "removed later"),
  declared("TST-704", { guards: "ALPHA RULE" }, "guards change"),
  declared("TST-705", { expect: "a result" }, "expectation changes"),
  declared("TST-706", {}, "outcome changes"),
  declared("TST-707", { runs: "5" }, "model rate changes"));
const NEWER = file(
  declared("TST-701", {}, "unchanged"),
  declared("TST-703", {}, "added since"),
  declared("TST-704", { guards: "ALPHA RULE; BETA RULE" }, "guards change"),
  declared("TST-705", { expect: "another result" }, "expectation changes"),
  declared("TST-706", {}, "outcome changes"),
  declared("TST-707", { runs: "5" }, "model rate changes"));

function record(commit, rows) {
  const front = ["---", `commit: ${commit}`, "levels:", "  - unit", "occasion: commit", "participant: ci", "date: 2026-10-07 10:00 UTC", "---"].join("\n");
  const table = ["| Test | Level | Outcome | Runs |", "|---|---|---|---|", ...rows.map((row) => `| ${row.join(" | ")} |`)].join("\n");
  return `${front}\n## Outcomes\n\n${table}\n`;
}
const RESULTS = {
  [`runs/${OLD}/20260101-1000-commit-aaaa.md`]: record(OLD, [["TST-701", "unit", "passed", ""], ["TST-702", "unit", "passed", ""], ["TST-704", "unit", "passed", ""], ["TST-705", "unit", "passed", ""],
    ["TST-706", "unit", "passed", ""], ["TST-707", "unit", "passed", "3 of 5"]]),
  [`runs/${NEW}/20260201-1000-commit-bbbb.md`]: record(NEW, [["TST-701", "unit", "passed", ""], ["TST-703", "unit", "passed", ""], ["TST-704", "unit", "passed", ""], ["TST-705", "unit", "passed", ""],
    ["TST-706", "unit", "failed", ""], ["TST-707", "unit", "passed", "4 of 5"]]),
};

function hostOf({ broken = () => false, tags = ["v2026.1.0", "v2026.2.0"] } = {}) {
  const base = treeHost({ trees: { main: NEWER, "v2026.1.0": OLDER, "v2026.2.0": NEWER, "test-results": RESULTS }, tags });
  return { ...base, async readSnapshot(ref) {
    if (broken(ref)) throw Object.assign(new Error("unreachable"), { name: "Unreachable" });
    return { ...(await base.readSnapshot(ref)), commit: COMMITS[ref] ?? ref };
  } };
}
async function render(productHost, params) {
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { product: { address: "https://github.com/acme/product", host: productHost } }, { key: "tests", ref: "v2026.2.0", ...params });
  return target;
}
const withClass = (root, name) => find(root, (node) => String(node.className).split(" ").includes(name));
const compareWith = (target) => withClass(target, "tests-compare-with")[0];
const idsIn = (target, section) => withClass(withClass(target, section)[0] ?? target, "tests-compared-id").map((node) => node.textContent);
const CLASSES = ["tests-compare-added", "tests-compare-removed", "tests-compare-changed", "tests-compare-outcome"];
const classesOf = (target) => CLASSES.map((section) => idsIn(target, section));
async function choose(target, value) {
  const select = compareWith(target);
  select.value = value;
  select.dispatchEvent(new Event("change"));
  await until(() => (value === "none" ? withClass(target, "tests-compare").length === 0 : withClass(target, "tests-compare").length > 0));
}

// TST-769001 · level: unit · module: MOD-trace-pages
// guards: UC-029; THE TRACEABILITY MATRIX IS DERIVED
// given: the two releases v2026.1.0 and v2026.2.0 of the fixture, the newer shown
// input: the second release v2026.1.0 chosen in the control "compare with"
// expect: added: TST-703; removed: TST-702; changed in what they guard or expect: TST-704 and TST-705; changed in outcome: TST-706 and TST-707; the unchanged TST-701 in none of the four
test("two releases are compared: one test of each class is listed in its class, and an unchanged test in none", async () => {
  const target = await render(hostOf());
  assert.equal(withClass(target, "tests-compare").length, 0, "known positive: nothing is compared until a second release is chosen");
  await choose(target, "v2026.1.0");
  assert.deepEqual(classesOf(target), [["TST-703"], ["TST-702"], ["TST-704", "TST-705"], ["TST-706", "TST-707"]]);
  assert.ok(!classesOf(target).flat().includes("TST-701"));
});

// TST-769002 · level: unit · module: MOD-trace-pages
// guards: UC-029
// given: the same two releases, the older shown
// input: the newer release chosen as the second
// expect: the same four lists as with the newer shown, the added test being the one the newer release holds
test("the older release is the same whichever of the two is shown", async () => {
  const target = await render(hostOf(), { ref: "v2026.1.0" });
  await choose(target, "v2026.2.0");
  assert.deepEqual(classesOf(target), [["TST-703"], ["TST-702"], ["TST-704", "TST-705"], ["TST-706", "TST-707"]]);
});

// TST-769003 · level: unit · module: MOD-trace-pages
// guards: UC-029
// given: the fixture with two tags; with one tag; and the current text of main
// input: the route rendered at v2026.2.0 with both tags; with one tag; at main with both
// expect: the control offers none, v2026.1.0 at the newer release (the shown tag is not offered against itself); no control with one tag; no control at main
test("the control to compare is offered at a release when another release exists", async () => {
  assert.deepEqual(find(compareWith(await render(hostOf())), (node) => node.localName === "option").map((node) => node.textContent), ["none", "v2026.1.0"]);
  assert.equal(compareWith(await render(hostOf({ tags: ["v2026.2.0"] }))), undefined, "one tag: nothing to compare with");
  assert.equal(compareWith(await render(hostOf(), { ref: "main" })), undefined, "the current text is no release");
});

// TST-769004 · level: unit · module: MOD-trace-pages
// guards: UC-029
// given: the fixture
// input: the route rendered with the param compare=v2026.1.0; then the control set to none
// expect: the comparison is drawn with the page, the control holding v2026.1.0; once "none" is chosen it is gone and the tree of the tests is still there
test("the param compare draws the comparison with the page, and none takes it away", async () => {
  const target = await render(hostOf(), { compare: "v2026.1.0" });
  await until(() => withClass(target, "tests-compare").length > 0);
  assert.equal(compareWith(target).value, "v2026.1.0");
  assert.deepEqual(classesOf(target)[0], ["TST-703"]);
  await choose(target, "none");
  assert.equal(withClass(target, "tests-compare").length, 0);
  assert.ok(withClass(target, "tests-case").length > 0, "the tests of the version are still on the page");
});

// TST-769005 · level: unit · module: MOD-trace-pages
// guards: UC-029
// given: the fixture
// input: v2026.1.0 chosen as the second release
// expect: the changes are said: TST-704 "guards: ALPHA RULE → ALPHA RULE; BETA RULE"; TST-705 "expect: a result → another result"; TST-706 "passed → failed"; TST-707 "passed (3 of 5) → passed (4 of 5)"
test("a change says what it was and what it is", async () => {
  const target = await render(hostOf());
  await choose(target, "v2026.1.0");
  const changes = (section) => withClass(withClass(target, section)[0], "tests-compared-change").map((node) => node.textContent);
  assert.deepEqual(changes("tests-compare-changed"), ["guards: ALPHA RULE → ALPHA RULE; BETA RULE", "expect: a result → another result"]);
  assert.deepEqual(changes("tests-compare-outcome"), ["passed → failed", "passed (3 of 5) → passed (4 of 5)"]);
});

// TST-769006 · level: unit · module: MOD-trace-pages
// guards: UC-029
// given: the fixture, in which the snapshot of v2026.1.0 cannot be read once the page is drawn
// input: v2026.1.0 chosen as the second release
// expect: a line "The comparison could not be read: unreachable" and no list of the four classes; the tests of the version shown stay on the page
test("a second release that cannot be read is named and nothing is compared", async () => {
  let down = false;
  const target = await render(hostOf({ broken: (ref) => down && ref === "v2026.1.0" }));
  down = true;
  const select = compareWith(target);
  select.value = "v2026.1.0";
  select.dispatchEvent(new Event("change"));
  await until(() => withClass(target, "traces-problem").some((node) => node.textContent.startsWith("The comparison")));
  assert.equal(withClass(target, "traces-problem").find((node) => node.textContent.startsWith("The comparison")).textContent, "The comparison could not be read: unreachable");
  assert.deepEqual(classesOf(target), [[], [], [], []]);
  assert.ok(withClass(target, "tests-case").length > 0);
});
