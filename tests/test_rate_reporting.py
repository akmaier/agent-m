# Module: system
# Guards: A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
# Level: release
"""SPEC §12 — the check named tests/test_rate_reporting.py.

The cases live in tests/test_rate_reporting.md. This file loads them and asks MOD-test-document and MOD-result-records
for the findings and rate comparison, so it checks the product behaviour through its public module interfaces.
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import js

DATA = Path(__file__).with_suffix(".md")
RULE = "A MODEL-DEPENDENT TEST IS MEASURED AS A RATE"


def fence(body: str, heading: str) -> str:
    match = re.search(rf"^### {re.escape(heading)}\n\n```[a-z]*\n(.*?)\n```", body, re.M | re.S)
    if not match:
        raise AssertionError(f"missing fenced block under {heading}")
    return match.group(1)


def sections() -> list[dict]:
    text = DATA.read_text(encoding="utf-8")
    found = []
    for match in re.finditer(r"^## (?P<name>[^\n]+)\n(?P<body>.*?)(?=^## |\Z)", text, re.M | re.S):
        body = match.group("body")
        kind = re.search(r"^kind: (.+)$", body, re.M)
        if not kind:
            raise AssertionError(f"missing kind in {match.group('name')}")
        found.append({"name": match.group("name"), "kind": kind.group(1).strip(), "body": body})
    if not found:
        raise AssertionError("no cases loaded")
    return found


def declaration_cases() -> list[dict]:
    cases = []
    for section in sections():
        if section["kind"] != "declaration":
            continue
        path = re.search(r"^path: (.+)$", section["body"], re.M)
        if not path:
            raise AssertionError(f"missing path in {section['name']}")
        cases.append({
            "name": section["name"],
            "path": path.group(1).strip(),
            "text": fence(section["body"], "Text"),
            "expected": json.loads(fence(section["body"], "Expected Findings")),
        })
    return cases


def rate_cases() -> list[dict]:
    return [json.loads(fence(section["body"], "Rate Case"))
            for section in sections() if section["kind"] == "rates"]


def record_text(record: dict) -> str:
    front = [
        "---",
        f"commit: {record['commit']}",
        "levels:",
        "  - release",
        f"occasion: {record['occasion']}",
        "participant: ci",
        "date: 2026-10-13 10:00 UTC",
        "---",
    ]
    rows = ["| Test | Level | Outcome | Runs |", "|---|---|---|---|"]
    rows += [f"| {' | '.join(row)} |" for row in record["rows"]]
    return "\n".join(front + ["## Outcomes", "", *rows, ""])


def declaration_findings(path: str, text: str) -> list[dict]:
    return js("const declarations = testDocument.testDeclarations(%s, %s);"
              "return declarations.flatMap((declaration) => testDocument.testFindings(declaration));"
              % (json.dumps(path), json.dumps(text)))


def rate_comparison(case: dict) -> list[dict]:
    files = {record["path"]: record_text(record) for record in case["records"]}
    return js("const files = new Map(Object.entries(%s));"
              "const snapshot = { paths: [...files.keys()], blob: () => null,"
              " read: async (path) => files.get(path) ?? null };"
              "return await resultRecords.rateComparison(snapshot, %s, %s);"
              % (json.dumps(files), json.dumps(case["current"]), json.dumps(case["last_release"])))


class TestRateReporting(unittest.TestCase):
    # TST-411100 · level: release · module: system
    # guards: A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
    # given: the Markdown declaration case beside this file
    # input: the fixture declaration checked through MOD-test-document
    # expect: a model-dependent test with phrasings and no runs is named as an error with its line and test id
    def test_model_dependent_declaration_without_runs_is_named(self):
        loaded = declaration_cases()
        self.assertEqual(len(loaded), 1)
        for case in loaded:
            actual = [{
                "artifact": finding["artifact"],
                "line": finding["line"],
                "kind": finding["kind"],
                "rule": finding["rule"],
                "what": finding["what"],
                "fix": finding["fix"],
            } for finding in declaration_findings(case["path"], case["text"])]
            self.assertEqual(actual, case["expected"])

    # TST-411101 · level: release · module: system
    # guards: A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
    # given: result-record fixtures for a current commit and the last release commit
    # input: MOD-result-records rateComparison over the fixture snapshot
    # expect: the current rates are reported beside the last release's, lower rates are marked worse, and a test without an earlier release has then null
    def test_rates_are_reported_beside_the_last_release(self):
        loaded = rate_cases()
        self.assertEqual(len(loaded), 1)
        for case in loaded:
            by_test = {row["test"]: row for row in rate_comparison(case)}
            self.assertEqual([by_test[test]["test"] for test in sorted(by_test)], sorted(row["test"] for row in case["expected"]))
            for expected in case["expected"]:
                self.assertEqual(by_test[expected["test"]], expected)
        self.assertTrue(any(row["worse"] for row in loaded[0]["expected"]))
        self.assertTrue(any(row["then"] is None for row in loaded[0]["expected"]))
        self.assertTrue(all(row["rule"] == RULE for case in declaration_cases() for row in case["expected"]))


if __name__ == "__main__":
    unittest.main()
