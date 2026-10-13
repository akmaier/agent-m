// MOD-work-plans — implementation plans, backlogs and sprints, and the state of each item
// (docs/architecture/MOD-work-plans.md): its interface. Of it, these are built: planSchemas, which gives the schema of a
// team's sprint, sprint — planOrder is not built yet —; ItemState, itemStates and startable; Held, heldItems and conflicts,
// the items the teams' sprints hold and what keeps an item from a team's selection; startSprint; and closeSprint, which does
// not add new items from the feedback yet. planFindings, backlogFindings, sprintFacts, savePlan, saveItems, endSprint and
// workStrategies are not built yet. A backlog keeps no order of its own: its items are listed after the items they build on.
//
// Module: MOD-work-plans
//
// It belongs to Process (ARC-042). It runs unchanged in a browser and in Node. Its own data file sprint.schema.md — the
// sprint's schema, in MOD-documents' language — is read once, when the module is loaded (schemas.mjs). heldItems, conflicts
// and startable read nothing themselves; startSprint and closeSprint read the product at the head they are given and commit
// through the host they are given (saves.mjs). It uses MOD-documents and MOD-product-process only through their index.mjs.
// Every other file of this folder is private to it.

// Schema, in the type below, is MOD-documents' type of that name.
import { sprintSchema } from "./schemas.mjs";

export { conflicts, heldItems } from "./sprints.mjs";
export { itemStates, startable } from "./states.mjs";
export { closeSprint, startSprint, WorkPlansError } from "./saves.mjs";

/**
 * planSchemas: { sprint: Schema } — the schemas MOD-work-plans gives MOD-documents and the page's forms: today sprint, the
 * schema of a team's sprint, docs/backlog/sprints/<team>/<nn>.md, read from this module's data file sprint.schema.md with
 * MOD-documents' loadSchema. planOrder is not built yet.
 */
export const planSchemas = { sprint: sprintSchema };
