// Independent release tests of UC-020 Browse the specification, its coverage: step 7 (the Gaps tab, its lists and its matrix), 7a (there are no gaps) and 7b (a version that predates Agent M's artifacts), through
// MOD-site-frame's frame and MOD-trace-pages' route `trace` with the key `gaps`, against MOD-repository-hosts' real GitHub host answered by a fake of fetch. Written by developer-sonnet-b, who built none of the
// view (ITM-599 was developer-sonnet-d's; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER). Each test states its input and its expected result in its own text (given / input / expect); every expected value is taken
// from the use case's step as quoted in the test or from the fixture the test builds, none from the code and none read from a document when the test runs. The page is found by what the use case names - the heading
// "Gaps", the lists by what each one lists ("realised by no use case", "named by no module", "named by no test", "use cases that realise no requirement", "unknown names"), the matrix by its columns (requirement,
// use cases, architecture decisions, modules, tests), a line by the name it shows - never by the route's class names.
// The harness is the helpers of the module's own system test: tests/trace-pages-harness.mjs and tests/trace-pages-world.mjs (a fixture DOM, a fake localStorage, GitHub).
// Run: node --test tests/release-uc-020-gaps.test.mjs
//
// Module: MOD-trace-pages; MOD-site-frame
// Guards: UC-020; THE TRACEABILITY MATRIX IS DERIVED; UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN; EVERY STEP EXPLAINS ITSELF
// Level: release

import test from "node:test";
import assert from "node:assert/strict";
import { doc, document, find, until } from "./trace-pages-harness.mjs";
import { githubWorld, installBrowser } from "./trace-pages-world.mjs";

const { view } = await import("../src/trace-pages/index.mjs");
const { startPage } = await import("../src/site-frame/index.mjs");
const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");

const INSTANCE = "akmaier/agent-m";
const PRODUCT = "https://github.com/alice/thesis-tool";
const REPO = "alice/thesis-tool";
const TICK = "`";
const spec = (...rules) => ["# Thesis tool - Specification", "", "## 1. Export", "",
  ...rules.flatMap(([name, text, check]) => [`**${name}** *(PO B. Example)*`, text, `*Check:* ${check}`, ""])].join("\n");
const testFile = (id, guards) => ["// " + id, "// level: unit", "// module: MOD-direct", `// guards: ${guards}`, ""].join("\n");

// The product at its default branch: five requirements' worth of coverage, one of each gap. ALPHA RULE is realised by UC-001, forced by ARC-001, named by MOD-direct and guarded by TST-501; BETA RULE has
// all but a test; DELTA RULE nothing names. UC-002 realises no requirement, and MOD-direct also names GHOST RULE, which the SPEC does not hold.
const GAPPY = {
  "SPEC.md": spec(["ALPHA RULE", "Alpha rule.", `${TICK}tests/alpha.test.mjs${TICK}`], ["BETA RULE", "Beta rule.", "at review."], ["DELTA RULE", "Delta rule on main.", "at review."]),
  "docs/use-cases/UC-001-first.md": doc("UC-001", "First use case", { realises: ["ALPHA RULE", "BETA RULE"] }),
  "docs/use-cases/UC-002-second.md": doc("UC-002", "Second use case", { realises: [] }),
  "docs/architecture/ARC-001-first.md": doc("ARC-001", "First decision", { forced_by: ["ALPHA RULE"] }),
  "docs/architecture/MOD-direct.md": doc("MOD-direct", "Direct module", { folder: "src/direct/", realises: ["ALPHA RULE", "BETA RULE", "GHOST RULE"] }),
  "tests/alpha.test.mjs": testFile("TST-501", "ALPHA RULE"),
};
// The same product at the tag v1.0.0, where DELTA RULE read otherwise.
const GAPPY_TAGGED = { ...GAPPY, "SPEC.md": spec(["ALPHA RULE", "Alpha rule.", `${TICK}tests/alpha.test.mjs${TICK}`], ["BETA RULE", "Beta rule.", "at review."], ["DELTA RULE", "Delta rule at the tag.", "at review."]) };
// A product with no gap at all: every requirement is realised, named by a module and guarded by a test, every use case realises one, and every name in an artifact is a requirement.
const COVERED = {
  "SPEC.md": spec(["ALPHA RULE", "Alpha rule.", `${TICK}tests/alpha.test.mjs${TICK}`]),
  "docs/use-cases/UC-001-first.md": doc("UC-001", "First use case", { realises: ["ALPHA RULE"] }),
  "docs/architecture/ARC-001-first.md": doc("ARC-001", "First decision", { forced_by: ["ALPHA RULE"] }),
  "docs/architecture/MOD-direct.md": doc("MOD-direct", "Direct module", { folder: "src/direct/", realises: ["ALPHA RULE"] }),
  "tests/alpha.test.mjs": testFile("TST-501", "ALPHA RULE"),
};
// The product at a tag that predates Agent M's artifacts: a SPEC and nothing else.
const OLD = { "SPEC.md": spec(["ALPHA RULE", "Alpha rule.", "at review."], ["BETA RULE", "Beta rule.", "at review."]) };

const addressOf = (ref) => `#trace/key=gaps/ref=${ref}/product=${encodeURIComponent(PRODUCT)}`;
const mainText = () => find(document.body, (node) => node.localName === "main")[0].textContent;
const settle = async () => { await until(() => false, 150); };

// The lines under the list whose heading matches: the text of each line, or [] for a list that reads "none"; undefined where the page draws no such list.
function listLines(heading) {
  const list = find(document.body, (node) => node.localName === "section" && [...node.childNodes].some((inner) => inner.localName === "h3" && heading.test(inner.textContent)));
  if (!list[0]) return undefined;
  return find(list[0], (node) => node.localName === "li").map((node) => node.textContent);
}
// The matrix as the rows of cells a person reads: [requirement, use cases, architecture decisions, modules, tests] for each requirement.
const matrix = () => {
  const table = find(document.body, (node) => node.localName === "table" && find(node, (inner) => inner.localName === "th").length === 5)[0];
  const header = find(table, (node) => node.localName === "th").map((node) => node.textContent);
  const rows = find(table, (node) => node.localName === "tr").filter((row) => find(row, (node) => node.localName === "td").length).map((row) => find(row, (node) => node.localName === "td").map((cell) => cell.textContent));
  return { header, rows };
};

// A person opens the page at `fragment`: the frame started on the view of MOD-trace-pages, over this browser's store with the product it keeps, against a fake GitHub holding the refs given.
async function visit(t, fragment, refs) {
  const world = githubWorld({ [REPO]: refs, [INSTANCE]: { main: {} } });
  const realFetch = globalThis.fetch;
  const realInterval = globalThis.setInterval;
  globalThis.fetch = world.fetch;
  globalThis.setInterval = () => 1;
  t.after(() => { globalThis.fetch = realFetch; globalThis.setInterval = realInterval; });
  const browser = installBrowser(fragment);
  const store = openStore(INSTANCE);
  writeSetting(store, "products", [PRODUCT]);
  await startPage({ page: "review", views: [view] });
  await settle();
  return { world, browser, product: () => world.forRepository(REPO) };
}

// TST-020701 · level: release · module: MOD-trace-pages; MOD-site-frame
// guards: UC-020; THE TRACEABILITY MATRIX IS DERIVED; UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
// given: this browser keeps the product https://github.com/alice/thesis-tool; its default branch holds a SPEC of ALPHA RULE, BETA RULE and DELTA RULE, the use cases UC-001 (realises ALPHA RULE and BETA RULE) and UC-002 (realises none), the decision ARC-001 (forced by ALPHA RULE), the module MOD-direct (names ALPHA RULE, BETA RULE and GHOST RULE) and the test TST-501 (guards ALPHA RULE)
// input: open the address #trace/key=gaps/ref=main/product=<the product>
// expect: UC-020 step 7 "lists: requirements realised by no use case, and - once they exist - named by no module or no test; use cases that realise no requirement; names in use cases, modules or tests that match no requirement": the page is headed Gaps; "realised by no use case" lists DELTA RULE only; "named by no module" DELTA RULE only; "named by no test" BETA RULE and DELTA RULE; "use cases that realise no requirement" UC-002; "unknown names" GHOST RULE, named by MOD-direct; "the traceability matrix ... every requirement against every use case, architecture decision, module and test that names it": the columns are requirement, use cases, architecture decisions, modules, tests; ALPHA RULE: UC-001, ARC-001, MOD-direct, TST-501; BETA RULE: UC-001, none, MOD-direct, none; DELTA RULE: none in all four; "The gaps are shown and block nothing": the product's repository is only read
test("release · UC-020 7: Gaps lists the requirements nothing realises or checks, the use cases realising none and the unknown names, beside the matrix", async (t) => {
  const page = await visit(t, addressOf("main"), { main: GAPPY });
  assert.ok(find(document.body, (node) => /^h[123]$/.test(node.localName) && node.textContent === "Gaps").length > 0, "the page is headed Gaps");
  assert.deepEqual(listLines(/realised by no use case/i), ["DELTA RULE"]);
  assert.deepEqual(listLines(/named by no module/i), ["DELTA RULE"]);
  assert.deepEqual(listLines(/named by no test/i), ["BETA RULE", "DELTA RULE"]);
  assert.equal(listLines(/use cases that realise no requirement/i).length, 1);
  assert.match(listLines(/use cases that realise no requirement/i)[0], /UC-002/);
  assert.equal(listLines(/unknown names/i).length, 1);
  assert.match(listLines(/unknown names/i)[0], /GHOST RULE/);
  assert.match(listLines(/unknown names/i)[0], /MOD-direct/);
  const { header, rows } = matrix();
  assert.deepEqual(header, ["Requirement", "Use cases", "Architecture decisions", "Modules", "Tests"]);
  assert.deepEqual(rows, [["ALPHA RULE", "UC-001", "ARC-001", "MOD-direct", "TST-501"], ["BETA RULE", "UC-001", "none", "MOD-direct", "none"], ["DELTA RULE", "none", "none", "none", "none"]]);
  assert.doesNotMatch(mainText(), /There are no gaps/, "known positive: gaps exist, so the page does not say there are none");
  assert.deepEqual(page.product().filter((request) => request.method !== "GET"), [], "the gaps block nothing and write nothing");
  assert.deepEqual(page.world.requests.filter((request) => request.kind === "other"), []);
});

// TST-020702 · level: release · module: MOD-trace-pages; MOD-site-frame
// guards: UC-020; THE TRACEABILITY MATRIX IS DERIVED
// given: the same product, whose tag v1.0.0 holds the same artifacts and a SPEC where DELTA RULE reads "Delta rule at the tag." (the default branch reads "Delta rule on main.")
// input: open the address #trace/key=gaps/ref=v1.0.0/product=<the product>, then follow the line DELTA RULE under "realised by no use case"
// expect: UC-020 step 7 "Each line leads to the requirement or use case as it read in that version": the requirement opens with the rule "Delta rule at the tag." and the page does not show "Delta rule on main."; then, for the line UC-002 under "use cases that realise no requirement", the use case opens with its title "Second use case"
test("release · UC-020 7: a line of Gaps leads to the requirement or use case as it read in the version shown", async (t) => {
  await visit(t, addressOf("v1.0.0"), { main: GAPPY, "v1.0.0": GAPPY_TAGGED });
  assert.deepEqual(listLines(/realised by no use case/i), ["DELTA RULE"], "known positive: the gaps of the tag are drawn");
  const lineButton = (name) => find(document.body, (node) => node.localName === "button" && node.textContent.startsWith(name))[0];
  assert.ok(lineButton("DELTA RULE"), "the line DELTA RULE can be followed");
  lineButton("DELTA RULE").dispatchEvent(new Event("click"));
  await until(() => /Delta rule at the tag\./.test(mainText()));
  assert.match(mainText(), /Delta rule at the tag\./);
  assert.doesNotMatch(mainText(), /Delta rule on main\./);
  assert.ok(lineButton("UC-002"), "the line UC-002 can be followed");
  lineButton("UC-002").dispatchEvent(new Event("click"));
  await until(() => /Second use case/.test(mainText()));
  assert.match(mainText(), /Second use case/);
});

// TST-020703 · level: release · module: MOD-trace-pages; MOD-site-frame
// guards: UC-020; UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
// given: this browser keeps the product; its default branch holds a SPEC of ALPHA RULE, a use case that realises it, a decision forced by it, a module that names it and a test that guards it, and no other name
// input: open the address #trace/key=gaps/ref=main/product=<the product>
// expect: UC-020 7a "There are no gaps. Gaps says so; it does not hide": the page says there are no gaps, lists no gap (no list of requirements realised by no use case, named by no module or no test, no unknown names), and still shows the matrix with ALPHA RULE: UC-001, ARC-001, MOD-direct, TST-501
test("release · UC-020 7a: with no gap the page says so and still shows the matrix", async (t) => {
  await visit(t, addressOf("main"), { main: COVERED });
  assert.match(mainText(), /There are no gaps/);
  assert.equal(listLines(/realised by no use case/i), undefined, "no list of gaps is drawn");
  assert.equal(listLines(/unknown names/i), undefined);
  assert.deepEqual(matrix().rows, [["ALPHA RULE", "UC-001", "ARC-001", "MOD-direct", "TST-501"]]);
});

// TST-020704 · level: release · module: MOD-trace-pages; MOD-site-frame
// guards: UC-020; UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
// given: this browser keeps the product, whose tag v0.1.0 predates Agent M's artifacts: it holds a SPEC of ALPHA RULE and BETA RULE, and no use case, decision, module or test; its default branch is the product with gaps (TST-020701)
// input: open the address #trace/key=gaps/ref=v0.1.0/product=<the product>
// expect: UC-020 7b "Gaps shows what exists at that commit and says what is missing, instead of an empty matrix without explanation": the page says that no use cases, no architecture decisions, no modules and no tests exist at v0.1.0; it shows what exists - the matrix with ALPHA RULE and BETA RULE, each with none in all four columns -; it does not say that there are no gaps
test("release · UC-020 7b: a version that predates the artifacts says what is missing and shows what exists", async (t) => {
  await visit(t, addressOf("v0.1.0"), { main: GAPPY, "v0.1.0": OLD });
  const text = mainText();
  for (const kind of [/No use cases/i, /No architecture decisions/i, /No modules/i, /No tests/i]) assert.match(text, kind);
  assert.match(text, /v0\.1\.0/);
  assert.doesNotMatch(text, /There are no gaps/, "an empty version is not a version without gaps");
  assert.deepEqual(matrix().rows, [["ALPHA RULE", "none", "none", "none", "none"], ["BETA RULE", "none", "none", "none", "none"]]);
});

// TST-020705 · level: release · module: MOD-trace-pages; MOD-site-frame
// guards: UC-020; UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
// given: this browser keeps the product, whose tag v0.0.1 holds no SPEC.md requirement at all (a SPEC that is a title only) and nothing else
// input: open the address #trace/key=gaps/ref=v0.0.1/product=<the product>
// expect: UC-020 7b "says what is missing, instead of an empty matrix without explanation": the page says that the SPEC holds no requirements at v0.0.1, draws no matrix, and does not say that there are no gaps
test("release · UC-020 7b: a version whose SPEC holds no requirement says so instead of showing an empty matrix", async (t) => {
  await visit(t, addressOf("v0.0.1"), { main: GAPPY, "v0.0.1": { "SPEC.md": "# Thesis tool - Specification\n" } });
  assert.match(mainText(), /holds no requirements/i);
  assert.match(mainText(), /v0\.0\.1/);
  assert.doesNotMatch(mainText(), /There are no gaps/);
  assert.equal(find(document.body, (node) => node.localName === "table").length, 0, "no empty matrix is drawn");
});
