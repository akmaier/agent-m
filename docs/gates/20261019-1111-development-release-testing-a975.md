---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 436692ab72b7124cf056537a02391082a28267de
  - https://github.com/akmaier/agent-m/pull/1027
date: 2026-10-19 11:11 UTC
---
# Development → Release testing: ITM-975, passed — every job state and runtime on the jobs page carries its folded explanation

**REGISTER**

## Reason

ITM-975 (MOD-main-page, and MOD-site-frame for its topics), pull request #1027 into `sprint/team1/93`, passes on `436692ab`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-d`.**
  - `921bfeb9` holds only tests: `tests/main-page-jobs-explanations.test.mjs`.
  - `436692ab` holds the code: `src/main-page/jobs.mjs` and ten topics in `src/site-frame/explanations.md`.
- **The red,** run 39241889805, job 118024438803: `# fail 2`, `# todo 0`, `# cancelled 0`, exactly TST-975001 and 975002.
- **The Acceptance holds.**
  - The route `jobs` draws the folded explanation of each of the seven states, and of the tab, CI and Bridge runtimes, once
    each.
  - With a state's topic missing, the frame's check reports it.
  - `cancelling` gets no topic: no row is `cancelling` today, and ITM-972 brings that state.
- **MOD-site-frame joins the item** for its topics, as the Acceptance allows and as ITM-642 did.
- **CI:** 20 of 20 checks passed on the head (run 39242290359).
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`738fe3ef`) is clean.
- **Replayed in a clean worktree at the head:**
  - `main-page-jobs-explanations`, `main-page-jobs` and `site-frame-topics-check` pass 19 of 19.
  - Counter-proof: with `921bfeb9`'s `jobs.mjs`, the 2 tests fail.
