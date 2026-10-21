---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - 68463c5f2bfc7bc35d1bee08c10b606a1b3dc272
  - https://github.com/akmaier/agent-m/pull/1277
date: 2026-10-21 15:22 UTC
---
## Reason

ITM-920 passes on this exact head into sprint/team1/106, after unchanged publication of this record. Independent
po-sol (gpt-6.1-sol), assigned JOB-20261021-1517-4c84, authored none of the source, tests or proof executions.
The original Start, current item/Selection, accepted Frame d38b1f2e6ef8946e0a995d2d28ae2d2b770d4bfa,
UC-046, applicable SPEC job/phone rules, process/model/roles/PO instructions and unchanged original required readings
were checked. SM's Source permission follows its actual first-red inspection; Source has reached this gate.

The complete PR has three commits: b93a11a157211410c4ea70810f92a7531215d078 changes only the usability test;
19dedc06d2dcd3158eae7ccb32eef5408a1b2300 makes the two cases' declarations and titles parser-visible without
changing their asserted meaning; 68463c5f changes only owned src/site-frame/look.css. First automatic run
39622518312/node7 job119299423117 actually fails both new cases at line210: fits false, expected true,
ERR_ASSERTION; its shard has 393 passes, two failures and six old TODOs. Fresh native Host.pullRequestFacts at
15:19:28.711Z gives the exact head CI success and all 23 head checks success. Final run39623966007/node7
job119304412734 actually passes both cases (303/304), 395 passes, zero failures, six old TODOs. The intermediate
declaration commit CI is still running in that observation; it is not called completed or used as the head criterion.
Native github.mjs ciOf/pullRequestFacts and product-process/done.mjs require the green head, not terminal intermediate
workflow aggregates. The updated final-evidence PR body was read; its earlier tests-only description is superseded.

Every changed file is in scope: src/site-frame/look.css is Frame-owned shared production; tests/site-usability.test.mjs
names MOD-site-frame and Level system. Its full old body and assertions remain, with 55 added lines and no deletion
against the PR base. Both TST-920001/002 declare the phone requirement, precondition, literal input and expectation.
The new measurement visits / and #uc through the unchanged real-browser caller at 390px; it checks all eight ordered
entries' exact destinations/disabled state and rendered visibility/positive boxes/viewport bounds, plus scrollWidth
against clientWidth. No expected result comes from a document. Existing desktop route, target-size, badge and width
checks remain; old width TODOs TST-904054/072/117/126 and every unrelated expectation remain unchanged.

The actual path is index.html -> home/home.mjs:137 -> menuHtml, and docs/index.html ->
site-frame/dashboard-app.mjs:762 renderTabs -> menuHtml; both entry pages load theme/lme.css then Frame look.css.
The legacy narrow .menu rule at lme.css:72 forces nowrap/overflow-x:auto. The new look.css:30-33 higher-specificity
shared rule supplies wrap/visible and the seventh-entry auto margin only at max-width760px; no desktop rule or menu
identity/product-link code changes. PHONE_MENU reads the resulting live boxes, not CSS text, and the failure nodes
are the main/review fits assertions at usability lines213/225. No legacy file, helper, fixture staging or route changed.
The unchanged serveSite streams this worktree's actual files; stageElectron caches a browser binary, not app source.

All seven immutable on-demand receipts were read at test-results commit
58b3ed312aa29fe341702893e00226997929a7cc, under runs/19dedc06d2dcd3158eae7ccb32eef5408a1b2300/:

| Record | Meaning |
|---|---|
| 20261021-1510-on-demand-0267.md | assertions not run; fixture bind EPERM and before-hook timeout |
| 20261021-1510-on-demand-0a42.md | partial capture, no assertion outcome/end/Node exit claimed |
| 20261021-1511-on-demand-0705.md | partial capture, no assertion outcome/end/Node exit claimed |
| 20261021-1512-on-demand-d809.md | unchanged source baseline, both fits assertions fail |
| 20261021-1513-on-demand-cc93.md | uncommitted source baseline, both pass |
| 20261021-1513-on-demand-5e28.md | uncommitted owned CSS fault, both fits assertions fail |
| 20261021-1514-on-demand-b20a.md | uncommitted exact restoration, both pass |

The developer's original thread 01a15cec-f7ea-7512-aa88-57af741fd9ca was read as commandExecution only.
Completed foreground outputs corroborate the receipts: unchanged baseline 15:12:51-15:13:11 exit1, source baseline
15:13:26-15:13:46 exit0, literal look.css wrap/visible -> nowrap/auto fault 15:13:54-15:14:13 exit1,
restored wrap/visible 15:14:19-15:14:43 exit0. Both fault cases show false/true ERR_ASSERTION at lines213/225;
both restored cases pass. Commands exec-3e830751-53f1-4243-9d19-2546cb693f6c and
exec-8486b654-b285-4281-a204-d9a14591cc7a contain the complete fault/restored JUnit outputs. The baseline/restored
git diffs show the same final five-line production addition; subsequent commit and clean status identify this head.
Final source blob is 1e258038324309283a68ce89a62db0598059e5f0; frozen test blob since 19dedc06 is
73ef6fdc8ea29541f122e94fa7a64bec995d1d0a. No durable local file/hash of those completed foreground JUnit outputs
was retained by the author; none is invented or made an additional acceptance condition.

The earlier partial-capture receipts are preserved, not rewritten. More complete command outputs now show their
eventual 110000ms before-hook timeouts and listen EPERM, not a 30-second runner cutoff or assertion failures.
The first attempt's clocks are 15:10:13-15:12:03; its compound shell exits0 because its final date succeeds,
not because Node passed. Partial header captures prove no assertion outcome at their capture point. The background
attempt's nice failure/PID disappearance and initially missing XML prove no successful run/end/exit. A later existing
XML contains two assertion failures; it is not used to invent the partial attempt's missing exit/end. These setup
failures are neither the actual server-red proof nor the owned-source counter-proof. Later focused outputs supply
the real evidence; no source-stability or historical-failure erasure claim follows.

Acceptance holds for this bounded menu outcome as far as the code, unchanged old tests, actual server results and
recorded counter-proof show. This is no whole-UC/release/deployment or formal acceptance, no Sprint106 closure,
and no ITM-922 Start. PO ran no test, probe, fault or CI rerun and changed only this immutable gate record.
SM publishes it unchanged and performs its guarded exact-head sprint integration; PO does not merge or push.
