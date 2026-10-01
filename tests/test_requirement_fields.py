# Module: MOD-artifacts
# Guards: A REQUIREMENT HAS FIVE FIELDS
# Level: unit
"""SPEC §3 A REQUIREMENT HAS FIVE FIELDS — name, source with a date, rule, occasion and check.

MOD-artifacts.parseRequirements reads every requirement of a SPEC or of a queue entry by its name with its
fields; requirementProblems returns a finding for each missing field — a source missing or without a date
among them, whether it is named by an identifier or as it is written (ITM-127). The texts are the fixture
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
            "a source written without a date": SPEC.replace("*(SRC-po, 2026-09-24)*", "*(PO A. Maier)*"),
            "no source": SPEC.replace("*(SRC-po, 2026-09-24)*", "*()*"),
            "a date and no source": SPEC.replace("*(SRC-po, 2026-09-24)*", "*(2026-09-24)*"),
        }
        for label, text in broken.items():
            fs = findings(text, name)
            self.assertEqual(kinds(fs), [("error", RULE)], label)
            self.assertEqual((fs[0]["artifact"], fs[0]["line"]), (name, 13), label)
            self.assertTrue(fs[0]["what"] and fs[0]["fix"], label)

    def test_counter_proof_a_missing_source_is_named_as_missing(self):
        # Not "the source has no date": a source that is empty, or only a date, names no one who decided.
        for source in ("*()*", "*( )*", "*(2026-09-24)*", "*(2026-09-24, 2026-09-30)*"):
            fs = findings(SPEC.replace("*(SRC-po, 2026-09-24)*", source), "THE EXPORT IS A PDF")
            self.assertEqual([(f["kind"], f["rule"], f["what"]) for f in fs], [("error", RULE, "no source")], source)
        # The written source of the fixture is a source.
        self.assertEqual(findings(SPEC, "A NAMED RULE STAYS ONE", []), [])

    def test_a_requirement_written_without_any_source_is_read_and_its_source_named_as_missing(self):
        # ITM-127, back from Release testing (finding C1): a bold name in capitals with no *(…)* after it, followed by its
        # rule and its *Occasion:* or *Check:* line, is a requirement whose source is missing — read with its other fields,
        # and one error "no source" at its own line. Expected for each spelling of the name line below.
        name = "THE EXPORT IS A PDF"
        for label, head in (("the name alone", f"**{name}**\n"), ("blanks after the name", f"**{name}**  \n"),
                            ("a CR LF line end", f"**{name}**\r\n")):
            text = SPEC.replace(f"**{name}** *(SRC-po, 2026-09-24)*\n", head)
            r = requirements(text)
            self.assertEqual(list(r), list(requirements(SPEC)), label)
            got = r[name]
            self.assertEqual((got["rule"], got["occasion"], got["check"], got["line"], got["withdrawn"]),
                             ("The export of a report is a PDF file.", "the readers print it.", "`tests/test_export.py`", 13,
                              False), label)
            fs = findings(text, name)
            self.assertEqual([(f["kind"], f["rule"], f["what"], f["line"]) for f in fs], [("error", RULE, "no source", 13)],
                             label)
        # With only its check after the rule, it is still a requirement — without a source and without an occasion.
        text = SPEC.replace(f"**{name}** *(SRC-po, 2026-09-24)*\n", f"**{name}**\n").replace(
            "*Occasion:* the readers print it.\n", "")
        self.assertEqual(sorted(f["what"] for f in findings(text, name)), ["no occasion", "no source"])

    def test_counter_proof_bold_prose_between_requirements_stays_no_requirement(self):
        # The reader is shared (the link graph, the SPEC browser, the queue entries): bold prose — a line in capitals
        # alone (also when a paragraph with a field line follows after a blank line), a label in capitals with text after
        # it, a quoted name — between two requirements is no requirement, and every requirement is read with the same
        # fields as without it. Expected: the same names and fields, lines aside.
        prose = ("**THIS SECTION IS INFORMATIVE**\n\nIt explains the export.\n*Occasion:* a line after a blank line.\n\n"
                 "**ALSO IN CAPITALS**\nA paragraph in bold capitals' wake, with no fields.\n\n"
                 "**NOTE:** the exports are checked; see `THE EXPORT IS A PDF`.\n*Check:* not a field of a requirement.\n\n"
                 # A blank just inside the asterisks makes no bold text in Markdown, so no name.
                 "**NOT BOLD IN MARKDOWN **\nA rule after it.\n*Check:* `tests/test_export.py`\n\n")
        anchor = "**THE PRODUCT IS NOT SOLD**"
        text = SPEC.replace(anchor, prose + anchor)
        self.assertEqual(text.count(prose), 1)
        strip = lambda reqs: {n: {k: v for k, v in x.items() if k != "line"} for n, x in reqs.items()}  # noqa: E731
        self.assertEqual(strip(requirements(text)), strip(requirements(SPEC)))


if __name__ == "__main__":
    unittest.main()
