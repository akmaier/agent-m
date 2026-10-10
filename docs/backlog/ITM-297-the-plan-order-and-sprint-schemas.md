---
id: ITM-297
title: The implementation-plan order and sprint record schemas
level: module
realises:
  - UC-002
  - UC-032
  - UC-045
  - THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY
  - THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
modules:
  - MOD-work-plans
builds_on:
  - ITM-209
tests:
  - unit
origin:
  - UC-002 postcondition
  - UC-032 steps 6 and 6a
  - UC-045 step 5
---
# ITM-297 The implementation-plan order and sprint record schemas

**REGISTER**

## Outcome

Complete exactly MOD-work-plans' accepted public planSchemas with planOrder and sprint, alongside the delivered
backlogOrder. Keep each new format in its own data file in src/work-plans/, interpreted through MOD-documents'
existing public loadSchema/readDocument/writeDocument/documentFindings/appendSection interfaces. Read the working
backlog-order loader and guards first; retain its disk-in-Node and own-file-in-browser loading boundary.

planOrder reads docs/plan/order.md's ordered Step/Phase table, naming each step's identifier and its model phase.
sprint reads docs/backlog/sprints/<nn>.md's sprint, goal, start, end, closer, branch and selection, with no persisted
item/job state. It admits the accepted appended Selection, Ended, Review, Unfinished items and Retrospective sections,
including successive Selection decisions. Preserve their text, feedback destinations, participants and feedback
sources, unfinished-item decisions and retrospective entries; do not invent another record format.

These schemas are necessary lower-layer inputs for UC002's continuation into a plan or backlog and for the later
pages/forms and saves. They do not themselves save a plan, start a sprint, derive states, enforce dependencies/gates,
run jobs or deliver either whole UC032/045 postcondition. Existing backlogOrder and ITM295 itemStates/startable stay
unchanged. No caller, parser, artifact schema, strategy, network operation or other module is authored here.

## Acceptance

- Public unit cases read the two accepted formats through planSchemas and MOD-documents. A plan order preserves
  ordered Step/Phase rows; a sprint preserves every front-matter value, selected items and accepted appended sections.
  Valid records precede malformed-value/identifier/path cases, whose findings name the actual format/rule and line.
- Canonical read/write round trips preserve the accepted contents; appending an allowed section retains every earlier
  byte, repeated Selection remains readable, and no state field is introduced. Do not turn this into new dependency,
  model-phase or human-acceptance validation outside the schema's responsibility.
- Both schemas load from their owned data files in Node and in the browser's existing own-file pattern. Broken/unserved
  schema data stops the module as the accepted loadSchema contract states. Existing backlog-order and state/startability
  cases retain their expectations; no fixed current backlog/sprint selection is baked into a test.
- Only src/work-plans/ and new tests naming MOD-work-plans change. If an actual missing prerequisite is demonstrated,
  return its concrete caller/data-flow path before touching an unowned module or changing an accepted contract.
- The first implementation commit contains only tests, with its actual product-red CI read before source writing.
  Final canonical numeric declarations, relevant guarded-code fault/SAME-case failure/exact restoration/SAME-case pass,
  complete exact-head Ubuntu CI within each job's 120-second bound and independent source/Release gates follow the
  declared process. No extra per-assertion fault quota or duplicate whole-UC002 test item is added.
