---
gate: Release testing → Sprint review
job: JOB-20261009-0731-p281r
decider: po-sol
role: Product Owner
decision: rejected
on: 758c5cb9ff6079d0bed5fc4b73074d167069d7f3
date: 2026-10-09 07:38 UTC
---

# Independent practice workflow release tests — PR242

**MEASUREMENT**

Decision: **REJECTED**, solely for PR242 at unchanged head
758c5cb9ff6079d0bed5fc4b73074d167069d7f3 into sprint/16. This is an individual
ITM-281 test PR decision; the whole selected-item Release testing → Sprint review
gate remains later. Participant: po-sol; model: gpt-6.1-sol. Actual Taken:
2026-10-09 07:31:48 UTC. PR: https://github.com/akmaier/agent-m/pull/242.

## Reason

The writing job JOB-20261009-0704-c281r, Destinations and Parameters.scope,
explicitly assigns “Guard explicit table additions, artifact explanation stripping
and bare-table boundaries”. The new case's own expected result at
tests/release-sprint-16-practice-workflow.test.mjs:164–165 states that its three
bare tables add only their phase/gate/role. It verifies the expected additions'
presence but does not detect other tables being consumed as phase rows. An actual
boundary fault adds three inappropriate phases, yet this same new case passes.
The assigned boundary coverage is therefore missing.

This concerns the accepted ITM-281 transformation: UC-002 Postcondition says the
offered workflow follows from model, practices and process requirements “and from
nothing else”; MOD-product-process's workflowOf interface describes the explicit
practice model tables. SPEC §12 requires a readable expected result and recorded
meaningful counter-proof. The existing counter-proof satisfies that requirement;
this rejection is the explicitly assigned boundary coverage gap, not a demand for
a separate mutation of every assertion or a new log-retention obligation.

## Original inputs, independence and scope

Personally read original AGENTS.md and full SPEC.md, full README, Team2 process and
participants, original pinned scrum-wip and current Sprint16, both jobs, ITM-281,
approved source gate239b, UC-002, MOD-product-process, MOD-model-catalogue and
MOD-implementation-pages, plus existing guards of these modules/use case. Original
blobs: AGENTS 7e8f20ca35cd48a5250d143b07a469d46986f123; SPEC
1de56e76de63bfe5f3f4bb98820adad801041def; Team2 process
eb772d456a24c145fe3f98778509f207e34e172d; participants
aba8b680f7df66e2807701294c960a3c29fb0148. Scrum-wip is pinned at commit
ef33e2f501289930960f13b55936e9b557003993; current blob
72fdea87d0c468ffcd53ae3a6d564623c686e22d.

SPEC §12 says “A new test is accepted only with a recorded counter-proof” and
requires release authorship by another participant than the behaviour's
implementer. The single ordinary writing commit adds only the 181-line release
test, blob 5e23f958608e6d0e2aec3ce577e3acb152e90f61, with unreleased,
developer-terra-c and gpt-5.6-terra provenance. D authored the new transformations
in 9c939f2, 038eba3 and ac65c6e. C's predecessor authored the unchanged generic
dashboard adapter in 213864d/08ab81d; this review makes no independent whole-adapter
claim. Existing independent generic UC-002 system/release guards retain their own
evidence. The new file imports two existing DOM component cases, so its three
executed cases mean **one new release case plus two old cases**.

The public process caller and existing harness were read before probing. The new
case connects real repository hosts through routes.process(app), supplies an
existing Scrum declaration, requirement gate and selected DevOps document with
three bare tables, selects/deselects live and saves the final declaration. Its
assertions detect the added phase and stripped artifact, practice gate attribution,
role fields, requirement/source attribution, surrounding prose exclusion and
deselection. Its Save assertion observes the final declaration; existing generic
guards separately observe zero/one writes and retained model gates. Those existing
guards do not supply the missing independent observation of this new bare-table
transformation. No duplicate generic adapter tests are requested.

## Actual call path and failure-node verification

Exact-head disposable archive: /private/tmp/po-sol-281-release-exact. Known-positive
command: node --test tests/release-sprint-16-practice-workflow.test.mjs. Actual
result: three pass, zero fail. The new case's path is test:166 → choosePractice:169
→ public routes.process(app) → src/implementation-pages/process.mjs:199 rereads the
live declaration → renderPanels:254–257 selects its practice documents and calls
workflowOf → src/product-process/workflow.mjs:84 additionsOf → additionsTable:40–45
reads the table body → phase mapper:90–91 → process.mjs:265–266 renders every phase.

Independent repeat of the recorded actual fault at workflow.mjs:26 changed
produced.replace(EXPLAINED, "").trim() to produced.trim(). The added phase then
retains TST (review evidence) instead of TST; expectedPracticeWorkflow:151 fails
with actual false versus expected true. Exit1, one failed new case and two passing
old cases. Restoring exact source gives three pass, zero fail. This independently
confirms the writer's meaningful recorded counter-proof.

For the assigned bare-table boundary, changed only workflow.mjs:41 from break to
continue when encountering a non-table line. This restores an unbounded table
scan. Known-positive observation at the actual workflow result first showed four
model phases plus only Evidence review while selected. With the fault, the same
public call yields eight phases: the same five plus the Roles header, delimiter
and role row interpreted as phases:

| Unexpected phase | Role | Produces |
|---|---|---|
| Name | Filled by | Capabilities |
| --- | --- | --- |
| Evidence keeper | either | read the repository |

The gate table's four-column rows are filtered, while these three-column Roles
rows pass workflow.mjs:44 and become phases at :91. They reach the displayed phase
list at process.mjs:266. The unchanged release test still passes all three cases,
exit0: expectedPracticeWorkflow:151 checks some matching entry, :155 checks the
expected role exists, and :172 excludes only the literal surrounding explanation.
None excludes those observed cross-table phases. Separate diagnostic observation
at workflow result, selected by the new test's name, also passes the one new case
with five phases positively and eight under the fault. This is an observed false
negative at the required boundary, after a known positive, not an inferred absence.

All diagnostic instrumentation and source faults were disposable and restored
byte-exactly. Restored workflow source blob
2bd49976711ab6c574ba9a4e8b3fae7ab329e06c and implementation route blob
a889cdf5d966be0e7e979d95466ed5ecb3d46d40 equal the checked head. No source fault
belongs to the author checkout or this gate commit. Restored new release plus
existing UC-002 system and Sprint06 release suites: 45 pass, zero fail, skip or
TODO. Local logs are /private/tmp/po-sol-281-release-kind.log,
/private/tmp/po-sol-281-release-boundary.log,
/private/tmp/po-sol-281-release-workflow-positive.log,
/private/tmp/po-sol-281-release-workflow-boundary.log and
/private/tmp/po-sol-281-release-focused.log; the measured failure/results above
remain the recorded evidence.

## Full CI and disposition

Live PR head and complete CI37899063857 logs were independently read at this exact
head: both jobs completed SUCCESS. Node1015 total,1007 pass,zero fail/skip/cancelled,
eight existing TODO; Python399 run,OK with five skips and six expected failures.
Jobs took53s and63s, within the declared two-minute budget. Complete retrieved log:
/private/tmp/po-sol-281-release-ci.log. Green CI does not catch the observed missing
boundary assertion.

Correct the new release case through the same public caller to observe that the
selected phase collection contains exactly the model phases and the intended
practice phase, without cross-table phase rows. Keep the existing useful
assertions, accepted source and generic independent coverage. Verify the known
positive and that the demonstrated unbounded scan fails this boundary expectation,
then restore exact source and review the new full-green head. No new architecture,
source/schema changes, extra generic case, raw-log retention mandate or broader
counter-proof quota is imposed.

This does not reopen source239b acceptance or establish a production defect in the
checked source. limit3 remains the automatic draft/check parameter; manual work
and Scrum reviews are not those rounds, and write-tests has no invented first-red
implementation requirement. Root publishes the exact-head rejection. Reviewer
writes only this immutable gate and a local decision body; no source/test/helper,
accepted document, job, process, participant or selection edits, external comment,
push, merge or native Electron launch.
