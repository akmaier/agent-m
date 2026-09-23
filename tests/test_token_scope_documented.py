"""SPEC §7 A TOKEN IS SCOPED TO WHAT IT WRITES — the settings state the minimum scope and why."""
import unittest

from jsrun import js


class TokenScopeDocumented(unittest.TestCase):
    def test_guidance_names_minimum_scope_and_reason(self):
        g = js("return core.TOKEN_GUIDANCE;")
        for must in ["fine-grained", "Only select repositories", "Contents", "Pull requests", "expir",
                     "github.com/settings/personal-access-tokens/new"]:
            self.assertIn(must, g, must)
        self.assertIn("why", g.lower())


if __name__ == "__main__":
    unittest.main()
