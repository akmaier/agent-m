// MOD-main-page's root entry and its cached home reading (ITM-684).
// Run: node --test tests/main-page-root-entry.test.mjs
//
// Module: MOD-main-page
// Level: component

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { view } from "../src/main-page/index.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { productFacts } from "../src/progress-measures/index.mjs";
import { factsText } from "../src/progress-measures/stored.mjs";
import { INSTANCE, NOW, PRODUCT, PRODUCT_TOKEN, PRODUCT_URL, browser, cardsOf, draw, endedJob, headOf, instanceFiles, network, smallProduct, timers } from "./main-page-home-harness.mjs";

const ROOT = new URL("../", import.meta.url);
const home = view.routes.find((route) => route.name === "home");
const stored = (commit) => JSON.stringify({ commit, waiting: [], shares: [
  { stage: "Requirements", share: 1, detail: "stored" }, { stage: "Use cases", share: 0, detail: "stored" },
  { stage: "Architecture", share: 0, detail: "stored" }, { stage: "Implementation", share: 0, detail: "stored" },
  { stage: "Tests", share: 0, detail: "stored" }, { stage: "Release", share: 0, detail: "stored" },
] });
const JOB = "JOB-20261016-1000-ffff";
const overviewReads = (net) => net.requests.filter((request) => request.url.includes(`/repos/${PRODUCT}/contents/`) && request.url.includes("ref=overview-cache") && !request.url.includes(".facts.json"));
const requestPaths = (net, from) => net.requests.slice(from).map((request) => new URL(request.url).pathname.replace(/[0-9a-f]{40}$/, "<commit>"));

async function cachedContext(net) {
  const context = browser();
  const { defaultBranch } = await context.instance.host.repositoryInfo();
  const instanceSnapshot = await context.instance.host.readSnapshot(defaultBranch);
  const host = connect(parseAddress(PRODUCT_URL), { token: PRODUCT_TOKEN });
  const snapshot = await host.readSnapshot("main");
  const facts = await productFacts(host, instanceSnapshot, (commit) => context.instance.host.readSnapshot(commit), new Date(NOW), { scope: "all" });
  const head = headOf(PRODUCT);
  net.overviews[PRODUCT] = { [head]: stored(head), [`${head}.facts.json`]: await factsText(snapshot, facts) };
  return context;
}

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
// given: the native home route, one kept product with a real ended job plus the overview and stored facts its existing producer writes for the product's exact default-branch head; the existing Host fake records requests
// input: home is drawn; its first one-minute poll fires unchanged; then the same job record changes from done to failed and the following poll fires
// expect: exactly one product overview JSON is read at the initial head; the unchanged poll reads only product main commit/tree; the changed poll reads those plus only that changed job record
test("TST-684002 the native cached home keeps its initial job facts and polls unchanged and changed job records distinctly", async () => {
  const ended = endedJob({ id: JOB, by: "lab-pc-4", state: "done" });
  const files = smallProduct({ jobs: [ended] });
  const net = network({ [PRODUCT]: files, [INSTANCE]: instanceFiles() });
  net.install();
  try {
    const context = await cachedContext(net);
    const target = await draw(home, context);
    assert.equal(cardsOf(target).length, 1);
    assert.equal(overviewReads(net).length, 1);
    const before = net.requests.length;
    await timers.fire(NOW + 60000);
    assert.deepEqual(requestPaths(net, before), ["/repos/alice/product/commits/main", "/repos/alice/product/git/trees/<commit>"]);
    assert.deepEqual(net.requests.slice(before).map((request) => request.authorization), [`Bearer ${PRODUCT_TOKEN}`, `Bearer ${PRODUCT_TOKEN}`]);
    const changed = { ...files, [ended.path]: endedJob({ id: JOB, by: "lab-pc-4", state: "failed" }).text };
    net.change(PRODUCT, changed);
    const after = net.requests.length;
    await timers.fire(NOW + 120000);
    assert.deepEqual(requestPaths(net, after), ["/repos/alice/product/commits/main", "/repos/alice/product/git/trees/<commit>", `/repos/alice/product/contents/${ended.path}`]);
  } finally {
    timers.restore();
    net.restore();
  }
});

// TST-684003 · level: component · module: MOD-main-page
// guards: WITHOUT A PRODUCT, THE MAIN PAGE SHOWS AGENT M'S OWN PROGRESS; A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the native home route with no kept product, so its only card is the instance
// input: the route is drawn through the existing instance Host
// expect: the instance's default branch commit and tree are each read once for the initial card, a positive control that the own card does not select another product head
test("TST-684003 the native home reads the own instance head and tree once", async () => {
  const net = network({ [INSTANCE]: instanceFiles() });
  net.install();
  try {
    const target = await draw(home, browser({ products: [] }));
    assert.equal(cardsOf(target).length, 1);
    const paths = requestPaths(net, 0).filter((path) => path.startsWith(`/repos/${INSTANCE}/`));
    assert.equal(paths.filter((path) => path === `/repos/${INSTANCE}/commits/main`).length, 1);
    assert.equal(paths.filter((path) => path === `/repos/${INSTANCE}/git/trees/<commit>`).length, 1);
  } finally {
    timers.restore();
    net.restore();
  }
});
