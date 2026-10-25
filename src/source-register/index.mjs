// MOD-source-register — the register of requirement sources and a product's links (docs/architecture/MOD-source-register.md):
// its interface. It gives sourceSchemas, the schemas of a register entry and of a product's links file; permittedPlaces, the
// processing places to which the content of a source may be given; readContent, which reads a version's files with their hashes
// checked (content.mjs); linkedVersion; sourceStrategies, the recipe source-excerpt and the recipes of the book's chapters
// (strategies.mjs); sourceFindings, the requirements that name no source the product links; recogniseLegalText and
// fetchLegalText (legal-text.mjs), the CELEX number or ELI an EUR-Lex or ELI address names and the official text; personSource,
// the source of the person who gives an instruction, and personAccount, the account personSource takes (person.mjs, which this
// file re-exports); registrationCommits and versionCommits, the commit plans of a registration and of a new version, a file
// that was only hashed recorded with the note where its copy is kept; and affectedRequirements and changedPassages. Every
// function the module file's Interfaces names is built.
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
import { finding, lineDiff, sha256 } from "../text-tools/index.mjs";
import { parseSpec } from "../spec-document/index.mjs";
import { strategiesOf } from "./strategies.mjs";
import { commitOf, failure, filesOf, linkOf, unquoted, versionHash, versionRecord } from "./content.mjs";

export { readContent } from "./content.mjs";
export { personAccount, personSource } from "./person.mjs";
export { fetchLegalText, recogniseLegalText } from "./legal-text.mjs";

/**
 * One version of a source, fixed by identifier and hash: its source; its official identifier or edition and date; for a
 * fetched text its retrieval date and the publication repository's version, for a repository the commit read; each file
 * with its SHA-256 and whether it is stored; and the version's hash, the value a product's link records.
 * @typedef {{ source: string, version: string, date: string, retrieved: string | null, repositoryVersion: string | null,
 *   commit: string | null, files: Array<{ name: string, sha256: string, stored: boolean }>, hash: string }} SourceVersion
 */

const OWNER = "MOD-source-register";
const REGISTER_ENTRY = /^docs\/sources\/SRC-[^/]+\.md$/;
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
 * registerPaths(paths: string[]) -> string[] — the paths among `paths` that are register entries, `docs/sources/SRC-<slug>.md`,
 * in their order: a caller that holds a tree's paths names the register's files without a copy of the pattern. No request is made.
 * @param {string[]} paths
 * @returns {string[]}
 */
export function registerPaths(paths) {
  return (paths ?? []).filter((path) => REGISTER_ENTRY.test(path));
}

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

// Two repository addresses name the same repository when they are equal once a trailing slash, a trailing `.git` and the case of the text are left out.
const sameRepository = (a, b) => {
  const plain = (address) => String(address ?? "").trim().toLowerCase().replace(/\/+$/, "").replace(/\.git$/, "").replace(/\/+$/, "");
  return plain(a) !== "" && plain(a) === plain(b);
};

/**
 * restrictedPlaces(register, product) -> { sources, contents } — the `places.sources` and `places.contents` of MOD-job-runner's JobContext, in one place for every caller (RESTRICTED CONTENT GOES ONLY
 * WHERE ITS SOURCE PERMITS). `register` is every entry of the instance's register, whether or not the product links it; `product` the product's address. For each entry whose content may not be
 * republished — an unknown licence counts as restricted —, `sources` gives, by its identifier and in the register's order, the places permittedPlaces gives (an empty list where it declares none).
 * `contents` gives a restricted source's content only where the product holds it: when the entry's `content_repository` is the repository `product` names, the folder `docs/sources/<identifier>/`
 * of the product; a source whose content lies in another repository has no entry. Pure: no request is made.
 * @param {Document[]} register — the register's entries, as readDocument returns them with the schema sourceSchemas gives
 * @param {string} product — the product's address
 * @returns {{ sources: Record<string, string[]>, contents: { source: string, paths: string[] }[] }}
 */
export function restrictedPlaces(register, product) {
  const sources = {}, contents = [];
  for (const entry of register) {
    const allowed = permittedPlaces(entry);
    if (allowed === "any") continue;
    sources[entry.id] = allowed;
    if (sameRepository(entry.fields.content_repository, product)) contents.push({ source: entry.id, paths: [`docs/sources/${entry.id}`] });
  }
  return { sources, contents };
}

/**
 * registrationCommits(entry: Document, files: { name: string, bytes: Uint8Array, keep: boolean, note?: string }[], instance:
 * string) -> Promise<CommitPlan> — what to commit where when a source is registered: the register entry with its first version,
 * and the files. The entry is the one the form builds: its `## Versions` holds the first version's row — version, date, edition,
 * read from —, whose cell Files this function fills with the number of files, `listed below`, the version's hash, and the files
 * only hashed after `not stored:`; under `### Files of <version>` it lists every file with the SHA-256 of its bytes and, in the
 * column `Kept at`, the `note` of a file only hashed (each line break in it written as one space, a `|` in it written `\|`) and
 * `—` for a file kept. A file with `keep` goes
 * to `docs/sources/<id>/<version>/<name>` of the instance when the licence permits republishing, of the entry's
 * `content_repository` otherwise; a file without it goes nowhere, since the person only hashed it. The entry goes to the
 * instance, first in the plan. Throws NoteMissing { file } for a file not kept that has no note (a note of blanks is none),
 * ContentRepositoryMissing { source } for a file to keep of a restricted source whose entry names no content repository, and
 * TypeError for an entry whose `## Versions` holds no row.
 * @param {Document} entry
 */
export async function registrationCommits(entry, files, instance) {
  const versions = entry.sections.find((section) => section.heading === "## Versions");
  const first = versions?.rows?.[0];
  if (!first) throw new TypeError("registrationCommits: the entry's ## Versions holds the row of its first version");
  requireNotes(files);
  const kept = files.filter((file) => file.keep);
  const holder = permittedPlaces(entry) === "any" ? instance : entry.fields.content_repository;
  if (kept.length && !holder) {
    throw failure("ContentRepositoryMissing", `${entry.id} is restricted, and its entry names no repository for its files`, { source: entry.id });
  }
  const listed = await listedFiles(files);
  const version = unquoted(first.cells.Version);
  const cell = filesCell(files, listed, await versionHash(listed));
  const rows = [{ ...first, cells: { ...first.cells, Files: cell } }];
  const table = ["| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
    `| ${["Version", "Date", "Edition", "Read from", "Files"].map((column) => rows[0].cells[column] ?? "—").join(" | ")} |`];
  const block = filesBlock(version, listed);
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

// A file that is not kept goes nowhere, so a note must say where its copy is kept; a file without one is refused by name.
function requireNotes(files) {
  const missing = files.find((file) => !file.keep && !(typeof file.note === "string" && file.note.trim() !== ""));
  if (missing) {
    throw failure("NoteMissing", `${missing.name} is only hashed, and no note says where its copy is kept`, { file: missing.name });
  }
}

// Each file with the SHA-256 of its bytes and the cell of its row under `### Files of <version>`, `Kept at`: the note of a file
// that is not kept, each line break in it written as one space (a row stays one line) and a `|` in it written `\|`, and `—`
// for a file that is kept.
async function listedFiles(files) {
  return Promise.all(files.map(async (file) => ({ name: file.name, sha256: await sha256(file.bytes),
    keptAt: file.keep ? "—" : file.note.replace(/\r\n|\r|\n/g, " ").replace(/\|/g, "\\|") })));
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
  return [`### Files of ${version}`, "", "| File | SHA-256 | Kept at |", "|---|---|---|",
    ...listed.map((file) => `| \`${file.name}\` | \`${file.sha256}\` | ${file.keptAt} |`)];
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

function readFrom(entry, version) {
  if (version?.commit) return [entry.fields.identifier, `commit ${version.commit}`].filter(Boolean).join(" ");
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
 * versionCommits(entry: Document, files: { name: string, bytes: Uint8Array, keep: boolean, note?: string }[], version: {
 * version: string, date: string, commit?: string }) -> Promise<CommitPlan> — what to commit when a source receives a new version: the entry
 * with one row appended to `## Versions`, the new version's file hashes under `### Files of <version>` — with the `note` of
 * a file not kept in the column `Kept at`, as registrationCommits writes it —, and the kept files in the repository that
 * holds the content. `version.repository`, when supplied by the caller, names the instance repository that holds the
 * register entry; without it the plan uses the empty string for that current instance. For a source of kind repository,
 * `version.commit` is the commit read: the row's `Read from` records it after the entry's `identifier`, `<address> commit
 * <commit>`, and the files may be none, since the version's bytes are that commit. Throws SameBytes { version } when the file
 * set — or, with a commit, the commit instead — equals that of an already recorded version, VersionExists { version } when
 * `version.version` is the identifier of an existing version whose bytes differ, and NoteMissing { file } for a file not
 * kept that has no note.
 * @param {Document} entry
 */
export async function versionCommits(entry, files, version) {
  const versions = entry.sections.find((section) => section.heading === "## Versions");
  if (!versions) throw new TypeError("versionCommits: the entry holds no ## Versions section");
  requireNotes(files);
  const listed = await listedFiles(files);
  const hash = await versionHash(listed);
  const commit = typeof version?.commit === "string" && version.commit !== "" ? version.commit : null;
  for (const row of versions.rows ?? []) {
    const existing = unquoted(row.cells.Version);
    // A version of a repository is that commit: its bytes are compared by the commit, not by a file set, which it may not have.
    const same = commit !== null ? commitOf(row) === commit : await versionHash(filesOf(versions, existing)) === hash;
    if (same) {
      throw failure("SameBytes", `${entry.id} already records the same bytes as ${existing}`, { version: existing });
    }
  }
  const id = String(version?.version ?? "");
  // An identifier names one version (A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH): bytes that differ under an identifier an existing version has would
  // plan that version's own files again. SameBytes, checked above, keeps precedence.
  if (id && (versions.rows ?? []).some((row) => unquoted(row.cells.Version) === id)) {
    throw failure("VersionExists", `${entry.id} already records a version ${id}, with other bytes`, { version: id });
  }
  const kept = files.filter((file) => file.keep);
  const instance = typeof version?.repository === "string" ? version.repository : "";
  const holder = permittedPlaces(entry) === "any" ? instance : entry.fields.content_repository;
  if (kept.length && !holder) {
    throw failure("ContentRepositoryMissing", `${entry.id} is restricted, and its entry names no repository for its files`, { source: entry.id });
  }
  if (!id) throw new TypeError("versionCommits: version.version is required");
  const cells = {
    Version: `\`${id}\``,
    Date: String(version?.date ?? ""),
    Edition: String(version?.edition ?? "-"),
    "Read from": readFrom(entry, version),
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

// Whether a requirement's source item names the source called `name`: the item begins with it, followed by the end of the item
// or by `, ` and the part it draws on. The one grammar, read through entryNamed by linkedVersion, sourceFindings and affectedRequirements.
const namesSource = (item, name) => item === name || item.startsWith(`${name}, `);

// The register entry a source item names: the one whose identifier, title or — for a standard — designation the item begins
// with, the longest such match, followed by the end of the item or by `, ` and the part it draws on; null when the item
// begins with no entry's name.
function entryNamed(register, item) {
  let entry = null, longest = -1;
  for (const each of register) {
    for (const name of namesOf(each)) {
      if (namesSource(item, name) && name.length > longest) [entry, longest] = [each, name.length];
    }
  }
  return entry;
}

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
 * affectedRequirements(spec: string, register: Document[], source: string) -> string[] — the names of the requirements one of whose
 * source items names the source, in the SPEC's order, as MOD-spec-document's parseSpec reads them. `source` is read as linkedVersion
 * reads it: the register entry whose identifier, title or — for a standard — designation it begins with, the longest such match,
 * followed by the end or by `, ` and a part (entryNamed). An item names the source when the entry the item names, read the same way,
 * is that entry — the one grammar of linkedVersion and sourceFindings. Empty when `source` names no register entry.
 * @param {string} spec — the text of a SPEC
 * @param {Document[]} register — the instance's register entries
 * @param {string} source — an identifier, a title, a designation, or an item of a requirement's source
 * @returns {string[]}
 */
export function affectedRequirements(spec, register, source) {
  const entry = entryNamed(register, source);
  if (!entry) return [];
  return [...parseSpec(spec).requirements.values()]
    .filter((requirement) => requirement.sources.some((item) => entryNamed(register, item) === entry))
    .map((requirement) => requirement.name);
}

/**
 * changedPassages(before: string, after: string) -> DiffLine[] — the passages that changed between two versions of a text, line by
 * line: MOD-text-tools' lineDiff of the two texts without its `same` lines.
 * @param {string} before
 * @param {string} after
 * @returns {Array<{ op: "added" | "removed", text: string, before: number | null, after: number | null }>}
 */
export function changedPassages(before, after) {
  return lineDiff(before, after).filter((line) => line.op !== "same");
}

const REGISTERED_SOURCE = "A REQUIREMENT HAS A REGISTERED SOURCE";
const TERMS_ENTER_AS_SOURCE = "A RESOURCE'S TERMS ENTER AS A SOURCE";
// A resource entry's identifier at the start of a source item, followed by the end of the item or by `, ` and the part, as an
// item names a register entry (namesSource): a resource entry is never a source, whatever the other items name.
const RESOURCE_ITEM = /^(RES-[a-z0-9]+(?:-[a-z0-9]+)*)(?:$|, )/;

/**
 * sourceFindings(requirements: Requirement[], links: Document, register: Document[]) -> Finding[] — an error under A
 * REQUIREMENT HAS A REGISTERED SOURCE for each requirement none of whose source items names a source the product links,
 * naming the requirement, its line and its items; a requirement with no source item names none. And an error under A
 * RESOURCE'S TERMS ENTER AS A SOURCE for each resource entry (RES-…) a source item names, beside a linked source or not. An item names the register
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
    const resources = [...new Set(items.map((item) => RESOURCE_ITEM.exec(item)?.[1]).filter(Boolean))];
    return [
      ...(linked ? [] : [finding({ artifact: requirement.name, line: requirement.line, kind: "error", rule: REGISTERED_SOURCE,
        what: items.length ? `no source item names a source the product links: ${items.map((item) => `"${item}"`).join("; ")}`
          : "it names no source",
        fix: "begin a source item with the identifier, the title or the designation of a register entry that the product links" })]),
      ...resources.map((resource) => finding({ artifact: requirement.name, line: requirement.line, kind: "error",
        rule: TERMS_ENTER_AS_SOURCE, what: `the source names the resource entry ${resource}`,
        fix: "name the registered source of its terms (SRC-…), linked to the product, in its place" })),
    ];
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
