// The source of the person who gives an instruction (ITM-383) — MOD-source-register's personSource(links, register, account), as
// the accepted text of docs/architecture/MOD-source-register.md states it: the identifier of the register entry of kind `person`
// whose `identifier` is the account `<server>/<account>` and which the product links, or null (THE PERSON WHO PROMPTS IS A
// SOURCE; UC-019 step 6 and 4b: a requirement drafted from a person's instruction names that person's source, and a person
// whose source the product does not link is told so) — and, in the register entry's schema, a person's `identifier`, that
// account. The prompt route that calls it (ITM-398) is not part of this item.
// Run: node --test tests/source-register-person.test.mjs
//
// Module: MOD-source-register
// Guards: UC-019; THE PERSON WHO PROMPTS IS A SOURCE; A REQUIREMENT HAS A REGISTERED SOURCE
// Level: unit
//
// Two kinds of fixture. This instance's own: the register entries docs/sources/SRC-po-a-maier.md and SRC-vibe-coding.md and the
// links file docs/sources.md, read as they stand — the Product Owner's source is registered and linked there, as `kind: person`
// with the account `github.com/akmaier`. And ours, small and in memory: a register of eight entries — SRC-alice, a person the
// product links, and SRC-alice-old, another entry of the same account which it does not, listed before it; SRC-bob, a person it
// does not link; SRC-acme, an organisation it links whose identifier is an account; SRC-anon and SRC-blank, persons it links with
// no identifier and with an empty one; and SRC-carol, a person on a GitLab server it links — and the links file. The entries
// and the links are read as every caller reads them, through MOD-documents with the schemas sourceSchemas gives. A name the
// module does not provide yet is undefined here, so that each test fails by itself and not the whole file at once. Each test
// states its input and its expected result before it runs (given / input / expect); where a test asserts a null, the same call
// is first shown to find a source on a known positive. Nothing reaches the network. The counter-proofs are recorded in the pull
// request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { documentFindings, readDocument } from "../src/documents/index.mjs";
import * as sourceRegister from "../src/source-register/index.mjs";

const { personSource, sourceSchemas } = sourceRegister;

// ---------------------------------------------------------------- the instance's own files

const instanceFile = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const instanceEntry = (id) => readDocument(sourceSchemas().entry, `docs/sources/${id}.md`, instanceFile(`docs/sources/${id}.md`));
const INSTANCE_REGISTER = () => ["SRC-vibe-coding", "SRC-po-a-maier"].map(instanceEntry);
const INSTANCE_LINKS = () => readDocument(sourceSchemas().links, "docs/sources.md", instanceFile("docs/sources.md"));

// ---------------------------------------------------------------- the fixture register and links

const text = (...lines) => `${lines.join("\n")}\n`;
// A complete register entry: its front matter, a body, and one version.
const entryText = ({ id, title, kind, identifier = null }) => text("---", `id: ${id}`, `title: ${title}`, `kind: ${kind}`,
  "authority: normative", "licence: may be republished — fixture",
  ...(identifier === null ? [] : [`identifier: ${identifier}`.trim()]), "---", `# ${id} ${title}`, "", "A fixture source.", "",
  "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  "| `2026-10-11` | 2026-10-11 | the fixture | this repository | one file, hashed only |");
const ENTRIES = [
  { id: "SRC-alice-old", title: "Alice, before", kind: "person", identifier: "github.com/alice" },
  { id: "SRC-alice", title: "Alice", kind: "person", identifier: "github.com/alice" },
  { id: "SRC-bob", title: "Bob", kind: "person", identifier: "github.com/bob" },
  { id: "SRC-acme", title: "Acme", kind: "organisation", identifier: "github.com/acme" },
  { id: "SRC-anon", title: "Anon", kind: "person" },
  { id: "SRC-blank", title: "Blank", kind: "person", identifier: "" },
  { id: "SRC-carol", title: "Carol", kind: "person", identifier: "gitlab.example.org/carol" },
  { id: "SRC-vibe-coding", title: "Vibe Coding", kind: "document" },
];
const entryDocument = (entry) => readDocument(sourceSchemas().entry, `docs/sources/${entry.id}.md`, entryText(entry));
const entryOf = (id) => ENTRIES.find((entry) => entry.id === id);
// What documentFindings makes of an entry under the entry schema: what its findings say — or, where it cannot name a rule for
// one, as this schema names none, what the error it ends in says. Empty for an entry that passes.
function problemsOf(entry) {
  try {
    return documentFindings(sourceSchemas().entry, entry).map((each) => each.what);
  } catch (error) {
    return [error.message];
  }
}
const register = () => ENTRIES.map(entryDocument);

const SHA = "0".repeat(64);
const linkRow = (id) => `| ${id} | 2026-10-11 | ${SHA} | |`;
const LINKED = ["SRC-alice", "SRC-acme", "SRC-anon", "SRC-blank", "SRC-carol", "SRC-vibe-coding"];
const links = () => readDocument(sourceSchemas().links, "docs/sources.md", text("# The sources this product meets", "",
  "| Source | Version | Hash | Part |", "|---|---|---|---|", ...LINKED.map(linkRow)));

// ---------------------------------------------------------------- the source of a person

// guards: THE PERSON WHO PROMPTS IS A SOURCE; UC-019
// given: this instance's register — the book and SRC-po-a-maier, kind person, identifier github.com/akmaier — and its links
//        file docs/sources.md, which links both
// input: personSource(links, register, "github.com/akmaier"); and, as the check that the instance's data do not answer for every
//        account, personSource for github.com/nobody
// expect: "SRC-po-a-maier", the identifier of that entry; null for the other account
test("personSource — this instance's SRC-po-a-maier is the source of github.com/akmaier", () => {
  assert.equal(personSource(INSTANCE_LINKS(), INSTANCE_REGISTER(), "github.com/akmaier"), "SRC-po-a-maier");

  assert.equal(personSource(INSTANCE_LINKS(), INSTANCE_REGISTER(), "github.com/nobody"), null);
});

// guards: THE PERSON WHO PROMPTS IS A SOURCE; A REQUIREMENT HAS A REGISTERED SOURCE; UC-019
// given: the fixture register and links above: SRC-alice (a person, github.com/alice, linked) listed after SRC-alice-old (the same
//        account, not linked); SRC-bob (github.com/bob, not linked); SRC-acme (an organisation, github.com/acme, linked);
//        SRC-anon (a person with no identifier, linked) and SRC-blank (an empty one, linked); SRC-carol
//        (gitlab.example.org/carol, linked)
// input: personSource for github.com/alice, for gitlab.example.org/carol, and then for: github.com/nobody, no entry of that
//        account; github.com/bob, an entry the product does not link; github.com/acme, an entry of another kind; accounts that
//        differ from an entry's by the server, by a letter at either end, or by being only the account name; and no account —
//        undefined, null, an empty text —, which no entry without an identifier or with an empty one is the source of
// expect: "SRC-alice", not SRC-alice-old, and "SRC-carol"; null for every other
test("personSource — null for an account without an entry, for an entry the product does not link and for an entry of another kind", () => {
  const found = (account) => personSource(links(), register(), account);
  assert.equal(found("github.com/alice"), "SRC-alice", "known positive: the linked entry, not the unlinked one before it");
  assert.equal(found("gitlab.example.org/carol"), "SRC-carol", "known positive: an account on another server");

  assert.equal(found("github.com/nobody"), null, "no entry has that account");
  assert.equal(found("github.com/bob"), null, "the entry is not linked");
  assert.equal(found("github.com/acme"), null, "the entry is an organisation");
  for (const account of ["carol", "github.com/carol", "gitlab.example.org/alice", "github.com/alic", "github.com/alice2",
    "ithub.com/alice", "xgithub.com/alice"]) {
    assert.equal(found(account), null, account);
  }
  for (const account of [undefined, null, ""]) assert.equal(found(account), null, `no account: ${String(account)}`);
});

// guards: THE PERSON WHO PROMPTS IS A SOURCE; UC-019
// given: this instance's SRC-po-a-maier, and the fixture's person entries — SRC-alice with the identifier github.com/alice and
//        SRC-carol with gitlab.example.org/carol, accounts on two servers — each read with the schema sourceSchemas gives
// input: documentFindings of each entry with that schema; and, as the known positive, of an entry whose kind is none of the
//        schema's
// expect: no finding for any, and for each the front matter key `identifier` holds the account `<server>/<account>` as written;
//         for the entry of a kind the schema does not know, a finding
test("sourceSchemas — a person's entry with its identifier, the account on a repository server, passes the schema", () => {
  const entries = [[instanceEntry("SRC-po-a-maier"), "github.com/akmaier"],
    [entryDocument(entryOf("SRC-alice")), "github.com/alice"], [entryDocument(entryOf("SRC-carol")), "gitlab.example.org/carol"]];
  const friend = entryDocument({ id: "SRC-friend", title: "Friend", kind: "friend", identifier: "github.com/friend" });
  assert.notDeepEqual(problemsOf(friend), [], "known positive: an entry of a kind the schema does not know is found wanting");

  for (const [entry, account] of entries) {
    assert.equal(entry.fields.kind, "person", entry.id);
    assert.equal(entry.fields.identifier, account, entry.id);
    assert.deepEqual(problemsOf(entry), [], entry.id);
  }
});
