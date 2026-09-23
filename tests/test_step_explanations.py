"""SPEC §10 EVERY STEP EXPLAINS ITSELF.

Steps are rendered only through core.stepHtml, which refuses a step without an explanation. This
test makes sure the app does not bypass it by writing a step by hand.
"""
import re
import unittest

from jsrun import ASSETS, js


class StepExplanations(unittest.TestCase):
    def test_the_app_renders_steps_only_through_stepHtml(self):
        app = (ASSETS / "review-app.mjs").read_text(encoding="utf-8")
        self.assertNotRegex(app, r'class="step"', "a step written by hand can skip its explanation")
        self.assertGreaterEqual(len(re.findall(r"\bstepHtml\(", app)), 3, "Step A, B and C of UC-001")

    def test_a_step_without_explanation_is_refused(self):
        self.assertEqual(js("try { core.stepHtml({title: 'x', body: 'y', explain: ''}); return 'rendered'; }"
                            " catch (e) { return 'refused'; }"), "refused")


if __name__ == "__main__":
    unittest.main()
