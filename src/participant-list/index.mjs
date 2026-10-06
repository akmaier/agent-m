// MOD-participant-list — the participants of an instance and who may do a job (docs/architecture/MOD-participant-list.md):
// its interface. Of it, ITM-216 builds what UC-002 needs: the types Participant, Capability, Need and Eligibility;
// participantSchema, the schema of the instance's register docs/participants.md; and eligible, which judges the
// capabilities a role or a job needs and the processing places a restricted source or the mailbox allows
// (eligibility.mjs). ITM-230 adds participantsOf, which turns the register, as its callers read it, into the participants
// eligible takes. A Need's size and notLike are not judged yet, and differs is not built yet.
//
// Module: MOD-participant-list
//
// It belongs to Participants and jobs (ARC-046). It runs unchanged in a browser and in Node. Its one read is that of its own
// data file participants.schema.md — the register's schema, in MOD-documents' language —, once, when the module is loaded:
// from the disk in Node, from the module's own address in a browser. A schema that cannot be read, or that breaks the
// language, stops the module's load, as MOD-documents' file says of a broken schema: it stops that module, never a single
// document. Nothing else is read here, and nothing is written: the register itself is read and written by the module's
// callers, through MOD-documents with participantSchema, and participantsOf turns what they read into participants. It
// uses MOD-documents only through its index.mjs. Every other file of this folder is private to the module.

// Schema and Document, in the types below, are MOD-documents' types of those names.
import { loadSchema } from "../documents/index.mjs";

export { eligible } from "./eligibility.mjs";

/**
 * One of the six things a participant declares it can do (A PARTICIPANT DECLARES ITS CAPABILITIES).
 * @typedef {"draft text" | "read the repository" | "write to the repository" | "run code and tests" | "use tools" |
 *   "reach the web"} Capability
 */

/**
 * A participant: one row of the register, as participantsOf gives it — its name; its type, one of five; the model it uses,
 * null for a person; how many tokens its model's context holds, and its price per million input and output tokens, each
 * null where none is declared; its capabilities; where the data given to it is processed, null for a person; and how
 * Agent M reaches it.
 * @typedef {{ name: string, type: "person" | "model endpoint" | "CI agent" | "CLI agent" | "sandboxed agent",
 *   model: string | null, context: number | null, price: { input: number, output: number, currency: string } | null,
 *   capabilities: Capability[], place: string | null, route: string }} Participant
 */

/**
 * What a job or a role demands of whoever does it: the capabilities; the size of what would be sent, in tokens; for each
 * restricted source or mailbox whose content is part of the job, the places it allows — `from` names the source or
 * mailbox —; and the participants it must differ from.
 * @typedef {{ capabilities: Capability[], size?: number, places?: Array<{ from: string, allowed: string[] }>,
 *   notLike?: Participant[] }} Need
 */

/**
 * Which participants may do a job: every participant considered appears in exactly one of the two lists, and each one
 * left out with every reason.
 * @typedef {{ eligible: Participant[], leftOut: Array<{ participant: Participant, reasons: string[] }> }} Eligibility
 */

const OWNER = "MOD-participant-list";
const SCHEMA_FILE = new URL("./participants.schema.md", import.meta.url);
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// The register's schema, loaded once, as the module is loaded.
const SCHEMA = loadSchema(disk ? disk.readFileSync(SCHEMA_FILE, "utf8") : await ownFile(SCHEMA_FILE), OWNER);

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming the file
// and the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

/**
 * participantSchema() -> Schema — the schema of the instance's register docs/participants.md, read from this module's data
 * file participants.schema.md with MOD-documents' loadSchema. Callers read and write the register through MOD-documents
 * with it, and build forms from it.
 * @returns {Schema}
 */
export function participantSchema() {
  return SCHEMA;
}

// A price as the register writes it (the module file's Data, Price): `<input> / <output> <currency> per million tokens`.
const PRICE = /^(\d+(?:\.\d+)?) \/ (\d+(?:\.\d+)?) (\S+) per million tokens$/;

/**
 * participantsOf(register: Document) -> Participant[] — the participants of a register read with participantSchema, one
 * per row of its table, in its order: Name as name, Type as type, Model as model, Context as context, Price as price,
 * Capabilities as capabilities, Processing place as place, Route as route; a value left out as null, and Price as its
 * input, output and currency, null where it is not of the form `<input> / <output> <currency> per million tokens`. It
 * judges no row: a row's errors are those documentFindings names with participantSchema.
 * @param {Document} register
 * @returns {Participant[]}
 */
export function participantsOf(register) {
  return register.sections.flatMap((section) => section.rows ?? []).map(({ cells }) => ({
    name: cells.Name ?? null,
    type: cells.Type ?? null,
    model: cells.Model ?? null,
    context: cells.Context ?? null,
    price: priceOf(cells.Price),
    capabilities: cells.Capabilities ?? null,
    place: cells["Processing place"] ?? null,
    route: cells.Route ?? null,
  }));
}

// A Price cell as its input, output and currency; null when it is left out or not of the form PRICE states.
function priceOf(text) {
  const match = PRICE.exec(text ?? "");
  return match ? { input: Number(match[1]), output: Number(match[2]), currency: match[3] } : null;
}
