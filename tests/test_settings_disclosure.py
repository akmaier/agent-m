"""SPEC §7 THE SHARED PAGES ORIGIN IS DISCLOSED — stated before anything is stored."""
import re
import unittest
from pathlib import Path

from jsrun import ASSETS, js


class SettingsDisclosure(unittest.TestCase):
    def test_notice_names_the_owner_domain(self):
        n = js("return core.sharedOriginNotice('akmaier');")
        self.assertIn("akmaier.github.io", n)
        self.assertIn("every", n.lower())

    def test_nothing_can_be_stored_before_acknowledging(self):
        self.assertEqual(js("return [core.canStore(false), core.canStore(true)];"), [False, True])

    def test_settings_view_shows_the_notice_before_the_input(self):
        app = (ASSETS / "review-app.mjs").read_text(encoding="utf-8")
        m = re.search(r"function viewSettings\(.*?\n}\n", app, re.S)
        self.assertIsNotNone(m, "viewSettings missing")
        body = m.group(0)
        self.assertLess(body.index("sharedOriginNotice("), body.index('id="token-input"'))
        tag = re.search(r'<input\b[^>]*id="token-input"[^>]*>', body, re.S)
        self.assertIsNotNone(tag, "token input missing")
        self.assertRegex(tag.group(0), r"\bdisabled\b", "the token input must start disabled")


if __name__ == "__main__":
    unittest.main()
