# Module: MOD-mail-handling
# Module: MOD-personal-data
# Guards: MAIL STAYS IN THE MAILBOX; THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY; UC-038
# Guards: REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS; A REWRITTEN TEXT IS CHECKED BY THREE LLMS; NO CHECKER IS THE REWRITER;
# Guards: A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF;
# Guards: THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
# Level: release
"""SPEC section 14 - the check named tests/test_mail_privacy.py, for the three requirements MOD-mail-handling decides here.

The cases live in tests/test_mail_privacy.md. This file only loads them and runs them through the same fake mailbox and fake
host as tests/test_mail_import.py (its INTAKE_WORLD): a full run on test mails through readNewMail, the recipe mail-batch,
decideMail and noReply, with every write to a repository recorded. The check looks for a sender address, a sender name, a whole
body and a whole attachment in what was written, and for the names, addresses, phone numbers and accounts the case lists; those
are written out in the Markdown file and not taken from the code under test.

The second class, TestMailPrivacyPersonalData, holds the cases of MOD-personal-data (ITM-1038), written by a participant that
implemented neither ITM-838 nor ITM-839. Its code is the one JavaScript function PERSONAL_WORLD, which runs what a case's `op`
names; every input and every expected value is in the Markdown file.
"""
import unittest
from pathlib import Path

from test_mail_import import cases, check_world, run, run_world

DATA = Path(__file__).with_suffix(".md")
STAYS = "MAIL STAYS IN THE MAILBOX"
ISSUE = "THE PRODUCT ISSUE CARRIES NO PERSONAL DATA"
REPOSITORY = "NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY"
RATE = "Rate: "
PERSONAL_RULES = ["A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE", "REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS",
                  "A REWRITTEN TEXT IS CHECKED BY THREE LLMS", "NO CHECKER IS THE REWRITER", "PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF",
                  "THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED"]
RATES = "Rate: report data"

PERSONAL_WORLD = r'''
const toParticipant = (p) => ({ name: p.name, type: "model endpoint", model: p.model, context: 100000, price: null, capabilities: ["draft text"], place: p.place, route: "endpoint x" });
const people = input.mail ? personalData.peopleIn(input.mail) : null;
const lowered = (text) => String(text).toLowerCase();
const present = (text) => (input.terms ?? []).filter((term) => lowered(text).includes(lowered(term)));
const rule = (f) => [f.line, f.kind, f.rule];
const check = (text) => personalData.privacyStrategies.checks["people-search"]({ text }, { params: { people } });
const context = (params, mailbox) => ({ params, places: { sources: {}, mailbox, contents: [] } });
const out = {};
const op = input.op;
if (op === "search") {
  const found = await check(input.text);
  out.findings = found.map(rule);
  out.hits = personalData.personHits(input.text, people).map((h) => [h.kind, h.value, h.line]);
  out.present = present(input.text);
} else if (op === "rewrite") {
  const participant = toParticipant(input.rewriter);
  const params = { pieces: input.pieces, participant, people };
  const parts = await personalData.privacyStrategies.recipes["report-data"](context(params, input.mailbox), params);
  out.parts = parts.map((p) => [p.name, p.text]);
  out.partsHoldNoPerson = parts.every((p) => personalData.personHits(p.name, people).length === 0);
  const found = await check(input.rewriting);
  out.findings = found.map(rule);
  out.hits = personalData.personHits(input.rewriting, people).map((h) => [h.kind, h.value]);
  out.present = present(input.rewriting);
} else if (op === "checkers") {
  const all = input.participants.map(toParticipant);
  const rewriter = all.find((p) => p.name === input.rewriter);
  const got = personalData.checkersFor(all, rewriter, input.places);
  out.checkers = got.checkers ? got.checkers.map((p) => p.name) : null;
  out.missing = Boolean(got.missing);
  if (got.checkers) {
    out.models = got.checkers.map((p) => p.model);
  }
} else if (op === "prepare") {
  const all = input.participants.map(toParticipant);
  const byName = (name) => all.find((p) => p.name === name);
  const kind = await jobCatalogue.kindOf("rewrite-without-persons");
  const ctx = { kind, params: { people, pieces: input.pieces, participant: byName(input.rewriter) }, product: { address: "https://github.com/a/p", snapshot: null, host: null },
    instance: { snapshot: null, host: null }, connect: async () => null, participants: all, places: { sources: {}, mailbox: input.places, contents: [] }, gates: [], person: "alice",
    now: new Date("2026-10-19T08:00:00Z"), agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: "JOB-20261019-0800-abcd" };
  try { jobRunner.registerStrategies("tests/test_mail_privacy.py", personalData.privacyStrategies); } catch (error) { if (error.name !== "DuplicateStrategy") throw error; }
  const prepared = await jobRunner.prepareJob("rewrite-without-persons", ctx, { drafter: byName(input.rewriter), reviewers: input.reviewers.map(byName), limit: 3 });
  out.blocking = prepared.blocking.length;
  const asked = [];
  const driver = (p, answer) => ({ participant: p, async send(sent) { asked.push(p.name); return { text: JSON.stringify({ draft: answer, answers: [] }), usage: null }; } });
  const drivers = { drafter: driver(byName(input.rewriter), { text: "x" }), reviewers: input.reviewers.map((n) => driver(byName(n), { findings: [] })) };
  try { await jobRunner.runJob(prepared, drivers, { attended: false, context: ctx }); out.refused = null; } catch (error) { out.refused = error.name; }
  out.asked = asked;
} else if (op === "loop") {
  const all = input.participants.map(toParticipant);
  const byName = (name) => all.find((p) => p.name === name);
  const kind = await jobCatalogue.kindOf("rewrite-without-persons");
  const ctx = { kind, params: { people, pieces: input.pieces, participant: byName(input.rewriter) }, product: { address: "https://github.com/a/p", snapshot: null, host: null },
    instance: { snapshot: null, host: null }, connect: async () => null, participants: all, places: { sources: {}, mailbox: input.places, contents: [] }, gates: [], person: "alice",
    now: new Date("2026-10-19T08:00:00Z"), agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: "JOB-20261019-0800-abcd" };
  try { jobRunner.registerStrategies("tests/test_mail_privacy.py", personalData.privacyStrategies); } catch (error) { if (error.name !== "DuplicateStrategy") throw error; }
  const prepared = await jobRunner.prepareJob("rewrite-without-persons", ctx, { drafter: byName(input.rewriter), reviewers: input.reviewers.map((r) => byName(r.name)), limit: 3 });
  const sentToRewriter = [];
  const rewriter = { participant: byName(input.rewriter), async send(sent) { sentToRewriter.push(sent.findings.map((f) => [f.kind, f.what])); return { text: JSON.stringify({ draft: { text: input.rewriting }, answers: [] }), usage: null }; } };
  const reviewer = (r) => ({ participant: byName(r.name), async send() { return { text: JSON.stringify({ draft: { findings: r.findings }, answers: [] }), usage: null }; } });
  const result = await jobRunner.runJob(prepared, { drafter: rewriter, reviewers: input.reviewers.map(reviewer) }, { attended: false, context: ctx });
  out.blocking = prepared.blocking.length;
  out.stopped = result.stoppedBecause;
  out.remaining = result.remaining.map((f) => [f.kind, f.what]);
  out.sentBack = sentToRewriter.slice(1);
  out.rewriterAsked = sentToRewriter.length;
  out.committed = [result.written.commits.length, result.written.files.length, result.written.pullRequest];
  out.shown = result.written.shown;
} else if (op === "pseudonymisation") {
  const schemas = await personalData.settingsSchemas();
  const settings = input.file === null ? null : documents.readDocument(schemas.settings, "docs/settings.md", input.file);
  out.value = personalData.pseudonymisationOf(settings);
} else if (op === "places") {
  const participant = toParticipant(input.participant);
  const params = { pieces: input.pieces, participant, people };
  try {
    const parts = await personalData.privacyStrategies.recipes["report-data"](context(params, input.mailbox), params);
    out.parts = parts.map((p) => p.name); out.refused = null;
  } catch (error) { out.parts = []; out.refused = error.name; }
} else if (op === "rates") {
  const technical = input.technical;
  const rows = input.rewritings.map((text) => ({ clean: personalData.personHits(text, people).length === 0 && present(text).length === 0, keeps: technical.every((t) => text.includes(t)) }));
  out.measured = rows.length;
  out.clean = rows.filter((r) => r.clean).length;
  out.keepsTechnical = rows.filter((r) => r.keeps).length;
  let passedAllThree = 0;
  for (const run of input.checkRuns) {
    const kind = await jobCatalogue.kindOf("rewrite-without-persons");
    const all = input.participants.map(toParticipant);
    const byName = (name) => all.find((p) => p.name === name);
    const ctx = { kind, params: { people, pieces: input.pieces, participant: byName(input.rewriter) }, product: { address: "https://github.com/a/p", snapshot: null, host: null },
      instance: { snapshot: null, host: null }, connect: async () => null, participants: all, places: { sources: {}, mailbox: input.places, contents: [] }, gates: [], person: "alice",
      now: new Date("2026-10-19T08:00:00Z"), agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: "JOB-20261019-0800-abcd" };
    try { jobRunner.registerStrategies("tests/test_mail_privacy.py", personalData.privacyStrategies); } catch (error) { if (error.name !== "DuplicateStrategy") throw error; }
    const prepared = await jobRunner.prepareJob("rewrite-without-persons", ctx, { drafter: byName(input.rewriter), reviewers: run.reviews.map((r) => byName(r.name)), limit: 3 });
    const rewriter = { participant: byName(input.rewriter), async send() { return { text: JSON.stringify({ draft: { text: run.text }, answers: [] }), usage: null }; } };
    const reviewer = (r) => ({ participant: byName(r.name), async send() { return { text: JSON.stringify({ draft: { findings: r.findings }, answers: [] }), usage: null }; } });
    const result = await jobRunner.runJob(prepared, { drafter: rewriter, reviewers: run.reviews.map(reviewer) }, { attended: false, context: ctx });
    if (result.stoppedBecause === "passed") passedAllThree += 1;
  }
  out.checkRuns = input.checkRuns.length;
  out.passedAllThree = passedAllThree;
}
return out;
'''


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


def personal(test: unittest.TestCase, section: str) -> None:
    """Run every case of the section through PERSONAL_WORLD and compare the keys the case names."""
    for loaded in cases(section, DATA):
        with test.subTest(case=loaded["name"]):
            got = run(PERSONAL_WORLD, loaded["case"]["input"])
            wanted = loaded["case"]["expected"]
            test.assertEqual({key: got[key] for key in wanted}, wanted)


class TestMailPrivacyPersonalData(unittest.TestCase):
    # TST-1038101 · level: release · module: MOD-personal-data
    # guards: A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; UC-038
    # given: the cases under that requirement beside this file: a mail whose header gives a name and whose signature gives another, and issue texts with and without those names
    # input: peopleIn of the mail, then the check people-search and personHits over each issue text
    # expect: a text with the sender's name, or the signature's name, gets an error finding at the line of the hit and the hit is named; the same texts without the name pass
    def test_an_issue_text_naming_a_person_of_the_mail_is_refused_and_one_without_passes(self):
        personal(self, PERSONAL_RULES[0])

    # TST-1038102 · level: release · module: MOD-personal-data
    # guards: REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS; UC-038
    # given: the cases under that requirement: a fixture log with a name, an address, a phone number, an IP address and a home-directory path, and rewritings of it that keep none or one
    # input: the recipe report-data with the log as the picked piece, then the check people-search over each rewriting, and a plain-text scan for the five terms written in the case
    # expect: the participant is sent the log as picked; the rewriting with none passes both; one that keeps the address, phone, name or the path of the mail's account is refused and the hit named; one that keeps the IP is found by the scan
    def test_a_rewriting_that_keeps_one_of_the_five_is_refused_and_one_that_keeps_none_passes(self):
        personal(self, PERSONAL_RULES[1])

    # TST-1038103 · level: release · module: MOD-personal-data
    # guards: A REWRITTEN TEXT IS CHECKED BY THREE LLMS; UC-038
    # given: the cases under that requirement: seven fixture participants, and the catalogue's kind rewrite-without-persons with three checkers whose answers the case gives
    # input: checkersFor over the participants; runJob of the kind with the rewriter and three checkers, one of which reports a name, and with none reporting
    # expect: three checkers at the mailbox's place with three models; with one reporting, the finding goes back to the rewriter, the job stops with it remaining and commits or opens nothing; with none reporting, the job passes in one round
    def test_three_checkers_and_the_finding_of_one_goes_back(self):
        personal(self, PERSONAL_RULES[2])

    # TST-1038104 · level: release · module: MOD-personal-data
    # guards: NO CHECKER IS THE REWRITER; UC-038
    # given: the cases under that requirement: a checker with the rewriter's model, two with one model, three others, and one at another place
    # input: prepareJob and runJob of the kind with each checker set; checkersFor with the participants
    # expect: a set with the rewriter's model, or with two of one model, is refused as NotStartable and no participant is asked; three others are accepted and each asked; fewer than three eligible give no checkers and a sentence
    def test_a_checker_set_with_the_rewriter_or_its_model_is_refused_before_anything_is_sent(self):
        personal(self, PERSONAL_RULES[3])

    # TST-1038105 · level: release · module: MOD-personal-data
    # guards: PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF; UC-038
    # given: the cases under that requirement: no settings file, one without the key, one with off, one with on
    # input: settingsSchemas, readDocument and pseudonymisationOf for each
    # expect: on for no file, for a file without the key and for on; off only for the file that says off
    def test_pseudonymisation_is_on_unless_a_product_switches_it_off(self):
        personal(self, PERSONAL_RULES[4])

    # TST-1038106 · level: release · module: MOD-personal-data
    # guards: THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED; UC-038
    # given: the cases under that requirement: a mailbox that allows campus, a participant at campus and one at eu-cloud
    # input: the recipe report-data for each participant
    # expect: the one at campus is given the part; the one at eu-cloud gets PlaceNotAllowed and no part
    def test_report_data_goes_only_to_a_participant_at_a_listed_place(self):
        personal(self, PERSONAL_RULES[5])

    # TST-1038107 · level: release · module: MOD-personal-data
    # guards: REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS; A REWRITTEN TEXT IS CHECKED BY THREE LLMS; UC-038
    # given: the rate case beside this file: four fixed rewritings of the log, and four runs of three checkers over one text
    # input: personHits and a term scan, and a check for the technical content E42 and 1.4, over each rewriting; runJob of the kind for each checker run
    # expect: the measure covers all four rewritings and all four runs; three are clean, three keep the technical content, two runs pass all three checkers; the rates are printed and not gated
    def test_the_rates_of_personal_data_technical_content_and_checker_passes_are_reported(self):
        for loaded in cases(RATES, DATA):
            with self.subTest(case=loaded["name"]):
                got = run(PERSONAL_WORLD, loaded["case"]["input"])
                wanted = loaded["case"]["expected"]
                self.assertEqual({key: got[key] for key in wanted}, wanted)
                print(f"\nMEASURED rewritings clean of persons: {got['clean']} of {got['measured']}; keeping the technical content: "
                      f"{got['keepsTechnical']} of {got['measured']}; passing all three checkers: {got['passedAllThree']} of {got['checkRuns']}; reported, not gated")


if __name__ == "__main__":
    unittest.main()
