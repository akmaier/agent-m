---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 3fd919c44a4464242202d288510e830dfbbb0ad4
  - https://github.com/akmaier/agent-m/pull/993
date: 2026-10-19 09:23 UTC
---
# Development → Release testing: ITM-940, rejected — the scope build leaves out what buildInProgress takes

**REGISTER**

## Reason

ITM-940 (MOD-progress-measures), pull request #993 into `sprint/team1/93`, is rejected on `3fd919c4`.

**What holds.**
- Two commits, one parent each, with the trailer `developer-sonnet-b`. The red is `f4e03d98` (run 39228532817): `# fail 7`,
  exactly TST-940001 to 007.
- `publishOverview` and `storedOverview` meet MOD-progress-measures.md:234-242.
- A stored overview, computed from one commit by a workflow, is not a status a dashboard stores (SPEC.md:1787-1789). The
  accepted text states it.

**What fails.**
- **The text and the item.** MOD-progress-measures.md:152-153 gives the scope `build` as "what `buildInProgress` takes and
  nothing else". The item's Acceptance asks that "`buildInProgress` gives the same list as with the scope `all`".
- **What `buildInProgress` takes.** It takes `facts.plan.states` (`stages.mjs:142`), and `itemStates` computes those with the
  change queues and the gate records.
- **What `buildFacts` passes.** It passes `queues: []` and `gates: []` (`facts.mjs:160`). So a step that a change queue or a
  gate holds back, with a job running, is in progress under `build` and not under `all`. sonnet-b names this difference
  itself.
- **The reading taken.** The text's own words, "what `buildInProgress` takes", include what `itemStates` takes for those
  states. The dash list does not narrow them, and this reading lets the item be built without a draft (AGENTS.md §6a.6).

**What passes on the next head.**
- `build` also reads the change queues and the gate records with their states.
- A test shows the same `buildInProgress` list as `all` for a step held back by a queue and by a gate, each with a
  running job.
- TST-940001's list of files read grows by exactly those files.
