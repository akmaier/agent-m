// Headers — the Module:, Guards: and Level: lines of code and tests, the TST- identifiers of a test's cases, and the check that
// a test has one level. Kernel (ARC-003): pure functions over the texts they are given; nothing is read, sent or stored here.
//
// Module: MOD-artifacts
//
// ARC-020 decisions 1 and 2: among its first 20 lines, behind a comment marker,
//
//   Module: MOD-<slug>                         — a code file and a test: the one module it belongs to or exercises
//   Guards: <NAME>[; <NAME> …]                 — a test: requirement names in capitals, or UC-<nnn>, separated by "; "
//   Level: unit|component|system|release|user  — a test: its one level
//
// and per test case `TST-<nnn>` in the case's name.

import { HEADER_LINES, headerModules, isCodePath, isTestPath } from "../artifacts.mjs";

// EVERY TEST HAS ONE LEVEL: the five levels.
export const LEVELS = ["unit", "component", "system", "release", "user"];

// A header line: the key behind a comment marker, as headerModules reads `Module:` — a line that starts with a letter, a digit
// or a quote (prose, a docstring) is not a header.
const HEADER = /^[^A-Za-z0-9'"`]*(Module|Guards|Level):[ \t]*(.*?)[ \t]*$/;
const CASE_ID = /\bTST-\d{3}\b/g;

// The header lines among a file's first lines -> [{ key, value, line }], line from 1.
function headerLines(text) {
  const out = [];
  String(text ?? "").split("\n").slice(0, HEADER_LINES).forEach((l, i) => {
    const m = HEADER.exec(l);
    if (m) out.push({ key: m[1], value: m[2], line: i + 1 });
  });
  return out;
}

const unique = (xs) => [...new Set(xs)];

// headerTags(path, text) -> { modules, guards, level, cases, test } — the modules its Module: lines name, the names its Guards:
// lines guard (a semicolon separates two names; a comma belongs to a name), the level of its one Level: line (null without one
// or with more than one), the TST- identifiers of its cases in the order they appear, and whether the path is a test.
export function headerTags(path, text) {
  const lines = headerLines(text);
  const guards = unique(lines.filter((l) => l.key === "Guards")
    .flatMap((l) => l.value.split(";").map((g) => g.trim()).filter(Boolean)));
  const levels = lines.filter((l) => l.key === "Level");
  return {
    modules: headerModules(text),
    guards,
    level: levels.length === 1 && levels[0].value ? levels[0].value : null,
    cases: unique(String(text ?? "").match(CASE_ID) ?? []),
    test: isCodePath(path) && isTestPath(path),
  };
}

// levelProblems(path, text) -> [finding] — EVERY TEST HAS ONE LEVEL: a test without a Level: line among its first lines, with
// more than one, or with a level outside the five is an error. A file that is no test owes no level. A finding is
// { artifact, line, kind, what, rule, fix } (MOD-job-harness formatFinding); the artifact is the file's path.
export function levelProblems(path, text) {
  if (!(isCodePath(path) && isTestPath(path))) return [];
  const RULE = "EVERY TEST HAS ONE LEVEL", one = `one line \`Level: ${LEVELS.join("|")}\``;
  const finding = (line, what, fix) => ({ artifact: path, line, kind: "error", what, rule: RULE, fix });
  const levels = headerLines(text).filter((l) => l.key === "Level");
  if (!levels.length) {
    return [finding(1, `no Level: line among the first ${HEADER_LINES} lines`, `add ${one} to the header`)];
  }
  if (levels.length > 1) {
    return [finding(levels[1].line, `${levels.length} Level: lines`, `keep ${one}`)];
  }
  if (!LEVELS.includes(levels[0].value)) {
    const what = levels[0].value ? `the level "${levels[0].value}" is not one of ${LEVELS.join(", ")}` : "the Level: line names no level";
    return [finding(levels[0].line, what, `write ${one}`)];
  }
  return [];
}
