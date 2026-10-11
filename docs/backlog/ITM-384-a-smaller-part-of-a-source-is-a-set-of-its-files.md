---
id: ITM-384
title: A smaller part of a source is a set of its files
level: module
realises:
  - UC-005
  - A LINK NAMES THE PART THAT APPLIES
  - NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
modules:
  - MOD-source-register
builds_on:
tests:
  - unit
origin:
  - UC-005 2a
---
# ITM-384 A smaller part of a source is a set of its files

**REGISTER**

## Outcome

The recipe `source-excerpt` of `sourceStrategies`, as MOD-source-register's file now states it: for the source a job's
parameter `source` names, the texts of the files its parameter `part` names — every file of the linked version when it
names none —, in the version's order, a blank line between them, as one part that names the source; the part's name
names the version, the files sent and the part the product's link names. `NotInVersion { files }` for a part that names
a file the version does not hold. A version of one file has no smaller part. The page that offers the files (ITM-361) is
not part of this item.

## Acceptance

- Unit tests that name MOD-source-register state, before the code exists, with a fixture version of three files: the
  whole version without `part`; two named files in the version's order; `NotInVersion` naming a file the version lacks;
  a one-file version sent whole; the existing recipe cases asserting the same as before.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/source-register/` and the tests that name MOD-source-register change.
