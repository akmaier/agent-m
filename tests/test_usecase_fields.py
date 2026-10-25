# Module: MOD-documents
# Guards: A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION; A USE CASE REALISES NAMED REQUIREMENTS; DIAGRAMS ARE MERMAID IN MARKDOWN; ONE USE CASE, ONE FILE
# Level: unit
"""SPEC §4 A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION · A USE CASE REALISES NAMED
REQUIREMENTS · DIAGRAMS ARE MERMAID IN MARKDOWN · §10 ONE USE CASE, ONE FILE.

A use case is checked as the product checks it: MOD-documents' documentFindings, by the use-case schema of
artifactSchemas (tests/artifact_checks.py use_case_findings)."""
import unittest

from artifact_checks import DOCS, use_case_findings

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


def at(name: str) -> str:
    return f"docs/use-cases/{name}"


class UseCaseFiles(unittest.TestCase):
    def test_there_are_use_cases(self):
        self.assertTrue(sorted((DOCS / "use-cases").glob("UC-*.md")))

    def test_every_use_case_is_complete(self):
        files = {at(f.name): f.read_text(encoding="utf-8") for f in sorted((DOCS / "use-cases").glob("UC-*.md"))}
        self.assertEqual({p: fs for p, fs in use_case_findings(files).items() if fs}, {})

    def test_ids_are_unique(self):
        ids = [f.name[:6] for f in (DOCS / "use-cases").glob("UC-*.md")]
        self.assertEqual(len(ids), len(set(ids)))

    def test_counter_proof(self):
        self.assertEqual(use_case_findings({at("UC-001-t.md"): GOOD}), {at("UC-001-t.md"): []})
        broken = {
            "UC-1-t.md": GOOD,
            "UC-001-t.md": GOOD.replace("## Postcondition\n", ""),
            "UC-002-t.md": GOOD,
            # A use case without the key realises; one whose realises holds nothing is a gap the graph lists
            # (tests/test_usecase_realises.py), since UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN.
            "UC-001-u.md": GOOD.replace("realises:\n  - NO SERVER\n", ""),
            "UC-001-v.md": GOOD.replace("```mermaid", "![d](d.png)\n```text"),
            "UC-001-w.md": GOOD.replace("area: 1\n", "stage: 1\n"),
            "UC-001-x.md": GOOD.replace("actors:\n  - Author\n", "actors: []\n"),
        }
        found = use_case_findings({at(name): text for name, text in broken.items()})
        for name in broken:
            self.assertTrue(found[at(name)], name)

    def test_the_old_key_stage_is_named(self):
        # The front-matter key is `area`; `stage` is reported by name, not only as a missing `area`.
        found = use_case_findings({at("UC-001-w.md"): GOOD.replace("area: 1\n", "stage: 1\n"),
                                   at("UC-001-y.md"): GOOD.replace("area: 1\n", "area: 1\nstage: 1\n")})
        for path, fs in found.items():
            self.assertIn("the key stage is not a key of the format use-case", [f["what"] for f in fs], path)


if __name__ == "__main__":
    unittest.main()
