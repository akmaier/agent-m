// MOD-trace-graph — the trace graph and everything derived from it (docs/architecture/MOD-trace-graph.md): its
// interface. Of it, ITM-249 builds traceGraph and tracesTo, as far as the release test report needs them: traceGraph
// reads, of its Data, only SPEC.md through MOD-spec-document and the test files through MOD-test-document, so that its
// graph holds every requirement and every test with what it guards, and lists a file it cannot read with the reason;
// tracesTo gives a requirement the tests that guard it. The other files of its Data, graphFindings, coverageGaps,
// requirementImpact, architectureImpact, moduleOrder, moduleRows, compareGraphs and selfSufficiencyFindings are not
// part of it.
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
 * One node of the graph: an artifact or a code file, by its identifier. `title` and `blob` are read only from a file
 * this item does not read; of SPEC.md's requirements and the test files' declarations, neither carries one, so both
 * stay `null` here.
 * @typedef {{
 *   id: string,
 *   kind: "requirement" | "SRC" | "UC" | "ARC" | "MOD" | "TST" | "ITM" | "RES" | "JOB" | "code",
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
 * The graph traceGraph builds: every node and every edge, and the files it could not read, with the reason. Of this
 * item, the nodes are every requirement of SPEC.md and every test declaration of a test file, and the only edges built
 * are `guards`, from a test to what it guards.
 * @typedef {{
 *   commit: string | null,
 *   nodes: Map<string, GraphNode>,
 *   edges: GraphEdge[],
 *   unread: { path: string, reason: string }[],
 * }} Graph
 */

/**
 * For a requirement, its sources and every use case, decision, module, test and item that names it
 * (A REQUIREMENT SHOWS WHAT TRACES TO IT). Of this item's graph, only a `guards` edge from a test is ever built, so
 * `tests` is the only list tracesTo can find an entry for; the rest stay empty until a later item reads the files that
 * would name them.
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
