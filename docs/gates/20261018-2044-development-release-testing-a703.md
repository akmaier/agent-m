---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0d06eaafd613fdde804a347c3eb8619641c13441
  - https://github.com/akmaier/agent-m/pull/933
date: 2026-10-18 20:44 UTC
---
# Development → Release testing: ITM-703, the release test of UC-016

**REGISTER**

## Reason

ITM-703 (MOD-settings-pages), pull request #933 into `sprint/team1/92`, passes on `0d06eaaf`. developer-sonnet-b wrote it.
ITM-591 was built by developer-sonnet-e, so the release test is not written by the implementer.

1. **The participant trailer is present** on both commits: `developer-sonnet-b`.
2. **No red run is possible, and planted faults stand in for it,** as at ITM-627's and ITM-639's gates. Nine faults planted
   in `src/settings-pages/library.mjs` each fail named tests.
3. **My replay in a clean checkout of the head:**
   - the new file and both UC-015 files give 22 passing tests and 2 todos;
   - with `olderProducts` replaced by `[]` (`library.mjs:360`), UC-016 steps 3, 4–5, 4 and 4a fail.
4. **The change stays in tests.**
   - `3a5f4ae1` moves the page helpers of `system-uc-015` and `release-uc-015` into `tests/settings-pages-sources.d/frame.mjs`,
     so that three files do not keep three copies (nothing twice). Their results are the same before and after.
   - `0d06eaaf` adds `tests/release-uc-016-new-version.test.mjs`. A release test changed by a participant other than its
     implementer follows the standing rule.
5. **The Acceptance holds:** UC-016's main flow, 1a and 4a through the frame's route `library`.
   - Step 5's "marked source changed" is a todo naming ITM-657, after a known positive.
   - The developer reports that TST-945005 does not change with the new file present.
6. **Green.** CI run 39164382128 passes all twenty jobs. `git merge-tree --write-tree` merges the head into
   `sprint/team1/92` without a conflict (tree `dea5e257`). The release files first run in CI on the sprint's pull request
   into `main`.
