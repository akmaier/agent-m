// facts.mjs — productFacts: one product's facts, read once from its default branch through its host
// (docs/architecture/MOD-progress-measures.md, Interfaces: Facts, productFacts; STATUS IS DERIVED FROM THE RECORDS, PROGRESS AND
// JOB STATE ARE DERIVED, NOT STORED). The scope `build` reads what buildFacts lists; the scope `work` reads what is listed below; the scope `all` adds the requirements, the tests,
// the branch `test-results`, the tags and `info`; `graph` stays "unknown" in both. Every other fact is "unknown". The files are read ahead through
// Snapshot.readMany, in batches of a hundred where the host can.
//
// Module: MOD-progress-measures
//
// With the scope `work` it reads what MOD-work-plans' itemStates and startable and MOD-product-process' holdsRole take. Where the
// module file leaves a reading open, this file takes the one it names:
//   - The default branch is the one the host's repositoryInfo names; a host that does no server operations answers NotSupported,
//     and the snapshot is then read at "HEAD", the branch a clone has checked out. `info` stays "unknown": it is no fact of the
//     scope `work`. Pull requests that a host cannot list (NotSupported) are "unknown".
//   - The product keeps a plan where it holds docs/plan/order.md or a step under docs/plan/; its items are then the steps, with the
//     order, and otherwise the items of docs/backlog/, with no order.
//   - `gateStates` is [] and `gates` are the records as read where the workflow is null or "unknown": there is no gate to state.
//   - A declared model that the catalogue at the commit lacks is null (the commit was read); one whose commit instanceAt cannot read
//     — an error named NotFound, TokenRefused, PermissionMissing or Unreachable — is "unknown", with modelUnread naming the commit
//     and the error. Any other error is not hidden.

import { statuses } from "../approvals/index.mjs";
import { queues } from "../spec-changes/index.mjs";
import { artifactSchemas, readDocument, readRegister } from "../documents/index.mjs";
import { catalogue, modelSchema } from "../model-catalogue/index.mjs";
import { declarationSchema, gateSchema, gateStates, roleAssignmentSchema, workflowOf } from "../product-process/index.mjs";
import { participantSchema, participantsOf } from "../participant-list/index.mjs";
import { listJobs } from "../job-ledger/index.mjs";
import { heldItems, itemStates, planSchemas, undecidedHeads } from "../work-plans/index.mjs";
import { parseSpec } from "../spec-document/index.mjs";
import { isTestFile, testDeclarations } from "../test-document/index.mjs";

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
const MODULE_FILE = /^docs\/architecture\/MOD-[^/]+\.md$/;
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

// What the catalogue of the instance at the commit the declaration names makes of the declared model, and the workflow derived
// from it, read as participants.mjs' productBasisOf reads them (a first workflow for the practices' names, then the practices'
// files from the instance at that commit, then the workflow with them).
async function declaredModel(declaration, instance, instanceAt) {
  if (declaration === null) return { model: null, workflow: null, modelUnread: null };
  const commit = text(declaration.fields.model_version);
  const unread = (error) => {
    if (!UNREADABLE.has(error?.name)) throw error;
    return { model: "unknown", workflow: "unknown", modelUnread: { commit, error: error.name } };
  };
  let at, held;
  try {
    at = await instanceAt(commit);
    held = await catalogue(at);
  } catch (error) {
    return unread(error);
  }
  const model = held.models.find((candidate) => candidate.path === text(declaration.fields.model_file)) ?? null;
  if (model === null) return { model: null, workflow: null, modelUnread: null };
  const specText = (await instance.read(INSTANCE_SPEC)) ?? "";
  const names = workflowOf(declaration, model, [], specText).practices;
  let practices;
  try {
    practices = (await Promise.all(held.practices.filter((practice) => names.includes(practice.name)).map(async (practice) => {
      const practiceText = await at.read(practice.path);
      return practiceText === null ? null : readDocument(modelSchema.practice, practice.path, practiceText);
    }))).filter(Boolean);
  } catch (error) {
    return unread(error);
  }
  return { model, workflow: workflowOf(declaration, model, practices, specText), modelUnread: null };
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
async function allFacts(host, snapshot) {
  const specText = await snapshot.read(SPEC);
  const requirements = specText === null ? [] : [...parseSpec(specText).requirements.keys()];
  const testFiles = snapshot.paths.filter(isTestFile);
  await snapshot.readMany?.(testFiles);
  const [results, tags, tests] = await Promise.all([resultsBranch(host), orUnknown(() => host.listTags()),
    Promise.all(testFiles.map(async (path) => testDeclarations(path, (await snapshot.read(path)) ?? "")))]);
  return { requirements, tags, results, tests: tests.flat() };
}

// The facts the scope `build` reads: what buildInProgress takes and nothing else — the plan or the backlog, the job records and the pull requests —,
// through the repository's default branch. The approval statuses are derived from the tree's paths and blobs, which read no file, so that a step's
// state is what the scope `all` gives it where no change queue and no gate holds it back; the queues, the declaration, the sprints, the role
// assignments, the gate records and the module files are not read, nor are the SPEC, the tests, the results, the tags and the information. A fact
// not read is "unknown" where the type allows it, and empty where it does not.
async function buildFacts(host) {
  const info = await orUnknown(() => host.repositoryInfo());
  const snapshot = await host.readSnapshot(info === "unknown" ? CHECKED_OUT : info.defaultBranch);
  const pullRequests = await orUnknown(() => host.listPullRequests());
  const address = snapshot.repository?.web ?? "";
  const pathsOf = (pattern) => snapshot.paths.filter((path) => pattern.test(path)).sort();
  const planned = snapshot.paths.includes(ORDER) || snapshot.paths.some((path) => PLAN_STEP.test(path));
  const itemPaths = pathsOf(planned ? PLAN_STEP : BACKLOG_ITEM);
  await snapshot.readMany?.([ORDER, ...itemPaths, ...snapshot.paths.filter((path) => path.startsWith(JOB_RECORDS))].filter((path) => snapshot.paths.includes(path)));
  const [order, items] = await Promise.all([
    snapshot.paths.includes(ORDER) ? readDocument(planSchemas.planOrder, ORDER, (await snapshot.read(ORDER)) ?? "") : null,
    readAll(snapshot, itemPaths, artifactSchemas().item),
  ]);
  const approvals = statuses(snapshot);
  const jobs = await listJobs([{ address, snapshot }], new Map());
  const states = itemStates(items, order, { statuses: approvals, queues: [], jobs, pullRequests, gates: [], workflow: null });
  return {
    address, info: "unknown", snapshot, graph: "unknown", requirements: "unknown", statuses: approvals, queues: [], declaration: null,
    workflow: "unknown", model: "unknown", modelUnread: null, modelSince: "unknown", participants: [], plan: { order, items, states },
    sprints: [], assignments: [], held: [], gates: [], gateStates: [], jobs, pullRequests, schedule: "unknown", ci: "unknown", tags: "unknown",
    results: "unknown", tests: "unknown", resourceNeeds: "unknown",
  };
}

/**
 * productFacts(host, instance, instanceAt, now, bridges, options?) -> Promise<Facts> — with the scope `build`, what buildInProgress takes
 * and nothing else (buildFacts above); with the scope `work`, what
 * MOD-progress-measures' file lists for it, read once from the product's default branch through `host`; every other field is
 * "unknown". With the scope `all`, the default, it adds the requirements of SPEC.md, the declarations of the test files, the
 * branch `test-results`, the tags and the repository's information; graph, modelSince, schedule, ci and resourceNeeds stay "unknown".
 * @param {object} host MOD-repository-hosts' Host of the product
 * @param {object} instance the instance's Snapshot, for its participants and SPEC
 * @param {(commit: string) => Promise<object>} instanceAt the instance's Snapshot at a commit, for the commit a declaration names
 * @param {Date} now unused with the scope `work`
 * @param {Record<string, object>} bridges unused with the scope `work`: no live state is asked
 * @param {{ scope: "all" | "work" | "build" }} [options]
 * @returns {Promise<object>}
 */
export async function productFacts(host, instance, instanceAt, now, bridges, options = { scope: "all" }) {
  const scope = options?.scope ?? "all";
  if (scope !== "all" && scope !== "work" && scope !== "build") throw new TypeError(`a scope is "all", "work" or "build": ${String(scope)}`);
  if (scope === "build") return buildFacts(host);
  const all = scope === "all";

  const info = await orUnknown(() => host.repositoryInfo());
  const branch = info === "unknown" ? CHECKED_OUT : info.defaultBranch;
  const snapshot = await host.readSnapshot(branch);
  const pullRequests = await orUnknown(() => host.listPullRequests());
  const address = snapshot.repository?.web ?? "";
  const pathsOf = (pattern) => snapshot.paths.filter((path) => pattern.test(path)).sort();

  const planned = snapshot.paths.includes(ORDER) || snapshot.paths.some((path) => PLAN_STEP.test(path));
  const itemPaths = pathsOf(planned ? PLAN_STEP : BACKLOG_ITEM);
  // Both scopes tell the snapshot every file they read themselves — and the job records listJobs reads — before the first read, so
  // that the snapshot fetches them in batches of a hundred where the host can (Snapshot.readMany); the instance's two files likewise.
  await snapshot.readMany?.([DECLARATION, ORDER, ...(all ? [SPEC] : []), ...itemPaths, ...pathsOf(SPRINT), ...pathsOf(ASSIGNMENT),
    ...pathsOf(GATE_RECORD), ...pathsOf(MODULE_FILE), ...snapshot.paths.filter((path) => path.startsWith(JOB_RECORDS))]
    .filter((path) => snapshot.paths.includes(path)));
  await instance.readMany?.([PARTICIPANTS, ...(snapshot.paths.includes(DECLARATION) ? [INSTANCE_SPEC] : [])].filter((path) => instance.paths?.includes(path)));
  const [declaration, order, items, sprints, assignments, gates, modules] = await Promise.all([
    snapshot.paths.includes(DECLARATION) ? readDocument(declarationSchema, DECLARATION, (await snapshot.read(DECLARATION)) ?? "") : null,
    snapshot.paths.includes(ORDER) ? readDocument(planSchemas.planOrder, ORDER, (await snapshot.read(ORDER)) ?? "") : null,
    readAll(snapshot, itemPaths, artifactSchemas().item),
    readAll(snapshot, pathsOf(SPRINT), planSchemas.sprint),
    readAll(snapshot, pathsOf(ASSIGNMENT), roleAssignmentSchema),
    readAll(snapshot, pathsOf(GATE_RECORD), gateSchema),
    readAll(snapshot, pathsOf(MODULE_FILE), artifactSchemas().module),
  ]);
  const approvals = statuses(snapshot);
  const changeQueues = await queues(snapshot);
  const { model, workflow, modelUnread } = await declaredModel(declaration, instance, instanceAt);
  const registerText = await instance.read(PARTICIPANTS);
  const participants = registerText === null ? [] : participantsOf(readRegister(participantSchema(), PARTICIPANTS, registerText).document);

  const jobs = await listJobs([{ address, snapshot }], new Map());
  const known = workflow !== null && workflow !== "unknown" ? workflow : null;
  const states = known ? gateStates(known, gates, checkedBlobs(gates, snapshot)) : [];
  const planStates = itemStates(items, order, { statuses: approvals, queues: changeQueues, jobs, pullRequests, gates: states, workflow: known });

  // held: the head commits undecidedHeads names are the only ones the default branch is asked about (containsCommit).
  const onDefault = new Set();
  if (pullRequests !== "unknown") {
    for (const head of undecidedHeads(sprints, pullRequests)) {
      if (await host.containsCommit(branch, head)) onDefault.add(head);
    }
  }

  const more = all ? await allFacts(host, snapshot) : { requirements: "unknown", tags: "unknown", results: "unknown", tests: "unknown" };
  return {
    address, info: all ? info : "unknown", snapshot, graph: "unknown", requirements: more.requirements, statuses: approvals, queues: changeQueues,
    declaration, workflow, model, modelUnread, modelSince: "unknown", participants,
    plan: { order, items, states: planStates }, sprints, assignments, held: heldItems(sprints, items, modules, pullRequests, onDefault),
    gates, gateStates: states, jobs, pullRequests, schedule: "unknown", ci: "unknown", tags: more.tags, results: more.results,
    tests: more.tests, resourceNeeds: "unknown",
  };
}
