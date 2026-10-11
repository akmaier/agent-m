---
id: ITM-314
title: The commit plan of a registration
level: module
realises:
  - UC-004
  - THE INSTANCE KEEPS THE SOURCE REGISTER
  - A SOURCE IS FILES, AN ARCHIVE OR A REPOSITORY
  - RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE
  - A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
  - A LIVING SOURCE IS PINNED
modules:
  - MOD-source-register
builds_on:
  - ITM-217
tests:
  - unit
origin:
  - UC-004 steps 4 and 6, 4a
---
# ITM-314 The commit plan of a registration

**REGISTER**

## Outcome

MOD-source-register's `CommitPlan` and `registrationCommits(entry, files, instance)`, as its file states them: the
register entry with its first version and every file's SHA-256; the files planned into the instance when the licence
permits republishing, into the repository the person named otherwise, and nowhere when they are only hashed;
`ContentRepositoryMissing` for restricted files without a repository. The library page commits the plan (ITM-350).

## Acceptance

- Unit tests that name MOD-source-register state, before the code exists: republishable files planned into the
  instance; restricted ones into the named repository and none into the instance; a file only hashed planned nowhere,
  its hash in the entry; restricted files without a repository refused.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/source-register/` and the tests that name MOD-source-register change.
