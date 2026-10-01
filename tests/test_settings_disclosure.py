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
        app = (ASSETS / "dashboard-app.mjs").read_text(encoding="utf-8")
        m = re.search(r"function viewSettings\(.*?\n}\n", app, re.S)
        self.assertIsNotNone(m, "viewSettings missing")
        body = m.group(0)
        self.assertLess(body.index("sharedOriginNotice("), body.index('id="token-input"'))
        tag = re.search(r'<input\b[^>]*id="token-input"[^>]*>', body, re.S)
        self.assertIsNotNone(tag, "token input missing")
        self.assertRegex(tag.group(0), r"\bdisabled\b", "the token input must start disabled")


if __name__ == "__main__":
    unittest.main()


class ExportDisclosure(unittest.TestCase):
    """SPEC §7 AN EXPORT STATES THAT IT CONTAINS SECRETS · AN EXPORT CAN BE LOCKED WITH A PASSPHRASE."""

    def test_the_notice_names_each_secret_and_what_it_grants(self):
        n = js("return core.exportNotice({ [store.TOKEN_KEY]: 'github_pat_x', [store.PRODUCTS_KEY]: '[]' });")
        self.assertIn("GitHub token", n)
        self.assertIn("whoever holds", n)
        self.assertRegex(n, r"write|commit")
        self.assertNotIn("github_pat_x", n, "the notice names the secret, it does not show it")
        empty = js("return core.exportNotice({});")
        self.assertNotIn("GitHub token", empty, "counter-proof: a token that is not stored is not claimed")

    def test_a_forgotten_passphrase_is_stated_before_saving(self):
        self.assertIn("cannot be recovered", js("return core.PASSPHRASE_NOTICE;"))
        app = (ASSETS / "dashboard-app.mjs").read_text(encoding="utf-8")
        view = re.search(r"function viewSettings\(.*?\n}\n", app, re.S).group(0)
        self.assertLess(view.index("PASSPHRASE_NOTICE"), view.index('id="export-go"'))
        self.assertLess(view.index("exportNotice("), view.index('id="export-go"'))


class PseudonymisationOffDisclosure(unittest.TestCase):
    """SPEC §14 SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS."""

    def test_the_notice_states_what_follows(self):
        n = js("return core.pseudonymisationOffNotice({ repo: 'alice/thesis', isPublic: false });")
        self.assertIn("unchanged", n)
        self.assertIn("issues", n)
        self.assertIn("protected, non-public", n)
        self.assertNotIn("published", n, "a private repository is not warned of publication")

    def test_a_public_repository_is_warned_of_publication(self):
        n = js("return core.pseudonymisationOffNotice({ repo: 'alice/thesis', isPublic: true });")
        self.assertIn("public", n)
        self.assertIn("will be published", n)

    def test_the_page_shows_the_notice_before_saving(self):
        app = (ASSETS / "dashboard-app.mjs").read_text(encoding="utf-8")
        self.assertLess(app.index("pseudonymisationOffNotice("), app.index('id="pseudo-save"'))
