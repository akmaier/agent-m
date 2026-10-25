// The schedule page, up to Save (ITM-758) — MOD-test-pages' route `schedule`, as docs/architecture/MOD-test-pages.md and UC-027 steps 1 to 4
// state it: the table of levels by occasion with each row's number of tests, the book's default marked as such until one is saved, a folded
// "What is this?" per row and column naming the book's chapter, the cells that refuse with their reasons, the nightly time and the test command, the
// runner per row among the participants with "run code and tests", and the secrets needed by name with the server's secrets page, never asking for a
// value. Not part of this item: Save (ITM-759) and UC-027 3b, the runner's state, the registration page and the command (ITM-850).
// Run: node --test tests/test-pages-schedule.test.mjs
//
// Module: MOD-test-pages
// Guards: UC-027; THE TEST SCHEDULE IS DECLARED PER PRODUCT; THE DEFAULT SCHEDULE FOLLOWS THE BOOK; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; COMMIT TESTS CALL NO PAID SERVICE; NO SECRET IN THE REPOSITORY; EVERY STEP EXPLAINS ITSELF; THE SITE SERVES A SCREEN READER; EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// Level: unit
//
// The document is the small DOM of tests/site-frame-dom.mjs, imported unchanged, as the tests of the settings pages do. The product and the instance are
// hosts of this file, kept to MOD-repository-hosts' interface (repositoryInfo, readSnapshot, webLinks): no request leaves the process, nothing waits.
// Where the texts leave a reading open, the test states the reading it takes, and the pull request names it:
//   - A test that calls a paid service (its declaration's `paid` key) counts under the row `paid` and also under the row of its own level: the schedule's schema
//     says the row `paid` cuts across the levels.
//   - The cells that refuse are the cells of the column release candidate, in every row, and the cells every commit and pull request of the row paid.
//   - ITM-1208: the axe rule select-name, which tests/site-accessibility.test.mjs (#1324) runs on the live route #schedule, is checked here on the module's
//     route itself, drawn in the small DOM: a select is named as the accessible-name computation names it — aria-labelledby, aria-label, a label it stands
//     in, its title. "Named by its level and occasion" is read as: the name holds the row (its level, or paid) and the title of the column the choice stands
//     in, "runs on", which holds for every occasion of the row.
//   - ITM-1207: the width check of tests/site-usability.test.mjs (#1324), which draws the live route #schedule at a phone's 390 px, is taken here on the
//     module's route itself, drawn in the small DOM, against the frame's rule (MOD-site-frame, look.css): a table takes its narrow form below 600 px when it is
//     the frame's table (class list), its route sets data-label on each cell to the column's title, and it carries no style of its own. The column's title is
//     the heading cell's own text, without its folded explanation; the row's heading cell is a cell too.
// The counter-proofs are recorded in the pull request.

import "./site-frame-dom.mjs";
import test from "node:test";
import assert from "node:assert/strict";

const { view } = await import("../src/test-pages/index.mjs");
const { scheduleFindings, scheduleSchema } = await import("../src/test-schedule/index.mjs");
const { readDocument } = await import("../src/documents/index.mjs");
const { participantSchema } = await import("../src/participant-list/index.mjs");

const route = () => view.routes.find((candidate) => candidate.name === "schedule");
const PRODUCT = "https://github.com/org/product";
const SECRETS_PAGE = `${PRODUCT}/settings/secrets/actions`;
const ROWS = ["unit", "component", "system", "paid", "release", "user"];
const COLUMNS = ["every commit", "pull request", "nightly", "release candidate", "on demand"];

function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child.nodeType === 1) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => (node.className ?? "").split(" ").includes(name));
const byTag = (root, name) => descendants(root, (node) => node.localName === name);
const rowOf = (page, row) => descendants(page, (node) => node.localName === "tr" && node.getAttribute("data-row") === row)[0];
const cellOf = (page, row, column) => descendants(rowOf(page, row), (node) => node.localName === "td" && node.getAttribute("data-column") === column)[0];
const markOf = (cell) => byClass(cell, "mark")[0].textContent;
const headOf = (page, column) => descendants(page, (node) => node.localName === "th" && node.getAttribute("data-column") === column)[0];
const inputOf = (page, key) => byTag(descendants(page, (node) => node.getAttribute?.("data-key") === key)[0], "input")[0];
const saveOf = (page) => descendants(page, (node) => node.localName === "button" && node.textContent === "Save").at(-1);

// ---------------------------------------------------------------- the fixtures

const HEAD = "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |\n|---|---|---|---|---|---|---|";
const scheduleText = (rows, front = "nightly: 02:00") => `---\n${front}\n---\n## Levels\n\n${HEAD}\n${rows.join("\n")}\n`;
const DEFAULT_ROWS = ["| unit | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| component | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| system | ✓ | ✓ | ✓ | ✓ | ✓ | |",
  "| paid | | | ✓ | ✓ | ✓ | |", "| release | | | | ✓ | ✓ | |", "| user | | | | ✓ | ✓ | |"];
// A saved schedule that differs from the book's default: system tests nightly only, the nightly run at 03:30, a command, and a runner for the system row.
const SAVED = scheduleText(["| unit | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| component | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| system | | | ✓ | ✓ | ✓ | lab-runner |",
  "| paid | | | ✓ | ✓ | ✓ | |", "| release | | | | ✓ | ✓ | |", "| user | | | | ✓ | ✓ | |"], "nightly: 03:30\ncommand: make test\nreport: out/junit.xml");
// A saved schedule that says what the rules refuse: the row unit leaves out the release candidate, the row paid runs on every commit, and the row system
// names a participant that cannot run tests.
const BROKEN = scheduleText(["| unit | ✓ | ✓ | ✓ | | ✓ | |", "| component | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| system | ✓ | ✓ | ✓ | ✓ | ✓ | writer |",
  "| paid | ✓ | | ✓ | ✓ | ✓ | |", "| release | | | | ✓ | ✓ | |", "| user | | | | ✓ | ✓ | |"]);

const REGISTER = `# Participants of this instance

**REGISTER**

The participants of the test instance.

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| lab-runner | CI agent | example-model | 200000 | — | draft text, run code and tests | this machine | ci runner:lab secret LAB_KEY |
| hosted-ci | CI agent | example-model | 200000 | — | draft text, run code and tests | the server | ci hosted secret CI_KEY |
| writer | CLI agent | example-model | 200000 | — | draft text, read the repository | this machine | bridge lab-pc agent claude |
| bridge-runner | CLI agent | example-model | 200000 | — | draft text, run code and tests | this machine | bridge lab-pc agent claude |
`;
const participants = readDocument(participantSchema(), "docs/participants.md", REGISTER);

const RESOURCE_HEAD = "| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|";
const resourcesText = (...rows) => `# Resources of this product\n\n**REGISTER**\n\nThe resources.\n\n${RESOURCE_HEAD}\n${rows.join("\n")}\n`;
const ORACLE = "| oracle | endpoint | https://api.example.org/v1 | example-model | — | — | runner:cpu | the vendor | yes | ci:ORACLE_KEY |";
const LOCAL = "| local-llm | endpoint | http://gpu01:8000/v1 | example-model | — | — | runner:cpu | the group's server | no | ci:LOCAL_KEY |";
const LEAKY = "| leaky | endpoint | https://leaky.example.org | example-model | — | — | runner:cpu | the vendor | yes | sk-live-abc123def456 |";

// A test file's text: one declaration for each of `levels`, an entry `[level, paid]`; the lines are built by join, so that no line of this file is a declaration.
const declarations = (entries, from) => entries.map(([level, paid], at) => ["// TST-" + String(from + at).padStart(3, "0") + " · level: " + level + " · module: MOD-sample",
  "// guards: A SAMPLE REQUIREMENT", "// given: g", "// input: i", "// expect: e", ...(paid ? ["// paid: " + paid] : []), "test(\"t\", () => {});", ""].join("\n")).join("\n");

// The product's host: its default branch holds the files given; webLinks is the server's pages.
function productHost(files, { web = PRODUCT, runs = [], asked = [], labels = {}, askedLabels = [] } = {}) {
  return {
    repositoryInfo: async () => ({ defaultBranch: "main", visibility: "public", canWrite: true }),
    readSnapshot: async (ref) => {
      assert.equal(ref, "main", "the page reads the default branch");
      return { commit: "c".repeat(40), paths: Object.keys(files), blob: () => "b".repeat(40), read: async (path) => files[path] ?? null };
    },
    webLinks: () => ({ secrets: SECRETS_PAGE, actions: `${web}/actions`, runners: `${web}/settings/actions/runners/new` }),
    listCiRuns: async (filter) => { asked.push(filter); if (runs instanceof Error) throw runs; return runs; },
    ciRunLabels: async (id) => { askedLabels.push(id); if (labels instanceof Error) throw labels; return labels[id] ?? []; },
  };
}
const instanceHost = () => ({
  repositoryInfo: async () => ({ defaultBranch: "main", visibility: "public", canWrite: true }),
  readSnapshot: async () => ({ commit: "i".repeat(40), paths: ["docs/participants.md"], blob: () => "b".repeat(40), read: async (path) => (path === "docs/participants.md" ? REGISTER : null) }),
});

async function page(files = {}, hostOptions = {}) {
  const context = { page: "main", instance: { repository: "alice/agent-m", host: instanceHost() }, store: null, go() {},
    product: { address: PRODUCT, kind: "github", host: productHost(files, hostOptions), tokenStored: true } };
  const target = document.createElement("div");
  document.body.append(target);
  await route().render(target, context, {});
  return target;
}
const withSchedule = (text, more = {}, hostOptions = {}) => page({ "docs/tests/schedule.md": text, ...more }, hostOptions);

// ================================================================== the tests

// TST-758001 · level: unit · module: MOD-test-pages
// guards: THE DEFAULT SCHEDULE FOLLOWS THE BOOK; UC-027
// given: a product whose default branch holds no docs/tests/schedule.md
// input: the route schedule rendered for the product
// expect: the page says the table is the book's default, not yet saved; the table has the rows unit, component, system, paid, release and user and the columns every commit, pull request, nightly, release candidate and on demand, with the ticks of the book's default (unit, component and system in all five; paid, release and user only where the book ticks them); the nightly time field holds 02:00
test("schedule — without a schedule the page shows the book's default, marked as such", async () => {
  const shown = await page();
  assert.equal(byClass(shown, "default-schedule").length, 1, "the default is marked");
  assert.match(byClass(shown, "default-schedule")[0].textContent, /book's default/i);
  const ticks = (row) => COLUMNS.filter((column) => markOf(cellOf(shown, row, column)) === "✓");
  assert.deepEqual(descendants(shown, (node) => node.localName === "tr" && node.hasAttribute("data-row")).map((node) => node.getAttribute("data-row")), ROWS);
  for (const row of ["unit", "component", "system"]) assert.deepEqual(ticks(row), COLUMNS, row);
  assert.deepEqual(ticks("paid"), ["nightly", "release candidate", "on demand"]);
  assert.deepEqual(ticks("release"), ["release candidate", "on demand"]);
  assert.deepEqual(ticks("user"), ["release candidate", "on demand"]);
  assert.equal(inputOf(shown, "nightly").value, "02:00");
});

// TST-758002 · level: unit · module: MOD-test-pages
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-027
// given: a product whose docs/tests/schedule.md ticks the row system only for nightly, release candidate and on demand, names the nightly time 03:30, the command `make test` and the report out/junit.xml
// input: the route schedule rendered for the product
// expect: no mark of the default; the table shows the saved ticks (system ticked on nightly, release candidate and on demand only; the other rows as in the file); the form's fields hold 03:30, `make test` and out/junit.xml
test("schedule — a saved schedule is shown as saved, with its nightly time and command", async () => {
  const shown = await withSchedule(SAVED);
  assert.equal(byClass(shown, "default-schedule").length, 0, "no default mark");
  const ticks = (row) => COLUMNS.filter((column) => markOf(cellOf(shown, row, column)) === "✓");
  assert.deepEqual(ticks("system"), ["nightly", "release candidate", "on demand"]);
  assert.deepEqual(ticks("unit"), COLUMNS);
  assert.deepEqual(ticks("user"), ["release candidate", "on demand"]);
  assert.equal(inputOf(shown, "nightly").value, "03:30");
  assert.equal(inputOf(shown, "command").value, "make test");
  assert.equal(inputOf(shown, "report").value, "out/junit.xml");
});

// TST-758003 · level: unit · module: MOD-test-pages
// guards: EVERY STEP EXPLAINS ITSELF; UC-027
// given: a product without a schedule
// input: the route schedule rendered for the product
// expect: the heading cell of each of the six rows and each of the five columns holds a folded explanation (a details element of the class explain, its summary "What is this?") whose text names a chapter of the book, "ch. 12" or "ch. 13"
test("schedule — each row and each column carries a folded What is this? naming the book's chapter", async () => {
  const shown = await page();
  const heads = [...ROWS.map((row) => byTag(rowOf(shown, row), "th")[0]), ...COLUMNS.map((column) => headOf(shown, column))];
  assert.equal(heads.length, 11);
  for (const head of heads) {
    const folds = byClass(head, "explain");
    assert.equal(folds.length, 1, `one fold in ${head.textContent.slice(0, 20)}`);
    assert.equal(byTag(folds[0], "summary")[0].textContent, "What is this?");
    assert.match(folds[0].textContent, /ch\. 1[23]/, "names the chapter");
  }
});

// TST-758004 · level: unit · module: MOD-test-pages
// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL; COMMIT TESTS CALL NO PAID SERVICE; UC-027
// given: a product without a schedule
// input: the route schedule rendered for the product
// expect: exactly eight cells refuse (class refused): the release candidate cell of each of the six rows, each with a reason naming A RELEASE RUNS EVERY TEST AT EVERY LEVEL, and the every commit and pull request cells of the row paid, each with a reason naming COMMIT TESTS CALL NO PAID SERVICE and recorded responses; no other cell refuses
test("schedule — the release candidate column and the commit cells of paid refuse, each with its reason", async () => {
  const shown = await page();
  const refused = descendants(shown, (node) => node.localName === "td" && (node.className ?? "").split(" ").includes("refused"));
  assert.equal(refused.length, 8, "known positive: cells refuse");
  assert.deepEqual(refused.map((cell) => `${cell.parentNode.getAttribute("data-row")}/${cell.getAttribute("data-column")}`).sort(), [
    ...ROWS.map((row) => `${row}/release candidate`), "paid/every commit", "paid/pull request"].sort());
  for (const cell of refused) {
    const reason = byClass(cell, "reason")[0].textContent;
    if (cell.getAttribute("data-column") === "release candidate") assert.match(reason, /A RELEASE RUNS EVERY TEST AT EVERY LEVEL/);
    else { assert.match(reason, /COMMIT TESTS CALL NO PAID SERVICE/); assert.match(reason, /recorded/i); }
  }
});

// TST-758005 · level: unit · module: MOD-test-pages
// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL; COMMIT TESTS CALL NO PAID SERVICE; THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-027
// given: a saved schedule whose row unit leaves out the release candidate, whose row paid runs on every commit, and whose row system runs on writer, a participant without "run code and tests"
// input: the route schedule rendered; and scheduleFindings of the same schedule and the instance's participants
// expect: the page lists each finding of scheduleFindings, three of them, with its text and the requirement it names; Save of the form is not offered; for the book's default the list is empty
test("schedule — the findings of scheduleFindings are listed, and Save is not offered while one remains", async () => {
  const schedule = readDocument(scheduleSchema, "docs/tests/schedule.md", BROKEN);
  const found = scheduleFindings(schedule, participants);
  assert.equal(found.length, 3, "known positive: three findings");
  const shown = await withSchedule(BROKEN);
  const listed = byTag(byClass(shown, "schedule-findings")[0], "li");
  assert.equal(listed.length, 3);
  for (const finding of found) {
    const line = listed.find((item) => item.textContent.includes(finding.what));
    assert.ok(line, `lists: ${finding.what}`);
    assert.ok(line.textContent.includes(`[${finding.rule}]`), `names ${finding.rule}`);
  }
  assert.equal(saveOf(shown).disabled, true, "Save is not offered");
  assert.equal(byTag(byClass(await page(), "schedule-findings")[0], "li").length, 0, "the default has none");
});

// TST-758006 · level: unit · module: MOD-test-pages
// guards: UC-027
// given: a product whose test files hold three unit tests (one of them calls the paid service oracle), one component test, two system tests (one of them calls the paid service oracle) and one release test, and no user test
// input: the route schedule rendered for the product
// expect: the number of tests of the rows unit, component, system, paid, release and user is 3, 1, 2, 2, 1 and 0: a test that calls a paid service counts under paid and under its own level
test("schedule — each row names how many tests it holds", async () => {
  const files = {
    "tests/a.test.mjs": declarations([["unit"], ["unit", "oracle"], ["unit"], ["component"]], 1),
    "tests/b.test.mjs": declarations([["system", "oracle"], ["system"], ["release"]], 10),
    "src/not-a-test.mjs": declarations([["user"]], 20),
  };
  const shown = await page(files);
  const counts = Object.fromEntries(ROWS.map((row) => [row, byClass(rowOf(shown, row), "tests")[0].textContent]));
  assert.deepEqual(counts, { unit: "3", component: "1", system: "2", paid: "2", release: "1", user: "0" });
});

// TST-758007 · level: unit · module: MOD-test-pages
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-027
// given: the instance's participants lab-runner, hosted-ci and bridge-runner (each with "run code and tests") and writer (without it); a saved schedule whose row system runs on lab-runner
// input: the route schedule rendered for the product
// expect: each of the six rows has a runner choice that offers hosted, lab-runner, hosted-ci and bridge-runner, and not writer; the choice of the row system shows lab-runner, those of the other rows hosted
test("schedule — the runner of each row is chosen among the participants that run code and tests", async () => {
  const shown = await withSchedule(SAVED);
  for (const row of ROWS) {
    const choice = byClass(rowOf(shown, row), "runner")[0];
    assert.deepEqual(byTag(choice, "option").map((option) => option.getAttribute("value")), ["hosted", "lab-runner", "hosted-ci", "bridge-runner"], row);
    assert.equal(choice.value, row === "system" ? "lab-runner" : "hosted", row);
  }
});

// TST-758008 · level: unit · module: MOD-test-pages
// guards: NO SECRET IN THE REPOSITORY; UC-027
// given: a saved schedule that ticks the row paid, and a resource list with the endpoints oracle (Secret ci:ORACLE_KEY) and local-llm (Secret ci:LOCAL_KEY); the host's secrets page; and the same schedule with the row paid ticked nowhere
// input: the route schedule rendered for the product, for each of the two schedules
// expect: the secrets block names ORACLE_KEY for oracle and LOCAL_KEY for local-llm and nothing else, links the host's secrets page, holds a folded explanation, and holds no field to type into; for the second schedule it names no secret
test("schedule — the secrets needed are named, with the server's secrets page, and no value is asked for", async () => {
  const shown = await withSchedule(SAVED, { "docs/resources.md": resourcesText(ORACLE, LOCAL) });
  const block = byClass(shown, "secrets")[0];
  assert.deepEqual(byTag(block, "li").map((item) => item.textContent.replace(/\s+/g, " ").trim()).sort(), ["LOCAL_KEY (for local-llm)", "ORACLE_KEY (for oracle)"]);
  assert.equal(byClass(block, "secrets-page")[0].getAttribute("href"), SECRETS_PAGE);
  assert.equal(byClass(block, "explain").length, 1, "a folded explanation");
  assert.equal(byTag(block, "input").length + byTag(block, "textarea").length, 0, "no value is asked for");
  const unticked = scheduleText(DEFAULT_ROWS.map((row) => (row.startsWith("| paid") ? "| paid | | | | | | |" : row)));
  const none = await withSchedule(unticked, { "docs/resources.md": resourcesText(ORACLE, LOCAL) });
  assert.equal(byTag(byClass(none, "secrets")[0], "li").length, 0);
});

// TST-758009 · level: unit · module: MOD-test-pages
// guards: NO SECRET IN THE REPOSITORY; UC-027
// given: a resource list whose endpoint leaky has the written key sk-live-abc123def456 where a secret's name belongs, beside the endpoint oracle with ci:ORACLE_KEY; the book's default
// input: the route schedule rendered for the product
// expect: the page names ORACLE_KEY and shows the text sk-live-abc123def456 nowhere
test("schedule — a key written where a name belongs is not shown", async () => {
  const shown = await page({ "docs/resources.md": resourcesText(ORACLE, LEAKY) });
  assert.match(shown.textContent, /ORACLE_KEY/, "known positive: the name is shown");
  assert.doesNotMatch(shown.textContent, /sk-live-abc123def456/);
});

// ---------------------------------------------------------------- ITM-850: a row on a self-hosted runner (UC-027 3b)
//
// Readings the texts leave open, which these tests state (the pull request names them):
//   - A row is "on a self-hosted runner" when its `runs on` names a participant of the register whose route is `ci runner:<label>`; the label the runner must carry is <label>. `hosted`, a participant on a Bridge and a name the register does not hold are not.
//   - The page shows, below the table, <div class="runner-registration" data-row="<row>"> per such row: an <a class="runner-page"> to webLinks().runners, <span class="runner-label"> with the label, a folded explanation (<details class="explain">),
//     and <ul class="queued-runs"> with the runs of the default branch that listCiRuns gives in the state queued, each a link to its url; <p class="no-queued"> where none waits.
//     ITM-1081: of the queued runs only those whose ciRunLabels hold the row's label are listed under it (MOD-test-pages.md:113-114); ciRunLabels is asked of the queued runs only. The page reads no runner's state: whether a runner is online shows in the runs, which leave the state queued.
//   - Where listCiRuns or ciRunLabels fails, the block stays and <p class="runs-unreadable"> says the runs cannot be read.
const run = (id, state) => ({ id, workflow: "tests.yml", commit: "a".repeat(40), event: "push", state, url: `${PRODUCT}/actions/runs/${id}`, started: null, ended: null });
const registrationOf = (shown, row) => descendants(shown, (node) => (node.className ?? "").split(" ").includes("runner-registration") && node.getAttribute("data-row") === row)[0];

// TST-850001 · level: unit · module: MOD-test-pages
// guards: UC-027; EVERY STEP EXPLAINS ITSELF
// given: a saved schedule whose row system runs on lab-runner (route ci runner:lab) and whose rows unit and release run on hosted-ci, bridge-runner and nobody; no run waits
// input: the route schedule rendered
// expect: exactly one registration block, for the row system: a link to the server's runner page (webLinks().runners), the label lab, a folded explanation, and the note that no run waits; none for the other rows
test("schedule — a row on a self-hosted runner shows the server's runner page, the label and a folded explanation", async () => {
  const text = SAVED.replace("| unit | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| unit | ✓ | ✓ | ✓ | ✓ | ✓ | hosted-ci |").replace("| release | | | | ✓ | ✓ | |", "| release | | | | ✓ | ✓ | bridge-runner |");
  const shown = await withSchedule(text);
  const blocks = byClass(shown, "runner-registration");
  assert.deepEqual(blocks.map((block) => block.getAttribute("data-row")), ["system"]);
  const block = registrationOf(shown, "system");
  assert.deepEqual(byClass(block, "runner-page").map((link) => link.getAttribute("href")), [`${PRODUCT}/settings/actions/runners/new`]);
  assert.equal(byClass(block, "runner-label")[0].textContent, "lab");
  assert.equal(byClass(block, "explain").length, 1, "a folded explanation");
  assert.equal(byTag(block, "details").length, 1);
  assert.equal(byClass(block, "no-queued").length, 1);
  assert.equal(byClass(block, "queued-runs").length, 0);
});

// TST-850002 · level: unit · module: MOD-test-pages
// guards: UC-027
// given: the same schedule; listCiRuns gives four runs in the state queued, one running and one success; the queued runs 1 and 3 ask for the label lab (3 also for self-hosted), run 5 for the label other, run 6 for none
// input: the route schedule rendered
// expect: the block lists the queued runs 1 and 3 as links to their urls and no other; listCiRuns was asked once, for the default branch main; ciRunLabels was asked of the four queued runs and of no other; no note that no run waits
test("schedule — the queued runs that wait for the row's label are shown as queued", async () => {
  const asked = [], askedLabels = [];
  const shown = await withSchedule(SAVED, {}, { runs: [run("1", "queued"), run("2", "running"), run("3", "queued"), run("4", "success"), run("5", "queued"), run("6", "queued")],
    labels: { 1: ["lab"], 3: ["self-hosted", "lab"], 5: ["other"], 6: [] }, asked, askedLabels });
  const block = registrationOf(shown, "system");
  assert.deepEqual(byTag(byClass(block, "queued-runs")[0], "a").map((link) => link.getAttribute("href")), [`${PRODUCT}/actions/runs/1`, `${PRODUCT}/actions/runs/3`]);
  assert.equal(byClass(block, "no-queued").length, 0);
  assert.deepEqual(asked, [{ branch: "main" }]);
  assert.deepEqual(askedLabels, ["1", "3", "5", "6"]);
});

// TST-1081006 · level: unit · module: MOD-test-pages
// guards: UC-027
// given: the same schedule; two runs wait, but for the label other and for none
// input: the route schedule rendered
// expect: the block lists no queued run and says that no run waits for a runner
test("schedule — a queued run that waits for another label is not shown under the row", async () => {
  const shown = await withSchedule(SAVED, {}, { runs: [run("1", "queued"), run("2", "queued")], labels: { 1: ["other"] } });
  const block = registrationOf(shown, "system");
  assert.equal(byClass(block, "queued-runs").length, 0);
  assert.equal(byClass(block, "no-queued").length, 1);
});

// TST-1081007 · level: unit · module: MOD-test-pages
// guards: UC-027
// given: the same schedule; a queued run whose labels the server cannot give (ciRunLabels fails)
// input: the route schedule rendered
// expect: the block still holds the runner page and the label, and says the runs cannot be read; the page does not fail
test("schedule — where the labels of a queued run cannot be read the registration is still shown", async () => {
  const shown = await withSchedule(SAVED, {}, { runs: [run("1", "queued")], labels: Object.assign(new Error("not found"), { name: "NotFound" }) });
  const block = registrationOf(shown, "system");
  assert.equal(byClass(block, "runner-page").length, 1);
  assert.match(byClass(block, "runs-unreadable")[0].textContent, /cannot be read/);
  assert.equal(byClass(block, "queued-runs").length, 0);
});

// TST-850003 · level: unit · module: MOD-test-pages
// guards: UC-027; EVERY STEP EXPLAINS ITSELF
// given: the same schedule on a server whose pages are those of another address (a GitLab-shaped one)
// input: the route schedule rendered
// expect: the link of the block is that server's webLinks().runners, not an address the page builds
test("schedule — the runner page is the one webLinks gives", async () => {
  const web = "https://gitlab.example/group/product";
  const shown = await withSchedule(SAVED, {}, { web });
  assert.deepEqual(byClass(registrationOf(shown, "system"), "runner-page").map((link) => link.getAttribute("href")), [`${web}/settings/actions/runners/new`]);
});

// TST-850004 · level: unit · module: MOD-test-pages
// guards: UC-027
// given: the book's default schedule (every row on hosted)
// input: the route schedule rendered
// expect: no registration block, and listCiRuns is not asked
test("schedule — without a self-hosted row there is no registration block and no run is read", async () => {
  const asked = [];
  const shown = await page({}, { asked, runs: [run("1", "queued")] });
  assert.equal(byClass(shown, "runner-registration").length, 0);
  assert.deepEqual(asked, []);
});

// TST-850005 · level: unit · module: MOD-test-pages
// guards: UC-027
// given: the same schedule, listCiRuns failing
// input: the route schedule rendered
// expect: the block still holds the runner page and the label, and says the runs cannot be read; the page does not fail
test("schedule — where the runs cannot be read the registration is still shown", async () => {
  const shown = await withSchedule(SAVED, {}, { runs: Object.assign(new Error("no token"), { name: "TokenRefused" }) });
  const block = registrationOf(shown, "system");
  assert.equal(byClass(block, "runner-page").length, 1);
  assert.match(byClass(block, "runs-unreadable")[0].textContent, /cannot be read/);
  assert.equal(byClass(block, "queued-runs").length, 0);
});

// ---------------------------------------------------------------- ITM-1208: the runner choice has an accessible name (THE SITE SERVES A SCREEN READER)

// The accessible name of a select, in the order of the accessible-name computation: aria-labelledby, aria-label, a label it stands in, its title.
function accessibleName(node, root) {
  const by = (node.getAttribute("aria-labelledby") ?? "").split(/\s+/).filter(Boolean)
    .map((id) => descendants(root, (each) => each.getAttribute?.("id") === id)[0]?.textContent ?? "").join(" ").trim();
  if (by) return by;
  const label = (node.getAttribute("aria-label") ?? "").trim();
  if (label) return label;
  let up = node.parentNode;
  while (up && up.localName !== "label") up = up.parentNode;
  return (up?.textContent ?? node.getAttribute("title") ?? "").trim();
}

// TST-1208101 · level: unit · module: MOD-test-pages
// guards: THE SITE SERVES A SCREEN READER; UC-027
// given: a saved schedule; the instance's participants that run code and tests
// input: the route schedule rendered for the product
// expect: the runner choice of each of the six rows has an accessible name that holds the row's name and "runs on"; the six names differ
test("schedule — the runner choice of each row is named by its row and its column", async () => {
  const shown = await withSchedule(SAVED);
  const names = ROWS.map((row) => {
    const choice = byClass(rowOf(shown, row), "runner")[0];
    assert.ok(choice, `known positive: the row ${row} has its runner choice`);
    const name = accessibleName(choice, shown);
    assert.ok(name.includes(row), `the name of the row ${row}'s choice holds the row; it is "${name}"`);
    assert.ok(name.includes("runs on"), `the name of the row ${row}'s choice holds the column "runs on"; it is "${name}"`);
    return name;
  });
  assert.equal(new Set(names).size, ROWS.length, `the six names differ: ${names.join(" | ")}`);
});

// ---------------------------------------------------------------- ITM-1207: the table fits a phone (EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE)

// TST-1207101 · level: unit · module: MOD-test-pages
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; UC-027
// given: a saved schedule
// input: the route schedule rendered for the product
// expect: the table of levels is the frame's table (class list); every cell of each of its six rows carries data-label, in order Level, tests, every commit, pull request, nightly, release candidate, on demand, runs on; no element of the table carries a style attribute
test("schedule — the table of levels takes the frame's narrow form: the frame's table, each cell labelled by its column, no style of its own", async () => {
  const shown = await withSchedule(SAVED);
  const table = byClass(shown, "levels")[0];
  assert.ok(table, "known positive: the table of levels is drawn");
  assert.ok((table.className ?? "").split(" ").includes("list"), `the table is the frame's table; its class is "${table.className}"`);
  const labels = ["Level", "tests", ...COLUMNS, "runs on"];
  for (const row of ROWS) {
    const cells = descendants(rowOf(shown, row), (node) => node.localName === "td" || node.localName === "th");
    assert.deepEqual(cells.map((cell) => cell.getAttribute("data-label")), labels, row);
  }
  assert.deepEqual([table, ...descendants(table, () => true)].filter((node) => node.hasAttribute?.("style")).map((node) => node.localName), [], "no style of its own");
});
