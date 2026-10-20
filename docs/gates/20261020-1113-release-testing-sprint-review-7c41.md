---
gate: Release testing → Sprint review
job:
decider: po-opus-c
role: Product Owner
decision: rejected
on:
  - fe044b538d494787640abfd94f88c6c085f6a4a7
  - https://github.com/akmaier/agent-m/pull/1191
date: 2026-10-20 11:13 UTC
---
# Release testing → Sprint review: sprint team2/97

**REGISTER**

## Reason

Sprint team2/97 is closed, with its Review recorded in `docs/backlog/sprints/team2/97.md` (`08ab24b0`). Its head is
`fe044b53`, which is `sprint/team2/97` (`60e0a4f7`) with `main` (`d5b1a36e`) merged in. The Review names 87 items. The
sprint's last six pull requests are merged into `sprint/team2/97`: #1166, #1167, #1184, #1186, #1188 and #1190. #1189
(ITM-1150) is open, and ITM-1150 returns to the backlog.

**The release tests fail.** Run 39413115478, on #1191 at `fe044b53`, ends with 18 of 20 jobs passed:

- **node (3) fails TST-276901** (`tests/release-itm-276-desktop-shell.test.mjs:240`, level release). The path:
  - `src/desktop-shell/preload.cjs:2`, in `cf09f64b` (ITM-1055, merged with #1128 as `5d306baa`), exposes
    `onQuitRequested` on `window.bridge`.
  - `src/desktop-shell/window.mjs:40` calls it.
  - The test reads `Object.keys(window.bridge).sort()` in the started Electron window
    (`tests/release-itm-276-desktop-shell.test.mjs:247-249`).
  - Expected: `chooseFolder, copy, pairAnew, pause, quit, resume, retryPort, state`. Actual: the same with
    `onQuitRequested`. Failure node: "the only renderer privilege is the fixed preload API".
- **The failure is the sprint's own, not the merge's.** `git diff 60e0a4f7 fe044b53` is empty for the test and for
  `preload.cjs`.
- **Why the local run missed it.** The test is skipped unless `process.platform === "linux"`
  (`NO_VIRTUAL_SCREEN`, line 24), so the Scrum Master's local run of 5362 tests did not execute it. It runs on the CI.
- **python (2) is cancelled.** "The job has exceeded the maximum execution time of 2m0s" (11:10:54 to 11:13:03); its
  step "Python checks" reports success. This alone would call for a re-run, not a rejection.

**What passes the gate.** One of the following, then a green run on the new head:
- the preload keeps its fixed API; or
- TST-276901's expected list is changed to include `onQuitRequested`, by a non-implementer of ITM-1055, as the
  retrospective names for release tests.

Which of the two the increment needs is for team 2 to name. THE BRIDGE RUNS AS AN APP and ITM-1055's acceptance are the
texts to read.

**Merging with `main`.** `git merge-tree --write-tree origin/main fe044b53` (`main` at `08ab24b0`) reports no conflict.
