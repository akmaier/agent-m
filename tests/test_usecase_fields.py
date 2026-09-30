"""SPEC §4 A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION · A USE CASE REALISES NAMED
REQUIREMENTS · DIAGRAMS ARE MERMAID IN MARKDOWN · §10 ONE USE CASE, ONE FILE."""
import unittest

from artifact_checks import DOCS, use_case_problems

GOOD = """---
id: UC-001
title: T
area: 1
actors:
  - Author
realises:
  - NO SERVER
---
# UC-001 T
## Actors
## Precondition
## Main flow
```mermaid
sequenceDiagram
  A->>B: x
```
## Alternative flows
## Postcondition
"""


class UseCaseFiles(unittest.TestCase):
    def test_there_are_use_cases(self):
        self.assertTrue(sorted((DOCS / "use-cases").glob("UC-*.md")))

    def test_every_use_case_is_complete(self):
        problems = []
        for f in sorted((DOCS / "use-cases").glob("UC-*.md")):
            problems += use_case_problems(f.name, f.read_text(encoding="utf-8"))
        self.assertEqual(problems, [])

    def test_ids_are_unique(self):
        ids = [f.name[:6] for f in (DOCS / "use-cases").glob("UC-*.md")]
        self.assertEqual(len(ids), len(set(ids)))

    def test_counter_proof(self):
        self.assertEqual(use_case_problems("UC-001-t.md", GOOD), [])
        broken = {
            "UC-1-t.md": GOOD,
            "UC-001-t.md": GOOD.replace("## Postcondition\n", ""),
            "UC-002-t.md": GOOD,
            "UC-001-u.md": GOOD.replace("realises:\n  - NO SERVER\n", "realises:\n"),
            "UC-001-v.md": GOOD.replace("```mermaid", "![d](d.png)\n```text"),
            "UC-001-w.md": GOOD.replace("area: 1\n", "stage: 1\n"),
        }
        for name, text in broken.items():
            self.assertTrue(use_case_problems(name, text), name)

    def test_the_old_key_stage_is_named(self):
        # The front-matter key is `area`; `stage` is reported by name, not only as a missing `area`.
        self.assertIn("UC-001-w.md: key 'stage' is now 'area'",
                      use_case_problems("UC-001-w.md", GOOD.replace("area: 1\n", "stage: 1\n")))
        self.assertIn("UC-001-w.md: key 'stage' is now 'area'",
                      use_case_problems("UC-001-w.md", GOOD.replace("area: 1\n", "area: 1\nstage: 1\n")))


if __name__ == "__main__":
    unittest.main()
