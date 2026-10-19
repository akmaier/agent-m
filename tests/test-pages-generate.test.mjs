// Generating tests, up to the proposal (ITM-763) — MOD-test-pages' route `generate`, UC-026 steps 1 to 4, 3a and 4a: the requirements, use cases and modules of the product with the levels
// whose tests already guard each, the uncovered combinations preselected; the levels chosen, each with a folded explanation that names the book's chapter; the participants that fill the
// test-writing role, the implementer left out for the level release and named; the run panel of the kind propose-tests, whose Run queues one job of that kind; a selection that does not fit the
// participant's context sends nothing. The proposal a run returns, its review and Write tests are ITM-764 and are not tested here.
// Run: node --test tests/test-pages-generate.test.mjs
//
// Module: MOD-test-pages
// Guards: UC-026; EVERY TEST HAS ONE LEVEL; TEST GENERATION SEES THE EXISTING TESTS; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER; A ROLE NAMES THE CAPABILITIES IT NEEDS; THE PAGE NAMES WHERE IT SENDS; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF; A TEST JOB RECEIVES THE CHAPTER ON TESTING
// Level: unit
//
// The document is the small DOM of tests/site-frame-dom.mjs, imported unchanged. The product and the instance are hosts of this file, kept to MOD-repository-hosts' interface (repositoryInfo,
// readSnapshot, commitFiles made only on the head that was read); the instance's snapshot gives the register of participants the test sets and the rest of this repository from the disk, the
// book among it. The real MOD-job-runner, MOD-job-catalogue, MOD-runtimes, MOD-job-ledger, MOD-trace-graph, MOD-participant-list and MOD-site-frame run as they are, the strategies registered as
// the view hands them to the frame, plus the source register's, which the review pages hand it. Where the texts leave a reading open, the test states the one it takes, and the pull request names it:
//   - A combination is a name and a level that fits its kind: a requirement at release and user, a use case at system, a module at unit and component (UC-026's table). A combination is uncovered
//     when no test of that level guards the name; a test guards a module it names in its `Module:` line, as the recipe test-selection counts it.
//   - A name is preselected when one of its combinations is uncovered; a level when a preselected name lacks it.
//   - The implementer of what a selection checks is the participant of a job of kind implement whose worksOn names a selected name.
//   - The page holds <input class="name"> per name, <input class="level"> per level with a folded <details class="explain">, <li class="participant"> per offered participant with <input
//     class="participant"> (a radio), <p class="left-out"> per participant left out, <p class="release-needs-another"> for 4a, <input class="person">, <button class="prepare">, and Run is the panel's own.
// The counter-proofs are recorded in the pull request.

import "./site-frame-dom.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { startRecord } from "../src/job-ledger/index.mjs";
import { approvalSchema } from "../src/approvals/index.mjs";
import { writeDocument } from "../src/documents/index.mjs";

const { view } = await import("../src/test-pages/index.mjs");
const { registerStrategies } = await import("../src/job-runner/index.mjs");
const { sourceStrategies } = await import("../src/source-register/index.mjs");
[...view.strategies, sourceStrategies].forEach((strategies, at) => registerStrategies(`tests/test-pages-generate.test.mjs#${at}`, strategies));
const route = view.routes.find((candidate) => candidate.name === "generate");

// ---------------------------------------------------------------- the product

const PRODUCT = "https://github.com/alice/thesis-tool";
const ON_GITHUB = { server: "github", origin: "https://github.com", path: "alice/thesis-tool", web: PRODUCT };
const text = (...lines) => `${lines.join("\n")}\n`;
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const failure = (name, message, fields = {}) => Object.assign(new Error(message), { name }, fields);
const SPEC = text("# Thesis tool — Specification", "", "## Lending", "", "**RULE ONE** *(Product Owner)*", "One rule.", "*Check:* `tests/a.test.mjs`", "",
  "**RULE TWO** *(Product Owner)*", "Another rule.", "*Check:* `tests/a.test.mjs`");
const useCase = (id, realises) => text("---", `id: ${id}`, `title: Case ${id}`, "area: lending", "actors:", "  - Member", "realises:", `  - ${realises}`, "---", `# ${id} Case`, "", "**Goal.** A goal.");
const moduleFile = (id, realises) => text("---", `id: ${id}`, `title: Module ${id}`, `folder: src/${id}/`, "realises:", `  - ${realises}`, "follows:", "uses:", "provides:", "  - f", "---", `# ${id} Module`);
// A test file's text: one declaration for each entry [number, level, module, guards]; built by join, so that no line of this file is a declaration.
const declarations = (entries) => entries.map(([number, level, module, guards]) => ["// TST-" + number + " · level: " + level + " · module: " + module, "// guards: " + guards,
  "// given: g", "// input: i", "// expect: e", "test(\"t\", () => {});", ""].join("\n")).join("\n");
// RULE ONE is guarded at release and user (and unit), UC-001 at system, MOD-b at unit and component; RULE TWO, UC-002 and MOD-a are not.
const TESTS = declarations([["1", "unit", "none", "RULE ONE"], ["2", "release", "none", "RULE ONE"], ["3", "user", "none", "RULE ONE"], ["4", "system", "none", "UC-001"],
  ["5", "unit", "MOD-b", "RULE TWO"], ["6", "component", "MOD-b", "RULE TWO"]]);
const FILES = { "README.md": "# Thesis tool\n", "SPEC.md": SPEC, "docs/use-cases/UC-001-one.md": useCase("UC-001", "RULE ONE"), "docs/use-cases/UC-002-two.md": useCase("UC-002", "RULE TWO"),
  "docs/architecture/MOD-a.md": moduleFile("MOD-a", "RULE ONE"), "docs/architecture/MOD-b.md": moduleFile("MOD-b", "RULE TWO"), "tests/a.test.mjs": TESTS,
  ".github/workflows/agent-m-jobs.yml": "name: agent-m-jobs\n" };
const IMPLEMENTED = { id: "JOB-20261010-0900-abcd", kind: "implement", worksOn: ["UC-002"], participant: "writer-a", model: "model-y", route: "bridge lab-pc", run: null, retries: null,
  startedBy: "alice", start: new Date("2026-10-10T09:00:00Z"), agentM: { version: "2026.10.0", commit: "abc1234" }, inputs: [], limit: 5, destinations: [], params: {} };
const withImplementer = { ...FILES, [`docs/jobs/${IMPLEMENTED.id}.md`]: startRecord(IMPLEMENTED).text };

// UC-002 accepted: the record of the approval names the blob of its current text (the precondition rests-on-accepted).
const UC_2 = "docs/use-cases/UC-002-two.md";
const accepted = { ...FILES, [`docs/approvals/UC-002-${blobOf(FILES[UC_2]).slice(0, 12)}.md`]: writeDocument(approvalSchema, { fields: { kind: "use-case", file: UC_2, blob: blobOf(FILES[UC_2]) } }) };

function fakeProduct(files = FILES) {
  const calls = [];
  let head = "a".repeat(40), tree = new Map(Object.entries(files)), made = 0;
  const snapshot = () => ({ repository: ON_GITHUB, ref: "trunk", commit: head, paths: [...tree.keys()].sort(), read: async (path) => (tree.has(path) ? tree.get(path) : null),
    blob: (path) => (tree.has(path) ? blobOf(tree.get(path)) : null) });
  return {
    writes: () => calls,
    host: {
      async repositoryInfo() { return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" }; },
      async readSnapshot() { return snapshot(); },
      async commitFiles(change) {
        calls.push(structuredClone(change));
        if (change.branch !== "trunk" || change.expectedHead !== head) throw failure("Moved", "the branch moved", { head });
        tree = new Map([...tree, ...change.files.map((file) => [file.path, file.text])]);
        head = createHash("sha1").update(`commit ${++made}`).digest("hex");
        return { commit: head, url: `${PRODUCT}/commit/${head}` };
      },
    },
  };
}

// The instance: this repository's files from the disk — its book among them —, with the register of participants the test gives.
const ROOT = new URL("../", import.meta.url);
const onDisk = (path) => { try { return readFileSync(new URL(path, ROOT), "utf8"); } catch { return null; } };
const REGISTER_HEAD = onDisk("docs/participants.md").split("\n").filter((line, at, all) => at <= all.findIndex((each) => each.startsWith("|---"))).join("\n");
const registerOf = (...rows) => `${REGISTER_HEAD}\n${rows.join("\n")}\n`;
const NEEDS = "read the repository, write to the repository, run code and tests";
const WRITER_A = `| writer-a | CLI agent | model-y | 200000 | — | ${NEEDS} | this machine | bridge lab-pc agent claude |`;
const WRITER_B = `| writer-b | CLI agent | model-z | 200000 | — | ${NEEDS} | this machine | bridge lab-pc agent claude |`;
const CI_WRITER = `| ci-writer | CI agent | model-x | 200000 | — | ${NEEDS} | GitHub Actions in the USA | ci hosted secret CI_KEY |`;
const SMALL_CI = `| small-ci | CI agent | model-s | 100 | — | ${NEEDS} | GitHub Actions in the USA | ci hosted secret CI_KEY |`;
const DRAFTER = "| drafter | model endpoint | example-model | 200000 | — | draft text | this machine | endpoint ep1 |";
function fakeInstance(register) {
  const snapshot = { repository: { server: "github", origin: "https://github.com", path: "alice/agent-m", web: "https://github.com/alice/agent-m" }, ref: "main",
    commit: "abc123def4567890abc123def4567890abc123de", paths: [], read: async (path) => (path === "docs/participants.md" ? register : onDisk(path)), blob: () => null };
  return { async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: false, archived: false, description: "" }; }, async readSnapshot() { return snapshot; } };
}

// ---------------------------------------------------------------- the page

const realFetch = globalThis.fetch;
const sent = [];
test.beforeEach(() => { sent.length = 0; globalThis.fetch = async (url) => { sent.push(String(url)); throw new Error("no network"); }; });
test.afterEach(() => { globalThis.fetch = realFetch; });

async function show(fake, { register = registerOf(WRITER_A, WRITER_B, CI_WRITER, DRAFTER) } = {}) {
  assert.ok(route, "the view offers the route generate");
  const target = document.createElement("div");
  document.body.append(target);
  const context = { page: "main", instance: { repository: "alice/agent-m", host: fakeInstance(register) }, store: null, go() {}, product: { address: PRODUCT, kind: "github", host: fake.host } };
  await route.render(target, context, {});
  return target;
}
function find(root, match) {
  const found = [];
  (function walk(node) { for (const kid of node.childNodes) { if (kid.nodeType === 1) { if (match(kid)) found.push(kid); walk(kid); } } })(root);
  return found;
}
const byClass = (root, name, className) => find(root, (node) => node.localName === name && node.className.split(" ").includes(className));
const trusted = (type) => Object.defineProperty(new Event(type), "isTrusted", { value: true });
const click = (node) => node.dispatchEvent(trusted("click"));
const tick = () => new Promise((resolve) => setImmediate(resolve));
async function until(condition, what) {
  const limit = Date.now() + 3000;
  while (Date.now() < limit) {
    if (condition()) return;
    await tick();
  }
  assert.fail(`waited for ${what}`);
}
const checkedNames = (target) => byClass(target, "input", "name").filter((box) => box.checked).map((box) => box.value);
const checkedLevels = (target) => byClass(target, "input", "level").filter((box) => box.checked).map((box) => box.value);
const offeredNames = (target) => byClass(target, "li", "participant").map((item) => item.getAttribute("data-name")).sort();
function setLevel(target, level, on) {
  const box = byClass(target, "input", "level").find((each) => each.value === level);
  box.checked = on;
  box.dispatchEvent(new Event("change"));
}
const settle = async () => { for (let i = 0; i < 20; i += 1) await tick(); };
async function panelFor(target, name, person = "alice") {
  byClass(target, "input", "person")[0].value = person;
  const box = byClass(target, "input", "participant").find((each) => each.value === name);
  box.checked = true;
  click(byClass(target, "button", "prepare")[0]);
  await until(() => byClass(target, "section", "run-panel").length === 1, "the run panel");
}
const runButtons = (root) => find(root, (node) => node.localName === "button" && node.textContent === "Run");

// ================================================================== the tests

// TST-763001 · level: unit · module: MOD-test-pages
// guards: UC-026 (1, 2); TEST GENERATION SEES THE EXISTING TESTS; EVERY STEP EXPLAINS ITSELF
// given: a product with the requirements RULE ONE (guarded at release and user) and RULE TWO (guarded at neither), the use cases UC-001 (guarded at system) and UC-002 (not), the modules MOD-a (no test) and MOD-b (unit and component)
// input: the route generate, drawn
// expect: every requirement, use case and module listed with the levels that guard it; RULE TWO, UC-002 and MOD-a preselected and the others not; all five levels preselected, since each is lacking for a name; each level with a folded explanation that names chapter 13; nothing written, nothing sent
test("generate — what can be tested with the levels that guard it, the uncovered combinations preselected, each level explained", async () => {
  const fake = fakeProduct();
  const target = await show(fake);
  const listed = byClass(target, "li", "uncovered").concat(byClass(target, "li", "covered")).map((item) => item.getAttribute("data-name")).sort();
  assert.deepEqual(listed, ["MOD-a", "MOD-b", "RULE ONE", "RULE TWO", "UC-001", "UC-002"]);
  assert.deepEqual(checkedNames(target).sort(), ["MOD-a", "RULE TWO", "UC-002"]);
  const rowOf = (name) => find(target, (node) => node.localName === "li" && node.getAttribute("data-name") === name)[0];
  assert.match(byClass(rowOf("RULE ONE"), "span", "covered")[0].textContent, /release, user/);
  assert.match(byClass(rowOf("MOD-a"), "span", "covered")[0].textContent, /no level/);
  assert.match(byClass(rowOf("MOD-a"), "span", "uncovered")[0].textContent, /unit, component/);
  assert.match(byClass(rowOf("MOD-b"), "span", "covered")[0].textContent, /unit, component/);
  assert.deepEqual(checkedLevels(target), ["unit", "component", "system", "release", "user"]);
  for (const item of byClass(target, "li", "level")) {
    const details = find(item, (node) => node.localName === "details");
    assert.equal(details.length, 1, `${item.getAttribute("data-level")} has one folded explanation`);
    assert.match(details[0].textContent, /chapter 13/);
  }
  assert.deepEqual(fake.writes(), [], "nothing written");
  assert.deepEqual(sent, [], "nothing sent");
});

// TST-763002 · level: unit · module: MOD-test-pages
// guards: UC-026 (4); RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER; A ROLE NAMES THE CAPABILITIES IT NEEDS
// given: writer-a recorded as the implementer of UC-002 by a job of kind implement; the register with writer-a, writer-b, a CI agent that declare the three capabilities and a drafter that declares only draft text; UC-002 selected and release chosen
// input: the route generate, drawn; then release unticked
// expect: writer-b and the CI agent are offered and the drafter is not; writer-a is left out and named; with release unticked writer-a is offered too
test("generate — the implementer is left out for release and named, and a participant lacking a capability is not offered", async () => {
  const target = await show(fakeProduct(withImplementer));
  assert.deepEqual(offeredNames(target), ["ci-writer", "writer-b"]);
  const left = byClass(target, "p", "left-out");
  assert.equal(left.length, 1);
  assert.match(left[0].textContent, /writer-a/);
  setLevel(target, "release", false);
  await settle();
  assert.deepEqual(offeredNames(target), ["ci-writer", "writer-a", "writer-b"]);
  assert.equal(byClass(target, "p", "left-out").length, 0);
});

// TST-763003 · level: unit · module: MOD-test-pages
// guards: UC-026 (4a); RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
// given: the register holds only writer-a, the implementer of UC-002; release is chosen
// input: the route generate, drawn; then release unticked
// expect: no participant is offered, and the page says release tests need a different participant and links UC-017 and UC-002; with release unticked writer-a is offered
test("generate — when the only participant is the implementer, release is said to need another and the other levels can still be generated", async () => {
  const target = await show(fakeProduct(withImplementer), { register: registerOf(WRITER_A) });
  assert.deepEqual(offeredNames(target), []);
  const said = byClass(target, "p", "release-needs-another");
  assert.equal(said.length, 1);
  assert.match(said[0].textContent, /other than the implementer/);
  const links = find(said[0], (node) => node.localName === "a").map((node) => node.getAttribute("href"));
  assert.deepEqual(links, ["#use-case/id=UC-017", "#use-case/id=UC-002"]);
  setLevel(target, "release", false);
  await settle();
  assert.deepEqual(offeredNames(target), ["writer-a"]);
  assert.equal(byClass(target, "p", "release-needs-another").length, 0);
});

// TST-763004 · level: unit · module: MOD-test-pages
// guards: UC-026 (3, 4); THE PAGE NAMES WHERE IT SENDS; ONE CLICK PER DECISION; A TEST JOB RECEIVES THE CHAPTER ON TESTING
// given: the page with the preselection and the CI agent chosen, a person's name entered
// input: pressing Show the run panel; then Run twice
// expect: the panel names the participant, where it processes data and what is sent — the selection and the book's chapter on testing —; nothing is written before Run; Run queues exactly one job: one commit of one record docs/jobs/JOB-….md of kind propose-tests, naming the selected names, the participant and the route ci hosted, with the levels as parameters
test("generate — the run panel names where the selection goes and Run queues one job of the kind propose-tests", async () => {
  const fake = fakeProduct(accepted);
  const target = await show(fake);
  await panelFor(target, "ci-writer");
  const panel = byClass(target, "section", "run-panel")[0];
  assert.match(panel.textContent, /ci-writer/);
  assert.match(panel.textContent, /GitHub Actions in the USA/);
  const parts = byClass(panel, "li", "part").map((item) => item.textContent);
  assert.ok(parts.some((part) => /^test-selection /.test(part)), "the selection and its existing tests are sent");
  assert.ok(parts.some((part) => /^13_software-testing\.md /.test(part)), `the book's chapter on testing is sent: ${parts.join(" | ")}`);
  assert.ok(!parts.some((part) => /^(09|11|12)_/.test(part)), "no other chapter is sent");
  assert.deepEqual(fake.writes(), [], "nothing written before Run");
  const [run] = runButtons(target);
  assert.ok(run, "Run is offered");
  click(run);
  click(run);
  await until(() => fake.writes().length >= 1 && byClass(target, "p", "queued").length === 1, "the queued job");
  await settle();
  assert.equal(fake.writes().length, 1, "one commit for two clicks");
  const [file] = fake.writes()[0].files;
  assert.match(file.path, /^docs\/jobs\/JOB-[^/]+\.md$/);
  assert.match(file.text, /kind: propose-tests/);
  assert.match(file.text, /participant: ci-writer/);
  assert.match(file.text, /route: ci hosted/);
  for (const name of ["RULE TWO", "UC-002", "MOD-a"]) assert.ok(file.text.includes(name), `${name} is named in the record`);
  assert.match(file.text, /release/);
});

// TST-763005 · level: unit · module: MOD-test-pages
// guards: UC-026 (3a); THE PAGE NAMES WHERE IT SENDS
// given: a CI agent whose context holds 100 tokens, much less than the selection and its existing tests
// input: the preselection, the small CI agent chosen, Show the run panel
// expect: the panel offers no Run; the page says how many existing tests guard the selection and offers a smaller selection or a participant with a larger context; nothing is written or sent
test("generate — a selection that does not fit the participant's context sends nothing and offers a smaller selection", async () => {
  const fake = fakeProduct();
  const target = await show(fake, { register: registerOf(SMALL_CI, CI_WRITER) });
  await panelFor(target, "small-ci");
  assert.equal(runButtons(target).length, 0, "no Run");
  const said = byClass(target, "p", "too-large");
  assert.equal(said.length, 1);
  assert.match(said[0].textContent, /2 existing tests guard this selection/);
  assert.match(said[0].textContent, /smaller selection/);
  assert.match(said[0].textContent, /larger context/);
  assert.deepEqual(fake.writes(), []);
  assert.deepEqual(sent, []);
});

// TST-763006 · level: unit · module: MOD-test-pages
// guards: UC-026; ONE CLICK PER DECISION
// given: the page with nothing chosen
// input: Show the run panel without a participant, then with a participant but no name
// expect: the page names what is missing and shows no run panel
test("generate — the run panel is not shown without a participant and a name", async () => {
  const target = await show(fakeProduct());
  click(byClass(target, "button", "prepare")[0]);
  await settle();
  assert.match(byClass(target, "p", "problem")[0].textContent, /participant/);
  assert.equal(byClass(target, "section", "run-panel").length, 0);
  const box = byClass(target, "input", "participant")[0];
  box.checked = true;
  click(byClass(target, "button", "prepare")[0]);
  await settle();
  assert.match(byClass(target, "p", "problem")[0].textContent, /name/);
  assert.equal(byClass(target, "section", "run-panel").length, 0);
});

// TST-763007 · level: unit · module: MOD-test-pages
// guards: UC-026; THE PAGE NAMES WHERE IT SENDS
// given: the view of the module
// input: its strategies, as the frame registers them
// expect: they hold the recipe test-selection, the check test-proposals and the precondition rests-on-accepted that the kind propose-tests names
test("view — hands the frame the strategies the kind propose-tests uses", () => {
  const names = (category) => view.strategies.flatMap((strategies) => Object.keys(strategies[category] ?? {}));
  assert.ok(names("recipes").includes("test-selection"));
  assert.ok(names("checks").includes("test-proposals"));
  assert.ok(names("preconditions").includes("rests-on-accepted"));
  assert.ok(view.routes.some((candidate) => candidate.name === "generate" && candidate.entry === "tests"));
});

// TST-763008 · level: unit · module: MOD-test-pages
// guards: UC-026 (3); NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
// given: the preselection names the use case UC-002, which no record accepts
// input: the CI agent chosen, Show the run panel
// expect: the panel names UC-002 as not accepted and offers no Run, so that nothing is sent or written
test("generate — a selection that names an unaccepted use case is refused by the panel before anything is sent", async () => {
  const fake = fakeProduct();
  const target = await show(fake);
  await panelFor(target, "ci-writer");
  const panel = byClass(target, "section", "run-panel")[0];
  assert.match(panel.textContent, /UC-002/);
  assert.match(panel.textContent, /not accepted/);
  assert.equal(runButtons(target).length, 0);
  assert.deepEqual(fake.writes(), []);
  assert.deepEqual(sent, []);
});
