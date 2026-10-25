// The Roles page (UC-048) — MOD-implementation-pages' route `roles`, as the accepted text of docs/architecture/
// MOD-implementation-pages.md states it: the product's role assignments — its teams, in a model with sprints —, each with who
// fills which role; the roles of the model with what each needs and how many fill it, and for each role the participants of
// the instance's list that have every capability it needs, each with where it processes data; + Team in a model with sprints;
// the findings of roleAssignmentFindings, the linked sources' places among them; Save, which writes a role assignment with
// saveFile, disabled while the findings hold an error; and a team removed only while no sprint of it holds an item. Its
// folded explanations are MOD-site-frame's, from src/site-frame/explanations.md. It is laid out as #uc and #arc are: a head,
// panels with their explanations, list tables, buttons — no style of its own.
// Run: node --test tests/dashboard-roles.test.mjs
//
// Module: MOD-implementation-pages
// Guards: UC-048; A ROLE ASSIGNMENT FILLS THE ROLES; A PRODUCT HAS ONE ROLE ASSIGNMENT, OR ONE PER TEAM; A ROLE NAMES HOW MANY FILL IT; A ROLE NAMES THE CAPABILITIES IT NEEDS; A PROCESS MODEL ORGANISES PEOPLE AND AGENTS; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; EVERY STEP EXPLAINS ITSELF
// Level: component
//
// The real dashboard (src/site-frame/dashboard-app.mjs) hands the route to MOD-implementation-pages' route `roles` by its name, in
// tests/app-harness.mjs against a GitHub API mock, which serves one repository as both the instance and the product. The
// fixture model is Scrum with a work-in-progress limit (tests/fixtures/flow/scrum-wip.md): Owner, a person, one; Builders,
// agents, several, who need read, write, run code and tests and use tools; Checker, either, several, who need read and run.
// The instance's participants: alice and bob, people; dev-a, a CLI agent on this machine, and dev-b, one at a provider in
// the USA, both with every capability; ep, a model endpoint that can only draft text and read. team1 — alice, dev-a — runs a
// sprint that holds ITM-001; team2 — bob, dev-b — runs none. The harness's controls do not read an input's value from its
// HTML, as a browser does: a test types each field it needs, and ticks a box as a person does, with the change event.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { repoServer, openDashboard, REPO } from "./app-harness.mjs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const inMain = (selector) => globalThis.document.getElementById("main").querySelector(selector);
const saveButton = () => inMain("[data-save-assignment]");
// What the form says — nothing once a save has closed it.
const said = () => inMain("[data-assignment-result]")?.innerHTML ?? "";
// A person's tick on a box: it changes, and the page hears of it.
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

// ---------------------------------------------------------------- step 1

// TST-472139 · level: component · module: MOD-implementation-pages
// guards: UC-048; A ROLE NAMES HOW MANY FILL IT; A ROLE NAMES THE CAPABILITIES IT NEEDS
// given: the fixture product; then the same instance whose agents cannot use tools, which Builders need
// input: open #roles
// expect: one row per role of the model, with who may fill it, how many, what it needs, and who may hold it with where each processes data — Owner: alice and bob, people; Builders: dev-a on this machine and dev-b at a provider in the USA, never ep, which cannot write; Checker: dev-a and dev-b, never alice, who cannot run code. Without use tools, Builders names that capability as the one no participant has, and links to the participants
test("#roles — the model's roles: who may fill each, how many, what each needs, and who may hold it with where it processes data", async () => {
  const { page } = await rolesPage();
  const roles = part(page.main(), 'data-part="roles"');
  assert.match(row(roles, "Owner"), /person/);
  assert.match(row(roles, "Owner"), /\bone\b/);
  assert.ok(row(roles, "Owner").includes("alice") && row(roles, "Owner").includes("bob"));
  assert.ok(!row(roles, "Owner").includes("dev-a"), "an agent is not offered for a role a person fills");
  const builders = row(roles, "Builders");
  for (const named of ["several", "use tools", "dev-a", "this machine", "dev-b", "a provider in the USA"]) assert.ok(builders.includes(named), named);
  assert.ok(!builders.includes("model endpoint"), "ep, the one model endpoint, cannot write to the repository");
  assert.ok(!row(roles, "Checker").includes("alice"), "alice cannot run code and tests");
  const short = await rolesPage({ useTools: false });
  const missing = row(part(short.page.main(), 'data-part="roles"'), "Builders");
  assert.match(missing, /use tools/);
  assert.match(missing, /href="#participants"/);
});

// TST-472140 · level: component · module: MOD-implementation-pages
// guards: UC-048; A PRODUCT HAS ONE ROLE ASSIGNMENT, OR ONE PER TEAM
// given: the fixture product with team1 and team2; then one whose model works without sprints, with its one assignment
// input: open #roles
// expect: a panel per team, each naming who fills which role; + Team offered with sprints and not without
test("#roles — each role assignment with who fills which role; + Team in a model with sprints only", async () => {
  const { page } = await rolesPage();
  const team1 = part(page.main(), 'data-assignment="team1"');
  assert.ok(row(team1, "Owner").includes("alice") && row(team1, "Builders").includes("dev-a"));
  assert.ok(part(page.main(), 'data-assignment="team2"').includes("bob"));
  assert.match(page.main(), /data-add-team/);
  const single = await rolesPage({ sprints: false });
  assert.doesNotMatch(single.page.main(), /data-add-team/);
});

// ---------------------------------------------------------------- steps 2–4

// TST-472141 · level: component · module: MOD-implementation-pages
// guards: UC-048; A ROLE ASSIGNMENT FILLS THE ROLES; A PROCESS MODEL ORGANISES PEOPLE AND AGENTS; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: the fixture product
// input: + Team; name it team3; tick Owner alice, Builders and Checker dev-a; Save
// expect: before any tick, Save is disabled and the form names Owner as the role that needs a person and has none; once alice holds it, Save is enabled; one commit of docs/role-assignments/team3.md, whose ## Roles names Owner alice, Builders dev-a and Checker dev-a
test("#roles — + Team: Save stays disabled until a person holds Owner; the team, named and filled, is saved", async () => {
  const { page, server } = await rolesPage();
  await page.click("[data-add-team]");
  assert.equal(saveButton().disabled, true, "no person holds Owner yet");
  assert.match(part(page.main(), "data-edit-assignment"), /the role Owner needs a person/);
  inMain("[data-team-name]").value = "team3";
  for (const hold of ["Owner|alice", "Builders|dev-a", "Checker|dev-a"]) tick(`[data-hold="${hold}"]`);
  assert.equal(saveButton().disabled, false, said());
  await page.click("[data-save-assignment]");
  assert.equal(server.writes.length, 1, said());
  const text = server.writes[0].files["docs/role-assignments/team3.md"];
  assert.ok(text, Object.keys(server.writes[0].files).join(", "));
  for (const line of ["| Owner | alice |", "| Builders | dev-a |", "| Checker | dev-a |"]) assert.ok(text.includes(line), line);
});

// TST-472142 · level: component · module: MOD-implementation-pages
// guards: UC-048; A ROLE NAMES HOW MANY FILL IT; A PROCESS MODEL ORGANISES PEOPLE AND AGENTS
// given: team1, its Owner alice
// input: Change team1; (a) tick bob as a second Owner; (b) untick him again; (c) untick alice
// expect: known positive — team1 as it stands may be saved —; (a) Save disabled, and the form says that one participant fills Owner; (b) Save enabled again; (c) Save disabled, and the form says that Owner needs a person; nothing written
test("#roles — a second participant for a role one fills, or no person for a role that needs one: Save stays disabled, the role named", async () => {
  const { page, server } = await rolesPage();
  await page.click('[data-edit="team1"]');
  assert.equal(saveButton().disabled, false, "known positive: team1 as it stands may be saved");
  tick('[data-hold="Owner|bob"]');
  assert.equal(saveButton().disabled, true, "two Owners");
  assert.match(said(), /one participant fills the role Owner/);
  tick('[data-hold="Owner|bob"]', false);
  assert.equal(saveButton().disabled, false, "one Owner again");
  tick('[data-hold="Owner|alice"]', false);
  assert.equal(saveButton().disabled, true, "no Owner");
  assert.match(said(), /the role Owner needs a person/);
  assert.equal(server.writes.length, 0);
});

// TST-472143 · level: component · module: MOD-implementation-pages
// guards: UC-048; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: the product links SRC-restricted, which permits only NHR@FAU, Erlangen; dev-a processes on this machine
// input: open #roles; Change team1 and Save it unchanged
// expect: team1's panel, and its form, warn that dev-a, a holder of Builders, is at a place SRC-restricted does not permit; the warning leaves Save enabled, which commits docs/role-assignments/team1.md
test("#roles — a holder at a place a linked source does not permit is named with the source and the role; Save stays possible", async () => {
  const { page, server } = await rolesPage({ restricted: true });
  const team1 = part(page.main(), 'data-assignment="team1"');
  for (const named of ["SRC-restricted", "dev-a", "Builders"]) assert.ok(team1.includes(named), named);
  await page.click('[data-edit="team1"]');
  assert.match(part(page.main(), "data-edit-assignment"), /dev-a of the role Builders processes data at this machine, which the source SRC-restricted/);
  assert.equal(saveButton().disabled, false, "a warning does not stop Save");
  await page.click("[data-save-assignment]");
  assert.equal(server.writes.length, 1, said());
  assert.deepEqual(Object.keys(server.writes[0].files), ["docs/role-assignments/team1.md"]);
});

// TST-472144 · level: component · module: MOD-implementation-pages
// guards: UC-048; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
// given: team1, whose sprint holds ITM-001; team2, which runs no sprint
// input: Remove team for team1; then Remove team for team2
// expect: team1 is not removed — the result names ITM-001 — and nothing is written; team2's role assignment is removed in one commit
test("#roles — a team whose sprint holds items is not removed; one whose sprints hold none is", async () => {
  const { page, server } = await rolesPage();
  await page.click('[data-remove="team1"]');
  assert.match(inMain('[data-remove-result="team1"]').innerHTML, /ITM-001/);
  assert.equal(server.writes.length, 0);
  await page.click('[data-remove="team2"]');
  assert.equal(server.writes.length, 1);
  assert.deepEqual(Object.keys(server.writes[0].files), ["docs/role-assignments/team2.md"]);
});

// TST-472145 · level: component · module: MOD-implementation-pages
// guards: EVERY STEP EXPLAINS ITSELF; UC-048
// given: the fixture product, team1's assignment open for a change; the topic roles-and-participants of src/site-frame/explanations.md, whose first sentence is "A model names its roles."
// input: open #roles, Change team1
// expect: the head and every panel carry a folded What is this?; the roles' panel carries that topic; the page's explanations say what a role is, that the process names roles and no one, that only Scrum has teams and why Kanban and the V-model do not, and point to chapter 6 and chapter 7
test("#roles — every step explains itself: what a role is, why only Scrum has teams, with pointers to the book", async () => {
  const { page } = await rolesPage();
  await page.click('[data-edit="team1"]');
  const html = page.main();
  const topic = read("src/site-frame/explanations.md").split(/^## /m).find((part) => part.startsWith("roles-and-participants\n"));
  assert.ok(topic?.includes("A model names its roles."), "known positive: the topic holds the sentence");
  assert.match(part(html, 'data-part="roles"'), /<details class="explain">[^]*A model names its roles\./);
  assert.match(html.slice(0, html.indexOf('<section class="panel"')), /<details class="explain"><summary>What is this\?<\/summary>/, "the head");
  const folded = html.split('<details class="explain">').slice(1).map((one) => one.slice(0, one.indexOf("</details>"))).join(" ");
  for (const said of [/A role is a defined responsibility/, /names roles and no one/, /Only Scrum has teams/, /Kanban/, /V-model/,
    /chapter 6/, /chapter 7/]) assert.match(folded, said);
});

// TST-472146 · level: component · module: MOD-implementation-pages
// guards: EVERY STEP EXPLAINS ITSELF
// given: the fixture product, team1's assignment open for a change
// input: open #roles, Change team1
// expect: the title in a section.head, every button a btn and every folded explanation a details.explain; no style attribute, and no class the style sheets of #uc and #arc — src/theme/lme.css, src/site-frame/look.css, docs/assets/style.css — do not define, outside the folded explanations, whose inside is MOD-site-frame's and its Markdown renderer's (in this harness, which cannot sanitise HTML, the renderer shows each as its source); every panel explains itself
test("#roles — the page is laid out as #uc and #arc are: panels with their explanations, list tables, buttons, no style of its own", async () => {
  const { page } = await rolesPage();
  await page.click('[data-edit="team1"]');
  const html = page.main();
  // The shared layout of #uc and #arc: the title in a section.head, every
  // button a btn, every folded explanation a details.explain.
  const tags = (name) => html.match(new RegExp(`<${name}\\b[^>]*>`, "g")) ?? [];
  const classesOf = (tag) => (/\sclass="([^"]*)"/.exec(tag)?.[1] ?? "").split(/\s+/).filter(Boolean);
  const head = html.slice(0, html.indexOf("<h2")).match(/<section\b[^>]*>/g)?.at(-1) ?? "";
  assert.ok(classesOf(head).includes("head"), `the title stands in a section.head: ${head}`);
  assert.ok(tags("button").length > 0 && tags("details").length > 0, "known positive: the page has buttons and explanations");
  assert.deepEqual(tags("button").filter((tag) => !classesOf(tag).includes("btn")), [], "every button is a btn");
  assert.deepEqual(tags("details").filter((tag) => !classesOf(tag).includes("explain")), [], "every details is an explain");
  assert.doesNotMatch(html, /\sstyle="/);
  // The style sheets docs/index.html links, which #uc and #arc are drawn with: the site's theme, the frame's look (its buttons and fields) and the review pages' own.
  const style = ["src/theme/lme.css", "src/site-frame/look.css", "docs/assets/style.css"].map(read).join("\n");
  const defined = (name) => new RegExp(`\\.${name}(?![\\w-])`).test(style);
  assert.ok(defined("panel") && !defined("result"), "known positive and negative of the search");
  const own = html.replace(/(<details class="explain">)[^]*?(<\/details>)/g, "$1$2");
  const classes = new Set([...own.matchAll(/\sclass="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/).filter(Boolean)));
  assert.ok(classes.has("panel") && classes.has("explain"), "known positive: the page's classes are read");
  for (const name of classes) assert.ok(defined(name), `${name} is a class of the review pages' style sheets`);
  const panels = html.split('<section class="panel"').slice(1);
  assert.ok(panels.length >= 4, "the roles, two teams, the change");
  for (const panel of panels) assert.match(panel, /<details class="explain"><summary>What is this\?<\/summary>/);
});

// ---------------------------------------------------------------- Remove team reads the product's pull requests (ITM-1064)

// A pull request of GitHub's list as the host reads it: the item's identifier in its head branch, merged or not, into a base.
const pull = (number, { branch = "item/ITM-001-store-the-drafts", base = "main", state = "merged" } = {}) => ({
  number, title: `ITM-001: store the drafts (#${number})`, head: { ref: branch, sha: `${number}`.padStart(40, "0") }, base: { ref: base }, state: state === "open" ? "open" : "closed",
  draft: false, html_url: `https://github.com/${REPO}/pull/${number}`, created_at: "2026-09-20T09:00:00Z", merged_at: state === "merged" ? "2026-09-21T09:00:00Z" : null,
  closed_at: state === "open" ? null : "2026-09-21T09:00:00Z", body: "" });
function pullsServed(list, asked) {
  return async (url, init) => {
    if (url.origin !== "https://api.github.com" || url.pathname !== `/repos/${REPO}/pulls` || init.method !== "GET") return null;
    asked.push(url.search);
    if (list === null) return new Response(JSON.stringify({ message: "Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
    const wanted = url.searchParams.get("state") ?? "open", served = list.filter((p) => wanted === "all" || (wanted === "open") === (p.state === "open"));
    return new Response(JSON.stringify(Number(url.searchParams.get("page") ?? 1) === 1 ? served : []), { status: 200, headers: { "Content-Type": "application/json" } });
  };
}
const CLOSED_SPRINT = "---\nsprint: 1\ngoal: Store\nstart: 2026-09-14\nend: 2026-09-28\ncloser: alice\nbranch: sprint/team1/01\nselection:\n  - ITM-001\n---\n# team1 Sprint 01\n\n## Review\n\nDone.\n";
async function removeTeam1(list, { closed = false } = {}) {
  const asked = [];
  const files = fixtureFiles();
  if (closed) files["docs/backlog/sprints/team1/01.md"] = CLOSED_SPRINT;
  const server = await repoServer({ files, handlers: [pullsServed(list, asked)] });
  const page = await openDashboard({ server, hash: "#roles" });
  await page.click('[data-remove="team1"]');
  return { server, asked, said: inMain('[data-remove-result="team1"]')?.innerHTML ?? "" };
}

// TST-1064001 · level: component · module: MOD-implementation-pages
// guards: UC-048; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
// given: team1, whose sprint selected ITM-001, and a product whose server lists the merged pull request of ITM-001 into the default branch main
// input: Remove team for team1
// expect: the server was asked for the product's pull requests; the team is removed in one commit that deletes docs/role-assignments/team1.md; the result names no held item
test("#roles — a team whose sprint's item has a pull request merged into the default branch is removed", async () => {
  const { server, asked, said } = await removeTeam1([pull(31)]);
  assert.ok(asked.length > 0, "the pull requests were read");
  assert.equal(server.writes.length, 1);
  assert.deepEqual(Object.keys(server.writes[0].files), ["docs/role-assignments/team1.md"]);
  assert.doesNotMatch(said, /ITM-001/);
});

// TST-1064002 · level: component · module: MOD-implementation-pages
// guards: UC-048; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
// given: team1, whose sprint selected ITM-001; known positive: TST-1064001; and, in turn, a product whose server lists an open pull request of ITM-001, none at all, a pull request merged into another branch that no later merge brings to main, and a merged pull request of another item
// input: Remove team for team1 in each
// expect: in each the team is not removed, the result names ITM-001, and nothing is written
test("#roles — a team with an item whose pull request is open, merged elsewhere or missing is refused, the item named", async () => {
  const cases = [["an open pull request", [pull(32, { state: "open" })]], ["no pull request", []], ["a merge into another branch", [pull(33, { base: "sprint/team1/01" })]],
    ["a merged pull request of another item", [{ ...pull(34), title: "ITM-002: other (#34)", head: { ref: "item/ITM-002-other", sha: "4".repeat(40) } }]]];
  for (const [what, list] of cases) {
    const { server, asked, said } = await removeTeam1(list);
    assert.ok(asked.length > 0, `${what}: the pull requests were read`);
    assert.match(said, /ITM-001/, what);
    assert.equal(server.writes.length, 0, `${what}: nothing is written`);
  }
});

// TST-1064003 · level: component · module: MOD-implementation-pages
// guards: UC-048; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
// given: team1, whose sprint selected ITM-001 and is open, and again closed (its review recorded); a product whose server cannot list its pull requests (500)
// input: Remove team for team1 in each
// expect: the pull requests were asked for; the team is not removed, never guessed released: the result names ITM-001, and nothing is written
test("#roles — when the pull requests cannot be read, the team is not removed and the item is named", async () => {
  for (const closed of [false, true]) {
    const { server, asked, said } = await removeTeam1(null, { closed });
    assert.ok(asked.length > 0, "the pull requests were asked for");
    assert.match(said, /ITM-001/, closed ? "a closed sprint" : "an open sprint");
    assert.equal(server.writes.length, 0);
  }
  // known positive: with an empty list of pull requests a closed sprint, whose item no pull request of the sprint's branch merged, holds nothing
  const read = await removeTeam1([], { closed: true });
  assert.equal(read.server.writes.length, 1, "a closed sprint with the pull requests read and none merged is not held");
});
