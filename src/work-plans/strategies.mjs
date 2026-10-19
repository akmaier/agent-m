// strategies.mjs — the recipes, checks and writers of `workStrategies` (MOD-work-plans, Parts: strategies.mjs; Interfaces: workStrategies). Of it, this file has the recipe
// `architecture-and-model` (UC-045 step 2) and the check `sprint-record-checks` (UC-041 1a); the other recipes, checks and writers are not built yet.
//
// Module: MOD-work-plans
//
// The recipe reads the product through the job's snapshot, once, as the trace graph of MOD-trace-graph: the graph holds the decisions with what they refine and design, and the modules.
// It makes no request of its own; the snapshot reads what the host holds. It follows the pattern of MOD-run-planner's `implementation-inputs`, which MOD-work-plans does not use and
// does not import. Part, JobContext and Strategies are MOD-job-runner's types.

import { traceGraph } from "../trace-graph/index.mjs";
import { finding } from "../text-tools/index.mjs";

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

const REVIEW_RULE = "AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM";
const RETRO_RULE = "A SPRINT ENDS WITH A RETROSPECTIVE";
const PROCESS_RULE = "AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF";
// The keys of closeSprint's `close` (MOD-work-plans, Interfaces), of its review and of an entry of its retrospective: a draft holds no other.
const CLOSE_KEYS = ["sprint", "review", "unfinished", "retrospective", "newItems"];
const REVIEW_KEYS = ["feedback", "tookPart", "sources"];
const ENTRY_KEYS = ["text", "kind", "goes"];
// A line that says that no stakeholder took part.
const NO_STAKEHOLDER = /\bno stakeholders?\b[^.]*\b(?:took|take|taken|takes) part\b/i;

const asList = (value) => (Array.isArray(value) ? value : []);
const lower = (value) => String(value ?? "").toLowerCase();

/**
 * The check sprint-record-checks(draft) -> Finding[] — on the draft of a job of the kind `close-sprint`, which has the shape of closeSprint's `close`; every such job is an agent's, so every draft is an
 * agent's review (UC-041 1a). An error, each with its rule, for:
 * - a review whose `sources` are null or empty (AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM);
 * - a name in `tookPart` whose feedback no feedback line and no source records, and an empty `tookPart` with no feedback line that says that no stakeholder took part (the same rule);
 * - an empty retrospective (A SPRINT ENDS WITH A RETROSPECTIVE);
 * - an entry of kind `change` without `goes`, and a key outside the shape of `close`, in the draft, its review or an entry of its retrospective (AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF).
 * Findings stand at line 1 of the sprint record. A clean draft gives none.
 */
function sprintRecordChecks(draft) {
  const close = draft !== null && typeof draft === "object" ? draft : {};
  const review = close.review !== null && typeof close.review === "object" ? close.review : {};
  const artifact = typeof close.sprint === "string" && close.sprint ? `the record of sprint ${close.sprint}` : "the sprint record";
  const found = [];
  const add = (rule, what, fix) => found.push(finding({ artifact, line: 1, kind: "error", rule, what, fix }));

  const sources = asList(review.sources);
  if (sources.length === 0) add(REVIEW_RULE, "the review names no sources of its feedback", "name each source: the issues, mails, job records and test results it read");
  const lines = asList(review.feedback).map((each) => String(each?.line ?? ""));
  const tookPart = asList(review.tookPart);
  if (tookPart.length === 0) {
    if (!lines.some((line) => NO_STAKEHOLDER.test(line))) add(REVIEW_RULE, "the review does not state that no stakeholder took part", "say in a feedback line that no stakeholder took part, or name who did");
  }
  for (const name of tookPart) {
    const recorded = [...lines, ...sources.map(String)].some((text) => lower(text).includes(lower(name)));
    if (!recorded) add(REVIEW_RULE, `the feedback of ${name}, who took part, is recorded in no feedback line and in no source`, "record their feedback in a line or name where it is kept among the sources");
  }

  const retrospective = asList(close.retrospective);
  if (retrospective.length === 0) add(RETRO_RULE, "the retrospective has no entry", "record what the team will change in how it works");
  for (const entry of retrospective) {
    if (entry?.kind === "change" && !entry.goes) {
      add(PROCESS_RULE, `the change "${entry.text ?? ""}" does not say where it is proposed to`, "give where it goes: the process model, the Definition of Done, a participant's instructions or the team agreement");
    }
  }
  const strange = [...Object.keys(close).filter((key) => !CLOSE_KEYS.includes(key)).map((key) => key),
    ...Object.keys(review).filter((key) => !REVIEW_KEYS.includes(key)).map((key) => `review.${key}`),
    ...retrospective.flatMap((entry) => Object.keys(entry ?? {}).filter((key) => !ENTRY_KEYS.includes(key)).map((key) => `retrospective.${key}`))];
  for (const key of strange) add(PROCESS_RULE, `the draft holds ${key}, which is no part of a close`, "the draft proposes; it writes nothing of the process itself: remove it");
  return found;
}

/** workStrategies: MOD-job-runner's Partial<Strategies> with the recipe architecture-and-model and the check sprint-record-checks, the two built so far. */
export const workStrategies = { recipes: { "architecture-and-model": architectureAndModel }, checks: { "sprint-record-checks": sprintRecordChecks } };
