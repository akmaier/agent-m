# Module: MOD-artifacts
# Guards: A USE CASE REALISES NAMED REQUIREMENTS
# Level: unit
"""SPEC §4 A USE CASE REALISES NAMED REQUIREMENTS — a use case names the requirements it realises, each by its name in
capitals, and every name it gives is a requirement the product knows.

The known names come with the fixtures (tests/fixtures/use-cases/known-requirements.txt); the SPEC itself is not read
(KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE), so this repository's own use cases are checked for the form of their names only.
The dashboard's reader is asked the same through node (tests/jsrun.py); tests/artifacts-twin.test.mjs compares the two
readers on every fixture. Counter-proofs: docs/measurements/2026-10-01_use-case-checks.md."""
import json
import unittest
from pathlib import Path

from artifact_checks import DOCS, use_case_findings, use_case_problems
from jsrun import js

RULE = "A USE CASE REALISES NAMED REQUIREMENTS"
FIX = Path(__file__).resolve().parent / "fixtures" / "use-cases"
KNOWN = [n for n in (FIX / "known-requirements.txt").read_text(encoding="utf-8").split("\n") if n]


def fixture(name: str) -> str:
    return (FIX / name).read_text(encoding="utf-8")


def realises(name: str, text: str, known) -> list[str]:
    return [f["what"] for f in use_case_findings(name, text, known) if f["rule"] == RULE]


class UseCaseRealisesNamedRequirements(unittest.TestCase):
    def test_every_use_case_of_this_repository_names_requirements_by_name(self):
        found = {}
        for f in sorted((DOCS / "use-cases").glob("UC-*.md")):
            p = realises(f.name, f.read_text(encoding="utf-8"), None)
            if p:
                found[f.name] = p
        self.assertEqual(found, {})
        self.assertTrue(sorted((DOCS / "use-cases").glob("UC-*.md")))

    def test_a_use_case_realising_known_requirements_passes(self):
        self.assertEqual(realises("UC-001-complete.md", fixture("UC-001-complete.md"), KNOWN), [])

    def test_a_name_no_requirement_has_is_reported(self):
        self.assertEqual(realises("UC-009-unknown-name.md", fixture("UC-009-unknown-name.md"), KNOWN),
                         ['realises "EXPORT AS PDF" matches no requirement'])

    def test_a_name_in_another_form_is_reported(self):
        self.assertEqual(realises("UC-010-not-a-name.md", fixture("UC-010-not-a-name.md"), KNOWN),
                         ['realises: "export as pdf" is not a requirement name',
                          'realises: "UC-003" is not a requirement name'])

    def test_a_use_case_that_realises_nothing_is_reported(self):
        self.assertEqual(realises("UC-008-realises-nothing.md", fixture("UC-008-realises-nothing.md"), KNOWN),
                         ["realises must be a non-empty list"])

    def test_without_known_names_only_the_form_is_checked(self):
        self.assertEqual(realises("UC-009-unknown-name.md", fixture("UC-009-unknown-name.md"), None), [])
        self.assertEqual(len(realises("UC-010-not-a-name.md", fixture("UC-010-not-a-name.md"), None)), 2)

    def test_the_problem_names_the_file(self):
        self.assertIn('UC-009-unknown-name.md: realises "EXPORT AS PDF" matches no requirement',
                      use_case_problems("UC-009-unknown-name.md", fixture("UC-009-unknown-name.md"), KNOWN))

    def test_the_dashboards_reader_reports_the_same_name_on_its_line(self):
        text = fixture("UC-009-unknown-name.md")
        got = js(f"return useCases.useCaseProblems({json.dumps('docs/use-cases/UC-009-unknown-name.md')}, "
                 f"{json.dumps(text)}, {json.dumps(KNOWN)}).map((f) => [f.rule, f.what, f.line]);")
        self.assertEqual(got, [[RULE, 'realises "EXPORT AS PDF" matches no requirement', 11]])


if __name__ == "__main__":
    unittest.main()
