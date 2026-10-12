---
id: ITM-466
title: Microsoft's sign-in at the institution's own tenant
level: module
realises:
  - UC-037
  - AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN
modules:
  - MOD-mail-routes
builds_on:
  - ITM-424
tests:
  - unit
origin:
  - ITM-424, #410: the authority `/common`, named by no accepted text
  - akmaier's decision on the sign-in's authority; MOD-mail-routes' `signIn`, as drafted in afab8296
---
# ITM-466 Microsoft's sign-in at the institution's own tenant

**REGISTER**

## Outcome

MOD-mail-routes' `signIn(clientId, address)`, as its file states it, signs in at the institution's own tenant,
`https://login.microsoftonline.com/<domain of the mail address>`, where its administrators registered Agent M, in place
of the authority `https://login.microsoftonline.com/common` that `graph-route.mjs` uses today. The host stays Microsoft's
sign-in service, which `NO SERVER` permits and the check's form for MOD-mail-routes names, so no change between jobs is
needed. `signIn`'s signature admits `address: null`, and the drafted text does not say which tenant a sign-in without an
address uses; that is an open point of the text under review, to be settled before the item starts.

MOD-mail-routes' text states the tenant since akmaier accepted it in 50591c1e; the item waits on no text. The open
point above stays: the accepted text does not say which tenant a sign-in without an address uses, so the item takes
the reading at its start and names it.

## Acceptance

- Unit tests that name MOD-mail-routes state, before the code exists, with a stand-in for the library's client: the
  authority handed to the library is `https://login.microsoftonline.com/` followed by the domain of the address given,
  for two addresses of different domains; no authority `/common`; a sign-in without an address as the accepted text
  says.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/mail-routes/` and the tests that name MOD-mail-routes change.
