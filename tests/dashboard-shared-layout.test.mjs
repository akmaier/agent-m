// The dashboard's pages share one layout: #spec and #settings build their buttons and groups from the same classes as #uc
// and #arc, whose look docs/assets/style.css gives.
//
// Module: MOD-dashboard-app
// Guards: UC-042; UC-020; UC-006; UC-008; UC-022
// Level: system

import assert from "node:assert/strict";
import test from "node:test";
import { openDashboard, repoServer } from "./app-harness.mjs";

const SPEC = `# Layout fixture

## First section

**FIRST REQUIREMENT** *(Source one)*
First rule.
*Check:* \`tests/first.test.mjs\`
`;
const USE_CASE = `---
id: UC-001
title: Add a managed product
area: setup
actors:
  - Author
realises:
  - FIRST REQUIREMENT
---
# UC-001 Add a managed product

**Goal.** A fixture use case.
`;
const MODULE = `---
id: MOD-fixture
title: A fixture module
realises:
  - FIRST REQUIREMENT
follows: []
uses: []
---
# MOD-fixture A fixture module
`;
const FILES = {
  "SPEC.md": SPEC,
  "docs/use-cases/UC-001-add-a-managed-product.md": USE_CASE,
  "docs/architecture/MOD-fixture.md": MODULE,
};

const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, "g")) ?? [];
const classesOf = (tag) => (/\sclass="([^"]*)"/.exec(tag)?.[1] ?? "").split(/\s+/).filter(Boolean);

// The section that opens most recently before the page's first h2, by its tag — the section the title stands in.
function titleSection(html) {
  const title = html.indexOf("<h2");
  if (title < 0) return null;
  const before = tags(html.slice(0, title), "section");
  return before.at(-1) ?? null;
}

// What the shared layout asks of one rendered page. -> the departures, each a short text naming the tag.
function departures(html) {
  const found = [];
  const head = titleSection(html);
  if (!head || !classesOf(head).includes("head")) found.push(`title outside a section.head: ${head ?? "no section"}`);
  for (const button of tags(html, "button")) if (!classesOf(button).includes("btn")) found.push(`button without btn: ${button}`);
  for (const details of tags(html, "details")) if (!classesOf(details).includes("explain")) found.push(`details without explain: ${details}`);
  return found;
}

const render = async (hash) => (await openDashboard({ server: await repoServer({ files: FILES }), hash })).main();

// CASE LAYOUT-01
// given: a product with one requirement, one use case and one module; the dashboard opened on #uc, #arc, #spec and #settings
// input: each page as the dashboard renders it
// expect: known positive first — #uc and #arc keep their title in a section.head, give every button the class btn and every
//         folded explanation the class explain; then #spec and #settings do the same
test("#spec and #settings use the layout of #uc and #arc: a section.head title, btn buttons, explain details", async () => {
  for (const hash of ["#uc", "#arc"]) {
    const html = await render(hash);
    assert.match(html, /<h2/, `known positive: ${hash} renders its title`);
    assert.deepEqual(departures(html), [], `known positive: ${hash} follows the shared layout`);
  }
  for (const hash of ["#spec", "#settings"]) {
    const html = await render(hash);
    assert.match(html, /<button/, `${hash} renders buttons`);
    assert.deepEqual(departures(html), [], `${hash} follows the shared layout`);
  }
});

// CASE LAYOUT-02
// given: the same product, the dashboard opened on #settings and on #spec
// input: each page as the dashboard renders it
// expect: every setting line of #settings is a card, section.panel, as #arc's groups of content are, and of its tabs the
//         selected one alone wears the primary look of a btn; on #spec the title of the current requirements stands in a
//         section.head, and every section of the current SPEC is a heading with its table, as #arc's groups of rows are,
//         and no card
test("groups: a setting line is a section.panel; a section of the current SPEC is a heading with its table, no card", async () => {
  const settings = await render("#settings");
  const lines = tags(settings, "section").filter((tag) => classesOf(tag).some((name) => /^settings-/.test(name)))
    .filter((tag) => !classesOf(tag).some((name) => ["settings-tab-panel", "settings-product-list-item"].includes(name)));
  assert.ok(lines.length > 0, "known positive: #settings renders setting lines");
  assert.deepEqual(lines.filter((tag) => !classesOf(tag).includes("panel")), [], "every setting line is a section.panel");
  const tabs = tags(settings, "button").filter((tag) => classesOf(tag).includes("settings-tab"));
  assert.equal(tabs.length, 4, "known positive: #settings renders its four tabs");
  // A fresh page selects its first tab, General.
  assert.deepEqual(tabs.map((tag) => classesOf(tag).includes("primary")), [true, false, false, false],
    "the selected tab alone is a primary btn");

  const spec = await render("#spec");
  const title = spec.indexOf(">Current requirements</h2>");
  assert.ok(title > 0, "known positive: #spec renders the title of the current requirements");
  const head = tags(spec.slice(0, title), "section").at(-1) ?? "";
  assert.ok(classesOf(head).includes("head"), `the title of the current requirements stands in a section.head: ${head}`);
  const sections = tags(spec, "section").filter((tag) => classesOf(tag).includes("spec-section"));
  assert.ok(sections.length > 0, "known positive: #spec renders the sections of the current SPEC");
  assert.deepEqual(sections.filter((tag) => classesOf(tag).includes("panel")), [], "no SPEC section is a card");
});
