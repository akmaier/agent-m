---
id: ITM-423
title: A mailbox's route and its connection
level: module
realises:
  - UC-037
  - A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
modules:
  - MOD-mail-routes
builds_on:
tests:
  - unit
origin:
  - UC-037 steps 1, 2 and 4.1, 8a
---
# ITM-423 A mailbox's route and its connection

**REGISTER**

## Outcome

MOD-mail-routes, as its file states it, begun in `src/mail-routes/`: the format `MailConnection`; `routeFor(address)` —
Microsoft's sign-in service, the provider's one origin the page names, asked whether the address's domain belongs to a
Microsoft 365 organisation, and the Microsoft route preselected when it does; for a domain of a known provider the IMAP
route with its servers from `providers.json`, Gmail's among them; the IMAP route with the reason when Microsoft's
service cannot be reached —; and `providerLinks()`, the addresses of Microsoft's pages for registering the app and for
withdrawing its access. `signIn` (ITM-424), `mailbox` (ITM-425), the mail parser and the operations of UC-038 and UC-039
are not part of this item.

## Acceptance

- Unit tests that name MOD-mail-routes state, before the code exists, with a fake of Microsoft's service: a Microsoft
  365 address answered with the Microsoft route; a Gmail address with the IMAP route and Gmail's servers; another domain
  with the IMAP route and no servers; an unreachable service with the IMAP route and its reason; the two pages'
  addresses; no request but the one to Microsoft's service.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/mail-routes/` and the tests that name MOD-mail-routes change.
