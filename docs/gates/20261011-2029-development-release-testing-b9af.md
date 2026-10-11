---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 85bc3ae8820b9d600339920df87f46f8360945b7
  - https://github.com/akmaier/agent-m/pull/416
date: 2026-10-11 20:29 UTC
---
# Development → Release testing: ITM-441, the review page of the whole architecture

**REGISTER**

## Reason

ITM-441, pull request #416 by developer-sonnet-d into `sprint/team1/20`, head `85bc3ae`. The condition that does not
hold: the page shows the findings left otherwise than the job's record holds them. `roundsSection`
(`src/review-pages/sections.mjs`) counts as left only a finding of the last round that no answer follows, but the
record's writer, MOD-job-ledger's `appendToRecord`, leaves every finding of a last round that did not pass — "what is
left is the last round's findings unless the loop passed or checked nothing" —, answered or not, and writes that count
in the line `Left:` (MOD-job-runner's `roundsText`). A drafter who answers every finding of the last round at the
limit is shown `Left: none` where the record says otherwise. The Outcome asks for the rounds "as its record holds them
... and every finding left" (UC-022 step 10). That the record's reader does not read the `Left:` line does not stop
the page from deriving it as the writer does.

The rest was read too and stands for the rework: the tests-only commits `f4da0a0` and `c20b92d` were red on the seven
new tests alone (runs 38171687380, 38172078085), and the code is green (run 38172229979, 1861 tests, 0 failures); the
grouping of decisions by `refines` and `designs`, each group by identifier; the drafting job as the newest ended
`derive-architecture` job; findings in the compiler form.
