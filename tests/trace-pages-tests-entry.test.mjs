// MOD-trace-pages' views `tests` and `audit` belong to the menu entry Tests (ITM-1224): under its head each draws the Tests entry's views as links, in the order
// Schedule, Browser, Runs, Audit, Generate, the one shown marked, through its descriptor's `links`; the audit's descriptor names the entry `tests` ("Tests → Audit",
// UC-030 1); the audit's table is `table.list` with `data-label`, its summary and its filters panels (EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE).
//
// Run: node --test tests/trace-pages-tests-entry.test.mjs
//
// Module: MOD-trace-pages
// Guards: UC-029; UC-030; EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// Level: unit
//
// The route is called through its public Route.render with the key "tests" and with the key "audit", with a Host/Snapshot-shaped fake
// (tests/trace-pages-harness.mjs); the descriptors are read from views.mjs, the module's own file of them (MOD-trace-pages.md, Parts and Data). Every expected text
// is stated in the case; none is read from a document.
// Readings the cases take, each from the sentence quoted:
// - "draw, under their head, the same five links of the Tests entry as ITM-1223's routes — Schedule, Browser, Runs, Audit, Generate —, the one shown marked"
//   (ITM-1224): the page's `section.head` holds its `h2` and, after it, a `nav` named "Tests" whose anchors read Schedule, Browser, Runs, Audit, Generate and lead to
//   `#schedule`, `#trace/key=tests`, `#runs`, `#trace/key=audit` and `#generate` — the addresses ITM-1223 draws on MOD-test-pages' routes; the one shown carries
//   `aria-current="page"`, and no other does.
// - "through the descriptor's `links`" (ITM-1224; MOD-trace-pages.md, Data: `links: (row) -> Link[]`, the routes it leads to): the descriptors of tests and audit
//   give, without a row, the same five links as { text, href }.
// - "its table is `table.list` with `data-label`, its sections panels" (ITM-1224): the audit's `table.audit-table` also carries `list`, every cell of its body names
//   its column in `data-label` (Requirement, Sources, Tests, Gates, Acceptance, Detail), and its summary and its filters carry `panel`.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { document, find, treeHost } from "./trace-pages-harness.mjs";
import { descriptorFor } from "../src/trace-pages/views.mjs";

const { view } = await import("../src/trace-pages/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "trace");

const ADDRESS = "https://github.com/acme/product";
const TAG = "v2026.1.0";
const SPEC = ["# Fixture product — Specification", "", "## Rules", "", "**A FIRST RULE** *(PO A. Maier)*", "The first rule.",
  "*Check:* `tests/unit.test.mjs`", "", "**A SECOND RULE** *(PO A. Maier)*", "The second rule.", "*Check:* no automatic check; at review.", ""].join("\n");
const TESTS = ["// TST-900001 · level: unit · module: MOD-widget", "// guards: A FIRST RULE", "// given: a fixture", "// input: a call", "// expect: a result", ""].join("\n");
const PRODUCT = { "SPEC.md": SPEC, "tests/unit.test.mjs": TESTS };

const ENTRY = [["Schedule", "#schedule"], ["Browser", "#trace/key=tests"], ["Runs", "#runs"], ["Audit", "#trace/key=audit"], ["Generate", "#generate"]];

// The product's host: a tag's commit is the commit of its snapshot, whose trace graph the fake stores.
function productHost() {
  const base = treeHost({ trees: { main: PRODUCT, [TAG]: PRODUCT, "test-results": {} }, tags: [TAG] });
  return { ...base, async listTags() { return [{ name: TAG, commit: base.commitOf(TAG) }]; } };
}
const instanceHost = () => treeHost({ trees: { main: { "SPEC.md": "# Fixture instance — Specification\n" } } });
async function render(params) {
  const target = document.createElement("div");
  document.body.append(target);
  await route.render(target, { product: { address: ADDRESS, host: productHost() }, instance: { host: instanceHost() } }, params);
  return target;
}
const classes = (node) => String(node.className).split(" ");
const withClass = (root, name) => find(root, (node) => classes(node).includes(name));
const head = (root) => find(root, (node) => node.localName === "section" && classes(node).includes("head"))[0];
// The links under the head: the anchors of its nav, as [text, href, marked].
function entryLinks(root) {
  const section = head(root);
  assert.ok(section, "the page draws a section.head");
  const nav = find(section, (node) => node.localName === "nav")[0];
  assert.ok(nav, "the head holds a nav of the Tests entry's views");
  return { nav, section, links: find(nav, (node) => node.localName === "a").map((a) => [a.textContent, a.getAttribute("href"), a.getAttribute("aria-current") === "page"]) };
}
const marked = (shown) => ENTRY.map(([text, href]) => [text, href, text === shown]);

// TST-1224002 · level: unit · module: MOD-trace-pages
// guards: UC-029; UC-030
// given: the descriptors of the trace views
// input: descriptorFor("tests") and descriptorFor("audit"), their `entry` and their `links()`
// expect: both name the entry tests; each links() gives the five links Schedule #schedule, Browser #trace/key=tests, Runs #runs, Audit #trace/key=audit,
//   Generate #generate, in that order
// Planted fault: the audit's descriptor naming the entry releases, or a descriptor without links, fails.
test("TST-1224002 the descriptors of the tests and the audit name the entry tests and give its five links", () => {
  for (const key of ["tests", "audit"]) {
    const descriptor = descriptorFor(key);
    assert.equal(descriptor.entry, "tests", key);
    assert.equal(typeof descriptor.links, "function", `${key} has links`);
    assert.deepEqual(descriptor.links().map((link) => [link.text, link.href]), ENTRY, key);
  }
});

// TST-1224003 · level: unit · module: MOD-trace-pages
// guards: UC-029; EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: a product whose default branch main holds a SPEC and one test file
// input: Route.render with the key "tests" at the ref main
// expect: the section.head holds its h2 Tests and then a nav named Tests with Schedule, Browser, Runs, Audit, Generate linking #schedule, #trace/key=tests, #runs,
//   #trace/key=audit, #generate, Browser alone marked aria-current="page"
// Planted fault: a page without the nav, with Audit marked, or with the links in another order fails.
test("TST-1224003 the tests browser draws the Tests entry's five links under its head, Browser marked", async () => {
  const target = await render({ key: "tests", ref: "main" });
  const { nav, section, links } = entryLinks(target);
  assert.equal(nav.getAttribute("aria-label"), "Tests");
  const kids = section.childNodes.filter((node) => node.nodeType === 1);
  assert.deepEqual([kids[0].localName, kids[0].textContent, kids[1]], ["h2", "Tests", nav], "the h2, then the links");
  assert.deepEqual(links, marked("Browser"));
});

// TST-1224004 · level: unit · module: MOD-trace-pages
// guards: UC-030; EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: the product at the release tag v2026.1.0, the branch test-results empty, the instance's SPEC
// input: Route.render with the key "audit" at the ref v2026.1.0; the same product with no release tag
// expect: the section.head holds its h2 Audit and then the nav of the five links, Audit alone marked; with no release tag the head still draws them
// Planted fault: a page without the nav, or with Browser marked, fails.
test("TST-1224004 the audit draws the Tests entry's five links under its head, Audit marked", async () => {
  const target = await render({ key: "audit", ref: TAG });
  const { section, nav, links } = entryLinks(target);
  const kids = section.childNodes.filter((node) => node.nodeType === 1);
  assert.deepEqual([kids[0].localName, kids[0].textContent, kids[1]], ["h2", "Audit", nav], "the h2, then the links");
  assert.deepEqual(links, marked("Audit"));
  const untagged = document.createElement("div");
  document.body.append(untagged);
  await route.render(untagged, { product: { address: ADDRESS, host: treeHost({ trees: { main: PRODUCT, "test-results": {} }, tags: [] }) },
    instance: { host: instanceHost() } }, { key: "audit", ref: "main" });
  assert.match(untagged.textContent, /No release is tagged yet/);
  assert.deepEqual(entryLinks(untagged).links, marked("Audit"));
});

// TST-1224005 · level: unit · module: MOD-trace-pages
// guards: UC-030; EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: the product at the release tag v2026.1.0 with two requirements
// input: Route.render with the key "audit" at the ref v2026.1.0
// expect: the table audit-table carries list; it has a row for each requirement, and every cell of its body names its column in data-label — Requirement, Sources,
//   Tests, Gates, Acceptance, Detail; the summary audit-summary and the filters audit-filters carry panel
// Planted fault: a table without list, a cell without data-label, or a summary drawn outside a panel fails.
test("TST-1224005 the audit's table is table.list with data-label, its summary and filters panels", async () => {
  const target = await render({ key: "audit", ref: TAG });
  const table = withClass(target, "audit-table")[0];
  assert.ok(table, "the audit draws its table");
  assert.ok(classes(table).includes("list"), `table.list: ${table.className}`);
  const rows = withClass(table, "audit-row");
  assert.equal(rows.length, 2);
  for (const row of rows) {
    const cells = row.childNodes.filter((node) => node.localName === "td");
    assert.deepEqual(cells.map((cell) => cell.getAttribute("data-label")), ["Requirement", "Sources", "Tests", "Gates", "Acceptance", "Detail"], row.getAttribute("data-requirement"));
  }
  for (const name of ["audit-summary", "audit-filters"]) assert.ok(classes(withClass(target, name)[0]).includes("panel"), `${name} is a panel`);
});
