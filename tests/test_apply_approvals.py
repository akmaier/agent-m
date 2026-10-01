# Module: MOD-review-core
# Guards: A STALE APPROVAL IS NOT APPLIED; AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL; WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
# Level: unit
"""tools/apply_approvals.py — the workflow half of SPEC §10 — and its twin in the approval engine,
docs/assets/review-core/apply-approvals.mjs (applyApprovals, asked through node). Deterministic, no network.

Guards WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE and A STALE APPROVAL IS NOT APPLIED.
Each test builds a throwaway repository, so nothing here touches the real SPEC.

The twin comparison (ITM-016): both run on copies of the same tree and must leave byte-identical trees and the same report —
on every case the Python tool gets right. Where it does not (FINDINGS F1, F2 and F3 of
docs/measurements/2026-10-01_apply-approvals-in-the-engine.md: it reads the SPEC and the proposal with universal newlines),
the engine keeps the SPEC's rules (A STALE APPROVAL IS NOT APPLIED, THE APPROVED TEXT IS TAKEN VERBATIM) and the twin
comparison is marked as an expected failure with its finding; ITM-017 retires the Python tool and this comparison with it.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import apply_approvals  # noqa: E402
import apply_approvals as ap  # noqa: E402
from jsrun import js  # noqa: E402

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

    def test_readme_with_example_records_is_not_a_record(self):
        # Found end-to-end on 2026-09-23: docs/approvals/README.md documents the record format
        # with example lines and was read as a record.
        (self.r.root / "docs/approvals/README.md").write_text(
            "# Records\n\n```\nkind: spec\nqueue: docs/spec-freigaben/<queue>\nentry: 01\n"
            "proposal: docs/spec-freigaben/<queue>/01-x.md\nblob: <sha>\ntarget: SPEC.md\n"
            "anchor: ## x\nsection: <sha>\n```\n", encoding="utf-8")
        rc, report = ap.apply(self.r.root)
        self.assertEqual((rc, report, self.r.spec()), (0, "", SPEC))

    def test_unknown_queue_is_refused_not_crashed(self):
        self.r.record(queue="docs/spec-freigaben/missing", proposal="docs/spec-freigaben/missing/01-x.md")
        rc, report = ap.apply(self.r.root)
        self.assertEqual((rc, self.r.spec()), (1, SPEC))
        self.assertIn("no index.md", report)

    def test_use_case_records_are_left_alone(self):
        (self.r.root / "docs/approvals/UC-001-aaaaaaaaaaaa.md").write_text(
            "kind: use-case\nfile: docs/use-cases/UC-001-x.md\nblob: " + "a" * 40 + "\n", encoding="utf-8")
        rc, _ = ap.apply(self.r.root)
        self.assertEqual((rc, self.r.spec()), (0, SPEC))


class DashboardCommitTests(unittest.TestCase):
    """AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL: with a token, the dashboard commits the record,
    the SPEC section and the decision row together. The workflow then runs on that commit (it touches
    docs/approvals/) and must not apply the record a second time."""

    def setUp(self):
        self.a, self.b = Repo(), Repo()

    def tearDown(self):
        self.a.tmp.cleanup()
        self.b.tmp.cleanup()

    def dashboard_commit(self, repo: Repo) -> dict:
        """The files the dashboard's planner (docs/assets/review-core.mjs) writes, computed on `repo`."""
        item = {"kind": "spec", "queue": Q, "qname": os.path.basename(Q), "nr": 1, "nn": "01",
                "proposalPath": f"{Q}/01-zwei.md", "proposalBlob": git_hash(PROPOSAL),
                "sectionBlob": repo.section_sha(), "targetPath": "SPEC.md", "anchor": "## 2. Two",
                "bis": None, "needs": []}
        plan = js("const fs = await import('node:fs');"
                  f"const root = {json.dumps(str(repo.root))};"
                  "return core.planAcceptance({ items: [" + json.dumps(item) + "], now: new Date('2026-09-29T16:03:00Z'),"
                  " read: async (p) => fs.existsSync(root + '/' + p) ? fs.readFileSync(root + '/' + p, 'utf8') : null });")
        self.assertEqual(plan["leftOut"], [])
        for f in plan["files"]:
            (repo.root / f["path"]).write_text(f["content"], encoding="utf-8")
        return plan

    def test_dashboard_writes_what_the_workflow_writes(self):
        self.dashboard_commit(self.a)
        name = self.b.record()
        rc, _ = ap.apply(self.b.root)
        self.assertEqual(rc, 0)
        self.assertEqual(self.a.spec(), self.b.spec())
        self.assertEqual([p.name for p in (self.a.root / "docs/approvals").iterdir()], [name])
        strip = lambda t: [l.split("|", 2)[2] for l in t.splitlines() if l.startswith("| 20")]  # noqa: E731
        self.assertEqual(strip(self.a.decisions()), strip(self.b.decisions()))

    def test_record_whose_decision_row_exists_is_skipped(self):
        # After the dashboard's commit the SPEC section no longer has the SHA the record names — it
        # holds the proposal now. Applied again, the workflow would refuse it as stale and fail.
        self.dashboard_commit(self.a)
        spec, dec = self.a.spec(), self.a.decisions()
        rc, report = ap.apply(self.a.root)
        self.assertEqual((rc, report, self.a.spec(), self.a.decisions()), (0, "", spec, dec))


ARC_FILE = "docs/architecture/ARC-001-static-client.md"
MOD_FILE = "docs/architecture/MOD-reader.md"


class ApplierPassesOverArchitectureRecords(unittest.TestCase):
    """Moved from tests/test_approval_records.py (MOD-artifacts) when it was split by module: the applier is MOD-review-core."""
    def test_the_applier_passes_over_architecture_records(self):
        # tools/apply_approvals.py writes SPEC changes only; an architecture record must neither be applied nor refused.
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / "docs" / "approvals").mkdir(parents=True)
            (Path(d) / "docs" / "approvals" / ("ARC-001-" + "a" * 12 + ".md")).write_text(
                "kind: architecture-decision\nfile: " + ARC_FILE + "\nblob: " + "a" * 40 + "\n", encoding="utf-8")
            (Path(d) / "docs" / "approvals" / ("MOD-reader-" + "b" * 12 + ".md")).write_text(
                "kind: module\nfile: " + MOD_FILE + "\nblob: " + "b" * 40 + "\n", encoding="utf-8")
            self.assertEqual(apply_approvals.apply(Path(d)), (0, ""))


# ---------------------------------------------------------------- the twin: tools/apply_approvals.py and applyApprovals (ITM-016)

FIX = Path(__file__).resolve().parent / "fixtures" / "gates"
GQ = "docs/spec-freigaben/2026-10-01a_gates"
GENTRIES = {1: ("01-more.md", "## 2. More"), 2: ("02-last.md", "## 3. Last")}
NOW = dt.datetime(2026, 10, 1, 12, 0, tzinfo=dt.timezone.utc)


class _Clock:
    """Stands in for the datetime module inside tools/apply_approvals.py for one run: its decision row then carries NOW, as
    the engine's does with `now` — so that the two trees can be compared byte for byte."""
    timezone = dt.timezone

    class datetime:
        @staticmethod
        def now(tz=None):
            return NOW


def run_python(root: Path) -> tuple:
    real = ap.dt
    ap.dt = _Clock
    try:
        return ap.apply(root)
    finally:
        ap.dt = real


def run_engine(root: Path) -> dict:
    """applyApprovals on the tree at `root` -> { files, report, refused }, its files written into the tree. The port `read`
    gives a file's text — its bytes decoded as UTF-8, nothing translated — and, for a folder, the names of the files in it."""
    out = js("const fs = await import('node:fs');"
             f"const root = {json.dumps(str(root))}, dec = new TextDecoder('utf-8', {{ fatal: true }});"
             "const read = async (p) => { const f = root + '/' + p; if (!fs.existsSync(f)) return null;"
             " if (fs.statSync(f).isDirectory()) return fs.readdirSync(f).filter((n) => fs.statSync(f + '/' + n).isFile());"
             " return dec.decode(fs.readFileSync(f)); };"
             "return applyApprovals.applyApprovals({ read, now: new Date('2026-10-01T12:00:00Z') });")
    for f in out["files"]:
        (root / f["path"]).parent.mkdir(parents=True, exist_ok=True)
        (root / f["path"]).write_bytes(f["content"].encode("utf-8"))
    return out


def tree(root: Path) -> dict:
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in sorted(root.rglob("*")) if p.is_file()}


def btext(root: Path, path: str) -> str:
    return (root / path).read_bytes().decode("utf-8")


def bwrite(root: Path, path: str, text: str):
    (root / path).parent.mkdir(parents=True, exist_ok=True)
    (root / path).write_bytes(text.encode("utf-8"))


def section_of(root: Path, anchor: str) -> str:
    """The SPEC section beside entry `anchor` as the dashboard showed it: from the file's bytes, no newline translated."""
    return ap.section_text(ap.extract_section(btext(root, "SPEC.md"), anchor))


def grecord(root: Path, nr: int, **over) -> str:
    """The approval record a person commits on GitHub's page for entry `nr` of the gates queue, naming the texts shown."""
    name, anchor = GENTRIES[nr]
    rec = {"kind": "spec", "queue": GQ, "entry": f"{nr:02d}", "proposal": f"{GQ}/{name}",
           "blob": ap.blob_sha(btext(root, f"{GQ}/{name}")), "target": "SPEC.md", "anchor": anchor,
           "section": ap.blob_sha(section_of(root, anchor))}
    rec.update(over)
    file = f"spec-{Path(GQ).name}-{rec['entry']}-{rec['blob'][:12]}.md"
    bwrite(root, f"docs/approvals/{file}", ap.record_text(rec))
    return file


def outside(spec: str, anchor: str, next_heading: str, proposal: str) -> str:
    """The SPEC with the section from `anchor` up to `next_heading` replaced by `proposal` and its one line terminator."""
    body = proposal if proposal.endswith("\n") else proposal + "\n"
    return spec[:spec.index(anchor)] + body + spec[spec.index(next_heading):]


def _replace(path, old, new):
    return lambda r: bwrite(r, path, btext(r, path).replace(old, new, 1))


def _proposal(text):
    return lambda r: bwrite(r, f"{GQ}/01-more.md", text)


def _then(*steps):
    def run(r):
        for s in steps:
            s(r)
    return run


def _dashboard_commit(r: Path):
    """The dashboard's acceptance commit of entry 01 (planAcceptance), written into the tree."""
    files = {p: b.decode("utf-8") for p, b in tree(r).items()}
    item = {"kind": "spec", "queue": GQ, "qname": Path(GQ).name, "nr": 1, "nn": "01", "proposalPath": f"{GQ}/01-more.md",
            "proposalBlob": ap.blob_sha(files[f"{GQ}/01-more.md"]), "sectionBlob": ap.blob_sha(section_of(r, "## 2. More")),
            "targetPath": "SPEC.md", "anchor": "## 2. More", "bis": None, "needs": []}
    plan = js(f"const f = {json.dumps(files)};"
              f"return core.planAcceptance({{ items: [{json.dumps(item)}], now: new Date('2026-10-01T12:00:00Z'),"
              " read: async (p) => (p in f ? f[p] : null) });")
    assert plan["leftOut"] == [], plan["leftOut"]
    for f in plan["files"]:
        bwrite(r, f["path"], f["content"])


def _verbatim_variants() -> dict:
    from test_verbatim import VARIANTS, HEAD  # the byte variants ITM-014 pinned for both writers
    out = {f"proposal with {k}": _then(_proposal(v), lambda r: grecord(r, 1)) for k, v in VARIANTS.items()}
    out["proposal with umlauts and a dash"] = _then(_proposal(HEAD + "Rule two holds — äöü ✓.\n"), lambda r: grecord(r, 1))
    return out


# Each case prepares the tree a workflow run starts from. Expected for every one: both leave the same bytes and the same report.
TWIN_CASES = {
    "nothing approved": lambda r: None,
    "one entry approved": lambda r: grecord(r, 1),
    "two entries of one queue approved": _then(lambda r: grecord(r, 1), lambda r: grecord(r, 2)),
    "the proposal changed after approval": _then(lambda r: grecord(r, 1), _replace(f"{GQ}/01-more.md", "reworded", "re-reworded")),
    "the SPEC section changed after approval": _then(lambda r: grecord(r, 1), _replace("SPEC.md", "Rule two holds", "Rule 2 holds")),
    "one of two records stale, the other applied": _then(lambda r: grecord(r, 1), lambda r: grecord(r, 2),
                                                         _replace(f"{GQ}/01-more.md", "reworded", "re-reworded")),
    "the record's anchor is not the queue's": lambda r: grecord(r, 1, anchor="## 3. Last"),
    "the record's anchor holds a quote": lambda r: grecord(r, 1, anchor="## It's more"),
    "the record's anchor holds both quotes and a backslash": lambda r: grecord(r, 1, anchor="## \"It's\" \\ more"),
    "the proposal is not a file of the queue": lambda r: grecord(r, 1, proposal="SPEC.md"),
    "the proposal climbs out of the queue": lambda r: grecord(r, 1, proposal=f"{GQ}/../x.md"),
    "the queue is not under docs/spec-freigaben/": lambda r: grecord(r, 1, queue="docs/other", proposal="docs/other/01-more.md"),
    "the queue has no index.md": lambda r: grecord(r, 1, queue="docs/spec-freigaben/missing",
                                                   proposal="docs/spec-freigaben/missing/01-more.md"),
    "a key is missing": lambda r: grecord(r, 1, section=""),
    "two keys are missing": lambda r: grecord(r, 1, section="", target=""),
    "the queue has no such entry": lambda r: grecord(r, 1, entry="07"),
    "the proposal no longer exists": _then(lambda r: grecord(r, 1), lambda r: (r / GQ / "01-more.md").unlink()),
    "the anchor stands twice in the SPEC": _then(lambda r: grecord(r, 1),
                                                 lambda r: bwrite(r, "SPEC.md", btext(r, "SPEC.md") + "\n## 2. More\n\nagain\n")),
    "the README documents the record format": lambda r: bwrite(r, "docs/approvals/README.md",
                                                               "# R\n\n```\nkind: spec\nqueue: docs/spec-freigaben/q\nentry: 01\n```\n"),
    "records of a use case, a decision and a module": _then(
        lambda r: bwrite(r, "docs/approvals/UC-001-" + "a" * 12 + ".md",
                         "kind: use-case\nfile: docs/use-cases/UC-001-x.md\nblob: " + "a" * 40 + "\n"),
        lambda r: bwrite(r, "docs/approvals/ARC-001-" + "b" * 12 + ".md",
                         "kind: architecture-decision\nfile: " + ARC_FILE + "\nblob: " + "b" * 40 + "\n"),
        lambda r: bwrite(r, "docs/approvals/MOD-reader-" + "c" * 12 + ".md",
                         "kind: module\nfile: " + MOD_FILE + "\nblob: " + "c" * 40 + "\n"),
        lambda r: grecord(r, 2)),
    "the record was applied by the dashboard's commit": _dashboard_commit,
    "a decisions file that does not exist yet": _then(lambda r: grecord(r, 1), lambda r: (r / GQ / "entscheidungen.md").unlink()),
    "a SPEC without a final newline": _then(lambda r: bwrite(r, "SPEC.md", btext(r, "SPEC.md").rstrip("\n")), lambda r: grecord(r, 2)),
    **_verbatim_variants(),
}


class Product:
    """The gates fixture in a temporary directory, prepared by a case — twice, once for each implementation."""

    def __init__(self, prepare):
        self.tmp = tempfile.TemporaryDirectory()
        self.py, self.en = Path(self.tmp.name) / "python", Path(self.tmp.name) / "engine"
        shutil.copytree(FIX, self.py)
        prepare(self.py)
        shutil.copytree(self.py, self.en)

    def both(self) -> tuple:
        """-> ((rc, report) of the tool, (rc, report) of the engine, the engine's result)."""
        rc, report = run_python(self.py)
        out = run_engine(self.en)
        return (rc, report), (1 if out["refused"] else 0, out["report"]), out


class Twin(unittest.TestCase):
    """applyApprovals writes what tools/apply_approvals.py writes: on the same tree, the same bytes and the same report."""

    def twin(self, prepare, runs: int = 1):
        p = Product(prepare)
        try:
            for _ in range(runs):
                python, engine, _out = p.both()
                self.assertEqual(engine, python)
                self.assertEqual(tree(p.en), tree(p.py))
        finally:
            p.tmp.cleanup()

    def test_the_engine_writes_the_bytes_and_the_report_of_the_python_tool(self):
        for label, prepare in TWIN_CASES.items():
            with self.subTest(label):
                self.twin(prepare)

    def test_a_second_run_writes_nothing_on_either_side(self):
        self.twin(TWIN_CASES["two entries of one queue approved"], runs=2)

    def test_the_cases_apply_refuse_and_pass_over(self):
        # Known positive first (CLAUDE.md §6a.2): the comparison above sees an applied record, a refused one and a run that
        # writes nothing — a twin test that only ever compared two empty reports would compare nothing.
        seen = set()
        for label in ["nothing approved", "one entry approved", "the proposal changed after approval",
                      "the record's anchor holds a quote"]:
            p = Product(TWIN_CASES[label])
            try:
                (rc, report), _engine, out = p.both()
                seen.add((rc, bool(out["files"]), report.split(" — ")[0].split(": ")[-1] if report else ""))
            finally:
                p.tmp.cleanup()
        self.assertEqual(seen, {(0, False, ""), (0, True, "applied"), (1, False, "refused")})


def _cr_outside(r: Path):
    bwrite(r, "SPEC.md", btext(r, "SPEC.md").replace("## 1. Rules", "## 1. Rules\r", 1).replace("Rule one holds.", "Rule one holds.\r", 1))
    grecord(r, 1)


def _crlf_proposal(r: Path):
    from test_verbatim import HEAD
    bwrite(r, f"{GQ}/01-more.md", HEAD.replace("\n", "\r\n") + "Rule two holds with CR LF line ends.\r\n")
    grecord(r, 1)


def _cr_in_section(r: Path):
    bwrite(r, "SPEC.md", btext(r, "SPEC.md").replace("REPLACED-TEXT-OF-RULE-TWO.", "REPLACED-TEXT-OF-RULE-TWO.\r", 1))
    grecord(r, 1)


class EngineKeepsTheBytes(unittest.TestCase):
    """WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE — byte for byte, where the Python tool does not (F1, F2,
    F3): the engine reads a text as its bytes decode, so a CR is a byte like any other."""

    def engine(self, prepare) -> tuple:
        p = Product(prepare)
        try:
            before, proposal = btext(p.en, "SPEC.md"), btext(p.en, f"{GQ}/01-more.md")
            out = run_engine(p.en)
            return out, before, proposal, btext(p.en, "SPEC.md"), btext(p.en, f"{GQ}/entscheidungen.md")
        finally:
            p.tmp.cleanup()

    def test_cr_bytes_outside_the_approved_section_stay(self):
        # Expected: a SPEC whose other sections end lines with CR LF gets entry 01's section replaced, every other byte kept.
        out, before, proposal, after, decisions = self.engine(_cr_outside)
        self.assertEqual(out["refused"], [])
        self.assertIn("\r\n", before[:before.index("## 2. More")])
        self.assertEqual(after, outside(before, "## 2. More", "## 3. Last", proposal))
        self.assertIn("| 1 | uebernommen | approval:", decisions)

    def test_a_proposal_with_crlf_line_ends_is_written_byte_for_byte(self):
        # Expected: the approved proposal is unchanged, so it is written — its CRs included —, not refused as changed.
        out, before, proposal, after, _ = self.engine(_crlf_proposal)
        self.assertEqual(out["refused"], [])
        self.assertTrue(proposal.endswith("\r\n"))
        self.assertEqual(after, outside(before, "## 2. More", "## 3. Last", proposal))

    def test_a_section_with_cr_bytes_that_did_not_change_is_replaced(self):
        # Expected: the section the reviewer saw holds a CR; it did not change, so the approval is not stale and it is replaced.
        out, before, proposal, after, _ = self.engine(_cr_in_section)
        self.assertEqual(out["refused"], [])
        self.assertIn("\r", before[before.index("## 2. More"):before.index("## 3. Last")])
        self.assertEqual(after, outside(before, "## 2. More", "## 3. Last", proposal))

    def test_counter_proof_a_changed_section_with_cr_bytes_is_still_refused(self):
        # The CR is read as a byte both ways: a section that changed after approval is still stale, and nothing is written.
        out, before, _proposal, after, _decisions = self.engine(
            _then(_cr_in_section, _replace("SPEC.md", "Rule two holds", "Rule 2 holds")))
        self.assertEqual((out["files"], after), ([], before))
        self.assertIn("SPEC section changed after approval", out["report"])


class TwinWhereThePythonToolIsWrong(unittest.TestCase):
    """The twin comparison on the cases the Python tool does not get right. Each fails today at its finding, and is to fail
    until ITM-017 retires the Python tool: the engine keeps the SPEC's rule, the tool does not
    (docs/measurements/2026-10-01_apply-approvals-in-the-engine.md)."""

    def twin(self, prepare):
        p = Product(prepare)
        try:
            python, engine, _out = p.both()
            self.assertEqual(engine, python)
            self.assertEqual(tree(p.en), tree(p.py))
        finally:
            p.tmp.cleanup()

    @unittest.expectedFailure
    def test_twin_on_a_spec_with_cr_bytes_outside_the_section(self):
        # FINDING F1: the tool rewrites every CR LF of the SPEC as LF; the engine keeps them.
        self.twin(_cr_outside)

    @unittest.expectedFailure
    def test_twin_on_a_proposal_with_crlf_line_ends(self):
        # FINDING F2: the tool refuses the unchanged proposal as "proposal changed after approval"; the engine writes it.
        self.twin(_crlf_proposal)

    @unittest.expectedFailure
    def test_twin_on_a_section_with_cr_bytes(self):
        # FINDING F3: the tool refuses the unchanged section as "SPEC section changed after approval"; the engine replaces it.
        self.twin(_cr_in_section)


if __name__ == "__main__":
    unittest.main()
