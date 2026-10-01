# Module: MOD-artifacts
# Guards: DIAGRAMS ARE MERMAID IN MARKDOWN
# Level: unit
"""SPEC §4 DIAGRAMS ARE MERMAID IN MARKDOWN — a use case carries its diagram as a fenced Mermaid block in its own
Markdown, and no diagram is stored as an image file: neither referenced from a use case (as a Markdown image or an
HTML <img>) nor kept beside the use cases and architecture files.

Checked on the fixtures of tests/fixtures/use-cases/ and on this repository's use cases; the dashboard's reader is
asked the same through node (tests/jsrun.py). Counter-proofs: docs/measurements/2026-10-01_use-case-checks.md."""
import json
import re
import unittest
from pathlib import Path

from artifact_checks import DOCS, use_case_findings
from jsrun import js

RULE = "DIAGRAMS ARE MERMAID IN MARKDOWN"
FIX = Path(__file__).resolve().parent / "fixtures" / "use-cases"
IMAGE_FILE = re.compile(r"\.(png|jpe?g|gif|svg|webp|bmp|tiff?)$", re.I)


def fixture(name: str) -> str:
    return (FIX / name).read_text(encoding="utf-8")


def diagrams(name: str, text: str) -> list[str]:
    return [f["what"] for f in use_case_findings(name, text) if f["rule"] == RULE]


class DiagramsAreMermaidInMarkdown(unittest.TestCase):
    def test_every_use_case_of_this_repository_has_a_mermaid_block_and_no_image(self):
        found = {}
        for f in sorted((DOCS / "use-cases").glob("UC-*.md")):
            p = diagrams(f.name, f.read_text(encoding="utf-8"))
            if p:
                found[f.name] = p
        self.assertEqual(found, {})

    def test_no_image_file_is_kept_beside_the_use_cases_and_the_architecture(self):
        images = [str(p.relative_to(DOCS)) for folder in ("use-cases", "architecture")
                  for p in sorted((DOCS / folder).rglob("*")) if p.is_file() and IMAGE_FILE.search(p.name)]
        self.assertEqual(images, [])

    def test_a_complete_use_case_passes(self):
        self.assertEqual(diagrams("UC-001-complete.md", fixture("UC-001-complete.md")), [])

    def test_a_use_case_without_a_mermaid_block_is_reported(self):
        for name in ("UC-011-no-mermaid.md", "UC-012-mermaid-only-mentioned.md"):
            self.assertEqual(diagrams(name, fixture(name)), ["no Mermaid diagram"], name)

    def test_a_diagram_stored_as_an_image_is_reported(self):
        self.assertEqual(diagrams("UC-013-image-diagram.md", fixture("UC-013-image-diagram.md")),
                         ["no Mermaid diagram", "diagram stored as an image file (flow.png)"])
        self.assertEqual(diagrams("UC-014-image-with-title.md", fixture("UC-014-image-with-title.md")),
                         ["diagram stored as an image file (diagrams/flow.PNG)"])
        self.assertEqual(diagrams("UC-015-image-as-html.md", fixture("UC-015-image-as-html.md")),
                         ["diagram stored as an image file (diagrams/flow.svg?raw=true)"])

    def test_the_dashboards_reader_reports_the_same_on_their_lines(self):
        got = {}
        for name in ("UC-001-complete.md", "UC-013-image-diagram.md", "UC-015-image-as-html.md"):
            got[name] = js(f"return useCases.useCaseProblems({json.dumps('docs/use-cases/' + name)}, "
                           f"{json.dumps(fixture(name))}).filter((f) => f.rule === {json.dumps(RULE)})"
                           ".map((f) => [f.what, f.line]);")
        self.assertEqual(got, {
            "UC-001-complete.md": [],
            "UC-013-image-diagram.md": [["no Mermaid diagram", 1], ["diagram stored as an image file (flow.png)", 31]],
            "UC-015-image-as-html.md": [["diagram stored as an image file (diagrams/flow.svg?raw=true)", 39]],
        })


if __name__ == "__main__":
    unittest.main()
