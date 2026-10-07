// MOD-work-plans — implementation plans, backlogs and sprints, and the state of each item
// (docs/architecture/MOD-work-plans.md): its interface. Of it, ITM-209 builds planSchemas, and planSchemas itself gives
// only backlogOrder, the schema of docs/backlog/order.md; planOrder and sprint are not built yet. ItemState, itemStates,
// startable, planFindings, backlogFindings, sprintFacts, savePlan, saveItems, saveOrder, startSprint, endSprint,
// closeSprint and workStrategies are not built yet either.
//
// Module: MOD-work-plans
//
// It belongs to Process (ARC-042). It runs unchanged in a browser and in Node. Its one read is that of its own data file
// backlog-order.schema.md — the order's schema, in MOD-documents' language —, once, when the module is loaded: from the
// disk in Node, from the module's own address in a browser. A schema that cannot be read, or that breaks the language,
// stops the module's load, as MOD-documents' file says of a broken schema: it stops that module, never a single
// document. The order itself is read by this module's callers, through MOD-documents with planSchemas.backlogOrder;
// this module reads nothing of it and writes nothing. It uses MOD-documents only through its index.mjs. Every other file
// of this folder is private to it.

// Schema, in the type below, is MOD-documents' type of that name.
import { loadSchema } from "../documents/index.mjs";

const OWNER = "MOD-work-plans";
const SCHEMA_FILE = new URL("./backlog-order.schema.md", import.meta.url);
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming the
// file and the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

/**
 * planSchemas: { backlogOrder: Schema } — the schemas MOD-work-plans gives MOD-documents and the page's forms: today
 * only backlogOrder, the schema of docs/backlog/order.md, read from this module's data file backlog-order.schema.md
 * with MOD-documents' loadSchema. planOrder and sprint are not built yet.
 */
export const planSchemas = {
  backlogOrder: loadSchema(disk ? disk.readFileSync(SCHEMA_FILE, "utf8") : await ownFile(SCHEMA_FILE), OWNER),
};
