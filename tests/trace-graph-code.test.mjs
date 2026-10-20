// The code files and their imports in the trace graph (ITM-735) — MOD-trace-graph's traceGraph, as the Data and the Graph type of
// docs/architecture/MOD-trace-graph.md state them: a code file — a file whose extension the Data lists, outside `docs/`, test files
// and folders named `vendor` or `node_modules` — is a node of the kind `code` whose id is its path; for JavaScript, TypeScript,
// Python and CSS its imports are read, and an import into another module's folder is an `imports` edge from the code node to that
// module; a file of another language is a code node whose imports are not read.
// Run: node --test tests/trace-graph-code.test.mjs
//
// Module: MOD-trace-graph
// Guards: UC-025; THE TRACEABILITY MATRIX IS DERIVED; A MODULE IS A FOLDER; EVERY CODE FILE BELONGS TO A MODULE
// Level: unit
//
// The fixture is small and ours: two module files, MOD-alpha with the folder src/alpha/ and MOD-beta with the folder src/beta/,
// and code files given to traceGraph through a TextSource built here. Each test states its input and its expected result before it
// runs (given / input / expect); the expected lines are the numbers of the fixture's lines, written beside each line of it. Where a
// test expects that something is not there, the same graph is first shown to hold its known positive.
// The counter-proofs are recorded in the pull request.
//
// Readings the tests rest on, each quoted from MOD-trace-graph.md:
// - Data, "A specifier that begins with `.` is resolved against the importing file's directory, any other against the repository's
//   root": a Python `import a.b` and `from a.b import c` name the path a/b, and CSS and JavaScript specifiers that do not begin with
//   `.` name a path from the root.
// - Graph, "an `imports` edge's `from` is the importing code node's `id`, its `to` the identifier of the module imported, its `path`
//   and `line` the file and line of the import": the line of an import is the line its statement begins on.
// - Data, "An `imports` edge is made only when that module is another than the importing file's own": a file in no module's folder
//   has no module of its own, so an import into a module is an edge.

import test from "node:test";
import assert from "node:assert/strict";
import { architectureImpact, coverageGaps, graphFindings, requirementImpact, traceGraph } from "../src/trace-graph/index.mjs";

const moduleText = (id, folder) => ["---", `id: ${id}`, `title: ${id}`, `folder: ${folder}`, "---", `# ${id}`, ""].join("\n");

const MODULES = {
  "docs/architecture/MOD-alpha.md": moduleText("MOD-alpha", "src/alpha/"),
  "docs/architecture/MOD-beta.md": moduleText("MOD-beta", "src/beta/"),
};

// A TextSource over a fixed set of files, whose reads and readMany calls are logged; a path named in `missing` is listed too, but
// `read` resolves null for it.
function source(files, missing = []) {
  const log = [];
  return {
    log,
    paths: [...Object.keys(files), ...missing],
    readMany: async (paths) => { log.push(["readMany", [...paths]]); },
    read: async (path) => { log.push(["read", path]); return Object.prototype.hasOwnProperty.call(files, path) ? files[path] : null; },
  };
}

const lines = (...rows) => rows.join("\n") + "\n";
const importsOfFile = (graph, path) => graph.edges.filter((e) => e.via === "imports" && e.from === path);
const imports = (from, line, to = "MOD-beta") => ({ from, to, via: "imports", interface: null, path: from, line });

// A code node is its path, on line 1, with no title, blob or other fact.
const codeNode = (path) => ({ id: path, kind: "code", path, line: 1, title: null, blob: null,
  folder: null, provides: null, level: null, tests: null, sources: null });

// TST-735001 · level: unit · module: MOD-trace-graph
// guards: UC-025; EVERY CODE FILE BELONGS TO A MODULE
// given: the two module files and the files src/alpha/a.mjs, src/beta/b.mjs, loose/outside.mjs (in no module's folder), src/alpha/legacy.rb (another language), src/alpha/vendor/lib.js, src/beta/node_modules/x/index.js, docs/tool.mjs, tests/alpha.test.mjs and README.md
// input: traceGraph over a TextSource that lists them
// expect: exactly four code nodes, in the order of the paths — src/alpha/a.mjs, src/beta/b.mjs, loose/outside.mjs, src/alpha/legacy.rb —, each {id: its path, kind: "code", path: its path, line: 1, title/blob/folder/provides/level/tests/sources: null}; no node for the vendor, node_modules, docs, test and README files; the .rb file is not read and is not in unread
test("TST-735001 a code file is a code node by its path; the excluded files and the other-language file's imports are not read", async () => {
  const files = { ...MODULES,
    "src/alpha/a.mjs": "export const a = 1;\n", "src/beta/b.mjs": "export const b = 1;\n", "loose/outside.mjs": "export const o = 1;\n",
    "src/alpha/legacy.rb": "require 'x'\n", "src/alpha/vendor/lib.js": "export const v = 1;\n",
    "src/beta/node_modules/x/index.js": "export const x = 1;\n", "docs/tool.mjs": "export const t = 1;\n",
    "tests/alpha.test.mjs": "// test\n", "README.md": "# readme\n" };
  const src = source(files);
  const graph = await traceGraph(src);
  assert.ok(graph.nodes.has("MOD-alpha"), "positive control: the module files are read");
  assert.deepEqual([...graph.nodes.values()].filter((n) => n.kind === "code"),
    ["src/alpha/a.mjs", "src/beta/b.mjs", "loose/outside.mjs", "src/alpha/legacy.rb"].map(codeNode));
  assert.equal(graph.nodes.get("src/alpha/a.mjs").kind, "code", "positive control: a code node answers by its path");
  for (const path of ["src/alpha/vendor/lib.js", "src/beta/node_modules/x/index.js", "docs/tool.mjs", "tests/alpha.test.mjs", "README.md"]) {
    assert.equal(graph.nodes.has(path), false, path);
  }
  assert.equal(src.log.some(([what, path]) => what === "read" && path === "src/alpha/legacy.rb"), false);
  assert.equal(src.log.some(([what, path]) => what === "read" && path === "src/alpha/a.mjs"), true, "positive control: a read language is read");
  assert.deepEqual(graph.unread, []);
  assert.deepEqual(graph.edges.filter((e) => e.via === "imports"), []);
});

// TST-735002 · level: unit · module: MOD-trace-graph
// guards: UC-025; THE TRACEABILITY MATRIX IS DERIVED
// given: src/alpha/js.mjs of the 14 lines below, whose imports are on lines 1, 2, 3, 4, 5, 9 and 12 into MOD-beta, and on lines 6, 7, 8 and 13 into none (its own module, a node: name, a path in no folder, a line comment)
// input: traceGraph over it, the module files and src/beta/one.mjs
// expect: exactly seven imports edges, all from src/alpha/js.mjs to MOD-beta, with interface null, path src/alpha/js.mjs and the lines 1, 2, 3, 4, 5, 9, 12, in that order
test("TST-735002 JavaScript: static import, bare import, export from, import() and require() into another module's folder are edges", async () => {
  const code = lines(
    'import { one } from "../beta/one.mjs";', // 1
    'import "../beta/two.mjs";', // 2
    'export { three } from "../beta/three.mjs";', // 3
    'const four = await import("../beta/four.mjs");', // 4
    'const five = require("../beta/five.cjs");', // 5
    'import { own } from "./own.mjs";', // 6: its own module
    'import fs from "node:fs";', // 7: a package, no path of the repository
    'import loose from "../../loose/free.mjs";', // 8: a path in no module's folder
    "import {", // 9: the statement begins here
    "  multi,",
    '} from "../beta/multi.mjs";',
    'import root from "src/beta/root.mjs";', // 12: not begun with a dot, so from the root
    '// import "../beta/commented.mjs";', // 13: a comment line
    "export const js = 1;", // 14
  );
  const graph = await traceGraph(source({ ...MODULES, "src/alpha/js.mjs": code, "src/beta/one.mjs": "export const one = 1;\n" }));
  assert.ok(graph.nodes.has("src/beta/one.mjs"), "positive control: the module's other code file is a node");
  assert.deepEqual(importsOfFile(graph, "src/alpha/js.mjs"), [1, 2, 3, 4, 5, 9, 12].map((line) => imports("src/alpha/js.mjs", line)));
  assert.equal(graph.edges.filter((e) => e.via === "imports").length, 7);
});

// TST-735003 · level: unit · module: MOD-trace-graph
// guards: UC-025
// given: src/alpha/f.js, f.cjs, f.jsx, f.ts, f.tsx, f.mts and f.cts, each the one line `import "../beta/x.mjs";`; src/alpha/types.ts of two lines, `import type { T } from "../beta/types.ts";` and `export * from "../beta/all.ts";`
// input: traceGraph over them and the module files
// expect: an imports edge to MOD-beta, line 1, from each of the seven one-line files, and edges on lines 1 and 2 from src/alpha/types.ts
test("TST-735003 JavaScript and TypeScript extensions are all read for their imports", async () => {
  const files = { ...MODULES };
  for (const extension of ["js", "cjs", "jsx", "ts", "tsx", "mts", "cts"]) files[`src/alpha/f.${extension}`] = 'import "../beta/x.mjs";\n';
  files["src/alpha/types.ts"] = lines('import type { T } from "../beta/types.ts";', 'export * from "../beta/all.ts";');
  const graph = await traceGraph(source(files));
  for (const extension of ["js", "cjs", "jsx", "ts", "tsx", "mts", "cts"]) {
    assert.deepEqual(importsOfFile(graph, `src/alpha/f.${extension}`), [imports(`src/alpha/f.${extension}`, 1)], extension);
  }
  assert.deepEqual(importsOfFile(graph, "src/alpha/types.ts"), [imports("src/alpha/types.ts", 1), imports("src/alpha/types.ts", 2)]);
});

// TST-735004 · level: unit · module: MOD-trace-graph
// guards: UC-025
// given: src/alpha/p.py of the 9 lines below; lines 1, 2, 3, 4 and 5 import into MOD-beta, lines 6, 7, 8 and 9 into none (its own module twice, a package, a comment)
// input: traceGraph over it and the module files
// expect: exactly five imports edges from src/alpha/p.py to MOD-beta, on the lines 1, 2, 3, 4 and 5, in that order — line 2 lists `os` first, a package, which makes none, and then a path into MOD-beta, which makes one
test("TST-735004 Python: import a.b, from a.b import c and the relative forms into another module's folder are edges", async () => {
  const code = lines(
    "import src.beta.mod", // 1: the dotted name is a path from the root
    "import os, src.beta.other as other", // 2: `os` is a package; the second name is an edge
    "from src.beta.mod import c", // 3
    "from ..beta.mod import c", // 4: relative to the file's directory src/alpha
    "from ..beta import mod", // 5: the directory src/beta itself
    "from . import sibling", // 6: its own module
    "from .inner import z", // 7: its own module
    "from os import path", // 8: a package
    "# import src.beta.commented", // 9: a comment
  );
  const graph = await traceGraph(source({ ...MODULES, "src/alpha/p.py": code }));
  assert.ok(graph.nodes.has("src/alpha/p.py"), "positive control: the Python file is a code node");
  assert.deepEqual(importsOfFile(graph, "src/alpha/p.py"), [1, 2, 3, 4, 5].map((line) => imports("src/alpha/p.py", line)));
});

// TST-735005 · level: unit · module: MOD-trace-graph
// guards: UC-025
// given: src/alpha/s.css of the 7 lines below; lines 1, 2 and 3 import into MOD-beta, lines 4, 5, 6 and 7 into none (its own module, a comment, an address, a rule)
// input: traceGraph over it and the module files
// expect: exactly three imports edges from src/alpha/s.css to MOD-beta, on the lines 1, 2 and 3
test("TST-735005 CSS: @import \"x\" and @import url(\"x\") into another module's folder are edges", async () => {
  const code = lines(
    '@import "../beta/base.css";', // 1
    '@import url("../beta/theme.css");', // 2
    "@import url('../beta/other.css');", // 3
    '@import "./local.css";', // 4: its own module
    '/* @import "../beta/commented.css"; */', // 5: a comment
    '@import "https://fonts.example/x.css";', // 6: an address
    "p { color: black; }", // 7
  );
  const graph = await traceGraph(source({ ...MODULES, "src/alpha/s.css": code }));
  assert.deepEqual(importsOfFile(graph, "src/alpha/s.css"), [1, 2, 3].map((line) => imports("src/alpha/s.css", line)));
});

// TST-735006 · level: unit · module: MOD-trace-graph
// guards: UC-025; EVERY CODE FILE BELONGS TO A MODULE
// given: loose/outside.mjs, in no module's folder, with the one line `import "../src/beta/b.mjs";`, and src/beta/inner.mjs, in MOD-beta, with `import "./b.mjs";` and `import "../alpha/a.mjs";`
// input: traceGraph over them and the module files
// expect: one imports edge from loose/outside.mjs to MOD-beta on line 1 (a file in no module has none of its own); from src/beta/inner.mjs only the edge to MOD-alpha on line 2, none for the import into its own module
test("TST-735006 a file in no module's folder imports a module; an import into the file's own module makes no edge", async () => {
  const graph = await traceGraph(source({ ...MODULES, "loose/outside.mjs": 'import "../src/beta/b.mjs";\n',
    "src/beta/inner.mjs": lines('import "./b.mjs";', 'import "../alpha/a.mjs";') }));
  assert.deepEqual(importsOfFile(graph, "loose/outside.mjs"), [imports("loose/outside.mjs", 1)]);
  assert.deepEqual(importsOfFile(graph, "src/beta/inner.mjs"), [imports("src/beta/inner.mjs", 2, "MOD-alpha")]);
});

// TST-735007 · level: unit · module: MOD-trace-graph
// guards: UC-025
// given: the module files, src/alpha/a.mjs, src/alpha/s.css, src/alpha/p.py, src/alpha/legacy.rb, src/alpha/gone.mjs (listed, but the source holds no text for it) and src/alpha/vendor/lib.js
// input: traceGraph over a TextSource with readMany
// expect: the one readMany call names the two module files, then src/alpha/a.mjs, s.css, p.py and gone.mjs in the order of the paths — not legacy.rb, not vendor/lib.js —, before every read; gone.mjs is in unread with the reason "the commit does not hold it" and is no node; a.mjs, s.css and p.py are nodes
test("TST-735007 readMany is told the code files of the languages that are read; a code file the source does not hold is unread", async () => {
  const files = { ...MODULES, "src/alpha/a.mjs": "export const a = 1;\n", "src/alpha/s.css": "p { color: black; }\n", "src/alpha/p.py": "p = 1\n",
    "src/alpha/legacy.rb": "x = 1\n", "src/alpha/vendor/lib.js": "export const v = 1;\n" };
  const src = source(files, ["src/alpha/gone.mjs"]);
  const graph = await traceGraph(src);
  assert.deepEqual(src.log[0], ["readMany", ["docs/architecture/MOD-alpha.md", "docs/architecture/MOD-beta.md", "src/alpha/a.mjs", "src/alpha/s.css", "src/alpha/p.py", "src/alpha/gone.mjs"]]);
  assert.equal(src.log.filter(([what]) => what === "readMany").length, 1);
  assert.deepEqual(graph.unread, [{ path: "src/alpha/gone.mjs", reason: "the commit does not hold it" }]);
  assert.equal(graph.nodes.has("src/alpha/gone.mjs"), false);
  for (const path of ["src/alpha/a.mjs", "src/alpha/s.css", "src/alpha/p.py"]) assert.equal(graph.nodes.has(path), true, path);
});

// TST-735008 · level: unit · module: MOD-trace-graph
// guards: UC-025; THE TRACEABILITY MATRIX IS DERIVED
// given: a repository of a SPEC.md, a use case that realises its requirement, MOD-alpha and MOD-beta, once with no code file and once with src/alpha/a.mjs importing src/beta/b.mjs and src/beta/b.mjs
// input: graphFindings, coverageGaps and requirementImpact of the requirement, over the graph of each
// expect: coverageGaps and requirementImpact over the graph with the code files equal those over the graph without them, and so do the findings of graphFindings but for the one finding of the import that MOD-alpha's uses do not name (ITM-1068); the graph with them holds the imports edge (positive control), the graph without them none
test("TST-735008 the checks, the gaps and the impact list give the same result with the code files and their imports", async () => {
  const base = { "SPEC.md": "# Spec\n\n**A THING IS DONE** *(Product Owner)*\n\nIt is done.\n",
    "docs/use-cases/UC-001-a.md": "---\nid: UC-001\ntitle: A\nrealises:\n  - A THING IS DONE\n---\n# UC-001 A\n", ...MODULES };
  const without = await traceGraph(source(base));
  const withCode = await traceGraph(source({ ...base, "src/alpha/a.mjs": 'import { b } from "../beta/b.mjs";\n', "src/beta/b.mjs": "export const b = 1;\n" }));
  assert.equal(withCode.edges.filter((e) => e.via === "imports").length, 1);
  assert.equal(without.edges.filter((e) => e.via === "imports").length, 0);
  const STATES = "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES";
  assert.deepEqual(graphFindings(withCode).filter((found) => found.rule !== STATES), graphFindings(without));
  assert.deepEqual(graphFindings(withCode).filter((found) => found.rule === STATES).map((found) => [found.artifact, found.line]), [["src/alpha/a.mjs", 1]], "the import is the one finding added");
  assert.deepEqual(coverageGaps(withCode), coverageGaps(without));
  assert.deepEqual(requirementImpact(withCode, "A THING IS DONE"), requirementImpact(without, "A THING IS DONE"));
  assert.ok(requirementImpact(withCode, "A THING IS DONE").length > 0, "positive control: the impact list is not empty");
  const change = { path: "docs/architecture/MOD-beta.md", before: base["docs/architecture/MOD-beta.md"], after: base["docs/architecture/MOD-beta.md"] };
  assert.deepEqual(architectureImpact(withCode, [change]).codeFiles, ["src/beta/b.mjs"]);
});
