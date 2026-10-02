# Module: MOD-traceability
# Guards: UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN; MODULE GAPS ARE REPORTED, NOT FORBIDDEN
# Level: unit
"""SPEC §4 UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN — a requirement with no use case and a use case with no
requirement are both shown in the dashboard; neither blocks a run. SPEC §11 MODULE GAPS ARE REPORTED, NOT FORBIDDEN — a
module that realises no requirement, a requirement that no module realises, a module that no test exercises, and a code
file that names no module are shown in the dashboard; none of them blocks a job.

MOD-traceability coverageGaps(graph) gives the lists of UC-020 step 7 and moduleRows(graph) the rows and gaps of UC-025
steps 3 and 4. Reported: each gap is a list entry naming the artifact it concerns. Not forbidden: a graph full of gaps is
built, and every view of it — the rows, the impact lists — is computed from it as from a graph without one; no gap is an
error, and nothing refuses. A module that realises nothing is such a gap here, whatever the format check of its file says
(ITM-013). The files are the fixture product tests/fixtures/architecture/, with gaps planted in copies of it.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "architecture"
FILES = {p.relative_to(FIX).as_posix(): p.read_text(encoding="utf-8") for p in sorted(FIX.rglob("*")) if p.is_file()}
ARC, READER = "docs/architecture/ARC-001-static-client.md", "docs/architecture/MOD-reader.md"
REVIEW, PAGE = "docs/architecture/MOD-review.md", "docs/architecture/MOD-page.md"
UC3 = "docs/use-cases/UC-003-export.md"
RULE_THREE = "**RULE THREE** *(PO, 2026-10-01)*\nA third rule.\n*Check:* none\n\n"


def edited(files: dict, path: str, old: str, new: str) -> dict:
    assert old in files[path], (path, old)
    return {**files, path: files[path].replace(old, new)}


def use_case(realises: list) -> str:
    lines = "".join(f"  - {n}\n" for n in realises)
    return (f"---\nid: UC-003\ntitle: Export\narea: 1\nactors:\n  - Reader\nrealises:{' []' if not realises else ''}\n"
            f"{lines}---\n# UC-003 Export\n")


def gaps(files: dict) -> dict:
    return js(f"return traceability.coverageGaps(traceability.linkGraph({{ files: {json.dumps(files)} }}));")


def modules(files: dict) -> dict:
    return js(f"return traceability.moduleRows(traceability.linkGraph({{ files: {json.dumps(files)} }}));")


def gap_list(m: dict) -> list:
    return sorted((g["kind"], g["artifact"]) for g in m["gaps"])


# The fixture with every gap of both rules: RULE THREE, which nothing realises; UC-003, which realises only a withdrawn
# requirement and an unknown name; the test guarding a rule its module does not realise; a code file naming two modules and
# one naming a module that does not exist.
GAPPED = {**FILES, "SPEC.md": FILES["SPEC.md"].replace("**OLD RULE**", RULE_THREE + "**OLD RULE**"),
          UC3: use_case(["OLD RULE", "NO SUCH RULE"]),
          "tests/reader.test.js": FILES["tests/reader.test.js"].replace("// Guards: RULE ONE", "// Guards: RULE ONE; THE READER'S RULE"),
          "src/both.js": "// Module: MOD-reader\n// Module: MOD-review\n",
          "src/ghost.js": "// Module: MOD-ghost\n"}


class UnrealisedRequirements(unittest.TestCase):
    def test_the_fixture_has_no_coverage_gap_but_its_untested_rule(self):
        self.assertEqual(gaps(FILES), {"unrealised": [], "realisingNothing": [],
                                       "unknownNames": [{"name": "MOD-store", "withdrawn": False, "from": ["MOD-review"]}],
                                       "untested": ["THE READER'S RULE"]})

    def test_a_requirement_without_use_case_and_a_use_case_without_requirement_are_listed(self):
        g = gaps(GAPPED)
        self.assertEqual(g["unrealised"], ["RULE THREE"])
        self.assertEqual(g["realisingNothing"], ["UC-003"], "it realises only a withdrawn and an unknown name")
        self.assertIn({"name": "OLD RULE", "withdrawn": True, "from": ["UC-003"]}, g["unknownNames"])
        self.assertIn({"name": "NO SUCH RULE", "withdrawn": False, "from": ["UC-003"]}, g["unknownNames"])
        self.assertEqual(g["untested"], ["RULE THREE"], "the test now guards THE READER'S RULE too")
        # A use case with an empty realises list is the same gap.
        self.assertEqual(gaps({**FILES, UC3: use_case([])})["realisingNothing"], ["UC-003"])

    def test_counter_proof_a_realised_requirement_is_no_gap(self):
        realised = {**GAPPED, UC3: use_case(["RULE THREE"])}
        g = gaps(realised)
        self.assertEqual([g["unrealised"], g["realisingNothing"]], [[], []])
        self.assertNotIn("OLD RULE", [u["name"] for u in g["unknownNames"]])


class ModuleGaps(unittest.TestCase):
    def test_each_module_row_names_what_it_realises_follows_its_code_and_its_tests(self):
        rows = {r["id"]: r for r in modules(FILES)["rows"]}
        self.assertEqual(sorted(rows), ["MOD-page", "MOD-reader", "MOD-review"])
        self.assertEqual(rows["MOD-reader"]["realises"], [{"name": "RULE ONE", "status": "accepted"},
                                                          {"name": "UC-001", "status": None}])
        self.assertEqual(rows["MOD-reader"]["follows"], [{"name": "ARC-001", "status": None}])
        self.assertEqual(rows["MOD-reader"]["code"], ["src/reader.js"])
        self.assertEqual(rows["MOD-reader"]["tests"], [{"path": "tests/reader.test.js", "guards": ["RULE ONE"]}])
        self.assertEqual([rows["MOD-review"]["code"], rows["MOD-review"]["tests"]], [["src/review.py"], []])
        self.assertEqual([rows["MOD-page"]["realises"], rows["MOD-page"]["code"]], [[], []])

    def test_the_four_gaps_of_the_rule_and_those_of_uc_025_are_listed(self):
        self.assertEqual(gap_list(modules(FILES)), [
            ("code-without-module", "src/late.js"),
            ("module-without-code", "MOD-page"),
            ("module-without-test", "MOD-page"),
            ("module-without-test", "MOD-review"),
            ("realises-nothing", "MOD-page"),
            ("unknown-name", "MOD-review"),
        ])
        self.assertEqual(gap_list(modules(GAPPED)), [
            ("code-names-two-modules", "src/both.js"),
            ("code-names-unknown-module", "src/ghost.js"),
            ("code-without-module", "src/late.js"),
            ("module-without-code", "MOD-page"),
            ("module-without-test", "MOD-page"),
            ("module-without-test", "MOD-review"),
            ("realises-nothing", "MOD-page"),
            ("requirement-without-module", "RULE THREE"),
            ("test-guards-what-its-module-does-not-realise", "tests/reader.test.js"),
            ("unknown-name", "MOD-review"),
        ])
        by = {(g["kind"], g["artifact"]): g for g in modules(GAPPED)["gaps"]}
        self.assertEqual(by[("test-guards-what-its-module-does-not-realise", "tests/reader.test.js")]["names"],
                         ["THE READER'S RULE"])
        self.assertEqual(by[("unknown-name", "MOD-review")]["names"], ["MOD-store"])
        self.assertEqual(by[("code-names-unknown-module", "src/ghost.js")]["names"], ["MOD-ghost"])

    def test_a_withdrawn_name_is_a_gap_with_its_note(self):
        files = edited(FILES, READER, "  - RULE ONE\n", "  - RULE ONE\n  - OLD RULE\n")
        m = modules(files)
        realises = {r["id"]: r["realises"] for r in m["rows"]}["MOD-reader"]
        self.assertIn({"name": "OLD RULE", "status": "withdrawn"}, realises)
        by = {(g["kind"], g["artifact"]): g for g in m["gaps"]}
        self.assertEqual(by[("unknown-name", "MOD-reader")]["names"], ["OLD RULE"])
        self.assertTrue(by[("unknown-name", "MOD-reader")]["withdrawn"])

    def test_counter_proof_a_module_with_requirement_code_and_test_is_no_gap(self):
        files = edited(FILES, PAGE, "realises:\nfollows:\n", "realises:\n  - THE READER'S RULE\nfollows:\n  - ARC-001\n")
        files = {**files, "src/page.js": "// Module: MOD-page\n", "tests/page.test.js": "// Module: MOD-page\n// Guards: THE READER'S RULE\n"}
        self.assertNotIn("MOD-page", [g["artifact"] for g in modules(files)["gaps"]])


class NothingBlocks(unittest.TestCase):
    def test_every_view_is_computed_on_a_graph_full_of_gaps(self):
        r = js(f"const files = {json.dumps(GAPPED)};"
               "const g = traceability.linkGraph({ files });"
               "const arc = (t) => artifacts.parseArchitecture('" + ARC + "', t);"
               f"const after = arc(files['{ARC}'].replace('  - UC-001\\n', '  - UC-002\\n'));"
               "const cov = traceability.coverageGaps(g), mods = traceability.moduleRows(g);"
               "return { rows: mods.rows.length, gaps: mods.gaps.length, unrealised: cov.unrealised,"
               "  trace: traceability.tracesTo(g, 'RULE THREE'), impact: traceability.requirementImpact(g, 'OLD RULE').map((a) => a.id),"
               "  arch: traceability.architectureImpact({ before: arc(files['" + ARC + "']), after, graph: g }).affected.map((a) => a.id),"
               "  kinds: [...new Set([...mods.gaps, ...cov.unknownNames].map((x) => x.severity ?? null))] };")
        self.assertEqual(r["rows"], 3)
        self.assertEqual(r["gaps"], 10)
        self.assertEqual(r["unrealised"], ["RULE THREE"])
        self.assertEqual(r["trace"]["useCases"], [])
        self.assertEqual(r["impact"], ["UC-003"], "what still names a withdrawn requirement")
        self.assertEqual(r["arch"], ["MOD-reader", "MOD-review"])
        self.assertEqual(r["kinds"], [None], "a gap is a line of a list, never an error or a refusal")


if __name__ == "__main__":
    unittest.main()
