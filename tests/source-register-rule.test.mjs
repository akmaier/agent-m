// A source entry's schema names its rule (ITM-458) — MOD-source-register's `source.schema.md`, the schema of a register entry, as MOD-documents'
// schema language asks of every schema (docs/architecture/MOD-documents.md: `rule` — "the requirement the format applies ...; every schema names one,
// and a finding names it when no part of the schema closer to the finding names its own"), and docs/architecture/MOD-source-register.md (Data: the
// register entry `docs/sources/SRC-<slug>.md`). The requirement the format applies is `THE INSTANCE KEEPS THE SOURCE REGISTER`. For UC-004.
// Run: node --test tests/source-register-rule.test.mjs
//
// Module: MOD-source-register
// Guards: UC-004; THE INSTANCE KEEPS THE SOURCE REGISTER
// Level: unit
//
// Entries are read with MOD-documents' readDocument and judged with documentFindings, as every caller does, against sourceSchemas().entry. Each test
// states its input and its expected result before it runs (given / input / expect); where a test asserts a finding, a valid entry is first shown to give
// none. Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { documentFindings, readDocument } from "../src/documents/index.mjs";
import { sourceSchemas } from "../src/source-register/index.mjs";

const RULE = "THE INSTANCE KEEPS THE SOURCE REGISTER";
const SOURCES = new URL("../docs/sources/", import.meta.url);
const VALID = [
  "---", "id: SRC-x", "title: A source", "kind: document", "authority: advisory", "licence: may be republished — CC BY 4.0", "---",
  "# SRC-x A source", "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  "| `v1` | 2026-10-12 | — | — | 1 file, listed below |", "",
].join("\n");
const findingsOf = (text, path = "docs/sources/SRC-x.md") => documentFindings(sourceSchemas().entry, readDocument(sourceSchemas().entry, path, text));

// TST-472932 · level: unit · module: MOD-source-register
// guards: THE INSTANCE KEEPS THE SOURCE REGISTER; UC-004
// given: a valid register entry; the same without `authority`, which every entry requires
// input: documentFindings(sourceSchemas().entry, the entry read)
// expect: the valid entry gives no finding; the other gives an error, without any exception, whose rule is `THE INSTANCE KEEPS THE SOURCE REGISTER` and whose text names `authority`
test("documentFindings — an entry missing a required field gives a finding that names the rule of the register, and throws nothing", () => {
  assert.deepEqual(findingsOf(VALID), [], "known positive: a valid entry");
  const found = findingsOf(VALID.replace(/^authority: .*\n/m, ""));
  assert.ok(found.length >= 1);
  assert.ok(found.every((each) => each.kind === "error" && each.rule === RULE), found.map((each) => each.rule).join());
  assert.ok(found.some((each) => each.what.includes("authority")));
});

// TST-472933 · level: unit · module: MOD-source-register
// guards: THE INSTANCE KEEPS THE SOURCE REGISTER; THE SOURCE KIND IS ONE OF A CLOSED SET
// given: a valid entry; the same with a kind outside the closed set; the same with a section the format forbids
// input: documentFindings of each
// expect: no finding for the valid one; for each other at least one error naming `THE INSTANCE KEEPS THE SOURCE REGISTER` where no part of the schema names its own rule, none thrown
test("documentFindings — a kind outside the set and a section the format forbids are findings of the register's rule too", () => {
  assert.deepEqual(findingsOf(VALID), [], "known positive: a valid entry");
  for (const text of [VALID.replace("kind: document", "kind: nonsense"), `${VALID}\n## Notes\n\nA section the format does not have.\n`]) {
    const found = findingsOf(text);
    assert.ok(found.length >= 1 && found.every((each) => each.rule === RULE), found.map((each) => each.rule).join());
  }
});

// TST-472934 · level: unit · module: MOD-source-register
// guards: THE INSTANCE KEEPS THE SOURCE REGISTER; UC-004
// given: every register entry this repository holds, docs/sources/SRC-*.md, as it stands; and each with its `authority` line removed
// input: documentFindings of each
// expect: the entries as they stand give no finding, as before; without `authority` each gives findings naming the register's rule, none thrown
test("documentFindings — this repository's own register entries give none as they stand, and name the rule once a field is missing", () => {
  const names = readdirSync(SOURCES).filter((name) => /^SRC-.*\.md$/.test(name));
  assert.ok(names.length >= 2, "known positive: the entries are found");
  for (const name of names) {
    const text = readFileSync(new URL(name, SOURCES), "utf8");
    assert.deepEqual(findingsOf(text, `docs/sources/${name}`), [], name);
    const found = findingsOf(text.replace(/^authority: .*\n/m, ""), `docs/sources/${name}`);
    assert.ok(found.length >= 1 && found.every((each) => each.rule === RULE), name);
  }
});
