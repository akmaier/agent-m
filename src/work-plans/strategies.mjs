// strategies.mjs — the recipes, checks and writers of `workStrategies` (MOD-work-plans, Parts: strategies.mjs; Interfaces: workStrategies). Of it, this file has the recipe
// `architecture-and-model` (UC-045 step 2); the other recipes, the checks and the writers are not built yet.
//
// Module: MOD-work-plans
//
// The recipe reads the product through the job's snapshot, once, as the trace graph of MOD-trace-graph: the graph holds the decisions with what they refine and design, and the modules.
// It makes no request of its own; the snapshot reads what the host holds. It follows the pattern of MOD-run-planner's `implementation-inputs`, which MOD-work-plans does not use and
// does not import. Part, JobContext and Strategies are MOD-job-runner's types.

import { traceGraph } from "../trace-graph/index.mjs";

const PROCESS = "docs/process.md";
const PLAN = "docs/plan";

// A failure of the module's own, by name.
const failure = (name, message, fields) => Object.assign(new Error(message), { name, ...fields });

const within = (path, place) => path === place.replace(/^\/+|\/+$/g, "") || path.startsWith(`${place.replace(/^\/+|\/+$/g, "")}/`);
const unique = (values) => [...new Set(values)];
const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * The recipe architecture-and-model(context, params) -> Part[] — what UC-045 step 2 sends to the drafting participant, one part per file, in this order:
 * - the decision that states the system (the one that refines no other; each, if the product has several), by identifier;
 * - the subsystems' decisions (those that refine it and design at least one module), by identifier;
 * - every module's file, by identifier;
 * - the process model, `docs/process.md`;
 * - the existing plan, every file under `docs/plan/`, by path.
 * A part is one file, named by its path, whole, given once; it carries the sources of every `context.places.contents` entry that names its path or a folder above it. Throws
 * UnknownWork { id } when the product has no `docs/process.md`.
 */
async function architectureAndModel(context) {
  const snapshot = context.product.snapshot;
  const graph = await traceGraph(snapshot);
  const nodes = [...graph.nodes.values()];
  const from = (id, via) => graph.edges.filter((edge) => edge.from === id && edge.via === via);
  const decisions = nodes.filter((node) => node.kind === "ARC").sort(byId);
  const system = decisions.filter((node) => from(node.id, "refines").length === 0);
  const subsystems = decisions.filter((node) => from(node.id, "refines").some((edge) => system.some((each) => each.id === edge.to)) && from(node.id, "designs").length > 0);
  const modules = nodes.filter((node) => node.kind === "MOD").sort(byId);

  const parts = new Map();
  const give = async (path) => {
    if (parts.has(path)) return;
    const text = await snapshot.read(path);
    if (text === null) throw failure("UnknownWork", `${path} is not in the product's files`, { id: path });
    const sources = unique((context.places.contents ?? []).filter(({ paths }) => paths.some((place) => within(path, place))).map(({ source }) => source));
    parts.set(path, { name: path, text, size: 0, sources, required: true });
  };
  for (const node of [...system, ...subsystems, ...modules]) await give(node.path);
  await give(PROCESS);
  for (const path of snapshot.paths.filter((each) => within(each, PLAN)).sort()) await give(path);
  return [...parts.values()];
}

/** workStrategies: MOD-job-runner's Partial<Strategies> with the one recipe built so far. */
export const workStrategies = { recipes: { "architecture-and-model": architectureAndModel } };
