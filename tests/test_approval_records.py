"""SPEC §10 ACCEPTANCE IS A COMMIT IN GITHUB · AN APPROVAL NAMES THE EXACT TEXT."""
import unittest

from artifact_checks import DOCS, record_problems

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
        }.items():
            self.assertTrue(record_problems(name, text), name)


if __name__ == "__main__":
    unittest.main()
