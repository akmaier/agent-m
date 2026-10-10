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
  - MOD-documents
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

Deliver the necessary MOD-documents path-pattern finding first, in a separate Documents-only job: for the already
loaded string pattern or list of string patterns, documentFindings reports a document path that matches none, through
its existing Finding interface with the schema's rule. An absent path specification adds no constraint. Use the existing
compiled pattern language; do not add a placeholder, regular-expression format, path condition, identifier-against-path
check, object pattern rule, parser or public API. This prerequisite is part of selected297; it starts no fifth item.

After that producer's approved source delivery, a fresh Workplans-only job completes exactly MOD-work-plans' accepted
public planSchemas with planOrder and sprint, alongside the delivered backlogOrder. Keep each new format in its own data file in src/work-plans/, interpreted through MOD-documents'
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
unchanged. No caller, artifact schema, strategy or network operation is authored here. Each generation job changes one
of the two named modules: Documents for the prerequisite, then Workplans for the schemas; neither job takes over the other module.

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
- The prerequisite job changes only src/documents/ and tests naming the actually exercised MOD-documents. Its
  [bounded compatibility assignment](../measurements/2026-10-10-sprint19-documents297-fixture-compatibility.md) also permits
  the three demonstrated practice-path inputs and the explicit valid record path in TST-292017, with necessary truthful
  module declarations; all existing workflow, gate and round-trip expectations remain. Known-valid paths precede a
  nonmatching folder or extension; string patterns, alternative patterns and an absent pattern retain their accepted
  meanings. Its error names the path/artifact, line 1 and the schema rule through the existing Finding interface.
  Existing field, date, table, section, reading/writing and append guards retain their expected results.
- The later schema job changes only src/work-plans/ and new tests naming MOD-work-plans. A valid 19.md precedes a
  nonmatching folder or extension. The accepted {nnn} means three or more digits; {any} admits one segment. Do not require
  x.md rejection under {any}, invent {nn}, bake in today's sprint number, or claim filename-number validation that the
  accepted language cannot express. Malformed date and identifier findings remain required.
- B's existing Workplans-only job cannot write Documents source. Root records its actual failed End for the missing
  prerequisite, preserves both unpublished tests-only commits, then publishes a fresh Documents-only Start and isolation.
  After approved prerequisite source delivery and actual prior End, root publishes a fresh Workplans-only Start.
  Each job receives its own tests-only product-red CI before source; no existing guard is weakened.
- The first implementation commit contains only tests, with its actual product-red CI read before source writing.
  Final canonical numeric declarations, relevant guarded-code fault/SAME-case failure/exact restoration/SAME-case pass,
  complete exact-head Ubuntu CI within each job's 120-second bound and independent source/Release gates follow the
  declared process. No extra per-assertion fault quota or duplicate whole-UC002 test item is added.
