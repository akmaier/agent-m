---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a2e6c9b9f944f9ec63bec200a65be13e5c32607f
  - https://github.com/akmaier/agent-m/pull/725
date: 2026-10-17 12:39 UTC
---
# Development → Release testing: ITM-678, the release tests count a batch as a read

**REGISTER**

## Reason

ITM-678, pull request #725 into `sprint/team1/72`, at head `a2e6c9b9`. Its checks passed ten of ten. Mergeability was
still being computed after ITM-695's merge. It changes three release files and nothing else:
`release-sprint-14-spec-overview-readonly`, `release-sprint-15-spec-toggles` and `release-uc-006-batched-reads`.

**The outcome is met.**
- `writes()` leaves out only `POST https://api.github.com/graphql`.
- TST-479201 and 479202 allow 14 to 16 queries, and every request that is not a GET must be one of them.
- These readings were taken before this gate and are recorded in ITM-678.

**Counter-proofs**, from the pull request (none of them could be red on CI, since a sprint branch's CI skips release
tests):
- A batch planted in the page fails the old 472516 and 472518, and passes the new ones.
- A real write planted beside it fails the new ones.
- Plant B, two `readMany` calls in `queues()`, fails the old 479201 and 479202 and passes the new ones.
- A `PUT` planted beside plant B fails the new 479202.

**Whole files on ITM-574's head** (sprint 70's agreement). The coordinator ran the three files on the sprint base with
#725 (`a2e6c9b9`), on `c7eb36b1` alone, and on `c7eb36b1` with #725. Each run gives 1, 1 and 4 passes, with no fail and no
todo. So ITM-574 does not break them. The only commit between `a2e6c9b9` and the sprint head is ITM-695's, which touches
neither these files nor what they load.

**Written by a participant who builds none of ITM-574 or ITM-677.** The developer read AGENTS.md, SPEC.md and the
chapters in full.

**The start's gap, corrected here.** `release-uc-006-batched-reads` names MOD-review-pages, MOD-trace-graph and
MOD-repository-hosts in its header. ITM-678's modules did not list them, against sprint 65's agreement. They are added
to ITM-678 in this commit. No item of Team 2 changes them: Team 2's ITM-653 changes only MOD-bridge-jobs.
