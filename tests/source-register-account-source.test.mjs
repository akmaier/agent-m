// The person's account is their source — MOD-source-register's sourceFindings over an item of a requirement's source that is an account, as
// docs/architecture/MOD-source-register.md states it (Data, "How a requirement names an account": "An item of a requirement's source names an account when it
// is, alone or followed by `, ` and the part it draws on, `<server>/<account>` … An account is a source of every product without a register entry or a
// link"; Interfaces: sourceFindings "for each requirement none of whose source items names a source the product links or an account"; personSource is
// withdrawn, personAccount is the person's source). SPEC §2 A REQUIREMENT HAS A REGISTERED SOURCE, THE PERSON WHO PROMPTS IS A SOURCE.
// Run: node --test tests/source-register-account-source.test.mjs
//
// Module: MOD-source-register
// Guards: A REQUIREMENT HAS A REGISTERED SOURCE; THE PERSON WHO PROMPTS IS A SOURCE; UC-019
// Level: unit
//
// The register holds one entry, SRC-book, which the product links; no entry names an account, and the links file links nothing else. The entries and the links
// are read as every caller reads them, through MOD-documents with the schemas sourceSchemas gives. Each test states its input and its expected result before it
// runs (given / input / expect); where a test asserts that an item passes, the same call is shown to fail for an item that is neither linked nor an account. The
// counter-proofs are recorded in the pull request. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { readDocument } from "../src/documents/index.mjs";
import * as sourceRegister from "../src/source-register/index.mjs";

const { sourceFindings, sourceSchemas } = sourceRegister;
const REGISTERED = "A REQUIREMENT HAS A REGISTERED SOURCE";

const text = (...lines) => `${lines.join("\n")}\n`;
const register = () => [readDocument(sourceSchemas().entry, "docs/sources/SRC-book.md", text("---", "id: SRC-book", "title: The book", "kind: document",
  "authority: normative", "licence: may be republished — fixture", "---", "# SRC-book The book", "", "A fixture source.", "", "## Versions", "",
  "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|", "| `2026-11-08` | 2026-11-08 | the fixture | this repository | one file, hashed only |"))];
const links = () => readDocument(sourceSchemas().links, "docs/sources.md", text("# The sources this product meets", "", "| Source | Version | Hash | Part |",
  "|---|---|---|---|", `| SRC-book | 2026-11-08 | ${"0".repeat(64)} | |`));
// A requirement whose source items are `sources`, as MOD-spec-document's parseSpec gives it.
const requirement = (...sources) => ({ name: "A FIXTURE RULE", line: 7, sources });
const rulesOf = (sources) => sourceFindings([requirement(...sources)], links(), register()).map((each) => `${each.kind} ${each.rule}`);

// TST-2026110801 · level: unit · module: MOD-source-register
// guards: A REQUIREMENT HAS A REGISTERED SOURCE; THE PERSON WHO PROMPTS IS A SOURCE
// given: the register and links above — no entry names an account, the product links SRC-book alone
// input: sourceFindings of a requirement whose only source item is each of: github.com/akmaier; github.com/akmaier, issue 12; gitlab.example.org:8443/akmaier, issue 12;
//   gitlab.rrze.fau.de/a.maier_2-x — and, as known positives, of SRC-book, which the product links, and of SRC-other, which names no entry
// expect: no finding for any of the accounts, nor for SRC-book; one error under A REQUIREMENT HAS A REGISTERED SOURCE for SRC-other
test("TST-2026110801: an item that is an account is a source of the product without a register entry or a link", () => {
  assert.deepEqual(rulesOf(["SRC-book"]), [], "known positive: a linked source passes");
  assert.deepEqual(rulesOf(["SRC-other"]), [`error ${REGISTERED}`], "known positive: an item that is neither fails");
  for (const account of ["github.com/akmaier", "github.com/akmaier, issue 12", "gitlab.example.org:8443/akmaier, issue 12", "gitlab.rrze.fau.de/a.maier_2-x"]) {
    assert.deepEqual(rulesOf([account]), [], account);
  }
});

// TST-2026110802 · level: unit · module: MOD-source-register
// guards: A REQUIREMENT HAS A REGISTERED SOURCE
// given: the register and links above
// input: sourceFindings of a requirement whose only source item is each of these, none an account by the grammar: akmaier (no server); github/akmaier (a server of one label);
//   github.com/ (no account); github.com/ak maier (a space); github.com/akmaier/agent-m (a second `/`); github.com/akmaier,issue (no space after the comma);
//   https://github.com/akmaier (a scheme); github.com:port/akmaier (a port that is no number); and, as the known positive, github.com/akmaier
// expect: one error under A REQUIREMENT HAS A REGISTERED SOURCE for each, which names the item; none for github.com/akmaier
test("TST-2026110802: an item that only resembles an account is no source", () => {
  assert.deepEqual(rulesOf(["github.com/akmaier"]), [], "known positive: an account");
  for (const item of ["akmaier", "github/akmaier", "github.com/", "github.com/ak maier", "github.com/akmaier/agent-m", "github.com/akmaier,issue",
    "https://github.com/akmaier", "github.com:port/akmaier"]) {
    const found = sourceFindings([requirement(item)], links(), register());
    assert.deepEqual(found.map((each) => `${each.kind} ${each.rule}`), [`error ${REGISTERED}`], item);
    assert.ok(found[0].what.includes(item), `${item}: the finding names the item`);
  }
});

// TST-2026110803 · level: unit · module: MOD-source-register
// guards: THE PERSON WHO PROMPTS IS A SOURCE
// given: the module's interface
// input: its exports personAccount and personSource
// expect: personAccount is a function — the account, which is the person's source —; personSource, withdrawn, is not exported
test("TST-2026110803: the person's source is their account: personAccount is offered, personSource is not", () => {
  assert.equal(typeof sourceRegister.personAccount, "function");
  assert.equal("personSource" in sourceRegister, false);
});
