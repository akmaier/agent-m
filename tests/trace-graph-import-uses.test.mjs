// The check finds an import that the module's uses do not name (ITM-1068) — MOD-trace-graph's `graphFindings`, as docs/architecture/MOD-trace-graph.md states it: "a code file's `imports` edge to a module of which the
// file's own module names no interface among its `uses`, named at the file and line of the import with the module imported (`A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES`), the same imports `moduleRows` lists
// as a gap". The `imports` edges are the graph's own (Data: "An `imports` edge is made only when that module is another than the importing file's own").
// Run: node --test tests/trace-graph-import-uses.test.mjs
//
// Module: MOD-trace-graph
// Guards: A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES; DEVELOP AGAINST INTERFACES
// Level: component
//
// The fixture is small and ours: two modules, MOD-alpha in src/alpha/ and MOD-beta in src/beta/, a decision that designs both, and code files, given to traceGraph through a TextSource built here. Readings the tests
// take, which the pull request names: the finding is an error whose `artifact` is the importing file, whose `line` is the line of the import, whose `rule` is the rule above, and whose text names the file, the line and the
// module imported; one finding for each import (each `imports` edge), so a file that imports one module on two lines has two; "names an interface among its uses" is a `uses` entry of the module before the dot, as
// `moduleRows` reads it. The repository test reads the files git tracks. Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are run as mutations and
// recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { graphFindings, moduleRows, traceGraph } from "../src/trace-graph/index.mjs";

const RULE = "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES";
const lines = (...rows) => `${rows.join("\n")}\n`;
const source = (files) => ({ paths: Object.keys(files), read: async (path) => (Object.hasOwn(files, path) ? files[path] : null) });
const moduleFile = (slug, { uses = [], provides = [] } = {}) => {
  const list = (key, names) => (names.length ? [`${key}:`, ...names.map((name) => `  - ${name}`)] : [`${key}: []`]);
  return lines("---", `id: MOD-${slug}`, `title: ${slug}`, `folder: src/${slug}/`, ...list("realises", []), "follows:", "  - ARC-001", ...list("uses", uses), ...list("provides", provides), "---", `# MOD-${slug}`);
};
const DECISION = lines("---", "id: ARC-001", "title: The whole", "forced_by: []", "designs:", "  - MOD-alpha", "  - MOD-beta", "---", "# ARC-001 The whole");
const product = (alpha = {}, code = {}) => ({
  "SPEC.md": "# Fixture\n\n## Rules\n\n", "docs/architecture/ARC-001-the-whole.md": DECISION,
  "docs/architecture/MOD-alpha.md": moduleFile("alpha", alpha), "docs/architecture/MOD-beta.md": moduleFile("beta", { provides: ["thing"] }),
  "src/beta/index.mjs": "export const thing = 1;\n", ...code,
});
const IMPORTS_BETA = { "src/alpha/index.mjs": 'import { thing } from "../beta/index.mjs";\nexport const x = thing;\n' };
const found = async (files) => graphFindings(await traceGraph(source(files))).filter((finding) => finding.rule === RULE);

// TST-106801 · level: component · module: MOD-trace-graph
// guards: A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES; DEVELOP AGAINST INTERFACES
// given: MOD-alpha, whose file `uses` nothing, and a code file src/alpha/index.mjs that imports ../beta/index.mjs on line 1
// input: graphFindings of the graph
// expect: one error under the rule, whose artifact is src/alpha/index.mjs, whose line is 1, and whose text names the file, the module MOD-beta and MOD-alpha
test("a code file that imports a module its module's uses do not name is a finding at the file and line of the import", async () => {
  const [finding, ...rest] = await found(product({}, IMPORTS_BETA));
  assert.deepEqual(rest, [], "one finding");
  assert.deepEqual([finding.kind, finding.artifact, finding.line, finding.rule], ["error", "src/alpha/index.mjs", 1, RULE]);
  for (const name of ["src/alpha/index.mjs", "MOD-beta", "MOD-alpha"]) assert.ok(finding.what.includes(name), `${name} in ${finding.what}`);
});

// TST-106802 · level: component · module: MOD-trace-graph
// guards: A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
// given: the same files, with MOD-alpha's uses naming MOD-beta.thing; with a use of another module; with a code file that imports its own module, a package and a node: name
// input: graphFindings of each
// expect: counter-proof — none is a finding under the rule: an import of a module that the uses name by any interface is named; an import within the module, of a package or of a node: name makes no edge; a file in no module's folder is no module's
test("an import the uses name, or that makes no edge between modules, is no finding", async () => {
  assert.equal((await found(product({}, IMPORTS_BETA))).length, 1, "known positive");
  assert.deepEqual(await found(product({ uses: ["MOD-beta.thing"] }, IMPORTS_BETA)), []);
  assert.equal((await found(product({ uses: ["MOD-gamma.thing"] }, IMPORTS_BETA))).length, 1, "a use of another module names nothing of beta");
  const quiet = { "src/alpha/index.mjs": 'import { x } from "./inner.mjs";\nimport fs from "node:fs";\nimport pkg from "left-pad";\nexport { x, fs, pkg };\n', "src/alpha/inner.mjs": "export const x = 1;\n" };
  assert.deepEqual(await found(product({}, quiet)), []);
  assert.deepEqual(await found(product({}, { "tools/outside.mjs": 'import { thing } from "../src/beta/index.mjs";\n' })), [], "a file in no module's folder is no module's file: its gap is another");
});

// TST-106803 · level: component · module: MOD-trace-graph
// guards: A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
// given: a JavaScript file that imports MOD-beta on lines 1 and 3, a Python file of MOD-alpha that imports it (from beta import thing) and a CSS file that imports it, and MOD-alpha's uses naming nothing
// input: graphFindings of the graph
// expect: one finding for each import: the two lines of the JavaScript file (1 and 3), the Python file's and the CSS file's, each at its own file and line
test("each import is a finding at its own line, in each language whose imports are read", async () => {
  const code = {
    "src/alpha/index.mjs": 'import { thing } from "../beta/index.mjs";\nexport const x = 1;\nimport "../beta/index.mjs";\n',
    "src/alpha/tool.py": "import src.beta.index\n", "src/alpha/look.css": '@import "../beta/look.css";\n', "src/beta/look.css": "body {}\n",
  };
  const rows = (await found(product({}, code))).map((finding) => [finding.artifact, finding.line]);
  assert.deepEqual(rows.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] - b[1])), [["src/alpha/index.mjs", 1], ["src/alpha/index.mjs", 3], ["src/alpha/look.css", 1], ["src/alpha/tool.py", 1]]);
});

// TST-106804 · level: component · module: MOD-trace-graph
// guards: A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
// given: the files of TST-106803
// input: graphFindings and moduleRows of the same graph
// expect: both decide it by one function: the files and modules of the findings are those of the gaps `import-not-in-uses` (a gap for each file and module imported, not for each line)
test("graphFindings and moduleRows list the same imports", async () => {
  const code = { "src/alpha/index.mjs": 'import { thing } from "../beta/index.mjs";\nimport "../beta/index.mjs";\n', "src/alpha/look.css": '@import "../beta/look.css";\n', "src/beta/look.css": "body {}\n" };
  const graph = await traceGraph(source(product({}, code)));
  const fromFindings = new Set(graphFindings(graph).filter((finding) => finding.rule === RULE).map((finding) => `${finding.artifact} ${finding.what.match(/MOD-beta/)[0]}`));
  const fromGaps = new Set(moduleRows(graph).gaps.filter((gap) => gap.kind === "import-not-in-uses").map((gap) => `${gap.artifact} ${gap.what.match(/MOD-beta/)[0]}`));
  assert.ok(fromGaps.size > 0, "known positive: the gaps list them");
  assert.deepEqual([...fromFindings].sort(), [...fromGaps].sort());
});

// TST-106805 · level: component · module: MOD-trace-graph
// guards: A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES; DEVELOP AGAINST INTERFACES
// given: the files this repository tracks (the fixture products under tests/fixtures/ left out), read as the pages read them; and, as a known positive, the same files with one code file, src/trace-graph/ghost.mjs, added that imports a module its module's uses do not name
// input: graphFindings of each, under the rule
// expect: the first lists none — a pull request that adds an import its module's uses do not name fails this test —; the known positive lists exactly the planted import
test("TST-106805: no code file of this repository imports a module its module's uses do not name", async () => {
  const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter(Boolean).filter((path) => !path.startsWith("tests/fixtures/"));
  const files = {};
  for (const path of tracked) { try { files[path] = readFileSync(path, "utf8"); } catch { /* a binary file */ } }
  const withPlant = await found({ ...files, "src/trace-graph/ghost.mjs": 'import { zzz } from "../site-frame/index.mjs";\nexport { zzz };\n' });
  assert.deepEqual(withPlant.filter((finding) => finding.artifact === "src/trace-graph/ghost.mjs").map((finding) => [finding.line]), [[1]], "known positive");
  assert.deepEqual((await found(files)).map((finding) => `${finding.artifact}:${finding.line}`), []);
});
