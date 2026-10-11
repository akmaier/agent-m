// Derive — what traceGraph's graph alone answers (MOD-trace-graph, Parts). Built so far: tracesTo, which gives a requirement the
// sources its node keeps and the tests that guard it, read through `guards` edges, and requirementImpact, which lists every place an
// artifact names a requirement, read through the edges that point at it. The coverage gaps, the impact list of an architecture
// change, the module order and rows and the comparison of two graphs, which this file will hold too, are not built yet.
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

// requirementImpact(graph: Graph, name: string) -> ImpactEntry[] — every artifact that names the requirement, to be listed beside a
// change to it (A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST): one row for each place an edge of the graph points at `name` —
// a use case's, a module's or an item's `realises`, a decision's `forced_by`, a test's `guards`, a text that names it —, with the
// naming artifact's identifier and kind, the file and the line at which it names the requirement (of a test, the line its
// declaration begins at) and the kind of the edge as `via`. It reads the edges alone, so a name no node carries, a withdrawn
// requirement among them, lists what still names it, and a name nothing names lists nothing. A name written twice on one line is
// one place. The rows come use cases first, then decisions, modules, items and tests, the order in which the model in
// docs/assets/traceability/graph.mjs lists its four kinds, each kind by identifier, the rows of one artifact in the order its file
// gives them, so that the list does not depend on the order in which the repository lists its files.
const IMPACT_ORDER = ["UC", "ARC", "MOD", "ITM", "TST"];
export function requirementImpact(graph, name) {
  const places = new Map();
  for (const edge of graph.edges) {
    if (edge.to !== name) continue;
    const entry = { id: edge.from, kind: graph.nodes.get(edge.from).kind, path: edge.path, line: edge.line, via: edge.via };
    places.set(JSON.stringify(entry), entry);
  }
  return [...places.values()].sort((a, b) => IMPACT_ORDER.indexOf(a.kind) - IMPACT_ORDER.indexOf(b.kind) || byText(a.id, b.id));
}
