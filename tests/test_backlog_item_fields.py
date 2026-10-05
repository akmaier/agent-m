# Module: MOD-work-items
# Guards: A BACKLOG ITEM NAMES WHAT IT REALISES; EVERY ARTIFACT NAMES ITS ORIGIN; UC-032; UC-033
# Level: unit
"""SPEC §13 A BACKLOG ITEM NAMES WHAT IT REALISES — every backlog item names at least one requirement or use case that
it realises; UC-032 and UC-033: every item names where it came from, an item from an issue names the issue's address as
its origin, and a drafted item that realises nothing is rejected, one that restates an existing item flagged.

docs/assets/work-items.mjs (MOD-work-items): itemProblems(item, known) returns the findings of an item — an error for an
item that realises nothing, names a name that is neither a requirement nor a use case, names one the product does not
know, or names no origin; a warning for one that restates another item. itemFromIssue(issue, classification, queue)
turns a classified issue into an item (UC-033 step 2). docs/assets/jobs/propose-backlog-items/ is the job definition that
drafts items for uncovered requirements (UC-032 step 2, ARC-007 decision 1); its check is itemProblems.

Fixtures: tests/fixtures/backlog/ — the backlog of a small product, the names it knows (known.json), and under broken/
one copy of its first item per finding, with the findings each must yield in broken/expected.json. Agent M's own backlog
is checked as it stands, its use cases by their files; the SPEC is not read, so its requirement names are checked for
their form only (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE). Counter-proofs: docs/measurements/2026-10-01_backlog-items.md.
"""
import json
import re
import unittest
from pathlib import Path

from artifact_checks import DOCS
from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "backlog"
BACKLOG = FIX / "docs" / "backlog"
BROKEN = FIX / "broken"
KNOWN = json.loads((FIX / "known.json").read_text(encoding="utf-8"))
JOB = DOCS / "assets" / "jobs" / "propose-backlog-items"

NAMES = "A BACKLOG ITEM NAMES WHAT IT REALISES"
ORIGIN = "EVERY ARTIFACT NAMES ITS ORIGIN"
ITEM = "docs/backlog/ITM-014-export-thesis-as-pdf.md"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def files(backlog: Path) -> dict:
    return {f"docs/backlog/{p.name}": read(p) for p in sorted(backlog.glob("ITM-*.md"))}


def problems(path: str, text: str, known, others: dict | None = None) -> list:
    """itemProblems of one item text, with the known names and the other items of its backlog."""
    return js(f"const others = Object.entries({json.dumps(others or {})}).map(([p, t]) => workItems.parseItem(p, t));"
              f"return workItems.itemProblems(workItems.parseItem({json.dumps(path)}, {json.dumps(text)}),"
              f" {{ ...{json.dumps(known or {})}, items: others }});")


def items_js(backlog: Path) -> str:
    """JavaScript that reads every item file of a backlog folder with node's own fs into `items` — a whole backlog is
    too long for one argument of the command line on Linux (`OSError: Argument list too long` in CI)."""
    return (f"const fs = await import('node:fs'); const dir = {json.dumps(str(backlog))};"
            "const items = fs.readdirSync(dir).filter((n) => /^ITM-.*\\.md$/.test(n)).sort()"
            ".map((n) => workItems.parseItem('docs/backlog/' + n, fs.readFileSync(dir + '/' + n, 'utf8')));")


def item_problems(item: dict, known) -> list:
    return js(f"return workItems.itemProblems({json.dumps(item)}, {json.dumps(known or {})});")


def from_issue(issue: dict, classification: dict, queue: list):
    return js(f"return workItems.itemFromIssue({json.dumps(issue)}, {json.dumps(classification)}, {json.dumps(queue)});")


def edited(text: str, old: str, new: str) -> str:
    assert text.count(old) == 1, old
    return text.replace(old, new)


TEXT = read(BACKLOG / "ITM-014-export-thesis-as-pdf.md")


class TestAnItemNamesWhatItRealises(unittest.TestCase):
    def test_the_items_of_the_fixture_backlog_have_no_finding(self):
        backlog = files(BACKLOG)
        for path, text in backlog.items():
            self.assertEqual(problems(path, text, KNOWN, backlog), [], path)

    def test_every_broken_item_yields_exactly_the_findings_expected_json_names(self):
        expected = json.loads(read(BROKEN / "expected.json"))
        self.assertEqual(sorted(p.name for p in BROKEN.glob("*.md")), sorted(expected))
        for name, want in expected.items():
            found = problems(ITEM, read(BROKEN / name), KNOWN)
            self.assertEqual([[f["line"], f["kind"], f["rule"], f["what"]] for f in found], want, name)
            for f in found:
                self.assertEqual(f["artifact"], ITEM, name)
                self.assertGreater(len(f["fix"]), 10, f"{name}: a correction is named")

    def test_without_known_names_only_the_form_of_a_name_is_checked(self):
        for name in ("unknown-requirement.md", "unknown-use-case.md"):
            self.assertEqual(problems(ITEM, read(BROKEN / name), None), [], name)
        self.assertEqual(len(problems(ITEM, read(BROKEN / "not-a-name.md"), None)), 2)
        self.assertEqual(len(problems(ITEM, read(BROKEN / "realises-nothing.md"), None)), 1)

    def test_counter_proof_another_identifier_in_capitals_is_no_requirement_name(self):
        text = edited(TEXT, "  - EXPORT IS A PDF\n  - UC-003\n", "  - ARC-003\n  - ITM-016\n")
        self.assertEqual([(f["line"], f["what"]) for f in problems(ITEM, text, None)],
                         [(7, 'realises "ARC-003" is neither a requirement name nor a use case'),
                          (8, 'realises "ITM-016" is neither a requirement name nor a use case')])

    def test_a_use_case_counts_only_when_the_product_has_it(self):
        text = edited(TEXT, "  - EXPORT IS A PDF\n  - UC-003\n", "  - UC-003\n")
        self.assertEqual(problems(ITEM, text, KNOWN), [])
        self.assertEqual([f["what"] for f in problems(ITEM, text, {**KNOWN, "useCases": ["UC-001"]})],
                         ['realises "UC-003" matches no use case'])

    def test_checking_leaves_the_item_as_it_was(self):
        out = js(f"const i = workItems.parseItem({json.dumps(ITEM)}, {json.dumps(read(BROKEN / 'unknown-requirement.md'))});"
                 f"const before = JSON.stringify(i); const a = workItems.itemProblems(i, {json.dumps(KNOWN)});"
                 f"const b = workItems.itemProblems(i, {json.dumps(KNOWN)}); return [before === JSON.stringify(i), a.length, b.length];")
        self.assertEqual(out, [True, 1, 1])


class TestAnItemThatRestatesAnother(unittest.TestCase):
    """UC-032 step 3: a draft that restates an existing item is flagged — a warning, the person decides."""

    COPY = "docs/backlog/ITM-018-export-as-pdf-again.md"

    def copy(self, title: str, outcome: str) -> str:
        text = edited(TEXT, "id: ITM-014\n", "id: ITM-018\n")
        text = edited(text, "title: Export the thesis as PDF\n", f"title: {title}\n")
        return edited(text, "The thesis is exported as one PDF file, figures included.", outcome)

    def test_an_item_with_the_title_of_another_is_flagged(self):
        found = problems(self.COPY, self.copy("export the   Thesis as PDF.", "Something else."), KNOWN, files(BACKLOG))
        self.assertEqual([(f["kind"], f["rule"], f["line"], f["what"]) for f in found],
                         [("warning", "UC-032", 3, 'the item restates ITM-014 ("Export the thesis as PDF")')])

    def test_an_item_with_the_outcome_of_another_is_flagged(self):
        found = problems(self.COPY, self.copy("PDF export", "The thesis is exported as one PDF file, figures included!"),
                         KNOWN, files(BACKLOG))
        self.assertEqual([(f["kind"], f["what"]) for f in found], [("warning", 'the item restates ITM-014 ("Export the thesis as PDF")')])

    def test_counter_proof_an_item_is_not_compared_with_itself_nor_flagged_for_a_different_title_and_outcome(self):
        self.assertEqual(problems(ITEM, TEXT, KNOWN, files(BACKLOG)), [])
        self.assertEqual(problems(self.COPY, self.copy("PDF export", "Something else."), KNOWN, files(BACKLOG)), [])


class TestAnItemFromAnIssue(unittest.TestCase):
    """UC-033 step 2: title and outcome from the issue, its address as the origin, what it realises from the class."""

    ISSUE = {"title": "Export drops the figures", "body": "Exporting a thesis with figures yields a PDF without them.",
             "url": "https://github.com/alice/thesis-tool/issues/57"}
    QUEUE = [{"names": ["THE THESIS HAS A TITLE PAGE"]},
             {"names": ["THE TITLE PAGE NAMES THE SUPERVISOR", "THE THESIS HAS A TITLE PAGE"]}]

    def test_a_bug_realises_the_requirement_the_code_violates(self):
        item = from_issue(self.ISSUE, {"kind": "bug", "violated": "EXPORT IS A PDF"}, [])
        self.assertEqual((item["id"], item["path"], item["title"], item["outcome"], item["kind"]),
                         (None, None, "Export drops the figures", "Exporting a thesis with figures yields a PDF without them.",
                          "implementation"))
        self.assertEqual((item["realises"], item["origins"], item["issues"]),
                         (["EXPORT IS A PDF"], [self.ISSUE["url"]], [self.ISSUE["url"]]))
        self.assertEqual((item["modules"], item["dependsOn"], item["acceptance"], item["problems"]), ([], [], "", []))
        self.assertEqual(item_problems(item, KNOWN), [])

    def test_a_change_realises_the_requirements_of_its_queue_entries_each_once(self):
        issue = {**self.ISSUE, "url": "https://gitlab.example.org/group/sub/thesis/-/issues/4"}
        item = from_issue(issue, {"kind": "change"}, self.QUEUE)
        self.assertEqual(item["realises"], ["THE THESIS HAS A TITLE PAGE", "THE TITLE PAGE NAMES THE SUPERVISOR"])
        self.assertEqual((item["origins"], item["issues"]), ([issue["url"]], [issue["url"]]))
        self.assertEqual(item_problems(item, KNOWN), [])

    def test_counter_proof_a_change_without_queue_entries_or_a_bug_without_a_violated_requirement_realises_nothing(self):
        for item in (from_issue(self.ISSUE, {"kind": "change"}, []), from_issue(self.ISSUE, {"kind": "bug"}, self.QUEUE)):
            self.assertEqual(item["realises"], [])
            self.assertEqual([(f["rule"], f["what"]) for f in item_problems(item, KNOWN)], [(NAMES, "the item realises nothing")])

    def test_counter_proof_an_issue_that_is_neither_bug_nor_change_gives_no_item(self):
        for kind in ("not reproducible", None, "Bug"):
            self.assertIsNone(from_issue(self.ISSUE, {"kind": kind, "violated": "EXPORT IS A PDF"}, self.QUEUE), kind)

    def test_an_issue_without_a_description_gives_an_empty_outcome(self):
        item = from_issue({**self.ISSUE, "body": None}, {"kind": "bug", "violated": "EXPORT IS A PDF"}, [])
        self.assertEqual(item["outcome"], "")


class TestTheJobThatDraftsItems(unittest.TestCase):
    """UC-032 steps 2 and 3: a job definition (ARC-007 decision 1) drafts items for uncovered requirements; a draft that
    realises nothing is rejected and one that restates an existing item flagged — by itemProblems, the check it names."""

    def definition(self) -> dict:
        return json.loads(read(JOB / "job.json"))

    def test_the_definition_takes_the_requirements_the_use_cases_and_the_existing_items(self):
        job = self.definition()
        self.assertEqual(job["kind"], "propose-backlog-items")
        self.assertEqual(job["inputs"], ["requirements", "useCases", "items"])
        self.assertEqual(job["capabilities"], ["draft text"])
        self.assertIsInstance(job["rounds"], int)
        self.assertGreater(job["rounds"], 0)

    def test_the_prompt_fills_every_input_and_nothing_else(self):
        prompt = read(JOB / "prompt.md")
        self.assertEqual(sorted(set(re.findall(r"\{\{(\w+)\}\}", prompt))), sorted(self.definition()["inputs"]))

    def test_a_drafted_item_must_realise_something_and_may_carry_acceptance_criteria(self):
        draft = self.definition()["output"]["properties"]["items"]
        self.assertEqual(draft["type"], "array")
        fields = draft["items"]
        self.assertEqual(sorted(fields["required"]), ["outcome", "realises", "title"])
        self.assertEqual((fields["properties"]["realises"]["type"], fields["properties"]["realises"]["minItems"]), ("array", 1))
        self.assertIn("acceptance", fields["properties"])

    def test_the_checks_it_names_are_functions_of_the_module(self):
        checks = self.definition()["checks"]
        self.assertEqual(checks, ["itemProblems"])
        self.assertEqual(js(f"return {json.dumps(checks)}.map((c) => typeof workItems[c]);"), ["function"])

    def test_counter_proof_a_draft_that_realises_nothing_is_rejected_and_one_restating_an_item_flagged(self):
        nothing = {"title": "Export faster", "outcome": "The export takes less time.", "realises": [], "origins": ["draft"]}
        self.assertEqual([(f["kind"], f["rule"]) for f in item_problems(nothing, KNOWN)], [("error", NAMES)])
        again = js(f"const items = Object.entries({json.dumps(files(BACKLOG))}).map(([p, t]) => workItems.parseItem(p, t));"
                   "return workItems.itemProblems({ title: 'Export the thesis as PDF', outcome: 'x', realises: ['EXPORT IS A PDF'],"
                   f" origins: ['draft'] }}, {{ ...{json.dumps(KNOWN)}, items }}).map((f) => [f.kind, f.what]);")
        self.assertEqual(again, [["warning", 'the item restates ITM-014 ("Export the thesis as PDF")']])


@unittest.skipUnless(any((DOCS / "backlog").glob("ITM-*.md")), "this repository has no backlog items")
class TestAgentMsOwnBacklog(unittest.TestCase):
    OWN = DOCS / "backlog"

    def test_every_item_of_this_repository_names_what_it_realises_and_where_it_came_from(self):
        use_cases = sorted({re.match(r"UC-\d{3}", p.name).group(0) for p in (DOCS / "use-cases").glob("UC-*.md")})
        self.assertIn("UC-032", use_cases)
        found = js(items_js(self.OWN) + f"const known = {{ requirements: null, useCases: {json.dumps(use_cases)}, items }};"
                   "return [items.length, items.map((i) => [i.path, workItems.itemProblems(i, known)]).filter(([, f]) => f.length)];")
        self.assertEqual(found[1], [])
        self.assertEqual(found[0], len(files(self.OWN)), "node read every item file Python sees")
        self.assertGreater(found[0], 100)


if __name__ == "__main__":
    unittest.main()
