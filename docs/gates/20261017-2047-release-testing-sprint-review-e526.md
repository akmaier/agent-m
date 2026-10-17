---
gate: Release testing → Sprint review
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - d693298438e69b652205a65653307769dd0dad70
  - https://github.com/akmaier/agent-m/pull/774
date: 2026-10-17 20:47 UTC
---
# Release testing → Sprint review: sprint team2/78

**REGISTER**

## Reason

Sprint team2/78, pull request #774 of `sprint/team2/78` into `main`, on head `d6932984`.

The condition that does not hold: the release tests did not run on the merge with the `main` the increment enters.
Run 39067960983 (and the earlier 39067815026), the only runs on #774, check out `5617ee4f`, "Merge d6932984 into
18256f3a", in all ten jobs. `main` is now `3fdab0cf`; `18256f3a..3fdab0cf` holds team 1's sprint 76 (#773, merged at
`b5e978df`), which changes code and tests of MOD-artifact-edits, MOD-markdown-render, MOD-review-pages and
MOD-settings-pages (11 files outside `docs/`). No run has tested the sprint's seven items together with it.

What holds on that run, read in its log: each job runs `mode=all`; python (0) 259 tests `OK` (3 skipped, 3 expected
failures), python (1) 258 tests `OK` (2 skipped, 2 expected failures); node (0), (1), (3) to (7) end `# fail 0`, 3422
tests, 10 todos; node (2)'s log ends without the TAP summary, its job concludes `success`. Every `not ok` line printed
is a `# TODO` or the recorded output of a counter-proof's faulted run. `git merge-tree --write-tree` merges the head into
`3fdab0cf` without a conflict (tree `2cd12d86`). No release test was written in this sprint.

A run of every job on a fresh merge of `d6932984` into the current `main` is decided as any other.
