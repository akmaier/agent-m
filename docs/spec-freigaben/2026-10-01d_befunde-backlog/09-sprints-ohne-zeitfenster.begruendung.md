# §13: a sprint need not be a time box

**Finding (backlog refinement, 2026-10-01).** The PO's model for Agent M, `scrum-wip`
(`docs/process-models/scrum-wip.md`, `docs/process.md`), has a work-in-progress limit of 4 and no time box;
"a sprint has no fixed length. It ends when every selected item is done or the Product Owner ends it; then
the review of its increment and the retrospective are recorded". The SPEC knows sprints only as time boxes:

| Requirement | Text today | Effect on `scrum-wip` |
|---|---|---|
| `A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT` | "When a product's model works in time boxes, implementation jobs start only for items selected for the current time box." | does not apply — the selection would not bind |
| `A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT` | "A time box of a product is closed only after a review …" | does not apply — a sprint could close without review |
| `A SPRINT ENDS WITH A RETROSPECTIVE` | "A time box of a product is closed only after its retrospective …" | as above |
| `A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN` | "a phase or a time box — a sprint, for example —"; occasion "A sprint is a time box" | the branch `sprint/<nn>` of `docs/process.md` is covered only by reading a sprint as a time box |
| `WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET` | "Without a branch for the current phase or time box" | read literally, a sprint branch without a time box would not count, and work would go to `main` |
| `A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF` | "… when the sprint's time box ends" | never starts |

**The change**, names kept (the PO's instruction: prefer keeping names and rewording rules):
- `A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT` — "works in sprints … selected for the current sprint";
  occasion and check name the sprint without a time box.
- `A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT`, `A SPRINT ENDS WITH A RETROSPECTIVE` — "A sprint of a product
  is closed only after …"; one sentence in each occasion.
- `A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN` — "a phase or a sprint — with or without a time box —";
  the occasion's "A sprint is a time box" is corrected.
- `WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET` — "phase or sprint". Not named in the request,
  but it is the other half of the branch rule and would otherwise contradict it.
- `A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF` — the close starts "when the sprint ends — at the end of its
  time box or, in a sprint without one, when every selected item is done or the Product Owner ends it"; the
  check gains the case without a time box.

Book-sourced rules keep their source and add "PO A. Maier, changed 2026-10-01"; the others add "changed
2026-10-01". Names that still say "time box" now cover sprints with and without one; renaming them would
withdraw and re-add three rules (`A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED`) and break every reference.
The PO may prefer the rename. The rest of §13 is carried over byte for byte. `PROGRESS IS SHOWN IN THE
MODEL'S OWN MEASURE` keeps "remaining items per time box": it names a measure, and `scrum-wip` declares
"items per state over time".

**Impact list:**
- UC-032 — step 6 (dates: the end date only where the model has a time box), step 7 (a model without sprints;
  sprints and a WIP limit together), alternative flow 6b (how a sprint without a time box ends: **End sprint**).
  Updated in the same commit.
- UC-041 — precondition ("works in sprints"), alternative flow 1a (the close starts when the sprint ends).
  Updated in the same commit.
- UC-002 — step 5 ("for a phase, or for a sprint"). Updated in the same commit.
- UC-031 — the *Flow control* row of the definition table names whether work runs in sprints. Updated in the
  same commit; validation unchanged: exactly one of time box and WIP limit.
- UC-034 (realises three of the names; precondition "a current sprint selection (Scrum) or a WIP limit"; 8a)
  and UC-024 (step on the sprint branch) — consistent as written; unchanged.
- ARC-019 — decision 1: `## Flow control` also states whether work runs in sprints. Updated in the same
  commit.
- MOD-process-model — `parseModel` reads it; `validateModel` keeps "exactly one of time box and WIP limit".
  MOD-work-items — `sprint` reads an end that is empty until the sprint ends. MOD-run-engine — `nextJobs`
  closes a sprint whose close an agent holds when the sprint ends; `startable` checks the sprint's selection.
  Updated in the same commit.
- `docs/process-models/scrum-wip.md` — not changed here: once ARC-019's format is accepted, it gains the row
  that says it runs in sprints, and `docs/process.md` moves its `model_version` to that commit (UC-031 6a).
- ITM-030, ITM-034, ITM-036, ITM-039 (backlog items realising these rules) — registers; they change with the
  next backlog refinement.
- Tests: `tests/test_time_box_selection.py`, `tests/test_time_box_close.py`, `tests/test_phase_branch.py` do not
  exist yet; their file names stay.
