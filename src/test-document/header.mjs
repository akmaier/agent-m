// Header — the header of a test file or a test helper: its `Module:`, `Guards:` and `Level:` lines among its first lines
// (MOD-test-document, Data: the header; Interfaces: testHeader).
//
// Module: MOD-test-document
//
// A header line is the key behind the comment marker of the file's language — `//`, `#`, `/*`, `<!--` or any other run of
// characters that are neither letters, digits nor quotes —; a line that begins with a letter, a digit or a quote (prose, a
// docstring, a string in code) is no header line. Pure: it reads only the text it is given.

import { finding } from "../text-tools/index.mjs";
import { isTestFile } from "./declarations.mjs";

// The header stands among a file's first 20 lines.
const HEADER_LINES = 20;
// EVERY TEST HAS ONE LEVEL: the five levels.
const LEVELS = ["unit", "component", "system", "release", "user"];
const ONE_LEVEL = "EVERY TEST HAS ONE LEVEL";
const HEADER = /^[^A-Za-z0-9'"`]*(Module|Guards|Level):[ \t]*(.*?)[ \t]*$/;
// A module's identifier, MOD-<slug>, at the start of a Module: line's value.
const MODULE = /^(MOD-[a-z0-9]+(?:-[a-z0-9]+)*)\b/;

// The header lines among the text's first lines -> [{ key, value, line }], the line counted from 1.
function headerLines(text) {
  const out = [];
  text.split("\n").slice(0, HEADER_LINES).forEach((each, index) => {
    const m = HEADER.exec(each.endsWith("\r") ? each.slice(0, -1) : each);
    if (m) out.push({ key: m[1], value: m[2], line: index + 1 });
  });
  return out;
}

const once = (values) => [...new Set(values)];

// The finding of a header whose level is not one of the five on exactly one Level: line, or none.
function levelFindings(path, levels) {
  const one = `one line \`Level: ${LEVELS.join("|")}\``;
  const error = (line, what, fix) => [finding({ artifact: path, line, kind: "error", rule: ONE_LEVEL, what, fix })];
  if (levels.length === 0) return error(1, `no Level: line among the first ${HEADER_LINES} lines`, `add ${one} to the header`);
  if (levels.length > 1) return error(levels[1].line, `${levels.length} Level: lines`, `keep ${one}`);
  if (!LEVELS.includes(levels[0].value)) {
    const what = levels[0].value ? `the level "${levels[0].value}" is not one of ${LEVELS.join(", ")}` : "the Level: line names no level";
    return error(levels[0].line, what, `write ${one}`);
  }
  return [];
}

// testHeader(path: string, text: string) -> { modules, guards, level, findings } | null — the header of a test file that is
// no Markdown file: the modules its Module: lines name and the names its Guards: lines guard (a `;` separates two names, a
// comma belongs to a name), each once and in order; the value of its one Level: line, null without one, with more than one or
// with an empty one; and the error under EVERY TEST HAS ONE LEVEL of a header with no Level: line, with more than one, or with
// a level outside the five, naming the file by its path. null for a path that is no test file and for a Markdown file, whose
// manual tests declare their levels under their headings. It never throws on content.
export function testHeader(path, text) {
  const p = typeof path === "string" ? path : String(path ?? "");
  if (!isTestFile(p) || p.endsWith(".md")) return null;
  const lines = headerLines(typeof text === "string" ? text : String(text ?? ""));
  const modules = once(lines.filter((l) => l.key === "Module").map((l) => MODULE.exec(l.value)?.[1]).filter(Boolean));
  const guards = once(lines.filter((l) => l.key === "Guards")
    .flatMap((l) => l.value.split(";").map((name) => name.trim()).filter(Boolean)));
  const levels = lines.filter((l) => l.key === "Level");
  return {
    modules,
    guards,
    level: levels.length === 1 && levels[0].value ? levels[0].value : null,
    findings: levelFindings(p, levels),
  };
}
