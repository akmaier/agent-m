// The tests page of the trace Route (UC-029 steps 1 to 3, 1a, 2a): the tests of the version drawn as a tree by level, test file and test case, or grouped by
// requirement, by use case or by module; each test with its identifier, its title and its outcome on the commit of that version, read from the branch
// `test-results`; the filters; the Incomplete group; a guarded name that matches nothing, shown as a broken link with its test kept. It reads the
// version's test files through the snapshot and writes nothing. A private repository no token reaches never gets here: the first read of the version fails
// in the route, which leaves it to the frame to say.
//
// Module: MOD-trace-pages

import { isTestFile, testDeclarations } from "../test-document/index.mjs";
import { resultsAt } from "../result-records/index.mjs";

const LEVELS = ["unit", "component", "system", "release", "user"];
const GROUPINGS = ["level", "requirement", "use case", "module"];
const FILTERS = ["all", "failed", "flaky", "not run", "model-dependent", "calls a paid service", "without counter-proof", "guards nothing"];
const RESULTS_BRANCH = "test-results";
const COUNTER_PROOFS = "docs/tests/counter-proofs/";

function el(name, className, ...children) {
  const node = document.createElement(name);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

const guardsOf = (declaration) => [...new Set((declaration.guards ?? []).map((name) => String(name).trim()).filter(Boolean))];

// What a declaration lacks of the level and the guards; the identifier is there, since testDeclarations yields none without it.
function missingOf(declaration) {
  return [...(LEVELS.includes(declaration.level) ? [] : ["level"]), ...(guardsOf(declaration).length ? [] : ["guards"])];
}

// Every test declaration of the version, in the order of the paths of the test files and then of the lines.
async function declarationsOf(snapshot) {
  const paths = snapshot.paths.filter((path) => !path.startsWith(COUNTER_PROOFS) && isTestFile(path)).sort();
  if (paths.length) await snapshot.readMany?.(paths);
  const found = [];
  for (const path of paths) found.push(...testDeclarations(path, (await snapshot.read(path)) ?? ""));
  return found;
}

// The outcome of each test on the commit of the version: resultsAt's, from the branch test-results; none where the branch cannot be read.
async function outcomesOf(host, snapshot, declarations) {
  const outcomes = new Map();
  let problem = null;
  try {
    const results = await host.readSnapshot(RESULTS_BRANCH);
    const asked = declarations.map((declaration) => ({ id: declaration.id, level: declaration.level ?? "none" }));
    for (const level of await resultsAt(results, snapshot.commit, asked)) for (const test of level.tests) outcomes.set(test.id, test);
  } catch (failure) {
    problem = failure;
  }
  return { outcomes, problem };
}

const outcomeText = (test) => `${test.outcome}${test.runs ? ` (${test.runs})` : ""}`;

const KEEP = {
  all: () => true,
  failed: (test) => test.outcome === "failed",
  flaky: (test) => test.outcome === "flaky",
  "not run": (test) => test.outcome === "not run",
  "model-dependent": (test) => test.declaration.runs != null,
  "calls a paid service": (test) => test.declaration.paid != null,
  "without counter-proof": (test) => !test.counterProof,
  "guards nothing": (test) => guardsOf(test.declaration).length === 0,
};

function caseLine(test, withMissing) {
  const line = el("div", "tests-case", el("span", "tests-id", test.declaration.id), " ", el("span", "tests-title", test.declaration.title ?? ""), " ",
    el("span", "tests-outcome", outcomeText(test)));
  if (withMissing) line.append(" ", el("span", "tests-missing", test.missing.join(", ")));
  return line;
}

// The groups of a grouping, each { name, broken, tests }: the names the version holds in their order, then the names only a test guards, marked broken.
function groupsOf(grouping, tests, names) {
  const groups = new Map(names.known.map((name) => [name, { name, broken: false, tests: [] }]));
  const place = (name, test) => {
    if (!groups.has(name)) groups.set(name, { name, broken: true, tests: [] });
    groups.get(name).tests.push(test);
  };
  for (const test of tests) {
    if (grouping === "module") {
      place(test.declaration.module ?? "no module", test);
      continue;
    }
    for (const name of guardsOf(test.declaration)) if (/^UC-/.test(name) === (grouping === "use case")) place(name, test);
  }
  return [...groups.values()];
}

function levelsLine(group) {
  return el("ul", "tests-levels", ...LEVELS.map((level) => {
    const count = group.tests.filter((test) => test.declaration.level === level).length;
    return el("li", "tests-level", `${level}: ${count || "empty"}`);
  }));
}

function groupBox(group) {
  const name = el("span", group.broken ? "tests-group-name tests-broken" : "tests-group-name", group.name);
  const head = el("h3", null, name);
  if (group.broken) head.append(" ", el("span", "tests-broken-note", "broken link: nothing of the version has this name"));
  return el("section", "tests-group", head, levelsLine(group), ...group.tests.map((test) => caseLine(test, false)));
}

function treeBoxes(tests) {
  const boxes = [];
  for (const level of LEVELS) {
    const inLevel = tests.filter((test) => test.declaration.level === level);
    if (!inLevel.length) continue;
    const files = [...new Set(inLevel.map((test) => test.declaration.path))];
    boxes.push(el("section", "tests-group", el("h3", null, el("span", "tests-group-name", level)),
      ...files.map((path) => el("section", "tests-file", el("h4", null, el("span", "tests-file-name", path)),
        ...inLevel.filter((test) => test.declaration.path === path).map((test) => caseLine(test, false))))));
  }
  return boxes;
}

/**
 * Draws the tests page into `place`: reads the version's test files, their outcomes and what the grouping needs, then the page whose grouping and filter
 * the two selects change without reading again.
 */
export async function showTests(place, shown) {
  const { snapshot, spec, context } = shown;
  let declarations, found;
  try {
    declarations = await declarationsOf(snapshot);
    found = await outcomesOf(context.product.host, snapshot, declarations);
  } catch (failure) {
    place.replaceChildren(el("p", "traces-problem", `The tests could not be read: ${failure?.message ?? failure}`));
    return;
  }
  const tests = declarations.map((declaration) => ({
    declaration, missing: missingOf(declaration), counterProof: snapshot.paths.includes(`${COUNTER_PROOFS}${declaration.id}.md`),
    ...(found.outcomes.get(declaration.id) ?? { outcome: "not run", runs: null }),
  }));
  const complete = tests.filter((test) => !test.missing.length);
  const incomplete = tests.filter((test) => test.missing.length);
  const idOf = (path) => /\/([^/]+)\.md$/.exec(path)?.[1];
  const names = {
    requirement: { known: [...spec.requirements.keys()] },
    "use case": { known: snapshot.paths.map((path) => /^docs\/use-cases\/(UC-\d+)/.exec(path)?.[1]).filter(Boolean).sort() },
    module: { known: [...snapshot.paths.filter((path) => /^docs\/architecture\/MOD-[^/]+\.md$/.test(path)).map(idOf).sort(), "system"] },
  };

  const state = { grouping: "level", filter: "all" };
  const body = el("div", "tests-body");
  const choice = (className, label, values, key) => {
    const select = el("select", className);
    select.setAttribute("aria-label", label);
    for (const value of values) {
      const option = el("option", null, value);
      option.value = value;
      select.append(option);
    }
    select.value = state[key];
    select.addEventListener("change", () => { state[key] = select.value; draw(); });
    return el("label", null, `${label} `, select);
  };
  function draw() {
    const keep = KEEP[state.filter] ?? KEEP.all;
    const boxes = state.grouping === "level" ? treeBoxes(complete.filter(keep)) : groupsOf(state.grouping, complete.filter(keep), names[state.grouping]).map(groupBox);
    const left = incomplete.filter(keep);
    body.replaceChildren(...boxes, ...(left.length ? [el("section", "tests-incomplete", el("h3", null, "Incomplete"), ...left.map((test) => caseLine(test, true)))] : []));
    if (!boxes.length && !left.length) body.append(el("p", "none", "No test matches."));
  }
  draw();
  place.replaceChildren(el("div", "tests-bar", choice("tests-grouping", "Group by", GROUPINGS, "grouping"), " ", choice("tests-filter", "Show", FILTERS, "filter"),
    ...(found.problem ? [el("p", "traces-problem", `The results could not be read: ${found.problem?.message ?? found.problem}`)] : [])), body);
}
