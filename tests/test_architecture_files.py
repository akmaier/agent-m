# Module: MOD-documents
# Guards: ONE ARCHITECTURE DECISION, ONE FILE; AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES; ONE MODULE, ONE FILE; A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES; EVERY ARTIFACT NAMES ITS ORIGIN; ONE REVIEW LAYOUT FOR EVERY PRODUCT; MODULE GAPS ARE REPORTED, NOT FORBIDDEN
# Level: unit
"""SPEC §11 ONE ARCHITECTURE DECISION, ONE FILE · AN ARCHITECTURE DECISION STATES CONTEXT, DECISION,
ALTERNATIVES AND CONSEQUENCES · ONE MODULE, ONE FILE · A MODULE STATES ITS RESPONSIBILITY AND ITS
INTERFACES · §1 EVERY ARTIFACT NAMES ITS ORIGIN · §10 ONE REVIEW LAYOUT FOR EVERY PRODUCT.

The format of `docs/architecture/ARC-<nnn>-<slug>.md` and `docs/architecture/MOD-<slug>.md` as MOD-documents reads and checks
it: documentFindings, by the decision and the module schema artifactSchemas gives (tests/artifact_checks.py
architecture_findings). The instance's own architecture files are checked; the fixture product under
tests/fixtures/architecture/ has one decision and three modules, and each counter-proof breaks one of them.
"""
import unittest
from pathlib import Path

from artifact_checks import DOCS, architecture_findings, module_call

FIX = Path(__file__).resolve().parent / "fixtures" / "architecture" / "docs" / "architecture"


def fixture(name: str) -> str:
    return (FIX / name).read_text(encoding="utf-8")


def folder_files(folder: Path) -> dict:
    return {f"docs/architecture/{f.name}": f.read_text(encoding="utf-8")
            for f in sorted(folder.glob("*.md")) if f.name != "README.md"}


def problems(files: dict, kind: str | None = None) -> dict:
    """The findings of each file that has any."""
    return {p: fs for p, fs in architecture_findings(files, kind).items() if fs}


class ArchitectureFiles(unittest.TestCase):
    def test_every_architecture_file_of_the_instance_is_complete(self):
        files = folder_files(DOCS / "architecture")
        self.assertTrue(files, "known positive: the instance has architecture files")
        self.assertEqual(problems(files), {})

    def test_the_fixture_files_are_complete(self):
        self.assertEqual(sorted(p.name for p in FIX.glob("*.md")),
                         ["ARC-001-static-client.md", "MOD-page.md", "MOD-reader.md", "MOD-review.md"])
        self.assertEqual(problems(folder_files(FIX)), {})

    def test_counter_proof_decision(self):
        good = fixture("ARC-001-static-client.md")
        broken = {
            "ARC-1-static-client.md": good,                                         # not ARC-<nnn>
            "ARC-1-static.md": good.replace("id: ARC-001", "id: ARC-1"),            # not ARC-<nnn>, id agreeing
            "ARC-001-Static.md": good,                                              # slug not lower case
            "ARC-002-static-client.md": good,                                       # id differs from the name
            "ARC-001-a.md": good.replace("## Alternatives\n", "## Options\n"),      # no alternatives
            "ARC-001-b.md": good.replace("## Context\n", ""),
            "ARC-001-c.md": good.replace("## Decision\n", "### Decision\n"),
            "ARC-001-d.md": good.replace("## Consequences\n", ""),
            "ARC-001-e.md": good.replace("forced_by:\n  - RULE ONE\n  - UC-001\n", "forced_by:\n"),  # names no origin
            "ARC-001-f.md": good.replace("  - UC-001\n", "  - a use case\n"),     # neither a UC nor a name
            "ARC-001-g.md": good.replace("title: The dashboard is a static client of the Git server's API\n", ""),
            "ARC-001-h.md": good.replace("## Consequences\n", "![view](view.png)\n## Consequences\n"),
            "ARC-001-i.md": good.replace("---\nid", "id", 1),                        # no front matter
        }
        self.assertEqual(problems({"docs/architecture/ARC-001-static-client.md": good}), {}, "known positive")
        for name, text in broken.items():
            self.assertTrue(problems({f"docs/architecture/{name}": text}, "decision"), name)

    def test_counter_proof_module(self):
        good = fixture("MOD-review.md")
        self.assertEqual(problems({"docs/architecture/MOD-review.md": good}), {}, "known positive")
        broken = {
            "MOD-Review.md": good,                                                  # slug not lower case
            "MOD-other.md": good,                                                   # id differs from the name
            "MOD-review-x.md": good,
            "mod-review.md": good,
            "MOD-review.md#1": good.replace("## Responsibility\n", ""),
            "MOD-review.md#2": good.replace("## Interfaces\n", "## API\n"),
            "MOD-review.md#3": good.replace("provides:\n  - status\n", ""),          # key missing
            "MOD-review.md#4": good.replace("uses:\n", "used:\n"),
            "MOD-review.md#5": good.replace("follows:\n  - ARC-001\n", "follows:\n  - ARC-1\n"),
            "MOD-review.md#6": good.replace("  - MOD-reader.readFile\n", "  - readFile\n"),   # not MOD-x.name
            "MOD-review.md#7": good.replace("  - MOD-reader.readFile\n", "  - MOD-Reader.readFile\n"),
            "MOD-review.md#9": good.replace("provides:\n  - status\n", "provides:\n  - status\n  - history\n"),  # not described
            "MOD-review.md#10": good.replace("  - UC-002\n", "  - UC-2\n"),
            "MOD-review.md#11": good.replace("provides:\n  - status\n", "provides:\n  - two words\n"),
            "MOD-review.md#12": good.replace("realises:\n", "forced_by:\n"),       # a decision's key in a module
            "MOD-review.md#13": good.replace("folder: src/review/\n", ""),          # no folder
            "MOD-review.md#14": good.replace("## Parts\n", ""),
            "MOD-review.md#15": good.replace("## Data\n", ""),
            "MOD-review.md#16": good.replace("## Files\n", ""),
            "MOD-review.md#17": good.replace("## Uses\n", ""),
        }
        for label, text in broken.items():
            self.assertTrue(problems({f"docs/architecture/{label.split('#')[0]}": text}, "module"), label)

    def test_empty_lists_are_allowed_where_the_SPEC_reports_gaps(self):
        # MODULE GAPS ARE REPORTED, NOT FORBIDDEN: a module may realise nothing and provide nothing.
        page = fixture("MOD-page.md")
        self.assertIn("realises:\nfollows:", page, "known positive: MOD-page realises nothing")
        self.assertIn("provides: []", page, "known positive: MOD-page provides nothing")
        self.assertEqual(problems({"docs/architecture/MOD-page.md": page}), {})

    def test_a_file_that_is_neither_is_named(self):
        path = "docs/architecture/DESIGN-001-x.md"
        self.assertIsNone(module_call("return documents.artifactSchemaOf(D) && documents.artifactSchemaOf(D).schema;", path))
        self.assertTrue(problems({path: fixture("ARC-001-static-client.md")}, "decision"))
        self.assertTrue(problems({path: fixture("MOD-review.md")}, "module"))


if __name__ == "__main__":
    unittest.main()
