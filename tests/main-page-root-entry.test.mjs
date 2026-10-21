// MOD-main-page's root entry and its cached home reading (ITM-684).
// Run: node --test tests/main-page-root-entry.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { view } from "../src/main-page/index.mjs";
import { PRODUCT, PRODUCT_TOKEN, browser, cardsOf, draw, headOf, instanceFiles, network, smallProduct, timers } from "./main-page-home-harness.mjs";

const ROOT = new URL("../", import.meta.url);
const home = view.routes.find((route) => route.name === "home");
const stored = (commit) => JSON.stringify({ commit, waiting: [], shares: [
  { stage: "Requirements", share: 1, detail: "stored" }, { stage: "Use cases", share: 0, detail: "stored" },
  { stage: "Architecture", share: 0, detail: "stored" }, { stage: "Implementation", share: 0, detail: "stored" },
  { stage: "Tests", share: 0, detail: "stored" }, { stage: "Release", share: 0, detail: "stored" },
] });

// TST-684001 · level: component · module: MOD-main-page
// guards: EVERY CODE FILE BELONGS TO A MODULE; THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE
// given: the real root entry index.html and the native MOD-main-page View
// input: the root's module script setup and the View's routes
// expect: index.html loads the Frame start entry with data-page="main" and data-views="main-page"; it loads neither src/home/home.mjs nor the legacy home stylesheet; the named native view supplies the home route
test("TST-684001 the real root starts the native main-page view, not the legacy home", () => {
  const html = readFileSync(new URL("index.html", ROOT), "utf8");
  assert.match(html, /<script type="module" src="src\/site-frame\/start\.mjs" data-page="main" data-views="main-page"><\/script>/);
  assert.doesNotMatch(html, /src\/home\/home\.mjs/);
  assert.doesNotMatch(html, /src\/home\/home\.css/);
  assert.equal(home?.name, "home");
});

// TST-684002 · level: component · module: MOD-main-page
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; THE BUILD IS SHOWN AS IT HAPPENS; UC-046
// given: the native home route, one kept product with an overview stored for its exact default-branch head, and a token; the existing Host fake records requests and its timer is fired once
// input: home is drawn, then its first one-minute job poll runs while the product's files are unchanged
// expect: the initial card uses the stored overview at its exact head once; the poll reads only that product's main commit and tree, with its token, and reads no individual job record
test("TST-684002 the native cached home reads its stored head once and unchanged first poll reads only commit and tree", async () => {
  const head = headOf(PRODUCT);
  const net = network({ [PRODUCT]: smallProduct(), "alice/agent-m": instanceFiles() });
  net.overviews[PRODUCT] = { [head]: stored(head) };
  net.install();
  try {
    const target = await draw(home, browser());
    assert.equal(cardsOf(target).length, 1);
    assert.equal(net.requests.filter((request) => request.url.includes("ref=overview-cache")).length, 1);
    const before = net.requests.length, logged = net.server.log.length;
    await timers.fire();
    assert.deepEqual(net.requests.slice(before).map((request) => new URL(request.url).pathname.replace(/[0-9a-f]{40}$/, "<commit>")), ["/repos/alice/product/commits/main", "/repos/alice/product/git/trees/<commit>"]);
    assert.deepEqual(net.requests.slice(before).map((request) => request.authorization), [`Bearer ${PRODUCT_TOKEN}`, `Bearer ${PRODUCT_TOKEN}`]);
    assert.deepEqual(net.server.log.slice(logged).map((entry) => [entry.kind, ...entry.files]), [["commit"], ["tree"]]);
  } finally {
    timers.restore();
    net.restore();
  }
});
