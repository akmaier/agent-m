---
id: ITM-647
title: An issue records its mail identifiers and gives back the ones it lists
level: module
realises:
  - UC-038
  - AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS
  - THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING
modules:
  - MOD-mail-records
builds_on:
  - ITM-631
tests:
  - unit
origin:
  - MOD-mail-records, Data the list of an issue's mails and Interfaces listedMailIds and withMailIds
  - MOD-mail-handling, Interfaces readNewMail and decideMail
  - UC-038, reading the identifiers issues list and creating an issue that lists its mail
---
# ITM-647 An issue records its mail identifiers and gives back the ones it lists

**REGISTER**

## Outcome

Implement the accepted synchronous public `withMailIds(text: string, ids: string[]) -> string` and
`listedMailIds(issue: IssueText) -> string[]` of MOD-mail-records. The first gives the text of a new issue ending with
the accepted `Mails:` line; an identifier outside the accepted `MAIL-` plus sixteen hexadecimal digits form gives
`NotAnIdentifier`. The second gives the identifiers in an issue's `Mails:` line and `mail-added` comments, each once
and in the order they were listed. Use the existing accepted formats, not a new marker or record.

This is the pure issue-list prerequisite of MOD-mail-handling's intake and create decision, not their implementation.
ITM-631 supplies the delivered identifier and public module foundation. ITM-644's delivered identifier filter stays
unchanged. The writer constructs new issue text; it does not rewrite an existing issue to add a mail. The reader
receives the accepted IssueText value, including comments already supplied by its caller; it fetches nothing.

Change only `src/mail-records/` and new owned unit tests naming MOD-mail-records. Keep this responsibility in the
accepted `issue-marks.mjs` part and expose the declared functions from the public entry. Preserve all existing source
behaviour, test cases and expected results, including mailId, undecided, planGrid, modelDiagram and dispatch privacy.
No new public interface, format, validation policy, SPEC, use case, architecture or process change is included.

Note generation, other note reading, labels, thread matching, MailHandling, mailbox/provider/Bridge adapters, issue
creation or mutation, browser storage, page integration and sending remain separate work. No complete MailRecords
module, intake flow or UC-038 delivery is claimed.

## Acceptance

- Unit cases call both functions through the public entry with synthetic literal text and identifiers, with expected
  values stated before execution, not derived from runtime documents or the implementation. A known-positive public
  hash/mailId and the delivered undecided filter establish the actual loaded module before the new outcome.
- The writer preserves a neutral technical text and ends it with the accepted Mails line naming the supplied valid
  identifiers in their supplied order. Cover one and several identifiers. A positive valid identifier precedes a
  refusal for an identifier outside the declared form; the refusal is NotAnIdentifier.
- The reader covers the Mails line, added-mail comments, their combined result and repeated identifiers across those
  sources: each identifier occurs once in listing order. An issue listing no mail gives none. Unrelated comment text
  and other note forms do not become added mails. A text produced by the writer is readable through the public
  reader; a separately stated literal IssueText fixture prevents a shared writer/reader mistake from being its oracle.
- Inputs remain unchanged. These pure text functions read or write no mailbox, repository, issue, file, browser
  setting or network service. Fixtures contain no real mail, credentials or device access.
- Follow the existing implementation-job rules: first commit only tests, actual intended server red before source
  assignment, and an actual source-fault assertion failure and exact restoration for each new case. An import or
  launcher crash is not substituted for assertion evidence.
- No old test body, header or expected result changes. No other module source, workflow, dependency, schema, model or
  formal artifact changes. Only unit tests are selected; no new release-case or release-author job is introduced.
