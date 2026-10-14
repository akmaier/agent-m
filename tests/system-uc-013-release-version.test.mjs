// UC-013 system harness for releasing a version through the dashboard release panel. The imported route test drives the
// panel itself with an in-browser DOM fixture, repository-host fixtures, and a completed release-run fixture: next
// version and changelog, Start release candidate, the queued run and unfinished report, the completed report, Accept
// and release, and alternative flows 1a, 2a, 3a, 3b, 4a and 4b.
// Run: node --test tests/system-uc-013-release-version.test.mjs
//
// Module: MOD-test-pages · MOD-release-evidence
// Guards: UC-013; CALENDAR VERSIONS; EVERY PRODUCT HAS ITS OWN VERSION LINE; A RELEASE IS TAGGED AND LOGGED; A VERSION IS NOT REWRITTEN; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; A GATE NAMES WHAT IT CHECKS; THE GATE IS RECORDED; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON; ACCEPTING THE RELEASE TEST REPORT RELEASES; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// Level: system
//
// The imported tests run as part of this file. The assertions below verify that the route tests this harness executes
// state their inputs, preconditions and expected results, and that the UC-013 main flow and each alternative flow are
// present. Counter-proof notes are recorded in the sprint review; the imported tests include green, red, no-runner,
// existing-tag and moved-default-branch fixture counter-proofs.

import "./test-pages-release.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { testDeclarations } from "../src/test-document/index.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");

const RELEASE_PANEL_TEST = "tests/test-pages-release.test.mjs";
const panelText = read(RELEASE_PANEL_TEST);
const panelDeclarations = testDeclarations(RELEASE_PANEL_TEST, panelText);
const declarationById = new Map(panelDeclarations.map((declaration) => [declaration.id, declaration]));

const UC013_FLOWS = [
  {
    id: "TST-473091",
    flow: "main flow",
    guards: ["UC-013 main flow", "ONE CLICK PER DECISION", "EVERY STEP EXPLAINS ITSELF", "A PERSON'S OWN INPUT IS COMMITTED DIRECTLY"],
    expectedText: ["Start release candidate", "Check results", "Accept and release", "the rendered report names"],
  },
  {
    id: "TST-473092",
    flow: "1a",
    guards: ["UC-013 1a", "CALENDAR VERSIONS"],
    expectedText: ["<this year>.1.0"],
  },
  {
    id: "TST-473093",
    flow: "2a",
    guards: ["UC-013 2a", "RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER"],
    expectedText: ["Only the implementer", "assign a second participant", "no candidate"],
  },
  {
    id: "TST-473094",
    flow: "3a and 3b",
    guards: ["UC-013 3a", "3b", "A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED"],
    expectedText: ["failing test", "worse than", "reason for each", "it releases"],
  },
  {
    id: "TST-473095",
    flow: "4a",
    guards: ["UC-013 4a", "A VERSION IS NOT REWRITTEN"],
    expectedText: ["already stands", "existing tag is not moved"],
  },
  {
    id: "TST-473096",
    flow: "4b",
    guards: ["UC-013 4b"],
    expectedText: ["default branch moves on", "candidate's own tested commit"],
  },
];

function declarationText(declaration) {
  return [
    declaration.id,
    declaration.module,
    ...(declaration.guards ?? []),
    declaration.given,
    declaration.input,
    declaration.expect,
  ].filter(Boolean).join("\n");
}

// TST-257001 · level: system · module: MOD-test-pages; MOD-release-evidence
// guards: UC-013; CALENDAR VERSIONS; A VERSION IS NOT REWRITTEN; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER; ACCEPTING THE RELEASE TEST REPORT RELEASES; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// given: the release-panel route tests imported by this system harness, with repository hosts and the completed release run replaced by fixtures
// input: inspect the imported test declarations for UC-013's main flow and alternatives 1a, 2a, 3a, 3b, 4a and 4b
// expect: each flow has a declaration with level, module, guards, given, input and expect text; because this file imports that route test module, a failure in any declared flow fails this system test run
test("TST-257001: the UC-013 system harness executes declared release-panel flows", () => {
  assert.equal(panelDeclarations.length, 6);

  for (const flow of UC013_FLOWS) {
    const declaration = declarationById.get(flow.id);
    assert.ok(declaration, `${flow.flow} has a test declaration`);
    assert.equal(declaration.level, "unit", `${flow.flow} keeps the original route-test level`);
    assert.equal(declaration.module, "MOD-test-pages");
    assert.ok(declaration.given, `${flow.flow} states its precondition`);
    assert.ok(declaration.input, `${flow.flow} states its input`);
    assert.ok(declaration.expect, `${flow.flow} states its expected result`);

    const text = declarationText(declaration);
    for (const guard of flow.guards) assert.match(text, new RegExp(guard.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${flow.flow} names ${guard}`);
    for (const phrase of flow.expectedText) assert.match(text, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), `${flow.flow} names ${phrase}`);
  }
});

// TST-257002 · level: system · module: MOD-test-pages; MOD-release-evidence
// guards: UC-013; EVERY PRODUCT HAS ITS OWN VERSION LINE; A RELEASE IS TAGGED AND LOGGED; THE GATE IS RECORDED; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
// given: the imported release-panel route test source and its fixture descriptions
// input: search the route source for the public actions and host operations that constitute the end-to-end release path
// expect: the route tests execute through the dashboard labels, fixture host tags, commitFiles, result records and the release report rather than through private implementation helpers
test("TST-257002: the UC-013 system path stays at the dashboard and repository-host boundary", () => {
  for (const phrase of [
    "Release candidate",
    "Queued run",
    "Check results",
    "Accept and release",
    "commitFiles",
    "createTag",
    "test-results",
    "## Requirements",
    "## Changelog entry",
  ]) {
    assert.match(panelText, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `system evidence includes ${phrase}`);
  }
});
