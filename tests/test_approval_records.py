"""SPEC §10 ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON · AN APPROVAL NAMES THE EXACT TEXT."""
import sys
import unittest
from pathlib import Path

from artifact_checks import DOCS, ROOT, record_problems

sys.path.insert(0, str(ROOT / "tools"))
import apply_approvals  # noqa: E402

FIXTURE = Path(__file__).resolve().parent / "fixtures" / "architecture"
ARC_FILE = "docs/architecture/ARC-001-static-client.md"
MOD_FILE = "docs/architecture/MOD-reader.md"

GOOD_UC = "kind: use-case\nfile: docs/use-cases/{f}\nblob: " + "a" * 40 + "\n"


class ApprovalRecords(unittest.TestCase):
    def test_every_record_is_well_formed(self):
        problems = []
        for f in sorted((DOCS / "approvals").glob("*.md")):
            if f.name == "README.md":
                continue
            problems += record_problems(f.name, f.read_text(encoding="utf-8"))
        self.assertEqual(problems, [])

    def test_counter_proof(self):
        uc = sorted((DOCS / "use-cases").glob("UC-*.md"))[0].name
        good = GOOD_UC.format(f=uc)
        self.assertEqual(record_problems("UC-x-" + "a" * 12 + ".md", good), [])
        for name, text in {
            "a.md": good,                                                   # no blob prefix in name
            "x-" + "a" * 12 + ".md": good.replace("kind: use-case", "kind: other"),
            "y-" + "a" * 12 + ".md": good.replace(uc, "UC-999-missing.md"),
            "z-" + "a" * 12 + ".md": good.replace("a" * 40, "a" * 39),
            "w-" + "a" * 12 + ".md": good.replace(uc, uc[:7] + "renamed-away.md").replace("UC-", "UC-9", 1),
        }.items():
            self.assertTrue(record_problems(name, text), name)

    def test_a_record_of_a_renamed_use_case_stays_valid(self):
        # A record names the file as it was called when it was accepted; a use case keeps its ID when
        # its file is renamed (UC-010: run-a-stage → run-a-job), so the record still names that use case.
        uc = sorted((DOCS / "use-cases").glob("UC-*.md"))[0].name
        old_name = uc[:7] + "an-earlier-name.md"
        self.assertEqual(record_problems("UC-x-" + "a" * 12 + ".md", GOOD_UC.format(f=old_name)), [])
        # Counter-proof: no use case with that ID exists any more.
        self.assertTrue(record_problems("UC-x-" + "a" * 12 + ".md", GOOD_UC.format(f="UC-999-an-earlier-name.md")))


    def test_records_of_architecture_decisions_and_modules(self):
        # Same three lines as a use case's record; the kind says which, the file name carries the identifier.
        arc = "kind: architecture-decision\nfile: " + ARC_FILE + "\nblob: " + "a" * 40 + "\n"
        mod = "kind: module\nfile: " + MOD_FILE + "\nblob: " + "b" * 40 + "\n"
        self.assertEqual(record_problems("ARC-001-" + "a" * 12 + ".md", arc, FIXTURE), [])
        self.assertEqual(record_problems("MOD-reader-" + "b" * 12 + ".md", mod, FIXTURE), [])
        # A decision's file renamed since keeps its identifier (THE NAME IS THE ID AND IT SURVIVES).
        self.assertEqual(record_problems("ARC-001-" + "a" * 12 + ".md",
                                         arc.replace("static-client", "an-earlier-name"), FIXTURE), [])
        for name, text in {
            "ARC-001-" + "a" * 12 + ".md#kind": arc.replace("architecture-decision", "module"),       # kind and file disagree
            "MOD-reader-" + "b" * 12 + ".md#kind": mod.replace("kind: module", "kind: use-case"),
            "ARC-001-" + "a" * 12 + ".md#gone": arc.replace("ARC-001-static-client", "ARC-009-static-client"),
            "MOD-reader-" + "b" * 12 + ".md#gone": mod.replace("MOD-reader", "MOD-writer"),
            "MOD-other-" + "b" * 12 + ".md": mod,                                                       # name carries another id
            "MOD-reader.md": mod,                                                                       # no blob prefix
            "ARC-001-" + "a" * 12 + ".md#file": arc.replace("file: ", "path: "),
        }.items():
            self.assertTrue(record_problems(name.split("#")[0], text, FIXTURE), name)

    def test_the_applier_passes_over_architecture_records(self):
        # tools/apply_approvals.py writes SPEC changes only; an architecture record must neither be applied nor refused.
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / "docs" / "approvals").mkdir(parents=True)
            (Path(d) / "docs" / "approvals" / ("ARC-001-" + "a" * 12 + ".md")).write_text(
                "kind: architecture-decision\nfile: " + ARC_FILE + "\nblob: " + "a" * 40 + "\n", encoding="utf-8")
            (Path(d) / "docs" / "approvals" / ("MOD-reader-" + "b" * 12 + ".md")).write_text(
                "kind: module\nfile: " + MOD_FILE + "\nblob: " + "b" * 40 + "\n", encoding="utf-8")
            self.assertEqual(apply_approvals.apply(Path(d)), (0, ""))


if __name__ == "__main__":
    unittest.main()
