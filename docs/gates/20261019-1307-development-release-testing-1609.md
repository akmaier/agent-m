---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 371a82c60044ec9cdb0d98e1954f739a4aed7af6
  - https://github.com/akmaier/agent-m/pull/1061
date: 2026-10-19 13:07 UTC
---
# Development → Release testing: ITM-1024, a retry whose item is no longer startable names the reason and starts nothing

**REGISTER**

## Reason

ITM-1024, pull request #1061 into `sprint/team2/96`, is rejected on `371a82c6`. This is its first rejection.

**The reason is the hold, not the work.**
- Team 1's sprint 94 (`bcbda3be`, started before team 2's sprint 96 was selected) holds MOD-main-page through ITM-923.
- `conflicts` for team 2, on freshly fetched pull requests, holds ITM-1024 against it.
- Merging the change into `sprint/team2/96` would break SPEC.md:1678-1680, SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE
  OTHER CHANGES OR USES.
- 96.md, "Correction" (`452c9269`), takes ITM-1024 out of the sprint. The selection that put it there was my error.

**What stands, for when it is gated again after team 1's sprint 94 ends.** The head stays.
- The red tests-only commit `3e1a562c` (run 39256090119) and green CI on 20 of 20 jobs are noted.
- **h's reading agrees with the text.** MOD-main-page.md:122-123 states *Retry* "for a failed, cancelled or ended job whose
  step or item is still startable (MOD-work-plans' `startable` — otherwise the reasons are shown and nothing is queued)".
  It names no route, so the check holds before the tab's and the hand-over's retries too.
- **The side effect is examined at the next gate.** Such a retry now needs the product facts, or shows "Retry could not be
  prepared". The gate then asks for a test showing that this message names the reason.
- **Still to be checked at the next gate:** the passages, the blob `78f376c6`, the counter-proofs F1 to F4 and the
  callers. Before it is gated again, the head takes the sprint's next branch.
