# Module: MOD-model-catalogue
# Guards: A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED; A GATE NAMES WHO DECIDES IT; A ROLE NAMES HOW MANY FILL IT
# Level: unit
"""SPEC §13 — a process model definition is read and validated before any product may declare it (MOD-model-catalogue:
catalogue reads a definition as a Model, modelFindings validates it; UC-031 step 4).

A definition is a Markdown file of the model schema (src/model-catalogue/model.schema.md): front matter with name, kind
(planned or pulled), adapted_from and measure, then one table per part under a fixed heading — Phases, Transitions,
Verification pairs, Gates, Roles, Flow control. The fixtures are tests/fixtures/process-models/: a complete pulled and a
complete planned definition, and under broken/ one copy of the pulled one per rule, each breaking exactly that rule, with
the errors each must yield in broken/expected.json. The model definitions of this repository are validated as they stand.
The module is asked through node (tests/model_fixture.py); the SPEC itself is never read.
"""
import json
import unittest
from pathlib import Path

from artifact_checks import DOCS, front_matter
from jsrun import js
from model_fixture import PATH, errors, model

FIX = Path(__file__).resolve().parent / "fixtures" / "process-models"
BROKEN = FIX / "broken"
PULLED = (FIX / "pulled.md").read_text(encoding="utf-8")
PLANNED = (FIX / "planned.md").read_text(encoding="utf-8")

WHO = "A GATE NAMES WHO DECIDES IT"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def edited(text: str, old: str, new: str) -> str:
    assert text.count(old) == 1, old
    return text.replace(old, new)


class TestReading(unittest.TestCase):
    def test_a_pulled_definition_is_read_into_its_parts(self):
        m = model(PULLED)
        self.assertEqual((m["name"], m["kind"], m["adaptedFrom"], m["measure"]),
                         ("fixture-pulled", "pulled", "fixture-base", "items per state over time"))
        self.assertEqual([(p["name"], p["roles"]) for p in m["phases"]],
                         [("Planning", ["Owner"]), ("Building", ["Builders"]), ("Checking", ["Checker"]), ("Closing", ["Owner"])])
        self.assertEqual(m["phases"][1]["produces"], ["MOD", "TST"])
        self.assertEqual([(t["from"], t["to"], t["kind"]) for t in m["transitions"]],
                         [("Planning", "Building", "sequence"), ("Building", "Checking", "sequence"),
                          ("Checking", "Building", "back"), ("Checking", "Closing", "sequence"),
                          ("Closing", "Planning", "sequence")])
        self.assertEqual([(p["phase"], p["checkedBy"]) for p in m["pairs"]],
                         [("Building", "Checking"), ("Planning", "Closing")])
        self.assertEqual([(g["from"], g["to"], g["condition"], g["decider"]) for g in m["gates"]],
                         [("Building", "Checking", "CI is green on it", "Owner"),
                          ("Checking", "Closing", "green on the branch", "check: release-tests")])
        self.assertEqual([(r["name"], r["filledBy"], r["howMany"], r["capabilities"]) for r in m["roles"]],
                         [("Owner", "person", "one", ["read the repository", "write to the repository"]),
                          ("Builders", "agent", "several", ["read the repository", "write to the repository",
                                                            "run code and tests", "use tools"]),
                          ("Checker", "either", "several", ["read the repository", "run code and tests"])])
        self.assertEqual(m["flow"], {"wip": 3, "timeBox": None, "sprints": True})
        self.assertEqual(m["path"], PATH)

    def test_a_planned_definition_is_read_into_its_parts(self):
        m = model(PLANNED)
        self.assertEqual((m["name"], m["kind"], m["adaptedFrom"], m["measure"]),
                         ("fixture-planned", "planned", None, "plan entries per phase"))
        self.assertEqual([p["name"] for p in m["phases"]], ["Concept", "Design", "Implementation", "Testing", "Acceptance"])
        self.assertEqual([(p["phase"], p["checkedBy"]) for p in m["pairs"]], [("Concept", "Acceptance"), ("Design", "Testing")])
        self.assertIsNone(m["flow"], "a planned model has no flow control")

    def test_a_time_box_is_read_with_its_length(self):
        text = edited(edited(PULLED, "| WIP limit | 3 |\n", ""), "| Time box | none |", "| Time box | 2 weeks |")
        self.assertEqual(model(text)["flow"], {"wip": None, "timeBox": "2 weeks", "sprints": True})
        self.assertEqual(errors(text), [])


class TestValidation(unittest.TestCase):
    def test_the_complete_definitions_pass_validation(self):
        self.assertEqual(errors(PULLED), [])
        self.assertEqual(errors(PLANNED), [])

    def test_every_broken_definition_yields_exactly_the_errors_expected_json_names(self):
        expected = json.loads(read(BROKEN / "expected.json"))
        self.assertEqual(sorted(p.name for p in BROKEN.glob("*.md")), sorted(expected))
        for name, want in expected.items():
            found = errors(read(BROKEN / name))
            self.assertEqual(sorted([f["line"], f["rule"], f["what"]] for f in found), sorted(want), name)
            for f in found:
                self.assertEqual(f["artifact"], PATH, name)
                self.assertGreater(len(f["fix"]), 10, f"{name}: a correction is named")

    def test_each_rule_the_spec_and_uc_031_name_has_a_broken_definition_that_is_rejected(self):
        # The SPEC's check of A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED, then UC-031 step 4 — each with the
        # one definition that breaks it. The complete definition it was copied from passes (test above).
        rules = {
            "a transition naming a phase the model lacks": "transition-unknown-phase.md",
            "a verification pair naming a phase the model lacks": "pair-unknown-phase.md",
            "a gate without artifacts": "gate-without-artifacts.md",
            "a gate without condition": "gate-without-condition.md",
            "a role without capabilities": "role-without-capabilities.md",
            "a role that does not say how many fill it": "role-how-many-invalid.md",
            "a phase without a role": "phase-without-role.md",
            "a missing declaration of whether work is planned or pulled": "no-kind.md",
            "a phase no transition reaches": "phase-unreached.md",
            "a gate without a decider": "gate-without-decider.md",
            "a gate that checks an artifact kind no earlier phase produces": "gate-artifact-not-produced.md",
            "pulled work with neither a time box nor a WIP limit": "pulled-without-flow-control.md",
            "pulled work with both": "pulled-with-both.md",
            "a progress measure that does not fit the kind of work": "measure-not-fitting.md",
        }
        for rule, name in rules.items():
            self.assertEqual(len(errors(read(BROKEN / name))), 1, rule)

    def test_each_error_stands_on_the_line_of_the_part_that_causes_it(self):
        # UC-031 step 4: each error beside the field that causes it — the line of that field in the definition.
        lines = {"transition-unknown-phase.md": 31, "pair-unknown-phase.md": 37, "gate-without-artifacts.md": 43,
                 "gate-without-condition.md": 43, "gate-without-decider.md": 43, "role-without-capabilities.md": 52,
                 "role-how-many-invalid.md": 52, "phase-without-role.md": 19, "measure-not-fitting.md": 5,
                 "pulled-with-both.md": 54}
        for name, line in lines.items():
            self.assertEqual([f["line"] for f in errors(read(BROKEN / name))], [line], name)

    def test_validation_leaves_the_definition_as_it_was(self):
        out = js(f"const d = documents.readDocument(modelCatalogue.modelSchema.model, {json.dumps(PATH)},"
                 f" {json.dumps(read(BROKEN / 'gate-without-decider.md'))});"
                 "const before = JSON.stringify(d); const a = modelCatalogue.modelFindings(d);"
                 "const b = modelCatalogue.modelFindings(d); return [before === JSON.stringify(d), a.length, b.length];")
        self.assertEqual(out, [True, 1, 1])

    def test_every_model_definition_of_this_repository_passes_validation(self):
        files = sorted((DOCS / "process-models").glob("*.md"))
        self.assertTrue(files, "the instance holds at least its own model")
        for f in files:
            self.assertEqual(errors(read(f)), [], f.relative_to(DOCS).as_posix())

    # A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED, Check: "Each book model in the shipped catalogue must pass." The shipped
    # catalogue is src/model-catalogue/models/, validated by the catalogue's own modelFindings (MOD-model-catalogue).
    # Expected: the five book models are there, and none has an error finding.
    def test_every_book_model_of_the_shipped_catalogue_passes_validation(self):
        root = DOCS.parent
        files = sorted((root / "src" / "model-catalogue" / "models").glob("*.md"))
        self.assertEqual(sorted(f.stem for f in files), ["kanban", "reuse-oriented", "scrum", "v-model", "waterfall"])
        for f in files:
            rel = f.relative_to(root).as_posix()
            found = js(f"const doc = documents.readDocument(modelCatalogue.modelSchema.model, {json.dumps(rel)}, {json.dumps(read(f))});"
                       "return modelCatalogue.modelFindings(doc).filter((f) => f.kind === 'error').map((f) => f.line + ': ' + f.what);")
            self.assertEqual(found, [], rel)

    def test_the_model_agent_m_declares_gives_its_flow_control(self):
        declared, _ = front_matter(read(DOCS / "process.md"))
        m = model(read(DOCS.parent / declared["model_file"]))
        self.assertEqual((m["name"], m["kind"]), (declared["model"], "pulled"))
        self.assertIsInstance(m["flow"]["wip"], int)
        self.assertGreater(m["flow"]["wip"], 0)
        self.assertIsNone(m["flow"]["timeBox"])


class TestDecider(unittest.TestCase):
    """A GATE NAMES WHO DECIDES IT — a role of the model, or an automated check whose result decides."""

    def test_a_gate_decided_by_a_role_and_one_decided_by_a_named_ci_check_both_pass(self):
        self.assertEqual([g["decider"] for g in model(PULLED)["gates"]], ["Owner", "check: release-tests"])
        self.assertEqual(errors(PULLED), [])
        by_roles = edited(PULLED, "| check: release-tests |", "| Checker |")
        self.assertEqual([g["decider"] for g in model(by_roles)["gates"]], ["Owner", "Checker"])
        self.assertEqual(errors(by_roles), [])
        by_checks = edited(PULLED, "| CI is green on it | Owner |", "| CI is green on it | check: tests |")
        self.assertEqual([g["decider"] for g in model(by_checks)["gates"]], ["check: tests", "check: release-tests"])
        self.assertEqual(errors(by_checks), [])

    def test_counter_proof_a_gate_without_a_decider_is_rejected(self):
        text = read(BROKEN / "gate-without-decider.md")
        self.assertEqual([(f["rule"], f["line"]) for f in errors(text)], [(WHO, 43)])
        self.assertEqual(model(text)["gates"][0]["decider"], "")

    def test_counter_proof_a_decider_that_is_no_role_and_no_check_is_rejected(self):
        for decider in ("Release manager", "CI check `release-tests`", "check release-tests", "owner"):
            text = edited(PULLED, "| check: release-tests |", f"| {decider} |")
            self.assertEqual([f["rule"] for f in errors(text)], [WHO], decider)


if __name__ == "__main__":
    unittest.main()
