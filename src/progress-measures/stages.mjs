// stages.mjs — the six stages of a product's progress, the stage it is in, the build in progress, what waits for a person, and what
// waits for the person's acceptance in one repository (MOD-progress-measures, Interfaces: stageShares, currentStage,
// buildInProgress, waitingForAPerson, waitingForAcceptance). The first four derive from a product's Facts alone, as the Facts hold
// them; waitingForAcceptance derives from a snapshot and, for a release-test report, its host through MOD-release-evidence.
//
// Module: MOD-progress-measures
//
// Where the module file leaves a reading open, this file takes the one it names:
//   - A SPEC change entry is decided when its state is `approved` or `in SPEC` (MOD-spec-changes): a person's acceptance names it.
//   - A requirement is guarded by a passing test when a test whose `guards` name it passes (a test's `guards` is what MOD-trace-graph draws its
//     `guards` edges from; Facts.graph is never built). A test passes when its outcome is `passed` in the records of the first of
//     `resultCommits` that names it (MOD-result-records' resultsAt); a test no commit names is not run.
//   - For the instance's own repository (`own`), the bar is full once its first release is tagged: every stage is then full.
//   - A gate waits for a person when it is pending and its deciding role is held, in some role assignment, by a participant of the
//     type `person`; a gate decided by a check has no holder. The path of such a gate is the record of the job waiting at it, else the
//     product's declaration, where its gates are declared.
//   - stageShares is async.

import { statuses } from "../approvals/index.mjs";
import { queues } from "../spec-changes/index.mjs";
import { reportsAwaitingAcceptance } from "../release-evidence/index.mjs";
import { resultsAt } from "../result-records/index.mjs";

// The human-readable kind MOD-progress-measures' waitingForAcceptance names a reviewed file by (Interfaces), keyed by
// MOD-approvals' own kind (approval-record.schema.md). A kind with no entry here — release-report — names no
// reviewed file this item derives a wait from.
const REVIEWED_KINDS = { "use-case": "use case", "architecture-decision": "architecture decision", module: "module" };

// The statuses MOD-approvals derives that still wait for the person's acceptance — not accepted.
const WAITING_STATUSES = new Set(["open", "changed"]);

// Every queue's folder, docs/spec-freigaben/<slug>/ (MOD-spec-changes, Data), stripped to build an entry's
// identifier, spec-<slug>-<NN> (MOD-approvals, Data: the approval record's path for an entry of a change queue).
const QUEUE_FOLDER_PREFIX = "docs/spec-freigaben/";

// The states of a SPEC change entry that a person's acceptance has decided (MOD-spec-changes, Data).
const DECIDED_ENTRIES = new Set(["approved", "in SPEC"]);

// A release is tagged vYYYY.MINOR.PATCH (A RELEASE IS TAGGED AND LOGGED); a candidate's tag carries a suffix and is none.
const RELEASE_TAG = /^v\d{4}\.\d+\.\d+$/;

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const unknown = (what) => ({ share: null, detail: `the ${what} unknown` });

// The entries of the queues that are open — the SPEC changes that wait for a person: { kind, id, path, blob }.
function openSpecChanges(queueList) {
  return queueList.flatMap((queue) => {
    const slug = queue.folder.slice(QUEUE_FOLDER_PREFIX.length);
    return queue.entries
      .filter((entry) => entry.state === "open")
      .map((entry) => ({
        kind: "SPEC change",
        id: `spec-${slug}-${String(entry.number).padStart(2, "0")}`,
        path: entry.proposal.path,
        blob: entry.proposal.blob,
      }));
  });
}

// The reviewed files of the kinds given whose status is open or changed: { kind, id, path }.
function waitingReviewed(statusMap, kinds) {
  return [...statusMap]
    .filter(([, status]) => Object.hasOwn(kinds, status.kind) && WAITING_STATUSES.has(status.status))
    .map(([path, status]) => ({ kind: kinds[status.kind], id: status.id, path }));
}

// ---------------------------------------------------------------- the six stages

function requirementsStage(facts) {
  const entries = facts.queues.flatMap((queue) => queue.entries);
  const open = entries.filter((entry) => !DECIDED_ENTRIES.has(entry.state));
  if (open.length) return { share: (entries.length - open.length) / entries.length, detail: `${plural(open.length, "change", "changes")} open` };
  if (facts.requirements === "unknown") return unknown("requirements are");
  return facts.requirements.length
    ? { share: 1, detail: `${plural(facts.requirements.length, "requirement", "requirements")}, no change open` }
    : { share: 0, detail: "no requirement yet" };
}

// The share of the files of the kinds given that are accepted, with the detail `none` when there is no file.
function acceptedStage(facts, kinds, text) {
  const files = [...facts.statuses.values()].filter((status) => kinds.has(status.kind));
  const accepted = files.filter((status) => status.status === "accepted").length;
  return files.length ? { share: accepted / files.length, detail: `${accepted} of ${files.length} ${text.of}` } : { share: 0, detail: text.none };
}

function implementationStage(facts) {
  if (facts.model === "unknown") return unknown("declared model is");
  if (facts.model === null) return { share: null, detail: "the process is configured when implementation starts" };
  const states = facts.plan.states;
  if (states.some((state) => state.state === "unknown")) return unknown("pull requests are");
  if (!states.length) return { share: 0, detail: "not planned yet" };
  const done = states.filter((state) => state.state === "done").length;
  const steps = facts.plan.order !== null || facts.plan.items.some((item) => item.path.startsWith("docs/plan/"));
  return { share: done / states.length, detail: `${done} of ${states.length} ${steps ? "steps" : "items"} done` };
}

// The tests that pass: those whose outcome in the records of the first of `commits` (newest first) that names them is `passed`. Each commit's
// records are read once, for the tests no newer commit named; the reading stops when every test is settled.
async function passingTests(results, commits, tests) {
  const passing = new Set();
  let pending = tests;
  for (const commit of commits) {
    if (pending.length === 0) break;
    const named = new Set();
    for (const group of await resultsAt(results, commit, pending.map(({ id, level }) => ({ id, level })))) {
      for (const test of group.tests.filter((entry) => entry.records.length > 0)) {
        named.add(test.id);
        if (test.outcome === "passed") passing.add(test.id);
      }
    }
    pending = pending.filter(({ id }) => !named.has(id));
  }
  return passing;
}

// A test passes “by the newest result record of a commit of the default branch that ran it”: the share of the requirements that a passing test guards.
async function testsStage(facts) {
  if (facts.requirements === "unknown") return unknown("requirements are");
  if (facts.tests === "unknown") return unknown("tests are");
  if (facts.results === "unknown") return unknown("test results are");
  if (facts.resultCommits === "unknown") return unknown("commits of the default branch are");
  if (!facts.requirements.length) return { share: 0, detail: "no requirement yet" };
  const passing = facts.results === null ? new Set() : await passingTests(facts.results, facts.resultCommits, facts.tests);
  const guarded = new Set(facts.tests.filter(({ id }) => passing.has(id)).flatMap((test) => test.guards));
  const count = facts.requirements.filter((requirement) => guarded.has(requirement)).length;
  return { share: count / facts.requirements.length, detail: `${count} of ${facts.requirements.length} requirements guarded by a passing test` };
}

function releaseStage(facts) {
  if (facts.tags === "unknown") return unknown("tags are");
  const released = facts.tags.map((tag) => tag.name).filter((name) => RELEASE_TAG.test(name));
  if (!released.length) return { share: 0, detail: "no release yet" };
  return { share: 1, detail: released.length === 1 ? `${released[0]} tagged` : `${released.length} releases tagged` };
}

/**
 * stageShares(facts) -> Promise<Array<{ stage: string, share: number | null, detail: string }>> — the six stages of the main
 * page's bar, in their order: Requirements, Use cases, Architecture, Implementation, Tests, Release. A share is between 0 and 1;
 * a stage whose share needs an unknown fact has none (null), and its detail says which. The tests stage reads the records of the branch test-results through resultsAt (MOD-result-records), the commits of resultCommits newest first, as far as a test is not settled; nothing else is read. For the instance's own repository (own), the bar is full once its first release is tagged.
 * @param {object} facts MOD-progress-measures' Facts
 */
export async function stageShares(facts) {
  const stages = [
    ["Requirements", requirementsStage(facts)],
    ["Use cases", acceptedStage(facts, new Set(["use-case"]), { of: "accepted", none: "no use case yet" })],
    ["Architecture", acceptedStage(facts, new Set(["architecture-decision", "module"]), { of: "files accepted", none: "not designed yet" })],
    ["Implementation", implementationStage(facts)],
    ["Tests", await testsStage(facts)],
    ["Release", releaseStage(facts)],
  ];
  // The instance's own repository has no product: its bar is full once its first release is tagged.
  const full = facts.own && stages.at(-1)[1].share === 1;
  return stages.map(([stage, { share, detail }]) => ({ stage, share: full ? 1 : share, detail }));
}

/**
 * currentStage(shares) -> string | null — the first stage that is not full: a share below 1, or none. Null when every stage is full.
 * @param {Array<{ stage: string, share: number | null }>} shares
 */
export function currentStage(shares) {
  return shares.find(({ share }) => share === null || share < 1)?.stage ?? null;
}

// ---------------------------------------------------------------- the build

// The states of the plan's steps or items in progress that a job of `rows` (the job rows by identifier) works on, in the plan's order.
const buildStates = (facts, rows) => facts.plan.states.filter((state) => state.state === "in progress" && rows.has(state.job));

/**
 * buildInProgress(facts) -> Array<{ item, job, participant, state, elapsed, reachable }> — the steps or items in progress that a job
 * works on, in the plan's order: the job's participant, its state as its record and the live state give it, its elapsed time in
 * seconds, and whether its runtime answers. An item whose pull request is merged is done and is not listed.
 * @param {object} facts MOD-progress-measures' Facts
 */
export function buildInProgress(facts) {
  const rows = new Map(facts.jobs.map((row) => [row.record.id, row]));
  return buildStates(facts, rows).map((state) => {
    const row = rows.get(state.job);
    return { item: state.item, job: state.job, participant: row.record.participant, state: row.state, elapsed: row.elapsed,
      reachable: row.source.reachable };
  });
}

// ---------------------------------------------------------------- what waits for a person

// The participants that hold each role, by role, in the role assignments of the facts.
function holdersByRole(assignments) {
  const holders = new Map();
  for (const row of assignments.flatMap((assignment) => assignment.sections.flatMap((section) => section.rows ?? []))) {
    holders.set(row.cells.Role, [...(holders.get(row.cells.Role) ?? []), ...row.cells.Participants]);
  }
  return holders;
}

// The pending gates a person decides: { kind: "gate", id, path }.
function gatesOfAPerson(facts) {
  if (!facts.workflow || facts.workflow === "unknown") return [];
  const people = new Set(facts.participants.filter((participant) => participant.type === "person").map((participant) => participant.name));
  const holders = holdersByRole(facts.assignments);
  const pending = new Set(facts.gateStates.filter((state) => state.state === "pending").map((state) => state.gate));
  return facts.workflow.gates
    .filter((gate) => pending.has(gate.name) && (holders.get(gate.decider) ?? []).some((holder) => people.has(holder)))
    .map((gate) => {
      const waiting = facts.jobs.find((row) => row.state === "waiting at a gate"
        && row.record.gates.some((reached) => reached.gate === gate.name && reached.resumedBy === null));
      return { kind: "gate", id: gate.name, path: waiting ? waiting.record.path : facts.declaration.path };
    });
}

/**
 * waitingForAPerson(facts) -> Array<{ kind: "use case" | "SPEC change" | "gate" | "failed job", id, path }> — what waits for a
 * person in the product: its open or changed use cases, its open SPEC change entries, its pending gates whose deciding role a person
 * holds, and its failed jobs; `path` is the file or record each concerns.
 * @param {object} facts MOD-progress-measures' Facts
 */
export function waitingForAPerson(facts) {
  const changes = openSpecChanges(facts.queues).map(({ kind, id, path }) => ({ kind, id, path }));
  const failed = facts.jobs.filter((row) => row.state === "failed").map((row) => ({ kind: "failed job", id: row.record.id, path: row.record.path }));
  return [...waitingReviewed(facts.statuses, { "use-case": "use case" }), ...changes, ...gatesOfAPerson(facts), ...failed];
}

// ---------------------------------------------------------------- what waits for acceptance

/**
 * waitingForAcceptance(host, snapshot) -> Promise<Array<{ kind, id, path, blob }>> — what waits for the person's
 * acceptance in one repository (MOD-progress-measures, Interfaces): every entry of a change queue in the state open
 * (MOD-spec-changes' queues), and every use case, architecture decision and module file whose status is open or
 * changed (MOD-approvals' statuses), and a completed release candidate's report (MOD-release-evidence).
 * @param {{ listTags: (pattern: string) => Promise<Array<{ name: string, commit: string }>> }} host
 * @param {{ paths: string[], read: (path: string) => Promise<string | null>, blob: (path: string) => string | null }} snapshot
 * @returns {Promise<Array<{ kind: string, id: string, path: string, blob: string }>>}
 */
export async function waitingForAcceptance(host, snapshot) {
  const specChanges = openSpecChanges((await waitingQueues(snapshot)).queues);
  const reviewed = waitingReviewed(statuses(snapshot), REVIEWED_KINDS).map((file) => ({ ...file, blob: snapshot.blob(file.path) }));
  const report = await reportsAwaitingAcceptance(host, snapshot);
  const releaseReport = report ? [{
    kind: "release test report", id: `release-v${report.version}`, path: report.record, blob: report.blob,
  }] : [];
  return [...specChanges, ...reviewed, ...releaseReport];
}

// ---------------------------------------------------------------- the overview of a commit, stored

// The branch that holds the overviews, one `<commit>.json` for each commit of the default branch (MOD-progress-measures, Data).
const OVERVIEW_BRANCH = "overview-cache";

// The name of the declared model a card names, or null where none was read.
const modelName = (facts) => (typeof facts.model?.name === "string" ? facts.model.name : null);

// The build as the overview holds it: the states of the steps or items in progress that a job works on — as buildInProgress takes them, derived at the commit with every pull
// request — and the records of those jobs as the commit holds them, { path, text }. The main page derives the build's rows from them with the live states of those jobs alone.
async function storedBuild(snapshot, facts) {
  const rows = new Map(facts.jobs.map((row) => [row.record.id, row]));
  const states = buildStates(facts, rows);
  const paths = [...new Set(states.map((state) => rows.get(state.job).record.path))];
  return { states, records: await Promise.all(paths.map(async (path) => ({ path, text: (await snapshot.read(path)) ?? "" }))) };
}

// The change queues the overview holds: those with an entry that is not in the SPEC yet, as MOD-spec-changes' queues gives them — what the specification page lists as waiting and
// reads ahead, without reading every queue of the repository.
const undecidedQueues = (facts) => (Array.isArray(facts.queues) ? facts.queues : []).filter((queue) => queue.entries.some((entry) => entry.state !== "in SPEC"));

/**
 * publishOverview(host, snapshot, facts) -> Promise<{ commit: string, written: boolean }> — adds `<commit>.json` to the branch `overview-cache` by commitFiles, in one commit on the head it read: the stage
 * shares, what waits for a person, the declared model's name, the build (storedBuild) and the change queues with an entry not in the SPEC yet from `facts`, `facts` being read with the scope `all` at the
 * snapshot's commit. A file the branch holds already is left as it is; `written` is false when the branch holds it. Crosses the network; fails as commitFiles fails, and with the host's NotFound where the
 * repository has no such branch.
 * @param {object} host MOD-repository-hosts' Host @param {object} snapshot the product's snapshot @param {object} facts
 */
export async function publishOverview(host, snapshot, facts) {
  const commit = snapshot.commit;
  if (typeof commit !== "string" || commit === "") throw new TypeError("publishOverview needs the snapshot of a commit");
  const branch = await host.readSnapshot(OVERVIEW_BRANCH);
  const files = [];
  if (!branch.paths.includes(`${commit}.json`)) {
    const overview = { commit, shares: await stageShares(facts), waiting: waitingForAPerson(facts), model: modelName(facts), build: await storedBuild(snapshot, facts),
      queues: undecidedQueues(facts) };
    files.push({ path: `${commit}.json`, text: `${JSON.stringify(overview)}
` });
  }
  // latest.json names the commit of the overview stored last, which a page shows while its head's own is not stored yet (latestOverview).
  if (files.length > 0) files.push({ path: LATEST, text: `${JSON.stringify({ commit })}\n` });
  if (files.length === 0) return { commit, written: false };
  await host.commitFiles({ branch: OVERVIEW_BRANCH, expectedHead: branch.commit ?? null, message: `Overview of ${commit}`, files });
  return { commit, written: true };
}

// The overviews read in this page, by repository and commit: a commit's overview does not change once it is stored, so it is read once however many snapshots of the commit
// (of one repository, as the host gives them) ask; a snapshot with no object as its repository is kept by itself. One that is missing or failed is not kept, and is read again at the next call.
const OVERVIEWS = new WeakMap();

const isFile = (value) => value !== null && typeof value === "object" && typeof value.path === "string" && typeof value.text === "string";

/**
 * storedOverview(snapshot) -> Promise<{ shares, waiting, model, build: { states, records }, queues } | null> — the overview stored for the snapshot's commit, read with the
 * snapshot's readOn in one request, once for each commit of a repository in a page; null where the branch or the file is missing or holds another format (not JSON, another shape, another commit, or an
 * overview without the model, the build and the queues).
 * @param {object} snapshot
 */
export function storedOverview(snapshot) {
  if (snapshot === null || typeof snapshot !== "object") return Promise.resolve(null);
  const scope = snapshot.repository !== null && typeof snapshot.repository === "object" ? snapshot.repository : snapshot;
  if (!OVERVIEWS.has(scope)) OVERVIEWS.set(scope, new Map());
  const kept = OVERVIEWS.get(scope);
  const commit = snapshot.commit;
  if (!kept.has(commit)) {
    const reading = readOverview(snapshot);
    kept.set(commit, reading);
    reading.then((held) => { if (held === null) kept.delete(commit); }, () => kept.delete(commit));
  }
  return kept.get(commit);
}

const LATEST = "latest.json";

/**
 * latestOverview(snapshot) -> Promise<{ commit, shares, waiting, model, build, queues } | null> — the overview stored last on the branch, whichever commit it is of, as the file
 * latest.json names it: what a page shows while the overview of its head is not stored yet, never deriving one itself. Null where the branch, `latest` or that overview is missing.
 * @param {object} snapshot
 */
export async function latestOverview(snapshot) {
  if (typeof snapshot?.readOn !== "function") return null;
  let named;
  try { named = await snapshot.readOn(OVERVIEW_BRANCH, LATEST); } catch (error) { if (error?.name === "NotFound") return null; throw error; }
  let commit = "";
  try { commit = typeof named === "string" ? String(JSON.parse(named)?.commit ?? "") : ""; } catch { return null; }
  if (!/^[0-9a-f]{40}$/.test(commit)) return null;
  const held = await readOverview({ readOn: snapshot.readOn, commit });
  return held && { commit, ...held };
}

/**
 * waitingQueues(snapshot) -> Promise<{ queues, asOf: string | null }> — the change queues with an entry not in the SPEC yet: those of the overview stored for the snapshot's commit, and asOf
 * null; while that is not stored yet, those of the overview stored last, and asOf its commit; where the repository stores no overview, those MOD-spec-changes' queues derives from every queue
 * of the snapshot, and asOf null. Fails with the host's errors but NotFound.
 * @param {object} snapshot
 */
export async function waitingQueues(snapshot) {
  const own = await storedOverview(snapshot);
  if (own) return { queues: own.queues, asOf: null };
  const last = await latestOverview(snapshot);
  if (last) return { queues: last.queues, asOf: last.commit };
  return { queues: await queues(snapshot), asOf: null };
}

async function readOverview(snapshot) {
  if (typeof snapshot.readOn !== "function" || typeof snapshot.commit !== "string") return null;
  let text;
  try {
    text = await snapshot.readOn(OVERVIEW_BRANCH, `${snapshot.commit}.json`);
  } catch (error) {
    if (error?.name === "NotFound") return null;
    throw error;
  }
  if (typeof text !== "string") return null;
  let held;
  try { held = JSON.parse(text); } catch { return null; }
  if (held === null || typeof held !== "object" || held.commit !== snapshot.commit || !Array.isArray(held.shares) || !Array.isArray(held.waiting)) return null;
  const { build } = held;
  if (!(held.model === null || typeof held.model === "string") || !Array.isArray(build?.states) || !Array.isArray(build?.records) || !build.records.every(isFile)
    || !Array.isArray(held.queues)) return null;
  return { shares: held.shares, waiting: held.waiting, model: held.model, build: { states: build.states, records: build.records }, queues: held.queues };
}
