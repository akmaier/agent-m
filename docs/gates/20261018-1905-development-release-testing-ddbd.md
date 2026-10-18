---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 2cf6e17a5987b5cf9acc43596cfb45d7e5770d6d
  - https://github.com/akmaier/agent-m/pull/924
date: 2026-10-18 19:05 UTC
---
# Development → Release testing: ITM-934, the approval record of a green release has no empty limitation line

**REGISTER**

## Reason

ITM-934, pull request #924 into `sprint/team2/94`, passes on `2cf6e17a`. I checked it in a clone of my own.

1. **Red first.** The first commit, `eafde6cc`, holds only tests, and CI run 39155306200 is red on it. With the sprint head's
   `src/`, only TST-934001 and TST-934004 fail, as the PR says. TST-934002, TST-934003 and TST-934005 guard callers that
   already hold and are their positive controls.
2. **Green.** Run 39155613895 is green on the head.
3. **Scope.** Only `src/release-evidence/report.mjs` and tests that name MOD-release-evidence changed. The new cases in
   `tests/release-evidence-audit.test.mjs` and `tests/release-evidence.test.mjs` are additions, and no expected result
   changed.
4. **Counter-proof replayed.** With `limitation: ids.map(…)` put back, TST-934001 and TST-934004 fail again (2 of 24).
5. **The Acceptance holds.**
   - A green report's record holds no `limitation` line, and a red one holds one per test, as before.
   - The stale comment at `report.mjs:376-379` is gone.
   - The quotes stand: MOD-approvals.md:75, and MOD-release-evidence.md's `acceptAndRelease`, unchanged at :114-118 of its
     accepted blob `8654bba2`.
6. **Callers** (sprint 92's agreement): `statusOf`, `approvalSchema` and `auditRows` read a record without the key as no
   limitations (TST-934002 to TST-934005).

**Agreements 83 and 89.** On the head, with the Bridge packages installed as CI installs them and LC_ALL=C:
- every release test file: 363 tests, 354 pass, 1 fails, the known TST-320321902;
- the tests of MOD-release-evidence, MOD-approvals, the review pages' release tests and MOD-test-pages: 185 of 185.
#928 changes the same module and test file, so the Scrum Master tests the second merge onto the sprint head.
