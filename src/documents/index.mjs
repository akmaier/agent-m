// MOD-documents — documents, records and registers from their schemas (docs/architecture/MOD-documents.md): its interface. Of
// it, ITM-213 builds what UC-002's modules need: the schema language with Schema, Document and Row, loadSchema, readDocument,
// writeDocument and readRegister. ITM-227 adds the `rule` of the schema language and documentFindings, for the front matter,
// the values, the rows of a table and the sections (checks.mjs). ITM-226 adds the section under the title, and a section's
// table found by its header row. ITM-252 adds appendSection, and, for a section's or an appended section's fields, a key
// that is words of a front matter key's form separated by single spaces, such as `gate record` — a front matter key itself
// stays as MOD-text-tools states it. classifyCandidates, artifactSchemas and the schemas this module owns are not built yet.
//
// Module: MOD-documents
//
// It belongs to the artifact model (ARC-048). It runs unchanged in a browser and in Node, keeps no state but the schemas it
// was given to load, and performs no input or output: its callers give it the texts, and every schema data file is read by
// the module that owns it. It uses MOD-text-tools' interface for front matter. Every other file of this folder is private
// to it.
//
// A schema data file, `*.schema.md`, holds its schema as its one ```json block (schema-language.mjs). A section runs from its
// heading line to the next heading of the same or a higher level, and a schema names it by its heading line as written, or
// names the text under the document's title { "underTitle": true }; a section's table is the first in it whose header row
// names its columns (read-write.mjs).

/**
 * A schema as loadSchema returns it: the JSON object of a schema data file, in the language of the module file's Data —
 * `schema`, `shape`, `rule`, `path`, `identifier`, `frontMatter` or `lines`, `title`, `sections`, `otherSections`,
 * `appended`, `diagrams`, `noHistory`, `key` —, frozen.
 * @typedef {Readonly<Record<string, unknown>>} Schema
 */

/**
 * One row of a table: the line it was read from (from 1), and its cells by column name — a text, a list of texts or a
 * number; a value left out is absent.
 * @typedef {{ line: number, cells: Record<string, string | string[] | number> }} Row
 */

/**
 * A document or record as readDocument returns it: the schema's name as its kind; its path; its identifier, where its schema
 * names one, from its front matter or else from its path, or null; its title, the text of its first heading when that is of
 * level one, or null; its fields by key, each a text, a list or a number; its sections in order — each with its heading line
 * as written, the line of that heading, its text after the heading line, its fields and its rows where its schema gives it
 * fields or a table; a section under the title with the title line as its heading —; for a record, the appended sections in
 * order; and its body, every byte after the front matter.
 * @typedef {{ kind: string, path: string, id: string | null, title: string | null,
 *   fields: Record<string, string | string[] | number>,
 *   sections: Array<{ heading: string, line: number, text: string, fields?: Record<string, string | string[] | number>,
 *     rows?: Row[] }>,
 *   appended: Array<{ heading: string, line: number, text: string, fields?: Record<string, string | string[] | number> }>,
 *   body: string }} Document
 */

export { loadSchema } from "./schema-language.mjs";
export { readDocument, writeDocument, readRegister, appendSection } from "./read-write.mjs";
export { documentFindings } from "./checks.mjs";
