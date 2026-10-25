# Module: MOD-spec-changes
# Guards: NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
# Level: unit
"""SPEC §9 NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT — characterisation tests of ITM-014 (a refactoring job).

The view is given the text that currently holds beside each entry (MOD-spec-changes' entryView, asked through node,
tests/spec_apply.py), and both writers — the dashboard's acceptance commit (acceptEntries) and the instance's workflow
(applyApproved) — write an approved entry only when its approval names that current text by its blob SHA. On the fixture
product tests/fixtures/gates/:

- the current text beside an entry is the whole SPEC section, byte for byte — sub-headings and fenced blocks included —,
  not a part or a summary of it;
- an approval that names no current text (the dashboard's acceptance without a section SHA; a record without `section:`)
  writes nothing;
- where the anchor stands twice in the SPEC, the current text is the first section of that heading (MOD-spec-document's
  sectionText), and an approval that names any other text writes nothing.

A current text that changed after it was shown is refused by both writers in tests/test_apply_approvals.py and
tests/spec-changes-accept.test.mjs; the page that shows it beside the proposal in
tests/dashboard-review-flows.test.mjs. Counter-proofs: docs/measurements/2026-10-01_approval-gates-counter-proofs.md.
"""
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import spec_apply as ap  # noqa: E402

FIX = Path(__file__).resolve().parent / "fixtures" / "gates"
Q = "docs/spec-freigaben/2026-10-01a_gates"
PROPOSAL = f"{Q}/01-more.md"
ANCHOR = "## 2. More"
# Section 2 grown by a sub-heading and a fenced block whose first line looks like the next heading.
GROWN = ("Rule two holds as first written — REPLACED-TEXT-OF-RULE-TWO.\n",
         "Rule two holds as first written — REPLACED-TEXT-OF-RULE-TWO.\n\n### 2.1 Detail\n\nA detail line.\n\n"
         "```\n## 3. Last\n```\n\nThe last line of the section.\n")


class Product:
    def __init__(self, spec_from=None):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name) / "product"
        shutil.copytree(FIX, self.root)
        if spec_from:
            (self.root / "SPEC.md").write_bytes(spec_from(self.text("SPEC.md")).encode("utf-8"))
        self.spec = self.text("SPEC.md")
        self.proposal = self.text(PROPOSAL)

    def text(self, path: str) -> str:
        return (self.root / path).read_bytes().decode("utf-8")

    def current(self, nr: int) -> dict:
        """What the view is given beside entry `nr`: { current: { text, blob } | None, createdBy, state }."""
        return ap.entry_view(self.root, Q, nr)

    def dashboard(self, section_blob) -> tuple:
        """The dashboard's acceptance of entry 01, shown beside the section of `section_blob` -> (refusals, paths written)."""
        return ap.accept(self.root, [{"queue": Q, "entry": 1, "proposalBlob": ap.blob_sha(self.proposal), "sectionBlob": section_blob}])

    def workflow(self, section: str) -> tuple:
        rec = {"kind": "spec", "queue": Q, "entry": "01", "proposal": PROPOSAL, "blob": ap.blob_sha(self.proposal),
               "target": "SPEC.md", "anchor": ANCHOR, "section": section}
        (self.root / "docs/approvals" / f"spec-{Path(Q).name}-01-{rec['blob'][:12]}.md").write_bytes(ap.record_text(rec).encode())
        return ap.apply(self.root)


class ProposalShowsCurrent(unittest.TestCase):
    def test_the_current_text_beside_an_entry_is_the_whole_section(self):
        # Expected: beside entry 01, the SPEC from "## 2. More" up to "## 3. Last" — the sub-heading, the fenced block that
        # looks like the next heading and the section's last line included —, byte for byte; beside entry 02, the SPEC from
        # "## 3. Last" to its end. Nothing else is needed first.
        p = Product(lambda s: s.replace(*GROWN))
        try:
            fenced = p.spec.index("```\n## 3. Last")
            nxt = p.spec.index("## 3. Last", fenced + 10)
            one = p.current(1)
            want = p.spec[p.spec.index(ANCHOR):nxt]
            self.assertEqual(one["current"], {"text": want, "blob": ap.blob_sha(want)})
            self.assertIsNone(one["createdBy"])
            self.assertIn("The last line of the section.", one["current"]["text"])
            self.assertEqual(p.current(2)["current"]["text"], p.spec[nxt:])
        finally:
            p.tmp.cleanup()

    def test_an_approval_that_names_no_current_text_is_not_written(self):
        p = Product()
        try:
            shown = p.current(1)["current"]["text"]
            # Expected: the dashboard's acceptance of an entry that names no current text writes nothing and names the entry.
            refused, paths = p.dashboard(None)
            self.assertEqual(paths, [])
            self.assertEqual([(x["queue"], x["entry"]) for x in refused], [(Q, 1)])
            self.assertEqual(p.text("SPEC.md"), p.spec)
            # Expected: a record without `section:` is refused by the workflow, which writes nothing and says what is missing.
            rc, report = p.workflow("")
            self.assertEqual((rc, p.text("SPEC.md")), (1, p.spec))
            self.assertIn("lacks section", report)
            # Counter-proof: with the current text's SHA, the dashboard writes it.
            refused, paths = p.dashboard(ap.blob_sha(shown))
            self.assertEqual(refused, [])
            self.assertIn("SPEC.md", paths)
        finally:
            p.tmp.cleanup()

    def test_where_the_anchor_stands_twice_the_current_text_is_its_first_section(self):
        # The anchor stands twice: once where it was, once at the end of the SPEC.
        p = Product(lambda s: s + "\n## 2. More\n\nA second section of the same heading.\n")
        try:
            first = ap.section_text(ap.extract_section(p.spec, ANCHOR))
            second = p.spec[p.spec.rindex(ANCHOR):]
            # Expected: the view shows the first section of that heading, byte for byte.
            self.assertEqual(p.current(1)["current"]["text"], first)
            # Expected: an approval that names the other section is refused by both writers, and nothing is written.
            refused, paths = p.dashboard(ap.blob_sha(second))
            self.assertEqual((paths, len(refused)), ([], 1))
            self.assertIn("changed after it was shown", refused[0]["reason"])
            rc, report = p.workflow(ap.blob_sha(second))
            self.assertEqual((rc, p.text("SPEC.md")), (1, p.spec))
            self.assertIn("changed after it was approved", report)
        finally:
            p.tmp.cleanup()


if __name__ == "__main__":
    unittest.main()
