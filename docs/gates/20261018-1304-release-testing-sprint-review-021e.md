---
gate: Release testing → Sprint review
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 5eb07e90f9c272e078af953194559d75c89dcd5b
  - https://github.com/akmaier/agent-m/pull/897
date: 2026-10-18 13:04 UTC
---
# Release testing → Sprint review: sprint team2/92

**REGISTER**

## Reason

Sprint team2/92 was ended on `sprint/team2/92` at `5eb07e90` (`f6c8d940`) and closed (`2f22bd32`). All three items are
done. Each merge's second parent is the head its gate passed:
- ITM-911 #895 (`bb916700`, `d902d30d`);
- ITM-910 #896 (`122c64c6`, `0a640fa6`);
- ITM-913 #894 (`4f06ca81`, `16c7cb30`, after the rejection `369fb54d` on `b83dcd07`).

**The release tests.** Run 39129713950, on #897 at `5eb07e90`, checks out "Merge 5eb07e90… into 2f22bd32…". It runs
every level (mode=all) and passes all twelve jobs. The longest job, python (2), takes 79 s, under the two-minute limit
(agreement 80).

**Agreements 83 and 89, on the head.** The tree of `5eb07e90` is the tree I tested at ITM-913's gate (the merge of
`16c7cb30` into `4303c583`, tree `45fbbe05`). I ran these with the Bridge packages and LC_ALL=C:
- every release test file and the tests of MOD-approvals, MOD-review-pages, MOD-progress-measures and MOD-trace-pages:
  958 tests, 949 pass, 1 skipped, 7 todo, and 1 fails. The failure is TST-320321902, which fails the same way on `main` on
  this Node 25.9.
- on `5eb07e90` itself, the tests of MOD-documents, `tests/site-usability.test.mjs`,
  `tests/site-accessibility.test.mjs` and the traceability test: 264 tests, 227 pass, 37 todo, 0 fail.

**No installed packages in the history.** `git log 7e4501f5..5eb07e90 -- src/bridge-build/node_modules` prints nothing.

Since `2f22bd32`, `main` changed only `docs/backlog/ITM-926-…`, a new item. So the run stands for the merge into
today's `main`.
