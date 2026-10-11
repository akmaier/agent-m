---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - dda5cc83fa9b7fce33aeaad948e906a0de63023c
  - https://github.com/akmaier/agent-m/pull/413
date: 2026-10-11 20:26 UTC
---
# Development → Release testing: ITM-422, the mailbox connection kept in this browser

**REGISTER**

## Reason

ITM-422, pull request #413 by developer-sonnet-a into `sprint/team1/20`, head `dda5cc8`. The tests-only commits
`864847a` and `20187c5` were red on the seven new tests alone (runs 38171614281, 38171825381); CI is green on
`dda5cc8` (run 38171984290, 1805 tests, 0 failures). The code changes only `src/browser-store/`; the new test names
MOD-browser-store and its guards, and 25 faults are recorded, the four that survived on the draft killed by
`20187c5`. The Acceptance holds: an IMAP connection listed with its password a secret; a Microsoft connection's
sign-in keys listed as the mailbox's sign-in; clearing `mailbox` removing the connection and those keys and nothing of
another instance; an export and an import carrying both; no cookie, nothing in an address.

The readings weighed:
- The library's keys are taken from the vendored `msal-browser.min.js` 5.24.0 itself, since MOD-browser-store's file
  names them only as "the keys Microsoft's sign-in library writes for its token cache under its own names (ARC-053),
  found by the client identifier"; *Clear* removes those of the connection's client, as `A CLEAR IS A REAL CLEAR` asks.
- The tokens are secrets in `secretValues` and never in a list (`A STORED SECRET IS HIDDEN UNTIL SHOWN`).
- The export's `foreign` is the field MOD-browser-store's file defines for "a sign-in library's key" and its value; it
  is inside the encrypted object of a locked export. It carries the sign-in's tokens with every other setting, as
  `SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS` asks, and an import restores them. Refusing a file whose
  `foreign` holds a key that is not the exported connection's sign-in, or a value that is not text, refuses no
  setting of a valid export; it keeps an import from writing other keys into the browser. That the disclosure before
  an export names the sign-in's tokens and what they grant (`AN EXPORT STATES THAT IT CONTAINS SECRETS`) is the
  settings page's, noted for ITM-427.
