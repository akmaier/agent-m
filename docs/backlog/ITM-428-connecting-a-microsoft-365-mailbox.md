---
id: ITM-428
title: Connecting a Microsoft 365 mailbox
level: module
realises:
  - UC-037
  - AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN
  - THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING
  - THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
builds_on:
  - ITM-427
  - ITM-424
tests:
  - unit
origin:
  - UC-037 steps 2 and 3, 2a, 3a, 3b
---
# ITM-428 Connecting a Microsoft 365 mailbox

**REGISTER**

## Outcome

In MOD-settings-pages' route `mailbox`, the Microsoft route, as its file states it: the app registration's steps — the
button to Microsoft's page (`providerLinks`), the name, the kind *single-page application* and the return address with a
copy button —, the field of the client identifier, and, where the institution refuses the registration, what to ask its
administrators for, with the IMAP route offered meanwhile; *Sign in with Microsoft*, with the three permissions named
before Microsoft's window opens (`signIn`, ITM-424); a declined permission named with what would not work, nothing
stored; an expired sign-in asked again at the next use; *Store and test* on this route.

## Acceptance

- Unit tests that name MOD-settings-pages state, before the code exists, in the small DOM with a fake `signIn` and a
  fake mailbox: the permissions named before the window opens; the return address with its copy button; a declined
  permission named and nothing stored; a stored connection holding the client identifier and no password; the test's
  counts shown; an expired sign-in asked again.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
