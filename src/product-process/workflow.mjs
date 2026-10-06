// The workflow of a product (MOD-product-process, Interfaces: Workflow, workflowOf): what its declared model, and the gates
// its process requirements add, make of it — and nothing else (THE MODEL DETERMINES THE PHASES AND THE GATES, A PROCESS
// REQUIREMENT ADDS TO THE MODEL). ITM-218 builds it; index.mjs offers workflowOf.
//
// Module: MOD-product-process
//
// A practice's additions do not enter the workflow yet: a shipped practice states its `## Adds` in words only, so no gate is
// marked with a practice. The Definition of Done is the job rules of the module file's Data, then the conditions the
// declaration adds (THE DEFAULT DEFINITION OF DONE IS THE JOB RULES).

import { parseSpec } from "../spec-document/index.mjs";
import { addedGatesOf, branchesOf, conditionsOf, practicesOf, rolesOf } from "./declaration.mjs";

// The job rules, which every Definition of Done holds, as the module file states them.
const JOB_RULES = [
  "CI is green",
  "the job's first commit holds only tests and CI was red on it — for a refactoring job, CI was green on every commit and "
    + "no test's expected result changed",
  "every changed code file lies in the folder of one of the job's modules",
  "every new test names a requirement and a module",
  "every gate the workflow places before the merge is recorded",
];

/**
 * workflowOf(declaration: Document, model: Model, practices: Document[], instanceSpec: string) -> Workflow — the model's
 * phases, transitions, verification pairs and gates, each gate named `<phase> → <phase>`; then the gates and their artifacts
 * that the process requirements add, as the declaration's `## Gates added by requirements` names them, each named by its
 * requirement and marked with it and the source that requirement names in the instance's SPEC — a gate whose requirement
 * that SPEC does not hold stays, with the source null, and declarationFindings names it —; nothing else enters the workflow.
 * With them: the practices the declaration names, the model's roles with the participants `## Roles` assigns to each, the
 * branch `## Branches` sets for each phase or time box, and the Definition of Done — the job rules, then each condition the
 * declaration adds. A practice adds nothing yet: `practices` is not read.
 * @param {Document} declaration — the product's docs/process.md, as readDocument returns it with declarationSchema
 * @param {Model} model — the declared model, as the catalogue at the commit the declaration names gives it
 * @param {Document[]} practices — the declared practices' files, read with MOD-model-catalogue's practice schema
 * @param {string} instanceSpec — the text of the instance's SPEC.md, whose requirements are the process requirements
 * @returns {Workflow}
 */
export function workflowOf(declaration, model, practices, instanceSpec) {
  const requirements = parseSpec(instanceSpec).requirements;
  const roles = rolesOf(declaration);
  return {
    model,
    practices: practicesOf(declaration).map((practice) => practice.name),
    phases: model.phases.map(({ name, role, produces }) => ({ name, role, produces: [...produces] })),
    transitions: model.transitions.map(({ from, to, kind }) => ({ from, to, kind })),
    pairs: model.pairs.map(({ phase, checkedBy }) => ({ phase, checkedBy })),
    gates: [
      ...model.gates.map(({ from, to, artifacts, condition, decider }) =>
        ({ name: `${from} → ${to}`, from, to, artifacts, condition, decider, addedBy: null, practice: null })),
      ...addedGatesOf(declaration).map(({ requirement, from, to, artifacts, condition, decider }) =>
        ({ name: requirement, from, to, artifacts, condition, decider,
          addedBy: { requirement, source: requirements.get(requirement)?.source ?? null }, practice: null })),
    ],
    roles: model.roles.map(({ name, filledBy, capabilities }) => ({ name, filledBy, capabilities: [...capabilities],
      holders: roles.find((row) => row.role === name)?.holders ?? [] })),
    branches: Object.fromEntries(branchesOf(declaration).map(({ at, branch }) => [at, branch])),
    done: [...JOB_RULES, ...conditionsOf(declaration)],
  };
}
