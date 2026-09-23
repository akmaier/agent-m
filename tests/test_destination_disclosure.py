"""SPEC §7 THE PAGE STATES WHAT IT SENDS WHERE · THE TOKEN IS SENT ONLY TO GITHUB."""
import unittest

from jsrun import js


class DestinationDisclosure(unittest.TestCase):
    def test_disclosed_destinations_match_where_the_token_may_go(self):
        v = js("return [core.TOKEN_DESTINATIONS, core.authHeaders('https://api.github.com/x', 't'),"
               " core.authHeaders('https://raw.githubusercontent.com/x', 't'),"
               " core.authHeaders('https://example.org/x', 't'), core.authHeaders('https://api.github.com/x', null)];")
        dests, api, raw, other, none = v
        self.assertEqual(dests, ["https://api.github.com"])
        self.assertEqual(api, {"Authorization": "Bearer t"})
        self.assertEqual((raw, other, none), ({}, {}, {}))
        self.assertIn("api.github.com", js("return core.TOKEN_GUIDANCE;"))


if __name__ == "__main__":
    unittest.main()
