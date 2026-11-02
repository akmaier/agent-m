// The live dashboard's ways from the Settings page to the pages where a repository setting is kept.
// Run: node --test tests/dashboard-settings-edit-routes.test.mjs
//
// Module: MOD-site-frame
// Level: component
// Guards: UC-042; EVERY SETTING IS REACHED FROM ONE PAGE

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument } from "./app-harness.mjs";

// The text of <main>, without its tags.
const textOf = (page) => page.main().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
// What the dashboard draws for an address no route answers: the use cases.
const USE_CASES = /Draft use cases/;

// Each line of the Settings page's repository sections, in the order the page draws them — the instance's, then the product's (here the
// instance itself) —, with the address its Edit leads to and what the page there shows.
const EDITS = [
  ["Participants", "#participants", /Participants/],
  ["Source library", "#library", /Library/],
  ["Process models", "#models", /Process models/],
  ["Instance resources", "#resources/product=", /Instance resources/],
  ["Process model", "#process", /Process model/],
  ["Role assignments", "#roles", /Roles/],
  ["Definition of Done", "#process", /Process model/],
  ["Test schedule", "#schedule", /Schedule/],
  ["Linked sources", "#sources", /Requirement sources/],
  ["Product resources", "#resources", /Resources/],
];

// TST-2026310201 · level: component · module: MOD-site-frame
// guards: UC-042; EVERY SETTING IS REACHED FROM ONE PAGE
// given: the live dashboard of the instance, with a stored GitHub token, showing #settings.
// input: the person clicks each repository setting's Edit, and the product section's Requirement sources, and the dashboard follows the address it writes.
// expect: each click writes the address of the route where that setting is kept, and that route draws its own page there, never the use cases.
test("TST-2026310201: every Edit on the Settings page leads to the page where its setting is kept", async () => {
  const server = await repoServer({ files: {} });
  const page = await openDashboard({ server, hash: "#uc" });
  const main = richDocument().byId("main");
  await page.go("#settings");
  assert.equal(main.querySelectorAll(".settings-repository-setting-edit").length, EDITS.length, "the Settings page draws one Edit for each repository setting");
  const clicks = [...EDITS.map(([title, hash, shown], at) => ({ title, hash, shown, button: () => main.querySelectorAll(".settings-repository-setting-edit")[at] })),
    { title: "Requirement sources", hash: "#sources", shown: /Requirement sources/, button: () => main.querySelector(".settings-product-sources") }];
  for (const { title, hash, shown, button } of clicks) {
    await page.go("#settings");
    await button().fire("click");
    assert.equal(globalThis.location.hash, hash, `failure node: the Edit of ${title} writes ${hash} into the address (Settings' go in dashboard-app.mjs)`);
    await page.go(hash);
    const drawn = textOf(page);
    assert.doesNotMatch(drawn, USE_CASES, `failure node: the router of dashboard-app.mjs draws ${hash}, not the use cases`);
    assert.match(drawn, shown, `${hash} draws the page of ${title}`);
  }
});

// TST-2026310202 · level: component · module: MOD-site-frame
// guards: UC-042; EVERY SETTING IS REACHED FROM ONE PAGE
// given: the live dashboard of the instance, with a stored GitHub token.
// input: a page load at #participants, #library, #resources/product= and #sources, each opened directly.
// expect: each address draws MOD-settings-pages' page of that route, never the use cases.
test("TST-2026310202: the settings pages' routes open directly on the live dashboard", async () => {
  for (const [hash, shown] of [["#participants", /Participants/], ["#library", /Library/], ["#resources/product=", /Instance resources/], ["#sources", /Requirement sources/]]) {
    const server = await repoServer({ files: {} });
    const page = await openDashboard({ server, hash });
    const drawn = textOf(page);
    assert.doesNotMatch(drawn, USE_CASES, `failure node: the router of dashboard-app.mjs draws ${hash}, not the use cases`);
    assert.match(drawn, shown, `${hash} draws its page`);
  }
});
