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
import { currentStage, stageShares } from "../src/progress-measures/index.mjs";
import { facts, itemState, queueOf, resultsSnapshot, runRecord, statusMap } from "./progress-measures-facts.mjs";

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
const decl = (id, ...guards) => ({ id, level: "unit", module: "MOD-x", guards });
const C1 = "1".repeat(40), C2 = "2".repeat(40), OTHER = "9".repeat(40);
const record = (commit, rows, name = "20261016-1000-commit-aaaa") => ({ [`runs/${commit}/${name}.md`]: runRecord(commit, rows) });
const pass = (...ids) => ids.map((id) => [id, "unit", "passed"]);
const fail = (...ids) => ids.map((id) => [id, "unit", "failed"]);
const guarded = (n) => ({ stage: "Tests", share: n / 3, detail: `${n} of 3 requirements guarded by a passing test` });
// Three requirements: TST-1 and TST-3 guard REQ A, TST-2 guards REQ B, and nothing guards REQ C.
const known = (texts, resultCommits, over = {}) => ({ requirements: REQS, resultCommits, results: resultsSnapshot(texts),
  tests: [decl("TST-1", "REQ A"), decl("TST-2", "REQ B"), decl("TST-3", "REQ A")], ...over });

// TST-809001 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT’S PROGRESS BY STAGE; UC-046
// given: three requirements, TST-1 and TST-3 guarding REQ A and TST-2 guarding REQ B, and resultCommits [C2, C1] (C2 newer). (a) C1 holds a record in which TST-1, TST-2 and TST-3 passed, C2 one in which TST-1 failed; (b) the same, and C2’s record also fails TST-3; (c) C2 holds a record in which TST-1 passed and C1 one in which it failed, and TST-1 is the only test; (d) the records stand at a commit OTHER that is not in resultCommits, and C1 holds none
// input: stageShares(facts)
// expect: (a) Tests 2/3, "2 of 3 requirements guarded by a passing test": TST-1 fails by C2’s record, the newest that ran it, but TST-3 (not named at C2) passes by C1’s and guards REQ A, and TST-2 passes by C1’s and guards REQ B; (b) 1/3: REQ B alone; (c) 1/3: TST-1 passes by C2’s record, the older failure is not looked at; (d) 0 of 3: a commit that is not one of resultCommits counts for nothing
test("stageShares — the tests stage is the share of the requirements a passing test guards; a test passes by the newest record of a commit of the default branch that ran it", async () => {
  const older = record(C1, pass("TST-1", "TST-2", "TST-3"));
  assert.deepEqual(await of(known({ ...older, ...record(C2, fail("TST-1")) }, [C2, C1]), "Tests"), guarded(2));
  assert.deepEqual(await of(known({ ...older, ...record(C2, fail("TST-1", "TST-3")) }, [C2, C1]), "Tests"), guarded(1));
  const only = { tests: [decl("TST-1", "REQ A")] };
  assert.deepEqual(await of(known({ ...record(C2, pass("TST-1")), ...record(C1, fail("TST-1")) }, [C2, C1], only), "Tests"), guarded(1));
  assert.deepEqual(await of(known(record(OTHER, pass("TST-1", "TST-2", "TST-3")), [C1]), "Tests"), guarded(0));
});

// TST-809002 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT’S PROGRESS BY STAGE; UC-046
// given: the requirements of TST-809001 and resultCommits [C1]; (a) C1 holds a record in which TST-1 both passed and failed (a deterministic test that flips on one commit is flaky); (b) TST-1 is declared and has no record at all; (c) C1’s record reports TST-1 as not run
// input: stageShares(facts)
// expect: Tests 0 of 3 in each case — only an outcome passed is a pass
test("stageShares — a flaky, an unrun and a not-run test does not pass", async () => {
  const only = { tests: [decl("TST-1", "REQ A")] };
  assert.deepEqual(await of(known(record(C1, [...pass("TST-1"), ...fail("TST-1")]), [C1], only), "Tests"), guarded(0));
  assert.deepEqual(await of(known(record(C1, pass("TST-2")), [C1], only), "Tests"), guarded(0));
  assert.deepEqual(await of(known(record(C1, [["TST-1", "unit", "not run"]]), [C1], only), "Tests"), guarded(0));
});

// TST-809003 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT’S PROGRESS BY STAGE; UC-046
// given: the requirements and tests of TST-809001; (a) resultCommits [C2, C1], C2 holds a record in which all three tests passed, C1 one in which they failed; (b) no branch test-results (results null) and resultCommits []; (c) the requirements are []; (d) TST-1 guards REQ A and TST-2 guards REQ B and REQ C, with the records of (a)
// input: stageShares(facts), counting the reads of the branch test-results
// expect: (a) Tests 2 of 3 (REQ C has no test), and only C2’s record is read — it settles every test; (b) 0 of 3; (c) 0, "no requirement yet"; (d) 3 of 3, "3 of 3 requirements guarded by a passing test"
test("stageShares — it asks no older commit once every test is settled, and counts a branch without results as nothing passed", async () => {
  const texts = { ...record(C2, pass("TST-1", "TST-2", "TST-3")), ...record(C1, fail("TST-1", "TST-2", "TST-3")) };
  const a = known(texts, [C2, C1]);
  assert.deepEqual(await of(a, "Tests"), guarded(2));
  assert.deepEqual(a.results.reads, [`runs/${C2}/20261016-1000-commit-aaaa.md`]);
  assert.deepEqual(await of(known({}, [], { results: null }), "Tests"), guarded(0));
  assert.deepEqual(await of(known(texts, [C2, C1], { requirements: [] }), "Tests"), { stage: "Tests", share: 0, detail: "no requirement yet" });
  const all = { requirements: ["REQ A", "REQ B", "REQ C"], tests: [decl("TST-1", "REQ A"), decl("TST-2", "REQ B", "REQ C")] };
  assert.deepEqual(await of(known(texts, [C2, C1], all), "Tests"), guarded(3));
});

// TST-809004 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT’S PROGRESS BY STAGE; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-046
// given: a product that is fully known, with passing records at C1; then (a) resultCommits "unknown"; (b) results "unknown"; (c) requirements "unknown"; (d) tests "unknown"; (e) the facts of a product with nothing read
// input: stageShares of each
// expect: Tests has no share (null) in each, whose detail names the missing fact: (a) "the commits of the default branch are unknown"; (b) "the test results are unknown"; (c) "the requirements are unknown"; (d) "the tests are unknown"; (e) "the requirements are unknown"; with the fully known product Tests has a share
test("stageShares — the tests stage has no share while a fact it needs is unknown, and its detail says which", async () => {
  const texts = record(C1, pass("TST-1", "TST-2", "TST-3"));
  assert.equal((await of(known(texts, [C1]), "Tests")).share, 2 / 3);
  const none = (what) => ({ stage: "Tests", share: null, detail: `the ${what} unknown` });
  assert.deepEqual(await of(known(texts, "unknown"), "Tests"), none("commits of the default branch are"));
  assert.deepEqual(await of(known(texts, [C1], { results: "unknown" }), "Tests"), none("test results are"));
  assert.deepEqual(await of(known(texts, [C1], { requirements: "unknown" }), "Tests"), none("requirements are"));
  assert.deepEqual(await of(known(texts, [C1], { tests: "unknown" }), "Tests"), none("tests are"));
  assert.deepEqual(await of({}, "Tests"), none("requirements are"));
});

// ---------------------------------------------------------------- the instance’s own bar

const RELEASE = { tags: [{ name: "v2026.1.0", commit: C1 }] };
const shares = async (over) => (await stageShares(facts(over))).map(({ stage, share }) => [stage, share]);
const ALL_FULL = ["Requirements", "Use cases", "Architecture", "Implementation", "Tests", "Release"].map((stage) => [stage, 1]);

// TST-809005 · level: unit · module: MOD-progress-measures
// guards: WITHOUT A PRODUCT, THE MAIN PAGE SHOWS AGENT M’S OWN PROGRESS; UC-046
// given: a repository that is the instance’s own (own true) with nothing accepted and no requirement; (a) its first release tagged; (b) no tag; (c) only a release candidate tagged (v2026.1.0-rc.1); (d) tags unknown; and, as the counter-proof, (e) a product (own false) with the same facts and its release tagged
// input: stageShares of each
// expect: (a) all six stages 1 — the bar is full once the first release is tagged; (b) the stages as for a product: Use cases 0 and Release 0; (c) the same, Release 0; (d) Release null, and no other stage is made full; (e) Release 1 and the other stages as the facts give them, Use cases 0
test("stageShares — for the instance’s own repository the bar is full once its first release is tagged", async () => {
  assert.deepEqual(await shares({ own: true, ...RELEASE }), ALL_FULL);
  assert.deepEqual((await shares({ own: true, tags: [] })).filter(([stage]) => stage === "Use cases" || stage === "Release"), [["Use cases", 0], ["Release", 0]]);
  assert.deepEqual((await shares({ own: true, tags: [{ name: "v2026.1.0-rc.1", commit: C1 }] })).at(-1), ["Release", 0]);
  const unknown = await shares({ own: true, tags: "unknown" });
  assert.deepEqual([unknown.at(-1), unknown[1]], [["Release", null], ["Use cases", 0]]);
  const product = await shares({ own: false, ...RELEASE });
  assert.deepEqual([product[1], product.at(-1)], [["Use cases", 0], ["Release", 1]]);
});

// TST-809006 · level: unit · module: MOD-progress-measures
// guards: WITHOUT A PRODUCT, THE MAIN PAGE SHOWS AGENT M’S OWN PROGRESS; UC-046
// given: the instance’s own repository with its first release tagged
// input: currentStage of stageShares(facts); and of a product with the same tags
// expect: null — every stage is full; the product’s current stage is Requirements, the first stage that is not full
test("currentStage — the instance’s own repository, once released, is in no stage", async () => {
  assert.equal(currentStage(await stageShares(facts({ own: true, ...RELEASE }))), null);
  assert.equal(currentStage(await stageShares(facts({ own: false, ...RELEASE }))), "Requirements");
});
