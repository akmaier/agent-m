# Module: MOD-trace-graph
# Guards: UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN; MODULE GAPS ARE REPORTED, NOT FORBIDDEN; EVERY CODE FILE BELONGS TO A MODULE
# Level: unit
"""SPEC §4 UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN — a requirement with no use case and a use case with no
requirement are both shown in the dashboard; neither blocks a run. SPEC §11 MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a
module that realises no requirement, a requirement that no module realises and a module that no test exercises are shown in
the dashboard; none of them blocks a job. SPEC §11 EVERY CODE FILE BELONGS TO A MODULE — a code file in no module's folder is
listed.

MOD-trace-graph: traceGraph builds the graph of a repository's files, coverageGaps gives the lists of UC-020 step 7 and
moduleRows the rows and gaps of UC-025 steps 3 and 4. Reported: each gap is a list entry naming the artifact it concerns. Not
forbidden: a graph full of gaps is built, every view of it is computed as from a graph without one, and graphFindings, whose
findings are errors, reports none of the gaps. The product is built here, small, from the helpers below, with gaps planted in
copies of it; each test states its input and its expected result in its own text.
"""
import json
import unittest

from jsrun import js

RULE_ONE, RULE_TWO = "RULE ONE", "RULE TWO"
SPEC_ONE = f"**{RULE_ONE}** *(PO, 2026-10-01)*\nThe first rule.\n*Check:* none\n\n"
SPEC_TWO = f"**{RULE_TWO}** *(PO, 2026-10-01)*\nThe second rule.\n*Check:* none\n\n"
DECISION = "docs/architecture/ARC-001-the-whole.md"


def spec(*rules: str) -> str:
    return "# Fixture product\n\n## Rules\n\n" + "".join(rules)


def decision(designs: list) -> str:
    items = "".join(f"  - {m}\n" for m in designs)
    return (f"---\nid: ARC-001\ntitle: The whole\nforced_by:\n  - {RULE_ONE}\ndesigns:\n{items}---\n# ARC-001 The whole\n")


def module(slug: str, realises: list = ()) -> str:
    items = "".join(f"  - {name}\n" for name in realises)
    return (f"---\nid: MOD-{slug}\ntitle: {slug}\nfolder: src/{slug}/\nrealises:{'' if realises else ' []'}\n{items}follows:\n"
            f"  - ARC-001\nuses: []\nprovides: []\n---\n# MOD-{slug} {slug}\n")


def use_case(n: int, realises: list) -> str:
    lines = "".join(f"  - {name}\n" for name in realises)
    return (f"---\nid: UC-00{n}\ntitle: Case {n}\narea: 1\nactors:\n  - Reader\nrealises:{'' if realises else ' []'}\n{lines}"
            f"---\n# UC-00{n} Case {n}\n")


def test_file(n: int, slug: str, guards: list) -> str:
    """A test file with one declaration, written from parts so that this file declares no test by it."""
    head = " ".join(["//", f"TST-10000{n}", "·", "level: unit", "·", f"module: MOD-{slug}"])
    return (f"// Module: MOD-{slug}\n{head}\n// guards: {'; '.join(guards)}\n// given: nothing\n// input: nothing\n// expect: nothing\n"
            "test(\"a fixture test\", () => {});\n")


def product(code_at: str = "src/one/one.mjs", tested: bool = True, realises: bool = True, extra: dict = None) -> dict:
    """One requirement, one decision, one module MOD-one that realises the requirement unless `realises` is false; its code file
    at `code_at`, a test of it unless `tested` is false, and the files of `extra` besides."""
    files = {"SPEC.md": spec(SPEC_ONE), DECISION: decision(["MOD-one"]),
             "docs/architecture/MOD-one.md": module("one", [RULE_ONE] if realises else []),
             code_at: "export const one = 1;\n", "docs/use-cases/UC-001-case.md": use_case(1, [RULE_ONE])}
    if tested:
        files["tests/one.test.mjs"] = test_file(1, "one", [RULE_ONE])
    return {**files, **(extra or {})}


def run(files: dict, call: str):
    """The expression `call` over the graph `tg` that traceGraph builds from `files`."""
    return js(f"const fixture = {json.dumps(files)};"
              "const tg = await traceGraph.traceGraph({ paths: Object.keys(fixture), read: async (p) => fixture[p] ?? null });"
              + call)


def coverage(files: dict) -> dict:
    return run(files, "return traceGraph.coverageGaps(tg);")


def gap_list(files: dict) -> list:
    return [[g["kind"], g["artifact"]] for g in run(files, "return traceGraph.moduleRows(tg);")["gaps"]]


class UnrealisedRequirements(unittest.TestCase):
    # TST-692101 · level: unit · module: MOD-trace-graph
    # guards: UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
    # given: a product of RULE ONE, which UC-001 realises, and RULE TWO, which no use case realises, with UC-002 realising nothing and UC-003 realising only the name NO SUCH RULE
    # input: coverageGaps over the graph traceGraph builds from its files
    # expect: RULE TWO is the one requirement without a use case; UC-002 and UC-003 are the use cases without a requirement; NO SUCH RULE is the one unknown name, named by UC-003 alone
    def test_a_requirement_without_use_case_and_a_use_case_without_requirement_are_listed(self):
        files = product(extra={"docs/use-cases/UC-002-case.md": use_case(2, []),
                               "docs/use-cases/UC-003-case.md": use_case(3, ["NO SUCH RULE"])})
        files["SPEC.md"] = spec(SPEC_ONE, SPEC_TWO)
        gaps = coverage(files)
        self.assertEqual(gaps["requirementsWithoutUseCase"], [RULE_TWO])
        self.assertEqual(gaps["useCasesWithoutRequirement"], ["UC-002", "UC-003"])
        self.assertEqual([(u["name"], [p["id"] for p in u["namedBy"]]) for u in gaps["unknownNames"]], [("NO SUCH RULE", ["UC-003"])])

    # TST-692102 · level: unit · module: MOD-trace-graph
    # guards: UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
    # given: the product of TST-692101 with UC-002 realising RULE TWO and no UC-003
    # input: coverageGaps over its graph
    # expect: no requirement without a use case, no use case without a requirement and no unknown name
    def test_counter_proof_a_realised_requirement_is_no_gap(self):
        files = product(extra={"docs/use-cases/UC-002-case.md": use_case(2, [RULE_TWO])})
        files["SPEC.md"] = spec(SPEC_ONE, SPEC_TWO)
        gaps = coverage(files)
        self.assertEqual([gaps["requirementsWithoutUseCase"], gaps["useCasesWithoutRequirement"], gaps["unknownNames"]], [[], [], []])


class ModuleGaps(unittest.TestCase):
    # TST-692103 · level: unit · module: MOD-trace-graph
    # guards: EVERY CODE FILE BELONGS TO A MODULE
    # given: the product with its code file at src/one/one.mjs, in the folder of MOD-one, and a copy with the file at loose/one.mjs, in no module's folder
    # input: moduleRows over the graph of each
    # expect: the first lists no gap at all; the second lists the code file loose/one.mjs as code-without-module, its folder loose as a folder no module names, and MOD-one as without code, and nothing else
    def test_a_code_file_in_no_modules_folder_is_listed_and_a_product_whose_files_all_belong_lists_none(self):
        self.assertEqual(gap_list(product()), [])
        self.assertEqual(gap_list(product(code_at="loose/one.mjs")),
                         [["code-without-module", "loose/one.mjs"], ["folder-named-by-no-module", "loose"],
                          ["module-without-code", "MOD-one"]])

    # TST-692104 · level: unit · module: MOD-trace-graph
    # guards: MODULE GAPS ARE REPORTED, NOT FORBIDDEN
    # given: the product whose module file realises nothing, with no test of MOD-one, and with RULE TWO in its SPEC, which no module realises
    # input: moduleRows over its graph
    # expect: MOD-one is listed as realising no requirement and as exercised by no test, and RULE TWO as a requirement no module realises; and these three only
    def test_a_module_that_realises_nothing_a_requirement_no_module_realises_and_a_module_no_test_exercises_are_listed(self):
        files = product(tested=False, realises=False)
        files["SPEC.md"] = spec(SPEC_ONE, SPEC_TWO)
        self.assertEqual(gap_list(files), [["module-without-test", "MOD-one"], ["realises-nothing", "MOD-one"],
                                           ["requirement-without-module", RULE_ONE], ["requirement-without-module", RULE_TWO]])

    # TST-692105 · level: unit · module: MOD-trace-graph
    # guards: MODULE GAPS ARE REPORTED, NOT FORBIDDEN
    # given: the product of TST-692104 with the module file realising RULE ONE and a test of MOD-one that guards RULE ONE
    # input: moduleRows over its graph
    # expect: only RULE TWO is listed, as a requirement no module realises; the module has no gap
    def test_counter_proof_a_module_with_code_and_a_test_that_guards_a_requirement_is_no_gap(self):
        files = product()
        files["SPEC.md"] = spec(SPEC_ONE, SPEC_TWO)
        self.assertEqual(gap_list(files), [["requirement-without-module", RULE_TWO]])


def tests_naming_no_module(files: dict) -> list:
    """The tests and test helpers that name no module of the architecture, read as the dashboard has read them: by the `Module:`
    lines of their header, as MOD-test-document's testHeader reads it (SPEC.md EVERY CODE FILE BELONGS TO A MODULE), for every
    file it reads a header of. The modules of the architecture are the module nodes of the graph traceGraph builds.
    A test or helper whose header names no module is listed as code-without-module, one that names a module the architecture
    does not describe as code-names-unknown-module, once for each such module."""
    return run(files, "const modules = new Set([...tg.nodes.values()].filter((n) => n.kind === 'MOD').map((n) => n.id));"
               "return Object.keys(fixture).filter((p) => testDocument.testHeader(p, fixture[p]) !== null).flatMap((p) => {"
               "  const named = testDocument.testHeader(p, fixture[p]).modules;"
               "  return named.length === 0 ? [['code-without-module', p]]"
               "    : named.filter((m) => !modules.has(m)).map(() => ['code-names-unknown-module', p]); });")


class TestsNameAModule(unittest.TestCase):
    # TST-692108 · level: unit · module: MOD-trace-graph
    # guards: EVERY CODE FILE BELONGS TO A MODULE
    # given: the product with its test tests/one.test.mjs, whose header names MOD-one, with a test helper tests/helper.mjs that names no module and a test tests/ghost.test.mjs whose header names MOD-ghost, which the architecture does not describe
    # input: the tests whose header names no module of the architecture, read as the dashboard reads them
    # expect: tests/helper.mjs as naming no module, and tests/ghost.test.mjs as naming a module that does not exist; tests/one.test.mjs is not listed
    def test_a_test_or_helper_that_names_no_module_of_the_architecture_is_listed(self):
        files = product(extra={"tests/helper.mjs": "export const help = 1;\n", "tests/ghost.test.mjs": "// Module: MOD-ghost\n"})
        self.assertEqual(sorted(tests_naming_no_module(files)),
                         [["code-names-unknown-module", "tests/ghost.test.mjs"], ["code-without-module", "tests/helper.mjs"]])

    # TST-692109 · level: unit · module: MOD-trace-graph
    # guards: EVERY CODE FILE BELONGS TO A MODULE
    # given: the product whose only test, tests/one.test.mjs, names MOD-one in its header
    # input: the tests whose header names no module of the architecture
    # expect: none
    def test_counter_proof_a_product_whose_tests_all_name_a_module_lists_none(self):
        self.assertEqual(tests_naming_no_module(product()), [])


class NothingBlocks(unittest.TestCase):
    # TST-692106 · level: unit · module: MOD-trace-graph
    # guards: UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN; MODULE GAPS ARE REPORTED, NOT FORBIDDEN
    # given: a product full of gaps — RULE TWO that no use case or module realises, UC-002 realising nothing, MOD-one without a test, a code file in no module's folder — that breaks no rule of the architecture
    # input: traceGraph, coverageGaps, moduleRows and graphFindings over its files
    # expect: the graph is built; the gaps are listed (positive control: more than one in each list); graphFindings gives no finding, since a gap is a line of a list and no error
    def test_a_graph_full_of_gaps_is_built_and_no_gap_is_an_error(self):
        files = product(tested=False, extra={"docs/use-cases/UC-002-case.md": use_case(2, []), "loose/free.mjs": "export const f = 1;\n"})
        files["SPEC.md"] = spec(SPEC_ONE, SPEC_TWO)
        r = run(files, "return { findings: traceGraph.graphFindings(tg), coverage: traceGraph.coverageGaps(tg), rows: traceGraph.moduleRows(tg) };")
        self.assertGreater(len(r["coverage"]["requirementsWithoutUseCase"]) + len(r["coverage"]["useCasesWithoutRequirement"]), 1)
        self.assertGreater(len(r["rows"]["gaps"]), 1)
        self.assertEqual(r["findings"], [])

    # TST-692107 · level: unit · module: MOD-trace-graph
    # guards: UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
    # given: the product with its test and UC-003 realising the name NO SUCH RULE, which is no requirement
    # input: graphFindings and coverageGaps over its graph
    # expect: graphFindings gives one finding, an error of UC-003 under A USE CASE REALISES NAMED REQUIREMENTS; coverageGaps lists the same name; so an error is a name that matches nothing and no gap else
    def test_counter_proof_a_name_that_matches_nothing_is_an_error_beside_the_gaps(self):
        files = product(extra={"docs/use-cases/UC-003-case.md": use_case(3, ["NO SUCH RULE"])})
        r = run(files, "return { findings: traceGraph.graphFindings(tg), coverage: traceGraph.coverageGaps(tg) };")
        self.assertEqual([(f["artifact"], f["kind"], f["rule"]) for f in r["findings"]],
                         [("UC-003", "error", "A USE CASE REALISES NAMED REQUIREMENTS")])
        self.assertEqual([u["name"] for u in r["coverage"]["unknownNames"]], ["NO SUCH RULE"])


if __name__ == "__main__":
    unittest.main()
