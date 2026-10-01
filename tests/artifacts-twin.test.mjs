// Use cases as the dashboard reads and checks them (docs/assets/artifacts/use-cases.mjs), and the Python twin
// (tests/artifact_checks.py) on the same files, so that the two readers cannot drift. Deterministic, no network.
// Run: node --test tests/*.test.mjs — the twin is run with python3, as the CI runner has it.
//
// Module: MOD-artifacts
// Guards: A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION; A USE CASE REALISES NAMED REQUIREMENTS; DIAGRAMS ARE MERMAID IN MARKDOWN; ONE USE CASE, ONE FILE
// Level: unit
//
// The fixtures are tests/fixtures/use-cases/: one complete use case and one copy per broken rule. The findings each one
// must yield, as [rule, what], are in expected.json; the requirement names the fixtures may realise are in
// known-requirements.txt. The SPEC itself is never read (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE): this repository's own use
// cases are checked for their form only. Counter-proofs: docs/measurements/2026-10-01_use-case-checks.md.

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseUseCase, useCaseProblems } from "../docs/assets/artifacts/use-cases.mjs";
import { specRequirements } from "../docs/assets/artifacts.mjs";

const FIX = new URL("./fixtures/use-cases/", import.meta.url);
const REAL = new URL("../docs/use-cases/", import.meta.url);
const read = (dir, name) => readFileSync(new URL(name, dir), "utf8");
const FIXTURES = readdirSync(FIX).filter((n) => n.endsWith(".md")).sort();
const EXPECTED = JSON.parse(read(FIX, "expected.json"));
const KNOWN = read(FIX, "known-requirements.txt").split("\n").filter(Boolean);
const REAL_FILES = readdirSync(REAL).filter((n) => /^UC-.*\.md$/.test(n)).sort();
const at = (name) => `docs/use-cases/${name}`;
const pairs = (list) => list.map((p) => JSON.stringify(p)).sort();
const ruleWhat = (findings) => pairs(findings.map((f) => [f.rule, f.what]));

const FIELDS = "A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION";
const REALISES = "A USE CASE REALISES NAMED REQUIREMENTS";
const MERMAID = "DIAGRAMS ARE MERMAID IN MARKDOWN";
const ONE_FILE = "ONE USE CASE, ONE FILE";

// The Python twin: use_case_findings of tests/artifact_checks.py for each [name, text], as [[rule, what], …] per file.
function python(files, known) {
  const script = [
    "import json, sys",
    "from artifact_checks import use_case_findings",
    "req = json.load(sys.stdin)",
    "print(json.dumps([[[f['rule'], f['what']] for f in use_case_findings(n, t, req['known'])] for n, t in req['files']]))",
  ].join("\n");
  const out = execFileSync("python3", ["-c", script], {
    cwd: fileURLToPath(new URL(".", import.meta.url)), input: JSON.stringify({ files, known }),
  });
  return JSON.parse(out.toString()).map(pairs);
}

// ---------------------------------------------------------------- the dashboard's reader

test("every fixture yields exactly the findings expected.json names — one broken copy per rule, the complete one none", () => {
  assert.deepEqual(FIXTURES, Object.keys(EXPECTED).sort(), "every fixture has its expectation, and every expectation its fixture");
  for (const name of FIXTURES) {
    assert.deepEqual(ruleWhat(useCaseProblems(at(name), read(FIX, name), KNOWN)), pairs(EXPECTED[name]), name);
  }
});

test("A FINDING READS LIKE A COMPILER MESSAGE — artifact, line, kind, the rule by name, what is wrong and the correction", () => {
  for (const name of FIXTURES) {
    for (const f of useCaseProblems(at(name), read(FIX, name), KNOWN)) {
      assert.equal(typeof f.artifact, "string", name);
      assert.ok(f.artifact, name);
      assert.ok(Number.isInteger(f.line) && f.line >= 1, `${name}: line ${f.line}`);
      assert.equal(f.kind, "error", name);
      assert.ok([FIELDS, REALISES, MERMAID, ONE_FILE].includes(f.rule), `${name}: ${f.rule}`);
      assert.equal(typeof f.fix, "string", name);
      assert.ok(f.fix.length > 10, `${name}: a correction is named`);
    }
  }
  const one = (name) => useCaseProblems(at(name), read(FIX, name), KNOWN);
  // The artifact is the use case's identifier from its file name; a file name without one is named as it is.
  assert.deepEqual(one("UC-009-unknown-name.md").map((f) => [f.artifact, f.line]), [["UC-009", 11]], "the line of the unknown name");
  assert.deepEqual(one("UC-010-not-a-name.md").map((f) => f.line).sort(), [10, 11], "the line of each name in the wrong form");
  assert.deepEqual(one("UC-016-id-mismatch.md").map((f) => [f.artifact, f.line]), [["UC-016", 2]], "the line of the id");
  assert.deepEqual(one("UC-013-image-diagram.md").map((f) => f.line).sort((a, b) => a - b), [1, 31], "the file, and the image's line");
  assert.deepEqual(one("UC-015-image-as-html.md").map((f) => f.line), [39]);
  assert.deepEqual(one("UC-1-short-number.md").map((f) => [f.artifact, f.line]), [["UC-1-short-number.md", 1]]);
});

test("the known names may be a list, a Set or the Map specRequirements reads; without them only the form of a name is checked", () => {
  const unknown = read(FIX, "UC-009-unknown-name.md"), lowercase = read(FIX, "UC-010-not-a-name.md");
  const spec = KNOWN.map((n) => `**${n}** *(PO A. Maier, 2026-10-01)*\nA rule.\n`).join("\n");
  const expected = [[REALISES, 'realises "EXPORT AS PDF" matches no requirement']].map((p) => JSON.stringify(p));
  for (const known of [KNOWN, new Set(KNOWN), specRequirements(spec)]) {
    assert.deepEqual(ruleWhat(useCaseProblems(at("UC-009-unknown-name.md"), unknown, known)), expected);
  }
  assert.deepEqual(useCaseProblems(at("UC-009-unknown-name.md"), unknown), [], "no known names given: the names are not looked up");
  assert.equal(useCaseProblems(at("UC-010-not-a-name.md"), lowercase).length, 2, "a name in the wrong form is reported all the same");
});

test("parseUseCase — identifier, title, area, actors, realises, the sections by heading, and every Mermaid diagram", () => {
  const uc = parseUseCase(at("UC-001-complete.md"), read(FIX, "UC-001-complete.md"));
  assert.equal(uc.id, "UC-001");
  assert.equal(uc.title, "Export the list");
  assert.equal(uc.area, "2 requirements");
  assert.deepEqual(uc.actors, ["Author", "GitHub"]);
  assert.deepEqual(uc.realises, ["EXPORT AS CSV", "A NAME, WITH A COMMA", "THE AUTHOR'S OWN EXPORT"]);
  assert.deepEqual(Object.keys(uc.sections), ["Actors", "Precondition", "Main flow", "Alternative flows", "Postcondition"]);
  assert.equal(uc.sections.Precondition, "- The list exists.");
  assert.match(uc.sections["Alternative flows"], /^- \*\*1a\. The list is empty\.\*\*/);
  assert.match(uc.sections["Alternative flows"], /### 1b\. A detail under a lower heading stays in its section/);
  assert.doesNotMatch(uc.sections["Main flow"], /```mermaid|sequenceDiagram/, "a diagram is not prose of its section");
  assert.match(uc.sections["Main flow"], /^1\. The author presses \*\*Export\*\*\.\n2\. The dashboard writes the file\.$/);
  assert.equal(uc.diagrams.length, 1);
  assert.equal(uc.diagrams[0], "sequenceDiagram\n    actor A as Author\n    participant D as Dashboard\n    A->>D: Export\n    D-->>A: file");
  // Without front matter: the identifier from the file name, and empty fields — reading never throws.
  const bare = parseUseCase(at("UC-018-no-front-matter.md"), read(FIX, "UC-018-no-front-matter.md"));
  assert.deepEqual([bare.id, bare.title, bare.area, bare.actors, bare.realises], ["UC-018", "", "", [], []]);
  assert.equal(parseUseCase(at("UC-011-no-mermaid.md"), read(FIX, "UC-011-no-mermaid.md")).diagrams.length, 0);
});

test("every use case of this repository passes the dashboard's reader", () => {
  assert.ok(REAL_FILES.length > 0);
  const problems = REAL_FILES.flatMap((n) => useCaseProblems(at(n), read(REAL, n)).map((f) => `${n}:${f.line}: ${f.what}`));
  assert.deepEqual(problems, []);
});

// ---------------------------------------------------------------- the twin

test("the Python twin reports the same findings as the dashboard's reader — on every fixture and every use case of this repository", () => {
  const fixtures = FIXTURES.map((n) => [n, read(FIX, n)]);
  const py = python(fixtures, KNOWN);
  const jsFound = fixtures.map(([n, t]) => ruleWhat(useCaseProblems(at(n), t, KNOWN)));
  assert.equal(py.flat().length, Object.values(EXPECTED).flat().length, "the twin is compared on findings, not on empty lists");
  fixtures.forEach(([n], i) => assert.deepEqual(py[i], jsFound[i], n));
  const real = REAL_FILES.map((n) => [n, read(REAL, n)]);
  const pyReal = python(real, null);
  real.forEach(([n, t], i) => assert.deepEqual(pyReal[i], ruleWhat(useCaseProblems(at(n), t)), n));
});
