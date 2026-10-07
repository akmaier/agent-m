// Finding the declarations in a test file (docs/architecture/MOD-test-document.md, Data and Interfaces): the block of
// comment lines, in the comment marker of the file's language, or the lines under a Markdown heading `### TST-<nnn>`,
// that declare a test case before it runs. ITM-248 builds it; index.mjs offers it as testDeclarations.
//
// Module: MOD-test-document
//
// Pure: it reads only the text it is given, keeps nothing, performs no input or output, and never throws on content.
//
// A declaration's first line names its identifier, TST-<id>, alone or followed by one or more `key: value` fields
// separated by ` · ` — the same separator a SPEC's `*Check:* ` uses for several paths (MOD-spec-document). Of a manual
// test, the first line is `### TST-<id> <title>` instead; its title is not a field. Every line after the first is
// itself one or more ` · `-separated `key: value` fields — under the same comment marker as the first line, or, under
// a heading, the same plain form without one. A declaration ends at the first line that is not of its form — a blank
// line, a line of code or prose, a line under a different marker, or the end of the text — and scanning then looks for
// the next declaration from that same line on, so two declarations with nothing between them are both found. A key no
// line of a declaration carries is read as null.

// The comment markers of Data, checked against a line with its indentation stripped: "//", "#", "--" and ";" as
// themselves; "*" for a line inside a block comment — the blank Data shows before the star (" *") is only the block's
// own indentation, already stripped by the time a marker is looked for.
const MARKERS = ["//", "#", "--", ";", "*"];
// A line beginning a manual test's declaration: `### TST-<id>`, then its title, read only to be discarded.
const HEADING = /^###[ \t]+(\S+)(?:[ \t]+(.*))?$/;
const FIELD_SEPARATOR = /\s*·\s*/;
const KEY_VALUE = /^([a-z]+):\s*(.*)$/;
const ID = /^TST-\S+$/;

// The keys read as given, and the keys read as a number. `guards` is read on its own: split at `;` and trimmed into a
// list. A key none of these three name is read (so the line still holds the declaration open) but fills no field.
const TEXT_KEYS = ["level", "module", "given", "input", "expect", "paid"];
const NUMBER_KEYS = ["runs", "phrasings"];

// A declaration's fields, every key missing until a line fills it in.
const emptyFields = () => ({
  level: null, module: null, guards: null, given: null, input: null, expect: null, runs: null, phrasings: null,
  paid: null,
});

// A line's marker and what follows it: { marker, content } — content with the indentation, the marker and at most one
// blank after it removed —, or null when the line, indentation stripped, starts with none of MARKERS.
function markerOf(line) {
  const trimmed = line.replace(/^[ \t]+/, "");
  for (const marker of MARKERS) {
    if (trimmed.startsWith(marker)) return { marker, content: trimmed.slice(marker.length).replace(/^[ \t]/, "") };
  }
  return null;
}

// One `key: value` segment, trimmed, as [key, value], or null when it is not of that form.
function fieldOf(segment) {
  const field = KEY_VALUE.exec(segment.trim());
  return field ? [field[1], field[2].trim()] : null;
}

// `key: value` into `fields`.
function apply(fields, key, value) {
  if (TEXT_KEYS.includes(key)) fields[key] = value;
  else if (NUMBER_KEYS.includes(key)) fields[key] = Number(value);
  else if (key === "guards") fields.guards = value.split(";").map((name) => name.trim()).filter(Boolean);
}

// The declaration starting at `line`, or null when it does not begin one: { id, marker, fields } — marker is
// "heading" under a Markdown heading, the comment marker otherwise; fields holds whatever the first line's fields past
// the identifier gave, by themselves or none.
function startAt(line) {
  const heading = HEADING.exec(line.replace(/^[ \t]+/, ""));
  if (heading) return ID.test(heading[1]) ? { id: heading[1], marker: "heading", fields: emptyFields() } : null;

  const marked = markerOf(line);
  if (!marked) return null;
  const segments = marked.content.split(FIELD_SEPARATOR).map((segment) => segment.trim());
  if (!ID.test(segments[0])) return null;
  const fields = emptyFields();
  for (const segment of segments.slice(1)) {
    const field = fieldOf(segment);
    if (!field) return null;
    apply(fields, field[0], field[1]);
  }
  return { id: segments[0], marker: marked.marker, fields };
}

// The fields a further line of an open declaration adds, or null when the line does not continue it (ending the
// declaration there): under "heading" the line itself, trimmed; otherwise the content under the same marker.
function continueAt(line, marker) {
  const content = marker === "heading" ? line.trim() : contentUnder(line, marker);
  if (!content) return null;
  const fields = {};
  for (const segment of content.split(FIELD_SEPARATOR)) {
    const field = fieldOf(segment);
    if (!field) return null;
    apply(fields, field[0], field[1]);
  }
  return fields;
}

// A line's content under `marker`, trimmed, or null when the line does not start with that same marker.
function contentUnder(line, marker) {
  const marked = markerOf(line);
  return marked && marked.marker === marker ? marked.content.trim() : null;
}

// The TestDeclaration an open declaration gives, its fields in the order the module file's Interfaces list them.
function declarationOf(open, path) {
  const f = open.fields;
  return {
    id: open.id, level: f.level, module: f.module, guards: f.guards, given: f.given, input: f.input, expect: f.expect,
    runs: f.runs, phrasings: f.phrasings, paid: f.paid, path, line: open.line,
  };
}

// testDeclarations(path: string, text: string) -> TestDeclaration[] — every declaration of `text`, a test file at
// `path`, in the order it stands. It never throws on content: a declaration missing a key is read with that key null,
// and a file without a declaration yields none — the caller decides whether that is a gap.
export function testDeclarations(path, text) {
  const lines = String(text ?? "").split(/\r\n|\r|\n/);
  const declarations = [];
  let open = null;
  for (let i = 0; i < lines.length; i++) {
    if (open) {
      const more = continueAt(lines[i], open.marker);
      if (more) {
        Object.assign(open.fields, more);
        continue;
      }
      declarations.push(declarationOf(open, path));
      open = null;
      // This same line did not continue the declaration just closed; it may itself start the next one (two
      // declarations can stand with nothing between them), so it falls through to the check below.
    }
    const started = startAt(lines[i]);
    if (started) open = { ...started, line: i + 1 };
  }
  if (open) declarations.push(declarationOf(open, path));
  return declarations;
}
