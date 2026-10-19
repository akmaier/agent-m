// MOD-product-process' productWorkflow (ITM-1100), as the accepted text of docs/architecture/MOD-product-process.md states it:
// "`productWorkflow(declaration, instanceAt, instanceSpec) -> Promise<Workflow | null>` — the product's workflow as it declared it:
// MOD-model-catalogue's `catalogue` over the instance at the commit the declaration's `model_version` names (`instanceAt`), the model it
// holds at `model_file`, the practices the declaration names read with `modelSchema`, and `workflowOf` of them; `null` where that catalogue
// holds no model at `model_file`. Fails as `instanceAt` fails."
// Run: node --test tests/product-process-product-workflow.test.mjs
//
// Module: MOD-product-process
// Guards: THE PROCESS MODEL IS DECLARED PER PRODUCT; THE MODEL DETERMINES THE PHASES AND THE GATES; A PRACTICE IS NOT A MODEL
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The instance is a fixture held in memory
// that answers `instanceAt(commit)` with the files it held at that commit: at the declared commit the instance's model has the phases
// Plan and Build and its practice adds a Release phase's role; at the instance's later commit both differ. Nothing reaches the network.
// The expected workflow is `workflowOf` of the model and practice the fixture holds at the declared commit, which the text names.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readDocument } from "../src/documents/index.mjs";
import { catalogue, modelSchema } from "../src/model-catalogue/index.mjs";
import * as productProcess from "../src/product-process/index.mjs";

const { declarationSchema, workflowOf } = productProcess;
const DECLARED = "a1".repeat(20), LATER = "b2".repeat(20), NOWHERE = "c3".repeat(20);
const MODEL_PATH = "docs/process-models/mini.md";
const PRACTICE_PATH = "src/model-catalogue/practices/devops.md";
const SPEC = "# Instance — Specification\n";

const model = (phases) => ["---", "name: mini", "kind: planned", "measure: plan entries per phase", "---", "# Mini", "", "## Phases", "", "| Name | Role | Produces |", "|---|---|---|",
  ...phases.map(([name, role, produces]) => `| ${name} | ${role} | ${produces} |`), "", "## Transitions", "", "| From | To | Kind |", "|---|---|---|",
  `| ${phases[0][0]} | ${phases[1][0]} | sequence |`, "", "## Verification pairs", "", "| Phase | Checked by |", "|---|---|", `| ${phases[0][0]} | ${phases[1][0]} |`, "",
  "## Gates", "", "| Between | Artifacts | Condition | Decider |", "|---|---|---|---|", `| ${phases[0][0]} → ${phases[1][0]} | the plan | it is complete | Lead |`, "",
  "## Roles", "", "| Name | Filled by | How many | Capabilities |", "|---|---|---|---|", "| Lead | either | one | read the repository |", "",
  "## Flow control", "", "| Kind | Value |", "|---|---|", "| WIP limit | — |", "| Time box | none |", "| Sprints | no |", ""].join("\n");
const practice = (role) => ["---", "name: devops", "fits:", "  - mini", "---", "# DevOps", "", "## Adds", "", "### Roles", "", "| Name | Filled by | How many | Capabilities |", "|---|---|---|---|",
  `| ${role} | either | one | read the repository |`, ""].join("\n");

// The instance's files at each commit: the model and the practice differ between the declared commit and the later one.
const FILES = {
  [DECLARED]: { [MODEL_PATH]: model([["Plan", "Lead", "ITM"], ["Build", "Lead", "MOD"]]), [PRACTICE_PATH]: practice("Operator") },
  [LATER]: { [MODEL_PATH]: model([["Plan", "Lead", "ITM"], ["Build", "Lead", "MOD"], ["Ship", "Lead", "TST"]]), [PRACTICE_PATH]: practice("Releaser") },
  [NOWHERE]: {},
};
const blobOf = (path) => createHash("sha1").update(path).digest("hex");
const snapshotAt = (commit) => ({ repository: { server: "github", origin: "https://github.com", path: "alice/agent-m", web: "https://github.com/alice/agent-m" }, ref: commit, commit,
  paths: Object.keys(FILES[commit]), read: async (path) => FILES[commit][path] ?? null, blob: (path) => (path in FILES[commit] ? blobOf(path) : null) });
const instanceAt = (asked) => async (commit) => { asked.push(commit); return snapshotAt(commit); };

const declaration = (commit, file = MODEL_PATH) => readDocument(declarationSchema, "docs/process.md", ["---", "model: mini", `model_file: ${file}`, `model_version: ${commit}`, "---", "# Process", "",
  "## Practices", "", "- devops", "", "## Branches", "", "| Phase or time box | Branch |", "|---|---|", "| Plan | plan |", "", "## Definition of Done", "", "The job rules hold.", ""].join("\n"));

// The workflow of what the fixture instance held at `commit`, composed as the text says: the model at model_file, the declared practice, workflowOf.
async function expectedAt(commit) {
  const held = await catalogue(snapshotAt(commit));
  return workflowOf(declaration(DECLARED), held.models.find((each) => each.path === MODEL_PATH), [readDocument(modelSchema.practice, PRACTICE_PATH, FILES[commit][PRACTICE_PATH])], SPEC);
}

// TST-1100001 · level: unit · module: MOD-product-process
// guards: THE PROCESS MODEL IS DECLARED PER PRODUCT; THE MODEL DETERMINES THE PHASES AND THE GATES; A PRACTICE IS NOT A MODEL
// given: a declaration naming docs/process-models/mini.md at the commit DECLARED and the practice devops; an instance that held the model with the phases Plan and Build and the practice with the role Operator at DECLARED, and a model with a third phase, Ship, and the practice with the role Releaser at LATER
// input: productWorkflow(declaration, instanceAt, SPEC)
// expect: instanceAt is asked for DECLARED and for no other commit; the workflow has the phases Plan and Build, and is the workflow workflowOf gives that model and practice, which differs from the workflow of the later versions
// Planted fault: reading the catalogue at the instance's later commit gives the phase Ship and the role Releaser, and the first assertion fails.
test("productWorkflow reads the model and the practice at the commit model_version names, not at another", async () => {
  const asked = [];
  const workflow = await productProcess.productWorkflow(declaration(DECLARED), instanceAt(asked), SPEC);
  assert.deepEqual([...new Set(asked)], [DECLARED], "only the declared commit is read");
  assert.deepEqual(workflow.phases.map((phase) => phase.name), ["Plan", "Build"]);
  const expected = await expectedAt(DECLARED);
  assert.deepEqual(workflow, expected);
  assert.notDeepEqual(await expectedAt(LATER), expected, "known positive: the later versions give another workflow");
});

// TST-1100002 · level: unit · module: MOD-product-process
// guards: THE PROCESS MODEL IS DECLARED PER PRODUCT
// given: a declaration whose model_version is the commit NOWHERE, at which the instance holds no model file, and one whose model_file the instance holds at DECLARED under no such path
// input: productWorkflow for each
// expect: null each time
// Planted fault: returning a workflow built from the shipped models, or throwing, fails.
test("productWorkflow gives null where the catalogue at that commit holds no model at model_file", async () => {
  assert.equal(await productProcess.productWorkflow(declaration(NOWHERE), instanceAt([]), SPEC), null);
  assert.equal(await productProcess.productWorkflow(declaration(DECLARED, "docs/process-models/other.md"), instanceAt([]), SPEC), null);
});

// TST-1100003 · level: unit · module: MOD-product-process
// guards: THE PROCESS MODEL IS DECLARED PER PRODUCT
// given: an instanceAt that fails with an error named Unreachable
// input: productWorkflow
// expect: it rejects with that very error
// Planted fault: catching the failure and answering null makes the rejection assertion fail.
test("productWorkflow fails as instanceAt fails", async () => {
  const failure = Object.assign(new Error("the instance cannot be reached"), { name: "Unreachable" });
  await assert.rejects(productProcess.productWorkflow(declaration(DECLARED), async () => { throw failure; }, SPEC), (error) => error === failure);
});
