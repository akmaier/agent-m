---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9d43302eb4149f79c8515fa8184fcbbe4219a9ea
  - https://github.com/akmaier/agent-m/pull/1232
date: 2026-10-20 20:00 UTC
---
# Development → Release testing: ITM-932, passed — the backlog's diagram that scrolls can be focused

**REGISTER**

## Reason

ITM-932 (MOD-implementation-pages), pull request #1232 into `sprint/team1/101`, passes on `9d43302e`.

- **Four commits, all with the trailer `developer-sonnet-b`.**
  - `5dc9bdfe` and `4cefe579` hold only tests:
    - `tests/implementation-pages-backlog-focus.test.mjs`;
    - `#backlog`'s todo in `tests/site-accessibility.test.mjs` without `"scroll"`.
  - `4b30603c` gives the four `.table-scroll` boxes and the chart's box `tabindex="0"` in `backlog.mjs`.
  - `9d43302e` merges `sprint/team1/101` (`c64bd147`, after ITM-733). `git show --cc` prints nothing.
- **The red:**
  - run 39485826419, job 118845855088 on `5dc9bdfe`: `# fail 2`, `# cancelled 0`, exactly tests 25 and 26;
  - `4cefe579` adds TST-932003 and is red on tests 25 to 27 (run 39486539191).
- **The points, judged:**
  1. **"Focused" read as `tabindex="0"`** under THE SITE SERVES A SCREEN READER (SPEC.md:944), which the item realises:
     WCAG's `scrollable-region-focusable`, as `tests/markdown-render-931-preview-focus.test.mjs` reads it. No draft is
     needed, since no text says otherwise.
  2. **The removed `"scroll"` todo.**
     - `site-accessibility` runs on the pull request's CI: node (3) of run 39485826419 reports TST-905060, `#backlog`,
       marked todo for the menu and the contrast.
     - It reported no `scrollable-region-focusable` finding there even before the code. So the removal could not be
       shown red, and it is right: the finding is gone.
  3. **`dashboard-backlog-teams`' pattern** (level `component`) accepts the box with or without `tabindex`, so it asks
     what it asked before of the table.
- **CI:** 23 of 23 checks passed on the head (run 39487671713).
- **Replayed in a clean worktree at the head,** with the Bridge's packages installed as CI installs them and a temporary
  folder of its own:
  - The 243 tests of `tests/implementation-pages*`, `tests/dashboard-backlog*`, `site-accessibility` and
    `tests/trace-graph-import*` pass, with the 34 known todos.
  - The release tests that touch the backlog or MOD-implementation-pages pass: 11 files with 141 tests.
  - Counter-proof: with the sprint branch's `backlog.mjs`, the three focus tests fail.
