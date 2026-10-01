# Module: MOD-traceability
# Guards: A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
# Level: unit
"""SPEC §3 A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST — before an existing requirement is changed, the artifacts
that reference it are listed, and the list is part of the proposal rather than a result reported afterwards.

MOD-traceability requirementImpact(graph, name) lists every artifact that names a requirement — the use cases realising
it, the decisions it forces, the modules realising it and the tests guarding it —, derived from the files of the commit
the proposal is shown at. The graph of that commit holds the open queue entries too (linkGraph reads
docs/spec-freigaben/<queue>/<nn>-<slug>.md), each with what it would change, so a change proposal touching an existing
requirement is shown with that requirement's list (UC-006 3b, shown by ITM-134). The files are the fixture product
tests/fixtures/architecture/ with one queue entry added.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "architecture"
FILES = {p.relative_to(FIX).as_posix(): p.read_text(encoding="utf-8") for p in sorted(FIX.rglob("*")) if p.is_file()}
UC1, UC2 = "docs/use-cases/UC-001-read-a-file.md", "docs/use-cases/UC-002-show-the-status.md"
QUEUE = "docs/spec-freigaben/2026-10-01_rules"
ENTRY = f"{QUEUE}/01-rules.md"
# The entry replaces the section: RULE ONE changed in its rule, THE READER'S RULE withdrawn, RULE NEW added, OLD RULE as it is.
PROPOSAL = """## 1. Rules

**RULE ONE** *(PO, 2026-09-30, reworded 2026-10-01)*
The first rule, reworded.
*Check:* none

**THE READER'S RULE** *(PO, 2026-09-30, extended
2026-09-30 — withdrawn 2026-10-01)*
*Withdrawn:* folded into `RULE ONE`. The name is not reused.

**RULE NEW** *(PO, 2026-10-01)*
A new rule.
*Check:* none

**OLD RULE** *(PO, 2026-09-29, reworded 2026-09-29 —
withdrawn 2026-09-30)*
*Withdrawn:* replaced by `RULE ONE`. The name is not reused.
"""
# Its rationale quotes a requirement in the SPEC's form; a rationale is not an entry and proposes nothing.
WITH_ENTRY = {**FILES, ENTRY: PROPOSAL,
              f"{QUEUE}/01-rules.begruendung.md": "**RULE ONE** *(PO, 2026-10-01)*\nA rule the rationale quotes.\n*Check:* none\n",
              f"{QUEUE}/index.md": "| Nr | Datei |\n|---|---|\n| 01 | `SPEC.md` |\n"}


def run(files: dict, expr: str, status=None):
    snap = {"files": files, **({"status": status} if status else {})}
    return js(f"const g = traceability.linkGraph({json.dumps(snap)}); {expr}")


def impact(files: dict, name: str) -> list:
    return run(files, f"return traceability.requirementImpact(g, {json.dumps(name)});")


class ImpactOfARequirementChange(unittest.TestCase):
    def test_every_artifact_naming_the_requirement_is_listed(self):
        self.assertEqual(impact(FILES, "RULE ONE"), [
            {"id": "UC-001", "kind": "use-case", "path": UC1, "via": "realises"},
            {"id": "ARC-001", "kind": "architecture-decision", "path": "docs/architecture/ARC-001-static-client.md",
             "via": "forced_by"},
            {"id": "MOD-reader", "kind": "module", "path": "docs/architecture/MOD-reader.md", "via": "realises"},
            {"id": "tests/reader.test.js", "kind": "test", "path": "tests/reader.test.js", "via": "guards"},
        ])
        self.assertEqual([a["id"] for a in impact(FILES, "THE READER'S RULE")], ["UC-002", "MOD-review"])

    def test_the_open_entry_is_shown_with_what_it_would_change_and_the_list_of_each_existing_name(self):
        rows = run(WITH_ENTRY, "return ['RULE ONE', \"THE READER'S RULE\", 'RULE NEW', 'OLD RULE'].map((n) =>"
                               "  [n, traceability.tracesTo(g, n).proposals, traceability.requirementImpact(g, n).map((a) => a.id)]);")
        self.assertEqual(rows, [
            ["RULE ONE", [{"entry": ENTRY, "change": "change", "status": None}],
             ["UC-001", "ARC-001", "MOD-reader", "tests/reader.test.js"]],
            ["THE READER'S RULE", [{"entry": ENTRY, "change": "withdraw", "status": None}], ["UC-002", "MOD-review"]],
            ["RULE NEW", [{"entry": ENTRY, "change": "add", "status": None}], []],
            ["OLD RULE", [], []],
        ])
        # The list is derived at the commit the proposal is shown at: the queue entry changes no list, the SPEC is unchanged.
        self.assertEqual(impact(WITH_ENTRY, "RULE ONE"), impact(FILES, "RULE ONE"))

    def test_a_withdrawn_requirement_lists_what_still_names_it(self):
        files = {**FILES, UC2: FILES[UC2].replace("  - THE READER'S RULE\n", "  - THE READER'S RULE\n  - OLD RULE\n")}
        self.assertEqual(impact(files, "OLD RULE"), [{"id": "UC-002", "kind": "use-case", "path": UC2, "via": "realises"}])

    def test_counter_proof_what_does_not_name_it_is_not_listed(self):
        self.assertEqual(impact(FILES, "RULE NEW"), [], "nothing names a requirement no artifact states")
        ids = [a["id"] for a in impact(FILES, "THE READER'S RULE")]
        self.assertNotIn("UC-001", ids)
        self.assertNotIn("tests/reader.test.js", ids)
        # A decided entry proposes nothing: an applied or superseded one touches no requirement any more.
        for status in ("applied", "superseded"):
            self.assertEqual(run(WITH_ENTRY, "return traceability.tracesTo(g, 'RULE ONE').proposals;", {ENTRY: status}), [],
                             status)
        self.assertEqual(run(WITH_ENTRY, "return traceability.tracesTo(g, 'RULE ONE').proposals;", {ENTRY: "stale"}),
                         [{"entry": ENTRY, "change": "change", "status": "stale"}])


# ITM-018, back from Release testing (finding D1): an entry replaces its whole section byte for byte (UC-006 step 6), so a live
# requirement of that section the entry no longer states leaves the SPEC when it is accepted — renamed in place or left out —,
# and is touched as a withdrawal (A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED: the old name leaves, the new one is added).
# The graph learns which section an entry replaces from the queue's index.md among the files (its anchor and end anchor, read
# with MOD-review-core's parseQueueIndex and sectionForEntry); without that index, it reads only the names the entry states.
INDEX = f"{QUEUE}/index.md"


def index_naming(anchor: str) -> str:
    """A queue index in the form the queues of this repository use, naming entry 01's anchor."""
    return ("# SPEC approvals — queue 2026-10-01_rules\n\n**Zieldatei aller Einträge:** `SPEC.md`\n\n"
            "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |\n|---|---|---|---|---|\n"
            f"| 01 | `SPEC.md` | {anchor} | — | — |\n")


READERS_RULE = ("**THE READER'S RULE** *(PO, 2026-09-30, extended\n2026-09-30)*\n"
                "A rule whose source runs over two lines and whose name has an apostrophe.\n*Check:* none\n")
RULE_ONE = "**RULE ONE** *(PO, 2026-09-30)*\nThe first rule.\n*Check:* none\n"
# RULE ONE renamed in place; THE READER'S RULE as the SPEC states it; OLD RULE, withdrawn already, left out.
RENAMED = ("## 1. Rules\n\n**RULE ONE, RENAMED** *(PO, 2026-10-01)*\nThe first rule, under another name.\n*Check:* none\n\n"
           + READERS_RULE)
# The heading renamed too — the index's anchor, not the entry's first line, names the section; THE READER'S RULE left out.
HEADING_RENAMED = "## 1. Rules of reading\n\n" + RULE_ONE


def proposals(files: dict, names: list) -> list:
    return run(files, f"return {json.dumps(names)}.map((n) => [n, traceability.tracesTo(g, n).proposals]);")


class AnEntryThatLeavesARequirementOutOfItsSection(unittest.TestCase):
    def test_a_requirement_renamed_in_place_is_touched_as_a_withdrawal(self):
        files = {**FILES, ENTRY: RENAMED, INDEX: index_naming("## 1. Rules")}
        self.assertEqual(proposals(files, ["RULE ONE", "RULE ONE, RENAMED", "THE READER'S RULE", "OLD RULE"]), [
            ["RULE ONE", [{"entry": ENTRY, "change": "withdraw", "status": None}]],
            ["RULE ONE, RENAMED", [{"entry": ENTRY, "change": "add", "status": None}]],
            ["THE READER'S RULE", []],
            ["OLD RULE", []],
        ])
        # Its impact list is the one the SPEC's artifacts give it, shown beside the entry (UC-006 3b).
        self.assertEqual([a["id"] for a in impact(files, "RULE ONE")], ["UC-001", "ARC-001", "MOD-reader", "tests/reader.test.js"])

    def test_the_section_is_the_one_the_index_names_not_the_entrys_first_line(self):
        files = {**FILES, ENTRY: HEADING_RENAMED, INDEX: index_naming("## 1. Rules")}
        self.assertEqual(proposals(files, ["RULE ONE", "THE READER'S RULE"]), [
            ["RULE ONE", []],
            ["THE READER'S RULE", [{"entry": ENTRY, "change": "withdraw", "status": None}]],
        ])

    def test_counter_proof_without_the_queues_index_or_its_section_nothing_is_guessed(self):
        # Without the index among the files, the graph reads only the names the entry states, as before.
        self.assertEqual(proposals({**FILES, ENTRY: RENAMED}, ["RULE ONE"]), [["RULE ONE", []]])
        # Another queue's index is not this entry's.
        other = "docs/spec-freigaben/2026-10-01b_other/index.md"
        self.assertEqual(proposals({**FILES, ENTRY: RENAMED, other: index_naming("## 1. Rules")}, ["RULE ONE"]),
                         [["RULE ONE", []]])
        # An anchor the SPEC does not hold names no section.
        self.assertEqual(proposals({**FILES, ENTRY: RENAMED, INDEX: index_naming("## 9. Nowhere")}, ["RULE ONE"]),
                         [["RULE ONE", []]])
        # An applied entry proposes nothing, whatever its section.
        self.assertEqual(run({**FILES, ENTRY: RENAMED, INDEX: index_naming("## 1. Rules")},
                             "return traceability.tracesTo(g, 'RULE ONE').proposals;", {ENTRY: "applied"}), [])


if __name__ == "__main__":
    unittest.main()
