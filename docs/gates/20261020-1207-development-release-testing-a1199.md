---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a05d523147b6a0aefadc7874b8ca97503428b546
  - https://github.com/akmaier/agent-m/pull/1199
date: 2026-10-20 12:07 UTC
---
# Development → Release testing: #1199, passed — the release test of the conversation presses Send as a person

**REGISTER**

## Reason

Pull request #1199 into `sprint/team1/97` passes on `a05d5231`, as `docs/backlog/sprints/team1/97.md` and the gate on
#1197 rule it.

- **One commit, one parent (`591d5a24`), with the trailer `developer-sonnet-e`.** developer-sonnet-e implemented none of
  *Send*, so `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER` (SPEC.md:1501-1503) holds.
- **It changes one line,** in `tests/test_conversation_not_recorded.py`: the click on *Send* becomes the file's own
  `personal()`, a click the browser marks as a person's. It corrects a test, so it has no red commit.
- **CI:** the first run was cancelled. Its rerun, run 39417557353, passed 20 of 20 checks.
- **Merge:** `git merge-tree --write-tree` onto `sprint/team1/97` is clean.
- **Replayed in a clean worktree,** with ITM-1139's `bar.mjs` (`de03dbb3`):
  - the test at the head is OK;
  - with the line as it was at `1d9cd123`, it fails 5 times.
