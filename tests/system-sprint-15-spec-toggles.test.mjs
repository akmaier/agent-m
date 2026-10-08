// The current SPEC overview's section and row controls through the dashboard (ITM-278).
//
// Module: MOD-trace-pages
// Guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// Level: system

import assert from "node:assert/strict";
import test from "node:test";
import { openDashboard, repoServer } from "./app-harness.mjs";

const SPEC = `# Toggle fixture

**OUTSIDE REQUIREMENT** *(Source outside)*
Outside rule.
*Check:* \`tests/outside.test.mjs\`

## First section

**FIRST REQUIREMENT** *(Source one)*
First rule.
*Check:* \`tests/first.test.mjs\`

## Second section

**SECOND REQUIREMENT** *(Source two)*
Second rule.
*Check:* \`tests/second.test.mjs\`
`;
const QUEUE = "2026-10-08_toggle-system";
const FILES = {
  "SPEC.md": SPEC,
  [`docs/spec-freigaben/${QUEUE}/index.md`]: "# Queue\n\n**Zieldatei aller Einträge:** `SPEC.md`\n",
  [`docs/spec-freigaben/${QUEUE}/entscheidungen.md`]: "# Decisions\n",
};

// app-harness deliberately implements only the DOM surface older views used.  The production toggle uses the standard
// removeAttribute API; supplying it to its rendered table keeps this test on the public dashboard without changing the shared harness.
function sectionControls() {
  const main = globalThis.document.getElementById("main");
  const toggles = main.querySelectorAll("button.spec-section-toggle");
  const tables = main.querySelectorAll("table.list").slice(-toggles.length);
  for (const table of tables) table.removeAttribute = (name) => { delete table[name]; };
  return { toggles, tables, names: main.querySelectorAll("button.requirement-name") };
}

// CASE ITM-278-SYSTEM-01
// given: the public #spec dashboard with a requirement outside sections and two current sections
// input: fresh render; first section heading clicked open, closed, and reopened; then its requirement is clicked three times
// expect: section lists begin hidden, the selected section alone changes, and the row-local four-field detail opens, closes, reopens
test("the dashboard #spec controls collapse sections and toggle a current requirement in place", async () => {
  const server = await repoServer({ files: FILES });
  const page = await openDashboard({ server, hash: "#spec" });
  assert.match(page.main(), /OUTSIDE REQUIREMENT/, "known positive: the requirement outside a section is rendered");
  const { toggles, tables, names } = sectionControls();
  const details = globalThis.document.getElementById("main").querySelectorAll("tr.requirement-opened");
  assert.deepEqual(toggles.map((toggle) => toggle.textContent), ["First section", "Second section"], "known positive: both heading controls are present");
  assert.equal(tables.length, 2, "known positive: each heading owns one current-requirements table");
  assert.ok(tables.every((table) => table.hidden === "hidden"), "a fresh dashboard render hides all section lists");

  await page.click("button.spec-section-toggle");
  assert.equal(tables[0].hidden, undefined, "the first click opens the selected first section");
  assert.equal(tables[1].hidden, "hidden", "opening the first section leaves the second section collapsed");
  await page.click("button.spec-section-toggle");
  assert.equal(tables[0].hidden, "hidden", "the second click closes the same section");
  await page.click("button.spec-section-toggle");
  assert.equal(tables[0].hidden, undefined, "the third click reopens the same section");

  const first = names.find((name) => name.textContent === "FIRST REQUIREMENT");
  const firstDetail = details[names.findIndex((name) => name.textContent === "FIRST REQUIREMENT")];
  assert.ok(first, "known positive: the selected section contains its current requirement control");
  await first.fire("click", { isTrusted: true });
  assert.match(firstDetail?.textContent ?? "", /First rule\./, "the first click opens its four-field detail");
  await first.fire("click", { isTrusted: true });
  assert.equal(firstDetail?.textContent, "", "the second click closes its row-local detail");
  await first.fire("click", { isTrusted: true });
  assert.match(firstDetail?.textContent ?? "", /First rule\./, "the third click reopens the same detail");
});
