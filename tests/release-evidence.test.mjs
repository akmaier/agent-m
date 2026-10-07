// Versions, release candidates and the release (ITM-254) — MOD-release-evidence's nextVersion, startReleaseCandidate,
// releaseReport and acceptAndRelease, as the accepted text of docs/architecture/MOD-release-evidence.md states them:
// the next version of a product's own line; the release candidate tagged and its complete run queued; the release
// test report of a candidate whose run has ended; and, on the person's one click, the report, its approval record
// with every known limitation and the changelog entry in one commit, then the tag on the tested commit.
// reportsAwaitingAcceptance (ITM-239) and the audit (auditRows, auditDocument, UC-030) are not part of this item and
// are not tested here.
// Run: node --test tests/release-evidence.test.mjs
//
// Module: MOD-release-evidence
// Guards: UC-013; CALENDAR VERSIONS; EVERY PRODUCT HAS ITS OWN VERSION LINE; A RELEASE IS TAGGED AND LOGGED;
//         A VERSION IS NOT REWRITTEN; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; RELEASE TESTS ARE NOT WRITTEN BY THE
//         IMPLEMENTER; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON;
//         A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED; ACCEPTING THE RELEASE TEST REPORT RELEASES
// Level: unit
//
// The host and the snapshots are fakes, kept to MOD-repository-hosts' interface (paths, read(path), blob(path),
// repositoryInfo, readSnapshot, listTags, commitFiles, createTag) — one repository in memory, no fetch, no network,
// nothing sleeps or waits. Each test states its input and its expected result before it runs. The counter-proofs are
// recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { nextVersion, startReleaseCandidate, releaseReport, acceptAndRelease } from "../src/release-evidence/index.mjs";

// ================================================================== fakes

const blobSha = (text) => {
  const body = Buffer.from(text, "utf8");
  return createHash("sha1").update(`blob ${body.length}\0`).update(body).digest("hex");
};
const failure = (name, fields = {}) => Object.assign(new Error(`${name} ${JSON.stringify(fields)}`), { name, ...fields });
const globPattern = (pattern) => new RegExp(`^${pattern.split("*").map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`);

// A fake MOD-repository-hosts' Host: one repository in memory. branchFiles seeds the default branch's one commit;
// extraCommits seeds further commits (by label) a test can tag or read directly, as a candidate's own commit —
// starting a candidate tags a commit that already stands, it never makes one. tags seeds existing tags (name -> a
// label of extraCommits, or "default" for the default branch's own commit).
function fakeHost({ defaultBranch = "main", branchFiles = {}, extraCommits = {}, tags = {} } = {}) {
  const commits = new Map();
  const branches = new Map();
  const tagMap = new Map();
  let made = 0;
  const makeCommit = (files) => {
    const sha = createHash("sha1").update(`commit ${(made += 1)} ${JSON.stringify(Object.keys(files))} ${Math.random()}`).digest("hex");
    commits.set(sha, new Map(Object.entries(files)));
    return sha;
  };
  const defaultCommit = makeCommit(branchFiles);
  branches.set(defaultBranch, defaultCommit);
  const shaOf = { default: defaultCommit };
  for (const [label, files] of Object.entries(extraCommits)) shaOf[label] = makeCommit(files);
  for (const [name, label] of Object.entries(tags)) tagMap.set(name, shaOf[label]);

  const calls = [];
  return {
    calls,
    shaOf,
    land(files) { branches.set(defaultBranch, makeCommit({ ...Object.fromEntries(commits.get(branches.get(defaultBranch))), ...files })); },
    tagOf: (name) => tagMap.get(name),
    async repositoryInfo() {
      return { defaultBranch, visibility: "public", canWrite: true, archived: false, description: "" };
    },
    async readSnapshot(ref) {
      const sha = branches.get(ref) ?? (commits.has(ref) ? ref : null);
      if (!sha) throw failure("NotFound", { what: ref });
      const tree = commits.get(sha);
      return {
        repository: { server: "github", origin: "https://github.com", path: "org/product", web: "https://github.com/org/product" },
        ref, commit: sha, paths: [...tree.keys()],
        read: async (path) => (tree.has(path) ? tree.get(path) : null),
        blob: (path) => (tree.has(path) ? blobSha(tree.get(path)) : null),
      };
    },
    async listTags(pattern) {
      const re = globPattern(pattern);
      return [...tagMap.entries()].filter(([name]) => re.test(name)).map(([name, commit]) => ({ name, commit }));
    },
    async createTag(name, commit) {
      calls.push({ fn: "createTag", name, commit });
      if (tagMap.has(name)) throw failure("TagExists", { commit: tagMap.get(name) });
      tagMap.set(name, commit);
    },
    async commitFiles(change) {
      calls.push({ fn: "commitFiles", change: structuredClone(change) });
      const head = branches.get(change.branch);
      if (head !== change.expectedHead) throw failure("Moved", { head });
      const files = Object.fromEntries(commits.get(head));
      for (const f of change.files) files[f.path] = f.text;
      const sha = makeCommit(files);
      branches.set(change.branch, sha);
      return { commit: sha, url: `https://github.com/org/product/commit/${sha}` };
    },
  };
}

// A fixture snapshot (MOD-repository-hosts' Snapshot) over a plain object of files — for releaseReport's `at` and
// `results`, which this item's functions never write through.
function fixtureSnapshot(files) {
  return {
    paths: Object.keys(files),
    blob: (path) => (Object.hasOwn(files, path) ? blobSha(files[path]) : null),
    read: async (path) => (Object.hasOwn(files, path) ? files[path] : null),
  };
}

const WORKFLOW_PATH = ".github/workflows/agent-m-jobs.yml";
const SCHEDULE_PATH = "docs/tests/schedule.md";

// A product's schedule.md (schedule.schema.md): the six rows, each row's "runs on" from `runsOn` (by level), defaults
// empty — valid and ticked for release candidate throughout, as default-schedule.md is.
function scheduleText(runsOn = {}) {
  const rows = ["unit", "component", "system", "paid", "release", "user"]
    .map((level) => `| ${level} | ✓ | ✓ | ✓ | ✓ | ✓ | ${runsOn[level] ?? ""} |`);
  return ["---", "nightly: 02:00", "---", "## Levels", "", "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |",
    "|---|---|---|---|---|---|---|", ...rows, ""].join("\n");
}

// ================================================================== nextVersion

// guards: CALENDAR VERSIONS; EVERY PRODUCT HAS ITS OWN VERSION LINE
// given: this product's own release tags v2026.3.0 and v2026.3.1, and its own candidate tag v2026.3.1-rc.2, today
//        2026-10-07
// input: nextVersion(tags, "minor", today)
// expect: 2026.4.0 — the candidate tag is not a release and is passed over (from the product's own tags only)
test("nextVersion — a minor step by default, from the product's own release tags only", () => {
  const tags = ["v2026.3.0", "v2026.3.1", "v2026.3.1-rc.2"];
  assert.equal(nextVersion(tags, "minor", "2026-10-07"), "2026.4.0");
});

// guards: CALENDAR VERSIONS
// given: the same tags, today 2026-10-07
// input: nextVersion(tags, "patch", today)
// expect: 2026.3.2 — the minor stays, the patch steps
test("nextVersion — a patch step keeps the minor and steps the patch", () => {
  const tags = ["v2026.3.0", "v2026.3.1"];
  assert.equal(nextVersion(tags, "patch", "2026-10-07"), "2026.3.2");
});

// guards: CALENDAR VERSIONS
// given: the latest release tag v2025.9.3, today 2026-01-05 — the year changed since the last release
// input: nextVersion(tags, "minor", today), and again with "patch"
// expect: 2026.1.0 both times — the new year overrides the step asked (1a)
// counter-proof: planting `if (!latest || latest.year !== year) return step === "patch" ? ... : ...;` (mixing in the
//                step on a new year) in version.mjs fails this test's second assertion
test("nextVersion — YYYY.1.0 in a new year, whatever step is asked (1a)", () => {
  const tags = ["v2025.9.3"];
  assert.equal(nextVersion(tags, "minor", "2026-01-05"), "2026.1.0");
  assert.equal(nextVersion(tags, "patch", "2026-01-05"), "2026.1.0");
});

// guards: CALENDAR VERSIONS
// given: no release tag at all
// input: nextVersion([], "minor", "2026-10-07")
// expect: 2026.1.0 — a product with nothing to bump starts its line the same way a new year does
test("nextVersion — a product with no release tag yet starts at YYYY.1.0", () => {
  assert.equal(nextVersion([], "minor", "2026-10-07"), "2026.1.0");
});

// ================================================================== startReleaseCandidate

const CANDIDATE_VERSION = "2026.4.0";
const PARTICIPANT_IMPLEMENTER = "developer-sonnet-b";
const PARTICIPANT_RUNNER = "developer-sonnet-e";

function jobRecordText({ id, kind, participant, worksOn }) {
  return ["---", `id: ${id}`, `kind: ${kind}`, "works_on:", ...worksOn.map((w) => `  - ${w}`),
    `participant: ${participant}`, "route: tab", "started_by: po-opus", "start: 2026-10-01 09:00 UTC",
    "agent_m: 2026.9.0, commit aaaaaaaaaaaa", "limit: 5", "---", "## Destinations", "",
    `- ${participant}, at this machine: the item.`, "", "## Parameters", "", "```json", "{}", "```", "",
  ].join("\n");
}

function candidateHost({ runsOn, tags = {}, jobs = {} } = {}) {
  const branchFiles = {
    [WORKFLOW_PATH]: "name: Agent M jobs\n",
    [SCHEDULE_PATH]: scheduleText(runsOn),
    ...Object.fromEntries(Object.entries(jobs).map(([id, job]) => [`docs/jobs/${id}.md`, jobRecordText({ id, ...job })])),
  };
  return fakeHost({ defaultBranch: "main", branchFiles, extraCommits: { candidate: { ...branchFiles } }, tags });
}

const CANDIDATE_RUNNERS = { release: PARTICIPANT_RUNNER, user: PARTICIPANT_RUNNER };

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: a product with no release candidate tagged yet, its schedule naming a runner for "release" and "user", one
//        prior implement job by a different participant
// input: startReleaseCandidate(host, "2026.4.0", <candidate commit>, "a changelog entry", "akmaier")
// expect: candidate "v2026.4.0-rc.1" (the next free N, here 1); a commitFiles call queuing the run (MOD-job-ledger's
//         own record format), whose "## Parameters" json names the candidate's version, tag and commit and keeps the
//         changelog entry given
test("startReleaseCandidate — the next free N, and the complete run queued with the candidate's version, tag and changelog entry", async () => {
  const host = candidateHost({
    runsOn: CANDIDATE_RUNNERS,
    jobs: { "JOB-20261001-0900-aaaa": { kind: "implement", participant: PARTICIPANT_IMPLEMENTER, worksOn: ["ITM-200"] } },
  });
  const result = await startReleaseCandidate(host, CANDIDATE_VERSION, host.shaOf.candidate, "a changelog entry", "akmaier");
  assert.equal(result.candidate, "v2026.4.0-rc.1");
  assert.ok(typeof result.run === "string" && result.run.length > 0);
  const queued = host.calls.find((c) => c.fn === "commitFiles");
  assert.ok(queued, "the job's start record is committed");
  const [{ text }] = queued.change.files;
  assert.match(text, /"version": "2026\.4\.0"/);
  assert.match(text, /"tag": "v2026\.4\.0-rc\.1"/);
  assert.match(text, /a changelog entry/);
});

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: the product already carries v2026.4.0-rc.1 and v2026.4.0-rc.3 (not rc.2)
// input: startReleaseCandidate(host, "2026.4.0", commit, "entry", "akmaier")
// expect: candidate "v2026.4.0-rc.4" — the greatest existing N plus one, not the first free gap
test("startReleaseCandidate — the next free N is the greatest existing one plus one", async () => {
  const host = candidateHost({
    runsOn: CANDIDATE_RUNNERS,
    tags: { "v2026.4.0-rc.1": "default", "v2026.4.0-rc.3": "default" },
  });
  const result = await startReleaseCandidate(host, CANDIDATE_VERSION, host.shaOf.candidate, "entry", "akmaier");
  assert.equal(result.candidate, "v2026.4.0-rc.4");
});

// guards: A VERSION IS NOT REWRITTEN
// given: v2026.4.0-rc.1 already tagged on a commit other than the one given now (the rare race of two concurrent
//        clicks naming the same N)
// input: startReleaseCandidate with a host whose createTag always refuses with TagExists for that exact name
// expect: rejects with name TagExists
// counter-proof: planting `try { await host.createTag(...) } catch {}` (swallowing the failure) in candidate.mjs fails
//                this test's assert.rejects
test("startReleaseCandidate — TagExists propagates from the host's createTag", async () => {
  const host = candidateHost({ runsOn: CANDIDATE_RUNNERS });
  const real = host.createTag.bind(host);
  host.createTag = async (name, commit) => { throw failure("TagExists", { commit: "deadbeef" }); };
  await assert.rejects(
    () => startReleaseCandidate(host, CANDIDATE_VERSION, host.shaOf.candidate, "entry", "akmaier"),
    (error) => error.name === "TagExists",
  );
  void real;
});

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: a schedule whose "user" row names no one ("release" does)
// input: startReleaseCandidate(host, ...)
// expect: rejects NoRunner, naming the level "user"
// counter-proof: planting `if (level !== "release" && level !== "user")` as `if (level !== "user")` (dropping the
//                "release"-only guard so "release" row is also checked here, double-reporting) still names "user"
//                first in this fixture and would pass; instead planting the loop to `continue` unconditionally before
//                the empty-runner check fails this test, since no NoRunner is ever thrown
test("startReleaseCandidate — NoRunner naming a person-run level the schedule names no one for", async () => {
  const host = candidateHost({ runsOn: { release: PARTICIPANT_RUNNER } }); // user: left out
  await assert.rejects(
    () => startReleaseCandidate(host, CANDIDATE_VERSION, host.shaOf.candidate, "entry", "akmaier"),
    (error) => error.name === "NoRunner" && error.level === "user",
  );
});

// guards: RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
// given: the schedule's "release" row names PARTICIPANT_IMPLEMENTER; every recorded implement job also names
//        PARTICIPANT_IMPLEMENTER — no other participant has ever implemented anything
// input: startReleaseCandidate(host, ...)
// expect: rejects NoRunner naming "release" — only the implementer could run the release tests (2a)
// counter-proof: planting `implementers.size > 0` as `implementers.size > 1` in candidate.mjs's checkRunners fails
//                this test's assert.rejects (one implementer, as here, would no longer be caught)
test("startReleaseCandidate — NoRunner naming \"release\" where only the implementer could run the release tests (2a)", async () => {
  const host = candidateHost({
    runsOn: { release: PARTICIPANT_IMPLEMENTER, user: PARTICIPANT_RUNNER },
    jobs: {
      "JOB-20261001-0900-aaaa": { kind: "implement", participant: PARTICIPANT_IMPLEMENTER, worksOn: ["ITM-200"] },
      "JOB-20261002-0900-bbbb": { kind: "implement", participant: PARTICIPANT_IMPLEMENTER, worksOn: ["ITM-201"] },
    },
  });
  await assert.rejects(
    () => startReleaseCandidate(host, CANDIDATE_VERSION, host.shaOf.candidate, "entry", "akmaier"),
    (error) => error.name === "NoRunner" && error.level === "release",
  );
});

// guards: RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
// given: the schedule's "release" row names PARTICIPANT_RUNNER, who differs from the recorded implementer
// input: startReleaseCandidate(host, ...)
// expect: resolves (no NoRunner) — a known positive beside the counter-proof above, since a negative result (no
//         rejection) is otherwise unverified (CLAUDE.md §6a Nr. 2)
test("startReleaseCandidate — no NoRunner where the release row's runner differs from every recorded implementer", async () => {
  const host = candidateHost({
    runsOn: CANDIDATE_RUNNERS,
    jobs: { "JOB-20261001-0900-aaaa": { kind: "implement", participant: PARTICIPANT_IMPLEMENTER, worksOn: ["ITM-200"] } },
  });
  const result = await startReleaseCandidate(host, CANDIDATE_VERSION, host.shaOf.candidate, "entry", "akmaier");
  assert.equal(result.candidate, "v2026.4.0-rc.1");
});

// ================================================================== releaseReport

const CANDIDATE_COMMIT = "c".repeat(40);
const SPEC_TEXT = ["# Fixture product — Specification", "", "## Section", "",
  "**A SAMPLE REQUIREMENT** *(Product Owner)*", "A sample rule.", "*Check:* `tests/sample.test.mjs`", ""].join("\n");
const TEST_FILE = ["// TST-001", "// level: unit", "// guards: A SAMPLE REQUIREMENT", ""].join("\n");

function runRecord({ commit, rows }) {
  const table = ["| Test | Level | Outcome | Runs |", "|---|---|---|---|", ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
  return ["---", `commit: ${commit}`, "levels:", "  - unit", "occasion: release-candidate", "participant: ci",
    "date: 2026-10-07 10:00 UTC", "---", "## Outcomes", "", table, ""].join("\n");
}

// guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: a repository holding SPEC.md (one requirement) and one test file (TST-001, guarding it), and a result record
//        of the candidate's commit where TST-001 passed
// input: releaseReport(at, results, { version, tag, commit, changelog })
// expect: the text holds every part in the module's own order — "## Limitations" first, then "## Levels", "## Tests",
//         "## Requirements", "## Changelog entry" —; Limitations empty (the run is green); complete true; failing and
//         worse both empty
test("releaseReport — its parts in the module's own order, Limitations first, complete and green", async () => {
  const at = fixtureSnapshot({ "SPEC.md": SPEC_TEXT, "tests/sample.test.mjs": TEST_FILE });
  const results = fixtureSnapshot({
    [`runs/${CANDIDATE_COMMIT}/20261007-1000-release-candidate-aaaa.md`]: runRecord({ commit: CANDIDATE_COMMIT, rows: [["TST-001", "unit", "passed", ""]] }),
  });
  const candidate = { version: "2026.4.0", tag: "v2026.4.0-rc.1", commit: CANDIDATE_COMMIT, changelog: "Adds the sample feature." };
  const { text, complete, failing, worse } = await releaseReport(at, results, candidate);
  const order = ["## Limitations", "## Levels", "## Tests", "## Requirements", "## Changelog entry"].map((h) => text.indexOf(h));
  assert.ok(order.every((i) => i >= 0), "every part stands in the text");
  assert.deepEqual(order, order.slice().sort((a, b) => a - b), "in the module's own order, Limitations first");
  assert.equal(complete, true);
  assert.deepEqual(failing, []);
  assert.deepEqual(worse, []);
  assert.match(text, /A SAMPLE REQUIREMENT/);
  assert.match(text, /TST-001/);
  assert.match(text, /Adds the sample feature\./);
});

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: the same repository, but the branch test-results holds no record of the candidate's commit at all
// input: releaseReport(at, results, candidate)
// expect: complete false — a test that has not run on the candidate's commit leaves the report incomplete
// counter-proof: planting `let complete = false;` as the initial value (never set back from the "not run" condition,
//                always false) would pass this one alone; instead planting `if (t.outcome === "not run") complete =
//                true;` (inverted) in report.mjs fails this test's assert.equal
test("releaseReport — incomplete while a test has not run on the candidate's commit", async () => {
  const at = fixtureSnapshot({ "SPEC.md": SPEC_TEXT, "tests/sample.test.mjs": TEST_FILE });
  const results = fixtureSnapshot({});
  const candidate = { version: "2026.4.0", tag: "v2026.4.0-rc.1", commit: CANDIDATE_COMMIT, changelog: "Entry." };
  const { complete } = await releaseReport(at, results, candidate);
  assert.equal(complete, false);
});

// ================================================================== acceptAndRelease

const REPORT_PATH = "docs/tests/releases/v2026.4.0.md";
const REPORT_COMMIT = "d".repeat(40);

function reportText({ limitations = [], testsRows }) {
  const limitationLines = limitations.length ? `\n${limitations.map((l) => `- ${l}`).join("\n")}\n\n` : "\n";
  const testsTable = ["| Test | Level | Outcome | Guards |", "|---|---|---|---|",
    ...testsRows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
  return ["---", "version: 2026.4.0", "candidate: v2026.4.0-rc.1", `commit: ${REPORT_COMMIT}`, "date: 2026-10-07", "---",
    "## Limitations", limitationLines, "## Levels", "",
    "| Level | Passed | Failed | Flaky | Not run |", "|---|---|---|---|---|", "| unit | 1 | 0 | 0 | 0 |", "",
    "## Tests", "", testsTable, "", "## Requirements", "",
    "| Requirement | Level | Tests | Outcome |", "|---|---|---|---|", "| A SAMPLE REQUIREMENT | unit | TST-001 | passed |", "",
    "## Changelog entry", "", "Adds the sample feature.", "",
  ].join("\n");
}

function releaseHost({ report, tags = {} }) {
  const branchFiles = { [REPORT_PATH]: report, "CHANGELOG.md": "# Changelog\n" };
  return fakeHost({ defaultBranch: "main", branchFiles, tags });
}

// guards: THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON; ACCEPTING THE RELEASE TEST REPORT RELEASES;
//         A RELEASE IS TAGGED AND LOGGED
// given: a green, complete report already committed at REPORT_PATH; the default branch moves on (an unrelated commit
//        lands) after the report's blob was shown and before Accept and release is clicked
// input: acceptAndRelease(host, { path, blob }, { limitations: {} }, "akmaier", "2026-10-07")
// expect: resolves with a commit (the approval record and the changelog entry together) and tag "v2026.4.0"; the tag
//         stands on the report's own `commit` front matter (REPORT_COMMIT), not on the just-made commit or on the
//         moved branch's new head (4b)
test("acceptAndRelease — one commit of the report's approval and the changelog entry, then the tag on the candidate's own commit, also when the default branch moved on (4b)", async () => {
  const text = reportText({ testsRows: [["TST-001", "unit", "passed", "A SAMPLE REQUIREMENT"]] });
  const host = releaseHost({ report: text });
  const blob = (await host.readSnapshot("main")).blob(REPORT_PATH);
  host.land({ "README.md": "unrelated change\n" }); // the default branch moved on since the report was shown
  const { commit, tag } = await acceptAndRelease(host, { path: REPORT_PATH, blob }, { limitations: {} }, "akmaier", "2026-10-07");
  assert.equal(tag, "v2026.4.0");
  assert.ok(commit);
  assert.equal(host.tagOf("v2026.4.0"), REPORT_COMMIT, "the tag stands on the candidate's own tested commit");
  const after = await host.readSnapshot("main");
  assert.match(await after.read("CHANGELOG.md"), /## v2026\.4\.0 — 2026-10-07/);
  assert.match(await after.read("CHANGELOG.md"), /Adds the sample feature\./);
  const approvalPath = [...after.paths].find((p) => p.startsWith("docs/approvals/release-v2026.4.0-"));
  assert.ok(approvalPath, "the approval record was committed");
  assert.match(await after.read(approvalPath), /kind: release-report/);
});

// guards: A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// given: a complete report whose "## Limitations" names a failing test and a worse rate, no reason given for either
// input: acceptAndRelease(host, { path, blob }, { limitations: {} }, "akmaier", "2026-10-07")
// expect: rejects LimitationMissing, naming both TST-002 and "TST-010 rate" (3a, 3b)
// counter-proof: planting `ids.filter(() => false)` in report.mjs's acceptAndRelease (nothing ever missing) fails
//                this test's assert.rejects
test("acceptAndRelease — LimitationMissing naming each failing test and worse rate without its reason (3a, 3b)", async () => {
  const text = reportText({
    limitations: ["TST-002: A SAMPLE REQUIREMENT", "TST-010 rate: A SAMPLE REQUIREMENT"],
    testsRows: [["TST-001", "unit", "passed", "A SAMPLE REQUIREMENT"], ["TST-002", "unit", "failed", "A SAMPLE REQUIREMENT"]],
  });
  const host = releaseHost({ report: text });
  const blob = (await host.readSnapshot("main")).blob(REPORT_PATH);
  await assert.rejects(
    () => acceptAndRelease(host, { path: REPORT_PATH, blob }, { limitations: {} }, "akmaier", "2026-10-07"),
    (error) => error.name === "LimitationMissing" && error.tests.includes("TST-002") && error.tests.includes("TST-010 rate"),
  );
});

// guards: A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// given: the same report, now with a reason recorded for both
// input: acceptAndRelease(host, { path, blob }, { limitations: { "TST-002": "known flaky fixture", "TST-010 rate": "model drift, accepted" } }, ...)
// expect: resolves (no LimitationMissing) — the known positive beside the rejection above
test("acceptAndRelease — resolves once every failing test and worse rate has its reason recorded", async () => {
  const text = reportText({
    limitations: ["TST-002: A SAMPLE REQUIREMENT", "TST-010 rate: A SAMPLE REQUIREMENT"],
    testsRows: [["TST-001", "unit", "passed", "A SAMPLE REQUIREMENT"], ["TST-002", "unit", "failed", "A SAMPLE REQUIREMENT"]],
  });
  const host = releaseHost({ report: text });
  const blob = (await host.readSnapshot("main")).blob(REPORT_PATH);
  const decision = { limitations: { "TST-002": "known flaky fixture", "TST-010 rate": "model drift (accepted)" } };
  const { tag } = await acceptAndRelease(host, { path: REPORT_PATH, blob }, decision, "akmaier", "2026-10-07");
  assert.equal(tag, "v2026.4.0");
});

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: a report whose "## Tests" still holds a "not run" test
// input: acceptAndRelease(host, { path, blob }, { limitations: {} }, ...)
// expect: rejects Incomplete
test("acceptAndRelease — Incomplete while the report's own tests still hold \"not run\"", async () => {
  const text = reportText({ testsRows: [["TST-001", "unit", "not run", "A SAMPLE REQUIREMENT"]] });
  const host = releaseHost({ report: text });
  const blob = (await host.readSnapshot("main")).blob(REPORT_PATH);
  await assert.rejects(
    () => acceptAndRelease(host, { path: REPORT_PATH, blob }, { limitations: {} }, "akmaier", "2026-10-07"),
    (error) => error.name === "Incomplete",
  );
});

// guards: A VERSION IS NOT REWRITTEN
// given: a green, complete report, but v2026.4.0 already stands as a tag (on a commit other than the report's own)
// input: acceptAndRelease(host, { path, blob }, { limitations: {} }, ...)
// expect: rejects TagExists; the existing tag still names its original commit, not moved (4a)
// counter-proof: planting `await host.createTag(tag, doc.fields.commit);` right after reading the report, before the
//                listTags precheck (removing the precheck) still fails via the host's own createTag below it, so the
//                genuine counter-proof instead removes both — commenting out the precheck AND the final createTag —
//                which fails this test's assert.rejects (nothing throws TagExists any more)
test("acceptAndRelease — TagExists, an existing tag not moved (4a)", async () => {
  const text = reportText({ testsRows: [["TST-001", "unit", "passed", "A SAMPLE REQUIREMENT"]] });
  const host = releaseHost({ report: text, tags: { "v2026.4.0": "default" } });
  const originalTagCommit = host.tagOf("v2026.4.0");
  const blob = (await host.readSnapshot("main")).blob(REPORT_PATH);
  await assert.rejects(
    () => acceptAndRelease(host, { path: REPORT_PATH, blob }, { limitations: {} }, "akmaier", "2026-10-07"),
    (error) => error.name === "TagExists",
  );
  assert.equal(host.tagOf("v2026.4.0"), originalTagCommit, "the existing tag was not moved");
});
