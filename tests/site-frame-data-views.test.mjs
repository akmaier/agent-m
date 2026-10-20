// MOD-site-frame: the live dashboard loads its views as `data-views` names them (ITM-1116), as the accepted text of docs/architecture/MOD-site-frame.md states it: "an entry page names the view
// modules it carries, and the frame loads them through the `View` interface it defines and routes to them … It never names a view itself", and, under Data, "`data-views` — the slugs of the view
// modules this page loads"; `DEVELOP AGAINST INTERFACES`.
// Run: node --test tests/site-frame-data-views.test.mjs
//
// Module: MOD-site-frame
// Guards: DEVELOP AGAINST INTERFACES
// Level: unit
//
// The app runs in tests/app-harness.mjs against the mock of the repository's server, as the tests of the dashboard do. The harness gives the document the script tag that loads the app, with the
// `data-views` attribute of the page. Where the module file leaves a reading open, the test states the one it takes, and the pull request names it:
//   - The app finds its script tag as start.mjs does: the tag whose `src`, read against the page's address, is the app's own address; the slugs are the words of its `data-views`.
//   - The app loads the view of each slug from `../<slug>/index.mjs` (routing.mjs' loadView), and a slug whose module is not served fails the load with an error that names the slug.
//   - "The page's menu and routes unchanged" is: the menu the page draws, and the heading of each route it leads to, as tests/dashboard-shell.test.mjs states them.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { repoServer, openDashboard } from "./app-harness.mjs";

const FILES = {
  "SPEC.md": "# Fixture — Specification\n\n## 1. Rules\n\n**A RULE** *(Owner)*\nA rule.\n*Check:* no automatic check; at review.\n",
  "docs/use-cases/UC-001-add-a-product.md": "---\nid: UC-001\ntitle: Add a product\narea: products\nactors:\n  - Owner\nrealises:\n  - A RULE\n---\n# UC-001 Add a product\n\n**Goal.** Add one.\n",
};

// TST-1116001 · level: unit · module: MOD-site-frame
// guards: DEVELOP AGAINST INTERFACES
// given: the file of the live app, src/site-frame/dashboard-app.mjs
// input: its import declarations
// expect: it imports no module of a page (a folder of src/ named <something>-pages); counter-proof: the same check finds such an import in a planted import line
test("the live app imports no page module", () => {
  const text = readFileSync(new URL("../src/site-frame/dashboard-app.mjs", import.meta.url), "utf8");
  const pageImports = (source) => [...source.matchAll(/^import .*from "\.\.\/([a-z-]+-pages)\/index\.mjs";/gm)].map((match) => match[1]);
  assert.deepEqual(pageImports('import { view as planted } from "../review-pages/index.mjs";\n'), ["review-pages"], "known positive: the check finds a page import");
  assert.deepEqual(pageImports(text), []);
});

// TST-1116002 · level: unit · module: MOD-site-frame
// guards: DEVELOP AGAINST INTERFACES
// given: the page's script tag names the six views of the live page in `data-views`
// input: open the dashboard, and each address the menu leads to
// expect: the menu is the stages of the process in their order, each linked to its page, and each address draws its page — the settings, the use cases, the maintenance mail, the implementation backlog, the trace
test("the live app draws its menu and its routes from the views data-views names", async () => {
  const page = await openDashboard({ server: await repoServer({ files: FILES }) });
  const menu = page.el("tabs");
  for (const entry of ["Requirements", "Use cases", "Architecture", "Implementation", "Maintenance", "Settings"]) assert.ok(menu.includes(entry), `the menu leads to ${entry}`);
  const heading = async (hash) => { await page.go(hash); return (/<h2>([^<]*)/.exec(page.main()) || [])[1]?.trim(); };
  assert.equal(await heading("#uc"), "Use cases");
  assert.equal(await heading("#settings"), "Settings");
  assert.equal(await heading("#mail"), "Mail", "the maintenance pages answer");
  await page.go("#backlog");
  assert.ok(page.main().length > 0 && !page.main().includes("<h2>Mail"), "the implementation pages answer");
});

// TST-1116003 · level: unit · module: MOD-site-frame
// guards: DEVELOP AGAINST INTERFACES
// given: the page's script tag names a view module that is not served, `no-such-pages`, beside the six
// input: open the dashboard
// expect: the load fails with an error that names no-such-pages — the app takes its views from data-views; counter-proof: the same page without that slug opens
test("the live app loads the views data-views names, and fails naming one that is not served", async () => {
  const server = await repoServer({ files: FILES });
  await assert.rejects(openDashboard({ server, views: ["review-pages", "trace-pages", "implementation-pages", "test-pages", "maintenance-pages", "settings-pages", "no-such-pages"] }),
    /no-such-pages/);
  const page = await openDashboard({ server: await repoServer({ files: FILES }) });
  assert.ok(page.el("tabs").includes("Settings"), "the page opens without that slug");
});
