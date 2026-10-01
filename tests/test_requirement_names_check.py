# Module: MOD-artifacts
# Guards: A REQUIREMENT NAMES ITS CHECK
# Level: unit
"""SPEC §3 A REQUIREMENT NAMES ITS CHECK — the check field names the test that guards the requirement, or
states explicitly that it is guarded only at review.

The texts are the fixture tests/fixtures/requirements/spec.md, never Agent M's own SPEC; each
counter-proof replaces the check of a copy of one requirement.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

SPEC = (Path(__file__).resolve().parent / "fixtures" / "requirements" / "spec.md").read_text(encoding="utf-8")
LINKED = ["SRC-po", "SRC-model-licence", "SRC-iec-62304"]
RULE = "A REQUIREMENT NAMES ITS CHECK"
PDF_CHECK = "*Check:* `tests/test_export.py`\n"


def findings(text: str, name: str) -> list:
    return js(f"const r = requirements.parseRequirements({json.dumps(text)}).get({json.dumps(name)});"
              f"return requirements.requirementProblems(r, {json.dumps(LINKED)});")


def kinds(fs: list) -> list:
    return [(f["kind"], f["rule"]) for f in fs]


class RequirementNamesItsCheck(unittest.TestCase):
    def test_a_named_test_or_review_is_a_check(self):
        self.assertEqual(findings(SPEC, "THE EXPORT IS A PDF"), [], "a test file")
        self.assertEqual(findings(SPEC, "THE PRODUCT IS NOT SOLD"), [], "no automatic check; at review")
        self.assertEqual(findings(SPEC, "EVERY CHANGE IS VERIFIED"), [], "a test file with what it does")
        self.assertEqual(findings(SPEC.replace(PDF_CHECK, "*Check:* the export run of\n`tests/test_export.py`\n"),
                                  "THE EXPORT IS A PDF"), [], "the test named on the check's second line")

    def test_counter_proof_a_check_that_names_neither_is_an_error(self):
        for check in ("*Check:* none\n", "*Check:* to be decided\n", "*Check:* the export test\n",
                      "*Check:* see the review notes\n"):
            self.assertEqual(kinds(findings(SPEC.replace(PDF_CHECK, check), "THE EXPORT IS A PDF")),
                             [("error", RULE)], check)


if __name__ == "__main__":
    unittest.main()
