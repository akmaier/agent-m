// MOD-trace-graph — the trace graph and everything derived from it (docs/architecture/MOD-trace-graph.md): its
// interface. Of it, traceGraph and tracesTo are built. traceGraph reads, of its Data, SPEC.md through MOD-spec-document, the
// test files through MOD-test-document, the use cases, the architecture decisions, the module files, the plan steps and the
// backlog items through MOD-documents, and the group files through MOD-group-document, so that its graph holds every
// requirement, test, document and group with the edges it states, and lists a file it cannot read with the reason. tracesTo
// gives a requirement the tests that guard it. The code files and their imports, graphFindings, coverageGaps,
// requirementImpact, architectureImpact, moduleOrder, moduleRows, compareGraphs and selfSufficiencyFindings are not built yet.
//
// Module: MOD-trace-graph
//
// It belongs to the artifact model (ARC-048). It runs unchanged in a browser and in Node, keeps nothing between calls
// (THE TRACEABILITY MATRIX IS DERIVED), and performs no input or output of its own: it reads only through the
// `TextSource` its caller gives it.

/**
 * The files of one repository at one commit, as the caller hands them; a snapshot of Access fits it.
 * @typedef {{ paths: string[], read: (path: string) => Promise<string | null> }} TextSource
 */

/**
 * One node of the graph: an artifact or a code file, by its identifier, or a group of a group file. A document's `title` is
 * the `title` of its front matter and its `blob` the git blob SHA of its file; a group's `title` is its title, its `blob`
 * the SHA of its group file, and, since it carries no identifier, its `id` is where it stands, `<path>:<line>`. SPEC.md's
 * requirements and the test files' declarations carry neither a title nor a blob of their own: both are `null`.
 * @typedef {{
 *   id: string,
 *   kind: "requirement" | "SRC" | "UC" | "ARC" | "MOD" | "TST" | "ITM" | "RES" | "JOB" | "code" | "group",
 *   path: string,
 *   line: number,
 *   title: string | null,
 *   blob: string | null,
 * }} GraphNode
 */

/**
 * One link an artifact states to another, with the file and line that state it.
 * @typedef {{
 *   from: string,
 *   to: string,
 *   via: "realises" | "forced_by" | "designs" | "follows" | "refines" | "uses" | "guards" | "exercises" | "changes"
 *     | "builds_on" | "source" | "imports" | "names",
 *   path: string,
 *   line: number,
 * }} GraphEdge
 */

/**
 * The graph traceGraph builds: every node and every edge, and the files it could not read, with the reason. Its nodes are
 * the requirements of SPEC.md, the tests of the test files, the use cases, decisions, modules, plan steps and items, and the
 * groups of the group files; its edges are `guards` from a test, `realises`, `forced_by`, `designs`, `follows`, `refines`,
 * `uses`, `changes` and `builds_on` from a document's front matter — a `uses` edge points at the interface as the module file
 * writes it, `MOD-<slug>.<name>` —, and `names` from a document to each identifier its text writes on a line no other edge
 * states.
 * @typedef {{
 *   commit: string | null,
 *   nodes: Map<string, GraphNode>,
 *   edges: GraphEdge[],
 *   unread: { path: string, reason: string }[],
 * }} Graph
 */

/**
 * For a requirement, its sources and every use case, decision, module, test and item that names it
 * (A REQUIREMENT SHOWS WHAT TRACES TO IT). tracesTo reads only the `guards` edges, so `tests` is the only list it fills;
 * the rest stay empty until a later item gives each its rule.
 * @typedef {{
 *   sources: string[],
 *   useCases: string[],
 *   decisions: string[],
 *   modules: string[],
 *   tests: string[],
 *   items: string[],
 * }} Traces
 */

export { traceGraph } from "./build.mjs";
export { tracesTo } from "./derive.mjs";
