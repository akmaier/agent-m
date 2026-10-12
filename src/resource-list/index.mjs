// MOD-resource-list — what a product and the instance are built with and run on (docs/architecture/MOD-resource-list.md): its interface. Of it, this file
// has the type Resource, resourceSchema, the schema of the list docs/resources.md, resourceFindings (rules.mjs), what the schema cannot express, and readPin, checkPlan and
// newerState (pins.mjs), paidServices and reachableBy. The recipe resource-check is another item's.
//
// Module: MOD-resource-list
//
// It belongs to Sources and resources (ARC-045). It runs unchanged in a browser and in Node. Its one read is that of its own data file resources.schema.md —
// the list's schema, in MOD-documents' language —, once, when the module is loaded: from the disk in Node, from the module's own address in a browser. A schema
// that cannot be read, or that breaks the language, stops the module's load, as MOD-documents' file says of a broken schema. Nothing else is read, and
// nothing is written: the lists are read and written by the module's callers, through MOD-documents with resourceSchema. It uses MOD-documents and
// MOD-text-tools only through their index.mjs. Every other file of this folder is private to the module.

// Schema, in the types below, is MOD-documents' type of that name; Finding MOD-text-tools'.
import { loadSchema } from "../documents/index.mjs";

export { resourceFindings } from "./rules.mjs";
export { checkPlan, newerState, readPin } from "./pins.mjs";

/**
 * One row of the list as MOD-documents reads it with this module's schema: its name; its kind, one of six; where it is; its pin, null for compute;
 * its licence and maintainer; the route jobs reach it by; where the data given to it is processed; whether a service it is charges per call, null for
 * a kind without the mark; and the name of its secret, never its value.
 * @typedef {{ name: string, kind: "repository" | "data" | "model" | "compute" | "endpoint" | "agent", address: string, pin: string | null,
 *   licence: string | null, maintainer: string | null, route: string, place: string | null, paid: boolean | null, secret: string | null }} Resource
 */

const OWNER = "MOD-resource-list";
const SCHEMA_FILE = new URL("./resources.schema.md", import.meta.url);
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// The list's schema, loaded once, as the module is loaded.
const SCHEMA = loadSchema(disk ? disk.readFileSync(SCHEMA_FILE, "utf8") : await ownFile(SCHEMA_FILE), OWNER);

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming the file and the server's status when it
// is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

/**
 * resourceSchema() -> Schema — the schema of the list docs/resources.md, read from this module's data file resources.schema.md with MOD-documents' loadSchema.
 * Callers read and write the list through MOD-documents with it, and build forms from it.
 * @returns {Schema}
 */
export function resourceSchema() {
  return SCHEMA;
}

/**
 * paidServices(resources) -> { name, kind: "endpoint" | "agent" | "data", address, paid: boolean }[] — every service the product calls: each endpoint and agent, and data with a
 * Paid mark, in the list's order, each marked paid or free, for MOD-result-records' recipe test-selection, so that no commit-level test reaches a paid one (COMMIT TESTS CALL NO
 * PAID SERVICE). An endpoint or agent whose Paid mark is missing — resourceFindings names that — is listed as paid: nothing not known to be free is called. Pure.
 * @param {Resource[]} resources
 * @returns {Array<{ name: string, kind: "endpoint" | "agent" | "data", address: string, paid: boolean }>}
 */
export function paidServices(resources) {
  return resources.flatMap(({ name, kind, address, paid }) => {
    if (kind === "endpoint" || kind === "agent") return [{ name, kind, address, paid: paid !== false }];
    if (kind === "data" && typeof paid === "boolean") return [{ name, kind, address, paid }];
    return [];
  });
}

const BRIDGE_OR_RUNNER = /^(?:bridge \S+|runner:\S+)$/;

/**
 * reachableBy(resources) -> { resource: string, route: string }[] — for the resources a job needs, in the list's order, the route that reaches each: `bridge <name>` or
 * `runner:<label>`, as its Route column names it, which the callers hand to MOD-runtimes' routesFor as the job's needs (A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE). A
 * resource read on its host, or an endpoint or agent called at its own address, is reached by no Bridge or runner and is not listed. Pure.
 * @param {Resource[]} resources
 * @returns {Array<{ resource: string, route: string }>}
 */
export function reachableBy(resources) {
  return resources.filter(({ route }) => BRIDGE_OR_RUNNER.test(String(route ?? ""))).map(({ name, route }) => ({ resource: name, route }));
}
