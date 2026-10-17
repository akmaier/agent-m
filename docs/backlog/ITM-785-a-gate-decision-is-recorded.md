---
id: ITM-785
title: A gate decision is recorded
level: module
realises:
  - UC-034
  - THE GATE IS RECORDED
  - A GATE NAMES WHO DECIDES IT
  - A GATE IS DECIDED WITHIN THE JOB'S ROLE ASSIGNMENT
  - A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS
modules:
  - MOD-product-process
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-785 A gate decision is recorded

**REGISTER**

## Outcome

UC-034 step 7, 7a and 7b. MOD-product-process states `recordGateDecision` and does not build it
(`src/product-process/gates.mjs:2`); `mayDecide` and `gateSchema` are built. This item builds `recordGateDecision`
as the module's file states it: `mayDecide` first, then one gate record of `gateSchema` under `docs/gates/` in one
commit on the head that was read, naming the decider, the role, the decision, the date and each checked artifact as
`<path>@<blob>` or the commit, with the job's provenance lines as trailers.

## Acceptance

- A decision `mayDecide` refuses is refused with `MayNotDecide` naming the reason and the holders, and nothing is
  written; a rejection without a reason fails with `ReasonMissing`; a moved head with `Moved`.
- A written record is read back by `gateStates` as passed, or rejected, on the texts it names.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
