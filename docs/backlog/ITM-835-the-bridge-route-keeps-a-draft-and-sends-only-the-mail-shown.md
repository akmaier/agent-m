---
id: ITM-835
title: The Bridge route keeps a reply draft and sends only the mail shown
level: module
realises:
  - UC-039
  - A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER
  - EVERY OUTGOING MAIL IS RELEASED BY A PERSON
  - THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN
  - A REPLY GOES TO ONE REPORTER
  - THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
modules:
  - MOD-mail-routes
builds_on:
  - ITM-834
  - ITM-823
tests:
  - unit
origin:
  - MOD-mail-routes, Interfaces Mailbox, operations storeDraft, updateDraft, showDraft and sendDraft on the Bridge route
---
# ITM-835 The Bridge route keeps a reply draft and sends only the mail shown

**REGISTER**

## Outcome

The Bridge route gains the remaining operations of `Mailbox`, over the Bridge's operations of ITM-823:
- `storeDraft(draft)` and `updateDraft(ref, draft)` store the reply in Drafts and give its `DraftRef`; a mail without a
  usable reply address fails with `NoReplyAddress`, and nothing is sent to the Bridge;
- `showDraft(ref)` gives the draft as a `ShownMail`, with the SHA-256 of its stored bytes;
- `sendDraft(shown)` first obtains the Bridge's single-use confirmation for `shown.sha256` (`confirm-send`) and then
  sends with it (`send`); it fails with `DraftChanged`, `ConfirmationRefused` with the reason, or `SendRefused` with the
  server's answer.

## Acceptance

- New unit tests naming MOD-mail-routes drive the route against a fake Bridge behind `fetch`, as ITM-834's do. Each
  states its input, precondition and expected result before it runs:
  - `storeDraft` sends one draft addressed to the one reporter and returns the Bridge's `DraftRef`;
  - a draft without a usable reply address fails with `NoReplyAddress` and makes no request;
  - `sendDraft` makes `confirm-send` then `send`, with the SHA-256 of the mail shown, and sends nothing when the
    confirmation is refused;
  - the Bridge's refusals map to `DraftChanged`, `ConfirmationRefused` and `SendRefused`;
  - the password appears in no other request and in no thrown error.
- Where the module file leaves a value open, the pull request names it and the test asserts no invented value.
- The tests of ITM-425 and ITM-834 stay green with no expected result changed.
- The first commit holds only tests, and CI is red on it; each new test's counter-proof is recorded in the pull request.
- Only `src/mail-routes/` and tests naming MOD-mail-routes change; no dependency changes.
