// MOD-source-register — the register of requirement sources and a product's links (docs/architecture/MOD-source-register.md):
// its interface. Of it, ITM-217 builds what UC-002 needs: sourceSchemas, with the schema of a register entry, and
// permittedPlaces, the processing places to which the content of a source may be given. ITM-228 adds to sourceSchemas the
// schema of a product's links file. readContent, which reads a version's files with their hashes checked (content.mjs),
// and sourceStrategies with the four recipes of the book's chapters (strategies.mjs) come with the job runner. Registering
// and fetching a source's content, the recipe source-excerpt and the module's other functions are not built yet.
//
// Module: MOD-source-register
//
// It belongs to Sources and resources (ARC-045). It runs unchanged in a browser and in Node. Its reads are those of its own
// data files, the schemas in MOD-documents' language — source.schema.md, of a register entry, and links.schema.md, of a
// product's links file —, each once, when the module is loaded: from the disk in Node, from the module's own address in a
// browser. A schema that cannot be read, or that breaks the language, stops the module's load, as MOD-documents' file says
// of a broken schema: it stops that module, never a single document. A version's content is read through the host its
// caller gives (readContent); nothing is written. It uses MOD-documents only through its index.mjs. Every other file of
// this folder is private to the module.

// Schema and Document, in the types below, are MOD-documents' types of those names; Host is MOD-repository-hosts'; Strategies
// is MOD-job-runner's.
import { loadSchema } from "../documents/index.mjs";
import { strategiesOf } from "./strategies.mjs";

export { readContent } from "./content.mjs";

/**
 * One version of a source, fixed by identifier and hash: its source; its official identifier or edition and date; for a
 * fetched text its retrieval date and the publication repository's version, for a repository the commit read; each file
 * with its SHA-256 and whether it is stored; and the version's hash, the value a product's link records.
 * @typedef {{ source: string, version: string, date: string, retrieved: string | null, repositoryVersion: string | null,
 *   commit: string | null, files: Array<{ name: string, sha256: string, stored: boolean }>, hash: string }} SourceVersion
 */

const OWNER = "MOD-source-register";
const disk = globalThis.process?.getBuiltinModule?.("node:fs");

// One of the module's own files: from the disk in Node, from the module's own address in a browser.
const own = (url) => (disk ? disk.readFileSync(url, "utf8") : ownFile(url));

// In a browser: the module's own file, from the address the module itself was loaded from. Throws an Error naming the file
// and the server's status when it is not served.
async function ownFile(url) {
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(`${OWNER}: its ${url.pathname} was not served (${answer.status})`);
  return answer.text();
}

// The schemas of a register entry and of a product's links file, each loaded once, as the module is loaded.
const ENTRY = loadSchema(await own(new URL("./source.schema.md", import.meta.url)), OWNER);
const LINKS = loadSchema(await own(new URL("./links.schema.md", import.meta.url)), OWNER);

/**
 * sourceSchemas() -> { entry: Schema, links: Schema } — the schemas of a register entry `docs/sources/SRC-<slug>.md` and of a
 * product's links file `docs/sources.md`, for reading, writing and forms through MOD-documents. The links file holds one
 * table, under the product's own title: one row per linked source, with its Source, Version, Hash and Part. A Document of it
 * keeps the section under the title first, with its title set, as MOD-documents reads and writes that section.
 * @returns {{ entry: Schema, links: Schema }}
 */
export function sourceSchemas() {
  return { entry: ENTRY, links: LINKS };
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

/**
 * sourceStrategies — Partial<Strategies>: the four recipes of the book's chapters, `chapters-for-requirements` (8),
 * `chapters-for-tests` (13), `chapters-for-architecture` (9, 10, 11, 12) and `chapters-for-implementation` (9, 11, 12, 13):
 * each reads the instance's register entry SRC-vibe-coding, takes its newest version — the last row of its `## Versions` —,
 * reads that version's files through readContent, and returns one part per chapter, in the order of their numbers: the
 * whole file, naming SRC-vibe-coding as its source and the version with its hash as its pin. None of these parts may be
 * left out; a participant whose context cannot hold them is named as not fitting by the job runner. Throws as readContent
 * throws, NotRegistered { source } when the instance has no entry SRC-vibe-coding, and ChapterMissing { chapter, version }
 * when the version holds no file for a chapter.
 */
export const sourceStrategies = strategiesOf(ENTRY);
