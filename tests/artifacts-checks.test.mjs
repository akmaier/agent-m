// Every format check of one kind of artifact in one call (docs/assets/artifacts/checks.mjs, formatChecks): the findings a
// drafting job's correction loop sends back, for proposed requirements, use cases, decisions, modules, tests and group files.
// Deterministic, no network. Run: node --test tests/*.test.mjs
//
// Module: MOD-artifacts
// Guards: UC-007; UC-019; UC-022; A FINDING READS LIKE A COMPILER MESSAGE
// Level: unit
//
// The texts are fixtures only — the SPEC itself is never read (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE): the complete fixture
// product tests/fixtures/identity/v2, the requirements of tests/fixtures/requirements/spec.md, the complete use case of
// tests/fixtures/use-cases/ and the group files of tests/fixtures/groups/. Each broken text is a copy of a complete one with
// one fault planted by plant(), which refuses a replacement that does not occur exactly once. This repository's own use
// cases, decisions, modules and group files are checked for their form. Counter-proofs:
// docs/measurements/2026-10-01_format-checks.md.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { FORMAT_KINDS, formatChecks } from "../docs/assets/artifacts/checks.mjs";
import { isRequirementName, parseRequirements, requirementProblems } from "../docs/assets/artifacts/requirements.mjs";
import { useCaseProblems } from "../docs/assets/artifacts/use-cases.mjs";
import { levelProblems } from "../docs/assets/artifacts/headers.mjs";
import { identifiers, originProblems, stabilityProblems } from "../docs/assets/artifacts/identity.mjs";
import { hierarchy, parseGroupFile } from "../docs/assets/artifacts/groups.mjs";

const FIX = new URL("./fixtures/", import.meta.url);
const ROOT = new URL("../", import.meta.url);
const read = (path, base = FIX) => readFileSync(new URL(path, base), "utf8");
const V2 = (p) => read(`identity/v2/${p}`);
const V1 = (p) => read(`identity/v1/${p}`);

// A copy of a text with one fault planted: `from` must occur exactly once.
function plant(text, from, to) {
  const n = text.split(from).length - 1;
  assert.equal(n, 1, `the planted text must occur exactly once: ${JSON.stringify(from)} occurs ${n} times`);
  return text.replace(from, () => to);
}

const SHAPE = ["artifact", "line", "kind", "what", "rule", "fix"];
const brief = (fs) => fs.map((f) => [f.artifact, f.line, f.kind, f.rule, f.what]);

// The fixture product of tests/fixtures/identity/v2: its requirements, and its artifacts as formatChecks takes them.
const KNOWN = parseRequirements(V2("SPEC.md"));
const ARC = "docs/architecture/ARC-001-static-client.md";
const MOD = "docs/architecture/MOD-view.md";
const TEST = "tests/view.spec.mjs";
const decision = (text, more = {}) => formatChecks("architecture-decision", text, { path: ARC, knownNames: KNOWN, ...more });
const module_ = (text, more = {}) => formatChecks("module", text, { path: MOD, knownNames: KNOWN, ...more });
const testFile = (text, more = {}) => formatChecks("test", text, { path: TEST, knownNames: KNOWN, ...more });

// The requirements fixture, well formed for a product that links these three sources.
const SPEC = read("requirements/spec.md");
const LINKED = ["SRC-po", "SRC-model-licence", "SRC-iec-62304"];
const requirement = (text, linked = LINKED) => formatChecks("requirement", text, { linkedSources: linked });

const UC = "docs/use-cases/UC-001-complete.md";
const UC_TEXT = read("use-cases/UC-001-complete.md");
const UC_KNOWN = read("use-cases/known-requirements.txt").split("\n").filter(Boolean);
const useCase = (text, more = {}) => formatChecks("use-case", text, { path: UC, knownNames: UC_KNOWN, ...more });

const ORIGIN = "EVERY ARTIFACT NAMES ITS ORIGIN";
const HAS_ID = "EVERY ARTIFACT HAS AN IDENTIFIER";
const KEPT = "AN EDITED FILE KEEPS ITS IDENTIFIER";
const ARC_FILE = "ONE ARCHITECTURE DECISION, ONE FILE";
const ARC_PARTS = "AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES";
const MOD_FILE = "ONE MODULE, ONE FILE";
const MOD_PARTS = "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES";

// Every finding the tests below provoke, for the test of their form.
const SEEN = [];
const seen = (fs) => { SEEN.push(...fs); return fs; };

// ---------------------------------------------------------------- the kinds

test("formatChecks knows the six kinds, and refuses another by naming them", () => {
  assert.deepEqual(FORMAT_KINDS, ["requirement", "use-case", "architecture-decision", "module", "test", "group-file"]);
  assert.throws(() => formatChecks("decision", ""), /unknown kind "decision" — one of requirement, use-case, architecture-decision, module, test, group-file/);
  assert.throws(() => formatChecks(undefined, ""), /unknown kind/);
});

test("a complete artifact of every kind yields no finding", () => {
  assert.deepEqual(requirement(SPEC), [], "the requirements fixture");
  assert.deepEqual(formatChecks("requirement", V2("SPEC.md"), { linkedSources: ["SRC-po"] }), [], "the fixture product's SPEC");
  assert.deepEqual(useCase(UC_TEXT, { openedId: "UC-001" }), [], "the complete use case, opened as UC-001");
  assert.deepEqual(decision(V2(ARC), { openedId: "ARC-001" }), [], ARC);
  for (const m of ["MOD-page", "MOD-reader", "MOD-view"]) {
    const path = `docs/architecture/${m}.md`;
    assert.deepEqual(formatChecks("module", V2(path), { path, knownNames: KNOWN, openedId: m }), [], path);
  }
  for (const t of ["tests/reader.spec.mjs", "tests/view.spec.mjs"]) {
    assert.deepEqual(formatChecks("test", V2(t), { path: t, knownNames: KNOWN }), [], t);
  }
  assert.deepEqual(formatChecks("group-file", read("groups/repo/docs/groups/modules.md"),
    { path: "docs/groups/modules.md", items: ["MOD-export", "MOD-page"] }), [], "the fixture product's module groups");
});

// ---------------------------------------------------------------- one call runs every check of the kind

test("one call runs every check of its kind — the same findings as the single checks, nothing left out", () => {
  // Use cases: useCaseProblems, finding for finding, on every fixture of tests/fixtures/use-cases/.
  for (const name of readdirSync(new URL("use-cases/", FIX)).filter((n) => n.endsWith(".md"))) {
    const path = `docs/use-cases/${name}`, text = read(`use-cases/${name}`);
    assert.deepEqual(formatChecks("use-case", text, { path, knownNames: UC_KNOWN }), useCaseProblems(path, text, UC_KNOWN), name);
  }
  // Requirements: requirementProblems of every requirement, with a source the product does not link.
  const reqs = [...parseRequirements(SPEC).values()].flatMap((r) => requirementProblems(r, ["SRC-po"]));
  assert.ok(reqs.length >= 2, "the fixture yields findings once two of its sources are not linked");
  assert.deepEqual(requirement(SPEC, ["SRC-po"]), reqs);
  // Tests: the level, the origin and the TST- identifiers, on every test of the earlier fixture version.
  for (const name of readdirSync(new URL("identity/v1/tests/", FIX))) {
    const path = `tests/${name}`, text = V1(path), files = { [path]: text };
    const single = [...levelProblems(path, text), ...originProblems(files), ...identifiers(files).problems];
    assert.deepEqual(formatChecks("test", text, { path }), single, name);
  }
  // Group files: the hierarchy's problems, as tests/fixtures/groups/broken/expected.json names them.
  const expected = JSON.parse(read("groups/broken/expected.json"));
  for (const [name, want] of Object.entries(expected)) {
    const text = read(`groups/broken/${name}`);
    const found = seen(formatChecks("group-file", text, { path: `docs/groups/${name}`, items: want.items }));
    assert.deepEqual(found.map((f) => [f.line, f.kind, f.rule, f.what]), want.problems, name);
    assert.deepEqual(found.map((f) => [f.line, f.kind, f.rule, f.what, f.fix]),
      hierarchy(parseGroupFile(text), want.items).problems.map((f) => [f.line, f.kind, f.rule, f.what, f.fix]), name);
  }
});

// ---------------------------------------------------------------- requirement — a SPEC or a queue entry (UC-019)

test("a requirement: each broken field, check, source, statement and name is one finding at its line", () => {
  const PDF = "THE EXPORT IS A PDF", FIVE = "A REQUIREMENT HAS FIVE FIELDS";
  const cases = [
    [plant(SPEC, "*Check:* `tests/test_export.py`\n", ""), [[PDF, 13, "error", FIVE, "no check"]]],
    [plant(SPEC, "*Check:* `tests/test_export.py`", "*Check:* by hand"),
      [[PDF, 13, "error", "A REQUIREMENT NAMES ITS CHECK", 'the check "by hand" names no test']]],
    [plant(SPEC, "**THE EXPORT IS A PDF** *(SRC-po, 2026-09-24)*", "**THE EXPORT IS A PDF** *(SRC-po)*"),
      [[PDF, 13, "error", FIVE, "the source has no date"]]],
    [plant(SPEC, "*Occasion:* the readers print it.\n", ""), [[PDF, 13, "error", FIVE, "no occasion"]]],
    [plant(SPEC, "The export of a report is a PDF file.", "The export of a report is a PDF file and a CSV file."),
      [[PDF, 13, "warning", "ONE STATEMENT PER REQUIREMENT", 'the rule contains "and"']]],
    [plant(SPEC, "**THE EXPORT IS A PDF** *(SRC-po, 2026-09-24)*", "**THE EXPORT IS A PDF** *(RES-model, 2026-09-24)*"),
      [[PDF, 13, "error", "A RESOURCE'S TERMS ENTER AS A SOURCE", "the source names the resource entry RES-model"],
        [PDF, 13, "error", "A REQUIREMENT HAS A REGISTERED SOURCE", "the source names no registered source"]]],
    [plant(SPEC, "**THE EXPORT IS A PDF**", "**The export is a PDF**"),
      [["SPEC.md", 13, "error", HAS_ID, 'the requirement "The export is a PDF" has no name in capitals']]],
    [SPEC + "\n**THE EXPORT IS A PDF** *(SRC-po, 2026-10-01)*\nA second rule under the name.\n*Occasion:* none.\n" +
      "*Check:* `tests/test_export.py`\n",
      [[PDF, 44, "error", HAS_ID, "THE EXPORT IS A PDF is carried by line 13 and by line 44"]]],
  ];
  for (const [text, want] of cases) assert.deepEqual(brief(seen(requirement(text))), want, want[0][4]);
  // A source the product does not link: the requirement that names it, nothing else.
  assert.deepEqual(brief(seen(requirement(SPEC, ["SRC-po", "SRC-model-licence"]))),
    [["EVERY CHANGE IS VERIFIED", 37, "error", "A REQUIREMENT HAS A REGISTERED SOURCE", "the product does not link SRC-iec-62304"]]);
});

// ---------------------------------------------------------------- use case (UC-007, UC-019)

test("a use case: the identifier it was opened with is kept, beside every check of useCaseProblems", () => {
  assert.deepEqual(brief(seen(useCase(UC_TEXT, { openedId: "UC-002" }))),
    [["UC-002", 2, "error", KEPT, "the file was opened as UC-002, but the text carries the identifier UC-001"]]);
  assert.deepEqual(brief(seen(useCase(plant(UC_TEXT, "id: UC-001\n", ""), { openedId: "UC-001" }))), [
    ["UC-001", 1, "error", "ONE USE CASE, ONE FILE", 'id (none) does not match the file name (UC-001)'],
    ["UC-001", 1, "error", KEPT, "the file was opened as UC-001, but the text carries no identifier"],
  ]);
  assert.deepEqual(brief(seen(useCase(plant(UC_TEXT, "  - EXPORT AS CSV\n", "  - EXPORT AS XML\n")))),
    [["UC-001", 9, "error", "A USE CASE REALISES NAMED REQUIREMENTS", 'realises "EXPORT AS XML" matches no requirement']]);
  assert.deepEqual(useCase(UC_TEXT), [], "without openedId, no identifier is compared");
});

// ---------------------------------------------------------------- architecture decision (UC-022)

test("a decision: each broken part, origin, key, identifier, diagram and withdrawal is one finding at its line", () => {
  const T = V2(ARC);
  const cases = [
    [plant(T, "## Alternatives\n", ""), [["ARC-001", 1, "error", ARC_PARTS, "missing section ## Alternatives"]]],
    [plant(T, "title: A static client reads the files\n", ""), [["ARC-001", 1, "error", ARC_PARTS, "missing title"]]],
    [plant(T, "forced_by:\n  - UC-001\n", "forced_by:\n"),
      [["ARC-001", 4, "error", ORIGIN, "forced_by must name at least one item"]]],
    [plant(T, "  - UC-001\n", "  - UC-001\n  - ui only\n"),
      [["ARC-001", 6, "error", ORIGIN, 'forced_by: "ui only" is not a use case (UC-<nnn>) or a requirement name']]],
    [plant(T, "  - UC-001\n", "  - UC-001\n  - NO SUCH RULE\n"),
      [["ARC-001", 6, "error", ORIGIN, 'forced_by "NO SUCH RULE" matches no requirement']]],
    [plant(T, "  - UC-001\n", "  - UC-001\nfollows:\n  - ARC-002\n"),
      [["ARC-001", 6, "error", ARC_FILE, "key follows belongs to a module"]]],
    [plant(T, "id: ARC-001", "id: ARC-002"),
      [["ARC-001", 2, "error", ARC_FILE, 'id "ARC-002" does not match the file name (ARC-001)']]],
    [plant(T, "A static page reads them.\n", "A static page reads them.\n\n![the client](client.png)\n"),
      [["ARC-001", 17, "error", "DIAGRAMS ARE MERMAID IN MARKDOWN", "diagram stored as an image file (client.png)"]]],
    [plant(T, "  - UC-001\n", "  - UC-001\nwithdrawn: 2026-10-01\n"),
      [["ARC-001", 6, "error", "THE NAME IS THE ID AND IT SURVIVES", "withdrawn on 2026-10-01 without the reason under ## Withdrawn"]]],
    [plant(T, "---\nid: ARC-001\ntitle: A static client reads the files\nforced_by:\n  - UC-001\n---\n", ""),
      [["ARC-001", 1, "error", ARC_FILE, "no front matter"]]],
  ];
  for (const [text, want] of cases) assert.deepEqual(brief(seen(decision(text))), want, want[0][4]);
  // A withdrawn decision with its reason keeps its file and yields nothing.
  assert.deepEqual(decision(plant(T, "  - UC-001\n", "  - UC-001\nwithdrawn: 2026-10-01\n") +
    "\n## Withdrawn\n\nReplaced by a decision that reads the files through the API.\n"), []);
  assert.deepEqual(brief(seen(decision(T, { openedId: "ARC-009" }))),
    [["ARC-009", 2, "error", KEPT, "the file was opened as ARC-009, but the text carries the identifier ARC-001"]]);
  assert.deepEqual(brief(seen(decision(V2(MOD), { path: MOD }))),
    [["MOD-view", 1, "error", ARC_FILE, "the file is a module, not a decision"]], "a module checked as a decision");
  assert.deepEqual(brief(seen(decision(T, { path: "docs/decisions/ARC-001-static-client.md" }))),
    [["ARC-001", 1, "error", ARC_FILE, "not docs/architecture/ARC-<nnn>-<slug>.md or MOD-<slug>.md"]],
    "a decision outside docs/architecture/ is named for its place");
});

// ---------------------------------------------------------------- module (UC-022)

test("a module: each broken interface, origin, key and part is one finding at its line", () => {
  const T = V2(MOD);
  const cases = [
    [plant(T, "  - MOD-reader.readFile\n", "  - readFile\n"),
      [["MOD-view", 11, "error", MOD_PARTS, 'uses: "readFile" is not an interface of another module (MOD-<slug>.<interface>)']]],
    [plant(T, "  - showStatus\n", "  - showStatus\n  - hideStatus\n"),
      [["MOD-view", 14, "error", MOD_PARTS, "interface hideStatus is not described in ## Interfaces"]]],
    [plant(T, "  - showStatus\n", "  - showStatus\n  - showStatus\n"),
      [["MOD-view", 12, "error", MOD_PARTS, "provides names an interface twice"]]],
    [plant(T, "  - showStatus\n", "  - showStatus\nforced_by:\n  - UC-002\n"),
      [["MOD-view", 14, "error", MOD_FILE, "key forced_by belongs to an architecture decision"]]],
    [plant(T, "realises:\n  - THE STATUS IS SHOWN\n  - EVERY FILE HAS A STATUS\n  - UC-002\n", "realises: []\n"),
      [["MOD-view", 4, "error", ORIGIN, "the module names nothing it realises"]]],
    [plant(T, "follows:\n  - ARC-001\n", "follows: []\n"),
      [["MOD-view", 8, "error", ORIGIN, "the module names no decision it follows"]]],
    [plant(T, "  - EVERY FILE HAS A STATUS\n", "  - EVERY FILE HAS A COLOUR\n"),
      [["MOD-view", 6, "error", ORIGIN, 'realises "EVERY FILE HAS A COLOUR" matches no requirement']]],
    [plant(T, "## Interfaces\n", ""), [
      ["MOD-view", 13, "error", MOD_PARTS, "interface showStatus is not described in ## Interfaces"],
      ["MOD-view", 1, "error", MOD_PARTS, "missing section ## Interfaces"]]],
  ];
  for (const [text, want] of cases) assert.deepEqual(brief(seen(module_(text))), want, want[0][4]);
  assert.deepEqual(brief(seen(module_(T, { openedId: "MOD-page" }))),
    [["MOD-page", 2, "error", KEPT, "the file was opened as MOD-page, but the text carries the identifier MOD-view"]]);
  assert.deepEqual(module_(plant(T, "  - EVERY FILE HAS A STATUS\n", "  - EVERY FILE HAS A COLOUR\n"), { knownNames: undefined }), [],
    "without known names, a name is checked for its form only");
});

// ---------------------------------------------------------------- test

test("a test: its level, its module, what it guards and its case identifiers are each one finding", () => {
  const T = V2(TEST), LEVEL = "EVERY TEST HAS ONE LEVEL";
  const cases = [
    [plant(T, "// Level: component\n", ""), [[TEST, 1, "error", LEVEL, "no Level: line among the first 20 lines"]]],
    [plant(T, "// Level: component", "// Level: smoke"),
      [[TEST, 5, "error", LEVEL, 'the level "smoke" is not one of unit, component, system, release, user']]],
    [plant(T, "// Module: MOD-view\n", ""), [[TEST, 1, "error", ORIGIN, "the test names no module"]]],
    [plant(T, "// Guards: THE STATUS IS SHOWN; EVERY FILE HAS A STATUS; UC-002\n", ""),
      [[TEST, 1, "error", ORIGIN, "the test guards nothing"]]],
    [plant(T, "EVERY FILE HAS A STATUS;", "EVERY FILE HAS A COLOUR;"),
      [[TEST, 4, "error", ORIGIN, 'the test guards "EVERY FILE HAS A COLOUR", which matches no requirement']]],
    [plant(T, "TST-004", "TST-4"), [[TEST, 9, "error", HAS_ID, "TST-4 is not TST-<nnn>"]]],
    [plant(plant(T, "TST-003 ", ""), "TST-004 ", ""), [[TEST, 1, "error", HAS_ID, "no test case carries a TST- identifier"]]],
  ];
  for (const [text, want] of cases) assert.deepEqual(brief(seen(testFile(text))), want, want[0][4]);
});

// ---------------------------------------------------------------- group file

test("a group file: each finding names the group file, at the line of the group file", () => {
  const text = read("groups/broken/twice.md");
  assert.deepEqual(brief(seen(formatChecks("group-file", text, { path: "docs/groups/use-cases.md", items: ["UC-001", "UC-002"] }))),
    [["docs/groups/use-cases.md", 9, "error", "AN ITEM HAS ONE PLACE IN ITS HIERARCHY", "UC-001 is listed a second time (first on line 6)"]]);
  assert.deepEqual(brief(formatChecks("group-file", text, { items: ["UC-001", "UC-002"] })).map((f) => f[0]), ["UC-001"],
    "without a path the item stays the artifact");
});

// ---------------------------------------------------------------- one shape, in the compiler form

test("A FINDING READS LIKE A COMPILER MESSAGE — every finding has one shape and renders in the template's form", () => {
  assert.ok(SEEN.length >= 40, `the tests above provoked ${SEEN.length} findings`);
  const TEMPLATE = /^[^:\n]+:\d+: (error|warning): .+ \[[A-Z][A-Z0-9 ,'-]*\] — .{10,}$/;
  for (const f of SEEN) {
    assert.deepEqual(Object.keys(f), SHAPE, JSON.stringify(f));
    assert.ok(typeof f.artifact === "string" && f.artifact.trim() && !f.artifact.includes(":"), JSON.stringify(f));
    assert.ok(Number.isInteger(f.line) && f.line >= 1, JSON.stringify(f));
    assert.ok(isRequirementName(f.rule), `the rule by its name: ${f.rule}`);
    assert.doesNotMatch(f.fix, /^correct the file as/, `every problem has its own correction: ${f.what}`);
    assert.match(`${f.artifact}:${f.line}: ${f.kind}: ${f.what} [${f.rule}] — ${f.fix}`, TEMPLATE);
  }
});

test("one shape in every check of MOD-artifacts — fix, never correction", () => {
  const broken = plant(SPEC, "*Check:* `tests/test_export.py`\n", "");
  const all = [
    ...[...parseRequirements(broken).values()].flatMap((r) => requirementProblems(r, LINKED)),
    ...levelProblems(TEST, plant(V2(TEST), "// Level: component\n", "")),
    ...originProblems({ [TEST]: plant(V2(TEST), "// Module: MOD-view\n", "") }),
    ...identifiers({ [TEST]: plant(V2(TEST), "TST-004", "TST-4") }).problems,
    ...stabilityProblems({ [ARC]: V2(ARC) }, {}),
    ...useCaseProblems(UC, plant(UC_TEXT, "## Postcondition\n", ""), UC_KNOWN),
    ...hierarchy(parseGroupFile(read("groups/broken/twice.md")), ["UC-001", "UC-002"]).problems,
  ];
  assert.equal(all.length, 7, "each single check yields its one finding");
  for (const f of all) assert.deepEqual(Object.keys(f).sort(), [...SHAPE].sort(), JSON.stringify(f));
});

// ---------------------------------------------------------------- this repository

test("every use case, decision, module and group file of this repository passes formatChecks", () => {
  const files = (dir) => readdirSync(new URL(dir, ROOT)).map((n) => `${dir}${n}`);
  for (const path of files("docs/use-cases/").filter((p) => /\/UC-[^/]+\.md$/.test(p))) {
    assert.deepEqual(brief(formatChecks("use-case", read(path, ROOT), { path })), [], path);
  }
  for (const path of files("docs/architecture/")) {
    const kind = /\/ARC-/.test(path) ? "architecture-decision" : /\/MOD-/.test(path) ? "module" : null;
    if (kind) assert.deepEqual(brief(formatChecks(kind, read(path, ROOT), { path })), [], path);
  }
  for (const path of files("docs/groups/")) {
    assert.deepEqual(brief(formatChecks("group-file", read(path, ROOT), { path })), [], path);
  }
});
