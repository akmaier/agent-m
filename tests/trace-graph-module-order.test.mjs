// ITM-608: moduleOrder gives the modules in the order of the interfaces they use, or the modules of a cycle.
// Module: MOD-trace-graph
// Guards: A RUN FOLLOWS THE MODULES' INTERFACES
// Level: unit
// Run: node --test tests/trace-graph-module-order.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import * as trace from "../src/trace-graph/index.mjs";

function moduleText(id, uses = []) {
  return ["---", `id: ${id}`, `title: ${id}`, `folder: src/${id.slice(4)}/`,
    "realises:", "follows:", "uses:", ...uses.map((name) => `  - ${name}`),
    "provides:", "  - read", "  - write",
    "---", `# ${id}`, "", "## Responsibility", "", "One concern.", "", "## Interfaces", "", "- `read() -> text` - read.", ""].join("\n");
}

// `modules` maps a module identifier to the interfaces it uses, as `MOD-<slug>.<name>`.
async function graphOf(modules) {
  const files = Object.fromEntries(Object.entries(modules).map(([id, uses]) => [`docs/architecture/${id}.md`, moduleText(id, uses)]));
  const graph = await trace.traceGraph({ paths: Object.keys(files), read: async (path) => files[path] });
  assert.deepEqual(graph.unread, [], "positive control: every fixture module file is readable");
  assert.equal([...graph.nodes.values()].filter((node) => node.kind === "MOD").length, Object.keys(modules).length,
    "positive control: one module node for each fixture module");
  return graph;
}

const usesOf = (graph) => graph.edges.filter((edge) => edge.via === "uses").map((edge) => [edge.from, edge.to.split(".")[0]]);

// TST-608001
// level: unit
// module: MOD-trace-graph
// guards: A RUN FOLLOWS THE MODULES' INTERFACES
// given: MOD-a uses MOD-b.read, MOD-b uses MOD-c.read and MOD-c uses nothing
// input: public traceGraph over the three module files, then moduleOrder
// expect: { order: ["MOD-c", "MOD-b", "MOD-a"] }, the one order in which each module stands after the module it uses
test("TST-608001 a chain of uses is ordered from the module used last to the module that uses first", async () => {
  assert.equal(typeof trace.moduleOrder, "function", "moduleOrder is exported by the public index");
  const graph = await graphOf({ "MOD-a": ["MOD-b.read"], "MOD-b": ["MOD-c.read"], "MOD-c": [] });
  assert.deepEqual(usesOf(graph), [["MOD-a", "MOD-b"], ["MOD-b", "MOD-c"]], "positive control: the uses edges are in the graph");
  assert.deepEqual(trace.moduleOrder(graph), { order: ["MOD-c", "MOD-b", "MOD-a"] });
});

// TST-608002
// level: unit
// module: MOD-trace-graph
// guards: A RUN FOLLOWS THE MODULES' INTERFACES
// given: MOD-a uses MOD-b.read and MOD-c.read; MOD-b uses MOD-c.read and MOD-c.write; MOD-d uses nothing and is used by nobody
// input: public traceGraph over the four module files, then moduleOrder
// expect: { order } holds the four modules once each; MOD-c stands before MOD-b and MOD-a, MOD-b before MOD-a; MOD-d stands anywhere
test("TST-608002 every module stands after every module it uses, an unrelated module anywhere", async () => {
  const graph = await graphOf({ "MOD-a": ["MOD-b.read", "MOD-c.read"], "MOD-b": ["MOD-c.read", "MOD-c.write"], "MOD-c": [], "MOD-d": [] });
  assert.equal(usesOf(graph).length, 4, "positive control: the four uses edges, two of them to MOD-c, are in the graph");
  const result = trace.moduleOrder(graph);
  assert.deepEqual(Object.keys(result), ["order"]);
  assert.deepEqual([...result.order].sort(), ["MOD-a", "MOD-b", "MOD-c", "MOD-d"], "each module once");
  for (const [user, used] of [["MOD-a", "MOD-b"], ["MOD-a", "MOD-c"], ["MOD-b", "MOD-c"]]) {
    assert.ok(result.order.indexOf(used) < result.order.indexOf(user), `${used} stands before ${user}`);
  }
});

// TST-608003
// level: unit
// module: MOD-trace-graph
// guards: A RUN FOLLOWS THE MODULES' INTERFACES
// given: two modules MOD-a and MOD-b that use nothing; separately, a graph with no module
// input: public traceGraph over each, then moduleOrder
// expect: { order } holds MOD-a and MOD-b once each, in either order; { order: [] } for the graph with no module
test("TST-608003 modules without uses are all in the order, and a graph without modules gives an empty order", async () => {
  const isolated = trace.moduleOrder(await graphOf({ "MOD-a": [], "MOD-b": [] }));
  assert.deepEqual(Object.keys(isolated), ["order"]);
  assert.deepEqual([...isolated.order].sort(), ["MOD-a", "MOD-b"]);
  const empty = await trace.traceGraph({ paths: [], read: async () => null });
  assert.equal(empty.nodes.size, 0, "positive control: the graph holds no node");
  assert.deepEqual(trace.moduleOrder(empty), { order: [] });
});

// TST-608004
// level: unit
// module: MOD-trace-graph
// guards: A RUN FOLLOWS THE MODULES' INTERFACES
// given: MOD-a uses MOD-b.read, MOD-b uses MOD-c.read, MOD-c uses MOD-a.read; MOD-d uses MOD-a.read and so stands after the cycle; MOD-e uses nothing
// input: public traceGraph over the five module files, then moduleOrder
// expect: { cycle } with MOD-a, MOD-b and MOD-c once each, every one using the next and the last using the first; no order; neither MOD-d nor MOD-e
test("TST-608004 a cycle of uses is named by its modules, and no order is given", async () => {
  const graph = await graphOf({ "MOD-a": ["MOD-b.read"], "MOD-b": ["MOD-c.read"], "MOD-c": ["MOD-a.read"], "MOD-d": ["MOD-a.read"], "MOD-e": [] });
  assert.equal(usesOf(graph).length, 4, "positive control: the four uses edges are in the graph");
  const result = trace.moduleOrder(graph);
  assert.deepEqual(Object.keys(result), ["cycle"]);
  assert.deepEqual([...result.cycle].sort(), ["MOD-a", "MOD-b", "MOD-c"]);
  const uses = usesOf(graph).map(([user, used]) => `${user} ${used}`);
  result.cycle.forEach((module, at) => {
    assert.ok(uses.includes(`${module} ${result.cycle[(at + 1) % result.cycle.length]}`), `${module} uses the next module of the cycle`);
  });
});
