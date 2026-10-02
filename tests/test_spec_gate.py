# Module: MOD-review-core
# Guards: A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN
# Level: unit
"""SPEC §9 A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN — characterisation tests of ITM-014 (a refactoring job).

The SPEC is written in two places, both MOD-review-core: the dashboard's acceptance commit (docs/assets/review-core.mjs
planAcceptance, asked through node) and the instance's workflow (tools/apply_approvals.py). What they keep today, on the
fixture product tests/fixtures/gates/ (a queue of two entries, 01 and 02, against SPEC.md):

- the workflow writes nothing for an entry no approval record names — an open queue leaves every byte of the tree as it was;
- with a record for 01 only, the workflow writes 01 and leaves 02's section and decisions untouched;
- an accepted entry changes no byte of the SPEC outside its own section — the dashboard keeps that on a SPEC with CR
  bytes elsewhere; the workflow does not (FINDING F1, expected to fail).

What the dashboard writes when one entry of two is accepted is pinned in tests/review-core.d/dashboard-writes.test.mjs
(the whole SPEC compared). Counter-proofs: docs/measurements/2026-10-01_approval-gates-counter-proofs.md.
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
ENTRIES = {1: ("01-more.md", "## 2. More"), 2: ("02-last.md", "## 3. Last")}


def outside(spec: str, anchor: str, next_heading: str, proposal: str) -> str:
    """The SPEC with the section from `anchor` up to `next_heading` replaced by `proposal`, every other byte as it was."""
    return spec[:spec.index(anchor)] + proposal + spec[spec.index(next_heading):]


def tree(root: Path) -> dict:
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in sorted(root.rglob("*")) if p.is_file()}


class Product:
    """The fixture product in a temporary directory."""

    def __init__(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name) / "product"
        shutil.copytree(FIX, self.root)

    def text(self, path: str) -> str:
        return (self.root / path).read_bytes().decode("utf-8")

    def write(self, path: str, text: str):
        (self.root / path).write_bytes(text.encode("utf-8"))

    def section(self, anchor: str) -> str:
        return ap.section_text(ap.extract_section(self.text("SPEC.md"), anchor))

    def record(self, nr: int) -> str:
        """The approval record a person commits on GitHub's page for entry `nr`, naming the texts shown."""
        name, anchor = ENTRIES[nr]
        rec = {"kind": "spec", "queue": Q, "entry": f"{nr:02d}", "proposal": f"{Q}/{name}",
               "blob": ap.blob_sha(self.text(f"{Q}/{name}")), "target": "SPEC.md", "anchor": anchor,
               "section": ap.blob_sha(self.section(anchor))}
        file = f"spec-{Path(Q).name}-{nr:02d}-{rec['blob'][:12]}.md"
        self.write(f"docs/approvals/{file}", ap.record_text(rec))
        return file

    def item(self, nr: int) -> dict:
        """What the dashboard showed for entry `nr`: the proposal and the section beside it, by their blob SHAs."""
        name, anchor = ENTRIES[nr]
        return {"kind": "spec", "queue": Q, "qname": Path(Q).name, "nr": nr, "nn": f"{nr:02d}", "proposalPath": f"{Q}/{name}",
                "proposalBlob": ap.blob_sha(self.text(f"{Q}/{name}")), "sectionBlob": ap.blob_sha(self.section(anchor)),
                "targetPath": "SPEC.md", "anchor": anchor, "bis": None, "needs": []}

    def plan(self, items: list) -> dict:
        """The files of the dashboard's acceptance commit, computed by the engine on this tree."""
        files = {p: b.decode("utf-8") for p, b in tree(self.root).items()}
        return js(f"const f = {json.dumps(files)};"
                  f"return core.planAcceptance({{ items: {json.dumps(items)}, now: new Date('2026-10-01T12:00:00Z'),"
                  " read: async (p) => (p in f ? f[p] : null) });")


class SpecGate(unittest.TestCase):
    def setUp(self):
        self.p = Product()

    def tearDown(self):
        self.p.tmp.cleanup()

    def test_an_open_queue_is_not_written_by_the_workflow(self):
        # Expected: with both entries open and no approval record, the workflow reports nothing and changes no byte.
        before = tree(self.p.root)
        self.assertEqual(ap.apply(self.p.root), (0, ""))
        self.assertEqual(tree(self.p.root), before)
        # Counter-proof: the same tree with a record for entry 01 is written.
        self.p.record(1)
        rc, report = ap.apply(self.p.root)
        self.assertEqual(rc, 0, report)
        self.assertIn("APPROVED-WORDING-OF-RULE-TWO", self.p.text("SPEC.md"))

    def test_only_the_entry_a_record_names_is_written_by_the_workflow(self):
        # Expected: a record for 01 writes 01's section and one decision row naming that record; 02's section keeps its current
        # text, its proposal is nowhere in the SPEC, and no row names 02.
        name = self.p.record(1)
        rc, report = ap.apply(self.p.root)
        self.assertEqual(rc, 0, report)
        spec = self.p.text("SPEC.md")
        self.assertIn("CURRENT-TEXT-OF-RULE-THREE", spec)
        self.assertNotIn("OPEN-WORDING-OF-RULE-THREE", spec)
        rows = [l for l in self.p.text(f"{Q}/entscheidungen.md").splitlines() if l.startswith("| 20")]
        self.assertEqual([r.split("|")[2:5] for r in rows], [[" 1 ", " uebernommen ", f" approval:{name} "]])

    def test_the_dashboard_changes_no_byte_outside_the_accepted_section(self):
        # Expected: on a SPEC whose other sections end their lines with CR LF, accepting entry 01 on the dashboard writes a SPEC
        # equal to the old one with only 01's section replaced — every other byte, the CRs included, as it was.
        crlf = self.p.text("SPEC.md").replace("## 1. Rules", "## 1. Rules\r", 1).replace("Rule one holds.", "Rule one holds.\r", 1)
        self.p.write("SPEC.md", crlf)
        expected = outside(crlf, "## 2. More", "## 3. Last", self.p.text(f"{Q}/01-more.md"))
        self.assertNotEqual(expected, crlf)
        plan = self.p.plan([self.p.item(1)])
        self.assertEqual(plan["leftOut"], [])
        written = next(f["content"] for f in plan["files"] if f["path"] == "SPEC.md")
        self.assertEqual(written, expected)

    @unittest.expectedFailure
    def test_the_workflow_changes_no_byte_outside_the_approved_section(self):
        # FINDING F1: tools/apply_approvals.py reads SPEC.md with read_text() — universal newlines — and writes it back, so a
        # SPEC with CR LF line ends anywhere is rewritten with LF throughout: bytes of sections nobody approved change.
        # Expected: as for the dashboard above — only 01's section is replaced, every other byte stays.
        crlf = self.p.text("SPEC.md").replace("## 1. Rules", "## 1. Rules\r", 1).replace("Rule one holds.", "Rule one holds.\r", 1)
        self.p.write("SPEC.md", crlf)
        expected = outside(crlf, "## 2. More", "## 3. Last", self.p.text(f"{Q}/01-more.md"))
        self.p.record(1)
        rc, report = ap.apply(self.p.root)
        self.assertEqual(rc, 0, report)
        self.assertEqual(self.p.text("SPEC.md"), expected)


if __name__ == "__main__":
    unittest.main()
