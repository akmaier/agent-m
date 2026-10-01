---
id: MOD-work-items
title: The product's plan, its backlog and their order, sprints and their close, each item's state, and progress in the model's own measure
realises:
  - A PLAN COVERS THE WHOLE SPECIFICATION
  - AGILE IMPLEMENTATION STARTS FROM THE BACKLOG
  - THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
  - A BACKLOG ITEM NAMES WHAT IT REALISES
  - NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT
  - A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
  - PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
  - A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT
  - A SPRINT ENDS WITH A RETROSPECTIVE
  - CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT
  - AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM
  - AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF
  - UC-032
  - UC-033
  - UC-035
  - UC-041
follows:
  - ARC-003
  - ARC-006
  - ARC-019
uses:
  - MOD-process-model.deriveWorkflow
  - MOD-review-core.deriveStatus
  - MOD-review-core.deriveSpecStatus
provides:
  - derivePlan
  - parseItem
  - itemProblems
  - backlogOrder
  - sprint
  - itemState
  - progress
  - sprintClose
  - itemFromIssue
---
# MOD-work-items Plan, backlog, sprints and progress

## Responsibility

Kernel. The work a product's model organises: in a planned model the plan — every accepted requirement in
every phase —; in a pulled model the backlog under `docs/backlog/`, its order, the sprints and their
selection, the work-in-progress limit, and the close of a sprint with its review and retrospective. Each
item's state — waiting for acceptance, ready, in progress, blocked, done — and the progress shown on the
process dashboard are derived from the approvals, the job records and the pull requests passed in, never
stored (`PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`). A sprint closed by an agent yields records and
proposals; it changes no process file (UC-041 1a).

## Interfaces

- `derivePlan(model, practices, processRequirements, accepted) -> [entry]` — for a planned model, one entry per accepted requirement per phase (N × P); a pulled model has none.
- `parseItem(path, text) -> item` — a backlog item `docs/backlog/ITM-<nnn>-<slug>.md`: title, outcome, what it realises, origins (issues by address), acceptance criteria.
- `itemProblems(item, known) -> [finding]` — an item that realises nothing, or names a requirement or use case that does not exist, is an error; one that restates an existing item is a warning.
- `backlogOrder(text, items) -> { order, unplaced }` — the product's order file and the items it does not name yet, appended at the bottom.
- `sprint(text) -> { goal, start, end, selection, closer, branch }` — a sprint record of `docs/backlog/sprints/`, with who closes it; in a sprint without a time box, `end` stays empty until every selected item is done or the Product Owner records the end.
- `itemState(item, { requirements, useCases, jobs, pullRequests, wip }) -> { state, reasons }` — the derived state; *in progress* counts against the WIP limit, an item in review included; a start is refused above the limit, outside the current sprint's selection, or for an item a pulled model has not in its backlog.
- `progress(workflow, snapshot) -> view data` — plan entries per phase, remaining items per time box, or items per state over time, as the model's measure names; gates passed, pending, not reached.
- `sprintClose(sprint, input, closer) -> { files, proposals } | { refused }` — the review and the retrospective as one record, feedback as new items, unfinished items moved; refused without a retrospective entry; an agent's review names the sources of its feedback and states that no stakeholder took part unless one did; changes to the model, the Definition of Done or a participant's instructions are returned as proposals, never as files.
- `itemFromIssue(issue, classification, queue) -> item` — UC-033: title and outcome from the issue, its address as origin, what it realises from the classification (the violated requirement of a bug, the queue entries of a change).

## Testing

Unit tests over fixture backlogs, sprints and job records: a V-model fixture with N requirements and P
phases yields N × P plan entries, one more accepted requirement adds P; with limit 2 and two items in
progress a third start is refused with the limit named (`tests/test_wip_limit.py`); an item outside the
sprint's selection is refused; a sprint closed by an agent leaves the model, the Definition of Done and
the participants byte-identical and returns the proposals (`tests/test_time_box_close.py`). Each case has
its counter-proof. No seams beyond the data passed in. A review or retrospective written by an agent is
model-dependent text; whether it names its sources is checked here deterministically, its quality is read
by a person.

*Drafted on 2026-10-01 by Claude (claude-opus-5-5) for the Agent M repository at commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): plan, backlog, sprints and progress, with the plan and progress taken over from the process model; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit b09cb03fbe9a8f311d75626fb2629a48968bfade — queue 2026-10-01e: a sprint without a time box; open until accepted.*
