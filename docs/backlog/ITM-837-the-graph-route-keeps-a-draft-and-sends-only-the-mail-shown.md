---
id: ITM-837
title: The Microsoft Graph route keeps a reply draft and sends only the mail shown
level: module
realises:
  - UC-039
  - A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER
  - EVERY OUTGOING MAIL IS RELEASED BY A PERSON
  - A REPLY GOES TO ONE REPORTER
  - A REPLY IS THREADED ON THE REPORTER'S MAIL
  - THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
modules:
  - MOD-mail-routes
builds_on:
  - ITM-836
tests:
  - unit
origin:
  - MOD-mail-routes, Interfaces Mailbox, operations storeDraft, updateDraft, showDraft and sendDraft on the Graph route
---
# ITM-837 The Microsoft Graph route keeps a reply draft and sends only the mail shown

**REGISTER**

## Outcome

The Graph route gains `storeDraft`, `updateDraft`, `showDraft` and `sendDraft` as the module file states them:
- a draft is stored in Drafts only, addressed to the one reporter, with `In-Reply-To` and `References` from the mail's
  `Message-ID`; a mail without a usable reply address fails with `NoReplyAddress`;
- `showDraft` gives the complete draft as a `ShownMail`, with the SHA-256 of its bytes as stored;
- `sendDraft` reads the draft's bytes again and has the provider send it only when their SHA-256 is the one shown;
  otherwise it fails with `DraftChanged` and sends nothing. The provider keeps the copy in Sent and removes the draft.

## Acceptance

- New unit tests naming MOD-mail-routes drive the route against a fake Microsoft Graph, as ITM-836's do. Each states its
  input, precondition and expected result before it runs:
  - the stored draft has one recipient, `In-Reply-To` and `References`;
  - a draft changed after it was shown is not sent, and `DraftChanged` is thrown;
  - the unchanged draft is sent with one send request;
  - no request carries the token to another origin or in an address.
- Where the module file leaves a value open, the pull request names it and the test asserts no invented value.
- The tests of ITM-425 and ITM-836 stay green with no expected result changed.
- The first commit holds only tests, and CI is red on it; each new test's counter-proof is recorded in the pull request.
- Only `src/mail-routes/` and tests naming MOD-mail-routes change; no dependency changes.
