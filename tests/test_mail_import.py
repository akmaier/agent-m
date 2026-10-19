# Module: MOD-mail-records
# Module: MOD-mail-handling
# Guards: A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER; A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL; A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE; A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE; UC-038
# Level: release
"""SPEC section 14 - the check named tests/test_mail_import.py, for the requirements MOD-mail-records and MOD-mail-handling decide.

The cases live in tests/test_mail_import.md. This file only loads them and asks node to run the modules' public
functions through jsrun: mailId, listedMailIds, undecided and threadMatch of MOD-mail-records, and readNewMail, decideMail
and mailStrategies of MOD-mail-handling, the latter over a fake mailbox and a fake host of the accepted interface
(MOD-repository-hosts: listIssues, createIssue, commentOnIssue, setIssueLabels, setIssueState, repositoryInfo) built
from each case's data. INTAKE_WORLD is that adapter; tests/test_mail_privacy.py runs the same world.
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
CLICK = "A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK"
KIND = "AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE"
JOB = "The kind propose-issues"
DUPLICATE = "A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE"

# The adapter of MOD-mail-handling. It builds the fake mailbox and the fake host of one case from its data, carries out the
# case's steps in order, and returns everything a case may state: each step's result, the issues created, the comments and
# labels written, every text written to a repository, what the browser's storage, the network and the file system received,
# the calls of the mailbox, the secrets of the mails found in a written text (`leaks`) and the people of the case found in
# one (`present`). A mail is given by key: header addresses with display names, subject, text and attachments.
INTAKE_WORLD = r"""
const PRODUCT = "https://github.com/example/thesis-tool";
const FIXED = input.today + "T10:00:00Z";
const RealDate = Date;
globalThis.Date = class extends RealDate {
  constructor(...a) { super(...(a.length ? a : [FIXED])); }
  static now() { return new RealDate(FIXED).getTime(); }
};
const sinks = { storage: [], fetches: [], files: [] };
const storage = { getItem: () => null, setItem: (k, v) => { sinks.storage.push(k + "=" + v); }, removeItem: () => {}, clear: () => {}, key: () => null, length: 0 };
for (const name of ["localStorage", "sessionStorage"]) Object.defineProperty(globalThis, name, { value: storage, configurable: true, writable: true });
Object.defineProperty(globalThis, "fetch", { value: async (url, init) => { sinks.fetches.push(String(url) + " " + String(init?.body ?? "")); throw new Error("no network"); }, configurable: true, writable: true });
const fs = process.getBuiltinModule("node:fs");
for (const name of ["writeFileSync", "appendFileSync"]) fs[name] = (path, data) => { sinks.files.push(String(path) + " " + String(data)); };
fs.promises.writeFile = async (path, data) => { sinks.files.push(String(path) + " " + String(data)); };

const person = (p) => ({ name: p.name ?? null, address: p.address });
const mk = (key) => {
  const d = input.mails[key];
  return { id: d.id, messageId: d.messageId, inReplyTo: d.inReplyTo ?? null, references: d.references ?? [], from: person(d.from),
    replyTo: (d.replyTo ?? []).map(person), to: [person({ address: "reports@example.invalid" })], cc: (d.cc ?? []).map(person),
    subject: d.subject ?? "Export fails", date: d.date ?? "2026-10-10T08:00:00Z", text: d.text,
    attachments: (d.attachments ?? []).map((a) => ({ name: a.name, type: "text/plain", size: a.text.length, text: a.text })), folder: "INBOX" };
};

const mailboxCalls = [];
const known = { read: async () => { mailboxCalls.push("read"); return (input.read ?? Object.keys(input.mails)).map(mk); } };
const mailbox = new Proxy(known, { get: (t, p) => (typeof p === "string" && p !== "then" && !(p in t) ? async () => { mailboxCalls.push(p); return null; } : t[p]) });

const issues = input.issues.map((i) => ({ number: i.number, title: i.title ?? "Issue " + i.number, body: i.body, labels: [...(i.labels ?? [])], state: i.state ?? "open",
  url: "https://example.invalid/" + i.number, comments: (i.comments ?? []).map((c) => ({ author: "agent-m", body: c.body, date: c.date ?? "2026-10-12T09:00:00Z" })) }));
const issueOf = (n) => issues.find((i) => i.number === n);
const hostCalls = [];
const written = [];
const created = [];
const comments = [];
const labelCalls = [];
const hostKnown = {
  listIssues: async (filter) => { hostCalls.push("listIssues"); return filter?.state === "open" ? issues.filter((i) => i.state === "open") : issues; },
  repositoryInfo: async () => { hostCalls.push("repositoryInfo"); return { description: input.description ?? "A tool for writing a thesis." }; },
  createIssue: async (issue) => {
    hostCalls.push("createIssue"); created.push({ title: issue.title, body: issue.body, labels: issue.labels });
    written.push({ via: "createIssue", text: [issue.title, issue.body, ...issue.labels].join("\n") });
    const made = { number: 100 + created.length, title: issue.title, body: issue.body, labels: [...issue.labels], state: "open", url: "u", comments: [] };
    issues.push(made); return made;
  },
  commentOnIssue: async (n, body) => { hostCalls.push("commentOnIssue"); comments.push([n, body]); written.push({ via: "commentOnIssue", text: body }); issueOf(n).comments.push({ author: "agent-m", body, date: FIXED }); },
  setIssueLabels: async (n, change) => { hostCalls.push("setIssueLabels"); labelCalls.push([n, change]); written.push({ via: "setIssueLabels", text: JSON.stringify(change) }); },
  setIssueState: async (n, state) => { hostCalls.push("setIssueState"); written.push({ via: "setIssueState", text: state }); },
};
// Any other method a module calls on the host is recorded as a write, so that a call nobody accepted is seen.
const host = new Proxy(hostKnown, { get: (t, p) => (typeof p === "string" && p !== "then" && !(p in t) ? async (...a) => { hostCalls.push(p); written.push({ via: p, text: JSON.stringify(a) }); } : t[p]) });
const products = [{ address: PRODUCT, host }];

const state = { read: null };
const idOf = (key) => input.mails[key].id;
const peopleOf = (key) => state.read.proposable.find((p) => p.mail.id === idOf(key)).people;
const results = [];
for (const step of input.steps) {
  try {
    switch (step.do) {
      case "readNewMail": {
        state.read = await mailHandling.readNewMail(mailbox, products, step.marked ?? []);
        results.push({ proposable: state.read.proposable.map((p) => p.mail.id), attached: state.read.attached, decided: state.read.decided, unwritten: state.read.unwritten });
        break;
      }
      case "kind": {
        const k = await jobCatalogue.kindOf("propose-issues");
        results.push({ tools: k.tools, writer: k.writer, recipes: k.recipes.map((r) => r.name) });
        break;
      }
      case "batch": {
        const chosen = step.mails.map((key) => { const p = state.read.proposable.find((x) => x.mail.id === idOf(key)); return { mail: p.mail, people: p.people, ticked: (step.ticked ?? {})[key] ?? [] }; });
        const context = { params: {} };
        const parts = await mailHandling.mailStrategies.recipes["mail-batch"](context, { mails: chosen, products });
        results.push({ parts: parts.map((p) => p.name) });
        break;
      }
      case "draftWriter": {
        const out = await jobRunnerBuiltins.builtins.writers["return-draft"]({ draft: step.draft }, { params: {} });
        results.push({ commits: out.commits, files: out.files, pullRequest: out.pullRequest, shown: out.shown });
        break;
      }
      case "decide": {
        let error = null; let issue = null;
        try { issue = (await mailHandling.decideMail({ id: idOf(step.mail), people: step.people ?? peopleOf(step.mail) }, step.decision, step.noHost ? null : host, {})).issue; }
        catch (e) { error = e.name; }
        results.push({ error, issue });
        break;
      }
      case "noReply": await mailHandling.noReply(host, step.issue, idOf(step.mail)); results.push({ error: null }); break;
      case "measure": {
        const found = input.neutral.map((n) => personalData.personHits(n.text, peopleOf(n.mail)).length > 0);
        results.push({ measured: found.length, found });
        break;
      }
      case "plant": written.push({ via: step.via, text: step.text }); results.push({ planted: step.via }); break;
      default: throw new Error("unknown step " + step.do);
    }
  } catch (e) { results.push({ error: e.name + ": " + e.message }); }
}

const lower = (t) => String(t).toLowerCase();
const digits = (t) => String(t).replace(/MAIL-[0-9a-f]{16}/g, "").replace(/\D/g, "");
const secrets = [];
for (const d of Object.values(input.mails)) {
  secrets.push(["sender address", d.from.address]);
  if (d.from.name) secrets.push(["sender name", d.from.name]);
  secrets.push(["body", d.text.trim()]);
  for (const a of d.attachments ?? []) secrets.push(["attachment", a.text]);
}
const leaks = [];
for (const w of written) for (const [what, secret] of secrets) if (lower(w.text).includes(lower(secret))) leaks.push({ write: w.via, what });

const people = input.terms ?? { names: [], addresses: [], phones: [], accounts: [] };
const present = [];
for (const w of written) {
  for (const name of people.names) for (const part of [name, ...name.split(/\s+/)]) if (part.length > 2 && lower(w.text).includes(lower(part))) present.push({ write: w.via, term: part });
  for (const a of [...people.addresses, ...people.accounts]) if (lower(w.text).includes(lower(a))) present.push({ write: w.via, term: a });
  for (const ph of people.phones) if (digits(w.text).includes(digits(ph))) present.push({ write: w.via, term: ph });
}
const once = (list) => list.filter((x, i) => list.findIndex((y) => y.write === x.write && y.term === x.term) === i);
return {
  results, created, comments, labelCalls, leaks, present: once(present),
  writeCalls: hostCalls.filter((n) => n !== "listIssues" && n !== "repositoryInfo"),
  writtenVia: written.map((w) => w.via),
  mailboxCalls,
  storage: sinks,
};
"""


def cases(section: str, data: Path = DATA) -> list[dict]:
    text = data.read_text(encoding="utf-8")
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


def run_world(argument: dict) -> dict:
    return run(INTAKE_WORLD, argument)


def check_world(test: unittest.TestCase, section: str, data: Path = DATA, keep=lambda name: True) -> None:
    for loaded in cases(section, data):
        if not keep(loaded["name"]):
            continue
        with test.subTest(case=loaded["name"]):
            got = run_world(loaded["case"]["input"])
            wanted = loaded["case"]["expected"]
            test.assertEqual({key: got[key] for key in wanted}, wanted)


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

    # TST-994001 · level: release · module: MOD-mail-handling
    # guards: A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; UC-038
    # given: the cases under that requirement in the Markdown file beside this one: a mailbox with a new mail and a mail in a known thread, a product whose host records every call
    # input: readNewMail, the recipe mail-batch and the writer return-draft with no decideMail; and, as counter-proof, the same run with one decideMail create
    # expect: the run without decideMail creates no issue and writes only the thread mail's note; the same run with the click creates exactly one
    def test_a_run_without_the_click_creates_no_issue(self):
        check_world(self, CLICK, keep=lambda name: not name.startswith(JOB))

    # TST-994002 · level: release · module: MOD-mail-handling
    # guards: A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; UC-038
    # given: the cases under that requirement beside this file: the kind propose-issues as the job catalogue holds it, a proposed issue text the participant returns
    # input: the kind's definition, the recipe mail-batch and the writer return-draft over a host that records a createIssue
    # expect: the kind offers no tool and no writer but return-draft; running its recipe and writer calls no host function that writes
    def test_the_job_definition_of_the_participant_has_no_issue_creating_call(self):
        check_world(self, CLICK, keep=lambda name: name.startswith(JOB))

    # TST-994003 · level: release · module: MOD-mail-handling
    # guards: AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE; UC-038
    # given: the cases under that requirement beside this file: a mail with its people and a neutral text
    # input: decideMail with the decision create and the label defect, change, another label and none
    # expect: the issue is created with exactly the label defect or change; any other label creates nothing
    def test_every_created_issue_is_a_defect_or_a_change(self):
        check_world(self, KIND)

    # TST-994004 · level: release · module: MOD-mail-handling
    # guards: A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE; UC-038
    # given: the cases under that requirement beside this file: issue 7 open, a mail the person confirms as describing it
    # input: decideMail with the decision add, and as counter-proof with the decision create
    # expect: add writes one mail-added note on issue 7 naming the identifier and creates no issue; create creates one and writes no note
    def test_a_confirmed_duplicate_is_added_to_the_existing_issue(self):
        check_world(self, DUPLICATE)


if __name__ == "__main__":
    unittest.main()
