// The documents a declaration is read as (ITM-213) — MOD-documents' interface as docs/architecture/MOD-documents.md states
// it, for what UC-002's modules need: the schema language with Schema, Document and Row, loadSchema, readDocument,
// writeDocument and readRegister. documentFindings, appendSection, classifyCandidates, artifactSchemas and the module's own
// schemas are not part of ITM-213 and are not tested here.
// Run: node --test tests/documents.test.mjs
//
// Module: MOD-documents
// Guards: UC-002; THE CATALOGUE IS DATA; A DATA FORMAT IS DEFINED ONCE; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; A SOURCE VERSION IS NEVER OVERWRITTEN
// Level: unit
//
// What ITM-213 settles for the modules that keep schemas — ITM-215 to ITM-218 write their schema files so, and none of them
// changes MOD-documents:
//
// 1. The form of a `*.schema.md` file. It is Markdown: a title, sentences on the format, examples in fenced blocks of other
//    kinds, and exactly one fenced block whose info string is `json` — ```json … ``` —, which holds the schema's JSON object
//    in the language of MOD-documents' file (Data). loadSchema reads that object and nothing else. A ```json block inside
//    another fence is an example, not the schema.
// 2. Sections by their heading lines. A section runs from its heading line to the next heading of the same or a higher
//    level: a lower heading, with its table, stays inside it, and a line in a fenced block is no heading. A schema names a
//    section by its heading line exactly as written, of any level. A register whose table stands under its title, with no
//    `##` section — docs/participants.md — names its title line as the heading of its table's section; the heading a schema
//    names is therefore the same in every file of its format. A section's table is the first table in it.
//
// Every expected value is read from the module file's Data and Interfaces. Each test names the requirement it guards and
// states its input and its expected result before it runs (given / input / expect); where a test asserts that something is
// refused, the same call is first shown to succeed on a known positive. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { loadSchema, readDocument, writeDocument, readRegister } from "../src/documents/index.mjs";

// ---------------------------------------------------------------- helpers

const copy = (value) => JSON.parse(JSON.stringify(value));

// A `*.schema.md` file in the form ITM-213 settles: a title, a sentence, and the one ```json block that holds the schema.
const schemaFile = (title, schema) => [
  `# ${title}`,
  "",
  "The schema of the format, in MOD-documents' schema language.",
  "",
  "```json",
  JSON.stringify(schema, null, 2),
  "```",
  "",
].join("\n");

// A schema loaded from its file, as the module that owns it loads it.
const load = (schema, owner = "MOD-example") => loadSchema(schemaFile(`The schema ${schema.schema}`, schema), owner);

// The text of a section: each of its lines followed by its line end.
const linesOf = (...lines) => lines.map((line) => `${line}\n`).join("");

// ---------------------------------------------------------------- the formats of UC-002, as schemas
//
// Each schema follows the Data of the module that owns the format: the declaration (MOD-product-process), the participant
// register (MOD-participant-list), a process model (MOD-model-catalogue), a source register entry (MOD-source-register).
// Three more follow the forms MOD-documents' file names: the decisions file of a change queue (a table without a header
// row), an approval record (`key: value` lines) and a job record (sections appended to a record).

const DECLARATION_SCHEMA = {
  schema: "declaration",
  shape: "document",
  path: "docs/process.md",
  frontMatter: {
    model: { type: "text", required: true },
    model_file: { type: "path", required: true },
    model_version: { type: "sha", digits: 40, required: true },
    sprint_close: { type: "text" },
  },
  sections: [
    { heading: "## Roles", required: true, table: { columns: [
      { name: "Role", value: { type: "text", required: true } },
      { name: "Participants", value: { type: "list", item: { type: "text" }, required: true, nonEmpty: true } },
    ] } },
    { heading: "## Practices", required: true },
    { heading: "## Branches", required: false, table: { columns: [
      { name: "Phase or time box", value: { type: "text", required: true } },
      { name: "Branch", value: { type: "text", required: true } },
    ] } },
    { heading: "## Definition of Done", required: true },
  ],
  otherSections: "allowed",
  diagrams: "allowed",
  noHistory: true,
};

const CAPABILITIES = ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools",
  "reach the web"];
const PARTICIPANTS_SCHEMA = {
  schema: "participants",
  shape: "document",
  path: "docs/participants.md",
  sections: [
    { heading: "# Participants of this instance", required: true, table: { columns: [
      { name: "Name", value: { type: "text", required: true } },
      { name: "Type", value: { type: "enum", values: ["person", "model endpoint", "CI agent", "CLI agent", "sandboxed agent"],
        required: true } },
      { name: "Model", value: { type: "text", requiredWhen: { field: "Type", notIn: ["person"] },
        forbiddenWhen: { field: "Type", in: ["person"] } } },
      { name: "Context", value: { type: "number" } },
      { name: "Price", value: { type: "text" } },
      { name: "Capabilities", value: { type: "list", item: { type: "enum", values: CAPABILITIES }, required: true,
        nonEmpty: true } },
      { name: "Processing place", value: { type: "text", requiredWhen: { field: "Type", notIn: ["person"] },
        forbiddenWhen: { field: "Type", in: ["person"] } } },
      { name: "Route", value: { type: "text", required: true } },
    ] } },
  ],
  otherSections: "forbidden",
  diagrams: "none",
};

const MODEL_SCHEMA = {
  schema: "model",
  shape: "document",
  path: "docs/process-models/{slug}.md",
  frontMatter: {
    name: { type: "text", required: true },
    kind: { type: "enum", values: ["planned", "pulled"], required: true },
    adapted_from: { type: "text" },
    measure: { type: "enum", values: ["plan entries per phase", "remaining items per time box", "items per state over time"],
      required: true },
  },
  sections: [
    { heading: "## Phases", required: true, table: { columns: [
      { name: "Name", value: { type: "text", required: true } },
      { name: "Role", value: { type: "text", required: true } },
      { name: "Produces", value: { type: "list", item: { type: "enum",
        values: ["requirements", "UC", "ARC", "MOD", "TST", "ITM", "sprint record"] }, required: true } },
    ] } },
    { heading: "## Transitions", required: true, table: { columns: [
      { name: "From", value: { type: "text", required: true } },
      { name: "To", value: { type: "text", required: true } },
      { name: "Kind", value: { type: "enum", values: ["sequence", "alternative", "back"], required: true } },
    ] } },
    { heading: "## Flow control", required: false, table: { columns: [
      { name: "Kind", value: { type: "enum", values: ["WIP limit", "Time box", "Sprints"], required: true } },
      { name: "Value", value: { type: "text", required: true, variants: [
        { when: { field: "Kind", in: ["WIP limit"] }, type: "number" },
        { when: { field: "Kind", in: ["Sprints"] }, type: "enum", values: ["yes", "no"] },
      ] } },
    ] } },
  ],
  otherSections: "forbidden",
  diagrams: "allowed",
};

const SOURCE_SCHEMA = {
  schema: "source",
  shape: "document",
  path: "docs/sources/{id}.md",
  identifier: { field: "id", kind: "SRC" },
  frontMatter: {
    id: { type: "identifier", of: ["SRC"], required: true },
    title: { type: "text", required: true },
    kind: { type: "enum", values: ["organisation", "person", "standard", "regulation", "document", "system", "measurement"],
      required: true },
    authority: { type: "enum", values: ["normative", "advisory", "informational"], required: true },
    licence: { type: "text", required: true },
    designation: { type: "text", requiredWhen: { field: "kind", in: ["standard"] } },
    places: { type: "list", item: { type: "text" } },
  },
  title: "# {id} {title}",
  sections: [
    { heading: "## Versions", required: true, table: { appendOnly: true, columns: [
      { name: "Version", value: { type: "text", required: true } },
      { name: "Date", value: { type: "date", required: true } },
      { name: "Files", value: { type: "list", item: { type: "text" }, required: true, nonEmpty: true } },
    ] } },
    { heading: "## Parts", required: false, table: { columns: [
      { name: "Part", value: { type: "text", required: true } },
      { name: "Applies to", value: { type: "text", required: true } },
    ] } },
  ],
  otherSections: "forbidden",
  diagrams: "none",
};

const DECISIONS_SCHEMA = {
  schema: "decisions",
  shape: "document",
  path: "docs/spec-freigaben/{any}/entscheidungen.md",
  sections: [
    { heading: "# Decisions", required: true, table: { header: false, appendOnly: true, columns: [
      { name: "When", value: { type: "time", required: true } },
      { name: "Entry", value: { type: "number", required: true } },
      { name: "Decision", value: { type: "enum", values: ["uebernommen", "abgelehnt"], required: true } },
      { name: "Record", value: { type: "text" } },
    ] } },
  ],
};

const APPROVAL_SCHEMA = {
  schema: "approval-record",
  shape: "lines",
  path: "docs/approvals/{any}.md",
  lines: {
    kind: { type: "enum", values: ["use-case", "architecture-decision", "module", "spec-change"], required: true },
    file: { type: "path", required: true },
    blob: { type: "sha", digits: 40, required: true },
  },
};

const JOB_SCHEMA = {
  schema: "job",
  shape: "document",
  path: "docs/jobs/{id}.md",
  identifier: { field: "id", kind: "JOB" },
  frontMatter: {
    id: { type: "identifier", of: ["JOB"], required: true },
    kind: { type: "text", required: true },
    participant: { type: "text", required: true },
    started: { type: "time", required: true },
  },
  title: "# {id}",
  sections: [{ heading: "## Inputs", required: true }],
  appended: [
    { heading: "## Waiting at a gate", repeat: true, fields: {
      gate: { type: "text", required: true },
      since: { type: "time", required: true },
    } },
    { heading: "## End", repeat: false, fields: {
      state: { type: "enum", values: ["done", "failed", "cancelled"], required: true },
      ended: { type: "time", required: true },
    } },
  ],
};

// ---------------------------------------------------------------- the documents, each canonical

const DECLARATION = [
  "---",                                                                      // 1
  "model: scrum-wip",                                                         // 2
  "model_file: docs/process-models/scrum-wip.md",                             // 3
  "model_version: 4c60cfe5a8bc8c00dcf6705b5decb42823b73a63",                  // 4
  "sprint_close: scrum-master-session",                                       // 5
  "---",                                                                      // 6
  "# How the product is developed",                                           // 7 — the body begins here, with the title
  "",                                                                         // 8
  "**REGISTER**",                                                             // 9
  "",                                                                         // 10
  "The declaration of how the product is developed (UC-002).",                // 11
  "",                                                                         // 12
  "## Roles",                                                                 // 13
  "",                                                                         // 14
  "| Role | Participants |",                                                  // 15
  "|---|---|",                                                                // 16
  "| Product Owner | po-opus |",                                              // 17
  "| Developers | developer-opus-a, developer-opus-b |",                      // 18 — a list in a cell, separated by commas
  "",                                                                         // 19
  "## Practices",                                                             // 20 — a section holding a list
  "",                                                                         // 21
  "- devops",                                                                 // 22
  "- prototyping",                                                            // 23
  "",                                                                         // 24
  "## Branches",                                                              // 25
  "",                                                                         // 26
  "| Phase or time box | Branch |",                                           // 27
  "|---|---|",                                                                // 28
  "| Sprint | `sprint/<nn>` |",                                               // 29
  "",                                                                         // 30
  "## Definition of Done",                                                    // 31
  "",                                                                         // 32
  "The job rules hold for every pull request, and:",                          // 33
  "",                                                                         // 34
  "### Added conditions",                                                     // 35 — a lower heading: it stays inside
  "",                                                                         // 36
  "- review: 1 by participants other than the implementer",                   // 37
  "",                                                                         // 38
  "## How sprints run",                                                       // 39 — a section the schema does not name
  "",                                                                         // 40
  "A sprint ends when every selected item is done. Its branch is named so:",  // 41
  "",                                                                         // 42
  "```text",                                                                  // 43
  "## sprint/<nn>",                                                           // 44 — in a fenced block: no heading
  "```",                                                                      // 45
  "",
].join("\n");

const DECLARATION_DOCUMENT = {
  kind: "declaration",
  path: "docs/process.md",
  id: null,
  title: "How the product is developed",
  fields: {
    model: "scrum-wip",
    model_file: "docs/process-models/scrum-wip.md",
    model_version: "4c60cfe5a8bc8c00dcf6705b5decb42823b73a63",
    sprint_close: "scrum-master-session",
  },
  sections: [
    { heading: "## Roles", line: 13,
      text: linesOf("", "| Role | Participants |", "|---|---|", "| Product Owner | po-opus |",
        "| Developers | developer-opus-a, developer-opus-b |", ""),
      rows: [
        { line: 17, cells: { Role: "Product Owner", Participants: ["po-opus"] } },
        { line: 18, cells: { Role: "Developers", Participants: ["developer-opus-a", "developer-opus-b"] } },
      ] },
    { heading: "## Practices", line: 20, text: linesOf("", "- devops", "- prototyping", "") },
    { heading: "## Branches", line: 25,
      text: linesOf("", "| Phase or time box | Branch |", "|---|---|", "| Sprint | `sprint/<nn>` |", ""),
      rows: [{ line: 29, cells: { "Phase or time box": "Sprint", Branch: "`sprint/<nn>`" } }] },
    { heading: "## Definition of Done", line: 31,
      text: linesOf("", "The job rules hold for every pull request, and:", "", "### Added conditions", "",
        "- review: 1 by participants other than the implementer", "") },
    { heading: "## How sprints run", line: 39,
      text: linesOf("", "A sprint ends when every selected item is done. Its branch is named so:", "", "```text",
        "## sprint/<nn>", "```") },
  ],
  appended: [],
  body: DECLARATION.slice(DECLARATION.indexOf("# How the product is developed")),
};

// The declaration with its front matter keys out of the schema's order, a value with blanks around it, and its sections
// out of the schema's order, a section the schema does not name among them — and the same declaration in canonical form.
const UNORDERED = [
  "---",
  "model_file: docs/process-models/scrum-wip.md",
  "model:   scrum-wip",
  "sprint_close: scrum-master-session",
  "model_version: 4c60cfe5a8bc8c00dcf6705b5decb42823b73a63",
  "---",
  "# How the product is developed",
  "",
  "**REGISTER**",
  "",
  "The declaration of how the product is developed (UC-002).",
  "",
  "## Practices",
  "",
  "- devops",
  "- prototyping",
  "",
  "## Roles",
  "",
  "| Role | Participants |",
  "|---|---|",
  "| Product Owner | po-opus |",
  "| Developers | developer-opus-a, developer-opus-b |",
  "",
  "## How sprints run",
  "",
  "A sprint ends when every selected item is done.",
  "",
  "## Branches",
  "",
  "| Phase or time box | Branch |",
  "|---|---|",
  "| Sprint | `sprint/<nn>` |",
  "",
  "## Definition of Done",
  "",
  "The job rules hold for every pull request.",
  "",
].join("\n");
const UNORDERED_WRITTEN = [
  "---",
  "model: scrum-wip",
  "model_file: docs/process-models/scrum-wip.md",
  "model_version: 4c60cfe5a8bc8c00dcf6705b5decb42823b73a63",
  "sprint_close: scrum-master-session",
  "---",
  "# How the product is developed",
  "",
  "**REGISTER**",
  "",
  "The declaration of how the product is developed (UC-002).",
  "",
  "## Roles",
  "",
  "| Role | Participants |",
  "|---|---|",
  "| Product Owner | po-opus |",
  "| Developers | developer-opus-a, developer-opus-b |",
  "",
  "## Practices",
  "",
  "- devops",
  "- prototyping",
  "",
  "## How sprints run",
  "",
  "A sprint ends when every selected item is done.",
  "",
  "## Branches",
  "",
  "| Phase or time box | Branch |",
  "|---|---|",
  "| Sprint | `sprint/<nn>` |",
  "",
  "## Definition of Done",
  "",
  "The job rules hold for every pull request.",
  "",
].join("\n");

const PARTICIPANTS_HEAD = [
  "# Participants of this instance",                                                            // 1 — the title, and the
  "",                                                                                           // 2   heading of the
  "**REGISTER**",                                                                               // 3   table's section
  "",                                                                                           // 4
  "The people and agents who work on the products of this instance, one row per participant.", // 5
  "",                                                                                           // 6
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |",       // 7
  "|---|---|---|---|---|---|---|---|",                                                         // 8
];
const AKMAIER = "| akmaier | person | — | — | — | draft text, read the repository, write to the repository | — | "   // 9
  + "account github.com/akmaier |";
const REVIEWER = "| reviewer-b | CLI agent | example-model | 200000 | — | draft text, read the repository | this machine | " // 10
  + "bridge lab-pc agent claude |";
const SUMMARISER = "| summariser | model endpoint | small-model | 32000 | 0.5 / 1.5 EUR per million tokens | draft text | " // 11
  + "NHR@FAU, Erlangen | endpoint nhr |";
const PARTICIPANTS_TAIL = ["", "`akmaier` is the one person.", ""];                              // 12, 13
const PARTICIPANTS = [...PARTICIPANTS_HEAD, AKMAIER, REVIEWER, SUMMARISER, ...PARTICIPANTS_TAIL].join("\n");

const PARTICIPANT_ROWS = [
  { line: 9, cells: { Name: "akmaier", Type: "person",
    Capabilities: ["draft text", "read the repository", "write to the repository"], Route: "account github.com/akmaier" } },
  { line: 10, cells: { Name: "reviewer-b", Type: "CLI agent", Model: "example-model", Context: 200000,
    Capabilities: ["draft text", "read the repository"], "Processing place": "this machine",
    Route: "bridge lab-pc agent claude" } },
  { line: 11, cells: { Name: "summariser", Type: "model endpoint", Model: "small-model", Context: 32000,
    Price: "0.5 / 1.5 EUR per million tokens", Capabilities: ["draft text"], "Processing place": "NHR@FAU, Erlangen",
    Route: "endpoint nhr" } },
];

const MODEL = [
  "---",                                                                      // 1
  "name: scrum-wip",                                                          // 2
  "kind: pulled",                                                             // 3
  "adapted_from: scrum",                                                      // 4
  "measure: items per state over time",                                       // 5
  "---",                                                                      // 6
  "",                                                                         // 7
  "# Scrum with a work-in-progress limit",                                    // 8
  "",                                                                         // 9
  "**REGISTER**",                                                             // 10
  "",                                                                         // 11
  "A process model of this instance, adapted from the shipped Scrum model.",  // 12
  "",                                                                         // 13
  "## Phases",                                                                // 14
  "",                                                                         // 15
  "| Name | Role | Produces |",                                               // 16
  "|---|---|---|",                                                            // 17
  "| Sprint planning | Product Owner | ITM |",                                // 18
  "| Development | Developers | MOD, TST |",                                  // 19
  "",                                                                         // 20
  "## Transitions",                                                           // 21
  "",                                                                         // 22
  "| From | To | Kind |",                                                     // 23
  "|---|---|---|",                                                            // 24
  "| Sprint planning | Development | sequence |",                             // 25
  "| Development | Sprint planning | back |",                                 // 26
  "",                                                                         // 27
  "## Flow control",                                                          // 28
  "",                                                                         // 29
  "| Kind | Value |",                                                         // 30
  "|---|---|",                                                                // 31
  "| WIP limit | 4 |",                                                        // 32 — Value a number: the variant that holds
  "| Time box | none |",                                                      // 33 — no variant holds: Value a text
  "| Sprints | yes |",                                                        // 34 — Value one of yes, no
  "",
].join("\n");

const SOURCE_ENTRY = [
  "---",                                                                      // 1
  "id: SRC-iec-62304",                                                        // 2
  "title: IEC 62304",                                                         // 3
  "kind: standard",                                                           // 4
  "authority: normative",                                                     // 5
  "licence: restricted — the terms of use of the IEC",                        // 6
  "designation: IEC 62304:2006+AMD1:2015",                                    // 7
  "places:",                                                                  // 8 — a list, one item per line
  "  - this machine",                                                         // 9
  "  - NHR@FAU, Erlangen",                                                    // 10
  "---",                                                                      // 11
  "# SRC-iec-62304 IEC 62304",                                                // 12
  "",                                                                         // 13
  "The standard for the software life cycle of medical devices.",             // 14
  "",                                                                         // 15
  "## Versions",                                                              // 16
  "",                                                                         // 17
  "| Version | Date | Files |",                                               // 18
  "|---|---|---|",                                                            // 19
  "| `2006` | 2006-05-09 | iec62304-2006.pdf |",                              // 20
  "| `2006+AMD1:2015` | 2015-06-29 | iec62304-2006.pdf, iec62304-amd1-2015.pdf |", // 21
  "",                                                                         // 22
  "### Files of `2006+AMD1:2015`",                                            // 23 — a lower heading: it and its table
  "",                                                                         // 24   stay inside ## Versions, whose
  "| File | SHA-256 |",                                                       // 25   table is its first one
  "|---|---|",                                                                // 26
  "| iec62304-amd1-2015.pdf | `094fcd5bde138035e280475d137925a2ba0ffc745b8db6e27fee20f7602d3d78` |", // 27
  "",                                                                         // 28
  "## Parts",                                                                 // 29
  "",                                                                         // 30
  "| Part | Applies to |",                                                    // 31
  "|---|---|",                                                                // 32
  "| class B | software whose failure can lead to a non-serious injury |",    // 33
  "",
].join("\n");

const DECISIONS = [
  "# Decisions",                                                              // 1
  "",                                                                         // 2
  "Append-only.",                                                             // 3
  "| 2026-10-05 16:46 UTC | 1 | uebernommen | approval:spec-2026-10-05e_the-main-page-01-1c4960c065ed.md |", // 4
  "| 2026-10-06 09:12 UTC | 2 | abgelehnt | — |",                             // 5
  "",
].join("\n");

const APPROVAL = "kind: module\nfile: docs/architecture/MOD-documents.md\nblob: b42dcae8b2d71af6a80c6faf5bae2c3cee2d026f\n";

const JOB = [
  "---",                                                                      // 1
  "id: JOB-20261006-0900-a1b2",                                               // 2
  "kind: implement",                                                          // 3
  "participant: developer-opus-c",                                            // 4
  "started: 2026-10-06 09:00 UTC",                                            // 5
  "---",                                                                      // 6
  "# JOB-20261006-0900-a1b2",                                                 // 7
  "",                                                                         // 8
  "## Inputs",                                                                // 9
  "",                                                                         // 10
  "- ITM-213",                                                                // 11
  "",                                                                         // 12
  "## Waiting at a gate",                                                     // 13 — appended, may repeat
  "",                                                                         // 14
  "gate: Development → Release testing",                                      // 15
  "since: 2026-10-06 11:30 UTC",                                              // 16
  "",                                                                         // 17
  "## End",                                                                   // 18 — appended once
  "",                                                                         // 19
  "state: done",                                                              // 20
  "ended: 2026-10-06 12:00 UTC",                                              // 21
  "",
].join("\n");

// ---------------------------------------------------------------- loadSchema: the form of a *.schema.md file

// The declaration's schema file as its owner keeps it: a title, sentences, an example in a ```text block, and the one
// ```json block.
const DECLARATION_SCHEMA_MD = [
  "# The declaration of how a product is developed",
  "",
  "The schema of `docs/process.md` (UC-002), in MOD-documents' schema language. A declaration begins so:",
  "",
  "```text",
  "---",
  "model: scrum-wip",
  "---",
  "```",
  "",
  "The schema:",
  "",
  "```json",
  JSON.stringify(DECLARATION_SCHEMA, null, 2),
  "```",
  "",
].join("\n");

// guards: THE CATALOGUE IS DATA; A DATA FORMAT IS DEFINED ONCE
// given: DECLARATION_SCHEMA_MD — a *.schema.md file as the module that owns the format keeps it: a title, sentences, an
//        example in a ```text block, and the one ```json block, which holds the declaration's schema with noHistory true
// input: loadSchema(DECLARATION_SCHEMA_MD, "MOD-product-process")
// expect: the schema is exactly the JSON object of the ```json block, every key as written — noHistory read and kept, true;
//         the ```text example is not read
test("loadSchema — a *.schema.md file holds its schema as its one ```json block; noHistory is read and kept", () => {
  const schema = loadSchema(DECLARATION_SCHEMA_MD, "MOD-product-process");
  assert.deepEqual(schema, DECLARATION_SCHEMA);
  assert.equal(schema.noHistory, true);
});

// guards: THE CATALOGUE IS DATA
// given: schema files in the same form, written otherwise: the declaration's with CR LF line ends; and the register's,
//        with an example of a schema file before its block — a ````markdown fence that holds a ```json block of its own
// input: loadSchema of each
// expect: each time exactly the schema of the file's one ```json block that stands outside every other fence; the ```json
//         block inside the example is not read
test("loadSchema — the ```json block among other Markdown: CR LF line ends, a ```json example inside another fence", () => {
  assert.deepEqual(loadSchema(DECLARATION_SCHEMA_MD.replace(/\n/g, "\r\n"), "MOD-product-process"), DECLARATION_SCHEMA);
  const withExample = [
    "# The participant register",
    "",
    "A schema file shows its form so:",
    "",
    "````markdown",
    "```json",
    "{ \"schema\": \"example\", \"shape\": \"lines\" }",
    "```",
    "````",
    "",
    "```json",
    JSON.stringify(PARTICIPANTS_SCHEMA, null, 2),
    "```",
    "",
  ].join("\n");
  assert.deepEqual(loadSchema(withExample, "MOD-participant-list"), PARTICIPANTS_SCHEMA);
});

// guards: THE CATALOGUE IS DATA
// given: known positive first — DECLARATION_SCHEMA_MD loads; then schema files that hold no schema to read: one whose schema
//        stands in a ```text block, so that it has no ```json block; one with two ```json blocks; one whose block is not
//        JSON; one whose block holds a JSON array
// input: loadSchema(file, "MOD-product-process")
// expect: each throws a SchemaError naming the owner, MOD-product-process, in its field `owner` and in its message; `key` is
//         null, since no key of a schema could be read
test("loadSchema — a schema file without its one ```json block holding an object throws SchemaError naming the owner", () => {
  assert.doesNotThrow(() => loadSchema(DECLARATION_SCHEMA_MD, "MOD-product-process"), "known positive");
  const json = JSON.stringify(DECLARATION_SCHEMA, null, 2);
  const files = {
    "no ```json block": ["# A schema", "", "```text", json, "```", ""].join("\n"),
    "two ```json blocks": ["# A schema", "", "```json", json, "```", "", "```json", json, "```", ""].join("\n"),
    "a block that is not JSON": ["# A schema", "", "```json", "{ schema: declaration }", "```", ""].join("\n"),
    "a block holding an array": ["# A schema", "", "```json", `[${json}]`, "```", ""].join("\n"),
  };
  for (const [what, file] of Object.entries(files)) {
    assert.throws(() => loadSchema(file, "MOD-product-process"),
      (e) => e.name === "SchemaError" && e.owner === "MOD-product-process" && e.key === null
        && e.message.includes("MOD-product-process"),
      what);
  }
});

// A schema that breaks the language: [what is broken, the schema it is broken in, the change, the key SchemaError names].
const BREAKS = [
  ["a key the language does not have", DECLARATION_SCHEMA, (s) => { s.frontmatter = {}; }, "frontmatter"],
  ["no format name", DECLARATION_SCHEMA, (s) => { delete s.schema; }, "schema"],
  ["a shape that is neither document nor lines", DECLARATION_SCHEMA, (s) => { s.shape = "table"; }, "shape"],
  ["a placeholder the path patterns do not have", DECLARATION_SCHEMA, (s) => { s.path = "docs/{name}.md"; }, "path"],
  ["a type the language does not have", DECLARATION_SCHEMA, (s) => { s.frontMatter.model.type = "string"; },
    "frontMatter.model.type"],
  ["a sha without its digits", DECLARATION_SCHEMA, (s) => { delete s.frontMatter.model_version.digits; },
    "frontMatter.model_version.digits"],
  ["a sha of 20 digits", DECLARATION_SCHEMA, (s) => { s.frontMatter.model_version.digits = 20; },
    "frontMatter.model_version.digits"],
  ["an identifier of a kind outside the scheme", SOURCE_SCHEMA, (s) => { s.frontMatter.id.of = ["SOURCE"]; },
    "frontMatter.id.of"],
  ["an enum without its values", PARTICIPANTS_SCHEMA, (s) => { delete s.sections[0].table.columns[1].value.values; },
    "sections[0].table.columns[1].value.values"],
  ["a list without its item", DECLARATION_SCHEMA, (s) => { delete s.sections[0].table.columns[1].value.item; },
    "sections[0].table.columns[1].value.item"],
  ["a condition on a field that is neither a column of the row nor a key", PARTICIPANTS_SCHEMA,
    (s) => { s.sections[0].table.columns[2].value.requiredWhen = { field: "Kind", notIn: ["person"] }; },
    "sections[0].table.columns[2].value.requiredWhen.field"],
  ["a condition with neither in nor notIn", PARTICIPANTS_SCHEMA,
    (s) => { s.sections[0].table.columns[2].value.requiredWhen = { field: "Type" }; },
    "sections[0].table.columns[2].value.requiredWhen"],
  ["a variant without its condition", MODEL_SCHEMA, (s) => { delete s.sections[2].table.columns[1].value.variants[0].when; },
    "sections[2].table.columns[1].value.variants[0].when"],
  ["a table without columns", DECLARATION_SCHEMA, (s) => { s.sections[0].table.columns = []; }, "sections[0].table.columns"],
  ["a section whose heading is no heading line", DECLARATION_SCHEMA, (s) => { s.sections[1].heading = "Practices"; },
    "sections[1].heading"],
  ["a heading named twice", DECLARATION_SCHEMA, (s) => { s.sections[2].heading = "## Roles"; }, "sections[2].heading"],
  ["otherSections neither allowed nor forbidden", DECLARATION_SCHEMA, (s) => { s.otherSections = "sometimes"; },
    "otherSections"],
  ["diagrams neither required, allowed nor none", DECLARATION_SCHEMA, (s) => { s.diagrams = "some"; }, "diagrams"],
  ["noHistory neither true nor false", DECLARATION_SCHEMA, (s) => { s.noHistory = "yes"; }, "noHistory"],
  ["a title naming a key the front matter does not have", SOURCE_SCHEMA, (s) => { s.title = "# {id} {name}"; }, "title"],
  ["an identifier whose field is no key of the front matter", SOURCE_SCHEMA, (s) => { s.identifier.field = "ident"; },
    "identifier.field"],
  ["describedIn naming a section the schema does not have", DECLARATION_SCHEMA,
    (s) => { s.frontMatter.model.describedIn = "## Models"; }, "frontMatter.model.describedIn"],
  ["a key naming no field", DECLARATION_SCHEMA, (s) => { s.key = ["name"]; }, "key[0]"],
  ["front matter in a record of key: value lines", APPROVAL_SCHEMA, (s) => { s.frontMatter = {}; }, "frontMatter"],
];

// guards: THE CATALOGUE IS DATA; A DATA FORMAT IS DEFINED ONCE
// given: known positive first — the seven schemas of this file each load; then each schema of BREAKS, a copy of one of them
//        broken in one place: a key the language does not have, a missing or unknown value of a key, a type parameter
//        missing or out of range, a condition naming no field or neither in nor notIn, a variant without its condition, a
//        table without columns, a heading that is no heading line or is named twice, a placeholder or a section a schema
//        names that does not exist, front matter in a record of lines
// input: loadSchema(schemaFile(…, broken), "MOD-example")
// expect: each throws a SchemaError whose `key` is the key of BREAKS — the path to it in the schema, `frontMatter.model.type`,
//         `sections[0].table.columns[1].value.values` — and whose `owner` is MOD-example, its message naming both
test("loadSchema — a schema that breaks the language throws SchemaError naming the key and the owner", () => {
  for (const schema of [DECLARATION_SCHEMA, PARTICIPANTS_SCHEMA, MODEL_SCHEMA, SOURCE_SCHEMA, DECISIONS_SCHEMA,
    APPROVAL_SCHEMA, JOB_SCHEMA]) {
    assert.doesNotThrow(() => load(schema), `known positive: ${schema.schema}`);
  }
  for (const [what, schema, change, key] of BREAKS) {
    const broken = copy(schema);
    change(broken);
    assert.throws(() => loadSchema(schemaFile("A broken schema", broken), "MOD-example"),
      (e) => e.name === "SchemaError" && e.key === key && e.owner === "MOD-example"
        && e.message.includes(key) && e.message.includes("MOD-example"),
      `${what}: SchemaError naming ${key}`);
  }
});

// ---------------------------------------------------------------- readDocument

// guards: UC-002
// given: DECLARATION — front matter; a title and a paragraph before the first section; a table whose cells hold a list; a
//        section holding a Markdown list; a second table; a free section with a lower heading in it; a section the schema
//        does not name, holding a fenced block with a line that looks like a heading
// input: readDocument(the declaration's schema, "docs/process.md", DECLARATION)
// expect: DECLARATION_DOCUMENT — the front matter's values by key; the title; each section from its heading line to the next
//         heading of its level, with its heading as written, the line of its heading and its text — the ### heading and the
//         fenced line inside their sections —; the rows of each table with their lines, the list cell a list; the section
//         the schema does not name read as it stands; no appended section; the body every byte after the front matter
test("readDocument — a declaration read by its schema: front matter, tables, lists, free sections", () => {
  assert.deepEqual(readDocument(load(DECLARATION_SCHEMA, "MOD-product-process"), "docs/process.md", DECLARATION),
    DECLARATION_DOCUMENT);
});

// guards: UC-002; A DATA FORMAT IS DEFINED ONCE
// given: SOURCE_ENTRY — a source register entry with its identifier, a front matter list, the section ## Versions with a
//        lower heading and a second table inside it, and ## Parts; and the same entry without `id` in its front matter
// input: readDocument(the source schema, "docs/sources/SRC-iec-62304.md", text)
// expect: the identifier SRC-iec-62304; the title, the text of the first heading; `places` a list of its two items, the
//         comma inside an item kept; the sections ## Versions (line 16) and ## Parts (line 29), the ### heading inside the
//         first; the rows of the first table of ## Versions only, its list cells split at commas; the row of ## Parts; and,
//         without `id` in the front matter, the identifier its path gives
test("readDocument — a source entry: its identifier, a front matter list, the first table of a section", () => {
  const source = load(SOURCE_SCHEMA, "MOD-source-register");
  const entry = readDocument(source, "docs/sources/SRC-iec-62304.md", SOURCE_ENTRY);
  assert.equal(entry.id, "SRC-iec-62304");
  assert.equal(entry.title, "SRC-iec-62304 IEC 62304");
  assert.deepEqual(entry.fields.places, ["this machine", "NHR@FAU, Erlangen"]);
  assert.deepEqual(entry.sections.map((s) => [s.heading, s.line]), [["## Versions", 16], ["## Parts", 29]]);
  assert.ok(entry.sections[0].text.includes("### Files of `2006+AMD1:2015`"), "the lower heading stays in ## Versions");
  assert.deepEqual(entry.sections[0].rows, [
    { line: 20, cells: { Version: "`2006`", Date: "2006-05-09", Files: ["iec62304-2006.pdf"] } },
    { line: 21, cells: { Version: "`2006+AMD1:2015`", Date: "2015-06-29",
      Files: ["iec62304-2006.pdf", "iec62304-amd1-2015.pdf"] } },
  ]);
  assert.deepEqual(entry.sections[1].rows,
    [{ line: 33, cells: { Part: "class B", "Applies to": "software whose failure can lead to a non-serious injury" } }]);
  const withoutId = SOURCE_ENTRY.replace("id: SRC-iec-62304\n", "");
  assert.equal(readDocument(source, "docs/sources/SRC-iec-62304.md", withoutId).id, "SRC-iec-62304");
});

// guards: UC-002
// given: MODEL — a process model whose ## Flow control table has a column Value with two variants: a number under Kind
//        `WIP limit`, one of yes or no under Kind `Sprints`, and a text under any other Kind; then the same model with the
//        cell 4 under Kind `Time box`, and with the cell `four` under Kind `WIP limit`
// input: the rows of ## Flow control, read by readDocument(the model schema, "docs/process-models/scrum-wip.md", text)
// expect: WIP limit's Value the number 4, Time box's the text "none", Sprints' the text "yes"; the cell 4 under Time box the
//         text "4", since no variant holds; the cell `four` under WIP limit the text "four" — a value that does not fit the
//         variant that holds is read as the text it is
test("readDocument — a value that depends on another, read by the variant that holds", () => {
  const model = load(MODEL_SCHEMA, "MOD-model-catalogue");
  const flow = (text) => readDocument(model, "docs/process-models/scrum-wip.md", text)
    .sections.find((s) => s.heading === "## Flow control").rows;
  assert.deepEqual(flow(MODEL), [
    { line: 32, cells: { Kind: "WIP limit", Value: 4 } },
    { line: 33, cells: { Kind: "Time box", Value: "none" } },
    { line: 34, cells: { Kind: "Sprints", Value: "yes" } },
  ]);
  assert.deepEqual(flow(MODEL.replace("| WIP limit | 4 |", "| Time box | 4 |"))[0],
    { line: 32, cells: { Kind: "Time box", Value: "4" } });
  assert.deepEqual(flow(MODEL.replace("| WIP limit | 4 |", "| WIP limit | four |"))[0],
    { line: 32, cells: { Kind: "WIP limit", Value: "four" } });
});

// guards: UC-002
// given: texts that do not fit the declaration's schema or the source schema: a front matter that is never closed; a row of
//        ## Roles with one cell, and one with a cell more than the columns; a list written as one value; and texts that are
//        no document at all — empty, control characters and stray table lines, an empty front matter
// input: readDocument of each
// expect: none throws. The unclosed front matter: no fields, every byte body. The short row: the one cell it has, by
//         position; the long row: its two cells, the third not read. The list written as one value: the text it is. The
//         empty text: a document with no fields, no title, no sections and an empty body
test("readDocument — never throws on the content: what does not fit is left as it stands, the parts that fit are read", () => {
  const declaration = load(DECLARATION_SCHEMA, "MOD-product-process");
  const read = (text) => readDocument(declaration, "docs/process.md", text);
  const unclosed = "---\nmodel: scrum-wip\n# How the product is developed\n";
  assert.deepEqual([read(unclosed).fields, read(unclosed).body], [{}, unclosed]);
  const short = DECLARATION.replace("| Developers | developer-opus-a, developer-opus-b |", "| Developers |");
  assert.deepEqual(read(short).sections[0].rows[1], { line: 18, cells: { Role: "Developers" } });
  const long = DECLARATION.replace("| Product Owner | po-opus |", "| Product Owner | po-opus | a cell more |");
  assert.deepEqual(read(long).sections[0].rows[0], { line: 17, cells: { Role: "Product Owner", Participants: ["po-opus"] } });
  const source = load(SOURCE_SCHEMA, "MOD-source-register");
  const oneValue = SOURCE_ENTRY.replace("places:\n  - this machine\n  - NHR@FAU, Erlangen\n", "places: this machine\n");
  assert.equal(readDocument(source, "docs/sources/SRC-iec-62304.md", oneValue).fields.places, "this machine");
  for (const text of ["", "\u0000\u0001|||\n## \n| — |\n|", "---\n---\n"]) {
    assert.doesNotThrow(() => read(text), JSON.stringify(text));
  }
  assert.deepEqual(read(""), { kind: "declaration", path: "docs/process.md", id: null, title: null, fields: {}, sections: [],
    appended: [], body: "" });
});

// guards: UC-002
// given: APPROVAL, a record of key: value lines; JOB, a job record with front matter, one section, and two sections appended
//        to it, each holding key: value lines its schema names
// input: readDocument of each, by its schema
// expect: the approval record's values by key, with no title, no sections and its text as body; the job record's
//         identifier, its one section ## Inputs, and its appended sections in order, each with its heading, line, text and
//         its fields by key
test("readDocument — records: key: value lines, and the sections appended to a record with their fields", () => {
  const approval = load(APPROVAL_SCHEMA, "MOD-approvals");
  assert.deepEqual(readDocument(approval, "docs/approvals/MOD-documents-b42dcae8b2d7.md", APPROVAL), {
    kind: "approval-record", path: "docs/approvals/MOD-documents-b42dcae8b2d7.md", id: null, title: null,
    fields: { kind: "module", file: "docs/architecture/MOD-documents.md", blob: "b42dcae8b2d71af6a80c6faf5bae2c3cee2d026f" },
    sections: [], appended: [], body: APPROVAL,
  });
  const job = readDocument(load(JOB_SCHEMA, "MOD-job-ledger"), "docs/jobs/JOB-20261006-0900-a1b2.md", JOB);
  assert.equal(job.id, "JOB-20261006-0900-a1b2");
  assert.deepEqual(job.sections, [{ heading: "## Inputs", line: 9, text: linesOf("", "- ITM-213", "") }]);
  assert.deepEqual(job.appended, [
    { heading: "## Waiting at a gate", line: 13,
      text: linesOf("", "gate: Development → Release testing", "since: 2026-10-06 11:30 UTC", ""),
      fields: { gate: "Development → Release testing", since: "2026-10-06 11:30 UTC" } },
    { heading: "## End", line: 18, text: linesOf("", "state: done", "ended: 2026-10-06 12:00 UTC"),
      fields: { state: "done", ended: "2026-10-06 12:00 UTC" } },
  ]);
});

// guards: UC-002
// given: known positive first — the participant register read with its loaded schema; then schemas that loadSchema did not
//        return: the schema object itself, a copy of the loaded one, nothing, and a name
// input: readDocument, writeDocument and readRegister with each
// expect: each call throws a TypeError
test("readDocument, writeDocument and readRegister — a schema that loadSchema did not return is refused with a TypeError", () => {
  const loaded = load(PARTICIPANTS_SCHEMA, "MOD-participant-list");
  const document = readDocument(loaded, "docs/participants.md", PARTICIPANTS);
  assert.equal(writeDocument(loaded, document), PARTICIPANTS, "known positive");
  for (const schema of [PARTICIPANTS_SCHEMA, copy(loaded), undefined, "participants"]) {
    assert.throws(() => readDocument(schema, "docs/participants.md", PARTICIPANTS), TypeError, "readDocument");
    assert.throws(() => writeDocument(schema, document), TypeError, "writeDocument");
    assert.throws(() => readRegister(schema, "docs/participants.md", PARTICIPANTS), TypeError, "readRegister");
  }
});

// ---------------------------------------------------------------- readRegister

// guards: UC-002; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL
// given: PARTICIPANTS — the participant register, its table under its title with no ## section, three rows: a person whose
//        Model, Context, Price and Processing place are left out as —, and two agents with a model, a context and a place
// input: readRegister(the participant schema, "docs/participants.md", PARTICIPANTS)
// expect: rows PARTICIPANT_ROWS — each with its line, 9 to 11, and its cells by column: Context a number, Capabilities a list,
//         a value left out absent —; the document: no fields, the title, one section from the title line over the whole
//         register — the table's rows the same rows —, the body the whole text
test("readRegister — a register read row by row, under its title: each row with its line and its cells by column", () => {
  const { document, rows } = readRegister(load(PARTICIPANTS_SCHEMA, "MOD-participant-list"), "docs/participants.md",
    PARTICIPANTS);
  assert.deepEqual(rows, PARTICIPANT_ROWS);
  assert.deepEqual(document, {
    kind: "participants", path: "docs/participants.md", id: null, title: "Participants of this instance", fields: {},
    sections: [{ heading: "# Participants of this instance", line: 1, text: PARTICIPANTS.slice(PARTICIPANTS.indexOf("\n") + 1),
      rows: PARTICIPANT_ROWS }],
    appended: [], body: PARTICIPANTS,
  });
});

// guards: UC-002
// given: DECISIONS — a decisions file whose table has no header row: two rows, the Record of the second left out as —
// input: readRegister(the decisions schema, "docs/spec-freigaben/2026-10-05e_the-main-page/entscheidungen.md", DECISIONS)
// expect: two rows, lines 4 and 5, their cells read by position into the columns When, Entry, Decision, Record — Entry a
//         number —, the second without Record
test("readRegister — a table without a header row, read by position into its columns", () => {
  const { rows } = readRegister(load(DECISIONS_SCHEMA, "MOD-spec-changes"),
    "docs/spec-freigaben/2026-10-05e_the-main-page/entscheidungen.md", DECISIONS);
  assert.deepEqual(rows, [
    { line: 4, cells: { When: "2026-10-05 16:46 UTC", Entry: 1, Decision: "uebernommen",
      Record: "approval:spec-2026-10-05e_the-main-page-01-1c4960c065ed.md" } },
    { line: 5, cells: { When: "2026-10-06 09:12 UTC", Entry: 2, Decision: "abgelehnt" } },
  ]);
});

// guards: UC-002
// given: known positive first — the participant schema names one table; then the declaration's schema, which names two, and
//        the approval record's, which names none
// input: readRegister with each schema and a text of its format
// expect: the known positive reads; each of the two others throws a TypeError, since a register is read by the one table
//         its schema names
test("readRegister — a schema that names no table, or more than one, is no register's: TypeError", () => {
  assert.doesNotThrow(() => readRegister(load(PARTICIPANTS_SCHEMA), "docs/participants.md", PARTICIPANTS), "known positive");
  assert.throws(() => readRegister(load(DECLARATION_SCHEMA), "docs/process.md", DECLARATION), TypeError, "two tables");
  assert.throws(() => readRegister(load(APPROVAL_SCHEMA), "docs/approvals/a.md", APPROVAL), TypeError, "no table");
});

// ---------------------------------------------------------------- writeDocument

// guards: UC-002
// given: seven canonical texts, each read by its schema: the declaration, the participant register, the process model, the
//        source entry, the decisions file, the approval record and the job record
// input: writeDocument(schema, readDocument(schema, path, text)) for each
// expect: each text byte for byte
test("writeDocument — a canonical text read and written again is byte for byte the same", () => {
  const texts = [
    [DECLARATION_SCHEMA, "docs/process.md", DECLARATION],
    [PARTICIPANTS_SCHEMA, "docs/participants.md", PARTICIPANTS],
    [MODEL_SCHEMA, "docs/process-models/scrum-wip.md", MODEL],
    [SOURCE_SCHEMA, "docs/sources/SRC-iec-62304.md", SOURCE_ENTRY],
    [DECISIONS_SCHEMA, "docs/spec-freigaben/2026-10-05e_the-main-page/entscheidungen.md", DECISIONS],
    [APPROVAL_SCHEMA, "docs/approvals/MOD-documents-b42dcae8b2d7.md", APPROVAL],
    [JOB_SCHEMA, "docs/jobs/JOB-20261006-0900-a1b2.md", JOB],
  ];
  for (const [schema, path, text] of texts) {
    const loaded = load(schema);
    assert.equal(writeDocument(loaded, readDocument(loaded, path, text)), text, path);
  }
});

// guards: UC-002
// given: UNORDERED — the declaration with its front matter keys out of the schema's order, a value with blanks before it,
//        and its sections out of the schema's order with a section the schema does not name among them; and the source entry
//        with two keys swapped and its list's items indented by four blanks
// input: writeDocument of each, as read
// expect: UNORDERED_WRITTEN — the keys in the schema's order, the value trimmed; ## Roles before ## Practices, ## Branches
//         before ## Definition of Done, the other section where it stood among them; every other byte as it was — and the
//         source entry exactly SOURCE_ENTRY: its keys in order, each item of its list on a line of its own as `  - item`
test("writeDocument — the canonical form: front matter keys and sections in the schema's order, lists one item per line", () => {
  const declaration = load(DECLARATION_SCHEMA, "MOD-product-process");
  assert.equal(writeDocument(declaration, readDocument(declaration, "docs/process.md", UNORDERED)), UNORDERED_WRITTEN);
  const source = load(SOURCE_SCHEMA, "MOD-source-register");
  const indented = SOURCE_ENTRY.replace("title: IEC 62304\nkind: standard\n", "kind: standard\ntitle: IEC 62304\n")
    .replace("  - this machine\n  - NHR@FAU, Erlangen\n", "    - this machine\n    - NHR@FAU, Erlangen\n");
  assert.equal(writeDocument(source, readDocument(source, "docs/sources/SRC-iec-62304.md", indented)), SOURCE_ENTRY);
});

// guards: UC-002
// given: the participant register with akmaier's row written without blanks around its cells; read; then reviewer-b's Context
//        changed to 128000, summariser's row removed, and a row for tester-x added, its Context and Price left out
// input: writeDocument(the participant schema, the register)
// expect: the register with the same header and separator lines; akmaier's row unchanged, byte for byte, without its blanks;
//         reviewer-b's row written in the table's form, `| cell | cell |`, with 128000 and its Price as —; no summariser;
//         tester-x's row at the end in the same form, its values left out as —; the lines after the table unchanged
test("writeDocument — rows changed, removed and added: the table holds the section's rows, a row that stands keeps its bytes", () => {
  const participants = load(PARTICIPANTS_SCHEMA, "MOD-participant-list");
  const unspaced = "|akmaier|person|—|—|—|draft text, read the repository, write to the repository|—|account github.com/akmaier|";
  const { document } = readRegister(participants, "docs/participants.md", PARTICIPANTS.replace(AKMAIER, unspaced));
  const rows = document.sections[0].rows;
  rows[1].cells.Context = 128000;
  rows.splice(2, 1);
  rows.push({ line: 0, cells: { Name: "tester-x", Type: "sandboxed agent", Model: "small-model",
    Capabilities: ["run code and tests"], "Processing place": "this machine", Route: "bridge lab-pc agent opencode" } });
  assert.equal(writeDocument(participants, document), [
    ...PARTICIPANTS_HEAD,
    unspaced,
    "| reviewer-b | CLI agent | example-model | 128000 | — | draft text, read the repository | this machine | "
      + "bridge lab-pc agent claude |",
    "| tester-x | sandboxed agent | small-model | — | — | run code and tests | this machine | bridge lab-pc agent opencode |",
    ...PARTICIPANTS_TAIL,
  ].join("\n"));
});

// guards: UC-002
// given: known positive first — the declaration as read is written back; then the declaration with one value of its front
//        matter that does not fit: a sha of seven digits where the schema asks for 40, a required key left out, a key the
//        schema does not list, a value holding a line break, a list where one value is expected; the approval record with a
//        blob of twelve digits; the job record whose appended ## End has a state outside its values
// input: writeDocument of each
// expect: each throws a DocumentError naming the field — model_version, model, owner, sprint_close, model; blob; and state,
//         with the section ## End — in its field `field` and in its message
test("writeDocument — a value that does not fit its specification is refused with DocumentError naming the field", () => {
  const declaration = load(DECLARATION_SCHEMA, "MOD-product-process");
  const read = () => readDocument(declaration, "docs/process.md", DECLARATION);
  assert.equal(writeDocument(declaration, read()), DECLARATION, "known positive");
  const misfits = [
    ["a sha of seven digits where the schema asks for 40", (d) => { d.fields.model_version = "4c60cfe"; }, "model_version"],
    ["a required key left out", (d) => { delete d.fields.model; }, "model"],
    ["a key the schema does not list", (d) => { d.fields.owner = "akmaier"; }, "owner"],
    ["a value holding a line break", (d) => { d.fields.sprint_close = "scrum-master-session\npo-opus"; }, "sprint_close"],
    ["a list where one value is expected", (d) => { d.fields.model = ["scrum-wip", "kanban"]; }, "model"],
  ];
  for (const [what, change, field] of misfits) {
    const document = read();
    change(document);
    assert.throws(() => writeDocument(declaration, document),
      (e) => e.name === "DocumentError" && e.field === field && e.message.includes(field), what);
  }
  const approval = load(APPROVAL_SCHEMA, "MOD-approvals");
  const record = readDocument(approval, "docs/approvals/MOD-documents-b42dcae8b2d7.md", APPROVAL);
  assert.equal(writeDocument(approval, record), APPROVAL, "known positive: the approval record");
  record.fields.blob = "b42dcae8b2d7";
  assert.throws(() => writeDocument(approval, record), (e) => e.name === "DocumentError" && e.field === "blob",
    "a blob of twelve digits");
  const jobSchema = load(JOB_SCHEMA, "MOD-job-ledger");
  const job = readDocument(jobSchema, "docs/jobs/JOB-20261006-0900-a1b2.md", JOB);
  assert.equal(writeDocument(jobSchema, job), JOB, "known positive: the job record");
  job.appended[1].fields.state = "finished";
  assert.throws(() => writeDocument(jobSchema, job),
    (e) => e.name === "DocumentError" && e.section === "## End" && e.field === "state", "a state outside its values");
});

// guards: UC-002; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL
// given: known positive first — the participant register as read, a person without a model and two agents with theirs, is
//        written back; then the register with reviewer-b's Model left out (Model is required for every Type but person),
//        with akmaier's Model given (Model is left out for a person), and with reviewer-b's Capabilities an empty list; the
//        process model with WIP limit's Value `four` (a number under Kind WIP limit) — and, as its known positive, Time
//        box's Value `four weeks`, a text, since no variant holds; the declaration with a participant name holding a comma,
//        which its list cell cannot hold
// input: writeDocument of each
// expect: the register's three cases each throw a DocumentError naming the section # Participants of this instance, the row
//         — 2 at line 10, 1 at line 9, 2 at line 10 — and the column, Model, Model, Capabilities; the model's: section
//         ## Flow control, row 1 at line 32, column Value; Time box's `four weeks` is written; the declaration's: section
//         ## Roles, row 1 at line 17, column Participants. Each message names the row and the column
test("writeDocument — the values that depend on other values in a row: DocumentError naming the row and the column", () => {
  const participants = load(PARTICIPANTS_SCHEMA, "MOD-participant-list");
  const register = () => readRegister(participants, "docs/participants.md", PARTICIPANTS).document;
  assert.equal(writeDocument(participants, register()), PARTICIPANTS, "known positive");
  const refused = (schema, document, section, row, line, column, what) => assert.throws(() => writeDocument(schema, document),
    (e) => e.name === "DocumentError" && e.section === section && e.row === row && e.line === line && e.column === column
      && e.message.includes(String(row)) && e.message.includes(column), what);
  const TITLE = "# Participants of this instance";
  const noModel = register();
  delete noModel.sections[0].rows[1].cells.Model;
  refused(participants, noModel, TITLE, 2, 10, "Model", "a CLI agent without its model");
  const personModel = register();
  personModel.sections[0].rows[0].cells.Model = "example-model";
  refused(participants, personModel, TITLE, 1, 9, "Model", "a person with a model");
  const noCapability = register();
  noCapability.sections[0].rows[1].cells.Capabilities = [];
  refused(participants, noCapability, TITLE, 2, 10, "Capabilities", "an empty list where the column asks for one item");

  const model = load(MODEL_SCHEMA, "MOD-model-catalogue");
  const read = () => readDocument(model, "docs/process-models/scrum-wip.md", MODEL);
  const weeks = read();
  weeks.sections[2].rows[1].cells.Value = "four weeks";
  assert.equal(writeDocument(model, weeks), MODEL.replace("| Time box | none |", "| Time box | four weeks |"),
    "known positive: a text under Kind Time box");
  const four = read();
  four.sections[2].rows[0].cells.Value = "four";
  refused(model, four, "## Flow control", 1, 32, "Value", "a text where Kind WIP limit asks for a number");

  const declaration = load(DECLARATION_SCHEMA, "MOD-product-process");
  const roles = readDocument(declaration, "docs/process.md", DECLARATION);
  roles.sections[0].rows[0].cells.Participants = ["po-opus, akmaier"];
  refused(declaration, roles, "## Roles", 1, 17, "Participants", "a list item holding a comma");
});

// guards: A SOURCE VERSION IS NEVER OVERWRITTEN; UC-002
// given: the source entry, whose ## Versions table only grows (appendOnly), with its first version's row written without
//        blanks around two cells; known positive first — a version added at the end; then the first version removed, the
//        second version's date changed, and a version inserted before the second
// input: writeDocument(the source schema, the entry)
// expect: the added version: the entry with the new row after the second version, in the table's form, the rows that stand
//         byte for byte as they were, the unspaced one included; each of the others throws NotAppendable naming the section
//         ## Versions and the row of the text it was read from that would be lost or changed — row 1 at line 20, row 2 at
//         line 21, row 2 at line 21 —, in its fields and its message
test("writeDocument — an append-only table only grows: NotAppendable naming the row that would be lost or changed", () => {
  const source = load(SOURCE_SCHEMA, "MOD-source-register");
  const unspaced = SOURCE_ENTRY.replace("| `2006` | 2006-05-09 | iec62304-2006.pdf |", "| `2006` |2006-05-09|iec62304-2006.pdf|");
  const read = () => readDocument(source, "docs/sources/SRC-iec-62304.md", unspaced);
  const amendment = () => ({ line: 0,
    cells: { Version: "`2006+AMD1:2015+AMD2:2026`", Date: "2026-10-06", Files: ["iec62304-amd2-2026.pdf"] } });
  const added = read();
  added.sections[0].rows.push(amendment());
  const second = "| `2006+AMD1:2015` | 2015-06-29 | iec62304-2006.pdf, iec62304-amd1-2015.pdf |";
  assert.equal(writeDocument(source, added),
    unspaced.replace(second, `${second}\n| \`2006+AMD1:2015+AMD2:2026\` | 2026-10-06 | iec62304-amd2-2026.pdf |`),
    "known positive: a version added at the end");
  const changes = [
    ["the first version removed", (rows) => { rows.shift(); }, 1, 20],
    ["the second version's date changed", (rows) => { rows[1].cells.Date = "2015-06-30"; }, 2, 21],
    ["a version inserted before the second", (rows) => { rows.splice(1, 0, amendment()); }, 2, 21],
  ];
  for (const [what, change, row, line] of changes) {
    const entry = read();
    change(entry.sections[0].rows);
    assert.throws(() => writeDocument(source, entry),
      (e) => e.name === "NotAppendable" && e.section === "## Versions" && e.row === row && e.line === line
        && e.message.includes("## Versions") && e.message.includes(String(line)),
      what);
  }
});
