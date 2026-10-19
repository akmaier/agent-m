---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 32e6c8c71d6d09625dfae1b5039c4a3e09e022e9
  - https://github.com/akmaier/agent-m/pull/1048
date: 2026-10-19 12:36 UTC
---
# Development → Release testing: ITM-691, passed — approved SPEC changes are applied by the workflow entry

**REGISTER**

## Reason

ITM-691 (MOD-workflow-entries, MOD-spec-changes), pull request #1048 into `sprint/team1/93`, passes on `32e6c8c7`. It was
rejected on `8b468cd9` (20261019-1222).

- **Commits since the rejection, each with one parent, with nothing rewritten:**
  - `a457be98` (developer-sonnet-e) sets `tests/release-sprint-02-c-review-core.test.mjs` back to the sprint branch's. Its
    diff against `sprint/team1/93` is empty.
  - `cf379fe8` (developer-sonnet-e) brings back `tests/review-core.d/apply-approvals.test.mjs`, rewritten on `applyApproved`,
    as MOD-spec-changes.md:85 says.
  - `32e6c8c7` (developer-sonnet-a) changes only the release test.
- **The rejection's causes are gone.**
  - **The release test.** Its change is developer-sonnet-a's, who builds none of ITM-691 (SPEC.md:1501-1503). The three
    ITM-016 tests are rewritten on `applyApproved`, and none is dropped.
  - **The old writer's test.** It is rewritten, not deleted.
- **What held at the rejection still holds:** the red (TST-691001 and 002), the removal of the old tool, and the behaviour
  of `applyApproved`'s accepted text.
- **The release test is not run on pull requests into the sprint branch.** CI leaves out level `release` there, so the run
  of `32e6c8c7` (39252952491) did not run it. I ran it here.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`b3e0fc72`) is clean.
- **Replayed in a clean worktree at the head:**
  - `release-sprint-02-c-review-core`, `review-core.d/apply-approvals` and `workflow-entries-apply-approvals-workflow` pass
    17 of 17.
  - `test_apply_approvals`, `test_verbatim`, `test_replaced_in_history`, `test_spec_gate`, `test_proposal_shows_current`,
    `test_release_sprint_02_d` and `test_self_sufficient` pass, with their one known expected failure.
  - Counter-proof: with a changed proposal never refused (`src/spec-changes/accept.mjs:145`), 3 tests fail across the
    rewritten test and the release test.
