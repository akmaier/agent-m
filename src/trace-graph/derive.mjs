// Derive — what traceGraph's graph alone answers (MOD-trace-graph, Parts). Of this item: tracesTo, read only through
// `guards` edges. The coverage gaps, the impact lists, the module order and rows and the comparison of two graphs,
// which this file will hold too, are not part of it.
//
// Module: MOD-trace-graph

const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// tracesTo(graph: Graph, name: string) -> Traces — for a requirement, its sources and every use case, decision, module,
// test and item that names it (A REQUIREMENT SHOWS WHAT TRACES TO IT) — a module also through the tests of it that
// guard the requirement, as the module file states. `tests` names every test whose `guards` edge points at `name`, by
// identifier, sorted. Of this item's graph, no edge but `guards` is ever built and no use-case, decision, module or
// item node exists, so every other list stays empty; a later item that reads them gives each its own rule — `modules`'
// own is more than a direct edge (the module file, above), so it is not a lookup this item's shape can be stretched to.
export function tracesTo(graph, name) {
  const tests = graph.edges.filter((edge) => edge.via === "guards" && edge.to === name).map((edge) => edge.from).sort(byText);
  return { sources: [], useCases: [], decisions: [], modules: [], tests, items: [] };
}
