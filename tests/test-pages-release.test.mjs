// MOD-test-pages' route `release` — the release panel (UC-013), as docs/architecture/MOD-test-pages.md states it and
// ITM-256 builds it: the next version of the product's own line and the changelog entry, both editable, before *Start
// release candidate*; the candidate and its queued run after it; once the run has ended, every level with its result,
// every model-dependent check as a rate, and the release test report with its "## Requirements", with *Accept and
// release*, which asks first for the reason of every failing test and every worse rate; the year that changed (1a),
// the participant missing for the release tests (2a), a red level (3a), a worse rate (3b), a tag that exists (4a) and
// a default branch that moved on (4b); each step's folded explanation (ITM-255).
//
// Run: node --test tests/test-pages-release.test.mjs
//
// Module: MOD-test-pages
// Guards: UC-013; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// Level: unit
//
// Not part of ITM-256, and not tested here (the item's own Outcome): the audit drawn inside the panel (UC-030), the
// run on the job list (UC-036), the routes schedule/runs/generate, and how the dashboard reaches this route (a change
// between jobs after this item). MOD-release-evidence's own nextVersion/startReleaseCandidate/releaseReport/
// acceptAndRelease correctness is already guarded by tests/release-evidence.test.mjs and is not retested here — only
// that this route calls them with what the form and the host hold, and shows or writes what they return; explain()'s
// own rendering of a topic's Markdown and renderArtifact's own sanitising are already guarded by tests/
// site-frame.test.mjs and tests/markdown-render.test.mjs.
//
// Node has no DOM: this file brings the one of tests/settings-pages-add-product.test.mjs (itself tests/
// site-frame.test.mjs's), so that renderArtifact's renderer (MOD-markdown-render, DOMPurify) and explain() run as
// they do in a browser. The host is a fake kept to MOD-repository-hosts' interface, as tests/release-evidence.test.mjs's
// own (adapted here for one host that carries both a schedule and job workflow, for startReleaseCandidate, and SPEC.md
// and test files, for releaseReport) — no request leaves the process. After a click the test waits, with `until` of
// tests/prompt-bar.d/until.mjs, for the condition it then asserts, bounded by ten seconds of the clock and failing "never:
// <what>" (ITM-625); it never waits by a count of turns. The counter-proofs are recorded in the pull request's description.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { until } from "./prompt-bar.d/until.mjs";

// The document is that of the frame's fixture DOM, tests/site-frame-dom.mjs, installed as the globals `document` and `window` when it is imported.
import "./site-frame-dom.mjs";
import { withStoredGraph } from "./stored-graph-fake.mjs";

// The modules, loaded once the document is there (a static import of them would run before the lines above could
// set it up).
const { route } = await import("../src/test-pages/release.mjs");
const { explain } = await import("../src/site-frame/index.mjs");
const { nextVersion } = await import("../src/release-evidence/index.mjs");

// ---------------------------------------------------------------- DOM helpers: elements, typing, clicking

function elements(root, match) {
  const found = [];
  (function walk(n) { for (const k of n.childNodes) if (k.nodeType === 1) { if (match(k)) found.push(k); walk(k); } })(root);
  return found;
}
const byTag = (root, name) => elements(root, (e) => e.localName === name);
const byClass = (root, name) => elements(root, (e) => e.className.split(" ").includes(name));
const type = (field, text) => { field.value = text; field.dispatchEvent(new Event("input")); };
// A click's handler crosses several real async boundaries (blobSha's WebCrypto digest, more than once) besides the
// fake host's already-resolved promises, so the time it takes is not known in turns of the event loop. After a click the
// test waits for the condition it then asserts: `until` (tests/prompt-bar.d/until.mjs) checks it between turns and fails
// "never: <what>" after ten seconds of the clock.
const click = async (button, condition, what) => { button.dispatchEvent(new Event("click")); await until(condition, what); };
const shows = (target, pattern) => () => pattern.test(target.textContent);
const runQueued = (target) => () => /Queued run: JOB-/.test(target.textContent) && /has not finished/.test(target.textContent);
const released = (target, version) => shows(target, new RegExp(`Released v${version.replace(/\./g, "\\.")}`));

function connectedTarget() {
  const target = document.createElement("div");
  document.body.append(target);
  return target;
}

async function renderPage(context, params = {}) {
  const target = connectedTarget();
  await route.render(target, context, params);
  return target;
}

const explainedAs = (topic) => explain(topic).textContent;
const looksExplained = (e) => (e.localName === "details" && e.className === "explain")
  || (e.localName === "div" && e.className === "" && e.childNodes.length === 0);

// ================================================================== the fake host (MOD-repository-hosts' interface:
// paths, read(path), blob(path), repositoryInfo, readSnapshot, listTags, commitFiles, createTag), adapted from
// tests/release-evidence.test.mjs's own fakeHost: one repository in memory, no fetch, no network.

const blobSha = (text) => {
  const body = Buffer.from(text, "utf8");
  return createHash("sha1").update(`blob ${body.length}\0`).update(body).digest("hex");
};
const failure = (name, fields = {}) => Object.assign(new Error(`${name} ${JSON.stringify(fields)}`), { name, ...fields });
const globPattern = (pattern) => new RegExp(`^${(pattern ?? "*").split("*").map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`);

function fakeHost({ defaultBranch = "main", branchFiles = {}, tags = {} } = {}) {
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
  for (const [name, commit] of Object.entries(tags)) tagMap.set(name, commit === "default" ? defaultCommit : commit);

  const calls = [];
  return {
    calls,
    defaultCommit,
    land(files) { branches.set(defaultBranch, makeCommit({ ...Object.fromEntries(commits.get(branches.get(defaultBranch))), ...files })); },
    addBranch(name, files) { branches.set(name, makeCommit(files)); },
    tagOf: (name) => tagMap.get(name),
    async repositoryInfo() {
      return { defaultBranch, visibility: "public", canWrite: true, archived: false, description: "" };
    },
    async readSnapshot(ref) {
      const sha = branches.get(ref) ?? tagMap.get(ref) ?? (commits.has(ref) ? ref : null);
      if (!sha) throw failure("NotFound", { what: ref });
      const tree = commits.get(sha);
      // The graph of every commit is stored on trace-cache, as the workflow "main changed" stores it (tests/stored-graph-fake.mjs).
      return withStoredGraph({
        repository: { server: "github", origin: "https://github.com", path: "org/product", web: "https://github.com/org/product" },
        ref, commit: sha, paths: [...tree.keys()],
        read: async (path) => (tree.has(path) ? tree.get(path) : null),
        blob: (path) => (tree.has(path) ? blobSha(tree.get(path)) : null),
      });
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

// ---------------------------------------------------------------- fixtures: a product with a schedule and job
// workflow (for startReleaseCandidate's checkRunners), SPEC.md and test files (for releaseReport).

const WORKFLOW_PATH = ".github/workflows/agent-m-jobs.yml";
const SCHEDULE_PATH = "docs/tests/schedule.md";
const RUNNER = "developer-sonnet-e";
const IMPLEMENTER = "developer-sonnet-b";

function scheduleText(runsOn) {
  const rows = ["unit", "component", "system", "paid", "release", "user"]
    .map((level) => `| ${level} | ✓ | ✓ | ✓ | ✓ | ✓ | ${runsOn[level] ?? ""} |`);
  return ["---", "nightly: 02:00", "---", "## Levels", "", "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |",
    "|---|---|---|---|---|---|---|", ...rows, ""].join("\n");
}

function jobRecordText({ id, kind, participant, worksOn }) {
  return ["---", `id: ${id}`, `kind: ${kind}`, "works_on:", ...worksOn.map((w) => `  - ${w}`),
    `participant: ${participant}`, "route: tab", "started_by: po-opus", "start: 2026-10-01 09:00 UTC",
    "agent_m: 2026.9.0, commit aaaaaaaaaaaa", "limit: 5", "---", "## Destinations", "",
    `- ${participant}, at this machine: the item.`, "", "## Parameters", "", "```json", "{}", "```", ""].join("\n");
}

const SPEC_TEXT = ["# Fixture product — Specification", "", "## Section", "",
  "**A SAMPLE REQUIREMENT** *(Product Owner)*", "A sample rule.", "*Check:* `tests/sample.test.mjs`", ""].join("\n");
const TEST_FILE = ["// TST-001", "// level: unit", "// guards: A SAMPLE REQUIREMENT", ""].join("\n");
const MULTI_TEST_FILE = [
  "// TST-001", "// level: unit", "// guards: A SAMPLE REQUIREMENT", "",
  "// TST-002", "// level: unit", "// guards: A SAMPLE REQUIREMENT", "",
  "// TST-010", "// level: unit", "// guards: A SAMPLE REQUIREMENT", "// runs: 10", "// phrasings: 2", "",
].join("\n");

function runRecord({ commit, rows }) {
  const table = ["| Test | Level | Outcome | Runs |", "|---|---|---|---|", ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
  return ["---", `commit: ${commit}`, "levels:", "  - unit", "occasion: release-candidate", "participant: ci",
    "date: 2026-10-07 10:00 UTC", "---", "## Outcomes", "", table, ""].join("\n");
}

function lastReleaseReportText(commit) {
  return ["---", "version: 2026.3.0", "candidate: v2026.3.0-rc.1", `commit: ${commit}`, "date: 2026-09-01", "---",
    "## Limitations", "", "## Levels", "", "| Level | Passed | Failed | Flaky | Not run |", "|---|---|---|---|---|",
    "| unit | 1 | 0 | 0 | 0 |", "", "## Tests", "",
    "| Test | Level | Outcome | Guards |", "|---|---|---|---|", "| TST-010 | unit | 8 of 10 | A SAMPLE REQUIREMENT |", "",
    "## Requirements", "", "| Requirement | Level | Tests | Outcome |", "|---|---|---|---|",
    "| A SAMPLE REQUIREMENT | unit | TST-010 | passed |", "", "## Changelog entry", "", "Earlier release.", "",
  ].join("\n");
}

// A combined host: the schedule and job workflow a schedule needs (startReleaseCandidate), SPEC.md and the given test
// files (releaseReport), a CHANGELOG.md (acceptAndRelease), and the given tags. `runsOn` defaults to a runner distinct
// from any recorded implementer, so the main flow needs no 2a detour. The product's test-results branch is added
// separately, once the default commit (the candidate's own, since starting one only tags the current head) is known.
function releaseHost({ runsOn = { release: RUNNER, user: RUNNER }, jobs = {}, testFiles = { "tests/sample.test.mjs": TEST_FILE },
  extraFiles = {}, tags = {} } = {}) {
  const branchFiles = {
    [WORKFLOW_PATH]: "name: Agent M jobs\n",
    [SCHEDULE_PATH]: scheduleText(runsOn),
    "SPEC.md": SPEC_TEXT,
    "CHANGELOG.md": "# Changelog\n",
    ...testFiles,
    ...extraFiles,
    ...Object.fromEntries(Object.entries(jobs).map(([id, job]) => [`docs/jobs/${id}.md`, jobRecordText({ id, ...job })])),
  };
  const host = fakeHost({ defaultBranch: "main", branchFiles, tags });
  host.addBranch("test-results", {}); // the run has not recorded anything yet
  return host;
}

const contextOf = (host) => ({ page: "releases", instance: { repository: "org/product" },
  product: { address: "https://github.com/org/product", kind: "github", host }, store: null, go() {} });

// ==================================================================================================================

// TST-473091 · level: unit · module: MOD-test-pages
// guards: UC-013; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: a product with no release tag yet, a schedule naming a runner distinct from any implementer, no test-results record of the candidate's own commit yet
// input: render; Start release candidate, one click; before the run has ended, Check results; once test-results records TST-001 passed on that same commit, Check results again; Accept and release, one click
// expect: the next version (from nextVersion) and an empty, editable changelog entry are shown before Start; after Start, the candidate's tag and its queued run are named; before the run has ended, the report is not shown as complete; once it has, the rendered report names the level, the test and the requirement it guards, with no reason field asked (the run is green); Accept and release releases, in one click
test("release — main flow: version and entry before Start, the candidate and its run after it, the report once the run has ended, Accept and release in one click", async () => {
  const host = releaseHost();
  const context = contextOf(host);
  const target = await renderPage(context);

  const versionField = byClass(target, "version")[0];
  const expectedVersion = (await import("../src/release-evidence/index.mjs")).nextVersion([], "minor", new Date().toISOString().slice(0, 10));
  assert.equal(versionField.value, expectedVersion);
  const changelogField = byClass(target, "changelog")[0];
  assert.equal(changelogField.value, "");
  assert.deepEqual(elements(target, looksExplained).map((e) => e.textContent),
    [explainedAs("release-test-levels"), explainedAs("independent-release-tests")]);

  type(changelogField, "Adds the sample feature.");
  type(byClass(target, "person")[0], "akmaier");
  await click(byClass(target, "start")[0], () => new RegExp(`Release candidate v${expectedVersion.replace(/\./g, "\\.")}-rc\\.1`).test(target.textContent)
    && /Queued run: JOB-/.test(target.textContent) && /has not finished/.test(target.textContent),
  "the candidate, its queued run and that the run has not finished");

  assert.match(target.textContent, new RegExp(`Release candidate v${expectedVersion.replace(/\./g, "\\.")}-rc\\.1`));
  assert.match(target.textContent, /Queued run: JOB-/);
  assert.match(target.textContent, /has not finished/);
  assert.equal(byClass(target, "accept").length, 0, "no Accept and release before the run has ended");

  // The run ends: test-results now records TST-001 passed on the candidate's own commit (host.defaultCommit, since
  // starting a candidate only tags the current head).
  host.addBranch("test-results", {
    [`runs/${host.defaultCommit}/20261007-1000-release-candidate-aaaa.md`]: runRecord({ commit: host.defaultCommit, rows: [["TST-001", "unit", "passed", ""]] }),
  });
  await click(byClass(target, "refresh")[0], () => byClass(target, "accept").length > 0 && /A SAMPLE REQUIREMENT/.test(target.textContent)
    && /TST-001/.test(target.textContent), "the complete report with Accept and release, naming the requirement and TST-001");

  assert.match(target.textContent, /A SAMPLE REQUIREMENT/);
  assert.match(target.textContent, /TST-001/);
  const accept = byClass(target, "accept")[0];
  assert.ok(accept, "the report is complete, so Accept and release is offered");
  assert.equal(byClass(accept, "reason").length, 0, "no reason is asked where nothing failed and no rate is worse");
  assert.deepEqual(elements(accept, looksExplained).map((e) => e.textContent), [explainedAs("version-not-rewritten")]);

  type(byClass(accept, "person")[0], "akmaier");
  await click(byClass(accept, "accept")[0], shows(target, new RegExp(`Released v${expectedVersion.replace(/\./g, "\\.")} \\(commit [0-9a-f]{40}\\)\\.`)),
    "Released with the tagged commit");
  assert.match(target.textContent, new RegExp(`Released v${expectedVersion.replace(/\./g, "\\.")} \\(commit [0-9a-f]{40}\\)\\.`));
  assert.ok(host.tagOf(`v${expectedVersion}`), "the release tag now stands");
});

// TST-473092 · level: unit · module: MOD-test-pages
// guards: UC-013; CALENDAR VERSIONS
// given: the product's own last release tag stands in an earlier year than today
// input: render
// expect: the version field shows <this year>.1.0, not a minor step of the earlier year's version
test("release — 1a: the year that changed restarts the version at YYYY.1.0", async () => {
  const lastYear = new Date().getUTCFullYear() - 1;
  const host = releaseHost({ tags: { [`v${lastYear}.9.3`]: "default" } });
  const context = contextOf(host);
  const target = await renderPage(context);
  const versionField = byClass(target, "version")[0];
  assert.equal(versionField.value, `${new Date().getUTCFullYear()}.1.0`);
});

// TST-473093 · level: unit · module: MOD-test-pages
// guards: UC-013; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
// given: the schedule's "release" row names the only participant that ever implemented anything in this product
// input: Start release candidate
// expect: the panel says only the implementer could run the release tests, naming 2a, and asks to assign a second participant or to run the release tests as a person; no candidate is shown
test("release — 2a: only the implementing participant can run the release tests", async () => {
  const host = releaseHost({
    runsOn: { release: IMPLEMENTER, user: RUNNER },
    jobs: { "JOB-20261001-0900-aaaa": { kind: "implement", participant: IMPLEMENTER, worksOn: ["ITM-200"] } },
  });
  const context = contextOf(host);
  const target = await renderPage(context);
  type(byClass(target, "person")[0], "akmaier");
  await click(byClass(target, "start")[0], () => /Only the implementer/.test(target.textContent) && /2a/.test(target.textContent),
    "the panel naming 2a: only the implementer could run the release tests");
  assert.match(target.textContent, /Only the implementer/);
  assert.match(target.textContent, /2a/);
  assert.equal(byClass(target, "report").length, 0, "no candidate was started");
});

// TST-473094 · level: unit · module: MOD-test-pages
// guards: UC-013; A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
// given: a complete run with one failing test (TST-002) and one model-dependent test (TST-010) whose rate, 6 of 10, is worse than the last release's own report names (8 of 10, found in the candidate's own commit)
// input: Start release candidate; once the run has ended, Accept and release without a reason, then with one for each
// expect: a reason field is shown for TST-002 and for TST-010 before any click (asked first); Accept and release without them names both as missing; with a reason for each, it releases
test("release — 3a/3b: a red level and a worse rate ask for a reason first; without one Accept and release is refused, with one it releases", async () => {
  const host = releaseHost({
    testFiles: { "tests/sample.test.mjs": MULTI_TEST_FILE },
    extraFiles: { "docs/tests/releases/v2026.3.0.md": lastReleaseReportText("e".repeat(40)) },
  });
  host.addBranch("test-results", {
    ["runs/" + "e".repeat(40) + "/20260901-1000-release-candidate-aaaa.md"]: runRecord({ commit: "e".repeat(40), rows: [["TST-010", "unit", "passed", "8 of 10"]] }),
  });
  const context = contextOf(host);
  const target = await renderPage(context);
  const expectedVersion = byClass(target, "version")[0].value;
  type(byClass(target, "changelog")[0], "Adds the sample feature.");
  type(byClass(target, "person")[0], "akmaier");
  await click(byClass(target, "start")[0], runQueued(target), "the candidate, its queued run and that the run has not finished");

  host.addBranch("test-results", {
    [`runs/${host.defaultCommit}/20261007-1000-release-candidate-bbbb.md`]: runRecord({
      commit: host.defaultCommit, rows: [["TST-001", "unit", "passed", ""], ["TST-002", "unit", "failed", ""], ["TST-010", "unit", "passed", "6 of 10"]],
    }),
    ["runs/" + "e".repeat(40) + "/20260901-1000-release-candidate-aaaa.md"]: runRecord({ commit: "e".repeat(40), rows: [["TST-010", "unit", "passed", "8 of 10"]] }),
  });
  await click(byClass(target, "refresh")[0], () => (byClass(byClass(target, "accept")[0] ?? target, "reason").map((r) => r.dataset.id).sort().join() === "TST-002,TST-010"),
    "Accept and release with a reason field for TST-002 and TST-010");

  const accept = byClass(target, "accept")[0];
  const reasons = byClass(accept, "reason");
  assert.deepEqual(reasons.map((r) => r.dataset.id).sort(), ["TST-002", "TST-010"], "a reason is asked for the failing test and the worse rate, before any click");

  type(byClass(accept, "person")[0], "akmaier");
  await click(byClass(accept, "accept")[0], shows(target, /Enter a reason for every failing test and worse rate/), "the refusal asking for a reason for every failing test and worse rate");
  assert.match(target.textContent, /Enter a reason for every failing test and worse rate/);
  assert.match(target.textContent, /TST-002/);
  assert.match(target.textContent, /TST-010/);
  assert.equal(host.tagOf(`v${expectedVersion}`), undefined, "nothing is tagged while a reason is missing");

  for (const r of reasons) type(r, r.dataset.id === "TST-002" ? "known flaky fixture" : "model drift (accepted)");
  await click(byClass(accept, "accept")[0], released(target, expectedVersion), "Released, with the version");
  assert.match(target.textContent, new RegExp(`Released v${expectedVersion.replace(/\./g, "\\.")}`));
  assert.ok(host.tagOf(`v${expectedVersion}`));
});

// TST-473095 · level: unit · module: MOD-test-pages
// guards: UC-013; A VERSION IS NOT REWRITTEN
// given: a green, complete candidate for a version whose own release tag already stands (typed into the editable version field) on a commit other than the candidate's
// input: Start release candidate (for that typed version); once the run has ended, Accept and release
// expect: the release stops, naming 4a; the existing tag is not moved
test("release — 4a: a tag that already exists stops the release, naming 4a; the existing tag is not moved", async () => {
  const host = releaseHost({ tags: { "v2026.4.0": "default" } });
  const originalTagCommit = host.tagOf("v2026.4.0");
  const context = contextOf(host);
  const target = await renderPage(context);
  type(byClass(target, "version")[0], "2026.4.0");
  type(byClass(target, "changelog")[0], "Adds the sample feature.");
  type(byClass(target, "person")[0], "akmaier");
  await click(byClass(target, "start")[0], runQueued(target), "the candidate, its queued run and that the run has not finished");

  host.addBranch("test-results", {
    [`runs/${host.defaultCommit}/20261007-1000-release-candidate-aaaa.md`]: runRecord({ commit: host.defaultCommit, rows: [["TST-001", "unit", "passed", ""]] }),
  });
  await click(byClass(target, "refresh")[0], () => byClass(target, "accept").length > 0, "the complete report with Accept and release");
  const accept = byClass(target, "accept")[0];
  type(byClass(accept, "person")[0], "akmaier");
  await click(byClass(accept, "accept")[0], () => /already stands/.test(target.textContent) && /4a/.test(target.textContent), "the stop naming 4a: the tag already stands");

  assert.match(target.textContent, /already stands/);
  assert.match(target.textContent, /4a/);
  assert.equal(host.tagOf("v2026.4.0"), originalTagCommit, "the existing tag was not moved");
});

// TST-473096 · level: unit · module: MOD-test-pages
// guards: UC-013
// given: a green, complete candidate; the default branch moves on (an unrelated commit lands) after the report was shown and before Accept and release is clicked
// input: Accept and release
// expect: the release still succeeds, tagged on the candidate's own tested commit — not the branch's new head
test("release — 4b: a default branch that moved on while the suite ran still releases, tagged on the tested commit", async () => {
  const host = releaseHost();
  const context = contextOf(host);
  const target = await renderPage(context);
  const expectedVersion = byClass(target, "version")[0].value;
  const candidateCommit = host.defaultCommit;
  type(byClass(target, "changelog")[0], "Adds the sample feature.");
  type(byClass(target, "person")[0], "akmaier");
  await click(byClass(target, "start")[0], runQueued(target), "the candidate, its queued run and that the run has not finished");

  host.addBranch("test-results", {
    [`runs/${candidateCommit}/20261007-1000-release-candidate-aaaa.md`]: runRecord({ commit: candidateCommit, rows: [["TST-001", "unit", "passed", ""]] }),
  });
  await click(byClass(target, "refresh")[0], () => byClass(target, "accept").length > 0, "the complete report with Accept and release");

  host.land({ "README.md": "unrelated change\n" }); // 4b: the default branch moves on while the suite ran

  const accept = byClass(target, "accept")[0];
  type(byClass(accept, "person")[0], "akmaier");
  await click(byClass(accept, "accept")[0], released(target, expectedVersion), "Released, with the version");

  assert.match(target.textContent, new RegExp(`Released v${expectedVersion.replace(/\./g, "\\.")}`));
  assert.equal(host.tagOf(`v${expectedVersion}`), candidateCommit, "tagged on the candidate's own tested commit, not the moved branch's new head");
});
