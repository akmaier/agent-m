// The schema language — a schema read from its data file and checked against the language (MOD-documents, Data: The schema
// language; Interfaces: loadSchema), and the parts of the language the reader and the writer share: conditions, variants,
// path patterns, fenced blocks, and which section of the schema a document's section is.
//
// Module: MOD-documents
//
// The form of a schema data file, `*.schema.md` (ITM-213): a Markdown document — a title, sentences on the format, examples
// in fenced blocks of other kinds — with exactly one fenced block whose info string is `json`, ```json … ```, outside every
// other fenced block. That block holds the schema's JSON object; nothing else of the file is read. A ```json block inside
// another fence, such as a ````markdown example, is part of that example.
//
// A schema loadSchema returns is frozen, and only such a schema is read or written with: the reader and the writer find
// what loadSchema compiled for it — its path patterns, the heading level of its sections, its sections by heading — and
// refuse every other object with a TypeError.
//
// The rules (ITM-227): the schema, a section, a value specification, a condition — a combination of conditions among them —
// and a variant may each name in `rule` the requirement they apply, a requirement's name in capitals; whether the SPEC holds
// it is not decided here. The rule of a path pattern and of an appended section are not read yet, and a schema that names
// no rule is not refused yet.
//
// The section under the title (ITM-226): a format whose table stands under its title, and whose title changes from file to
// file, names that section { "underTitle": true } in place of a heading. A schema names at most one, as its first section,
// and then no section of level one.

// The identifier scheme of EVERY ARTIFACT HAS AN IDENTIFIER, each kind with the form of what follows its prefix: three or
// more digits for numbered kinds, a slug of lower-case words for named ones, and a job's identifier. MOD-identifiers owns
// the scheme; MOD-documents uses no module but MOD-text-tools (its file, Uses), so the forms are written here.
const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";
export const KIND_FORMS = {
  SRC: SLUG, UC: "\\d{3,}", ARC: "\\d{3,}", MOD: SLUG, TST: "\\d{3,}", ITM: "\\d{3,}", RES: SLUG,
  JOB: "[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*",
};
const KINDS = Object.keys(KIND_FORMS);

// A requirement's name in capitals, as the SPEC writes it: capital letters, digits, blanks, apostrophes, commas and hyphens,
// at least one capital letter, none of them at either end but an apostrophe at its end, and none of the identifiers'
// prefixes. MOD-text-tools checks a finding's rule by the same form in a file of its own that is not its interface.
export const REQUIREMENT_NAME = /^(?!(?:SRC|UC|ARC|MOD|TST|ITM|RES|JOB)-)(?=[A-Z0-9 ',-]*[A-Z])[A-Z0-9](?:[A-Z0-9 ',-]*[A-Z0-9'])?$/;

const TOP_KEYS = ["schema", "shape", "rule", "path", "identifier", "frontMatter", "lines", "title", "sections",
  "otherSections", "appended", "diagrams", "noHistory", "key"];
const DOCUMENT_ONLY = ["frontMatter", "title", "sections", "otherSections", "appended", "diagrams"];
export const TYPES = ["text", "enum", "number", "date", "time", "sha", "path", "url", "identifier", "requirement",
  "interface", "name", "either", "list"];
// The types that need no parameter, and so may be named alone among the types an `either` value may be of.
const PLAIN_TYPES = ["text", "number", "date", "time", "path", "url", "requirement", "interface", "name"];
const SPEC_KEYS = ["type", "required", "nonEmpty", "rule", "values", "digits", "of", "item", "describedIn", "requiredWhen",
  "forbiddenWhen", "variants"];
const VARIANT_KEYS = ["when", "rule", "type", "nonEmpty", "values", "digits", "of", "item"];
const ITEM_KEYS = ["type", "values", "digits", "of", "item"];
const SECTION_KEYS = ["heading", "underTitle", "required", "rule", "fields", "table"];
const APPENDED_KEYS = ["heading", "fields", "repeat"];
const TABLE_KEYS = ["columns", "header", "appendOnly"];
const PLACEHOLDERS = ["id", "nnn", "slug", "blob12", "any"];
const KEY_FORM = /^[a-z][a-z0-9_-]*$/;
const HEADING_FORM = /^(#{1,6})[ \t]+\S/;

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

// ---------------------------------------------------------------- errors

// SchemaError — a schema data file that breaks the language: `key` the path to the key in the schema
// (`frontMatter.model.type`, `sections[0].table.columns[1].value`), null when the file holds no schema to read; `owner` the
// module whose data file it is.
function schemaError(owner, key, why) {
  const error = new Error(key === null ? `${owner}: ${why}` : `${owner}: the schema breaks the language at ${key}: ${why}`);
  error.name = "SchemaError";
  error.key = key;
  error.owner = owner;
  return error;
}

// ---------------------------------------------------------------- Markdown: fenced blocks

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const FENCE_CLOSE = /^ {0,3}(`{3,}|~{3,})[ \t]*$/;

// fences(lines) -> { inBlock, blocks } — for the lines of a Markdown text, without their line ends: whether each line belongs
// to a fenced block, its fences included, and the blocks — { info, from, to }: the first word of the info string, the line of
// the opening fence and that of the closing one, or lines.length for a block that is never closed. A fence is closed by a
// fence of the same character, at least as long; a line inside a block opens nothing.
export function fences(lines) {
  const inBlock = new Array(lines.length).fill(false);
  const blocks = [];
  let open = null;
  lines.forEach((line, i) => {
    if (open) {
      inBlock[i] = true;
      const close = FENCE_CLOSE.exec(line);
      if (close && close[1][0] === open.char && close[1].length >= open.length) {
        open.block.to = i;
        open = null;
      }
      return;
    }
    const start = FENCE_OPEN.exec(line);
    if (!start || (start[1][0] === "`" && start[2].includes("`"))) return;
    inBlock[i] = true;
    const block = { info: start[2].trim().split(/\s+/)[0], from: i, to: lines.length };
    blocks.push(block);
    open = { char: start[1][0], length: start[1].length, block };
  });
  return { inBlock, blocks };
}

// The lines of a text without their line ends: LF or CR LF.
export const textLines = (text) => text.split("\n").map((line) => (line.endsWith("\r") ? line.slice(0, -1) : line));

// ---------------------------------------------------------------- conditions and variants

// holds(condition, lookup) -> boolean — whether a condition holds, lookup(field) giving the text of a front matter key, a key
// of a lines record or a column of the same row, or undefined for a value left out or a list. A condition on a value left
// out holds neither with `in` nor with `notIn`.
export function holds(condition, lookup) {
  if (condition.all) return condition.all.every((part) => holds(part, lookup));
  if (condition.any) return condition.any.some((part) => holds(part, lookup));
  const value = lookup(condition.field);
  if (typeof value !== "string") return false;
  return condition.in ? condition.in.includes(value) : !condition.notIn.includes(value);
}

// The specification a variant makes of the one it belongs to: its type and constraints in place of the specification's —
// the specification's type parameters only when the variant keeps the type —, every other key as it was.
function merged(spec, variant) {
  const { when, ...over } = variant;
  const base = over.type !== undefined && over.type !== spec.type
    ? Object.fromEntries(Object.entries(spec).filter(([key]) => !ITEM_KEYS.includes(key)))
    : { ...spec };
  delete base.variants;
  return { ...base, ...over };
}

// effective(spec, lookup) -> the specification that holds for a value: the first variant whose condition holds, in place of
// the specification's type and constraints, or the specification itself.
export function effective(spec, lookup) {
  const variant = (spec.variants ?? []).find((v) => holds(v.when, lookup));
  return variant ? merged(spec, variant) : spec;
}

// ---------------------------------------------------------------- checking a schema

function checker(owner) {
  const fail = (key, why) => { throw schemaError(owner, key, why); };
  const onlyKeys = (value, allowed, at, what) => {
    for (const key of Object.keys(value)) {
      if (!allowed.includes(key)) fail(at ? `${at}.${key}` : key, `${what} has no key ${key}; its keys are ${allowed.join(", ")}`);
    }
  };
  const isBoolean = (value, key) => {
    if (value !== undefined && typeof value !== "boolean") fail(key, "true or false");
  };
  // The rule a part names, where it names one.
  const requirementName = (value, key) => {
    if (value !== undefined && (typeof value !== "string" || !REQUIREMENT_NAME.test(value))) {
      fail(key, "a rule is a requirement's name in capitals, exactly as the SPEC writes it");
    }
  };

  // A path pattern, or a list of them.
  function path(value) {
    const patterns = typeof value === "string" ? [[value, "path"]]
      : Array.isArray(value) && value.length ? value.map((p, i) => [p, `path[${i}]`]) : fail("path", "a pattern, or a list of them");
    for (const [pattern, at] of patterns) {
      if (typeof pattern !== "string" || !pattern || pattern.startsWith("/") || /\s/.test(pattern)) {
        fail(at, "a path relative to the repository's root, with no blank");
      }
      for (const [, name] of pattern.matchAll(/\{([^{}]*)\}/g)) {
        if (!PLACEHOLDERS.includes(name)) {
          fail(at, `{${name}} is no placeholder; the placeholders are ${PLACEHOLDERS.map((p) => `{${p}}`).join(", ")}`);
        }
      }
      if (/[{}]/.test(pattern.replace(/\{[^{}]*\}/g, ""))) fail(at, "a { or } that opens or closes no placeholder");
    }
  }

  // A condition — { field, in } or { field, notIn }, or { all } or { any } of conditions, each with its rule if it names
  // one —, `fields` the names it may name.
  function condition(value, at, fields) {
    if (!isObject(value)) fail(at, "a condition is { field, in }, { field, notIn }, { all: [ … ] } or { any: [ … ] }");
    const combined = ["all", "any"].filter((key) => key in value);
    if (combined.length) {
      if (Object.keys(value).filter((key) => key !== "rule").length !== 1) {
        fail(at, "a combination of conditions is { all: [ … ] } or { any: [ … ] }, and its rule if it names one");
      }
      const parts = value[combined[0]];
      if (!Array.isArray(parts) || !parts.length) fail(`${at}.${combined[0]}`, "a list of conditions");
      parts.forEach((part, i) => condition(part, `${at}.${combined[0]}[${i}]`, fields));
      requirementName(value.rule, `${at}.rule`);
      return;
    }
    onlyKeys(value, ["field", "in", "notIn", "rule"], at, "a condition");
    requirementName(value.rule, `${at}.rule`);
    if (("in" in value) === ("notIn" in value)) {
      fail(at, "a condition names the values for which it holds in `in`, or those for which it does not in `notIn` — one of the two");
    }
    const list = "in" in value ? "in" : "notIn";
    if (!Array.isArray(value[list]) || !value[list].length || value[list].some((v) => typeof v !== "string")) {
      fail(`${at}.${list}`, "a list of values, each a text");
    }
    if (typeof value.field !== "string" || !fields.has(value.field)) {
      fail(`${at}.field`, `a front matter key, a key of the lines or a column of the same row: one of ${[...fields].join(", ") || "none"}`);
    }
  }

  // A type and its parameters, as a value specification, a variant, a list's item or an `either`'s member gives them.
  function type(spec, at) {
    if (!TYPES.includes(spec.type)) fail(`${at}.type`, `one of the types ${TYPES.join(", ")}`);
    const t = spec.type;
    if ("values" in spec && t !== "enum") fail(`${at}.values`, "values belong to the type enum");
    if ("digits" in spec && t !== "sha") fail(`${at}.digits`, "digits belong to the type sha");
    if ("of" in spec && t !== "identifier" && t !== "either") fail(`${at}.of`, "of belongs to the types identifier and either");
    if ("item" in spec && t !== "list") fail(`${at}.item`, "item belongs to the type list");
    if (t === "enum") {
      const values = spec.values;
      if (!Array.isArray(values) || !values.length || values.some((v) => typeof v !== "string" || !v || /[\r\n]/.test(v))
        || new Set(values).size !== values.length) {
        fail(`${at}.values`, "an enum names its values: a list of texts, none twice");
      }
    }
    if (t === "sha" && ![12, 40, 64].includes(spec.digits)) fail(`${at}.digits`, "a sha names its digits: 12, 40 or 64");
    if (t === "identifier" && (!Array.isArray(spec.of) || !spec.of.length || spec.of.some((k) => !KINDS.includes(k)))) {
      fail(`${at}.of`, `an identifier names its kinds: a list among ${KINDS.join(", ")}`);
    }
    if (t === "either") {
      if (!Array.isArray(spec.of) || !spec.of.length) fail(`${at}.of`, "an either names the types its value may be of");
      spec.of.forEach((member, i) => {
        if (typeof member === "string") {
          if (!PLAIN_TYPES.includes(member)) fail(`${at}.of[${i}]`, `a type named alone needs no parameter: one of ${PLAIN_TYPES.join(", ")}`);
        } else {
          item(member, `${at}.of[${i}]`);
        }
      });
    }
    if (t === "list") {
      if (!("item" in spec)) fail(`${at}.item`, "a list names the specification of its items");
      item(spec.item, `${at}.item`);
    }
  }

  // The specification of a list's items or of a member of `either`: a type with its parameters, no list.
  function item(spec, at) {
    if (!isObject(spec)) fail(at, "a value specification { type, … }");
    onlyKeys(spec, ITEM_KEYS, at, "the specification of an item");
    if (spec.type === "list") fail(`${at}.type`, "an item is no list: a list's items, and the types an either may be of, are single values");
    type(spec, at);
  }

  // A value specification; `context` names the fields a condition may name and the sections `describedIn` may name.
  function valueSpec(spec, at, context) {
    if (!isObject(spec)) fail(at, "a value specification { type, required, nonEmpty, … }");
    onlyKeys(spec, SPEC_KEYS, at, "a value specification");
    type(spec, at);
    isBoolean(spec.required, `${at}.required`);
    isBoolean(spec.nonEmpty, `${at}.nonEmpty`);
    requirementName(spec.rule, `${at}.rule`);
    if ("describedIn" in spec && !context.headings.includes(spec.describedIn)) {
      fail(`${at}.describedIn`, `the heading of a section of the schema: one of ${context.headings.join(", ") || "none"}`);
    }
    if ("requiredWhen" in spec) condition(spec.requiredWhen, `${at}.requiredWhen`, context.fields);
    if ("forbiddenWhen" in spec) condition(spec.forbiddenWhen, `${at}.forbiddenWhen`, context.fields);
    if ("variants" in spec) {
      if (!Array.isArray(spec.variants) || !spec.variants.length) fail(`${at}.variants`, "a list of variants, each { when, … }");
      spec.variants.forEach((variant, i) => {
        const vat = `${at}.variants[${i}]`;
        if (!isObject(variant)) fail(vat, "a variant is { when, type, … }");
        onlyKeys(variant, VARIANT_KEYS, vat, "a variant");
        if (!("when" in variant)) fail(`${vat}.when`, "a variant names in `when` the condition under which it holds");
        condition(variant.when, `${vat}.when`, context.fields);
        isBoolean(variant.nonEmpty, `${vat}.nonEmpty`);
        requirementName(variant.rule, `${vat}.rule`);
        type(merged(spec, variant), vat);
      });
    }
  }

  // The value specifications of keys — front matter, lines, a section's fields —, each key of the form [a-z][a-z0-9_-]*.
  function keyedSpecs(specs, at, context) {
    if (!isObject(specs)) fail(at, "an object of keys, each with its value specification");
    for (const [key, spec] of Object.entries(specs)) {
      if (!KEY_FORM.test(key)) fail(`${at}.${key}`, "a key is [a-z][a-z0-9_-]*");
      valueSpec(spec, `${at}.${key}`, context);
    }
  }

  function heading(value, at, taken) {
    if (typeof value !== "string" || !HEADING_FORM.test(value) || value !== value.trim()) {
      fail(at, "a heading line, such as ## Context");
    }
    if (taken.includes(value)) fail(at, `the heading ${value} is named twice`);
    taken.push(value);
  }

  // A section under the title: { underTitle: true } in place of a heading, and the schema's first section, so at most one.
  function underTitle(section, i) {
    const at = `sections[${i}]`;
    if (section.underTitle !== true) fail(`${at}.underTitle`, "true: the section is the text under the document's title");
    if ("heading" in section) fail(`${at}.heading`, "a section under the title is named { underTitle: true } in place of a heading");
    if (i !== 0) fail(`${at}.underTitle`, "a schema names at most one section under the title, as its first section");
  }

  function table(value, at, frontKeys, headings) {
    if (!isObject(value)) fail(at, "a table is { columns, header, appendOnly }");
    onlyKeys(value, TABLE_KEYS, at, "a table");
    isBoolean(value.header, `${at}.header`);
    isBoolean(value.appendOnly, `${at}.appendOnly`);
    if (!Array.isArray(value.columns) || !value.columns.length) fail(`${at}.columns`, "a table names its columns, at least one");
    const names = [];
    value.columns.forEach((column, i) => {
      const cat = `${at}.columns[${i}]`;
      if (!isObject(column)) fail(cat, "a column is { name, value }");
      onlyKeys(column, ["name", "value"], cat, "a column");
      if (typeof column.name !== "string" || !column.name.trim() || column.name !== column.name.trim() || /[|\r\n]/.test(column.name)) {
        fail(`${cat}.name`, "a column's name: a text without | or a line break");
      }
      if (names.includes(column.name)) fail(`${cat}.name`, `the column ${column.name} is named twice`);
      names.push(column.name);
    });
    const context = { fields: new Set([...names, ...frontKeys]), headings };
    value.columns.forEach((column, i) => valueSpec(column.value, `${at}.columns[${i}].value`, context));
  }

  return function check(s) {
    onlyKeys(s, TOP_KEYS, "", "the schema language");
    if (typeof s.schema !== "string" || !/^[a-z][a-z0-9-]*$/.test(s.schema)) {
      fail("schema", "the format's name, in lower-case words joined by -, such as use-case");
    }
    if (s.shape !== "document" && s.shape !== "lines") fail("shape", "document or lines");
    requirementName(s.rule, "rule");
    const document = s.shape === "document";
    if (!document) for (const key of DOCUMENT_ONLY) if (key in s) fail(key, `${key} belongs to the shape document, not to lines`);
    if (document && "lines" in s) fail("lines", "lines belong to the shape lines, not to document");
    if ("path" in s) path(s.path);

    const keysAt = document ? "frontMatter" : "lines";
    const specs = s[keysAt];
    if (specs !== undefined && !isObject(specs)) fail(keysAt, "an object of keys, each with its value specification");
    const frontKeys = Object.keys(specs ?? {});

    if ("sections" in s && !Array.isArray(s.sections)) fail("sections", "a list of sections");
    if ("appended" in s && !Array.isArray(s.appended)) fail("appended", "a list of the sections that may be appended");
    const headings = [];
    const sections = s.sections ?? [];
    sections.forEach((section, i) => {
      if (!isObject(section)) fail(`sections[${i}]`, "a section is { heading or underTitle, required, fields or table }");
      if ("underTitle" in section) {
        underTitle(section, i);
      } else {
        heading(section.heading, `sections[${i}].heading`, headings);
        if (sections[0].underTitle === true && HEADING_FORM.exec(section.heading)[1].length === 1) {
          fail(`sections[${i}].heading`, "a schema that names the section under the title names no section of level one");
        }
      }
    });
    (s.appended ?? []).forEach((section, i) => {
      if (!isObject(section)) fail(`appended[${i}]`, "an appended section is { heading, fields, repeat }");
      heading(section.heading, `appended[${i}].heading`, headings);
    });
    const sectionHeadings = sections.filter((section) => !section.underTitle).map((section) => section.heading);

    if ("identifier" in s) {
      if (!isObject(s.identifier)) fail("identifier", "{ field, kind }");
      onlyKeys(s.identifier, ["field", "kind"], "identifier", "an identifier");
      if (!KINDS.includes(s.identifier.kind)) fail("identifier.kind", `one of the kinds ${KINDS.join(", ")}`);
      if (typeof s.identifier.field !== "string" || !frontKeys.includes(s.identifier.field)) {
        fail("identifier.field", `a key of the schema's ${keysAt}`);
      }
    }
    if (specs !== undefined) keyedSpecs(specs, keysAt, { fields: new Set(frontKeys), headings: sectionHeadings });

    if ("title" in s) {
      if (typeof s.title !== "string" || !HEADING_FORM.test(s.title)) fail("title", "the pattern of a heading line, such as # {id} {title}");
      for (const [, key] of s.title.matchAll(/\{([^{}]*)\}/g)) {
        if (!frontKeys.includes(key)) fail("title", `{${key}} names no key of the front matter`);
      }
    }
    (s.sections ?? []).forEach((section, i) => {
      const at = `sections[${i}]`;
      onlyKeys(section, SECTION_KEYS, at, "a section");
      isBoolean(section.required, `${at}.required`);
      requirementName(section.rule, `${at}.rule`);
      if ("fields" in section && "table" in section) fail(at, "a section holds fields or a table, not both");
      if ("fields" in section) {
        keyedSpecs(section.fields, `${at}.fields`,
          { fields: new Set([...frontKeys, ...Object.keys(section.fields ?? {})]), headings: sectionHeadings });
      }
      if ("table" in section) table(section.table, `${at}.table`, frontKeys, sectionHeadings);
    });
    (s.appended ?? []).forEach((section, i) => {
      const at = `appended[${i}]`;
      onlyKeys(section, APPENDED_KEYS, at, "an appended section");
      isBoolean(section.repeat, `${at}.repeat`);
      if ("fields" in section) {
        keyedSpecs(section.fields, `${at}.fields`,
          { fields: new Set([...frontKeys, ...Object.keys(section.fields ?? {})]), headings: sectionHeadings });
      }
    });
    if ("otherSections" in s && !["allowed", "forbidden"].includes(s.otherSections)) fail("otherSections", "allowed or forbidden");
    if ("diagrams" in s && !["required", "allowed", "none"].includes(s.diagrams)) fail("diagrams", "required, allowed or none");
    isBoolean(s.noHistory, "noHistory");
    if ("key" in s) {
      if (!Array.isArray(s.key) || !s.key.length) fail("key", "a list of the fields whose values are the format's key");
      s.key.forEach((field, i) => {
        if (typeof field !== "string" || !frontKeys.includes(field)) fail(`key[${i}]`, `a key of the schema's ${keysAt}`);
      });
    }
  };
}

// ---------------------------------------------------------------- compiling a schema

const LOADED = new WeakMap();

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A path pattern as a regular expression, and the identifier a path of it gives: what {id} matched, or `<kind>-` followed
// by what {nnn} or {slug} matched — for a schema that names where its identifier stands.
function pathPattern(pattern, kind) {
  let source = "^", group = 0, idGroup = null, prefix = null;
  for (const part of pattern.split(/(\{(?:id|nnn|slug|blob12|any)\})/)) {
    if (!part.startsWith("{")) { source += escape(part); continue; }
    group += 1;
    const name = part.slice(1, -1);
    const before = source;
    if (name === "id") {
      source += `(${(kind ? [kind] : KINDS).map((k) => `${k}-${KIND_FORMS[k]}`).join("|")})`;
      if (kind) { idGroup = group; prefix = ""; }
    } else if (name === "nnn") source += "(\\d{3,})";
    else if (name === "slug") source += `(${SLUG})`;
    else if (name === "blob12") source += "([0-9a-f]{12})";
    else source += "([^/]+)";
    if (kind && idGroup === null && (name === "nnn" || name === "slug") && before.endsWith(escape(`${kind}-`))) {
      idGroup = group;
      prefix = `${kind}-`;
    }
  }
  const re = new RegExp(`${source}$`);
  return { re, idOf: (match) => (idGroup === null ? null : `${prefix}${match[idGroup]}`) };
}

// What a schema compiles to: its path patterns; the level of its sections, that of the headings it names, ## when it names
// none; the section under the title, where it names one, and its other sections by heading, each with its place among the
// schema's sections; its appended sections by heading; and the sections that hold a table.
function compile(s) {
  const kind = s.identifier?.kind ?? null;
  const patterns = s.path === undefined ? [] : (Array.isArray(s.path) ? s.path : [s.path]).map((p) => pathPattern(p, kind));
  const sections = s.sections ?? [];
  const headed = sections.filter((spec) => !spec.underTitle);
  const levels = [...headed, ...(s.appended ?? [])].map((section) => HEADING_FORM.exec(section.heading)[1].length);
  return {
    patterns,
    level: levels.length ? Math.max(...levels) : 2,
    underTitle: sections[0]?.underTitle ? { spec: sections[0], index: 0 } : null,
    sections: new Map(headed.map((spec) => [spec.heading, { spec, index: sections.indexOf(spec) }])),
    appended: new Map((s.appended ?? []).map((spec) => [spec.heading, spec])),
    tables: sections.filter((spec) => spec.table),
  };
}

// sectionOf(compiled, section, place, title) -> { spec, index } | undefined — the section of the schema that a document's
// section is, with its place among the schema's sections: the section under the title for the first section of a document
// with a title — the reader reads the title line as its heading —, where the schema names one; else the section its
// heading names.
export function sectionOf(compiled, section, place, title) {
  if (place === 0 && typeof title === "string" && compiled.underTitle) return compiled.underTitle;
  return compiled.sections.get(section?.heading);
}

function freeze(value) {
  if (value !== null && typeof value === "object") {
    Object.freeze(value);
    for (const inner of Object.values(value)) freeze(inner);
  }
  return value;
}

// compiledOf(schema) -> what loadSchema compiled for the schema; a TypeError for every object loadSchema did not return.
export function compiledOf(schema) {
  const compiled = schema !== null && typeof schema === "object" ? LOADED.get(schema) : undefined;
  if (!compiled) throw new TypeError("MOD-documents: not a schema loadSchema returned — load the schema from its data file first");
  return compiled;
}

// ---------------------------------------------------------------- loadSchema

// loadSchema(text: string, owner: string) -> Schema — reads a schema data file of the module `owner`: the JSON object of its
// one ```json block, checked against the language. Throws SchemaError naming the key and the owner when the schema breaks the
// language, and naming the owner, with `key` null, when the file holds no such block, more than one, one that is never
// closed, or one that holds no JSON object.
export function loadSchema(text, owner) {
  const who = String(owner);
  const lines = textLines(String(text ?? ""));
  const blocks = fences(lines).blocks.filter((block) => block.info === "json");
  if (blocks.length !== 1) {
    throw schemaError(who, null, `the schema file holds ${blocks.length ? `${blocks.length} \`\`\`json blocks` : "no ```json block"}; `
      + "it holds its schema as the JSON object of exactly one");
  }
  const [block] = blocks;
  if (block.to === lines.length) throw schemaError(who, null, "the ```json block of the schema file is never closed");
  let schema;
  try {
    schema = JSON.parse(lines.slice(block.from + 1, block.to).join("\n"));
  } catch (error) {
    throw schemaError(who, null, `the \`\`\`json block of the schema file is not JSON: ${error.message}`);
  }
  if (!isObject(schema)) throw schemaError(who, null, "the ```json block of the schema file holds no JSON object");
  checker(who)(schema);
  freeze(schema);
  LOADED.set(schema, compile(schema));
  return schema;
}
