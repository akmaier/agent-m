# Module: MOD-traceability
# Guards: A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
# Level: unit
"""SPEC §1 A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION — a cross-reference names the identifier it points at,
never a section number or line number.

MOD-traceability linkGraph(snapshot) links artifacts by the identifiers they state (ARC-006): a requirement by its name,
a use case, decision or module by its identifier, whatever section, line or file name it stands in. A reference by
position — a section number, a line number, a file and line — names no identifier, so it reaches no artifact and is kept
among the unknown names, where the gaps show it. The files are the fixture product tests/fixtures/architecture/.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "architecture"
FILES = {p.relative_to(FIX).as_posix(): p.read_text(encoding="utf-8") for p in sorted(FIX.rglob("*")) if p.is_file()}
UC1, UC2 = "docs/use-cases/UC-001-read-a-file.md", "docs/use-cases/UC-002-show-the-status.md"
READER, TEST = "docs/architecture/MOD-reader.md", "tests/reader.test.js"
NAMES = ["RULE ONE", "THE READER'S RULE"]


def edited(files: dict, path: str, old: str, new: str) -> dict:
    assert old in files[path], (path, old)
    return {**files, path: files[path].replace(old, new)}


def view(files: dict) -> dict:
    """What the graph links: each requirement's row, every module's impact list for a change of its text, and the unknown
    names with what names them."""
    return js(f"const g = traceability.linkGraph({{ files: {json.dumps(files)} }});"
              f"return {{ rows: Object.fromEntries({json.dumps(NAMES)}.map((n) => [n, traceability.tracesTo(g, n)])),"
              "  impact: Object.fromEntries(" + json.dumps(NAMES) + ".map((n) => [n, traceability.requirementImpact(g, n)])),"
              "  unknown: traceability.coverageGaps(g).unknownNames };")


class ReferencesByIdentifier(unittest.TestCase):
    def test_moving_a_requirement_or_renaming_a_file_moves_no_reference(self):
        before = view(FILES)
        # The SPEC renumbered and RULE ONE moved below THE READER'S RULE, into a section of its own.
        spec = FILES["SPEC.md"]
        rule_one = "**RULE ONE** *(PO, 2026-09-30)*\nThe first rule.\n*Check:* none\n\n"
        assert rule_one in spec
        moved = spec.replace("## 1. Rules", "## 3. Rules").replace(rule_one, "")
        moved = moved.replace("**OLD RULE**", "## 7. Moved\n\n" + rule_one + "**OLD RULE**")
        files = {**FILES, "SPEC.md": moved}
        # The use case's file renamed — its identifier stays.
        files[UC1.replace("read-a-file", "reading-files")] = files.pop(UC1)
        after = view(files)
        self.assertEqual(after["rows"], before["rows"])
        self.assertEqual([[(a["id"], a["via"]) for a in after["impact"][n]] for n in NAMES],
                         [[(a["id"], a["via"]) for a in before["impact"][n]] for n in NAMES])
        self.assertEqual(after["unknown"], before["unknown"])
        self.assertEqual([a["path"] for a in after["impact"]["RULE ONE"] if a["id"] == "UC-001"],
                         ["docs/use-cases/UC-001-reading-files.md"], "found under its new path, by its identifier")

    def test_counter_proof_a_reference_by_position_reaches_nothing(self):
        # RULE ONE stands in section 1 of the SPEC, at line 7 — a use case, a module and a test that point there by position
        # reach no requirement: the row of RULE ONE does not grow, and each position is an unknown name.
        files = edited(FILES, UC2, "  - THE READER'S RULE\n", "  - THE READER'S RULE\n  - §1\n")
        files = edited(files, READER, "  - RULE ONE\n", "  - RULE ONE\n  - SPEC.md:7\n")
        files = edited(files, TEST, "// Guards: RULE ONE\n", "// Guards: RULE ONE; section 1\n")
        v = view(files)
        self.assertEqual(v["rows"]["RULE ONE"], view(FILES)["rows"]["RULE ONE"])
        unknown = {u["name"]: u for u in v["unknown"]}
        self.assertEqual(unknown["§1"]["from"], ["UC-002"])
        self.assertEqual(unknown["SPEC.md:7"]["from"], ["MOD-reader"])
        self.assertEqual(unknown["section 1"]["from"], [TEST])
        self.assertFalse(any(u["withdrawn"] for u in (unknown["§1"], unknown["SPEC.md:7"], unknown["section 1"])))

    def test_counter_proof_a_name_spelled_otherwise_is_another_name(self):
        # The identifier is the name exactly as the SPEC writes it: a name in other letters or with its apostrophe changed
        # is not the requirement, wherever it stands.
        files = edited(FILES, UC2, "  - THE READER'S RULE\n", "  - THE READERS RULE\n")
        v = view(files)
        self.assertEqual(v["rows"]["THE READER'S RULE"]["useCases"], [])
        self.assertIn("THE READERS RULE", [u["name"] for u in v["unknown"]])


if __name__ == "__main__":
    unittest.main()
