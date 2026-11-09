// The harness of the system and release tests of UC-012 (Handle an issue: bug fix or specification change): the real routes `issue` of MOD-maintenance-pages, drawn into the fixture DOM of tests/main-page-home-harness.mjs over
// the world of tests/maintenance-pages-world.mjs — its fake GitHub of alice/product (issues listed, read, commented, labelled, closed; trees and commits written), its fake Bridge lab-pc-4 with the mailbox, and its model
// endpoints ep1 and ep2 —, and over the real MOD-issue-handling, MOD-job-catalogue, MOD-job-runner, MOD-runtimes, MOD-spec-changes and MOD-repository-hosts. The product's host is the real one, given the answers the
// world's fake does not serve: the stored trace graph of each snapshot (tests/stored-graph-fake.mjs), an empty history, and, where a test gives them, the pull requests of a fix. A person's click is the page's own listener
// called with a trusted event. It holds no test and no expected result: what it builds are inputs, and every test states its own expected values.
// Imported by tests/system-uc-012-handle-an-issue.test.mjs and tests/release-uc-012-handle-an-issue.test.mjs.
//
// Module: MOD-maintenance-pages
// Module: MOD-issue-handling
// Level: system
//
// Authored by developer-opus-e (ITM-585), who implemented none of ITM-581, ITM-582, ITM-583, ITM-584, ITM-654, ITM-1245, ITM-1247, ITM-1248, ITM-1250 or ITM-1256 and no UC-012 production behaviour.
//
// The product alice/product holds the SPEC of tests/main-page-home-harness.mjs (FIRST RULE "The first rule holds.", SECOND RULE "The second rule holds."), its use cases UC-001 and UC-002 (each realising FIRST RULE), its test
// TST-001 (tests/unit.test.mjs, guarding FIRST RULE), and here the job workflow, the decision ARC-001 and the module MOD-store (src/store/) with one file. The product links the source SRC-alice, whose register entry in the
// instance is the account github.com/alice, the instance's owner: the person's own source of a change. The instance holds the book's chapters.

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PRODUCT_URL, draw } from "./main-page-home-harness.mjs";
import { withStoredGraph } from "./stored-graph-fake.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { runStrategies } from "../src/run-planner/index.mjs";
import { resourceStrategies } from "../src/resource-list/index.mjs";
import { FIXER, FIXER_SESSIONS, LOCAL, buttonsOf, byClass, flush, mailOf, one, restoreWorld, textOf, trusted, waitFor, walk, world, routeNamed, pages, ERIKA, SECRET } from "./maintenance-pages-world.mjs";

// The strategies the page's own view hands the frame, and those of the recipes `implementation-inputs` and `resource-pins` the kind fix-bug names, which the world does not register.
for (const [at, strategies] of [...(pages.view?.strategies ?? []), runStrategies, resourceStrategies].entries()) {
  try { registerStrategies(`tests/uc-012-harness.mjs#${at}`, strategies); } catch { /* registered by the page's own view */ }
}

export { LOCAL, buttonsOf, byClass, flush, mailOf, one, restoreWorld, textOf, trusted, waitFor, walk, PRODUCT_URL, ERIKA, SECRET };
export const PRODUCT_TOKEN = "github_pat_HOME827PRODUCT0123456789abcdefg";
export const ADDRESS = (number) => `${PRODUCT_URL}/issues/${number}`;
const lines = (...rows) => `${rows.join("\n")}\n`;

// ---------------------------------------------------------------- the participants

// The register names each agent's model; this browser's connections declare how it is reached (MOD-participant-list): local-llm (model-a) on the endpoint ep1, and the agents below on the CLI sessions of
// the Bridge lab-pc-4 that SESSIONS declares — claude offers fixture-llm with every capability the kind fix-bug needs, codex offers runner-llm with *run code and tests* but not *write to the repository*, and
// opencode offers reader-llm with *read the repository* only.

/** The agent dev-cli, whose model the session claude offers with every capability the kind fix-bug needs. */
export { FIXER };
/** The agent dev-runner, whose model the session codex offers with *run code and tests* but not *write to the repository*. */
export const RUNNER = "| dev-runner | agent | runner-llm |";
/** A person of the register. */
export const PERSON = "| alice | person | — |";
/** The agent checker, whose model the session opencode offers with reading only. */
export const READER = "| checker | agent | reader-llm |";
/** The CLI sessions of the Bridge lab-pc-4, as the Bridge page declares them in this browser. */
export const SESSIONS = {
  ...FIXER_SESSIONS,
  codex: { place: "this machine", capabilities: ["draft text", "read the repository", "run code and tests"], models: [{ model: "runner-llm", context: 100000 }] },
  opencode: { place: "this machine", capabilities: ["read the repository"], models: [{ model: "reader-llm", context: 100000 }] },
};
/** The same sessions, the session claude declared without *run code and tests*. */
export const NO_RUN_SESSIONS = { ...SESSIONS, claude: { ...FIXER_SESSIONS.claude, capabilities: FIXER_SESSIONS.claude.capabilities.filter((each) => each !== "run code and tests") } };

// ---------------------------------------------------------------- the product's and the instance's files

const moduleText = (id, folder) => lines("---", `id: ${id}`, `title: ${id}`, `folder: ${folder}`, "realises: []", "follows:", "  - ARC-001", "uses: []", "provides: []", "---", `# ${id} ${id}`, "",
  "## Responsibility", "", "It stores.", "", "## Parts", "", "- index.mjs", "", "## Data", "", "Nothing.", "", "## Interfaces", "", "None.", "", "## Files", "", "None.", "", "## Uses", "", "None.");
const DECISION = lines("---", "id: ARC-001", "title: The whole", "designs:", "  - MOD-store", "---", "# ARC-001 The whole", "", "## Context", "", "c", "", "## Decision", "", "d", "", "## Alternatives", "", "a", "", "## Consequences", "", "q");
export const SOURCE = "SRC-alice";
const LINKS = lines("# Requirement sources of the product", "", "| Source | Version | Hash | Part |", "|---|---|---|---|", `| ${SOURCE} | 2026-10-13 | ${"0".repeat(64)} | prompt |`);
const PERSON_SOURCE = lines("---", `id: ${SOURCE}`, "title: Alice", "kind: person", "identifier: github.com/alice", "authority: informative", "licence: may be republished - fixture", "---", `# ${SOURCE} Alice`, "",
  "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|", "| `2026-10-13` | 2026-10-13 | fixture | this repository | one file, hashed only |");
export const PRODUCT_FILES = { ".github/workflows/agent-m-jobs.yml": "name: agent-m-jobs\n", "docs/architecture/ARC-001-whole.md": DECISION, "docs/architecture/MOD-store.md": moduleText("MOD-store", "src/store/"),
  "src/store/read.mjs": "export const read = 1;\n", "docs/sources.md": LINKS };
const BOOK_FOLDER = "docs/sources/SRC-vibe-coding/2026-10-05/";
const onDisk = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const BOOK = { "docs/sources/SRC-vibe-coding.md": onDisk("docs/sources/SRC-vibe-coding.md"),
  ...Object.fromEntries(readdirSync(new URL(`../${BOOK_FOLDER}`, import.meta.url)).map((name) => [BOOK_FOLDER + name, onDisk(BOOK_FOLDER + name)])) };
export const INSTANCE_FILES = { ...BOOK, [`docs/sources/${SOURCE}.md`]: PERSON_SOURCE };

// ---------------------------------------------------------------- the world

/** An open issue as the fake GitHub keeps it. */
export const issueOf = (number, body, { title = `Export loses pages ${number}`, labels = [], state = "open", comments = [] } = {}) => ({ number, title, body, state, labels, comments });

/** Whether a request to a participant is one of the kind analyse-issue: its prompt asks for a class. */
export const isAnalysis = (request) => JSON.stringify(request.body).includes("Propose its `class`");

/**
 * The world with the product chosen. `analysis` is the participant's answer to an analysis (a draft { class, reasoning, wrong? }), `change` its answer to a change (a draft { sections, proposals, groups, why }: the new text of what it changes, UC-019 step 6); `pulls(branch)` the pull request of the branch
 * of a fix job, named after the job's identifier, as MOD-repository-hosts' PullRequest or null, and `facts(number)` its facts. Every other key is the world's (tests/maintenance-pages-world.mjs).
 */
export function start({ analysis = null, change = { candidates: [] }, pulls = null, facts = null, product = {}, instance = {}, rows = [LOCAL, FIXER], sessions = SESSIONS, ...over } = {}) {
  const w = world({ mails: [], rows, sessions, answer: (request) => ({ draft: isAnalysis(request) ? analysis : change, answers: [] }), product: { ...PRODUCT_FILES, ...product }, instance: { ...INSTANCE_FILES, ...instance }, ...over });
  const real = connect(parseAddress(PRODUCT_URL), { token: PRODUCT_TOKEN });
  const host = { ...real, readSnapshot: async (ref) => withStoredGraph(await real.readSnapshot(ref)), readHistory: async () => [] };
  if (pulls) host.listPullRequests = async ({ branch } = {}) => [pulls(branch)].filter(Boolean);
  if (facts) host.pullRequestFacts = async (number) => facts(number);
  w.context.product = { address: PRODUCT_URL, kind: "github", host, tokenStored: true };
  return w;
}

/** The route issue of the issue `number`, drawn, and its analysis section waited for. */
export async function open(w, number) {
  assert.ok(routeNamed("issue"), `the route issue: ${pages.error?.message}`);
  const detail = await draw(routeNamed("issue"), w.context, { number: String(number) });
  await waitFor(() => byClass(detail, "issue-analysis").length > 0 || byClass(detail, "issue-problem").length > 0 || byClass(detail, "issue-meta").length > 0);
  return detail;
}

/** In the section `section` of the page, the participant `name` chosen by its radio of class `radio`, the person's name typed into `person`, and the run panel waited for. */
export async function choose(section, radio, person, name) {
  const choice = byClass(section, radio).find((each) => each.value === name);
  assert.ok(choice, `${name} is offered: ${textOf(section)}`);
  choice.checked = true;
  one(section, person).value = "Reviewer Rae";
  choice.dispatchEvent(new Event("change"));
  await waitFor(() => byClass(section, "run-panel").length > 0 || byClass(section, "issue-problem").length > 0);
  assert.equal(byClass(section, "issue-problem").length, 0, textOf(one(section, "issue-problem") ?? section));
  return one(section, "run-panel");
}

/** Steps 2 and 3: the analysis by `name`, Run pressed by the person, and the proposal waited for. */
export async function analysed(detail, name = "local-llm") {
  const panel = await choose(one(detail, "issue-analysis"), "participant", "person", name);
  await trusted(buttonsOf(panel, "Run")[0]);
  await waitFor(() => byClass(detail, "issue-proposal").length > 0 || byClass(detail, "issue-problem").length > 0);
  assert.equal(byClass(detail, "issue-problem").length, 0, textOf(one(detail, "issue-problem") ?? detail));
  return detail;
}

/** The decision's button of the class `cls` (bug, change, not-reproducible). */
export const classButton = (detail, cls) => byClass(detail, "set-class").find((node) => node.getAttribute("data-class") === cls);

/** Step 4: the person's one click on the class `cls`, and the line that says what it did waited for. */
export async function decided(detail, cls) {
  await trusted(classButton(detail, cls));
  await waitFor(() => byClass(detail, "issue-classified").length > 0 || byClass(detail, "issue-problem").length > 0);
  return detail;
}

export const changeOf = (detail) => byClass(detail, "issue-change")[0];
export const fixOf = (detail) => byClass(detail, "issue-fix")[0];

/** Step 6: the change drafted by `name` and its changed texts waited for. */
export async function drafted(detail, name = "local-llm") {
  await waitFor(() => changeOf(detail) !== undefined);
  const panel = await choose(changeOf(detail), "change-participant", "change-person", name);
  await trusted(buttonsOf(panel, "Run")[0]);
  await waitFor(() => byClass(changeOf(detail), "changed-text").length > 0 || byClass(changeOf(detail), "issue-problem").length > 0);
  assert.equal(byClass(changeOf(detail), "issue-problem").length, 0, textOf(changeOf(detail)));
  return detail;
}

/** Step 6: the person's click on Save, and what it said waited for. */
export async function saved(detail) {
  await trusted(buttonsOf(changeOf(detail), "Save")[0]);
  await waitFor(() => byClass(changeOf(detail), "change-saved").length > 0 || byClass(changeOf(detail), "issue-problem").length > 0);
  assert.equal(byClass(changeOf(detail), "issue-problem").length, 0, textOf(changeOf(detail)));
  return detail;
}

/** Step 5: the fix handed to `name`, the requirement `requirement` named, Run pressed by the person, and the queued line waited for. */
export async function queued(detail, name = "dev-cli", requirement = "FIRST RULE") {
  await waitFor(() => fixOf(detail) !== undefined);
  one(fixOf(detail), "fix-requirement").value = requirement;
  const panel = await choose(fixOf(detail), "fix-participant", "fix-person", name);
  await trusted(buttonsOf(panel, "Run")[0]);
  await waitFor(() => byClass(fixOf(detail), "job-queued").length > 0 || byClass(fixOf(detail), "issue-problem").length > 0);
  assert.equal(byClass(fixOf(detail), "issue-problem").length, 0, textOf(fixOf(detail)));
  return detail;
}

// ---------------------------------------------------------------- what the fakes received

/** The files the product's server received in new trees, once each by path and text. */
export const writtenFiles = (w) => [...new Map(w.kept.github.filter((request) => request.method === "POST" && request.path.endsWith("/git/trees")).flatMap((request) => JSON.parse(request.body).tree ?? [])
  .filter((entry) => typeof entry.content === "string").map((entry) => [`${entry.path}\n${entry.content}`, entry])).values()];
export const queueFiles = (w) => writtenFiles(w).filter((entry) => entry.path.startsWith("docs/spec-freigaben/"));
export const jobFiles = (w) => writtenFiles(w).filter((entry) => entry.path.startsWith("docs/jobs/"));
/** The requests that changed an issue: comments, labels and states, as [method, path, body]. */
export const issueWrites = (w) => w.kept.github.filter((request) => request.method !== "GET" && /\/issues\/\d+/.test(request.path)).map((request) => [request.method, request.path.replace(/^\/repos\/alice\/product/, ""), request.body]);
/** The issue `number` as the fake GitHub holds it now. */
export const issueNow = (w, number) => w.kept.issues.find((each) => each.number === number);
/** Everything the product's server was sent to write: the bodies of every request that is not a read. */
export const everyWrite = (w) => w.kept.github.filter((request) => request.method !== "GET").map((request) => String(request.body ?? "")).join("\n");
