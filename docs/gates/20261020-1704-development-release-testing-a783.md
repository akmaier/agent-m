---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 752d1a5f39fd3c4b723f47ae5ca4bd1d9927e90d
  - https://github.com/akmaier/agent-m/pull/1224
date: 2026-10-20 17:04 UTC
---
# Development → Release testing: ITM-783, passed — a sprint is ended on the backlog page

**REGISTER**

## Reason

ITM-783 (MOD-implementation-pages), pull request #1224 into `sprint/team1/100`, passes on `752d1a5f`.

- **Four commits, all with the trailer `developer-sonnet-b`.**
  - `37e5a02d` holds only tests: `tests/implementation-pages-backlog-end-sprint.test.mjs`.
  - `4c1dc13e` and `55b0c8c1` change `src/implementation-pages/backlog.mjs`: *End sprint* with `endSprint`, offered for
    a running sprint without a time box.
  - `752d1a5f` merges `sprint/team1/100` (`6694eaf2`, after ITM-732). `git show --cc` prints nothing.
- **The red,** run 39460869321, job 118759683429 on `37e5a02d`: `# fail 2`, `# cancelled 0`, exactly tests 40 and 42.
  TST-783002, the counter-proof, passes before the code.
- **The assertion removed in the code commit** ("the page names the commit") checks the flash notice. The fixture DOM
  has no `insertAdjacentHTML`, so the notice cannot be read there.
  - Neither the Acceptance nor MOD-implementation-pages.md:173 asks the page to name the commit.
  - What the Acceptance asks stays asserted: one click writes `## Ended` in one commit, and the button is not offered for
    a sprint with a time box or one already ended.
- **sonnet-b's readings are kept:**
  - without a token, the button is enabled and the refusal shows in the notice;
  - a sprint ended today reads as running in the facts, so `## Ended` in its file is what hides the button.
- **CI:** 23 of 23 checks passed on the head (run 39462387321).
- **Replayed in a clean worktree at the head,** with the Bridge's packages installed as CI installs them and a temporary
  folder of its own:
  - The 108 tests of `tests/implementation-pages*`, `tests/dashboard-backlog*` and `tests/trace-graph-import*` pass,
    TST-106805 among them.
  - `test_progress_derived` is OK.
  - The release tests that touch the backlog or MOD-implementation-pages pass: 11 files with 141 tests, none failed.
  - Counter-proof: with the sprint branch's `backlog.mjs`, exactly the two tests of the red fail.
