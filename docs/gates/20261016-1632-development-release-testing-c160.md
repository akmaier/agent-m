---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 65c5722adde665aa36318a5505328ecc0e3a9106
  - https://github.com/akmaier/agent-m/pull/604
date: 2026-10-16 16:32 UTC
---
# Development → Release testing: ITM-549, Where a text names a mail's people

**REGISTER**

## Reason

ITM-549, pull request #604 into `sprint/team1/47`, at head `65c5722a`. developer-sonnet-d wrote it. The gate before
(`cff6`, on `d22e0f68`) was rejected for one reason: a phone number written after other digits in the same run was not
found. ITM-549 now settles it. Two commits follow `d22e0f68`, nothing was rewritten, and no stub was committed.

1. **The new tests-only commit is red.** `53f4ae31` was pushed alone. In run 38931619903, exactly one test fails, on node
   (5): "a phone number after other digits in the same run is found".
   - It finds "Ticket 4711 / 0912 345678" at line 1, column 15.
   - It finds "Call 4711 0912 345678." on line 2 at column 11.
   - It finds "0912 345678 4711" at line 1, column 1.

   A test of whole groups passes already on the old code, as a guard. It finds no hit in "4712 345678" for "12 345678",
   and none for other final digits.
2. **CI is green on the head**: run 38932056495 passes ten of ten jobs on its second attempt. GitHub reports the pull request mergeable.
   - The first attempt failed node (4) in TST-276001–006 (`tests/desktop-shell.test.mjs`), where the Openbox install timed
     out at 60 seconds. That file is one this item does not touch, and the re-run passed.
   - The developer re-ran the job itself instead of naming it first. That goes to the retrospective.
   - The timeout is the third of its kind, and the first since ITM-541. It becomes ITM-557, as sprint 37 agreed.
3. **The changes stay in the item's module.** `src/personal-data/people.mjs` and the test file. `phonesAt` splits a run
   into its digit groups and checks every stretch of consecutive groups. It keeps a leading `+` only from the run's start,
   and a run never crosses a line.
4. **Each fault is caught.**
   - Comparing only the whole run fails the new test.
   - Splitting within a group fails the whole-groups test.
   - A run across a line break fails the line-break test.

   The seven earlier faults are caught as before, and the file passes 21 of 21. The listing of `/private/tmp/claude-501/`
   was the same before and after the work.
5. **The Acceptance holds**, with the settled reading: each kind is found with its kind, value, line and column, and the
   counter-proofs give no hit.

**Reading 7, applied to phone numbers.** In "911 123456", with the phones `911123456` and `123456`, the shorter lies
within the longer's extent, and one hit is given, the longer's. This is "the same place" as the item reads it for names.
The text is still marked there, so no person goes unfound.

The checks that carried over from `cff6` still hold: the first red, the scope and the purity.
