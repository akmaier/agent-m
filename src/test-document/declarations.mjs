// Declarations — finding the test declarations in a file's text (MOD-test-document, Data).
//
// Module: MOD-test-document
//
// A declaration is a block of comment lines directly before a test case, in the comment marker of the file's language —
// `//`, `#`, `--`, `;` or the ` *` of a block comment, each after any indentation — or, for a manual test of level
// `user`, the same lines under a heading `### TST-<nnn> <title>` of a Markdown file (`path` ending `.md`). Its first line
// names the identifier, `TST-<nnn>`, and may pack further `key: value` parts after it on the same line, separated by
// ` · `; each following line is one whole `key: value` — even where its value itself holds ` · `, as UC-047's own
// notification text does: that does not split the line, and does not end the declaration (the reason of this item's
// rejection in sprint 08, docs/gates/20261007-1317-development-release-testing-a439.md). A declaration ends at the
// first line that is not a comment line of this form (in a Markdown file, not a plain `key: value` line); a missing key
// reads `null`.

const MARKERS = ["//", "#", "--", ";", "*"];
const PACK_SEPARATOR = " · ";
const FIRST_LINE = /^TST-(\d+)$/;
const KEY_LINE = /^([a-z]+):(.*)$/;
const HEADING = /^### (TST-\d+)\b/;
const FIELD_KEYS = ["level", "module", "guards", "given", "input", "expect", "runs", "phrasings", "paid"];

// The text as its lines, in order, each without its line ending (LF or CR LF).
function splitLines(text) {
  return text.split("\n").map((line) => (line.endsWith("\r") ? line.slice(0, -1) : line));
}

// `line` with its leading comment marker — one of MARKERS, after any indentation — and one layer of the whitespace that
// follows it removed; `null` where `line` carries none of MARKERS.
function commentContent(line) {
  const trimmed = line.replace(/^[ \t]+/, "");
  const marker = MARKERS.find((m) => trimmed.startsWith(m));
  return marker === undefined ? null : trimmed.slice(marker.length).replace(/^[ \t]+/, "");
}

// A fresh set of fields, every key named under Data `null`.
function emptyFields() {
  return Object.fromEntries(FIELD_KEYS.map((key) => [key, null]));
}

// Reads one `key: value` part into `fields`: `guards` splits its value at `;`, `runs` and `phrasings` read theirs as a
// number, every other key keeps its value trimmed, read whole. A key that is not one of FIELD_KEYS is passed over.
function applyField(fields, key, rawValue) {
  if (!FIELD_KEYS.includes(key)) return;
  const value = rawValue.trim();
  if (key === "guards") fields.guards = value.split(";").map((part) => part.trim()).filter((part) => part !== "");
  else if (key === "runs" || key === "phrasings") fields[key] = value === "" ? null : Number(value);
  else fields[key] = value;
}

// One declaration under construction (its identifier, fields, path and first line), flattened to a TestDeclaration.
function toDeclaration(entry) {
  return { id: entry.id, ...entry.fields, path: entry.path, line: entry.line };
}

// testDeclarations(path: string, text: string) -> TestDeclaration[] — every test declaration of a test file, in order,
// as MOD-test-document's Data states them. `path` names the declarations it returns, and selects the form read: a
// Markdown file (`path` ending `.md`) by its headings, any other by its comment lines. It never throws on content: a
// declaration missing a key is read with that key `null`, and a file with no declaration yields none.
export function testDeclarations(path, text) {
  const p = typeof path === "string" ? path : String(path ?? "");
  const t = typeof text === "string" ? text : String(text ?? "");
  return p.endsWith(".md") ? markdownDeclarations(p, t) : commentDeclarations(p, t);
}

// testDeclarations for any file read by its comment lines (every language but Markdown).
function commentDeclarations(path, text) {
  const declarations = [];
  let current = null;
  const lines = splitLines(text);
  for (let i = 0; i < lines.length; i += 1) {
    const content = commentContent(lines[i]);
    if (content === null) { current = null; continue; }
    if (current !== null) {
      const key = KEY_LINE.exec(content);
      if (key !== null) { applyField(current.fields, key[1], key[2]); continue; }
      current = null; // this comment line does not continue the declaration — it may still start a new one below
    }
    const parts = content.split(PACK_SEPARATOR);
    const id = FIRST_LINE.exec(parts[0].trim());
    if (id === null) continue;
    current = { id: parts[0].trim(), fields: emptyFields(), path, line: i + 1 };
    for (const part of parts.slice(1)) {
      const key = KEY_LINE.exec(part.trim());
      if (key !== null) applyField(current.fields, key[1], key[2]);
    }
    declarations.push(current);
  }
  return declarations.map(toDeclaration);
}

// testDeclarations for a Markdown file, read by its headings `### TST-<nnn> <title>`.
function markdownDeclarations(path, text) {
  const declarations = [];
  let current = null;
  const lines = splitLines(text);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (current !== null) {
      const key = KEY_LINE.exec(line);
      if (key !== null) { applyField(current.fields, key[1], key[2]); continue; }
      current = null;
    }
    const heading = HEADING.exec(line);
    if (heading === null) continue;
    current = { id: heading[1], fields: emptyFields(), path, line: i + 1 };
    declarations.push(current);
  }
  return declarations.map(toDeclaration);
}
