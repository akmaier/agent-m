// Release tests of sprint 02, strand D — the link graph of one commit (ITM-018), over a fixture product and over this repository
// (ITM-145). Written by tester-opus (claude-opus-5-5), the Release tester of docs/process.md, who implemented none of the strand's
// items, from the SPEC rules and use-case flows they realise; started on sprint/02 at a22de0a, 2026-10-02.
//
// Module: MOD-traceability
// Guards: THE TRACEABILITY MATRIX IS DERIVED; A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION; UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN; MODULE GAPS ARE REPORTED, NOT FORBIDDEN; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-020; UC-025
// Level: release
//
// The fixture is a made-up product, "Thesis tool", written in this file as a map of path to text — its SPEC in the SPEC's own
// form of a requirement, one open change queue, use cases, a decision, modules, code files and tests with their header lines.
// Every expectation is stated before its case runs, from the rule or the use-case step it names: UC-020 step 5 (what traces to a
// requirement) and step 7 with 5b (the gaps, unknown names with their withdrawal note), UC-025 steps 3 and 4 with 3a and 4b (the
// module rows and their gaps), UC-006 3b (the impact list of a requirement change) and UC-023 (the impact list of an architecture
// change). The last case builds the graph over the tracked files of this repository, read with node's fs; it states no expected
// value taken from any of them — only what the rules say of every graph: derived, by identifier, gaps reported, nothing blocked.

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  linkGraph, tracesTo, coverageGaps, moduleRows, requirementImpact, architectureImpact,
} from "../docs/assets/traceability.mjs";
import { parseArchitecture } from "../docs/assets/artifacts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ------------------------------------------------------------------------------------------------ the fixture product

const req = (name, source, rule) => `**${name}** *(${source})*\n${rule}\n*Occasion:* reviewers print it.\n*Check:* \`tests/x.test.mjs\`\n`;
const withdrawnReq = (name, by) => `**${name}** *(PO B. Example, 2026-09-23 — withdrawn 2026-09-24)*\n*Withdrawn:* replaced by \`${by}\`. The name is not reused.\n`;
const PDF = "EXPORT IS A PDF", TITLE = "THE TITLE PAGE NAMES THE AUTHOR", SERIF = "THE BODY TEXT IS SERIF", OLD = "OLD EXPORT";
const SPEC = `# Thesis tool — Specification

**VERBINDLICH (SPEC)**

## 1. Export

${req(PDF, "PO B. Example, 2026-09-24", "The export is one PDF file.")}
## 2. Title page

${req(TITLE, "PO B. Example, 2026-09-24", "The title page names the author.")}
## 3. Old rules

${withdrawnReq(OLD, PDF)}
## 4. Fonts

${req(SERIF, "PO B. Example, 2026-09-24", "The body text is set in a serif font.")}`;

const uc = (id, title, realises) => `---\nid: ${id}\ntitle: ${title}\nrealises:\n${realises.map((n) => `  - ${n}\n`).join("")}---\n# ${id} ${title}\n\nThe author does it.\n`;
const arc = (id, forcedBy) => `---\nid: ${id}\ntitle: Export through the browser's print\nforced_by:\n${forcedBy.map((n) => `  - ${n}\n`).join("")}---\n` +
  `# ${id}\n\n## Context\n\nc\n\n## Decision\n\nd\n\n## Alternatives\n\na\n\n## Consequences\n\nq\n`;
// A module: what it realises, follows and uses, and its interfaces, each described in ## Interfaces.
const mod = (id, { realises = [], follows = [], uses = [], provides = {} } = {}) => {
  const list = (k, xs) => (xs.length ? `${k}:\n${xs.map((x) => `  - ${x}\n`).join("")}` : `${k}: []\n`);
  return `---\nid: ${id}\ntitle: ${id.slice(4)}\n${list("realises", realises)}${list("follows", follows)}${list("uses", uses)}` +
    `${list("provides", Object.keys(provides))}---\n# ${id}\n\n## Responsibility\n\nr\n\n## Interfaces\n\n` +
    Object.entries(provides).map(([i, sig]) => `- \`${i}${sig}\` — x\n`).join("") + "\n";
};
const code = (modules, body = "export const x = 1;\n") => `// A file of the fixture.\n${modules.map((m) => `// Module: ${m}\n`).join("")}\n${body}`;
const testFile = (modules, guards) => `// A test of the fixture.\n${modules.map((m) => `// Module: ${m}\n`).join("")}` +
  `// Guards: ${guards.join("; ")}\n// Level: unit\n\nimport test from "node:test";\n`;

const QN = "2026-10-01_title-page", Q = `docs/spec-freigaben/${QN}`;
const P_CHANGE = `${Q}/01-title.md`, P_ADD = `${Q}/02-margins.md`;
const PATHS = {
  uc1: "docs/use-cases/UC-001-export-the-thesis.md", uc2: "docs/use-cases/UC-002-print-the-title-page.md",
  uc3: "docs/use-cases/UC-003-print-in-colour.md", uc4: "docs/use-cases/UC-004-date-the-title-page.md",
  arc1: "docs/architecture/ARC-001-export-through-print.md",
  exporter: "docs/architecture/MOD-exporter.md", cover: "docs/architecture/MOD-cover.md",
  idle: "docs/architecture/MOD-idle.md", legacy: "docs/architecture/MOD-legacy.md",
};
function fixture(over = {}) {
  return {
    "SPEC.md": SPEC,
    [`${Q}/index.md`]: `# Queue ${QN}\n`,
    [P_CHANGE]: "## 2. Title page\n\n" + req(TITLE, "PO B. Example, 2026-10-01", "The title page names the author and the supervisor."),
    [P_ADD]: "## 4. Fonts\n\n" + req(SERIF, "PO B. Example, 2026-09-24", "The body text is set in a serif font.") + "\n" +
      req("THE MARGINS ARE WIDE", "PO B. Example, 2026-10-01", "Every margin is at least 3 cm."),
    [PATHS.uc1]: uc("UC-001", "Export the thesis", [PDF, TITLE]),
    [PATHS.uc2]: uc("UC-002", "Print the title page", [TITLE, OLD]),
    [PATHS.uc3]: uc("UC-003", "Print in colour", ["PRINT IN COLOUR"]),
    // A name that begins like TITLE is another name.
    [PATHS.uc4]: uc("UC-004", "Date the title page", [`${TITLE} AND THE DATE`, PDF]),
    [PATHS.arc1]: arc("ARC-001", [PDF, "UC-001"]),
    [PATHS.exporter]: mod("MOD-exporter", { realises: [PDF], follows: ["ARC-001"], provides: { exportPdf: "(thesis) -> pdf", pageCount: "(pdf) -> n" } }),
    [PATHS.cover]: mod("MOD-cover", { realises: [TITLE], follows: ["ARC-001"], uses: ["MOD-exporter.exportPdf"], provides: { cover: "(thesis) -> page" } }),
    [PATHS.idle]: mod("MOD-idle", { provides: { idle: "() -> null" } }),
    [PATHS.legacy]: mod("MOD-legacy", { realises: [OLD], uses: ["MOD-exporter.pageCount"], provides: { legacy: "() -> null" } }),
    "src/exporter.mjs": code(["MOD-exporter"]),
    "src/cover.mjs": code(["MOD-cover"]),
    "src/legacy.mjs": code(["MOD-legacy"]),
    "src/loose.mjs": code([]),
    "src/both.mjs": code(["MOD-exporter", "MOD-cover"]),
    "tests/export.test.mjs": testFile(["MOD-exporter"], [PDF]),
    "tests/cover.test.mjs": testFile(["MOD-cover"], [TITLE, PDF]),
    "tests/legacy.test.mjs": testFile(["MOD-legacy"], [OLD]),
    "tests/gone.test.mjs": testFile(["MOD-gone"], [TITLE]),
    "README.md": "# Thesis tool\n",
    ...over,
  };
}
const STATUS = { "UC-001": "accepted", "UC-002": "open", "ARC-001": "accepted", "MOD-exporter": "accepted", "MOD-cover": "open" };
const graphOf = (files, status = STATUS) => linkGraph({ files, status });
const ids = (xs) => xs.map((x) => (typeof x === "string" ? x : x.id)).sort();

// ------------------------------------------------------------------------------------------------ ITM-018

// THE TRACEABILITY MATRIX IS DERIVED · UC-020 step 5: what traces to a requirement is computed from the artifacts of the commit —
// its source, the use cases that realise it, the decisions it forces, the modules realising it, the tests guarding it, and the
// open queue entries that would change it. Expected for TITLE: source "PO B. Example, 2026-09-24"; use cases UC-001 and UC-002
// (not UC-004, which names a longer name); no decision; module MOD-cover; tests tests/cover.test.mjs and tests/gone.test.mjs; one
// proposal, entry 01, a change. A file that keeps a matrix by hand — claiming UC-003 realises SERIF — changes nothing; changing
// UC-003's own realises does change what traces to SERIF.
test("ITM-018 · what traces to a requirement is derived from the artifacts, never from a matrix kept by hand", () => {
  const t = tracesTo(graphOf(fixture()), TITLE);
  assert.deepEqual(t.sources.map((s) => String(s).includes("PO B. Example, 2026-09-24")), [true], "its source as written");
  assert.deepEqual(ids(t.useCases), ["UC-001", "UC-002"]);
  assert.deepEqual(ids(t.decisions), []);
  assert.deepEqual(ids(t.modules), ["MOD-cover"]);
  assert.deepEqual(ids(t.tests), ["tests/cover.test.mjs", "tests/gone.test.mjs"]);
  assert.deepEqual(t.proposals.map((p) => [p.entry, p.change]), [[P_CHANGE, "change"]]);
  assert.deepEqual(ids(tracesTo(graphOf(fixture()), PDF).decisions), ["ARC-001"]);
  // UC-020 step 3: entry 02 adds THE MARGINS ARE WIDE and repeats SERIF word for word — it proposes the one, not the other.
  assert.deepEqual(tracesTo(graphOf(fixture()), "THE MARGINS ARE WIDE").proposals.map((p) => [p.entry, p.change]), [[P_ADD, "add"]]);
  assert.deepEqual(tracesTo(graphOf(fixture()), SERIF).proposals, []);
  // UC-020 step 3: only an open entry proposes; one the approval engine found applied proposes nothing any more.
  assert.deepEqual(tracesTo(graphOf(fixture(), { ...STATUS, [P_CHANGE]: "applied" }), TITLE).proposals, []);

  const matrix = "# Traceability matrix\n\n| Requirement | Use cases |\n|---|---|\n" +
    `| ${SERIF} | UC-003 |\n| ${TITLE} | UC-001, UC-002, UC-003 |\n`;
  for (const p of ["docs/traceability.md", "docs/traceability-matrix.md", "docs/matrix.md"]) {
    assert.deepEqual(tracesTo(graphOf(fixture({ [p]: matrix })), SERIF).useCases, [], `${p} is not read`);
    assert.deepEqual(graphOf(fixture({ [p]: matrix })), graphOf(fixture()), `${p} changes nothing`);
  }
  const edited = fixture({ [PATHS.uc3]: uc("UC-003", "Print in colour", [SERIF]) });
  assert.deepEqual(ids(tracesTo(graphOf(edited), SERIF).useCases), ["UC-003"], "an edit of the artifact is seen at once");
  assert.deepEqual(graphOf(fixture()), graphOf(fixture()), "the same commit gives the same graph");
});

// A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION: a requirement is found by its name wherever it stands, an artifact by its
// identifier whatever its file is called. Expected: renumbering the SPEC's sections, moving TITLE into another section and
// renaming UC-002's file change no edge and nothing that traces to TITLE; a use case that names a requirement by its section
// ("§2", "SPEC.md §2", "SPEC.md:12") is linked to nothing — it is an unknown name, not TITLE, which stands in section 2.
test("ITM-018 · references are followed by identifier; a position is no reference", () => {
  const moved = SPEC.replace("## 1. Export", "## 7. Export").replace("## 4. Fonts", "## 1. Fonts")
    .replace(`## 2. Title page\n\n${req(TITLE, "PO B. Example, 2026-09-24", "The title page names the author.")}`, "## 2. Title page\n\nNothing here now.\n")
    .concat(`\n## 9. Front matter\n\n${req(TITLE, "PO B. Example, 2026-09-24", "The title page names the author.")}`);
  const before = graphOf(fixture());
  const renamed = fixture({ "SPEC.md": moved });
  delete renamed[PATHS.uc2];
  renamed["docs/use-cases/UC-002-the-title-page-printed.md"] = uc("UC-002", "Print the title page", [TITLE, OLD]);
  const after = graphOf(renamed);
  const edges = (g) => g.edges.map((e) => `${e.from} -${e.kind}-> ${e.to}`).sort();
  assert.deepEqual(edges(after), edges(before), "the same edges after the move");
  assert.deepEqual(tracesTo(after, TITLE), tracesTo(before, TITLE), "the same traces after the move");

  const byPosition = graphOf(fixture({ [PATHS.uc3]: uc("UC-003", "Print in colour", ["§2", "SPEC.md §2", "SPEC.md:12"]) }));
  assert.deepEqual(ids(tracesTo(byPosition, TITLE).useCases), ["UC-001", "UC-002"], "UC-003 is not linked to what stands at §2");
  const unknown = coverageGaps(byPosition).unknownNames.filter((u) => u.from.includes("UC-003")).map((u) => u.name).sort();
  assert.deepEqual(unknown, ["SPEC.md §2", "SPEC.md:12", "§2"].sort(), "kept as unknown names");
});

// UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN · UC-020 step 7, 5b, 7a: the gaps are lists. Expected: unrealised — SERIF
// (no use case realises it); realising nothing — UC-003 (it names only a name that matches nothing); unknown names — OLD EXPORT
// named by UC-002, MOD-legacy and tests/legacy.test.mjs, with the note that it was withdrawn, and PRINT IN COLOUR, named by
// UC-003, without that note; untested — SERIF. Asking for the gaps blocks nothing: tracesTo and the impact list still answer on
// the same graph. A product without gaps gets empty lists, not none (7a).
test("ITM-018 · coverage gaps are listed with the withdrawal note, and they block nothing", () => {
  const g = graphOf(fixture());
  const gaps = coverageGaps(g);
  assert.deepEqual(gaps.unrealised, [SERIF]);
  assert.deepEqual(gaps.realisingNothing, ["UC-003"]);
  const unknown = Object.fromEntries(gaps.unknownNames.map((u) => [u.name, u]));
  assert.equal(unknown[OLD]?.withdrawn, true, "OLD EXPORT is kept, with the note that it was withdrawn");
  assert.deepEqual([...unknown[OLD].from].sort(), ["MOD-legacy", "UC-002", "tests/legacy.test.mjs"]);
  assert.equal(unknown["PRINT IN COLOUR"]?.withdrawn, false, "a name that never existed is not called withdrawn");
  assert.deepEqual(unknown["PRINT IN COLOUR"].from, ["UC-003"]);
  assert.ok(!(PDF in unknown) && !(TITLE in unknown) && !(SERIF in unknown), "a live name is no unknown name");
  assert.deepEqual(gaps.untested, [SERIF]);
  assert.ok(requirementImpact(g, TITLE).length > 0 && tracesTo(g, TITLE).useCases.length > 0, "the graph with gaps still answers");

  const complete = fixture({ [PATHS.uc3]: uc("UC-003", "Print in colour", [SERIF]), [PATHS.uc2]: uc("UC-002", "Print the title page", [TITLE]),
    [PATHS.legacy]: mod("MOD-legacy", { realises: [SERIF], provides: { legacy: "() -> null" } }),
    "tests/legacy.test.mjs": testFile(["MOD-legacy"], [SERIF]), "tests/gone.test.mjs": testFile(["MOD-cover"], [TITLE]),
    [PATHS.uc4]: uc("UC-004", "Date the title page", [PDF]) });
  assert.deepEqual(coverageGaps(graphOf(complete)), { unrealised: [], realisingNothing: [], unknownNames: [], untested: [] });
});

// MODULE GAPS ARE REPORTED, NOT FORBIDDEN · UC-025 steps 3 and 4, 3a, 4b: one row per module — what it realises and follows with
// their status, its code files and its tests with what they guard — and every gap with the artifact it concerns. Expected rows:
// MOD-exporter realises EXPORT IS A PDF (accepted), follows ARC-001 (accepted), code src/both.mjs and src/exporter.mjs, test
// tests/export.test.mjs guarding EXPORT IS A PDF; MOD-legacy realises OLD EXPORT, withdrawn. Expected gaps: MOD-idle and
// MOD-legacy realise nothing (MOD-legacy's one name was withdrawn); SERIF is realised by no module; MOD-idle has no code and no
// test; src/loose.mjs names no module; src/both.mjs names two (3a); tests/gone.test.mjs names a module that does not exist;
// tests/cover.test.mjs guards EXPORT IS A PDF, which its module MOD-cover does not realise; OLD EXPORT, named by MOD-legacy and by
// tests/legacy.test.mjs, matches nothing and carries the note that it was withdrawn, not renamed (4b).
test("ITM-018 · module rows and every gap of UC-025, none of them an error", () => {
  const { rows, gaps } = moduleRows(graphOf(fixture()));
  const row = Object.fromEntries(rows.map((r) => [r.id, r]));
  assert.deepEqual(Object.keys(row).sort(), ["MOD-cover", "MOD-exporter", "MOD-idle", "MOD-legacy"]);
  assert.deepEqual(row["MOD-exporter"].realises, [{ name: PDF, status: "accepted" }]);
  assert.deepEqual(row["MOD-exporter"].follows, [{ name: "ARC-001", status: "accepted" }]);
  assert.deepEqual([...row["MOD-exporter"].code].sort(), ["src/both.mjs", "src/exporter.mjs"]);
  assert.deepEqual(row["MOD-exporter"].tests.map((t) => [t.path, [...t.guards]]), [["tests/export.test.mjs", [PDF]]]);
  assert.deepEqual(row["MOD-legacy"].realises, [{ name: OLD, status: "withdrawn" }]);

  const has = (kind, artifact, names) => gaps.some((x) => x.kind === kind && x.artifact === artifact
    && (names === undefined || JSON.stringify([...x.names].sort()) === JSON.stringify([...names].sort())));
  const expected = [
    ["realises-nothing", "MOD-idle"], ["realises-nothing", "MOD-legacy"],
    ["requirement-without-module", SERIF],
    ["module-without-code", "MOD-idle"], ["module-without-test", "MOD-idle"],
    ["code-without-module", "src/loose.mjs"],
    ["code-names-two-modules", "src/both.mjs", ["MOD-cover", "MOD-exporter"]],
    ["code-names-unknown-module", "tests/gone.test.mjs", ["MOD-gone"]],
    ["test-guards-what-its-module-does-not-realise", "tests/cover.test.mjs", [PDF]],
    ["unknown-name", "MOD-legacy", [OLD]], ["unknown-name", "tests/legacy.test.mjs", [OLD]],
  ];
  for (const [kind, artifact, names] of expected) assert.ok(has(kind, artifact, names), `gap ${kind} at ${artifact}`);
  for (const g of gaps.filter((x) => x.kind === "unknown-name" && x.names.includes(OLD))) assert.equal(g.withdrawn, true, `${g.artifact}: withdrawn`);
  // No gap where there is none: the complete modules have no gap of their own.
  assert.ok(!gaps.some((x) => x.artifact === "MOD-exporter"), "MOD-exporter has no gap");
  assert.ok(!gaps.some((x) => x.artifact === "src/exporter.mjs" || x.artifact === "tests/export.test.mjs"), "nor its code and test");
  assert.ok(!has("requirement-without-module", PDF) && !has("requirement-without-module", TITLE));

  // 4b one level up: a decision or a module withdrawn by its own file is kept as an unknown name with the same note — a module
  // that follows the withdrawn ARC-002, a test that names the withdrawn MOD-old.
  const withdrawnArc = "---\nid: ARC-002\ntitle: Print through a library\nwithdrawn: 2026-09-30\nreplaced_by: ARC-001\nforced_by:\n" +
    `  - ${PDF}\n---\n# ARC-002\n\n## Context\n\nc\n\n## Decision\n\nd\n\n## Alternatives\n\na\n\n## Consequences\n\nq\n\n## Withdrawn\n\nThe browser prints.\n`;
  const withdrawnMod = mod("MOD-old", { realises: [PDF], provides: { old: "() -> null" } })
    .replace("---\n# MOD-old", "withdrawn: 2026-09-30\n---\n# MOD-old") + "## Withdrawn\n\nMerged into MOD-exporter.\n";
  const later = moduleRows(graphOf(fixture({
    "docs/architecture/ARC-002-print-through-a-library.md": withdrawnArc, "docs/architecture/MOD-old.md": withdrawnMod,
    [PATHS.cover]: mod("MOD-cover", { realises: [TITLE], follows: ["ARC-001", "ARC-002"], uses: ["MOD-exporter.exportPdf"], provides: { cover: "(thesis) -> page" } }),
    "tests/old.test.mjs": testFile(["MOD-old"], [PDF]),
  }))).gaps;
  const arcGap = later.find((x) => x.kind === "unknown-name" && x.artifact === "MOD-cover" && x.names.includes("ARC-002"));
  assert.equal(arcGap?.withdrawn, true, "MOD-cover follows ARC-002, which was withdrawn");
  const modGap = later.find((x) => x.kind === "code-names-unknown-module" && x.artifact === "tests/old.test.mjs");
  assert.equal(modGap?.withdrawn, true, "tests/old.test.mjs names MOD-old, which was withdrawn");
});

// A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST · UC-006 3b: every artifact that references the requirement's name.
// Expected for TITLE: use cases UC-001 and UC-002, module MOD-cover, tests tests/cover.test.mjs and tests/gone.test.mjs — not
// UC-004, whose name only begins the same way; for EXPORT IS A PDF also decision ARC-001; for the withdrawn OLD EXPORT what still
// names it — UC-002, MOD-legacy, tests/legacy.test.mjs; for a name nothing states, nothing.
test("ITM-018 · the impact list of a requirement names every artifact that references it", () => {
  const g = graphOf(fixture());
  const list = (name) => requirementImpact(g, name).map((a) => `${a.kind} ${a.id}`).sort();
  assert.deepEqual(list(TITLE), ["module MOD-cover", "test tests/cover.test.mjs", "test tests/gone.test.mjs",
    "use-case UC-001", "use-case UC-002"]);
  assert.deepEqual(list(PDF), ["architecture-decision ARC-001", "module MOD-exporter", "test tests/cover.test.mjs",
    "test tests/export.test.mjs", "use-case UC-001", "use-case UC-004"]);
  assert.deepEqual(list(OLD), ["module MOD-legacy", "test tests/legacy.test.mjs", "use-case UC-002"]);
  assert.deepEqual(list("THE MARGINS ARE WIDE"), []);
  for (const a of requirementImpact(g, TITLE)) assert.equal(typeof a.path, "string", `${a.id} is named with its file`);
});

// A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST — "a change proposal touching an existing identifier carries the derived
// reference list" — and UC-020 step 3 (*change proposed* or *withdrawal proposed* — an open queue entry would change it). An
// entry replaces its whole section (UC-006 step 6): an entry for "## 2. Title page" whose text no longer states TITLE — renamed in
// place, or left out — takes TITLE out of the SPEC when it is accepted. Expected: the graph counts that entry as touching TITLE
// (a change or a withdrawal), so that what traces to TITLE names the entry and its impact list can be shown beside it.
// FINDING D1 (back to Development: ITM-018) — the graph reads only the names an entry states; see the measurement record.
test("ITM-018 · an entry whose section no longer states a requirement touches that requirement", { todo: "finding D1 — ITM-018" }, () => {
  const renamed = "## 2. Title page\n\n" + req(`${TITLE} AND THE SUPERVISOR`, "PO B. Example, 2026-10-01", "The title page names both.");
  const dropped = "## 2. Title page\n\nThe title page is laid out by the faculty's template.\n";
  for (const [what, text] of [["renamed in place", renamed], ["left out", dropped]]) {
    const t = tracesTo(graphOf(fixture({ [P_CHANGE]: text })), TITLE);
    assert.deepEqual(t.proposals.map((p) => p.entry), [P_CHANGE], `${what}: entry 01 touches ${TITLE}`);
    assert.ok(["change", "withdraw"].includes(t.proposals[0].change), `${what}: as a change or a withdrawal`);
  }
});

// AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST (UC-023): beside a change of a decision or a module, the modules,
// code files, tests and requirements that reference it. Expected for a change of ARC-001 that drops UC-001 and adds SERIF from
// what forces it: MOD-exporter and MOD-cover, which follow it, each with its code and tests (src/both.mjs under both); not
// MOD-idle or MOD-legacy; names kept EXPORT IS A PDF, added SERIF, removed UC-001. Expected for a change of MOD-exporter that
// removes pageCount and alters exportPdf: MOD-legacy, which uses the removed interface, first and marked as broken; MOD-cover,
// which uses the altered one, not marked; MOD-exporter itself with its code and test; MOD-idle not at all.
test("ITM-018 · the impact list of an architecture change names what follows or uses it, with its code and tests", () => {
  const g = graphOf(fixture());
  const arcBefore = parseArchitecture(PATHS.arc1, arc("ARC-001", [PDF, "UC-001"]));
  const arcAfter = parseArchitecture(PATHS.arc1, arc("ARC-001", [PDF, SERIF]));
  const d = architectureImpact({ before: arcBefore, after: arcAfter, graph: g });
  const of = (r, id) => r.affected.find((a) => a.id === id);
  assert.deepEqual(d.affected.map((a) => a.id).sort(), ["MOD-cover", "MOD-exporter"]);
  assert.deepEqual([...of(d, "MOD-exporter").code].sort(), ["src/both.mjs", "src/exporter.mjs"]);
  assert.deepEqual([...of(d, "MOD-exporter").tests], ["tests/export.test.mjs"]);
  assert.deepEqual([...of(d, "MOD-cover").code].sort(), ["src/both.mjs", "src/cover.mjs"]);
  assert.deepEqual([...of(d, "MOD-cover").tests], ["tests/cover.test.mjs"]);
  assert.deepEqual(d.names, { kept: [PDF], added: [SERIF], removed: ["UC-001"] });

  const modBefore = parseArchitecture(PATHS.exporter, fixture()[PATHS.exporter]);
  const modAfter = parseArchitecture(PATHS.exporter, mod("MOD-exporter", { realises: [PDF], follows: ["ARC-001"],
    provides: { exportPdf: "(thesis, options) -> pdf" } }));
  const m = architectureImpact({ before: modBefore, after: modAfter, graph: g });
  assert.deepEqual(m.removedInterfaces, ["pageCount"]);
  assert.deepEqual(m.alteredInterfaces, ["exportPdf"]);
  assert.equal(m.affected[0].id, "MOD-legacy", "the user of the removed interface first");
  assert.equal(of(m, "MOD-legacy").breaks, true);
  assert.equal(of(m, "MOD-cover").breaks, false);
  assert.deepEqual([...of(m, "MOD-legacy").code], ["src/legacy.mjs"]);
  assert.deepEqual([...of(m, "MOD-legacy").tests], ["tests/legacy.test.mjs"]);
  assert.deepEqual([...of(m, "MOD-exporter").tests], ["tests/export.test.mjs"], "the changed module itself, with its test");
  assert.equal(of(m, "MOD-idle"), undefined);
  const unchanged = architectureImpact({ before: modBefore, after: modBefore, graph: g });
  assert.deepEqual(unchanged.affected.map((a) => a.id), ["MOD-exporter"], "an unchanged interface affects no user");
});

// The graph of one commit over this repository (ARC-006): its tracked files at the commit checked out, read with node's fs —
// all but Agent M's own SPEC.md, which no test opens (ITM-128); its requirements enter as the queue entries state them. What
// every graph owes, whatever the repository holds — expected: built twice, the same graph (derived, nothing kept between); use
// cases, decisions, modules, code and tests present as nodes; every edge names its target by identifier — a requirement's name, an identifier of the
// scheme, or a path —, never by a section or a line; every unknown name kept, with a withdrawal note that is true exactly for the
// names the commit keeps as withdrawn; and the gaps and module rows answered as lists, blocking nothing.
test("ITM-018 · the graph of this repository's commit: derived, by identifier, gaps listed, nothing blocked", () => {
  const tracked = execFileSync("git", ["-C", ROOT, "ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
  const files = Object.fromEntries(tracked.filter((p) => /\.(md|mjs|js|py)$/.test(p) && p !== "SPEC.md" && !p.startsWith("docs/assets/vendor/"))
    .map((p) => { try { return [p, readFileSync(join(ROOT, p), "utf8")]; } catch { return null; } }).filter(Boolean));
  const g = linkGraph({ files }), again = linkGraph({ files });
  assert.deepEqual(again, g, "the same files, the same graph");
  const kinds = new Set(Object.values(g.nodes).map((n) => n.kind));
  for (const k of ["use-case", "architecture-decision", "module", "code", "test"]) assert.ok(kinds.has(k), `nodes of kind ${k}`);

  const POSITION = /§|\b(?:section|line|chapter)\s*\d|^\d+(?:\.\d+)*\.?$|:\d+$/i;
  const IDENTIFIER = /^(?:(?:SRC|UC|ARC|MOD|TST|ITM|RES|JOB)-[\w-]+|[A-Z0-9][A-Z0-9 ,'’()./&+-]*[A-Z0-9)]|[\w./-]+\.\w+)$/;
  const byPosition = g.edges.filter((e) => POSITION.test(e.to)).map((e) => `${e.from} -> ${e.to}`);
  assert.deepEqual(byPosition, [], "no edge points at a position");
  const notIdentifier = g.edges.filter((e) => !IDENTIFIER.test(e.to)).map((e) => `${e.from} -${e.kind}-> ${e.to}`);
  assert.deepEqual(notIdentifier, [], "every edge names an identifier");

  for (const u of g.unknown) {
    assert.equal(typeof u.withdrawn, "boolean", `${u.name}: a withdrawal note`);
    assert.equal(u.withdrawn, g.withdrawn.includes(u.name), `${u.name}: withdrawn exactly when the commit keeps it as withdrawn`);
    assert.ok(u.from.length > 0, `${u.name}: what names it`);
  }
  const gaps = coverageGaps(g), mods = moduleRows(g);
  for (const k of ["unrealised", "realisingNothing", "unknownNames", "untested"]) assert.ok(Array.isArray(gaps[k]), `${k} is a list`);
  assert.equal(gaps.unknownNames.length, g.unknown.length, "every unknown name is reported");
  assert.ok(Array.isArray(mods.rows) && Array.isArray(mods.gaps));
  assert.equal(mods.rows.length, Object.values(g.nodes).filter((n) => n.kind === "module").length, "one row per module");
});
