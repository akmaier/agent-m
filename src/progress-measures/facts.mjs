// facts.mjs — productFacts: one product's facts, read once from its default branch through its host
// (docs/architecture/MOD-progress-measures.md, Interfaces: Facts, productFacts; STATUS IS DERIVED FROM THE RECORDS, PROGRESS AND
// JOB STATE ARE DERIVED, NOT STORED). The scope `build` reads what buildFacts lists; the scope `work` reads what is listed below; the scope `all` adds the requirements, the tests,
// the branch `test-results`, the tags and `info`; `graph` stays "unknown" in both. Every other fact is "unknown". The files are read ahead through
// Snapshot.readMany, in batches of a hundred where the host can.
//
// Module: MOD-progress-measures
//
// Where the default branch's snapshot has `readOn`, the facts stored for its commit (stored.mjs, `storedFacts`) are read first, in every scope: the facts the scope reads that they hold are taken from them,
// and none of the files they come from is read; the job rows are derived from the stored records with listJobs, as from the files.
//
// With the scope `work` it reads what MOD-work-plans' itemStates and startable and MOD-product-process' holdsRole take. Where the
// module file leaves a reading open, this file takes the one it names:
//   - The default branch is the one the host's repositoryInfo names; a host that does no server operations answers NotSupported,
//     and the snapshot is then read at "HEAD", the branch a clone has checked out. `info` stays "unknown": it is no fact of the
//     scope `work`. Pull requests that a host cannot list (NotSupported) are "unknown".
//   - The product keeps a plan where it holds docs/plan/order.md or a step under docs/plan/; its items are then the steps, with the
//     order, and otherwise the items of docs/backlog/, with no order.
//   - `gateStates` is [] and `gates` are the records as read where the workflow is null or "unknown": there is no gate to state.
//   - `resultCommits` (the scope `all`) are the commits of the default branch's history (readHistory of the whole repository, `changes: false`) under which
//     `results` holds a `runs/<commit>/` record, in the history's order; a history that fails with one of the host's own errors (HOST_FAILURES) is "unknown".
//   - `own` is whether the product's address is the address of the instance's snapshot.
//   - A declared model that the catalogue at the commit lacks is null (the commit was read); one whose commit instanceAt cannot read
//     — an error named NotFound, TokenRefused, PermissionMissing or Unreachable — is "unknown", with modelUnread naming the commit
//     and the error. Any other error is not hidden.

import { statuses } from "../approvals/index.mjs";
import { queues } from "../spec-changes/index.mjs";
import { artifactSchemas, readDocument, readRegister } from "../documents/index.mjs";
import { declarationSchema, gateSchema, gateStates, productWorkflow, roleAssignmentSchema, workflowOf } from "../product-process/index.mjs";
import { participantSchema, participantsOf } from "../participant-list/index.mjs";
import { listJobs } from "../job-ledger/index.mjs";
import { heldItems, itemStates, planSchemas, undecidedHeads } from "../work-plans/index.mjs";
import { parseSpec } from "../spec-document/index.mjs";
import { isTestFile, testDeclarations } from "../test-document/index.mjs";
import { MODULE_FILE, storedFactsWithJobs } from "./stored.mjs";

const DECLARATION = "docs/process.md";
const PARTICIPANTS = "docs/participants.md";
const INSTANCE_SPEC = "SPEC.md";
const SPEC = "SPEC.md";
const JOB_RECORDS = "docs/jobs/";
const RESULTS_BRANCH = "test-results";
const ORDER = "docs/plan/order.md";
const PLAN_STEP = /^docs\/plan\/ITM-\d{3,}-[^/]+\.md$/;
const BACKLOG_ITEM = /^docs\/backlog\/ITM-\d{3,}-[^/]+\.md$/;
const SPRINT = /^docs\/backlog\/sprints\/[^/]+\/[^/]+\.md$/;
const ASSIGNMENT = /^docs\/role-assignments\/[^/]+\.md$/;
const GATE_RECORD = /^docs\/gates\/[^/]+\.md$/;
// An entry of a gate record's `on` that names an artifact: <path>@<blob> (MOD-product-process, gateStates).
const CHECKED = /^([^\s@]+)@[0-9a-f]{7,64}$/;

// The branch a clone has checked out, for a host whose repositoryInfo is NotSupported.
const CHECKED_OUT = "HEAD";
// The causes the module file names for a commit instanceAt cannot read.
const UNREADABLE = new Set(["NotFound", "TokenRefused", "PermissionMissing", "Unreachable"]);

const text = (value) => (typeof value === "string" ? value : "");

// The documents of the paths the snapshot holds, read with `schema`, in the order of the paths.
const readAll = (snapshot, paths, schema) =>
  Promise.all(paths.map(async (path) => readDocument(schema, path, (await snapshot.read(path)) ?? "")));

// A server answer of a host that does no server operations is NotSupported: the fact is then "unknown".
async function orUnknown(read) {
  try {
    return await read();
  } catch (error) {
    if (error?.name === "NotSupported") return "unknown";
    throw error;
  }
}

// The facts of the product's declared model and workflow: what MOD-product-process' productWorkflow gives, read with the instance's SPEC; `model` is the
// workflow's model. Where the instance cannot read the commit the declaration names, they are "unknown" and `modelUnread` keeps the error; where the
// instance holds no model at `model_file`, they are null.
async function declaredWorkflow(declaration, instance, instanceAt, storedModel) {
  if (declaration === null) return { model: null, workflow: null, modelUnread: null };
  // A model stored with the facts spares the instance's catalogue: it is none (null), or the workflow is derived from it. The model alone does not give the practices the declaration names; then the files of the
  // instance are read as before.
  if (storedModel === null) return { model: null, workflow: null, modelUnread: null };
  if (storedModel !== undefined) {
    const workflow = workflowOf(declaration, storedModel, [], (await instance.read(INSTANCE_SPEC)) ?? "");
    if (workflow.practices.length === 0) return { model: storedModel, workflow, modelUnread: null };
  }
  try {
    const workflow = await productWorkflow(declaration, instanceAt, (await instance.read(INSTANCE_SPEC)) ?? "");
    return workflow === null ? { model: null, workflow: null, modelUnread: null } : { model: workflow.model, workflow, modelUnread: null };
  } catch (error) {
    if (!UNREADABLE.has(error?.name)) throw error;
    return { model: "unknown", workflow: "unknown", modelUnread: { commit: text(declaration.fields.model_version), error: error.name } };
  }
}

// The blobs the gates check, by path: the product's current blob of each artifact a gate record names (as done.mjs of
// MOD-product-process collects them for gateStates).
function checkedBlobs(records, snapshot) {
  const blobs = {};
  for (const record of records) {
    for (const entry of Array.isArray(record.fields.on) ? record.fields.on : []) {
      const path = CHECKED.exec(String(entry))?.[1];
      if (path !== undefined && snapshot.blob(path) !== null) blobs[path] = snapshot.blob(path);
    }
  }
  return blobs;
}

// The failures of a host that leave a server fact unread; the history of the default branch that fails with one of them is "unknown".
const HOST_FAILURES = new Set(["NotSupported", "NotFound", "TokenRefused", "PermissionMissing", "RateLimited", "Unreachable"]);
const RUN_FOLDER = /^runs\/([^/]+)\//;

// The commits of the default branch that `results` holds records of, newest first by the branch's history: [] while there is no branch
// test-results, "unknown" where the branch is unknown or its history cannot be read.
async function resultCommitsOf(host, branch, results) {
  if (results === "unknown") return "unknown";
  if (results === null) return [];
  const recorded = new Set(results.paths.map((path) => RUN_FOLDER.exec(path)?.[1]).filter(Boolean));
  try {
    return (await host.readHistory(null, { ref: branch, changes: false })).map((entry) => entry.commit).filter((commit) => recorded.has(commit));
  } catch (error) {
    if (HOST_FAILURES.has(error?.name)) return "unknown";
    throw error;
  }
}

// Whether the product's repository is the instance's own: the address of its snapshot is the address of the instance's.
const isOwn = (address, instance) => address !== "" && instance.repository?.web === address;

// The branch `test-results`: its snapshot, null while the repository has none, "unknown" where the host does no server operations.
async function resultsBranch(host) {
  try {
    return await host.readSnapshot(RESULTS_BRANCH);
  } catch (error) {
    if (error?.name === "NotFound") return null;
    if (error?.name === "NotSupported") return "unknown";
    throw error;
  }
}

// The facts only the scope `all` reads: the requirements of the SPEC, the declarations of the test files (MOD-test-document's isTestFile
// names them; they are told to the snapshot first, to be read in batches), the branch `test-results` and the tags. The trace graph is
// not built: nothing reads Facts.graph, so `graph` is "unknown" in both scopes and no file only the graph would read is read.
async function allFacts(host, snapshot, stored, requirements = null) {
  if (stored) {
    const [results, tags] = await Promise.all([resultsBranch(host), orUnknown(() => host.listTags())]);
    return { requirements: stored.requirements, tags, results, tests: stored.tests };
  }
  const names = requirements ?? await requirementsOf(snapshot);
  const testFiles = snapshot.paths.filter(isTestFile);
  await snapshot.readMany?.(testFiles);
  const [results, tags, tests] = await Promise.all([resultsBranch(host), orUnknown(() => host.listTags()),
    Promise.all(testFiles.map(async (path) => testDeclarations(path, (await snapshot.read(path)) ?? "")))]);
  return { requirements: names, tags, results, tests: tests.flat() };
}

const requirementsOf = async (snapshot) => {
  const specText = await snapshot.read(SPEC);
  return specText === null ? [] : [...parseSpec(specText).requirements.keys()];
};

function realisedNames(items) {
  return new Set(items.flatMap((item) => {
    const value = item?.fields?.realises;
    return Array.isArray(value) ? value : typeof value === "string" ? value.split(",").map((name) => name.trim()).filter(Boolean) : [];
  }));
}

async function acceptanceStatuses(approvals, items, requirements, snapshot) {
  const known = new Set([...approvals.values()].map((status) => status?.id).filter(Boolean));
  const realised = realisedNames(items);
  if ([...realised].every((name) => known.has(name))) return approvals;
  const accepted = requirements ?? await requirementsOf(snapshot);
  const context = new Map(approvals);
  for (const name of accepted) context.set(name, { id: name, kind: "requirement", status: "accepted" });
  return context;
}

// The facts the scope `build` reads: what buildInProgress takes and nothing else — the plan or the backlog, the job records and the pull requests —,
// through the repository's default branch, and what the plan's states depend on: the approval statuses (derived from the tree's paths and blobs, which
// read no file), the change queues, and the gate records with the declaration, the model and the workflow they are stated against. So a step's
// state is what the scope `all` gives it. Not read: the sprints, the role assignments, the participants, the module files, nor the SPEC of the product,
// the tests, the results, the tags and the information. A fact not read is "unknown" where the type allows it, and empty where it does not.
async function buildFacts(host, instance, instanceAt) {
  const info = await orUnknown(() => host.repositoryInfo());
  const snapshot = await host.readSnapshot(info === "unknown" ? CHECKED_OUT : info.defaultBranch);
  const held = await storedFactsWithJobs(snapshot);
  const stored = held?.facts ?? null;
  const pullRequests = await orUnknown(() => host.listPullRequests());
  const address = snapshot.repository?.web ?? "";
  const pathsOf = (pattern) => snapshot.paths.filter((path) => pattern.test(path)).sort();
  const planned = snapshot.paths.includes(ORDER) || snapshot.paths.some((path) => PLAN_STEP.test(path));
  const itemPaths = pathsOf(planned ? PLAN_STEP : BACKLOG_ITEM);
  if (stored === null) {
    await snapshot.readMany?.([DECLARATION, ORDER, ...itemPaths, ...pathsOf(GATE_RECORD), ...snapshot.paths.filter((path) => path.startsWith(JOB_RECORDS))]
      .filter((path) => snapshot.paths.includes(path)));
  }
  await instance.readMany?.((snapshot.paths.includes(DECLARATION) ? [INSTANCE_SPEC] : []).filter((path) => instance.paths?.includes(path)));
  const [declaration, order, items, gates] = stored ? [stored.declaration, stored.order, stored.items, stored.gates] : await Promise.all([
    snapshot.paths.includes(DECLARATION) ? readDocument(declarationSchema, DECLARATION, (await snapshot.read(DECLARATION)) ?? "") : null,
    snapshot.paths.includes(ORDER) ? readDocument(planSchemas.planOrder, ORDER, (await snapshot.read(ORDER)) ?? "") : null,
    readAll(snapshot, itemPaths, artifactSchemas().item),
    readAll(snapshot, pathsOf(GATE_RECORD), gateSchema),
  ]);
  const approvals = statuses(snapshot);
  const changeQueues = stored ? stored.queues : await queues(snapshot);
  const { model, workflow, modelUnread } = await declaredWorkflow(declaration, instance, instanceAt, stored?.model);
  const jobs = await listJobs([{ address, snapshot: held ? held.jobsSnapshot : snapshot }], new Map());
  const known = workflow !== null && workflow !== "unknown" ? workflow : null;
  const gateStatesOf = known ? gateStates(known, gates, checkedBlobs(gates, snapshot)) : [];
  const acceptance = await acceptanceStatuses(approvals, items, stored?.requirements ?? null, snapshot);
  const states = itemStates(items, order, { statuses: acceptance, queues: changeQueues, jobs, pullRequests, gates: gateStatesOf, workflow: known });
  return {
    address, info: "unknown", snapshot: held ? held.serving(snapshot) : snapshot, graph: "unknown", requirements: "unknown", statuses: approvals, queues: changeQueues, declaration,
    workflow, model, modelUnread, modelSince: "unknown", participants: [], plan: { order, items, states },
    sprints: [], assignments: [], held: [], gates, gateStates: gateStatesOf, jobs, pullRequests, schedule: "unknown", ci: "unknown", tags: "unknown",
    results: "unknown", tests: "unknown", resourceNeeds: "unknown", resultCommits: "unknown", own: isOwn(address, instance),
  };
}

/**
 * productFacts(host, instance, instanceAt, now, options?) -> Promise<Facts> — with the scope `build`, what buildInProgress takes
 * and nothing else (buildFacts above); with the scope `work`, what
 * MOD-progress-measures' file lists for it, read once from the product's default branch through `host`; every other field is
 * "unknown". With the scope `all`, the default, it adds the requirements of SPEC.md, the declarations of the test files, the
 * branch `test-results`, the tags and the repository's information; graph, modelSince, schedule, ci and resourceNeeds stay "unknown".
 * @param {object} host MOD-repository-hosts' Host of the product
 * @param {object} instance the instance's Snapshot, for its participants and SPEC
 * @param {(commit: string) => Promise<object>} instanceAt the instance's Snapshot at a commit, for the commit a declaration names
 * @param {Date} now unused with the scope `work`
 * @param {{ scope: "all" | "work" | "build" }} [options]
 * @returns {Promise<object>}
 */
export async function productFacts(host, instance, instanceAt, now, options = { scope: "all" }) {
  const scope = options?.scope ?? "all";
  if (scope !== "all" && scope !== "work" && scope !== "build") throw new TypeError(`a scope is "all", "work" or "build": ${String(scope)}`);
  if (scope === "build") return buildFacts(host, instance, instanceAt);
  const all = scope === "all";

  const info = await orUnknown(() => host.repositoryInfo());
  const branch = info === "unknown" ? CHECKED_OUT : info.defaultBranch;
  const snapshot = await host.readSnapshot(branch);
  const held = await storedFactsWithJobs(snapshot);
  const stored = held?.facts ?? null;
  const pullRequests = await orUnknown(() => host.listPullRequests());
  const address = snapshot.repository?.web ?? "";
  const pathsOf = (pattern) => snapshot.paths.filter((path) => pattern.test(path)).sort();

  const planned = snapshot.paths.includes(ORDER) || snapshot.paths.some((path) => PLAN_STEP.test(path));
  const itemPaths = pathsOf(planned ? PLAN_STEP : BACKLOG_ITEM);
  // Both scopes tell the snapshot every file they read themselves — and the job records listJobs reads — before the first read, so
  // that the snapshot fetches them in batches of a hundred where the host can (Snapshot.readMany); the instance's two files likewise.
  if (stored === null) {
    await snapshot.readMany?.([DECLARATION, ORDER, ...(all ? [SPEC] : []), ...itemPaths, ...pathsOf(SPRINT), ...pathsOf(ASSIGNMENT),
      ...pathsOf(GATE_RECORD), ...pathsOf(MODULE_FILE), ...snapshot.paths.filter((path) => path.startsWith(JOB_RECORDS))]
      .filter((path) => snapshot.paths.includes(path)));
  }
  await instance.readMany?.([PARTICIPANTS, ...(snapshot.paths.includes(DECLARATION) ? [INSTANCE_SPEC] : [])].filter((path) => instance.paths?.includes(path)));
  const [declaration, order, items, sprints, assignments, gates, modules] = stored
    ? [stored.declaration, stored.order, stored.items, stored.sprints, stored.assignments, stored.gates, stored.modules] : await Promise.all([
    snapshot.paths.includes(DECLARATION) ? readDocument(declarationSchema, DECLARATION, (await snapshot.read(DECLARATION)) ?? "") : null,
    snapshot.paths.includes(ORDER) ? readDocument(planSchemas.planOrder, ORDER, (await snapshot.read(ORDER)) ?? "") : null,
    readAll(snapshot, itemPaths, artifactSchemas().item),
    readAll(snapshot, pathsOf(SPRINT), planSchemas.sprint),
    readAll(snapshot, pathsOf(ASSIGNMENT), roleAssignmentSchema),
    readAll(snapshot, pathsOf(GATE_RECORD), gateSchema),
    readAll(snapshot, pathsOf(MODULE_FILE), artifactSchemas().module),
  ]);
  const approvals = statuses(snapshot);
  const changeQueues = stored ? stored.queues : await queues(snapshot);
  const { model, workflow, modelUnread } = await declaredWorkflow(declaration, instance, instanceAt, stored?.model);
  const registerText = await instance.read(PARTICIPANTS);
  const participants = registerText === null ? [] : participantsOf(readRegister(participantSchema(), PARTICIPANTS, registerText).document);

  const jobs = await listJobs([{ address, snapshot: held ? held.jobsSnapshot : snapshot }], new Map());
  const known = workflow !== null && workflow !== "unknown" ? workflow : null;
  const states = known ? gateStates(known, gates, checkedBlobs(gates, snapshot)) : [];
  const knownRequirements = stored?.requirements ?? (all ? await requirementsOf(snapshot) : null);
  const acceptance = await acceptanceStatuses(approvals, items, knownRequirements, snapshot);
  const planStates = itemStates(items, order, { statuses: acceptance, queues: changeQueues, jobs, pullRequests, gates: states, workflow: known });

  // held: the head commits undecidedHeads names are the only ones the default branch is asked about (containsCommit).
  const onDefault = new Set();
  if (pullRequests !== "unknown") {
    for (const head of undecidedHeads(sprints, pullRequests)) {
      if (await host.containsCommit(branch, head)) onDefault.add(head);
    }
  }

  const more = all ? await allFacts(host, snapshot, stored, knownRequirements) : { requirements: "unknown", tags: "unknown", results: "unknown", tests: "unknown" };
  return {
    address, info: all ? info : "unknown", snapshot: held ? held.serving(snapshot) : snapshot, graph: "unknown", requirements: more.requirements, statuses: approvals, queues: changeQueues,
    declaration, workflow, model, modelUnread, modelSince: "unknown", participants,
    plan: { order, items, states: planStates }, sprints, assignments, held: heldItems(sprints, items, modules, pullRequests, onDefault),
    gates, gateStates: states, jobs, pullRequests, schedule: "unknown", ci: "unknown", tags: more.tags, results: more.results,
    tests: more.tests, resourceNeeds: "unknown", resultCommits: await resultCommitsOf(host, branch, more.results), own: isOwn(address, instance),
  };
}
