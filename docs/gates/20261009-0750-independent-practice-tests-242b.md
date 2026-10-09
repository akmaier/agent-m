---
gate: Release testing → Sprint review
job: JOB-20261009-0731-p281r
decider: po-sol
role: Product Owner
decision: passed
on: 964b6c1b1ad50b3bab739ba0aa4ba22745c963cb
date: 2026-10-09 07:50 UTC
---

# Independent corrected practice workflow release tests — PR242

**MEASUREMENT**

Decision: **APPROVED** solely at964b6c1b1ad50b3bab739ba0aa4ba22745c963cb into
sprint/16. Participant: po-sol; model: gpt-6.1-sol. Same ongoing
JOB-20261009-0731-p281r; actual review continuation:2026-10-09 07:48:59 UTC.
PR:https://github.com/akmaier/agent-m/pull/242. This individual ITM-281 PR decision
does not complete the whole selected-item Release testing → Sprint review gate.
The prior rejection242a remains immutable, published at e7448e5, blob
8dc6a66aeda85d520f254b38ae5804129ce31dff; its demonstrated boundary gap is corrected
at this separately checked head.

## Original requirements, scope and independence

The original personal full readings recorded in242a remain valid: AGENTS blob
7e8f20ca35cd48a5250d143b07a469d46986f123; SPEC
1de56e76de63bfe5f3f4bb98820adad801041def; Team2 process
eb772d456a24c145fe3f98778509f207e34e172d; participants
aba8b680f7df66e2807701294c960a3c29fb0148; scrum-wip pinned commit
ef33e2f501289930960f13b55936e9b557003993. Original jobs, ITM-281, Sprint16, source
acceptance239b, UC-002, affected three MODs and existing same-requirement/module
guards were read personally. The entire corrected test, actual delta, ordinary
commit, live PR body and full current CI were read for this decision.

JOB-20261009-0704-c281r explicitly assigns bare-table boundaries alongside explicit
additions, artifact explanation stripping, live selection/deselection, provenance
and Save. SPEC §12 says “A new test is accepted only with a recorded counter-proof”
and requires release authorship by another participant than the behaviour's
implementer. UC-002's offered workflow follows from model, practices and process
requirements “and from nothing else”. No new requirement, raw-log retention rule,
counter-proof quota or first-red implementation obligation is imposed.

The ordinary author commit adds only the194-line new release file, blob
012f60385c4c0bffebf8828d15a75160d576d77f, with unreleased/developer-terra-c/
gpt-5.6-terra trailers. Relative to the rejected case, the delta is15 additions and
two removals, confined to this test: an exact five-phase collection, explicit
expected boundary behaviour and the actual boundary counter-proof record. Useful
phase/artifact, practice-gate attribution, role, requirement/source, prose,
deselection and final-declaration assertions remain. Existing independent generic
UC-002 coverage retains model gates and zero/one repository writes separately.
The new case keeps its one Save action. No duplicate generic adapter tests.

D implemented the new practice transformations (9c939f2/038eba3/ac65c6e). C and its
predecessor did not implement them. C's predecessor did author the unchanged
generic dashboard adapter (213864d/08ab81d), so this approval makes no independent
whole-adapter claim. The executed file contains **one newly authored release case
plus two imported existing DOM component cases**, not three new cases.

## Failure-node verification of the correction

The working public caller was read before probes. Exact-head disposable archive:
/private/tmp/po-sol-281b-exact. Command: node --test
tests/release-sprint-16-practice-workflow.test.mjs. Independent known positive:
three pass,zero fail,exit0. The test:179 → choosePractice:182 → routes.process(app)
→ process.mjs:199 live declaration reread → :254–257 selected practice/workflowOf
→ workflow.mjs:40–45 additionsTable → :90–91 phase mapping → process.mjs:265–266
displayed phase list → expectedPracticeWorkflow:155–162 exact displayed collection.

Independent repetition of the previously diagnosed production fault changed only
workflow.mjs:41 from break to continue at a non-table line. The public call then
renders the five intended phases plus Name (Filled by) → Capabilities,
--- (---) → --- and Evidence keeper (either) → read the repository. The corrected
case fails at test:156 deepStrictEqual, with actual eight entries versus expected
five; exit1,one new-case failure,two old-case passes. This directly verifies the
fix at the formerly permissive failure node. Restoring the source byte-for-byte
returns three pass,zero fail,exit0. No source/test mutation is committed.

Restored workflow source blob2bd49976711ab6c574ba9a4e8b3fae7ab329e06c and route
bloba889cdf5d966be0e7e979d95466ed5ecb3d46d40 match this head. The earlier valid
kindOf fault (explanation stripping removed → TST (review evidence) retained)
remains recorded; the current exact phase collection also observes the stripped
TST value. The author accurately records both meaningful faults/restorations.
Independent logs:/private/tmp/po-sol-281b-positive.log,
/private/tmp/po-sol-281b-boundary.log,/private/tmp/po-sol-281b-restored.log.

## Live full CI and disposition

Live PR OPEN,base sprint/16,head964b6c1b1ad50b3bab739ba0aa4ba22745c963cb. Full
CI37900968209 completed at this exact head: both node and python SUCCESS. Complete
7002-line log personally retrieved/inspected at /private/tmp/po-sol-281b-ci.log.
Node1016 total,1008 pass,zero fail/skip/cancelled,eight existing TODO; all eight
not-ok entries are the historical TODO findings. Python399 run,OK with five skips
and six expected failures. Node41s,Python40s,within the declared two-minute budget.
The PR body's three passing focused cases and broader local command are accurately
distinct from this full CI schedule.

Approve this exact unchanged green independent test head. Accepted source239b,
original rejection242a, declarations, selections, SPEC, use cases and architecture
are unchanged. The whole selected-item gate follows after all selected coverage;
no Sprint16 closure or native Electron validation is claimed. limit3 remains the
automatic draft/check parameter; this manual same-job Scrum review is not an
automatic round. Root publishes/comments/merges. Reviewer writes only this new
immutable gate and prepares a local decision body, with no external write.
