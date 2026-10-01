# Module: MOD-artifacts
# Guards: EVERY TEST HAS ONE LEVEL
# Level: unit
"""SPEC §12 EVERY TEST HAS ONE LEVEL — every test declares exactly one level from: unit, component, system,
release, user.

MOD-artifacts headers.headerTags(path, text) reads the Module:, Guards: and Level: lines among a file's first
20 lines, the TST- identifiers of its cases and whether the path is a test (ARC-020 decision 2);
headers.levelProblems(path, text) returns a finding for a test without a Level: line, with more than one, or
with a level outside the five. The texts are the fixture repository tests/fixtures/identity/v2/ and copies of
its tests, each counter-proof breaking one.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "identity"
RULE = "EVERY TEST HAS ONE LEVEL"
LEVELS = ["unit", "component", "system", "release", "user"]
READER = "tests/reader.spec.mjs"
TEXT = (FIX / "v2" / READER).read_text(encoding="utf-8")


def tags(path: str, text: str) -> dict:
    return js(f"return headers.headerTags({json.dumps(path)}, {json.dumps(text)});")


def levels(path: str, text: str) -> list:
    return js(f"return headers.levelProblems({json.dumps(path)}, {json.dumps(text)});")


class TestLevels(unittest.TestCase):
    def test_the_header_of_a_test_is_read(self):
        self.assertEqual(tags(READER, TEXT), {"modules": ["MOD-reader"], "guards": ["A FILE IS READ WHOLE", "UC-001"],
                                              "level": "unit", "cases": ["TST-001", "TST-002"], "test": True})
        py = '# Module: MOD-x\n# Guards: A RULE\n# Level: system\n"""Level: unit — prose in the docstring is no header."""\n'
        self.assertEqual(tags("tests/test_x.py", py),
                         {"modules": ["MOD-x"], "guards": ["A RULE"], "level": "system", "cases": [], "test": True})
        self.assertFalse(tags("src/reader.js", "// Module: MOD-reader\n")["test"], "a code file is not a test")

    def test_every_test_of_the_fixture_has_one_level(self):
        for path in sorted((FIX / "v2" / "tests").glob("*")):
            rel = path.relative_to(FIX / "v2").as_posix()
            self.assertEqual(levels(rel, path.read_text(encoding="utf-8")), [], rel)
        for level in LEVELS:
            self.assertEqual(levels(READER, TEXT.replace("Level: unit", f"Level: {level}")), [], level)

    def test_a_file_that_is_no_test_owes_no_level(self):
        self.assertEqual(levels("src/reader.js", "// Module: MOD-reader\n"), [])

    def test_counter_proof_no_level_more_than_one_or_another_one(self):
        # label: (broken text, the level headerTags reads from it)
        broken = {
            "no Level line": (TEXT.replace("// Level: unit\n", ""), None),
            "two Level lines": (TEXT.replace("// Level: unit\n", "// Level: unit\n// Level: component\n"), None),
            "a level outside the five": (TEXT.replace("Level: unit", "Level: integration"), "integration"),
            "two levels on one line": (TEXT.replace("Level: unit", "Level: unit|component"), "unit|component"),
            "an empty level": (TEXT.replace("Level: unit", "Level:"), None),
            "a Level line below the first 20 lines": (TEXT.replace("// Level: unit\n", "\n" * 20 + "// Level: unit\n"), None),
        }
        for label, (text, read) in broken.items():
            self.assertNotEqual(text, TEXT, label)
            fs = levels(READER, text)
            self.assertEqual([(f["kind"], f["rule"], f["artifact"]) for f in fs], [("error", RULE, READER)], label)
            self.assertTrue(fs[0]["what"] and fs[0]["correction"] and fs[0]["line"] >= 1, label)
            self.assertEqual(tags(READER, text)["level"], read, label)


if __name__ == "__main__":
    unittest.main()
