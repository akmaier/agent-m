# Module: MOD-identifiers
# Guards: EVERY ARTIFACT HAS AN IDENTIFIER
# Level: unit
"""SPEC §1 EVERY ARTIFACT HAS AN IDENTIFIER — a requirement its name in capitals, every other artifact one
from the scheme SRC- · UC- · ARC- · MOD- · TST- · ITM- · RES- · JOB-.

MOD-identifiers' kindOfIdentifier tells the kind of an identifier by the scheme, and identifiersIn finds where a text writes
it. Where each artifact carries its identifier is its format's: a requirement's name is read by MOD-spec-document (parseSpec,
and requirementFindings for a name that is not in capitals), the identifier of a use case, a decision, a module and an item
by MOD-documents (artifactSchemaOf, readDocument, and documentFindings for an identifier that is missing or of another kind),
a test case's by MOD-test-document (testDeclarations). Each finding counted here is one under
this requirement. The files are a small fixture product written below, never Agent M's own (KEIN SPEC-ZUGRIFF AUS
PRODUKT-CODE); each counter-proof breaks a copy of it.

Readings, each named: "carries an identifier" is read of each artifact on its own — that two artifacts carry the same one is
no part of this requirement's text (a requirement's name given twice is THE NAME IS THE ID AND IT SURVIVES', decided by
requirementFindings), and neither is that the identifier a file carries be the one its path gives; a test file whose cases declare no identifier carries none; a file under an artifact's folder whose path
is no artifact's path of its format carries none.
"""
import unittest

from artifact_checks import module_call

RULE = "EVERY ARTIFACT HAS AN IDENTIFIER"
# The comment marker of the fixture's declarations, joined when the test runs, so that neither this file nor its compiled form
# holds a line that declares a test of its own.
C = "".join(["/", "/"])

PRODUCT = {
    "SPEC.md": ("# Fixture product — Specification\n\n## 1. Reading\n\n"
                "**A FILE IS READ WHOLE** *(PO)*\nA file is read from its first byte to its last.\n*Check:* `tests/reader.test.mjs`\n\n"
                "**EVERY FILE HAS A STATUS** *(PO)*\nEvery file read has a status.\n*Check:* `tests/reader.test.mjs`\n"),
    "docs/use-cases/UC-001-read-a-file.md": ("---\nid: UC-001\ntitle: Read a file\narea: Reading\nactors:\n  - Author\n"
                                             "realises:\n  - A FILE IS READ WHOLE\n---\n# UC-001 Read a file\n"),
    "docs/architecture/ARC-001-static-client.md": ("---\nid: ARC-001\ntitle: A static client reads the files\nforced_by:\n"
                                                   "  - UC-001\n---\n# ARC-001 A static client reads the files\n"),
    "docs/architecture/MOD-reader.md": ("---\nid: MOD-reader\ntitle: Reads a file whole\nfolder: src/reader/\nrealises:\n"
                                        "  - A FILE IS READ WHOLE\nfollows:\n  - ARC-001\nuses: []\nprovides: []\n---\n"
                                        "# MOD-reader Reads a file whole\n"),
    "docs/backlog/ITM-1000-read-files-whole.md": ("---\nid: ITM-1000\ntitle: Read files whole\n---\n# ITM-1000 Read files whole\n"),
    "tests/reader.test.mjs": (f"{C} TST-001 · level: unit · module: MOD-reader\n{C} guards: A FILE IS READ WHOLE\n"
                              "test(\"a file is read to its last byte\", () => {});\n\n"
                              f"{C} TST-002 · level: unit · module: MOD-reader\n{C} guards: EVERY FILE HAS A STATUS\n"
                              "test(\"an empty file is read as empty\", () => {});\n"),
}

CARRIED = """
const RULE = 'EVERY ARTIFACT HAS AN IDENTIFIER';
const out = { items: [], problems: [] };
const placeOf = (path, text, id) => identifiers.identifiersIn(path, text).find((p) => p.id === id)?.line ?? null;
for (const [path, text] of Object.entries(D)) {
  if (path === 'SPEC.md') {
    const spec = specDocument.parseSpec(text);
    const named = new Set(specDocument.requirementFindings(spec).filter((f) => f.rule === RULE).map((f) => f.artifact));
    for (const r of spec.requirements.values()) {
      if (named.has(r.name)) out.problems.push([path, r.line, r.name]);
      else out.items.push([r.name, identifiers.kindOfIdentifier(r.name), path, placeOf(path, text, r.name)]);
    }
  } else if (testDocument.isTestFile(path)) {
    const declared = testDocument.testDeclarations(path, text);
    if (!declared.length) out.problems.push([path, 1, null]);
    for (const d of declared) {
      if (identifiers.kindOfIdentifier(d.id) === 'TST') out.items.push([d.id, 'TST', path, placeOf(path, text, d.id)]);
      else out.problems.push([path, d.line, d.id]);
    }
  } else {
    const schema = documents.artifactSchemaOf(path);
    if (!schema) { out.problems.push([path, 1, null]); continue; }
    const doc = documents.readDocument(schema, path, text);
    const found = documents.documentFindings(schema, doc).filter((f) => f.rule === RULE);
    for (const f of found) out.problems.push([path, f.line, f.artifact]);
    if (!found.length) out.items.push([doc.id, identifiers.kindOfIdentifier(doc.id), path, placeOf(path, text, doc.id)]);
  }
}
return out;
"""


def carried(files: dict) -> dict:
    """{ items: [[id, kind, path, line]], problems: [[path, line, what is named]] } — each artifact of `files` with the
    identifier it carries, its kind by the scheme and the line identifiersIn finds it on; or the place of an artifact that
    carries none of the scheme."""
    return module_call(CARRIED, files)


def edited(files: dict, changes: dict) -> dict:
    """A copy of `files` with `changes` applied: a text replaces a file, None removes it."""
    out = dict(files)
    for path, text in changes.items():
        if text is None:
            out.pop(path, None)
        else:
            out[path] = text
    return out


class Identifiers(unittest.TestCase):
    def test_the_kind_of_an_identifier_is_told_by_its_form(self):
        kinds = {"THE STATUS IS SHOWN": "requirement", "SRC-po": "SRC", "UC-001": "UC", "UC-1000": "UC", "ARC-001": "ARC",
                 "MOD-reader": "MOD", "TST-001": "TST", "ITM-001": "ITM", "ITM-1000": "ITM", "RES-gpu-cluster": "RES",
                 "JOB-20260924-1432-7f3a": "JOB"}
        got = module_call("return Object.fromEntries(D.map((i) => [i, identifiers.kindOfIdentifier(i)]));", list(kinds))
        self.assertEqual(got, kinds)

    def test_counter_proof_a_malformed_identifier_has_no_kind(self):
        bad = ["UC-1", "uc-001", "UC-001-read", "MOD-Reader", "MOD-", "TST-12", "ITM-99", "RES-", "SRC_po",
               "JOB-", "The status is shown", ""]
        self.assertEqual(module_call("return D.map((i) => identifiers.kindOfIdentifier(i));", bad), [None] * len(bad))

    def test_every_artifact_of_the_fixture_carries_an_identifier_where_its_format_writes_it(self):
        r = carried(PRODUCT)
        self.assertEqual(r["problems"], [])
        self.assertEqual(sorted(r["items"]), sorted([
            ["A FILE IS READ WHOLE", "requirement", "SPEC.md", 5], ["EVERY FILE HAS A STATUS", "requirement", "SPEC.md", 9],
            ["UC-001", "UC", "docs/use-cases/UC-001-read-a-file.md", 2],
            ["ARC-001", "ARC", "docs/architecture/ARC-001-static-client.md", 2],
            ["MOD-reader", "MOD", "docs/architecture/MOD-reader.md", 2],
            ["ITM-1000", "ITM", "docs/backlog/ITM-1000-read-files-whole.md", 2],
            ["TST-001", "TST", "tests/reader.test.mjs", 1], ["TST-002", "TST", "tests/reader.test.mjs", 5],
        ]))

    def assert_one(self, changes: dict, path: str, label: str):
        r = carried(edited(PRODUCT, changes))
        self.assertEqual([p[0] for p in r["problems"]], [path], label)
        self.assertTrue(r["problems"][0][1] >= 1, label)

    def test_counter_proof_an_artifact_without_an_identifier(self):
        uc, arc = "docs/use-cases/UC-001-read-a-file.md", "docs/architecture/ARC-001-static-client.md"
        self.assert_one({uc: PRODUCT[uc].replace("id: UC-001\n", "")}, uc, "a use case without its id")
        self.assert_one({arc: PRODUCT[arc].replace("id: ARC-001", "id: ARC-1")}, arc, "a decision whose id is of no kind")
        self.assert_one({uc: None, "docs/use-cases/read-a-file.md": PRODUCT[uc]}, "docs/use-cases/read-a-file.md",
                        "a use case whose path carries no identifier")
        itm = "docs/backlog/ITM-1000-read-files-whole.md"
        self.assert_one({itm: None, "docs/backlog/ITM-99-read-files-whole.md": PRODUCT[itm].replace("ITM-1000", "ITM-99")},
                        "docs/backlog/ITM-99-read-files-whole.md", "a backlog item numbered with two digits")

    def test_counter_proof_a_requirement_without_a_name_in_capitals(self):
        spec = PRODUCT["SPEC.md"].replace("**EVERY FILE HAS A STATUS**", "**Every file has a status**")
        r = carried(edited(PRODUCT, {"SPEC.md": spec}))
        self.assertEqual(r["problems"], [["SPEC.md", 9, "Every file has a status"]])

    def test_counter_proof_a_test_whose_cases_carry_no_identifier(self):
        t = "tests/reader.test.mjs"
        self.assert_one({t: PRODUCT[t].replace(f"{C} TST-001 · ", f"{C} ").replace(f"{C} TST-002 · ", f"{C} ")}, t,
                        "no case declares a TST- identifier")
        self.assert_one({t: PRODUCT[t].replace("TST-002", "TST-02")}, t, "a malformed TST- identifier")


if __name__ == "__main__":
    unittest.main()
