---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 50a3892a811c3f737f0ebb45acee1862f1dc1376
  - https://github.com/akmaier/agent-m/pull/620
date: 2026-10-16 19:17 UTC
---
# Development → Release testing: ITM-565, A wait of the desktop shell's tests bounded in time that names what it waited for

**REGISTER**

## Reason

ITM-565, pull request #620 into `sprint/team1/50`, at head `50a3892a`. developer-sonnet-e wrote it, and implemented none
of MOD-desktop-shell, as `50.md` assigns. It lists the following as read in full: AGENTS.md, SPEC.md, the item, `50.md`,
MOD-desktop-shell, chapters 9, 11, 12 and 13, and the failing log's lines 720–790. It read `tests/desktop-shell.test.mjs`
in the parts it touches.

1. **The tests-only commit is red.** `c164d03c` holds only the new test file. Run 38952524099 failed on it, with one
   failure, the missing helper.
   - In the uncommitted stub run, which keeps the old semantics:
     - TST-276007 and TST-276011 fail on behaviour;
     - TST-276008 never ends, since a try that never answers had no bound;
     - TST-276009 and TST-276010 pass, since they hold what the old wait also did.
   - The listing of `/private/tmp/claude-501/` was the same before and after the work, and scratch files were written
     with the shell.
2. **CI is green on the head**: run 38953424383, ten of ten jobs. GitHub reports the pull request mergeable.
   TST-276001–006 ran on Linux with the new wait and passed.
3. **The changes stay in the item's scope.** Tests only:
   - the new `tests/desktop-shell.d/wait.mjs` and `tests/desktop-shell-wait.test.mjs`;
   - the two desktop shell test files, which now import the helper. Their own `wait` is gone from both (no
     `const wait =` left; the sprint branch has one in each, as the known positive).

   No expected result changed, and nothing is skipped. ITM-018 passes at each step.
4. **Each fault is caught.**
   - The old wait, scaled down tenfold, had printed and thrown nothing after 12 seconds.
   - The new one threw at 3.0 seconds, naming the condition and "CDP evaluate timed out", and at full scale at 30.0
     seconds.
   - Removing the race, dropping the last error, and a 60-second default each fail exactly one test.

   Restored, the tests pass 5 of 5. The 30-second default is checked with mock timers.
5. **The Acceptance holds.**
   - `wait(name, condition, fatal, limitMs = 30000)` races each try against the time left. At the deadline it throws
     "<name> did not hold within 30 s; last error: <message>", with the error as its cause.
   - Every call names its condition. TST-276005's are "the first window counts the second start" and "the first window
     is visible and not minimised".

**Still open.** Which of the two waits did not hold in the failing run is unknown, and the next failure names it.
TST-276901, the release test whose file changed, first runs on Linux with the helper in the sprint's pull request into
`main`, and is checked there.
