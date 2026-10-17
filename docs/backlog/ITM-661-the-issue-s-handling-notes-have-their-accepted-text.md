---
id: ITM-661
title: The issue's handling notes have their accepted text
level: module
realises:
  - UC-033
  - UC-038
  - UC-039
  - THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING
  - AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS
  - A SENT REPLY IS NOTED IN THE ISSUE
modules:
  - MOD-mail-records
builds_on:
  - ITM-631
  - ITM-647
tests:
  - unit
origin:
  - MOD-mail-records, Data the notes and Interfaces noteText
  - MOD-mail-handling readNewMail, decideMail, sendReply, askReporter and noReply
  - MOD-issue-handling moveToBacklog and closeWithLinks
  - ARC-044
  - UC-033
  - UC-038
  - UC-039
---
# ITM-661 The issue's handling notes have their accepted text

**REGISTER**

## Outcome

Implement the accepted pure synchronous public `noteText(kind, subject, date, link?) -> string` of MOD-mail-records.
For valid supplied mail or item identifiers it gives the existing Data table's comment for `mail-added`, `reply-sent`,
`question-sent`, `no-reply`, `item-added` and `closed-with`. Mail notes contain the identifier and supplied calendar
date, not the mail's text or people; item notes use the supplied dashboard or closing address where the table names it.
The public writer supplies the comment text only. Its consumers remain responsible for any issue write or mail action.

Only `src/mail-records/` and new unit cases naming MOD-mail-records are in scope. Reuse the module's existing
identifier form where applicable; add no independent hashing, header parser, network or browser-setting path. Existing
source behaviours and all existing test bodies, headers and expected results remain unchanged, including mailId,
undecided, withMailIds, listedMailIds and threadMatch. This item does not implement notesOf, labels, issue mutation,
mail intake/sending, consumers or a complete use case/module. It adds no identifier, comment format, date-validation,
address-validation or unknown-kind policy to the accepted interface.

## Acceptance

- New independent literal unit fixtures prove the six accepted note texts for valid subjects and supplied dates/links,
  including their punctuation and identifier quoting. Expected text is not read from runtime documents or produced by
  another implementation of the writer.
- Out-of-form supplied subjects produce the declared `NotAnIdentifier`, after a valid writer control; no new error
  kind or unaccepted interpretation of absent subjects is introduced.
- The `mail-added` output is readable by the delivered public listedMailIds through an issue comment. This interoperability
  check is separate from the literal writer assertions and does not replace their oracle.
- Calls are synchronous and pure, leave inputs and existing behaviour unchanged, and perform no model, network or
  persistent-state operation. Each new case has its actual source-fault assertion failure and exact restoration under
  the existing job rules. Only unit tests are selected; no new release case or author job is selected.
