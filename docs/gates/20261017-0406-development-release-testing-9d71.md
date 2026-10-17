---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 06e517296b358f095431147d06475f5ceb1b3518
  - https://github.com/akmaier/agent-m/pull/684
date: 2026-10-17 04:06 UTC
---
# Development → Release testing: ITM-590, A product's requirement sources page links library sources with version and part

**REGISTER**

## Reason

ITM-590, pull request #684 into `sprint/team1/64`, at head `06e51729`. developer-sonnet-e wrote it.

**What holds.**
- **The first red.** The tests-only commit `cd78e1f7` was red in run 39000296225, with 26 failures, all of them new
  tests. Under an uncommitted stub route, 25 of the 26 failed on behaviour.
- **CI and merging.** CI is green, ten of ten on the head, and the pull request is mergeable.
- **Counter-proofs and other checks.**
  - Thirteen planted faults are caught.
  - ITM-018 passes, and the fetch spy, proved on a positive, sent nothing.
  - The local suite fails the same tests with and without the change.
- **Reachability**, as the start reads it (`64.md`): the system tests start MOD-site-frame's `startPage` at
  `#sources/product=…`, against the host's interface.
- **`library.mjs` is accepted.**
  - Its four exports are the module's own code, called by `sources.mjs` and not copied.
  - `versionHashOf` is the regex `filesOfVersion` held, moved to one place, so its behaviour is the same.
  - *Back to Requirement sources* is UC-015 2a's "afterwards the author returns here", within the item, and it is
    tested.
- **The release level** is not written by the item's developer. The release test of UC-015 is registered as ITM-639,
  for another participant, in the pattern of ITM-627.

**What is rejected, and what is asked.** A test changed after the code, and no red has run for the change.
- On `d80b4073`, run 39000529413 failed node (1), because a test read the result too early.
- The developer then changed the test's wait in `06e51729`, and added two assertions that counter-proof F10 found
  missing: a restricted source's box is not disabled.
- Sprint 56's agreement reads: "A test whose setup or assertion is found wrong is corrected and run red again on CI
  before the code is pushed." The code was pushed before the test was corrected, so that order can no longer be kept.
  What can still be shown is the red itself.
- Asked:
  1. **The corrected tests are run red on CI** against the source of the tests-only commit `cd78e1f7`. That is a branch
     of its own holding `06e51729`'s test files over `cd78e1f7`'s `src`. Its run fails the corrected test and the two
     new assertions on behaviour, and its log is saved and named in the pull request.
  2. **F10 is recorded as the counter-proof of the two new assertions.** Making a restricted source's box disabled
     fails them, and restoring it passes.

  Nothing else changes, so after this the gate is decided again on the same code.

**A reading of a cited rule.** The request cites sprint 50's agreement for bounding waits by time. Sprint 50's
agreement (`docs/backlog/sprints/team1/50.md:194-196`) is about saving a failed job's log and grepping a job kind's
recipes; it says nothing about waits. The finding on waits is sprint 12's: a test "waiting a fixed number of turns
instead of for a settled page" (`12.md:225-226`). `settled` waits until the host has been asked nothing for three
10 ms ticks, which is a wait for a settled page. So no change to the wait is asked.

**The developer's findings, each settled in this commit** (sprint 63's agreement):
1. `affectedRequirements` matches identifiers only. This is registered as ITM-637, with a draft for akmaier in which
   MOD-source-register reads an item as `entryNamed` does.
2. Nothing links to `#sources`, and UC-015 step 1 needs it. Registered as ITM-638.
3. The UC-015 release test is registered as ITM-639.
4. Parts named that do not exist:
   - MOD-site-frame's `notices.mjs` and `decision.mjs`: ITM-640, a refactoring.
   - `embedRoute`, not built: ITM-641.
   - MOD-settings-pages' `resources.mjs`, no item yet: ITM-642.
   - `readProblem`, not built: ITM-601 already, which waits for the draft `1928b0ff`.
5. MOD-text-tools is used by `library.mjs` and `participants.mjs`, but MOD-settings-pages' Uses do not name it. A draft
   for akmaier adds `MOD-text-tools.sha256` and `finding` to them.
6. `settings.mjs`'s own `whatIsThis` is registered as ITM-643.
7. **An empty Part, written `—` in new rows and left empty in kept rows: no item.** MOD-documents reads both as the same
   left-out value (`src/documents/read-write.mjs:151`, `checks.mjs:8`), and `linkedVersion` gives `part: null` for
   either.
8. **The 27 environment failures on the base: no item.** They are the same with and without the change, and CI, which runs
   every level, passes them all.
