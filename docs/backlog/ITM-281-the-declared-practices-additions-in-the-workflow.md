---
id: ITM-281
title: The declared practices' additions in the workflow
level: module
realises:
  - UC-002
  - A PRACTICE IS NOT A MODEL
  - THE MODEL DETERMINES THE PHASES AND THE GATES
modules:
  - MOD-product-process
  - MOD-implementation-pages
builds_on:
  - ITM-215
  - ITM-218
  - ITM-222
  - ITM-240
tests:
  - unit
origin:
  - UC-002
---
# ITM-281 The declared practices' additions in the workflow

**REGISTER**

## Outcome

Implement MOD-product-process's accepted workflowOf practices input: the declared practices' Documents, read with
modelSchema.practice, add their explicit table data under ## Adds to the model's workflow. MOD-model-catalogue defines
those additions as phases, gates, roles or artifacts in the model schema's tables. Use that existing format and the
existing Workflow fields; do not invent another practice format, public interface or interpretation of free prose.
Keep model phases/gates and process-requirement additions intact; a practice never replaces the selected model.
Mark an added gate with its practice, preserving requirement/source attribution separately.

The public process route reads the selected practice documents from the same instance Snapshot as its catalogue and
passes them into workflowOf with the declaration being shown. The workflow view shows their explicit additions;
changing the selection shows the corresponding workflow. Save remains one person's commit of the declaration only.
Prose-only practice descriptions remain readable and do not manufacture unnamed phases or gates. This bounded delivery
does not claim that the shipped practices' prose has become executable workflow data, or complete other implementation
routes, model-version comparison, jobs or source-content routing.

## Acceptance

- New MOD-product-process unit cases establish the model-only positive, then an accepted practice Document with explicit
  model-table additions. Observe those additions in the public Workflow, including a practice-marked gate, alongside
  unchanged model and process-requirement gates. Unselected practices add nothing; no-practice and prose-only inputs
  preserve their existing behaviour.
- New MOD-implementation-pages unit cases exercise its public view/Route against controlled instance/product Snapshots:
  a declared or selected practice with table additions appears in the workflow; changing the selection updates that
  view; no write precedes Save and one Save writes only docs/process.md with the selected practices preserved.
- Existing UC-002 system/release and direct declaration tests remain green. The increment retains their verified main
  and alternative flows; independent system/release coverage must additionally observe the new practice-addition path
  through the working dashboard caller before whole UC-002 completion is claimed.
- Only src/product-process/, src/implementation-pages/ and new tests naming the module each exercises change. No
  catalogue schema, shipped practice data, accepted architecture, SPEC, use case, shared helper or legacy caller is
  changed by this item. If an actual caller integration is required, name it separately between jobs before editing.
- First commit contains only tests with red product CI; final-head full CI is green; each new case has an executed
  relevant planted-fault failure and exact-restored positive. The source and independent release gates retain their
  declared deciders. No paid service is called.

Selected in Sprint16 by its explicit Start decision, alongside the UC-003 chain. developer-terra-d owns the two
assigned modules; developer-terra-e reserves independent release coverage and implements none of this behaviour.
