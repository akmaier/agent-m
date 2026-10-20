// MOD-main-page's route `home` reads a product without a token in no more requests than the old main page did on the same files (ITM-842; UC-046 step 3): "A PAGE LOAD READS THE
// REPOSITORY IN BATCHES" - GitHub's raw host takes no batch, so without a token every file is a request of its own, and the route must not read files the old page never read.
// Both pages are run by this test over the same counting fake of GitHub (tests/progress-measures-load.mjs, through tests/main-page-home-harness.mjs): the old page by the code of
// src/home/home.mjs `read` (src/home/progress.mjs over the host's snapshot), the route `home` by its render. The counts are taken, not copied from a document.
// Run: node --test tests/main-page-no-token-requests.test.mjs
//
// Module: MOD-main-page
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// Level: unit
//
// Each test states its input and its expected values in its own text (given / input / expect). Nothing reaches the network; nothing sleeps.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/main-page/index.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { productFacts as oldFacts } from "../src/home/progress.mjs";
import { parseProductAddress } from "../docs/assets/git-host.mjs";
import { pullRequests } from "../docs/assets/git-host/pull-requests.mjs";
import { INSTANCE, PRODUCT, PRODUCT_TOKEN, PRODUCT_URL, browser, byClass, cardsOf, draw, instanceFiles, network, productFiles, timers } from "./main-page-home-harness.mjs";

const home = view.routes.find((candidate) => candidate.name === "home");
let net;
afterEach(() => { net?.restore(); timers.restore(); });

// The size of this repository's tests folder, rounded down: 700 test files, each with the declarations of one test.
const TEST_FILES = 700;
const testFile = (n) => [`// TST-${String(n).padStart(6, "0")} · level: unit · module: MOD-store`, "// guards: FIRST RULE", "// given: a store", "// input: a read", "// expect: its text",
  `test("a store reads ${n}", () => {});`, ""].join("\n");
const files = () => ({ ...productFiles({ items: 600, jobs: 400 }), ...Object.fromEntries(Array.from({ length: TEST_FILES }, (_, i) => [`tests/t${String(i).padStart(4, "0")}.test.mjs`, testFile(i + 1)])) });

/** The requests the old main page makes for the product on a fresh fake: src/home/home.mjs `read`, with `token` or without. */
async function oldPage(token) {
  net = network({ [PRODUCT]: files(), [INSTANCE]: instanceFiles() });
  net.install();
  const product = parseProductAddress(PRODUCT_URL);
  const host = connect(parseAddress(product.address), token ? { token } : {});
  const snapshot = await host.readSnapshot("main");
  const facts = await oldFacts({ tree: snapshot.paths.map((path) => ({ path, sha: snapshot.blob(path) })), text: (path) => snapshot.read(path),
    pullRequests: () => pullRequests({ product, token }).list(), ci: async () => null, tags: async () => [] });
  assert.equal(facts.implementation.total, 600);
  const count = net.requests.length;
  net.restore();
  return count;
}

/** The requests the route `home` makes for the same product on a fresh fake, with the product's token or without any. */
async function newPage(token) {
  net = network({ [PRODUCT]: files(), [INSTANCE]: instanceFiles() });
  net.install();
  const target = await draw(home, token ? browser({ instanceToken: null }) : browser({ tokens: {}, instanceToken: null }));
  assert.equal(cardsOf(target).length, 1);
  assert.equal(byClass(target, "is-error").length, 0);
  const count = net.requests.length;
  net.restore();
  timers.restore();
  return count;
}

// TST-842001 · level: unit · module: MOD-main-page
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-046
// given: a product of 600 backlog items, 400 job records, SPEC.md and 701 test files, and an instance holding its participant list; no token stored for either
// input: the old main page's read of the product, and the route home drawn, each on a fresh fake of GitHub
// expect: the route home makes 1,714 requests, and no more than the old page's on the same files (1,004); the files the route reads beyond the old page's are none
test("TST-842001 without a token, the route home makes no more requests than the old main page on the same files", async () => {
  const before = await oldPage(null);
  const now = await newPage(null);
  assert.equal(before, 1004);
  assert.equal(now, 1714);
  assert.ok(now <= before, `the route home makes ${now} requests, the old page ${before}`);
});

// TST-842002 · level: unit · module: MOD-main-page
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-046
// given: the product of TST-842001, with a token stored for it
// input: the old main page's read, and the route home drawn
// expect: the old page makes 1,004 requests, a request for every file; the route home makes 31, the files in batches of at most a hundred
test("TST-842002 with a token, the route home makes fewer requests than the old main page on the same files", async () => {
  const before = await oldPage(PRODUCT_TOKEN);
  const now = await newPage(PRODUCT_TOKEN);
  assert.equal(before, 1004);
  assert.equal(now, 31);
  assert.ok(now < before);
});
