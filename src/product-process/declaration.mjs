// The declaration of a product's process: its parts as the module reads them, and its findings (MOD-product-process, Data:
// Schema `declaration`; Interfaces: declarationFindings). ITM-218 builds it; index.mjs offers declarationFindings.
//
// Module: MOD-product-process
//
// A declaration is a Document as MOD-documents reads it with declarationSchema: its front matter, and its sections with the
// rows of their tables. The schema holds `## Practices` and `## Definition of Done` as text, so their lines are read here: a
// practice as a line `- <name>`, where `- none` names none; a condition of the Definition of Done as a line that begins with
// `review:`, `check:` or `gate:`.
//
// A row of `## Branches` names a phase of the model, or its time box: the sprint, which a row names `Sprint`, in a model that
// works in sprints. The module file names the column `Phase or time box` but not how a row names the time box; this
// instance's own docs/process.md names it `Sprint`.

import { finding } from "../text-tools/index.mjs";
import { parseSpec } from "../spec-document/index.mjs";

const DECLARED = "THE PROCESS MODEL IS DECLARED PER PRODUCT";
const VALIDATED = "A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED";
const PEOPLE_AND_AGENTS = "A PROCESS MODEL ORGANISES PEOPLE AND AGENTS";
const PRACTICE = "A PRACTICE IS NOT A MODEL";
const BRANCH = "A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN";
const ADDS = "A PROCESS REQUIREMENT ADDS TO THE MODEL";

// How a row of ## Branches names the sprint, the time box of a model that works in sprints.
const SPRINT = "Sprint";

const PRACTICE_LINE = /^-[ \t]+(.*\S)[ \t]*$/;
const CONDITION_LINE = /^(?:review|check|gate):/;

const text = (value) => (typeof value === "string" ? value : "");
const list = (value) => (Array.isArray(value) ? [...value] : []);

// The section of a document whose heading line is `heading`, or undefined.
const sectionOf = (document, heading) => document.sections.find((section) => section.heading === heading);
const rowsOf = (document, heading) => sectionOf(document, heading)?.rows ?? [];

// The lines of a section's text, each with its number in the file: the text begins on the line after the heading's.
function sectionLines(section) {
  return (section ? section.text.split("\n") : []).map((line, i) => ({ text: line.replace(/\r$/, ""), line: section.line + 1 + i }));
}

// The line of a front matter key, counted as the front matter is written — the line --- first, then each key on a line of
// its own and each item of a list on one more —, as MOD-documents counts it; 1 for a key that does not stand.
function keyLine(fields, key) {
  let line = 2;
  for (const [name, value] of Object.entries(fields)) {
    if (name === key) return line;
    line += 1 + (Array.isArray(value) ? value.length : 0);
  }
  return 1;
}

// The two phases a gate stands between, written `<phase> → <phase>`; without the arrow, the whole text as the first.
function between(written) {
  const at = written.indexOf("→");
  return at < 0 ? { from: written, to: "" } : { from: written.slice(0, at).trim(), to: written.slice(at + 1).trim() };
}

// The rows of ## Roles: each role with the participants the declaration assigns to it, and the line of its row.
export const rolesOf = (declaration) => rowsOf(declaration, "## Roles")
  .map(({ line, cells }) => ({ line, role: text(cells.Role), holders: list(cells.Participants) }));

// The practices ## Practices names, each with its line.
export const practicesOf = (declaration) => sectionLines(sectionOf(declaration, "## Practices"))
  .map(({ text: written, line }) => ({ name: PRACTICE_LINE.exec(written)?.[1], line }))
  .filter(({ name }) => name !== undefined && name !== "none");

// The rows of ## Branches: the phase or time box, its branch, and the line of the row.
export const branchesOf = (declaration) => rowsOf(declaration, "## Branches")
  .map(({ line, cells }) => ({ line, at: text(cells["Phase or time box"]), branch: text(cells.Branch) }));

// The rows of ## Gates added by requirements: each gate with the requirement that adds it, the phases it stands between, its
// artifacts, condition and decider, and the line of its row.
export const addedGatesOf = (declaration) => rowsOf(declaration, "## Gates added by requirements")
  .map(({ line, cells }) => ({ line, requirement: text(cells.Requirement), ...between(text(cells.Between)),
    artifacts: text(cells.Artifacts), condition: text(cells.Condition), decider: text(cells.Decider) }));

// The conditions ## Definition of Done adds to the job rules, each its line as written.
export const conditionsOf = (declaration) => sectionLines(sectionOf(declaration, "## Definition of Done"))
  .map(({ text: written }) => written.trim()).filter((written) => CONDITION_LINE.test(written));

/**
 * declarationFindings(declaration: Document, catalogue: Catalogue, participants: Document, sources: Document[],
 * instanceSpec: string) -> Finding[] — the findings of a declaration against the version it declared, in the order of their
 * lines, each an error naming the declaration's path — it has no identifier — and the requirement it applies:
 * - a model that `catalogue` does not hold at `model_file` — the named version lacks it —, on the line of `model_file`
 *   (THE PROCESS MODEL IS DECLARED PER PRODUCT); or one whose findings in it hold an error, on the same line (A MODEL
 *   DEFINITION IS VALIDATED BEFORE IT IS USED);
 * - a role of the model that needs a person, of which no holder is a person of the register, on its row of `## Roles`, or
 *   on that heading where no row names it (A PROCESS MODEL ORGANISES PEOPLE AND AGENTS);
 * - a practice the catalogue does not hold, or whose `fits` does not name the declared model, on its line (A PRACTICE IS NOT
 *   A MODEL);
 * - a branch set for what is no phase of the model, nor its sprint where it works in sprints, on its row (A PHASE OR A TIME
 *   BOX MAY HAVE A BRANCH OF ITS OWN);
 * - a gate under `## Gates added by requirements` whose requirement `instanceSpec` does not hold, on its row (A PROCESS
 *   REQUIREMENT ADDS TO THE MODEL).
 * Where the catalogue holds no model at `model_file`, its roles and phases are not compared. A holder lacking a capability
 * its role needs, and a holder at a place a linked source does not permit, are not named yet: `sources` is not read.
 * @param {Document} declaration — the product's docs/process.md, as readDocument returns it with declarationSchema
 * @param {Catalogue} catalogue — MOD-model-catalogue's catalogue over the instance's snapshot at the commit the
 *   declaration's model_version names
 * @param {Document} participants — the instance's docs/participants.md, as readDocument returns it with
 *   MOD-participant-list's participantSchema
 * @param {Document[]} sources — the register entries of the sources the product links
 * @param {string} instanceSpec — the text of the instance's SPEC.md, whose requirements are the process requirements
 * @returns {Finding[]}
 */
export function declarationFindings(declaration, catalogue, participants, sources, instanceSpec) {
  const artifact = declaration.id ?? declaration.path;
  const found = [];
  const add = (line, rule, what, fix) => found.push(finding({ artifact, line, kind: "error", rule, what, fix }));
  const name = text(declaration.fields.model);
  const file = text(declaration.fields.model_file);
  const version = text(declaration.fields.model_version);
  const fileLine = keyLine(declaration.fields, "model_file");

  const model = catalogue.models.find((candidate) => candidate.path === file);
  if (!model) {
    add(fileLine, DECLARED, `the instance at the commit ${version} holds no model at ${file}`,
      "name in model_file a model that commit holds, or declare a commit that holds this file");
  } else {
    const errors = (catalogue.findings[file] ?? []).filter((f) => f.kind === "error");
    if (errors.length) {
      add(fileLine, VALIDATED, `the model at ${file} has ${errors.length} error finding(s) at the commit ${version}, so no `
        + "product may declare it", "correct the model, and declare the commit that holds it corrected");
    }
    const persons = new Set(participants.sections.flatMap((section) => section.rows ?? [])
      .filter((row) => row.cells.Type === "person").map((row) => row.cells.Name));
    const roles = rolesOf(declaration);
    for (const role of model.roles.filter((r) => r.filledBy === "person")) {
      const row = roles.find((r) => r.role === role.name);
      if (!row?.holders.some((holder) => persons.has(holder))) {
        add(row?.line ?? sectionOf(declaration, "## Roles")?.line ?? 1, PEOPLE_AND_AGENTS,
          `the role ${role.name} needs a person, and no person holds it`,
          `assign to ${role.name} a participant of the type person`);
      }
    }
    const phases = new Set(model.phases.map((phase) => phase.name));
    for (const { line, at, branch } of branchesOf(declaration)) {
      if (!phases.has(at) && !(at === SPRINT && model.flow?.sprints)) {
        add(line, BRANCH, `the branch ${branch} is set for ${at}, which is no phase of the model ${model.name}`
          + (model.flow?.sprints ? "" : ", and the model works in no sprints"),
          "name a phase of the model, or remove the row");
      }
    }
  }

  for (const { name: practice, line } of practicesOf(declaration)) {
    const held = catalogue.practices.find((candidate) => candidate.name === practice);
    if (!held) {
      add(line, PRACTICE, `the catalogue holds no practice ${practice}`, "name a practice of the catalogue, or remove the line");
    } else if (!held.fits.includes(name)) {
      add(line, PRACTICE, `the practice ${practice} fits ${held.fits.join(", ")}, not the model ${name}`,
        "remove the practice, or declare a model it fits");
    }
  }

  const requirements = parseSpec(instanceSpec).requirements;
  for (const { line, requirement, from, to } of addedGatesOf(declaration)) {
    if (!requirements.has(requirement)) {
      add(line, ADDS, `the gate between ${from} and ${to} is added by ${requirement}, which the instance's SPEC does not hold`,
        "name the requirement of the instance's SPEC that adds this gate, or remove the row");
    }
  }
  return found.sort((a, b) => a.line - b.line);
}
