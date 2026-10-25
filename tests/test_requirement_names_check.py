# Module: MOD-spec-document
# Guards: A REQUIREMENT NAMES ITS CHECK
# Level: unit
"""SPEC §3 A REQUIREMENT NAMES ITS CHECK — the check field names the test that guards the requirement, or
states explicitly that it is guarded only at review.

MOD-spec-document reads the text (parseSpec) and reports its findings (requirementFindings); the findings of
the named requirement are compared. The texts are the fixture tests/fixtures/requirements/spec.md, never
Agent M's own SPEC; each counter-proof replaces the check of a copy of one requirement.
"""
import unittest
from pathlib import Path

from artifact_checks import module_call

SPEC = (Path(__file__).resolve().parent / "fixtures" / "requirements" / "spec.md").read_text(encoding="utf-8")
RULE = "A REQUIREMENT NAMES ITS CHECK"
PDF_CHECK = "*Check:* `tests/test_export.py`\n"


def findings(text: str, name: str) -> list:
    """Every finding requirementFindings reports for the requirement `name` of the SPEC `text`."""
    return module_call("return specDocument.requirementFindings(specDocument.parseSpec(D.text))"
                       ".filter((f) => f.artifact === D.name);", {"text": text, "name": name})


def kinds(fs: list) -> list:
    return [(f["kind"], f["rule"]) for f in fs]


class RequirementNamesItsCheck(unittest.TestCase):
    def test_a_named_test_or_review_is_a_check(self):
        self.assertEqual(findings(SPEC, "THE EXPORT IS A PDF"), [], "a test file")
        self.assertEqual(findings(SPEC, "THE PRODUCT IS NOT SOLD"), [], "no automatic check; at review")
        self.assertEqual(findings(SPEC, "EVERY CHANGE IS VERIFIED"), [], "a test file with what it does")

    def test_counter_proof_a_check_that_names_neither_is_an_error(self):
        for check in ("*Check:* none\n", "*Check:* to be decided\n", "*Check:* the export test\n",
                      "*Check:* see the review notes\n"):
            self.assertEqual(kinds(findings(SPEC.replace(PDF_CHECK, check), "THE EXPORT IS A PDF")),
                             [("error", RULE)], check)


if __name__ == "__main__":
    unittest.main()
