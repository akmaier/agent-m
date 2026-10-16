// MOD-source-register — the register of requirement sources and a product's links (docs/architecture/MOD-source-register.md):
// its interface. Of it, ITM-217 builds what UC-002 needs: sourceSchemas, with the schema of a register entry, and
// permittedPlaces, the processing places to which the content of a source may be given. ITM-228 adds to sourceSchemas the
// schema of a product's links file. readContent, which reads a version's files with their hashes checked (content.mjs),
// linkedVersion, and sourceStrategies with the recipe source-excerpt and the four recipes of the book's chapters
// (strategies.mjs) come with the job runner. ITM-315 adds sourceFindings, the requirements that name no source the product
// links. ITM-313 adds recogniseLegalText (legal-text.mjs), the CELEX number or ELI an EUR-Lex or ELI address names. ITM-383 adds
// personSource, the source of the person who gives an instruction. ITM-552 adds personAccount, the account personSource takes. ITM-314 adds registrationCommits, the commit plan of a
// registration. Fetching a source's content, a new version and the module's other functions are not built yet.
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
import { loadSchema, writeDocument } from "../documents/index.mjs";
import { finding, sha256 } from "../text-tools/index.mjs";
import { strategiesOf } from "./strategies.mjs";
import { failure, filesOf, unquoted, versionHash, versionRecord } from "./content.mjs";

export { readContent } from "./content.mjs";
export { fetchLegalText, recogniseLegalText } from "./legal-text.mjs";

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
 * registrationCommits(entry: Document, files: { name: string, bytes: Uint8Array, keep: boolean }[], instance: string) ->
 * Promise<CommitPlan> — what to commit where when a source is registered: the register entry with its first version, and the
 * files. The entry is the one the form builds: its `## Versions` holds the first version's row — version, date, edition, read
 * from —, whose cell Files this function fills with the number of files, `listed below`, the version's hash, and the files
 * only hashed after `not stored:`; under `### Files of <version>` it lists every file with the SHA-256 of its bytes. A file
 * with `keep` goes to `docs/sources/<id>/<version>/<name>` of the instance when the licence permits republishing, of the
 * entry's `content_repository` otherwise; a file without it goes nowhere, since the person only hashed it. The entry goes to the
 * instance, first in the plan. Throws ContentRepositoryMissing { source } for a file to keep of a restricted source whose entry
 * names no content repository, and TypeError for an entry whose `## Versions` holds no row.
 * @param {Document} entry
 */
export async function registrationCommits(entry, files, instance) {
  const versions = entry.sections.find((section) => section.heading === "## Versions");
  const first = versions?.rows?.[0];
  if (!first) throw new TypeError("registrationCommits: the entry's ## Versions holds the row of its first version");
  const kept = files.filter((file) => file.keep);
  const holder = permittedPlaces(entry) === "any" ? instance : entry.fields.content_repository;
  if (kept.length && !holder) {
    throw failure("ContentRepositoryMissing", `${entry.id} is restricted, and its entry names no repository for its files`, { source: entry.id });
  }
  const listed = await Promise.all(files.map(async (file) => ({ name: file.name, sha256: await sha256(file.bytes) })));
  const version = unquoted(first.cells.Version);
  const unstored = files.filter((file) => !file.keep).map((file) => file.name);
  const count = listed.length === 1 ? "1 file" : `${listed.length} files`;
  const cell = `${count}, listed below; version hash \`${await versionHash(listed)}\``
    + (unstored.length ? `; not stored: ${unstored.join(", ")}` : "");
  const rows = [{ ...first, cells: { ...first.cells, Files: cell } }];
  const table = ["| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
    `| ${["Version", "Date", "Edition", "Read from", "Files"].map((column) => rows[0].cells[column] ?? "—").join(" | ")} |`];
  const block = [`### Files of ${version}`, "", "| File | SHA-256 |", "|---|---|",
    ...listed.map((file) => `| \`${file.name}\` | \`${file.sha256}\` |`)];
  const text = `\n${[...table, "", ...block].join("\n")}\n\n`;
  // The first version is being written, not appended to a record that stands: the row as the form gave it is no row of the
  // record yet, so the body is written without the section it stood in.
  const body = String(entry.body ?? "").replace(/^## Versions\n[\s\S]*?(?=^## |(?![\s\S]))/m, "");
  const entryFile = writeDocument(ENTRY, { ...entry, body, sections: entry.sections.map((section) => (section === versions
    ? { ...section, text, rows } : section)) });
  const plan = new Map([[instance, [{ path: `docs/sources/${entry.id}.md`, content: entryFile }]]]);
  for (const file of kept) {
    if (!plan.has(holder)) plan.set(holder, []);
    plan.get(holder).push({ path: `docs/sources/${entry.id}/${version}/${file.name}`, content: file.bytes });
  }
  return [...plan].map(([repository, planned]) => ({ repository, files: planned }));
}

const versionColumns = ["Version", "Date", "Edition", "Read from", "Files"];

async function listedFiles(files) {
  return Promise.all(files.map(async (file) => ({ name: file.name, sha256: await sha256(file.bytes) })));
}

function filesCell(files, listed, hash) {
  const unstored = files.filter((file) => !file.keep).map((file) => file.name);
  const count = listed.length === 1 ? "1 file" : `${listed.length} files`;
  return `${count}, listed below; version hash \`${hash}\`${unstored.length ? `; not stored: ${unstored.join(", ")}` : ""}`;
}

function rowLine(cells) {
  return `| ${versionColumns.map((column) => cells[column] ?? "-").join(" | ")} |`;
}

function filesBlock(version, listed) {
  return [`### Files of ${version}`, "", "| File | SHA-256 |", "|---|---|",
    ...listed.map((file) => `| \`${file.name}\` | \`${file.sha256}\` |`)];
}

function appendVersionSection(text, cells, block) {
  const leading = String(text ?? "").startsWith("\n") ? "\n" : "";
  const lines = String(text ?? "").replace(/^\n/, "").split("\n");
  const table = lines.findIndex((line) => /^\|\s*Version\s*\|/.test(line.trim()));
  if (table < 0) throw new TypeError("versionCommits: the entry's ## Versions holds no version table");
  let insert = table + 2;
  while (insert < lines.length && /^\|/.test(lines[insert].trim())) insert += 1;
  lines.splice(insert, 0, rowLine(cells));
  while (lines.length && lines.at(-1) === "") lines.pop();
  lines.push("", ...block, "");
  return `${leading}${lines.join("\n")}`;
}

function readFrom(version) {
  if (version?.readFrom) return String(version.readFrom);
  if (version?.retrieved || version?.repositoryVersion) {
    const parts = ["publication repository"];
    if (version.retrieved) parts.push(`retrieved ${version.retrieved}`);
    if (version.repositoryVersion) parts.push(`version ${version.repositoryVersion}`);
    return parts.join(", ");
  }
  return "-";
}

/**
 * versionCommits(entry: Document, files: { name: string, bytes: Uint8Array, keep: boolean }[], version: { version: string,
 * date: string }) -> Promise<CommitPlan> — what to commit when a source receives a new version: the entry with one row
 * appended to `## Versions`, the new version's file hashes under `### Files of <version>`, and the kept files in the
 * repository that holds the content. `version.repository`, when supplied by the caller, names the instance repository
 * that holds the register entry; without it the plan uses the empty string for that current instance. Throws SameBytes
 * { version } when the file set equals an already recorded version.
 * @param {Document} entry
 */
export async function versionCommits(entry, files, version) {
  const versions = entry.sections.find((section) => section.heading === "## Versions");
  if (!versions) throw new TypeError("versionCommits: the entry holds no ## Versions section");
  const listed = await listedFiles(files);
  const hash = await versionHash(listed);
  for (const row of versions.rows ?? []) {
    const existing = unquoted(row.cells.Version);
    if (await versionHash(filesOf(versions, existing)) === hash) {
      throw failure("SameBytes", `${entry.id} already records the same bytes as ${existing}`, { version: existing });
    }
  }
  const kept = files.filter((file) => file.keep);
  const instance = typeof version?.repository === "string" ? version.repository : "";
  const holder = permittedPlaces(entry) === "any" ? instance : entry.fields.content_repository;
  if (kept.length && !holder) {
    throw failure("ContentRepositoryMissing", `${entry.id} is restricted, and its entry names no repository for its files`, { source: entry.id });
  }
  const id = String(version?.version ?? "");
  if (!id) throw new TypeError("versionCommits: version.version is required");
  const cells = {
    Version: `\`${id}\``,
    Date: String(version?.date ?? ""),
    Edition: String(version?.edition ?? "-"),
    "Read from": readFrom(version),
    Files: filesCell(files, listed, hash),
  };
  const section = { ...versions, text: appendVersionSection(versions.text, cells, filesBlock(id, listed)),
    rows: [...(versions.rows ?? []), { cells }] };
  const entryFile = writeDocument(ENTRY, { ...entry, sections: entry.sections.map((each) => (each === versions ? section : each)) });
  const plan = new Map([[instance, [{ path: entry.path, content: entryFile }]]]);
  for (const file of kept) {
    if (!plan.has(holder)) plan.set(holder, []);
    plan.get(holder).push({ path: `docs/sources/${entry.id}/${id}/${file.name}`, content: file.bytes });
  }
  return [...plan].map(([repository, planned]) => ({ repository, files: planned }));
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

/**
 * personAccount(instance: Snapshot) -> string | null — the account `<server>/<account>` of the person who gives an instruction, which
 * personSource takes: the owner of the instance's repository — the first segment of its path — on the host of its origin, `github.com`
 * on GitHub where the address names no origin. Null where the snapshot names no owner, and for a server whose host it does not name.
 * No request is made.
 * @param {{ repository?: { server?: string, origin?: string, path?: string } }} instance — a MOD-repository-hosts Snapshot
 * @returns {string | null}
 */
export function personAccount(instance) {
  const owner = String(instance.repository?.path ?? "").split("/")[0];
  if (!owner) return null;
  let server = instance.repository?.server === "github" ? "github.com" : null;
  try { server = new URL(instance.repository?.origin).host || server; } catch { /* use the canonical GitHub host above */ }
  return server ? `${server}/${owner}` : null;
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
