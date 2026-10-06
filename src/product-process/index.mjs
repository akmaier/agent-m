// MOD-product-process — a product's process: its declaration, workflow, gates and Definition of Done
// (docs/architecture/MOD-product-process.md): its interface. Of it, ITM-218 builds what UC-002 needs: Workflow;
// declarationSchema, the schema of a product's docs/process.md; declarationFindings (declaration.mjs); and workflowOf
// (workflow.mjs). holdsRole, gateSchema with gate-record.schema.md, gateStates, mayDecide, recordGateDecision, doneCheck and
// processStrategies are not built yet. declarationFindings does not yet name a holder lacking a capability its role needs,
// nor warn of a holder at a processing place a linked source does not permit: both go through MOD-participant-list's
// eligible, which takes Participants, and no module turns a row of the register into one yet. workflowOf adds no practice's
// additions: a shipped practice states its `## Adds` in words only.
//
// Module: MOD-product-process
//
// It belongs to Process (ARC-042). It runs unchanged in a browser and in Node. Its one read is that of its own data file
// declaration.schema.md — the declaration's schema, in MOD-documents' language —, once, when the module is loaded: from the
// disk in Node, from the module's own address in a browser. A schema that cannot be read, or that breaks the language, stops
// the module's load, as MOD-documents' file says of a broken schema: it stops that module, never a single document. Nothing
// else is read here, and nothing is written: the declaration, the register of participants, the source entries and the
// instance's SPEC are given by the callers, and the declaration is committed by the page as the person's own input. It uses
// MOD-documents, MOD-spec-document and MOD-text-tools only through their index.mjs. Every other file of this folder is
// private to the module.

// Schema, in the types below, is MOD-documents' type of that name; Model is MOD-model-catalogue's.
import { loadSchema } from "../documents/index.mjs";

export { declarationFindings } from "./declaration.mjs";
export { workflowOf } from "./workflow.mjs";

/**
 * The workflow of a product: the model it follows; the practices its declaration names; the model's phases, the transitions
 * between them and its verification pairs; its gates — the model's, each named `<phase> → <phase>`, then those the product's
 * process requirements add, each named by its requirement and marked with that requirement and the source the instance's
 * SPEC names for it —, each with the phases it stands between, the artifacts it checks, its condition, its decider, and the
 * practice that added it, null for every gate here; the model's roles, each with who may fill it, the capabilities it needs
 * and the participants the declaration assigns to it; the branch of each phase or time box that has one; and the Definition
 * of Done: the job rules, then the conditions the declaration adds.
 * @typedef {{ model: Model, practices: string[], phases: Array<{ name: string, role: string, produces: string[] }>,
 *   transitions: Array<{ from: string, to: string, kind: string }>, pairs: Array<{ phase: string, checkedBy: string }>,
 *   gates: Array<{ name: string, from: string, to: string, artifacts: string, condition: string, decider: string,
 *     addedBy: { requirement: string, source: string | null } | null, practice: string | null }>,
 *   roles: Array<{ name: string, filledBy: string, capabilities: string[], holders: string[] }>,
 *   branches: Record<string, string>, done: string[] }} Workflow
 */

const OWNER = "MOD-product-process";
const DECLARATION_FILE = new URL("./declaration.schema.md", import.meta.url);
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

/**
 * declarationSchema: Schema — the schema of a product's declaration docs/process.md, read from this module's data file
 * declaration.schema.md with MOD-documents' loadSchema: for reading, writing and checking the declaration through
 * MOD-documents, and for the form of UC-002.
 */
export const declarationSchema = loadSchema(disk ? disk.readFileSync(DECLARATION_FILE, "utf8") : await ownFile(DECLARATION_FILE),
  OWNER);

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming the file
// and the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}
