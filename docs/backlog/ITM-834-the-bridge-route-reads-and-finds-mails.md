---
id: ITM-834
title: The Bridge route reads and finds mails, and lists Drafts and Sent
level: module
realises:
  - UC-038
  - READING THE MAILBOX CHANGES NOTHING IN IT
  - A MAIL IS FOUND AGAIN BY ITS IDENTIFIER
  - THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
modules:
  - MOD-mail-routes
builds_on:
  - ITM-425
  - ITM-822
tests:
  - unit
origin:
  - MOD-mail-routes, Interfaces Mailbox, operations read, find, drafts and sent on the Bridge route; ITM-425 builds only test
---
# ITM-834 The Bridge route reads and finds mails, and lists Drafts and Sent

**REGISTER**

## Outcome

MOD-mail-routes' Bridge route (`bridge-route.mjs`) offers of `Mailbox` only `test`. The Bridge now answers `read`, `find`,
`drafts` and `sent` (ITM-822). The route gains these four operations as the module file states them:
- `read(since)` gives the mails of the named folders as `Mail`, through one `mailCall(bridge, "read", connection, { since
  })`;
- `find(id)` gives the mail with this `MAIL-` identifier, or `null` when the Bridge answers that none matches — never a
  guess;
- `drafts()` gives `{ ref, inReplyTo, mail }` for each mail in Drafts, with `ref` a `DraftRef` of the route `bridge`;
- `sent(since)` gives the mails of Sent.

Each fails with the named errors the file gives the Bridge route, mapped as `test` maps them: `BridgeUnavailable`,
`NoEncryption`, `LoginRefused`, `FolderNotFound`, `Unreachable`. The connection with its password goes only into the body
of the one request `mailCall` makes.

## Acceptance

- New unit tests naming MOD-mail-routes drive the route with MOD-bridge-client's real `bridgeAt` and `mailCall` against a
  fake Bridge behind `fetch`, as `tests/mail-routes-mailbox-test.test.mjs` does. Each states its input, precondition and
  expected result before it runs, with literal expected values:
  - `read`, `drafts` and `sent` return the Bridge's answers as `Mail`s, and `drafts` gives each its `DraftRef`;
  - `find` returns the mail of a known identifier, and `null` for an identifier the Bridge does not find;
  - each operation makes exactly one request, to `/v1/mail/<operation>`, and the password appears in no other request
    and in no thrown error;
  - each of the Bridge's failures gives the error the file names.
- Where the module file leaves a value open, the pull request names it and the test asserts no invented value.
- TST-472375 to TST-472380 and TST-477011 stay green with no expected result changed.
- The first commit holds only tests, and CI is red on it; each new test's counter-proof is recorded in the pull request.
- Only `src/mail-routes/` and tests naming MOD-mail-routes change; no dependency changes.
