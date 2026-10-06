// The schema of a product's links to its sources (ITM-228) — MOD-source-register's sourceSchemas as
// docs/architecture/MOD-source-register.md states it: `sourceSchemas() -> { entry: Schema, links: Schema }`, `links` the
// schema of a product's links file `docs/sources.md`, for reading, writing and forms through MOD-documents.
// Run: node --test tests/source-register-links.test.mjs
//
// Module: MOD-source-register
// Guards: UC-002; A PRODUCT LINKS THE SOURCES THAT APPLY; A LINK NAMES THE PART THAT APPLIES
// Level: unit
//
// Every expected value is read from the module file. Its Data: a product's links file `docs/sources.md` is a table with one
// row per linked source — Source (`SRC-` identifier), Version, Hash (the version's hash), Part (free text, or empty)
// (`A LINK NAMES THE PART THAT APPLIES`) —, and a version's hash is a SHA-256. Its Responsibility: a product's links to the
// versions and parts that apply to it (`A PRODUCT LINKS THE SOURCES THAT APPLY`). The table stands under the product's own
// title, which changes from product to product, so the schema names its section `{ "underTitle": true }` (MOD-documents,
// Data: Sections and their tables).
//
// The links are read as every caller reads them: through MOD-documents' interface, with the schema sourceSchemas gives. This
// instance's own docs/sources.md is read as it stands and never changed; a finding on its own form goes to the review.
//
// Each test states its input and its expected result before it runs (given / input / expect); where a test asserts that
// something is refused, the same call is first shown to succeed on a known positive. Nothing reaches the network. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readRegister, writeDocument } from "../src/documents/index.mjs";
import { sourceSchemas } from "../src/source-register/index.mjs";

const INSTANCE_LINKS = new URL("../docs/sources.md", import.meta.url);

// The schema of a product's links file, as the module gives it.
const linksSchema = () => sourceSchemas().links;

// The text of these lines, each ended by a line feed.
const linesOf = (...lines) => lines.map((line) => `${line}\n`).join("");

// ---------------------------------------------------------------- a product's links file

const SHA_IEC = "094fcd5bde138035e280475d137925a2ba0ffc745b8db6e27fee20f7602d3d78";
const SHA_VIBE = "d4dff41c996d8a3f00c2b9323fc36bbeeb608bbbedd0ff301b2c8ac13ca667b3";

// The links of an infusion pump: a standard of which one safety class applies, and the book, which applies as a whole.
const TITLE = "# Requirement sources of the infusion pump";
const SENTENCE = "The sources the pump's requirements are drawn from, each in the version that applies.";
const HEADER = "| Source | Version | Hash | Part |";
const SEPARATOR = "|---|---|---|---|";
const IEC_ROW = `| SRC-iec-62304 | 2006+AMD1:2015 | ${SHA_IEC} | class B |`;
const VIBE_ROW = `| SRC-vibe-coding | 2026-10-05 | ${SHA_VIBE} | |`;
const LINKS = [
  TITLE,       // 1 — the product's own title: the heading of the section under it
  "",          // 2
  SENTENCE,    // 3
  "",          // 4
  HEADER,      // 5
  SEPARATOR,   // 6
  IEC_ROW,     // 7 — with a part
  VIBE_ROW,    // 8 — without a part
  "",
].join("\n");

const LINK_ROWS = [
  { line: 7, cells: { Source: "SRC-iec-62304", Version: "2006+AMD1:2015", Hash: SHA_IEC, Part: "class B" } },
  { line: 8, cells: { Source: "SRC-vibe-coding", Version: "2026-10-05", Hash: SHA_VIBE } },
];

const LINKS_DOCUMENT = {
  kind: "links",
  path: "docs/sources.md",
  id: null,
  title: "Requirement sources of the infusion pump",
  fields: {},
  sections: [
    { heading: TITLE, line: 1, text: linesOf("", SENTENCE, "", HEADER, SEPARATOR, IEC_ROW, VIBE_ROW), rows: LINK_ROWS },
  ],
  appended: [],
  body: LINKS,
};

// ---------------------------------------------------------------- sourceSchemas

// guards: UC-002; A PRODUCT LINKS THE SOURCES THAT APPLY; A LINK NAMES THE PART THAT APPLIES
// given: the module, loaded
// input: sourceSchemas()
// expect: two schemas, entry and links, in this order. entry is the register entry's, for docs/sources/SRC-{slug}.md. links
//         is the schema of a product's links file: the format `links`, a document at docs/sources.md, under the rule A PRODUCT
//         LINKS THE SOURCES THAT APPLY; its one section is the one under the product's own title, { underTitle: true },
//         required, with a table of the columns Source (an identifier of the kind SRC, required), Version (a text,
//         required), Hash (a SHA-256: 64 lowercase hexadecimal digits, required) and Part (a text, which may be left out,
//         under the rule A LINK NAMES THE PART THAT APPLIES)
test("sourceSchemas — gives entry and links: links is the schema of a product's docs/sources.md, its table under the product's own title", () => {
  const schemas = sourceSchemas();
  assert.deepEqual(Object.keys(schemas), ["entry", "links"]);
  assert.equal(schemas.entry.path, "docs/sources/SRC-{slug}.md");
  assert.deepEqual(schemas.links, {
    schema: "links",
    shape: "document",
    rule: "A PRODUCT LINKS THE SOURCES THAT APPLY",
    path: "docs/sources.md",
    sections: [
      { underTitle: true, required: true, table: { columns: [
        { name: "Source", value: { type: "identifier", of: ["SRC"], required: true } },
        { name: "Version", value: { type: "text", required: true } },
        { name: "Hash", value: { type: "sha", digits: 64, required: true } },
        { name: "Part", value: { type: "text", rule: "A LINK NAMES THE PART THAT APPLIES" } },
      ] } },
    ],
  });
});

// ---------------------------------------------------------------- a product's links, read and written

// guards: A PRODUCT LINKS THE SOURCES THAT APPLY; A LINK NAMES THE PART THAT APPLIES
// given: LINKS — a product's links file: its own title on line 1, a sentence, and the links table under them; the row of
//        line 7 names a part, `class B`, the row of line 8 none, its cell empty
// input: readRegister(sourceSchemas().links, "docs/sources.md", LINKS), then writeDocument(sourceSchemas().links, the document)
// expect: exactly LINKS_DOCUMENT — the format `links`, no identifier, the title; one section, the one under the title, its
//         heading the title line as written, on line 1, its text every line after it —; the rows LINK_ROWS, each with its line,
//         its cells by the columns Source, Version, Hash and Part, the part of line 8 left out, absent; written back, LINKS
//         byte for byte
test("links — a product's links file read with the links schema, rows with and without a part, and written back byte for byte", () => {
  const { document, rows } = readRegister(linksSchema(), "docs/sources.md", LINKS);
  assert.deepEqual(rows, LINK_ROWS);
  assert.deepEqual(document, LINKS_DOCUMENT);
  assert.equal(writeDocument(linksSchema(), document), LINKS);
});

// guards: A PRODUCT LINKS THE SOURCES THAT APPLY
// given: known positive first — LINKS as read, whose second row leaves its part out; then LINKS as read with its first row's
//        Version left out, and LINKS as read with its second row's Hash left out
// input: writeDocument(sourceSchemas().links, the document)
// expect: LINKS written back byte for byte. Each row without its version or its hash refused: DocumentError naming the
//         section under the title by its heading, the title line, and the row and column — row 1, line 7, column Version;
//         row 2, line 8, column Hash
test("links — a row without its version or its hash is refused by writeDocument with DocumentError naming the row and the column", () => {
  const read = () => readRegister(linksSchema(), "docs/sources.md", LINKS).document;
  assert.equal(writeDocument(linksSchema(), read()), LINKS, "known positive: LINKS as read is written back byte for byte");
  const cases = [
    ["Version", 0, { row: 1, line: 7 }],
    ["Hash", 1, { row: 2, line: 8 }],
  ];
  for (const [column, index, at] of cases) {
    const links = read();
    delete links.sections[0].rows[index].cells[column];
    assert.throws(() => writeDocument(linksSchema(), links),
      (e) => e.name === "DocumentError" && e.section === TITLE && e.row === at.row && e.line === at.line && e.column === column,
      `a row without its ${column}`);
  }
});

// ---------------------------------------------------------------- this instance's links

// guards: UC-002; A PRODUCT LINKS THE SOURCES THAT APPLY
// given: this instance's docs/sources.md as it stands, which links the book Vibe Coding
// input: readRegister(sourceSchemas().links, "docs/sources.md", its text)
// expect: among its rows, the row whose Source is SRC-vibe-coding, at the Version 2026-10-05
test("links — this instance's docs/sources.md read with the links schema: its row naming SRC-vibe-coding at the version 2026-10-05", () => {
  const { rows } = readRegister(linksSchema(), "docs/sources.md", readFileSync(INSTANCE_LINKS, "utf8"));
  const vibe = rows.find((row) => row.cells.Source === "SRC-vibe-coding");
  assert.ok(vibe, `a row names SRC-vibe-coding: ${JSON.stringify(rows)}`);
  assert.equal(vibe.cells.Version, "2026-10-05");
});
