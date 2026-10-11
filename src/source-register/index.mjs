// MOD-source-register — the register of requirement sources and a product's links (docs/architecture/MOD-source-register.md):
// its interface. Of it, ITM-217 builds what UC-002 needs: sourceSchemas, with the schema of a register entry, and
// permittedPlaces, the processing places to which the content of a source may be given. ITM-228 adds to sourceSchemas the
// schema of a product's links file. readContent, which reads a version's files with their hashes checked (content.mjs),
// linkedVersion, and sourceStrategies with the recipe source-excerpt and the four recipes of the book's chapters
// (strategies.mjs) come with the job runner. ITM-315 adds sourceFindings, the requirements that name no source the product
// links. ITM-313 adds recogniseLegalText (legal-text.mjs), the CELEX number or ELI an EUR-Lex or ELI address names. ITM-383 adds
// personSource, the source of the person who gives an instruction. Registering and fetching a source's content and the
// module's other functions are not built yet.
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
// is MOD-job-runner's; Requirement is MOD-spec-document's and Finding MOD-text-tools'.
import { loadSchema } from "../documents/index.mjs";
import { finding } from "../text-tools/index.mjs";
import { strategiesOf } from "./strategies.mjs";
import { unquoted, versionRecord } from "./content.mjs";

export { readContent } from "./content.mjs";
export { recogniseLegalText } from "./legal-text.mjs";

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

// The names an entry goes by in a requirement's source item: its identifier, its title, and a standard's designation.
const namesOf = (entry) => [entry.id, entry.fields.title, entry.fields.kind === "standard" ? entry.fields.designation : null]
  .filter((name) => typeof name === "string" && name !== "");

// The register entry a source item names: the one whose identifier, title or — for a standard — designation the item begins
// with, the longest such match, followed by the end of the item or by `, ` and the part it draws on; null when the item
// begins with no entry's name.
function entryNamed(register, item) {
  let entry = null, longest = -1;
  for (const each of register) {
    for (const name of namesOf(each)) {
      if ((item === name || item.startsWith(`${name}, `)) && name.length > longest) [entry, longest] = [each, name.length];
    }
  }
  return entry;
}

// The row of a product's links file that links a register entry, or undefined when the product links none of it.
const linkOf = (links, entry) => links.sections.flatMap((section) => section.rows ?? [])
  .find((row) => unquoted(row.cells.Source) === entry.id);

/**
 * linkedVersion(links: Document, register: Document[], source: string) -> LinkedVersion | null — the version a product links
 * of the source that `source` names, an identifier or an item of a requirement's source: the register entry whose
 * identifier, title or — for a standard — designation the item begins with, the longest such match, followed by the end of
 * the item or by `, ` and the part it draws on. The version is the one the product's link names, with the hash its link
 * records, and the part the link names that applies, or null. Null when `source` names no register entry, or the product
 * links none of it, or the entry records no version the link names.
 * @param {Document} links — a product's links file, read with the schema sourceSchemas gives
 * @param {Document[]} register — the instance's register entries
 * @param {string} source
 * @returns {{ source: Document, version: SourceVersion, part: string | null } | null}
 */
export function linkedVersion(links, register, source) {
  const entry = entryNamed(register, source);
  if (!entry) return null;
  const link = linkOf(links, entry);
  if (!link) return null;
  const version = versionRecord(entry, unquoted(link.cells.Version), unquoted(link.cells.Hash));
  if (!version) return null;
  const part = typeof link.cells.Part === "string" && link.cells.Part.trim() ? link.cells.Part.trim() : null;
  return { source: entry, version, part };
}

/**
 * personSource(links: Document, register: Document[], account: string) -> string | null — the identifier of the register entry of
 * kind `person` whose `identifier` is `account`, the person's account on a repository server written `<server>/<account>`, such
 * as github.com/akmaer, and which the product links — its links file holds a row for the entry —: the source of the person who
 * gives an instruction (THE PERSON WHO PROMPTS IS A SOURCE). Null when there is none: no entry of that account, an entry of
 * that account the product does not link, an entry of another kind, or no account. The account is compared whole, as written;
 * of two entries of one account, the linked one answers.
 * @param {Document} links — a product's links file, read with the schema sourceSchemas gives
 * @param {Document[]} register — the instance's register entries
 * @param {string} account
 * @returns {string | null}
 */
export function personSource(links, register, account) {
  if (typeof account !== "string" || account === "") return null;
  const entry = register.find((each) => each.fields.kind === "person" && each.fields.identifier === account
    && linkOf(links, each) !== undefined);
  return entry ? entry.id : null;
}

const REGISTERED_SOURCE = "A REQUIREMENT HAS A REGISTERED SOURCE";

/**
 * sourceFindings(requirements: Requirement[], links: Document, register: Document[]) -> Finding[] — an error under A
 * REQUIREMENT HAS A REGISTERED SOURCE for each requirement none of whose source items names a source the product links,
 * naming the requirement, its line and its items; a requirement with no source item names none. An item names the register
 * entry whose identifier, title or — for a standard — designation it begins with, the longest such match, followed by the
 * end of the item or by `, ` and the part; the product links the source when its links file holds a row for that entry.
 * @param {Array<{ name: string, sources: string[], line: number }>} requirements — as MOD-spec-document's parseSpec reads them
 * @param {Document} links — a product's links file, read with the schema sourceSchemas gives
 * @param {Document[]} register — the instance's register entries
 */
export function sourceFindings(requirements, links, register) {
  return requirements.flatMap((requirement) => {
    const items = requirement.sources ?? [];
    const linked = items.some((item) => {
      const entry = entryNamed(register, item);
      return entry !== null && linkOf(links, entry) !== undefined;
    });
    if (linked) return [];
    return [finding({ artifact: requirement.name, line: requirement.line, kind: "error", rule: REGISTERED_SOURCE,
      what: items.length ? `no source item names a source the product links: ${items.map((item) => `"${item}"`).join("; ")}`
        : "it names no source",
      fix: "begin a source item with the identifier, the title or the designation of a register entry that the product links" })];
  });
}

/**
 * sourceStrategies — Partial<Strategies>: the recipe source-excerpt — the text of the version a product links of the source
 * a job names, as one part naming the source, read where its content lies; NotLinked { source } for a source the product
 * does not link — and the four recipes of the book's chapters, `chapters-for-requirements` (8),
 * `chapters-for-tests` (13), `chapters-for-architecture` (9, 10, 11, 12) and `chapters-for-implementation` (9, 11, 12, 13):
 * each reads the instance's register entry SRC-vibe-coding, takes its newest version — the last row of its `## Versions` —,
 * reads that version's files through readContent, and returns one part per chapter, in the order of their numbers: the
 * whole file, naming SRC-vibe-coding as its source and the version with its hash as its pin. None of these parts may be
 * left out; a participant whose context cannot hold them is named as not fitting by the job runner. Throws as readContent
 * throws, NotRegistered { source } when the instance has no entry SRC-vibe-coding, and ChapterMissing { chapter, version }
 * when the version holds no file for a chapter.
 */
export const sourceStrategies = strategiesOf({ entry: ENTRY, links: LINKS, linkedVersion, permittedPlaces });
