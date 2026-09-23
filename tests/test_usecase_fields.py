"""SPEC §4 A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION · A USE CASE REALISES NAMED
REQUIREMENTS · DIAGRAMS ARE MERMAID IN MARKDOWN · §10 ONE USE CASE, ONE FILE."""
import unittest

from artifact_checks import DOCS, use_case_problems

GOOD = """---
id: UC-001
title: T
stage: 1
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
        }
        for name, text in broken.items():
            self.assertTrue(use_case_problems(name, text), name)


if __name__ == "__main__":
    unittest.main()
