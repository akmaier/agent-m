// MOD-resource-list — what a product and the instance are built with and run on (docs/architecture/MOD-resource-list.md): its interface. Of it, this file
// has the type Resource, resourceSchema, the schema of the list docs/resources.md, resourceFindings (rules.mjs), what the schema cannot express, and readPin, checkPlan and
// newerState (pins.mjs). The other functions of the module — paidServices, reachableBy and the recipe resource-check — are other items'.
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
