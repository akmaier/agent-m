# Module: MOD-dashboard-app
# Guards: EVERY STEP EXPLAINS ITSELF
# Level: component
"""SPEC §10 EVERY STEP EXPLAINS ITSELF.

Steps are rendered only through dashboardApp.stepHtml, which refuses a step without an explanation. This
test makes sure the app does not bypass it by writing a step by hand.
"""
import re
import unittest

from jsrun import ASSETS, js


def dashboard_text(shell: bool = True) -> str:
    """The dashboard's own files (MOD-dashboard-app): the shell, dashboard-app.mjs, and every view and settings section under
    docs/assets/dashboard/ — what a test that read the one app file reads now; `shell=False`: the views alone."""
    views = sorted((ASSETS / "dashboard").rglob("*.mjs"))
    return "\n".join(f.read_text(encoding="utf-8") for f in ([ASSETS / "dashboard-app.mjs"] if shell else []) + views)


class StepExplanations(unittest.TestCase):
    def test_the_app_renders_steps_only_through_stepHtml(self):
        app = dashboard_text(shell=False)
        self.assertNotRegex(app, r'class="step"', "a step written by hand can skip its explanation")
        self.assertGreaterEqual(len(re.findall(r"\bstepHtml\(", app)), 3, "Step A, B and C of UC-001")

    def test_a_step_without_explanation_is_refused(self):
        self.assertEqual(js("try { dashboardApp.stepHtml({title: 'x', body: 'y', explain: ''}); return 'rendered'; }"
                            " catch (e) { return 'refused'; }"), "refused")


if __name__ == "__main__":
    unittest.main()
