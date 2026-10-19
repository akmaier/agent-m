// Run on this commit (ITM-761) — MOD-test-pages' route `runs/<commit>`, UC-028 steps 5 to 7, 5a and 5b: the levels without a record preset, the participants that can run them (through `eligible`),
// the run panel with where the run happens, the paid services and the secrets by name, one click on Run that queues one job of the kind `run-tests`, its progress, and the two alternative flows (no
// participant can run the levels; no token).
// Run: node --test tests/test-pages-run-on-commit.test.mjs
//
// Module: MOD-test-pages
// Guards: UC-028; THE PAGE NAMES WHERE IT SENDS; ONE CLICK PER DECISION; A ROLE NAMES THE CAPABILITIES IT NEEDS; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// Level: unit
//
// The document is the small DOM of tests/site-frame-dom.mjs, imported unchanged, as tests/test-pages-runs.test.mjs does. The product and the instance are hosts of this file, kept to MOD-repository-hosts'
// interface (repositoryInfo, readSnapshot, readHistory, listPullRequests, listTags, listCiRuns, commitFiles, webLinks); the real MOD-job-catalogue, MOD-job-runner, MOD-participant-list, MOD-runtimes
// (queueJob, liveState, routesFor) and MOD-job-ledger run as they are, with the strategies the view hands the frame registered once, as the frame does. No request leaves the process; nothing waits.
// Where the texts leave a reading open, the test states the reading it takes, and the pull request names it:
//   - The levels offered are those the page lists (the levels of the commit's declared tests); the preset ones are those with no outcome on the commit (summary "not run on this commit").
//   - <button class="run-on-commit"> "Run on this commit" opens <section class="run-on-commit-form"> with <input class="level" type="checkbox"> per level, <input class="participant" type="radio"> per participant that
//     `eligible` admits for the capabilities of the kind `run-tests`, and <input class="person"> for the person's name (no identity setting exists). Once a participant and a name are chosen the run panel
//     (MOD-site-frame's runPanel) is drawn, with <p class="where"> (the route the job is queued on), <p class="paid-services"> and <p class="secrets-used"> (the names MOD-test-schedule's secretsNeeded gives).
//   - Participants on the tab's route (a model endpoint) run no code and are not offered a route here; the first other available route of a participant is the one used, as the review pages use it.
//   - A job is queued with parameters { commit, levels, occasion: "on demand" } where levels are the checked ones; progress is shown by <button class="check-progress"> "Check progress", which reads the job's record and asks
//     MOD-runtimes' liveState; <p class="progress"> says "queued" for a job no runtime has taken and "running" for one whose run the server lists as running. No timer runs.
//   - 5a: <p class="missing-capability"> names "run code and tests" and holds <a class="uc-017"> to #use-case/id=UC-017; no Run is offered. 5b (no token stored): no panel and no job; <p class="no-token"> names the commit and the
//     levels and holds <a class="workflow-page"> to webLinks().actions, the server's page of the workflows, where the reviewer starts the run.
// The counter-proofs are recorded in the pull request.

import "./site-frame-dom.mjs";
import test from "node:test";
import assert from "node:assert/strict";

const { view } = await import("../src/test-pages/index.mjs");
const { registerStrategies } = await import("../src/job-runner/index.mjs");
const { resourceStrategies } = await import("../src/resource-list/index.mjs");
const { resultStrategies } = await import("../src/result-records/index.mjs");
const { routeStrategies } = await import("../src/runtimes/index.mjs");
const { appendToRecord } = await import("../src/job-ledger/index.mjs");

// The strategies the kind run-tests meets, registered once as the frame registers them (the view's own are checked by TST-761008).
for (const [at, strategies] of [resultStrategies, routeStrategies, resourceStrategies].entries()) registerStrategies(`tests/test-pages-run-on-commit.test.mjs#${at}`, strategies);

const route = () => view.routes.find((candidate) => candidate.name === "runs");
const PRODUCT = "https://github.com/org/product";
const COMMIT = "c".repeat(40);
const HEAD = "a".repeat(40);
const WORKFLOW = ".github/workflows/agent-m-jobs.yml";

function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child.nodeType === 1) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => (node.className ?? "").split(" ").includes(name));
const byTag = (root, name) => descendants(root, (node) => node.localName === name);
const textOf = (node) => node.textContent.replace(/\s+/g, " ");
const flush = async () => { for (let n = 0; n < 60; n += 1) await new Promise((resolve) => setImmediate(resolve)); };
const trusted = async (node) => { const event = new Event("click"); Object.defineProperty(event, "isTrusted", { value: true }); node.dispatchEvent(event); await flush(); };
const changed = async (node) => { node.dispatchEvent(new Event("change")); await flush(); };
const runButton = (root) => byTag(root, "button").find((button) => textOf(button) === "Run");

// ---------------------------------------------------------------- the fixtures

const SPEC = ["# Fixture product — Specification", "", "## Section", "", "**A GUARDED RULE** *(Product Owner)*", "A rule.", "*Check:* `tests/sample.test.mjs`", ""].join("\n");
const declarations = (entries) => entries.map(([number, level]) => ["// TST-" + number + " · level: " + level + " · module: system", "// guards: A GUARDED RULE", "// given: g", "// input: i", "// expect: e",
  "test(\"t\", () => {});", ""].join("\n")).join("\n");
const TESTS = declarations([["901", "unit"], ["902", "system"], ["906", "release"]]);
// The commit has outcomes at the levels unit and system; the level release has none.
const RECORD = `---\ncommit: ${COMMIT}\nlevels:\n  - unit\n  - system\noccasion: commit\nparticipant: ci-hosted\ndate: 2026-10-18T10:00:00Z\n---\n`
  + "## Outcomes\n\n| Test | Level | Outcome | Runs |\n|---|---|---|---|\n| TST-901 | unit | passed | |\n| TST-902 | system | passed | |\n";
const RESULTS = { [`runs/${COMMIT}/20261018-1000-commit-aaaa.md`]: RECORD };

const REGISTER = `# Participants of this instance

**REGISTER**

The participants of the test instance.

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| hosted-ci | CI agent | example-model | 200000 | — | draft text, run code and tests | the server | ci hosted secret CI_KEY |
| writer | CLI agent | example-model | 200000 | — | draft text, read the repository | this machine | bridge lab-pc agent claude |
`;
const WRITERS_ONLY = REGISTER.replace("| hosted-ci | CI agent | example-model | 200000 | — | draft text, run code and tests | the server | ci hosted secret CI_KEY |\n", "");
const RESOURCE_HEAD = "| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|";
const RESOURCES = `# Resources of this product\n\n**REGISTER**\n\nThe resources.\n\n${RESOURCE_HEAD}\n`
  + "| oracle | endpoint | https://api.example.org/v1 | example-model | — | — | runner:cpu | the vendor | yes | ci:ORACLE_KEY |\n";
const SCHEDULE = "---\nnightly: 02:00\n---\n## Levels\n\n| Row | every commit | pull request | nightly | release candidate | on demand | runs on |\n|---|---|---|---|---|---|---|\n"
  + "| unit | ✓ | ✓ | ✓ | ✓ | ✓ | |\n| component | ✓ | ✓ | ✓ | ✓ | ✓ | |\n| system | ✓ | ✓ | ✓ | ✓ | ✓ | |\n| paid | | | ✓ | ✓ | ✓ | |\n| release | | | | ✓ | ✓ | |\n| user | | | | ✓ | ✓ | |\n";

const snapshotOf = (commit, files, extra = {}) => ({ commit, paths: Object.keys(files), blob: () => "b".repeat(40), read: async (path) => files[path] ?? null,
  repository: { server: "github", origin: "https://github.com", path: "org/product", web: PRODUCT }, ...extra });

/** The product's host: `written` keeps every commitFiles call; the files it commits stand on the default branch afterwards; `runs` is what listCiRuns gives. */
function productHost(options = {}) {
  const { web = PRODUCT, written = [] } = options;
  const files = { "SPEC.md": SPEC, "tests/sample.test.mjs": TESTS, "docs/tests/schedule.md": SCHEDULE, "docs/resources.md": RESOURCES, [WORKFLOW]: "name: Agent M jobs\n" };
  const entry = { commit: COMMIT, parents: [], author: { account: null, name: "x" }, date: "2026-10-17T09:00:00Z", message: "Fix the list", changes: [] };
  const committed = () => Object.fromEntries(written.flatMap((call) => call.files.map((file) => [file.path, options.taken ? appendToRecord(file.text, options.taken) : file.text])));
  return {
    repositoryInfo: async () => ({ defaultBranch: "main", visibility: "private", canWrite: true, archived: false, description: "" }),
    readHistory: async () => [entry],
    listPullRequests: async () => [],
    listTags: async () => [],
    readSnapshot: async (ref) => (ref === "test-results" ? snapshotOf("r".repeat(40), RESULTS) : snapshotOf(ref === "main" ? HEAD : ref, { ...files, ...committed() })),
    commitFiles: async (call) => { written.push(call); return { commit: "f".repeat(40) }; },
    listCiRuns: async () => options.runs ?? [],
    ciRunLog: async () => null,
    webLinks: () => ({ actions: `${web}/actions`, run: (id) => `${web}/actions/runs/${id}`, secrets: `${web}/settings/secrets/actions`, commitRuns: (commit) => `${web}/commit/${commit}/checks`,
      branch: (name) => `${web}/tree/${name}` }),
  };
}
const instanceHost = (register) => ({
  repositoryInfo: async () => ({ defaultBranch: "main", visibility: "public", canWrite: true }),
  readSnapshot: async () => ({ commit: "i".repeat(40), paths: ["docs/participants.md"], blob: () => "b".repeat(40), read: async (path) => (path === "docs/participants.md" ? register : null) }),
});

async function page(options = {}) {
  const { register = REGISTER, tokenStored = true } = options;
  const context = { page: "main", instance: { repository: "alice/agent-m", host: instanceHost(register) }, store: null, go() {},
    product: { address: PRODUCT, kind: "github", host: productHost(options), tokenStored } };
  const target = document.createElement("div");
  document.body.append(target);
  await route().render(target, context, { commit: COMMIT });
  return target;
}
const open = async (shown) => { await trusted(byClass(shown, "run-on-commit")[0]); return byClass(shown, "run-on-commit-form")[0]; };
const choose = async (form, name = "Reviewer Rae") => {
  byClass(form, "person")[0].value = name;
  const radio = byClass(form, "participant")[0];
  radio.checked = true;
  await changed(radio);
};

// TST-761001 · level: unit · module: MOD-test-pages
// guards: UC-028 (5); THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: a commit with outcomes at the levels unit and system and none at the level release; a token stored
// input: the route runs/<commit> rendered; the person's click on Run on this commit
// expect: drawing writes nothing and shows a button Run on this commit and no form; the click shows one checkbox per level, release the only one checked, and still writes nothing
test("run on this commit — the levels without a record are preset, and nothing is written by drawing or by opening", async () => {
  const written = [];
  const shown = await page({ written });
  assert.equal(byClass(shown, "run-on-commit").length, 1);
  assert.equal(byClass(shown, "run-on-commit-form").length, 0);
  const form = await open(shown);
  const levels = byClass(form, "level");
  assert.deepEqual(levels.map((box) => box.value).sort(), ["release", "system", "unit"]);
  assert.deepEqual(levels.filter((box) => box.checked).map((box) => box.value), ["release"]);
  assert.deepEqual(written, []);
});

// TST-761002 · level: unit · module: MOD-test-pages
// guards: UC-028 (5); A ROLE NAMES THE CAPABILITIES IT NEEDS
// given: a register with hosted-ci (declares run code and tests) and writer (does not)
// input: Run on this commit pressed
// expect: the participants offered are hosted-ci alone
test("run on this commit — only the participants that can run code and tests are offered", async () => {
  const form = await open(await page());
  assert.deepEqual(byClass(form, "participant").map((radio) => radio.value), ["hosted-ci"]);
});

// TST-761003 · level: unit · module: MOD-test-pages
// guards: UC-028 (5); THE PAGE NAMES WHERE IT SENDS
// given: hosted-ci chosen with a name, the level release checked; the resource list marks the endpoint oracle paid with the secret ORACLE_KEY
// input: the participant chosen
// expect: the run panel is drawn with the destination hosted-ci, a Run button, the route "ci hosted", the paid service oracle and the secret ORACLE_KEY by name; nothing is written
test("run on this commit — the run panel names where the run happens, the paid services and the secrets by name", async () => {
  const written = [];
  const shown = await page({ written });
  const form = await open(shown);
  await choose(form);
  const panel = byClass(form, "run-panel")[0];
  assert.ok(panel, "a run panel");
  assert.match(textOf(panel), /hosted-ci/);
  assert.ok(runButton(panel), "Run is offered");
  assert.match(textOf(byClass(form, "where")[0]), /ci hosted/);
  assert.match(textOf(byClass(form, "paid-services")[0]), /oracle/);
  assert.match(textOf(byClass(form, "secrets-used")[0]), /ORACLE_KEY/);
  assert.doesNotMatch(textOf(form), /sk-|secret value/i);
  assert.deepEqual(written, []);
});

// TST-761004 · level: unit · module: MOD-test-pages
// guards: UC-028 (5, 6); ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the run panel for hosted-ci and the level release
// input: a click a script makes on Run; the person's click on Run; a second click of the person
// expect: the script's click writes nothing; the person's click commits exactly one start record under docs/jobs/ of kind run-tests, working on the commit, for hosted-ci, on the route ci hosted, started by the name entered, with the parameters commit, levels [release] and occasion on-demand; the second click adds none
test("run on this commit — one click on Run queues one job of the kind run-tests with the commit and the levels", async () => {
  const written = [];
  const shown = await page({ written });
  const form = await open(shown);
  await choose(form);
  const button = runButton(byClass(form, "run-panel")[0]);
  button.dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(written, []);
  await trusted(button);
  await trusted(button);
  assert.equal(written.length, 1);
  assert.equal(written[0].files.length, 1);
  const { path, text } = written[0].files[0];
  assert.match(path, /^docs\/jobs\/JOB-[^/]+\.md$/);
  for (const line of ["kind: run-tests", "participant: hosted-ci", "route: ci hosted", "started_by: Reviewer Rae", COMMIT]) assert.ok(text.includes(line), `the record holds ${line}`);
  assert.match(text, /"levels":\s*\[\s*"release"\s*\]/);
  assert.match(text, /"occasion":\s*"on-demand"/);
  assert.match(textOf(byClass(form, "job-queued")[0]), /JOB-/);
});

// TST-761005 · level: unit · module: MOD-test-pages
// guards: UC-028 (6, 7)
// given: the queued job; the record as committed, untaken
// input: the person's click on Check progress; then the job taken on a CI run the server lists as running; the click again
// expect: the first reading says the job is queued; the second says it is running
test("run on this commit — the progress of the queued job is read from its record and the runtime", async () => {
  const written = [];
  const taken = { part: "taken", at: new Date("2026-10-18T10:05:00Z"), by: `${PRODUCT}/actions/runs/42` };
  const options = { written, runs: [], taken: null };
  const shown = await page(options);
  const form = await open(shown);
  await choose(form);
  await trusted(runButton(byClass(form, "run-panel")[0]));
  await trusted(byClass(form, "check-progress")[0]);
  assert.match(textOf(byClass(form, "progress")[0]), /queued/);
  options.taken = taken;
  options.runs = [{ id: "42", workflow: "agent-m-jobs.yml", commit: HEAD, event: "push", state: "running", url: taken.by, started: null, ended: null }];
  await trusted(byClass(form, "check-progress")[0]);
  assert.match(textOf(byClass(form, "progress")[0]), /running/);
});

// TST-761006 · level: unit · module: MOD-test-pages
// guards: UC-028 (5a); A ROLE NAMES THE CAPABILITIES IT NEEDS
// given: a register in which no participant declares run code and tests
// input: Run on this commit pressed
// expect: no participant is offered and no Run; the page names the capability "run code and tests" and links UC-017 (#use-case/id=UC-017); nothing is written
test("run on this commit — where no participant can run the levels the missing capability is named with a link to UC-017", async () => {
  const written = [];
  const form = await open(await page({ register: WRITERS_ONLY, written }));
  assert.equal(byClass(form, "participant").length, 0);
  assert.equal(runButton(form), undefined);
  const missing = byClass(form, "missing-capability")[0];
  assert.match(textOf(missing), /run code and tests/);
  assert.deepEqual(byTag(missing, "a").map((link) => link.getAttribute("href")), ["#use-case/id=UC-017"]);
  assert.deepEqual(written, []);
});

// TST-761007 · level: unit · module: MOD-test-pages
// guards: UC-028 (5b); THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: no token stored for the product
// input: Run on this commit pressed
// expect: no participant list, no run panel and no job; the page names the commit and the preset levels and links the server's page of workflows (webLinks().actions)
test("run on this commit — without a token the server's workflow page is linked, with the commit named, and nothing is queued", async () => {
  const written = [];
  const shown = await page({ tokenStored: false, written });
  await trusted(byClass(shown, "run-on-commit")[0]);
  assert.equal(byClass(shown, "run-panel").length, 0);
  assert.equal(byClass(shown, "participant").length, 0);
  const notice = byClass(shown, "no-token")[0];
  assert.ok(textOf(notice).includes(COMMIT) && /release/.test(textOf(notice)), textOf(notice));
  assert.deepEqual(byTag(notice, "a").map((link) => link.getAttribute("href")), [`${PRODUCT}/actions`]);
  assert.deepEqual(written, []);
});

// TST-761008 · level: unit · module: MOD-test-pages
// guards: UC-028 (5, 6)
// given: the view of MOD-test-pages
// input: its strategies read
// expect: they are MOD-result-records' resultStrategies and MOD-runtimes' routeStrategies, which the frame registers for the kind run-tests
test("run on this commit — the view hands resultStrategies and routeStrategies to the frame", () => {
  assert.ok(view.strategies.includes(resultStrategies), "resultStrategies");
  assert.ok(view.strategies.includes(routeStrategies), "routeStrategies");
});
