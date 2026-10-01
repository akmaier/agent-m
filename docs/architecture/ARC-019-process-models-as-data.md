---
id: ARC-019
title: Process model definitions are Markdown data files — tables for phases, transitions, verification pairs, gates and roles — validated before use, from which the workflow is derived
forced_by:
  - THE CATALOGUE IS DATA
  - AGENT M CARRIES THE BOOK'S CATALOGUE
  - THE MODEL DETERMINES THE PHASES AND THE GATES
  - A PROCESS REQUIREMENT ADDS TO THE MODEL
  - A PROCESS MODEL ORGANISES PEOPLE AND AGENTS
  - A PRACTICE IS NOT A MODEL
  - A GATE NAMES WHAT IT CHECKS
  - A GATE NAMES WHO DECIDES IT
  - A ROLE NAMES THE CAPABILITIES IT NEEDS
  - A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED
  - A PLAN COVERS THE WHOLE SPECIFICATION
  - PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
  - A PRODUCT DECLARES ITS DEFINITION OF DONE
  - A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY
  - ARTIFACTS ARE MARKDOWN
  - UC-002
  - UC-031
---
# ARC-019 Process models as data

## Context

The book's five process models and its practices ship with Agent M; readers add their own
(`THE CATALOGUE IS DATA`): "adding one requires no change to Agent M's implementation". A definition
names its kind of work (planned or pulled), phases, transitions, verification pairs, gates (what
they check, who decides), roles (person, agent or either; capabilities), flow control and progress
measure (UC-031). It must be validated before a product can declare it. A product declares one model,
its role assignment, practices, branches and its Definition of Done in its own repository
(`A PRODUCT DECLARES ITS DEFINITION OF DONE`, `A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY`).

## Decision

1. **Format.** One Markdown file per model: shipped ones in Agent M's `docs/assets/process-models/`,
   an instance's own in `docs/process-models/<name>.md` of the instance (UC-031). Front matter:
   `name`, `kind` (`planned` | `pulled`), `adapted_from`, `measure`. Body: one table per part under
   fixed headings — `## Phases` (name, role, produces), `## Transitions` (from, to, kind: sequence,
   alternative, back), `## Verification pairs`, `## Gates` (between, artifacts, condition, decider),
   `## Roles` (name, filled by, capabilities), `## Flow control` (time box or WIP limit, and whether the
   work runs in sprints — a sprint lasts the time box, or, without one, ends when its selection is done or
   the role that plans it ends it). Readable
   without Agent M; parseable without a library (the same table reading the core already does for
   queue indexes).
2. **Validation** (`MOD-process-model.validateModel`) returns every error beside the field that causes
   it, with the checks UC-031 step 4 lists and `A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED`
   names; each shipped model must pass, and a test holds one broken definition per rule.
3. **Workflow derivation.** `deriveWorkflow(model, practices, processRequirements)` gives the
   product's phases, gates and roles, with the gates and artifacts added by accepted process
   requirements marked with their requirement and source; a practice adds, never replaces. For a
   planned model, the plan (`MOD-work-items.derivePlan`) has one entry per accepted requirement per
   phase.
4. **The product's declaration** is `docs/process.md` in the product repository: the model by name and
   version (the instance commit of its file), the role assignment by participant name, practices,
   branches per phase or time box, and the Definition of Done — the default job rules plus the
   product's own conditions. An agent's retrospective may propose a change to this file as an open
   artifact; it never commits one (`AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF`).
5. **Participants** are read from the instance's `docs/participants.md` (UC-017), one table row per
   participant: name, type, capabilities, processing place, and the route details (never a key).

## Alternatives

- **Models as code (one module per model)** — rejected by `THE CATALOGUE IS DATA`.
- **YAML or JSON files** — rejected: a parser library for YAML, or a format a reader does not review as
  a document; Markdown tables are both data and readable (`ARTIFACTS ARE MARKDOWN`).
- **A BPMN or state-machine notation** — rejected: more than the five models need, and not what the
  book teaches; a live Mermaid diagram is drawn from the tables instead (UC-031 step 2).

## Consequences

- A product keeps the model version it declared until its author saves the declaration again
  (UC-031 6a), so a model file change never changes a running product silently.
- The Definition of Done is data the CI check reads (ARC-015); a product's own condition must be one the
  check can evaluate (a named CI check, a gate record) or it is shown as *checked by a person*.
- Table parsing is strict: a malformed row is a validation error, not a guess.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit b09cb03fbe9a8f311d75626fb2629a48968bfade — queue 2026-10-01e: a pulled model may run in sprints without a time box; open until accepted.*
