# Module: MOD-test-document
# Guards: A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT
# Level: unit
"""SPEC §12 A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT — the check named
tests/test_expected_results_stated.py.

It lists every test that names a module (the `module` of its declaration, read through MOD-test-document's
testDeclarations) and reads SPEC.md, a file under docs/use-cases/ or a file under docs/architecture/ when it runs. The
list is for review; the decision stays human, so nothing here fails because a test is listed. The texts are small
fixture test files held in this file, and the repository's own tests.
"""
import json
import sys
import unittest
from pathlib import Path

from jsrun import js

ROOT = Path(__file__).resolve().parents[1]
ARCHITECTURE = "docs/architecture/MOD-reader.md"


def reading(path: str, text: str) -> list:
    return js(f"return testDocumentReads.testsReadingDocuments({json.dumps(path)}, {json.dumps(text)});")


def fixture(read: str, expected: str, module: str = "MOD-reader") -> str:
    """A node test file with one declared test that compares a function's result with `expected`, after `read`."""
    return (f'import {{ readFileSync }} from "node:fs";\n'
            f'import {{ read }} from "../src/reader/index.mjs";\n'
            f'{read}\n'
            f'// TST-000001 · level: unit · module: {module}\n'
            f'// guards: A FILE IS READ WHOLE\n'
            f'// given: a file\n'
            f'// input: read of it\n'
            f'// expect: its text\n'
            f'test("read", () => {{ assert.equal(read("a"), {expected}); }});\n')


MODULE_READ = f'const EXAMPLE = readFileSync(new URL("../{ARCHITECTURE}", import.meta.url), "utf8");'


class ExpectedResultsStated(unittest.TestCase):
    # TST-650001 · level: unit · module: MOD-test-document
    # guards: A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT
    # given: three test files, each with one declared test of MOD-reader and a read of a different document when it runs: SPEC.md, a use case, a module file
    # input: testsReadingDocuments of each file's path and text
    # expect: each file yields one entry, with the test's identifier, its module MOD-reader and the kind of document it reads: "SPEC.md", "docs/use-cases" or "docs/architecture"
    def test_a_test_that_reads_a_document_is_listed(self):
        reads = {
            "SPEC.md": 'const S = readFileSync(new URL("../SPEC.md", import.meta.url), "utf8");',
            "docs/use-cases": 'const U = readFileSync("docs/use-cases/UC-001-read-a-file.md", "utf8");',
            "docs/architecture": MODULE_READ,
        }
        for kind, read in reads.items():
            found = reading("tests/reader.test.mjs", fixture(read, "EXAMPLE"))
            self.assertEqual([(e["id"], e["module"], e["reads"]) for e in found],
                             [("TST-000001", "MOD-reader", [kind])], kind)

    # TST-650002 · level: unit · module: MOD-test-document
    # guards: A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT
    # given: the fixture test of TST-650001 that compares read's result with a value read from a module file; the same test stating that value in its own text; the same read in a test that names no module or only "system"; a read of a file under a fixtures folder
    # input: testsReadingDocuments of each text
    # expect: the first is listed; the second, the third and the fourth yield nothing
    def test_counter_proof_the_same_test_stating_its_value_is_not_listed(self):
        self.assertEqual(len(reading("tests/reader.test.mjs", fixture(MODULE_READ, "EXAMPLE"))), 1)
        self.assertEqual(reading("tests/reader.test.mjs", fixture("", '"the text of the file"')), [])
        for module in ("system", ""):
            text = fixture(MODULE_READ, "EXAMPLE", module)
            self.assertEqual(reading("tests/reader.test.mjs", text), [], repr(module))
        fixtures = 'const F = readFileSync(new URL("./fixtures/use-cases/UC-001-complete.md", import.meta.url), "utf8");'
        self.assertEqual(reading("tests/reader.test.mjs", fixture(fixtures, "F")), [])

    # TST-650003 · level: unit · module: MOD-test-document
    # guards: A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT
    # given: a Python test file with two declared tests of MOD-reader, the first reading a use case through a name assigned the path, the second reading nothing; and a node file whose read stands in the body of its second test only
    # input: testsReadingDocuments of each text
    # expect: the Python file lists only its first test, with docs/use-cases; the node file lists only its second test, with docs/architecture
    def test_a_read_belongs_to_the_test_it_stands_in_or_to_all_of_a_file(self):
        py = ('UC = ROOT / "docs" / "use-cases" / "UC-001-read-a-file.md"\n'
              '# TST-000001 · level: unit · module: MOD-reader\n# guards: A\n# given: g\n# input: i\n# expect: e\n'
              'def test_a(self):\n    self.assertEqual(read(), UC.read_text())\n'
              '# TST-000002 · level: unit · module: MOD-reader\n# guards: A\n# given: g\n# input: i\n# expect: e\n'
              'def test_b(self):\n    self.assertEqual(read(), "x")\n')
        self.assertEqual([(e["id"], e["reads"]) for e in reading("tests/test_reader.py", py)],
                         [("TST-000001", ["docs/use-cases"])])
        decl = "// TST-00000{n} · level: unit · module: MOD-reader\n// guards: A\n// given: g\n// input: i\n// expect: e\n"
        mjs = (decl.format(n=1) + 'test("a", () => { assert.equal(read(), "x"); });\n' + decl.format(n=2)
               + f'test("b", () => {{ assert.equal(read(), readFileSync(\n  "{ARCHITECTURE}",\n  "utf8")); }});\n')
        self.assertEqual([(e["id"], e["reads"]) for e in reading("tests/reader.test.mjs", mjs)],
                         [("TST-000002", ["docs/architecture"])])

    # TST-650004 · level: unit · module: MOD-test-document
    # guards: A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT
    # given: the test files of this repository (not under a fixtures folder)
    # input: testsReadingDocuments of each; the list is printed
    # expect: the list holds TST-472343 of tests/job-runner-records.test.mjs, which reads docs/architecture/MOD-job-runner.md, and holds no entry of this file
    def test_the_tests_of_the_repository_that_read_a_document_are_listed(self):
        files = sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / "tests").rglob("*")
                       if p.is_file() and p.suffix in (".py", ".mjs", ".js")
                       and not {"fixtures", "node_modules"} & set(p.relative_to(ROOT).parts))
        listed = js("const fs = await import('node:fs');"
                    f"const root = {json.dumps(str(ROOT))};"
                    f"return {json.dumps(files)}.flatMap((f) => testDocumentReads.testsReadingDocuments(f, "
                    "fs.readFileSync(root + '/' + f, 'utf8')).map((e) => ({ path: f, ...e })));")
        for e in listed:
            print(f"{e['path']}:{e['line']} {e['id']} {e['module']} reads {', '.join(e['reads'])}", file=sys.stderr)
        print(f"{len(listed)} tests in {len({e['path'] for e in listed})} files name a module and read a document", file=sys.stderr)
        self.assertIn(("tests/job-runner-records.test.mjs", "TST-472343"), {(e["path"], e["id"]) for e in listed})
        self.assertNotIn("tests/test_expected_results_stated.py", {e["path"] for e in listed})


if __name__ == "__main__":
    unittest.main()
