// ITM-682: the release panel is MOD-test-pages' route on the live page; the dashboard's adapter of it is gone.
// Module: MOD-test-pages
// Guards: EVERY CODE FILE BELONGS TO A MODULE; UC-013
// Level: unit
// Run: node --test tests/test-pages-release-route.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { DASHBOARD, builtViews } from "../src/site/views.mjs";
import { MENU, stageView } from "../src/site/menu.mjs";
import { view } from "../src/test-pages/index.mjs";

const ROOT = new URL("../", import.meta.url);
const builtFiles = JSON.parse(readFileSync(new URL("docs/assets/dashboard/built.json", ROOT), "utf8"));
const release = DASHBOARD.find((entry) => entry.view === "release");

// TST-682001
// level: unit
// module: MOD-test-pages
// guards: EVERY CODE FILE BELONGS TO A MODULE; UC-013
// given: the repository as the live page is built from it
// input: the adapter docs/assets/dashboard/release-view.mjs and the list docs/assets/dashboard/built.json
// expect: the adapter does not exist and built.json does not name it
test("TST-682001 the adapter release-view.mjs is gone and no longer built", () => {
  assert.equal(existsSync(new URL("docs/assets/dashboard/release-view.mjs", ROOT)), false);
  assert.ok(!builtFiles.includes("release-view.mjs"));
});

// TST-682002
// level: unit
// module: MOD-test-pages
// guards: UC-013
// given: the table of the dashboard's views and the menu that follows the process
// input: the view "release" in DASHBOARD, builtViews(built.json), and the menu's entry Releases
// expect: the view is a built-in one without a file of its own, it counts as built, and the menu opens it for the entry Releases; the module's route of that name exists
test("TST-682002 the view release is built in, counted as built and opened by the menu", () => {
  assert.ok(view.routes.some((route) => route.name === "release"), "MOD-test-pages offers the route release");
  assert.ok(release, "the table names the view release");
  assert.equal(release.builtIn, true);
  assert.equal(release.file, undefined);
  const built = builtViews(builtFiles);
  assert.ok(built.has("release"));
  assert.equal(stageView(MENU.find((entry) => entry.key === "releases"), built), "release");
});

// TST-682003
// level: unit
// module: MOD-test-pages
// guards: UC-013
// given: counter-proof of TST-682002: the same table and menu with the list of built files, where a view that has a file is built only when the file is named
// input: builtViews([]) over the same table
// expect: a view with a file is not built when its file is not named, so TST-682002's "release" is counted by being built in, not by an empty check
test("TST-682003 counter-proof: a view with a file is built only when its file is named", () => {
  const built = builtViews([]);
  assert.ok(!built.has("specification"), "known positive: specification has a file that is not named");
  assert.ok(built.has("release"));
  assert.ok(!built.has("arrange"));
});
