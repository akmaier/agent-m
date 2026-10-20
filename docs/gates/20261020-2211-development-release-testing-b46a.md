---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 9bdaee4c2371cb46822642ded280155efc5b2902
  - https://github.com/akmaier/agent-m/pull/1253
date: 2026-10-20 22:11 UTC
---
# Development → Release testing: ITM-790, a job is resumed after its gate

**REGISTER**

## Reason

ITM-790, pull request #1253 into `sprint/team2/100`, passes on `9bdaee4c`. CI is green on 23 of 23 checks.

1. **The reading, checked first.** The pull request names one passage of each required text, as sprint 100's brief asks
   (point 1):
   - AGENTS.md §2;
   - SPEC.md's `A JOB STOPS AT EVERY GATE`;
   - chapters 9, 11, 12 and 13 of the book: sequence diagrams, human-in-the-loop, one thing at a time, and TDD.

   Each passage is tied to a decision in the change. The brief asks for the passages, and they are there. g's report not
   saying "in full" is noted for the sprint review, not made a rejection.
2. **Red first, on CI.** The tests-only commit `38c09630` was pushed by itself. Run 39505269750 fails in node (10) only,
   on the six new cases of `tests/runtimes-resume.test.mjs` ("resumeJob is not a function").
   - That job's other `not ok` is TST-377011, a known `todo`.
3. **The accepted text.** MOD-runtimes.md:205-208, blob `b8aa99a6`, the draft `c2f0a91e`.
   - The resumption is appended on the head read, naming the gate record.
   - In the tab the job goes on from the result the module kept. On a Bridge it is handed over again when `bridge` is
     given. On CI the resumption alone is committed.
   - TST-790001 to 790006 state each of these, and `Moved` and `NotWaiting`.
4. **g's readings, where the text is open, hold:**
   - The resumption is committed first, then the tab's end, each on the head read just before it.
   - `NotWaiting` and `RecordEnded` are MOD-job-ledger's `appendToRecord` refusals, passed on.
   - A tab job whose result the tab no longer keeps is refused as `NotHeld { job }` before any write.
     - MOD-runtimes' Data says the tab keeps "the result of each job of this tab that waits at a gate". Without it there is
       nothing to go on from, and UC-036 shows such a job as ended without record.
     - Writing a resumption that cannot go on would be guessing.
     - The name `NotHeld` is not in the text. Its next draft of MOD-runtimes names it.
   - `stoppedBecause` is left out of the resumed end, since the record derives the stop from its last round.
   - A hand-over that fails after the resumption is passed on as the Bridge client's error.
5. **No caller yet.** No module's Uses name `resumeJob`, as ITM-790's Note says. Nothing else changes.
6. **The release tests that read every test file, run again by this gate on `9bdaee4c`:**
   - traceability and the new file: 14 of 14 pass;
   - `test_test_levels` and `test_expected_results_stated`: 7 pass and 1 fails. The one fails the same way on `main`
     on this machine, a missing node module in `tests/jsrun.py`'s run. g's run, with `node_modules` linked, passed all.
