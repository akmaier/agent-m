---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8495a15d5e00e8dbcc3dc6b769fcdddf772e16c9
  - https://github.com/akmaier/agent-m/pull/411
date: 2026-10-11 19:55 UTC
---
# Development → Release testing: ITM-314, the commit plan of a registration

**REGISTER**

## Reason

ITM-314, pull request #411 by developer-sonnet-c into `sprint/team1/19`, head `8495a15`. The first commit `9b550e4`
holds only `tests/source-register-registration.test.mjs`, and CI was red on it (run 38169584956): its eight tests fail,
and no other test does. CI is green on `8495a15` (run 38169855162, node 1798 tests, 0 failures; python OK). The code
changes only `src/source-register/`; the new test names MOD-source-register and its guards, and 49 faults planted on
the draft are recorded, one dropped as equivalent. The Acceptance holds: republishable files planned into the
instance; restricted ones into the named repository and none into the instance; a file only hashed planned nowhere, its
hash in the entry; restricted files without a repository refused.

The point weighed: the plan lists every file with its SHA-256 under `### Files of <version>`, and names the files only
hashed after `not stored:` in the version's row — the form MOD-source-register's Data gives ("each file read with its
SHA-256, ..., or a note where a copy that was only hashed is kept"), and every file is hashed, as `registrationCommits`
says, so the version's hash covers them all. The existing `versionRecord` takes every row of that table as stored and
does not read the note, so `readContent`, which the file has read "every stored file", would try to read a file only
hashed. That is the reader's gap, not this item's output: until now no file only hashed could be written. It is not yet
reached — no page commits a plan before ITM-350 —, and is noted for the review, to be closed before ITM-350, where
ITM-385's `versionCommits` writes the same rows. The other readings — the version from the first `## Versions` row,
`unknown` counted as restricted, the instance's group first — read the module file as it stands.
