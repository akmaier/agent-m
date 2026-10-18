---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - e163dbc343afe7458c9d64d5bc497c9d9afd5c58
  - https://github.com/akmaier/agent-m/pull/866
date: 2026-10-18 08:41 UTC
---
# Development → Release testing: ITM-901, a followed job whose runtime does not answer is shown as not reachable

**REGISTER**

## Reason

ITM-901, pull request #866 into `sprint/team2/89`, at head `e163dbc3`.

- **The fix.** `src/prompt-bar/follow.mjs:95` now calls `logOf` only when `!live || live.reachable`. While the
  runtime has just not answered, the problem "The runtime is not reachable: <reason>" stands. On a reachable runtime,
  `logOf` still runs inside the poll's `try`. I checked this with a probe on the head: `listCiRuns` answered the
  live state, then failed for the log. The view showed "The job could not be followed. Error: …". The known positive is
  the same host with no failure: the run's address was shown, so the log was asked.
- **The third commit.** It changes `tests/prompt-bar-follow.test.mjs:5` from `UC-049 (5a)` to `UC-049`.
  - The guard the accepted texts give is kept. UC-049 is the use case. "(5a)" named a position, and UC-049's 5a is
    "The author presses Stop", which has nothing to do with this file. A reference names the identifier, not the
    position.
  - It belongs here. It is the header of the file this item adds its tests to, and that header names MOD-prompt-bar. No
    fixture and no expected result changes. Without it, the merge into the sprint fails the traceability release test.
- **The texts are accepted.** UC-049, UC-036 and MOD-prompt-bar are accepted. MOD-runtimes is changed, but its accepted
  text `a821f6eb` holds the line the item cites: "A runtime that cannot be reached gives `reachable: false` and its
  reason, never an error".
- **Red first.** The tests-only commit `75eace36` was red in node (5), on TST-901001 and TST-901002. CI is green on
  `5948a6c5` and on `e163dbc3`.
- **Scope.** Two files changed: `src/prompt-bar/follow.mjs`, and `tests/prompt-bar-follow.test.mjs`, whose header
  names MOD-prompt-bar. TST-881002 is unchanged.
- **Merge.** The head merges cleanly into the sprint head `8060bf21`.

**Replayed with LC_ALL=C**, after the bridge-build install, on the head and on its merge with `8060bf21`:
- **Tests.** I ran 34 files:
  - the 24 release tests whose imports reach `follow.mjs` or the changed test;
  - the 5 release tests that read every tracked file, including `release-sprint-02-d-traceability`;
  - every `tests/prompt-bar-*.test.mjs`.
- **Result.** Both runs gave 266 passed, 0 failed, and 7 todo. The todo tests are findings that were recorded earlier.
- **Counter-proofs.**
  - I dropped the guard in `follow.mjs`. TST-901001 then fails, showing "The job could not be followed. Error:
    Unreachable: …", and TST-901002 fails, showing "The job could not be followed. NotFound: …". TST-881002 stays green.
  - I put `UC-049 (5a)` back. The ITM-018 graph test then fails on
    `tests/prompt-bar-follow.test.mjs -guards-> UC-049 (5a)`.

ITM-902 is widened. One helper, `tests/ssh2-fixture.mjs`, now serves the eleven test files that install ssh2,
following AGENTS.md §2 principle 2, nothing twice.
