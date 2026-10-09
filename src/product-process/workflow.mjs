// The workflow of a product (MOD-product-process, Interfaces: Workflow, workflowOf): what its declared model, practices,
// and process requirements add — and nothing else (THE MODEL DETERMINES THE PHASES AND THE GATES, A PRACTICE IS NOT A MODEL,
// A PROCESS REQUIREMENT ADDS TO THE MODEL). index.mjs offers workflowOf.
//
// Module: MOD-product-process
//
// A practice contributes only explicit model-table data below ## Adds. Its prose stays readable on the page but creates no
// workflow entry. The Definition of Done is the job rules of the module file's Data, then the conditions the declaration
// adds (THE DEFAULT DEFINITION OF DONE IS THE JOB RULES).

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

const text = (value) => (typeof value === "string" ? value : "");

// The explicit table under a level-three heading in a practice's ## Adds. Its explanation is otherwise free text, so only
// a table with exactly the model-table columns becomes workflow data.
function additionsTable(document, heading, columns) {
  const adds = document.sections.find((section) => section.heading === "## Adds")?.text ?? "";
  const lines = adds.split("\n");
  const start = lines.findIndex((line) => line.trim() === `### ${heading}`);
  if (start < 0) return [];
  const end = lines.findIndex((line, index) => index > start && /^###[#]?[ \t]/.test(line));
  const block = lines.slice(start + 1, end < 0 ? lines.length : end);
  const cells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
  const header = block.findIndex((line) => line.trim().startsWith("|") && JSON.stringify(cells(line)) === JSON.stringify(columns));
  if (header < 0 || !/^\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)+\|?$/.test(block[header + 1] ?? "")) return [];
  return block.slice(header + 2).filter((line) => line.trim().startsWith("|")).map(cells)
    .filter((row) => row.length === columns.length)
    .map((row) => Object.fromEntries(columns.map((column, index) => [column, row[index]])));
}

function additionsOf(practices) {
  return practices.map((document) => ({
    practice: text(document.fields.name),
    phases: additionsTable(document, "Phases", ["Name", "Role", "Produces"]),
    gates: additionsTable(document, "Gates", ["Between", "Artifacts", "Condition", "Decider"]),
    roles: additionsTable(document, "Roles", ["Name", "Filled by", "Capabilities"]),
  }));
}

function between(written) {
  const at = written.indexOf("→");
  return at < 0 ? { from: written, to: "" } : { from: written.slice(0, at).trim(), to: written.slice(at + 1).trim() };
}

/**
 * workflowOf(declaration: Document, model: Model, practices: Document[], instanceSpec: string) -> Workflow — the model's
 * phases, transitions, verification pairs and gates, each gate named `<phase> → <phase>`; then the gates and their artifacts
 * that the process requirements add, as the declaration's `## Gates added by requirements` names them, each named by its
 * requirement and marked with it and the source that requirement names in the instance's SPEC — a gate whose requirement
 * that SPEC does not hold stays, with the source null, and declarationFindings names it —; nothing else enters the workflow.
 * With them: the practices the declaration names, the model's roles with the participants `## Roles` assigns to each, the
 * branch `## Branches` sets for each phase or time box, and the Definition of Done — the job rules, then each condition the
 * declaration adds. A selected practice contributes only its explicit `### Phases`, `### Gates` and `### Roles` model tables
 * below `## Adds`; a phase's `Produces` is its artifact addition, and a practice gate names its practice.
 * @param {Document} declaration — the product's docs/process.md, as readDocument returns it with declarationSchema
 * @param {Model} model — the declared model, as the catalogue at the commit the declaration names gives it
 * @param {Document[]} practices — the declared practices' files, read with MOD-model-catalogue's practice schema
 * @param {string} instanceSpec — the text of the instance's SPEC.md, whose requirements are the process requirements
 * @returns {Workflow}
 */
export function workflowOf(declaration, model, practices, instanceSpec) {
  const requirements = parseSpec(instanceSpec).requirements;
  const roles = rolesOf(declaration);
  const selected = new Set(practicesOf(declaration).map((practice) => practice.name));
  const additions = additionsOf(practices.filter((practice) => selected.has(text(practice.fields.name))));
  return {
    model,
    practices: [...selected],
    phases: [
      ...model.phases.map(({ name, role, produces }) => ({ name, role, produces: [...produces] })),
      ...additions.flatMap(({ phases }) => phases.map((phase) =>
        ({ name: phase.Name, role: phase.Role, produces: phase.Produces.split(",").map((artifact) => artifact.trim()).filter(Boolean) }))),
    ],
    transitions: model.transitions.map(({ from, to, kind }) => ({ from, to, kind })),
    pairs: model.pairs.map(({ phase, checkedBy }) => ({ phase, checkedBy })),
    gates: [
      ...model.gates.map(({ from, to, artifacts, condition, decider }) =>
        ({ name: `${from} → ${to}`, from, to, artifacts, condition, decider, addedBy: null, practice: null })),
      ...addedGatesOf(declaration).map(({ requirement, from, to, artifacts, condition, decider }) =>
        ({ name: requirement, from, to, artifacts, condition, decider,
          addedBy: { requirement, source: requirements.get(requirement)?.source ?? null }, practice: null })),
      ...additions.flatMap(({ practice, gates }) => gates.map((gate) => {
        const { from, to } = between(gate.Between);
        return { name: `${from} → ${to}`, from, to, artifacts: gate.Artifacts, condition: gate.Condition,
          decider: gate.Decider, addedBy: null, practice };
      })),
    ],
    roles: [
      ...model.roles.map(({ name, filledBy, capabilities }) => ({ name, filledBy, capabilities: [...capabilities],
        holders: roles.find((row) => row.role === name)?.holders ?? [] })),
      ...additions.flatMap(({ roles: added }) => added.map((role) => ({ name: role.Name, filledBy: role["Filled by"],
        capabilities: role.Capabilities.split(",").map((capability) => capability.trim()).filter(Boolean),
        holders: roles.find((row) => row.role === role.Name)?.holders ?? [] }))),
    ],
    branches: Object.fromEntries(branchesOf(declaration).map(({ at, branch }) => [at, branch])),
    done: [...JOB_RULES, ...conditionsOf(declaration)],
  };
}
