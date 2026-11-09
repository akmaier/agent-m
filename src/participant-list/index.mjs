// MOD-participant-list — the participants of an instance and who may do a job (docs/architecture/MOD-participant-list.md):
// its interface: the types Participant, Connection, Capability, Need and Eligibility; participantSchema, the schema of the
// instance's register docs/participants.md; participantsOf, which joins the register, as its callers read it, with the
// connections that offer its agents' models; eligible, which judges whether a connection offers an agent's model, the
// capabilities a role or a job needs, the processing places a restricted source or the mailbox allows, the size of the job
// a participant's context must hold and the participants it must differ from; and differs (eligibility.mjs, which also joins participantsOf).
//
// Module: MOD-participant-list
//
// It belongs to Participants and jobs (ARC-046). It runs unchanged in a browser and in Node. Its one read is that of its own
// data file participants.schema.md — the register's schema, in MOD-documents' language —, once, when the module is loaded:
// from the disk in Node, from the module's own address in a browser. A schema that cannot be read, or that breaks the
// language, stops the module's load, as MOD-documents' file says of a broken schema: it stops that module, never a single
// document. Nothing else is read here, and nothing is written: the register itself is read and written by the module's
// callers, through MOD-documents with participantSchema, the connections by MOD-prompt-bar's endpointsOffered and
// sessionsOffered, and participantsOf joins what they read. It uses MOD-documents only through its index.mjs. Every other
// file of this folder is private to the module.

// Schema and Document, in the types below, are MOD-documents' types of those names.
import { loadSchema } from "../documents/index.mjs";

export { differs, eligible, participantsOf } from "./eligibility.mjs";

/**
 * One of the six things a connection declares it can do (A CONNECTION DECLARES ITS CAPABILITIES).
 * @typedef {"draft text" | "read the repository" | "write to the repository" | "run code and tests" | "use tools" |
 *   "reach the web"} Capability
 */

/**
 * One model that one connection offers, as a browser's settings declare it — a model endpoint offers one, a coding agent of
 * a Bridge or on CI one for each model it can run: the connection's name, `<endpoint>`, `<bridge>:<agent>` or `<name>`; its type; the model
 * and how many tokens its context holds; the connection's capabilities and the place where it processes data; and its
 * route, `endpoint <name>`, with ` secret <NAME>` where its settings name the CI secret of its key, or
 * `bridge <bridge> agent <agent>`, or `ci hosted agent <agent> secret <NAME>` or `ci runner:<label> agent <agent> secret <NAME>`.
 * @typedef {{ name: string, type: "model endpoint" | "CLI agent" | "CI agent", model: string, context: number,
 *   capabilities: Capability[], place: string, route: string }} Connection
 */

/**
 * Who does a job and where it runs: a person of the register, with no model, context, capabilities, place or route; an
 * agent of the register on one connection that offers its model, with the agent's name and model and the connection's
 * type, context, capabilities, place and route; an agent that no connection given offers its model, of the type `agent`,
 * with no context, capabilities, place or route; or a connection the prompt bar offers, which has this shape already.
 * @typedef {{ name: string, type: "person" | "agent" | "model endpoint" | "CLI agent" | "CI agent", model: string | null,
 *   context: number | null, capabilities: Capability[], place: string | null, route: string | null }} Participant
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
