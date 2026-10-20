// MOD-test-pages' route `schedule` counts the tests from the test declarations stored for the commit (ITM-1119), as the accepted text of docs/architecture/MOD-test-pages.md states it:
// "each row with the number of the product's tests it holds — the declarations of its level, and for the row of paid services those that call one —, counted from the test declarations stored for
// the commit shown (MOD-progress-measures' `storedFacts`), or from the test files where none are stored", and `A PAGE LOAD READS THE REPOSITORY IN BATCHES`.
// Run: node --test tests/test-pages-schedule-stored-tests.test.mjs
//
// Module: MOD-test-pages
// Guards: UC-027; A PAGE LOAD READS THE REPOSITORY IN BATCHES; THE TEST SCHEDULE IS DECLARED PER PRODUCT
// Level: unit
//
// The product is a host of this file whose snapshot keeps every call of `read`, `readMany` and `readOn`; the instance's register is the one of tests/test-pages-schedule.test.mjs in short. The product holds 130 test
// files of one declaration each (so that the read in batches of a hundred is seen). Nothing reaches the network. Where the texts leave a reading open, the test states the one it takes, and the pull request names it:
//   - The stored facts are the file `<commit>.facts.json` on `overview-cache` in the form MOD-progress-measures stores (stored.mjs), here with the lists the schedule does not read empty and `tests` holding the
//     declarations of the test files — the shape `storedFacts` reads.
//   - "Read in batches of a hundred" is the snapshot's: the page tells the snapshot every test file with `readMany` before it reads one, and the snapshot fetches them a hundred at a time where its host can.
//   - The count shown is the cell <td class="tests"> of the row.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import "./site-frame-dom.mjs";
import test from "node:test";
import assert from "node:assert/strict";

const { view } = await import("../src/test-pages/index.mjs");
const { testDeclarations } = await import("../src/test-document/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "schedule");

const PRODUCT = "https://github.com/org/product";
const COMMIT = "c".repeat(40);
const ROWS = ["unit", "component", "system", "paid", "release", "user"];
const declaration = (number, level, paid) => ["// TST-" + String(number).padStart(4, "0") + " · level: " + level + " · module: MOD-sample", "// guards: A SAMPLE REQUIREMENT", "// given: g", "// input: i",
  "// expect: e", ...(paid ? ["// paid: " + paid] : []), "test(\"t\", () => {});", ""].join("\n");
// 130 test files: levels by turns, every thirteenth calling a paid service.
const LEVELS = ["unit", "component", "system", "release", "user"];
const FILES = Object.fromEntries(Array.from({ length: 130 }, (_, at) => [`tests/t${String(at).padStart(3, "0")}.test.mjs`, declaration(at + 1, LEVELS[at % 5], at % 13 === 0 ? "the oracle" : null)]));
const EXPECTED = (() => {
  const counts = Object.fromEntries(ROWS.map((row) => [row, 0]));
  for (const [path, text] of Object.entries(FILES)) for (const each of testDeclarations(path, text)) { counts[each.level] += 1; if (each.paid) counts.paid += 1; }
  return counts;
})();

const REGISTER = "# Participants of this instance\n\n**REGISTER**\n\nThe participants.\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n";
const factsText = (commit, extra = {}) => `${JSON.stringify({ format: 1, commit, declaration: null, order: null, items: [], sprints: [], assignments: [], gates: [], modules: [], queues: [], requirements: [],
  tests: Object.entries(FILES).flatMap(([path, text]) => testDeclarations(path, text)), jobs: [], ...extra })}\n`;

// The page, with the product's facts stored as `stored` says (a text, null for none, undefined for a snapshot without readOn); -> { target, calls }.
async function show(stored) {
  const calls = [];
  const snapshot = { commit: COMMIT, paths: Object.keys(FILES), blob: () => "b".repeat(40),
    read: async (path) => { calls.push({ fn: "read", path }); return FILES[path] ?? null; },
    readMany: async (paths) => { calls.push({ fn: "readMany", paths: [...paths] }); },
    ...(stored === undefined ? {} : { readOn: async (branch, path) => { calls.push({ fn: "readOn", branch, path }); return branch === "overview-cache" && path === `${COMMIT}.facts.json` ? stored : null; } }) };
  const productHost = { repositoryInfo: async () => ({ defaultBranch: "main", visibility: "public", canWrite: true }), readSnapshot: async () => snapshot,
    webLinks: () => ({ secrets: `${PRODUCT}/settings/secrets/actions`, actions: `${PRODUCT}/actions`, runners: `${PRODUCT}/settings/actions/runners/new` }),
    listCiRuns: async () => [], ciRunLabels: async () => [] };
  const instanceHost = { repositoryInfo: async () => ({ defaultBranch: "main", visibility: "public", canWrite: true }),
    readSnapshot: async () => ({ commit: "i".repeat(40), paths: ["docs/participants.md"], blob: () => "b".repeat(40), read: async (path) => (path === "docs/participants.md" ? REGISTER : null) }) };
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { page: "main", instance: { repository: "alice/agent-m", host: instanceHost }, store: null, go() {}, product: { address: PRODUCT, kind: "github", host: productHost, tokenStored: true } }, {});
  return { target, calls };
}
const walk = (root, match) => { const found = []; (function visit(node) { for (const kid of node.childNodes ?? []) { if (kid.nodeType === 1) { if (match(kid)) found.push(kid); visit(kid); } } })(root); return found; };
const countsOf = (target) => Object.fromEntries(ROWS.map((row) => [row, Number(walk(walk(target, (node) => node.localName === "tr" && node.getAttribute("data-row") === row)[0], (node) => node.localName === "td" && (node.className ?? "").split(" ").includes("tests"))[0].textContent)]));
const testFilesRead = (calls) => calls.filter((call) => call.fn === "read" && call.path.startsWith("tests/"));

// TST-1119001 · level: unit · module: MOD-test-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-027 (1)
// given: a product of 130 test files whose facts stored for the commit hold their declarations
// input: the route schedule drawn
// expect: the counts of the six rows equal those counted from the files (the row paid 10, the other rows 26 each); no test file is read, and none is told to the snapshot; the facts file was asked for once, as overview-cache / <commit>.facts.json
test("schedule — with the test declarations stored for the commit it reads no test file, and the counts are those of the files", async () => {
  const { target, calls } = await show(factsText(COMMIT));
  assert.deepEqual(countsOf(target), EXPECTED);
  assert.equal(EXPECTED.paid, 10, "known positive: the fixture has paid tests");
  assert.deepEqual(testFilesRead(calls), []);
  assert.deepEqual(calls.filter((call) => call.fn === "readMany" && call.paths.some((path) => path.startsWith("tests/"))), []);
  assert.deepEqual(calls.filter((call) => call.fn === "readOn"), [{ fn: "readOn", branch: "overview-cache", path: `${COMMIT}.facts.json` }]);
});

// TST-1119002 · level: unit · module: MOD-test-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-027 (1)
// given: the same product with no facts stored (readOn gives nothing), with facts of another commit, with facts of another format's number, and a snapshot with no readOn
// input: the route schedule drawn for each
// expect: counter-proof: the counts are the same, taken from the files; all 130 test files are told to the snapshot in one readMany before the first of them is read, so that it fetches them in batches of a hundred; and every file is read
test("schedule — without stored facts the counts are taken from the test files, told to the snapshot first to be read in batches", async () => {
  const cases = [["none stored", null], ["another commit", factsText("d".repeat(40))], ["another format", factsText(COMMIT, { format: 2 })], ["no readOn", undefined]];
  for (const [what, stored] of cases) {
    const { target, calls } = await show(stored);
    assert.deepEqual(countsOf(target), EXPECTED, what);
    const told = calls.findIndex((call) => call.fn === "readMany" && call.paths.length === 130);
    assert.ok(told >= 0, `${what}: the 130 test files are told to the snapshot`);
    assert.equal(calls.findIndex((call) => call.fn === "read" && call.path.startsWith("tests/")) > told, true, `${what}: before the first is read`);
    assert.equal(testFilesRead(calls).length >= 130, true, `${what}: every file is read`);
  }
});
