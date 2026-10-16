// The module a test exercises (ITM-573) — MOD-trace-graph's interface as docs/architecture/MOD-trace-graph.md states it: the `via` of a
// graph's edges includes "exercises", and a test names the module it exercises. traceGraph reads the test files through
// MOD-test-document, whose declaration gives the module in its `module:` line, so that a test that names a module has an `exercises`
// edge to it. Where the line names no module — `system` for a test of the whole product, or no line — there is no edge.
// Run: node --test tests/trace-graph-exercises.test.mjs
//
// Module: MOD-trace-graph
// Guards: DEVELOP AGAINST INTERFACES
// Level: unit
//
// Every fixture is a small repository of its own, given to traceGraph through a TextSource built here. Each test states its input and its
// expected result before it runs (given / input / expect); where a test asserts that no edge is found, the same graph is first shown to
// hold the edge of a declaration that names a module (the known positive). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { traceGraph } from "../src/trace-graph/index.mjs";

function source(files) {
  return {
    paths: Object.keys(files),
    read: async (path) => (Object.prototype.hasOwnProperty.call(files, path) ? files[path] : null),
  };
}

const PATH = "tests/sample.test.mjs";
const exercising = (graph) => graph.edges.filter((edge) => edge.via === "exercises")
  .map(({ from, to, via, interface: iface, path, line }) => ({ from, to, via, interface: iface, path, line }));

// TST-001 starts on line 1 and names MOD-reader; TST-002 starts on line 6 and names no module line at all.
const TWO = [
  "// TST-001",
  "// level: unit",
  "// module: MOD-reader",
  "// guards: UC-013",
  "",
  "// TST-002",
  "// level: unit",
  "// guards: UC-013",
  "",
].join("\n");

// TST-573001 · level: unit · module: MOD-trace-graph
// guards: DEVELOP AGAINST INTERFACES
// given: a test file with two declarations, TST-001 naming `module: MOD-reader` at line 1 and TST-002 naming no module at line 6
// input: traceGraph over that source
// expect: exactly one exercises edge, from TST-001 to MOD-reader at the file and line 1, with no interface; none from TST-002
test("a declaration that names a module gives an exercises edge to it, and one that names none gives none — MOD-trace-graph", async () => {
  const graph = await traceGraph(source({ [PATH]: TWO }));
  assert.deepEqual(exercising(graph), [{ from: "TST-001", to: "MOD-reader", via: "exercises", interface: null, path: PATH, line: 1 }]);
  assert.equal(graph.edges.filter((edge) => edge.via === "guards" && edge.from === "TST-002").length, 1, "known positive: TST-002 has its guards edge");
});

// TST-573002 · level: unit · module: MOD-trace-graph
// guards: DEVELOP AGAINST INTERFACES
// given: three test files whose declarations name `module: system`, `module: reader` and a module in lower case `module: mod-reader`
// input: traceGraph over that source
// expect: no exercises edge for any of them, since none is a MOD- identifier; each declaration's guards edge is still there
test("a module line that is no MOD- identifier gives no exercises edge — MOD-trace-graph", async () => {
  const file = (name, value) => [`// TST-${name}`, "// level: system", `// module: ${value}`, "// guards: UC-013", ""].join("\n");
  const files = { "tests/a.test.mjs": file("101", "system"), "tests/b.test.mjs": file("102", "reader"), "tests/c.test.mjs": file("103", "mod-reader") };
  const graph = await traceGraph(source(files));
  assert.deepEqual(graph.edges.filter((edge) => edge.via === "guards").map((edge) => edge.from).sort(), ["TST-101", "TST-102", "TST-103"]);
  assert.deepEqual(exercising(graph), []);
  const positive = await traceGraph(source({ "tests/d.test.mjs": file("104", "MOD-reader") }));
  assert.deepEqual(exercising(positive).map((edge) => [edge.from, edge.to]), [["TST-104", "MOD-reader"]], "known positive: a MOD- identifier does give one");
});

// TST-573003 · level: unit · module: MOD-trace-graph
// guards: DEVELOP AGAINST INTERFACES
// given: two test files, each with one declaration naming the same module MOD-reader, one declaration packing its keys on the first line (`TST-201 · level: unit · module: MOD-reader`)
// input: traceGraph over that source
// expect: one exercises edge for each test to MOD-reader, at its own file and line, in the order the files are listed
test("every test that names a module has its own exercises edge, whether its keys stand on one line or several — MOD-trace-graph", async () => {
  const files = {
    "tests/x.test.mjs": ["// TST-201 · level: unit · module: MOD-reader", "// guards: UC-013", ""].join("\n"),
    "tests/y.test.mjs": ["", "// TST-202", "// level: unit", "// module: MOD-reader", "// guards: UC-013", ""].join("\n"),
  };
  const graph = await traceGraph(source(files));
  assert.deepEqual(exercising(graph), [
    { from: "TST-201", to: "MOD-reader", via: "exercises", interface: null, path: "tests/x.test.mjs", line: 1 },
    { from: "TST-202", to: "MOD-reader", via: "exercises", interface: null, path: "tests/y.test.mjs", line: 2 },
  ]);
});
