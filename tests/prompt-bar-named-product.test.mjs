// A message that names another product (UC-049 3d) — MOD-prompt-bar's namedProduct(text, products), as docs/architecture/MOD-prompt-bar.md states it: "the address of
// the one product among `products` whose repository name `text` names, or `null` where none or more than one does. A repository name — the last part of the address's
// path — is split into words at each change from a lower-case letter or a digit to an upper-case letter and at `-`, `_` and `.`, and lowered … The text names it where,
// read without regard to case, it holds those words in their order, separated by spaces, or joined into one word (`alieninvasion`), beginning and ending at word
// boundaries. … Pure."
// Run: node --test tests/prompt-bar-named-product.test.mjs
//
// Module: MOD-prompt-bar
// Guards: UC-049
// Level: unit
//
// Readings the text leaves open, which the tests state: "separated by spaces" is one or more spaces between two words; a word boundary is a place not between two
// letters, digits or underscores. Each test states its input and its expected result before it runs (given / input / expect); where a test asserts a null, the same
// call is first shown to find a product on a known positive. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as promptBar from "../src/prompt-bar/index.mjs";

const { namedProduct } = promptBar;

const ALIEN = "https://github.com/alice/AlienInvasion";
const THESIS = "https://github.com/alice/thesis-tool";
const DASHED = "https://gitlab.example.org/group/sub/alien-invasion";
const PRODUCTS = [{ address: ALIEN }, { address: THESIS }];

// TST-2026110804 · level: unit · module: MOD-prompt-bar
// guards: UC-049
// given: the products AlienInvasion and thesis-tool
// input: namedProduct of: "a specification in the Alien Invasion repo"; "Write it in ALIEN   INVASION." (case, three spaces); "the alieninvasion repository"; "(AlienInvasion)"; "fix thesistool"; "fix the thesis tool"
// expect: AlienInvasion's address for the first four; thesis-tool's for the last two
test("TST-2026110804: a text that names a product's repository name by its words, or by them joined, names that product", () => {
  for (const text of ["a specification in the Alien Invasion repo", "Write it in ALIEN   INVASION.", "the alieninvasion repository", "(AlienInvasion)"]) {
    assert.equal(namedProduct(text, PRODUCTS), ALIEN, text);
  }
  assert.equal(namedProduct("fix thesistool", PRODUCTS), THESIS);
  assert.equal(namedProduct("fix the thesis tool", PRODUCTS), THESIS);
});

// TST-2026110805 · level: unit · module: MOD-prompt-bar
// guards: UC-049
// given: the products AlienInvasion and thesis-tool
// input: namedProduct of: "aliens invading"; "the alien invasions"; "the invasion of aliens"; "an alien invasionary force"; "subalieninvasion"; "alien-invasion" (a dash is no space); and, as the known positive, "alien invasion"
// expect: AlienInvasion's address for the known positive; null for every other
test("TST-2026110805: a text that holds the words out of order, within a longer word, or with other separators names no product", () => {
  assert.equal(namedProduct("alien invasion", PRODUCTS), ALIEN, "known positive");
  for (const text of ["aliens invading", "the alien invasions", "the invasion of aliens", "an alien invasionary force", "subalieninvasion", "alien-invasion"]) {
    assert.equal(namedProduct(text, PRODUCTS), null, text);
  }
});

// TST-2026110806 · level: unit · module: MOD-prompt-bar
// guards: UC-049
// given: the products AlienInvasion and thesis-tool; and, apart, AlienInvasion and the GitLab project alien-invasion, whose repository names give the same words
// input: namedProduct of "move the alien invasion spec into the thesis tool" over the first two; of "alien invasion" over the second two; of "" and of "anything" over none
// expect: null for each — two products named, or the one name two products have, names none; known positive: "alien invasion" over the GitLab project alone gives its address
test("TST-2026110806: a text that names more than one product, or a name two products share, names none", () => {
  assert.equal(namedProduct("alien invasion", [{ address: DASHED }]), DASHED, "known positive: alien-invasion gives the words alien invasion");
  assert.equal(namedProduct("move the alien invasion spec into the thesis tool", PRODUCTS), null);
  assert.equal(namedProduct("alien invasion", [{ address: ALIEN }, { address: DASHED }]), null);
  assert.equal(namedProduct("", PRODUCTS), null);
  assert.equal(namedProduct("anything", []), null);
});

// TST-2026110807 · level: unit · module: MOD-prompt-bar
// guards: UC-049
// given: products whose repository names are v2Beta, my_tool.js and HTTPServer
// input: namedProduct of "the v2 beta repo", "my tool js", "httpserver", and "the http server"
// expect: v2Beta for the first (a digit before an upper-case letter splits), my_tool.js for the second (`_` and `.` split), HTTPServer for the third; null for the
//   fourth, since no change from a lower-case letter splits HTTPServer
test("TST-2026110807: a repository name is split at a lower-case letter or a digit before an upper-case one, and at - _ and .", () => {
  const products = ["https://github.com/a/v2Beta", "https://github.com/a/my_tool.js", "https://github.com/a/HTTPServer"].map((address) => ({ address }));
  assert.equal(namedProduct("the v2 beta repo", products), products[0].address);
  assert.equal(namedProduct("my tool js", products), products[1].address);
  assert.equal(namedProduct("httpserver", products), products[2].address);
  assert.equal(namedProduct("the http server", products), null);
});

// TST-2026110808 · level: unit · module: MOD-prompt-bar
// guards: UC-049
// given: the products AlienInvasion and thesis-tool, frozen, and a global fetch that records every call
// input: namedProduct of "the Alien Invasion repo"
// expect: AlienInvasion's address; no call of fetch; the products unchanged
test("TST-2026110808: namedProduct is pure", async () => {
  const calls = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (...args) => { calls.push(args); return new Response(""); };
  try {
    const products = Object.freeze(PRODUCTS.map((each) => Object.freeze({ ...each })));
    assert.equal(namedProduct("the Alien Invasion repo", products), ALIEN);
    assert.deepEqual(products, PRODUCTS);
    assert.deepEqual(calls, []);
  } finally {
    globalThis.fetch = real;
  }
});
