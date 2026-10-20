// MOD-trace-pages' public route drawn for the modules view's table, gaps and row pages (ITM-721), as UC-025 steps 3, 4 and 6 and the accepted text of docs/architecture/MOD-trace-pages.md state it: "modules | branch |
// table of modules: subsystem, the requirements its tests guard with their statuses, its file, code, tests; and every gap | the module's file and folder | component diagram: …", through MOD-trace-graph's `moduleRows`.
// Run: node --test tests/trace-pages-modules-table.test.mjs
//
// Module: MOD-trace-pages
// Guards: UC-025; MODULE GAPS ARE REPORTED, NOT FORBIDDEN; THE TRACEABILITY MATRIX IS DERIVED
// Level: component
//
// The route is called through its public Route.render with a Host/Snapshot-shaped fake that holds the files of a small product (tests/trace-pages-harness.mjs); Mermaid is a recorder. The expected texts are written
// in each case; none is read from a document. Readings the cases take, which the pull request names:
//   - The table is <section class="modules-table"> with a <tr class="module-row" data-module> for each module of `moduleRows`, in its order, whose cells are <td class="module-subsystem"> (the subsystem decision, with the review
//     status of its file), <td class="module-realises"> (an <li> for each requirement the row names, "<name> — in SPEC" or "<name> — not in the SPEC"), <td class="module-file"> (the path of its file and the review status
//     of that file: open, accepted or changed since acceptance), <td class="module-code"> (an <li> for each code file) and <td class="module-tests"> (an <li> for each test).
//   - The gaps are <section class="modules-gaps"> with an <li class="module-gap" data-kind> for each gap, its artifact and what is missing; where there is none, a <p class="no-gaps"> "There are no gaps at <version>."
//   - A row opens at the click on <button class="module-name"> in its first cell: the <tr class="module-opened"> that follows it, empty until then, holds the module's file as it reads in the version (rendered),
//     <p class="module-folder"> "Folder: <folder>" and an <li> for each code file of the folder; a second click empties it again.
//   - The component diagram stays above the table, drawn as before.
// Each case states its input and its expected result before it runs (given / input / expect). The counter-proofs are run as mutations and recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { doc, document, find, treeHost } from "./trace-pages-harness.mjs";

const { view } = await import("../src/trace-pages/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "trace");

const SPEC = ["# Modules fixture — Specification", "", "## Only section", "", "**ALPHA RULE** *(Vibe Coding)*", "Alpha rule.", "*Check:* at review.", "",
  "**BETA RULE** *(Vibe Coding)*", "Beta rule.", "*Check:* at review.", ""].join("\n");
const TST = (n, module, guards) => ["// TST-" + n, "// level: unit", "// module: " + module, "// guards: " + guards, ""].join("\n");
const FILES = {
  "SPEC.md": SPEC,
  "docs/architecture/ARC-001-the-whole.md": doc("ARC-001", "The whole", { forced_by: ["ALPHA RULE"], designs: ["MOD-page", "MOD-review"] }),
  "docs/architecture/MOD-page.md": doc("MOD-page", "Renders the dashboard", { folder: "src/page/", realises: ["ALPHA RULE", "GONE RULE"], follows: ["ARC-001"], uses: ["MOD-review.status"] }, "Renders it."),
  "docs/architecture/MOD-review.md": doc("MOD-review", "Derives the status", { folder: "src/review/", realises: ["BETA RULE"], follows: ["ARC-001"], provides: ["status"] }),
  "src/page/index.mjs": 'import { status } from "../review/index.mjs";\nexport const page = status;\n',
  "src/page/extra.mjs": "export const extra = 1;\n",
  "src/review/index.mjs": 'import { page } from "../page/index.mjs";\nexport const status = page;\n',
  "tests/page.test.mjs": TST("1", "MOD-page", "ALPHA RULE"),
};
const CLEAN = {
  "SPEC.md": SPEC.split("\n\n**BETA RULE**")[0] + "\n",
  "docs/architecture/ARC-001-the-whole.md": doc("ARC-001", "The whole", { forced_by: ["ALPHA RULE"], designs: ["MOD-page"] }),
  "docs/architecture/MOD-page.md": doc("MOD-page", "Renders the dashboard", { folder: "src/page/", realises: ["ALPHA RULE"], follows: ["ARC-001"] }),
  "src/page/index.mjs": "export const page = 1;\n", "tests/page.test.mjs": TST("1", "MOD-page", "ALPHA RULE"),
};
const ADDRESS = "https://github.com/acme/library";
const params = { key: "modules", ref: "main" };
const hostOf = (files = FILES, extra = {}) => treeHost({ trees: { main: files }, tags: [], ...extra });

function recorder() {
  globalThis.mermaid = { initialize() {}, mermaidAPI: { getDiagramFromText: async () => ({ db: { getVertices: () => ({}) } }) }, run: async () => {} };
}
async function render(productHost, given = params) {
  recorder();
  const target = document.createElement("div");
  document.body.append(target);
  try {
    await route.render(target, { product: { address: ADDRESS, host: productHost } }, given);
  } finally {
    delete globalThis.mermaid;
  }
  return target;
}
const byClass = (root, name, className) => find(root, (node) => node.localName === name && node.className.split(" ").includes(className));
const rowOf = (target, id) => byClass(target, "tr", "module-row").find((row) => row.getAttribute("data-module") === id);
const cell = (row, className) => byClass(row, "td", className)[0];
const items = (node) => find(node, (each) => each.localName === "li").map((each) => each.textContent);

// TST-072101 · level: component · module: MOD-trace-pages
// guards: UC-025 (steps 3); MODULE GAPS ARE REPORTED, NOT FORBIDDEN
// given: the fixture product at main: MOD-page (follows ARC-001, realises ALPHA RULE and GONE RULE, which the SPEC does not hold, has two code files and one test, and its file is open) and MOD-review (follows ARC-001, realises BETA RULE, has one code file and no test)
// input: Route.render with the key "modules" at main
// expect: one row for each module, MOD-page first; MOD-page's subsystem ARC-001, its requirements "ALPHA RULE — in SPEC" and "GONE RULE — not in the SPEC", its file docs/architecture/MOD-page.md with the status open, its code
//   src/page/extra.mjs and src/page/index.mjs, its tests TST-1; MOD-review's tests none
test("the modules view shows a table with a row for each module: subsystem, requirements with their statuses, file, code and tests", async () => {
  const target = await render(hostOf());
  const rows = byClass(target, "tr", "module-row");
  assert.deepEqual(rows.map((row) => row.getAttribute("data-module")), ["MOD-page", "MOD-review"]);
  const page = rowOf(target, "MOD-page");
  assert.match(cell(page, "module-subsystem").textContent, /ARC-001/);
  assert.deepEqual(items(cell(page, "module-realises")), ["ALPHA RULE — in SPEC", "GONE RULE — not in the SPEC"]);
  assert.match(cell(page, "module-file").textContent, /docs\/architecture\/MOD-page\.md/);
  assert.match(cell(page, "module-file").textContent, /open/);
  assert.deepEqual(items(cell(page, "module-code")), ["src/page/extra.mjs", "src/page/index.mjs"]);
  assert.deepEqual(items(cell(page, "module-tests")), ["TST-1"]);
  assert.deepEqual(items(cell(rowOf(target, "MOD-review"), "module-tests")), []);
});

// TST-072102 · level: component · module: MOD-trace-pages
// guards: UC-025 (step 4, 4a); MODULE GAPS ARE REPORTED, NOT FORBIDDEN
// given: the fixture product, in which MOD-review has no test, the two modules import each other and MOD-review's file names no use of MOD-page, and a clean product with one module that has its code, its test and no gap
// input: Route.render with the key "modules" at main, for each
// expect: the first lists every gap with its artifact and what is missing, among them "module-without-test" for MOD-review and "import-not-in-uses" for src/review/index.mjs; the clean product says "There are no gaps at main." and lists none
test("the modules view lists every gap, and says so when there is none", async () => {
  const target = await render(hostOf());
  const gaps = byClass(target, "li", "module-gap");
  assert.ok(gaps.length >= 2, "gaps are listed");
  const kinds = new Map(gaps.map((gap) => [gap.getAttribute("data-kind"), gap.textContent]));
  assert.match(kinds.get("module-without-test"), /MOD-review/);
  assert.match(kinds.get("import-not-in-uses"), /src\/review\/index\.mjs/);
  assert.equal(byClass(target, "p", "no-gaps").length, 0);
  const clean = await render(hostOf(CLEAN));
  assert.equal(byClass(clean, "li", "module-gap").length, 0);
  assert.equal(byClass(clean, "p", "no-gaps")[0].textContent, "There are no gaps at main.");
});

// TST-072103 · level: component · module: MOD-trace-pages
// guards: UC-025 (step 6)
// given: the fixture product, drawn at main
// input: a click on MOD-page's name, then on it again
// expect: before the click the row below MOD-page's is empty; after it it holds the text of the file as it reads in the version ("Renders it."), "Folder: src/page/" and its code files; after the second click it is empty again
test("a click on a module opens its file and its folder in a row below it, and a second click closes it", async () => {
  const target = await render(hostOf());
  const openedRows = () => byClass(target, "tr", "module-opened");
  assert.equal(openedRows().length, 2, "known positive: a row below each module");
  assert.deepEqual(openedRows().map((row) => row.textContent), ["", ""]);
  const name = byClass(rowOf(target, "MOD-page"), "button", "module-name")[0];
  name.dispatchEvent(new Event("click"));
  await new Promise((resolve) => setTimeout(resolve, 20));
  const opened = openedRows()[0];
  assert.match(opened.textContent, /Renders it\./);
  assert.equal(byClass(opened, "p", "module-folder")[0].textContent, "Folder: src/page/");
  assert.deepEqual(items(opened).filter((text) => text.startsWith("src/")), ["src/page/extra.mjs", "src/page/index.mjs"]);
  name.dispatchEvent(new Event("click"));
  assert.equal(openedRows()[0].textContent, "");
});

// TST-072104 · level: component · module: MOD-trace-pages
// guards: UC-025; A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: one Host for main, whose snapshots count every readMany
// input: the modules view rendered at main
// expect: the graph is read once: readMany is told the paths of the graph (the module files, the code files and the test files among them) in one batch, and not again for the table, the gaps or the diagram
test("the modules view reads the graph in one batch for its diagram, its table and its gaps", async () => {
  const productHost = hostOf();
  await render(productHost);
  assert.equal(productHost.log.manys.length, 1);
  const told = new Set(productHost.log.manys[0]);
  for (const path of ["docs/architecture/MOD-page.md", "src/page/index.mjs", "tests/page.test.mjs"]) assert.ok(told.has(path), `${path} is read in the batch`);
});
