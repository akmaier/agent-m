---
id: ITM-836
title: The Microsoft Graph route reads and finds mails, and lists Drafts and Sent
level: module
realises:
  - UC-038
  - READING THE MAILBOX CHANGES NOTHING IN IT
  - A MAIL IS FOUND AGAIN BY ITS IDENTIFIER
  - THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
modules:
  - MOD-mail-routes
builds_on:
  - ITM-425
tests:
  - unit
origin:
  - MOD-mail-routes, Interfaces Mailbox, operations read, find, drafts and sent on the Graph route; ITM-425 builds only test
---
# ITM-836 The Microsoft Graph route reads and finds mails, and lists Drafts and Sent

**REGISTER**

## Outcome

MOD-mail-routes' Graph route (`graph-route.mjs`) offers of `Mailbox` only `test`. It gains `read`, `find`, `drafts` and
`sent` as the module file states them. Mails are parsed from their raw form with the vendored postal-mime, and each gets
its `MAIL-` identifier from MOD-mail-records' `mailId`. `find` hashes the `Message-ID`s of the named folders and gives
`null` when none matches. Every request is a read; none modifies a message. The token goes only into the authorisation
header of requests to Microsoft Graph.

## Acceptance

- New unit tests naming MOD-mail-routes drive the route against a fake Microsoft Graph behind `fetch` and the sign-in
  library's stand-in, as `tests/mail-routes-mailbox-test.test.mjs` does. Each states its input, precondition and expected
  result before it runs:
  - `read`, `drafts` and `sent` return the fixture mails as `Mail`s with their identifiers, and `drafts` gives each its
    `DraftRef` of the route `graph`;
  - `find` finds a mail in a second named folder, and gives `null` for an identifier with no matching mail;
  - every request recorded is a `GET` to Microsoft Graph, and the token appears in no address and in no request to
    another origin;
  - Graph's failures give `SignInExpired`, `PermissionDeclined`, `Throttled` and `Unreachable`.
- Where the module file leaves a value open — which Graph resources are read — the pull request names it and the test
  asserts no invented value.
- The tests of ITM-425 stay green with no expected result changed.
- The first commit holds only tests, and CI is red on it; each new test's counter-proof is recorded in the pull request.
- Only `src/mail-routes/` and tests naming MOD-mail-routes change; no dependency changes.
