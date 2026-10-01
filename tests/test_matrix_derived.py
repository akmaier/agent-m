# Module: MOD-traceability
# Guards: THE TRACEABILITY MATRIX IS DERIVED
# Level: unit
"""SPEC §1 THE TRACEABILITY MATRIX IS DERIVED — the traceability matrix is computed from the artifacts and is never
stored as a separately edited document.

MOD-traceability linkGraph(snapshot) builds one graph from the files of one commit, given as { files: { path: text } }:
the requirements of the SPEC, the use cases, the decisions and modules, and the Module: and Guards: lines of code and
tests (ARC-006, ARC-020). tracesTo(graph, name) is one row of the matrix — everything that names one requirement. The
files are the fixture product tests/fixtures/architecture/, never Agent M's own; each case edits a copy of it.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "architecture"
FILES = {p.relative_to(FIX).as_posix(): p.read_text(encoding="utf-8") for p in sorted(FIX.rglob("*")) if p.is_file()}
UC1, UC2 = "docs/use-cases/UC-001-read-a-file.md", "docs/use-cases/UC-002-show-the-status.md"
TEST = "tests/reader.test.js"


def edited(files: dict, path: str, old: str, new: str) -> dict:
    """A copy of `files` with one replacement in one file; the replaced text must be there."""
    assert old in files[path], (path, old)
    return {**files, path: files[path].replace(old, new)}


def matrix(files: dict, names=("RULE ONE", "THE READER'S RULE")) -> dict:
    """{ name: tracesTo } for each requirement — the rows of the matrix, from one graph of the files."""
    return js(f"const g = traceability.linkGraph({{ files: {json.dumps(files)} }});"
              f"return Object.fromEntries({json.dumps(list(names))}.map((n) => [n, traceability.tracesTo(g, n)]));")


class MatrixDerived(unittest.TestCase):
    def test_each_row_is_what_the_artifacts_name(self):
        m = matrix(FILES)
        self.assertEqual(m["RULE ONE"], {"sources": ["PO, 2026-09-30"], "useCases": ["UC-001"], "decisions": ["ARC-001"],
                                         "modules": ["MOD-reader"], "tests": [TEST], "proposals": []})
        self.assertEqual(m["THE READER'S RULE"], {"sources": ["PO, 2026-09-30, extended\n2026-09-30"], "useCases": ["UC-002"],
                                                  "decisions": [], "modules": ["MOD-review"], "tests": [], "proposals": []},
                         "a source that runs over two lines is kept as written")

    def test_an_edited_artifact_changes_the_row_it_names(self):
        # Derived, not stored: a use case that names one more requirement, and a test that guards one more, are in the row at
        # once; nothing else had to be edited.
        files = edited(FILES, UC2, "realises:\n  - THE READER'S RULE\n", "realises:\n  - THE READER'S RULE\n  - RULE ONE\n")
        files = edited(files, TEST, "// Guards: RULE ONE\n", "// Guards: RULE ONE; THE READER'S RULE\n")
        m = matrix(files)
        self.assertEqual(m["RULE ONE"]["useCases"], ["UC-001", "UC-002"])
        self.assertEqual(m["THE READER'S RULE"]["tests"], [TEST])
        # And an artifact removed leaves the row.
        gone = {p: t for p, t in FILES.items() if p != UC1}
        self.assertEqual(matrix(gone)["RULE ONE"]["useCases"], [])

    def test_counter_proof_a_stored_matrix_is_not_read(self):
        # A matrix kept by hand beside the artifacts — and a matrix table in a use case — claims links nobody stated. The graph
        # reads the names the artifacts state, so the rows stay as the artifacts give them.
        stored = ("# Traceability matrix\n\n| Requirement | Use case | Module | Test |\n|---|---|---|---|\n"
                  "| RULE ONE | UC-002 | MOD-page | tests/page.test.js |\n| THE READER'S RULE | UC-001 | MOD-reader | |\n")
        files = {**FILES, "docs/traceability.md": stored, "docs/matrix.md": stored,
                 UC1: FILES[UC1] + "\n" + stored}
        self.assertEqual(matrix(files), matrix(FILES))

    def test_the_graph_is_a_value_of_the_files_alone(self):
        # The same files give the same graph, the files are not changed by building it, and nothing is kept between two
        # builds: a graph of other files does not remember the first.
        r = js(f"const files = {json.dumps(FILES)}; const copy = JSON.stringify(files);"
               "const a = traceability.linkGraph({ files }), b = traceability.linkGraph({ files });"
               "const other = traceability.linkGraph({ files: {} });"
               "return [JSON.stringify(a) === JSON.stringify(b), JSON.stringify(files) === copy,"
               "  traceability.tracesTo(a, 'RULE ONE').useCases, traceability.tracesTo(other, 'RULE ONE'),"
               "  JSON.parse(JSON.stringify(a)).nodes['RULE ONE'].kind];")
        self.assertEqual(r, [True, True, ["UC-001"], {"sources": [], "useCases": [], "decisions": [], "modules": [],
                                                      "tests": [], "proposals": []}, "requirement"])


if __name__ == "__main__":
    unittest.main()
