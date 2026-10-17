// Reads — which declared tests of a test file read a document when they run (ITM-650; SPEC.md `A TEST DOES NOT TAKE ITS
// EXPECTED RESULT FROM A DOCUMENT`). The list is for review: whether a listed test takes its expected result from the
// document stays a human decision.
//
// Module: MOD-test-document
//
// A test is listed when the `module` of its declaration is a module (`MOD-<slug>`) and a read of SPEC.md, of a file under
// docs/use-cases/ or of a file under docs/architecture/ stands in its text — or above the file's first declaration, where it
// runs for every test of the file. A read is a call of a file-reading function (`readFileSync`, `readFile`,
// `createReadStream`, `read_text`, `read_bytes` and, in Python, `open`), with its arguments, naming such a document directly
// or through a name that the file assigns such a path. A read of a path under a `fixtures` folder is a read of a fixture.

import { testDeclarations } from "./declarations.mjs";

const READ_CALL = /\b(readFileSync|readFile|createReadStream|read_text|read_bytes|open)\s*\(/g;
const DOCUMENTS = [
  ["SPEC.md", /SPEC\.md/],
  ["docs/use-cases", /docs\/use-cases\/|["']docs["'][^\n]{0,20}["']use-cases["']/],
  ["docs/architecture", /docs\/architecture\/|["']docs["'][^\n]{0,20}["']architecture["']/],
];
const MODULE = /^MOD-/;
const MAX_STATEMENT_LINES = 6;

// The kinds of document that `text` names.
function documentsNamed(text) {
  return DOCUMENTS.filter(([, pattern]) => pattern.test(text)).map(([kind]) => kind);
}

// The statement that starts on line `index`: its lines up to the one where the parentheses opened on it are closed.
function statementAt(lines, index) {
  let depth = 0;
  let text = "";
  for (let i = index; i < Math.min(lines.length, index + MAX_STATEMENT_LINES); i += 1) {
    text += `${lines[i]}\n`;
    for (const ch of lines[i]) depth += ch === "(" ? 1 : ch === ")" ? -1 : 0;
    if (depth <= 0) break;
  }
  return text;
}

// The documents each name of the file is assigned a path to: { NAME: kinds }.
function assignedPaths(lines) {
  const names = new Map();
  for (const line of lines) {
    const assignment = /^\s*(?:export\s+)?(?:const|let|var)?\s*([A-Za-z_]\w*)\s*=([^=].*)$/.exec(line);
    if (assignment !== null && !/fixtures/.test(assignment[2])) names.set(assignment[1], documentsNamed(assignment[2]));
  }
  return names;
}

// Every read of a document in a file: { line, kinds }.
function readsOf(path, lines) {
  const names = assignedPaths(lines);
  const reads = [];
  lines.forEach((line, index) => {
    for (const call of line.matchAll(READ_CALL)) {
      if (call[1] === "open" && !path.endsWith(".py")) continue; // `open` is no file-reading function of JavaScript
      const statement = statementAt(lines, index);
      if (/fixtures/.test(statement)) continue;
      const kinds = new Set(documentsNamed(statement));
      for (const name of statement.match(/\b[A-Za-z_]\w*\b/g)) for (const kind of names.get(name) ?? []) kinds.add(kind);
      if (kinds.size > 0) reads.push({ line: index + 1, kinds: [...kinds] });
    }
  });
  return reads;
}

// testsReadingDocuments(path: string, text: string) -> { id, module, line, reads: string[] }[] — the declared tests of a
// test file that name a module and read SPEC.md, a use case or an architecture file when they run, in order, each with the
// kinds of document it reads: "SPEC.md", "docs/use-cases", "docs/architecture".
export function testsReadingDocuments(path, text) {
  const all = testDeclarations(path, text);
  const declarations = all.filter((d) => typeof d.module === "string" && MODULE.test(d.module));
  if (declarations.length === 0) return [];
  const reads = readsOf(path, String(text).split("\n"));
  const listed = [];
  for (const d of declarations) {
    const index = all.indexOf(d);
    const end = index + 1 < all.length ? all[index + 1].line : Infinity;
    const kinds = new Set();
    for (const r of reads) if (r.line < all[0].line || (r.line >= d.line && r.line < end)) r.kinds.forEach((k) => kinds.add(k));
    if (kinds.size > 0) listed.push({ id: d.id, module: d.module, line: d.line, reads: [...kinds] });
  }
  return listed;
}
