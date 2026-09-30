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
  - UC-038
  - UC-039
follows:
  - ARC-003
  - ARC-006
  - ARC-014
uses:
  - MOD-mail-api.apiMailbox
  - MOD-bridge-server.bridgeClient
  - MOD-pseudonymiser.findPeople
  - MOD-pseudonymiser.pseudonymise
  - MOD-git-host.issues
provides:
  - mailId
  - mailbox
  - pendingMails
  - issueFromDecision
  - replyOffers
  - replyDraft
  - replyNote
  - participantAllowed
---
# MOD-mail-flow Turns mails into issues and closed issues into replies, keeping every state in the issue tracker

## Responsibility

The mail logic of UC-038 and UC-039 as pure functions over mails, issues and the mailbox's drafts:
identifiers, thread matching, what is proposed, the neutral issue, reply offers, drafts and the notes
written to issues. Nothing about a mail is stored outside the mailbox; the browser keeps only the
identifiers marked *not an issue*.

**Current state.** No code exists.

## Interfaces

- `mailId(mail) -> "MAIL-<16 hex>"` — the first sixteen hex digits of the SHA-256 of the `Message-ID`, or of the mail's bytes when it has none; the `Message-ID` itself is never written.
- `mailbox(connection) -> mail interface` — the provider API for Microsoft 365 and Gmail, the bridge for every other server; the same interface either way.
- `pendingMails(mails, issues, notAnIssue) -> { attach, propose }` — leaves out mails an issue lists or the person marked; attaches a mail whose `In-Reply-To`/`References` names a listed mail to that issue without a model; the rest are proposed.
- `issueFromDecision({ mail, proposal, people, pseudonymisation, click }) -> issue | { refused: hits }` — a neutral issue labelled `defect` or `change` listing the `MAIL-` identifier, only on the person's click and only when no person of this mail is found in the text; report data pseudonymised unless the product switched it off.
- `replyOffers(issues, drafts, sent) -> { toAnswer, answerReceived, open, notesToWrite }` — derived from the issues and the mailbox's *Drafts* and *Sent* alone.
- `replyDraft({ mail, text, from }) -> mail` — one reporter as recipient, `Re:` subject, `In-Reply-To` and `References` set to the reporter's `Message-ID`, the original quoted.
- `replyNote(mailId, date, kind) -> comment` — *Reply sent to MAIL-… on …*, *Question sent to MAIL-… on …* or *No reply to MAIL-…, decided on …*: identifier and date only.
- `participantAllowed(connection, participant) -> { ok } | { refused, nonEu }` — only participants whose processing place the mailbox allows; a place outside the EU is flagged.

Uses, as declared above: `MOD-mail-api.apiMailbox`, `MOD-bridge-server.bridgeClient`, `MOD-pseudonymiser.findPeople`, `MOD-pseudonymiser.pseudonymise`, `MOD-git-host.issues`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
