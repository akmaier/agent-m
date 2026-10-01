# Module: MOD-artifacts
# Guards: EVERY ARTIFACT HAS AN IDENTIFIER
# Level: unit
"""SPEC §1 EVERY ARTIFACT HAS AN IDENTIFIER — a requirement its name in capitals, every other artifact one
from the scheme SRC- · UC- · ARC- · MOD- · TST- · ITM- · RES- · JOB-.

MOD-artifacts identity.identifierKind tells the kind of an identifier from its form; identity.identifiers(files)
reads every identifier of one version of a repository — the requirements of its SPEC.md, the use cases,
decisions, modules, backlog items, job records and sources by their files, the test cases by their TST-
identifiers — and returns a finding for an artifact that carries none, carries a malformed one, or shares
one with another artifact. The files are the fixture repository tests/fixtures/identity/v2/, never Agent M's
own (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE); each counter-proof breaks a copy of it.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "identity"
RULE = "EVERY ARTIFACT HAS AN IDENTIFIER"


def version(name: str) -> dict:
    """{ path: text } of one version of the fixture repository."""
    root = FIX / name
    return {p.relative_to(root).as_posix(): p.read_text(encoding="utf-8") for p in sorted(root.rglob("*")) if p.is_file()}


V2 = version("v2")


def edited(files: dict, changes: dict) -> dict:
    """A copy of `files` with `changes` applied: a text replaces a file, None removes it."""
    out = dict(files)
    for path, text in changes.items():
        if text is None:
            out.pop(path, None)
        else:
            out[path] = text
    return out


def identifiers(files: dict) -> dict:
    return js(f"return identity.identifiers({json.dumps(files)});")


def problems(files: dict) -> list:
    return identifiers(files)["problems"]


class Identifiers(unittest.TestCase):
    def test_the_kind_of_an_identifier_is_told_by_its_form(self):
        kinds = {"THE STATUS IS SHOWN": "requirement", "SRC-po": "source", "UC-001": "use-case",
                 "ARC-001": "architecture-decision", "MOD-reader": "module", "TST-001": "test",
                 "ITM-001": "backlog-item", "RES-gpu-cluster": "resource", "JOB-20260924-1432-7f3a": "job"}
        got = js(f"return Object.fromEntries({json.dumps(list(kinds))}.map((i) => [i, identity.identifierKind(i)]));")
        self.assertEqual(got, kinds)

    def test_counter_proof_a_malformed_identifier_has_no_kind(self):
        bad = ["UC-1", "uc-001", "UC-001-read", "MOD-Reader", "MOD-", "TST-12", "ITM-0001", "RES-", "SRC_po",
               "JOB-", "The status is shown", ""]
        got = js(f"return {json.dumps(bad)}.map((i) => identity.identifierKind(i));")
        self.assertEqual(got, [None] * len(bad))

    def test_every_artifact_of_the_fixture_is_read_by_its_identifier(self):
        r = identifiers(V2)
        self.assertEqual(r["problems"], [])
        by_kind = {}
        for i in r["items"]:
            by_kind.setdefault(i["kind"], []).append(i["id"])
        self.assertEqual({k: sorted(v) for k, v in by_kind.items()}, {
            "requirement": ["A FILE IS READ WHOLE", "EVERY FILE HAS A STATUS", "OLD READER", "THE STATUS IS SHOWN"],
            "use-case": ["UC-001", "UC-002"],
            "architecture-decision": ["ARC-001"],
            "module": ["MOD-page", "MOD-reader", "MOD-view"],
            "backlog-item": ["ITM-001", "ITM-002"],
            "job": ["JOB-20260924-1432-7f3a", "JOB-20260930-0910-c2d4"],
            "source": ["SRC-po"],
            "test": ["TST-001", "TST-002", "TST-003", "TST-004"],
        })
        at = {i["id"]: i for i in r["items"]}
        self.assertEqual((at["UC-002"]["path"], at["UC-002"]["line"]), ("docs/use-cases/UC-002-show-each-status.md", 1))
        self.assertEqual((at["TST-004"]["path"], at["TST-004"]["line"]), ("tests/view.spec.mjs", 9))
        self.assertEqual((at["THE STATUS IS SHOWN"]["path"], at["THE STATUS IS SHOWN"]["line"]), ("SPEC.md", 24))
        self.assertEqual(sorted(i for i, x in at.items() if x["withdrawn"]), ["MOD-page", "OLD READER"])

    def assert_one(self, files: dict, artifact: str, label: str):
        fs = problems(files)
        self.assertEqual([(f["kind"], f["rule"], f["artifact"]) for f in fs], [("error", RULE, artifact)], label)
        self.assertTrue(fs[0]["what"] and fs[0]["correction"] and fs[0]["line"] >= 1, label)

    def test_counter_proof_a_file_without_an_identifier(self):
        uc = V2["docs/use-cases/UC-002-show-each-status.md"]
        cases = {
            "a use case": ("docs/use-cases/show-each-status.md", "docs/use-cases/UC-002-show-each-status.md", uc),
            "a decision": ("docs/architecture/static-client.md", "docs/architecture/ARC-001-static-client.md",
                           V2["docs/architecture/ARC-001-static-client.md"]),
            "a job record": ("docs/jobs/job-1432.md", "docs/jobs/JOB-20260924-1432-7f3a.md",
                             V2["docs/jobs/JOB-20260924-1432-7f3a.md"]),
            "a source": ("docs/sources/po.md", "docs/sources/SRC-po.md", V2["docs/sources/SRC-po.md"]),
            "a backlog item with a malformed number": ("docs/backlog/ITM-1-read-files-whole.md",
                                                       "docs/backlog/ITM-001-read-files-whole.md",
                                                       V2["docs/backlog/ITM-001-read-files-whole.md"]),
        }
        for label, (new, old, text) in cases.items():
            self.assert_one(edited(V2, {old: None, new: text}), new, label)

    def test_counter_proof_an_identifier_that_is_not_the_one_its_file_carries(self):
        uc, itm = "docs/use-cases/UC-002-show-each-status.md", "docs/backlog/ITM-001-read-files-whole.md"
        self.assert_one(edited(V2, {uc: V2[uc].replace("id: UC-002", "id: UC-003")}), "UC-002", "another id in the front matter")
        self.assert_one(edited(V2, {uc: V2[uc].replace("id: UC-002\n", "")}), "UC-002", "a use case without its id")
        self.assert_one(edited(V2, {itm: V2[itm].replace("id: ITM-001", "id: ITM-002")}), "ITM-001", "a backlog item")

    def test_counter_proof_a_requirement_without_a_name_in_capitals(self):
        spec = V2["SPEC.md"].replace("**EVERY FILE HAS A STATUS**", "**Every file has a status**")
        fs = problems(edited(V2, {"SPEC.md": spec}))
        self.assertEqual([(f["rule"], f["artifact"], f["line"]) for f in fs], [(RULE, "SPEC.md", 29)])

    def test_counter_proof_a_test_whose_cases_carry_no_identifier(self):
        t = "tests/reader.spec.mjs"
        self.assert_one(edited(V2, {t: V2[t].replace("TST-001 ", "").replace("TST-002 ", "")}), t, "no TST- at all")
        self.assert_one(edited(V2, {t: V2[t].replace("TST-002", "TST-02")}), t, "a malformed TST- identifier")

    def test_counter_proof_one_identifier_on_two_artifacts(self):
        again = "docs/use-cases/UC-001-read-it-again.md"
        self.assert_one(edited(V2, {again: V2["docs/use-cases/UC-001-read-a-file.md"]}), "UC-001", "two use case files")
        view = "tests/view.spec.mjs"
        self.assert_one(edited(V2, {view: V2[view].replace("TST-004", "TST-001")}), "TST-001", "two test cases")
        twice = V2["SPEC.md"] + "\n**A FILE IS READ WHOLE** *(SRC-po, 2026-09-30)*\nA file is read.\n*Occasion:* o.\n*Check:* `tests/x.py`\n"
        self.assert_one(edited(V2, {"SPEC.md": twice}), "A FILE IS READ WHOLE", "one name for two requirements")


if __name__ == "__main__":
    unittest.main()
