# Module: system
# Guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
# Level: release
"""SPEC §12 — the check named tests/test_test_battery.py.

The cases live in tests/test_test_battery.md. This file loads them and asks MOD-test-document for the declarations and
findings, so the release check uses the same reader and checker the product uses.
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import js

DATA = Path(__file__).with_suffix(".md")
RULE = "A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS"


def fence(body: str, heading: str) -> str:
    match = re.search(rf"^### {re.escape(heading)}\n\n```[a-z]*\n(.*?)\n```", body, re.M | re.S)
    if not match:
        raise AssertionError(f"missing fenced block under {heading}")
    return match.group(1)


def cases() -> list[dict]:
    text = DATA.read_text(encoding="utf-8")
    found = []
    for match in re.finditer(r"^## (?P<name>[^\n]+)\n(?P<body>.*?)(?=^## |\Z)", text, re.M | re.S):
        body = match.group("body")
        path = re.search(r"^path: (.+)$", body, re.M)
        if not path:
            raise AssertionError(f"missing path in {match.group('name')}")
        found.append({
            "name": match.group("name"),
            "path": path.group(1).strip(),
            "text": fence(body, "Text"),
            "expected": json.loads(fence(body, "Expected Findings")),
        })
    if not found:
        raise AssertionError("no cases loaded")
    return found


def findings(path: str, text: str) -> list[dict]:
    return js("const declarations = testDocument.testDeclarations(%s, %s);"
              "return declarations.flatMap((declaration) => testDocument.testFindings(declaration));"
              % (json.dumps(path), json.dumps(text)))


class TestTestBattery(unittest.TestCase):
    # TST-410100 · level: release · module: system
    # guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
    # given: the Markdown cases beside this file
    # input: each case's fixture text checked through MOD-test-document's testDeclarations and testFindings
    # expect: a complete declaration passes, and missing precondition, input or expected result are named with line and test id
    def test_each_case_reports_the_expected_findings(self):
        for case in cases():
            with self.subTest(case=case["name"]):
                actual = [{
                    "artifact": finding["artifact"],
                    "line": finding["line"],
                    "kind": finding["kind"],
                    "rule": finding["rule"],
                    "what": finding["what"],
                    "fix": finding["fix"],
                } for finding in findings(case["path"], case["text"])]
                self.assertEqual(actual, case["expected"])

    # TST-410101 · level: release · module: system
    # guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
    # given: the complete declaration case and the three counter-proof cases
    # input: the cases loaded from Markdown
    # expect: the passing case is present, and every missing part has a failing fixture under the rule this check guards
    def test_the_cases_cover_the_passing_declaration_and_each_missing_part(self):
        loaded = cases()
        self.assertGreaterEqual(len(loaded), 4)
        expected = [finding for case in loaded for finding in case["expected"]]
        self.assertIn({"artifact": "TST-410102", "line": 1, "kind": "error", "rule": RULE,
                       "what": "no precondition", "fix": "add a line given: that states the precondition"}, expected)
        self.assertIn({"artifact": "TST-410103", "line": 1, "kind": "error", "rule": RULE,
                       "what": "no input", "fix": "add a line input: that states the input"}, expected)
        self.assertIn({"artifact": "TST-410104", "line": 1, "kind": "error", "rule": RULE,
                       "what": "no expected result", "fix": "add a line expect: that states the expected result"}, expected)
        self.assertTrue(any(not case["expected"] for case in loaded))


if __name__ == "__main__":
    unittest.main()
