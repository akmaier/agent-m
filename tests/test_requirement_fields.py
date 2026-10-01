# Module: MOD-artifacts
# Guards: A REQUIREMENT HAS FIVE FIELDS
# Level: unit
"""SPEC §3 A REQUIREMENT HAS FIVE FIELDS — name, source with a date, rule, occasion and check.

MOD-artifacts.parseRequirements reads every requirement of a SPEC or of a queue entry by its name with its
fields; requirementProblems returns a finding for each missing field. The texts are the fixture
tests/fixtures/requirements/spec.md, never Agent M's own SPEC (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE); each
counter-proof breaks a copy of one requirement.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

SPEC = (Path(__file__).resolve().parent / "fixtures" / "requirements" / "spec.md").read_text(encoding="utf-8")
LINKED = ["SRC-po", "SRC-model-licence", "SRC-iec-62304"]
RULE = "A REQUIREMENT HAS FIVE FIELDS"


def requirements(text: str) -> dict:
    return js(f"return Object.fromEntries(requirements.parseRequirements({json.dumps(text)}));")


def findings(text: str, name: str, linked=LINKED) -> list:
    return js(f"const r = requirements.parseRequirements({json.dumps(text)}).get({json.dumps(name)});"
              f"return requirements.requirementProblems(r, {json.dumps(linked)});")


def kinds(fs: list) -> list:
    return [(f["kind"], f["rule"]) for f in fs]


class RequirementFields(unittest.TestCase):
    def test_every_requirement_is_read_by_its_name_with_its_fields(self):
        r = requirements(SPEC)
        self.assertEqual(list(r), ["THE EXPORT IS A PDF", "THE PRODUCT IS NOT SOLD", "A NAMED RULE STAYS ONE",
                                   "OLD EXPORT", "EVERY CHANGE IS VERIFIED"], "prose in bold is no requirement")
        pdf = r["THE EXPORT IS A PDF"]
        self.assertEqual({k: pdf[k] for k in ("name", "source", "rule", "occasion", "check", "section", "line", "withdrawn")},
                         {"name": "THE EXPORT IS A PDF", "source": "SRC-po, 2026-09-24",
                          "rule": "The export of a report is a PDF file.", "occasion": "the readers print it.",
                          "check": "`tests/test_export.py`", "section": "1. Rules", "line": 13, "withdrawn": False})
        self.assertEqual(r["EVERY CHANGE IS VERIFIED"]["section"], "2. Process")

    def test_a_field_that_runs_over_several_lines_is_read_whole(self):
        r = requirements(SPEC)
        self.assertEqual(r["THE PRODUCT IS NOT SOLD"]["source"], "SRC-model-licence, 2026-09-24,\nreworded 2026-09-30")
        self.assertTrue(r["THE PRODUCT IS NOT SOLD"]["occasion"].endswith("its terms entered as\na registered source."))
        self.assertTrue(r["EVERY CHANGE IS VERIFIED"]["check"].endswith("counter-proof: with one it passes."))

    def test_a_withdrawn_requirement_is_marked_and_owes_no_fields(self):
        r = requirements(SPEC)
        self.assertEqual([n for n, x in r.items() if x["withdrawn"]], ["OLD EXPORT"],
                         "the withdrawal stands on the second line of the source")
        self.assertEqual(findings(SPEC, "OLD EXPORT"), [], "a withdrawn requirement keeps only its note")

    def test_a_queue_entry_is_read_like_a_spec(self):
        entry = "**THE EXPORT IS A PDF** *(SRC-po, 2026-09-24)*\nThe export is a PDF file.\n*Occasion:* o.\n*Check:* `tests/t.py`\n"
        r = requirements(entry)
        self.assertEqual(r["THE EXPORT IS A PDF"]["rule"], "The export is a PDF file.")
        self.assertIsNone(r["THE EXPORT IS A PDF"]["section"], "an entry without a heading has no section")

    def test_the_well_formed_requirements_have_no_finding(self):
        for name in ("THE EXPORT IS A PDF", "THE PRODUCT IS NOT SOLD", "A NAMED RULE STAYS ONE", "EVERY CHANGE IS VERIFIED"):
            self.assertEqual(findings(SPEC, name), [], name)

    def test_counter_proof_each_missing_field_is_an_error(self):
        name = "THE EXPORT IS A PDF"
        broken = {
            "no occasion": SPEC.replace("*Occasion:* the readers print it.\n", ""),
            "empty occasion": SPEC.replace("*Occasion:* the readers print it.\n", "*Occasion:*\n"),
            "no rule": SPEC.replace("The export of a report is a PDF file.\n", ""),
            "no check": SPEC.replace("*Check:* `tests/test_export.py`\n", ""),
            "a source without a date": SPEC.replace("*(SRC-po, 2026-09-24)*\nThe export", "*(SRC-po)*\nThe export"),
        }
        for label, text in broken.items():
            fs = findings(text, name)
            self.assertEqual(kinds(fs), [("error", RULE)], label)
            self.assertEqual((fs[0]["artifact"], fs[0]["line"]), (name, 13), label)
            self.assertTrue(fs[0]["what"] and fs[0]["fix"], label)


if __name__ == "__main__":
    unittest.main()
