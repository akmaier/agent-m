// The explanation of a product's Requirement sources page (ITM-590) — MOD-site-frame's explain, for UC-015: "A folded *What is this?* explains three differences: the library (which sources exist)
// against this list (which apply here); a source (rules to meet) against a resource (things used, UC-040); and why the version is fixed", and, for 2c, that a thing the product uses is not
// linked here and that its terms, if the product must meet them, are registered as a source. The topic is `requirement-sources`. What a test pins of the topic is what UC-015 gives it, in the
// test's own words, and nothing the topic merely happens to word.
// Run: node --test tests/site-frame-requirement-sources-explanation.test.mjs
//
// Module: MOD-site-frame
// Guards: EVERY STEP EXPLAINS ITSELF; UC-015
// Level: unit
//
// The document comes from the helper file tests/settings-pages-harness.mjs, set up before the dynamic import below, since a static import of the frame would run before it. Each test states
// its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { installDocument, byTag } from "./settings-pages-harness.mjs";

installDocument();
const { explain } = await import("../src/site-frame/index.mjs");

// The folded body's rendered text, as a person reads it: runs of whitespace (and the renderer's non-breaking spaces) collapsed to one space.
const bodyText = (topic) => (explain(topic).children[1]?.textContent ?? "").replace(/[\s ]+/g, " ");

// TST-590318 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-015
// given: known positive — explain("repository") is a details of class explain; the frame's topic requirement-sources
// input: explain("requirement-sources")
// expect: a <details class="explain"> without the open attribute, holding <summary>What is this?</summary> and one body in which no asterisk or backtick of the Markdown shows
test("explain — requirement-sources is a folded What is this? with its text", () => {
  assert.equal(explain("repository").localName, "details", "known positive: the frame gives a folded explanation for a topic it holds");
  const folded = explain("requirement-sources");
  assert.equal(folded.localName, "details");
  assert.equal(folded.className, "explain");
  assert.equal(folded.hasAttribute("open"), false);
  const [summary, body, ...more] = folded.children;
  assert.deepEqual([summary.localName, summary.textContent, more.length], ["summary", "What is this?", 0]);
  assert.ok(body.textContent.trim().length > 0);
  assert.doesNotMatch(bodyText("requirement-sources"), /[*`]/);
});

// TST-590319 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-015
// given: the topic requirement-sources
// input: read its rendered text
// expect: it says what the library holds and what this list holds, in the words "which sources exist" and "which sources apply to this product"; that a source is a rule the product must meet and a resource something it is built with or run on, in "A source is not a resource"; and why the version is fixed, under "Why the version is fixed", with the exact version and the fingerprint (SHA-256) named
test("explain — requirement-sources names the three differences: library against list, source against resource, and why the version is fixed", () => {
  const text = bodyText("requirement-sources");
  for (const phrase of ["which sources exist", "which sources apply to this product", "A source is not a resource", "a rule the product must meet",
    "something the product is built with or run on", "Why the version is fixed", "the exact version", "SHA-256"]) {
    assert.ok(text.includes(phrase), `the topic says: ${phrase}`);
  }
});

// TST-590320 · level: unit · module: MOD-site-frame
// guards: EVERY STEP EXPLAINS ITSELF; UC-015
// given: the topic requirement-sources
// input: read its rendered links and text
// expect: exactly one link in it, to the route of the use case UC-040 — the address "#use-case/id=UC-040" — with the text "UC-040"; and the text says that the terms a resource comes with, such as a licence or a usage policy, are registered in the library as a source and linked here
test("explain — requirement-sources links UC-040 and says that a resource's terms enter as a source", () => {
  const links = byTag(explain("requirement-sources"), "a");
  assert.deepEqual(links.map((anchor) => [anchor.getAttribute("href"), anchor.textContent]), [["#use-case/id=UC-040", "UC-040"]]);
  const text = bodyText("requirement-sources");
  assert.ok(text.includes("such as a licence or a usage policy"));
  assert.ok(text.includes("register those terms in the library as a source and link them here"));
});
