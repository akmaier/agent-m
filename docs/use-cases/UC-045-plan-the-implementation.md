---
id: UC-045
title: Plan the implementation
area: 5 implementation
actors:
  - Planner
  - Drafting participant
  - Product repository
realises:
  - A PLANNED MODEL IMPLEMENTS ITS IMPLEMENTATION PLAN
  - AN IMPLEMENTATION PLAN ASSEMBLES THE SYSTEM FROM ITS MODULES
  - A PLAN STEP NAMES THE TESTS OF ITS LEVEL
  - THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY
  - THE PROCESS MODEL IS DECLARED PER PRODUCT
  - THE MODEL DETERMINES THE PHASES AND THE GATES
  - EVERY TEST HAS ONE LEVEL
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - A RUN FOLLOWS THE MODULES' INTERFACES
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - EVERY ARTIFACT HAS AN IDENTIFIER
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - A GENERATED ARTIFACT IS A PROPOSAL
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
  - DIAGRAMS ARE MERMAID IN MARKDOWN
  - THE PAGE STATES WHAT IT SENDS WHERE
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
---
# UC-045 Plan the implementation

**Goal.** In a product whose model plans its work in advance — V-model, waterfall, reuse-oriented —, the planner decides
how the accepted architecture is assembled into software, before any of it is implemented: the modules of each subsystem
in the order of the interfaces they use, then the integration of each subsystem, then the system, each step with the
tests of its level. It is the V-model's idea that "whenever you define something on the way down, you should already know
how you will check it on the way back up" (book ch. 6): what the architecture decomposed, the plan integrates again.
Implementation then follows the plan (UC-024). In Scrum and Kanban the backlog takes this place (UC-032).

| A step for | It implements or integrates | Its tests |
|---|---|---|
| a module | the module, as its file describes it | unit tests |
| a subsystem | the subsystem's modules, as its decision describes their interplay | component tests |
| the system | the subsystems, as the decision that states the system describes it | system tests, and the release tests of the use cases, written by a participant other than the implementer |

In the reuse-oriented model, a module whose decision adopts a library or a service is configured or adapted in its step
rather than developed (book ch. 6: configure, adapt or develop); the discovery and evaluation of the candidates took place
in the architecture's due diligence (UC-022, step 7).

## Actors

- **Planner** — the person or agent the product assigned to the role that plans the work in its model (UC-002).
- **Drafting participant** — a model endpoint or agent from the instance's list that can *draft text* (UC-017); it
  drafts the plan from the architecture.
- **Product repository** — holds the architecture and receives the plan.

## Precondition

- The product declares a model that plans its work in advance, with a holder of the role that plans (UC-002).
- The architecture is accepted (UC-022, UC-023).

## Main flow

1. The planner opens **Plan** for the product. Agent M shows the accepted architecture — the system, its subsystems and
   their modules — and, if a plan exists, its steps in their order, each with its derived state: *waiting* for a step it
   depends on, *ready*, *in progress*, *done*. A folded **What is this?** explains the plan with the table above and points
   to book ch. 6.
2. The planner chooses **Draft the plan**. The run panel names the drafting participant, where it processes data, and
   what is sent: the decision that states the system, the subsystems' decisions, the module files, the process model with
   its phases and gates, and the existing plan. The planner presses **Run** — that click is the decision.
3. The participant drafts the plan from the bottom up:
   1. for each subsystem, one step per module, a module after every module whose interface it uses, each with its unit
      tests;
   2. then one step for the subsystem's integration, with its component tests;
   3. then one step for the system, with its system tests and the release tests of the use cases;
   4. for each step, the phase of the model it belongs to; the model's gates stand between the phases.

   Agent M checks the complete draft: a module, a subsystem or the system without a step, a module ordered before one
   whose interface it uses, or a step without the tests of its level, goes back to the participant as a finding, as any
   check of a draft does.
4. The planner reviews the plan in its order, beside the architecture, with a Mermaid diagram of the steps and what each
   waits for. The planner may reorder steps where their dependencies allow it, split or merge steps, and edit them.
5. The planner presses **Save plan** — one click. Agent M commits one Markdown file per step under `docs/plan/` — each an
   item `ITM-<nnn>-<slug>.md`, naming what it implements or integrates and the tests of its level — and the order of the
   steps in `docs/plan/order.md`. From now on, implementation jobs start only for steps of the plan (UC-024).

```mermaid
sequenceDiagram
    actor N as Planner
    participant M as Agent M
    participant E as Drafting participant
    participant G as Product repository
    N->>M: Plan
    M->>G: read process model, architecture, existing plan
    M-->>N: system, subsystems, modules; the plan with derived states
    N->>M: Draft the plan, Run
    M->>E: architecture, process model, existing plan
    E-->>M: steps: modules, subsystems' integration, system, with their tests
    M->>M: check the complete draft
    N->>M: reorder, edit, Save plan
    M->>G: commit one file per step and the order under docs/plan/
```

## Alternative flows

- **1a. The product's model works from a backlog (Scrum, Kanban).** There is no implementation plan; Agent M links to the
  backlog (UC-032).
- **1b. The architecture is not accepted.** Agent M names what is open and links to UC-022 or UC-023; nothing is planned.
- **1c. The architecture changes after the plan was saved (UC-023).** The steps of changed, added or removed modules and
  subsystems are marked; the planner drafts the plan again or edits it. Nothing changes until the planner saves.
- **1d. The planner is an agent.** It drafts and saves the plan through its own runtime and commits it under its name; a
  change to the architecture or to the process it finds needed, it proposes to a person.
- **2a. The planner writes the plan by hand.** They add steps with **+ Step**, each naming what it implements or
  integrates; the check of step 3 runs when they press **Save plan**, and the plan is committed as their own input.
- **2b. The input does not fit into the participant's context.** Nothing is sent; Agent M says what does not fit and
  offers a participant with a larger context.
- **3a. The modules' interfaces form a cycle.** No order exists; Agent M names the modules of the cycle and links to
  UC-023 to change the architecture.
- **3b. Findings are left after the last round.** The draft is shown with each finding left; the planner corrects it in
  step 4 or drafts again.

## Postcondition

- The product repository holds the plan under `docs/plan/`: one file per step and their order; every module, every
  subsystem and the system has its step with the tests of its level.
- No state is stored in the plan; whether a step is waiting, ready, in progress or done is derived from the job records
  and pull requests.
