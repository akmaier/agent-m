---
id: ITM-1234
title: The mail page's endpoint may do what every page's may
level: module
realises:
  - UC-049
modules:
  - MOD-maintenance-pages
builds_on: []
tests:
  - unit
origin:
  - the check of the documents akmaier accepted since 2026-10-25 against the code: UC-049 says what the endpoint may do does not depend on the page; the mail page still refuses proposals and hand-overs
---
# ITM-1234 The mail page's endpoint may do what every page's may

**REGISTER**

## Outcome

UC-049 (:84-86) states that what the endpoint may do does not depend on the page, and that a change may be handed over
everywhere (:102). `src/maintenance-pages/mail.mjs:428` still sets `refuses: ["propose-edit", "hand-over"]` on the
mail page, and two tests keep that old behaviour: `tests/system-uc-049-pages-of-mail-and-settings.test.mjs:84` and
TST-1360004. The mail page's subject refuses nothing the others allow.

## Acceptance

- The stale tests are rewritten to the accepted use case by a participant who does not write the code; a test naming
  MOD-maintenance-pages: the mail page's subject refuses neither `propose-edit` nor `hand-over`. Counter-proof: before
  the change it refuses both.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/maintenance-pages/` and the tests that name it or UC-049 change.
