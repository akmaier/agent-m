---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 025bebe6e84e33f9e72ee85fa21d7cd44b95d805
  - https://github.com/akmaier/agent-m/pull/1317
date: 2026-10-22 23:31 UTC
---
# Development → Release testing: ITM-977, a run's next actions, rejected once

**REGISTER**

## Reason

ITM-977, pull request #1317 into `sprint/team2/105`, is rejected once, on `025bebe6`, for one reading that goes beyond
the text. Everything else holds.

**What holds.**
- **CI and red.** CI is green on 28 of 28. Red: job 120147112589 (run 39871582938, tests-only commit `ea33e073`) has
  `not ok 370` to `379` with `# fail 10`, the ten `nextActions` cases. `ok 362`, outside the item, is the known
  positive.
- **Scope.** `src/run-planner/next.mjs`, `index.mjs` and `tests/run-planner-next-actions.test.mjs`: only the module, as
  the item asks. 18 counter-proofs, ordering by identifier among them.
- **The reading** is named, with MOD-run-planner.md at the accepted blob `61d284c4`.
- **The readings, checked against MOD-run-planner.md:91-107:**
  - 1, 3, 5, 7, 8 and 9 restate the text or are the only way to compute it. A pure function over `facts.graph`; a failed
    job blocking through `startable`; the record's route forms; a resumption on a passed gate; a refusal before anything;
    nothing else until `ci.configured`.
  - 2, "a module already done": the text says "whose modules use only modules already done" and defines no done module.
    "No module-level item that changes it is not done" is the least it can mean. Accepted, named.
  - 4, the holder: the text says "a holder of the implementing role … who may receive its content". Several may qualify,
    and a pure function has to take one. The register's order is the one order the facts give. Accepted, named.

**The one reading that goes beyond the text: 6, "jobs at once".**
- The text: "as many as `jobs at once` allows" (MOD-run-planner.md:96). UC-043:83 sets "jobs at once (preset to the
  model's work-in-progress limit …)", and :92 says "up to the limit of jobs at once".
- `next.mjs:20` counts a job "while it is queued, running or cancelling, not while it waits at a gate". That exception
  stands in no text.
  - The work-in-progress limit it is preset from counts an item waiting for review (`docs/process-models/scrum-wip.md`:
    "an item waiting for review counts").
  - UC-043 6a, "the others go on", says that the other jobs continue, not that a waiting job frees its place.
- So a run with every place held by jobs waiting at gates would start more jobs than its limit.
- **Wanted:** every job of the run that has not ended counts against `jobs at once`, a job waiting at a gate among them.
  The test of the limit holds a case with a job waiting at a gate. Counter-proof: today's exception fails it.

**Noted, not for this item.**
- A run held by a limit still gets starts until ITM-979, as the sprint record says.
- ITM-977 realises UC-043, and its tests guard UC-043. Sprint 105's record quoted akmaier's direction "UC 36 to the end",
  which is the range, not this item's use case. The record now says so.
