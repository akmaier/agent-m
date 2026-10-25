// UC-048 "Fill the roles" as a system path: the author opens #roles on the real dashboard (src/site-frame/dashboard-app.mjs with MOD-implementation-pages' route `roles`, in
// tests/app-harness.mjs against a GitHub API mock that serves one repository as both the instance and the product, and that changes its files by a commit), reads the
// role assignments and the roles of the model, names a role assignment, assigns participants, and presses Save — and each alternative flow UC-048 names: 2a, 2b, 3a, 3b, 3c,
// 3d, 4a and 4b. Each test states its expected result from UC-048 and the requirements it realises, not from the page.
// Run: node --test tests/system-uc-048-fill-the-roles.test.mjs
//
// Module: MOD-implementation-pages
// Guards: UC-048; A ROLE ASSIGNMENT FILLS THE ROLES; A PRODUCT HAS ONE ROLE ASSIGNMENT, OR ONE PER TEAM; THE PROCESS NAMES ROLES, NOT PARTICIPANTS; A ROLE NAMES HOW MANY FILL IT
// Guards: A PARTICIPANT MAY SERVE SEVERAL TEAMS; A ROLE NAMES THE CAPABILITIES IT NEEDS; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// Guards: ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF
// Level: system
//
// The fixture is the one of tests/dashboard-roles.test.mjs, copied (a test file runs its own tests when imported): the model is Scrum with a work-in-progress limit
// (tests/fixtures/flow/scrum-wip.md) — Owner, a person, one; Builders, agents, several, who need read, write, run code and tests and use tools; Checker, either, several, who
// need read and run code and tests. The instance's participants: alice and bob, people; dev-a, a CLI agent on this machine, and dev-b, one at a provider in the USA, both with
// every capability; ep, a model endpoint that can only draft text and read. team1 — alice, dev-a — runs a sprint that holds ITM-001; team2 — bob, dev-b — runs none. The
// harness's controls do not read an input's value from its HTML: a test types each field, and ticks a box as a person does, with the change event.
// A case already green on main is every case here: the page is built; the counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { repoServer, openDashboard, REPO } from "./app-harness.mjs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const inMain = (selector) => globalThis.document.getElementById("main").querySelector(selector);
const saveButton = () => inMain("[data-save-assignment]");
const said = () => inMain("[data-assignment-result]")?.innerHTML ?? "";
function tick(selector, on = true) {
  const box = inMain(selector);
  box.checked = on;
  box.fire("change", {});
}

const PARTICIPANTS = (useTools = true) => ["# Participants of this instance", "", "**REGISTER**", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |", "|---|---|---|---|---|---|---|---|",
  "| alice | person | — | — | — | draft text, read the repository, write to the repository | — | account github.com/alice |",
  "| bob | person | — | — | — | draft text, read the repository, write to the repository | — | account github.com/bob |",
  `| dev-a | CLI agent | example-model | 200000 | — | read the repository, write to the repository, run code and tests${useTools ? ", use tools" : ""} | this machine | bridge lab-pc agent claude |`,
  `| dev-b | CLI agent | example-model | 200000 | — | read the repository, write to the repository, run code and tests${useTools ? ", use tools" : ""} | a provider in the USA | bridge cloud agent claude |`,
  "| ep | model endpoint | example-model | 100000 | — | draft text, read the repository | this machine | endpoint local |", ""].join("\n");
const DECLARATION = ["---", "model: fixture-scrum-wip", "model_file: docs/process-models/fixture.md",
  `model_version: ${"a".repeat(40)}`, "---", "# How the fixture product is developed", "", "## Practices", "", "- none", "",
  "## Branches", "", "| Phase or time box | Branch |", "|---|---|", "", "## Definition of Done", "", "The job rules hold.", ""].join("\n");
const assignment = (team, owner, builder) => `# ${team}\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Owner | ${owner} |\n`
  + `| Builders | ${builder} |\n| Checker | ${builder} |\n`;
const ITEM = ["---", "id: ITM-001", "title: Store the drafts", "level: module", "realises:", "  - RULE ONE", "modules:", "  - MOD-store",
  "builds_on: []", "tests:", "  - unit", "origin:", "  - RULE ONE", "---", "# ITM-001 Store the drafts", "", "## Outcome", "", "Done.",
  "", "## Acceptance", "", "- a unit test.", ""].join("\n");
const RESTRICTED = ["---", "id: SRC-restricted", "title: A restricted source", "kind: document", "authority: informational",
  "licence: restricted — fixture only", "places:", "  - NHR@FAU, Erlangen", "---", "# SRC-restricted A restricted source", "",
  "A fixture source whose content may be given only at NHR@FAU, Erlangen.", "", "## Versions", "",
  "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|", "| `2026-10-01` | 2026-10-01 | fixture | fixture only | none |", ""].join("\n");

function fixtureFiles({ sprints = true, useTools = true, restricted = false } = {}) {
  const model = read("tests/fixtures/flow/scrum-wip.md");
  return {
    "SPEC.md": "# SPEC\n\n## 1. Rules\n\n**RULE ONE** *(PO, 2026-09-01)*\nA rule.\n*Check:* no automatic check; at review.\n",
    "docs/participants.md": PARTICIPANTS(useTools),
    "docs/process.md": DECLARATION,
    "docs/process-models/fixture.md": sprints ? model : model.replace("| Sprints | yes |", "| Sprints | no |"),
    "docs/role-assignments/team1.md": assignment("team1", "alice", "dev-a"),
    ...(sprints ? { "docs/role-assignments/team2.md": assignment("team2", "bob", "dev-b") } : {}),
    "docs/backlog/ITM-001-store-the-drafts.md": ITEM,
    ...(sprints ? { "docs/backlog/sprints/team1/01.md": "---\nsprint: 1\ngoal: Store\nstart: 2026-09-14\nend:\ncloser: alice\nbranch:\n"
      + "selection:\n  - ITM-001\n---\n# team1 Sprint 01\n" } : {}),
    ...(restricted ? { "docs/sources.md": `# Sources\n\n| Source | Version | Hash | Part |\n|---|---|---|---|\n| SRC-restricted | 2026-10-01 | ${"c".repeat(64)} | all |\n`,
      "docs/sources/SRC-restricted.md": RESTRICTED } : {}),
  };
}
async function rolesPage(options) {
  const server = await repoServer({ files: fixtureFiles(options) });
  const page = await openDashboard({ server, hash: "#roles" });
  return { server, page };
}
function part(html, marker) {
  const at = html.indexOf(marker);
  assert.ok(at >= 0, `the page has ${marker}`);
  const next = html.indexOf('<section class="panel"', at + marker.length);
  return html.slice(at, next < 0 ? undefined : next);
}
const row = (html, role) => { const at = html.indexOf(`data-role="${role}"`); return at < 0 ? "" : html.slice(at, html.indexOf("</tr>", at)); };

// ---------------------------------------------------------------- the main flow

// TST-1063001 · level: system · module: MOD-implementation-pages
// guards: UC-048; A ROLE ASSIGNMENT FILLS THE ROLES; THE PROCESS NAMES ROLES, NOT PARTICIPANTS; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION
// given: the product declares its model (Scrum) and the instance lists its participants; team1 and team2 have their role assignments
// input: UC-048 main flow: open #roles; read the role assignments and the roles; choose + Team and name it team3; assign alice to Owner and dev-a to Builders and Checker; press Save once; open #roles again
// expect: step 1 shows team1 and team2 with who fills which role, and every role of the model with who may fill it, how many and what it needs; Save is disabled until a person holds Owner and then enabled; one click commits one file, docs/role-assignments/team3.md, whose whole text is the roles of the model with their participants by name and nothing of the process (no model, no branch, no Definition of Done); the process declaration is not in the commit; opened again, the page shows team3 with its holders
test("UC-048 main flow — open Roles, name a role assignment, assign participants, Save: one file of roles and names, and nothing of the process", async () => {
  const server = await repoServer({ files: fixtureFiles() });
  const page = await openDashboard({ server, hash: "#roles" });
  const opened = page.main();
  for (const team of ["team1", "team2"]) assert.ok(opened.includes(`data-assignment="${team}"`), `step 1: ${team}`);
  assert.ok(row(part(opened, 'data-assignment="team1"'), "Owner").includes("alice") && row(part(opened, 'data-assignment="team1"'), "Builders").includes("dev-a"));
  const roles = part(opened, 'data-part="roles"');
  for (const [role, needs] of [["Owner", "person"], ["Builders", "several"], ["Checker", "several"]]) assert.ok(row(roles, role).includes(needs), `step 1: ${role} says ${needs}`);
  await page.click("[data-add-team]");
  assert.equal(saveButton().disabled, true, "no person holds Owner yet");
  inMain("[data-team-name]").value = "team3";
  for (const hold of ["Owner|alice", "Builders|dev-a", "Checker|dev-a"]) tick(`[data-hold="${hold}"]`);
  assert.equal(saveButton().disabled, false, said());
  assert.equal(server.writes.length, 0, "nothing is written before Save");
  await page.click("[data-save-assignment]");
  assert.equal(server.writes.length, 1, "one click, one commit");
  assert.deepEqual(Object.keys(server.writes[0].files), ["docs/role-assignments/team3.md"]);
  assert.equal(server.writes[0].files["docs/role-assignments/team3.md"],
    "# team3\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Owner | alice |\n| Builders | dev-a |\n| Checker | dev-a |\n");
  const again = await openDashboard({ server, hash: "#roles" });
  assert.ok(row(part(again.main(), 'data-assignment="team3"'), "Builders").includes("dev-a"), "the committed assignment is read back");
});

// ---------------------------------------------------------------- alternative flows

// TST-1063002 · level: system · module: MOD-implementation-pages
// guards: UC-048; A PRODUCT HAS ONE ROLE ASSIGNMENT, OR ONE PER TEAM; A PARTICIPANT MAY SERVE SEVERAL TEAMS
// given: a model with sprints and a product with two teams, team1 (alice, dev-a) and team2 (bob, dev-b)
// input: alternative 2a: + Team, name team3, assign alice to Owner and dev-a, who already holds roles in team1, to Builders and Checker; Save
// expect: + Team is offered; the new team's assignment is saved in a role assignment of its own with no complaint that alice and dev-a hold roles in team1 as well; only team3's file is committed, team1's is not touched
test("UC-048 alternative 2a — + Team in a model with sprints: a role assignment of its own, in which a participant of another team may hold roles", async () => {
  const server = await repoServer({ files: fixtureFiles() });
  const page = await openDashboard({ server, hash: "#roles" });
  assert.match(page.main(), /data-add-team/);
  await page.click("[data-add-team]");
  inMain("[data-team-name]").value = "team3";
  for (const hold of ["Owner|alice", "Builders|dev-a", "Checker|dev-a"]) tick(`[data-hold="${hold}"]`);
  assert.equal(saveButton().disabled, false, said());
  await page.click("[data-save-assignment]");
  assert.deepEqual(server.writes.map((w) => Object.keys(w.files)), [["docs/role-assignments/team3.md"]]);
});

// TST-1063003 · level: system · module: MOD-implementation-pages
// guards: UC-048; A PRODUCT HAS ONE ROLE ASSIGNMENT, OR ONE PER TEAM
// given: a model that works without sprints, and the product's one role assignment
// input: alternative 2b: open #roles
// expect: the one role assignment is shown and + Team is not offered; no Remove team is offered for a team the model does not have
test("UC-048 alternative 2b — a model without sprints shows its one role assignment and offers no + Team", async () => {
  const server = await repoServer({ files: fixtureFiles({ sprints: false }) });
  const page = await openDashboard({ server, hash: "#roles" });
  assert.ok(page.main().includes('data-assignment="team1"'), "the one role assignment");
  assert.doesNotMatch(page.main(), /data-add-team/);
});

// TST-1063004 · level: system · module: MOD-implementation-pages
// guards: UC-048; A ROLE NAMES HOW MANY FILL IT; A ROLE NAMES THE CAPABILITIES IT NEEDS
// given: the + Team form with no participant assigned; the role Owner needs a person
// input: alternative 3a: look for an agent among the holders offered for Owner; assign agents to the other roles
// expect: Save stays disabled and the form names the role Owner as the one that needs a person; an agent is not among the participants offered for Owner
test("UC-048 alternative 3a — a role that needs a person has none: Save stays disabled and the role is named", async () => {
  const server = await repoServer({ files: fixtureFiles() });
  const page = await openDashboard({ server, hash: "#roles" });
  await page.click("[data-add-team]");
  inMain("[data-team-name]").value = "team3";
  assert.equal(inMain('[data-hold="Owner|dev-a"]'), null, "an agent is not offered for a role a person fills");
  for (const hold of ["Builders|dev-a", "Checker|dev-a"]) tick(`[data-hold="${hold}"]`);
  assert.equal(saveButton().disabled, true);
  assert.match(said(), /the role Owner needs a person/);
  assert.deepEqual(server.writes, []);
});

// TST-1063005 · level: system · module: MOD-implementation-pages
// guards: UC-048; A ROLE NAMES THE CAPABILITIES IT NEEDS; A PARTICIPANT DECLARES ITS CAPABILITIES
// given: an instance whose agents cannot use tools, which Builders need, and one model endpoint that can only draft text and read; known positive: the same instance with agents that can
// input: alternative 3b: open #roles
// expect: the known positive offers dev-a and dev-b for Builders and never the model endpoint; without the capability Builders names the missing capability use tools and links to the participants' page (UC-017)
test("UC-048 alternative 3b — no participant has the capabilities a role needs: the missing capability is named and UC-017 linked", async () => {
  const good = await openDashboard({ server: await repoServer({ files: fixtureFiles() }), hash: "#roles" });
  const offered = row(part(good.main(), 'data-part="roles"'), "Builders");
  assert.ok(offered.includes("dev-a") && offered.includes("dev-b") && !offered.includes("model endpoint"), "known positive");
  const short = await openDashboard({ server: await repoServer({ files: fixtureFiles({ useTools: false }) }), hash: "#roles" });
  const missing = row(part(short.main(), 'data-part="roles"'), "Builders");
  assert.match(missing, /use tools/);
  assert.match(missing, /href="#participants"/);
});

// TST-1063006 · level: system · module: MOD-implementation-pages
// guards: UC-048; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: the product links SRC-restricted, whose content may be given only at NHR@FAU, Erlangen; dev-a processes data on this machine
// input: alternative 3c: open #roles, change team1, press Save
// expect: the page names the source SRC-restricted, the role Builders and dev-a; the assignment stays possible: Save is enabled and commits docs/role-assignments/team1.md
test("UC-048 alternative 3c — a holder at a place a linked source does not permit is named with the source and the role, and the assignment stays possible", async () => {
  const server = await repoServer({ files: fixtureFiles({ restricted: true }) });
  const page = await openDashboard({ server, hash: "#roles" });
  const team1 = part(page.main(), 'data-assignment="team1"');
  for (const named of ["SRC-restricted", "dev-a", "Builders"]) assert.ok(team1.includes(named), named);
  await page.click('[data-edit="team1"]');
  assert.match(part(page.main(), "data-edit-assignment"), /SRC-restricted/, "the form names the source too");
  assert.equal(saveButton().disabled, false, "the assignment stays possible");
  await page.click("[data-save-assignment]");
  assert.deepEqual(server.writes.map((w) => Object.keys(w.files)), [["docs/role-assignments/team1.md"]]);
});

// TST-1063007 · level: system · module: MOD-implementation-pages
// guards: UC-048; A ROLE NAMES HOW MANY FILL IT
// given: team1, whose Owner alice is a role that one participant fills; known positive: team1 as it stands may be saved
// input: alternative 3d: change team1 and give Owner a second participant, bob
// expect: Save is disabled and the page says that the model lets one participant fill the role Owner; nothing is saved; taking bob off again enables Save
test("UC-048 alternative 3d — a second participant for a role one fills is refused and nothing is saved", async () => {
  const server = await repoServer({ files: fixtureFiles() });
  const page = await openDashboard({ server, hash: "#roles" });
  await page.click('[data-edit="team1"]');
  assert.equal(saveButton().disabled, false, "known positive");
  tick('[data-hold="Owner|bob"]');
  assert.equal(saveButton().disabled, true);
  assert.match(said(), /one participant fills the role Owner/);
  await page.click("[data-save-assignment]");
  assert.deepEqual(server.writes, [], "a click that reaches Save all the same saves nothing");
  tick('[data-hold="Owner|bob"]', false);
  assert.equal(saveButton().disabled, false);
});

// TST-1063008 · level: system · module: MOD-implementation-pages
// guards: UC-048; A ROLE ASSIGNMENT FILLS THE ROLES; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: team1 with Owner alice, Builders and Checker dev-a
// input: alternative 4a: open team1 from the list of step 1, give Owner to bob instead of alice and Builders to dev-b instead of dev-a, press Save
// expect: one commit of docs/role-assignments/team1.md, in which Owner is bob, Builders dev-b and Checker dev-a, and nothing of the process
test("UC-048 alternative 4a — changing a role assignment commits the file with the new holders", async () => {
  const server = await repoServer({ files: fixtureFiles() });
  const page = await openDashboard({ server, hash: "#roles" });
  await page.click('[data-edit="team1"]');
  tick('[data-hold="Owner|alice"]', false);
  tick('[data-hold="Owner|bob"]');
  tick('[data-hold="Builders|dev-a"]', false);
  tick('[data-hold="Builders|dev-b"]');
  assert.equal(saveButton().disabled, false, said());
  await page.click("[data-save-assignment]");
  assert.equal(server.writes.length, 1);
  assert.deepEqual(Object.keys(server.writes[0].files), ["docs/role-assignments/team1.md"]);
  assert.equal(server.writes[0].files["docs/role-assignments/team1.md"],
    "# team1\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Owner | bob |\n| Builders | dev-b |\n| Checker | dev-a |\n");
});

// TST-1063009 · level: system · module: MOD-implementation-pages
// guards: UC-048; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; A PRODUCT HAS ONE ROLE ASSIGNMENT, OR ONE PER TEAM
// given: two teams: team1, one of whose sprints holds ITM-001, and team2, which runs none
// input: alternative 4b: remove team1; then remove team2
// expect: team1 is not removed: the page names ITM-001 and nothing is written; team2's role assignment is removed in one commit that deletes docs/role-assignments/team2.md
test("UC-048 alternative 4b — a team whose sprint holds items cannot be removed, the items are named; a team without is removed", async () => {
  const server = await repoServer({ files: fixtureFiles() });
  const page = await openDashboard({ server, hash: "#roles" });
  await page.click('[data-remove="team1"]');
  assert.match(inMain('[data-remove-result="team1"]').innerHTML, /ITM-001/);
  assert.deepEqual(server.writes, []);
  await page.click('[data-remove="team2"]');
  assert.deepEqual(server.writes.map((w) => Object.keys(w.files)), [["docs/role-assignments/team2.md"]]);
});

// TST-1063011 · level: system · module: MOD-implementation-pages
// guards: UC-048; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
// given: team1, whose closed sprint selected ITM-001, and a product whose server cannot list its pull requests (500)
// input: alternative 4b: remove team1
// expect: the team is not removed, never guessed released: the page names ITM-001 and nothing is written
test("UC-048 alternative 4b — when the pull requests of the team's items cannot be read the team is not removed", async () => {
  const files = fixtureFiles();
  files["docs/backlog/sprints/team1/01.md"] = "---\nsprint: 1\ngoal: Store\nstart: 2026-09-14\nend: 2026-09-28\ncloser: alice\nbranch: sprint/team1/01\nselection:\n  - ITM-001\n---\n# team1 Sprint 01\n\n## Review\n\nDone.\n";
  const broken = async (url, init) => (url.origin === "https://api.github.com" && url.pathname === `/repos/${REPO}/pulls` && init.method === "GET"
    ? new Response(JSON.stringify({ message: "Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } }) : null);
  const server = await repoServer({ files, handlers: [broken] });
  const page = await openDashboard({ server, hash: "#roles" });
  await page.click('[data-remove="team1"]');
  assert.match(inMain('[data-remove-result="team1"]').innerHTML, /ITM-001/);
  assert.deepEqual(server.writes, []);
});

// TST-1063010 · level: system · module: MOD-implementation-pages
// guards: UC-048; EVERY STEP EXPLAINS ITSELF
// given: the Roles page with a team open for a change
// input: open #roles, change team1
// expect: the head and every panel carry a folded What is this?; together they say what a role is, that the process names roles and no one, that only Scrum has teams, and point to chapter 6 and chapter 7
test("UC-048 — every step carries a folded What is this?, with the pointers to the book", async () => {
  const page = await openDashboard({ server: await repoServer({ files: fixtureFiles() }), hash: "#roles" });
  await page.click('[data-edit="team1"]');
  const html = page.main();
  const panels = html.split('<section class="panel"').slice(1);
  assert.ok(panels.length >= 4);
  for (const one of panels) assert.match(one, /<details class="explain"><summary>What is this\?<\/summary>/);
  const folded = html.split('<details class="explain">').slice(1).map((one) => one.slice(0, one.indexOf("</details>"))).join(" ");
  for (const sentence of [/names roles and no one/, /Only Scrum has teams/, /chapter 6/, /chapter 7/]) assert.match(folded, sentence);
});
