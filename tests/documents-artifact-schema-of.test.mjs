// The schema a path names (ITM-378) — MOD-documents' artifactSchemaOf, as the accepted text of docs/architecture/MOD-documents.md
// states it under Interfaces: "the one of these four schemas whose path pattern the path matches, with the placeholders as the
// schema language defines them and as documentFindings matches a path, or null".
// Run: node --test tests/documents-artifact-schema-of.test.mjs
//
// Module: MOD-documents
// Guards: UC-007; UC-019; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; DON'T REPEAT YOURSELF
// Level: unit
//
// The four schemas are those artifactSchemas() gives, and an answer is the schema itself, not a copy of it. The paths are
// written here as the module file's Data states the schemas' paths — docs/use-cases/UC-{nnn}-{slug}.md,
// docs/architecture/ARC-{nnn}-{slug}.md, docs/architecture/MOD-{slug}.md, docs/plan/ITM-{nnn}-{slug}.md and
// docs/backlog/ITM-{nnn}-{slug}.md —, `{nnn}` being three or more digits and `{slug}` lower-case words joined by `-`. Each test
// states its input and its expected result before it runs (given / input / expect); where a test expects null, the same call
// is first shown to give a schema for a path that matches. Nothing is read from a file or from the network.

import test from "node:test";
import assert from "node:assert/strict";
import { artifactSchemaOf, artifactSchemas } from "../src/documents/index.mjs";

const { useCase, decision, module, item } = artifactSchemas();
const USE_CASE = "docs/use-cases/UC-007-derive-use-cases-from-requirements.md";

// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; DON'T REPEAT YOURSELF
// given: the four schemas of artifactSchemas(), and a path for each of four files — a use case, an architecture decision, a
//        module file and a backlog item —, each written as its schema's path states
// input: artifactSchemaOf of each path
// expect: the use-case schema for the use case, the decision schema for the decision, the module schema for the module file and
//         the item schema for the backlog item — each the very schema artifactSchemas() holds
test("artifactSchemaOf — a use case, a decision, a module file and a backlog item path each give their schema", () => {
  const cases = [
    ["a use case", USE_CASE, useCase, "use-case"],
    ["an architecture decision", "docs/architecture/ARC-048-the-artifact-model.md", decision, "decision"],
    ["a module file", "docs/architecture/MOD-identifiers.md", module, "module"],
    ["a backlog item", "docs/backlog/ITM-378-the-schema-a-drafted-files-path-names.md", item, "item"],
  ];
  for (const [label, path, schema, name] of cases) {
    const found = artifactSchemaOf(path);
    assert.equal(found?.schema, name, `${label}: ${path} gives the ${name} schema`);
    assert.equal(found, schema, `${label}: the schema is the one artifactSchemas() holds`);
  }
});

// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; DON'T REPEAT YOURSELF
// given: the item schema, which names two paths — a step of the plan, docs/plan/ITM-{nnn}-{slug}.md, and an item of the
//        backlog; a plan step's path, and — known positive — the backlog item's path of the same name
// input: artifactSchemaOf of each
// expect: the item schema both times: a plan step is read by the schema of an item
test("artifactSchemaOf — a plan step's path gives the item schema, as a backlog item's path does", () => {
  const backlog = "docs/backlog/ITM-012-store-the-drafts.md", plan = "docs/plan/ITM-012-store-the-drafts.md";
  assert.equal(artifactSchemaOf(backlog), item, "known positive: a backlog item's path gives the item schema");
  assert.equal(artifactSchemaOf(plan), item, "a plan step's path gives the item schema");
});

// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; DON'T REPEAT YOURSELF
// given: known positive first — a use case's path —; then three paths under docs/ that no schema's pattern matches: a
//        measurement, the README of the folder of the use cases, and a sprint's record in the folder of the backlog
// input: artifactSchemaOf of each
// expect: the use-case schema for the known positive; null for each of the three
test("artifactSchemaOf — a path under docs/ that no pattern matches gives null", () => {
  assert.equal(artifactSchemaOf(USE_CASE), useCase, "known positive: a use case's path gives the use-case schema");
  const unmatched = ["docs/measurements/2026-10-01_group-files.md", "docs/use-cases/README.md",
    "docs/backlog/sprints/team1/14.md"];
  for (const path of unmatched) {
    assert.equal(artifactSchemaOf(path), null, `${path} matches no pattern`);
  }
});

// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; DON'T REPEAT YOURSELF
// given: known positive first — a use case's path —; then nine paths, each a near miss of a pattern: UC-07 with two digits
//        where {nnn} is three or more, a capital in a use case's slug and in a module's, one folder more and one in front,
//        another extension and text after the extension, a use case's file name in the architecture folder, and a backlog
//        item with no slug
// input: artifactSchemaOf of each
// expect: the use-case schema for the known positive; null for each of the nine: a pattern matches the whole path
test("artifactSchemaOf — a pattern's near miss gives null", () => {
  assert.equal(artifactSchemaOf(USE_CASE), useCase, "known positive: a use case's path gives the use-case schema");
  const nearMisses = [
    ["two digits where {nnn} is three or more", "docs/use-cases/UC-07-derive-use-cases-from-requirements.md"],
    ["a capital in a use case's slug", "docs/use-cases/UC-007-Derive-Use-Cases.md"],
    ["a capital in a module's slug", "docs/architecture/MOD-Identifiers.md"],
    ["one folder more", "docs/use-cases/old/UC-007-derive-use-cases-from-requirements.md"],
    ["one folder in front", "drafts/docs/use-cases/UC-007-derive-use-cases-from-requirements.md"],
    ["another extension", "docs/use-cases/UC-007-derive-use-cases-from-requirements.txt"],
    ["text after the extension", "docs/use-cases/UC-007-derive-use-cases-from-requirements.md.bak"],
    ["a use case's file name in the architecture folder", "docs/architecture/UC-007-derive-use-cases-from-requirements.md"],
    ["a backlog item with no slug", "docs/backlog/ITM-378.md"],
  ];
  for (const [label, path] of nearMisses) {
    assert.equal(artifactSchemaOf(path), null, `${label}: ${path}`);
  }
});
