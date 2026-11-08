// A person's register entry (ITM-383) — in MOD-source-register's schema of a register entry, a person's `identifier`, the account `<server>/<account>` on a repository
// server, as the accepted text of docs/architecture/MOD-source-register.md states it (Data: "`identifier` … a person's account on a repository server,
// `<server>/<account>`"). The person's source is their account itself (personAccount, tests/source-register-person-account-552.test.mjs), which needs no entry;
// personSource, which looked the account up among the register's entries, is withdrawn, and its tests with it.
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

const { sourceSchemas } = sourceRegister;

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

// TST-472923 · level: unit · module: MOD-source-register
// guards: THE PERSON WHO PROMPTS IS A SOURCE; UC-019
// given: this instance's SRC-po-a-maier, and the fixture's person entries — SRC-alice with the identifier github.com/alice and SRC-carol with gitlab.example.org/carol, accounts on two servers — each read with the schema sourceSchemas gives
// input: documentFindings of each entry with that schema; and, as the known positive, of an entry whose kind is none of the schema's
// expect: no finding for any, and for each the front matter key `identifier` holds the account `<server>/<account>` as written; for the entry of a kind the schema does not know, a finding
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
