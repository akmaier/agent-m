---
gate: Development → Release testing
job: JOB-20261009-0536-p281
decider: po-sol
role: Product Owner
model: gpt-6.1-sol
decision: rejected
on:
  - 038eba3d929524b4d967e7cd9859a2b434a3728b
  - https://github.com/akmaier/agent-m/pull/239
date: 2026-10-09 05:41:42 UTC
---
# Development → Release testing: ITM-281

**MEASUREMENT**

Actual Taken: 2026-10-09 05:37:39 UTC. Reject the exact named head for the two demonstrated original-contract defects
below. po-sol/gpt-6.1-sol authored none of the source or tests. Root alone publishes/merges; no merge is approved.
External PR decision publication remains pending human authorization; a decision body is prepared locally only.

## Reason

Original ITM-281 requires explicit practice additions in the existing model-table format. MOD-model-catalogue Data
(lines60/71–73) permits tables under ## Adds without additional headings and permits a Produces kind followed by an
explanation in parentheses. Its Model contract (:84) carries kinds without their explanations. UC-002's postcondition
and MOD-product-process.workflowOf derive the workflow only from the model, practices and process requirements.

Two independent public-path diagnostics used the exact-head archive /private/tmp/po-sol-281-038eba3, after known
positives. Run `node accepted-table-probe.mjs` there; complete controlled inputs/output are retained in that diagnostic
script and /private/tmp/po-sol-281-accepted-table-probe.log. Every tested practice has zero documentFindings with the
public modelSchema.practice. No production or repository test bytes were changed.

1. **Artifact explanations become artifact kinds.** Public catalogue → readDocument(modelSchema.practice) →
   workflowOf → src/product-process/workflow.mjs:84–85 splits/trims Produces but keeps its explanation. Known positive
   `TST` returns produces=["TST"]. Equally accepted `TST (evidence from the review)` returns
   ["TST (evidence from the review)"]; expected ["TST"]. The existing model reader's public behavior is implemented by
   src/model-catalogue/index.mjs:100–103 kindOf. Practice additions must retain that accepted meaning.
2. **A later table becomes extra phases.** Same public path → additionsTable at workflow.mjs:35–39 finds the Phases
   signature, then scans every later pipe row by column count rather than stopping at that table. Known positive
   Phases/ Roles tables under their optional ### headings return one Evidence review phase and one Evidence keeper role.
   The same accepted tables directly under ## Adds return four added phases: Evidence review, Name, ---, Evidence keeper.
   The last three are the Roles header, delimiter and role row misread as phases; expected only Evidence review.
   This is table-boundary corruption, not a requirement for an invented heading or new practice format.

Correct these two transformations within the owned module and guard the actual accepted inputs. No SPEC/use-case/
architecture/schema change or new public interface is necessary.

## Closed acceptance and evidence

Read original AGENTS/SPEC and verified unchanged personally completed whole-project pins, UC-002, the full accepted
product-process/model-catalogue/implementation-pages contracts, actual source/callers, current item/Sprint16/jobs and
all changed tests. Repaired truncated reads. The exact PR changes only two owned source files and three owned-module
test files; existing assertions remain intact and fixture defaults preserve old behavior. Its four new cases are
explicit tabled workflow, bare gate table, selected declaration route, and one live form selection/deselection/Save.
Writing commits3eb9955/9c939f2/038eba3 retain unreleased/developer-terra-d/gpt-5.6-terra provenance.

Independent relevant suites: **35 PASS, 0 failures/skips**, /private/tmp/po-sol-281-positive.log. Model/requirement gate
attribution, unselected/prose-only behavior, public Snapshot practice reads, live editor select/deselect before Save,
zero premature writes and one docs/process.md Save pass those guards. Four author executed counter-proofs/restorations
are retained: empty practice input at direct workflow/selected route, heading-only extraction for the bare gate case,
and opening-declaration inputs for the live form. The latter fail at the intended missing gate/panel assertions and
restore PASS; no raw-log retention format or duplicate proof obligation is imposed.

The first commit3eb9955c524edb2dbcba1e89eb1a8b9aa82aaab4 contains only tests; actual CI37887913468 is red on it:
the expected Evidence review phase is absent, with Sprint Retrospective actual. Final clean READY head and full CI
37889200983 were independently read: both SUCCESS, Node1001 tests/993 pass/0 fail/8 historical TODO, Python399 run
OK with5 skips and6 expected failures,39/62-second jobs. Logs: /private/tmp/po-sol-281-red.log and -ci.log.
Green CI does not resolve the two additional accepted-input failures above.

The original automatic loop parameter remains3; manual source edits and Scrum decisions are not those automatic
draft/check rounds. Independent integrated system/release coverage still follows source acceptance; no whole UC-002
completion, architecture acceptance or Sprint closure is claimed.
