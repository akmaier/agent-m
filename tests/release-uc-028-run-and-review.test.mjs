// Independent release tests of UC-028 Run and review the tests of a commit, one or more for each requirement the use case realises (ITM-773): through MOD-test-pages' routes `runs` and `release` over a product
// repository kept in memory (tests/uc-028-world.mjs) and the real MOD-result-records, MOD-release-evidence, MOD-job-runner and MOD-runtimes. Written by developer-sonnet-a, who implemented none of the items they
// build on (ITM-750 is developer-sonnet-g's, ITM-762 developer-sonnet-f's, ITM-761 was written in team 2's session; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER). Each test states its input and its expected
// result in its own text (given / input / expect); every expected value is taken from the sentence of SPEC.md or the step of UC-028 quoted in the test, or from the fixture the test builds, none from the code and none
// read from a document when the test runs. The pages are found by what the use case names (a level's line, a test by its TST- identifier, the buttons Run on this commit, Run, Accept and release), never by a
// private helper of the route. The checks the SPEC names as `tests/test_result_records.py` are in that file, beside its data file.
// Run: node --test tests/release-uc-028-run-and-review.test.mjs
//
// Module: MOD-test-pages; MOD-result-records
// Guards: UC-028; EVERY TEST RUN LEAVES A RESULT RECORD; TEST RESULTS ARE KEPT IN THE REPOSITORY; A RESULT RECORD IS NEVER REWRITTEN; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED; A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON; EVERY TEST HAS ONE LEVEL; EVERY ARTIFACT NAMES ITS ORIGIN; A ROLE NAMES THE CAPABILITIES IT NEEDS; THE PAGE NAMES WHERE IT SENDS; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; ACCEPTING THE RELEASE TEST REPORT RELEASES; A RECORD IS EVIDENCE, NOT A PROPOSAL
// Level: release

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { WORKFLOW, SCHEDULE, SPEC, declarations, record, product, context, blobSha, byClass, byTag, textOf, levelOf, testOf, clickOf, changeOf, typeInto, renderRoute } from "./uc-028-world.mjs";
import { until } from "./prompt-bar.d/until.mjs";

const { view } = await import("../src/test-pages/index.mjs");
const { route: releaseRoute } = await import("../src/test-pages/release.mjs");
const { appendResult, resultSchema } = await import("../src/result-records/index.mjs");
const { readDocument } = await import("../src/documents/index.mjs");
const runs = view.routes.find((candidate) => candidate.name === "runs");

// No timer fires: the page that queued a job would read its progress again after five seconds.
const clock = { waiting: [] };
globalThis.setTimeout = (run, delay) => { const timer = { run, delay }; clock.waiting.push(timer); return timer; };
globalThis.clearTimeout = (timer) => { clock.waiting = clock.waiting.filter((held) => held !== timer); };
afterEach(() => { clock.waiting = []; });

const TESTS = declarations([["901", "unit", "A GUARDED RULE"], ["902", "unit", "A SECOND RULE"], ["903", "system", "A GUARDED RULE; A SECOND RULE"], ["904", "unit", "A GUARDED RULE", ["// runs: 10", "// phrasings: 2"]],
  ["905", "release", "A GUARDED RULE"]]);
const FILES = { "SPEC.md": SPEC, "tests/sample.test.mjs": TESTS, "docs/tests/schedule.md": SCHEDULE, [WORKFLOW]: "name: Agent M jobs\n", "CHANGELOG.md": "# Changelog\n" };
const scheduleRunsOn = (who) => SCHEDULE.replace("| release | | | | ✓ | ✓ | |", `| release | | | | ✓ | ✓ | ${who} |`).replace("| user | | | | ✓ | ✓ | |", `| user | | | | ✓ | ✓ | ${who} |`);
const written = (world) => world.calls.filter((call) => call.fn === "commitFiles");
const filesWritten = (world) => written(world).flatMap((call) => call.change.files);

// The product under review: one commit, and the branch test-results with the records given for it.
function reviewed(rows = [], { extra = {}, files = FILES } = {}) {
  const world = product({ files });
  const COMMIT = world.headOf("main");
  world.branch("test-results", { [`runs/${COMMIT}/20261018-1000-commit-aaaa.md`]: record(COMMIT, "ci-hosted", rows), ...Object.fromEntries(Object.entries(extra).map(([path, text]) => [path.replace("<commit>", COMMIT), text])) });
  return { world, COMMIT };
}
const pageOf = (world, COMMIT, options) => renderRoute(runs, context(world, options), { commit: COMMIT });

// Run on this commit with the first participant offered: the levels preset, the name entered, Run pressed once. Returns the job records the click committed.
async function runOnCommit(world, COMMIT, page) {
  await clickOf(byClass(page, "run-on-commit")[0]);
  const radio = byClass(page, "participant")[0];
  radio.checked = true;
  typeInto(byClass(page, "person")[0], "akmaier");
  await changeOf(radio);
  await clickOf(byTag(page, "button").find((button) => textOf(button) === "Run"));
  return filesWritten(world).filter((file) => /^docs\/jobs\/JOB-/.test(file.path));
}

// TST-773101 · level: release · module: MOD-test-pages; MOD-result-records
// guards: UC-028; EVERY TEST RUN LEAVES A RESULT RECORD; TEST RESULTS ARE KEPT IN THE REPOSITORY
// given: a commit whose level release has no record; the reviewer presses Run on this commit, chooses the participant hosted-ci and runs the levels without a record; the run's participant adds its record
// input: the record of that run is added to the branch test-results, naming the commit, the level release, the participant hosted-ci, a date and the outcome of TST-905; the page of the commit is drawn again
// expect: the record is committed to the branch test-results of the product repository (not to the default branch); read back it names the commit, the levels, the participant, the date and the outcome; the page now shows the level release with that outcome, so the commit's run is visible where the reviewer looks
test("a run leaves a record naming the commit, the levels, the participant, the date and each outcome, on the branch test-results of the product repository", async () => {
  const { world, COMMIT } = reviewed([["TST-901", "unit", "passed", ""], ["TST-902", "unit", "passed", ""], ["TST-903", "system", "passed", ""], ["TST-904", "unit", "passed", "9 of 10"]]);
  const page = await pageOf(world, COMMIT);
  assert.match(textOf(byClass(levelOf(page, "release"), "summary")[0]), /not run on this commit/);
  const jobs = await runOnCommit(world, COMMIT, page);
  assert.equal(jobs.length, 1);
  const path = `runs/${COMMIT}/20261018-1300-on-demand-eeee.md`;
  await appendResult(world.host, readDocument(resultSchema.run, path, record(COMMIT, "hosted-ci", [["TST-905", "release", "passed", ""]], { occasion: "on-demand", date: "2026-10-18T13:00:00Z" })));
  const commits = written(world).filter((call) => call.change.files.some((file) => file.path === path));
  assert.deepEqual(commits.map((call) => call.change.branch), ["test-results"]);
  const stored = readDocument(resultSchema.run, path, world.treeOf("test-results")[path]);
  assert.deepEqual([stored.fields.commit, stored.fields.levels, stored.fields.participant, stored.fields.date], [COMMIT, ["release"], "hosted-ci", "2026-10-18T13:00:00Z"]);
  const rows = stored.sections.find((section) => section.heading === "## Outcomes").rows.map((row) => [row.cells.Test, row.cells.Outcome]);
  assert.deepEqual(rows, [["TST-905", "passed"]]);
  const after = await pageOf(world, COMMIT);
  assert.equal(textOf(byClass(testOf(after, "TST-905"), "outcome")[0]), "passed");
  assert.equal(Object.hasOwn(world.treeOf("main"), path), false, "the record is not on the default branch");
});

// TST-773102 · level: release · module: MOD-result-records
// guards: UC-028; A RESULT RECORD IS NEVER REWRITTEN; TEST RESULTS ARE KEPT IN THE REPOSITORY
// given: the branch test-results holds two records of the commit
// input: a run adds a record beside them; another tries to add a record at the path of an existing one with other outcomes
// expect: the branch only grows: after the first, every earlier file has the very text it had and one file more stands; the second is refused (Exists) and the branch's head does not move; no commit of the branch deletes or changes a file
test("the branch test-results only grows: a new record stands beside the old, a record at an existing path is refused", async () => {
  const { world, COMMIT } = reviewed([["TST-901", "unit", "passed", ""]], { extra: { "runs/<commit>/20261018-1100-on-demand-bbbb.md": record("<commit>", "lab-runner", [["TST-901", "unit", "failed", ""]], { occasion: "on-demand" }) } });
  const before = world.treeOf("test-results");
  const fresh = `runs/${COMMIT}/20261018-1200-on-demand-cccc.md`;
  await appendResult(world.host, readDocument(resultSchema.run, fresh, record(COMMIT, "hosted-ci", [["TST-902", "unit", "passed", ""]], { occasion: "on-demand" })));
  const after = world.treeOf("test-results");
  for (const [path, text] of Object.entries(before)) assert.equal(after[path], text, `${path} is unchanged`);
  assert.deepEqual(Object.keys(after).filter((path) => !(path in before)), [fresh]);
  const head = world.headOf("test-results");
  const clash = Object.keys(before)[0];
  await assert.rejects(appendResult(world.host, readDocument(resultSchema.run, clash, record(COMMIT, "intruder", [["TST-901", "unit", "failed", ""]]))), (error) => error.name === "Exists");
  assert.equal(world.headOf("test-results"), head);
  for (const call of written(world)) assert.ok(call.change.files.every((file) => file.delete !== true && !(file.path in before)), "a commit only adds");
});

// TST-773103 · level: release · module: MOD-test-pages; MOD-result-records
// guards: UC-028; A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
// given: on one commit TST-901 (deterministic) passed in one record and failed in another; TST-902 passed on this commit and failed on an earlier one; TST-904 (model-dependent) has passing and failing runs in one record
// input: the page of the commit
// expect: TST-901 reads flaky, never passed, with both runs named; TST-902 reads passed (a failure on another commit is not a flip); TST-904 is not flaky: it shows a rate
test("a deterministic test with a passing and a failing outcome on the same commit is flaky, never passed; a failure on another commit is not a flip", async () => {
  const OLD = "d".repeat(40);
  const { world, COMMIT } = reviewed([["TST-901", "unit", "passed", ""], ["TST-902", "unit", "passed", ""], ["TST-904", "unit", "passed", "7 of 10"]], {
    extra: { "runs/<commit>/20261018-1100-on-demand-bbbb.md": record("<commit>", "lab-runner", [["TST-901", "unit", "failed", ""], ["TST-904", "unit", "failed", ""]], { occasion: "on-demand" }),
      [`runs/${OLD}/20261001-1000-commit-dddd.md`]: record(OLD, "ci-hosted", [["TST-902", "unit", "failed", ""]]) } });
  const page = await pageOf(world, COMMIT);
  assert.equal(textOf(byClass(testOf(page, "TST-901"), "outcome")[0]), "flaky");
  assert.match(textOf(testOf(page, "TST-901")), /passed in .*failed in /);
  assert.equal(textOf(byClass(testOf(page, "TST-902"), "outcome")[0]), "passed");
  assert.notEqual(textOf(byClass(testOf(page, "TST-904"), "outcome")[0]), "flaky");
  assert.ok(byClass(testOf(page, "TST-904"), "rate").length === 1, "a rate is shown");
});

// TST-773104 · level: release · module: MOD-test-pages; MOD-result-records
// guards: UC-028; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
// given: TST-904 declares 10 runs; on the commit it passed 6 of 10, on the last release, v1.0.0, 8 of 10
// input: the page of the commit
// expect: TST-904 shows "6 of 10 runs (last release: 8 of 10)" and that it is worse than the last release; no single run is a pass or a fail of the test
test("a model-dependent test shows the rate of a number of runs fixed in advance, beside the last release's, and a lower rate is worse", async () => {
  const world = product({ files: FILES });
  const COMMIT = world.headOf("main");
  world.commit("main", { "docs/later.md": "later\n" }, "A later commit");
  const OLD = world.branch("old", FILES);
  world.tag("v1.0.0", OLD);
  world.branch("test-results", { [`runs/${COMMIT}/20261018-1000-commit-aaaa.md`]: record(COMMIT, "ci-hosted", [["TST-904", "unit", "passed", "6 of 10"]]),
    [`runs/${OLD}/20261001-1000-release-candidate-dddd.md`]: record(OLD, "ci-hosted", [["TST-904", "unit", "passed", "8 of 10"]], { occasion: "release-candidate" }) });
  const page = await pageOf(world, COMMIT);
  const rate = textOf(byClass(testOf(page, "TST-904"), "rate")[0]);
  assert.match(rate, /6 of 10 runs \(last release: 8 of 10\)/);
  assert.match(rate, /worse than the last release/);
});

// A candidate whose run has ended with the rows given; the panel has read the report again. With `complete` false the page is read while a level has no record.
async function releasing(rows, { earlier = null, complete = true } = {}) {
  const world = product({ files: { ...FILES, "docs/tests/schedule.md": scheduleRunsOn("a-second-person"), ...(earlier ? { "docs/tests/releases/v2026.3.0.md": earlier.report } : {}) } });
  const COMMIT = world.headOf("main");
  world.branch("test-results", earlier ? { [`runs/${earlier.commit}/20260901-1000-release-candidate-aaaa.md`]: earlier.record } : {});
  const target = await renderRoute(releaseRoute, context(world), {});
  const version = byClass(target, "version")[0].value;
  typeInto(byClass(target, "changelog")[0], "Adds the list.");
  typeInto(byClass(target, "person")[0], "akmaier");
  byClass(target, "start")[0].dispatchEvent(new Event("click"));
  await until(() => /Queued run: JOB-/.test(target.textContent), "the candidate and its queued run");
  world.commit("test-results", { [`runs/${COMMIT}/20261019-1000-release-candidate-bbbb.md`]: record(COMMIT, "a-second-person", rows, { occasion: "release-candidate" }) });
  byClass(target, "refresh")[0].dispatchEvent(new Event("click"));
  await until(() => (complete ? byClass(target, "accept").length > 0 : /has not finished at every level/.test(target.textContent)), complete ? "the complete report" : "the incomplete report");
  return { world, COMMIT, target, version };
}
const ALL_GREEN = [["TST-901", "unit", "passed", ""], ["TST-902", "unit", "passed", ""], ["TST-903", "system", "passed", ""], ["TST-904", "unit", "passed", "9 of 10"], ["TST-905", "release", "passed", ""]];

// TST-773105 · level: release · module: MOD-test-pages; MOD-release-evidence
// guards: UC-028; A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: a release candidate whose run left a record for every test but TST-905, the only test of the level release
// input: the release panel after the run, Check results
// expect: the report is not complete: the page says the run has not finished at every level and offers no Accept and release; once TST-905 has a record the panel offers it
test("a release candidate is not accepted while a level has not run", async () => {
  const { world, COMMIT, target, version } = await releasing(ALL_GREEN.slice(0, 4), { complete: false });
  assert.equal(byClass(target, "accept").length, 0);
  assert.equal(world.tagOf(`v${version}`), undefined, "no tag is set");
  world.commit("test-results", { [`runs/${COMMIT}/20261019-1100-release-candidate-cccc.md`]: record(COMMIT, "a-second-person", [ALL_GREEN[4]], { occasion: "release-candidate" }) });
  byClass(target, "refresh")[0].dispatchEvent(new Event("click"));
  await until(() => byClass(target, "accept").length > 0, "Accept and release once every level has run");
});

// TST-773106 · level: release · module: MOD-test-pages; MOD-release-evidence
// guards: UC-028; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// given: a complete run in which TST-902 failed
// input: Accept and release without a reason for TST-902; then with one
// expect: without it nothing is committed to the default branch and no tag is set; with it the tag is set and the approval record holds the reason (counter-proof of the SPEC: with one it can be tagged)
test("a red run without a recorded limitation cannot be tagged, and with one it can", async () => {
  const { world, target, version } = await releasing([ALL_GREEN[0], ["TST-902", "unit", "failed", ""], ALL_GREEN[2], ALL_GREEN[3], ALL_GREEN[4]]);
  const accept = byClass(target, "accept")[0];
  typeInto(byClass(accept, "person")[0], "akmaier");
  const mainBefore = world.headOf("main");
  byClass(accept, "accept")[0].dispatchEvent(new Event("click"));
  await until(() => /reason/i.test(byClass(accept, "result")[0].textContent), "the refusal");
  assert.equal(world.tagOf(`v${version}`), undefined);
  assert.equal(world.headOf("main"), mainBefore, "nothing was committed to the default branch");
  typeInto(byClass(accept, "reason")[0], "the runner of this test is replaced next week");
  byClass(accept, "accept")[0].dispatchEvent(new Event("click"));
  await until(() => world.tagOf(`v${version}`) !== undefined, "the tag stands");
  const tree = world.treeOf("main");
  assert.match(tree[Object.keys(tree).find((path) => path.startsWith(`docs/approvals/release-v${version}-`))], /the runner of this test is replaced next week/);
});

// TST-773107 · level: release · module: MOD-test-pages; MOD-release-evidence
// guards: UC-028; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON; ACCEPTING THE RELEASE TEST REPORT RELEASES
// given: a complete green run
// input: Accept and release pressed with no name; then with the name akmaier
// expect: with no name nothing is committed and no tag is set; with the name, one click commits the report and an approval record that names its blob, and sets the tag on the tested commit; the report counts as accepted only through that record
test("a green report is accepted by a named person, whose one click commits the report and the approval and sets the tag on the tested commit", async () => {
  const { world, COMMIT, target, version } = await releasing(ALL_GREEN);
  const accept = byClass(target, "accept")[0];
  const mainBefore = world.headOf("main");
  typeInto(byClass(accept, "person")[0], "");
  byClass(accept, "accept")[0].dispatchEvent(new Event("click"));
  await until(() => /name/i.test(byClass(accept, "result")[0].textContent), "the page asks for the name");
  assert.equal(world.headOf("main"), mainBefore);
  assert.equal(world.tagOf(`v${version}`), undefined);
  typeInto(byClass(accept, "person")[0], "akmaier");
  byClass(accept, "accept")[0].dispatchEvent(new Event("click"));
  await until(() => world.tagOf(`v${version}`) !== undefined, "the tag stands");
  assert.equal(world.tagOf(`v${version}`), COMMIT);
  const tree = world.treeOf("main");
  const report = tree[`docs/tests/releases/v${version}.md`];
  const approval = Object.keys(tree).filter((path) => path.startsWith(`docs/approvals/release-v${version}-`));
  assert.equal(approval.length, 1);
  assert.match(tree[approval[0]], new RegExp(`blob: ${blobSha(report)}`));
  assert.match(tree[approval[0]], /akmaier|release-report/);
});

// TST-773108 · level: release · module: MOD-test-pages
// guards: UC-028; EVERY TEST HAS ONE LEVEL
// given: tests of the levels unit, system and release, each declared once
// input: the page of the commit
// expect: each TST- identifier is listed under exactly one level, the level it declares: 901, 902 and 904 under unit, 903 under system, 905 under release
test("each test is listed under exactly one level, the one it declares", async () => {
  const { world, COMMIT } = reviewed([["TST-901", "unit", "passed", ""]]);
  const page = await pageOf(world, COMMIT);
  const placed = new Map();
  for (const section of byClass(page, "level")) for (const item of byClass(section, "test")) placed.set(item.getAttribute("data-test"), [...(placed.get(item.getAttribute("data-test")) ?? []), section.getAttribute("data-level")]);
  assert.deepEqual([...placed.entries()].sort(), [["TST-901", ["unit"]], ["TST-902", ["unit"]], ["TST-903", ["system"]], ["TST-904", ["unit"]], ["TST-905", ["release"]]]);
});

// TST-773109 · level: release · module: MOD-test-pages
// guards: UC-028; EVERY ARTIFACT NAMES ITS ORIGIN; A ROLE NAMES THE CAPABILITIES IT NEEDS; THE PAGE NAMES WHERE IT SENDS
// given: the participants hosted-ci (run code and tests, route ci hosted) and writer (no such capability); the commit's level release has no record
// input: Run on this commit, hosted-ci and the name akmaier chosen
// expect: only hosted-ci is offered; the panel names where the run happens (the route ci hosted, the commit and the levels); the job record the click commits names its origin: the person akmaier who started it, the participant hosted-ci and the commit it works on
test("Run on this commit offers only a participant with the capability, names where the run happens, and the job record names who started it", async () => {
  const { world, COMMIT } = reviewed([["TST-901", "unit", "passed", ""]]);
  const page = await pageOf(world, COMMIT);
  await clickOf(byClass(page, "run-on-commit")[0]);
  const radios = byClass(page, "participant");
  assert.deepEqual(radios.map((radio) => radio.value), ["hosted-ci"]);
  radios[0].checked = true;
  typeInto(byClass(page, "person")[0], "akmaier");
  await changeOf(radios[0]);
  const where = textOf(byClass(page, "where")[0]);
  assert.ok(where.includes("ci hosted") && where.includes(COMMIT) && where.includes("release"), where);
  await clickOf(byTag(page, "button").find((button) => textOf(button) === "Run"));
  const job = filesWritten(world).find((file) => /^docs\/jobs\/JOB-/.test(file.path)).text;
  assert.match(job, /started_by: akmaier/);
  assert.match(job, /participant: hosted-ci/);
  assert.ok(job.includes(COMMIT));
});

// TST-773110 · level: release · module: MOD-test-pages
// guards: UC-028; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION
// given: the page of a commit with its level release not run, a participant and a name chosen
// input: the page drawn and the panel opened (nothing clicked); then Run pressed by a script (an event that is not trusted); then Run pressed by a person, once
// expect: nothing is committed until the person's click; the script's click commits nothing; the person's one click commits exactly one job record
test("nothing is written until a person presses Run, and one press writes one job", async () => {
  const { world, COMMIT } = reviewed([["TST-901", "unit", "passed", ""]]);
  const page = await pageOf(world, COMMIT);
  await clickOf(byClass(page, "run-on-commit")[0]);
  const radio = byClass(page, "participant")[0];
  radio.checked = true;
  typeInto(byClass(page, "person")[0], "akmaier");
  await changeOf(radio);
  assert.equal(written(world).length, 0, "drawing the page and opening the panel write nothing");
  const run = byTag(page, "button").find((button) => textOf(button) === "Run");
  run.dispatchEvent(new Event("click"));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(written(world).length, 0, "a click a script makes writes nothing");
  await clickOf(run);
  assert.equal(filesWritten(world).filter((file) => /^docs\/jobs\/JOB-/.test(file.path)).length, 1);
});

// TST-773111 · level: release · module: MOD-test-pages; MOD-result-records
// guards: UC-028; A RECORD IS EVIDENCE, NOT A PROPOSAL; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: a release candidate with a user-level test the schedule assigns to akmaier
// input: akmaier enters her name and presses Passed
// expect: the record is committed directly to the branch test-results as evidence of the outcome: one commit, no branch for review and no pull request opened (the host is asked for neither), and the page shows the outcome at once
test("a result entered by a person is a record committed directly, not a proposal for review", async () => {
  const files = { ...FILES, "tests/sample.test.mjs": declarations([["907", "user", "A GUARDED RULE"]]).replaceAll("the list holds one entry", "the tag of the release appears"), "docs/tests/schedule.md": scheduleRunsOn("akmaier") };
  const world = product({ files });
  const COMMIT = world.headOf("main");
  world.tag("v2026.5.0-rc.1", COMMIT);
  world.branch("test-results", {});
  const page = await pageOf(world, COMMIT);
  const list = byClass(page, "checklist")[0];
  typeInto(byClass(list, "person")[0], "akmaier");
  await clickOf(byClass(list, "passed")[0]);
  await until(() => written(world).length === 1, "the record is committed");
  assert.deepEqual(written(world).map((call) => call.change.branch), ["test-results"]);
  assert.deepEqual(world.calls.map((call) => call.fn), ["commitFiles"], "nothing else was written: no branch, no pull request");
  await until(() => textOf(byClass(page, "outcome")[0] ?? page) === "passed", "the page shows the outcome");
});

// TST-773112 · level: release · module: MOD-test-pages
// guards: UC-028; EVERY STEP EXPLAINS ITSELF
// given: the page of a commit as the reviewer meets it: the levels, the flaky marks, the rates and Run on this commit
// input: the page is drawn
// expect: it holds a folded explanation (details with the class explain) of what it shows
test("the runs page carries a folded explanation of its steps", async () => {
  const { world, COMMIT } = reviewed([["TST-901", "unit", "passed", ""]]);
  const page = await pageOf(world, COMMIT);
  assert.ok(byClass(page, "explain").length >= 1, "the runs page explains itself");
});

// TST-773113 · level: release · module: MOD-test-pages
// guards: UC-028; EVERY STEP EXPLAINS ITSELF
// given: the release panel, as the reviewer meets it for a release candidate
// input: the panel is drawn
// expect: it holds a folded explanation (details with the class explain)
test("the release panel carries a folded explanation of its steps", async () => {
  const other = product({ files: { ...FILES, "docs/tests/schedule.md": scheduleRunsOn("a-second-person") } });
  other.branch("test-results", {});
  const panel = await renderRoute(releaseRoute, context(other), {});
  assert.ok(byClass(panel, "explain").length >= 1, "the release panel explains itself");
});
