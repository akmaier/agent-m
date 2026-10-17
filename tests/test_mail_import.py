# Module: MOD-mail-records
# Guards: A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER; A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
# Level: release
"""SPEC section 14 - the check named tests/test_mail_import.py, for the three requirements MOD-mail-records decides.

The cases live in tests/test_mail_import.md. This file only loads them and asks node to run the module's public
functions (mailId, listedMailIds, undecided, threadMatch) through jsrun.
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import js

DATA = Path(__file__).with_suffix(".md")
NAMED = "A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER"
DECIDED = "A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN"
THREAD = "A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL"


def cases(section: str) -> list[dict]:
    text = DATA.read_text(encoding="utf-8")
    body = re.search(rf"^## {re.escape(section)}\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    if not body:
        raise AssertionError(f"missing section {section}")
    found = [{"name": m.group(1), "case": json.loads(m.group(2))}
             for m in re.finditer(r"^### ([^\n]+)\n\n```json\n(.*?)\n```", body.group(1), re.M | re.S)]
    if not found:
        raise AssertionError(f"no cases under {section}")
    return found


def run(expression: str, argument: dict):
    return js(f"const input = {json.dumps(argument)};\n{expression}")


class TestMailImport(unittest.TestCase):
    # TST-814001 · level: release · module: MOD-mail-records
    # guards: A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER
    # given: the cases under that requirement in the Markdown file beside this one: one mail read twice, two mails with different Message-IDs, one mail without a Message-ID
    # input: each mail's Message-ID, or its bytes when it has none, to mailId
    # expect: the same Message-ID gives the same MAIL- plus sixteen hex digits twice, different Message-IDs give different ones, a mail without Message-ID is named by its bytes
    def test_a_mail_is_named_by_the_hash_of_its_message_id(self):
        for loaded in cases(NAMED):
            with self.subTest(case=loaded["name"]):
                got = run("""
                    return await Promise.all(input.mails.map((m) => mailRecords.mailId({
                        messageId: m.messageId,
                        bytes: m.bytesText === undefined ? m.bytes : new TextEncoder().encode(m.bytesText) })));
                """, loaded["case"]["input"])
                self.assertEqual(got, loaded["case"]["expected"]["ids"])

    # TST-814002 · level: release · module: MOD-mail-records
    # guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
    # given: the cases under that requirement beside this file: identifiers read a second time, some listed by an issue, some marked not an issue, some unmarked and new
    # input: the identifiers, the set an issue lists and the set marked in this browser, to undecided
    # expect: none that an issue lists and none marked is proposed; an unmarked new one is, in its order
    def test_a_decided_mail_is_not_proposed_again(self):
        for loaded in cases(DECIDED):
            with self.subTest(case=loaded["name"]):
                got = run("return mailRecords.undecided(input.ids, new Set(input.listed), new Set(input.marked));",
                          loaded["case"]["input"])
                self.assertEqual(got, loaded["case"]["expected"]["proposed"])

    # TST-814003 · level: release · module: MOD-mail-records
    # guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
    # given: the cases under that requirement beside this file, with issue 7 listing two mails by identifier
    # input: a mail's In-Reply-To and References and the map of listed identifiers to issue numbers, to threadMatch
    # expect: a mail naming a listed mail in either header gets that issue's number; a mail naming none gets null
    def test_a_mail_in_a_known_thread_is_matched_to_its_issue(self):
        for loaded in cases(THREAD):
            with self.subTest(case=loaded["name"]):
                got = run("""
                    return await mailRecords.threadMatch(
                        { inReplyTo: input.inReplyTo, references: input.references },
                        new Map(Object.entries(input.listed)));
                """, loaded["case"]["input"])
                self.assertEqual(got, loaded["case"]["expected"]["issue"])


if __name__ == "__main__":
    unittest.main()
