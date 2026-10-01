# Module: MOD-dashboard-app
# Guards: A TOKEN IS SCOPED TO WHAT IT WRITES; THE TOKEN LINK IS PREFILLED; THE REPOSITORY CHOICE IS SPELLED OUT; ONE GITHUB TOKEN SERVES EVERY FEATURE
# Level: component
"""SPEC §7 A TOKEN IS SCOPED TO WHAT IT WRITES · THE TOKEN LINK IS PREFILLED ·
THE REPOSITORY CHOICE IS SPELLED OUT · ONE GITHUB TOKEN SERVES EVERY FEATURE.

Permission parameter names and access levels as GitHub documents them, read 2026-10-01 in the table
"Repository permissions" of
https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#pre-filling-fine-grained-personal-access-token-details-using-url-parameters
— `pull_requests` (Pull requests: read, write), `workflows` (Workflows: write only), `contents`, `issues`,
`actions` (read, write), `metadata` (read only); "write always includes read".
"""
import unittest
from urllib.parse import parse_qsl, urlsplit

from jsrun import js

TOKEN_FIELDS = {"name", "description", "expires_in", "target_name"}
ONE_TOKEN = {"contents": "write", "issues": "write", "pull_requests": "write", "actions": "write",
             "workflows": "write", "metadata": "read"}
NAMED = ["Contents: read and write", "Issues: read and write", "Pull requests: read and write",
         "Actions: read and write", "Workflows: read and write", "Metadata: read"]


def permissions(link: str) -> dict:
    return {k: v for k, v in parse_qsl(urlsplit(link).query) if k not in TOKEN_FIELDS}


class TokenScopeDocumented(unittest.TestCase):
    def test_guidance_names_minimum_scope_and_reason(self):
        g = js("return settingsView.TOKEN_GUIDANCE;")
        for must in ["fine-grained", "Only select repositories", "expir", "why", *NAMED]:
            self.assertIn(must.lower(), g.lower(), must)
        # why each part is needed
        for why in ["save and accept", "issues", "pull request", "start a run", "ci configuration"]:
            self.assertIn(why, g.lower(), why)

    def test_link_asks_for_exactly_the_one_token_permissions(self):
        link = js("return settingsView.tokenLinkUrl('r/agent-m');")
        self.assertEqual(permissions(link), ONE_TOKEN)

    def test_counter_proof_a_missing_or_extra_permission_is_seen(self):
        base = "https://github.com/settings/personal-access-tokens/new?name=x&expires_in=90"
        six = "&contents=write&issues=write&pull_requests=write&actions=write&workflows=write&metadata=read"
        self.assertNotEqual(permissions(base + "&contents=write&issues=write&actions=write&metadata=read"), ONE_TOKEN)
        self.assertNotEqual(permissions(base + six.replace("&workflows=write", "")), ONE_TOKEN)
        self.assertNotEqual(permissions(base + six + "&administration=write"), ONE_TOKEN)
        self.assertEqual(permissions(base + six), ONE_TOKEN)

    def test_steps_carry_the_scope(self):
        steps = js("return settingsView.repositoryChoiceSteps('r/agent-m', 'r/thesis');")
        self.assertIn("Only select repositories", steps[0])
        self.assertTrue(any("r/thesis" in s for s in steps))
        for p in NAMED:
            self.assertTrue(any(p in s for s in steps), p)


if __name__ == "__main__":
    unittest.main()
