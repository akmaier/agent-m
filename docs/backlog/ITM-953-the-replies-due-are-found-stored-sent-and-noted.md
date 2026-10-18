---
id: ITM-953
title: The replies due are found, stored as drafts, sent as shown and noted in the issue
level: module
realises:
  - UC-039
  - CLOSING AN ISSUE PREPARES ITS REPLIES
  - A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE
  - THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS
  - A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO
  - EVERY OUTGOING MAIL IS RELEASED BY A PERSON
  - A SENT REPLY IS NOTED IN THE ISSUE
  - AN ISSUE WAITING FOR A REPORTER IS LABELLED
modules:
  - MOD-mail-handling
builds_on:
  - ITM-952
tests:
  - unit
origin:
  - akmaier's question of 2026-10-18 whether team 2 can work on topics independent of team 1
---
# ITM-953 The replies due are found, stored as drafts, sent as shown and noted in the issue

**REGISTER**

## Outcome

MOD-mail-handling's part `replies.mjs`, as MOD-mail-handling.md:95-117 states it (blob `be10efd1`). `RepliesDue` and
`repliesDue` group "every issue that lists mails": "closed with a listed mail that has no note — whoever closed it";
"labelled `waiting-for-reporter` with a newer mail in the thread"; and open. Each listed mail is found with its draft, and
"a reply found in Sent that no issue notes yet is noted in its issue now". `storeReplies`, `sendReply`, `askReporter` and
`noReply` work as stated there. In particular, `sendReply` "sends the draft only as `shown` ... and then notes
`reply-sent` in the issue; when sending fails, nothing is noted and the draft stays".

## Acceptance

- Unit tests that name MOD-mail-handling, over a fake mailbox and fake hosts, one for each grouping and each operation
  above:
  - a closed issue with an unnoted mail is in `toAnswer`, and a reply in Sent gets its note;
  - `storeReplies` gives *not sendable* for a mail without a reply address;
  - `sendReply` notes `reply-sent` only after a successful send, and nothing on `SendRefused`;
  - `askReporter` labels the issue `waiting-for-reporter` and leaves it open.
- Counter-proof: a `sendReply` that notes before sending fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/mail-handling/` and the tests that name MOD-mail-handling change.
