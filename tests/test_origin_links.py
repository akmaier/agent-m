# Module: MOD-artifacts
# Guards: EVERY ARTIFACT NAMES ITS ORIGIN
# Level: unit
"""SPEC §1 EVERY ARTIFACT NAMES ITS ORIGIN — a use case names the requirements it realises, an architecture
decision the requirements or use cases that force it, a module the requirements or use cases it realises and
the architecture decisions it follows, a code file the one module it belongs to, and a test the requirement
it guards and the module it exercises.

MOD-artifacts identity.originProblems(files) reads one version of a repository, given as { path: text }, and
returns a finding for each of them that names nothing it descends from — through the front matter of use
cases, decisions and modules and the Module: and Guards: lines of code and tests (ARC-020 decisions 1 and 2,
read by headers.headerTags). A withdrawn decision or module lists nothing it realises (ARC-020 decision 4) and
is passed over; a vendored file is not the product's own code. That a requirement names its source is
checked in tests/test_requirement_has_source.py. The files are the fixture repository
tests/fixtures/identity/, never Agent M's own; each counter-proof breaks a copy of v2.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "identity"
RULE = "EVERY ARTIFACT NAMES ITS ORIGIN"


def version(name: str) -> dict:
    """{ path: text } of one version of the fixture repository."""
    root = FIX / name
    return {p.relative_to(root).as_posix(): p.read_text(encoding="utf-8") for p in sorted(root.rglob("*")) if p.is_file()}


V1, V2 = version("v1"), version("v2")


def edited(files: dict, path: str, old: str, new: str) -> dict:
    """A copy of `files` with one replacement in one file; the replaced text must be there."""
    assert old in files[path], (path, old)
    return {**files, path: files[path].replace(old, new)}


def origins(files: dict) -> list:
    return js(f"return identity.originProblems({json.dumps(files)});")


class OriginLinks(unittest.TestCase):
    def test_every_artifact_of_the_fixture_names_its_origin(self):
        self.assertEqual(origins(V1), [])
        self.assertEqual(origins(V2), [], "the withdrawn MOD-page realises nothing; vendor/lib.js and src/notes.md "
                                          "name no module")

    def assert_one(self, files: dict, artifact: str, label: str):
        fs = origins(files)
        self.assertEqual([(f["kind"], f["rule"], f["artifact"]) for f in fs], [("error", RULE, artifact)], label)
        self.assertTrue(fs[0]["what"] and fs[0]["fix"] and fs[0]["line"] >= 1, label)

    def test_counter_proof_a_use_case_decision_or_module_that_names_nothing(self):
        uc, arc, mod = ("docs/use-cases/UC-001-read-a-file.md", "docs/architecture/ARC-001-static-client.md",
                        "docs/architecture/MOD-reader.md")
        self.assert_one(edited(V2, uc, "realises:\n  - A FILE IS READ WHOLE\n", "realises: []\n"), "UC-001",
                        "a use case that realises nothing")
        self.assert_one(edited(V2, uc, "realises:\n  - A FILE IS READ WHOLE\n", ""), "UC-001", "a use case without realises")
        self.assert_one(edited(V2, arc, "forced_by:\n  - UC-001\n", "forced_by: []\n"), "ARC-001",
                        "a decision that nothing forces")
        self.assert_one(edited(V2, mod, "realises:\n  - A FILE IS READ WHOLE\n  - UC-001\n", "realises: []\n"),
                        "MOD-reader", "a module that realises nothing")
        self.assert_one(edited(V2, mod, "follows:\n  - ARC-001\n", "follows: []\n"), "MOD-reader",
                        "a module that follows no decision")

    def test_counter_proof_a_code_file_that_names_not_one_module(self):
        code = "src/reader.js"
        self.assert_one(edited(V2, code, "// Module: MOD-reader\n", ""), code, "no Module line")
        self.assert_one(edited(V2, code, "// Module: MOD-reader\n", "// Module: MOD-reader\n// Module: MOD-view\n"), code,
                        "two modules")
        self.assert_one(edited(V2, code, "// Module: MOD-reader\n", "\n" * 20 + "// Module: MOD-reader\n"), code,
                        "a Module line below the first 20 lines is not read")

    def test_counter_proof_a_test_that_names_no_module_or_guards_nothing(self):
        t = "tests/reader.spec.mjs"
        self.assert_one(edited(V2, t, "// Module: MOD-reader\n", ""), t, "no Module line")
        self.assert_one(edited(V2, t, "// Module: MOD-reader\n", "// Module: MOD-reader\n// Module: MOD-view\n"), t,
                        "two modules")
        self.assert_one(edited(V2, t, "// Guards: A FILE IS READ WHOLE; UC-001\n", ""), t, "no Guards line")
        self.assert_one(edited(V2, t, "// Guards: A FILE IS READ WHOLE; UC-001\n", "// Guards:\n"), t, "an empty Guards line")
        self.assert_one(edited(V2, t, "A FILE IS READ WHOLE; UC-001", "A FILE IS READ WHOLE; the reader"), t,
                        "a guarded entry that is neither a requirement name nor a use case")

    def test_guards_are_names_separated_by_semicolons(self):
        text = "# Module: MOD-x\n# Guards: ONE DEFINITION, THREE DRIVERS; UC-001;  A RULE  \n# Level: unit\n"
        self.assertEqual(js(f"return headers.headerTags('tests/test_x.py', {json.dumps(text)}).guards;"),
                         ["ONE DEFINITION, THREE DRIVERS", "UC-001", "A RULE"],
                         "a comma belongs to a name; a semicolon separates two")


if __name__ == "__main__":
    unittest.main()
