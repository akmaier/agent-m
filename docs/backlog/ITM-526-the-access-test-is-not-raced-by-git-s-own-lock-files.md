---
id: ITM-526
title: The access test is not raced by git's own lock files
level: module
realises:
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
  - UC-044
modules:
  - MOD-bridge-jobs
builds_on:
tests:
  - unit
origin:
  - the end gates of sprint team1/36 (#559), the first attempt of run 38867486999
---
# ITM-526 The access test is not raced by git's own lock files

**REGISTER**

## Outcome

TST-472076 ("testAccess — nothing is changed in any clone", `tests/bridge-jobs-access.test.mjs`) measures a clone before
and after with `stateOf`, which walks it with `readdirSync` and then calls `statSync` on each entry. Git's background
maintenance creates and removes `.git/objects/maintenance.lock` on its own. When the file vanishes between the two calls,
`statSync` throws `ENOENT` and the test fails, though testAccess changed nothing. This happened on #559's first CI
attempt.

The walk leaves out git's own transient lock files. Every other file is measured as before, so a change that testAccess
made still fails the test.

What the item leaves to be built, and the value:
- **Which files are left out.** A file below a clone's `.git/` whose name ends in `.lock` is git's own lock. It is not
  measured.
- **Any other file that vanishes between the two calls.** It still fails the test.

TST-472076's expected result does not change, release tests included. Only how it measures its fixture changes, which
`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES` allows for an existing test.

## Acceptance

- `stateOf` leaves out `.git/**/*.lock`. A planted `.git/objects/maintenance.lock` that vanishes between `readdirSync` and
  `statSync` no longer makes the walk throw.
  - Counter-proof: without the exclusion, the same plant throws `ENOENT`.
  - Second counter-proof: a file outside `.git/` that testAccess would change still fails TST-472076.
- Only `tests/bridge-jobs-access.test.mjs` changes, and MOD-bridge-jobs' code does not.
- The test's values stay in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`).
