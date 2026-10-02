# Module: MOD-review-core
# Guards: THE REPLACED TEXT STAYS REACHABLE
# Level: unit
"""SPEC §9 THE REPLACED TEXT STAYS REACHABLE — characterisation tests of ITM-014 (a refactoring job).

A replaced SPEC section stays reachable through the git history, and no second copy is kept in the working tree. Both
writers of an approved entry — the dashboard's acceptance commit (docs/assets/review-core.mjs planAcceptance, asked through
node) and the instance's workflow (tools/apply_approvals.py) — run here in a real git repository made from the fixture
product tests/fixtures/gates/. Expected for each route, after the commit that writes entry 01:

- the commit changes SPEC.md, the queue's entscheidungen.md and — on the dashboard's route — adds the approval record;
  nothing else;
- no file of the working tree holds the replaced section's text — no copy beside the SPEC, no `ersetzt/` folder;
- the replaced text is found from the history alone: the decision row names the approval record, the record names the anchor
  and the blob SHA of the section the reviewer saw, and that section, read with `git show <commit>^:SPEC.md`, hashes to it.

Counter-proofs: docs/measurements/2026-10-01_approval-gates-counter-proofs.md.
"""
import json
import os
import re
import shutil
import subprocess
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
MARK = "REPLACED-TEXT-OF-RULE-TWO"  # a line only the replaced section holds
ENV = {**os.environ, "GIT_AUTHOR_NAME": "reviewer", "GIT_AUTHOR_EMAIL": "reviewer@example.org",
       "GIT_COMMITTER_NAME": "reviewer", "GIT_COMMITTER_EMAIL": "reviewer@example.org", "GIT_CONFIG_NOSYSTEM": "1"}


class Repo:
    """The fixture product as a git repository with one commit."""

    def __init__(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name) / "product"
        shutil.copytree(FIX, self.root)
        self.git("init", "-q")
        self.commit("the product, with its open queue")
        self.spec = self.text("SPEC.md")
        self.section = ap.section_text(ap.extract_section(self.spec, ANCHOR))
        assert MARK in self.section

    def git(self, *args) -> str:
        cmd = ["git", "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", "-c", "init.defaultBranch=main", *args]
        return subprocess.run(cmd, cwd=self.root, env=ENV, capture_output=True, check=True).stdout.decode("utf-8")

    def commit(self, message: str):
        self.git("add", "-A")
        self.git("commit", "-q", "-m", message)

    def text(self, path: str) -> str:
        return (self.root / path).read_bytes().decode("utf-8")

    def changed_by_head(self) -> list:
        return sorted(self.git("diff", "--name-only", "HEAD^", "HEAD").split())

    def holding(self, needle: str) -> list:
        """Every file of the working tree whose text holds `needle`."""
        return sorted(p.relative_to(self.root).as_posix() for p in self.root.rglob("*")
                      if p.is_file() and ".git" not in p.relative_to(self.root).parts and needle in p.read_bytes().decode("utf-8", "replace"))

    def replaced_from_history(self) -> str:
        """The text replaced by HEAD's decision, found from the history alone: row -> record -> anchor and SHA -> parent's SPEC."""
        rows = re.findall(r"\|\s*approval:([^\s|]+)\s*\|", self.text(f"{Q}/entscheidungen.md"))
        assert len(rows) == 1, rows
        rec = ap.parse_record(self.text(f"docs/approvals/{rows[0]}"))
        before = self.git("show", f"HEAD^:{rec['target']}")
        text = ap.section_text(ap.extract_section(before, rec["anchor"]))
        assert ap.blob_sha(text) == rec["section"], "the text found is the one the record names"
        return text


class ReplacedInHistory(unittest.TestCase):
    def setUp(self):
        self.r = Repo()

    def tearDown(self):
        self.r.tmp.cleanup()

    def check_after(self, changed: list):
        self.assertNotIn(MARK, self.r.text("SPEC.md"), "the section is replaced")
        self.assertEqual(self.r.changed_by_head(), changed)
        self.assertEqual(self.r.holding(MARK), [], "no copy of the replaced text in the working tree")
        self.assertEqual(self.r.replaced_from_history(), self.r.section)

    def test_the_workflow_leaves_the_replaced_text_in_the_history_only(self):
        # The person commits the approval record on GitHub's page; the workflow writes the section and commits.
        rec = {"kind": "spec", "queue": Q, "entry": "01", "proposal": PROPOSAL, "blob": ap.blob_sha(self.r.text(PROPOSAL)),
               "target": "SPEC.md", "anchor": ANCHOR, "section": ap.blob_sha(self.r.section)}
        (self.r.root / "docs/approvals" / f"spec-{Path(Q).name}-01-{rec['blob'][:12]}.md").write_bytes(ap.record_text(rec).encode())
        self.r.commit("approve 01")
        rc, report = ap.apply(self.r.root)
        self.assertEqual(rc, 0, report)
        self.r.commit("apply approved SPEC changes")
        self.check_after(["SPEC.md", f"{Q}/entscheidungen.md"])

    def test_the_dashboard_leaves_the_replaced_text_in_the_history_only(self):
        # One acceptance commit with the engine's files: the record, the section and the decision row.
        files = {p.relative_to(self.r.root).as_posix(): p.read_bytes().decode("utf-8") for p in self.r.root.rglob("*")
                 if p.is_file() and ".git" not in p.relative_to(self.r.root).parts}
        item = {"kind": "spec", "queue": Q, "qname": Path(Q).name, "nr": 1, "nn": "01", "proposalPath": PROPOSAL,
                "proposalBlob": ap.blob_sha(self.r.text(PROPOSAL)), "sectionBlob": ap.blob_sha(self.r.section),
                "targetPath": "SPEC.md", "anchor": ANCHOR, "bis": None, "needs": []}
        plan = js(f"const f = {json.dumps(files)};"
                  f"return core.planAcceptance({{ items: [{json.dumps(item)}], now: new Date('2026-10-01T12:00:00Z'),"
                  " read: async (p) => (p in f ? f[p] : null) });")
        self.assertEqual(plan["leftOut"], [])
        for f in plan["files"]:
            (self.r.root / f["path"]).parent.mkdir(parents=True, exist_ok=True)
            (self.r.root / f["path"]).write_bytes(f["content"].encode("utf-8"))
        self.r.commit("accept 01")
        record = f"docs/approvals/spec-{Path(Q).name}-01-{item['proposalBlob'][:12]}.md"
        self.check_after(sorted(["SPEC.md", f"{Q}/entscheidungen.md", record]))


if __name__ == "__main__":
    unittest.main()
