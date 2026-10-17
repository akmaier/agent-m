// ITM-844: sourcesOf of a product's SPEC entry page (MOD-review-pages, spec-entries.mjs) asks the instance's snapshot for the instance's register in one readMany.
// Run: node --test tests/review-pages-spec-entries-register-batch.test.mjs
//
// Module: MOD-review-pages
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; A REQUIREMENT HAS A REGISTERED SOURCE
// Level: unit
//
// The product's links file docs/sources.md is held by the product's snapshot, the register docs/sources/SRC-<slug>.md by the instance's, which is a second fake.
// Its readMany records the batches it was asked for and holds those texts; a read of a text it does not hold yet is a read on its own, recorded as such.

import test from "node:test";
import assert from "node:assert/strict";

const { sourcesOf } = await import("../src/review-pages/spec-entries.mjs");

const text = (...lines) => `${lines.join("\n")}\n`;
const entry = (id, account) => text("---", `id: ${id}`, `title: ${id}`, "kind: person", `identifier: ${account}`, "authority: informational", "licence: may be republished - fixture",
  "---", `# ${id} ${id}`, "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|", "| `2026-10-13` | 2026-10-13 | fixture | this repository | one file, hashed only |");
const LINKS = text("# Requirement sources of the product", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| SRC-alice | 2026-10-13 | ${"0".repeat(64)} | |`);
const REGISTER = { "docs/sources/SRC-alice.md": entry("SRC-alice", "github.com/alice"), "docs/sources/SRC-bob.md": entry("SRC-bob", "github.com/bob") };
const OTHER = { "docs/participants.md": "# Participants\n", "README.md": "# Agent M\n" };

// A snapshot over `files` that records its batches and its reads on their own; with `batches` false it has no readMany, as a snapshot of a server that reads none ahead.
function snapshotOf(files, { batches = true } = {}) {
  const asked = [], alone = [], held = new Set();
  const snapshot = { paths: Object.keys(files).sort(), blob: () => null,
    read: async (path) => { if (!held.has(path)) alone.push(path); return path in files ? files[path] : null; } };
  if (batches) snapshot.readMany = async (paths) => { asked.push([...paths]); for (const path of paths) held.add(path); };
  return { snapshot, asked, alone };
}
// The page of a product (its snapshot and the context with the instance's host over its snapshot), or the instance's own (no product).
const productPage = (product, instance) => ({ snapshot: product.snapshot, context: { product: { address: "https://github.com/alice/product" },
  instance: { host: { repositoryInfo: async () => ({ defaultBranch: "main" }), readSnapshot: async () => instance.snapshot } } } });

// TST-844101 · level: unit · module: MOD-review-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: a product whose snapshot holds docs/sources.md, and an instance whose snapshot holds the register entries SRC-alice and SRC-bob and two other files
// input: sourcesOf of the product's page
// expect: the instance's snapshot is asked once, by readMany, for exactly docs/sources/SRC-alice.md and docs/sources/SRC-bob.md; no instance file is read on its own; the register comes back as the documents SRC-alice and SRC-bob, the links as the one row SRC-alice
test("TST-844101: sourcesOf asks the instance's snapshot for its register in one readMany", async () => {
  const product = snapshotOf({ "docs/sources.md": LINKS }), instance = snapshotOf({ ...REGISTER, ...OTHER });
  const { links, register } = await sourcesOf(productPage(product, instance));

  assert.deepEqual(instance.asked.map((paths) => [...paths].sort()), [["docs/sources/SRC-alice.md", "docs/sources/SRC-bob.md"]]);
  assert.deepEqual(instance.alone, []);
  assert.deepEqual(register.map((each) => each.id).sort(), ["SRC-alice", "SRC-bob"]);
  assert.equal(register.find((each) => each.id === "SRC-alice").fields.identifier, "github.com/alice");
  assert.deepEqual(links.sections[0].rows.map((row) => row.cells.Source), ["SRC-alice"]);
});

// TST-844102 · level: unit · module: MOD-review-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: the page of the instance itself (no product), whose snapshot holds docs/sources.md and the register entries, and which the entry page has asked for already
// input: sourcesOf of the instance's page
// expect: sourcesOf asks for nothing of its own: no readMany call; the register comes back as SRC-alice and SRC-bob
test("TST-844102: on the instance's own page sourcesOf adds no readMany", async () => {
  const own = snapshotOf({ "docs/sources.md": LINKS, ...REGISTER, ...OTHER });
  const { register } = await sourcesOf({ snapshot: own.snapshot, context: {} });

  assert.deepEqual(own.asked, []);
  assert.deepEqual(register.map((each) => each.id).sort(), ["SRC-alice", "SRC-bob"]);
});

// TST-844103 · level: unit · module: MOD-review-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES
// given: a product's page whose instance snapshot holds no register entry
// input: sourcesOf of the product's page
// expect: the instance's snapshot is not asked for anything: no readMany call and no read on its own; the register comes back empty
test("TST-844103: an instance without register entries is asked for nothing", async () => {
  const product = snapshotOf({ "docs/sources.md": LINKS }), instance = snapshotOf({ ...OTHER });
  const { register } = await sourcesOf(productPage(product, instance));

  assert.deepEqual(instance.asked, []);
  assert.deepEqual(instance.alone, []);
  assert.deepEqual(register, []);
});

// TST-844104 · level: unit · module: MOD-review-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; A REQUIREMENT HAS A REGISTERED SOURCE
// given: a product's page whose instance snapshot has no readMany (a snapshot that reads nothing ahead), and holds SRC-alice and SRC-bob
// input: sourcesOf of the product's page
// expect: each register file is read on its own, in the order of the snapshot's paths (docs/sources/SRC-alice.md, then docs/sources/SRC-bob.md); the register comes back as SRC-alice and SRC-bob
test("TST-844104: a snapshot without readMany gives the register file by file", async () => {
  const product = snapshotOf({ "docs/sources.md": LINKS }), instance = snapshotOf({ ...REGISTER, ...OTHER }, { batches: false });
  const { register } = await sourcesOf(productPage(product, instance));

  assert.deepEqual(instance.alone, ["docs/sources/SRC-alice.md", "docs/sources/SRC-bob.md"]);
  assert.deepEqual(register.map((each) => each.id).sort(), ["SRC-alice", "SRC-bob"]);
});
