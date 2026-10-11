---
id: ITM-424
title: Microsoft's sign-in for a mailbox
level: module
realises:
  - UC-037
  - AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN
  - THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING
  - THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
  - A CREDENTIAL IS NEVER PLACED IN A URL
modules:
  - MOD-mail-routes
builds_on:
  - ITM-423
tests:
  - unit
origin:
  - UC-037 step 3, 3a, 3b
---
# ITM-424 Microsoft's sign-in for a mailbox

**REGISTER**

## Outcome

MOD-mail-routes' `signIn(clientId, address)`, as its file states it, with Microsoft's library @azure/msal-browser
vendored as ARC-053 decides — its single minified file and its licence in `src/mail-routes/vendor/`, at the version
ARC-053's due diligence names —: Microsoft's own window, the authorisation-code flow with PKCE, exactly
`Mail.ReadWrite`, `Mail.Send` and `offline_access`, the library's token cache in `localStorage`, no token in an address
or a link. Errors: `PopupBlocked`, `SignInCancelled`, `PermissionDeclined` naming the permission, `RegistrationRefused`
with Microsoft's message, `Unreachable`.

## Acceptance

- Unit tests that name MOD-mail-routes state, before the code exists, with a stand-in for the library's client: the
  three scopes asked and nothing else; the window and the `localStorage` cache configured; each error from the
  stand-in's answer; the account returned; no token in any address the page opens.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/mail-routes/` and the tests that name MOD-mail-routes change.
