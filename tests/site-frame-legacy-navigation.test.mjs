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

const INSTANCE = "akmaier/agent-m";
const CHOSEN = "acme/chosen";
const OTHER = "acme/other";
const addressOf = (repository) => `https://github.com/${repository}`;

// The live review entry receives all repository reads through the instance server. Its handler forwards the chosen
// product's public Host requests to the matching repoServer, as the existing dashboard product cases do.
async function receiverFixture() {
  const chosen = await repoServer({ repo: CHOSEN, files: { "README.md": "# Chosen product\n" } });
  const other = await repoServer({ repo: OTHER, files: { "README.md": "# Other product\n" } });
  const productServer = (url, init) => {
    if (url.origin !== "https://api.github.com") return undefined;
    if (url.pathname.startsWith(`/repos/${CHOSEN}/`)) return chosen.fetch(url.href, init);
    if (url.pathname.startsWith(`/repos/${OTHER}/`)) return other.fetch(url.href, init);
    return undefined;
  };
  const instance = await repoServer({ files: { "README.md": "# Instance\n" }, handlers: [productServer] });
  return { instance, chosen, other,
    entries: { "agent-m:akmaier/agent-m:products": JSON.stringify([addressOf(CHOSEN), addressOf(OTHER)]) } };
}

// TST-1165003 · level: component · module: MOD-site-frame
// guards: UC-014; THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE
// given: the real legacy review entry with the views it normally loads
// input: open #add, then #get-your-own/step=actions, an unserved address, and #add again
// expect: #add keeps drawing Add a product; get-your-own draws its Actions step; an address no view answers keeps the existing
// review fallback; and the old #add alias still draws Add a product after that negative control
test("TST-1165003 the legacy review entry serves get-your-own while keeping its add alias and unknown-route fallback", async () => {
  const page = await openDashboard({ server: await repoServer({ files: { "README.md": "# Agent M\n" } }), hash: "#add" });
  assert.match(page.main(), /Add a product/, "#add is the existing positive alias");

  await page.go("#get-your-own/step=actions");
  assert.match(page.main(), /Step 3 . Turn on the workflows/, "the route receives step=actions");

  await page.go("#not-a-route-1165");
  assert.match(page.main(), /Use cases/, "an address no view answers retains the review fallback");

  await page.go("#add");
  assert.match(page.main(), /Add a product/, "the legacy alias remains served");
});

// TST-1165004 · level: component · module: MOD-site-frame
// guards: UC-014; THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE
// given: the real legacy review entry with the views it normally loads
// input: open the canonical #add-product address
// expect: it draws the actual Add a product route, separately from the preserved #add alias
test("TST-1165004 the legacy review entry serves the canonical add-product route", async () => {
  const page = await openDashboard({ server: await repoServer({ files: { "README.md": "# Agent M\n" } }), hash: "#add-product" });
  assert.match(page.main(), /Add a product/, "the canonical route does not fall back to the review list");
});

// TST-1165005 · level: component · module: MOD-site-frame
// guards: THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE; A PRODUCT IS NAMED BY ITS ADDRESS
// given: the actual review entry, an instance, and two products that this browser keeps
// input: open the review entry directly at #settings/product=<the chosen product>, then at the other product
// expect: each receiver reads the repository its fragment names, rather than the instance
test("TST-1165005 the live review receiver preserves a chosen and an explicit other product from its fragment", async () => {
  const known = await receiverFixture();
  const knownPage = await openDashboard({ server: known.instance, entries: known.entries,
    search: `?repo=${encodeURIComponent(CHOSEN)}`, hash: "#settings" });
  assert.match(knownPage.el("repo-line"), new RegExp(CHOSEN), "known positive: the query chooses the product");
  assert.ok(known.chosen.requests.some((request) => request.includes("commit")),
    "known positive: the chosen product Host records its normal commit read");

  for (const [repository, key] of [[CHOSEN, "chosen"], [OTHER, "other"]]) {
    const fixture = await receiverFixture();
    const page = await openDashboard({ server: fixture.instance, entries: fixture.entries,
      hash: `#settings/product=${encodeURIComponent(addressOf(repository))}` });
    assert.match(page.el("repo-line"), new RegExp(repository), `${key} product is the receiver's repository`);
    assert.ok(fixture[repository === CHOSEN ? "chosen" : "other"].requests.some((request) => request.includes("commit")),
      `${key} product's Host records the review page commit read`);
  }
});

// TST-1165006 · level: component · module: MOD-site-frame
// guards: THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE; A PRODUCT IS NAMED BY ITS ADDRESS
// given: the actual review entry, an instance, and products that this browser keeps
// input: open #settings without a product parameter
// expect: the receiver continues to read the instance, not either stored product
test("TST-1165006 the live review receiver keeps an empty product fragment on the instance", async () => {
  const fixture = await receiverFixture();
  const page = await openDashboard({ server: fixture.instance, entries: fixture.entries, hash: "#settings" });
  assert.match(page.el("repo-line"), new RegExp(INSTANCE), "the empty product names the instance");
  assert.deepEqual(fixture.chosen.requests, [], "the chosen product is not read");
  assert.deepEqual(fixture.other.requests, [], "the other product is not read");
});
