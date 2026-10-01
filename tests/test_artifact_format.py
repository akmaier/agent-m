# Guards: ARTIFACTS ARE MARKDOWN
# Level: unit
"""SPEC §0 ARTIFACTS ARE MARKDOWN — every artifact Agent M produces is Markdown, with diagrams written as Mermaid inside it.

Two kinds of evidence:

1. This repository, which Agent M develops with itself: every tracked file in the places where artifacts and records live
   (the table of ARC-006 — the SPEC, the use cases, the architecture, the change queues, the approval records, the
   backlog, the groups, the job records, the product and instance files, the measurements) is a Markdown file.
2. The fixture product that Agent M's own writers make (tests/test_self_sufficient.py: the layout of *Add product*, the
   files of an acceptance, the product settings, the collaborators): every file they write is a Markdown file.

In both, a diagram is Mermaid: no fenced block in another diagram language, and no diagram kept as an image — no
Markdown image, no HTML image or embedded object, no link to an image file. Code spans and fenced code are text about
such things, not such things, and are not read. Only tracked files count, so a scratch file changes nothing.

Where tests/test_diagrams_are_mermaid.py checks a use case's own Mermaid block and the image files beside the use cases and
the architecture (DIAGRAMS ARE MERMAID IN MARKDOWN), this check covers every kind of artifact and what Agent M writes.
Counter-proofs: docs/measurements/2026-10-01_product-rules-repository-checks.md."""
import re
import subprocess
import unittest
from pathlib import Path

from test_self_sufficient import fixture_product

ROOT = Path(__file__).resolve().parents[1]

# Where artifacts and records live (ARC-006, "Where each lives"): a folder ends in "/", a file does not.
ARTIFACT_PLACES = [
    "SPEC.md", "CHANGELOG.md",
    "docs/use-cases/", "docs/architecture/", "docs/spec-freigaben/", "docs/approvals/", "docs/groups/", "docs/jobs/",
    "docs/backlog/", "docs/tests/", "docs/sources/", "docs/process-models/", "docs/measurements/",
    "docs/settings.md", "docs/collaborators.md", "docs/resources.md", "docs/sources.md", "docs/process.md",
    "docs/participants.md",
]

OTHER_DIAGRAM_LANGUAGES = {
    "plantuml", "puml", "uml", "dot", "graphviz", "gv", "ditaa", "d2", "svgbob", "bob", "nomnoml", "wavedrom", "blockdiag",
    "seqdiag", "actdiag", "nwdiag", "packetdiag", "rackdiag", "vega", "vega-lite", "bpmn", "excalidraw", "drawio", "mscgen",
    "pikchr", "erd", "structurizr", "tikz", "kroki",
}
IMAGE = r"[^\s\"'<>)]+\.(?:png|jpe?g|gif|svg|webp|bmp|tiff?|ico|pdf|drawio|vsdx?)(?:[?#][^\s\"'<>)]*)?"
FENCE = re.compile(r"^[ \t]*(`{3,}|~{3,})[ \t]*([^\s`{]*)", re.M)


def is_artifact_place(path: str) -> bool:
    return any(path == p or (p.endswith("/") and path.startswith(p)) for p in ARTIFACT_PLACES)


def outside_code(text: str) -> tuple[str, list[str]]:
    """-> (the text without fenced blocks and code spans, the language of every fenced block)."""
    out, langs, lines, i = [], [], text.split("\n"), 0
    while i < len(lines):
        m = FENCE.match(lines[i])
        if not m:
            out.append(lines[i])
            i += 1
            continue
        fence, langs = m.group(1), langs + [m.group(2).lower()]
        i += 1
        while i < len(lines) and not re.match(rf"^[ \t]*{re.escape(fence[0])}{{{len(fence)},}}[ \t]*$", lines[i]):
            i += 1
        i += 1
    return re.sub(r"`+[^`\n]*`+", " ", "\n".join(out)), langs


def format_findings(path: str, text: str | None) -> list[str]:
    """What keeps one written file from being Markdown with Mermaid diagrams. text None: not read (not Markdown)."""
    if not path.endswith(".md"):
        return [f"{path}: not a Markdown file"]
    prose, langs = outside_code(text or "")
    found = [f"{path}: a diagram in {lang}, not Mermaid" for lang in langs if lang in OTHER_DIAGRAM_LANGUAGES]
    found += [f"{path}: a diagram as an image ({m})" for m in re.findall(rf"!\[[^\]]*\]\(\s*<?({IMAGE})", prose, re.I)]
    found += [f"{path}: a diagram as an image ({m})" for m in
              re.findall(rf"<(?:img|image|object|embed|iframe)\b[^>]*?\b(?:src|data)\s*=\s*[\"']?({IMAGE})", prose, re.I)]
    found += [f"{path}: a link to an image ({m})" for m in re.findall(rf"(?<!!)\[[^\]]*\]\(\s*<?({IMAGE})", prose, re.I)]
    return found


def tracked() -> list[str]:
    out = subprocess.run(["git", "-C", str(ROOT), "ls-files", "-z"], capture_output=True, text=True, check=True).stdout
    return [f for f in out.split("\0") if f and (ROOT / f).is_file()]


class ArtifactsAreMarkdown(unittest.TestCase):
    def test_every_artifact_of_this_repository_is_markdown_with_mermaid_diagrams(self):
        places = [f for f in tracked() if is_artifact_place(f)]
        # Not vacuous: the places hold the SPEC, use cases, decisions, records, items and measurements.
        for kind in ("SPEC.md", "docs/use-cases/", "docs/architecture/", "docs/approvals/", "docs/backlog/", "docs/measurements/"):
            self.assertTrue(any(f == kind or f.startswith(kind) for f in places), kind)
        found = []
        for f in places:
            found += format_findings(f, (ROOT / f).read_text(encoding="utf-8", errors="replace") if f.endswith(".md") else None)
        self.assertEqual(found, [])

    def test_this_repository_has_mermaid_diagrams_to_find(self):
        # A known positive for the fence reader: the use cases carry their diagrams as Mermaid blocks.
        text = (ROOT / "docs/use-cases/UC-001-add-a-managed-product.md").read_text(encoding="utf-8")
        self.assertIn("mermaid", outside_code(text)[1])

    def test_the_image_reader_finds_the_image_of_a_use_case_fixture(self):
        # A known positive for the image reader on a file written by hand: the fixture that keeps its diagram as an image.
        text = (ROOT / "tests/fixtures/use-cases/UC-013-image-diagram.md").read_text(encoding="utf-8")
        self.assertEqual(format_findings("tests/fixtures/use-cases/UC-013-image-diagram.md", text),
                         ["tests/fixtures/use-cases/UC-013-image-diagram.md: a diagram as an image (flow.png)"])

    def test_every_file_agent_m_writes_into_a_product_is_markdown_with_mermaid_diagrams(self):
        written = fixture_product()["written"]
        self.assertGreaterEqual(len(written), 10)
        self.assertEqual([x for f in written for x in format_findings(f["path"], f["content"])], [])

    # ---------------------------------------------------------------- counter-proofs, on planted files

    def test_counter_proof_a_file_that_is_not_markdown(self):
        self.assertEqual(format_findings("docs/approvals/UC-001-0123456789ab.json", '{"kind": "use-case"}'),
                         ["docs/approvals/UC-001-0123456789ab.json: not a Markdown file"])
        self.assertEqual(format_findings("docs/architecture/components.svg", None),
                         ["docs/architecture/components.svg: not a Markdown file"])
        self.assertTrue(is_artifact_place("docs/architecture/components.svg"))
        self.assertTrue(is_artifact_place("docs/jobs/JOB-x.yml"))
        self.assertFalse(is_artifact_place("docs/assets/jobs/propose-backlog-items/job.json"))
        self.assertFalse(is_artifact_place("docs/index.html"))

    def test_counter_proof_a_diagram_that_is_not_mermaid(self):
        text = ("# UC-099 Planted\n\n```plantuml\nAlice -> Bob\n```\n\n~~~ dot\ndigraph { a -> b }\n~~~\n\n"
                "![flow](diagrams/flow.png)\n<img src=\"flow.svg?raw=true\" alt=\"flow\">\n[the diagram](arch.drawio)\n")
        self.assertEqual(format_findings("docs/use-cases/UC-099-planted.md", text), [
            "docs/use-cases/UC-099-planted.md: a diagram in plantuml, not Mermaid",
            "docs/use-cases/UC-099-planted.md: a diagram in dot, not Mermaid",
            "docs/use-cases/UC-099-planted.md: a diagram as an image (diagrams/flow.png)",
            "docs/use-cases/UC-099-planted.md: a diagram as an image (flow.svg?raw=true)",
            "docs/use-cases/UC-099-planted.md: a link to an image (arch.drawio)",
        ])

    def test_counter_proof_mermaid_and_text_about_images_pass(self):
        text = ("```mermaid\nflowchart LR\n  a --> b\n```\n\nNo image such as `![x](flow.png)` or `docs/use-cases/flow.png`.\n\n"
                "````markdown\n![inside a fence](flow.png)\n```plantuml\n````\n\n```text\nUC-007:12: error\n```\n[a page](https://example.org/x)\n")
        self.assertEqual(format_findings("docs/measurements/2026-10-01_x.md", text), [])


if __name__ == "__main__":
    unittest.main()
