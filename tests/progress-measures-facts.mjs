// Facts for the tests of MOD-progress-measures' stageShares, currentStage, buildInProgress and waitingForAPerson — a helper, no
// test of its own. A Facts as docs/architecture/MOD-progress-measures.md gives it (Interfaces: Facts), every field "unknown" or
// empty until a test sets it, and the smaller structures a test sets it with: approval statuses, change queues, item states, job
// rows, a graph of requirements and tests, and the branch test-results as a Snapshot that counts its reads. Nothing reaches the
// network; nothing sleeps.
//
// Module: MOD-progress-measures

export const COMMIT = "c".repeat(40);

/** A Facts with every field unread or empty; `over` sets the fields a test is about. */
export function facts(over = {}) {
  return {
    address: "https://github.com/alice/product", info: "unknown",
    snapshot: { commit: COMMIT, paths: [], blob: () => null, read: async () => null },
    graph: "unknown", requirements: "unknown", statuses: new Map(), queues: [], declaration: null, workflow: null, model: null,
    modelUnread: null, modelSince: "unknown", participants: [], plan: { order: null, items: [], states: [] }, sprints: [],
    assignments: [], held: [], gates: [], gateStates: [], jobs: [], pullRequests: [], schedule: "unknown", ci: "unknown",
    tags: [], results: "unknown", tests: [], resourceNeeds: "unknown", resultCommits: "unknown", own: false, ...over,
  };
}

/** MOD-approvals' statuses: a Map from the file's path to { id, kind, status }; each row is [path, id, kind, status]. */
export const statusMap = (rows) => new Map(rows.map(([path, id, kind, status]) => [path, { id, kind, status }]));

/** One queue of MOD-spec-changes' Queue form; each entry is [number, state]. */
export const queueOf = (folder, entries) => ({
  folder, title: folder, target: "SPEC.md",
  entries: entries.map(([number, state]) => ({
    number, file: "SPEC.md", anchor: `## ${number}`, until: null,
    proposal: { path: `${folder}/${String(number).padStart(2, "0")}-section.md`, blob: String(number).repeat(40).slice(0, 40) },
    rationale: "", record: null, decision: null, state, createdBy: null,
  })),
});

/** MOD-work-plans' ItemState. */
export const itemState = (item, state, over = {}) => ({ item, state, reason: null, job: null, pullRequest: null, ...over });

/** MOD-job-ledger's JobRow, with the parts the module reads. */
export const jobRow = ({ id, participant = "developer-a", worksOn = [], state = "running", elapsed = 0, reachable = true, gates = [],
  path = `docs/jobs/${id}.md` }) => ({
  record: { id, path, participant, worksOn, gates, question: null }, product: "https://github.com/alice/product", state, elapsed,
  cost: { known: false, usage: null }, source: { reachable, reason: reachable ? null : "the bridge does not answer" },
});

/** A Graph with the requirements as nodes and, for each [test, requirement] pair, a `guards` edge from the test. */
export function graphOf(requirements, guards) {
  const nodes = new Map();
  for (const name of requirements) nodes.set(name, { id: name, kind: "requirement", path: "SPEC.md", line: 1, sources: [] });
  for (const [test] of guards) nodes.set(test, { id: test, kind: "TST", path: `tests/${test}.test.mjs`, line: 1 });
  return { commit: COMMIT, nodes, edges: guards.map(([test, requirement]) => ({ from: test, to: requirement, via: "guards", interface: null,
    path: `tests/${test}.test.mjs`, line: 1 })), files: [], links: [], positions: [], unread: [] };
}

/** One run record of the branch test-results (result-record.schema.md): front matter, then the ## Outcomes table of [Test, Level, Outcome]. */
export const runRecord = (commit, rows) => ["---", `commit: ${commit}`, "levels:", "  - unit", "occasion: commit", "participant: ci",
  "date: 2026-10-16 10:00 UTC", "---", "## Outcomes", "", "| Test | Level | Outcome | Runs |", "|---|---|---|---|",
  ...rows.map(([test, level, outcome]) => `| ${test} | ${level} | ${outcome} |  |`), ""].join("\n");

/** The branch test-results as a Snapshot of texts held in memory, counting each path it is asked to read. */
export function resultsSnapshot(texts) {
  const reads = [];
  return { reads, paths: Object.keys(texts), blob: () => null,
    read: async (path) => { reads.push(path); return Object.hasOwn(texts, path) ? texts[path] : null; } };
}
