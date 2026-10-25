# Module: MOD-model-catalogue
# Guards: A GATE NAMES WHAT IT CHECKS
# Level: unit
"""SPEC §5 A GATE NAMES WHAT IT CHECKS — every gate in a model definition names the artifacts that must exist and the
condition that must hold before the next phase opens (MOD-model-catalogue: catalogue reads a gate as a Model's gate, and
modelFindings validates it; the model schema's table under ## Gates: Between | Artifacts | Condition | Decider; UC-031 step 4).

A gate is read with the phases it stands between, its artifacts as written and its condition. A gate without artifacts or
without a condition is refused; so is a gate that checks a kind of artifact — requirements, UC, ARC, MOD, TST, ITM, sprint
record — that neither the phase it follows nor a phase before it produces, along the transitions that are not back. The
fixtures are tests/fixtures/process-models/; the module is asked through node (tests/model_fixture.py); the SPEC is never
read.
"""
import unittest
from pathlib import Path

from model_fixture import errors, model

FIX = Path(__file__).resolve().parent / "fixtures" / "process-models"
PULLED = (FIX / "pulled.md").read_text(encoding="utf-8")
PLANNED = (FIX / "planned.md").read_text(encoding="utf-8")
RULE = "A GATE NAMES WHAT IT CHECKS"
GATE = "| Building → Checking | the item's pull request, with its code and TST | CI is green on it | Owner |"
DESIGN_GATE = "| Design → Implementation | the requirements, an ARC for each, and the MOD files | the design is accepted | Architect |"


def edited(text: str, old: str, new: str) -> str:
    assert text.count(old) == 1, old
    return text.replace(old, new)


class TestGateDefinition(unittest.TestCase):
    def test_every_gate_is_read_with_what_it_checks(self):
        g = model(PULLED)["gates"][0]
        self.assertEqual((g["from"], g["to"]), ("Building", "Checking"))
        self.assertEqual((g["artifacts"], g["condition"]), ("the item's pull request, with its code and TST", "CI is green on it"))
        g = model(PLANNED)["gates"][0]
        self.assertEqual((g["from"], g["to"]), ("Design", "Implementation"))
        self.assertEqual((g["artifacts"], g["condition"]), ("the requirements, an ARC for each, and the MOD files", "the design is accepted"))

    def test_a_gate_with_artifacts_and_a_condition_passes(self):
        self.assertEqual(errors(PULLED), [])
        self.assertEqual(errors(PLANNED), [])

    def test_counter_proof_a_gate_without_artifacts_is_refused(self):
        for empty in ("", "—"):
            text = edited(PULLED, GATE, f"| Building → Checking | {empty} | CI is green on it | Owner |")
            self.assertEqual([(f["rule"], f["line"]) for f in errors(text)], [(RULE, 43)], empty)

    def test_counter_proof_a_gate_without_a_condition_is_refused(self):
        for empty in ("", "—"):
            text = edited(PULLED, GATE, f"| Building → Checking | the item's pull request, with its code and TST | {empty} | Owner |")
            self.assertEqual([(f["rule"], f["line"]) for f in errors(text)], [(RULE, 43)], empty)

    def test_a_gate_may_check_what_an_earlier_phase_produced(self):
        # Testing → Acceptance checks TST, which Implementation produced before Testing; Design → Implementation checks the
        # requirements, which Concept produced before Design: both pass.
        self.assertEqual([g["artifacts"] for g in model(PLANNED)["gates"]],
                         ["the requirements, an ARC for each, and the MOD files", "the TST of the requirements"])
        self.assertEqual(errors(PLANNED), [])

    def test_counter_proof_a_gate_checking_what_only_a_later_phase_produces_is_refused(self):
        # TST is produced by Implementation and Testing, both after Design; the back transition Testing → Implementation
        # does not make them earlier.
        text = edited(PLANNED, DESIGN_GATE, DESIGN_GATE.replace("and the MOD files", "and the TST of every MOD"))
        self.assertEqual([(f["rule"], f["what"]) for f in errors(text)],
                         [(RULE, "the gate Design → Implementation checks TST, which no phase up to Design produces")])

    def test_counter_proof_a_back_transition_does_not_make_the_phase_it_leaves_earlier(self):
        # Testing → Implementation is a back transition: what Testing produces is still later than Implementation.
        text = edited(PLANNED, "| Testing | Tester | TST (system tests) |", "| Testing | Tester | TST (system tests), ITM (defects) |")
        text = edited(text, "| Testing → Acceptance |",
                      "| Implementation → Testing | the ITM of the defects found | none is open | Tester |\n| Testing → Acceptance |")
        self.assertEqual([(f["rule"], f["what"]) for f in errors(text)],
                         [(RULE, "the gate Implementation → Testing checks ITM, which no phase up to Implementation produces")])

    def test_counter_proof_a_gate_checking_what_no_phase_produces_is_refused(self):
        text = edited(PULLED, GATE, GATE.replace("with its code and TST", "with its code, TST and UC"))
        self.assertEqual([(f["rule"], f["what"]) for f in errors(text)],
                         [(RULE, "the gate Building → Checking checks UC, which no phase up to Building produces")])

    def test_a_gate_whose_artifacts_name_no_kind_checks_what_it_says(self):
        text = edited(PULLED, GATE, "| Building → Checking | the pull request into `main`; the record of the cycle | CI is green on it | Owner |")
        self.assertEqual(model(text)["gates"][0]["artifacts"], "the pull request into `main`; the record of the cycle")
        self.assertEqual(errors(text), [])


if __name__ == "__main__":
    unittest.main()
