# Between-jobs public module call — ITM-277 / PR 222

**MEASUREMENT**

Decision: **APPROVED**, 2026-10-08 07:25 UTC, po-sol / gpt-6.1-sol.
Job: JOB-20261008-0722-65ea, first caller review, fixed limit 3; no reset.
PR: https://github.com/akmaier/agent-m/pull/222, into sprint/14.
Approved head: `b9edc4d1795786a1926c151e3210d48f3828c072`.
Base: `249687d2bfe8077ffe0b0b540261201344d56466`.
Only scrum-master-session merges this unchanged exact head while live whole CI stays green.

## Original scope and attribution

Read original job, current item 277 and Sprint14, SPEC1377–1383/1395–1452, Team2 process/participants and complete
pinned scrum-wip model, complete five-file delta, current PR body/history, actual public caller and new tests.
Personally completed original AGENTS/SPEC/affected accepted module/use-case reads remain applicable; verified unchanged
AGENTS 7e8f20ca35cd48a5250d143b07a469d46986f123 and SPEC1de56e76de63bfe5f3f4bb98820adad801041def.
The current process model blob72fdea87d0c468ffcd53ae3a6d564623c686e22d exactly equals the declared ef33e2f pin.
No SPEC, use case, architecture or process acceptance is performed by this reviewer.

The two writing commits 74982bd and b9edc4d name unreleased / developer-terra-d / gpt-5.6-terra.
The intermediate ordinary merge preserves approved source inheritance and earlier review history; no rewrite.
po-sol authored no guarded source/test/helper, including predecessor authorship. This is the separate between-jobs
public call allowed by SPEC WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS, not an owned implementation job.
A new tests-only-first red obligation does not apply; original owned source gate221b remains closed.

Exactly five files differ: the legacy public-call adapter, bounded app-harness support, one new component-test file,
and the two expressly permitted old expectation deltas. There is no src/ difference, parser, architecture or shared
helper relabelling. The item/plan amendments authorizing helper reach and heading/SPEC-read expectations were published
before the author resumed; unrelated assertions remain unchanged.

## Actual public call and composition

`dashboard-app.mjs:236 loadSnapshot → :240 state.commit → context.state`
→ `spec-changes-view.mjs:19 currentRequirements → :21–22 public parseAddress/connect with instance/product tokens`
→ `:23–24 public trace Route.render({key: specification, ref: app.state.commit})`
→ inherited `src/trace-pages/flow.mjs:77 Host.readSnapshot → :78 Snapshot.read(SPEC.md) → :79 parseSpec/overview`
→ public renderer for details. No requirement computation, fake Snapshot, silent catch or cache bypass enters the asset.

`spec-changes-view.mjs:82 captured seq → :85–87 awaited module/queue reads → :90 seq check`
→ `:117 replaceChildren(requirements, history) → :118 wireAccept(history)` preserves the real module DOM and old history
controls. Queue entry route, lazy queue computation, proposal comparison, statuses, edits and acceptance implementation
are otherwise untouched. The alternative normal replaceChildren composition needs no new prepend helper method.

Controlled actual-dashboard sequence probe first confirmed the #uc heading, held the current-SHA request made by #spec,
started a newer #uc navigation, then released the held response. The final page stayed Use cases with no stale Current
requirements. This verifies the inherited sequence guard at the composition node.

## Bounded helper and expectation review

`tests/app-harness.mjs:91` now resolves main or exactly the fixture's actual current head; all other SHA requests still
reach NotFound. The new public Host test asserts same main/current-SHA SPEC bytes and unrelated f… SHA refusal.
The fixture DOM adds only composed raw-child attribute lookup and per-node control cache reset. It does not fake
public Snapshot results or change the recorded file-request classifications.

The old dashboard-shell #spec assertion now requires first h2 Current requirements and explicit overview-before-history.
The load-per-view exact initial multiset adds one SPEC.md; opening an accepted queue adds SPEC.md beside its required
proposal. It retains exact queue multiplicities, closed-queue presence/link/count, lazy proposals and applied status.
No Set or omitted unrelated check masks repeated queue reads. Before these amendments, the exact249687d baseline
passed both old cases; exact0c720c9 failed precisely the changed heading and additional SPEC-read expectations.
Those planning diagnostic originals remain in /private/tmp/po-sol-277-baseline-doaqe7pf and
/private/tmp/po-sol-277-plan-expect-xm_0ljxk. The independent opening probe there observed only SPEC.md and the required
closed-queue proposal, with applied status true.

## Independent per-case fault evidence

Disposable exact-head archive: `/private/tmp/po-sol-222-bzzanyg1`.
Command: `node --test --test-name-pattern '<case prefix>' tests/dashboard-spec-requirements-wiring.test.mjs`.
Known positives precede each planted fault; exact bytes are restored afterward.

| Case | Actual planted fault → failure node | Positive / fault / restored exit |
|---|---|---|
| ITM-277-WIRING-01 | remove current-head condition in helper:91 → real Host.readSnapshot(currentSha) → NotFound at new test:35 | 0 / 1 / 0 |
| ITM-277-WIRING-02 | remove raw-child attribute lookup in helper domFind → page.click cannot find preserved data-accept-ticked at new test:57 | 0 / 1 / 0 |
| ITM-277-WIRING-02 order proof | reverse replaceChildren arguments → actual overview/history reversal → assertion at new test:55 | 0 / 1 / 0 |

proofs.json and nine case/stage logs record the exact mutations/results. All five changed files were byte-compared
against git show b9edc4d after restoration. The restored related run (new wiring, dashboard shell, load per view,
SPEC queues and SPEC impact) passes all29 cases with zero failures. No mutant commit or production/test edit was made.

## Live whole CI and next required stage

Live PR head is exactly b9edc4d; run37742759577 and complete logs were read:
Node113197080545: 960 tests, 952 pass, zero fail, eight existing TODO, SUCCESS.
Python113197080707: ran397 tests, OK with five skips and six expected failures, SUCCESS.
The body-only authorized update records this final head/run and distinguishes the independent proof executions from
the author's original proof account. The commit head is unchanged.

The declared model's Release testing → Sprint review gate requires release tests of the selected items, not only the
visible overview. Independent E, who implemented none of A/D or predecessor guarded behavior, therefore still supplies
bounded release coverage of both selected261 protocol and277 actual-dashboard increment before sprint closure.
This caller approval is neither that release gate nor a deployed-main or wholeUC-020/UC-003 completion claim.
No paid service, source/helper/test implementation or merge was performed by this reviewer.
