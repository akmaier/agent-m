// MOD-source-register's restrictedPlaces (ITM-1142), as docs/architecture/MOD-source-register.md states it: "`restrictedPlaces(register: Document[], product: string) -> { sources: Record<string, string[]>, contents: { source: string, paths:
// string[] }[] }` — the `places.sources` and `places.contents` of MOD-job-runner's `JobContext`, in one place for every caller (`RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS`). `register` is every entry of the instance's register …
// whether or not the product links it; `product` is the product's address. For each entry whose content may not be republished — an unknown licence counts as restricted —, `sources` gives, by the entry's identifier and in the register's
// order, the places `permittedPlaces` gives (none, an empty list, where it declares none). `contents` gives a restricted source's content only where the product holds it: when the entry's `content_repository` is the repository `product`
// names, the folder `docs/sources/<identifier>/` of the product; a source whose content lies in another repository has no entry … Pure: no request is made, and the caller reads the register."
// Run: node --test tests/source-register-restricted-places.test.mjs
//
// Module: MOD-source-register
// Guards: RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// Level: unit
//
// The register is a list of entries read with sourceSchemas, as the callers read it; nothing is read from a repository and no request is made. Each test states its input and its expected result before it runs. The counter-proofs are run as
// mutations and recorded in the pull request.
//
// Where the texts leave a reading open, the tests state the one they take, and the pull request names it:
//   - Two addresses name the same repository when they are equal once a trailing slash, a trailing `.git` and the case of the text are left out (the function is given the addresses as the register and the page hold them, and parses none).
//   - The result follows the order of the register given.

import test from "node:test";
import assert from "node:assert/strict";
import { readDocument } from "../src/documents/index.mjs";
import { restrictedPlaces, sourceSchemas } from "../src/source-register/index.mjs";

const PRODUCT = "https://github.com/acme/thesis-tool";
const entry = (id, licence, { places = [], content = null } = {}) => readDocument(sourceSchemas().entry, `docs/sources/${id}.md`, [
  "---", `id: ${id}`, `title: ${id} title`, "kind: document", "authority: informational", `licence: ${licence}`,
  ...(places.length ? ["places:", ...places.map((place) => `  - ${place}`)] : []), ...(content ? [`content_repository: ${content}`] : []), "---",
  `# ${id} ${id} title`, "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|", "| `1` | 2026-10-13 | fixture | here | one file, hashed only |", ""].join("\n"));

const REGISTER = [
  entry("SRC-open", "may be republished - EU law"),
  entry("SRC-here", "restricted - internal", { places: ["this machine"], content: PRODUCT }),
  entry("SRC-elsewhere", "restricted - customer", { places: ["this machine", "NHR@FAU, Erlangen"], content: "https://github.com/acme/other-repository" }),
  entry("SRC-unknown", "unknown"),
];

// TST-1142001 · level: unit · module: MOD-source-register
// guards: RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: a register of four entries — one that may be republished, one restricted to "this machine" whose content repository is the product, one restricted to two places whose content repository is another, one of unknown licence with no places; the product's address
// input: restrictedPlaces(register, product)
// expect: sources are SRC-here → ["this machine"], SRC-elsewhere → both places, SRC-unknown → [] (unknown counts as restricted), in the register's order, and not SRC-open; contents is SRC-here → docs/sources/SRC-here alone
test("TST-1142001 every restricted entry gives its places, and its content only where the product holds it", () => {
  const found = restrictedPlaces(REGISTER, PRODUCT);
  assert.deepEqual(found.sources, { "SRC-here": ["this machine"], "SRC-elsewhere": ["this machine", "NHR@FAU, Erlangen"], "SRC-unknown": [] });
  assert.deepEqual(Object.keys(found.sources), ["SRC-here", "SRC-elsewhere", "SRC-unknown"]);
  assert.deepEqual(found.contents, [{ source: "SRC-here", paths: ["docs/sources/SRC-here"] }]);
});

// TST-1142002 · level: unit · module: MOD-source-register
// guards: RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: the same register, and a product that is the other repository, written with a trailing slash and in another case
// input: restrictedPlaces(register, "HTTPS://github.com/acme/Other-Repository/")
// expect: contents is SRC-elsewhere → docs/sources/SRC-elsewhere alone; sources are the same three as before
test("TST-1142002 the product is told from the content repository by its address, not by its spelling", () => {
  const found = restrictedPlaces(REGISTER, "HTTPS://github.com/acme/Other-Repository/");
  assert.deepEqual(found.contents, [{ source: "SRC-elsewhere", paths: ["docs/sources/SRC-elsewhere"] }]);
  assert.deepEqual(Object.keys(found.sources), ["SRC-here", "SRC-elsewhere", "SRC-unknown"]);
});

// TST-1142003 · level: unit · module: MOD-source-register
// guards: RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: an empty register, and a register of entries that may all be republished
// input: restrictedPlaces for each
// expect: no source and no content for either
test("TST-1142003 a register without restricted entries gives none", () => {
  assert.deepEqual(restrictedPlaces([], PRODUCT), { sources: {}, contents: [] });
  assert.deepEqual(restrictedPlaces([entry("SRC-open", "may be republished - EU law")], PRODUCT), { sources: {}, contents: [] });
});

// TST-1142004 · level: unit · module: MOD-source-register
// guards: RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: the register of TST-1142001
// input: restrictedPlaces twice, and the register read afterwards
// expect: the same answer both times, and the entries as they were (the function is pure: it changes nothing it is given)
test("TST-1142004 the function is pure", () => {
  const before = JSON.stringify(REGISTER);
  assert.deepEqual(restrictedPlaces(REGISTER, PRODUCT), restrictedPlaces(REGISTER, PRODUCT));
  assert.equal(JSON.stringify(REGISTER), before);
});
