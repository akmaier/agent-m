---
id: MOD-mail-flow
title: Turns mails into issues and closed issues into replies, keeping every state in the issue tracker
realises:
  - A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
  - MAIL STAYS IN THE MAILBOX
  - THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING
  - A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER
  - A MAIL IS FOUND AGAIN BY ITS IDENTIFIER
  - AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS
  - A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
  - THE PRODUCT ISSUE CARRIES NO PERSONAL DATA
  - A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK
  - AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE
  - A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
  - A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE
  - EVERY OUTGOING MAIL IS RELEASED BY A PERSON
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
  - NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY
  - A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
  - REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS
  - A REWRITTEN TEXT IS CHECKED BY THREE LLMS
  - PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF
  - A PARTICIPANT DECLARES WHERE IT PROCESSES DATA
  - UC-038
  - UC-039
follows:
  - ARC-003
  - ARC-006
  - ARC-008
  - ARC-014
uses:
  - MOD-mail-api.apiMailbox
  - MOD-bridge-server.bridgeClient
  - MOD-pseudonymiser.peopleOf
  - MOD-pseudonymiser.findPeople
  - MOD-pseudonymiser.writeGate
  - MOD-job-harness.runDraft
  - MOD-git-host.issues
provides:
  - mailId
  - mailbox
  - pendingMails
  - checkers
  - proposeIssues
  - issueFromDecision
  - replyOffers
  - replyDraft
  - replyNote
  - participantAllowed
---
# MOD-mail-flow Turns mails into issues and closed issues into replies, keeping every state in the issue tracker

## Responsibility

The mail logic of UC-038 and UC-039 as functions over mails, issues and the mailbox's drafts:
identifiers, thread matching, what is proposed, the neutral issue and its report data rewritten without
persons, reply offers, drafts and the notes written to issues. Nothing about a mail is stored outside the
mailbox; the browser keeps only the identifiers marked *not an issue*.

It chooses who may read a mail and who may check a text (ARC-014 decision 4) and runs the proposal,
the rewriting and the three checks as one drafting job through the correction loop
(`MOD-job-harness.runDraft`); the job's prompts and schemas are data (MOD-job-definitions), the write
decision is MOD-pseudonymiser's. It rewrites and checks nothing itself.

**Current state.** No code exists.

## Interfaces

- `mailId(mail) -> "MAIL-<16 hex>"` — the first sixteen hex digits of the SHA-256 of the `Message-ID`, or of the mail's bytes when it has none; the `Message-ID` itself is never written.
- `mailbox(connection) -> mail interface` — Microsoft Graph for Microsoft 365 (MOD-mail-api), the bridge over IMAP and SMTP for every other server, Gmail included with an app password (MOD-bridge-mail through `MOD-bridge-server.bridgeClient`); the same interface either way.
- `pendingMails(mails, issues, notAnIssue) -> { attach, propose }` — leaves out mails an issue lists or the person marked; attaches a mail whose `In-Reply-To`/`References` names a listed mail to that issue without a model; the rest are proposed.
- `checkers(connection, participants, rewriter) -> { checkers: [three] } | { missing, reasons }` — the three checking participants preselected for the panel of UC-038 step 4: participants that are not persons, can *draft text*, declare their model, and process data at a place the mailbox allows (`participantAllowed`); three different models; the rewriting participant is not one of them. Fewer than three is `missing`, with what each other participant lacks (UC-038 6c); the author may exchange any of the three in the panel for another that meets the same conditions.
- `proposeIssues({ mails, products, openIssues, reportData, rewriting, rewriter, checkers, limit }) -> [{ mail, proposal, texts, verdicts, remaining, rounds }]` — per mail, one drafting job of the kind `propose-issue-from-mail` through `MOD-job-harness.runDraft` with `rewriter` as driver: the proposal of UC-038 step 5 (product, kind, neutral title and text, possible duplicates) and, with `rewriting` *on*, the report data the author ticked rewritten without persons. Each round, the search for this mail's people (`findPeople` over `peopleOf(mail)`) runs as a check, and the three `checkers` each receive only the neutral text and the rewritten report data, through the job kind `check-for-persons`; any finding goes back to the rewriter as a compiler-like finding, within `limit` (`A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT`). With `rewriting` *off*, report data is not sent to the rewriter and stays unchanged; the neutral text is checked as before. What is still found after the last round is returned in `remaining`, for the review panel to mark (UC-038 step 6, 6a).
- `issueFromDecision({ mail, texts, people, verdicts, connection, rewriting, product, kind, click }) -> issue | { refused: { hits, findings, missing } }` — a neutral issue labelled `defect` or `change` listing the `MAIL-` identifier, only on the person's click and only when `MOD-pseudonymiser.writeGate` allows every text: no person of this mail found, and, for each text a participant drafted or rewrote, three verdicts naming that exact text. A text the author edited in the review panel is checked again — the search and the three checkers on the edited text — before the click can create the issue; an issue the author wrote by hand (UC-038 4b, 6c) is gated by the search alone and carries no report data.
- `replyOffers(issues, drafts, sent) -> { toAnswer, answerReceived, open, notesToWrite }` — derived from the issues and the mailbox's *Drafts* and *Sent* alone.
- `replyDraft({ mail, text, from }) -> mail` — one reporter as recipient, `Re:` subject, `In-Reply-To` and `References` set to the reporter's `Message-ID`, the original quoted.
- `replyNote(mailId, date, kind) -> comment` — *Reply sent to MAIL-… on …*, *Question sent to MAIL-… on …* or *No reply to MAIL-…, decided on …*: identifier and date only.
- `participantAllowed(connection, participant) -> { ok } | { refused, nonEu }` — only participants whose processing place the mailbox allows; a place outside the EU is flagged.

Uses, as declared above: `MOD-mail-api.apiMailbox`, `MOD-bridge-server.bridgeClient`, `MOD-pseudonymiser.peopleOf`, `MOD-pseudonymiser.findPeople`, `MOD-pseudonymiser.writeGate`, `MOD-job-harness.runDraft`, `MOD-git-host.issues`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 8b299337b2e61b80cb4a4415ff4e7c865d7a2dfe — SPEC queue 2026-09-30k as accepted: report data rewritten without persons and checked by three LLMs, surrogates withdrawn; open until accepted.*
