// MOD-review-pages' pages that start a drafting job (jobs.mjs, `<route>/id=draft`) read the instance's repository once: loadStage builds the instance's snapshot, and
// the sources of the page (sourcesOf) are read from that same snapshot, as docs/architecture/MOD-repository-hosts.md states the cost of one: "readSnapshot(ref) — the
// repository at a branch, tag or commit: the commit and its whole tree in a fixed number of requests", after repositoryInfo for the default branch.
// Run: node --test tests/review-pages-jobs-instance-reads.test.mjs
//
// Module: MOD-review-pages
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// Level: unit
//
// The fixtures are tests/review-pages-draft-world.mjs' (a product behind a Host of the tests' own, the instance with its register of participants and the register entry
// SRC-alice that the product links, the browser harness and a spy on `fetch` that refuses). The requests of a page are the calls on the instance's Host: repositoryInfo,
// readSnapshot and each read of a file of its snapshot. Without a token the pages of a derivation end in the paragraph that asks for one; the reads are made before it, and the
// tests count them with a token and without. Every expected number is written out in its test.

import { emptyStorage } from "./review-pages-harness.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { byClass, contextOf, draw, fakeInstance, fakeProduct, fetched, pages } from "./review-pages-draft-world.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";

(pages.view?.strategies ?? []).forEach((strategies, at) => registerStrategies(`tests/review-pages-jobs-instance-reads.test.mjs#${at}`, strategies));

test.afterEach(() => { assert.deepEqual(fetched.splice(0), [], "no request left the fixtures"); });

// A Host over `host` that records its calls: repositoryInfo, readSnapshot with its ref, and the reads of the snapshot it gives.
function recording(host, calls) {
  return { ...host,
    async repositoryInfo() { calls.push("repositoryInfo"); return host.repositoryInfo(); },
    async readSnapshot(ref) {
      calls.push(`readSnapshot ${ref}`);
      const snapshot = await host.readSnapshot(ref);
      return { ...snapshot, read: async (path) => { calls.push(`read ${path}`); return snapshot.read(path); } };
    } };
}

// Draws `<route>/id=draft` of the product, with the stored token or without, and returns the instance's calls and the sources the page offers.
async function startPage(route, token) {
  emptyStorage();
  const fake = fakeProduct();
  const calls = [];
  const base = contextOf(fake, { token });
  const context = { ...base, instance: { ...base.instance, host: recording(fakeInstance().host, calls) } };
  const { target } = await draw(fake, route, { id: "draft" }, { context });
  return { calls, offered: byClass(target, "li", "source").map((item) => item.getAttribute("data-source")) };
}
const READS = ["docs/participants.md", "docs/sources/SRC-alice.md"].map((path) => `read ${path}`);

for (const token of [true, false]) {
  const state = token ? "with a token" : "without a token";

  // TST-852101 · level: unit · module: MOD-review-pages
  // guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
  // given: the page of a product that starts the derivation of requirements, the instance's register holding the entry SRC-alice that the product's links file names, and a browser that stores the product's token or none
  // input: draw the route spec-entry with the id draft, counting the calls on the instance's Host
  // expect: the instance's repository information is asked once, its snapshot is built once (readSnapshot main once), and its register of participants and the entry SRC-alice are each read once from that snapshot; the source SRC-alice is offered
  test(`TST-852101: the derivation of requirements reads the instance's snapshot once, ${state}`, async () => {
    const { calls, offered } = await startPage("spec-entry", token);
    assert.equal(calls.filter((call) => call === "repositoryInfo").length, 1, `repositoryInfo; calls: ${calls.join(" | ")}`);
    assert.equal(calls.filter((call) => call.startsWith("readSnapshot")).length, 1, `readSnapshot; calls: ${calls.join(" | ")}`);
    assert.deepEqual(calls.filter((call) => call.startsWith("read ")), READS);
    assert.deepEqual(offered, ["SRC-alice"]);
  });

  // TST-852102 · level: unit · module: MOD-review-pages
  // guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
  // given: the page of a product that starts the derivation of the architecture, the same instance, and a browser that stores the product's token or none
  // input: draw the route decision with the id draft, counting the calls on the instance's Host
  // expect: the instance's repository information is asked once, its snapshot is built once (readSnapshot main once), and its register of participants and the entry SRC-alice are each read once from that snapshot
  test(`TST-852102: the derivation of the architecture reads the instance's snapshot once, ${state}`, async () => {
    const { calls } = await startPage("decision", token);
    assert.equal(calls.filter((call) => call === "repositoryInfo").length, 1, `repositoryInfo; calls: ${calls.join(" | ")}`);
    assert.equal(calls.filter((call) => call.startsWith("readSnapshot")).length, 1, `readSnapshot; calls: ${calls.join(" | ")}`);
    assert.deepEqual(calls.filter((call) => call.startsWith("read ")), READS);
  });

  // TST-852103 · level: unit · module: MOD-review-pages
  // guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
  // given: the page of a product that starts the derivation of use cases, which reads the instance's register of participants and no source, and a browser that stores the product's token or none (the page that already reads the instance once)
  // input: draw the route use-case with the id draft, counting the calls on the instance's Host
  // expect: the instance's repository information is asked once, its snapshot is built once, and exactly its register of participants is read, once; the count is the same as before this item
  test(`TST-852103: the derivation of use cases still reads the instance's snapshot once, ${state}`, async () => {
    const { calls } = await startPage("use-case", token);
    assert.deepEqual(calls, ["repositoryInfo", "readSnapshot main", "read docs/participants.md"]);
  });
}
