---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 18cc511b0201869bd816c8d2ae42815fbd5cec33
  - https://github.com/akmaier/agent-m/pull/476
date: 2026-10-12 23:29 UTC
---
# Development → Release testing: ITM-394, an open SPEC entry saved in place

**REGISTER**

## Reason

ITM-394, pull request #476 by developer-sonnet-a into `sprint/team1/25`, head `18cc511`. The tests-only commits
`5412168` and `24951e1` were red (runs 38321739852, 38321941725), and `18cc511` is green (run 38322131539). The code
changes only `src/spec-changes/`; the new test names MOD-spec-changes and its guards, and 13 faults are recorded, killed
on the draft and on the committed code. No existing test changes, and ITM-368's component tests pass unchanged. The
Acceptance holds: an open entry saved in its own queue in one commit, its proposal replaced and its rationale's impact
list computed anew with `impactOf`, no second queue; refused with the newer text when the proposal's blob moved, and
when the entry is no longer open, naming its state; without a token as `proposeSection`. Over this repository every
entry is `in SPEC`, and `saveEntry` on one is refused "not open" with nothing written.

The readings weighed: the state read before the text, so an entry no longer open is refused whatever its blob; the
rationale's origin and provenance kept and its *Why* the edit's; without a token GitHub's editor pages for both files,
and on GitLab `TokenRequired`, as MOD-spec-changes names it; a missing entry a `RangeError`, a name the module file does
not give, noted for the review.
