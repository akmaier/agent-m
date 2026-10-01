# Module: MOD-review-core
# Guards: NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
# Level: unit
"""SPEC §9 NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT — characterisation tests of ITM-014 (a refactoring job).

The engine gives the view the text that currently holds beside each entry (docs/assets/review-core.mjs sectionForEntry,
asked through node), and both writers — the dashboard's acceptance commit (planAcceptance) and the instance's workflow
(tools/apply_approvals.py) — write an approved entry only when its approval names that current text by its blob SHA. On
the fixture product tests/fixtures/gates/:

- the current text beside an entry is the whole SPEC section, byte for byte — sub-headings and fenced blocks included —,
  not a part or a summary of it;
- an approval that names no current text (the dashboard's item without a section SHA; a record without `section:`) writes
  nothing;
- where the current text cannot be told — the anchor stands twice in the SPEC —, none is shown and nothing is written; the
  first occurrence is not taken.

A current text that changed after it was shown is refused by both writers in tests/test_apply_approvals.py and
tests/review-core.d/dashboard-writes.test.mjs; the page that shows it beside the proposal in
tests/dashboard-review-flows.test.mjs. Counter-proofs: docs/measurements/2026-10-01_approval-gates-counter-proofs.md.
"""
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import apply_approvals as ap  # noqa: E402
from jsrun import js  # noqa: E402

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

    def files(self) -> dict:
        return {p.relative_to(self.root).as_posix(): p.read_bytes().decode("utf-8") for p in self.root.rglob("*") if p.is_file()}

    def current(self, nr: int) -> dict:
        """What the engine gives the view beside entry `nr`: { current, needs } or { error }."""
        entries = [{"nr": 1, "anchor": "## 2. More", "bis": None, "proposalText": self.proposal},
                   {"nr": 2, "anchor": "## 3. Last", "bis": None, "proposalText": self.text(f"{Q}/02-last.md")}]
        return js(f"return core.sectionForEntry({{ specText: {json.dumps(self.spec)}, entries: {json.dumps(entries)}, nr: {nr} }});")

    def dashboard(self, section_blob) -> dict:
        item = {"kind": "spec", "queue": Q, "qname": Path(Q).name, "nr": 1, "nn": "01", "proposalPath": PROPOSAL,
                "proposalBlob": ap.blob_sha(self.proposal), "sectionBlob": section_blob, "targetPath": "SPEC.md",
                "anchor": ANCHOR, "bis": None, "needs": []}
        return js(f"const f = {json.dumps(self.files())};"
                  f"return core.planAcceptance({{ items: [{json.dumps(item)}], now: new Date('2026-10-01T12:00:00Z'),"
                  " read: async (p) => (p in f ? f[p] : null) });")

    def workflow(self, section: str) -> tuple:
        rec = {"kind": "spec", "queue": Q, "entry": "01", "proposal": PROPOSAL, "blob": ap.blob_sha(self.proposal),
               "target": "SPEC.md", "anchor": ANCHOR, "section": section}
        (self.root / "docs/approvals" / f"spec-{Path(Q).name}-01-{rec['blob'][:12]}.md").write_bytes(ap.record_text(rec).encode())
        return ap.apply(self.root)


class ProposalShowsCurrent(unittest.TestCase):
    def test_the_current_text_beside_an_entry_is_the_whole_section(self):
        # Expected: beside entry 01, the SPEC from "## 2. More" up to "## 3. Last" — the sub-heading, the fenced block that
        # looks like the next heading and the section's last line included —, with one final newline; beside entry 02, the
        # SPEC from "## 3. Last" to its end. Nothing else is needed first.
        p = Product(lambda s: s.replace(*GROWN))
        try:
            fenced = p.spec.index("```\n## 3. Last")
            nxt = p.spec.index("## 3. Last", fenced + 10)
            one = p.current(1)
            self.assertEqual(one, {"current": p.spec[p.spec.index(ANCHOR):nxt].rstrip("\n") + "\n", "needs": [], "spec": p.spec})
            self.assertIn("The last line of the section.", one["current"])
            two = p.current(2)
            self.assertEqual(two["current"], p.spec[nxt:])
        finally:
            p.tmp.cleanup()

    def test_an_approval_that_names_no_current_text_is_not_written(self):
        p = Product()
        try:
            shown = ap.section_text(ap.extract_section(p.spec, ANCHOR))
            # Expected: the dashboard's acceptance of an item that names no current text writes nothing and names the entry.
            plan = p.dashboard(None)
            self.assertEqual(plan["files"], [])
            self.assertEqual([x["label"] for x in plan["leftOut"]], ["2026-10-01a_gates 01"])
            # Counter-proof: with the current text's SHA, it is written.
            self.assertEqual([x["path"] for x in p.dashboard(ap.blob_sha(shown))["files"] if x["path"] == "SPEC.md"], ["SPEC.md"])
            # Expected: a record without `section:` is refused by the workflow, which writes nothing and says what is missing.
            rc, report = p.workflow("")
            self.assertEqual((rc, p.text("SPEC.md")), (1, p.spec))
            self.assertIn("missing section", report)
        finally:
            p.tmp.cleanup()

    def test_a_current_text_that_cannot_be_told_is_not_guessed(self):
        # The anchor stands twice: once where it was, once at the end of the SPEC.
        p = Product(lambda s: s + "\n## 2. More\n\nA second section of the same heading.\n")
        try:
            first = ap.blob_sha("## 2. More\n\n" + p.spec.split("## 2. More\n\n", 1)[1].split("\n## 3. Last")[0].rstrip("\n") + "\n")
            # Expected: the engine shows no current text, and says why.
            self.assertEqual(p.current(1), {"error": "anchor found 2 times instead of exactly once", "needs": []})
            # Expected: neither writer writes, both name the anchor — with the first occurrence's SHA as the text shown.
            plan = p.dashboard(first)
            self.assertEqual(plan["files"], [])
            self.assertIn("anchor found 2 times", plan["leftOut"][0]["reason"])
            rc, report = p.workflow(first)
            self.assertEqual((rc, p.text("SPEC.md")), (1, p.spec))
            self.assertIn("anchor found 2 times", report)
        finally:
            p.tmp.cleanup()


if __name__ == "__main__":
    unittest.main()
