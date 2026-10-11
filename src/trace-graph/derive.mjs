// Derive — what traceGraph's graph alone answers (MOD-trace-graph, Parts). Built so far: tracesTo, which gives a requirement the
// sources its node keeps and the tests that guard it, read through `guards` edges. The coverage gaps, the impact lists, the module
// order and rows and the comparison of two graphs, which this file will hold too, are not built yet.
//
// Module: MOD-trace-graph

const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// tracesTo(graph: Graph, name: string) -> Traces — for a requirement, the items of its source its node keeps, and every use case,
// decision, module, test and item that names it (A REQUIREMENT SHOWS WHAT TRACES TO IT) — a module also through the tests of it that
// guard the requirement, as the module file states. `sources` are the items of the source as the SPEC writes it, from the node
// of the requirement, so that a name that is no requirement has none; `tests` names every test whose `guards` edge points at `name`,
// by identifier, sorted. It reads nothing else, so every other list stays empty; a later item that reads the others gives each its
// own rule — `modules`' own is more than a direct edge (the module file, above), so it is not a lookup this shape can be stretched
// to.
export function tracesTo(graph, name) {
  const node = graph.nodes.get(name);
  const sources = node?.kind === "requirement" ? [...(node.sources ?? [])] : [];
  const tests = graph.edges.filter((edge) => edge.via === "guards" && edge.to === name).map((edge) => edge.from).sort(byText);
  return { sources, useCases: [], decisions: [], modules: [], tests, items: [] };
}
