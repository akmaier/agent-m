# Module: MOD-model-catalogue
# Guards: THE CATALOGUE IS DATA
# Level: release
"""SPEC section 'THE CATALOGUE IS DATA' - the check named tests/test_catalogue_is_data.py.

The cases live in tests/test_catalogue_is_data.md. This file loads them and drives the real code: it scans the code of
src/ in Python, and calls `catalogue` of MOD-model-catalogue through tests/jsrun.py.
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import ROOT, SRC, js

DATA = Path(__file__).with_suffix(".md")
FOLDER = SRC / "model-catalogue"


def cases() -> list[dict]:
    text = DATA.read_text(encoding="utf-8")
    found = []
    for m in re.finditer(r"^## (?P<name>[^\n]+)\n(?P<body>.*?)(?=^## |\Z)", text, re.M | re.S):
        block = re.search(r"^### Case\n\n```json\n(.*?)\n```", m.group("body"), re.M | re.S)
        if not block:
            raise AssertionError(f"missing case under {m.group('name')}")
        found.append(json.loads(block.group(1)))
    if len(found) != 2:
        raise AssertionError("two cases expected")
    return found


def shipped_names() -> list[str]:
    """The name of each file shipped.md lists."""
    listed = re.findall(r"^- `([^`]+)`", (FOLDER / "shipped.md").read_text(encoding="utf-8"), re.M)
    names = []
    for rel in listed:
        front = (FOLDER / rel).read_text(encoding="utf-8").split("---")[1]
        names.append(re.search(r"^name:\s*(\S+)\s*$", front, re.M).group(1))
    return names


def word(name: str) -> re.Pattern:
    """The name as a whole word, ignoring case, its hyphens also written as blanks."""
    return re.compile(r"(?<![A-Za-z0-9])" + name.replace("-", "[- ]") + r"(?![A-Za-z0-9])", re.I)


def is_vendored(path: Path, folder: str) -> bool:
    return folder in path.relative_to(SRC).parts


class TestCatalogueIsData(unittest.TestCase):
    # TST-840010 · level: release · module: system
    # guards: THE CATALOGUE IS DATA
    # given: the name of each model and practice that src/model-catalogue/shipped.md lists, and every .mjs and .js file under src/ that is not in a vendor folder
    # input: each name searched as a whole word, ignoring case, with hyphens also as blanks - first in a text with the name planted, then in the code
    # expect: known positive first (every name is found in its own planted text); then no name in any code file of Agent M; the only files left out are in a vendor folder
    def test_no_name_of_a_shipped_model_or_practice_stands_in_the_code(self):
        case = cases()[0]
        names = shipped_names()
        self.assertEqual(len(names), 9)
        for name in names:
            self.assertTrue(word(name).search(case["input"]["planted"].replace("{name}", name)), f"known positive {name}")
        files = [f for f in SRC.rglob("*") if f.is_file() and f.suffix in case["input"]["code_suffixes"]]
        self.assertIn(FOLDER / "index.mjs", files)
        left_out = [f for f in files if is_vendored(f, case["input"]["vendored_folder"])]
        self.assertTrue(all(case["input"]["vendored_folder"] in f.relative_to(SRC).parts[:-1] for f in left_out))
        hits = [f"{f.relative_to(ROOT)}: {n}" for f in files if f not in left_out
                for n in names if word(n).search(f.read_text(encoding="utf-8"))]
        self.assertEqual(hits, case["expected"]["hits_in_agent_m_code"])

    # TST-840011 · level: release · module: system
    # guards: THE CATALOGUE IS DATA
    # given: a fixture instance whose snapshot holds only docs/process-models/lab-flow.md, a model that is none of the shipped ones
    # input: catalogue(snapshot) of MOD-model-catalogue, with and without that file in the snapshot
    # expect: without the file lab-flow is not in the result; with it lab-flow is, read from its path with its phases and no finding, beside the shipped models - no code changed
    def test_a_model_added_as_a_data_file_is_in_the_catalogue(self):
        case = cases()[1]
        expect = case["expected"]
        got = js(f"""
          const path = {json.dumps(case['input']['path'])}, text = {json.dumps(case['input']['text'])};
          const snap = (files) => ({{ repository: {{}}, ref: 'main', commit: '0'.repeat(40), paths: Object.keys(files),
            read: async (p) => files[p] ?? null, blob: (p) => (p in files ? 'b' + p : null) }});
          const without = await modelCatalogue.catalogue(snap({{}}));
          const withIt = await modelCatalogue.catalogue(snap({{ [path]: text }}));
          const m = withIt.models.find((x) => x.name === 'lab-flow');
          return {{ hasWithout: without.models.some((x) => x.name === 'lab-flow'),
            shipped: without.models.length > 0 && withIt.models.length === without.models.length + 1,
            m: m ? {{ name: m.name, kind: m.kind, path: m.path, phases: m.phases.map((p) => p.name) }} : null,
            findings: withIt.findings[path] ?? null }};
        """)
        self.assertEqual(got["hasWithout"], expect["without_it"]["has_lab_flow"])
        self.assertEqual(got["m"], {k: expect["with_it"][k] for k in ("name", "kind", "path", "phases")})
        self.assertEqual(got["findings"], expect["with_it"]["findings_for_it"])
        self.assertEqual(got["shipped"], expect["with_it"]["shipped_models_still_there"])


if __name__ == "__main__":
    unittest.main()
