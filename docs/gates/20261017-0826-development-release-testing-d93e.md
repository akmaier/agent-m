---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 39652a966e4fbf9d4e143ae8a8edf4dcf24d1dd6
  - https://github.com/akmaier/agent-m/pull/710
date: 2026-10-17 08:26 UTC
---
# Development → Release testing: ITM-664, UC-019's release test decides its conflict as a new requirement

**REGISTER**

## Reason

ITM-664, pull request #710 into `sprint/team1/68`, at head `39652a96`. developer-sonnet-c wrote it, and built none of
ITM-636 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

**The change, read in the diff:** two lines of TST-418112 in `tests/release-uc-019-change-requirements-by-prompt.test.mjs`.
The conflict's class becomes `"new"`, and the header's `input:` reads "choose new". No other expected result and no `src`
file changes.

**The acceptance, against the local runs:**
- TST-418112 passes on `sprint/team1/68` before and with the edit. With the edit, the whole file gives 24 pass, 0 fail
  and 2 todo.
- On ITM-636's head `75a216bf` with this file, it passes with the same totals.
- **The counter-proof:** on that head, `"change"` planted back fails TST-418112 at its second Save ("one Save produces
  one proposal commit for the affected section", 0 !== 1). Restored, it passes.
- The UC-019 table gives 29 receipts on both trees, with identical ids and sources, and ITM-018 passes.
- CI is green, ten of ten in mode rest, which skips this release test, and GitHub reports the pull request mergeable.
  The sprint's pull request into `main` runs it in mode all.

**No CI red,** as for ITM-645: the change asserts nothing new, and its red is the counter-proof on ITM-636's head.

**The preload.** The guard refused `NODE_OPTIONS=…` for the model-catalogue preload, and the developer did not work
around it. The runs pass without the preload on Node 26, since ITM-623 changed the import order. A run that passes
without the preload proves at least as much as one that needs it. It suffices, and sprint 66's agreement is kept.
