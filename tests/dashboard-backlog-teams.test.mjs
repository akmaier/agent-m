// The Backlog page shows the state of the current process first — each team's running sprint, what it holds, the state of
// each held item and its burn-down, or that the team runs none, with Plan sprint for it —, then the backlog, each item after
// the items it builds on, with its state and what keeps it from a team's selection (UC-032 steps 1, 5 and 6; UC-035; the
// user's order of the page). Plan sprint lists what the team may select; Start sprint commits the team's sprint through
// MOD-work-plans' startSprint. The page is laid out as #uc and #arc are: a head, panels, list tables, buttons, badges and a
// folded "What is this?" — no style of its own.
// Run: node --test tests/dashboard-backlog-teams.test.mjs
//
// Module: MOD-dashboard-app
// Guards: UC-032; UC-035; EVERY TEAM RUNS SPRINTS OF ITS OWN; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES; SPRINT PLANNING SHOWS WHAT THE OTHER TEAMS' SPRINTS HOLD; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; EVERY STEP EXPLAINS ITSELF
// Level: component
//
// The real dashboard (docs/assets/dashboard-app.mjs) and its view docs/assets/dashboard/backlog-view.mjs run in
// tests/app-harness.mjs against a GitHub API mock; this file brings a fake of GitHub's pulls API and of "Create a reference".
// The fixture product works in sprints without a time box, with a work-in-progress limit of 2, and has two teams. team1 runs
// its sprint 01 since 2026-09-14 on its own branch, with ITM-001 — merged into that branch on 2026-09-15 — and ITM-002, whose
// pull request is open; team2 closed its sprint 01 and sent ITM-003 back to the backlog. ITM-004 builds on ITM-003; ITM-005
// changes MOD-store, which ITM-001 changes; ITM-006 realises a requirement that is not accepted. The burn-down of a running
// sprint runs to today, so only its first days are checked.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readDocument } from "../src/documents/index.mjs";
import { planSchemas } from "../src/work-plans/index.mjs";
import { repoServer, openDashboard, REPO } from "./app-harness.mjs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const inMain = (selector) => globalThis.document.getElementById("main").querySelector(selector);

// ---------------------------------------------------------------- fakes of GitHub's pulls API and of "Create a reference"

function pr({ number, item, base, created, merged = null }) {
  return { number, title: `${item}: the work of ${item}`, head: { ref: `team/${item}`, sha: "b".repeat(40) }, base: { ref: base },
    state: merged ? "closed" : "open", created_at: created, merged_at: merged, merge_commit_sha: merged ? "f".repeat(40) : null,
    body: "developer-a · fixture-model\n\nWhat the pull request does." };
}
function pullsApi(prs) {
  return async (url, init) => {
    if (url.origin !== "https://api.github.com" || url.pathname !== `/repos/${REPO}/pulls`) return null;
    if (init.method !== "GET") return new Response("{}", { status: 405 });
    const base = url.searchParams.get("base"), state = url.searchParams.get("state") ?? "open";
    const per = Number(url.searchParams.get("per_page") ?? 30), page = Number(url.searchParams.get("page") ?? 1);
    const list = prs.filter((p) => !base || p.base.ref === base).filter((p) => state === "all" || p.state === state)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return new Response(JSON.stringify(list.slice((page - 1) * per, page * per)), { status: 200, headers: { "Content-Type": "application/json" } });
  };
}
function refsApi(created) {
  return async (url, init) => {
    if (url.origin !== "https://api.github.com" || url.pathname !== `/repos/${REPO}/git/refs` || init.method !== "POST") return null;
    const body = JSON.parse(init.body);
    created.push(body);
    return new Response(JSON.stringify({ ref: body.ref, object: { sha: body.sha } }), { status: 201, headers: { "Content-Type": "application/json" } });
  };
}

// ---------------------------------------------------------------- the fixture product

const SPEC = "# SPEC\n\n## 1. Rules\n\n**RULE ONE** *(PO, 2026-09-01)*\nThe first rule.\n*Check:* no automatic check; at review.\n\n"
  + "**RULE TWO** *(PO, 2026-09-01)*\nThe second rule, which no item realises.\n*Check:* no automatic check; at review.\n";
const DECLARATION = ["---", "model: fixture-scrum-wip", "model_file: docs/process-models/fixture.md",
  `model_version: ${"a".repeat(40)}`, "---", "# How the fixture product is developed", "", "## Practices", "", "- none", "",
  "## Branches", "", "| Phase or time box | Branch |", "|---|---|", "| Sprint | `sprint/<team>/<nn>` |", "",
  "## Definition of Done", "", "The job rules hold.", ""].join("\n");
const assignment = (team, owner, builder) => `# ${team}\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Owner | ${owner} |\n`
  + `| Builders | ${builder} |\n| Checker | ${builder} |\n`;
const moduleFile = (id, uses) => `---\nid: ${id}\ntitle: The module ${id}\nfolder: src/${id.slice(4)}/\nrealises:\n  - RULE ONE\n`
  + `follows:\n  - ARC-001\nuses:${uses.length ? `\n${uses.map((u) => `  - ${u}`).join("\n")}` : " []"}\nprovides:\n  - read\n---\n`
  + `# ${id} The module ${id}\n`;
const id = (n) => `ITM-${String(n).padStart(3, "0")}`;
const itemPath = (n) => `docs/backlog/${id(n)}-item-${n}.md`;
const itemText = (n, { modules, buildsOn = [], realises = ["RULE ONE"] }) => ["---", `id: ${id(n)}`, `title: The work of item ${n}`,
  "level: module", "realises:", ...realises.map((r) => `  - ${r}`), "modules:", ...modules.map((m) => `  - ${m}`),
  ...(buildsOn.length ? ["builds_on:", ...buildsOn.map((b) => `  - ${b}`)] : ["builds_on: []"]), "tests:", "  - unit", "origin:",
  "  - RULE ONE", "---", `# ${id(n)} The work of item ${n}`, "", "## Outcome", "", `What item ${n} delivers.`, "", "## Acceptance", "",
  "- a unit test.", ""].join("\n");
const TEAM1_SPRINT = "docs/backlog/sprints/team1/01.md";
const TEAM2_SPRINT = "docs/backlog/sprints/team2/01.md";

function fixtureFiles() {
  return {
    "SPEC.md": SPEC, "docs/process.md": DECLARATION, "docs/process-models/fixture.md": read("tests/fixtures/flow/scrum-wip.md"),
    "docs/role-assignments/team1.md": assignment("team1", "alice", "dev-a"),
    "docs/role-assignments/team2.md": assignment("team2", "bob", "dev-b"),
    "docs/architecture/MOD-store.md": moduleFile("MOD-store", []),
    "docs/architecture/MOD-pages.md": moduleFile("MOD-pages", ["MOD-store.read"]),
    "docs/architecture/MOD-mail.md": moduleFile("MOD-mail", []),
    "docs/architecture/MOD-feed.md": moduleFile("MOD-feed", ["MOD-mail.read"]),
    [itemPath(1)]: itemText(1, { modules: ["MOD-store"] }),
    [itemPath(2)]: itemText(2, { modules: ["MOD-pages"], buildsOn: ["ITM-001"] }),
    [itemPath(3)]: itemText(3, { modules: ["MOD-mail"] }),
    [itemPath(4)]: itemText(4, { modules: ["MOD-feed"], buildsOn: ["ITM-003"] }),
    [itemPath(5)]: itemText(5, { modules: ["MOD-store"] }),
    [itemPath(6)]: itemText(6, { modules: ["MOD-mail"], realises: ["RULE NOT ACCEPTED"] }),
    [TEAM1_SPRINT]: "---\nsprint: 1\ngoal: Store and show\nstart: 2026-09-14\nend:\ncloser: alice\nbranch: sprint/team1/01\n"
      + "selection:\n  - ITM-001\n  - ITM-002\n---\n# team1 Sprint 01\n",
    [TEAM2_SPRINT]: "---\nsprint: 1\ngoal: Mail\nstart: 2026-09-01\nend: 2026-09-07\ncloser: bob\nbranch:\nselection:\n  - ITM-003\n---\n"
      + "# team2 Sprint 01\n\n## Review\n\nNo item is done.\n\n## Unfinished items\n\nto the backlog: ITM-003\ninto the next sprint:\n\n"
      + "ITM-003 waits for the mail server.\n\n## Retrospective\n\n- change: smaller items.\n",
  };
}
const PRS = [pr({ number: 1, item: "ITM-001", base: "sprint/team1/01", created: "2026-09-14T10:00:00Z", merged: "2026-09-15T10:00:00Z" }),
  pr({ number: 2, item: "ITM-002", base: "sprint/team1/01", created: "2026-09-15T12:00:00Z" }),
  // Counter-proofs: a pull request that names no item; one of ITM-005 merged into a branch that is no sprint's and not the
  // default branch.
  { ...pr({ number: 3, item: "ITM-000", base: "sprint/team1/01", created: "2026-09-15T13:00:00Z", merged: "2026-09-15T14:00:00Z" }),
    title: "Tidy the README", head: { ref: "team/tidy", sha: "b".repeat(40) } },
  pr({ number: 4, item: "ITM-005", base: "experiment/x", created: "2026-09-15T13:00:00Z", merged: "2026-09-15T15:00:00Z" })];

// A same-day sprint: team1's sprint 01 starts on 2026-09-14 with ITM-001, ITM-002 and ITM-005; ITM-001 is merged into its
// branch at 09:30 UTC that day and ITM-005 at 11:45 UTC, and ITM-002's pull request is open.
const SAME_DAY_SPRINT = "---\nsprint: 1\ngoal: Store and show\nstart: 2026-09-14\nend:\ncloser: alice\nbranch: sprint/team1/01\n"
  + "selection:\n  - ITM-001\n  - ITM-002\n  - ITM-005\n---\n# team1 Sprint 01\n";
const SAME_DAY_PRS = [pr({ number: 1, item: "ITM-001", base: "sprint/team1/01", created: "2026-09-14T08:00:00Z", merged: "2026-09-14T09:30:00Z" }),
  pr({ number: 2, item: "ITM-002", base: "sprint/team1/01", created: "2026-09-14T08:10:00Z" }),
  pr({ number: 5, item: "ITM-005", base: "sprint/team1/01", created: "2026-09-14T08:20:00Z", merged: "2026-09-14T11:45:00Z" })];

// A closed sprint with merges: team2's sprint 01 ran from 2026-09-01 to 2026-09-07 with ITM-003, ITM-004 and ITM-006; ITM-003
// was merged into the default branch on 2026-09-02 at 10:15 UTC and ITM-004 on 2026-09-03 at 16:40 UTC, and ITM-006 went back
// to the backlog.
const CLOSED_SPRINT = "---\nsprint: 1\ngoal: Mail\nstart: 2026-09-01\nend: 2026-09-07\ncloser: bob\nbranch:\nselection:\n  - ITM-003\n"
  + "  - ITM-004\n  - ITM-006\n---\n# team2 Sprint 01\n\n## Review\n\nITM-003 and ITM-004 are done.\n\n## Unfinished items\n\n"
  + "to the backlog: ITM-006\ninto the next sprint:\n\nITM-006 waits for its requirement.\n\n## Retrospective\n\n- change: smaller items.\n";
const CLOSED_PRS = [...PRS,
  pr({ number: 6, item: "ITM-003", base: "main", created: "2026-09-01T09:00:00Z", merged: "2026-09-02T10:15:00Z" }),
  pr({ number: 7, item: "ITM-004", base: "main", created: "2026-09-02T11:00:00Z", merged: "2026-09-03T16:40:00Z" })];

async function backlogPage({ created = [], files = fixtureFiles(), prs = PRS } = {}) {
  const server = await repoServer({ files, handlers: [pullsApi(prs), refsApi(created)] });
  const page = await openDashboard({ server, hash: "#backlog" });
  return { server, page, created };
}
// The HTML of the part that begins with `marker` and ends where the next panel begins.
function part(html, marker) {
  const at = html.indexOf(marker);
  assert.ok(at >= 0, `the page has ${marker}`);
  const next = html.indexOf('<section class="panel"', at + marker.length);
  return html.slice(at, next < 0 ? undefined : next);
}
const row = (html, item) => { const at = html.indexOf(`data-item="${item}"`); return at < 0 ? "" : html.slice(at, html.indexOf("</tr>", at)); };

// ---------------------------------------------------------------- the state of the current process first

// guards: UC-032; UC-035; the user's order of the page
// given: the fixture product, both teams named by their role assignments
// input: open #backlog
// expect: the head, then team1's panel, then team2's, then the backlog, then the names no item realises yet — in that order
test("#backlog — the teams' sprints come first, then the backlog, then what no item realises yet", async () => {
  const { page } = await backlogPage();
  const html = page.main();
  const order = ['<section class="head"', 'data-team="team1"', 'data-team="team2"', 'data-part="backlog"', 'data-part="uncovered"']
    .map((marker) => html.indexOf(marker));
  assert.ok(order.every((at) => at >= 0), String(order));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});

// guards: UC-035; EVERY TEAM RUNS SPRINTS OF ITS OWN; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH;
//         PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: team1's running sprint 01 with ITM-001, merged into its branch on 2026-09-15, and ITM-002, whose pull request is open
// input: open #backlog
// expect: team1's panel names its sprint team1/01 and its goal; lists ITM-001 done and ITM-002 in progress, each with the
//         module it changes; and holds the sprint's burn-down as a Mermaid chart that begins with 2 remaining on its first day
//         and 1 from the merge on
test("#backlog — a team's running sprint: its items with their states and modules, and its burn-down", async () => {
  const { page } = await backlogPage();
  const team1 = part(page.main(), 'data-team="team1"');
  assert.match(team1, /team1\/01/);
  assert.match(team1, /Store and show/);
  assert.match(row(team1, "ITM-001"), /done/);
  assert.match(row(team1, "ITM-001"), /MOD-store/);
  assert.match(row(team1, "ITM-002"), /in progress/);
  assert.match(team1, /<code class="language-mermaid">xychart-beta/);
  assert.match(team1, /line \[2, 1/);
});

// guards: UC-035; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: the same-day sprint — team1's sprint 01 starts on 2026-09-14 with three items; ITM-001 is merged at 09:30 UTC and
//        ITM-005 at 11:45 UTC that day, and ITM-002's pull request is open
// input: open #backlog
// expect: team1's chart shows four points — the start, the two merges by their time and now — with 3, 2, 1 and 1 items left
test("#backlog — a running sprint's chart: the items left at its start, after each merge, and now", async () => {
  const { page } = await backlogPage({ files: { ...fixtureFiles(), [TEAM1_SPRINT]: SAME_DAY_SPRINT }, prs: SAME_DAY_PRS });
  const team1 = part(page.main(), 'data-team="team1"');
  assert.match(team1, /<code class="language-mermaid">xychart-beta/);
  assert.match(team1, /x-axis \[&quot;start&quot;, &quot;09:30&quot;, &quot;11:45&quot;, &quot;now&quot;\]/);
  assert.match(team1, /line \[3, 2, 1, 1\]/);
});

// guards: UC-035; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: team2's closed sprint 01, from 2026-09-01 to 2026-09-07, with ITM-003, ITM-004 and ITM-006; ITM-003 merged into the
//        default branch on 2026-09-02 at 10:15 UTC and ITM-004 on 2026-09-03 at 16:40 UTC; ITM-006 went back to the backlog
// input: open #backlog
// expect: team2's panel still says it runs no sprint, names its last sprint and offers Plan sprint, and shows that sprint's
//         final chart: start, the two merges by their date and time, and end — 3, 2, 1 and 1 items left — and no "now"
test("#backlog — a team's closed sprint: its final chart from start through each merge to end", async () => {
  const { page } = await backlogPage({ files: { ...fixtureFiles(), [TEAM2_SPRINT]: CLOSED_SPRINT }, prs: CLOSED_PRS });
  const team2 = part(page.main(), 'data-team="team2"');
  assert.match(team2, /no running sprint/i);
  assert.match(team2, /Its last sprint, .*team2\/01/s);
  assert.match(team2, /data-plan="team2"/);
  assert.match(team2, /x-axis \[&quot;start&quot;, &quot;09-02 10:15&quot;, &quot;09-03 16:40&quot;, &quot;end&quot;\]/);
  assert.match(team2, /line \[3, 2, 1, 1\]/);
  assert.doesNotMatch(team2, /&quot;now&quot;/);
});

// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: the fixture product, whose pull requests fit into one page of GitHub's pulls API
// input: open #backlog
// expect: the load lists the pull requests in one request, and makes 20 requests in all — as many as before the chart showed
//         each merge: the merge times come from the pull requests the page reads anyway
test("#backlog — the chart's merges cost no request: one listing of the pull requests, and 20 requests in all", async () => {
  const { page } = await backlogPage();
  assert.equal(page.requests.filter((r) => /\/pulls(?:\?|\/|$)/.test(r)).length, 1, page.requests.join(" | "));
  assert.equal(page.requests.length, 20, page.requests.join(" | "));
});

// guards: UC-032 step 6; UC-035
// given: team2, whose only sprint is closed
// input: open #backlog
// expect: team2's panel says it runs no sprint, names its last sprint, team2/01, and offers Plan sprint for team2
test("#backlog — a team without a running sprint says so, and offers Plan sprint", async () => {
  const { page } = await backlogPage();
  const team2 = part(page.main(), 'data-team="team2"');
  assert.match(team2, /no running sprint/i);
  assert.match(team2, /team2\/01/);
  assert.match(team2, /data-plan="team2"/);
});

// guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032 step 7
// given: the model's work-in-progress limit of 2; team1's sprint holding ITM-002 in progress
// input: open #backlog
// expect: team1's panel says how many of its items are in progress against the limit: 1 of 2
test("#backlog — a team's panel names its items in progress against the model's limit", async () => {
  const { page } = await backlogPage();
  assert.match(part(page.main(), 'data-team="team1"'), /1 of 2 items in progress/);
});

// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the fixture product, with a pull request that names no item and one of ITM-005 merged into a branch that is neither
//        a sprint's nor the default branch
// input: open #backlog
// expect: every request of the load is a read — nothing is written —; ITM-005 is still ready, and no other state changes
test("#backlog — a load writes nothing; a pull request naming no item, or merged elsewhere, changes no state", async () => {
  const { page, server } = await backlogPage();
  assert.equal(server.writes.length, 0);
  assert.ok(page.requests.every((r) => !/^(write|other (POST|PUT|PATCH|DELETE))/.test(r)), page.requests.join(" | "));
  assert.match(row(part(page.main(), 'data-part="backlog"'), "ITM-005"), />ready</);
});

// ---------------------------------------------------------------- then the backlog

// guards: UC-032 steps 1 and 5; SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES
// given: the fixture's six items
// input: open #backlog
// expect: one row per item, each after the items it builds on; ITM-001 done, ITM-002 in progress, ITM-003 ready, ITM-004
//         waiting for an item it builds on, naming ITM-003, ITM-006 waiting for acceptance; ITM-005 marked as kept from team2,
//         naming the sprint team1/01, the item ITM-001 and the module MOD-store
test("#backlog — the backlog: each item after the items it builds on, its state, and what keeps it from a team", async () => {
  const { page } = await backlogPage();
  const backlog = part(page.main(), 'data-part="backlog"');
  const rows = [...backlog.matchAll(/<tr data-item="(ITM-\d{3})"/g)].map((m) => m[1]);
  assert.deepEqual(rows, ["ITM-001", "ITM-002", "ITM-003", "ITM-004", "ITM-005", "ITM-006"]);
  assert.match(row(backlog, "ITM-001"), /done/);
  assert.match(row(backlog, "ITM-002"), /in progress/);
  assert.match(row(backlog, "ITM-003"), />ready</);
  assert.match(row(backlog, "ITM-004"), /waiting for an item it builds on/);
  assert.match(row(backlog, "ITM-004"), /ITM-003/);
  assert.match(row(backlog, "ITM-006"), /waiting for acceptance/);
  const kept = row(backlog, "ITM-005");
  for (const named of ["team2", "team1/01", "ITM-001", "MOD-store"]) assert.ok(kept.includes(named), `ITM-005 names ${named}`);
});

// ---------------------------------------------------------------- Plan sprint and Start sprint

// guards: UC-032 step 6, 6c; EVERY TEAM RUNS SPRINTS OF ITS OWN; SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER
//         CHANGES OR USES; A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN
// given: the fixture product; the person's token
// input: click Plan sprint for team2; set the goal and the closer; select ITM-003; click Start sprint
// expect: the plan lists ITM-003 to select and ITM-005 disabled, kept by team1's sprint; the closer preset to team2's Owner,
//         bob; Start sprint creates the branch
//         sprint/team2/02 and commits docs/backlog/sprints/team2/02.md — sprint 2, the goal, the selection ITM-003 — and
//         nothing else
test("#backlog — Plan sprint for a team: kept items cannot be selected; Start sprint commits the team's next sprint", async () => {
  const { page, server, created } = await backlogPage();
  await page.click('[data-plan="team2"]');
  assert.ok(inMain('[data-select-item="ITM-003"]'), "ITM-003 can be selected");
  assert.equal(inMain('[data-select-item="ITM-005"]').disabled, true, "ITM-005 is kept from team2");
  assert.match(page.main(), /<input data-sprint-closer value="bob">/, "the closer is preset to team2's Owner");
  // The harness's controls do not read an input's value from its HTML, as a browser does: the test types both fields.
  inMain('[data-sprint-goal]').value = "Mail again";
  inMain('[data-sprint-closer]').value = "bob";
  inMain('[data-select-item="ITM-003"]').checked = true;
  await page.click('[data-start-sprint]');
  assert.deepEqual(created.map((c) => c.ref), ["refs/heads/sprint/team2/02"]);
  assert.equal(server.writes.length, 1, "one commit");
  assert.deepEqual(Object.keys(server.writes[0].files), ["docs/backlog/sprints/team2/02.md"]);
  const record = readDocument(planSchemas.sprint, "docs/backlog/sprints/team2/02.md", server.writes[0].files["docs/backlog/sprints/team2/02.md"]);
  assert.deepEqual([record.fields.sprint, record.fields.goal, record.fields.selection, record.fields.branch],
    [2, "Mail again", ["ITM-003"], "sprint/team2/02"]);
});

// guards: SPRINT PLANNING SHOWS WHAT THE OTHER TEAMS' SPRINTS HOLD; UC-032 step 5
// given: the fixture product; team1's sprint 01 holds ITM-001, which changes MOD-store, and ITM-002, which changes
//        MOD-pages, which uses MOD-store; team2 runs no sprint, and its closed sprint 01 sent ITM-003 back to the backlog
// input: click Plan sprint for team2; then Cancel, and Plan sprint for team1
// expect: beside team2's plan, what the other teams' sprints hold: ITM-001 and ITM-002, each with its title, team1/01, the
//         modules it changes and the modules they use, and nothing else; beside team1's, that no other team's sprint holds
//         an item
test("#backlog — Plan sprint lists every item the other teams' sprints hold, with its sprint and the modules it changes and uses", async () => {
  const { page } = await backlogPage();
  await page.click('[data-plan="team2"]');
  const others = part(page.main(), 'data-part="held"');
  const cells = (item) => {
    const at = others.indexOf(`data-held="${item}"`);
    if (at < 0) return null;
    return others.slice(at, others.indexOf("</tr>", at)).split("<td").slice(1).map((cell) => cell.replace(/^[^>]*>/, "").replace(/<[^>]+>/g, "").trim());
  };
  assert.deepEqual(cells("ITM-001"), ["ITM-001", "The work of item 1", "team1/01", "MOD-store", "—"]);
  assert.deepEqual(cells("ITM-002"), ["ITM-002", "The work of item 2", "team1/01", "MOD-pages", "MOD-store"]);
  assert.equal(others.match(/data-held="/g).length, 2, "nothing else is listed");
  await page.click("[data-cancel-plan]");
  await page.click('[data-plan="team1"]');
  assert.match(part(page.main(), 'data-part="held"'), /No other team's sprint holds an item\./);
});

// ---------------------------------------------------------------- the layout of #uc and #arc

// guards: EVERY STEP EXPLAINS ITSELF; the user's layout of the pages
// given: the fixture product, its plan for team2 open
// input: open #backlog, click Plan sprint for team2
// expect: the title in a section.head, every button a btn and every folded explanation a details.explain; the page holds
//         no style attribute, none of the old board's classes, and no class docs/assets/style.css — the
//         stylesheet of #uc and #arc — does not define, but for the language of the burn-down's diagram, which the Markdown
//         renderer marks for Mermaid as it does on #uc and #arc; every panel explains itself
test("#backlog — the page is laid out as #uc and #arc are: panels, list tables, buttons and badges, no style of its own", async () => {
  const { page } = await backlogPage();
  await page.click('[data-plan="team2"]');
  const html = page.main();
  // The shared layout of #uc and #arc, as tests/dashboard-shared-layout.test.mjs reads it: the title in a section.head, every
  // button a btn, every folded explanation a details.explain.
  const tags = (name) => html.match(new RegExp(`<${name}\\b[^>]*>`, "g")) ?? [];
  const classesOf = (tag) => (/\sclass="([^"]*)"/.exec(tag)?.[1] ?? "").split(/\s+/).filter(Boolean);
  const head = html.slice(0, html.indexOf("<h2")).match(/<section\b[^>]*>/g)?.at(-1) ?? "";
  assert.ok(classesOf(head).includes("head"), `the title stands in a section.head: ${head}`);
  assert.ok(tags("button").length > 0 && tags("details").length > 0, "known positive: the page has buttons and explanations");
  assert.deepEqual(tags("button").filter((tag) => !classesOf(tag).includes("btn")), [], "every button is a btn");
  assert.deepEqual(tags("details").filter((tag) => !classesOf(tag).includes("explain")), [], "every details is an explain");
  assert.doesNotMatch(html, /\sstyle="/);
  assert.doesNotMatch(html, /class="(board|column|card|cards|step)\b/);
  const style = read("docs/assets/style.css");
  const defined = (name) => new RegExp(`\\.${name}(?![\\w-])`).test(style);
  assert.ok(defined("panel") && !defined("board"), "known positive and negative of the search");
  const classes = new Set([...html.matchAll(/\sclass="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/).filter(Boolean)));
  assert.ok(classes.has("language-mermaid"), "known positive: the burn-down's diagram is on the page");
  for (const name of classes) if (name !== "language-mermaid") assert.ok(defined(name), `${name} is a class of docs/assets/style.css`);
  const panels = html.split('<section class="panel"').slice(1);
  assert.ok(panels.length >= 4, "the teams, the backlog, what no item realises, the plan");
  for (const panel of panels) assert.match(panel, /<details class="explain"><summary>What is this\?<\/summary>/);
});
