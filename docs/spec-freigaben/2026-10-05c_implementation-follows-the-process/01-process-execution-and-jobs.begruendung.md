# 13. Process execution and jobs: implementation follows the declared process model

**The change.** Five requirements are added; every other requirement of the section is carried over byte for byte.

- After `A PLAN COVERS THE WHOLE SPECIFICATION`: `A PLANNED MODEL IMPLEMENTS ITS IMPLEMENTATION PLAN`,
  `AN IMPLEMENTATION PLAN ASSEMBLES THE SYSTEM FROM ITS MODULES`, `A PLAN STEP NAMES THE TESTS OF ITS LEVEL` and
  `THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY`.
- After `A BACKLOG ITEM NAMES WHAT IT REALISES`: `A BACKLOG ITEM NAMES THE MODULES IT CHANGES`.

**Why.** PO decision, 2026-10-05: the selection of a software process — V-model, Scrum, Kanban — determines how things
are implemented; it is the process that assembles the software. For Scrum and Kanban a backlog has to be planned and
filled; for the V-model an implementation plan.

- The SPEC so far knew two plans of work, neither drawn from the architecture. `A PLAN COVERS THE WHOLE SPECIFICATION`
  is the coverage of every accepted requirement in every phase — derived, it fills itself as requirements are accepted,
  and it is what the process dashboard measures progress against. It does not say in which order the system is built.
  The implementation plan does: it assembles the system from the architecture, bottom-up, the way the V-model integrates
  on the way up what it decomposed on the way down (book ch. 6, "whenever you define something on the way down, you
  should already know how you will check it on the way back up"). Its levels are the SPEC's test levels: unit tests for a
  module, component tests for a subsystem, system and release tests for the system. How the plan orders the steps and
  which tests each step names are two requirements, so that each can be decided and checked on its own.
- A backlog item named the requirements and use cases it realises, but not where in the system its work lies; an
  implementation job, however, changes only the modules it was given (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
  Agile work, too, starts from the architecture: developers "still need to know where the system runs, which interfaces
  exist, and how the solution can be extended later" (book ch. 7).

**Impact list.** Five new requirements; no artifact names them yet. UC-024 (rewritten as "Implement the architecture"),
UC-032, UC-033, UC-034, UC-043 and the new UC-045 "Plan the implementation" name them in the same push, open for review;
UC-023 and UC-035 are adjusted to them. They can be accepted once this queue is.
