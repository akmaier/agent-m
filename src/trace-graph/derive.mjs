// Derive — what traceGraph's graph alone answers (MOD-trace-graph, Parts). Built so far: tracesTo, which gives a requirement the
// sources its node keeps and the tests that guard it, read through `guards` edges, requirementImpact, which lists every place an
// artifact names a requirement, read through the edges that point at it, and coverageGaps, which lists the requirements and use
// cases that lack a counterpart and the names that match nothing. The impact list of an architecture change, the module order and
// rows and the comparison of two graphs, which this file will hold too, are not built yet.
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

// The edges that name a requirement or a use case and match neither: a `realises`, a `forced_by` or a `guards` whose name is no
// requirement of the SPEC and no use case, in the order the graph holds them. coverageGaps lists their names, and graphFindings
// (checks.mjs) reports each as an error. A name merely written in a text, a `names` edge, is stated nowhere and is none.
const NAMING = new Set(["realises", "forced_by", "guards"]);
const MATCHED = new Set(["requirement", "UC"]);
export const unmatchedNames = (graph) =>
  graph.edges.filter((edge) => NAMING.has(edge.via) && !MATCHED.has(graph.nodes.get(edge.to)?.kind));

const idsOf = (graph, kind) => [...graph.nodes.values()].filter((node) => node.kind === kind).map((node) => node.id).sort(byText);
// The names the artifacts of one kind state under one edge.
const namedBy = (graph, kind, via) =>
  new Set(graph.edges.filter((edge) => edge.via === via && graph.nodes.get(edge.from)?.kind === kind).map((edge) => edge.to));

// coverageGaps(graph: Graph) -> Gaps — what the dashboard shows and the recipe chosen-requirements reads (UNREALISED REQUIREMENTS ARE
// REPORTED, NOT FORBIDDEN; none of it blocks anything): the requirements of the SPEC that no use case realises and — once the
// graph holds a module, or a test — that no module realises, that no test guards; the use cases that realise no requirement, one
// that names only unknown names among them; and every name that matches no requirement or use case, with the artifact, the file
// and the line of each place that states it. A requirement is realised by a use case or a module, and guarded by a test, only by
// the edge that names it itself: a test that guards a use case guards nothing the use case realises. Every list is sorted — the
// requirements and the use cases by name, the unknown names by name, who states one by identifier — so that it does not depend on
// the order in which the repository lists its files.
export function coverageGaps(graph) {
  const requirements = idsOf(graph, "requirement");
  const without = (named) => requirements.filter((name) => !named.has(name));
  const holds = (kind) => [...graph.nodes.values()].some((node) => node.kind === kind);
  const realising = new Set(graph.edges
    .filter((edge) => edge.via === "realises" && graph.nodes.get(edge.to)?.kind === "requirement").map((edge) => edge.from));
  const unknown = new Map();
  for (const edge of unmatchedNames(graph)) {
    unknown.set(edge.to, [...(unknown.get(edge.to) ?? []), { id: edge.from, path: edge.path, line: edge.line }]);
  }
  return {
    requirementsWithoutUseCase: without(namedBy(graph, "UC", "realises")),
    requirementsWithoutModule: holds("MOD") ? without(namedBy(graph, "MOD", "realises")) : [],
    requirementsWithoutTest: holds("TST") ? without(namedBy(graph, "TST", "guards")) : [],
    useCasesWithoutRequirement: idsOf(graph, "UC").filter((id) => !realising.has(id)),
    unknownNames: [...unknown].sort(([a], [b]) => byText(a, b))
      .map(([name, places]) => ({ name, namedBy: places.sort((a, b) => byText(a.id, b.id)) })),
  };
}
