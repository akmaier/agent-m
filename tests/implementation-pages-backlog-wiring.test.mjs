// The live app shows the routes of MOD-implementation-pages directly (ITM-681): `backlog`, `process` and `roles` are answered by the module's routes through the app's public route dispatch, and the files that took the
// module's place — docs/assets/dashboard/backlog-view.mjs, process-view.mjs and roles-view.mjs — are gone, with their rows in the table of views and their lines in built.json. As the accepted text of
// docs/architecture/MOD-implementation-pages.md states it in its Parts (blob 0a1451e6e24c): "docs/assets/dashboard/backlog-view.mjs: removed once this module's route `backlog` is built and the live app shows it. …
// process-view.mjs, roles-view.mjs: removed: the live app shows the routes `process` and `roles` directly."
// Run: node --test tests/implementation-pages-backlog-wiring.test.mjs
//
// Module: MOD-implementation-pages
// Guards: UC-002; UC-032; UC-033; UC-048; EVERY CODE FILE BELONGS TO A MODULE; A PAGE LOAD READS THE REPOSITORY IN BATCHES
// Level: component
//
// The real dashboard (the harness's APP_FILE) runs in tests/app-harness.mjs against a GitHub API mock. Each test states its input and its expected result before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { repoServer, openDashboard, APP_FILE } from "./app-harness.mjs";

const { DASHBOARD } = await import(APP_FILE.href);
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const VIEWS = new URL("../docs/assets/dashboard/", import.meta.url);
const imported = [];
registerHooks({
  resolve(specifier, context, next) {
    let url = null;
    try { url = new URL(specifier, context.parentURL); } catch { /* a bare specifier: no file of the site */ }
    if (url?.protocol === "file:" && url.href.startsWith(VIEWS.href)) imported.push(decodeURIComponent(url.pathname.slice(VIEWS.pathname.length)));
    return next(specifier, context);
  },
});

const TAKEN = [["backlog", "backlog-view.mjs"], ["process", "process-view.mjs"], ["roles", "roles-view.mjs"]];

// TST-681101 · level: component · module: MOD-implementation-pages
// guards: EVERY CODE FILE BELONGS TO A MODULE; UC-024
// given: the table of views (src/site/views.mjs), the list of built files (docs/assets/dashboard/built.json) and the folder docs/assets/dashboard/
// input: look up the views backlog, process and roles, and the three files that served them
// expect: each of the three views is a row of the table that no file serves — it is answered by a module's route (builtIn) —; built.json names none of the three files; none of the three files is in the folder
test("the files that took the module's place are gone, with their rows and their lines", () => {
  const built = JSON.parse(read("docs/assets/dashboard/built.json"));
  for (const [view, file] of TAKEN) {
    const entry = DASHBOARD.find((each) => each.view === view);
    assert.ok(entry, `known positive: the table has the view ${view}`);
    assert.equal(entry.builtIn, true, `${view} is answered by a module's route`);
    assert.equal(entry.file, undefined, `${view} names no file`);
    assert.ok(!built.includes(file), `built.json does not name ${file}`);
    assert.equal(existsSync(new URL(file, VIEWS)), false, `${file} is gone`);
  }
});

// TST-681102 · level: component · module: MOD-implementation-pages
// guards: UC-002; UC-032; UC-048
// given: the live app's source
// input: read how the app dispatches the addresses #backlog, #process and #roles
// expect: the app finds each route in MOD-implementation-pages' view by its name and renders it; it names none of the three files
test("the app dispatches #backlog, #process and #roles to the routes of MOD-implementation-pages", () => {
  const app = readFileSync(APP_FILE, "utf8");
  assert.match(app, /implementationPages = viewOf\("implementation-pages"\)/, "the view is the one the page's data-views names");
  assert.doesNotMatch(app, /from "\.\.\/implementation-pages\/index\.mjs"/, "the app imports no page module");
  assert.match(app, /implementationPages\.routes\.find\(\(r\) => r\.name === "backlog"\)/);
  assert.match(app, /kind === "process" \|\| kind === "roles"/);
  assert.match(app, /implementationPages\.routes\.find\(\(r\) => r\.name === kind\)/);
  for (const [, file] of TAKEN) assert.ok(!app.includes(`"${file}"`), `the app names no ${file}`);
});

// TST-681103 · level: component · module: MOD-implementation-pages
// guards: UC-002; UC-032; UC-048; A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: a product that declares the Scrum model with a limit, with one team, its sprint and an item
// input: open #backlog, #process and #roles, each in a fresh page
// expect: each page shows its own route's page — the backlog's panels, the process page, the roles' part — and asks for none of the three files
test("a load of each of the three addresses shows the module's page and asks for no file of the folder of views", async () => {
  const model = read("tests/fixtures/flow/scrum-wip.md");
  const files = {
    "SPEC.md": "# SPEC\n\n## 1. Rules\n\n**RULE ONE** *(PO, 2026-09-01)*\nA rule.\n*Check:* no automatic check; at review.\n",
    "docs/process.md": ["---", "model: fixture-scrum-wip", "model_file: docs/process-models/fixture.md", `model_version: ${"a".repeat(40)}`, "---", "# How the fixture product is developed", "", "## Practices", "", "- none", "",
      "## Branches", "", "| Phase or time box | Branch |", "|---|---|", "", "## Definition of Done", "", "The job rules hold.", ""].join("\n"),
    "docs/process-models/fixture.md": model,
    "docs/role-assignments/team1.md": "# team1\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Owner | alice |\n| Builders | dev-a |\n| Checker | dev-a |\n",
    "docs/backlog/ITM-001-store-the-drafts.md": ["---", "id: ITM-001", "title: Store the drafts", "level: module", "realises:", "  - RULE ONE", "modules:", "  - MOD-store", "builds_on: []", "tests:", "  - unit",
      "origin:", "  - RULE ONE", "---", "# ITM-001 Store the drafts", "", "## Outcome", "", "Done.", "", "## Acceptance", "", "- a unit test.", ""].join("\n"),
    "docs/backlog/sprints/team1/01.md": "---\nsprint: 1\ngoal: Store\nstart: 2026-09-14\nend:\ncloser: alice\nbranch:\nselection:\n  - ITM-001\n---\n# team1 Sprint 01\n",
  };
  const pulls = async (url, init) => (url.origin === "https://api.github.com" && url.pathname.endsWith("/pulls") && init.method === "GET"
    ? new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }) : null);
  const shows = { "#backlog": /data-part="backlog"/, "#process": /<article class="process-page">/, "#roles": /data-part="roles"/ };
  for (const [hash, pattern] of Object.entries(shows)) {
    const from = imported.length;
    const page = await openDashboard({ server: await repoServer({ files, handlers: [pulls] }), hash });
    assert.match(page.main(), pattern, `${hash} shows its route's page`);
    assert.deepEqual(imported.slice(from).filter((file) => /^(backlog|process|roles)-view\.mjs$/.test(file)), [], `${hash} asks for none of the three files`);
  }
});
