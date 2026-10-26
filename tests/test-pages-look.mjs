// The checks of the look of MOD-test-pages' Tests routes (ITM-1223), shared by the tests of the routes schedule, runs and generate: each route draws the
// frame's head — its heading and, under it, the Tests entry's five views as the frame's buttons in the order Schedule, Browser, Runs, Audit, Generate, the one shown
// marked —; its rows of items are rows of the frame's table (table.list) whose cells carry data-label; its buttons carry the frame's class btn.
// It is code only; the expected results stand in the tests that call it, which hand them in.
//
// Module: MOD-test-pages
// Level: unit

import assert from "node:assert/strict";

export const VIEWS = ["Schedule", "Browser", "Runs", "Audit", "Generate"];

export function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child.nodeType === 1) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const classes = (node) => (node.className ?? "").split(" ").filter(Boolean);
const text = (node) => node.textContent.replace(/\s+/g, " ").trim();
const inside = (node, test) => { for (let up = node.parentNode; up; up = up.parentNode) if (test(up)) return true; return false; };

// The head: the first element the route draws is <section class="head"> with an h2 holding `heading`, and under it the navigation Tests (the route
// tests-views): the five views in their order as the frame's buttons, no link among them, exactly the one labelled `shown` marked with aria-current="page".
export function headOf(target) {
  const first = [...target.childNodes].find((node) => node.nodeType === 1);
  assert.ok(first, "the route draws something");
  assert.equal(first.localName, "section", "the head is the route's first part");
  assert.ok(classes(first).includes("head"), "the first part is section.head");
  return first;
}
export function assertTestsHead(target, { heading, shown }) {
  const head = headOf(target);
  const titles = descendants(head, (node) => node.localName === "h2");
  assert.equal(titles.length, 1, "one heading");
  assert.match(text(titles[0]), heading);
  const navs = descendants(head, (node) => node.localName === "nav" && node.getAttribute("aria-label") === "Tests");
  assert.equal(navs.length, 1, "the navigation Tests under the heading");
  const links = descendants(navs[0], (node) => node.localName === "button");
  assert.deepEqual(links.map(text), VIEWS, "the five views in their order");
  assert.equal(descendants(navs[0], (node) => node.localName === "a").length, 0, "no link of its own: the frame writes the address");
  assert.deepEqual(links.filter((link) => link.getAttribute("aria-current") === "page").map(text), [shown], "the one shown is marked");
  for (const link of links) assert.ok(classes(link).includes("btn"), `${text(link)} is drawn as the frame's button`);
  return links;
}

// Every row of a table the route draws is a row of the frame's table (class list), and every cell of it carries data-label; `atLeast` rows exist.
export function assertListRows(target, atLeast = 1) {
  const rows = descendants(target, (node) => node.localName === "tr" && descendants(node, (cell) => cell.localName === "td").length > 0);
  assert.ok(rows.length >= atLeast, `known positive: at least ${atLeast} rows of items`);
  for (const row of rows) {
    assert.ok(inside(row, (up) => up.localName === "table" && classes(up).includes("list")), `the row ${text(row).slice(0, 40)} stands in table.list`);
    for (const cell of descendants(row, (node) => node.localName === "td")) {
      assert.ok((cell.getAttribute("data-label") ?? "") !== "", `a cell of ${text(row).slice(0, 40)} carries data-label`);
    }
  }
  return rows;
}

// Every button the route draws carries the frame's class btn.
export function assertButtons(target, atLeast = 1) {
  const buttons = descendants(target, (node) => node.localName === "button");
  assert.ok(buttons.length >= atLeast, `known positive: at least ${atLeast} buttons`);
  for (const button of buttons) assert.ok(classes(button).includes("btn"), `the button ${text(button)} carries btn`);
  return buttons;
}

// Every section the route draws under its head is a panel of the frame.
export function assertPanels(target, atLeast = 1) {
  const head = headOf(target);
  const sections = [...target.childNodes].filter((node) => node.nodeType === 1 && node !== head && node.localName === "section");
  assert.ok(sections.length >= atLeast, `known positive: at least ${atLeast} sections`);
  for (const section of sections) assert.ok(classes(section).includes("panel"), `the section ${text(section).slice(0, 40)} is a panel`);
  return sections;
}
