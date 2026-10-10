# Module: MOD-model-catalogue
# Guards: A PROCESS MODEL ORGANISES PEOPLE AND AGENTS; A ROLE NAMES THE CAPABILITIES IT NEEDS; A ROLE NAMES HOW MANY FILL IT
# Level: unit
"""SPEC §5 — every shipped and instance model definition is validated against the model schema, and each of its roles
states how many participants fill it.

The shipped models under src/model-catalogue/models/ and the instance's under docs/process-models/ are read with the
module's schema through MOD-documents and checked with modelFindings, asked through node (tests/jsrun.py).
"""
import json
import unittest
from pathlib import Path

from jsrun import js

ROOT = Path(__file__).resolve().parent.parent
MODELS = sorted((ROOT / "src" / "model-catalogue" / "models").glob("*.md")) + \
    sorted((ROOT / "docs" / "process-models").glob("*.md"))


def read(path: Path) -> dict:
    """The model's error findings and each role's How many, as the module reads the file at its path."""
    rel = path.relative_to(ROOT).as_posix()
    text = path.read_text(encoding="utf-8")
    return js(
        f"const doc = documents.readDocument(modelCatalogue.modelSchema.model, {json.dumps(rel)}, {json.dumps(text)});"
        "const roles = doc.sections.find((s) => s.heading === '## Roles')?.rows ?? [];"
        "return { errors: modelCatalogue.modelFindings(doc).filter((f) => f.kind === 'error')"
        "  .map((f) => [f.line, f.rule, f.what]),"
        "  howMany: roles.map((r) => [String(r.cells.Name), String(r.cells['How many'] ?? '')]) };")


class ModelRoles(unittest.TestCase):
    def test_known_positive_the_shipped_and_instance_models_are_found(self):
        self.assertGreaterEqual(len(MODELS), 6)

    def test_every_shipped_and_instance_model_passes_the_model_schema(self):
        for path in MODELS:
            with self.subTest(path.relative_to(ROOT).as_posix()):
                self.assertEqual(read(path)["errors"], [])

    def test_each_role_states_how_many_participants_fill_it(self):
        for path in MODELS:
            roles = read(path)["howMany"]
            with self.subTest(path.relative_to(ROOT).as_posix()):
                self.assertTrue(roles, "the model names roles")
                for name, how in roles:
                    self.assertIn(how, ("one", "several"), name)


if __name__ == "__main__":
    unittest.main()
