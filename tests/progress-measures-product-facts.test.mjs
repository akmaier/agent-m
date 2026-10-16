// MOD-progress-measures' productFacts with the scope `work` (ITM-536), as the accepted text of
// docs/architecture/MOD-progress-measures.md states it: "productFacts(host, instance, instanceAt, now, bridges, options?: { scope:
// "all" | "work" }) -> Promise<Facts> — with the scope `work`, what MOD-prompt-bar asks before a hand-over starts, it reads only what
// MOD-work-plans' `itemStates` and `startable` and MOD-product-process' `holdsRole` take — the approval statuses, the change queues,
// the declaration with its model and workflow, the participants, the plan or the backlog, the sprints, the role assignments, the
// gate records with their states, the job records without asking their live state, and the pull requests with `held` —, and every
// other fact is `"unknown"`." and, of the scope `all`, "for the head commits MOD-work-plans' `undecidedHeads` names, whether the
// default branch contains them, through the host's `containsCommit`, which `held` is computed with". The scope `all` is not built:
// a call for it is refused (index.mjs).
// Run: node --test tests/progress-measures-product-facts.test.mjs
//
// Module: MOD-progress-measures
// Guards: UC-032; UC-049; STATUS IS DERIVED FROM THE RECORDS; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
// Level: unit
//
// Each test states its input and its expected values in its own text (given / input / expect); no expected value is read from a
// document. The fixture product is a Scrum product of one team: files held in memory, a host that records every call, and an
// instance snapshot that records every read. Nothing reaches the network: `fetch` is replaced by a spy for every test and must
// not have been called when the test ends. The counter-proofs are recorded in the pull request.

import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { productFacts } from "../src/progress-measures/index.mjs";

// ---------------------------------------------------------------- no network

let fetched = [];
const realFetch = globalThis.fetch;
beforeEach(() => {
  fetched = [];
  globalThis.fetch = async (input) => { fetched.push(String(input?.url ?? input)); throw new Error("a test reached the network"); };
});
afterEach(() => {
  globalThis.fetch = realFetch;
  assert.deepEqual(fetched, [], "no request reaches the network");
});

// ---------------------------------------------------------------- the fixture product

const NOW = new Date("2026-10-16T12:00:00Z");
const MODEL_VERSION = "5".repeat(40);
const H1 = "a1".repeat(20), H2 = "a2".repeat(20), H9 = "a9".repeat(20);

const blobOf = (text) => createHash("sha1").update(text).digest("hex");
const named = (name, message = name) => Object.assign(new Error(message), { name });

// A snapshot (MOD-repository-hosts' Snapshot) of files held in memory; `reads` counts each path's reads.
function snapshotOf(files, web = "https://github.com/alice/product") {
  const reads = new Map();
  return {
    reads,
    repository: { server: "github", path: "alice/product", web },
    ref: "main",
    commit: "c".repeat(40),
    paths: Object.keys(files),
    blob: (path) => (Object.hasOwn(files, path) ? blobOf(files[path]) : null),
    read: async (path) => { reads.set(path, (reads.get(path) ?? 0) + 1); return Object.hasOwn(files, path) ? files[path] : null; },
  };
}

const frontMatter = (fields) => ["---", ...Object.entries(fields).flatMap(([key, value]) => (Array.isArray(value)
  ? [`${key}:`, ...value.map((entry) => `  - ${entry}`)] : [`${key}: ${value}`])), "---"].join("\n");

const item = (id, { realises, modules, builds = [], level = "module" }) => [frontMatter({ id, title: `${id} the work`, level,
  realises, modules, ...(builds.length ? { builds_on: builds } : {}) }), `# ${id} the work`, ""].join("\n");
const moduleFile = (id, uses) => [frontMatter({ id, title: id, ...(uses.length ? { uses } : {}) }), `# ${id}`, ""].join("\n");
const sprintRecord = (selection) => [frontMatter({ sprint: 1, goal: "The fixture sprint", start: "2026-10-12", end: "", closer: "alice",
  branch: "", selection }), "# team1 Sprint 01", ""].join("\n");

const DECLARATION = (modelFile = "src/model-catalogue/models/scrum.md") => [
  frontMatter({ model: "scrum", model_file: modelFile, model_version: MODEL_VERSION }),
  "# Process", "", "## Practices", "", "- none", "", "## Branches", "", "| Phase or time box | Branch |", "|---|---|",
  "| Sprint | sprint/<team>/<nn> |", "", "## Definition of Done", "", "The job rules hold; no condition is added.", "",
].join("\n");

const ROLE_ASSIGNMENT = ["# Role assignment of team1", "", "## Roles", "", "| Role | Participants |", "|---|---|",
  "| Product Owner | alice |", "| Scrum Master | alice |", "| Developers | developer-a |", ""].join("\n");

const QUEUE_INDEX = ["# SPEC approvals — queue 2026-03-01 · waiting queue", "", "**Zieldatei aller Einträge:** `SPEC.md`", "",
  "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |", "|---|---|---|---|---|",
  "| 01 | `SPEC.md` | ## 1. Open section | — | — |", ""].join("\n");

const JOB = ["---", "id: JOB-20261014-0900-a1b2", "kind: implement", "works_on:", "  - ITM-002", "route: ci hosted",
  "started_by: alice", "start: 2026-10-14 09:00 UTC", "agent_m: unknown, commit unknown", "limit: 1", "---",
  "## Destinations", "", "## Parameters", "", "```json", "{}", "```", ""].join("\n");

const REGISTER = ["# Participants of this instance", "", "**REGISTER**", "", "The people and agents of the fixture instance.", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |", "|---|---|---|---|---|---|---|---|",
  "| alice | person | — | — | — | read the repository, write to the repository | — | account github.com/alice |",
  "| developer-a | CLI agent | example-model | 200000 | — | read the repository, write to the repository, run code and tests | this machine | bridge lab-pc agent claude |",
  ""].join("\n");

const UC1 = "docs/use-cases/UC-001-store.md", UC2 = "docs/use-cases/UC-002-pages.md";

// The files of the product's default branch: two use cases (UC-001 accepted by a record naming its blob, UC-002 open), two module
// files, four backlog items, one team's sprint selecting ITM-001, ITM-002 and ITM-004, one role assignment, one open SPEC change
// entry, one gate record and one job record.
function productFiles() {
  const files = {
    "SPEC.md": "# Spec\n",
    [UC1]: "# UC-001 store\n",
    [UC2]: "# UC-002 pages\n",
    "docs/architecture/MOD-store.md": moduleFile("MOD-store", []),
    "docs/architecture/MOD-pages.md": moduleFile("MOD-pages", ["MOD-store.read", "MOD-store.write"]),
    "docs/backlog/ITM-001-store.md": item("ITM-001", { realises: ["UC-001"], modules: ["MOD-store"] }),
    "docs/backlog/ITM-002-pages.md": item("ITM-002", { realises: ["UC-001"], modules: ["MOD-pages"], builds: ["ITM-001"] }),
    "docs/backlog/ITM-003-mail.md": item("ITM-003", { realises: ["UC-002"], modules: ["MOD-pages"] }),
    "docs/backlog/ITM-004-feed.md": item("ITM-004", { realises: ["UC-001"], modules: ["MOD-store"] }),
    "docs/backlog/sprints/team1/01.md": sprintRecord(["ITM-001", "ITM-002", "ITM-004"]),
    "docs/role-assignments/team1.md": ROLE_ASSIGNMENT,
    "docs/process.md": DECLARATION(),
    "docs/spec-freigaben/2026-03-01_waiting/index.md": QUEUE_INDEX,
    "docs/spec-freigaben/2026-03-01_waiting/01-open-section.md": "# Open section\n",
    "docs/jobs/JOB-20261014-0900-a1b2.md": JOB,
  };
  files[`docs/approvals/UC-001-${blobOf(files[UC1]).slice(0, 12)}.md`] = "kind: use-case\n";
  files["docs/gates/20261014-1000-development-sprint-review-a1b2.md"] = [
    frontMatter({ gate: "Development → Sprint Review", job: "", decider: "alice", role: "Product Owner", decision: "passed",
      on: [`docs/process.md@${blobOf(files["docs/process.md"])}`], date: "2026-10-14" }), "# Gate record", ""].join("\n");
  return files;
}

const pr = (number, id, base, state, head, merged = null) => ({ number, title: `${id}: the work`, branch: `work/${id}`, base, head,
  state, draft: false, url: `https://github.com/alice/product/pull/${number}`, opened: "2026-10-12T08:00:00Z", merged, closed: merged,
  body: "" });
// ITM-001 merged into the default branch, ITM-002 open.
const BASE_PULL_REQUESTS = [pr(1, "ITM-001", "main", "merged", H1, "2026-10-13T10:00:00Z"), pr(2, "ITM-002", "main", "open", H2)];

// The host (calls recorded), the instance and instanceAt (the commits asked recorded).
function fixture({ files = productFiles(), pullRequests = BASE_PULL_REQUESTS, serverOperations = true, contained = new Set(),
  instanceFailure = null } = {}) {
  const calls = [];
  const product = snapshotOf(files);
  const instance = snapshotOf({ "SPEC.md": "# Instance spec\n", "docs/participants.md": REGISTER }, "https://github.com/alice/agent-m");
  const asked = [];
  const host = {
    async repositoryInfo() {
      calls.push(["repositoryInfo"]);
      if (!serverOperations) throw named("NotSupported");
      return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" };
    },
    async readSnapshot(ref) { calls.push(["readSnapshot", ref]); return product; },
    async listPullRequests(...filter) {
      calls.push(["listPullRequests", ...filter]);
      if (!serverOperations) throw named("NotSupported");
      return pullRequests;
    },
    async containsCommit(branch, commit) { calls.push(["containsCommit", branch, commit]); return contained.has(commit); },
  };
  const instanceAt = async (commit) => { asked.push(commit); if (instanceFailure) throw instanceFailure; return instance; };
  return { host, calls, product, instance, instanceAt, asked };
}

const work = (f) => productFacts(f.host, f.instance, f.instanceAt, NOW, {}, { scope: "work" });

// ---------------------------------------------------------------- what is read

// TST-536001 · level: unit · module: MOD-progress-measures
// guards: STATUS IS DERIVED FROM THE RECORDS; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-049
// given: the fixture product (UC-001 accepted by a record naming its blob, UC-002 open; one open SPEC change entry; scrum declared at the commit 5…5; alice and developer-a in the instance's register; four backlog items; team1's sprint; team1's role assignment; one passed gate record; one job record; a merged and an open pull request) and its instance
// input: productFacts(host, instance, instanceAt, now, {}, { scope: "work" })
// expect: address "https://github.com/alice/product"; UC-001 accepted and UC-002 open in statuses; one queue, 2026-03-01_waiting, whose entry 01 is open; the declaration's model "scrum"; model and workflow of scrum with the phases Sprint Planning, Development, Sprint Review, Sprint Retrospective; modelUnread null; participants alice and developer-a; plan.order null and plan.items ITM-001 to ITM-004; sprints [docs/backlog/sprints/team1/01.md]; assignments [docs/role-assignments/team1.md]; gates [the one record]; one job JOB-20261014-0900-a1b2 of a product at the address; pullRequests numbered 1 and 2
test("productFacts, scope work — reads the statuses, queues, declaration with model and workflow, participants, backlog, sprints, role assignments, gates, jobs and pull requests", async () => {
  const f = fixture();
  const facts = await work(f);
  assert.equal(facts.address, "https://github.com/alice/product");
  assert.equal(facts.snapshot, f.product);
  assert.deepEqual(facts.statuses.get(UC1), { id: "UC-001", kind: "use-case", status: "accepted" });
  assert.deepEqual(facts.statuses.get(UC2), { id: "UC-002", kind: "use-case", status: "open" });
  assert.deepEqual(facts.queues.map((q) => [q.folder, q.entries.map((e) => [e.number, e.state])]), [["docs/spec-freigaben/2026-03-01_waiting", [[1, "open"]]]]);
  assert.equal(facts.declaration.path, "docs/process.md");
  assert.equal(facts.declaration.fields.model, "scrum");
  assert.equal(facts.model.name, "scrum");
  assert.deepEqual(facts.workflow.phases.map((p) => p.name), ["Sprint Planning", "Development", "Sprint Review", "Sprint Retrospective"]);
  assert.equal(facts.workflow.model.name, "scrum");
  assert.equal(facts.modelUnread, null);
  assert.deepEqual(facts.participants.map((p) => [p.name, p.type]), [["alice", "person"], ["developer-a", "CLI agent"]]);
  assert.equal(facts.plan.order, null);
  assert.deepEqual(facts.plan.items.map((i) => i.id), ["ITM-001", "ITM-002", "ITM-003", "ITM-004"]);
  assert.deepEqual(facts.sprints.map((s) => s.path), ["docs/backlog/sprints/team1/01.md"]);
  assert.deepEqual(facts.assignments.map((a) => a.path), ["docs/role-assignments/team1.md"]);
  assert.deepEqual(facts.assignments[0].sections[0].rows.map((row) => [row.cells.Role, row.cells.Participants]),
    [["Product Owner", ["alice"]], ["Scrum Master", ["alice"]], ["Developers", ["developer-a"]]]);
  assert.deepEqual(facts.gates.map((g) => g.path), ["docs/gates/20261014-1000-development-sprint-review-a1b2.md"]);
  assert.deepEqual(facts.jobs.map((row) => [row.record.id, row.product, row.state]), [["JOB-20261014-0900-a1b2", "https://github.com/alice/product", "queued"]]);
  assert.deepEqual(facts.pullRequests.map((p) => p.number), [1, 2]);
});

// TST-536002 · level: unit · module: MOD-progress-measures
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-049
// given: the fixture product
// input: productFacts(…, { scope: "work" })
// expect: exactly the fields address, info, snapshot, graph, requirements, statuses, queues, declaration, workflow, model, modelUnread, modelSince, participants, plan, sprints, assignments, held, gates, gateStates, jobs, pullRequests, schedule, ci, tags, results, tests, resourceNeeds; and "unknown" in info, graph, requirements, modelSince, schedule, ci, tags, results, tests and resourceNeeds
test("productFacts, scope work — every fact the scope does not name is \"unknown\"", async () => {
  const facts = await work(fixture());
  assert.deepEqual(Object.keys(facts).sort(), ["address", "assignments", "ci", "declaration", "gateStates", "gates", "graph", "held", "info",
    "jobs", "model", "modelSince", "modelUnread", "participants", "plan", "pullRequests", "queues", "requirements", "resourceNeeds",
    "results", "schedule", "snapshot", "sprints", "statuses", "tags", "tests", "workflow"]);
  for (const field of ["info", "graph", "requirements", "modelSince", "schedule", "ci", "tags", "results", "tests", "resourceNeeds"]) {
    assert.equal(facts[field], "unknown", field);
  }
});

// TST-536003 · level: unit · module: MOD-progress-measures
// guards: STATUS IS DERIVED FROM THE RECORDS; UC-032
// given: the fixture product: ITM-001 (UC-001 accepted) with a merged pull request; ITM-002 (builds on ITM-001) with a queued job; ITM-003 realising the open UC-002; ITM-004 realising UC-001 with nothing else
// input: productFacts(…, { scope: "work" }).plan.states
// expect: in this order — ITM-001 done by pull request 1; ITM-002 in progress by job JOB-20261014-0900-a1b2; ITM-003 waiting for acceptance because "UC-002 is open, not accepted"; ITM-004 ready
test("productFacts, scope work — plan.states are derived with itemStates from the facts it read", async () => {
  const { plan } = await work(fixture());
  assert.deepEqual(plan.states, [
    { item: "ITM-001", state: "done", reason: null, job: null, pullRequest: "1" },
    { item: "ITM-002", state: "in progress", reason: "job JOB-20261014-0900-a1b2 is queued", job: "JOB-20261014-0900-a1b2", pullRequest: null },
    { item: "ITM-003", state: "waiting for acceptance", reason: "UC-002 is open, not accepted", job: null, pullRequest: null },
    { item: "ITM-004", state: "ready", reason: null, job: null, pullRequest: null },
  ]);
});

// TST-536004 · level: unit · module: MOD-progress-measures
// guards: STATUS IS DERIVED FROM THE RECORDS; UC-049
// given: the fixture product: passed gate record for "Development → Sprint Review" naming docs/process.md at its current blob
// input: productFacts(…, { scope: "work" }).gateStates
// expect: "Development → Sprint Review" passed by the record docs/gates/20261014-1000-development-sprint-review-a1b2.md; "Sprint Retrospective → Sprint Planning" pending, needing "a decision by Product Owner"
test("productFacts, scope work — gateStates are derived from the gate records and the blobs the product holds now", async () => {
  const { gateStates } = await work(fixture());
  assert.deepEqual(gateStates, [
    { gate: "Development → Sprint Review", state: "passed", record: "docs/gates/20261014-1000-development-sprint-review-a1b2.md", needs: null, difference: null },
    { gate: "Sprint Retrospective → Sprint Planning", state: "pending", record: null, needs: "a decision by Product Owner", difference: null },
  ]);
});

// TST-536005 · level: unit · module: MOD-progress-measures
// guards: STATUS IS DERIVED FROM THE RECORDS; UC-049
// given: the fixture product, whose gate record names docs/process.md at the blob 0…0, which is not the blob it holds now
// input: productFacts(…, { scope: "work" }).gateStates
// expect: "Development → Sprint Review" passed on an earlier text, its difference naming docs/process.md, checked 000000000000 and now the first twelve digits of the blob the product holds
test("productFacts, scope work — a gate record that names an earlier blob of its artifact gives passed on an earlier text", async () => {
  const files = productFiles();
  const path = "docs/gates/20261014-1000-development-sprint-review-a1b2.md";
  files[path] = files[path].replace(/docs\/process\.md@[0-9a-f]{40}/, `docs/process.md@${"0".repeat(40)}`);
  const { gateStates } = await work(fixture({ files }));
  assert.deepEqual(gateStates[0], { gate: "Development → Sprint Review", state: "passed on an earlier text", record: path,
    needs: "a decision on the current text", difference: `docs/process.md: checked 000000000000, now ${blobOf(files["docs/process.md"]).slice(0, 12)}` });
});

// ---------------------------------------------------------------- held

// TST-536006 · level: unit · module: MOD-progress-measures
// guards: A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; UC-032
// given: the fixture product; team1's sprint selects ITM-001, ITM-002 and ITM-004; ITM-001's pull request is merged into the default branch
// input: productFacts(…, { scope: "work" }).held, and the calls of the host
// expect: ITM-002 (changes MOD-pages, which uses MOD-store) and ITM-004 (changes MOD-store) are held, each by team1/01; ITM-001 is not; no containsCommit — no merged pull request of a held item is left undecided
test("productFacts, scope work — held is the items the teams' sprints hold, with the modules they change and use", async () => {
  const f = fixture();
  const { held } = await work(f);
  assert.deepEqual(held, [
    { item: "ITM-002", sprint: "team1/01", team: "team1", changes: ["MOD-pages"], uses: ["MOD-store"] },
    { item: "ITM-004", sprint: "team1/01", team: "team1", changes: ["MOD-store"], uses: [] },
  ]);
  assert.deepEqual(f.calls.filter((c) => c[0] === "containsCommit"), []);
});

// The pull requests of the held test below: ITM-001 merged into a sprint branch that reaches no main (head H1: undecided), ITM-002
// merged into main (head H2: decided by the chain), ITM-009 — in no sprint — merged into a side branch (head H9), ITM-004 open.
const UNDECIDED = [pr(1, "ITM-001", "sprint/team1/01", "merged", H1, "2026-10-13T10:00:00Z"), pr(2, "ITM-002", "main", "merged", H2, "2026-10-13T11:00:00Z"),
  pr(3, "ITM-009", "side", "merged", H9, "2026-10-13T12:00:00Z"), pr(4, "ITM-004", "main", "open", "a4".repeat(20))];

// TST-536007 · level: unit · module: MOD-progress-measures
// guards: A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; UC-032
// given: the pull requests UNDECIDED, so the only head commit undecidedHeads names is H1 (ITM-001's merge into a branch that reaches no main); a host whose default branch contains H1 (a), then none (b)
// input: productFacts(…, { scope: "work" }), and the containsCommit calls of the host
// expect: in both cases exactly one containsCommit call, ("main", H1) — not H2 (ITM-002's chain reaches main), not H9 (no held item names it); (a) held ITM-004 only: ITM-001's change is on the default branch; (b) held ITM-001 and ITM-004
test("productFacts, scope work — held asks containsCommit for exactly the heads undecidedHeads names", async () => {
  const a = fixture({ pullRequests: UNDECIDED, contained: new Set([H1]) });
  const heldA = (await work(a)).held;
  assert.deepEqual(a.calls.filter((c) => c[0] === "containsCommit"), [["containsCommit", "main", H1]]);
  assert.deepEqual(heldA.map((h) => h.item), ["ITM-004"]);

  const b = fixture({ pullRequests: UNDECIDED, contained: new Set() });
  const heldB = (await work(b)).held;
  assert.deepEqual(b.calls.filter((c) => c[0] === "containsCommit"), [["containsCommit", "main", H1]]);
  assert.deepEqual(heldB.map((h) => h.item), ["ITM-001", "ITM-004"]);
});

// ---------------------------------------------------------------- once

// TST-536008 · level: unit · module: MOD-progress-measures
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-049
// given: the fixture product, a host and an instance that record their calls and reads
// input: one productFacts(…, { scope: "work" })
// expect: the host is asked once for the repository's information, once for the snapshot of "main", once for the pull requests; instanceAt is asked once, for the commit 5…5 the declaration names; no file of the product and no file of the instance is read twice
test("productFacts, scope work — each fact is read once", async () => {
  const f = fixture();
  await work(f);
  assert.deepEqual(f.calls, [["repositoryInfo"], ["readSnapshot", "main"], ["listPullRequests"]]);
  assert.deepEqual(f.asked, [MODEL_VERSION]);
  assert.deepEqual([...f.product.reads].filter(([, count]) => count > 1), []);
  assert.deepEqual([...f.instance.reads].filter(([, count]) => count > 1), []);
  assert.ok(f.product.reads.size > 10, "the product's files were read");
  assert.deepEqual([...f.instance.reads.keys()].sort(), ["SPEC.md", "docs/participants.md"]);
});

// ---------------------------------------------------------------- the model cannot be read

// TST-536009 · level: unit · module: MOD-progress-measures
// guards: STATUS IS DERIVED FROM THE RECORDS; UC-049
// given: the fixture product, whose instanceAt fails with an error named NotFound, TokenRefused, PermissionMissing or Unreachable
// input: productFacts(…, { scope: "work" }) for each of the four
// expect: it does not fail; model and workflow "unknown"; modelUnread { commit: "5…5", error: <the name> }; gateStates []; the other facts as read — the participants alice and developer-a, the states of the four items as with the workflow (ITM-001 done, ITM-002 in progress, ITM-003 waiting for acceptance, ITM-004 ready)
test("productFacts, scope work — a commit instanceAt cannot read leaves model and workflow unknown and names the error", async () => {
  for (const name of ["NotFound", "TokenRefused", "PermissionMissing", "Unreachable"]) {
    const facts = await work(fixture({ instanceFailure: named(name, `${name}: the instance`) }));
    assert.equal(facts.model, "unknown", name);
    assert.equal(facts.workflow, "unknown", name);
    assert.deepEqual(facts.modelUnread, { commit: MODEL_VERSION, error: name });
    assert.deepEqual(facts.gateStates, []);
    assert.deepEqual(facts.participants.map((p) => p.name), ["alice", "developer-a"]);
    assert.deepEqual(facts.plan.states.map((s) => [s.item, s.state]), [["ITM-001", "done"], ["ITM-002", "in progress"],
      ["ITM-003", "waiting for acceptance"], ["ITM-004", "ready"]]);
  }
});

// TST-536010 · level: unit · module: MOD-progress-measures
// guards: UC-049
// given: the fixture product, whose instanceAt fails with a TypeError — a fault of the caller, no cause the module file names
// input: productFacts(…, { scope: "work" })
// expect: it rejects with that TypeError; known positive first — the same call with an instanceAt that works resolves
test("productFacts, scope work — an error of instanceAt that is none of the four causes is not hidden", async () => {
  assert.ok(await work(fixture()));
  await assert.rejects(work(fixture({ instanceFailure: new TypeError("instanceAt was misused") })), { name: "TypeError" });
});

// TST-536011 · level: unit · module: MOD-progress-measures
// guards: UC-049
// given: the fixture product with no docs/process.md
// input: productFacts(…, { scope: "work" })
// expect: declaration null, model null, workflow null, modelUnread null; instanceAt is not asked; gateStates []; the four items' states as before
test("productFacts, scope work — a product with no declaration has none, and instanceAt is not asked", async () => {
  const files = productFiles();
  delete files["docs/process.md"];
  const f = fixture({ files });
  const facts = await work(f);
  assert.equal(facts.declaration, null);
  assert.equal(facts.model, null);
  assert.equal(facts.workflow, null);
  assert.equal(facts.modelUnread, null);
  assert.deepEqual(f.asked, []);
  assert.deepEqual(facts.gateStates, []);
  assert.deepEqual(facts.plan.states.map((s) => s.state), ["done", "in progress", "waiting for acceptance", "ready"]);
});

// TST-536012 · level: unit · module: MOD-progress-measures
// guards: UC-049
// given: the fixture product whose declaration names the model file docs/process-models/nothing.md, which the instance's catalogue at that commit does not hold
// input: productFacts(…, { scope: "work" })
// expect: the declaration is read; model null and workflow null; modelUnread null — the commit was read, it holds no such model
test("productFacts, scope work — a declared model the catalogue does not hold is null, not unknown", async () => {
  const files = productFiles();
  files["docs/process.md"] = DECLARATION("docs/process-models/nothing.md");
  const facts = await work(fixture({ files }));
  assert.equal(facts.declaration.fields.model_file, "docs/process-models/nothing.md");
  assert.equal(facts.model, null);
  assert.equal(facts.workflow, null);
  assert.equal(facts.modelUnread, null);
});

// ---------------------------------------------------------------- a host without server operations

// TST-536013 · level: unit · module: MOD-progress-measures
// guards: A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH; UC-049
// given: a host that does no server operations — repositoryInfo and listPullRequests fail with NotSupported — over the fixture product
// input: productFacts(…, { scope: "work" }), and the calls of the host
// expect: the snapshot is read at "HEAD", the branch the clone has checked out; pullRequests "unknown"; held is every selected item — ITM-001, ITM-002, ITM-004; plan.states ITM-001 and ITM-004 unknown (they need the pull requests), ITM-002 in progress (its job), ITM-003 waiting for acceptance; containsCommit is not asked
test("productFacts, scope work — a host that does no server operations gives unknown pull requests and holds every selected item", async () => {
  const f = fixture({ serverOperations: false });
  const facts = await work(f);
  assert.deepEqual(f.calls, [["repositoryInfo"], ["readSnapshot", "HEAD"], ["listPullRequests"]]);
  assert.equal(facts.pullRequests, "unknown");
  assert.deepEqual(facts.held.map((h) => h.item), ["ITM-001", "ITM-002", "ITM-004"]);
  assert.deepEqual(facts.plan.states.map((s) => [s.item, s.state]), [["ITM-001", "unknown"], ["ITM-002", "in progress"],
    ["ITM-003", "waiting for acceptance"], ["ITM-004", "unknown"]]);
});

// ---------------------------------------------------------------- the plan

// TST-536014 · level: unit · module: MOD-progress-measures
// guards: UC-032; STATUS IS DERIVED FROM THE RECORDS
// given: a product that keeps an implementation plan — docs/plan/order.md listing ITM-011 then ITM-010, both in the phase Development, and the step files docs/plan/ITM-010-… and ITM-011-… — and no file under docs/backlog/ITM-*
// input: productFacts(…, { scope: "work" }).plan
// expect: order is docs/plan/order.md; items ITM-010 and ITM-011; states in the plan's order, ITM-011 then ITM-010, both ready
test("productFacts, scope work — a product with a plan has its steps and order; the states follow the order", async () => {
  const files = productFiles();
  for (const path of Object.keys(files)) if (/^docs\/backlog\/ITM-/.test(path)) delete files[path];
  files["docs/backlog/sprints/team1/01.md"] = sprintRecord(["ITM-010"]);
  files["docs/plan/ITM-010-store.md"] = item("ITM-010", { realises: ["UC-001"], modules: ["MOD-store"] });
  files["docs/plan/ITM-011-pages.md"] = item("ITM-011", { realises: ["UC-001"], modules: ["MOD-pages"] });
  files["docs/plan/order.md"] = ["# Order of the plan", "", "## Order", "", "| Step | Phase |", "|---|---|", "| ITM-011 | Development |",
    "| ITM-010 | Development |", ""].join("\n");
  const { plan } = await work(fixture({ files, pullRequests: [] }));
  assert.equal(plan.order.path, "docs/plan/order.md");
  assert.deepEqual(plan.items.map((i) => i.id), ["ITM-010", "ITM-011"]);
  assert.deepEqual(plan.states.map((s) => [s.item, s.state]), [["ITM-011", "ready"], ["ITM-010", "ready"]]);
});

// ---------------------------------------------------------------- the scope all

// TST-536015 · level: unit · module: MOD-progress-measures
// guards: UC-049
// given: the fixture product; known positive first — the scope work resolves
// input: productFacts(…) with the scope "all", and with no options (the default, "all")
// expect: both reject with an error whose message names the scope all as not built; the host is not called
test("productFacts — the scope all is not built and is refused before the host is called", async () => {
  assert.ok(await work(fixture()));
  for (const options of [{ scope: "all" }, undefined]) {
    const f = fixture();
    await assert.rejects(productFacts(f.host, f.instance, f.instanceAt, NOW, {}, options), /scope "all".*not built/);
    assert.deepEqual(f.calls, []);
  }
});
