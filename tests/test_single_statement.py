# Module: MOD-artifacts
# Guards: ONE STATEMENT PER REQUIREMENT
# Level: unit
"""SPEC §3 ONE STATEMENT PER REQUIREMENT — a conjunction in the rule field is flagged for review as a
warning; the decision stays human.

The texts are the fixture tests/fixtures/requirements/spec.md, never Agent M's own SPEC; each
counter-proof plants a conjunction in a copy of one rule.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

SPEC = (Path(__file__).resolve().parent / "fixtures" / "requirements" / "spec.md").read_text(encoding="utf-8")
LINKED = ["SRC-po", "SRC-model-licence", "SRC-iec-62304"]
RULE = "ONE STATEMENT PER REQUIREMENT"
PDF_RULE = "The export of a report is a PDF file.\n"


def findings(text: str, name: str) -> list:
    return js(f"const r = requirements.parseRequirements({json.dumps(text)}).get({json.dumps(name)});"
              f"return requirements.requirementProblems(r, {json.dumps(LINKED)});")


def kinds(fs: list) -> list:
    return [(f["kind"], f["rule"]) for f in fs]


class SingleStatement(unittest.TestCase):
    def test_a_conjunction_in_the_rule_is_a_warning(self):
        planted = {
            "and": "The export of a report is a PDF file and is signed.\n",
            "additionally": "The export of a report is a PDF file; additionally it is signed.\n",
            "And at the start": "And the export of a report is a PDF file.\n",
            "over two lines": "The export of a report is a PDF file\nand is signed.\n",
        }
        for label, rule in planted.items():
            self.assertEqual(kinds(findings(SPEC.replace(PDF_RULE, rule), "THE EXPORT IS A PDF")),
                             [("warning", RULE)], label)

    def test_counter_proof_no_conjunction_no_warning(self):
        self.assertEqual(findings(SPEC, "THE EXPORT IS A PDF"), [])
        # A name in backticks with AND in it, and words that only contain the letters (standard, handling), are no
        # conjunction of the rule; an "and" in the occasion is not in the rule.
        self.assertEqual(findings(SPEC, "A NAMED RULE STAYS ONE"), [])


if __name__ == "__main__":
    unittest.main()
