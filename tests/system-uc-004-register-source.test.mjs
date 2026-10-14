// System coverage for UC-004 Register a requirement source in the library. This guard ties the use-case path to
// executable Library, source-register and workflow-entry evidence.
// Run: node --test tests/system-uc-004-register-source.test.mjs
//
// Module: MOD-settings-pages; MOD-source-register; MOD-workflow-entries
// Guards: UC-004
// Level: system
//
// Input: UC-004 as committed text and the executable evidence files named below.
// Precondition: ITM-350, ITM-401 and ITM-402 are present on main.
// Expected result: the main flow and alternatives 4a, 4b, 4c, 1a, 7 and 7a are covered by executable evidence,
// including the Library route, legal-text recognition and fetch/version evidence, and the onSourcesCommitted workflow.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);
const UC = "docs/use-cases/UC-004-register-a-requirement-source.md";

const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const exists = (path) => existsSync(new URL(path, ROOT));
const compact = (text) => text.replace(/\s+/g, " ").trim();
const ev = (file, id) => [file, id];

const FLOW_EVIDENCE = {
  "main-1-6-library-route-registers-and-saves": {
    uc: [
      "The author opens **Library** on the dashboard and chooses **+ Register source**.",
      "Agent M asks what the source is",
      "The author fills in the fields common to all",
      "Before saving, Agent M states what becomes public",
      "The author presses **Save**",
    ],
    evidence: [
      ev("tests/settings-pages-library.test.mjs", "TST-472750"),
      ev("tests/settings-pages-library.test.mjs", "TST-472751"),
      ev("tests/settings-pages-library.test.mjs", "TST-472752"),
      ev("tests/settings-pages-library.test.mjs", "TST-472753"),
      ev("tests/settings-pages-library.test.mjs", "TST-472759"),
      ev("tests/settings-pages-library.test.mjs", "TST-472760"),
      ev("tests/source-register-registration.test.mjs", "TST-472924"),
      ev("tests/source-register-registration.test.mjs", "TST-472925"),
    ],
  },
  "main-7-fetch-workflow-completes-eu-legal-text": {
    uc: [
      "For an EU legal text, the fetch workflow then downloads the official text",
      "stores it with retrieval date, the repository's version identifier and its SHA-256",
      "The library shows the source as *fetched*.",
    ],
    evidence: [
      ev("tests/source-register-legal-text.test.mjs", "TST-472907"),
      ev("tests/source-register-legal-text.test.mjs", "TST-472908"),
      ev("tests/source-register-version-fetch.test.mjs", "TST-385001"),
      ev("tests/source-register-version-fetch.test.mjs", "TST-385004"),
      ev("tests/source-register-version-fetch.test.mjs", "TST-385006"),
      ev("tests/workflow-entries-sources.test.mjs", "TST-401001"),
      ev("tests/settings-pages-library.test.mjs", "TST-402001"),
    ],
  },
  "alternative-4a-local-copy-only-hashed": {
    uc: "The author has only a printed or local copy of a norm and does not want to upload it.",
    evidence: [
      ev("tests/settings-pages-library.test.mjs", "TST-472755"),
      ev("tests/source-register-registration.test.mjs", "TST-472927"),
      ev("tests/source-register-hashed-only.test.mjs", "TST-472903"),
      ev("tests/site-frame-source-explanations.test.mjs", "TST-472862"),
    ],
  },
  "alternative-4b-unknown-licence-counts-as-restricted": {
    uc: "The licence is unknown.",
    evidence: [
      ev("tests/settings-pages-library.test.mjs", "TST-472754"),
      ev("tests/source-register-registration.test.mjs", "TST-472928"),
      ev("tests/site-frame-source-explanations.test.mjs", "TST-472860"),
    ],
  },
  "alternative-4c-named-repository-unreachable": {
    uc: "The named repository is not reachable with the stored token.",
    evidence: [
      ev("tests/settings-pages-library.test.mjs", "TST-472756"),
    ],
  },
  "alternative-1a-source-already-in-library": {
    uc: "The source is already in the library.",
    evidence: [
      ev("tests/settings-pages-library.test.mjs", "TST-472757"),
      ev("tests/site-frame-source-explanations.test.mjs", "TST-472858"),
    ],
  },
  "alternative-7a-fetch-fails-and-fetch-again": {
    uc: [
      "The fetch fails",
      "The register entry shows the error and a **Fetch again** button; nothing is guessed.",
    ],
    evidence: [
      ev("tests/source-register-version-fetch.test.mjs", "TST-385003"),
      ev("tests/workflow-entries-sources.test.mjs", "TST-401003"),
      ev("tests/settings-pages-library.test.mjs", "TST-402001"),
    ],
  },
};

function evidenceBlock(file, id) {
  const lines = read(file).split("\n");
  const start = lines.findIndex((line) => line.includes(id));
  assert.notEqual(start, -1, `${file} contains ${id}`);
  return lines.slice(start, start + 12).join("\n");
}

function assertEvidence(flow, file, id) {
  assert.ok(exists(file), `${flow}: evidence file exists: ${file}`);
  const block = evidenceBlock(file, id);
  for (const key of ["level", "module", "guards", "given", "input", "expect"]) {
    assert.match(block, new RegExp(`\\b${key}:`, "i"), `${flow}: ${id} states ${key}`);
  }
}

// TST-370001
// level: system
// module: MOD-settings-pages; MOD-source-register; MOD-workflow-entries
// guards: UC-004
// given: UC-004 and the executable tests named in FLOW_EVIDENCE
// input: compare the main flow and alternatives 4a, 4b, 4c, 1a, 7 and 7a with their executable evidence
// expect: every named UC-004 flow segment is present in the use case text and every evidence test states its level, module, guards, input, precondition and expected result
test("TST-370001: UC-004 system coverage names the main flow and required alternatives", () => {
  const uc = compact(read(UC));
  for (const [flow, { uc: needles, evidence }] of Object.entries(FLOW_EVIDENCE)) {
    for (const needle of Array.isArray(needles) ? needles : [needles]) {
      assert.ok(uc.includes(compact(needle)), `${flow}: UC-004 contains ${needle}`);
    }
    assert.ok(evidence.length > 0, `${flow}: evidence is named`);
    for (const [file, id] of evidence) assertEvidence(flow, file, id);
  }
});

// TST-370002
// level: system
// module: MOD-settings-pages; MOD-source-register; MOD-workflow-entries
// guards: UC-004; AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY
// given: the UC-004 evidence files for the Library route, legal-text recognition, legal-text fetch/versioning and workflow entry
// input: inspect their fixture boundaries and public-path markers
// expect: the system evidence crosses the dashboard Library route, local publication fixtures and the onSourcesCommitted workflow without using live GitHub or EU publication services
test("TST-370002: UC-004 evidence crosses Library, source-register and workflow-entry boundaries", () => {
  const library = read("tests/settings-pages-library.test.mjs");
  assert.ok(library.includes("library-register"), "the Library route exposes + Register source");
  assert.ok(library.includes("library-fetch-again"), "the Library route exposes Fetch again");
  assert.ok(library.includes("fetch-sources.yml"), "the page starts the fetch workflow");

  const legalText = read("tests/source-register-legal-text.test.mjs");
  assert.ok(legalText.includes("recogniseLegalText"), "legal-text recognition evidence uses the public source-register interface");
  assert.ok(legalText.includes("Nothing reaches the network"), "legal-text recognition is deterministic");

  const versionFetch = read("tests/source-register-version-fetch.test.mjs");
  assert.ok(versionFetch.includes("withFixture"), "legal-text fetch evidence replaces the publication repository");
  assert.ok(versionFetch.includes("/resource/celex/32024R1689"), "CELEX fetch path is executable evidence");
  assert.ok(versionFetch.includes("NotFound") && versionFetch.includes("Unreachable"), "fetch failure classes are covered");

  const workflow = read("tests/workflow-entries-sources.test.mjs");
  assert.ok(workflow.includes("runEntry(\"onSourcesCommitted\""), "the workflow entry is the executed interface");
  assert.ok(workflow.includes("mkdtempSync"), "workflow evidence uses temporary git repositories");
  assert.ok(workflow.includes("withPublication"), "workflow evidence replaces the EU publication repository");
});
