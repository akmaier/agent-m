---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 21204c08a943a30b3c424ae13ab51aa474cdc7ee
  - https://github.com/akmaier/agent-m/pull/462
date: 2026-10-12 22:17 UTC
---
# Development → Release testing: ITM-384, reworked

**REGISTER**

## Reason

ITM-384, pull request #462 by developer-sonnet-c into `sprint/team1/24`, reworked once on the condition its rejection
named (`e30f4eb`), now on head `21204c0`, with commits added only. The condition holds: the check of the named files
runs for every version, so a one-file version whose `part` names a file it lacks is refused as `NotInVersion`, naming
the file, with nothing read; naming its one file, or no part, sends it whole, and only the selection is skipped for one
file. The test `32f5b2a` changes only the item's own one-file case and was red (run 38314790626); `21204c0` is green
(run 38315472859). The faults were planted again; one survives as equivalent, selecting by name in a version of one
file. What the rejection read besides stands.
