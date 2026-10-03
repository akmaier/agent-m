# Module: MOD-job-harness
# Guards: NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
# Level: unit
"""SPEC §3 NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY — if the existing requirements do not fit into the deriving
participant's context, the run stops and says so before anything is sent.

docs/assets/job-harness.mjs (MOD-job-harness, ITM-023): contextFits(inputs, participant) measures every input it is given,
completely, in the participant's unit and returns { fits: true } or { fits: false, counts, limit } — how many requirements
there are, how much they take, and how much fits; it never shortens an input. The run asks it before it sends (ARC-007
decision 5). This file checks the harness's half of the rule; that the deriving job hands it every requirement of the SPEC
and the open queues is MOD-derivation's (DERIVATION SEES THE EXISTING REQUIREMENTS), not checked here.

Fixtures: tests/fixtures/jobs/inputs/requirements.md — six requirements of a small product, one per block; the SPEC itself
is not read (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE). Counter-proofs: the pull request of ITM-023.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "jobs" / "inputs"
REQUIREMENTS = (FIX / "requirements.md").read_text(encoding="utf-8").strip().split("\n\n")
SOURCE = "The list is exported as a spreadsheet, and every export names the day it was written."


def fits(inputs: dict, context: dict) -> dict:
    return js(f"return jobHarness.contextFits({json.dumps(inputs)}, {{ context: {json.dumps(context)} }});")


def size(inputs: dict) -> int:
    """The size of the inputs in characters, as they stand in the prompt: the requirements one per block."""
    return len("\n\n".join(inputs["requirements"])) + len(inputs["source"])


class TestTheRequirementsFitOrTheRunStops(unittest.TestCase):
    INPUTS = {"source": SOURCE, "requirements": REQUIREMENTS}

    def setUp(self):
        self.assertEqual(len(REQUIREMENTS), 6, "the fixture holds six requirements, one per block")

    def test_all_requirements_that_fit_are_sent_whole(self):
        self.assertEqual(fits(self.INPUTS, {"limit": size(self.INPUTS)})["fits"], True)

    def test_requirements_that_do_not_fit_stop_the_run_naming_how_many_there_are_and_how_much_fits(self):
        limit = size(self.INPUTS) - 1
        r = fits(self.INPUTS, {"limit": limit})
        self.assertEqual(r["fits"], False)
        self.assertEqual(r["limit"], limit)
        self.assertEqual(r["counts"]["requirements"], {"items": 6, "size": len("\n\n".join(REQUIREMENTS))})
        self.assertEqual(r["counts"]["total"], size(self.INPUTS))

    def test_counter_proof_one_requirement_more_than_fits_is_not_left_out_to_make_it_fit(self):
        """With room for five of the six requirements the run still stops: the sixth is not dropped silently."""
        five = {"source": SOURCE, "requirements": REQUIREMENTS[:5]}
        r = fits(self.INPUTS, {"limit": size(five)})
        self.assertEqual(r["fits"], False)
        self.assertEqual(r["counts"]["requirements"]["items"], 6)
        self.assertEqual(fits(five, {"limit": size(five)})["fits"], True)

    def test_the_count_is_in_the_participants_unit(self):
        """A participant that counts in its own unit — here words, standing in for a tokenizer — is measured in it."""
        words = sum(len(r.split()) for r in REQUIREMENTS) + len(SOURCE.split())
        expr = ("const count = (s) => s.split(/\\s+/).filter(Boolean).length;"
                f"return [{words}, {words - 1}].map((limit) => jobHarness.contextFits({json.dumps(self.INPUTS)},"
                " { context: { limit, unit: 'tokens', count } }).fits);")
        self.assertEqual(js(expr), [True, False])


if __name__ == "__main__":
    unittest.main()
