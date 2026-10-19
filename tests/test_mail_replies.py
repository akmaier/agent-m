# Module: MOD-mail-handling
# Guards: THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; A REPLY GOES TO ONE REPORTER; CLOSING AN ISSUE PREPARES ITS REPLIES; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS; A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO; A SENT REPLY IS NOTED IN THE ISSUE; AN ISSUE WAITING FOR A REPORTER IS LABELLED; A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE; A CLOSED ISSUE IS REOPENED ONLY BY A PERSON; UC-039
# Level: release
"""SPEC section 14 - the check named tests/test_mail_replies.py, for the eleven requirements MOD-mail-handling decides.

The cases live in tests/test_mail_replies.md. This file only loads them and asks node to run the module's public functions
(repliesDue, storeReplies, sendReply, askReporter, noReply, readNewMail) through jsrun, over a fake mailbox and a fake
repository host built from each case's data. The fakes are the adapter: they hold the issues, the Drafts and Sent folders
of the case, and record every call and every write.
"""
import json
import re
import unittest
from pathlib import Path

from jsrun import js

DATA = Path(__file__).with_suffix(".md")
RECORD = "THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING"
NAMES = "AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS"
ONE = "A REPLY GOES TO ONE REPORTER"
CLOSING = "CLOSING AN ISSUE PREPARES ITS REPLIES"
DRAFT = "A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER"
LISTS = "THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS"
SENT_BY_HAND = "A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO"
NOTED = "A SENT REPLY IS NOTED IN THE ISSUE"
LABELLED = "AN ISSUE WAITING FOR A REPORTER IS LABELLED"
ANSWER = "A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE"
REOPEN = "A CLOSED ISSUE IS REOPENED ONLY BY A PERSON"

# The adapter. `world` builds the fake mailbox and the fake host of one case from its data; `run` carries out the case's steps
# in order and returns everything the cases may state: each step's result, the issues' end state, the comments written, the
# calls each side received, and what reached the browser's storage or the network.
WORLD = r"""
const PRODUCT = "https://github.com/example/thesis-tool";
const FIXED = input.today + "T10:00:00Z";
const RealDate = Date;
globalThis.Date = class extends RealDate {
  constructor(...a) { super(...(a.length ? a : [FIXED])); }
  static now() { return new RealDate(FIXED).getTime(); }
};
const sinks = { reads: 0, writes: [], fetches: [] };
let storageMode = "cleared";
const storage = {
  getItem: () => { sinks.reads += 1; return storageMode === "full" ? (input.storageText ?? "") : null; },
  setItem: (k, v) => { sinks.writes.push(k + "=" + v); },
  removeItem: () => {}, clear: () => {}, key: () => null, length: 0,
};
for (const name of ["localStorage", "sessionStorage"]) Object.defineProperty(globalThis, name, { value: storage, configurable: true, writable: true });
Object.defineProperty(globalThis, "fetch", { value: async (url, init) => { sinks.fetches.push(String(url) + " " + String(init?.body ?? "")); throw new Error("no network"); }, configurable: true, writable: true });

const person = (address) => ({ name: null, address });
const mk = (key) => {
  const d = input.mails[key];
  return { id: d.id, messageId: d.messageId, inReplyTo: d.inReplyTo ?? null, references: d.references ?? [], from: person(d.from),
    replyTo: (d.replyTo ?? []).map(person), to: [person("reports@example.invalid")], cc: (d.cc ?? []).map(person),
    subject: d.subject ?? "Export fails", date: d.date ?? "2026-10-10T08:00:00Z",
    text: d.text ?? "Hello,\nthe export fails with an error.\nKind regards", attachments: [], folder: "INBOX" };
};

const order = [];
const mailboxCalls = [];
const finds = [];
const stored = [];
const sentShown = [];
let drafts = (input.drafts ?? []).map((d) => ({ ref: { route: "bridge", uid: d.uid, uidValidity: 7 }, inReplyTo: d.inReplyTo, body: d.body ?? "", mail: mk(input.draftMail ?? Object.keys(input.mails)[0]) }));
const mailbox = {
  read: async () => { mailboxCalls.push("read"); return (input.read ?? []).map(mk); },
  find: async (id) => { mailboxCalls.push("find"); finds.push(id); const key = (input.found ?? []).find((k) => input.mails[k].id === id); return key ? mk(key) : null; },
  drafts: async () => { mailboxCalls.push("drafts"); return drafts; },
  sent: async () => { mailboxCalls.push("sent"); return (input.sent ?? []).map(mk); },
  // The route threads a draft on the Message-ID of the mail it replies to (MOD-mail-routes' storeDraft).
  storeDraft: async (draft) => {
    mailboxCalls.push("storeDraft"); stored.push(draft);
    const ref = { route: "bridge", uid: 100 + stored.length, uidValidity: 7 };
    drafts = [...drafts, { ref, inReplyTo: draft.replyTo?.messageId ?? null, body: draft.body, mail: draft.replyTo }];
    return ref;
  },
  sendDraft: async (shown) => {
    mailboxCalls.push("sendDraft"); order.push("mailbox.sendDraft"); sentShown.push(shown);
    if (input.sendFails) throw Object.assign(new Error(input.sendFails), { name: input.sendFails });
    drafts = drafts.filter((d) => d.ref.uid !== shown.ref.uid);
    return { sentAt: input.sentAt ?? (input.today + "T10:00:00Z") };
  },
};

const issues = input.issues.map((i) => ({ number: i.number, title: "Issue " + i.number, body: i.body, labels: [...(i.labels ?? [])], state: i.state ?? "open",
  url: "https://example.invalid/" + i.number, comments: (i.comments ?? []).map((c) => ({ author: "agent-m", body: c.body, date: c.date ?? "2026-10-12T09:00:00Z" })) }));
const issueOf = (n) => issues.find((i) => i.number === n);
const hostCalls = [];
const known = {
  listIssues: async (filter) => { hostCalls.push(["listIssues", filter]); return issues; },
  commentOnIssue: async (n, body) => { hostCalls.push(["commentOnIssue", n, body]); order.push("host.commentOnIssue"); issueOf(n).comments.push({ author: "agent-m", body, date: FIXED }); },
  setIssueLabels: async (n, change) => {
    hostCalls.push(["setIssueLabels", n, change]); order.push("host.setIssueLabels");
    const issue = issueOf(n);
    issue.labels = [...issue.labels.filter((l) => !(change.remove ?? []).includes(l)), ...(change.add ?? [])];
  },
  createIssue: async () => { hostCalls.push(["createIssue"]); },
  setIssueState: async (n, state) => { hostCalls.push(["setIssueState", n, state]); issueOf(n).state = state; },
};
// Any other method a module calls on the host is recorded, so that a call nobody accepted is seen.
const host = new Proxy(known, { get: (t, p) => (typeof p === "string" && p !== "then" && !(p in t) ? async (...a) => { hostCalls.push([p, ...a]); } : t[p]) });

const due = (d) => ({ issue: d.issue, closedBy: d.closedBy, mails: d.mails.map((m) => ({ id: m.id, found: m.mail !== null, draft: m.draft ? m.draft.uid : null, noted: m.noted })) });
const groups = (r) => ({ toAnswer: r.toAnswer.map(due), answerReceived: r.answerReceived.map(due), open: r.open.map(due) });
const products = [{ address: PRODUCT, host }];
const SHOWN = { ref: { route: "bridge", uid: 5, uidValidity: 7 }, sha256: "ab".repeat(32) };

const results = [];
for (const step of input.steps) {
  if (step.storage) storageMode = step.storage;
  try {
    switch (step.do) {
      case "repliesDue": results.push(groups(await mailHandling.repliesDue(mailbox, products))); break;
      case "readNewMail": {
        const r = await mailHandling.readNewMail(mailbox, products, step.marked ?? []);
        results.push({ proposable: r.proposable.map((p) => p.mail.id), attached: r.attached, decided: r.decided, unwritten: r.unwritten });
        break;
      }
      case "storeReplies": {
        const r = await mailHandling.storeReplies(mailbox, step.replies.map((x) => ({ mail: mk(x.mail), body: x.body })));
        results.push(r.map((s) => ({ id: s.id, drafted: s.draft !== null, problem: s.problem })));
        break;
      }
      case "sendReply": case "askReporter": {
        const shown = step.shown ?? SHOWN;
        let error = null;
        try { await mailHandling[step.do](mailbox, host, step.issue, input.mails[step.mail].id, shown); } catch (e) { error = e.name; }
        results.push({ error, sentAsShown: sentShown.length > 0 && sentShown.at(-1) === shown });
        break;
      }
      case "noReply": await mailHandling.noReply(host, step.issue, input.mails[step.mail].id); results.push({ error: null }); break;
      default: throw new Error("unknown step " + step.do);
    }
  } catch (e) { results.push({ error: e.name + ": " + e.message }); }
}
const names = (calls) => calls.map((c) => c[0]);
return {
  results,
  issues: issues.map((i) => ({ number: i.number, state: i.state, labels: i.labels })),
  added: hostCalls.filter((c) => c[0] === "commentOnIssue").map((c) => [c[1], c[2]]),
  labelCalls: hostCalls.filter((c) => c[0] === "setIssueLabels").map((c) => [c[1], c[2]]),
  stateCalls: names(hostCalls).filter((n) => /state|open|close/i.test(n) && n !== "listIssues" && n !== "createIssue"),
  hostCalls: names(hostCalls),
  mailboxCalls, finds, order,
  recipients: stored.map((d) => [d.to, ...(d.cc ?? []), ...(d.bcc ?? [])].flat().map((a) => a.address)),
  draftUids: drafts.map((d) => d.ref.uid),
  draftThreads: drafts.map((d) => d.inReplyTo),
  draftBodies: drafts.map((d) => d.body),
  storage: { reads: sinks.reads, writes: sinks.writes, fetches: sinks.fetches },
};
"""


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


def run(argument: dict) -> dict:
    return js(f"const input = {json.dumps(argument)};\n{WORLD}")


class TestMailReplies(unittest.TestCase):
    def check(self, section: str):
        for loaded in cases(section):
            with self.subTest(case=loaded["name"]):
                got = run(loaded["case"]["input"])
                wanted = loaded["case"]["expected"]
                self.assertEqual({key: got[key] for key in wanted}, wanted)

    # TST-959001 · level: release · module: MOD-mail-handling
    # guards: THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING
    # given: the cases under that requirement in the Markdown file beside this one: issues in three states, and a browser storage that holds, in one reading, every identifier and every label and in the other nothing
    # input: repliesDue read twice, once with the storage full and once with it cleared
    # expect: both readings give the same three groups, computed from the issues and the mailbox, and the storage is never read
    def test_the_groups_come_from_the_issues_and_the_mailbox_alone(self):
        self.check(RECORD)

    # TST-959002 · level: release · module: MOD-mail-handling
    # guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS
    # given: the cases under that requirement beside this file: a closed issue listing two identifiers, one that lists a further report by a note
    # input: repliesDue over a mailbox that finds a mail by its identifier only
    # expect: one offer per listed identifier, each mail found through its identifier, and no read of the mailbox's folders
    def test_the_listed_identifiers_are_the_replies_offered(self):
        self.check(NAMES)

    # TST-959003 · level: release · module: MOD-mail-handling
    # guards: A REPLY GOES TO ONE REPORTER
    # given: the cases under that requirement beside this file: an issue with three reports, one with a Reply-To and one with another reporter in Cc; a report without a usable address
    # input: storeReplies with a reply for each report
    # expect: three drafts, each with exactly one recipient, that report's reply address; the report without an address gets none and no other reporter in its place
    def test_each_reply_goes_to_one_reporter(self):
        self.check(ONE)

    # TST-959004 · level: release · module: MOD-mail-handling
    # guards: CLOSING AN ISSUE PREPARES ITS REPLIES
    # given: the cases under that requirement beside this file: a closed issue listing two mails, closed by nobody Agent M knows; the same with a reply noted for one; with both noted
    # input: repliesDue
    # expect: two mails offered; with a reply noted for one, one offered; with both noted, the issue is in no group
    def test_a_closed_issue_offers_a_reply_for_each_mail_without_one(self):
        self.check(CLOSING)

    # TST-959005 · level: release · module: MOD-mail-handling
    # guards: A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER
    # given: the cases under that requirement beside this file: a reply text for a listed mail; a mailbox route that threads a draft on the Message-ID of the mail it replies to; a browser storage and a network that record every write
    # input: storeReplies
    # expect: Drafts holds one draft with In-Reply-To set to the mail's Message-ID and the reply above the quoted original; the mailbox received nothing but the one store, and no write to storage, network or repository contains the text
    def test_a_reply_draft_is_in_drafts_and_nowhere_else(self):
        self.check(DRAFT)

    # TST-959006 · level: release · module: MOD-mail-handling
    # guards: THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS
    # given: the cases under that requirement beside this file: Drafts holds a draft replying to a listed mail of a closed issue, one replying to a listed mail of an open issue, and an unrelated draft of the person
    # input: repliesDue
    # expect: each mail shows the draft that replies to it; the unrelated draft is shown nowhere, and a mail without a draft shows none
    def test_the_drafts_of_listed_mails_are_listed(self):
        self.check(LISTS)

    # TST-959007 · level: release · module: MOD-mail-handling
    # guards: A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO
    # given: the cases under that requirement beside this file: Sent holds a reply to a listed mail, in one case naming it only in References, and an unrelated sent mail
    # input: repliesDue, read twice
    # expect: the reply is noted once in its issue with its date, which then leaves the group to answer; an unrelated sent mail is noted nowhere
    def test_a_reply_sent_by_hand_is_noted_at_the_next_reading(self):
        self.check(SENT_BY_HAND)

    # TST-959008 · level: release · module: MOD-mail-handling
    # guards: A SENT REPLY IS NOTED IN THE ISSUE
    # given: the cases under that requirement beside this file: a draft shown to the person, whose recipient, subject and body the page knows; a mailbox that sends it, and one that refuses
    # input: sendReply
    # expect: after the send one comment names the identifier and the date and nothing else, and the mail is not offered again; a refused send notes nothing and leaves the draft
    def test_a_sent_reply_is_noted_with_the_identifier_and_the_date_only(self):
        self.check(NOTED)

    # TST-959009 · level: release · module: MOD-mail-handling
    # guards: AN ISSUE WAITING FOR A REPORTER IS LABELLED
    # given: the cases under that requirement beside this file: an open issue to which a question is sent; an issue labelled waiting-for-reporter whose answer arrives; a question the mailbox refuses
    # input: askReporter, repliesDue, noReply
    # expect: the sent question labels the issue waiting-for-reporter and leaves it open; no function removes the label; a refused question labels nothing
    def test_a_question_labels_the_issue_until_a_person_removes_it(self):
        self.check(LABELLED)

    # TST-959010 · level: release · module: MOD-mail-handling
    # guards: A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE
    # given: the cases under that requirement beside this file: a labelled issue with a mail added after its question; one with only the question; an unlabelled one with a newer mail; a labelled one whose mail came before its question
    # input: repliesDue
    # expect: only the first is answer received, with the new mail found; the others stay open
    def test_an_answer_is_shown_under_its_waiting_issue(self):
        self.check(ANSWER)

    # TST-959011 · level: release · module: MOD-mail-handling
    # guards: A CLOSED ISSUE IS REOPENED ONLY BY A PERSON
    # given: the cases under that requirement beside this file: a closed issue to which a further mail is added; a mail in the thread of a closed issue read from the mailbox
    # input: repliesDue, noReply, readNewMail
    # expect: the issue is closed at the end and no call changed its state; the new mail is offered under it
    def test_a_mail_never_reopens_a_closed_issue(self):
        self.check(REOPEN)


if __name__ == "__main__":
    unittest.main()
