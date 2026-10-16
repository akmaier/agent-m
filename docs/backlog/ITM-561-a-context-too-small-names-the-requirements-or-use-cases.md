---
id: ITM-561
title: A context too small names the requirements or use cases that do not fit
level: module
realises:
  - UC-019
  - NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
  - NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY
modules:
  - MOD-job-runner
builds_on:
  - ITM-514
tests:
  - unit
origin:
  - ITM-514's finding S10 (TST-377011, TST-418121), gate docs/gates/20261016-1655-development-release-testing-70c2.md
---
# ITM-561 A context too small names the requirements or use cases that do not fit

**REGISTER**

## Outcome

When the context is too small, the job runner's `prepareJob` names the tokens and a larger participant, where UC-019
(4a) names the number of requirements or use cases that do not fit.

**Not ready for a sprint yet.** Its readings are settled from UC-019 4a and MOD-job-runner's `Prepared` before it is
selected: which module words the reason, whether `notFitting` carries the count, and how the bar and the run panel show
it.

## Acceptance

- ITM-514's todo tests TST-377011 and TST-418121 pass, with counter-proofs.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
