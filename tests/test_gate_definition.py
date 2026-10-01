# Module: MOD-process-model
# Guards: A GATE NAMES WHAT IT CHECKS
# Level: unit
"""SPEC §5 A GATE NAMES WHAT IT CHECKS — every gate in a model definition names the artifacts that must exist and the
condition that must hold before the next phase opens (docs/assets/process-model.mjs: parseModel, validateModel; ARC-019
decision 1, the table under ## Gates: Between | Artifacts | Condition | Decider; UC-031 step 4).

A gate is read with the phases it stands between, its artifacts as written, the kinds of artifact it names (the
identifier prefixes UC, ARC, MOD, TST, ITM, SRC, RES, JOB, and requirements) and its condition. A gate without
artifacts or without a condition is refused; so is a gate that checks a kind of artifact no phase up to it produces.
The fixtures are tests/fixtures/process-models/; the module is asked through node (tests/jsrun.py); the SPEC is never
read. Counter-proofs: docs/measurements/2026-10-01_process-model-validation.md.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "process-models"
PULLED = (FIX / "pulled.md").read_text(encoding="utf-8")
PLANNED = (FIX / "planned.md").read_text(encoding="utf-8")
RULE = "A GATE NAMES WHAT IT CHECKS"
GATE = "| Building → Checking | the item's pull request, with its code and TST | CI is green on it | Owner |"
DESIGN_GATE = "| Design → Implementation | an ARC- for every requirement, and the MOD- files | the design is accepted | Architect |"


def parse(text: str) -> dict:
    return js(f"return processModel.parseModel({json.dumps(text)});")


def errors(text: str) -> list:
    return js(f"return processModel.validateModel(processModel.parseModel({json.dumps(text)}));")


def edited(text: str, old: str, new: str) -> str:
    assert text.count(old) == 1, old
    return text.replace(old, new)


class TestGateDefinition(unittest.TestCase):
    def test_every_gate_is_read_with_what_it_checks(self):
        g = parse(PULLED)["gates"][0]
        self.assertEqual((g["between"], g["from"], g["to"]), ("Building → Checking", "Building", "Checking"))
        self.assertEqual((g["artifacts"], g["condition"]), ("the item's pull request, with its code and TST", "CI is green on it"))
        self.assertEqual(g["kinds"], ["TST"])
        g = parse(PLANNED)["gates"][0]
        self.assertEqual(sorted(g["kinds"]), ["ARC", "MOD", "requirement"])
        self.assertEqual(g["condition"], "the design is accepted")

    def test_a_gate_with_artifacts_and_a_condition_passes(self):
        self.assertEqual(errors(PULLED), [])
        self.assertEqual(errors(PLANNED), [])

    def test_counter_proof_a_gate_without_artifacts_is_refused(self):
        for empty in ("", "—"):
            text = edited(PULLED, GATE, f"| Building → Checking | {empty} | CI is green on it | Owner |")
            self.assertEqual([(f["rule"], f["line"], f["field"]) for f in errors(text)], [(RULE, 43, "Gates/Artifacts")], empty)

    def test_counter_proof_a_gate_without_a_condition_is_refused(self):
        for empty in ("", "—"):
            text = edited(PULLED, GATE, f"| Building → Checking | the item's pull request, with its code and TST | {empty} | Owner |")
            self.assertEqual([(f["rule"], f["line"], f["field"]) for f in errors(text)], [(RULE, 43, "Gates/Condition")], empty)

    def test_a_gate_may_check_what_an_earlier_phase_produced(self):
        # Testing → Acceptance checks TST, which Implementation produced before Testing: it passes.
        self.assertEqual(parse(PLANNED)["gates"][1]["kinds"], ["TST", "requirement"])
        self.assertEqual(errors(PLANNED), [])

    def test_counter_proof_a_gate_checking_what_only_a_later_phase_produces_is_refused(self):
        # TST is produced by Implementation and Testing, both after Design; the back transition Testing → Implementation
        # does not make them earlier.
        text = edited(PLANNED, DESIGN_GATE, DESIGN_GATE.replace("and the MOD- files", "and the TST of every MOD-"))
        self.assertEqual([(f["rule"], f["what"]) for f in errors(text)],
                         [(RULE, "the gate Design → Implementation checks TST, which no phase up to Design produces")])

    def test_counter_proof_a_gate_checking_what_no_phase_produces_is_refused(self):
        text = edited(PULLED, GATE, GATE.replace("with its code and TST", "with its code, TST and UC-"))
        self.assertEqual([(f["rule"], f["what"]) for f in errors(text)],
                         [(RULE, "the gate Building → Checking checks UC, which no phase up to Building produces")])

    def test_a_gate_whose_artifacts_name_no_kind_checks_what_it_says(self):
        text = edited(PULLED, GATE, "| Building → Checking | the pull request into `main`; the record of the cycle | CI is green on it | Owner |")
        self.assertEqual(parse(text)["gates"][0]["kinds"], [])
        self.assertEqual(errors(text), [])


if __name__ == "__main__":
    unittest.main()
