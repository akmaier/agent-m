# Module: MOD-process-model
# Guards: A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED; A GATE NAMES WHO DECIDES IT
# Level: unit
"""SPEC §13 — a process model definition is read and validated before any product may declare it
(docs/assets/process-model.mjs: parseModel, validateModel; ARC-019 decisions 1 and 2; UC-031 step 4).

A definition is a Markdown file: front matter with name, kind (planned or pulled), adapted_from and measure, then one
table per part under a fixed heading — Phases, Transitions, Verification pairs, Gates, Roles, Flow control. The
fixtures are tests/fixtures/process-models/: a complete pulled and a complete planned definition, and under broken/ one
copy of the pulled one per rule, each breaking exactly that rule, with the errors each must yield in
broken/expected.json. The model definitions of this repository are validated as they stand. The dashboard's module is
asked through node (tests/jsrun.py); the SPEC itself is never read (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE).
Counter-proofs: docs/measurements/2026-10-01_process-model-validation.md.
"""
import json
import unittest
from pathlib import Path

from artifact_checks import DOCS, front_matter
from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "process-models"
BROKEN = FIX / "broken"
PULLED = (FIX / "pulled.md").read_text(encoding="utf-8")
PLANNED = (FIX / "planned.md").read_text(encoding="utf-8")

VALIDATED = "A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED"
WHO = "A GATE NAMES WHO DECIDES IT"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def parse(text: str) -> dict:
    return js(f"return processModel.parseModel({json.dumps(text)});")


def errors(text: str) -> list:
    return js(f"return processModel.validateModel(processModel.parseModel({json.dumps(text)}));")


def edited(text: str, old: str, new: str) -> str:
    assert text.count(old) == 1, old
    return text.replace(old, new)


class TestReading(unittest.TestCase):
    def test_a_pulled_definition_is_read_into_its_parts(self):
        m = parse(PULLED)
        self.assertEqual((m["name"], m["kind"], m["adaptedFrom"], m["measure"]),
                         ("fixture-pulled", "pulled", "fixture-base", "items per state over time"))
        self.assertEqual([(p["name"], p["role"], p["line"]) for p in m["phases"]],
                         [("Planning", "Owner", 17), ("Building", "Builders", 18), ("Checking", "Checker", 19),
                          ("Closing", "Owner", 20)])
        self.assertEqual(m["phases"][1]["produces"], "MOD (code of the item's modules), TST")
        self.assertEqual([(t["from"], t["to"], t["kind"]) for t in m["transitions"]],
                         [("Planning", "Building", "sequence"), ("Building", "Checking", "sequence"),
                          ("Checking", "Building", "back"), ("Checking", "Closing", "sequence"),
                          ("Closing", "Planning", "sequence")])
        self.assertEqual([(p["phase"], p["checkedBy"]) for p in m["pairs"]],
                         [("Building", "Checking"), ("Planning", "Closing")])
        self.assertEqual([(g["from"], g["to"], g["condition"], g["decider"], g["line"]) for g in m["gates"]],
                         [("Building", "Checking", "CI is green on it", {"role": "Owner"}, 43),
                          ("Checking", "Closing", "green on the branch", {"check": "release-tests"}, 44)])
        self.assertEqual([(r["name"], r["filledBy"], r["capabilities"]) for r in m["roles"]],
                         [("Owner", "person", ["read the repository", "write to the repository"]),
                          ("Builders", "agent", ["read the repository", "write to the repository", "run code and tests",
                                                 "use tools"]),
                          ("Checker", "either", ["read the repository", "run code and tests"])])
        self.assertEqual(m["flow"], {"wipLimit": 3, "timeBox": None, "sprints": True})
        self.assertEqual(m["problems"], [])

    def test_a_planned_definition_is_read_into_its_parts(self):
        m = parse(PLANNED)
        self.assertEqual((m["name"], m["kind"], m["adaptedFrom"], m["measure"]),
                         ("fixture-planned", "planned", None, "plan entries per phase"))
        self.assertEqual([p["name"] for p in m["phases"]], ["Concept", "Design", "Implementation", "Testing", "Acceptance"])
        self.assertEqual([(p["phase"], p["checkedBy"]) for p in m["pairs"]], [("Concept", "Acceptance"), ("Design", "Testing")])
        self.assertEqual(m["flow"], {"wipLimit": None, "timeBox": None, "sprints": None})
        self.assertEqual(m["problems"], [])

    def test_a_time_box_is_read_with_its_length(self):
        text = edited(edited(PULLED, "| WIP limit | 3 |\n", ""), "| Time box | none |", "| Time box | 2 weeks |")
        self.assertEqual(parse(text)["flow"], {"wipLimit": None, "timeBox": "2 weeks", "sprints": True})
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
                self.assertEqual(f["kind"], "error", name)
                self.assertEqual(f["artifact"], "fixture-pulled" if name != "no-name.md" else "process model", name)
                self.assertTrue(f["field"], f"{name}: the error stands beside a field")
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

    def test_each_error_stands_beside_the_field_that_causes_it(self):
        fields = {"transition-unknown-phase.md": "Transitions/To", "pair-unknown-phase.md": "Verification pairs/Checked by",
                  "gate-without-artifacts.md": "Gates/Artifacts", "gate-without-condition.md": "Gates/Condition",
                  "gate-without-decider.md": "Gates/Decider", "role-without-capabilities.md": "Roles/Capabilities",
                  "phase-without-role.md": "Phases/Role", "no-kind.md": "kind", "measure-not-fitting.md": "measure",
                  "pulled-with-both.md": "Flow control", "row-malformed.md": "Transitions"}
        for name, field in fields.items():
            self.assertEqual([f["field"] for f in errors(read(BROKEN / name))], [field], name)

    def test_validation_leaves_the_model_as_it_was(self):
        out = js(f"const m = processModel.parseModel({json.dumps(read(BROKEN / 'gate-without-decider.md'))});"
                 "const before = JSON.stringify(m); const a = processModel.validateModel(m);"
                 "const b = processModel.validateModel(m); return [before === JSON.stringify(m), a.length, b.length];")
        self.assertEqual(out, [True, 1, 1])

    def test_every_model_definition_of_this_repository_passes_validation(self):
        files = sorted((DOCS / "assets" / "process-models").glob("*.md")) + sorted((DOCS / "process-models").glob("*.md"))
        self.assertTrue(files, "the instance holds at least its own model")
        for f in files:
            self.assertEqual(errors(read(f)), [], f.relative_to(DOCS).as_posix())

    def test_the_model_agent_m_declares_gives_its_flow_control(self):
        declared, _ = front_matter(read(DOCS / "process.md"))
        m = parse(read(DOCS.parent / declared["model_file"]))
        self.assertEqual((m["name"], m["kind"]), (declared["model"], "pulled"))
        self.assertIsInstance(m["flow"]["wipLimit"], int)
        self.assertGreater(m["flow"]["wipLimit"], 0)
        self.assertIsNone(m["flow"]["timeBox"])


class TestDecider(unittest.TestCase):
    """A GATE NAMES WHO DECIDES IT — a role of the model, or an automated check whose result decides."""

    def test_a_gate_decided_by_a_role_and_one_decided_by_a_named_ci_check_both_pass(self):
        gates = parse(PULLED)["gates"]
        self.assertEqual([g["decider"] for g in gates], [{"role": "Owner"}, {"check": "release-tests"}])
        self.assertEqual(errors(PULLED), [])
        by_roles = edited(PULLED, "| CI check `release-tests` |", "| Checker |")
        self.assertEqual([g["decider"] for g in parse(by_roles)["gates"]], [{"role": "Owner"}, {"role": "Checker"}])
        self.assertEqual(errors(by_roles), [])
        by_checks = edited(PULLED, "| CI is green on it | Owner |", "| CI is green on it | CI check `tests` |")
        self.assertEqual([g["decider"] for g in parse(by_checks)["gates"]], [{"check": "tests"}, {"check": "release-tests"}])
        self.assertEqual(errors(by_checks), [])

    def test_counter_proof_a_gate_without_a_decider_is_rejected(self):
        found = errors(read(BROKEN / "gate-without-decider.md"))
        self.assertEqual([(f["rule"], f["line"]) for f in found], [(WHO, 43)])
        self.assertIsNone(parse(read(BROKEN / "gate-without-decider.md"))["gates"][0]["decider"])

    def test_counter_proof_a_decider_that_is_no_role_and_no_check_is_rejected(self):
        for decider in ("Release manager", "CI check release-tests", "check `release-tests`", "owner"):
            text = edited(PULLED, "| CI check `release-tests` |", f"| {decider} |")
            self.assertEqual([f["rule"] for f in errors(text)], [WHO], decider)


if __name__ == "__main__":
    unittest.main()
