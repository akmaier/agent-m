// The current SPEC overview's group and row controls through the dashboard (ITM-278; the groups are those of the group file, ITM-595).
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
  "docs/groups/requirements.md": "- First group\n  - FIRST REQUIREMENT\n- Second group\n  - SECOND REQUIREMENT\n",
  [`docs/spec-freigaben/${QUEUE}/index.md`]: "# Queue\n\n**Zieldatei aller Einträge:** `SPEC.md`\n",
  [`docs/spec-freigaben/${QUEUE}/entscheidungen.md`]: "# Decisions\n",
};

// app-harness deliberately implements only the DOM surface older views used.  The production toggle uses the standard
// removeAttribute API; supplying it to its rendered group list keeps this test on the public dashboard without changing the shared harness.
function sectionControls() {
  const main = globalThis.document.getElementById("main");
  const toggles = main.querySelectorAll("button.spec-group-toggle");
  const tables = main.querySelectorAll("div.spec-group-body");
  for (const table of tables) table.removeAttribute = (name) => { delete table[name]; };
  return { toggles, tables, names: main.querySelectorAll("button.requirement-name") };
}

// CASE ITM-278-SYSTEM-01
// TST-473081 · level: system · module: MOD-trace-pages
// guards: UC-020; A REQUIREMENT HAS FOUR FIELDS
// given: the public #spec dashboard with a requirement no group names and two groups of the group file
// input: fresh render; first group heading clicked open, closed, and reopened; then its requirement is clicked three times
// expect: group lists begin hidden, the selected group alone changes, and the row-local four-field detail opens, closes, reopens
test("the dashboard #spec controls collapse groups and toggle a current requirement in place", async () => {
  const server = await repoServer({ files: FILES });
  const page = await openDashboard({ server, hash: "#spec" });
  assert.match(page.main(), /OUTSIDE REQUIREMENT/, "known positive: the requirement no group names is rendered");
  const { toggles, tables, names } = sectionControls();
  const details = globalThis.document.getElementById("main").querySelectorAll("tr.requirement-opened");
  assert.deepEqual(toggles.map((toggle) => toggle.textContent), ["First group", "Second group"], "known positive: both heading controls are present");
  assert.equal(tables.length, 2, "known positive: each heading owns one list of current requirements");
  assert.ok(tables.every((table) => table.hidden === "hidden"), "a fresh dashboard render hides all group lists");

  await page.click("button.spec-group-toggle");
  assert.equal(tables[0].hidden, undefined, "the first click opens the selected first group");
  assert.equal(tables[1].hidden, "hidden", "opening the first group leaves the second group collapsed");
  await page.click("button.spec-group-toggle");
  assert.equal(tables[0].hidden, "hidden", "the second click closes the same group");
  await page.click("button.spec-group-toggle");
  assert.equal(tables[0].hidden, undefined, "the third click reopens the same group");

  const first = names.find((name) => name.textContent === "FIRST REQUIREMENT");
  const firstDetail = details[names.findIndex((name) => name.textContent === "FIRST REQUIREMENT")];
  assert.ok(first, "known positive: the selected group contains its current requirement control");
  await first.fire("click", { isTrusted: true });
  assert.match(firstDetail?.textContent ?? "", /First rule\./, "the first click opens its four-field detail");
  await first.fire("click", { isTrusted: true });
  assert.equal(firstDetail?.textContent, "", "the second click closes its row-local detail");
  await first.fire("click", { isTrusted: true });
  assert.match(firstDetail?.textContent ?? "", /First rule\./, "the third click reopens the same detail");
});
