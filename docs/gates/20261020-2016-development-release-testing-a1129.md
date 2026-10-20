---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4b03911082a5c32f8690920b6c54418931724f91
  - https://github.com/akmaier/agent-m/pull/1233
date: 2026-10-20 20:16 UTC
---
# Development → Release testing: ITM-1129, passed — a handed-over change of requirements carries its source

**REGISTER**

## Reason

ITM-1129 (MOD-prompt-bar), pull request #1233 into `sprint/team1/101`, passes on `4b039110`. Its rejection on `4e41a9cd`
(`docs/gates/20261020-2006-development-release-testing-a1129.md`) is answered.

- **The commits after the rejection,** all with the trailer `developer-sonnet-d`:
  - `aec703df` removes TST-513027's `todo` (`tests/system-uc-049-talk-to-an-agent-in-the-prompt-bar.test.mjs`, level
    `system`).
  - `e4cebb6f` sets the test's world, not its expectation:
    - the test opens the requirement's own page first (`onRequirementPage`), whose subject is of the kind
      `change-requirements` and gives the person's own source;
    - the scripted answer carries `candidates: []` beside its hand-over.
  - `4b039110` merges `sprint/team1/101` (`2dbbb0f4`). `git show --cc` prints nothing.
- **The red:**
  - run 39489339748, job 118857984672 on `aec703df`: `# fail 1`, `# cancelled 0`, exactly test 255, TST-513027;
  - the earlier red of `0ab7041b` is as recorded at the rejection.
- **The page UC-049 4a means.** UC-049 puts the bar on every page (step 1), and 4a hands on what the tab cannot do. A
  hand-over of a change of a requirement, made on that requirement's own page, is the hand-over of the subject's own kind
  that the accepted text (`58a09eb0`) gives the source to. The test's world now opens that page, and the expectation is
  the one it had: the run ends `done` and commits an open proposal.
- **It meets the Acceptance:**
  - TST-513027 passes, and its todo is gone;
  - a job without a source is refused by name (test 147);
  - the record holds only `source` (test 146).
- **CI:** 23 of 23 checks passed on the head (run 39489820685).
- **Replayed in a clean worktree at the head,** with the Bridge's packages installed as CI installs them and a temporary
  folder of its own:
  - The 117 tests of `tests/system-uc-049*`, `tests/prompt-bar*` and `tests/release-uc-049*` pass, with no todo.
  - `test_conversation_not_recorded` is OK.
  - Counter-proof: with the base's `src/prompt-bar/`, TST-513027 fails again.
