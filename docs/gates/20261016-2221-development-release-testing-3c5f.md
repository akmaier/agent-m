---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f1baf7075eb9bfd6afac871bff906592688a25fb
  - https://github.com/akmaier/agent-m/pull/640
date: 2026-10-16 22:21 UTC
---
# Development → Release testing: ITM-589, MOD-source-register gives affectedRequirements and changedPassages

**REGISTER**

## Reason

ITM-589, pull request #640 into `sprint/team1/54`, at head `f1baf707`. developer-sonnet-d wrote it.

1. **The tests-only commit is red.** `f1c7e906` was pushed alone, and run 38974432264 failed on it. The Scrum Master
   read the saved log: node (5) failed exactly the nine new tests, TST-589001 to 589009, and every other job passed.
   - The red was a missing export.
   - The developer also ran the tests against an uncommitted stub returning `[]`, and all nine failed on behaviour.
2. **CI is green on the head**: run 38974804152 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module**: `src/source-register/index.mjs` and one new test file. No existing test
   changed, and no release test.
   - One private matcher, `namesSource`, is now the one grammar of `entryNamed`, `sourceFindings` and
     `affectedRequirements` (nothing twice).
   - `parseSpec` and `lineDiff` are in the module's Uses.
   - ITM-018 and `test_no_backend` pass, and the fetch spy saw no request from the new functions.
   - No counter-proof table plants faults in `src/source-register/`. The grep's known positive is the UC-019 table's
     prompt-bar files.
4. **Each of the five planted faults is caught**, and the restored file passes all nine tests.
5. **The Acceptance holds.** `affectedRequirements(spec, source)` and `changedPassages(before, after)` work as the module
   file states them, each with a counter-proof.

**The readings are those the item settled.**
- Only a register entry's identifier matches, followed by the item's end or by `, `.
- The results come in the SPEC's order.
- A name the SPEC states twice appears once, at its first place, as `parseSpec`'s map keeps it. That follows from the
  interface "the names of the requirements", and adds nothing to it.
