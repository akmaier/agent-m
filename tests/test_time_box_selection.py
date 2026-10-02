# Module: MOD-work-items
# Guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; UC-032
# Level: unit
"""SPEC §13 A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT — when a product's model works in sprints, implementation
jobs start only for items selected for the current sprint (UC-032 step 6, 6a, 6b, and step 7: in a model with sprints
and a WIP limit, both hold).

docs/assets/work-items/flow.mjs (MOD-work-items): sprint(text) reads a sprint record of docs/backlog/sprints/ — its goal,
start, end, selection, closer and branch —, with a problem for a record that is not one; in a sprint without a time box,
`end` stays empty until the sprint ends. itemState refuses the start of an item outside the running sprint's selection,
with no sprint running, or with the sprint ended or not yet begun (the day is passed in; a kernel reads no clock).
Agent M's own sprint records are read as they stand only to check that they parse — the backlog of the instance's own
product, not its SPEC, which no test reads; what a sprint of Agent M's holds is read from a frozen copy under
tests/fixtures/flow/agent-m/, since the live records change at every sprint close. The fixture product is
tests/flow_fixture.py's. Counter-proofs: docs/measurements/2026-10-01_sprints-wip-and-selection.md.
"""
import json
import re
import unittest

from artifact_checks import DOCS
from flow_fixture import FIX, SELECTED, WIP, item_state, js, kinds, pr, starts

SPRINTS = FIX / "sprints"
OPEN = (SPRINTS / "open.md").read_text(encoding="utf-8")


def sprint_of(text: str) -> dict:
    return js(f"return flow.sprint({json.dumps(text)});")


def sprint_file(path) -> dict:
    """A sprint record read by node itself — Agent M's own are longer than one argument of the command line may be."""
    return js(f"const fs = await import('node:fs'); return flow.sprint(fs.readFileSync({json.dumps(str(path))}, 'utf8'));")


def edited(text: str, old: str, new: str) -> str:
    assert text.count(old) == 1, old
    return text.replace(old, new)


def problems(text: str) -> list:
    return [(f["line"], f["kind"], f["rule"], f["what"]) for f in sprint_of(text)["problems"]]


class TestASprintIsRead(unittest.TestCase):
    def test_a_running_sprint_without_a_time_box_is_read_into_its_parts_and_its_end_is_empty(self):
        s = sprint_of(OPEN)
        self.assertEqual((s["id"], s["goal"], s["start"], s["end"]),
                         ("sprint-02", "The thesis is exported as PDF, and the export is measured", "2026-09-15", None))
        self.assertEqual(s["selection"], ["ITM-014", "ITM-017", "ITM-016"])
        self.assertEqual((s["closer"], s["branch"], s["model"], s["plannedBy"]),
                         ("bob-agent", "sprint/02", "fixture-scrum-wip", "alice"))
        self.assertEqual(s["problems"], [])

    def test_a_closed_sprint_names_its_end(self):
        s = sprint_file(SPRINTS / "closed.md")
        self.assertEqual((s["id"], s["start"], s["end"], s["selection"]), ("sprint-01", "2026-09-01", "2026-09-12", ["ITM-016"]))
        self.assertEqual(s["problems"], [])

    def test_a_sprint_naming_no_closer_and_no_branch_leaves_both_empty(self):
        s = sprint_file(SPRINTS / "timeboxed.md")
        self.assertEqual((s["end"], s["closer"], s["branch"]), ("2026-09-28", None, None))
        self.assertEqual(s["problems"], [])


class TestASprintThatIsNotOne(unittest.TestCase):
    def test_counter_proof_a_text_without_front_matter_is_no_sprint_record(self):
        self.assertEqual([p[:3] for p in problems(OPEN.split("---\n", 2)[2])],
                         [(1, "error", "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY")])

    def test_counter_proof_a_sprint_without_an_id_or_a_start_is_a_problem(self):
        self.assertEqual(problems(edited(OPEN, "id: sprint-02\n", "")),
                         [(1, "error", "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY", "the sprint record has no id")])
        self.assertEqual(problems(edited(OPEN, "start: 2026-09-15\n", "start:\n")),
                         [(4, "error", SELECTED, "the sprint has no start date")])

    def test_counter_proof_a_date_that_is_no_date_or_an_end_before_the_start_is_a_problem(self):
        self.assertEqual(problems(edited(OPEN, "start: 2026-09-15\n", "start: 15.09.2026\n")),
                         [(4, "error", SELECTED, 'the start "15.09.2026" is no date YYYY-MM-DD')])
        self.assertEqual(problems(edited(OPEN, "end:\n", "end: soon\n")),
                         [(5, "error", SELECTED, 'the end "soon" is no date YYYY-MM-DD')])
        self.assertEqual(problems(edited(OPEN, "end:\n", "end: 2026-09-14\n")),
                         [(5, "error", SELECTED, "the end 2026-09-14 lies before the start 2026-09-15")])

    def test_counter_proof_a_selection_that_selects_no_item_once_is_a_problem(self):
        self.assertEqual(problems(edited(OPEN, "selection:\n  - ITM-014\n  - ITM-017\n  - ITM-016\n", "selection: ITM-014\n")),
                         [(6, "error", SELECTED, "the selection is not a list")])
        self.assertEqual(problems(edited(OPEN, "selection:\n  - ITM-014\n  - ITM-017\n  - ITM-016\n", "selection: []\n")),
                         [(6, "error", SELECTED, "the sprint selects no item")])
        self.assertEqual(problems(edited(OPEN, "  - ITM-017\n", "  - export\n")),
                         [(8, "error", SELECTED, 'the selection names "export", which is no item ITM-<nnn>')])
        self.assertEqual(problems(edited(OPEN, "  - ITM-016\n", "  - ITM-014\n")),
                         [(9, "error", SELECTED, "the selection names ITM-014 a second time")])


class TestAgentMsOwnSprints(unittest.TestCase):
    """The sprint records of this repository: Agent M is the instance's own product (`docs/process.md`)."""

    OWN = DOCS / "backlog" / "sprints"

    def table_items(self, path) -> list:
        """The identifiers in the Item column of the record's *Selection* table, in its order — read here, not by the
        module, to compare the module's reading of the front matter with what the record shows."""
        text = path.read_text(encoding="utf-8")
        table = text.split("\n## Selection\n", 1)[1].split("\n## ", 1)[0]
        return [m.group(1) for m in re.finditer(r"^\| \d+ \| (ITM-\d{3}) \|", table, re.M)]

    def test_every_sprint_record_of_this_repository_is_read_without_a_problem(self):
        paths = sorted(self.OWN.glob("*.md"))
        self.assertGreaterEqual(len(paths), 2)
        items = {p.name[:7] for p in (DOCS / "backlog").glob("ITM-*.md")}
        for path in paths:
            s = sprint_file(path)
            self.assertEqual(s["problems"], [], path.name)
            self.assertEqual(s["id"], path.stem, path.name)
            self.assertEqual(s["selection"], self.table_items(path), path.name)
            self.assertEqual(sorted(set(s["selection"]) - items), [], path.name)

    # Agent M's own sprint records as they stood while sprint 02 ran (docs/backlog/sprints/ at 87b3268, `end:` empty in
    # sprint-02.md), frozen: a test of the live records' state would break at every sprint close.
    FROZEN = FIX / "agent-m"

    def test_sprint_01_is_closed_and_sprint_02_runs(self):
        one, two = sprint_file(self.FROZEN / "sprint-01.md"), sprint_file(self.FROZEN / "sprint-02.md")
        self.assertEqual((one["end"], one["branch"], len(one["selection"])), ("2026-10-01", "sprint/01", 15))
        self.assertEqual((two["end"], two["branch"], two["closer"], two["plannedBy"]),
                         (None, "sprint/02", "scrum-master-session", "po-fable"))
        self.assertEqual(len(two["selection"]), 25)


class TestOnlyTheSelectionStarts(unittest.TestCase):
    """The Scrum fixture: a time box of two weeks; the sprint `timeboxed` runs from 2026-09-15 to 2026-09-28 and selects
    ITM-015 and ITM-014."""

    def test_a_selected_item_starts(self):
        got = item_state("ITM-015", "scrum", sprint="timeboxed", today="2026-09-20")
        self.assertEqual((got["state"], got["reasons"]), ("ready", []))

    def test_an_item_outside_the_selection_is_refused_with_the_sprint_named(self):
        got = item_state("ITM-016", "scrum", sprint="timeboxed", today="2026-09-20")
        self.assertEqual(got["state"], "ready")
        self.assertEqual(got["reasons"], [{"kind": "not-selected", "rule": SELECTED, "sprint": "sprint-07"}])

    def test_with_no_sprint_running_nothing_starts(self):
        got = item_state("ITM-015", "scrum", sprint=None)
        self.assertEqual(got["reasons"], [{"kind": "no-sprint", "rule": SELECTED}])

    def test_a_time_box_ends_on_its_end_date(self):
        self.assertTrue(starts(item_state("ITM-015", "scrum", sprint="timeboxed", today="2026-09-28")))
        got = item_state("ITM-015", "scrum", sprint="timeboxed", today="2026-09-29")
        self.assertEqual(got["reasons"], [{"kind": "sprint-ended", "rule": SELECTED, "sprint": "sprint-07", "end": "2026-09-28"}])

    def test_a_sprint_not_yet_begun_starts_nothing(self):
        got = item_state("ITM-015", "scrum", sprint="timeboxed", today="2026-09-14")
        self.assertEqual(got["reasons"], [{"kind": "sprint-not-started", "rule": SELECTED, "sprint": "sprint-07",
                                           "start": "2026-09-15"}])

    def test_without_a_time_box_a_recorded_end_ends_the_sprint(self):
        self.assertTrue(starts(item_state("ITM-014", "scrum-wip", sprint="open", today="2026-10-30")))
        got = item_state("ITM-016", "scrum-wip", sprint="closed", today="2026-09-05")
        self.assertEqual(kinds(got), ["sprint-ended"])

    def test_counter_proof_a_model_without_sprints_has_no_selection_to_keep(self):
        self.assertTrue(starts(item_state("ITM-015", "kanban", sprint=None)))
        self.assertTrue(starts(item_state("ITM-016", "kanban", sprint="timeboxed", today="2026-09-20")))


class TestSprintsAndALimitBothHold(unittest.TestCase):
    """The fixture scrum-wip: sprints without a time box and a WIP limit of 2; the sprint `open` selects ITM-014, ITM-017
    and ITM-016 (UC-032 step 7: only selected items are pulled, and only below the limit)."""

    def test_a_selected_item_above_the_limit_is_refused_for_the_limit_only(self):
        got = item_state("ITM-017", "scrum-wip", sprint="open", prs=[pr(1, "ITM-014"), pr(2, "ITM-016")])
        self.assertEqual(kinds(got), ["wip-limit"])
        self.assertEqual(got["reasons"][0]["rule"], WIP)

    def test_an_item_outside_the_selection_below_the_limit_is_refused_for_the_selection_only(self):
        got = item_state("ITM-015", "scrum-wip", sprint="open", prs=[pr(1, "ITM-014")])
        self.assertEqual(kinds(got), ["not-selected"])

    def test_an_item_outside_the_selection_above_the_limit_is_refused_for_both(self):
        got = item_state("ITM-015", "scrum-wip", sprint="open", prs=[pr(1, "ITM-014"), pr(2, "ITM-016")])
        self.assertEqual(kinds(got), ["not-selected", "wip-limit"])

    def test_a_selected_item_below_the_limit_starts(self):
        self.assertTrue(starts(item_state("ITM-017", "scrum-wip", sprint="open", prs=[pr(1, "ITM-014")])))


if __name__ == "__main__":
    unittest.main()
