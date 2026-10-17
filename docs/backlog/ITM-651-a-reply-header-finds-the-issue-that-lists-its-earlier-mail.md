---
id: ITM-651
title: A reply header finds the issue that lists its earlier mail
level: module
realises:
  - UC-038
  - A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
modules:
  - MOD-mail-records
builds_on:
  - ITM-631
  - ITM-647
tests:
  - unit
origin:
  - MOD-mail-records, Parts threads.mjs and Interfaces threadMatch
  - MOD-mail-handling, Interfaces readNewMail
  - UC-038, Main flow 3 and Alternative flow 3a
---
# ITM-651 A reply header finds the issue that lists its earlier mail

**REGISTER**

## Outcome

Implement the accepted public asynchronous `threadMatch(mail: { inReplyTo: string | null, references: string[] },
listed: Map<string, number>) -> Promise<number | null>` of MOD-mail-records. Derive the identifiers of the header
Message-ID values as the delivered mailId derives them, and look them up in the caller's identifier-to-issue map.
Return the issue number of a listed mail this mail answers, or null when none matches, without a model.

This is the pure known-thread prerequisite of MOD-mail-handling.readNewMail, not that consumer's implementation.
ITM-631 supplies mailId; ITM-647 supplies the issue-list reader from which an intake caller can build its map. Reuse
the identifier derivation, not a second hash or identifier rule. Keep the responsibility in the accepted threads.mjs
part and expose threadMatch through the public module entry.

Change only src/mail-records/ and new owned unit tests naming MOD-mail-records. All existing source behaviour, test
bodies, headers and expected results remain unchanged, including mailId, undecided, withMailIds, listedMailIds,
planGrid, modelDiagram and dispatch privacy. No new public interface, format, validation policy, SPEC, use case,
architecture, process or dependency is included.

The contract states no precedence between distinct issues matched by different headers. This item adds no such
policy: its cases use no match or an unambiguous matching issue, including several matching identifiers naming the
same issue. Mailbox reading, MIME/header parsing, issue mutation, reopening, mail notes, labels, MailHandling,
participant proposals, pages, storage and sending remain separate work. No complete intake, module or UC-038
delivery is claimed.

## Acceptance

- Unit cases call threadMatch through the public module entry with synthetic literal header values and maps, with
  their input, precondition and expected issue number or null stated before execution. A known-positive public
  hash/mailId and the delivered issue-list reader establish the loaded module and the identifier-to-issue map;
  separately stated literal identifiers and issue numbers prevent the function under test from providing its oracle.
- A listed In-Reply-To value yields the expected issue number; a References-only value does so too. A matching
  reference after an unlisted reference is found. Cover several matching identifiers pointing to the same issue,
  without asserting a precedence between different issues.
- Empty headers, an empty map and nonmatching header values yield null. Consecutive calls with different maps or
  header values use their current inputs rather than a previous match. Identifier derivation uses the accepted
  Message-ID form and the delivered mailId behaviour; it introduces no new header-validation rule.
- Input objects, the reference array and the listed map remain unchanged. This pure function uses no model, mailbox,
  network, repository, issue, file, browser setting or persistent state. Fixtures contain no real mail or credentials.
- Follow the existing implementation-job rules: the first commit contains only tests, actual intended server red
  precedes source assignment, and each new case has an actual source-fault assertion failure and exact restoration.
  Import or launcher failure is not substituted for that evidence.
- No old test body, header or expected result changes. No other module source, workflow, schema, model or formal
  artifact changes. Only unit tests are selected; no new release-case or release-author job is introduced.
