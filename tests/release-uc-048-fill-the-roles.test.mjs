// Release coverage for UC-048 "Fill the roles". The release-level guard that every requirement UC-048 realises with an automatic check is covered by executable evidence, that
// the system test walks the main flow and every alternative flow UC-048 names, and that the models the product ships fix the roles a role assignment fills: each role states who
// may fill it, how many fill it and what it needs.
// Run: node --test tests/release-uc-048-fill-the-roles.test.mjs
//
// Module: MOD-implementation-pages
// Guards: UC-048
// Level: release
//
// Input: docs/use-cases/UC-048-fill-the-roles.md, SPEC.md, the UC-048 system test, the files that already check the requirements, and the shipped models of
// src/model-catalogue/models/. Written for ITM-1063 by a participant who built neither the Roles page (MOD-implementation-pages) nor its team removal (ITM-1064)
// (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER). Where the page and UC-048 disagree the test follows UC-048; none was found. The counter-proofs are recorded in
// the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { readDocument } from "../src/documents/index.mjs";
import { modelFindings, modelSchema } from "../src/model-catalogue/index.mjs";
import { testDeclarations } from "../src/test-document/index.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const SYSTEM = "tests/system-uc-048-fill-the-roles.test.mjs";

function ucRealises() {
  const names = [];
  let inRealises = false;
  for (const line of read("docs/use-cases/UC-048-fill-the-roles.md").split("\n")) {
    if (line === "realises:") { inRealises = true; continue; }
    if (!inRealises) continue;
    if (line.startsWith("  - ")) names.push(line.slice(4));
    else if (line === "---") break;
  }
  return names;
}

function specChecks() {
  const checks = new Map();
  const pattern = /^\*\*(.+?)\*\*[\s\S]*?\*Check:\* ([^\n]*(?:\n(?!\*\*|## ).*)*)/gm;
  let match;
  while ((match = pattern.exec(read("SPEC.md")))) checks.set(match[1], match[2].replace(/\s+/g, " ").trim());
  return checks;
}

// Each requirement with an automatic check: the files that check it (the system test among them) and, in each, a mention of the requirement or the file the SPEC names.
const COVERED_BY_RELEASE = {
  "A ROLE ASSIGNMENT FILLS THE ROLES": [SYSTEM, "tests/test_role_assignment.py", "tests/product-process-role-assignments.test.mjs", "tests/dashboard-roles.test.mjs"],
  "A PRODUCT HAS ONE ROLE ASSIGNMENT, OR ONE PER TEAM": [SYSTEM, "tests/test_role_assignment.py", "tests/product-process-role-assignments.test.mjs", "tests/dashboard-roles.test.mjs"],
  "THE PROCESS NAMES ROLES, NOT PARTICIPANTS": [SYSTEM, "tests/test_role_assignment.py", "tests/product-process-role-assignments.test.mjs"],
  "A ROLE NAMES HOW MANY FILL IT": [SYSTEM, "tests/test_model_roles.py", "tests/product-process-role-assignments.test.mjs", "tests/dashboard-roles.test.mjs"],
  "A PARTICIPANT MAY SERVE SEVERAL TEAMS": [SYSTEM, "tests/test_role_assignment.py", "tests/product-process-role-assignments.test.mjs"],
  "PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE": [SYSTEM, "tests/test_participants.py", "tests/product-process-role-assignments.test.mjs", "tests/participant-list.test.mjs"],
  "A ROLE NAMES THE CAPABILITIES IT NEEDS": [SYSTEM, "tests/test_model_roles.py", "tests/test_participants.py", "tests/dashboard-roles.test.mjs"],
  "A PARTICIPANT DECLARES ITS CAPABILITIES": [SYSTEM, "tests/test_participants.py", "tests/dashboard-roles.test.mjs"],
  "A PARTICIPANT DECLARES WHERE IT PROCESSES DATA": [SYSTEM, "tests/test_participants.py", "tests/dashboard-roles.test.mjs"],
  "RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS": [SYSTEM, "tests/review-core.test.mjs", "tests/dashboard-roles.test.mjs"],
  "A PERSON'S OWN INPUT IS COMMITTED DIRECTLY": [SYSTEM, "tests/review-core.test.mjs", "tests/dashboard-roles.test.mjs"],
  "EVERY STEP EXPLAINS ITSELF": [SYSTEM, "tests/site-frame.test.mjs", "tests/settings-pages-add-product.test.mjs", "tests/settings-pages-setup.test.mjs", "tests/dashboard-roles.test.mjs"],
};
const REVIEW_ONLY = ["ONE CLICK PER DECISION"];

// TST-1063101 · level: release · module: MOD-implementation-pages
// guards: UC-048; every requirement UC-048 realises; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
// given: UC-048's `realises` list, SPEC's current Check lines, the UC-048 system test and the files that check the requirements
// input: compare the realised requirements with COVERED_BY_RELEASE and REVIEW_ONLY; read the declarations of the system test
// expect: every realised requirement is either checked automatically and covered by evidence that exists, the system test among it, or checked at review only; the files the SPEC names as a requirement's check are among its evidence; the system test declares the main flow and each of the alternative flows 2a, 2b, 3a, 3b, 3c, 3d, 4a and 4b
test("TST-1063101: UC-048 release coverage names every automatic requirement and the system test walks every flow", () => {
  const realised = ucRealises();
  const checks = specChecks();
  assert.equal(realised.length, 13, "known positive: the use case realises thirteen requirements");
  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  const reviewOnly = realised.filter((name) => /^no automatic check; at review/.test(checks.get(name) ?? ""));
  const automatic = realised.filter((name) => !reviewOnly.includes(name));
  assert.deepEqual(Object.keys(COVERED_BY_RELEASE).sort(), automatic.toSorted());
  assert.deepEqual(REVIEW_ONLY.toSorted(), reviewOnly.toSorted());

  for (const [requirement, files] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(files.includes(SYSTEM), `${requirement}: the system test is among the evidence`);
    for (const file of files) assert.ok(existsSync(new URL(file, ROOT)), `${requirement}: ${file} exists`);
    const named = (checks.get(requirement) ?? "").match(/tests\/[A-Za-z0-9_.-]+/g) ?? [];
    for (const file of named) assert.ok(files.includes(file), `${requirement}: the SPEC's check ${file} is among the evidence`);
    assert.ok(files.some((file) => read(file).includes(requirement) || named.includes(file)), `${requirement} is named by an evidence file or checked by the file the SPEC names`);
  }

  const declarations = testDeclarations(SYSTEM, read(SYSTEM));
  const declared = declarations.map((one) => `${one.guards.join("; ")} ${one.given ?? ""} ${one.input ?? ""} ${one.expect ?? ""}`).join("\n");
  for (const phrase of ["UC-048 main flow", "alternative 2a", "alternative 2b", "alternative 3a", "alternative 3b", "alternative 3c", "alternative 3d", "alternative 4a", "alternative 4b"]) {
    assert.ok(declared.includes(phrase), `the system test declares ${phrase}`);
  }
  assert.ok(declarations.every((one) => one.level === "system"), "every declaration of the system test is level system");
});

// TST-1063102 · level: release · module: MOD-implementation-pages
// guards: UC-048; A ROLE NAMES HOW MANY FILL IT; A ROLE NAMES THE CAPABILITIES IT NEEDS
// given: every model the product ships under src/model-catalogue/models/
// input: read each with the model schema and its `## Roles` table
// expect: at least five models; no error finding; every role states who fills it (person, agent or either), how many fill it (one or several) and the capabilities it needs (never empty); a model that works in sprints is the one that offers teams: only Scrum
test("TST-1063102: every shipped model names, for each role, who fills it, how many and what it needs", () => {
  const dir = new URL("src/model-catalogue/models/", ROOT);
  const files = readdirSync(dir).filter((name) => name.endsWith(".md")).sort();
  assert.ok(files.length >= 5, `known positive: the shipped models are found (${files.join(", ")})`);
  const withSprints = [];
  for (const name of files) {
    const text = readFileSync(new URL(name, dir), "utf8");
    const doc = readDocument(modelSchema.model, `src/model-catalogue/models/${name}`, text);
    assert.deepEqual(modelFindings(doc).filter((found) => found.kind === "error").map((found) => found.what), [], name);
    const roles = doc.sections.find((section) => section.heading === "## Roles")?.rows ?? [];
    assert.ok(roles.length > 0, `${name} names roles`);
    for (const role of roles) {
      assert.match(String(role.cells["Filled by"]), /^(person|agent|either)$/, `${name}: ${role.cells.Name} says who fills it`);
      assert.match(String(role.cells["How many"]), /^(one|several)$/, `${name}: ${role.cells.Name} says how many fill it`);
      assert.ok(String(role.cells.Capabilities ?? "").trim() !== "", `${name}: ${role.cells.Name} says what it needs`);
    }
    if (/^\| Sprints \| yes \|$/m.test(text)) withSprints.push(name);
  }
  assert.deepEqual(withSprints, ["scrum.md"], "only Scrum works in sprints, so only it offers teams");
});
