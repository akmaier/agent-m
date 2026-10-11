---
id: ITM-425
title: A mailbox tested on both routes
level: module
realises:
  - UC-037
  - A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
  - READING THE MAILBOX CHANGES NOTHING IN IT
  - THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
  - THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
modules:
  - MOD-mail-routes
builds_on:
  - ITM-423
  - ITM-424
  - ITM-421
tests:
  - unit
origin:
  - UC-037 step 7, 7a to 7d, 3b
---
# ITM-425 A mailbox tested on both routes

**REGISTER**

## Outcome

MOD-mail-routes' `mailbox(connection, bridge)` and, of `Mailbox`, its `test()`, as its file states them: the number of
mails in each named folder, whether Drafts and Sent were found and whether sending works, changing nothing — on the
Microsoft route through Microsoft Graph, the token from the library's cache only in the authorisation header of those
requests; on the Bridge route by one `mailCall` of `test` on the Bridge the connection names (ITM-421), with the
connection and its password. Errors: `BridgeNeeded`, `SignInExpired`, `PermissionDeclined`, `Throttled`, `Unreachable`,
`BridgeUnavailable` with Access's reason, `NoEncryption`, `LoginRefused`, `FolderNotFound`. Reading, finding, drafts and
sending are UC-038's and UC-039's.

## Acceptance

- Unit tests that name MOD-mail-routes state, before the code exists: with a fake Microsoft Graph, the counts of two
  named folders and Drafts and Sent found, the token only in requests to Microsoft Graph, no request that changes a
  message; with a fake Bridge client, one `test` call with the connection and its answer returned, each error of the
  Bridge mapped to the file's error; `BridgeNeeded` on the Bridge route without a Bridge.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/mail-routes/` and the tests that name MOD-mail-routes change.
