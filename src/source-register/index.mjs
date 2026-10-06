// MOD-source-register — the register of requirement sources and a product's links (docs/architecture/MOD-source-register.md):
// its interface. Of it, ITM-217 builds what UC-002 needs: sourceSchemas, with the schema of a register entry, and
// permittedPlaces, the processing places to which the content of a source may be given. The schema of a product's links
// file, registering, fetching and reading a source's content, and the module's other functions are not built yet.
//
// Module: MOD-source-register
//
// It belongs to Sources and resources (ARC-045). It runs unchanged in a browser and in Node. Its one read is that of its own
// data file source.schema.md — the schema of a register entry, in MOD-documents' language —, once, when the module is
// loaded: from the disk in Node, from the module's own address in a browser. A schema that cannot be read, or that breaks
// the language, stops the module's load, as MOD-documents' file says of a broken schema: it stops that module, never a
// single document. Nothing else is read here, and nothing is written. It uses MOD-documents only through its index.mjs.
// Every other file of this folder is private to the module.

// Schema and Document, in the types below, are MOD-documents' types of those names.
import { loadSchema } from "../documents/index.mjs";

const OWNER = "MOD-source-register";
const ENTRY_FILE = new URL("./source.schema.md", import.meta.url);
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// The schema of a register entry, loaded once, as the module is loaded.
const ENTRY = loadSchema(disk ? disk.readFileSync(ENTRY_FILE, "utf8") : await ownFile(ENTRY_FILE), OWNER);

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming the file
// and the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

/**
 * sourceSchemas() -> { entry: Schema } — the schema of a register entry `docs/sources/SRC-<slug>.md`, for reading, writing
 * and forms through MOD-documents. The module file states `{ entry: Schema, links: Schema }`. The schema of a product's
 * links file is not part of ITM-217: the links file holds its table under the product's own title, which changes with each
 * product, while MOD-documents names a table's section by its heading line, and that gap waits for akmaier's decision.
 * Until the item that brings it, the object holds `entry` alone.
 * @returns {{ entry: Schema }}
 */
export function sourceSchemas() {
  return { entry: ENTRY };
}

// The class of a licence is its first words: `may be republished`, `restricted` or `unknown`, followed by the licence's
// name or terms. Only the first permits republishing.
const REPUBLISHABLE = /^may be republished(?![\p{L}\p{N}_])/u;

/**
 * permittedPlaces(entry: Document) -> string[] | "any" — the places a source's content may be given to: "any" for content
 * that may be republished, whose licence's class is `may be republished`, whatever places its entry names; otherwise its
 * declared places, the items of its front matter list `places` in their order; none, an empty list, when it declares none.
 * A licence of class `unknown`, or of no class the module file names, counts as restricted. A `places` written as one line
 * instead of a list declares no place. Whether a participant's place is among them is not decided here, but by
 * MOD-participant-list's eligible and MOD-product-process' declarationFindings.
 * @param {Document} entry — a register entry, as readDocument returns it with the schema sourceSchemas gives
 * @returns {string[] | "any"}
 */
export function permittedPlaces(entry) {
  const { licence, places } = entry.fields;
  if (typeof licence === "string" && REPUBLISHABLE.test(licence)) return "any";
  return Array.isArray(places) ? [...places] : [];
}
