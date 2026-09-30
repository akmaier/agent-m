"""SPEC §11 ONE ARCHITECTURE DECISION, ONE FILE · AN ARCHITECTURE DECISION STATES CONTEXT, DECISION,
ALTERNATIVES AND CONSEQUENCES · ONE MODULE, ONE FILE · A MODULE STATES ITS RESPONSIBILITY AND ITS
INTERFACES · §1 EVERY ARTIFACT NAMES ITS ORIGIN · §10 ONE REVIEW LAYOUT FOR EVERY PRODUCT.

The format of `docs/architecture/ARC-<nnn>-<slug>.md` and `docs/architecture/MOD-<slug>.md` as the
dashboard reads it (docs/assets/review-core.mjs parseArchitecture). The instance has no architecture
files yet; the fixture product under tests/fixtures/architecture/ has one decision and three modules,
and each counter-proof breaks one of them.
"""
import unittest
from pathlib import Path

from artifact_checks import DOCS, architecture_problems

FIX = Path(__file__).resolve().parent / "fixtures" / "architecture" / "docs" / "architecture"


def fixture(name: str) -> str:
    return (FIX / name).read_text(encoding="utf-8")


def all_problems(folder: Path) -> list[str]:
    out = []
    if folder.is_dir():
        for f in sorted(folder.glob("*.md")):
            if f.name != "README.md":
                out += architecture_problems(f.name, f.read_text(encoding="utf-8"))
    return out


class ArchitectureFiles(unittest.TestCase):
    def test_every_architecture_file_of_the_instance_is_complete(self):
        # None exist yet; once the first one is written, it is checked here.
        self.assertEqual(all_problems(DOCS / "architecture"), [])

    def test_the_fixture_files_are_complete(self):
        self.assertEqual(sorted(p.name for p in FIX.glob("*.md")),
                         ["ARC-001-static-client.md", "MOD-page.md", "MOD-reader.md", "MOD-review.md"])
        self.assertEqual(all_problems(FIX), [])

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
        for name, text in broken.items():
            self.assertTrue(architecture_problems(name, text), name)

    def test_counter_proof_module(self):
        good = fixture("MOD-review.md")
        self.assertEqual(architecture_problems("MOD-review.md", good), [])
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
            "MOD-review.md#8": good.replace("provides:\n  - status\n", "provides:\n  - status\n  - status\n"),
            "MOD-review.md#9": good.replace("provides:\n  - status\n", "provides:\n  - status\n  - history\n"),  # not described
            "MOD-review.md#10": good.replace("  - UC-002\n", "  - UC-2\n"),
            "MOD-review.md#11": good.replace("provides:\n  - status\n", "provides:\n  - two words\n"),
            "MOD-review.md#12": good.replace("realises:\n", "forced_by:\n"),       # a decision's key in a module
        }
        for label, text in broken.items():
            self.assertTrue(architecture_problems(label.split("#")[0], text), label)

    def test_empty_lists_are_allowed_where_the_SPEC_reports_gaps(self):
        # MODULE GAPS ARE REPORTED, NOT FORBIDDEN: a module may realise nothing, follow nothing, provide nothing.
        self.assertEqual(architecture_problems("MOD-page.md", fixture("MOD-page.md")), [])

    def test_a_file_that_is_neither_is_named(self):
        self.assertTrue(architecture_problems("DESIGN-001-x.md", fixture("ARC-001-static-client.md")))


if __name__ == "__main__":
    unittest.main()
