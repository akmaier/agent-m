---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 32442f6040050eed421824127c68b26818e3d9ec
  - https://github.com/akmaier/agent-m/pull/707
date: 2026-10-17 08:31 UTC
---
# Development → Release testing: ITM-636, Two changes of one requirement are refused, not lost

**REGISTER**

## Reason

ITM-636, pull request #707 into `sprint/team1/68`, at head `32442f60`. It is the rework of the rejection on `75a216bf`
(`docs/gates/20261017-0814-development-release-testing-4a9c.md`).

**The two requests are met.**
1. **ITM-664 went first.** Its pull request #710 passed its gate on `39652a96`, and it is in `sprint/team1/68`
   (`2291006b`).
2. **#707 no longer changes the release test.**
   - The new head merges `sprint/team1/68` into the item, with no rebase: `75a216bf` is an ancestor of `32442f60`.
   - The release test's conflict was resolved to the sprint branch's version inside that merge, as at ITM-643's second
     gate.
   - `git diff origin/sprint/team1/68 32442f60` of `tests/release-uc-019-change-requirements-by-prompt.test.mjs` is empty.
     The pull request's diff has eight files, none of them that test.

**Nothing of the item changed.** `git diff 75a216bf 32442f60` over `candidates.mjs`, `src/spec-changes/` and the item's
five test files is empty. Everything else in that range is ITM-576's and ITM-664's, merged in from the sprint branch. So
the red, the three planted faults, and the rulings on TST-361003/584011, on composing both repositories before writing,
and on `TwoChanges { requirement, candidates }` stand as the rejection recorded them.

**CI** run 39017498205 is green, ten of ten on `32442f60`, and GitHub reports the pull request mergeable. Locally, the
release file gives 24 pass, 0 fail and 2 todo on the head, and TST-418112 passes with ITM-664's `new`. Each shell command
did one action, as sprint 67's agreement asks.
