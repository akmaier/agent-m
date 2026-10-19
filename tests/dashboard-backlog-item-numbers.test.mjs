// The Backlog page reads an item whose number has three or more digits and lists the items in the order of their numbers (ITM-1087):
// MOD-identifiers.md gives an item's identifier as ITM-<nnn>, three or more digits. ITM-1000 changed MOD-work-plans' reader; this is the one of
// docs/assets/dashboard/backlog-view.mjs, which MOD-implementation-pages takes over (MOD-implementation-pages.md:122).
// Run: node --test tests/dashboard-backlog-item-numbers.test.mjs
//
// Module: MOD-implementation-pages
// Guards: EVERY ARTIFACT HAS AN IDENTIFIER; UC-031
// Level: unit
//
// The real dashboard and its view run in tests/app-harness.mjs against a GitHub API mock, as tests/dashboard-backlog-teams.test.mjs does; the product
// holds a SPEC and item files only, and no pull request. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, REPO } from "./app-harness.mjs";

const SPEC = "# SPEC\n\n## 1. Rules\n\n**RULE ONE** *(PO, 2026-09-01)*\nThe first rule.\n*Check:* no automatic check; at review.\n";
const itemText = (id) => ["---", `id: ${id}`, `title: The work of ${id}`, "level: module", "realises:", "  - RULE ONE", "modules:", "  - MOD-store", "builds_on: []",
  "tests:", "  - unit", "origin:", "  - RULE ONE", "---", `# ${id} The work of ${id}`, "", "## Outcome", "", "What it delivers.", "", "## Acceptance", "", "- a unit test.", ""].join("\n");
const pulls = async (url) => (url.origin === "https://api.github.com" && url.pathname === `/repos/${REPO}/pulls`
  ? new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }) : null);

async function backlog(numbers) {
  const files = { "SPEC.md": SPEC, ...Object.fromEntries(numbers.map((n) => [`docs/backlog/${n}-item.md`, itemText(n)])) };
  const server = await repoServer({ files, handlers: [pulls] });
  const page = await openDashboard({ server, hash: "#backlog" });
  const html = page.main();
  const at = html.indexOf('data-part="backlog"');
  return [...html.slice(at).matchAll(/data-item="([^"]+)"/g)].map((match) => match[1]);
}

// TST-1087001 · level: unit · module: MOD-implementation-pages
// guards: EVERY ARTIFACT HAS AN IDENTIFIER; UC-031
// given: a product whose backlog holds the item files ITM-1000, ITM-100 and ITM-999, none building on another
// input: open #backlog
// expect: the backlog lists ITM-100, ITM-999 and ITM-1000, in that order — by number, not by text
test("#backlog — items of three and four digits are listed in the order of their numbers", async () => {
  assert.deepEqual(await backlog(["ITM-1000", "ITM-100", "ITM-999"]), ["ITM-100", "ITM-999", "ITM-1000"]);
});

// TST-1087002 · level: unit · module: MOD-implementation-pages
// guards: EVERY ARTIFACT HAS AN IDENTIFIER; UC-031
// given: a product whose backlog holds ITM-100, ITM-999, ITM-1000 and ITM-10000
// input: open #backlog
// expect: all four are listed, the longest last, so that the order is by number whatever the digits
test("#backlog — an item of five digits comes after one of four", async () => {
  assert.deepEqual(await backlog(["ITM-10000", "ITM-1000", "ITM-999", "ITM-100"]), ["ITM-100", "ITM-999", "ITM-1000", "ITM-10000"]);
});

// TST-1087003 · level: unit · module: MOD-implementation-pages
// guards: EVERY ARTIFACT HAS AN IDENTIFIER; UC-031
// given: a product whose backlog holds ITM-100 and a file ITM-99-item.md with two digits
// input: open #backlog
// expect: only ITM-100 is listed: a file of two digits is not read as an item, and the three-digit item still is (the known positive)
test("#backlog — a file with two digits is no item, a file with three still is", async () => {
  assert.deepEqual(await backlog(["ITM-99", "ITM-100"]), ["ITM-100"]);
});
