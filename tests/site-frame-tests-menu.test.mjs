// The live dashboard reaches MOD-test-pages' routes `runs`, `schedule` and `generate`, and MOD-trace-pages' route `trace` for its own fragment (ITM-1206), as it reaches
// `release` (ITM-682) and `mail` (ITM-1099, tests/site-frame-maintenance-menu.test.mjs) — MOD-site-frame.md, Data: the page names the view modules it loads in
// `data-views`, `test-pages` and `trace-pages` among them; and Parts, taken over: `src/site/views.mjs` and `docs/assets/dashboard/built.json` list the views the live
// app builds. Each view is a built-in one without a file of its own, the app hands its address to the module's route, and the menu entry Tests opens `runs`.
// Run: node --test tests/site-frame-tests-menu.test.mjs
//
// Module: MOD-site-frame
// Guards: UC-026; UC-027; UC-028; UC-029; UC-030; THE MENU FOLLOWS THE PROCESS
// Level: unit
//
// The readings the pull request names: the frame writes and reads a route's parameters as `key=value` (routing.mjs routeOf and fragmentOf), as the route's own
// `go("runs", { commit })` does, so the module text's `runs/<commit>` is the route `runs` with the parameter commit; the context the routes are given is the frame's
// ViewContext with the product shown — the instance itself included, since the test pages work on a product's files and say so where none is given; `#trace/…` is
// given the parameters its fragment holds, and, where the fragment names no `ref`, the ref the page shows, as the app hands it to the route under `#spec` and `#arc`.
// The menu has one entry per stage: the entry Tests opens `runs`, the first of its views, and is the entry marked on `#schedule` and `#generate`. The table and the
// menu are read as they are; the live app runs in tests/app-harness.mjs against the GitHub API mock of tests/load-per-view.test.mjs; each route's `render` is
// replaced by one that records what it is given, so that these tests read the frame's dispatch and not the routes' pages. The counter-proofs are recorded in the
// pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { DASHBOARD, builtViews } from "../src/site/views.mjs";
import { MENU, entryOf, stageView } from "../src/site/menu.mjs";
import { repoServer, openDashboard, REPO } from "./app-harness.mjs";

const ROOT = new URL("../", import.meta.url);
const builtFiles = JSON.parse(readFileSync(new URL("docs/assets/dashboard/built.json", ROOT), "utf8"));
const tests = MENU.find((entry) => entry.key === "tests");
const ROUTES = { runs: ["UC-028"], schedule: ["UC-027"], generate: ["UC-026"], trace: ["UC-029", "UC-030"] };
const GONE = ["tests", "tests-schedule", "tests-generate", "tests-browser", "audit"];

function fixtureFiles() {
  const FIX = fileURLToPath(new URL("./fixtures/architecture/", import.meta.url));
  const files = {};
  (function walk(dir) { for (const name of readdirSync(dir)) { const path = join(dir, name); if (statSync(path).isDirectory()) walk(path); else files[relative(FIX, path).split("\\").join("/")] = readFileSync(path, "utf8"); } })(FIX);
  return files;
}

// Each named route of a view module renders a marker and records what it is given; restore() puts the routes' own render back.
async function recording(module, names) {
  const { view } = await import(module);
  const seen = [];
  const originals = names.map((name) => {
    const route = view.routes.find((candidate) => candidate.name === name);
    assert.ok(route, `${module} has the route ${name}`);
    const original = route.render;
    route.render = async (target, context, params) => { seen.push({ name, context, params }); target.innerHTML = `<p>route ${name} (recorded)</p>`; };
    return [route, original];
  });
  return { seen, restore: () => { for (const [route, original] of originals) route.render = original; } };
}

// The context every route is given: the frame's ViewContext of the review pages, with the product shown.
function assertViewContext(context) {
  assert.equal(context.page, "review");
  assert.equal(context.instance.repository, REPO);
  assert.equal(typeof context.instance.host?.readSnapshot, "function", "the instance's host");
  assert.equal(typeof context.product?.host?.readSnapshot, "function", "the product shown, with its host");
  assert.ok(context.store, "the browser's store");
  assert.equal(typeof context.go, "function");
}

// TST-1206001 · level: unit · module: MOD-site-frame
// guards: UC-026; UC-027; UC-028; UC-029; UC-030; THE MENU FOLLOWS THE PROCESS
// given: the table of the dashboard's views, the list built.json and the menu that follows the process
// input: the views runs, schedule, generate and trace in DASHBOARD, the views whose files were never built, builtViews(built.json), stageView and entryOf for the entry Tests
// expect: runs, schedule, generate and trace are built-in views without a file, for their use cases, and count as built; tests, tests-schedule, tests-generate,
//   tests-browser and audit are no view of the table; the entry Tests opens runs, and #schedule and #generate belong to it; built.json names no file for any of them
// Planted fault: leaving the table as it is (tests with the file tests-runs-view.mjs) makes the entry Tests open nothing.
test("TST-1206001 the test pages' routes and the trace route are built in, and the menu entry Tests opens runs", () => {
  const built = builtViews(builtFiles);
  for (const [view, useCases] of Object.entries(ROUTES)) {
    const entry = DASHBOARD.find((candidate) => candidate.view === view);
    assert.ok(entry, `the table names the view ${view}`);
    assert.equal(entry.builtIn, true, view);
    assert.equal(entry.file, undefined, view);
    assert.deepEqual(entry.useCases, useCases, view);
    assert.ok(built.has(view), `${view} counts as built`);
  }
  for (const view of GONE) assert.equal(DASHBOARD.find((candidate) => candidate.view === view), undefined, `the view ${view}, whose file was never built, is gone`);
  assert.equal(stageView(tests, built), "runs");
  assert.equal(entryOf("schedule"), "tests");
  assert.equal(entryOf("generate"), "tests");
  assert.ok(!builtFiles.some((file) => /^(tests|audit|runs|schedule|generate|trace)/.test(file)));
});

// TST-1206002 · level: unit · module: MOD-site-frame
// guards: UC-028; THE MENU FOLLOWS THE PROCESS
// given: counter-proof of TST-1206001: the table without the built-in views of the test pages
// input: builtViews over the table and over that table, stageView for the entry Tests over each
// expect: with the table the entry Tests opens runs; without its built-in views none of runs, schedule, generate is built and the entry Tests opens nothing (the known
//   negative); the known positive: release is still built, and the entry Releases opens it
// Planted fault: a table that keeps one of the views where the test removes it makes the known negative fail.
test("TST-1206002 counter-proof: without the table's built-in views the menu entry Tests opens nothing", () => {
  assert.equal(stageView(tests, builtViews(builtFiles)), "runs", "with the table, the entry Tests opens runs");
  const without = DASHBOARD.filter((entry) => !["runs", "schedule", "generate"].includes(entry.view));
  const builtWithout = new Set(without.filter((entry) => entry.view && (entry.builtIn || builtFiles.includes(entry.file))).map((entry) => entry.view));
  assert.equal(stageView(tests, builtWithout), null, "known negative: nothing opens the entry Tests");
  assert.ok(builtWithout.has("release"), "known positive: release is built");
  assert.equal(stageView(MENU.find((entry) => entry.key === "releases"), builtWithout), "release");
});

// TST-1206003 · level: unit · module: MOD-site-frame
// guards: UC-028; THE MENU FOLLOWS THE PROCESS
// given: the live app on the instance, a token stored; MOD-test-pages' route runs recording what it is rendered with
// input: the dashboard opened at #tests, at #runs and at #runs/commit=<sha>; the route's go("runs", { commit })
// expect: the menu links #runs for the entry Tests; each address renders the route runs — #tests and #runs with no parameter, #runs/commit=<sha> with { commit } —
//   with the frame's ViewContext, the product shown included; go writes #runs/commit=<sha>; the page shows the route, not the use cases or "not built yet"
// Planted fault: an app without the dispatch says "The Tests entry is not built yet." at #tests and shows the use cases at #runs.
test("TST-1206003 the menu entry Tests opens MOD-test-pages' route runs, and #runs/commit=<sha> hands the commit to it", async () => {
  const { seen, restore } = await recording("../src/test-pages/index.mjs", ["runs"]);
  try {
    const srv = await repoServer({ files: fixtureFiles(), history: [], handlers: [] });
    const page = await openDashboard({ server: srv, hash: "#tests" });
    const tabs = [...page.el("tabs").matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
    assert.ok(tabs.includes("runs"), `the entry Tests links #runs: ${tabs.join(", ")}`);
    assert.match(page.main(), /route runs \(recorded\)/);
    assert.doesNotMatch(page.main(), /not built yet/);
    assert.equal(seen.length, 1);
    assert.deepEqual(seen[0].params, {});
    assertViewContext(seen[0].context);
    const sha = "a".repeat(40);
    await openDashboard({ server: srv, hash: "#runs" });
    assert.deepEqual(seen.at(-1).params, {});
    const withCommit = await openDashboard({ server: srv, hash: `#runs/commit=${sha}` });
    assert.match(withCommit.main(), /route runs \(recorded\)/);
    assert.deepEqual(seen.at(-1).params, { commit: sha });
    seen.at(-1).context.go("runs", { commit: sha });
    assert.equal(globalThis.location.hash, `#runs/commit=${sha}`);
  } finally { restore(); }
});

// TST-1206004 · level: unit · module: MOD-site-frame
// guards: UC-026; UC-027; THE MENU FOLLOWS THE PROCESS
// given: the live app on the instance, a token stored; MOD-test-pages' routes schedule and generate recording what they are rendered with
// input: the dashboard opened at #schedule, then at #generate
// expect: each renders its route of that name, with no parameter and the frame's ViewContext; the page shows the route, not the use-case list
// Planted fault: an app without the dispatch shows the use cases at both addresses.
test("TST-1206004 #schedule and #generate render MOD-test-pages' routes of those names", async () => {
  const { seen, restore } = await recording("../src/test-pages/index.mjs", ["schedule", "generate"]);
  try {
    const srv = await repoServer({ files: fixtureFiles(), history: [], handlers: [] });
    for (const name of ["schedule", "generate"]) {
      const page = await openDashboard({ server: srv, hash: `#${name}` });
      assert.match(page.main(), new RegExp(`route ${name} \\(recorded\\)`));
      assert.doesNotMatch(page.main(), /#use-case\/id=UC-001"/, "not the use-case list");
      assert.equal(seen.at(-1).name, name);
      assert.deepEqual(seen.at(-1).params, {});
      assertViewContext(seen.at(-1).context);
    }
    assert.equal(seen.length, 2);
  } finally { restore(); }
});

// TST-1206005 · level: unit · module: MOD-site-frame
// guards: UC-029; UC-030
// given: the live app on the instance, a token stored, its default branch main; MOD-trace-pages' route trace recording what it is rendered with
// input: the dashboard opened at #trace/key=tests, and at #trace/key=audit/ref=v2026.1.0/commit=<sha> — the link embedRoute puts into the release panel where the route
//   is not on the page
// expect: each renders the route trace with the parameters its fragment holds — { key: "tests", ref: "main" }, the ref the page shows where the fragment names none, and
//   { key: "audit", ref: "v2026.1.0", commit: <sha> } — and the frame's ViewContext; the page shows the route, not the use-case list
// Planted fault: an app without the dispatch shows the use cases at both addresses.
test("TST-1206005 #trace with key=tests and with key=audit renders MOD-trace-pages' route trace", async () => {
  const { seen, restore } = await recording("../src/trace-pages/index.mjs", ["trace"]);
  try {
    const srv = await repoServer({ files: fixtureFiles(), history: [], handlers: [] });
    const browser = await openDashboard({ server: srv, hash: "#trace/key=tests" });
    assert.match(browser.main(), /route trace \(recorded\)/);
    assert.doesNotMatch(browser.main(), /#use-case\/id=UC-001"/, "not the use-case list");
    assert.deepEqual(seen.at(-1).params, { key: "tests", ref: "main" });
    assertViewContext(seen.at(-1).context);
    const sha = "b".repeat(40);
    const audit = await openDashboard({ server: srv, hash: `#trace/key=audit/ref=v2026.1.0/commit=${sha}` });
    assert.match(audit.main(), /route trace \(recorded\)/);
    assert.deepEqual(seen.at(-1).params, { key: "audit", ref: "v2026.1.0", commit: sha });
    assertViewContext(seen.at(-1).context);
    assert.equal(seen.length, 2);
  } finally { restore(); }
});
