---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2bda71a536bd006bf8e2c9404441e5be505c15cc
  - https://github.com/akmaier/agent-m/pull/415
date: 2026-10-11 20:23 UTC
---
# Development → Release testing: ITM-455, a file only hashed is read as not stored

**REGISTER**

## Reason

ITM-455, pull request #415 by developer-sonnet-c into `sprint/team1/20`, head `2bda71a`. The first commit `85ba636`
holds only `tests/source-register-hashed-only.test.mjs`, and CI was red on it (run 38171671737): three of its four
tests fail, the fourth — a version with no note read with every file stored — states what holds already, and no other
test fails. CI is green on `2bda71a` (run 38171824498, node 1802 tests, 0 failures; python OK). The code changes only
`src/source-register/content.mjs`; the new test names MOD-source-register and its guards, and 11 faults are recorded,
none surviving; two that survived on the draft were answered by removing the code they changed. The Acceptance holds:
a registration's file only hashed read back with `stored: false` and the version's hash over all three files;
`readContent` reading the two stored files only; a version with no note read with every file stored.

The readings weighed: the note's names are read as `registrationCommits` writes them, after `not stored:` and separated
by a comma and a space, so a file name holding ", " would read as two — a name of that form is noted for the review;
the test reads the version through `linkedVersion`, as a job does. Over this repository, `SRC-vibe-coding` reads all
its files stored, as before.
