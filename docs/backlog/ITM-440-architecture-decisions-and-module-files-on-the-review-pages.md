---
id: ITM-440
title: Architecture decisions and module files on the review pages
level: module
realises:
  - UC-022
  - A MODULE FILE IS REVIEWED AS AN ARCHITECTURE DECISION IS
  - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS
  - STATUS IS DERIVED FROM THE RECORDS
  - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
  - ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON
  - DIAGRAMS ARE MERMAID IN MARKDOWN
modules:
  - MOD-review-pages
builds_on:
  - ITM-355
tests:
  - unit
origin:
  - UC-022 step 10, 10a
---
# ITM-440 Architecture decisions and module files on the review pages

**REGISTER**

## Outcome

MOD-review-pages' descriptors `decision` and `module` in `kinds.mjs`, as its file states them, and their routes
`decision`, `module`, `decision/<id>` and `module/<id>`: the files with their status; one file rendered with its
diagrams, changed since acceptance as its difference to its last accepted text, with its section of what it rests on
that is not accepted; *Accept*, naming the blob shown, refused for a file that names a requirement or use case not
accepted, which is named. *Review all* and the sections of rounds and due diligence are ITM-441's, drafting is ITM-442's
and ITM-443's, and the impact list of a change is UC-023's.

## Acceptance

- Unit tests that name MOD-review-pages state, before the code exists, in the small DOM of `tests/site-frame.test.mjs`,
  on a fixture repository behind a Host of the tests' own: decisions and modules listed with an open, an accepted and a
  changed one; a module file rendered with its diagram; a changed decision shown with its difference; *Accept* writing
  one record naming the blob shown; a decision that names an open use case refused, and the use case named.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
