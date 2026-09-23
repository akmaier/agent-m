"""SPEC §7 A TOKEN IS SCOPED TO WHAT IT WRITES · THE TOKEN LINK IS PREFILLED ·
THE REPOSITORY CHOICE IS SPELLED OUT."""
import unittest

from jsrun import js


class TokenScopeDocumented(unittest.TestCase):
    def test_guidance_names_minimum_scope_and_reason(self):
        g = js("return core.TOKEN_GUIDANCE;")
        for must in ["fine-grained", "Only select repositories", "Contents", "expir", "why"]:
            self.assertIn(must.lower(), g.lower(), must)
        self.assertNotIn("Pull requests", g, "the dashboard needs no pull-request permission any more")

    def test_link_and_steps_carry_the_scope(self):
        link = js("return core.tokenLinkUrl('r/agent-m');")
        self.assertIn("contents=write", link)
        self.assertNotIn("pull_requests", link)
        steps = js("return core.repositoryChoiceSteps('r/agent-m', 'r/thesis');")
        self.assertIn("Only select repositories", steps[0])
        self.assertTrue(any("r/thesis" in s for s in steps))


if __name__ == "__main__":
    unittest.main()
