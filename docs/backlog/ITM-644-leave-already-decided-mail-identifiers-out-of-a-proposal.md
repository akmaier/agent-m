---
id: ITM-644
title: Leave already decided mail identifiers out of a proposal
level: module
realises:
  - UC-038
  - A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
modules:
  - MOD-mail-records
builds_on:
  - ITM-631
tests:
  - unit
origin:
  - MOD-mail-records, Interfaces undecided
  - MOD-mail-handling, Interfaces readNewMail
  - UC-038, leaving listed and browser-marked mails out before proposals
---
# ITM-644 Leave already decided mail identifiers out of a proposal

**REGISTER**

## Outcome

Implement the accepted synchronous public `undecided(ids: string[], listed: Set<string>, marked: Set<string>) -> string[]`
of MOD-mail-records. It returns the supplied mail identifiers that neither an issue lists nor this browser marked
*not an issue*. Both reasons exclude a mail; an unlisted, unmarked mail remains available for a proposal.

This is the pure identifier-filtering prerequisite of MOD-mail-handling's `readNewMail` and UC-038's intake flow,
not that intake flow itself. ITM-631 supplies the existing MailRecords public entry and the delivered pseudonymous
identifier. `undecided` receives identifiers already named; it does not read mail, derive identifiers again, parse
issue text, fetch browser marks or copy the filtering into a caller.

Change only `src/mail-records/` and new owned unit tests naming MOD-mail-records. Expose the existing declared
interface from the public entry. Preserve `mailId`, its existing tests and every old expected result. No new public
interface, format, validation policy, SPEC, use case or architecture change is included.

The issue-list, note, label and thread functions remain separate work. MailRoutes, MailHandling, mailbox reading,
provider/Bridge adapters, issue creation, browser storage, page integration, live mail and sending are outside this
item. No complete MailRecords module or UC-038 delivery is claimed.

## Acceptance

- Unit cases call the public synchronous `undecided` with literal synthetic identifiers, arrays and Sets, with
  expected identifiers stated before execution. A mixed input containing an issue-listed identifier, a distinct
  browser-marked identifier and an unlisted/unmarked identifier returns only the unlisted/unmarked one.
- Cases exercise each exclusion separately and together, an identifier in both Sets, no exclusions, all identifiers
  excluded, and an empty input. They include a positive unlisted/unmarked identifier so that an always-empty result
  cannot satisfy the exclusion cases. Expectations are not computed from runtime documents or the implementation.
- The inputs remain unchanged. This pure primitive reads or writes no mailbox, repository, issue, file, browser
  setting or network service; fixtures contain no real mail, credentials or device access.
- Follow the existing implementation-job rules: the first commit contains only tests, with actual intended server
  red before source assignment; every new case has its actual source-fault assertion failure and exact restoration.
  An import or launcher crash is not substituted for that assertion evidence.
- Existing case bodies and expected results remain unchanged. No other module source, workflow, dependency,
  schema, model or process change is included. Only unit tests are selected; no new release-case or release-author
  job is introduced.
