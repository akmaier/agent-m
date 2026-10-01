---
id: MOD-mail-flow
title: Turns mails into issues and closed issues into replies, keeping every state in the issue tracker and nothing of a mail outside the mailbox
realises:
  - MAIL STAYS IN THE MAILBOX
  - THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING
  - A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER
  - AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS
  - A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
  - A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK
  - AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE
  - A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
  - A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE
  - A REPLY IS THREADED ON THE REPORTER'S MAIL
  - A REPLY GOES TO ONE REPORTER
  - CLOSING AN ISSUE PREPARES ITS REPLIES
  - THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS
  - A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO
  - A SENT REPLY IS NOTED IN THE ISSUE
  - AN ISSUE WAITING FOR A REPORTER IS LABELLED
  - A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE
  - A CLOSED ISSUE IS REOPENED ONLY BY A PERSON
  - THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
  - UC-038
  - UC-039
follows:
  - ARC-003
  - ARC-007
  - ARC-014
uses:
  - MOD-job-harness.loadDefinition
  - MOD-job-harness.mayReceive
  - MOD-job-harness.runDraft
  - MOD-pseudonymiser.peopleOf
  - MOD-pseudonymiser.personChecks
  - MOD-pseudonymiser.checkers
  - MOD-pseudonymiser.writeGate
provides:
  - mailId
  - pendingMails
  - proposeIssues
  - issueFromDecision
  - replyOffers
  - replyDraft
  - replyNote
---
# MOD-mail-flow Mails into issues, closed issues into replies

## Responsibility

Feature. The mail logic of UC-038 and UC-039 as functions over mails, issues and the mailbox's drafts:
identifiers, thread matching, what is proposed, the proposal and the rewriting run as one drafting job,
the neutral issue, reply offers, drafts and the notes written to issues. Nothing about a mail is stored
outside the mailbox; the issue tracker holds every state; the browser keeps only the identifiers marked
*not an issue*. Its two job kinds, `propose-issue-from-mail` and `check-for-persons`, are job definitions
in the common format (ARC-007). It labels a mailbox's mail with the places the connection allows and with
"no job that writes to a repository", and lets the one rule of ARC-007 decide who may receive it. Whether
a text from a mail may be written is the personal-data module's decision. The mailbox and the issue
tracker are ports the shell passes in.

## Interfaces

- `mailId(mail) -> "MAIL-<16 hex>"` — the first sixteen hex digits of the SHA-256 of the `Message-ID`, or of the mail's bytes when it has none; the `Message-ID` itself is never written.
- `pendingMails(mails, issues, notAnIssue, connection) -> { attach, propose, label }` — leaves out mails an issue lists or the person marked; attaches a mail whose `In-Reply-To`/`References` names a listed mail to that issue without a model; the rest are proposed; `label` is the content label of this mailbox's mail.
- `proposeIssues({ mails, products, openIssues, reportData, rewriting, rewriter, checkers, limit }) -> [{ mail, proposal, texts, verdicts, remaining, rounds }]` — per mail one drafting job `propose-issue-from-mail` through `runDraft` with the rewriter's driver, refused for a rewriter or checker whose place the mailbox does not allow: product, kind (*defect*, *change* or *no issue*), a neutral title and text, possible duplicates, and — with `rewriting` on — the ticked report data rewritten without persons; the checks of each round are those of `personChecks`; what is still found after the last round is returned in `remaining`.
- `issueFromDecision({ mail, texts, verdicts, connection, rewriting, product, kind, issues, click }) -> issue | { refused }` — a neutral issue labelled `defect` or `change` listing the `MAIL-` identifier, created through the issue tracker port only on the person's click and only when `writeGate` allows every text; an issue written by hand is gated by the search alone and carries no report data.
- `replyOffers(issues, drafts, sent) -> { toAnswer, answerReceived, open, notesToWrite }` — derived from the issues and the mailbox's *Drafts* and *Sent* alone, a reply sent from a mail program included.
- `replyDraft({ mail, text, from }) -> mail` — one reporter as recipient, `Re:` subject, `In-Reply-To` and `References` set to the reporter's `Message-ID`, the original quoted.
- `replyNote(mailId, date, kind) -> comment` — *Reply sent to MAIL-… on …*, *Question sent to MAIL-… on …* or *No reply to MAIL-…, decided on …*: identifier and date only; a question also sets the label `waiting-for-reporter`, which only a person removes, and no mail reopens a closed issue.

## Testing

Unit and component tests over fixture mails, a fake mailbox and a fake issue tracker
(`tests/test_mail_import.py`, `tests/test_mail_replies.py`, `tests/test_mail_privacy.py`): an identifier is
stable across two readings and differs for two `Message-ID`s; a second reading proposes no listed and no
marked mail; a mail in a known thread is attached without any participant call; an issue with three
reports yields three mails, each to one reporter; a run without the click creates no issue; after a full
run no write contains a sender, a body or an attachment, with a planted body as counter-proof; a mail is
not sent to a participant whose place the mailbox does not allow. Scripted drivers stand in for the
rewriter and the checkers. How often a participant's neutral text still contains personal data, and how
often the rewriting keeps the error message, the stack trace and the version, depend on models and are
measured as rates on a fixed set of mails and reports (ARC-016 kind 4), reported, not gated.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 8b299337b2e61b80cb4a4415ff4e7c865d7a2dfe — SPEC queue 2026-09-30k as accepted: report data rewritten without persons and checked by three LLMs, surrogates withdrawn; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 2e6d8e4752b55b0707ec5e69c229914cb5d15fe8 — the mail's rewriting and checking kept inside the mail modules, at the PO's request; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): the mailbox and the issue tracker are ports, the checkers' choice moved to MOD-pseudonymiser, the routes' reasons stay in ARC-014; open until accepted.*
