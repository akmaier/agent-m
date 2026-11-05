---
gate: Development → Release testing
job:
decider: po-opus-c
role: Product Owner
decision: passed
on:
  - be89a73f179a9aa139ab211c574d21e608598500
  - https://github.com/akmaier/agent-m/pull/1776
date: 2026-11-05 17:51 UTC
---
# Development → Release testing: main's two red tests, #1776

**REGISTER**

## Reason

The repair of main's two red tests may go into `main`. It is #1776 (`repair/main-pr-tests` → `main`), one commit
`be89a73f1` by developer-opus-f (trailer), on akmaier's repair path, like #1773. I wrote none of it.
1. **A test-only refactoring needs no red commit** (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`). Its one commit is
   green: run 42077760924 (`be89a73f1`), at attempt 1. `git merge-tree` with `origin/main` (`fcad45715`) is clean.
2. **The causes.** `main`'s pull-request runs have been red since akmaier's Bridge-window commits `24b8c173c` and
   `0ac27bf76`, in two tests:
   - **TST-1169002.** The declarations of TST-1105202 and 1105203 wrapped their `given:` over comment lines. That ended the
     declaration early ("A declaration ends at the first line that is not a comment line of this form", MOD-test-document).
     Each field now stands on one line, in the same words, and so does TST-1105201's `expect:`.
   - **TST-1105201.** It walked the folders it found, CI's instance checkout `.agent-m/` among them, whose pinned
     `0b2e10928` still names `lme.css`. It now scans `git ls-files`, as `tests/trace-graph-uses-provided.test.mjs:25`
     does.
     - Before, with that checkout present, it failed on `.agent-m/docs/index.html` and `.agent-m/index.html`.
     - After, it passes with and without that checkout.
     - Known positive: a planted `lme.css` reference in the tracked `index.html` fails it.
3. **Only tests change:** `tests/mod-desktop-shell-window-look.test.mjs` and `tests/site-frame-one-style-sheet.test.mjs`
   (15 lines added, 25 removed).
4. **No asserted value changes** (`A REFACTORING JOB CHANGES NO EXPECTED RESULT`). Only the set of files the test scans
   moves, from the folders found on disk to the files the repository tracks. The expect lines keep their words on one
   line.

## Ruled

- **Tracked files are the right scope.** The files a check of the code reads are the ones the repository tracks, not a
  checkout CI places beside them. This is the reading `trace-graph-uses-provided` already takes, so no second way of
  listing files is introduced.
