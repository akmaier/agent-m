# Module: MOD-git-host
# Guards: THE PAGE STATES WHAT IT SENDS WHERE; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
# Level: component
"""SPEC §7 THE PAGE STATES WHAT IT SENDS WHERE · A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT (the GitHub token)."""
import unittest

from jsrun import js


class DestinationDisclosure(unittest.TestCase):
    def test_disclosed_destinations_match_where_the_token_may_go(self):
        v = js("return [gitHost.TOKEN_DESTINATIONS, gitHost.authHeaders('https://api.github.com/x', 't'),"
               " gitHost.authHeaders('https://raw.githubusercontent.com/x', 't'),"
               " gitHost.authHeaders('https://example.org/x', 't'), gitHost.authHeaders('https://api.github.com/x', null)];")
        dests, api, raw, other, none = v
        self.assertEqual(dests, ["https://api.github.com"])
        self.assertEqual(api, {"Authorization": "Bearer t"})
        self.assertEqual((raw, other, none), ({}, {}, {}))
        self.assertIn("api.github.com", js("return settingsView.TOKEN_GUIDANCE;"))


if __name__ == "__main__":
    unittest.main()
