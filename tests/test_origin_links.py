# Module: MOD-identifiers
# Guards: EVERY ARTIFACT NAMES ITS ORIGIN
# Level: unit
"""SPEC §1 EVERY ARTIFACT NAMES ITS ORIGIN — a requirement names its source, a use case the requirements it realises, an
architecture decision the requirements or use cases that force it and the modules it designs, and a test the requirement it
guards and the module it exercises.

Each artifact names what it descends from by identifiers of MOD-identifiers' scheme, in its format, and the module of the
format decides whether it does: a decision's `forced_by` and `designs` by MOD-documents' documentFindings (the decision
schema names them under this requirement); a test's `guards` and `module` by MOD-test-document's testFindings; a use case's
`realises` by documentFindings, which requires the key, and a use case whose `realises` holds nothing is listed by
MOD-trace-graph's coverageGaps, since UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN. That a requirement names its source
is checked in tests/test_requirement_has_source.py. The files are a small fixture product written below, never Agent M's own;
each counter-proof breaks a copy of it.
"""
import unittest

from artifact_checks import module_call

RULE = "EVERY ARTIFACT NAMES ITS ORIGIN"
UC = "docs/use-cases/UC-001-read-a-file.md"
ARC = "docs/architecture/ARC-001-static-client.md"
TEST = "tests/reader.test.mjs"
# The comment marker of the fixture's declaration, joined when the test runs, so that neither this file nor its compiled form
# holds a line that declares a test of its own.
C = "".join(["/", "/"])

PRODUCT = {
    "SPEC.md": ("# Fixture product — Specification\n\n## 1. Reading\n\n"
                "**A FILE IS READ WHOLE** *(PO)*\nA file is read from its first byte to its last.\n*Check:* `tests/reader.test.mjs`\n"),
    UC: ("---\nid: UC-001\ntitle: Read a file\narea: Reading\nactors:\n  - Author\nrealises:\n  - A FILE IS READ WHOLE\n---\n"
         "# UC-001 Read a file\n"),
    ARC: ("---\nid: ARC-001\ntitle: A static client reads the files\nforced_by:\n  - UC-001\ndesigns:\n  - MOD-reader\n---\n"
          "# ARC-001 A static client reads the files\n"),
    TEST: (f"{C} TST-001 · level: unit · module: MOD-reader\n{C} guards: A FILE IS READ WHOLE; UC-001\n{C} given: a file\n"
           f"{C} input: the file read\n{C} expect: its last byte read\ntest(\"a file is read to its last byte\", () => {{}});\n"),
}

ORIGINS = """
const out = [];
for (const [path, text] of Object.entries(D.files)) {
  if (path.startsWith('docs/')) {
    const schema = documents.artifactSchemaOf(path);
    for (const f of documents.documentFindings(schema, documents.readDocument(schema, path, text))) {
      if (D.rules.includes(f.rule)) out.push([f.artifact, f.rule, f.what]);
    }
  } else if (testDocument.isTestFile(path)) {
    for (const d of testDocument.testDeclarations(path, text)) {
      for (const f of testDocument.testFindings(d)) if (D.rules.includes(f.rule)) out.push([f.artifact, f.rule, f.what]);
    }
  }
}
return out;
"""


def origins(files: dict, rules=(RULE,)) -> list:
    """[[artifact, rule, what]] — the findings under `rules` of the decisions, use cases and tests of `files`."""
    return module_call(ORIGINS, {"files": files, "rules": list(rules)})


def edited(path: str, old: str, new: str) -> dict:
    """A copy of the product with one replacement in one file; the replaced text must be there."""
    assert old in PRODUCT[path], (path, old)
    return {**PRODUCT, path: PRODUCT[path].replace(old, new)}


def unrealised(files: dict) -> list:
    """The use cases coverageGaps lists as realising no requirement, over the graph of `files`."""
    return module_call("const g = await traceGraph.traceGraph({ paths: Object.keys(D), read: async (p) => D[p] ?? null });"
                       "return traceGraph.coverageGaps(g).useCasesWithoutRequirement;", files)


class OriginLinks(unittest.TestCase):
    def test_every_artifact_of_the_fixture_names_its_origin(self):
        self.assertEqual(origins(PRODUCT, (RULE, "A USE CASE REALISES NAMED REQUIREMENTS")), [])
        self.assertEqual(unrealised(PRODUCT), [])

    def assert_one(self, files: dict, artifact: str, rule: str, label: str):
        self.assertEqual([(f[0], f[1]) for f in origins(files, (rule,))], [(artifact, rule)], label)

    def test_counter_proof_a_decision_that_names_nothing_that_forces_it(self):
        self.assert_one(edited(ARC, "forced_by:\n  - UC-001\n", "forced_by: []\n"), "ARC-001", RULE, "forced by nothing")
        self.assert_one(edited(ARC, "forced_by:\n  - UC-001\n", ""), "ARC-001", RULE, "without forced_by")
        self.assert_one(edited(ARC, "  - UC-001\n", "  - the reader\n"), "ARC-001", RULE,
                        "forced by an entry that is neither a requirement's name nor a use case")
        self.assert_one(edited(ARC, "  - MOD-reader\n", "  - the reader module\n"), "ARC-001", RULE,
                        "designing an entry that is no module")

    def test_counter_proof_a_use_case_that_names_nothing_it_realises(self):
        self.assert_one(edited(UC, "realises:\n  - A FILE IS READ WHOLE\n", ""), "UC-001",
                        "A USE CASE REALISES NAMED REQUIREMENTS", "a use case without realises")
        self.assertEqual(unrealised(edited(UC, "realises:\n  - A FILE IS READ WHOLE\n", "realises: []\n")), ["UC-001"],
                         "a use case that realises nothing is listed")

    def test_counter_proof_a_test_that_names_no_module_or_guards_nothing(self):
        self.assert_one(edited(TEST, " · module: MOD-reader", ""), "TST-001", RULE, "no module")
        self.assert_one(edited(TEST, " · module: MOD-reader", " · module: system"), "TST-001", RULE,
                        "a unit test that names system, not a module")
        self.assert_one(edited(TEST, "// guards: A FILE IS READ WHOLE; UC-001\n", ""), "TST-001", RULE, "no guards")
        self.assert_one(edited(TEST, "// guards: A FILE IS READ WHOLE; UC-001\n", "// guards:\n"), "TST-001", RULE,
                        "an empty guards line")
        self.assert_one(edited(TEST, "A FILE IS READ WHOLE; UC-001", "A FILE IS READ WHOLE; the reader"), "TST-001",
                        "A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION",
                        "a guarded entry that is neither a requirement's name nor a use case")

    def test_guards_are_names_separated_by_semicolons(self):
        text = PRODUCT[TEST].replace("A FILE IS READ WHOLE; UC-001", "ONE DEFINITION, THREE DRIVERS; UC-001;  A RULE  ")
        got = module_call("return testDocument.testDeclarations(D.path, D.text).map((d) => d.guards);",
                          {"path": TEST, "text": text})
        self.assertEqual(got, [["ONE DEFINITION, THREE DRIVERS", "UC-001", "A RULE"]],
                         "a comma belongs to a name; a semicolon separates two")


if __name__ == "__main__":
    unittest.main()
