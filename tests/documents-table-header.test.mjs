// A section whose table's header does not name exactly its schema's columns is named, not read as empty (ITM-1143) — MOD-documents' documentFindings, as docs/architecture/MOD-documents.md states it: "a section whose schema names a table with a
// header row, that holds a table but none whose header row names exactly the table's columns, named at its first table's header with the columns that header adds, lacks or puts out of order" (a section's table is the first table whose header
// row names exactly the table's columns). One extra column, even a harmless `Notes`, made a register read as empty with no finding; a resource list that carries a participant's `Capabilities` and `Role` is rejected (A RESOURCE IS USED, A PARTICIPANT
// DEVELOPS, SPEC.md:2197).
// Run: node --test tests/documents-table-header.test.mjs
//
// Module: MOD-documents
// Guards: A RESOURCE IS USED, A PARTICIPANT DEVELOPS; PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PRODUCT DECLARES ITS RESOURCES
// Level: unit
//
// The documents are small texts of the tests' own, read with the schemas of MOD-participant-list and MOD-resource-list; nothing is read from a repository except, in the last test, the documents of this repository. Each test states its input and its
// expected result before it runs. The counter-proofs are run as mutations and recorded in the pull request.
//
// Where the texts leave a reading open, the tests state the one they take, and the pull request names it:
//   - The finding is an error at the line of the first table's header row, and its words name the section, the columns the header adds, lacks, or (when it names the same columns in another order) puts out of order.
//   - A section that holds no table at all gives no such finding; a section that holds two tables of which the second names exactly the columns gives none (the section's table is found).

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { artifactSchemaOf, documentFindings, readDocument } from "../src/documents/index.mjs";
import { participantSchema } from "../src/participant-list/index.mjs";
import { resourceSchema } from "../src/resource-list/index.mjs";

const PARTICIPANTS = ["Name", "Type", "Model", "Context", "Price", "Capabilities", "Processing place", "Route"];
const ROW = "alice | person | — | — | — | read the repository | — | account github.com/alice";
const register = (columns, row = ROW, before = []) => [ "# Participants of this instance", "", "**REGISTER**", "", "The people and agents.", "", ...before,
  `| ${columns.join(" | ")} |`, `|${columns.map(() => "---").join("|")}|`, `| ${row} |`, ""].join("\n");
const findingsOf = (schema, path, body) => documentFindings(schema, readDocument(schema, path, body));
const header = (found) => found.filter((each) => /header/.test(each.what));

// TST-1143001 · level: unit · module: MOD-documents
// guards: PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE
// given: the participants register with its eight columns, and the same with a ninth column "Notes"
// input: documentFindings for each
// expect: none for the first (known positive: it reads its row); for the second one finding, an error at the header row's line, that names the section's table and the column Notes as added
test("TST-1143001 an extra column is named, and the register that has the columns it names is not", () => {
  const schema = participantSchema();
  const good = readDocument(schema, "docs/participants.md", register(PARTICIPANTS));
  assert.equal(good.sections.some((section) => section.rows?.length === 1), true, "known positive: the row is read");
  assert.deepEqual(documentFindings(schema, good), []);
  const found = header(findingsOf(schema, "docs/participants.md", register([...PARTICIPANTS, "Notes"], `${ROW} | hi`)));
  assert.equal(found.length, 1);
  assert.equal(found[0].kind, "error");
  assert.equal(found[0].line, 7, "the line of the header row");
  assert.equal(found[0].what.includes("Notes"), true, found[0].what);
  assert.equal(/adds/.test(found[0].what), true, found[0].what);
});

// TST-1143002 · level: unit · module: MOD-documents
// guards: PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE
// given: the register with the column Route left out, and the register with Type and Model changed places
// input: documentFindings for each
// expect: one finding each: the first says the header lacks Route, the second that Type and Model stand out of order
test("TST-1143002 a column left out, and columns out of order, are named", () => {
  const schema = participantSchema();
  const lacking = header(findingsOf(schema, "docs/participants.md", register(PARTICIPANTS.filter((name) => name !== "Route"), ROW.replace(" | account github.com/alice", ""))));
  assert.equal(lacking.length, 1);
  assert.equal(/lacks/.test(lacking[0].what) && lacking[0].what.includes("Route"), true, lacking[0].what);
  const swapped = [...PARTICIPANTS];
  [swapped[1], swapped[2]] = [swapped[2], swapped[1]];
  const out = header(findingsOf(schema, "docs/participants.md", register(swapped)));
  assert.equal(out.length, 1);
  assert.equal(/out of order/.test(out[0].what) && out[0].what.includes("Type") && out[0].what.includes("Model"), true, out[0].what);
});

// TST-1143003 · level: unit · module: MOD-documents
// guards: PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE
// given: a register with no table at all, and one with an unrelated table before the table that names exactly the columns
// input: documentFindings for each
// expect: no finding of this kind for either (the section holds no table; the section's table is the second one)
test("TST-1143003 a section with no table, or whose table stands after another table, is not named", () => {
  const schema = participantSchema();
  const none = ["# Participants of this instance", "", "**REGISTER**", "", "The people and agents.", ""].join("\n");
  assert.deepEqual(header(findingsOf(schema, "docs/participants.md", none)), []);
  const second = register(PARTICIPANTS, ROW, ["| Note | Text |", "|---|---|", "| a | b |", ""]);
  assert.deepEqual(header(findingsOf(schema, "docs/participants.md", second)), []);
  assert.equal(readDocument(schema, "docs/participants.md", second).sections.some((section) => section.rows?.length === 1), true, "known positive: its row is read");
});

// TST-1143004 · level: unit · module: MOD-documents
// guards: A PRODUCT DECLARES ITS RESOURCES
// given: a resource list whose table has the columns Notes and Owner, which the schema does not name, besides the ten of the list, with an agent that fills them; and the same list without those two columns
// input: documentFindings with the resource schema for each
// expect: the first gets a finding that names Notes and Owner as added, under the schema's rule; the second none (the counter-proof: the same list without the two columns is accepted). The columns Capabilities and Role are the schema's own optional columns (ITM-1154)
test("TST-1143004 a resource list that adds columns the schema does not name is rejected, and the same list without them is accepted", () => {
  const schema = resourceSchema();
  const columns = ["Name", "Kind", "Address", "Pin", "Licence", "Maintainer", "Route", "Processing place", "Paid", "Secret"];
  const row = ["agent-service", "agent", "https://agent.example.org", "example-agent", "—", "the Acme organisation", "bridge workstation", "the group's workstation", "no", "—"].join(" | ");
  const list = (names, cells) => ["# Resources of the product", "", `| ${names.join(" | ")} |`, `|${names.map(() => "---").join("|")}|`, `| ${cells} |`, ""].join("\n");
  const without = header(findingsOf(schema, "docs/resources.md", list(columns, row)));
  assert.deepEqual(without, []);
  const carried = header(findingsOf(schema, "docs/resources.md", list([...columns, "Notes", "Owner"], `${row} | a note | alice`)));
  assert.equal(carried.length, 1);
  assert.equal(carried[0].what.includes("adds Notes, Owner"), true, carried[0].what);
});

// TST-1143005 · level: unit · module: MOD-documents
// guards: PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PRODUCT DECLARES ITS RESOURCES
// given: every document of this repository that a schema reads: the files under docs/ that artifactSchemaOf names a schema for, docs/participants.md, and docs/resources.md where there is one
// input: readDocument and documentFindings for each, and the findings of this kind among them
// expect: none (the finding fires on no document that stands; the known positive: at least a hundred documents were read)
test("TST-1143005 the finding fires on no document of the repository", () => {
  const root = new URL("..", import.meta.url).pathname;
  const walk = (dir) => readdirSync(dir).flatMap((name) => { const path = join(dir, name); return statSync(path).isDirectory() ? walk(path) : [path]; });
  const paths = walk(join(root, "docs")).filter((path) => path.endsWith(".md")).map((path) => relative(root, path));
  let read = 0;
  const fired = [];
  for (const path of paths) {
    const schema = path === "docs/participants.md" ? participantSchema() : path === "docs/resources.md" ? resourceSchema() : artifactSchemaOf(path);
    if (!schema) continue;
    read += 1;
    for (const found of header(documentFindings(schema, readDocument(schema, path, readFileSync(join(root, path), "utf8"))))) fired.push(`${path}:${found.line} ${found.what}`);
  }
  assert.equal(read >= 100, true, `read ${read} documents`);
  assert.deepEqual(fired, []);
});

// TST-1143006 · level: unit · module: MOD-documents
// guards: PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE
// given: a register with two tables, neither naming the columns: a first of two columns and a second with the column Notes added
// input: documentFindings
// expect: one finding, at the header row of the first table (named "at its first table's header"), and not at the second's
test("TST-1143006 a section whose tables all fail is named at its first table's header", () => {
  const schema = participantSchema();
  const body = ["# Participants of this instance", "", "**REGISTER**", "", "The people and agents.", "", "| Note | Text |", "|---|---|", "| a | b |", "",
    `| ${[...PARTICIPANTS, "Notes"].join(" | ")} |`, `|${[...PARTICIPANTS, "Notes"].map(() => "---").join("|")}|`, `| ${ROW} | hi |`, ""].join("\n");
  const found = header(findingsOf(schema, "docs/participants.md", body));
  assert.equal(found.length, 1);
  assert.equal(found[0].line, 7);
  assert.equal(found[0].what.includes("Note, Text"), true, found[0].what);
});
