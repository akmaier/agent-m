# Module: MOD-mail-records
# Guards: A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER; A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL; UC-038
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
FLOW = "UC-038 steps 2 and 3"


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

    # TST-814004 · level: system · module: MOD-mail-records
    # guards: UC-038
    # given: the case under "UC-038 steps 2 and 3" beside this file: issue 7 lists <abc>, <sample@example.invalid> is marked not an issue, the mailbox holds four mails
    # input: each mailbox mail named, the issues' lists read, decided mails left out, a reply in a known thread attached
    # expect: the listed and the marked mail are left out, the reply is attached to issue 7 and not proposed, only the unrelated new mail is proposed
    def test_reading_the_mailbox_leaves_out_attaches_and_proposes(self):
        for loaded in cases(FLOW):
            with self.subTest(case=loaded["name"]):
                got = run("""
                    const listed = new Map();
                    for (const issue of input.issues)
                        for (const id of mailRecords.listedMailIds(issue)) listed.set(id, issue.number);
                    const named = await Promise.all(input.mailbox.map(async (m) => ({
                        ...m, id: await mailRecords.mailId({ messageId: m.messageId, bytes: null }) })));
                    const open = new Set(mailRecords.undecided(named.map((m) => m.id), new Set(listed.keys()), new Set(input.marked)));
                    const attached = {};
                    const proposed = [];
                    for (const m of named.filter((n) => open.has(n.id))) {
                        const issue = await mailRecords.threadMatch({ inReplyTo: m.inReplyTo, references: m.references }, listed);
                        if (issue === null) proposed.push(m.id); else attached[m.id] = issue;
                    }
                    return { attached, proposed };
                """, loaded["case"]["input"])
                self.assertEqual(got, loaded["case"]["expected"])


if __name__ == "__main__":
    unittest.main()
