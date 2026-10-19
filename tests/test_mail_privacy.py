# Module: MOD-mail-handling
# Guards: MAIL STAYS IN THE MAILBOX; THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY; UC-038
# Level: release
"""SPEC section 14 - the check named tests/test_mail_privacy.py, for the three requirements MOD-mail-handling decides here.

The cases live in tests/test_mail_privacy.md. This file only loads them and runs them through the same fake mailbox and fake
host as tests/test_mail_import.py (its INTAKE_WORLD): a full run on test mails through readNewMail, the recipe mail-batch,
decideMail and noReply, with every write to a repository recorded. The check looks for a sender address, a sender name, a whole
body and a whole attachment in what was written, and for the names, addresses, phone numbers and accounts the case lists; those
are written out in the Markdown file and not taken from the code under test.
"""
import unittest
from pathlib import Path

from test_mail_import import cases, check_world, run_world

DATA = Path(__file__).with_suffix(".md")
STAYS = "MAIL STAYS IN THE MAILBOX"
ISSUE = "THE PRODUCT ISSUE CARRIES NO PERSONAL DATA"
REPOSITORY = "NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY"
RATE = "Rate: "


class TestMailPrivacy(unittest.TestCase):
    # TST-994101 · level: release · module: MOD-mail-handling
    # guards: MAIL STAYS IN THE MAILBOX; UC-038
    # given: the cases under that requirement in the Markdown file beside this one: a full run on test mails, and the same run with a body, a sender address, a sender name or an attachment planted in a job record
    # input: readNewMail, mail-batch, two decideMail create, one add and noReply over a fake mailbox and a fake host that record every call and write
    # expect: no write to the host, the browser's storage, the network or a file holds a sender address, a sender name, a whole body or a whole attachment, and the mailbox is only read; each planted text is found
    def test_after_a_full_run_no_write_holds_what_stays_in_the_mailbox(self):
        check_world(self, STAYS, DATA)

    # TST-994102 · level: release · module: MOD-mail-handling
    # guards: THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; UC-038
    # given: the cases under that requirement beside this file: mails with header addresses and display names, and an address, a phone number and an account in the body
    # input: decideMail create with the participant's neutral text; with a text that names the mail's people; and an issue text planted with the sender's name
    # expect: no created issue's title or text holds any listed term; a text naming the people creates nothing and fails with PersonFound; the planted text is found
    def test_the_issue_text_holds_no_header_person_and_no_body_contact(self):
        check_world(self, ISSUE, DATA, keep=lambda name: not name.startswith(RATE))

    # TST-994103 · level: release · module: MOD-mail-handling
    # guards: THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; UC-038
    # given: the rate case beside this file: a fixed set of four neutral texts for two mails, two of them naming the mail's people
    # input: personHits of MOD-personal-data over each text and the people readNewMail proposes with its mail
    # expect: the measure covers all four texts and finds the two that name a person; the rate is printed and not gated
    def test_the_rate_of_personal_data_in_the_neutral_text_is_reported(self):
        for loaded in cases(ISSUE, DATA):
            if not loaded["name"].startswith(RATE):
                continue
            with self.subTest(case=loaded["name"]):
                got = run_world(loaded["case"]["input"])
                measure = got["results"][1]
                self.assertEqual(got["results"], loaded["case"]["expected"]["results"])
                print(f"\nMEASURED personal data in the neutral text: {sum(measure['found'])} of {measure['measured']} texts "
                      f"({sum(measure['found']) / measure['measured']:.0%}); reported, not gated")

    # TST-994104 · level: release · module: MOD-mail-handling
    # guards: NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY; UC-038
    # given: the cases under that requirement beside this file: the full run, with the people of its mails listed out as terms
    # input: the full run, and the same run with an address or a phone number planted in a job record or a reply note
    # expect: no issue, comment or label holds a listed name, address, phone number or account, and no label is written; each planted term is found
    def test_after_a_full_run_nothing_written_holds_a_person_of_a_mail(self):
        check_world(self, REPOSITORY, DATA)


if __name__ == "__main__":
    unittest.main()
