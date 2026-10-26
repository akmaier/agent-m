// Declarations — finding the test declarations in a file's text, and which files are test files (MOD-test-document, Data).
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
const HEADING = /^### (TST-\d+)\b(.*)$/;
const STRING_LITERAL = /"([^"]*)"|'([^']*)'|`([^`]*)`/;
const DEFINED_NAME = /\b(?:def|function|func)\s+([A-Za-z_]\w*)/;
const FIELD_KEYS = ["level", "module", "guards", "given", "input", "expect", "runs", "phrasings", "paid"];

// A test file (MOD-test-document, Data): a file under a folder named `test`, `tests` or `__tests__`, or a file named as tests are
// named in its language — `*.test.mjs`, `test_*.py`, `*_test.go` and the like —; a Markdown file under such a folder holds manual
// tests, and is a test file as every file under one is. A test's name begins `test_`, ends `_test` or has `.test` or `.spec`
// before its extension.
const TEST_FOLDERS = new Set(["test", "tests", "__tests__"]);
const TEST_NAME = /^test_.|_test\.[A-Za-z0-9]+$|\.(?:test|spec)\.[A-Za-z0-9]+$/;

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

// The title a test case gives itself on `line`, the first line after its declaration (MOD-test-document, Data): its first
// string literal, or else the name it defines; `null` where `line` is absent or holds neither.
function titleOn(line) {
  if (line === undefined) return null;
  const literal = STRING_LITERAL.exec(line);
  if (literal !== null) return literal[1] ?? literal[2] ?? literal[3];
  const defined = DEFINED_NAME.exec(line);
  return defined === null ? null : defined[1];
}

// One declaration under construction (its identifier, fields, path and first line), flattened to a TestDeclaration.
function toDeclaration(entry) {
  return { id: entry.id, title: entry.title, ...entry.fields, path: entry.path, line: entry.line };
}

// isTestFile(path: string) -> boolean — whether a path is a test file, as defined above. The folders of a path are all its parts
// but the last, which is the file's name: a file called `tests` is under no folder named tests.
export function isTestFile(path) {
  const parts = path.split("/");
  return parts.slice(0, -1).some((folder) => TEST_FOLDERS.has(folder)) || TEST_NAME.test(parts[parts.length - 1]);
}

// isNamedTestFile(path: string) -> boolean — whether a path is named as tests are named in its language, as defined above,
// wherever it lies: the files a test runner runs. A helper, a fixture or a Markdown file of manual tests is a test file by its
// folder alone and is none; Markdown is no language whose tests a runner runs, whatever the file is called.
export function isNamedTestFile(path) {
  const name = path.split("/").pop();
  return !name.endsWith(".md") && TEST_NAME.test(name);
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
    if (content === null) { if (current !== null) current.title = titleOn(lines[i]); current = null; continue; }
    if (current !== null) {
      const key = KEY_LINE.exec(content);
      if (key !== null) { applyField(current.fields, key[1], key[2]); continue; }
      current.title = titleOn(lines[i]);
      current = null; // this comment line does not continue the declaration — it may still start a new one below
    }
    const parts = content.split(PACK_SEPARATOR);
    const id = FIRST_LINE.exec(parts[0].trim());
    if (id === null) continue;
    current = { id: parts[0].trim(), title: null, fields: emptyFields(), path, line: i + 1 };
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
    current = { id: heading[1], title: heading[2].trim() || null, fields: emptyFields(), path, line: i + 1 };
    declarations.push(current);
  }
  return declarations.map(toDeclaration);
}
