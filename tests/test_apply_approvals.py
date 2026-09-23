"""tools/apply_approvals.py — the workflow half of SPEC §10. Deterministic, no network.

Guards AN ACCEPTED SPEC CHANGE IS WRITTEN BY A WORKFLOW and A STALE APPROVAL IS NOT APPLIED.
Each test builds a throwaway repository, so nothing here touches the real SPEC.
"""
from __future__ import annotations

import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import apply_approvals as ap  # noqa: E402

SPEC = """# S

**VERBINDLICH (SPEC)**

## 1. One

old one
## 2. Two

old two
"""
Q = "docs/spec-freigaben/2026-09-24_x"
PROPOSAL = "## 2. Two\n\nnew two, approved verbatim — äöü\n"


def git_hash(data: str) -> str:
    return subprocess.run(["git", "hash-object", "--stdin"], input=data.encode(),
                          capture_output=True, check=True).stdout.decode().strip()


class Repo:
    def __init__(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / Q).mkdir(parents=True)
        (self.root / "docs/approvals").mkdir(parents=True)
        (self.root / "SPEC.md").write_text(SPEC, encoding="utf-8")
        (self.root / Q / "index.md").write_text(
            "**Zieldatei aller Einträge:** `products/agent-m/SPEC.md`\n\n"
            "| Nr | Datei | Anker | bis | Commits |\n|---|---|---|---|---|\n"
            "| 01 | `SPEC.md` | ## 2. Two | — | — |\n", encoding="utf-8")
        (self.root / Q / "01-zwei.md").write_text(PROPOSAL, encoding="utf-8")
        (self.root / Q / "entscheidungen.md").write_text("# D\n\n", encoding="utf-8")

    def section_sha(self):
        return ap.blob_sha(ap.section_text(ap.extract_section((self.root / "SPEC.md").read_text(), "## 2. Two")))

    def record(self, **over):
        rec = {"kind": "spec", "queue": Q, "entry": "01", "proposal": f"{Q}/01-zwei.md",
               "blob": git_hash(PROPOSAL), "target": "SPEC.md", "anchor": "## 2. Two",
               "section": self.section_sha()}
        rec.update(over)
        name = f"spec-{os.path.basename(Q)}-01-{rec['blob'][:12]}.md"
        (self.root / "docs/approvals" / name).write_text(ap.record_text(rec), encoding="utf-8")
        return name

    def spec(self):
        return (self.root / "SPEC.md").read_text(encoding="utf-8")

    def decisions(self):
        return (self.root / Q / "entscheidungen.md").read_text(encoding="utf-8")


class ApplyTests(unittest.TestCase):
    def setUp(self):
        self.r = Repo()

    def tearDown(self):
        self.r.tmp.cleanup()

    def test_blob_sha_equals_git(self):
        for s in ["", "a\n", "äöü — ✓\n", "x" * 3000]:
            self.assertEqual(ap.blob_sha(s), git_hash(s))

    def test_approved_proposal_is_written_verbatim(self):
        name = self.r.record()
        rc, report = ap.apply(self.r.root)
        self.assertEqual(rc, 0, report)
        self.assertEqual(self.r.spec(), "# S\n\n**VERBINDLICH (SPEC)**\n\n## 1. One\n\nold one\n" + PROPOSAL)
        self.assertIn(f"| 1 | uebernommen | approval:{name} |", self.r.decisions())

    def test_second_run_changes_nothing(self):
        self.r.record()
        ap.apply(self.r.root)
        spec, dec = self.r.spec(), self.r.decisions()
        rc, _ = ap.apply(self.r.root)
        self.assertEqual((rc, self.r.spec(), self.r.decisions()), (0, spec, dec))

    def test_stale_proposal_is_not_applied(self):
        self.r.record()
        (self.r.root / Q / "01-zwei.md").write_text(PROPOSAL + "edited after approval\n", encoding="utf-8")
        rc, report = ap.apply(self.r.root)
        self.assertEqual(rc, 1)
        self.assertEqual(self.r.spec(), SPEC)
        self.assertNotIn("uebernommen", self.r.decisions())
        self.assertIn("proposal changed", report)

    def test_stale_section_is_not_applied(self):
        self.r.record()
        (self.r.root / "SPEC.md").write_text(SPEC.replace("old two", "changed meanwhile"), encoding="utf-8")
        rc, report = ap.apply(self.r.root)
        self.assertEqual(rc, 1)
        self.assertIn("changed meanwhile", self.r.spec())
        self.assertIn("SPEC section changed", report)

    def test_record_anchor_must_match_the_queue(self):
        self.r.record(anchor="## 1. One")
        rc, report = ap.apply(self.r.root)
        self.assertEqual((rc, self.r.spec()), (1, SPEC))
        self.assertIn("anchor", report)

    def test_record_outside_a_queue_is_refused(self):
        self.r.record(proposal="SPEC.md")
        rc, report = ap.apply(self.r.root)
        self.assertEqual((rc, self.r.spec()), (1, SPEC))
        self.assertIn("proposal", report)

    def test_use_case_records_are_left_alone(self):
        (self.r.root / "docs/approvals/UC-001-aaaaaaaaaaaa.md").write_text(
            "kind: use-case\nfile: docs/use-cases/UC-001-x.md\nblob: " + "a" * 40 + "\n", encoding="utf-8")
        rc, _ = ap.apply(self.r.root)
        self.assertEqual((rc, self.r.spec()), (0, SPEC))


if __name__ == "__main__":
    unittest.main()
