---
id: ITM-779
title: A process model is adapted or created, validated while typed, and saved
level: module
realises:
  - UC-031
  - A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED
  - A PLAN COVERS THE WHOLE SPECIFICATION
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
  - DIAGRAMS ARE MERMAID IN MARKDOWN
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-778
  - ITM-793
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-779 A process model is adapted or created, validated while typed, and saved

**REGISTER**

## Outcome

UC-031 steps 2 to 6, 2a, 4a, 5a and 6b, as the route `models/<name>` of MOD-implementation-pages' file states it:
- *Adapt* opens a copy under a new name with `adapted_from` set; *+ New model* opens an empty form that first asks for
  the kind of work;
- a form from `modelSchema.model` through `schemaForm`, with `modelFindings` beside their fields while typing, and
  the live diagram of `modelDiagram` through `renderMermaid`;
- for a planned model, the preview of `planGrid` for a product the author picks, its accepted requirements from
  `productFacts` (ITM-793), with the count; a product with none shows the phases empty (5a);
- *Save* only without an error, writing `docs/process-models/<name>.md` of the instance with `saveFile` as the
  person's own commit; a file changed since the editor opened it is not written, and both versions are shown with
  `showDifference` (6b).

**Reading.** UC-031 4a lets the author "keep it in this browser to finish later". The module's Uses name no write to the
browser's store (only `readSetting`), so this item offers *Discard* and keeps the draft only on the screen. Keeping it
in the browser is a gap of the architecture, named in the report.

## Acceptance

- An invalid definition is never saved: *Save* is unavailable while a finding is an error.
- A saved model is a file of the model schema that `catalogue` reads back without findings, naming the model it was
  adapted from.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
