---
id: ITM-1096
title: MOD-progress-measures, MOD-trace-pages, MOD-workflow-entries and the participants page take the workflow from productWorkflow
level: module
realises:
  - UC-031
modules:
  - MOD-product-process
  - MOD-progress-measures
  - MOD-trace-pages
  - MOD-workflow-entries
  - MOD-settings-pages
builds_on:
  - ITM-1100
tests:
  - unit
origin:
  - the review of the draft `3baeb13a` (architecture-reviewer-opus-b), on main at 3baeb13a
---
# ITM-1096 MOD-progress-measures, MOD-trace-pages, MOD-workflow-entries and the participants page take the workflow from productWorkflow

**REGISTER**

## Outcome

The draft `3baeb13a` gives MOD-product-process `productWorkflow`: a product's workflow from the version of the process model
it declared. Four places still compose it themselves with `workflowOf`:
- MOD-progress-measures.md:17, :280;
- MOD-trace-pages.md:50, :165;
- MOD-workflow-entries.md:45, :257;
- `src/settings-pages/participants.mjs:298`.
The code copies already differ: `src/progress-measures/facts.mjs:74-82` reads the catalogue at `model_version`, and
`participants.mjs:298` reads the current instance. MOD-implementation-pages composes the workflow of each version side by
side on purpose (MOD-implementation-pages.md:147), and stays as it is.

## Not ready: a draft for akmaier

Once `3baeb13a` is accepted, a draft moves the three module texts' uses from `workflowOf` to `productWorkflow`. Then their
code, and the participants page's, follow.

## Acceptance

- Written once that draft is accepted: each of the four places takes the workflow from `productWorkflow`, and a test
  shows the participants page reading the catalogue at `model_version`.
