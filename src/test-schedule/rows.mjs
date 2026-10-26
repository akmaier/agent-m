// The test files a row runs (MOD-test-schedule, Data: The test files of a row; Interfaces: testsOfRow).
//
// Module: MOD-test-schedule
//
// The files that run are the committed files named as tests are named in their language (MOD-test-document's
// isNamedTestFile); a helper, a fixture or a manual test in Markdown is none of them. A file's level is its header's
// `Level:`, or else the one level all its declarations share. The row of a level runs the files of that level none of
// whose declarations names a paid service; the row `paid` runs every file one of whose declarations does (COMMIT TESTS
// CALL NO PAID SERVICE). A named test file whose level cannot be read — no level, or one outside the five levels — is in
// no row, and is named in `unreadable`.

import { isNamedTestFile, testDeclarations, testHeader } from "../test-document/index.mjs";

const LEVELS = ["unit", "component", "system", "release", "user"];
const PAID = "paid";

// The level of a test file: its header's Level:, or else the one level all its declarations share; null where neither
// gives one of the five levels.
function levelOf(path, text) {
  const own = testHeader(path, text)?.level ?? null;
  if (own !== null) return LEVELS.includes(own) ? own : null;
  const levels = new Set(testDeclarations(path, text).map((d) => d.level));
  const [one] = levels;
  return levels.size === 1 && LEVELS.includes(one) ? one : null;
}

// Whether one of a test file's declarations names a paid service.
const callsPaid = (path, text) => testDeclarations(path, text).some((d) => typeof d.paid === "string" && d.paid !== "");

/**
 * filesOfRow(rows: string[], row: string, files: Array<{ path: string, text: string }>) -> { files: string[], unreadable:
 * string[] } — testsOfRow, given the rows the schedule's schema names. Pure; it never throws on content.
 * Errors: `UnknownRow` (with `row`) for a row `rows` does not hold.
 */
export function filesOfRow(rows, row, files) {
  if (!rows.includes(row)) throw Object.assign(new Error(`UnknownRow: ${row} is no row of the schedule`), { name: "UnknownRow", row });
  const runs = [];
  const unreadable = [];
  for (const { path, text } of files) {
    if (!isNamedTestFile(path)) continue;
    const body = typeof text === "string" ? text : String(text ?? "");
    const level = levelOf(path, body);
    if (level === null) unreadable.push(path);
    else if ((row === PAID) === callsPaid(path, body) && (row === PAID || row === level)) runs.push(path);
  }
  const byPath = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  return { files: runs.sort(byPath), unreadable: unreadable.sort(byPath) };
}
