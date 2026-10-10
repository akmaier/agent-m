// MOD-work-plans — implementation plans, backlogs and sprints, and the state of each item
// (docs/architecture/MOD-work-plans.md): its interface. Of it, nothing is built yet: planSchemas gives no schema — the
// backlog keeps no order of its own, its items are listed after the items they build on, so the schema of a stored order is
// gone —; planOrder and sprint are not built yet. ItemState, Held, itemStates, startable, heldItems, conflicts,
// planFindings, backlogFindings, sprintFacts, savePlan, saveItems, startSprint, endSprint, closeSprint and workStrategies
// are not built yet either.
//
// Module: MOD-work-plans
//
// It belongs to Process (ARC-042). It runs unchanged in a browser and in Node, and reads nothing.

/**
 * planSchemas: {} — the schemas MOD-work-plans gives MOD-documents and the page's forms: none built yet.
 */
export const planSchemas = {};
