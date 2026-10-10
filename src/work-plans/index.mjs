// MOD-work-plans — implementation plans, backlogs and sprints, and the state of each item
// (docs/architecture/MOD-work-plans.md): its interface. Of it, these are built: planSchemas, which gives the schema of a
// team's sprint, sprint — planOrder is not built yet —; Held, heldItems and conflicts, the items the teams' sprints hold and
// what keeps an item from a team's selection; and startable. ItemState, itemStates, planFindings, backlogFindings,
// sprintFacts, savePlan, saveItems, startSprint, endSprint, closeSprint and workStrategies are not built yet. A backlog keeps
// no order of its own: its items are listed after the items they build on.
//
// Module: MOD-work-plans
//
// It belongs to Process (ARC-042). It runs unchanged in a browser and in Node. Its one read is that of its own data file
// sprint.schema.md — the sprint's schema, in MOD-documents' language —, once, when the module is loaded: from the disk in
// Node, from the module's own address in a browser. A schema that cannot be read, or that breaks the language, stops the
// module's load, as MOD-documents' file says of a broken schema: it stops that module, never a single document. A sprint
// record is read by this module's callers, through MOD-documents with planSchemas.sprint; heldItems, conflicts and startable
// read nothing themselves. It uses MOD-documents and MOD-product-process only through their index.mjs. Every other file of
// this folder is private to it.

// Schema, in the type below, is MOD-documents' type of that name.
import { loadSchema } from "../documents/index.mjs";

export { conflicts, heldItems } from "./sprints.mjs";
export { startable } from "./states.mjs";

const OWNER = "MOD-work-plans";
const SPRINT_FILE = new URL("./sprint.schema.md", import.meta.url);
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming the
// file and the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

/**
 * planSchemas: { sprint: Schema } — the schemas MOD-work-plans gives MOD-documents and the page's forms: today sprint, the
 * schema of a team's sprint, docs/backlog/sprints/<team>/<nn>.md, read from this module's data file sprint.schema.md with
 * MOD-documents' loadSchema. planOrder is not built yet.
 */
export const planSchemas = {
  sprint: loadSchema(disk ? disk.readFileSync(SPRINT_FILE, "utf8") : await ownFile(SPRINT_FILE), OWNER),
};
