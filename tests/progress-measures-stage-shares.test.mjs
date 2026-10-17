// The six stages of a product's progress — MOD-progress-measures' stageShares, as the accepted text of
// docs/architecture/MOD-progress-measures.md states it: "the six stages of the table above, in their order; a stage whose share needs
// an unknown fact has none, and its detail says which". Each stage's share is the table's: Requirements "the share of the product's
// SPEC change entries that are decided; full when the SPEC holds requirements and no change is open"; Use cases "the share of the use
// cases that are accepted"; Architecture "the share of the architecture's files — decisions and module files — that are accepted";
// Implementation "the share of the steps of the implementation plan, or of the backlog items, that are done; without a declared
// process model, no share, and the stage says that the process is configured when implementation starts"; Tests "the share of the
// requirements that a passing test guards on the default branch; a test passes by the newest result record of a commit of the default
// branch that ran it"; Release "full once the product's first release is tagged". Of the module, this is stageShares alone.
// Run: node --test tests/progress-measures-stage-shares.test.mjs
//
// Module: MOD-progress-measures
// Guards: UC-046; THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The facts are held in memory, in the
// form of MOD-progress-measures' Facts (tests/progress-measures-facts.mjs); nothing is read from a document. `fetch` is replaced by
// a spy for every test and must not have been called when the test ends. stageShares is async here, as MOD-result-records'
// resultsAt, which it reads the branch test-results with, is (tests/result-records-outcomes.test.mjs). The counter-proofs are
// recorded in the pull request.

import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { stageShares } from "../src/progress-measures/index.mjs";
import { COMMIT, facts, graphOf, itemState, queueOf, resultsSnapshot, runRecord, statusMap } from "./progress-measures-facts.mjs";

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

const of = async (over, name) => (await stageShares(facts(over))).find((s) => s.stage === name);
const uc = (n, status) => [`docs/use-cases/UC-00${n}-x.md`, `UC-00${n}`, "use-case", status];
const arc = (n, kind, status) => [`docs/architecture/${kind === "module" ? "MOD" : "ARC"}-x${n}.md`, `${kind === "module" ? "MOD" : "ARC"}-x${n}`, kind, status];

// TST-685001 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; UC-046
// given: facts of a product with no file at all
// input: stageShares(facts)
// expect: exactly six entries, whose stage names are, in this order, Requirements, Use cases, Architecture, Implementation, Tests, Release; each has a share (a number between 0 and 1, or null) and a detail text
test("stageShares — the six stages in their order, each with a share and a detail", async () => {
  const shares = await stageShares(facts());
  assert.deepEqual(shares.map((s) => s.stage), ["Requirements", "Use cases", "Architecture", "Implementation", "Tests", "Release"]);
  for (const s of shares) {
    assert.ok(s.share === null || (s.share >= 0 && s.share <= 1), s.stage);
    assert.equal(typeof s.detail, "string", s.stage);
  }
});

// TST-685002 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; STATUS IS DERIVED FROM THE RECORDS; UC-046
// given: four use cases, three accepted and one open; (b) all four accepted; (c) one accepted and one changed since its acceptance; (d) none; (e) a use case beside an accepted architecture decision, which is no use case
// input: stageShares of each
// expect: (a) Use cases 0.75, "3 of 4 accepted"; (b) 1, "4 of 4 accepted"; (c) 0.5, "1 of 2 accepted"; (d) 0, "no use case yet"; (e) 0, "0 of 1 accepted"
test("stageShares — the use-case stage is the share of the use cases that are accepted", async () => {
  const four = (last) => statusMap([uc(1, "accepted"), uc(2, "accepted"), uc(3, "accepted"), uc(4, last)]);
  assert.deepEqual(await of({ statuses: four("open") }, "Use cases"), { stage: "Use cases", share: 0.75, detail: "3 of 4 accepted" });
  assert.deepEqual(await of({ statuses: four("accepted") }, "Use cases"), { stage: "Use cases", share: 1, detail: "4 of 4 accepted" });
  assert.deepEqual(await of({ statuses: statusMap([uc(1, "accepted"), uc(2, "changed")]) }, "Use cases"),
    { stage: "Use cases", share: 0.5, detail: "1 of 2 accepted" });
  assert.deepEqual(await of({}, "Use cases"), { stage: "Use cases", share: 0, detail: "no use case yet" });
  assert.deepEqual(await of({ statuses: statusMap([uc(1, "open"), arc(1, "architecture-decision", "accepted")]) }, "Use cases"),
    { stage: "Use cases", share: 0, detail: "0 of 1 accepted" });
});

// TST-685003 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; STATUS IS DERIVED FROM THE RECORDS; UC-046
// given: two architecture decisions and two module files, of which one decision and one module are accepted, one module open and one decision changed; (b) none; (c) an accepted use case only
// input: stageShares of each
// expect: (a) Architecture 0.5, "2 of 4 files accepted"; (b) 0, "not designed yet"; (c) 0, "not designed yet"
test("stageShares — the architecture stage is the share of its decisions and module files that are accepted", async () => {
  const files = statusMap([arc(1, "architecture-decision", "accepted"), arc(2, "architecture-decision", "changed"),
    arc(3, "module", "accepted"), arc(4, "module", "open")]);
  assert.deepEqual(await of({ statuses: files }, "Architecture"), { stage: "Architecture", share: 0.5, detail: "2 of 4 files accepted" });
  assert.deepEqual(await of({}, "Architecture"), { stage: "Architecture", share: 0, detail: "not designed yet" });
  assert.deepEqual(await of({ statuses: statusMap([uc(1, "accepted")]) }, "Architecture"), { stage: "Architecture", share: 0, detail: "not designed yet" });
});

// TST-685004 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; STATUS IS DERIVED FROM THE RECORDS; UC-046
// given: (a) a queue of four entries — one in SPEC, one approved, one open, one stale — beside two requirements; (b) a queue whose entries are all in SPEC or approved, beside two requirements; (c) no queue and no requirement; (d) no queue, requirements not read; (e) one open entry, requirements not read; (f) a queue of one entry waiting for its anchor and one in SPEC
// input: stageShares of each
// expect: (a) Requirements 0.5, "2 changes open"; (b) 1, "2 requirements, no change open"; (c) 0, "no requirement yet"; (d) no share (null), "the requirements are unknown"; (e) 0, "1 change open"; (f) 0.5, "1 change open"
test("stageShares — the requirements stage is the share of the SPEC change entries that are decided, full when none is open", async () => {
  const mixed = [queueOf("docs/spec-freigaben/2026-10-01_a", [[1, "in SPEC"], [2, "approved"], [3, "open"], [4, "stale"]])];
  assert.deepEqual(await of({ queues: mixed, requirements: ["A", "B"] }, "Requirements"), { stage: "Requirements", share: 0.5, detail: "2 changes open" });
  const decided = [queueOf("docs/spec-freigaben/2026-10-01_a", [[1, "in SPEC"], [2, "approved"]])];
  assert.deepEqual(await of({ queues: decided, requirements: ["A", "B"] }, "Requirements"),
    { stage: "Requirements", share: 1, detail: "2 requirements, no change open" });
  assert.deepEqual(await of({ requirements: [] }, "Requirements"), { stage: "Requirements", share: 0, detail: "no requirement yet" });
  assert.deepEqual(await of({}, "Requirements"), { stage: "Requirements", share: null, detail: "the requirements are unknown" });
  const one = [queueOf("docs/spec-freigaben/2026-10-01_a", [[1, "open"]])];
  assert.deepEqual(await of({ queues: one }, "Requirements"), { stage: "Requirements", share: 0, detail: "1 change open" });
  const anchor = [queueOf("docs/spec-freigaben/2026-10-01_a", [[1, "waiting for its anchor"], [2, "in SPEC"]])];
  assert.deepEqual(await of({ queues: anchor, requirements: ["A"] }, "Requirements"), { stage: "Requirements", share: 0.5, detail: "1 change open" });
});

// TST-685005 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; UC-046; UC-032; UC-045
// given: (a) no declared model, with a backlog of two items; (b) a declared model with four backlog items of which three are done; (c) a declared model with an implementation plan (an order) of two steps of which one is done; (d) a declared model with no item; (e) a declared model with one item whose state is unknown; (f) a model that could not be read
// input: stageShares of each
// expect: (a) Implementation: no share (null), "the process is configured when implementation starts"; (b) 0.75, "3 of 4 items done"; (c) 0.5, "1 of 2 steps done"; (d) 0, "not planned yet"; (e) null, "the pull requests are unknown"; (f) null, "the declared model is unknown"
test("stageShares — the implementation stage is the share of the steps or items that are done, and needs a declared model", async () => {
  const model = { name: "scrum", kind: "pulled", measure: "remaining items per time box" };
  const item = (id, dir = "backlog") => ({ path: `docs/${dir}/${id}-x.md`, id });
  const states = (...done) => done.map((d, i) => itemState(`ITM-00${i + 1}`, d));
  const backlog = { order: null, items: [item("ITM-001"), item("ITM-002")], states: states("ready", "ready") };
  assert.deepEqual(await of({ plan: backlog }, "Implementation"),
    { stage: "Implementation", share: null, detail: "the process is configured when implementation starts" });
  const four = { order: null, items: [item("ITM-001")], states: states("done", "done", "done", "in progress") };
  assert.deepEqual(await of({ model, plan: four }, "Implementation"), { stage: "Implementation", share: 0.75, detail: "3 of 4 items done" });
  const steps = { order: { path: "docs/plan/order.md" }, items: [item("ITM-001", "plan"), item("ITM-002", "plan")], states: states("done", "ready") };
  assert.deepEqual(await of({ model, plan: steps }, "Implementation"), { stage: "Implementation", share: 0.5, detail: "1 of 2 steps done" });
  assert.deepEqual(await of({ model }, "Implementation"), { stage: "Implementation", share: 0, detail: "not planned yet" });
  const unknown = { order: null, items: [item("ITM-001")], states: states("unknown") };
  assert.deepEqual(await of({ model, plan: unknown }, "Implementation"), { stage: "Implementation", share: null, detail: "the pull requests are unknown" });
  assert.deepEqual(await of({ model: "unknown", plan: four }, "Implementation"),
    { stage: "Implementation", share: null, detail: "the declared model is unknown" });
});

// TST-685006 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; A RELEASE IS TAGGED AND LOGGED; UC-046
// given: (a) no tag; (b) the tag v2026.4.0; (c) only a release candidate's tag, v2026.4.0-rc.1, and a tag that is no version; (d) the tags v2026.4.0 and v2026.5.1; (e) tags not read
// input: stageShares of each
// expect: (a) Release 0, "no release yet"; (b) 1, "v2026.4.0 tagged"; (c) 0, "no release yet"; (d) 1, "2 releases tagged"; (e) null, "the tags are unknown"
test("stageShares — the release stage is full once a release is tagged; a candidate's tag is no release", async () => {
  const tag = (name) => ({ name, commit: "a".repeat(40) });
  assert.deepEqual(await of({ tags: [] }, "Release"), { stage: "Release", share: 0, detail: "no release yet" });
  assert.deepEqual(await of({ tags: [tag("v2026.4.0")] }, "Release"), { stage: "Release", share: 1, detail: "v2026.4.0 tagged" });
  assert.deepEqual(await of({ tags: [tag("v2026.4.0-rc.1"), tag("latest")] }, "Release"), { stage: "Release", share: 0, detail: "no release yet" });
  assert.deepEqual(await of({ tags: [tag("v2026.4.0"), tag("v2026.5.1")] }, "Release"), { stage: "Release", share: 1, detail: "2 releases tagged" });
  assert.deepEqual(await of({ tags: "unknown" }, "Release"), { stage: "Release", share: null, detail: "the tags are unknown" });
});

// ---------------------------------------------------------------- tests

const REQS = ["REQ A", "REQ B", "REQ C"];
const decl = (id, level = "unit") => ({ id, level, module: "MOD-x", guards: [] });
const guarded = (outcomes) => {
  // TST-1 guards REQ A, TST-2 guards REQ B, TST-3 guards REQ A too; REQ C is guarded by no test.
  const rows = Object.entries(outcomes).map(([test, outcome]) => [test, "unit", outcome]);
  return {
    requirements: REQS, graph: graphOf(REQS, [["TST-1", "REQ A"], ["TST-2", "REQ B"], ["TST-3", "REQ A"]]),
    tests: [decl("TST-1"), decl("TST-2"), decl("TST-3")],
    results: resultsSnapshot({ [`runs/${COMMIT}/20261016-1000-commit-aaaa.md`]: runRecord(COMMIT, rows) }),
  };
};

// TST-685007 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; UC-046
// given: three requirements; TST-1 and TST-3 guard REQ A, TST-2 guards REQ B, none guards REQ C; the records of the default branch's commit say TST-1 failed, TST-3 passed, TST-2 passed
// input: stageShares(facts)
// expect: Tests 0.6666…, "2 of 3 requirements guarded by a passing test" — REQ A counts through TST-3 though TST-1 failed, REQ B through TST-2, REQ C is guarded by nothing
test("stageShares — the tests stage is the share of the requirements that a passing test guards", async () => {
  const shares = await of(guarded({ "TST-1": "failed", "TST-3": "passed", "TST-2": "passed" }), "Tests");
  assert.equal(shares.share, 2 / 3);
  assert.equal(shares.detail, "2 of 3 requirements guarded by a passing test");
});

// TST-685008 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY; UC-046
// given: the same three requirements; the records say TST-1 passed in one run and failed in another run of the same commit (flaky), TST-3 failed, TST-2 not recorded at all
// input: stageShares(facts)
// expect: Tests 0, "0 of 3 requirements guarded by a passing test" — a flaky test is never a passing one, a test with no record has not passed
test("stageShares — a flaky test and a test with no record do not pass", async () => {
  const f = guarded({ "TST-3": "failed" });
  const other = `runs/${COMMIT}/20261016-1100-pull-request-bbbb.md`;
  const texts = { [f.results.paths[0]]: runRecord(COMMIT, [["TST-1", "unit", "passed"], ["TST-3", "unit", "failed"]]),
    [other]: runRecord(COMMIT, [["TST-1", "unit", "failed"]]) };
  const shares = await of({ ...f, results: resultsSnapshot(texts) }, "Tests");
  assert.equal(shares.share, 0);
  assert.equal(shares.detail, "0 of 3 requirements guarded by a passing test");
});

// TST-685009 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; UC-046
// given: (a) three requirements and a trace graph in which no test guards any; (b) no requirement; (c) tests guarding requirements but no branch test-results yet (null); (d) the requirements not read; (e) the trace graph not read; (f) the test declarations not read; (g) the branch test-results not read; (h) a repository with no commit yet (the snapshot's commit null)
// input: stageShares of each
// expect: (a) Tests 0, "no requirement guarded by a test yet"; (b) 0, "no requirement yet"; (c) 0, "no test result recorded yet"; (d) null, "the requirements are unknown"; (e) null, "the trace graph is unknown"; (f) null, "the test declarations are unknown"; (g) null, "the test results are unknown"; (h) 0, "no test result recorded yet"
test("stageShares — the tests stage names the unknown fact it cannot be told from, and is 0 where nothing is guarded or recorded", async () => {
  const base = guarded({ "TST-1": "passed" });
  const row = async (over) => ({ ...(await of({ ...base, ...over }, "Tests")) });
  assert.deepEqual(await row({ graph: graphOf(REQS, []) }), { stage: "Tests", share: 0, detail: "no requirement guarded by a test yet" });
  assert.deepEqual(await row({ requirements: [] }), { stage: "Tests", share: 0, detail: "no requirement yet" });
  assert.deepEqual(await row({ results: null }), { stage: "Tests", share: 0, detail: "no test result recorded yet" });
  assert.deepEqual(await row({ requirements: "unknown" }), { stage: "Tests", share: null, detail: "the requirements are unknown" });
  assert.deepEqual(await row({ graph: "unknown" }), { stage: "Tests", share: null, detail: "the trace graph is unknown" });
  assert.deepEqual(await row({ tests: "unknown" }), { stage: "Tests", share: null, detail: "the test declarations are unknown" });
  assert.deepEqual(await row({ results: "unknown" }), { stage: "Tests", share: null, detail: "the test results are unknown" });
  const noCommit = { commit: null, paths: [], blob: () => null, read: async () => null };
  assert.deepEqual(await row({ snapshot: noCommit }), { stage: "Tests", share: 0, detail: "no test result recorded yet" });
});
