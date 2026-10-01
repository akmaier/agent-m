# Module: MOD-artifacts
# Guards: THE NAME IS THE ID AND IT SURVIVES
# Level: unit
"""SPEC §1 THE NAME IS THE ID AND IT SURVIVES — an identifier travels with its artifact when the artifact
moves between sections or files, and a withdrawn identifier is never reused. Check: an identifier present in
an earlier version and absent now must carry a withdrawal note.

MOD-artifacts identity.stabilityProblems(earlier, later) compares two versions of a repository, each given as
{ path: text }. The two versions are the fixture repository tests/fixtures/identity/v1/ and v2/: between them
a requirement moved to another section, a use case's file was renamed, a module was withdrawn with its note
and a test case moved to another file — the known positive. Each counter-proof breaks a copy of v2.
The withdrawal note is the one the SPEC's form gives a requirement (its source says withdrawn, a line
*Withdrawn:* says why) and the one ARC-020 decision 4 gives a decision or module (`withdrawn:` in the front
matter, the reason under ## Withdrawn).
"""
import json
import unittest
from pathlib import Path

from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "identity"
RULE = "THE NAME IS THE ID AND IT SURVIVES"


def version(name: str) -> dict:
    """{ path: text } of one version of the fixture repository."""
    root = FIX / name
    return {p.relative_to(root).as_posix(): p.read_text(encoding="utf-8") for p in sorted(root.rglob("*")) if p.is_file()}


V1, V2 = version("v1"), version("v2")


def edited(files: dict, changes: dict) -> dict:
    """A copy of `files` with `changes` applied: a text replaces a file, None removes it."""
    out = dict(files)
    for path, text in changes.items():
        if text is None:
            out.pop(path, None)
        else:
            out[path] = text
    return out


def stability(earlier: dict, later: dict) -> list:
    return js(f"return identity.stabilityProblems({json.dumps(earlier)}, {json.dumps(later)});")


def located(files: dict) -> dict:
    return {i["id"]: (i["path"], i["line"]) for i in js(f"return identity.identifiers({json.dumps(files)}).items;")}


class IdentifierStability(unittest.TestCase):
    def test_an_identifier_travels_with_its_artifact(self):
        self.assertEqual(stability(V1, V2), [])
        before, after = located(V1), located(V2)
        self.assertNotEqual(before["UC-002"], after["UC-002"], "the use case's file was renamed")
        self.assertNotEqual(before["TST-003"], after["TST-003"], "the test case moved to another file")
        self.assertNotEqual(before["THE STATUS IS SHOWN"], after["THE STATUS IS SHOWN"], "the requirement moved section")

    def assert_one(self, later: dict, artifact: str, label: str, earlier: dict = V1):
        fs = stability(earlier, later)
        self.assertEqual([(f["kind"], f["rule"], f["artifact"]) for f in fs], [("error", RULE, artifact)], label)
        self.assertTrue(fs[0]["what"] and fs[0]["correction"] and fs[0]["line"] >= 1, label)

    def test_counter_proof_an_identifier_gone_without_a_note(self):
        spec = V2["SPEC.md"]
        status = spec[spec.index("**THE STATUS IS SHOWN**"):spec.index("**EVERY FILE HAS A STATUS**")]
        reader = "tests/reader.spec.mjs"
        gone = {
            "UC-002": {"docs/use-cases/UC-002-show-each-status.md": None},
            "THE STATUS IS SHOWN": {"SPEC.md": spec.replace(status, "")},
            "MOD-page": {"docs/architecture/MOD-page.md": None},
            "TST-002": {reader: V2[reader].replace('test("TST-002 an empty file is read as empty", () => {});\n', "")},
            "ITM-001": {"docs/backlog/ITM-001-read-files-whole.md": None},
            "JOB-20260924-1432-7f3a": {"docs/jobs/JOB-20260924-1432-7f3a.md": None},
            "SRC-po": {"docs/sources/SRC-po.md": None},
        }
        for artifact, changes in gone.items():
            self.assert_one(edited(V2, changes), artifact, artifact)

    def test_counter_proof_a_withdrawn_identifier_without_its_note(self):
        mod = "docs/architecture/MOD-page.md"
        no_reason = V2[mod].replace("## Withdrawn\n\nMerged into MOD-view, which shows the status of every file. "
                                    "The identifier is not reused.\n\n", "")
        self.assertNotEqual(no_reason, V2[mod])
        self.assert_one(edited(V2, {mod: no_reason}), "MOD-page", "a module withdrawn without its reason")
        spec = V2["SPEC.md"].replace("*Withdrawn:* replaced by `A FILE IS READ WHOLE`. The name is not reused.\n", "")
        self.assertNotEqual(spec, V2["SPEC.md"])
        self.assert_one(edited(V2, {"SPEC.md": spec}), "OLD READER", "a requirement withdrawn without its note")

    def test_counter_proof_a_withdrawn_identifier_is_not_reused(self):
        old = ("**OLD READER** *(SRC-po, 2026-09-23 —\nwithdrawn 2026-09-24)*\n"
               "*Withdrawn:* replaced by `A FILE IS READ WHOLE`. The name is not reused.\n")
        reused = ("**OLD READER** *(SRC-po, 2026-09-30)*\nAn old reader reads the first line.\n"
                  "*Occasion:* o.\n*Check:* `tests/reader.spec.mjs`\n")
        self.assertIn(old, V2["SPEC.md"])
        self.assert_one(edited(V2, {"SPEC.md": V2["SPEC.md"].replace(old, reused)}), "OLD READER", "a requirement's name")
        mod = "docs/architecture/MOD-page.md"
        self.assert_one(edited(V2, {mod: V1[mod]}), "MOD-page", "a module's identifier", earlier=V2)

    def test_counter_proof_the_earlier_version_read_as_the_later_one(self):
        # What v2 added is gone in v1, and the module v2 withdrew is live there again.
        self.assertEqual(sorted(f["artifact"] for f in stability(V2, V1)),
                         ["EVERY FILE HAS A STATUS", "ITM-002", "JOB-20260930-0910-c2d4", "MOD-page", "MOD-view", "TST-004"])


if __name__ == "__main__":
    unittest.main()
