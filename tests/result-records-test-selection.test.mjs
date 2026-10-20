// MOD-result-records' recipe `test-selection` of `resultStrategies` (ITM-752), as the accepted text of docs/architecture/MOD-result-records.md states it: "the text of each
// requirement, use case and module the job's parameters select; every existing test that guards any of them, with its declaration and code; and the product's external
// services — its resources of kind `endpoint`, `agent` and `data` —, each marked paid or free by MOD-resource-list's `paidServices`." For UC-026 step 3, and the kinds
// `propose-tests` and `write-tests`, which name the recipe. Run: node --test tests/result-records-test-selection.test.mjs
//
// Module: MOD-result-records
// Guards: UC-026; TEST GENERATION SEES THE EXISTING TESTS; COMMIT TESTS CALL NO PAID SERVICE
// Level: unit
//
// The job context is a fixture of the type JobContext: the product's snapshot holds a SPEC.md, two test files and a docs/resources.md. Nothing is called and no service is reached.
// Where the file leaves a reading open, the tests state the one they take, and the pull request names it:
//   - The job selects by its parameters `requirements`, `useCases` and `modules`, lists of names, as the other recipes of the repository read them.
//   - The recipe gives one part, named `test-selection`, whose text holds the selected requirement as the SPEC states it (its name line and the lines to the next blank line), then each
//     guarding test as its declaration lines and its code up to the next declaration, then one line `- <name> (<kind>, <address>): paid` or `: free` per service.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { resultStrategies } from "../src/result-records/index.mjs";

const recipe = (context) => resultStrategies.recipes["test-selection"](context, context.params);

const SPEC = [
  "# Fixture product — Specification", "", "## Section", "",
  "**A SELECTED RULE** *(Product Owner)*", "The selected rule says that widgets are round.", "*Check:* `tests/round.test.mjs`", "",
  "**ANOTHER RULE** *(Product Owner)*", "The other rule says that gadgets are square.", "*Check:* `tests/square.test.mjs`", "",
].join("\n");
const ROUND = [
  "// TST-901 · level: unit · module: MOD-widgets", "// guards: A SELECTED RULE", "// given: a widget", "// input: its shape", "// expect: round",
  "test(\"widget one is round\", () => { checkRound(1); });", "",
  "// TST-902 · level: system · module: system", "// guards: A SELECTED RULE", "// given: a widget in a box", "// input: its shape in the box", "// expect: round in the box",
  "test(\"widget two is round in a box\", () => { checkRound(2); });", "",
].join("\n");
const SQUARE = [
  "// TST-903 · level: unit · module: MOD-gadgets", "// guards: ANOTHER RULE", "// given: a gadget", "// input: its shape", "// expect: square",
  "test(\"gadget is square\", () => { checkSquare(3); });", "",
].join("\n");
const HEADER = "| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|";
const RESOURCES = `# Resources of this product\n\n**REGISTER**\n\nThe resources.\n\n${HEADER}\n`
  + "| translator | endpoint | https://api.example.org/v1 | — | — | — | runner:cpu | the vendor | yes | ci:TRANSLATOR_KEY |\n"
  + "| open-data | data | https://data.example.org/set | — | CC0 | — | read on its host | — | no | — |\n"
  + "| tools | repository | https://github.com/acme/tools | 0123456789abcdef0123456789abcdef01234567 | MIT | Acme | read on its host | — | — | — |\n";
const FILES = { "SPEC.md": SPEC, "tests/round.test.mjs": ROUND, "tests/square.test.mjs": SQUARE, "docs/resources.md": RESOURCES };
const snapshotOf = (files) => ({ paths: Object.keys(files), read: async (path) => (Object.hasOwn(files, path) ? files[path] : null) });
const contextOf = (params, files = FILES) => ({ kind: null, params,
  product: { address: "https://github.com/acme/product", snapshot: snapshotOf(files), host: null },
  instance: { snapshot: snapshotOf({}), host: null, checkout: null }, connect: async () => null, participants: [], places: { sources: {}, mailbox: null },
  gates: [], person: "alice", now: new Date("2026-10-17T08:00:00Z"), agentM: { version: "unreleased", commit: "a".repeat(40) }, jobId: null });

// TST-752101 · level: unit · module: MOD-result-records
// guards: TEST GENERATION SEES THE EXISTING TESTS; UC-026
// given: a product with two requirements, a test file of two tests guarding the first and a test file of one test guarding the second
// input: the recipe test-selection with the parameter requirements = the first requirement
// expect: one part; its text holds the first requirement's name and rule, the declaration lines and code of both tests that guard it, and nothing of the second requirement or of the test that guards it — whose requirement, declaration and code the same product holds
test("test-selection gives the selected requirement and the two tests that guard it, by declaration and code, and no other", async () => {
  const known = await recipe(contextOf({ requirements: ["ANOTHER RULE"] }));
  assert.match(known[0].text, /gadgets are square/);
  assert.match(known[0].text, /TST-903 · level: unit · module: MOD-gadgets/);
  assert.match(known[0].text, /checkSquare\(3\)/);
  const parts = await recipe(contextOf({ requirements: ["A SELECTED RULE"] }));
  assert.equal(parts.length, 1);
  assert.equal(parts[0].name, "test-selection");
  const text = parts[0].text;
  assert.match(text, /\*\*A SELECTED RULE\*\*/);
  assert.match(text, /widgets are round/);
  assert.match(text, /\/\/ TST-901 · level: unit · module: MOD-widgets\n\/\/ guards: A SELECTED RULE\n\/\/ given: a widget\n\/\/ input: its shape\n\/\/ expect: round/);
  assert.match(text, /checkRound\(1\)/);
  assert.match(text, /\/\/ TST-902 · level: system · module: system/);
  assert.match(text, /checkRound\(2\)/);
  assert.doesNotMatch(text, /ANOTHER RULE|gadgets are square|TST-903|checkSquare/);
});

// TST-752102 · level: unit · module: MOD-result-records
// guards: COMMIT TESTS CALL NO PAID SERVICE; UC-026
// given: a product whose list holds an endpoint marked paid, a data source marked free and a repository
// input: the recipe test-selection with any selected requirement
// expect: the text marks the endpoint `translator` paid and the data source `open-data` free, each on a line of its own with its kind and address, and names the repository `tools` nowhere
test("test-selection marks an endpoint paid and a free data source free", async () => {
  const text = (await recipe(contextOf({ requirements: ["A SELECTED RULE"] })))[0].text;
  assert.match(text, /^- translator \(endpoint, https:\/\/api\.example\.org\/v1\): paid$/m);
  assert.match(text, /^- open-data \(data, https:\/\/data\.example\.org\/set\): free$/m);
  assert.doesNotMatch(text, /tools/);
});
