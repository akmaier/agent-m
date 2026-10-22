// MOD-progress-measures' productFacts with the scope `all` reads the rest of Facts (ITM-843), as the accepted text of
// docs/architecture/MOD-progress-measures.md states it: "`modelSince` is the date the declared model was declared"; "`schedule` the product's test
// schedule, or the book's default where none is saved; `ci.runs` the runs of the default branch's head; `ci.configured` whether the configuration Agent M
// generates from the schedule is present, `ci.drift` how it differs from the schedule, `ci.jobWorkflow` whether the job workflow of MOD-runtimes is present;
// … `resourceNeeds` the routes that reach the product's resources, `reachableBy` of MOD-resource-list over its `docs/resources.md`"; "With the scope `all`,
// the default, it reads everything once: … the history of the declaration, … the CI runs of the head, … and the resource list"; and "It asks no job's live
// state: the rows of `jobs` give the state of the record". `ci.drift` is MOD-test-schedule's `configurationDrift`.
// Readings these tests state, where the text leaves one open:
//   - `modelSince` is the date of the oldest commit of the declaration's history in the unbroken run, newest first, of commits whose declaration names the model
//     (`model`) that the current one names; null where the product declares none; "unknown" where the host cannot give the history.
//   - `ci.runs` are the runs of the default branch at the commit of its head (the filter { branch, commit } of listCiRuns).
//   - `ci.configured` is whether the file MOD-test-schedule generates (.github/workflows/agent-m-tests.yml on GitHub) is in the default branch.
//   - `ci.jobWorkflow` is whether the job workflow (.github/workflows/agent-m-jobs.yml on GitHub) is in the default branch.
//   - `ci` is "unknown" where the schedule has an error finding (configurationDrift throws InvalidSchedule): no configuration is generated from it.
//   - A product without docs/resources.md has the resourceNeeds [].
// The counts are taken through the real MOD-repository-hosts host over the counting fake of GitHub (tests/progress-measures-load.mjs).
// Run: node --test tests/progress-measures-all-facts.test.mjs
//
// Module: MOD-progress-measures
// Guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; A PAGE LOAD READS THE REPOSITORY IN BATCHES; UC-046
// Level: unit
//
// Each test states its input and its expected values in its own text (given / input / expect); no expected value is read from a
// document. Nothing reaches the network: `fetch` is the fake for every test and is put back when the test ends. The counter-proofs
// are recorded in the pull request.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { productFacts } from "../src/progress-measures/index.mjs";
import { readDocument } from "../src/documents/index.mjs";
import { participantSchema } from "../src/participant-list/index.mjs";
import { resourceSchema } from "../src/resource-list/index.mjs";
import { ciConfiguration, defaultSchedule } from "../src/test-schedule/index.mjs";
import { INSTANCE, PRODUCT, githubServer, hosts, instanceFiles, productFiles, summary } from "./progress-measures-load.mjs";

const NOW = new Date("2026-10-23T12:00:00Z");
const sha = (text) => createHash("sha1").update(text).digest("hex");
const HEAD = sha(PRODUCT), INSTANCE_HEAD = sha(INSTANCE);
const TESTS_FILE = ".github/workflows/agent-m-tests.yml", JOBS_FILE = ".github/workflows/agent-m-jobs.yml";
const SCHEDULE_FILE = "docs/tests/schedule.md", RESOURCES_FILE = "docs/resources.md", DECLARATION_FILE = "docs/process.md";

let server;
afterEach(() => server?.restore());

/** The facts of a product made of productFiles({ items: 2, jobs: 1 }) and `more`, read with `scope`; `served` is the fake's second argument. */
async function facts(more, { scope = "all", token = true, served = {} } = {}) {
  server = githubServer({ [PRODUCT]: { ...productFiles({ items: 2, jobs: 1 }), ...more }, [INSTANCE]: instanceFiles() }, served);
  server.install();
  const { host, instance, instanceAt } = await hosts(server, { token });
  const result = await productFacts(host, instance, instanceAt, NOW, { scope });
  return { result, seen: summary(server.log), log: server.log };
}

// The configuration Agent M generates from the book's default schedule for the instance alice/agent-m at its head, on GitHub: what a product's agent-m-tests.yml holds when it agrees.
const GENERATED = ciConfiguration(defaultSchedule(), { server: "github", instance: INSTANCE, instanceCommit: INSTANCE_HEAD },
  readDocument(resourceSchema(), RESOURCES_FILE, ""), readDocument(participantSchema(), "docs/participants.md", instanceFiles()["docs/participants.md"])).files[TESTS_FILE];

const SCHEDULE = (nightly, paidEveryCommit = false) => ["---", `nightly: ${nightly}`, "---", "## Levels", "",
  "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |", "|---|---|---|---|---|---|---|",
  "| unit | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| component | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| system | ✓ | ✓ | ✓ | ✓ | ✓ | |",
  `| paid | ${paidEveryCommit ? "✓" : ""} | | ✓ | ✓ | ✓ | |`, "| release | | | | ✓ | ✓ | |", "| user | | | | ✓ | ✓ | |", ""].join("\n");

const RESOURCES = ["# Resources of this product", "", "**REGISTER**", "", "The resources.", "",
  "| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |", "|---|---|---|---|---|---|---|---|---|---|",
  "| gpu-box | compute | gpu01.example.org | — | — | — | bridge lab-pc | this machine | — | — |",
  "| cluster | compute | cluster.example.org | — | — | — | runner:gpu | NHR@FAU, Erlangen | — | — |",
  "| llm | endpoint | http://gpu01:8000/v1/ | example-model | — | — | https://llm.example.org | the group's server | no | — |",
  "| tools | repository | https://github.com/acme/tools | 0123456789abcdef0123456789abcdef01234567 | MIT | Acme | read on its host | — | — | — |", ""].join("\n");

const declaration = (model) => ["---", `model: ${model}`, `model_file: docs/process-models/${model}.md`, `model_version: ${"5".repeat(40)}`, "---", "# Process", ""].join("\n");

// TST-843001 · level: unit · module: MOD-progress-measures
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-046
// given: a product with no docs/tests/schedule.md; and one that saves docs/tests/schedule.md with the nightly time 03:30; a token
// input: productFacts(…, { scope: "all" }).schedule of each
// expect: the first gives the book's default, marked as the default (default true, nightly "02:00"); the second gives its own schedule (nightly "03:30"), not marked as the default; the saved file is read in a batch, not by a request of its own
test("productFacts, scope all — the schedule is the product's saved one, or the book's default where none is saved", async () => {
  const none = await facts({});
  assert.deepEqual([none.result.schedule.default, none.result.schedule.fields.nightly], [true, "02:00"]);
  const saved = await facts({ [SCHEDULE_FILE]: SCHEDULE("03:30") });
  assert.deepEqual([saved.result.schedule.default, saved.result.schedule.fields.nightly], [undefined, "03:30"]);
  assert.equal(saved.seen.allFiles.filter((path) => path === SCHEDULE_FILE).length, 1);
  assert.equal(saved.seen.singles.includes(SCHEDULE_FILE), false, "the saved schedule is read in a batch");
});

// TST-843002 · level: unit · module: MOD-progress-measures
// guards: A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE; UC-046
// given: a product whose docs/resources.md lists a compute resource on the route `bridge lab-pc`, one on the route `runner:gpu`, an endpoint at its own address and a repository read on its host; and a product with no docs/resources.md
// input: productFacts(…, { scope: "all" }).resourceNeeds of each
// expect: the first gives [{ resource: "gpu-box", route: "bridge lab-pc" }, { resource: "cluster", route: "runner:gpu" }] in the list's order, none for the endpoint and the repository; the second gives []
test("productFacts, scope all — resourceNeeds are the routes that reach the product's resources", async () => {
  const listed = await facts({ [RESOURCES_FILE]: RESOURCES });
  assert.deepEqual(listed.result.resourceNeeds, [{ resource: "gpu-box", route: "bridge lab-pc" }, { resource: "cluster", route: "runner:gpu" }]);
  assert.deepEqual((await facts({})).result.resourceNeeds, []);
});

const run = (id, branch, commit, conclusion) => ({ id, path: ".github/workflows/tests.yml", head_sha: commit, head_branch: branch, event: "push", status: "completed", conclusion,
  html_url: `https://github.com/alice/product/actions/runs/${id}`, run_started_at: "2026-10-23T10:00:00Z", updated_at: "2026-10-23T10:01:00Z" });

// TST-843003 · level: unit · module: MOD-progress-measures
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-046
// given: a product whose server lists three runs: 11 on main at the head (failed), 12 on the branch feature at the head (passed), and 13 on main at an earlier commit (passed); a token
// input: productFacts(…, { scope: "all" }).ci.runs
// expect: only run 11, as a CI run of the commit HEAD in the state failure; the server was asked once for the repository's runs, and for no single run
test("productFacts, scope all — ci.runs are the runs of the default branch's head", async () => {
  const runs = [run(11, "main", HEAD, "failure"), run(12, "feature", HEAD, "success"), run(13, "main", "e".repeat(40), "success")];
  const { result, seen, log } = await facts({}, { served: { runs } });
  assert.deepEqual(result.ci.runs.map((each) => [each.id, each.commit, each.state, each.workflow]), [["11", HEAD, "failure", "tests.yml"]]);
  assert.equal(seen.kinds["ci runs"], 1);
  assert.deepEqual(log.filter((entry) => entry.kind === "ci runs").map((entry) => entry.what), ["GET /repos/alice/product/actions/runs"]);
});

// TST-843004 · level: unit · module: MOD-progress-measures
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027; UC-046
// given: a product on GitHub with the book's default schedule and, as .github/workflows/agent-m-tests.yml, (a) the configuration Agent M generates for the instance alice/agent-m at its head, (b) the same with its first line changed to `name: other`, (c) none; (d) the file of (a) and a workflow .github/workflows/tests.yml that Agent M did not generate
// input: productFacts(…, { scope: "all" }).ci
// expect: (a) configured true and no drift; (b) configured true and one difference, at the path of the file, that names line 1 — found `name: other` — and what the schedule generates; (c) configured false and the one difference "the file is missing; the schedule generates it"; (d) configured true and one difference, at .github/workflows/tests.yml, that begins "not generated by Agent M; triggers: "
test("productFacts, scope all — ci.configured and ci.drift tell how the committed configuration differs from the schedule", async () => {
  const a = (await facts({ [TESTS_FILE]: GENERATED })).result.ci;
  assert.deepEqual([a.configured, a.drift], [true, []]);
  const first = GENERATED.split("\n")[0];
  const b = (await facts({ [TESTS_FILE]: ["name: other", ...GENERATED.split("\n").slice(1)].join("\n") })).result.ci;
  assert.equal(b.configured, true);
  assert.deepEqual(b.drift, [{ path: TESTS_FILE, difference: `line 1: found \`name: other\`; the schedule generates \`${first.trim()}\`` }]);
  const c = (await facts({})).result.ci;
  assert.deepEqual([c.configured, c.drift], [false, [{ path: TESTS_FILE, difference: "the file is missing; the schedule generates it" }]]);
  const d = (await facts({ [TESTS_FILE]: GENERATED, ".github/workflows/tests.yml": "name: tests\non: pull_request\njobs: {}\n" })).result.ci;
  assert.equal(d.configured, true);
  assert.deepEqual(d.drift.map((each) => each.path), [".github/workflows/tests.yml"]);
  assert.match(d.drift[0].difference, /^not generated by Agent M; triggers: pull_request/);
});

// TST-843005 · level: unit · module: MOD-progress-measures
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; UC-046
// given: a product on GitHub with .github/workflows/agent-m-jobs.yml; and one without it
// input: productFacts(…, { scope: "all" }).ci.jobWorkflow
// expect: true for the first, false for the second
test("productFacts, scope all — ci.jobWorkflow is whether the job workflow is present", async () => {
  assert.equal((await facts({ [JOBS_FILE]: "name: agent-m-jobs\n" })).result.ci.jobWorkflow, true);
  assert.equal((await facts({})).result.ci.jobWorkflow, false);
});

// TST-843006 · level: unit · module: MOD-progress-measures
// guards: COMMIT TESTS CALL NO PAID SERVICE; UC-046
// given: a product whose saved schedule ticks the row paid for every commit, which has an error finding (no configuration is generated from it); known positive: the same schedule without that tick
// input: productFacts(…, { scope: "all" }).ci and .schedule of each
// expect: for the invalid schedule ci is "unknown" and schedule is the saved document (nightly "03:30"); for the valid one ci is an object with its drift
test("productFacts, scope all — ci is \"unknown\" where the schedule has an error finding, and the schedule is still read", async () => {
  assert.equal(typeof (await facts({ [SCHEDULE_FILE]: SCHEDULE("03:30") })).result.ci, "object");
  const invalid = (await facts({ [SCHEDULE_FILE]: SCHEDULE("03:30", true) })).result;
  assert.equal(invalid.ci, "unknown");
  assert.equal(invalid.schedule.fields.nightly, "03:30");
});

const dated = (commit, day) => ({ commit, date: `2026-10-${day}T09:00:00Z` });

// TST-843007 · level: unit · module: MOD-progress-measures
// guards: PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE; UC-046
// given: a product that declares the model scrum at its head, whose docs/process.md history, newest first, is C3 (2026-10-20, scrum), C2 (2026-10-10, scrum) and C1 (2026-10-01, kanban); a token
// input: productFacts(…, { scope: "all" }).modelSince
// expect: "2026-10-10T09:00:00Z", the date of C2, the oldest commit of the run that names scrum; the history is listed once and the three texts are read in one batch
test("productFacts, scope all — modelSince is the date the declared model was declared", async () => {
  const history = { [DECLARATION_FILE]: [{ ...dated("3".repeat(40), "20"), text: declaration("scrum") }, { ...dated("2".repeat(40), "10"), text: declaration("scrum") },
    { ...dated("1".repeat(40), "01"), text: declaration("kanban") }] };
  const { result, seen } = await facts({ [DECLARATION_FILE]: declaration("scrum") }, { served: { history } });
  assert.equal(result.modelSince, "2026-10-10T09:00:00Z");
  assert.equal(seen.kinds.history, 1);
  assert.deepEqual(seen.batches.filter((size) => size === 3), [3], "the three texts of the declaration are one batch");
});

// TST-843008 · level: unit · module: MOD-progress-measures
// guards: PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE; UC-046
// given: (a) a product whose declaration names the same model in both commits of its history (2026-10-10 and 2026-10-01); (b) one that declares no model; (c) one that declares scrum, whose history the server cannot give; (d) one with 250 commits in its history, the three newest naming scrum and the rest kanban; a token
// input: productFacts(…, { scope: "all" }).modelSince
// expect: (a) "2026-10-01T09:00:00Z", the oldest commit; (b) null, and the history is not asked; (c) "unknown"; (d) the date of the third newest commit, and of the 250 texts only the first hundred are read: one batch of a hundred
test("productFacts, scope all — modelSince is null without a declaration, unknown without a history, and reads the history no further than the model's run", async () => {
  const same = { [DECLARATION_FILE]: [{ ...dated("2".repeat(40), "10"), text: declaration("scrum") }, { ...dated("1".repeat(40), "01"), text: declaration("scrum") }] };
  assert.equal((await facts({ [DECLARATION_FILE]: declaration("scrum") }, { served: { history: same } })).result.modelSince, "2026-10-01T09:00:00Z");
  const none = await facts({});
  assert.equal(none.result.modelSince, null);
  assert.equal(none.seen.kinds.history, undefined);
  assert.equal((await facts({ [DECLARATION_FILE]: declaration("scrum") })).result.modelSince, "unknown");
  const many = Array.from({ length: 250 }, (_, at) => ({ commit: (at + 1).toString(16).padStart(40, "0"), date: `2026-09-${String(30 - Math.floor(at / 10)).padStart(2, "0")}T09:00:00Z`,
    text: declaration(at < 3 ? "scrum" : "kanban") }));
  const long = await facts({ [DECLARATION_FILE]: declaration("scrum") }, { served: { history: { [DECLARATION_FILE]: many } } });
  assert.equal(long.result.modelSince, many[2].date);
  assert.equal(long.seen.batches.filter((size) => size === 100).length, 1, "of the 250 texts, one batch of a hundred is read");
});

// TST-843009 · level: unit · module: MOD-progress-measures
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-046
// given: a product with an unended job record, a run on its head and a declaration with a history; a token
// input: productFacts(…, { scope: "all" })
// expect: the job's row gives the state of its record, queued; of the CI service the one request for the repository's runs is made and none for a run, its jobs or its log, and nothing is asked of a Bridge
test("productFacts, scope all — asks no job's live state: the rows of jobs give the state of the record", async () => {
  const { result, log } = await facts({ [DECLARATION_FILE]: declaration("scrum") }, { served: { runs: [run(11, "main", HEAD, "success")] } });
  assert.deepEqual(result.jobs.map((row) => row.state), ["queued"]);
  assert.deepEqual(log.filter((entry) => /\/actions\//.test(entry.what)).map((entry) => entry.what), ["GET /repos/alice/product/actions/runs"]);
  assert.deepEqual(log.filter((entry) => /\/jobs\/|\/logs|bridge/i.test(entry.what)), []);
});

// TST-843010 · level: unit · module: MOD-progress-measures
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-046
// given: a product with a saved schedule, a resource list, a run on its head and a declaration with a history; a token
// input: productFacts(…, { scope: "work" }) and productFacts(…, { scope: "build" })
// expect: in both, modelSince, schedule, ci and resourceNeeds are "unknown", and the server was asked for no CI run and no history
test("productFacts, scopes work and build — modelSince, schedule, ci and resourceNeeds stay \"unknown\" and are not asked for", async () => {
  const more = { [SCHEDULE_FILE]: SCHEDULE("03:30"), [RESOURCES_FILE]: RESOURCES, [DECLARATION_FILE]: declaration("scrum") };
  const history = { [DECLARATION_FILE]: [{ ...dated("3".repeat(40), "20"), text: declaration("scrum") }] };
  for (const scope of ["work", "build"]) {
    const { result, seen } = await facts(more, { scope, served: { runs: [run(11, "main", HEAD, "success")], history } });
    for (const field of ["modelSince", "schedule", "ci", "resourceNeeds"]) assert.equal(result[field], "unknown", `${scope} ${field}`);
    assert.deepEqual([seen.kinds["ci runs"], seen.kinds.history], [undefined, undefined], scope);
    assert.equal(seen.allFiles.includes(SCHEDULE_FILE) || seen.allFiles.includes(RESOURCES_FILE), false, `${scope}: neither file is read`);
  }
});
