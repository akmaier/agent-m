// The checks a schema decides — whether a value fits its value specification (MOD-documents, Data: the value specification,
// its types, and the values that depend on other values). writeDocument refuses a value that does not fit with DocumentError
// (ITM-213). documentFindings, which names every finding a schema decides, is not built yet.
//
// Module: MOD-documents
//
// A value as the reader gives it: a text, a list of texts, or a number. A value is left out when it is absent, or an empty
// text — in a table an empty cell or `—`, in front matter a key with nothing after its colon. An empty list is a value: a
// list that holds nothing, which `nonEmpty` forbids.

import { KIND_FORMS, effective, holds } from "./schema-language.mjs";

// A requirement's name in capitals, as the SPEC writes it: capital letters, digits, blanks, apostrophes, commas and hyphens,
// at least one capital letter, none of them at either end but an apostrophe at its end, and none of the identifiers'
// prefixes. MOD-text-tools checks a finding's rule by the same form in a file of its own that is not its interface.
const REQUIREMENT_NAME = /^(?!(?:SRC|UC|ARC|MOD|TST|ITM|RES|JOB)-)(?=[A-Z0-9 ',-]*[A-Z])[A-Z0-9](?:[A-Z0-9 ',-]*[A-Z0-9'])?$/;
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

// valueProblem(value, spec, lookup, where) -> why a value does not fit its value specification, or null: left out where it
// is required — always, or where its requiredWhen condition holds —; given where its forbiddenWhen condition holds; not of
// the type and constraints of the variant that holds, or of the specification; an empty list where nonEmpty. lookup(field)
// gives the text of another value of the same document or row, as conditions compare it.
export function valueProblem(value, spec, lookup, where) {
  if (leftOut(value)) {
    if (spec.required === true) return "is required, and left out";
    if (spec.requiredWhen && holds(spec.requiredWhen, lookup)) return `is required where ${conditionText(spec.requiredWhen)}, and left out`;
    return null;
  }
  if (spec.forbiddenWhen && holds(spec.forbiddenWhen, lookup)) {
    return `is left out where ${conditionText(spec.forbiddenWhen)}, and it is ${shown(value)}`;
  }
  const why = typeProblem(value, effective(spec, lookup), where);
  return why ? `does not fit: ${why}` : null;
}
