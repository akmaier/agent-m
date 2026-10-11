---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 0896001b0d85783674ec468fbe8e713461fcfa12
  - https://github.com/akmaier/agent-m/pull/440
date: 2026-10-11 22:47 UTC
---
# Development → Release testing: ITM-338, classified candidates written as change queues

**REGISTER**

## Reason

ITM-338, pull request #440 by developer-sonnet-a into `sprint/team1/22`, head `0896001`. The condition that does not
hold: when the product is its own instance, its two queues of one day are told apart by the slug `-process`
(`0896001`), where MOD-spec-changes' file tells several queues of one day apart by their letter — "a folder
`docs/spec-freigaben/<YYYY-MM-DD><letter>_<slug>/`, the letter (`b`, `c`, …) distinguishing several queues of one
day, absent for the first". Both queues now take the day without a letter. The pull request's own `folderFor` gives
the first free letter of the day from the repository's paths; it gave both queues the same folder because the second
was named before the first was written, and that is where the fault lies.

The rest was read too and stands for the rework: the first commit `4b22641` holds only the new test and was red (run
38179276910); the code is green; the faults F6 and F35, which survived on the draft, are killed by `03958b4`; the class
from `result.classes`, `source` from the answer, the impact list from `requirementImpact`; over this repository, both
queues read back with every entry open, and a process candidate restating a requirement classed its duplicate.
