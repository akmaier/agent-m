// The route `runs` — the runs of a commit (UC-028 steps 1 to 4, 2a, 2b, 6a, 7a), as docs/architecture/MOD-test-pages.md states it and ITM-760 builds it: a commit chosen from the default
// branch's history, an open pull request or a release tag, shown by its SHA, message and date; one line per level — passed, failed, flaky, not run, a level without a record reading "not run
// on this commit" with the occasions that would run it —; a level's tests with outcome, rate and its runs (beside the last release's), what each guards as a link, the participant and date; a
// failed test's expected result beside the observed one, with its log; records that cannot be read, with the link to the server's page of runs; a record marked uncommitted, shown and not counted.
//
// Not part of this item: Run on this commit and the release candidate's checklist (ITM-761, ITM-762), the link to the branch `test-results` and to the run itself where the records cannot be
// read (ITM-855). The page builds no folded explanation: explanations.md holds no topic of runs and the frame's file is not this module's.
//
// Readings the texts leave open: the log of a failed test is asked of ciRunLog with the id that ends the record's `run` address, when webLinks().run(id) gives that address back; the last release
// is the highest tag v<major>.<minor>.<patch>; a record is read with readDocument and resultSchema.run, since readRegister refuses a schema of two tables.
//
// Module: MOD-test-pages

import { resultSchema, resultsAt, flakyTests, rateComparison } from "../result-records/index.mjs";
import { scheduleSchema, defaultSchedule, occasionsOf } from "../test-schedule/index.mjs";
import { readDocument } from "../documents/index.mjs";
import { isTestFile, testDeclarations } from "../test-document/index.mjs";
import { traceGraph } from "../trace-graph/index.mjs";

const SCHEDULE_PATH = "docs/tests/schedule.md";
const RESULTS_BRANCH = "test-results";
const LEVELS = ["unit", "component", "system", "release", "user"];
const RELEASE_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

const firstLine = (message) => String(message ?? "").split("\n")[0];

// The page of an artifact a guarded name leads to, in the form the frame reads; a name the graph does not hold, or of a kind without a page, has none.
function addressOf(graph, name) {
  const kind = graph.nodes.get(name)?.kind;
  const route = { requirement: ["requirement", "name"], UC: ["use-case", "id"], MOD: ["module", "id"], ARC: ["decision", "id"] }[kind];
  return route ? `#${route[0]}/${route[1]}=${encodeURIComponent(name)}` : null;
}

function chooser(target, context, { history, pulls, tags }) {
  const button = (commit, text) => {
    const choice = el("button", "choose", text);
    choice.addEventListener("click", () => context.go("runs", { commit }));
    return el("li", null, choice);
  };
  const group = (title, items) => el("section", "choices", el("h3", null, title), el("ul", null, ...items));
  target.replaceChildren(el("h2", null, "Runs"),
    group("Default branch", history.map((entry) => button(entry.commit, `${entry.commit.slice(0, 7)} ${firstLine(entry.message)} (${entry.date})`))),
    group("Open pull requests", pulls.map((pull) => button(pull.head, `#${pull.number} ${pull.title}`))),
    group("Release tags", tags.map((tag) => button(tag.commit, `${tag.name} ${tag.commit.slice(0, 7)}`))));
}

// The tag of the last release: the highest v<major>.<minor>.<patch>.
function lastReleaseOf(tags) {
  const releases = tags.filter((tag) => RELEASE_TAG.test(tag.name))
    .sort((a, b) => { const [x, y] = [a, b].map((tag) => RELEASE_TAG.exec(tag.name).slice(1).map(Number)); return y[0] - x[0] || y[1] - x[1] || y[2] - x[2]; });
  return releases[0]?.commit ?? null;
}

// The id that ends the address of a run, where the host's own page of that run is that address.
function runIdOf(host, address) {
  const id = String(address ?? "").split("/").filter(Boolean).at(-1);
  return id && host.webLinks().run(id) === address ? id : null;
}

async function logOf(host, address) {
  const id = runIdOf(host, address);
  return id === null ? null : host.ciRunLog(id);
}

async function failureBlock(host, rows) {
  const { row, document } = rows;
  const log = await logOf(host, document.fields.run);
  return el("div", "failure", el("div", "expected", row.cells.Expected ?? ""), el("div", "observed", row.cells.Observed ?? ""),
    el("div", "excerpt", row.cells.Log ?? ""), el("pre", "log", log ?? "The log is unavailable: the server no longer keeps it."));
}

const failureRow = (document, id) => document.sections.find((section) => section.heading === "## Failures")?.rows?.find((row) => row.cells.Test === id) ?? null;

async function testRow(host, test, declaration, { graph, documents, rate, flaky }) {
  const last = test.records.at(-1);
  const who = last ? documents.get(last) : null;
  const guards = (declaration?.guards ?? []).flatMap((name, at) => {
    const address = addressOf(graph, name);
    const item = address ? el("a", null, name) : el("span", null, name);
    if (address) item.setAttribute("href", address);
    return at ? [" ", item] : [item];
  });
  const rateText = test.runs ? `${test.runs} runs` : "";
  const comparison = rate
    ? [rate.then ? ` (last release: ${rate.then})` : "", rate.worse ? " worse than the last release" : ""].join("")
    : "";
  const shown = [el("span", "id", test.id), " ", el("span", "outcome", test.outcome), " ",
    ...(rateText ? [el("span", "rate", rateText + comparison), " "] : []),
    ...(who ? [el("span", "who", `${who.fields.participant}, ${who.fields.date}`), " "] : []),
    el("span", "guards", ...guards)];
  if (flaky) shown.push(el("span", "flaky-runs", ` passed in ${flaky.passedIn.join(", ")}; failed in ${flaky.failedIn.join(", ")}`));
  if (test.outcome === "failed") {
    const path = [...test.records].reverse().find((candidate) => failureRow(documents.get(candidate), test.id));
    if (path) shown.push(await failureBlock(host, { row: failureRow(documents.get(path), test.id), document: documents.get(path) }));
  }
  const item = el("li", "test", ...shown);
  item.setAttribute("data-test", test.id);
  return item;
}

async function detail(target, context, commit) {
  const { host } = context.product;
  const entry = (await host.readHistory(null, { ref: commit, limit: 1, changes: false }))[0];
  const head = el("p", "commit", `${commit} ${firstLine(entry?.message)} ${entry?.date ?? ""}`);
  let results;
  try {
    results = await host.readSnapshot(RESULTS_BRANCH);
  } catch {
    const link = el("a", null, "Open the server's page of runs");
    link.setAttribute("href", host.webLinks().actions);
    target.replaceChildren(head, el("p", "unreadable", "The result records cannot be read from the browser, for example in a private repository without a token. ",
      link));
    return;
  }
  const snapshot = await host.readSnapshot(commit);
  const declarations = (await Promise.all(snapshot.paths.filter(isTestFile).map(async (path) => testDeclarations(path, (await snapshot.read(path)) ?? "")))).flat();
  const [graph, saved, tags] = await Promise.all([traceGraph(snapshot, { commit }), snapshot.read(SCHEDULE_PATH), host.listTags()]);
  const schedule = saved == null ? defaultSchedule() : readDocument(scheduleSchema, SCHEDULE_PATH, saved);
  const tests = declarations.map(({ id, level }) => ({ id, level }));
  const [levels, flaky, rates] = await Promise.all([resultsAt(results, commit, tests), flakyTests(results, commit), rateComparison(results, commit, lastReleaseOf(tags))]);
  const documents = new Map();
  for (const path of results.paths.filter((candidate) => candidate.startsWith(`runs/${commit}/`) && candidate.endsWith(".md"))) {
    documents.set(path, readDocument(resultSchema.run, path, (await results.read(path)) ?? ""));
  }
  const byId = new Map(declarations.map((declaration) => [declaration.id, declaration]));
  const sections = [];
  for (const level of [...levels].sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level))) {
    const ran = level.passed + level.failed + level.flaky > 0;
    const summary = ran
      ? `${level.passed} passed, ${level.failed} failed, ${level.flaky} flaky, ${level.notRun} not run`
      : `not run on this commit — runs on: ${occasionsOf(level.level, schedule).join(", ") || "no occasion of the schedule"}`;
    const rows = await Promise.all(level.tests.map((test) => testRow(host, test, byId.get(test.id),
      { graph, documents, rate: rates.find((rate) => rate.test === test.id), flaky: flaky.find((each) => each.test === test.id) })));
    const section = el("section", "level", el("h3", null, level.level), el("p", "summary", summary), el("ul", null, ...rows));
    section.setAttribute("data-level", level.level);
    sections.push(section);
  }
  const uncommitted = [...documents.entries()].filter(([, document]) => document.fields.uncommitted === "true")
    .map(([path, document]) => el("p", "uncommitted", `${document.fields.participant}, ${document.fields.date}: uncommitted changes, not counted (${path})`));
  target.replaceChildren(head, ...sections, ...uncommitted);
}

async function render(target, context, params = {}) {
  if (!context.product) {
    target.replaceChildren(el("p", null, "Choose a product to see the runs of its commits."));
    return;
  }
  if (params.commit) return detail(target, context, params.commit);
  const { host } = context.product;
  const info = await host.repositoryInfo();
  const [history, pulls, tags] = await Promise.all([host.readHistory(null, { ref: info.defaultBranch, limit: 20, changes: false }), host.listPullRequests({ state: "open" }), host.listTags()]);
  chooser(target, context, { history, pulls, tags });
}

export const route = { name: "runs", entry: "tests", title: "Runs", render };
