// The Backlog page reads an item whose number has three or more digits and lists the items in the order of their numbers (ITM-1087):
// MOD-identifiers.md gives an item's identifier as ITM-<nnn>, three or more digits. ITM-1000 changed MOD-work-plans' reader; this is the one of
// the route `backlog` of MOD-implementation-pages (docs/architecture/MOD-implementation-pages.md, Parts).
// Run: node --test tests/dashboard-backlog-item-numbers.test.mjs
//
// Module: MOD-implementation-pages
// Guards: EVERY ARTIFACT HAS AN IDENTIFIER; UC-031
// Level: unit
//
// The real dashboard and its view run in tests/app-harness.mjs against a GitHub API mock, as tests/dashboard-backlog-teams.test.mjs does; the product
// holds a SPEC and item files only, and no pull request; the sprint tests add the process declaration, its model and one team. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readDocument } from "../src/documents/index.mjs";
import { planSchemas } from "../src/work-plans/index.mjs";
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

// ---------------------------------------------------------------- Start sprint writes the selection in the order of the numbers

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const DECLARATION = ["---", "model: fixture-scrum-wip", "model_file: docs/process-models/fixture.md", `model_version: ${"c0ffee".padEnd(40, "0")}`, "---", "# How the fixture product is developed", "",
  "## Practices", "", "- none", "", "## Branches", "", "| Phase or time box | Branch |", "|---|---|", "| Sprint | `sprint/<team>/<nn>` |", "", "## Definition of Done", "", "The job rules hold.", ""].join("\n");
const ASSIGNMENT = "# team1\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Owner | alice |\n| Builders | dev-a |\n| Checker | dev-a |\n";
const refs = (created) => async (url, init) => {
  if (url.origin !== "https://api.github.com" || url.pathname !== `/repos/${REPO}/git/refs` || init.method !== "POST") return null;
  const body = JSON.parse(init.body);
  created.push(body);
  return new Response(JSON.stringify({ ref: body.ref, object: { sha: body.sha } }), { status: 201, headers: { "Content-Type": "application/json" } });
};

// TST-1087004 · level: unit · module: MOD-implementation-pages
// guards: EVERY ARTIFACT HAS AN IDENTIFIER; UC-032
// given: a team with no sprint and the items ITM-1000, ITM-101 and ITM-999 in its backlog, none building on another
// input: Plan sprint for the team; tick ITM-1000 and ITM-101; Start sprint
// expect: the sprint file written holds the selection ITM-101, ITM-1000 — in the order of their numbers, not of their file names as text
test("#backlog — Start sprint writes the selected items in the order of their numbers", async () => {
  const created = [];
  const items = ["ITM-1000", "ITM-101", "ITM-999"];
  const files = { "SPEC.md": SPEC, "docs/process.md": DECLARATION, "docs/process-models/fixture.md": read("tests/fixtures/flow/scrum-wip.md"),
    "docs/role-assignments/team1.md": ASSIGNMENT, ...Object.fromEntries(items.map((n) => [`docs/backlog/${n}-item.md`, itemText(n)])) };
  const server = await repoServer({ files, handlers: [pulls, refs(created)] });
  const page = await openDashboard({ server, hash: "#backlog" });
  await page.click('[data-plan="team1"]');
  const main = () => globalThis.document.getElementById("main");
  main().querySelector("[data-sprint-goal]").value = "Numbers";
  main().querySelector("[data-sprint-closer]").value = "alice";
  main().querySelector('[data-select-item="ITM-1000"]').checked = true;
  main().querySelector('[data-select-item="ITM-101"]').checked = true;
  await page.click("[data-start-sprint]");
  assert.equal(server.writes.length, 1, "one commit");
  const path = "docs/backlog/sprints/team1/01.md";
  assert.deepEqual(Object.keys(server.writes[0].files), [path]);
  const record = readDocument(planSchemas.sprint, path, server.writes[0].files[path]);
  assert.deepEqual(record.fields.selection, ["ITM-101", "ITM-1000"]);
});
