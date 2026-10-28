---
id: ITM-981
title: A run over a selection is planned and started on the run page
level: module
realises:
  - UC-043
  - A RUN EXECUTES THE PROCESS MODEL OVER A SELECTION
  - A RUN HAS LIMITS FIXED AT ITS START
  - THE PAGE NAMES WHERE IT SENDS
  - ONE CLICK PER DECISION
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-976
  - ITM-977
  - ITM-980
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-043-6, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-981 A run over a selection is planned and started on the run page

**REGISTER**

## Outcome

MOD-implementation-pages.md:193-195: "`run` — the selection with the order and what each waits for as a diagram, the limits
— jobs at once, cost, correction rounds —, the plan from the model, *Start run*, which commits the run's record and starts
the first actions `nextActions` returns, each on its route". UC-043 steps 1 to 5 (UC-043.md:76-87) and 1a, 1b, 1d, 3a, 3b.
The route is not built (`src/implementation-pages/index.mjs:4`; the routes it serves, `:21`).

## Acceptance

- Unit tests that name MOD-implementation-pages, over a fake host with a fixture V-model product and a Scrum product:
  - the steps not done are preselected, with their states and a Mermaid diagram of what each waits for; a step that cannot
    start names why;
  - the plan names each job's participant and processing place, every gate and its decider;
  - the limits are preset — jobs at once to the model's work-in-progress limit or 3, rounds to 5 —, each with its
    explanation;
  - *Start run* is one click: one commit of the run's record of kind `run`, naming the selection and the limits, with the
    first actions' start records naming the run; a cycle or a missing role holder starts nothing and is named.
- Counter-proof: a start that writes a job without `run:` fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/implementation-pages/` and the tests that name MOD-implementation-pages change.
