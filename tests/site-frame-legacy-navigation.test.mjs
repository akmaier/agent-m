// The legacy review entry still serves its settings routes while MOD-site-frame takes over navigation (ITM-1165).
//
// Run: node --test tests/site-frame-legacy-navigation.test.mjs
//
// Module: MOD-site-frame
// Guards: UC-014; THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE
// Level: component

import assert from "node:assert/strict";
import test from "node:test";
import { openDashboard, repoServer } from "./app-harness.mjs";

// TST-1165003 · level: component · module: MOD-site-frame
// guards: UC-014; THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE
// given: the real legacy review entry with the views it normally loads
// input: open #add, then #get-your-own/step=actions, an unserved address, and #add again
// expect: #add keeps drawing Add a product; get-your-own draws its Actions step; an address no view answers keeps the existing
// review fallback; and the old #add alias still draws Add a product after that negative control
test("TST-1165003 the legacy review entry serves add-product and get-your-own while keeping its add alias and unknown-route fallback", async () => {
  const page = await openDashboard({ server: await repoServer({ files: { "README.md": "# Agent M\n" } }), hash: "#add" });
  assert.match(page.main(), /Add a product/, "#add is the existing positive alias");

  await page.go("#get-your-own/step=actions");
  assert.match(page.main(), /Step 3 . Turn on the workflows/, "the route receives step=actions");

  await page.go("#not-a-route-1165");
  assert.match(page.main(), /Use cases/, "an address no view answers retains the review fallback");

  await page.go("#add");
  assert.match(page.main(), /Add a product/, "the legacy alias remains served");
});
