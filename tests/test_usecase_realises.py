# Module: MOD-documents
# Guards: A USE CASE REALISES NAMED REQUIREMENTS
# Level: unit
"""SPEC §4 A USE CASE REALISES NAMED REQUIREMENTS — a use case names the requirements it realises, each by its name in
capitals, and every name it gives is a requirement the product knows.

Checked as the product checks it (tests/artifact_checks.py): the form of each name by MOD-documents' documentFindings, by the
use-case schema; whether a name is a requirement the product knows by MOD-trace-graph's graphFindings over the graph of the use
case beside a SPEC; and a use case that realises nothing is listed by coverageGaps, as UNREALISED REQUIREMENTS ARE REPORTED, NOT
FORBIDDEN has it. The known names come with the fixtures (tests/fixtures/use-cases/known-requirements.txt) and make the
fixture product's SPEC; Agent M's own SPEC is not read (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE), so this repository's own use
cases are checked for the form of their names only. Counter-proofs: docs/measurements/2026-10-01_use-case-checks.md."""
import unittest
from pathlib import Path

from artifact_checks import DOCS, use_case_findings, use_case_graph

RULE = "A USE CASE REALISES NAMED REQUIREMENTS"
FIX = Path(__file__).resolve().parent / "fixtures" / "use-cases"
KNOWN = [n for n in (FIX / "known-requirements.txt").read_text(encoding="utf-8").split("\n") if n]


def fixture(name: str) -> str:
    return (FIX / name).read_text(encoding="utf-8")


def at(name: str) -> str:
    return f"docs/use-cases/{name}"


def form(name: str, text: str) -> list[str]:
    """What documentFindings says, under the rule, of the form of the names a use case realises."""
    return [f["what"] for f in use_case_findings({at(name): text})[at(name)] if f["rule"] == RULE]


def unknown(name: str, text: str, known=KNOWN) -> list:
    """The findings of graphFindings under the rule, as [artifact, line, what], for a use case beside a SPEC of `known`."""
    return [[f["artifact"], f["line"], f["what"]] for f in use_case_graph({at(name): text}, known)["findings"]
            if f["rule"] == RULE]


class UseCaseRealisesNamedRequirements(unittest.TestCase):
    def test_every_use_case_of_this_repository_names_requirements_by_name(self):
        files = {at(f.name): f.read_text(encoding="utf-8") for f in sorted((DOCS / "use-cases").glob("UC-*.md"))}
        self.assertTrue(files)
        found = {p: [f["what"] for f in fs if f["rule"] == RULE] for p, fs in use_case_findings(files).items()}
        self.assertEqual({p: w for p, w in found.items() if w}, {})

    def test_a_use_case_realising_known_requirements_passes(self):
        self.assertEqual(form("UC-001-complete.md", fixture("UC-001-complete.md")), [])
        self.assertEqual(unknown("UC-001-complete.md", fixture("UC-001-complete.md")), [])

    def test_a_name_no_requirement_has_is_reported_on_its_line(self):
        self.assertEqual(unknown("UC-009-unknown-name.md", fixture("UC-009-unknown-name.md")),
                         [["UC-009", 11, 'realises "EXPORT AS PDF" matches no requirement or use case']])

    def test_a_name_in_another_form_is_reported(self):
        self.assertEqual(form("UC-010-not-a-name.md", fixture("UC-010-not-a-name.md")),
                         ['the key realises does not fit: "export as pdf" is not a requirement\'s name in capitals'])
        self.assertEqual(form("UC-010-a-use-case.md", fixture("UC-010-not-a-name.md").replace("  - export as pdf\n", "")),
                         ['the key realises does not fit: "UC-003" is not a requirement\'s name in capitals'])

    def test_a_use_case_that_realises_nothing_is_reported(self):
        text = fixture("UC-008-realises-nothing.md")
        self.assertEqual(use_case_graph({at("UC-008-realises-nothing.md"): text}, KNOWN)["unrealised"], ["UC-008"])
        # Counter-proof: the complete use case realises requirements and is not listed.
        self.assertEqual(use_case_graph({at("UC-001-complete.md"): fixture("UC-001-complete.md")}, KNOWN)["unrealised"], [])

    def test_the_form_of_a_name_is_checked_without_the_spec(self):
        # The name that matches no requirement is in the form of one: documentFindings, which knows no SPEC, finds nothing.
        self.assertEqual(form("UC-009-unknown-name.md", fixture("UC-009-unknown-name.md")), [])
        # Known positive of the lookup: the same use case beside a SPEC that holds the name passes.
        self.assertEqual(unknown("UC-009-unknown-name.md", fixture("UC-009-unknown-name.md"), KNOWN + ["EXPORT AS PDF"]), [])


if __name__ == "__main__":
    unittest.main()
