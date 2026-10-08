// Reading a document or record by its schema, and writing it back (MOD-documents, Interfaces: readDocument, writeDocument,
// readRegister; Data: A document as this module reads it).
//
// Module: MOD-documents
//
// Sections by their heading lines (ITM-213): a section runs from its heading line to the next heading of the same or a
// higher level, so a lower heading, with its table, stays inside it, and a line in a fenced block is no heading. The level
// is that of the headings the schema names, ## when it names none; a schema names a section by its heading line exactly as
// written, of any level. The document's first heading, when it is of level one, is its title, and stays before the first
// section unless the schema's sections are of level one, or the schema names the section under the title (ITM-226): that
// section is then read with the title line as its heading, from the line after it up to the first heading that begins a
// section, and it is the document's first section.
// A section's table (ITM-226) is the first table in it whose header row names exactly the table's columns, in their order;
// a table without a header row is the section's first table. A table is a run of lines, outside fenced blocks, that begin
// with |. Its cells are split at every | not escaped as \|, an escaped one is a | of the cell, and a cell that is empty or —
// is a value left out. The parsing of front matter is MOD-text-tools'; reading a table's lines follows parseModel of
// docs/assets/process-model.mjs.
//
// Writing keeps what it does not form: the bytes before the first section, the text of every section, and every row of a
// table that stands as it was read; it forms the front matter, the order of the sections, and each row that is new or
// changed. The text a document was read from is its `body`: the rows that stand are found there, by their cells.

import { formatFrontMatter, parseFrontMatter } from "../text-tools/index.mjs";
import { compiledOf, effective, fences, sectionOf, textLines } from "./schema-language.mjs";
import { leftOut, textOf, valueProblem } from "./checks.mjs";

const HEADING = /^(#{1,6})[ \t]+\S/;
const FIELD_LINE = /^([a-z][a-z0-9_-]*):[ \t]*(.*)$/;
// A section's or an appended section's field line: its key may also be words of a front matter key's form separated by
// single spaces, such as `gate record:` (ITM-252, MOD-job-ledger.md Data). Never used for front matter or for the
// "lines" shape, whose keys stay FIELD_LINE, with no space.
const SECTION_FIELD_LINE = /^([a-z][a-z0-9_-]*(?: [a-z][a-z0-9_-]*)*):[ \t]*(.*)$/;
const NUMBER = /^-?\d+(?:\.\d+)?$/;
const LEFT_OUT = "—";

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const has = (object, key) => isObject(object) && Object.hasOwn(object, key) && object[key] !== undefined;
const bare = (line) => (line.endsWith("\r") ? line.slice(0, -1) : line);

// ---------------------------------------------------------------- errors

function namedError(name, message, fields) {
  const error = new Error(message);
  error.name = name;
  return Object.assign(error, fields);
}

// DocumentError — a value that does not fit its specification: `field`, with `section` for a field of a section; or
// `section`, `row` (its place among the table's rows, from 1), `line` (the line it was read from, or null for a new row) and
// `column` for a cell.
const fieldError = (field, section, why) => namedError("DocumentError",
  section ? `writeDocument: the field ${field} of ${section} ${why}` : `writeDocument: the value of ${field} ${why}`,
  section ? { field, section } : { field });
const cellError = (section, row, line, column, why) => namedError("DocumentError",
  `writeDocument: the row ${row}${line ? ` (line ${line})` : ""} of the table under ${section}, column ${column}, ${why}`,
  { section, row, line, column });

// NotAppendable — an append-only table that would lose or change a row of the text it was read from: `row`, its place among
// the rows read (from 1), `line`, the line it was read from.
const notAppendable = (section, row, line) => namedError("NotAppendable",
  `writeDocument: the table under ${section} only grows, and its row ${row} (line ${line}) would be lost or changed — rows `
    + "are added at its end, and every row that stands keeps its bytes", { section, row, line });

// NotAppendable — appendSection is asked for a heading the schema does not append, or for one it appends only once that
// already stands in the record: `heading`.
const notAppendableHeading = (heading, why) => namedError("NotAppendable", `appendSection: ${why}`, { heading });

// ---------------------------------------------------------------- values

// A value read by its specification: a list as a list of texts — in front matter one item per line, in a line or a cell
// separated by commas —; a number as a number; every other value as the text it is. What does not fit is kept as it stands,
// for writeDocument and documentFindings to name.
function typed(raw, spec, where) {
  if (!spec) return Array.isArray(raw) ? raw.slice() : raw;
  if (spec.type === "list") {
    if (Array.isArray(raw)) return raw.slice();
    return where === "front matter" ? raw : raw.split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (Array.isArray(raw)) return raw.length ? raw.slice() : "";
  if (spec.type === "number" && NUMBER.test(raw)) return Number(raw);
  return raw;
}

// The values of keys — front matter or lines — by their specifications, each typed by the variant that holds.
function typedValues(raw, order, specs, where) {
  const lookup = (name) => textOf(raw[name]);
  const out = {};
  for (const key of order) {
    const spec = specs?.[key];
    out[key] = typed(raw[key], spec ? effective(spec, lookup) : null, where);
  }
  return out;
}

// A value as one line of text: a list's items separated by commas, a number as written.
const lineText = (value) => (Array.isArray(value) ? value.join(", ") : String(value));
const cellText = (value) => (leftOut(value) ? LEFT_OUT : Array.isArray(value) ? value.map(escapePipes).join(", ")
  : escapePipes(String(value)));
const escapePipes = (text) => text.replace(/\|/g, "\\|");

// ---------------------------------------------------------------- tables

// The cells of a table's line, split at every | that is not escaped.
function cellsOf(line) {
  let text = line.trim();
  if (text.startsWith("|")) text = text.slice(1);
  if (text.endsWith("|") && !text.endsWith("\\|")) text = text.slice(0, -1);
  return text.split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, "|"));
}
const isSeparator = (line) => cellsOf(line).every((cell) => /^:?-+:?$/.test(cell));

// The section's table among a text's lines: { from, to }, to exclusive, or null — the first table whose header row names
// exactly the table's columns, in their order; for a table without a header row, the first table.
function sectionTable(table, lines) {
  const { inBlock } = fences(lines);
  const isRow = (i) => !inBlock[i] && /^[ \t]*\|/.test(lines[i]);
  const names = table.columns.map((column) => column.name);
  const named = (header) => header.length === names.length && header.every((cell, i) => cell === names[i]);
  let from = 0;
  while (from < lines.length) {
    if (!isRow(from)) { from += 1; continue; }
    let to = from;
    while (to < lines.length && isRow(to)) to += 1;
    if (table.header === false || named(cellsOf(lines[from]))) return { from, to };
    from = to;
  }
  return null;
}

// The rows of a table: where its rows begin — after its header and separator lines when it has a header row —, and each row's
// index among the text's lines and its cells.
function tableRows(table, lines, frontLookup) {
  const at = sectionTable(table, lines);
  if (!at) return { at: null, rowsFrom: 0, rows: [] };
  let rowsFrom = at.from;
  if (table.header !== false) {
    rowsFrom = at.from + 1;
    if (rowsFrom < at.to && isSeparator(lines[rowsFrom])) rowsFrom += 1;
  }
  const rows = [];
  for (let i = rowsFrom; i < at.to; i += 1) rows.push({ index: i, cells: cellsByColumn(table.columns, cellsOf(lines[i]), frontLookup) });
  return { at, rowsFrom, rows };
}

// A row's cells by column, by position, each typed by the variant that holds for the row; a value left out is absent.
function cellsByColumn(columns, texts, frontLookup) {
  const raw = {};
  columns.forEach((column, i) => {
    const text = texts[i];
    if (text !== undefined && text !== "" && text !== LEFT_OUT) raw[column.name] = text;
  });
  const names = columns.map((column) => column.name);
  const lookup = (name) => (names.includes(name) ? raw[name] : frontLookup(name));
  const cells = {};
  for (const column of columns) {
    if (Object.hasOwn(raw, column.name)) cells[column.name] = typed(raw[column.name], effective(column.value, lookup), "cell");
  }
  return cells;
}

// The values of the key: value lines a section holds for its fields; a line in a fenced block is none, and a key that stands
// twice keeps its first value.
function sectionFields(fields, text, frontLookup) {
  const lines = textLines(text);
  const { inBlock } = fences(lines);
  const raw = {};
  lines.forEach((line, i) => {
    const m = inBlock[i] ? null : SECTION_FIELD_LINE.exec(line);
    if (m && Object.hasOwn(fields, m[1]) && !Object.hasOwn(raw, m[1])) raw[m[1]] = m[2].trim();
  });
  const lookup = (name) => (Object.hasOwn(fields, name) ? textOf(raw[name]) : frontLookup(name));
  const out = {};
  for (const [key, spec] of Object.entries(fields)) if (Object.hasOwn(raw, key)) out[key] = typed(raw[key], effective(spec, lookup), "line");
  return out;
}

// ---------------------------------------------------------------- the layout of a body

// The title of a body, the bytes before its first section, and its sections: { heading, index, text } — the heading line as
// written, its index among the body's lines, and every byte after the heading line up to the next section's heading line.
// The title line begins a section when the schema's sections are of level one, or when the schema names the section under
// the title.
function layout(compiled, body) {
  const raw = body.split("\n");
  const lines = raw.map(bare);
  const { inBlock } = fences(lines);
  const headings = lines.map((line, i) => (!inBlock[i] && HEADING.test(line) ? i : -1)).filter((i) => i >= 0);
  const level = (i) => HEADING.exec(lines[i])[1].length;
  const first = headings[0];
  const title = first !== undefined && level(first) === 1 ? lines[first].replace(/^#[ \t]+/, "").trim() : null;
  const starts = headings.filter((i) => level(i) <= compiled.level
    && !(i === first && title !== null && compiled.level > 1 && !compiled.underTitle));
  const offsets = [];
  let offset = 0;
  for (const line of raw) {
    offsets.push(offset);
    offset += line.length + 1;
  }
  const chunks = starts.map((start, k) => ({
    heading: lines[start].trimEnd(),
    index: start,
    text: body.slice(Math.min(offsets[start] + raw[start].length + 1, body.length), k + 1 < starts.length ? offsets[starts[k + 1]] : body.length),
  }));
  return { title, lead: starts.length ? body.slice(0, offsets[starts[0]]) : body, chunks };
}

// ---------------------------------------------------------------- readDocument

function identifierOf(schema, compiled, path, fields) {
  if (!schema.identifier) return null;
  const value = fields[schema.identifier.field];
  if (typeof value === "string" && value) return value;
  for (const pattern of compiled.patterns) {
    const match = pattern.re.exec(String(path ?? ""));
    if (match && pattern.idOf(match)) return pattern.idOf(match);
  }
  return null;
}

// readDocument(schema: Schema, path: string, text: string) -> Document — reads a document or a record of the schema's format.
// It never throws on the content: whatever does not fit is left for documentFindings to name, and the parts that fit are
// read. Throws TypeError only when `schema` is not a loaded schema.
export function readDocument(schema, path, text) {
  const compiled = compiledOf(schema);
  const source = typeof text === "string" ? text : String(text ?? "");
  if (schema.shape === "lines") {
    const raw = {}, order = [];
    for (const line of textLines(source)) {
      const m = FIELD_LINE.exec(line);
      if (!m) continue;
      if (!Object.hasOwn(raw, m[1])) order.push(m[1]);
      raw[m[1]] = m[2].trim();
    }
    const fields = typedValues(raw, order, schema.lines, "line");
    return { kind: schema.schema, path, id: identifierOf(schema, compiled, path, fields), title: null, fields, sections: [],
      appended: [], body: source };
  }
  const front = parseFrontMatter(source);
  const fields = typedValues(front.fields, front.order, schema.frontMatter, "front matter");
  const frontLookup = (name) => textOf(fields[name]);
  const { title, chunks } = layout(compiled, front.body);
  const sections = [], appended = [];
  for (const [place, chunk] of chunks.entries()) {
    const section = { heading: chunk.heading, line: front.bodyLine + chunk.index, text: chunk.text };
    const appendedSpec = compiled.appended.get(chunk.heading);
    const spec = appendedSpec ?? sectionOf(compiled, chunk, place, title)?.spec;
    if (spec?.table) {
      section.rows = tableRows(spec.table, textLines(chunk.text), frontLookup).rows
        .map((row) => ({ line: section.line + 1 + row.index, cells: row.cells }));
    }
    if (spec?.fields) section.fields = sectionFields(spec.fields, chunk.text, frontLookup);
    (appendedSpec ? appended : sections).push(section);
  }
  return { kind: schema.schema, path, id: identifierOf(schema, compiled, path, fields), title, fields, sections, appended,
    body: front.body };
}

// ---------------------------------------------------------------- readRegister

// readRegister(schema: Schema, path: string, text: string) -> { document: Document, rows: Row[] } — reads a register: the
// document, and the rows of the one table its schema names — the same rows its section holds, which writeDocument writes.
// Throws TypeError when the schema is not a loaded one, or names no table or more than one.
export function readRegister(schema, path, text) {
  const compiled = compiledOf(schema);
  if (compiled.tables.length !== 1) {
    throw new TypeError(`readRegister: the schema ${schema.schema} names ${compiled.tables.length} tables; a register is read `
      + "by the one table its schema names");
  }
  const document = readDocument(schema, path, text);
  const section = document.sections
    .find((s, place) => sectionOf(compiled, s, place, document.title)?.spec === compiled.tables[0]);
  return { document, rows: section ? section.rows : [] };
}

// ---------------------------------------------------------------- writeDocument: the values

// Every value of the document against its specification: a key the schema does not list, a value left out where it is
// required, given where it is forbidden, or not of its type, the variant that holds or its constraints. The first that does
// not fit throws DocumentError.
function checkValues(schema, compiled, document) {
  const fields = isObject(document.fields) ? document.fields : {};
  const specs = (schema.shape === "lines" ? schema.lines : schema.frontMatter) ?? {};
  const where = schema.shape === "lines" ? "line" : "front matter";
  for (const key of Object.keys(fields)) {
    if (fields[key] !== undefined && !Object.hasOwn(specs, key)) {
      throw fieldError(key, null, `is not a key of the format ${schema.schema}, whose schema lists ${Object.keys(specs).join(", ") || "none"}`);
    }
  }
  const frontLookup = (name) => textOf(fields[name]);
  for (const [key, spec] of Object.entries(specs)) {
    const why = valueProblem(fields[key], spec, frontLookup, where);
    if (why) throw fieldError(key, null, why);
  }
  const parts = [
    ...(Array.isArray(document.sections) ? document.sections : [])
      .map((s, place) => [s, sectionOf(compiled, s, place, document.title)?.spec]),
    ...(Array.isArray(document.appended) ? document.appended : []).map((s) => [s, compiled.appended.get(s?.heading)]),
  ];
  for (const [section, spec] of parts) {
    if (!spec) continue;
    if (spec.fields && isObject(section.fields)) checkFields(spec.fields, section, frontLookup);
    if (spec.table && Array.isArray(section.rows)) checkRows(spec.table, section, frontLookup);
  }
}

function checkFields(fields, section, frontLookup) {
  for (const key of Object.keys(section.fields)) {
    if (section.fields[key] !== undefined && !Object.hasOwn(fields, key)) {
      throw fieldError(key, section.heading, `is not a field of the section, whose fields are ${Object.keys(fields).join(", ")}`);
    }
  }
  const lookup = (name) => (Object.hasOwn(fields, name) ? textOf(section.fields[name]) : frontLookup(name));
  for (const [key, spec] of Object.entries(fields)) {
    const why = valueProblem(section.fields[key], spec, lookup, "line");
    if (why) throw fieldError(key, section.heading, why);
  }
}

function checkRows(table, section, frontLookup) {
  const names = table.columns.map((column) => column.name);
  section.rows.forEach((row, i) => {
    const cells = isObject(row?.cells) ? row.cells : {};
    const line = Number.isInteger(row?.line) && row.line > 0 ? row.line : null;
    for (const name of Object.keys(cells)) {
      if (cells[name] !== undefined && !names.includes(name)) {
        throw cellError(section.heading, i + 1, line, name, `is no column of the table, whose columns are ${names.join(", ")}`);
      }
    }
    const lookup = (name) => (names.includes(name) ? textOf(cells[name]) : frontLookup(name));
    for (const column of table.columns) {
      const why = valueProblem(cells[column.name], column.value, lookup, "cell");
      if (why) throw cellError(section.heading, i + 1, line, column.name, why);
    }
  });
}

// ---------------------------------------------------------------- writeDocument: the text

// Whether two rows hold the same cells.
function sameCells(a, b) {
  const keys = (cells) => Object.keys(cells).filter((key) => cells[key] !== undefined).sort();
  const ka = keys(a), kb = keys(b);
  if (ka.length !== kb.length || ka.some((key, i) => key !== kb[i])) return false;
  return ka.every((key) => (Array.isArray(a[key]) && Array.isArray(b[key])
    ? a[key].length === b[key].length && a[key].every((item, i) => item === b[key][i]) : a[key] === b[key]));
}

const rowLine = (columns, cells) => `| ${columns.map((column) => cellText(cells[column.name])).join(" | ")} |`;
const headerLines = (columns) => [`| ${columns.map((column) => column.name).join(" | ")} |`, `|${columns.map(() => "---|").join("")}`];

// A block of lines added at the end of a section's text: after its last line that is not empty, before its closing line
// ends.
function appendBlock(text, block) {
  const [, core, trail] = /^([\s\S]*?)(\n*)$/.exec(text);
  return core.trim() === "" ? `\n${block}${trail.length > 1 ? trail : "\n"}` : `${core}\n\n${block}${trail || "\n"}`;
}

// A section's text with its table holding the section's rows: the rows that stand as they were read keep their bytes, every
// other row is written in the table's form; an append-only table must hold every row it was read with, unchanged and first.
function withTable(table, section, original, frontLookup) {
  const text = typeof section.text === "string" ? section.text : "";
  const before = [];
  if (original) {
    const lines = original.text.split("\n");
    const read = tableRows(table, lines.map(bare), frontLookup);
    const base = Number.isInteger(section.line) ? section.line : original.index + 1;
    read.rows.forEach((row, k) => before.push({ cells: row.cells, bytes: lines[row.index], row: k + 1, line: base + 1 + row.index }));
  }
  const rows = section.rows;
  if (table.appendOnly) {
    for (const [k, read] of before.entries()) {
      if (!rows[k] || !sameCells(read.cells, isObject(rows[k].cells) ? rows[k].cells : {})) {
        throw notAppendable(section.heading, read.row, read.line);
      }
    }
  }
  const written = [];
  let next = 0;
  for (const row of rows) {
    const cells = isObject(row?.cells) ? row.cells : {};
    let match = -1;
    for (let k = next; k < before.length; k += 1) if (sameCells(before[k].cells, cells)) { match = k; break; }
    if (match >= 0) {
      written.push(before[match].bytes);
      next = match + 1;
    } else {
      written.push(rowLine(table.columns, cells));
    }
  }
  const lines = text.split("\n");
  const { at, rowsFrom } = tableRows(table, lines.map(bare), frontLookup);
  if (at) return [...lines.slice(0, rowsFrom), ...written, ...lines.slice(at.to)].join("\n");
  if (!written.length) return text;
  return appendBlock(text, [...(table.header !== false ? headerLines(table.columns) : []), ...written].join("\n"));
}

// A section's text with its key: value lines holding the section's fields: each line of a field given rewritten with its
// value, the line of a field left out removed, the line of a field not yet there added at the end.
function withFields(fields, section) {
  const text = typeof section.text === "string" ? section.text : "";
  const lines = text.split("\n");
  const { inBlock } = fences(lines.map(bare));
  const line = (key, value) => (lineText(value) === "" ? `${key}:` : `${key}: ${lineText(value)}`);
  const seen = new Set(), out = [];
  lines.forEach((raw, i) => {
    const m = inBlock[i] ? null : SECTION_FIELD_LINE.exec(bare(raw));
    if (!m || !Object.hasOwn(fields, m[1]) || seen.has(m[1])) { out.push(raw); return; }
    seen.add(m[1]);
    if (has(section.fields, m[1]) && !leftOut(section.fields[m[1]])) out.push(line(m[1], section.fields[m[1]]));
  });
  const missing = Object.keys(fields).filter((key) => !seen.has(key) && has(section.fields, key) && !leftOut(section.fields[key]));
  const joined = out.join("\n");
  return missing.length ? appendBlock(joined, missing.map((key) => line(key, section.fields[key])).join("\n")) : joined;
}

// The sections in canonical order: those the schema names in the schema's order, in the places named sections stand; every
// other section in its place. The section under the title, the schema's first, stays the first.
function canonicalOrder(compiled, sections, title) {
  const named = sections.map((section, place) => ({ section, place, rank: sectionOf(compiled, section, place, title)?.index }))
    .filter((entry) => entry.rank !== undefined);
  const sorted = [...named].sort((a, b) => a.rank - b.rank || a.place - b.place);
  const out = sections.slice();
  named.forEach((entry, k) => { out[entry.place] = sorted[k].section; });
  return out;
}

// writeDocument(schema: Schema, document: Document) -> string — writes a document in its canonical form: front matter keys in
// the schema's order, lists one item per line, sections in the schema's order, each table with the rows of its section — a
// register's rows among them —, every other byte of the body as it was. A canonical text read and written again is byte for
// byte the same. Throws DocumentError naming the field, or the row and column, when a value does not fit its specification;
// NotAppendable naming the row when an append-only table would lose or change a row of the text it was read from; TypeError
// when `schema` is not a loaded schema.
export function writeDocument(schema, document) {
  const compiled = compiledOf(schema);
  if (!isObject(document)) throw new TypeError("writeDocument: the document is an object as readDocument returns it");
  checkValues(schema, compiled, document);
  const fields = isObject(document.fields) ? document.fields : {};
  if (schema.shape === "lines") {
    return Object.keys(schema.lines ?? {}).filter((key) => has(fields, key))
      .map((key) => (lineText(fields[key]) === "" ? `${key}:\n` : `${key}: ${lineText(fields[key])}\n`)).join("");
  }
  const order = Object.keys(schema.frontMatter ?? {}).filter((key) => has(fields, key));
  const front = Object.fromEntries(order.map((key) => [key, Array.isArray(fields[key]) ? fields[key].map(String) : String(fields[key])]));
  const frontLookup = (name) => textOf(fields[name]);
  const body = typeof document.body === "string" ? document.body : "";
  const { lead, chunks } = layout(compiled, body);
  const originals = new Map();
  for (const chunk of chunks) if (!originals.has(chunk.heading)) originals.set(chunk.heading, chunk);
  const part = (section, spec) => {
    if (!isObject(section) || typeof section.heading !== "string") return "";
    let text = typeof section.text === "string" ? section.text : "";
    if (spec?.table && Array.isArray(section.rows)) text = withTable(spec.table, section, originals.get(section.heading), frontLookup);
    if (spec?.fields && isObject(section.fields)) text = withFields(spec.fields, { ...section, text });
    return `${section.heading}\n${text}`;
  };
  let out = lead;
  const sections = canonicalOrder(compiled, Array.isArray(document.sections) ? document.sections : [], document.title);
  for (const [place, section] of sections.entries()) {
    out += part(section, sectionOf(compiled, section, place, document.title)?.spec);
  }
  for (const section of Array.isArray(document.appended) ? document.appended : []) {
    out += part(section, compiled.appended.get(section?.heading));
  }
  return formatFrontMatter(front, order, out);
}

// ---------------------------------------------------------------- appendSection

// appendSection(schema: Schema, text: string, heading: string, fields: Record<string, string | string[] | number>) ->
// string — the record's text byte for byte, followed by the new section: a record is only ever appended to, never
// rewritten (A RECORD IS EVIDENCE, NOT A PROPOSAL). Throws NotAppendable when the schema does not let that section be
// appended, or appended a second time, and DocumentError when a field does not fit.
export function appendSection(schema, text, heading, fields) {
  const compiled = compiledOf(schema);
  const spec = compiled.appended.get(heading);
  if (!spec) {
    throw notAppendableHeading(heading, `${heading} is not a section this format appends; it appends `
      + `${[...compiled.appended.keys()].join(", ") || "none"}`);
  }
  const body = typeof text === "string" ? text : "";
  const { chunks } = layout(compiled, body);
  if (spec.repeat !== true && chunks.some((chunk) => chunk.heading === heading)) {
    throw notAppendableHeading(heading, `${heading} is already in the record, and this format appends it only once`);
  }
  const front = parseFrontMatter(body);
  const frontFields = typedValues(front.fields, front.order, schema.frontMatter, "front matter");
  const frontLookup = (name) => textOf(frontFields[name]);
  const section = { heading, fields: isObject(fields) ? fields : {} };
  if (spec.fields) checkFields(spec.fields, section, frontLookup);
  const rendered = spec.fields ? withFields(spec.fields, { ...section, text: "" }) : "";
  return appendBlock(body, `${heading}\n${rendered}`);
}
