---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - de03dbb319e0b0a428aec377ce2cfa68c3c1f422
  - https://github.com/akmaier/agent-m/pull/1197
date: 2026-10-20 11:49 UTC
---
# Development → Release testing: ITM-1139, passed — a script's click on Send records nothing

**REGISTER**

## Reason

ITM-1139 (MOD-prompt-bar), pull request #1197 into `sprint/team1/97`, passes on `de03dbb3`. Its rejection on `a9619c36`
(`docs/gates/20261020-1144-development-release-testing-a1139.md`) asked that the release test go back to its text, and it
has.

- **`de03dbb3`, with the trailer `developer-sonnet-d`, sets `tests/test_conversation_not_recorded.py` back to its text at
  `1d9cd123`.** `git diff 1d9cd123 de03dbb3` of that file is empty. The rest of the branch is as read at the rejection.
- **The red** is as read then: run 39415801301 on `8c95ca69`, exactly TST-1139001.
- **The release test's click** is made a person's by developer-sonnet-e, in a pull request of its own
  (`docs/backlog/sprints/team1/97.md`).
- **CI:** 20 of 20 checks passed on the head (run 39417388284).
- **Merge:** `git merge-tree --write-tree` onto `sprint/team1/97` (`591d5a24`) is clean.
- **Replayed in a clean worktree at the head:**
  - The 102 tests of `tests/prompt-bar*`, `main-page-jobs`, `site-frame-prompt-bar` and `site-frame-settings-subject`
    pass.
  - Counter-proof: with `1d9cd123`'s `bar.mjs`, exactly TST-1139001 fails.
