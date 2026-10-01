# §13: a sprint need not be a time box

**What happened.** The PO chose a work-in-progress limit instead of a time box for Agent M's own Scrum
(`docs/process-models/scrum-wip.md`); a sprint keeps its selection and ends when every selected item is done or
the Product Owner ends it. The rules below said "time box" where they mean the sprint, so a sprint without a time
box was not required to have a review, a retrospective or a selection.

**The change — words only:**
- `A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT`: "time boxes" / "time box" → "sprints" / "sprint".
- `A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT`, `A SPRINT ENDS WITH A RETROSPECTIVE`: "A time box of a product"
  → "A sprint of a product".
- `A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN`: "a phase or a time box — a sprint, for example —" →
  "a phase or a sprint"; in the occasion "A sprint is a time box, not a phase" → "A sprint is not a phase".
- `WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET`: "phase or time box" → "phase or sprint".
- `A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF`: also starts, in a sprint without a time box, when every
  selected item is done.

The names stay (`THE NAME IS THE ID AND IT SURVIVES`); three of them still say "time box". The rest of §13 is
carried over byte for byte.

**Impact list:** UC-002 (step 5), UC-031 (flow-control row), UC-032 (steps 6, 7, 6b), UC-041 (precondition, 1a);
ARC-019 decision 1, MOD-process-model `parseModel`, MOD-work-items `sprint`, MOD-run-engine `nextJobs` and
`startable` — revised on `main` as open in the same commit as the withdrawn queue 2026-10-01d. Backlog items
ITM-034, ITM-036, ITM-039 quote the old wording and follow at the next refinement.
