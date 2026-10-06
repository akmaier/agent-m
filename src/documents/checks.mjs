// The checks a schema decides — whether a value fits its value specification (MOD-documents, Data: the value specification,
// its types, and the values that depend on other values), and the findings of documentFindings (Interfaces). writeDocument
// refuses a value that does not fit with DocumentError (ITM-213); documentFindings names it as a finding (ITM-227).
//
// Module: MOD-documents
//
// A value as the reader gives it: a text, a list of texts, or a number. A value is left out when it is absent, or an empty
// text — in a table an empty cell or `—`, in front matter a key with nothing after its colon. An empty list is a value: a
// list that holds nothing, which `nonEmpty` forbids.
//
// documentFindings finds what ITM-227 builds: front matter keys missing, unknown, out of order, required or forbidden by a
// condition; values not of their type or of the variant that holds, or empty where nonEmpty; the rows of a table, cell by
// cell, in the same way; required sections missing, sections out of order, and sections the schema forbids. The path, the
// identifier against the path, the title, describedIn, diagrams and images, the marks of history, the fields of a section, a
// record of `key: value` lines and appended sections are not checked yet. Each finding is an error, made with
// MOD-text-tools' finding, and names the rule of the part of the schema closest to it (Data, The requirement a finding
// names). A key or a section that is missing stands on no line: its finding names line 1, as the dashboard's checks of
// today do (docs/assets/artifacts/use-cases.mjs). The section under the title (ITM-226) is the first section of a document
// with a title, and is missing from a document without one.

import { finding } from "../text-tools/index.mjs";
import { KIND_FORMS, REQUIREMENT_NAME, compiledOf, effective, holds, sectionOf } from "./schema-language.mjs";

const INTERFACE = /^MOD-[a-z0-9]+(?:-[a-z0-9]+)*\.[A-Za-z_][A-Za-z0-9_]*$/;
const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
const HTTPS_ADDRESS = /^https:\/\/[^\s/?#]+(?:[/?#]\S*)?$/;
const IDENTIFIER = Object.fromEntries(Object.entries(KIND_FORMS).map(([kind, form]) => [kind, new RegExp(`^${kind}-${form}$`)]));
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_TIME = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-](\d{2}):(\d{2}))$/;
const UTC_TIME = /^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2}) UTC$/;

// leftOut(value) -> whether a value is left out: absent, or an empty text.
export const leftOut = (value) => value === undefined || value === null || value === "";

// textOf(value) -> the text a condition compares: a text that is not empty, or a number as written; undefined for a value
// left out and for a list.
export const textOf = (value) => (typeof value === "number" ? String(value) : typeof value === "string" && value ? value : undefined);

const shown = (value) => JSON.stringify(value);

function isDate(text) {
  const m = DATE.exec(text);
  if (!m) return false;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isTime(text) {
  const iso = ISO_TIME.exec(text);
  if (iso) {
    return isDate(iso[1]) && Number(iso[2]) < 24 && Number(iso[3]) < 60 && (iso[4] === undefined || Number(iso[4]) < 60)
      && (iso[5] === undefined || (Number(iso[5]) < 24 && Number(iso[6]) < 60));
  }
  const utc = UTC_TIME.exec(text);
  return Boolean(utc) && isDate(utc[1]) && Number(utc[2]) < 24 && Number(utc[3]) < 60;
}

// A path in a repository, relative to its root: no leading /, no backslash, no empty segment and no segment `..`.
const isPath = (text) => text === text.trim() && !text.startsWith("/") && !/[\\]/.test(text) && !text.includes("//")
  && !text.split("/").includes("..");

const TYPE_WORDS = {
  text: "a text", number: "a number", date: "a date YYYY-MM-DD", time: "a time", path: "a path", url: "an https address",
  requirement: "a requirement's name", interface: "an interface MOD-<slug>.<name>", name: "an interface's name",
};
const describe = (spec) => (typeof spec === "string" ? TYPE_WORDS[spec] : spec.type === "identifier"
  ? `an identifier ${spec.of.join(" or ")}` : spec.type === "enum" ? `one of ${spec.values.join(", ")}` : TYPE_WORDS[spec.type] ?? spec.type);

// Why one value — not a list — does not fit a type, or null. `where` is where it stands: "front matter", "line" (a key: value
// line of a record or a section) or "cell"; `inList` whether it is an item of a list, which a line or a cell separates by
// commas.
function itemProblem(value, spec, where, inList) {
  if (spec.type === "number") return typeof value === "number" && Number.isFinite(value) ? null : `${shown(value)} is not a number`;
  if (typeof value !== "string") return `${shown(value)} is not ${describe(spec)}`;
  if (/[\r\n]/.test(value)) return `${shown(value)} holds a line break`;
  if (inList && where !== "front matter" && value.includes(",")) {
    return `the item ${shown(value)} holds a comma, which separates the items of a list in a ${where}`;
  }
  switch (spec.type) {
    case "text": return null;
    case "enum": return spec.values.includes(value) ? null : `${shown(value)} is not one of ${spec.values.join(", ")}`;
    case "date": return isDate(value) ? null : `${shown(value)} is not a date YYYY-MM-DD`;
    case "time": return isTime(value) ? null : `${shown(value)} is not a time in ISO 8601 with its offset, or YYYY-MM-DD HH:MM UTC`;
    case "sha": return new RegExp(`^[0-9a-f]{${spec.digits}}$`).test(value) ? null
      : `${shown(value)} is not ${spec.digits} lowercase hexadecimal digits`;
    case "path": return isPath(value) ? null : `${shown(value)} is not a path relative to the repository's root`;
    case "url": return HTTPS_ADDRESS.test(value) ? null : `${shown(value)} is not an https address`;
    case "identifier": return spec.of.some((kind) => IDENTIFIER[kind].test(value)) ? null
      : `${shown(value)} is not an identifier ${spec.of.join(" or ")}`;
    case "requirement": return REQUIREMENT_NAME.test(value) ? null : `${shown(value)} is not a requirement's name in capitals`;
    case "interface": return INTERFACE.test(value) ? null : `${shown(value)} is not an interface MOD-<slug>.<name>`;
    case "name": return NAME.test(value) ? null : `${shown(value)} is not a name [A-Za-z_][A-Za-z0-9_]*`;
    case "either": return spec.of.some((member) => !itemProblem(value, typeof member === "string" ? { type: member } : member,
      where, inList)) ? null : `${shown(value)} is none of ${spec.of.map(describe).join(", ")}`;
    default: return `${shown(value)} is of no type of the language`;
  }
}

// Why a value does not fit the type and constraints of a specification — the variant that holds already chosen —, or null.
function typeProblem(value, spec, where) {
  if (spec.type !== "list") return itemProblem(value, spec, where, false);
  if (!Array.isArray(value)) return `${shown(value)} is not a list`;
  if (spec.nonEmpty && value.length === 0) return "the list is empty, and it holds at least one item";
  for (const item of value) {
    const why = itemProblem(item, spec.item, where, true);
    if (why) return why;
  }
  return null;
}

const conditionText = (condition) => (condition.all ? condition.all.map(conditionText).join(" and ")
  : condition.any ? condition.any.map(conditionText).join(" or ")
    : `${condition.field} is ${condition.in ? "" : "not "}${(condition.in ?? condition.notIn).join(" or ")}`);

// valueCheck(value, spec, lookup, where) -> null when a value fits its value specification, else { why, condition }: why it
// does not — left out where it is required, always or where its requiredWhen condition holds; given where its forbiddenWhen
// condition holds; not of the type and constraints of the variant that holds, or of the specification; an empty list where
// nonEmpty —, and the condition that requires or forbids it, or null. lookup(field) gives the text of another value of the
// same document or row, as conditions compare it.
function valueCheck(value, spec, lookup, where) {
  if (leftOut(value)) {
    if (spec.required === true) return { why: "is required, and left out", condition: null };
    if (spec.requiredWhen && holds(spec.requiredWhen, lookup)) {
      return { why: `is required where ${conditionText(spec.requiredWhen)}, and left out`, condition: spec.requiredWhen };
    }
    return null;
  }
  if (spec.forbiddenWhen && holds(spec.forbiddenWhen, lookup)) {
    return { why: `is left out where ${conditionText(spec.forbiddenWhen)}, and it is ${shown(value)}`,
      condition: spec.forbiddenWhen };
  }
  const why = typeProblem(value, effective(spec, lookup), where);
  return why ? { why: `does not fit: ${why}`, condition: null } : null;
}

// valueProblem(value, spec, lookup, where) -> why a value does not fit its value specification, as valueCheck says it, or
// null.
export function valueProblem(value, spec, lookup, where) {
  return valueCheck(value, spec, lookup, where)?.why ?? null;
}

// ---------------------------------------------------------------- documentFindings

// The rule of a condition that holds: of combined conditions, the first part that holds and names one — a part combined in
// turn searched the same way —, before the combination's own.
function conditionRule(condition, lookup) {
  for (const part of condition.all ?? condition.any ?? []) {
    const rule = holds(part, lookup) ? conditionRule(part, lookup) : undefined;
    if (rule) return rule;
  }
  return condition.rule;
}

// The rules of the parts of the schema closest to a value that does not fit, closest first: the condition that requires or
// forbids it, the variant that holds for it, its value specification.
const valueRules = (check, spec, lookup) => [check.condition && conditionRule(check.condition, lookup),
  (spec.variants ?? []).find((variant) => holds(variant.when, lookup))?.rule, spec.rule];

// What a finding on a value asks for — the value left out, given where it is forbidden, or not fitting —, where it stands:
// under a key of the front matter, or in a column of a row.
const FIX = {
  key: { missing: (key) => `give the key ${key} a value`, forbidden: (key) => `remove the key ${key}`,
    misfit: (key) => `correct the value of the key ${key}` },
  cell: { missing: (column) => `fill in the column ${column} of this row`,
    forbidden: (column) => `leave the column ${column} of this row empty`,
    misfit: (column) => `correct the column ${column} of this row` },
};
const fixOf = (words, name, value, check) => (leftOut(value) ? words.missing(name)
  : check.condition ? words.forbidden(name) : words.misfit(name));

// The line of each front matter key that stands, counted as the front matter is written: the line --- first, then each key
// on a line of its own, and each item of a list on one more. A Document keeps no line of a key; a line its reader passed
// over among the keys is not counted.
function keyLines(fields, keys) {
  const lines = {};
  let line = 2;
  for (const key of keys) {
    lines[key] = line;
    line += 1 + (Array.isArray(fields[key]) ? fields[key].length : 0);
  }
  return lines;
}

const levelOf = (heading) => /^#*/.exec(heading)[0].length;

// The section under the title, as findings name it: it has no heading of its own in the schema.
const UNDER_TITLE = "the section under the title";

/**
 * documentFindings(schema: Schema, document: Document) -> Finding[] — the findings the schema decides on a document read by
 * it (see the head of this file), in the order of their lines; on one line, in the order they are found: the keys of the
 * front matter, then their values, then the sections, each row's cells in the order of its columns. Each is an
 * error naming the document's identifier, or its path when it has none, the line it concerns and the rule of the part of the
 * schema closest to it: a condition's — of combined conditions, the first part that holds and names one, before the
 * combination's own —, the variant's that holds, the value specification's, the section's, and last the schema's own,
 * which alone a key the schema does not list, keys out of order and a section the schema forbids name. Throws TypeError when
 * `schema` is not a loaded schema, and, through MOD-text-tools' finding, for a finding no part of the schema names a rule
 * for.
 */
export function documentFindings(schema, document) {
  const compiled = compiledOf(schema);
  const artifact = document.id ?? document.path;
  const found = [];
  const add = (line, rules, what, fix) => found.push(finding({ artifact, line, kind: "error",
    rule: [...rules, schema.rule].find(Boolean), what, fix }));
  const fields = document.fields;
  const frontLookup = (name) => textOf(fields[name]);

  if (schema.shape === "document") {
    const specs = schema.frontMatter ?? {};
    const keys = Object.keys(specs);
    const standing = Object.keys(fields).filter((key) => fields[key] !== undefined);
    const lineOf = keyLines(fields, standing);
    let lastKey = null; // the listed key that stands furthest along the format's order so far
    for (const key of standing) {
      if (!Object.hasOwn(specs, key)) {
        add(lineOf[key], [], `the key ${key} is not a key of the format ${schema.schema}`,
          `remove the key ${key}, or use one the format lists: ${keys.join(", ")}`);
      } else if (lastKey !== null && keys.indexOf(key) < keys.indexOf(lastKey)) {
        add(lineOf[key], [], `the key ${key} stands after the key ${lastKey}, which the format ${schema.schema} puts after it`,
          `put the keys in the order of the format: ${keys.join(", ")}`);
      } else {
        lastKey = key;
      }
    }
    for (const [key, spec] of Object.entries(specs)) {
      const check = valueCheck(fields[key], spec, frontLookup, "front matter");
      if (check) {
        add(lineOf[key] ?? 1, valueRules(check, spec, frontLookup), `the key ${key} ${check.why}`,
          fixOf(FIX.key, key, fields[key], check));
      }
    }
  }

  const headings = (schema.sections ?? []).map((spec) => (spec.underTitle ? UNDER_TITLE : spec.heading));
  let lastSection = null; // the named section that stands furthest along the format's order so far
  for (const [place, section] of document.sections.entries()) {
    const named = sectionOf(compiled, section, place, document.title);
    if (!named) {
      if (schema.otherSections === "forbidden" && levelOf(section.heading) === compiled.level) {
        add(section.line, [], `the section ${section.heading} is not a section of the format ${schema.schema}, which allows no other`,
          `remove the section ${section.heading}, or move its text into a section the format names: ${headings.join(", ")}`);
      }
      continue;
    }
    if (lastSection !== null && named.index < lastSection.index) {
      const what = `the section ${section.heading} stands after the section ${lastSection.spec.heading}, which the format `
        + `${schema.schema} puts after it`;
      add(section.line, [named.spec.rule], what, `put the sections in the order of the format: ${headings.join(", ")}`);
    } else {
      lastSection = named;
    }
    const table = named.spec.table;
    for (const row of table ? section.rows ?? [] : []) {
      const names = table.columns.map((column) => column.name);
      const lookup = (name) => (names.includes(name) ? textOf(row.cells[name]) : frontLookup(name));
      for (const column of table.columns) {
        const check = valueCheck(row.cells[column.name], column.value, lookup, "cell");
        if (check) {
          add(row.line, [...valueRules(check, column.value, lookup), named.spec.rule], `the column ${column.name} ${check.why}`,
            fixOf(FIX.cell, column.name, row.cells[column.name], check));
        }
      }
    }
  }
  for (const spec of schema.sections ?? []) {
    const stands = document.sections.some((section, place) => sectionOf(compiled, section, place, document.title)?.spec === spec);
    if (!spec.required || stands) continue;
    if (spec.underTitle) {
      add(1, [spec.rule], `${UNDER_TITLE} is required, and missing`, "add the document's title, and the section under it");
    } else {
      add(1, [spec.rule], `the section ${spec.heading} is required, and missing`, `add the section ${spec.heading}`);
    }
  }
  return found.sort((a, b) => a.line - b.line);
}
