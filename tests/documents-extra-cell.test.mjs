// A row with more cells than its table has columns is named (ITM-1155) — MOD-documents' documentFindings, as docs/architecture/MOD-documents.md states it: "each row of a table, cell by cell, in the same way, and a row with more cells than the table has
// columns, named at its line with the cells beyond the last column, whether the table has a header row or none". The cells of a row are read by position into the columns; a cell beyond the last column was dropped without a word.
// Run: node --test tests/documents-extra-cell.test.mjs
//
// Module: MOD-documents
// Guards: A DATA FORMAT IS DEFINED ONCE
// Level: unit
//
// The documents are small texts of the tests' own, read with the schemas of MOD-participant-list and MOD-spec-changes (the decisions file of a queue is the table without a header row); in the last test the documents of this repository. Each test states
// its input and its expected result before it runs. The counter-proofs are run as mutations and recorded in the pull request.
//
// Where the texts leave a reading open, the tests state the one they take, and the pull request names it:
//   - The finding is an error at the row's line; its words name the number of cells and of columns and the cells beyond the last column, as written. A cell written with an escaped bar (`\|`) is one cell.
//   - A row with fewer cells than the table has columns gives no such finding (its missing cells are values left out), and neither does a row inside a fenced block (it is no row).

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { artifactSchemaOf, documentFindings, loadSchema, readDocument } from "../src/documents/index.mjs";
import { participantSchema } from "../src/participant-list/index.mjs";
import { resourceSchema } from "../src/resource-list/index.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const PARTICIPANTS = ["Name", "Type", "Model", "Context", "Price", "Capabilities", "Processing place", "Route"];
const ROW = ["alice", "person", "—", "—", "—", "read the repository", "—", "account github.com/alice"];
const register = (rows) => ["# Participants of this instance", "", "**REGISTER**", "", "The people and agents.", "",
  `| ${PARTICIPANTS.join(" | ")} |`, `|${PARTICIPANTS.map(() => "---").join("|")}|`, ...rows.map((cells) => `| ${cells.join(" | ")} |`), ""].join("\n");
const findingsOf = (schema, path, body) => documentFindings(schema, readDocument(schema, path, body));
const extra = (found) => found.filter((each) => /more cells|beyond/.test(each.what));

// TST-1155001 · level: unit · module: MOD-documents
// guards: A DATA FORMAT IS DEFINED ONCE
// given: the participants register with a row of nine cells (one beyond the eight columns), and the same register with the row's eight cells
// input: documentFindings for each
// expect: one finding for the first, an error at the line of that row (the 9th line of the text), naming the cell "hi" and the numbers 9 and 8; none for the second (the counter-proof: a row with exactly the header's cells)
test("TST-1155001 a register row with one cell more than its header names is named, at its row, and a row with the header's cells is not", () => {
  const schema = participantSchema();
  const found = extra(findingsOf(schema, "docs/participants.md", register([[...ROW, "hi"]])));
  assert.equal(found.length, 1);
  assert.equal(found[0].kind, "error");
  assert.equal(found[0].line, 9);
  for (const part of ["hi", "9", "8"]) assert.equal(found[0].what.includes(part), true, `${part}: ${found[0].what}`);
  assert.deepEqual(extra(findingsOf(schema, "docs/participants.md", register([ROW]))), []);
});

// TST-1155002 · level: unit · module: MOD-documents
// guards: A DATA FORMAT IS DEFINED ONCE
// given: a register of three rows: the first with two cells beyond the columns, the second with exactly the columns, the third with one cell fewer
// input: documentFindings
// expect: exactly one finding, at the first row, naming both cells beyond the last column ("a" and "b"); none for the second and the third
test("TST-1155002 only the row with cells beyond the last column is named, with all of them; a row with fewer cells is not", () => {
  const schema = participantSchema();
  const found = extra(findingsOf(schema, "docs/participants.md", register([[...ROW, "a", "b"], ROW, ROW.slice(0, 7)])));
  assert.equal(found.length, 1);
  assert.equal(found[0].line, 9);
  assert.equal(found[0].what.includes("a") && found[0].what.includes("b"), true, found[0].what);
});

// TST-1155003 · level: unit · module: MOD-documents
// guards: A DATA FORMAT IS DEFINED ONCE
// given: a cell with an escaped bar (`read\|write`) in a row of exactly the eight columns, and a row of eight cells inside a fenced block under the table
// input: documentFindings
// expect: no finding of this kind: an escaped bar is one cell, and a line in a fenced block is no row
test("TST-1155003 an escaped bar is one cell, and a row inside a fenced block is no row", () => {
  const schema = participantSchema();
  const cells = [...ROW];
  cells[5] = "read\\|write";
  const body = `${register([cells])}\n\`\`\`\n| a | b | c | d | e | f | g | h | i |\n\`\`\`\n`;
  assert.deepEqual(extra(findingsOf(schema, "docs/participants.md", body)), []);
});

// TST-1155004 · level: unit · module: MOD-documents
// guards: A DATA FORMAT IS DEFINED ONCE
// given: the decisions file of a change queue, whose table has four columns and no header row: a row of five cells, and a file of rows of four
// input: documentFindings with the queue-decisions schema
// expect: one finding for the five-cell row, at its line, naming the cell beyond the last column; none for the file of four-cell rows
test("TST-1155004 a row of a table without a header row is named when it has cells beyond the last column", () => {
  const schema = loadSchema(readFileSync(join(ROOT, "src/spec-changes/queue-decisions.schema.md"), "utf8"), "MOD-spec-changes");
  const head = ["# Decisions — queue 2026-03-01 sample", "", "Append-only.", ""];
  const four = "| 2026-03-01 10:00 UTC | 1 | uebernommen | approval:spec-sample-01-aaaaaaaaaaaa.md |";
  const path = "docs/spec-freigaben/2026-03-01_sample/entscheidungen.md";
  const found = extra(findingsOf(schema, path, [...head, four, `${four.slice(0, -1)}| beyond |`, ""].join("\n")));
  assert.equal(found.length, 1);
  assert.equal(found[0].line, 6);
  assert.equal(found[0].what.includes("beyond"), true, found[0].what);
  assert.deepEqual(extra(findingsOf(schema, path, [...head, four, four, ""].join("\n"))), []);
});

// TST-1155005 · level: unit · module: MOD-documents
// guards: A DATA FORMAT IS DEFINED ONCE
// given: every document under docs/ that a schema reads: those artifactSchemaOf names a schema for, the participants and resources lists, and the files of the change queues with their own schemas
// input: readDocument and documentFindings for each, and the findings of this kind among them
// expect: none — the finding fires on no document that stands (the known positive: at least a hundred documents were read)
test("TST-1155005 the finding fires on no document of the repository", () => {
  const queue = (file) => loadSchema(readFileSync(join(ROOT, "src/spec-changes", file), "utf8"), "MOD-spec-changes");
  const queueSchemas = { index: queue("queue-index.schema.md"), decisions: queue("queue-decisions.schema.md"), rationale: queue("queue-rationale.schema.md") };
  const walk = (dir) => readdirSync(dir).flatMap((name) => { const path = join(dir, name); return statSync(path).isDirectory() ? walk(path) : [path]; });
  const paths = walk(join(ROOT, "docs")).filter((path) => path.endsWith(".md")).map((path) => relative(ROOT, path));
  let read = 0;
  const fired = [];
  for (const path of paths) {
    let schema;
    if (path === "docs/participants.md") schema = participantSchema();
    else if (path === "docs/resources.md") schema = resourceSchema();
    else if (/^docs\/spec-freigaben\/[^/]+\/index\.md$/.test(path)) schema = queueSchemas.index;
    else if (/^docs\/spec-freigaben\/[^/]+\/entscheidungen\.md$/.test(path)) schema = queueSchemas.decisions;
    else if (/^docs\/spec-freigaben\/[^/]+\/[^/]+\.begruendung\.md$/.test(path)) schema = queueSchemas.rationale;
    else schema = artifactSchemaOf(path);
    if (!schema) continue;
    read += 1;
    for (const found of extra(documentFindings(schema, readDocument(schema, path, readFileSync(join(ROOT, path), "utf8"))))) fired.push(`${path}:${found.line} ${found.what}`);
  }
  assert.equal(read >= 100, true, `read ${read} documents`);
  assert.deepEqual(fired, []);
});
