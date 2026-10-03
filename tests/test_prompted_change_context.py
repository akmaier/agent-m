# Module: MOD-job-harness
# Guards: NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY
# Level: unit
"""SPEC §10 NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY — if a use case, its requirements and the product's other use cases do
not fit into the participant's context, nothing is sent and the dashboard says what does not fit.

docs/assets/job-harness.mjs (MOD-job-harness, ITM-023): contextFits(inputs, participant) measures every input of a prompted
change completely and, when they do not fit, names each input with how many items and how much it holds, and how much fits
— what the dashboard says. The fixture job tests/fixtures/jobs/change-use-case/ takes the use case, the requirements it
realises and the other use cases; its prompt is filled only from inputs that fit. The other rules this file is named for in
the SPEC (A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS, A CI AGENT'S DRAFT ENTERS AS OPEN) are checked by the items of the
modules that assemble the inputs and write the draft, not here.

Fixtures: tests/fixtures/jobs/inputs/ — the requirements and three use cases of a small product; the SPEC itself is not
read (KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE). Counter-proofs: the pull request of ITM-023.
"""
import json
import unittest
from pathlib import Path

from jsrun import js

FIX = Path(__file__).resolve().parent / "fixtures" / "jobs"
REQUIREMENTS = (FIX / "inputs" / "requirements.md").read_text(encoding="utf-8").strip().split("\n\n")
USE_CASES = [p.read_text(encoding="utf-8") for p in sorted((FIX / "inputs" / "use-cases").glob("UC-*.md"))]
INPUTS = {
    "instruction": "Add an alternative flow for a list that is too long for one file.",
    "useCase": USE_CASES[0],
    "requirements": REQUIREMENTS[:2],
    "useCases": USE_CASES[1:],
}
SIZES = {
    "instruction": len(INPUTS["instruction"]),
    "useCase": len(USE_CASES[0]),
    "requirements": len("\n\n".join(REQUIREMENTS[:2])),
    "useCases": len("\n\n".join(USE_CASES[1:])),
}
TOTAL = sum(SIZES.values())


def fits(inputs: dict, limit: int) -> dict:
    return js(f"return jobHarness.contextFits({json.dumps(inputs)}, {{ context: {{ limit: {limit} }} }});")


class TestAPromptedChangeFitsOrNothingIsSent(unittest.TestCase):

    def test_a_change_whose_inputs_fit_is_prompted_with_all_of_them(self):
        """Fits: the job's prompt holds the use case, its requirements and every other use case, whole."""
        self.assertEqual(fits(INPUTS, TOTAL)["fits"], True)
        read = ("const fs = await import('node:fs');"
                f"const base = {json.dumps(str(FIX) + '/')};"
                "const definition = await jobHarness.loadDefinition('change-use-case', async (p) => fs.readFileSync("
                f"p === 'findings.json' ? {json.dumps(str(FIX.parents[2] / 'docs' / 'assets' / 'jobs' / 'findings.json'))} : base + p, 'utf8'));"
                f"return jobHarness.renderPrompt(definition, {json.dumps(INPUTS)})[0].content;")
        prompt = js(read)
        for piece in [INPUTS["instruction"], *USE_CASES, *REQUIREMENTS[:2]]:
            self.assertIn(piece, prompt)

    def test_a_change_that_does_not_fit_names_each_input_with_how_much_it_holds(self):
        r = fits(INPUTS, TOTAL - 1)
        self.assertEqual(r["fits"], False)
        self.assertEqual(r["limit"], TOTAL - 1)
        self.assertEqual(r["counts"], {
            "instruction": {"items": 1, "size": SIZES["instruction"]},
            "useCase": {"items": 1, "size": SIZES["useCase"]},
            "requirements": {"items": 2, "size": SIZES["requirements"]},
            "useCases": {"items": 2, "size": SIZES["useCases"]},
            "total": TOTAL,
        })

    def test_counter_proof_another_use_case_is_not_dropped_to_make_the_rest_fit(self):
        """Room for all but the last other use case: nothing is sent, and the count still names both."""
        without_last = {**INPUTS, "useCases": USE_CASES[1:2]}
        room = TOTAL - SIZES["useCases"] + len(USE_CASES[1])
        self.assertEqual(fits(without_last, room)["fits"], True)
        r = fits(INPUTS, room)
        self.assertEqual(r["fits"], False)
        self.assertEqual(r["counts"]["useCases"]["items"], 2)


if __name__ == "__main__":
    unittest.main()
