// Derive — what traceGraph's graph alone answers (MOD-trace-graph, Parts). Built so far: tracesTo, which gives a requirement the
// sources its node keeps and the tests that guard it, read through `guards` edges, requirementImpact, which lists every place an
// artifact names a requirement, read through the edges that point at it, and coverageGaps, which lists the requirements and use
// cases that lack a counterpart and the names that match nothing. architectureImpact derives the architecture-change list from
// the graph's facts and the caller's before/after texts. The module order and rows and the comparison of two graphs are not built yet.
//
// Module: MOD-trace-graph

import { artifactSchemas, readDocument } from "../documents/index.mjs";
import { identifiersIn } from "../identifiers/index.mjs";
import { isTestFile } from "../test-document/index.mjs";

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

const listOf = (value) => [value ?? []].flat();
const unique = (values) => [...new Set(values)].sort(byText);

// The document reader already isolates Interfaces. Compare its bullets, including their indented continuations, as the
// existing architecture model does; unrelated sections cannot turn a prose edit into an interface change.
function interfaceDeclarations(document) {
  const lines = document?.sections.find((section) => section.heading === "## Interfaces")?.text.split(/\r?\n/) ?? [];
  const declarations = new Map();
  for (let at = 0; at < lines.length; at += 1) {
    const name = /^- `([A-Za-z_][A-Za-z0-9_]*)/.exec(lines[at])?.[1];
    if (!name) continue;
    const declaration = [lines[at]];
    while (at + 1 < lines.length && /^\s+\S/.test(lines[at + 1])) declaration.push(lines[++at]);
    declarations.set(name, declaration.map((line) => line.trimEnd()).join("\n"));
  }
  return declarations;
}

// Paths only, not code reads or an import graph. The language extensions follow the existing code-path model.
const CODE_EXTENSIONS = new Set(["js", "mjs", "cjs", "ts", "tsx", "jsx", "mts", "cts", "py", "rb", "go", "rs", "java", "kt", "kts", "scala",
  "c", "h", "cc", "cpp", "hpp", "cs", "swift", "m", "php", "pl", "lua", "r", "jl", "sh", "bash", "zsh", "ps1", "sql", "css", "scss",
  "html", "vue", "svelte", "dart", "ex", "exs", "erl", "hs", "ml", "fs", "clj"]);
function codePath(path) {
  const parts = path.split("/");
  return !path.startsWith("docs/") && !isTestFile(path) && !parts.some((part) => ["vendor", "node_modules", "third_party", "third-party", ".git"].includes(part))
    && CODE_EXTENSIONS.has(/\.([A-Za-z0-9]+)$/.exec(path)?.[1].toLowerCase());
}

// architectureImpact(graph, changes) -> ArchitectureImpact. All relationships come from the existing graph; only the supplied
// changed texts are parsed. Removed modules keep their before folder even when the current graph has no node for them.
export function architectureImpact(graph, changes) {
  const modules = new Map(), folders = new Set(), beforeNames = new Set(), afterNames = new Set();
  const priority = { changed: 0, "uses an interface that changes": 1, "uses an interface that is removed": 2 };
  const mark = (id, why = "changed") => {
    if (!modules.has(id) || priority[why] > priority[modules.get(id).why]) modules.set(id, { id, why, breaks: why !== "changed" });
  };
  const keepFolder = (folder) => { if (folder) folders.add(folder.endsWith("/") ? folder : `${folder}/`); };
  for (const { path, before, after } of changes) {
    const schema = path.startsWith("docs/architecture/ARC-") ? artifactSchemas().decision : artifactSchemas().module;
    const old = before === null ? null : readDocument(schema, path, before);
    const next = after === null ? null : readDocument(schema, path, after);
    const id = (next ?? old).id;
    for (const [text, names] of [[before, beforeNames], [after, afterNames]]) {
      for (const place of identifiersIn(path, text)) if (["requirement", "UC"].includes(place.kind)) names.add(place.id);
    }
    if (schema === artifactSchemas().decision) {
      for (const module of [...listOf(old?.fields.designs), ...listOf(next?.fields.designs)]) mark(module);
      for (const edge of graph.edges) {
        if (edge.via === "follows" && edge.to === id) mark(edge.from);
        if (edge.via === "designs" && edge.from === id) mark(edge.to);
      }
    } else {
      mark(id);
      keepFolder(old?.fields.folder);
      keepFolder(next?.fields.folder);
      const was = interfaceDeclarations(old), now = interfaceDeclarations(next);
      const provided = listOf(next?.fields.provides);
      for (const name of listOf(old?.fields.provides)) {
        const removed = !provided.includes(name);
        if (!removed && was.get(name) === now.get(name)) continue;
        for (const edge of graph.edges) {
          if (edge.via === "uses" && edge.interface === name && edge.to === `${id}.${name}`) {
            mark(edge.from, removed ? "uses an interface that is removed" : "uses an interface that changes");
          }
        }
      }
    }
  }
  for (const id of modules.keys()) keepFolder(graph.nodes.get(id)?.folder);
  const tests = unique(graph.edges.filter((edge) => edge.via === "exercises" && modules.has(edge.to)).map((edge) => edge.from));
  return {
    modules: [...modules.values()].sort((a, b) => priority[b.why] - priority[a.why] || byText(a.id, b.id)),
    codeFiles: unique(graph.files.filter((path) => codePath(path) && [...folders].some((folder) => path.startsWith(folder)))),
    tests: tests.map((id) => ({ id, guards: unique(graph.edges.filter((edge) => edge.via === "guards" && edge.from === id).map((edge) => edge.to)) })),
    named: { added: unique([...afterNames].filter((name) => !beforeNames.has(name))),
      removed: unique([...beforeNames].filter((name) => !afterNames.has(name))) },
    items: unique(graph.edges.filter((edge) => edge.via === "changes" && modules.has(edge.to)).map((edge) => edge.from)),
  };
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
