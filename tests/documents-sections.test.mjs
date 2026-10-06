// A section under the title, and a section's table found by its header (ITM-226) — MOD-documents' schema language,
// readDocument, writeDocument, readRegister and documentFindings, as the accepted text of docs/architecture/MOD-documents.md
// states them (Data, Sections and their tables), for the formats whose table stands under a title that changes from file to
// file: a product's docs/sources.md, whose links ITM-228 reads, and a change queue's index.md and entscheidungen.md.
// Run: node --test tests/documents-sections.test.mjs
//
// Module: MOD-documents
// Guards: UC-002; A DATA FORMAT IS DEFINED ONCE; A FINDING READS LIKE A COMPILER MESSAGE
// Level: unit
//
// What ITM-226 builds, and these tests state:
// - A section { "underTitle": true } is the text under the document's title, from the line after the title line up to the
//   first heading that begins a section, read with the title line as its heading. A schema names at most one, as its first
//   section. A document without a title has no such section.
// - A section's table is the first table in it whose header row names exactly the table's columns, in their order; a table
//   without a header row is the section's first table.
//
// The schemas below are fixtures in the forms the module file names, not the schemas the owners of these formats will keep.
// Each test states its input and its expected result before it runs (given / input / expect); where a test asserts that
// something is refused or found, the same call is first shown to succeed, or to find nothing, on a known positive. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { loadSchema, readDocument, writeDocument, readRegister, documentFindings } from "../src/documents/index.mjs";
import { formatFinding } from "../src/text-tools/index.mjs";

// ---------------------------------------------------------------- helpers

const copy = (value) => JSON.parse(JSON.stringify(value));

// A `*.schema.md` file in the form ITM-213 settled: a title, a sentence, and the one ```json block that holds the schema.
const schemaFile = (schema) => [
  `# The schema ${schema.schema}`,
  "",
  "The format's schema, in MOD-documents' schema language.",
  "",
  "```json",
  JSON.stringify(schema, null, 2),
  "```",
  "",
].join("\n");

// A schema loaded from its file, as the module that owns it loads it.
const load = (schema, owner) => loadSchema(schemaFile(schema), owner);

// The text of a section: each of its lines followed by its line end.
const linesOf = (...lines) => lines.map((line) => `${line}\n`).join("");

// ---------------------------------------------------------------- a product's links: docs/sources.md
//
// The table of a product's links stands under its title, which names the product: the title changes from file to file, so
// the schema names the section under the title in place of a heading.

const LINKS_SCHEMA = {
  schema: "links",
  shape: "document",
  rule: "A PRODUCT LINKS THE SOURCES THAT APPLY",
  path: "docs/sources.md",
  sections: [
    { underTitle: true, required: true, table: { columns: [
      { name: "Source", value: { type: "identifier", of: ["SRC"], required: true } },
      { name: "Version", value: { type: "text", required: true } },
      { name: "Hash", value: { type: "text", required: true } },
      { name: "Part", value: { type: "text" } },
    ] } },
  ],
  otherSections: "allowed",
};

const TITLE = "# Requirement sources of the product";
const SENTENCE = "The sources the product's requirements are drawn from, each in the version that applies.";
const HEADER = "| Source | Version | Hash | Part |";
const SEPARATOR = "|---|---|---|---|";
const VIBE = "| SRC-vibe-coding | 2026-10-05 | `d4dff41c996d8a3f00c2b9323fc36bbeeb608bbbedd0ff301b2c8ac13ca667b3` | |";
const IEC = "| SRC-iec-62304 | `2006+AMD1:2015` | `094fcd5bde138035e280475d137925a2ba0ffc745b8db6e27fee20f7602d3d78` | class B |";
const WHY = "The book is the method the product is built by; the standard applies to the device.";
const LINKS = [
  TITLE,                    // 1 — the title: the heading of the section under it
  "",                       // 2
  SENTENCE,                 // 3
  "",                       // 4
  HEADER,                   // 5
  SEPARATOR,                // 6
  VIBE,                     // 7 — Part left out
  IEC,                      // 8
  "",                       // 9
  "## Why these sources",   // 10 — the first heading that begins a section: the section under the title ends before it
  "",                       // 11
  WHY,                      // 12
  "",
].join("\n");

const LINK_ROWS = [
  { line: 7, cells: { Source: "SRC-vibe-coding", Version: "2026-10-05",
    Hash: "`d4dff41c996d8a3f00c2b9323fc36bbeeb608bbbedd0ff301b2c8ac13ca667b3`" } },
  { line: 8, cells: { Source: "SRC-iec-62304", Version: "`2006+AMD1:2015`",
    Hash: "`094fcd5bde138035e280475d137925a2ba0ffc745b8db6e27fee20f7602d3d78`", Part: "class B" } },
];

const LINKS_DOCUMENT = {
  kind: "links",
  path: "docs/sources.md",
  id: null,
  title: "Requirement sources of the product",
  fields: {},
  sections: [
    { heading: TITLE, line: 1, text: linesOf("", SENTENCE, "", HEADER, SEPARATOR, VIBE, IEC, ""), rows: LINK_ROWS },
    { heading: "## Why these sources", line: 10, text: linesOf("", WHY) },
  ],
  appended: [],
  body: LINKS,
};

// ---------------------------------------------------------------- a change queue: index.md and entscheidungen.md

// The entries of a queue's index.md, in the table under its title, whose header row names its columns; the tables of its
// impact analysis stand before it in the same section.
const ANCHOR = "Anker (Überschrift, wortgetreu)";
const INDEX_SCHEMA = {
  schema: "queue-index",
  shape: "document",
  path: "docs/spec-freigaben/{any}/index.md",
  sections: [
    { underTitle: true, required: true, table: { columns: [
      { name: "Nr", value: { type: "text", required: true } },
      { name: "Datei", value: { type: "text", required: true } },
      { name: ANCHOR, value: { type: "text", required: true } },
      { name: "bis (exklusiv)", value: { type: "text" } },
      { name: "Commits", value: { type: "text" } },
    ] } },
  ],
};
const INDEX_PATH = "docs/spec-freigaben/2026-10-07a_the-links-of-a-product/index.md";
const INDEX = [
  "# SPEC approvals — queue 2026-10-07a · the links of a product",                // 1
  "",                                                                              // 2
  "**PO decision:** a product's links are read from the table under its title.",  // 3
  "",                                                                              // 4
  "**Impact analysis:**",                                                          // 5
  "",                                                                              // 6
  "| Name | Change | Referenced by |",                                             // 7 — a table of the impact analysis:
  "|---|---|---|",                                                                 // 8   its header names other columns
  "| `A PRODUCT LINKS THE SOURCES THAT APPLY` | unchanged | UC-002, UC-015 |",     // 9
  "",                                                                              // 10
  "**Zieldatei aller Einträge:** `SPEC.md`",                                       // 11
  "",                                                                              // 12
  `| Nr | Datei | ${ANCHOR} | bis (exklusiv) | Commits |`,                          // 13 — the entry table: its header names
  "|---|---|---|---|---|",                                                         // 14   the columns, in their order
  "| 01 | `SPEC.md` | ## 2. Requirement sources | — | — |",                        // 15
  "| 02 | `SPEC.md` | ## 9. Human gates | ## 10. Review on GitHub Pages | — |",     // 16
  "",
].join("\n");

// The decisions of a queue, entscheidungen.md: a table without a header row under its title, the module file's own example.
const DECISIONS_SCHEMA = {
  schema: "queue-decisions",
  shape: "document",
  path: "docs/spec-freigaben/{any}/entscheidungen.md",
  sections: [
    { underTitle: true, required: true, table: { header: false, appendOnly: true, columns: [
      { name: "When", value: { type: "time", required: true } },
      { name: "Entry", value: { type: "number", required: true } },
      { name: "Decision", value: { type: "enum", values: ["uebernommen", "abgelehnt"], required: true } },
      { name: "Record", value: { type: "text" } },
    ] } },
  ],
};
const DECISIONS_PATH = "docs/spec-freigaben/2026-10-07a_the-links-of-a-product/entscheidungen.md";
const RECORD = "approval:spec-2026-10-07a_the-links-of-a-product-01-1c4960c065ed.md";
const DECISIONS = [
  "# Decisions — queue 2026-10-07a the links of a product",       // 1
  "",                                                              // 2
  "Append-only.",                                                  // 3
  `| 2026-10-07 09:30 UTC | 1 | uebernommen | ${RECORD} |`,        // 4 — the first row of the table, read as a row
  "| 2026-10-07 10:05 UTC | 2 | abgelehnt | — |",                  // 5
  "",
].join("\n");

// ---------------------------------------------------------------- a section under the title

// guards: UC-002; A DATA FORMAT IS DEFINED ONCE
// given: LINKS — a product's links file: its title on line 1, a sentence and the links table under it, then a section the
//        schema does not name, ## Why these sources (line 10); and the same file whose title names another product
// input: readRegister(the links schema, "docs/sources.md", text), then writeDocument(the links schema, the document read)
// expect: LINKS_DOCUMENT — the title; first the section under the title: its heading the title line as written, its line 1,
//         its text every line after the title line up to ## Why these sources, its rows the links of lines 7 and 8; then
//         ## Why these sources, line 10 —; the register's rows LINK_ROWS; written back, LINKS byte for byte. The other file:
//         its own title line the heading of the same section, on line 1, the same rows, written back byte for byte
test("a section under the title — read with the title line as its heading, and written back byte for byte", () => {
  const links = load(LINKS_SCHEMA, "MOD-source-register");
  const { document, rows } = readRegister(links, "docs/sources.md", LINKS);
  assert.deepEqual(rows, LINK_ROWS);
  assert.deepEqual(document, LINKS_DOCUMENT);
  assert.equal(writeDocument(links, document), LINKS);

  const other = "# Requirement sources of the lab's robot";
  const robot = LINKS.replace(TITLE, other);
  const read = readRegister(links, "docs/sources.md", robot);
  assert.equal(read.document.title, "Requirement sources of the lab's robot");
  assert.deepEqual(read.document.sections.map((s) => [s.heading, s.line]), [[other, 1], ["## Why these sources", 10]]);
  assert.deepEqual(read.rows, LINK_ROWS);
  assert.equal(writeDocument(links, read.document), robot);
});

// guards: A DATA FORMAT IS DEFINED ONCE
// given: known positive first — LINKS_SCHEMA, whose first section is the one under the title, loads; then LINKS_SCHEMA with a
//        second section under the title after its first, and LINKS_SCHEMA with ## Why these sources named before its section
//        under the title
// input: loadSchema(the schema file, "MOD-source-register")
// expect: each throws a SchemaError whose `key` is sections[1].underTitle and whose `owner` is MOD-source-register, its
//         message naming both
test("loadSchema — a second section under the title, or one that is not the first, is refused with SchemaError", () => {
  assert.doesNotThrow(() => load(LINKS_SCHEMA, "MOD-source-register"), "known positive");
  const breaks = [
    ["a second section under the title", (s) => { s.sections.push({ underTitle: true, required: false }); }],
    ["a section under the title that is not the first",
      (s) => { s.sections.unshift({ heading: "## Why these sources", required: false }); }],
  ];
  for (const [what, change] of breaks) {
    const broken = copy(LINKS_SCHEMA);
    change(broken);
    assert.throws(() => load(broken, "MOD-source-register"),
      (e) => e.name === "SchemaError" && e.key === "sections[1].underTitle" && e.owner === "MOD-source-register"
        && e.message.includes("sections[1].underTitle") && e.message.includes("MOD-source-register"),
      what);
  }
});

// guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE
// given: known positive first — LINKS has no finding; then LINKS without its title line and the blank line after it, so that
//        its first heading is ## Why these sources: a document without a title, which has no section under the title
// input: documentFindings(the links schema, readDocument(the links schema, "docs/sources.md", text)), each finding in its
//        text form
// expect: none for LINKS; for the other, one error on line 1, naming the schema's rule, since the section names none:
//         `docs/sources.md:1: error: the section under the title is required, and missing [A PRODUCT LINKS THE SOURCES THAT
//         APPLY] — add the document's title, and the section under it.`
test("documentFindings — a required section under the title that is missing is named", () => {
  const links = load(LINKS_SCHEMA, "MOD-source-register");
  const findings = (text) => documentFindings(links, readDocument(links, "docs/sources.md", text)).map(formatFinding);
  assert.deepEqual(findings(LINKS), [], "known positive");
  assert.deepEqual(findings(LINKS.replace(`${TITLE}\n\n`, "")), [
    "docs/sources.md:1: error: the section under the title is required, and missing [A PRODUCT LINKS THE SOURCES THAT APPLY] "
      + "— add the document's title, and the section under it.",
  ]);
});

// ---------------------------------------------------------------- a section's table

// guards: UC-002; A DATA FORMAT IS DEFINED ONCE
// given: INDEX — a queue's index.md: under its title, the table of its impact analysis (line 7), whose header names other
//        columns, and then the entry table (line 13), whose header names the schema's columns in their order
// input: readRegister(the index schema, INDEX_PATH, INDEX)
// expect: the rows of the entry table, lines 15 and 16, read into its columns — a value left out as — absent —; no row of
//         the impact analysis
test("a section's table is the first in it whose header row names exactly its columns, in their order", () => {
  const { rows } = readRegister(load(INDEX_SCHEMA, "MOD-spec-changes"), INDEX_PATH, INDEX);
  assert.deepEqual(rows, [
    { line: 15, cells: { Nr: "01", Datei: "`SPEC.md`", [ANCHOR]: "## 2. Requirement sources" } },
    { line: 16, cells: { Nr: "02", Datei: "`SPEC.md`", [ANCHOR]: "## 9. Human gates",
      "bis (exklusiv)": "## 10. Review on GitHub Pages" } },
  ]);
});

// guards: UC-002; A DATA FORMAT IS DEFINED ONCE
// given: DECISIONS — a queue's entscheidungen.md: under its title a sentence, then a table without a header row whose first
//        line (line 4) is a decision
// input: readRegister(the decisions schema, DECISIONS_PATH, DECISIONS)
// expect: the section's first table: two rows, lines 4 and 5, their cells read by position into the columns When, Entry,
//         Decision, Record — Entry a number —, the Record of the second left out
test("a table without a header row is the section's first table, its first line a row", () => {
  const { rows } = readRegister(load(DECISIONS_SCHEMA, "MOD-spec-changes"), DECISIONS_PATH, DECISIONS);
  assert.deepEqual(rows, [
    { line: 4, cells: { When: "2026-10-07 09:30 UTC", Entry: 1, Decision: "uebernommen", Record: RECORD } },
    { line: 5, cells: { When: "2026-10-07 10:05 UTC", Entry: 2, Decision: "abgelehnt" } },
  ]);
});
