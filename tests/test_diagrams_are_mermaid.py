# Module: MOD-documents
# Guards: DIAGRAMS ARE MERMAID IN MARKDOWN
# Level: unit
"""SPEC §4 DIAGRAMS ARE MERMAID IN MARKDOWN — a use case carries its diagram as a fenced Mermaid block in its own
Markdown, and no diagram is stored as an image file: neither referenced from a use case (as a Markdown image or an
HTML <img>) nor kept beside the use cases and architecture files.

Checked on the fixtures of tests/fixtures/use-cases/ and on this repository's use cases as the product checks them:
MOD-documents' documentFindings, by the use-case schema (tests/artifact_checks.py use_case_findings), which names every image.
The requirement asks that a diagram be Mermaid, not that a use case hold one, so a use case without a diagram is not checked
here. Counter-proofs: docs/measurements/2026-10-01_use-case-checks.md."""
import re
import unittest
from pathlib import Path

from artifact_checks import DOCS, use_case_findings

RULE = "DIAGRAMS ARE MERMAID IN MARKDOWN"
FIX = Path(__file__).resolve().parent / "fixtures" / "use-cases"
IMAGE_FILE = re.compile(r"\.(png|jpe?g|gif|svg|webp|bmp|tiff?)$", re.I)


def image(address: str) -> str:
    return f"the image {address} stands where a diagram is written as a ```mermaid block"


def diagrams(names) -> dict:
    """{ name: [[line, what]] } — the findings under the rule of each fixture."""
    found = use_case_findings({f"docs/use-cases/{n}": (FIX / n).read_text(encoding="utf-8") for n in names})
    return {path.split("/")[-1]: [[f["line"], f["what"]] for f in fs if f["rule"] == RULE] for path, fs in found.items()}


class DiagramsAreMermaidInMarkdown(unittest.TestCase):
    def test_every_use_case_of_this_repository_has_a_mermaid_block_and_no_image(self):
        files = {f"docs/use-cases/{f.name}": f.read_text(encoding="utf-8") for f in sorted((DOCS / "use-cases").glob("UC-*.md"))}
        self.assertTrue(files)
        found = {p: [f["what"] for f in fs if f["rule"] == RULE] for p, fs in use_case_findings(files).items()}
        self.assertEqual({p: w for p, w in found.items() if w}, {})

    def test_no_image_file_is_kept_beside_the_use_cases_and_the_architecture(self):
        images = [str(p.relative_to(DOCS)) for folder in ("use-cases", "architecture")
                  for p in sorted((DOCS / folder).rglob("*")) if p.is_file() and IMAGE_FILE.search(p.name)]
        self.assertEqual(images, [])

    def test_a_complete_use_case_passes(self):
        self.assertEqual(diagrams(["UC-001-complete.md"]), {"UC-001-complete.md": []})

    def test_a_diagram_stored_as_an_image_is_reported_on_its_line(self):
        self.assertEqual(diagrams(["UC-013-image-diagram.md", "UC-014-image-with-title.md", "UC-015-image-as-html.md"]), {
            "UC-013-image-diagram.md": [[31, image("flow.png")]],
            "UC-014-image-with-title.md": [[39, image("diagrams/flow.PNG")]],
            "UC-015-image-as-html.md": [[39, image("diagrams/flow.svg?raw=true")]],
        })


if __name__ == "__main__":
    unittest.main()
