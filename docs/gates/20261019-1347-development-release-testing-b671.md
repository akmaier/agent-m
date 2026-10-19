---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4a347f71c6bb9166b09e46e9e804db19289c1040
  - https://github.com/akmaier/agent-m/pull/1077
date: 2026-10-19 13:47 UTC
---
# Development → Release testing: ITM-671, passed — leaving a draft with unsaved edits asks first

**REGISTER**

## Reason

ITM-671 (MOD-review-pages), pull request #1077 into `sprint/team1/95`, passes on `4a347f71`.

- **Three commits, all with the trailer `developer-sonnet-a`.**
  - `0b571637` holds only tests, in `tests/review-pages-conversation-draft.test.mjs` and
    `tests/review-pages-draft-architecture.test.mjs`. Neither file is of level `release`.
  - `b231a258` changes `conversation-draft.mjs`, `file-drafts.mjs`, `flow.mjs` and `jobs.mjs` of MOD-review-pages.
    - Route `draft` gives `leave` and `unsaved` through its editors' `close`, guarded against a late render as in ITM-673.
    - `<k>/draft` hands its editor to the flow through `holdEditor`.
  - `4a347f71` merges `sprint/team1/95` (`d93ab5d4`). `git show --cc` shows no change of its own.
- **The red,** run 39261506498 on `0b571637`, with `# cancelled 0` in each failing job:
  - job 118090053892: `# fail 4`, exactly TST-067101 to TST-067104;
  - job 118090052813: `# fail 2`, exactly tests 122 and 124 of `decision/draft`.
- **The test changes in the code commit are kept.**
  - TST-067101 now expects the edited editor closed and the unedited one left with the page. That follows the reading of
    one question per edited editor, and the frame replaces the page once `leave` returns true.
  - TST-067108, TST-067109 and TST-067110 are counter-proofs that the red tests left out:
    - a late render;
    - after Save;
    - after *Check this edit* on the architecture draft.

  No other expectation of the red tests changes.
- **It meets the Acceptance and UC-018 7a.** Leaving `draft` or `<k>/draft` with an unsaved edit asks first, and a
  refusal keeps the page and its address.
- **CI:** 20 of 20 checks passed on the head (run 39262556618).
- **Merge:** the head contains `sprint/team1/95`. `git merge-tree --write-tree` with #1076's head is clean.
- **Replayed in a clean worktree at the head:**
  - The 362 tests of `tests/review-pages*.test.mjs` pass. With #1076's head merged in as well, all 364 pass.
  - Counter-proof: with the sprint branch's `src/review-pages/`, exactly the nine tests of this item fail.
