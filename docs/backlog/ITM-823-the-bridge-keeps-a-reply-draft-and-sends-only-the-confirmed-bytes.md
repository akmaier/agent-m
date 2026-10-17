---
id: ITM-823
title: The Bridge keeps a reply draft and sends only the bytes a person confirmed
level: module
realises:
  - UC-039
  - A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER
  - EVERY OUTGOING MAIL IS RELEASED BY A PERSON
  - THE MAIL SERVER IS REACHED ONLY OVER TLS
  - THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
modules:
  - MOD-mail-protocols
builds_on:
  - ITM-822
tests:
  - unit
origin:
  - MOD-mail-protocols, Interfaces mailHandlers, operations store-draft, update-draft, show-draft, confirm-send and send
---
# ITM-823 The Bridge keeps a reply draft and sends only the bytes a person confirmed

**REGISTER**

## Outcome

`mailHandlers` gains the remaining operations of MOD-mail-protocols' accepted file:
- `store-draft` and `update-draft`: a reply built as one message, threaded on the reporter's `Message-ID` and addressed to
  that reporter only, appended to Drafts. An update replaces the Bridge's own draft.
- `show-draft`: the draft's stored bytes, their SHA-256 and the draft as a `ShownMail`.
- `confirm-send`: a single-use confirmation for one draft and one SHA-256, kept in memory only.
- `send`: it reads the draft's bytes from Drafts again and sends them only when their SHA-256 is the confirmed one and the
  confirmation is neither spent nor expired. A copy goes to Sent and the draft leaves Drafts. A second request with the
  same confirmation sends nothing.

Errors are those of the file: `confirmation-refused`, and `upstream-failed`, after which the draft stays. The parts are
`imap.mjs`, `smtp.mjs` and `confirmations.mjs`.

## Acceptance

- New unit tests naming MOD-mail-protocols run against the local IMAP and SMTP fixture servers. Each states its input,
  precondition and expected result before it runs:
  - the stored draft has `In-Reply-To`, `References` and one recipient;
  - the bytes sent are the bytes shown;
  - a draft changed after confirmation is refused and nothing is sent;
  - a spent confirmation sends nothing;
  - an SMTP failure leaves the draft in Drafts;
  - no file is written and no output holds the marker password.
- Where the accepted file leaves a value open, the pull request names the gap and the test asserts no invented value. The
  confirmation's lifetime ("valid for minutes") is one such value.
- The tests of ITM-420 and ITM-822 stay green with no expected result changed.
- The first commit holds only tests, and CI is red on it; each new test's counter-proof is recorded in the pull request.
- Only `src/mail-protocols/` and tests naming MOD-mail-protocols change; no dependency changes.
