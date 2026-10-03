# Module: MOD-review-core
# Guards: THE APPROVED TEXT IS TAKEN VERBATIM
# Level: unit
"""SPEC §9 THE APPROVED TEXT IS TAKEN VERBATIM — characterisation tests of ITM-014 (a refactoring job).

Both writers of an approved SPEC entry — the dashboard's acceptance commit (docs/assets/review-core.mjs planAcceptance,
asked through node) and the instance's workflow (tools/apply_approvals.py) — on the fixture product tests/fixtures/gates/,
with the proposal of entry 01 rewritten to hold the bytes a formatter, an editor or a normaliser would touch: two trailing
spaces (a Markdown line break), a tab, a no-break space, a non-breaking hyphen, a line separator, a character outside the
Basic Multilingual Plane, a decomposed accent, and no final newline. Expected for each: the SPEC is the old one with the
section replaced by the proposal byte for byte — the proposal's line terminator being its one final newline — and both
writers write the same bytes.

The proposal with umlauts and a dash of tests/test_apply_approvals.py and the dashboard's whole-SPEC comparisons in
tests/review-core.d/dashboard-writes.test.mjs stay as they are; this file adds the bytes they do not hold.
One behaviour is not pinned as correct: a proposal with CR LF line ends (the dashboard writes it as it is; the workflow
refuses it, which writes no other text either — the refusal is reported with the pull request). The blank lines that end a
proposal are the separator, not its text (finding V1 of ITM-014, settled as the Product Owner's reading at the sprint 03
planning, 2026-10-02; ITM-159). Counter-proofs: docs/measurements/2026-10-01_approval-gates-counter-proofs.md,
docs/measurements/2026-10-03_blank-lines-ending-a-proposal-counter-proofs.md.
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
ANCHOR, NEXT = "## 2. More", "## 3. Last"

HEAD = "## 2. More\n\n**RULE TWO** *(PO, 2026-10-01, reworded 2026-10-02)*\n"
VARIANTS = {
    "two trailing spaces, a Markdown line break": HEAD + "Rule two holds  \nacross a line break.\n",
    "a tab": HEAD + "Rule two holds:\n\tindented by a tab.\n",
    "a no-break space": HEAD + "Rule two holds for 5 MB.\n",
    "a non-breaking hyphen": HEAD + "Rule two holds for zuv‑statistik@fau.de.\n",
    "a line separator inside a line": HEAD + "Rule two holds on one line.\n",
    "a character outside the BMP": HEAD + "Rule two holds for \U0001D538 and \U0001F512.\n",
    "a decomposed accent, not normalised": HEAD + "Rule two holds for the café.\n",
    "no final newline": HEAD + "Rule two holds without a final newline.",
}


def outside(spec: str, proposal: str) -> str:
    """The SPEC with the section from ANCHOR up to NEXT replaced by `proposal` and its one line terminator."""
    body = proposal if proposal.endswith("\n") else proposal + "\n"
    return spec[:spec.index(ANCHOR)] + body + spec[spec.index(NEXT):]


class Product:
    def __init__(self, proposal: str):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name) / "product"
        shutil.copytree(FIX, self.root)
        (self.root / PROPOSAL).write_bytes(proposal.encode("utf-8"))
        self.spec = self.text("SPEC.md")
        self.section = ap.section_text(ap.extract_section(self.spec, ANCHOR))
        self.proposal = proposal

    def text(self, path: str) -> str:
        return (self.root / path).read_bytes().decode("utf-8")

    def workflow(self) -> tuple:
        """The person's approval record committed on GitHub's page, then the workflow -> (rc, report, SPEC after)."""
        rec = {"kind": "spec", "queue": Q, "entry": "01", "proposal": PROPOSAL, "blob": ap.blob_sha(self.proposal),
               "target": "SPEC.md", "anchor": ANCHOR, "section": ap.blob_sha(self.section)}
        (self.root / "docs/approvals" / f"spec-{Path(Q).name}-01-{rec['blob'][:12]}.md").write_bytes(ap.record_text(rec).encode())
        rc, report = ap.apply(self.root)
        return rc, report, self.text("SPEC.md")

    def dashboard(self) -> tuple:
        """The dashboard's acceptance commit of entry 01 as shown -> (left out, SPEC it writes or None)."""
        files = {p.relative_to(self.root).as_posix(): p.read_bytes().decode("utf-8") for p in self.root.rglob("*") if p.is_file()}
        item = {"kind": "spec", "queue": Q, "qname": Path(Q).name, "nr": 1, "nn": "01", "proposalPath": PROPOSAL,
                "proposalBlob": ap.blob_sha(self.proposal), "sectionBlob": ap.blob_sha(self.section), "targetPath": "SPEC.md",
                "anchor": ANCHOR, "bis": None, "needs": []}
        plan = js(f"const f = {json.dumps(files)};"
                  f"return core.planAcceptance({{ items: [{json.dumps(item)}], now: new Date('2026-10-01T12:00:00Z'),"
                  " read: async (p) => (p in f ? f[p] : null) });")
        return plan["leftOut"], next((f["content"] for f in plan["files"] if f["path"] == "SPEC.md"), None)


class Verbatim(unittest.TestCase):
    def test_both_writers_write_the_approved_text_byte_for_byte(self):
        for label, proposal in VARIANTS.items():
            with self.subTest(label):
                p = Product(proposal)
                try:
                    want = outside(p.spec, proposal)
                    left_out, by_dashboard = p.dashboard()
                    self.assertEqual(left_out, [])
                    self.assertEqual(by_dashboard, want, f"dashboard: {label}")
                    rc, report, by_workflow = p.workflow()
                    self.assertEqual(rc, 0, report)
                    self.assertEqual(by_workflow, want, f"workflow: {label}")
                finally:
                    p.tmp.cleanup()

    def test_cr_bytes_of_a_proposal_are_never_written_reformulated(self):
        # Expected: the dashboard writes a proposal with CR LF line ends as it is, CRs included; the workflow either writes it
        # as it is or writes nothing — never the proposal with its line ends changed.
        proposal = HEAD.replace("\n", "\r\n") + "Rule two holds with CR LF line ends.\r\n"
        p = Product(proposal)
        try:
            left_out, by_dashboard = p.dashboard()
            self.assertEqual(left_out, [])
            self.assertEqual(by_dashboard, outside(p.spec, proposal))
            rc, report, by_workflow = p.workflow()
            self.assertIn(by_workflow, (p.spec, outside(p.spec, proposal)), report)
        finally:
            p.tmp.cleanup()

    def test_blank_lines_at_the_end_of_a_proposal_are_written(self):
        """The blank lines that end an approved proposal are the separator, not its text.

        The Product Owner's reading, sprint 03 planning, 2026-10-02 (ITM-159; finding V1 of ITM-014): the approved text is
        the proposal's content; the blank lines that end a proposal file are the separator between SPEC sections, as the
        heading's position is the SPEC's own layout. THE APPROVED TEXT IS TAKEN VERBATIM holds when the content is written
        byte for byte and the section keeps its one line break at its end — so the SPEC's bytes and the current text the
        next proposal is shown against (extractSection) do not differ while no word changed (NO PROPOSAL WITHOUT THE
        CURRENT TEXT BESIDE IT). A line break inside the content is kept: two trailing spaces, and a line that ends the
        text before a blank line.
        Expected, for a proposal ending in one and in two blank lines: the SPEC is the old one with the section replaced by
        the content and one line break, byte for byte, on both writers.
        """
        content = (HEAD + "Rule two holds  \nacross a line break.\n"
                   "A line that ends the text before a blank line.\n\nA second paragraph after it.")
        for blank in (1, 2):
            proposal = content + "\n" + "\n" * blank
            with self.subTest(blank_lines=blank):
                p = Product(proposal)
                try:
                    want = outside(p.spec, content + "\n")
                    self.assertIn(content + "\n## 3. Last", want)
                    left_out, by_dashboard = p.dashboard()
                    self.assertEqual(left_out, [])
                    self.assertEqual(by_dashboard, want, "dashboard")
                    rc, report, by_workflow = p.workflow()
                    self.assertEqual(rc, 0, report)
                    self.assertEqual(by_workflow, want, "workflow")
                finally:
                    p.tmp.cleanup()

if __name__ == "__main__":
    unittest.main()
