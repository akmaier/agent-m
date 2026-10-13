# Module: MOD-settings-pages
# Guards: THE SHARED PAGES ORIGIN IS DISCLOSED; AN EXPORT STATES THAT IT CONTAINS SECRETS; AN EXPORT CAN BE LOCKED WITH A PASSPHRASE; SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS; EVERY STEP EXPLAINS ITSELF; THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE; A MAILBOX THROUGH THE JUMP HOST IS NAMED AS READABLE THERE; A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT; UC-042
# Level: component
"""SPEC §7 THE SHARED PAGES ORIGIN IS DISCLOSED — stated before anything is stored.

That nothing can be stored before the notice is acknowledged (canStore, still in the kernel) is checked in
tests/test_settings_in_the_core.py.
"""
import re
import unittest
from pathlib import Path

from jsrun import ASSETS, SRC, js


def dashboard_text(shell: bool = True) -> str:
    """The settings page files: the shell, dashboard-app.mjs, and every view and settings section under
    docs/assets/dashboard/; `shell=False`: the views alone."""
    views = sorted((ASSETS / "dashboard").rglob("*.mjs"))
    return "\n".join(f.read_text(encoding="utf-8") for f in ([ASSETS / "dashboard-app.mjs"] if shell else []) + views)


def mailbox_text() -> str:
    """MOD-settings-pages' mailbox route source, where the disclosure gates store the mailbox setting."""
    return (SRC / "settings-pages" / "mailbox.mjs").read_text(encoding="utf-8")


class SettingsDisclosure(unittest.TestCase):
    def test_notice_names_the_owner_domain(self):
        n = js("return settingsView.sharedOriginNotice('akmaier');")
        self.assertIn("akmaier.github.io", n)
        self.assertIn("every", n.lower())

    def test_settings_view_shows_the_notice_before_the_input(self):
        app = dashboard_text()
        m = re.search(r"function viewSettings\(.*?\n}\n", app, re.S)
        self.assertIsNotNone(m, "viewSettings missing")
        body = m.group(0)
        self.assertLess(body.index("sharedOriginNotice("), body.index('id="token-input"'))
        tag = re.search(r'<input\b[^>]*id="token-input"[^>]*>', body, re.S)
        self.assertIsNotNone(tag, "token input missing")
        self.assertRegex(tag.group(0), r"\bdisabled\b", "the token input must start disabled")


def store_test_handler() -> str:
    src = mailbox_text()
    start = src.index('storeTest.addEventListener("click"')
    end = src.index('setup.addEventListener("click"', start)
    return src[start:end]


class MailboxSettingsDisclosure(unittest.TestCase):
    """SPEC §14 mailbox disclosures before a mailbox connection is stored."""

    # TST-532005 - level: release - module: system
    # guards: THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE
    # given: MOD-settings-pages' mailbox source, with the IMAP Store and test handler and the password notice text
    # input: the password notice gate and the first write of the mailbox setting on the IMAP path
    # expect: the notice names the owner Pages origin, reading all mail, sending mail in the mailbox name and the named Bridge; the handler returns before the mailbox write when the notice is unread or the password is empty
    def test_mailbox_password_disclosure_stands_before_the_password_is_stored(self):
        src = mailbox_text()
        notice = re.search(r'el\("p", "notice mailbox-password-notice", `([^`]+)`\)', src, re.S)
        self.assertIsNotNone(notice, "password notice missing")
        for words in ["Every GitHub Pages site under", "can read it", "read all mail", "send mail in its name",
                      "no server except the Bridge this connection names"]:
            self.assertIn(words, notice.group(1))
        body = store_test_handler()
        store = body.index('writeSetting(store, "mailbox", connection);')
        self.assertLess(body.index("if (!passwordRead.checked)"), store)
        self.assertLess(body.index("if (!password.value)"), store)
        self.assertIn("Nothing was stored", body[:store])

    # TST-532006 - level: release - module: system
    # guards: A MAILBOX THROUGH THE JUMP HOST IS NAMED AS READABLE THERE
    # given: MOD-settings-pages' mailbox source, with Bridges that may or may not be reached through the jump host
    # input: the jump-host notice, the Bridge selection visibility rule and the first mailbox write on the IMAP path
    # expect: only a jump-host Bridge shows the notice, the notice names that the password and mails pass it and can be read by its administrator, and the handler returns before storing until that notice is read
    def test_mailbox_jump_host_disclosure_blocks_only_the_jump_host_route(self):
        src = mailbox_text()
        notice = re.search(r'const jumpNotice = el\("p", "notice mailbox-jump-notice", "([^"]+)"\);', src)
        self.assertIsNotNone(notice, "jump-host notice missing")
        for words in ["password and the mails pass the jump host", "administers the jump host can read them"]:
            self.assertIn(words, notice.group(1))
        self.assertIn("jumpNotice.hidden = !chosen()?.throughJumpHost", src)
        self.assertIn("jumpRead.hidden = jumpNotice.hidden", src)
        body = store_test_handler()
        store = body.index('writeSetting(store, "mailbox", connection);')
        self.assertLess(body.index("if (bridge.throughJumpHost && !jumpRead.checked)"), store)
        self.assertIn("jumpHostNoted: bridge.throughJumpHost", body)

    # TST-532007 - level: release - module: system
    # guards: A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT
    # given: MOD-settings-pages' mailbox source and fixture processing places inside and outside the EU
    # input: isOutsideEu for this machine, an EU data centre and a USA provider; the outside-EU notice gate and the first mailbox write
    # expect: this machine and the EU data centre are inside the EU, the USA provider is outside it, the notice names non-compliance with GDPR and the EU AI Act, and the handler returns before storing until that notice is read
    def test_mailbox_outside_eu_disclosure_blocks_the_store_until_read(self):
        src = mailbox_text()
        notice = re.search(r'const PLACE_NOTICE = "([^"]+)"', src)
        self.assertIsNotNone(notice, "outside-EU notice missing")
        for words in ["does not comply", "GDPR", "EU AI Act"]:
            self.assertIn(words, notice.group(1))
        self.assertEqual(js("return [settingsPagesMailbox.isOutsideEu('this machine'), "
                            "settingsPagesMailbox.isOutsideEu('FAU data centre (EU)'), "
                            "settingsPagesMailbox.isOutsideEu('Anthropic, a provider in the USA')];"),
                         [False, False, True])
        body = store_test_handler()
        store = body.index('writeSetting(store, "mailbox", connection);')
        self.assertLess(body.index("ticked.some(isOutsideEu) && !placeRead.checked"), store)
        self.assertIn("Nothing was stored", body[:store])


if __name__ == "__main__":
    unittest.main()


class PseudonymisationOffDisclosure(unittest.TestCase):
    """SPEC §14 SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS."""

    def test_the_notice_states_what_follows(self):
        n = js("return settingsView.pseudonymisationOffNotice({ repo: 'alice/thesis', isPublic: false });")
        self.assertIn("unchanged", n)
        self.assertIn("issues", n)
        self.assertIn("protected, non-public", n)
        self.assertNotIn("published", n, "a private repository is not warned of publication")

    def test_a_public_repository_is_warned_of_publication(self):
        n = js("return settingsView.pseudonymisationOffNotice({ repo: 'alice/thesis', isPublic: true });")
        self.assertIn("public", n)
        self.assertIn("will be published", n)

    def test_the_page_shows_the_notice_before_saving(self):
        app = dashboard_text()
        self.assertLess(app.index("pseudonymisationOffNotice("), app.index('id="pseudo-save"'))


# Guards: EVERY STEP EXPLAINS ITSELF; SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS; UC-042
class PseudonymisationExplained(unittest.TestCase):
    """The folded explanation of the product setting *Pseudonymisation* (UC-042): what the setting does since the SPEC of
    2026-09-30 — report data from mails reaches the product only as a participant's rewriting that mentions no person and
    keeps its technical content, checked by three LLMs of three other models — and no longer stand-ins (surrogates were
    withdrawn the same day)."""

    STALE = re.compile(r"stand-?ins?\b|surrogat", re.I)

    def test_the_explanation_names_the_rewriting_without_persons(self):
        e = js("return settingsView.PSEUDONYMISATION_EXPLANATION ?? null;")
        self.assertIsInstance(e, str, "settings-view.mjs exports the explanation as one text")
        low = e.lower()
        self.assertIn("rewriting", low)
        self.assertIn("mentions no person", low)
        self.assertIn("technical content", low)
        self.assertIn("three", low)
        self.assertIn("different models", low)
        self.assertIn("default", low, "on unless the product switches it off")
        self.assertIn("protected, non-public", low)
        self.assertIsNone(self.STALE.search(e), "no stand-ins: surrogates are withdrawn")

    def test_the_dashboard_says_neither_stand_in_nor_surrogate(self):
        hit = self.STALE.search(dashboard_text())
        self.assertIsNone(hit, f"the dashboard still says {hit.group(0)!r}" if hit else "")

    def test_the_setting_shows_that_explanation(self):
        app = dashboard_text()
        start, end = app.index("<h4>Pseudonymisation"), app.index("<h4>Collaborators")
        section = app[start:end]
        explain = re.search(r'<details class="explain"><summary>What is this\?</summary><div>(.*?)</div></details>', section, re.S)
        self.assertIsNotNone(explain, "the setting has a folded explanation")
        self.assertEqual(explain.group(1).strip(), "${h(PSEUDONYMISATION_EXPLANATION)}",
                         "the fold shows the one exported text, not a second copy of it")
