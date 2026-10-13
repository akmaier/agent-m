// The schemas MOD-work-plans owns, loaded once, when the module is loaded (docs/architecture/MOD-work-plans.md, Interfaces:
// planSchemas): planOrder, the implementation plan's order, from plan-order.schema.md, and sprint, the schema of a team's
// sprint, from sprint.schema.md — from the disk in Node, from the module's own address in a browser. A schema that cannot
// be read, or that breaks the language, stops the module's load.
//
// Module: MOD-work-plans

import { loadSchema } from "../documents/index.mjs";

const OWNER = "MOD-work-plans";
const PLAN_ORDER_FILE = new URL("./plan-order.schema.md", import.meta.url);
const SPRINT_FILE = new URL("./sprint.schema.md", import.meta.url);
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming the
// file and the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

export const planOrderSchema = loadSchema(disk ? disk.readFileSync(PLAN_ORDER_FILE, "utf8") : await ownFile(PLAN_ORDER_FILE), OWNER);
export const sprintSchema = loadSchema(disk ? disk.readFileSync(SPRINT_FILE, "utf8") : await ownFile(SPRINT_FILE), OWNER);
