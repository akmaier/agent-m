// MOD-work-plans — implementation plans, backlogs and sprints, and the state of each item
// (docs/architecture/MOD-work-plans.md): its interface. planSchemas gives the schemas of the plan order, backlog order
// and sprint records. ItemState, itemStates and startable are built in states.mjs; planFindings, backlogFindings,
// sprintFacts, savePlan, saveItems, saveOrder, startSprint, endSprint, closeSprint and workStrategies are not built yet.
//
// Module: MOD-work-plans
//
// It belongs to Process (ARC-042). It runs unchanged in a browser and in Node. It reads its own schema data files once
// when the module is loaded: from disk in Node, from its own address in a browser. A schema that cannot be read, or that
// breaks the language, stops the module's load, as MOD-documents' file says of a broken schema: it stops that module,
// never a single document. Its callers read the plan, backlog order and sprint records through MOD-documents with
// planSchemas; this module reads none of those records and writes nothing. It uses MOD-documents only through its
// index.mjs. Every other file of this folder is private to it.

// Schema, in the type below, is MOD-documents' type of that name.
import { loadSchema } from "../documents/index.mjs";

export { itemStates, startable } from "./states.mjs";

const OWNER = "MOD-work-plans";
const BACKLOG_ORDER_SCHEMA_FILE = new URL("./backlog-order.schema.md", import.meta.url);
const PLAN_ORDER_SCHEMA_FILE = new URL("./plan-order.schema.md", import.meta.url);
const SPRINT_SCHEMA_FILE = new URL("./sprint.schema.md", import.meta.url);
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming the
// file and the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

/**
 * planSchemas: { planOrder: Schema, backlogOrder: Schema, sprint: Schema } — the three schemas MOD-work-plans gives
 * MOD-documents and the page's forms, read from this module's own schema data files with MOD-documents' loadSchema.
 */
export const planSchemas = {
  backlogOrder: loadSchema(disk ? disk.readFileSync(BACKLOG_ORDER_SCHEMA_FILE, "utf8") : await ownFile(BACKLOG_ORDER_SCHEMA_FILE), OWNER),
  planOrder: loadSchema(disk ? disk.readFileSync(PLAN_ORDER_SCHEMA_FILE, "utf8") : await ownFile(PLAN_ORDER_SCHEMA_FILE), OWNER),
  sprint: loadSchema(disk ? disk.readFileSync(SPRINT_SCHEMA_FILE, "utf8") : await ownFile(SPRINT_SCHEMA_FILE), OWNER),
};
