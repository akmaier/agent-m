// The findings a schema decides, each naming its requirement (ITM-227) — MOD-documents' documentFindings and the `rule` of
// its schema language, as the accepted text of docs/architecture/MOD-documents.md states them, for what MOD-model-catalogue
// (ITM-215), MOD-participant-list (ITM-216) and MOD-product-process (ITM-218) call.
// Run: node --test tests/documents-findings.test.mjs
//
// Module: MOD-documents
// Guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE
// Level: unit
//
// What ITM-227 builds, and these tests state:
// - loadSchema reads the `rule` a schema, a section, a value specification, a condition — a combination of conditions among
//   them — or a variant names, and refuses with SchemaError a `rule` that is not a requirement's name in capitals.
// - documentFindings finds front matter keys missing — also where a requiredWhen condition holds —, unknown, out of order, or
//   present where a forbiddenWhen condition holds; values that do not fit their type or the variant that holds, or are empty
//   where nonEmpty; each row of a table, cell by cell, in the same way; required sections missing, sections out of order, and
//   sections the schema forbids.
// - Each finding is an error with its line, in MOD-text-tools' one text form `<artifact>:<line>: error: <what> [<rule>] —
//   <fix>.`, its artifact the document's identifier, or its path when it has none. It names the rule of the part of the
//   schema closest to it (Data, The requirement a finding names): a condition's — of combined conditions, the first part
//   that holds and names one, before the combination's own —, then the variant's that holds, then the value
//   specification's, then the section's, and last the schema's own, which alone a key the schema does not list, keys out of
//   order and a section the schema forbids name.
//
// Not tested here, since ITM-227 leaves them out: the path and the identifier against the path, a path pattern's own rule and
// a condition on the path, the title, describedIn, diagrams and images, the marks of history, a schema refused for naming no
// rule, underTitle, a section's table found by its header, appended sections, appendSection, classifyCandidates,
// artifactSchemas and the module's own schemas.
//
// Where the module file leaves a choice open, these tests settle it as the dashboard's checks of today do
// (docs/assets/artifacts/use-cases.mjs): a key or a section that is missing stands on no line, and its finding names line 1;
// a key that stands names its own line, counted as its document's front matter is written, one line per key and one more
// per item of a list. The findings come in the order of their lines; findings on one line, in the order of the schema.
//
// Each test states its input and its expected result before it runs (given / input / expect). Each test of a finding shows
// first, as its known positive, that the document that fits has none. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as documents from "../src/documents/index.mjs";
import { formatFinding } from "../src/text-tools/index.mjs";

// documentFindings is called through the module's namespace, so that while it is missing each test fails on its own.
const { loadSchema, readDocument } = documents;
const documentFindings = (schema, document) => documents.documentFindings(schema, document);

// ---------------------------------------------------------------- helpers

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
const load = (schema, owner = "MOD-example") => loadSchema(schemaFile(schema), owner);

// The findings of a text, read by its schema, each in its one text form.
function findingsOf(schema, path, text) {
  const loaded = load(schema);
  return documentFindings(loaded, readDocument(loaded, path, text)).map(formatFinding);
}

// The line and the rule of each finding of a text, read by its schema.
function rulesOf(schema, path, text) {
  const loaded = load(schema);
  return documentFindings(loaded, readDocument(loaded, path, text)).map((f) => [f.line, f.rule]);
}

// The front matter of a text: its lines between two lines ---.
const front = (...lines) => ["---", ...lines, "---"];

const copy = (value) => JSON.parse(JSON.stringify(value));

// ---------------------------------------------------------------- the participant register (MOD-participant-list)
//
// The register `docs/participants.md`, its table under its title, each row a participant (ITM-216 names each entry of a type
// outside the five, or of a language model without its model, as an error through documentFindings).

const TYPES = ["person", "model endpoint", "CI agent", "CLI agent", "sandboxed agent"];
const CAPABILITIES = ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools",
  "reach the web"];
const PARTICIPANTS_SCHEMA = {
  schema: "participants",
  shape: "document",
  rule: "PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE",
  path: "docs/participants.md",
  sections: [
    { heading: "# Participants of this instance", required: true, table: { columns: [
      { name: "Name", value: { type: "text", required: true } },
      { name: "Type", value: { type: "enum", values: TYPES, required: true, rule: "A PARTICIPANT HAS ONE OF FIVE TYPES" } },
      { name: "Model", value: { type: "text",
        requiredWhen: { field: "Type", notIn: ["person"], rule: "A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL" },
        forbiddenWhen: { field: "Type", in: ["person"] } } },
      { name: "Context", value: { type: "number" } },
      { name: "Capabilities", value: { type: "list", item: { type: "enum", values: CAPABILITIES }, required: true,
        nonEmpty: true, rule: "A PARTICIPANT DECLARES ITS CAPABILITIES" } },
      { name: "Processing place", value: { type: "text", rule: "A PARTICIPANT DECLARES WHERE IT PROCESSES DATA",
        requiredWhen: { field: "Type", notIn: ["person"] }, forbiddenWhen: { field: "Type", in: ["person"] } } },
      { name: "Route", value: { type: "text", required: true } },
    ] } },
  ],
  otherSections: "forbidden",
};

const PARTICIPANTS_HEAD = [
  "# Participants of this instance",                                                             // 1 — the title, and the
  "",                                                                                            // 2   heading of the
  "**REGISTER**",                                                                                // 3   table's section
  "",                                                                                            // 4
  "The people and agents who work on the products of this instance, one row per participant.",  // 5
  "",                                                                                            // 6
  "| Name | Type | Model | Context | Capabilities | Processing place | Route |",                 // 7
  "|---|---|---|---|---|---|---|",                                                              // 8
];
const PARTICIPANTS = [
  ...PARTICIPANTS_HEAD,
  "| akmaier | person | — | — | draft text, read the repository, write to the repository | — | account akmaier |",    // 9
  "| reviewer-b | CLI agent | example-model | 200000 | draft text, read the repository | this machine | bridge lab-pc |", // 10
  "| summariser | model endpoint | small-model | 32000 | draft text | NHR@FAU, Erlangen | endpoint nhr |",               // 11
  "",
].join("\n");
const PARTICIPANTS_BROKEN = [
  ...PARTICIPANTS_HEAD,
  "| akmaier | person | example-model | — | draft text | — | account akmaier |",          // 9 — a person with a model
  "| reviewer-b | CLI agent | — | many | draft text, read the repository | — | bridge lab-pc |", // 10 — an agent without its
  "| summariser | robot | small-model | 32000 | — | NHR@FAU, Erlangen | — |",            // 11   model or its place, a
  "| — | person | — | — | draft text | — | account guest |",                             // 12   context no number; a type
  "",                                                                                    //      outside the five, no
].join("\n");                                                                            //      capabilities, no route;
//                                                                                              no name

// ---------------------------------------------------------------- a process model (MOD-model-catalogue)
//
// A model `docs/process-models/<name>.md`: its front matter, and its phases, transitions and flow control as tables, whose
// Value depends on the row's Kind (ITM-215's modelFindings takes the checks a schema expresses from documentFindings).

const MEASURES = ["plan entries per phase", "remaining items per time box", "items per state over time"];
const MODEL_SCHEMA = {
  schema: "model",
  shape: "document",
  rule: "A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED",
  path: "docs/process-models/{slug}.md",
  frontMatter: {
    name: { type: "text", required: true },
    kind: { type: "enum", values: ["planned", "pulled"], required: true },
    adapted_from: { type: "text" },
    measure: { type: "enum", values: MEASURES, required: true, rule: "PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE", variants: [
      { when: { field: "kind", in: ["planned"] }, values: ["plan entries per phase"] },
      { when: { field: "kind", in: ["pulled"] }, values: ["remaining items per time box", "items per state over time"] },
    ] },
  },
  sections: [
    { heading: "## Phases", required: true, rule: "THE MODEL DETERMINES THE PHASES AND THE GATES", table: { columns: [
      { name: "Name", value: { type: "text", required: true } },
      { name: "Role", value: { type: "text", required: true, rule: "A PROCESS MODEL ORGANISES PEOPLE AND AGENTS" } },
      { name: "Produces", value: { type: "list", item: { type: "enum",
        values: ["requirements", "UC", "ARC", "MOD", "TST", "ITM", "sprint record"] }, required: true } },
    ] } },
    { heading: "## Transitions", required: true, table: { columns: [
      { name: "From", value: { type: "text", required: true } },
      { name: "To", value: { type: "text", required: true } },
      { name: "Kind", value: { type: "enum", values: ["sequence", "alternative", "back"], required: true } },
    ] } },
    { heading: "## Flow control", required: false, rule: "A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT", table: { columns: [
      { name: "Kind", value: { type: "enum", values: ["WIP limit", "Time box", "Sprints"], required: true } },
      { name: "Value", value: { type: "text", required: true, variants: [
        { when: { field: "Kind", in: ["WIP limit"] }, type: "number", rule: "NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT" },
        { when: { field: "Kind", in: ["Sprints"] }, type: "enum", values: ["yes", "no"] },
      ] } },
    ] } },
  ],
  otherSections: "forbidden",
};
const MODEL_PATH = "docs/process-models/scrum-wip.md";

const MODEL_FRONT = ["name: scrum-wip", "kind: pulled", "adapted_from: scrum", "measure: items per state over time"]; // 2–5
const MODEL_TITLE = [
  "# Scrum with a work-in-progress limit",                                    // 7
  "",                                                                         // 8
  "A process model of this instance, adapted from the shipped Scrum model.",  // 9
  "",                                                                         // 10
];
const MODEL_BODY = [
  ...MODEL_TITLE,
  "## Phases",                                                                // 11
  "",                                                                         // 12
  "| Name | Role | Produces |",                                               // 13
  "|---|---|---|",                                                            // 14
  "| Sprint planning | Product Owner | ITM |",                                 // 15
  "| Development | Developers | MOD, TST |",                                   // 16
  "",                                                                         // 17
  "## Transitions",                                                           // 18
  "",                                                                         // 19
  "| From | To | Kind |",                                                     // 20
  "|---|---|---|",                                                            // 21
  "| Sprint planning | Development | sequence |",                             // 22
  "| Development | Sprint planning | back |",                                 // 23
  "",                                                                         // 24
  "## Flow control",                                                          // 25
  "",                                                                         // 26
  "| Kind | Value |",                                                         // 27
  "|---|---|",                                                                // 28
  "| WIP limit | 4 |",                                                        // 29 — Value a number: the variant that holds
  "| Time box | none |",                                                      // 30 — no variant holds: Value a text
  "| Sprints | yes |",                                                        // 31 — Value one of yes, no
  "",
];
const MODEL = [...front(...MODEL_FRONT), ...MODEL_BODY].join("\n");

// ---------------------------------------------------------------- a job record (MOD-job-ledger)
//
// A job record, whose front matter lists the jobs a run started (`A RUN IS A JOB THAT NAMES ITS JOBS`): `jobs` is required for
// a run, holds at least one job, and is left out for every other kind of job.

const JOB_SCHEMA = {
  schema: "job",
  shape: "document",
  rule: "A JOB IS RECORDED IN ITS PRODUCT REPOSITORY",
  path: "docs/jobs/{id}.md",
  identifier: { field: "id", kind: "JOB" },
  frontMatter: {
    id: { type: "identifier", of: ["JOB"], required: true },
    kind: { type: "text", required: true },
    participant: { type: "text", required: true },
    jobs: { type: "list", item: { type: "identifier", of: ["JOB"] }, nonEmpty: true, rule: "A RUN IS A JOB THAT NAMES ITS JOBS",
      requiredWhen: { field: "kind", in: ["run"] }, forbiddenWhen: { field: "kind", notIn: ["run"] } },
    started: { type: "time", required: true },
  },
  sections: [{ heading: "## Inputs", required: true }],
};
const JOB_PATH = "docs/jobs/JOB-20261006-0900-a1b2.md";
const JOB_ID = "id: JOB-20261006-0900-a1b2";                               // 2
const JOB_PARTICIPANT = "participant: scrum-master-session";               // 4
const JOB_STARTED = "started: 2026-10-06 09:00 UTC";
const JOB_BODY = ["# JOB-20261006-0900-a1b2", "", "## Inputs", "", "- ITM-227", ""];
const JOB = [
  ...front(
    JOB_ID,                                                                // 2
    "kind: run",                                                           // 3
    JOB_PARTICIPANT,                                                       // 4
    "jobs:",                                                               // 5 — a list, one item per line
    "  - JOB-20261006-0905-c3d4",                                          // 6
    "  - JOB-20261006-0910-e5f6",                                          // 7
    JOB_STARTED,                                                           // 8 — after the list's items
  ),
  ...JOB_BODY,
].join("\n");

// ---------------------------------------------------------------- the precedence of the rules
//
// A resource list whose parts each name a rule of their own. The rules are names in the form of a requirement's — loadSchema
// decides the form only, not whether the SPEC holds the name (MOD-documents, Data) —, chosen to tell the parts apart.

const RULE = {
  schema: "THE SCHEMA'S RULE",
  section: "THE SECTION'S RULE",
  value: "THE VALUE'S RULE",
  variant: "THE VARIANT'S RULE",
  condition: "THE CONDITION'S RULE",
  first: "THE FIRST PART'S RULE",
  second: "THE SECOND PART'S RULE",
  combination: "THE COMBINATION'S RULE",
};

// A part of a schema naming the rule given, or no rule when none is given.
const ruled = (part, rule) => (rule ? { ...part, rule } : part);

// The resource list `docs/resources.md`: its table's Pin is required for a repository and for data — under `pinWhen`, by
// default a simple condition —, and a sha of 40 digits for a repository; its Route is left out for every kind but compute.
// `rules` gives the rules its parts name: { schema, section, value, variant, condition }.
function resourcesSchema(rules, pinWhen = ruled({ field: "Kind", in: ["repository", "data"] }, rules.condition)) {
  return ruled({
    schema: "resources",
    shape: "document",
    path: "docs/resources.md",
    sections: [ruled({ heading: "## Resources", required: true, table: { columns: [
      { name: "Name", value: { type: "text", required: true } },
      { name: "Kind", value: { type: "enum", values: ["repository", "data", "compute"], required: true } },
      { name: "Pin", value: ruled({ type: "text", requiredWhen: pinWhen,
        variants: [ruled({ when: { field: "Kind", in: ["repository"] }, type: "sha", digits: 40 }, rules.variant)] }, rules.value) },
      { name: "Route", value: ruled({ type: "text",
        forbiddenWhen: ruled({ field: "Kind", notIn: ["compute"] }, rules.condition) }, rules.value) },
    ] } }, rules.section)],
  }, rules.schema);
}
const RESOURCES_PATH = "docs/resources.md";
const RESOURCES_HEAD = [
  "# The resources of the product",                 // 1
  "",                                               // 2
  "## Resources",                                   // 3
  "",                                               // 4
  "| Name | Kind | Pin | Route |",                   // 5
  "|---|---|---|---|",                              // 6
  "| agent-m | repository | — | — |",                // 7 — Pin left out for a repository: required, the repository variant holds
  "| corpus | data | — | — |",                       // 8 — Pin left out for data: required, no variant holds
];
const RESOURCES = [
  ...RESOURCES_HEAD,
  "| docs | repository | main | — |",                // 9 — Pin given, not of the variant that holds
  "| notes | data | rev-12 | bridge |",              // 10 — a Route where Kind is not compute
  "| lab | compute | — | bridge |",                  // 11 — fits
  "",
].join("\n");
const PINS = [...RESOURCES_HEAD, ""].join("\n");

// One resource `docs/resources/<name>.md`, its pin and licence in its front matter, and a section of notes.
function resourceSchema(rules) {
  return ruled({
    schema: "resource",
    shape: "document",
    path: "docs/resources/{slug}.md",
    frontMatter: {
      kind: { type: "enum", values: ["repository", "data", "compute"], required: true },
      pin: ruled({ type: "text", requiredWhen: ruled({ field: "kind", in: ["repository", "data"] }, rules.condition),
        variants: [ruled({ when: { field: "kind", in: ["repository"] }, type: "sha", digits: 40 }, rules.variant)] }, rules.value),
      licence: ruled({ type: "text" }, rules.value),
    },
    sections: [ruled({ heading: "## Notes", required: false }, rules.section)],
    otherSections: "forbidden",
  }, rules.schema);
}
const RESOURCE_PATH = "docs/resources/agent-m.md";
const RESOURCE_NOTES = ["# agent-m", "", "## Notes", "", "The instance's own repository.", ""];

// ---------------------------------------------------------------- loadSchema: the rule

// A schema naming a rule in every place the language gives one: the schema, a front matter key's value specification, a
// section, a column's value specification, a combination of conditions and a part of it, a variant that changes the type
// and one that changes nothing but the rule, and a condition.
const RULED_SCHEMA = {
  schema: "resources",
  shape: "document",
  rule: "THE SCHEMA'S RULE",
  path: "docs/resources.md",
  frontMatter: {
    product: { type: "text", required: true, rule: "THE KEY'S RULE" },
  },
  sections: [
    { heading: "## Resources", required: true, rule: "THE SECTION'S RULE", table: { columns: [
      { name: "Kind", value: { type: "enum", values: ["repository", "data", "compute"], required: true,
        rule: "THE COLUMN'S RULE" } },
      { name: "Pin", value: { type: "text", rule: "THE VALUE'S RULE",
        requiredWhen: { any: [{ field: "Kind", in: ["repository"], rule: "THE FIRST PART'S RULE" }, { field: "Kind", in: ["data"] }],
          rule: "THE COMBINATION'S RULE" },
        variants: [
          { when: { field: "Kind", in: ["repository"] }, type: "sha", digits: 40, rule: "THE VARIANT'S RULE" },
          { when: { field: "Kind", in: ["data"] }, rule: "THE OTHER VARIANT'S RULE" },
        ] } },
      { name: "Route", value: { type: "text",
        forbiddenWhen: { field: "Kind", notIn: ["compute"], rule: "THE CONDITION'S RULE" } } },
    ] } },
  ],
};

// guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE
// given: RULED_SCHEMA — a schema file whose schema names a rule in each place the language gives one: the schema, a front
//        matter key's value specification, a section, a column's value specification, a combination of conditions and its
//        first part, a variant that changes the type, a variant that changes nothing but the rule, and a condition
// input: loadSchema(its schema file, "MOD-example")
// expect: the schema loads, and is exactly the JSON object of its file, each rule where it was written
test("loadSchema — reads the rule of a schema, a section, a value specification, a condition and a variant", () => {
  const schema = load(RULED_SCHEMA);
  assert.deepEqual(schema, RULED_SCHEMA);
  assert.equal(schema.rule, "THE SCHEMA'S RULE");
  assert.equal(schema.sections[0].table.columns[1].value.requiredWhen.any[0].rule, "THE FIRST PART'S RULE");
  assert.equal(schema.sections[0].table.columns[1].value.variants[1].rule, "THE OTHER VARIANT'S RULE");
});

// Each place of a rule in RULED_SCHEMA: [the place, the part that names it, the key SchemaError names].
const PIN = "sections[0].table.columns[1].value";
const RULE_PLACES = [
  ["the schema", (s) => s, "rule"],
  ["a front matter key's value specification", (s) => s.frontMatter.product, "frontMatter.product.rule"],
  ["a section", (s) => s.sections[0], "sections[0].rule"],
  ["a column's value specification", (s) => s.sections[0].table.columns[0].value, "sections[0].table.columns[0].value.rule"],
  ["a combination of conditions", (s) => s.sections[0].table.columns[1].value.requiredWhen, `${PIN}.requiredWhen.rule`],
  ["a part of a combination", (s) => s.sections[0].table.columns[1].value.requiredWhen.any[0], `${PIN}.requiredWhen.any[0].rule`],
  ["a variant", (s) => s.sections[0].table.columns[1].value.variants[0], `${PIN}.variants[0].rule`],
  ["a variant that changes nothing but the rule", (s) => s.sections[0].table.columns[1].value.variants[1],
    `${PIN}.variants[1].rule`],
  ["a condition", (s) => s.sections[0].table.columns[2].value.forbiddenWhen,
    "sections[0].table.columns[2].value.forbiddenWhen.rule"],
];
// Rules that are not a requirement's name in capitals.
const NOT_NAMES = [
  ["a name in small letters", "the schema's rule"],
  ["an identifier", "UC-002"],
  ["an empty text", ""],
  ["a number", 7],
  ["a name with a blank at its end", "THE SCHEMA'S RULE "],
];

// guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE
// given: known positive first — RULED_SCHEMA loads; then RULED_SCHEMA with the rule of one of its nine places — the schema, a
//        front matter key's value specification, a section, a column's value specification, a combination of conditions, a
//        part of it, a variant, a variant that changes nothing but the rule, a condition — replaced by one that is not a
//        requirement's name in capitals: a name in small letters, an identifier UC-002, an empty text, the number 7, a name
//        with a blank at its end
// input: loadSchema(the schema file, "MOD-example"), for each place and each such rule
// expect: each throws a SchemaError whose `key` is the place's key — `rule`, `frontMatter.product.rule`, `sections[0].rule`,
//         `sections[0].table.columns[1].value.requiredWhen.any[0].rule`, … — and whose `owner` is MOD-example, its message
//         naming both
test("loadSchema — a rule that is not a requirement's name in capitals is refused with SchemaError naming its key", () => {
  assert.doesNotThrow(() => load(RULED_SCHEMA), "known positive");
  for (const [place, part, key] of RULE_PLACES) {
    for (const [what, rule] of NOT_NAMES) {
      const broken = copy(RULED_SCHEMA);
      part(broken).rule = rule;
      assert.throws(() => load(broken, "MOD-example"),
        (e) => e.name === "SchemaError" && e.key === key && e.owner === "MOD-example" && e.message.includes(key)
          && e.message.includes("MOD-example"),
        `${what} as the rule of ${place}: SchemaError naming ${key}`);
    }
  }
});

// ---------------------------------------------------------------- documentFindings: each kind of finding, with its line

// guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE
// given: three documents that fit their schemas: the participant register, the process model and the job record
// input: documentFindings(schema, readDocument(schema, path, text)) for each
// expect: no finding
test("documentFindings — a document that fits its schema has no finding", () => {
  assert.deepEqual(findingsOf(PARTICIPANTS_SCHEMA, "docs/participants.md", PARTICIPANTS), []);
  assert.deepEqual(findingsOf(MODEL_SCHEMA, MODEL_PATH, MODEL), []);
  assert.deepEqual(findingsOf(JOB_SCHEMA, JOB_PATH, JOB), []);
});

// guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE
// given: known positive first — MODEL has no finding; then the model whose front matter has no `name`, a key `owner` the
//        format does not list (line 3), and `adapted_from` after `measure` (line 5), which the format puts after it — every
//        other key in the format's order
// input: documentFindings of it, each finding in its text form
// expect: three errors, in the order of their lines, each naming the schema's own rule, since no part closer to them names
//         one — `name` missing on line 1; `owner` unknown on line 3; `adapted_from` out of order on line 5
test("documentFindings — front matter keys missing, unknown and out of order", () => {
  assert.deepEqual(findingsOf(MODEL_SCHEMA, MODEL_PATH, MODEL), [], "known positive");
  const text = [...front("kind: pulled", "owner: akmaier", "measure: items per state over time", "adapted_from: scrum"),
    ...MODEL_BODY].join("\n");
  assert.deepEqual(findingsOf(MODEL_SCHEMA, MODEL_PATH, text), [
    "docs/process-models/scrum-wip.md:1: error: the key name is required, and left out "
      + "[A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED] — give the key name a value.",
    "docs/process-models/scrum-wip.md:3: error: the key owner is not a key of the format model "
      + "[A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED] — remove the key owner, or use one the format lists: name, kind, "
      + "adapted_from, measure.",
    "docs/process-models/scrum-wip.md:5: error: the key adapted_from stands after the key measure, which the format model puts "
      + "after it [A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED] — put the keys in the order of the format: name, kind, "
      + "adapted_from, measure.",
  ]);
});

// guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE
// given: known positive first — JOB, a run whose `jobs` lists two jobs, has no finding; then the job record changed in one
//        place each: a run without `jobs` (required where kind is run); a run whose `jobs` lists nothing (nonEmpty); a job of
//        kind implement that lists jobs (left out where kind is not run); `started: yesterday`, which is no time — the key
//        stands on line 8, after the list's two items
// input: documentFindings of each, each finding in its text form, its artifact the record's identifier
// expect: one error each — line 1 for the key that is missing, else the line of its key —, the first three naming the rule of
//         `jobs`' value specification, since its conditions name none, the fourth the schema's own:
//         `JOB-20261006-0900-a1b2:1: error: the key jobs is required where kind is run, and left out
//         [A RUN IS A JOB THAT NAMES ITS JOBS] — give the key jobs a value.` and the three below
test("documentFindings — front matter values: required or forbidden by a condition, empty where nonEmpty, not of their type", () => {
  assert.deepEqual(findingsOf(JOB_SCHEMA, JOB_PATH, JOB), [], "known positive");
  const job = (...lines) => [...front(...lines), ...JOB_BODY].join("\n");
  assert.deepEqual(findingsOf(JOB_SCHEMA, JOB_PATH, job(JOB_ID, "kind: run", JOB_PARTICIPANT, JOB_STARTED)), [
    "JOB-20261006-0900-a1b2:1: error: the key jobs is required where kind is run, and left out "
      + "[A RUN IS A JOB THAT NAMES ITS JOBS] — give the key jobs a value.",
  ]);
  assert.deepEqual(findingsOf(JOB_SCHEMA, JOB_PATH, job(JOB_ID, "kind: run", JOB_PARTICIPANT, "jobs:", JOB_STARTED)), [
    "JOB-20261006-0900-a1b2:5: error: the key jobs does not fit: the list is empty, and it holds at least one item "
      + "[A RUN IS A JOB THAT NAMES ITS JOBS] — correct the value of the key jobs.",
  ]);
  assert.deepEqual(findingsOf(JOB_SCHEMA, JOB_PATH, JOB.replace("kind: run", "kind: implement")), [
    "JOB-20261006-0900-a1b2:5: error: the key jobs is left out where kind is not run, and it is "
      + "[\"JOB-20261006-0905-c3d4\",\"JOB-20261006-0910-e5f6\"] [A RUN IS A JOB THAT NAMES ITS JOBS] — remove the key jobs.",
  ]);
  assert.deepEqual(findingsOf(JOB_SCHEMA, JOB_PATH, JOB.replace(JOB_STARTED, "started: yesterday")), [
    "JOB-20261006-0900-a1b2:8: error: the key started does not fit: \"yesterday\" is not a time in ISO 8601 with its offset, "
      + "or YYYY-MM-DD HH:MM UTC [A JOB IS RECORDED IN ITS PRODUCT REPOSITORY] — correct the value of the key started.",
  ]);
});

// guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE
// given: known positive first — MODEL has no finding; then the model with `kind: agile` (line 3), not planned or pulled; and
//        the model of kind pulled with `measure: plan entries per phase` (line 5), which the variant for pulled work does not
//        allow
// input: documentFindings of each, each finding in its text form, its artifact the model's path
// expect: one error each: `kind` on line 3, naming the schema's own rule, since neither `kind` nor a variant names one; and
//         `measure` on line 5, naming the rule of its value specification, since the variant that holds names none
test("documentFindings — front matter values not of their type, and not of the variant that holds", () => {
  assert.deepEqual(findingsOf(MODEL_SCHEMA, MODEL_PATH, MODEL), [], "known positive");
  assert.deepEqual(findingsOf(MODEL_SCHEMA, MODEL_PATH, MODEL.replace("kind: pulled", "kind: agile")), [
    "docs/process-models/scrum-wip.md:3: error: the key kind does not fit: \"agile\" is not one of planned, pulled "
      + "[A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED] — correct the value of the key kind.",
  ]);
  assert.deepEqual(findingsOf(MODEL_SCHEMA, MODEL_PATH,
    MODEL.replace("measure: items per state over time", "measure: plan entries per phase")), [
    "docs/process-models/scrum-wip.md:5: error: the key measure does not fit: \"plan entries per phase\" is not one of "
      + "remaining items per time box, items per state over time [PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE] — correct the "
      + "value of the key measure.",
  ]);
});

// guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE
// given: known positive first — PARTICIPANTS has no finding; then PARTICIPANTS_BROKEN: a person with a model (row 9); a CLI
//        agent without its model and its processing place, whose context is `many` (row 10); a participant of type `robot`
//        without capabilities or a route (row 11); a person without a name (row 12)
// input: documentFindings of it, each finding in its text form
// expect: eight errors, each on its row's line, in the order of the rows and, within a row, of the columns, each naming the
//         closest rule: the person's Model, left out where Type is person — the schema's own, since neither the condition,
//         the column nor the section names one; the agent's Model, required where Type is not person — the condition's;
//         Context, no number — the schema's; the processing place — the column's; Type — the column's; Capabilities — the
//         column's; Route and Name, each required — the schema's
test("documentFindings — each row of a table, cell by cell: required or forbidden by a condition, not of its type", () => {
  assert.deepEqual(findingsOf(PARTICIPANTS_SCHEMA, "docs/participants.md", PARTICIPANTS), [], "known positive");
  assert.deepEqual(findingsOf(PARTICIPANTS_SCHEMA, "docs/participants.md", PARTICIPANTS_BROKEN), [
    "docs/participants.md:9: error: the column Model is left out where Type is person, and it is \"example-model\" "
      + "[PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE] — leave the column Model of this row empty.",
    "docs/participants.md:10: error: the column Model is required where Type is not person, and left out "
      + "[A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL] — fill in the column Model of this row.",
    "docs/participants.md:10: error: the column Context does not fit: \"many\" is not a number "
      + "[PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE] — correct the column Context of this row.",
    "docs/participants.md:10: error: the column Processing place is required where Type is not person, and left out "
      + "[A PARTICIPANT DECLARES WHERE IT PROCESSES DATA] — fill in the column Processing place of this row.",
    "docs/participants.md:11: error: the column Type does not fit: \"robot\" is not one of person, model endpoint, CI agent, "
      + "CLI agent, sandboxed agent [A PARTICIPANT HAS ONE OF FIVE TYPES] — correct the column Type of this row.",
    "docs/participants.md:11: error: the column Capabilities is required, and left out "
      + "[A PARTICIPANT DECLARES ITS CAPABILITIES] — fill in the column Capabilities of this row.",
    "docs/participants.md:11: error: the column Route is required, and left out "
      + "[PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE] — fill in the column Route of this row.",
    "docs/participants.md:12: error: the column Name is required, and left out "
      + "[PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE] — fill in the column Name of this row.",
  ]);
});

// guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE
// given: known positive first — the register as read has no finding; then the same register whose second participant's
//        Capabilities a form emptied: an empty list, where the column holds at least one item (nonEmpty)
// input: documentFindings(the register's schema, the register)
// expect: one error on that participant's row, line 10, naming the column's rule
test("documentFindings — a cell empty where nonEmpty", () => {
  const schema = load(PARTICIPANTS_SCHEMA);
  const register = readDocument(schema, "docs/participants.md", PARTICIPANTS);
  assert.deepEqual(documentFindings(schema, register), [], "known positive");
  register.sections[0].rows[1].cells.Capabilities = [];
  assert.deepEqual(documentFindings(schema, register).map(formatFinding), [
    "docs/participants.md:10: error: the column Capabilities does not fit: the list is empty, and it holds at least one item "
      + "[A PARTICIPANT DECLARES ITS CAPABILITIES] — correct the column Capabilities of this row.",
  ]);
});

// guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE
// given: known positive first — MODEL has no finding; then the model whose ## Phases has a row without its Role (line 15) and
//        one without its Name (line 16), and whose ## Flow control has `four` under WIP limit (line 29), where the variant for
//        WIP limit asks for a number, and `maybe` under Sprints (line 31), where the variant for Sprints asks for yes or no
// input: documentFindings of it, each finding in its text form
// expect: four errors, each on its row's line: Role — the column's rule; Name — the section's, since the column names none;
//         WIP limit's Value — the variant's; Sprints' Value — the section's, since neither the variant nor the column names one
test("documentFindings — cells not of the variant that holds for their row, and each cell's closest rule", () => {
  assert.deepEqual(findingsOf(MODEL_SCHEMA, MODEL_PATH, MODEL), [], "known positive");
  const text = MODEL.replace("| Sprint planning | Product Owner | ITM |", "| Sprint planning | — | ITM |")
    .replace("| Development | Developers | MOD, TST |", "| — | Developers | MOD, TST |")
    .replace("| WIP limit | 4 |", "| WIP limit | four |")
    .replace("| Sprints | yes |", "| Sprints | maybe |");
  assert.deepEqual(findingsOf(MODEL_SCHEMA, MODEL_PATH, text), [
    "docs/process-models/scrum-wip.md:15: error: the column Role is required, and left out "
      + "[A PROCESS MODEL ORGANISES PEOPLE AND AGENTS] — fill in the column Role of this row.",
    "docs/process-models/scrum-wip.md:16: error: the column Name is required, and left out "
      + "[THE MODEL DETERMINES THE PHASES AND THE GATES] — fill in the column Name of this row.",
    "docs/process-models/scrum-wip.md:29: error: the column Value does not fit: \"four\" is not a number "
      + "[NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT] — correct the column Value of this row.",
    "docs/process-models/scrum-wip.md:31: error: the column Value does not fit: \"maybe\" is not one of yes, no "
      + "[A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT] — correct the column Value of this row.",
  ]);
});

// The sections of the model in another order: ## Flow control (line 11) before the others.
const FLOW_CONTROL = [
  "## Flow control",       // 11
  "",                      // 12
  "| Kind | Value |",       // 13
  "|---|---|",              // 14
  "| WIP limit | 4 |",      // 15
  "",                      // 16
];

// guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE
// given: known positive first — MODEL has no finding; then two models whose sections stand otherwise:
//        - ## Flow control, ## Phases (line 17), ## Notes (line 24): ## Transitions missing, ## Phases after ## Flow control,
//          which the format puts after it, and ## Notes, a section the format does not name, where it allows no other;
//        - ## Flow control, ## Transitions (line 17): ## Phases missing, ## Transitions after ## Flow control
// input: documentFindings of each, each finding in its text form
// expect: the first: ## Transitions missing on line 1, naming the schema's rule, since the section names none; ## Phases out
//         of order on line 17, naming the section's rule; ## Notes on line 24, the schema's. The second: ## Phases missing on
//         line 1, naming its rule; ## Transitions out of order on line 17, naming the schema's
test("documentFindings — required sections missing, sections out of order, and a section the schema forbids", () => {
  assert.deepEqual(findingsOf(MODEL_SCHEMA, MODEL_PATH, MODEL), [], "known positive");
  const order = "put the sections in the order of the format: ## Phases, ## Transitions, ## Flow control.";
  const first = [...front(...MODEL_FRONT), ...MODEL_TITLE, ...FLOW_CONTROL,
    "## Phases",                                    // 17
    "",                                             // 18
    "| Name | Role | Produces |",                   // 19
    "|---|---|---|",                                // 20
    "| Sprint planning | Product Owner | ITM |",     // 21
    "| Development | Developers | MOD, TST |",       // 22
    "",                                             // 23
    "## Notes",                                     // 24
    "",                                             // 25
    "Sprints end when every selected item is done.", // 26
    "",
  ].join("\n");
  assert.deepEqual(findingsOf(MODEL_SCHEMA, MODEL_PATH, first), [
    "docs/process-models/scrum-wip.md:1: error: the section ## Transitions is required, and missing "
      + "[A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED] — add the section ## Transitions.",
    "docs/process-models/scrum-wip.md:17: error: the section ## Phases stands after the section ## Flow control, which the "
      + `format model puts after it [THE MODEL DETERMINES THE PHASES AND THE GATES] — ${order}`,
    "docs/process-models/scrum-wip.md:24: error: the section ## Notes is not a section of the format model, which allows no "
      + "other [A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED] — remove the section ## Notes, or move its text into a "
      + "section the format names: ## Phases, ## Transitions, ## Flow control.",
  ]);
  const second = [...front(...MODEL_FRONT), ...MODEL_TITLE, ...FLOW_CONTROL,
    "## Transitions",                               // 17
    "",                                             // 18
    "| From | To | Kind |",                         // 19
    "|---|---|---|",                                // 20
    "| Sprint planning | Development | sequence |", // 21
    "",
  ].join("\n");
  assert.deepEqual(findingsOf(MODEL_SCHEMA, MODEL_PATH, second), [
    "docs/process-models/scrum-wip.md:1: error: the section ## Phases is required, and missing "
      + "[THE MODEL DETERMINES THE PHASES AND THE GATES] — add the section ## Phases.",
    "docs/process-models/scrum-wip.md:17: error: the section ## Transitions stands after the section ## Flow control, which "
      + `the format model puts after it [A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED] — ${order}`,
  ]);
});

// guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE
// given: the model with a section ## Notes after its last one (line 33); known positive first — under the model's schema with
//        `otherSections` allowed, it has no finding; then under the model's schema, which forbids other sections
// input: documentFindings of it under each schema
// expect: none under the first; under the second one error on line 33, naming the schema's own rule
test("documentFindings — a section the schema does not name is a finding only where the schema forbids other sections", () => {
  const notes = `${MODEL}\n## Notes\n\nSprints end when every selected item is done.\n`;
  assert.deepEqual(findingsOf({ ...MODEL_SCHEMA, otherSections: "allowed" }, MODEL_PATH, notes), [], "known positive");
  assert.deepEqual(findingsOf(MODEL_SCHEMA, MODEL_PATH, notes), [
    "docs/process-models/scrum-wip.md:33: error: the section ## Notes is not a section of the format model, which allows no "
      + "other [A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED] — remove the section ## Notes, or move its text into a "
      + "section the format names: ## Phases, ## Transitions, ## Flow control.",
  ]);
});

// ---------------------------------------------------------------- documentFindings: the requirement each finding names

// guards: A FINDING READS LIKE A COMPILER MESSAGE
// given: RESOURCES, read under the resource list's schema with the rules of its parts given, then taken away one by one from
//        the closest outwards; its rows: a repository without its Pin (line 7) — required by the condition, and the
//        repository variant holds —; data without its Pin (line 8) — required, and no variant holds —; a repository whose
//        Pin `main` is no sha (line 9) — given, so no condition requires or forbids it —; data with a Route (line 10) —
//        left out by the condition for every kind but compute —; and compute with a Route (line 11), which fits
// input: the line and the rule of each finding
// expect: with every rule — the condition's on lines 7, 8 and 10, the variant's on line 9;
//         without the condition's — the variant's on lines 7 and 9, the value specification's on lines 8 and 10;
//         without the variant's too — the value specification's on each line;
//         without the value specification's too — the section's on each line;
//         with the schema's alone — the schema's on each line
test("documentFindings — a value's finding names the condition's rule, then the variant's, the value's, the section's, the schema's", () => {
  const { condition, variant, value, section, schema } = RULE;
  const rules = (given) => rulesOf(resourcesSchema(given), RESOURCES_PATH, RESOURCES);
  assert.deepEqual(rules({ condition, variant, value, section, schema }),
    [[7, condition], [8, condition], [9, variant], [10, condition]]);
  assert.deepEqual(rules({ variant, value, section, schema }), [[7, variant], [8, value], [9, variant], [10, value]]);
  assert.deepEqual(rules({ value, section, schema }), [[7, value], [8, value], [9, value], [10, value]]);
  assert.deepEqual(rules({ section, schema }), [[7, section], [8, section], [9, section], [10, section]]);
  assert.deepEqual(rules({ schema }), [[7, schema], [8, schema], [9, schema], [10, schema]]);
});

// guards: A FINDING READS LIKE A COMPILER MESSAGE
// given: PINS — a repository (line 7) and data (line 8), each without its Pin —, read under the resource list's schema with
//        the rules of the variant, the value specification, the section and the schema, and Pin required under a combination
//        of conditions:
//        - any of: Kind is repository (the first part), Kind is data (the second part);
//        - all of: Kind is not compute (the first part), Kind is repository or data (the second part);
//        each with the rules of its parts and of the combination given, then taken away one by one
// input: the line and the rule of each finding
// expect: of combined conditions, the first part that holds and names a rule, before the combination's own:
//         any — with every rule, the first part's on line 7, the second part's on line 8, where the first does not hold;
//         without the first part's, the combination's on line 7, where the second does not hold, the second part's on line 8;
//         without both parts' rules, the combination's on both; without the combination's too, the variant's on line 7 and
//         the value specification's on line 8, where no variant holds;
//         all — with every rule, the first part's on both; without the first part's, the second part's; without both, the
//         combination's
test("documentFindings — of combined conditions, the first part that holds and names a rule, before the combination's", () => {
  const { variant, value, section, schema, first, second, combination } = RULE;
  const others = { variant, value, section, schema };
  const rules = (pinWhen) => rulesOf(resourcesSchema(others, pinWhen), RESOURCES_PATH, PINS);
  const any = (a, b, c) => ruled({ any: [ruled({ field: "Kind", in: ["repository"] }, a), ruled({ field: "Kind", in: ["data"] }, b)] }, c);
  const all = (a, b, c) => ruled({ all: [ruled({ field: "Kind", notIn: ["compute"] }, a),
    ruled({ field: "Kind", in: ["repository", "data"] }, b)] }, c);
  assert.deepEqual(rules(any(first, second, combination)), [[7, first], [8, second]]);
  assert.deepEqual(rules(any(undefined, second, combination)), [[7, combination], [8, second]]);
  assert.deepEqual(rules(any(undefined, undefined, combination)), [[7, combination], [8, combination]]);
  assert.deepEqual(rules(any(undefined, undefined, undefined)), [[7, variant], [8, value]]);
  assert.deepEqual(rules(all(first, second, combination)), [[7, first], [8, first]]);
  assert.deepEqual(rules(all(undefined, second, combination)), [[7, second], [8, second]]);
  assert.deepEqual(rules(all(undefined, undefined, combination)), [[7, combination], [8, combination]]);
});

// guards: A FINDING READS LIKE A COMPILER MESSAGE
// given: a resource `docs/resources/agent-m.md` of kind repository without its pin, which its front matter requires for a
//        repository, read under the resource's schema with the rules of the condition, the variant, the value
//        specification, its section ## Notes and the schema given, then taken away one by one from the closest outwards
// input: the line and the rule of its finding
// expect: one finding, on line 1: the condition's rule; without it, the variant's; without that, the value specification's;
//         without that, the schema's — never the section's, since a key of the front matter stands in no section
test("documentFindings — a front matter value's finding names the condition's rule, the variant's, the value's, the schema's", () => {
  const { condition, variant, value, section, schema } = RULE;
  const text = [...front("kind: repository"), ...RESOURCE_NOTES].join("\n");
  const rules = (given) => rulesOf(resourceSchema(given), RESOURCE_PATH, text);
  assert.deepEqual(rules({ condition, variant, value, section, schema }), [[1, condition]]);
  assert.deepEqual(rules({ variant, value, section, schema }), [[1, variant]]);
  assert.deepEqual(rules({ value, section, schema }), [[1, value]]);
  assert.deepEqual(rules({ section, schema }), [[1, schema]]);
});

// guards: A FINDING READS LIKE A COMPILER MESSAGE
// given: known positive first — the resource whose front matter is in the format's order has no finding; then the resource
//        whose `pin` (line 4) stands after `licence`, which the format puts after it, with a key `owner` (line 5) the format
//        does not list, and a section ## Links (line 13) the format does not name, where it allows no other — under the
//        resource's schema with every rule given: `pin`'s condition, variant and value specification, the section ## Notes
//        and the schema each name one
// input: the line and the rule of each finding
// expect: three findings, each naming the schema's own rule: the key out of order on line 4, not `pin`'s own; the unknown key
//         on line 5; the forbidden section on line 13, not the rule of the section ## Notes
test("documentFindings — a key the schema does not list, keys out of order and a forbidden section name the schema's rule", () => {
  const { condition, variant, value, section, schema } = RULE;
  const every = resourceSchema({ condition, variant, value, section, schema });
  const sha = "pin: 4c60cfe5a8bc8c00dcf6705b5decb42823b73a63";
  const ordered = [...front("kind: repository", sha, "licence: MIT"), ...RESOURCE_NOTES].join("\n");
  assert.deepEqual(rulesOf(every, RESOURCE_PATH, ordered), [], "known positive");
  const misplaced = [
    ...front("kind: repository", "licence: MIT", sha, "owner: akmaier"),   // 1–6, `pin` on line 4, `owner` on line 5
    ...RESOURCE_NOTES,                                                     // 7–12
    "## Links",                                                            // 13
    "",                                                                    // 14
    "The repository's mirror.",                                            // 15
    "",
  ].join("\n");
  assert.deepEqual(rulesOf(every, RESOURCE_PATH, misplaced), [[4, schema], [5, schema], [13, schema]]);
});
