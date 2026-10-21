---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: rejected
on:
  - 92f9f6bc32dbd3bff8ff31eebdf415178f55f0f6
  - https://github.com/akmaier/agent-m/pull/1278
date: 2026-10-21 15:49 UTC
---
## Reason

ITM-922 is rejected on this exact head: the green-CI/Definition-of-Done condition and the item's explicit TODO-removal
Acceptance do not hold. This is the first Development gate decision, under JOB-20261021-1539-f0dc. One rework within
this sprint must address both observed conditions below; no merge is authorized. Independent po-sol (gpt-6.1-sol)
authored none of the source, tests or proof executions. The original Start, current 922/106 Selection, accepted Frame
d38b1f2e6ef8946e0a995d2d28ae2d2b770d4bfa and TestPages169826e2972ae3c6f7403e2cef26100767f9c1cd,
affected original contracts/callers/tests, process/model/roles/PO instructions and unchanged required originals were read.

1. Required CI is red on the candidate. Fresh native Host.pullRequestFacts gives head CI failure, with five successful
   and eighteen failed head checks of run39628407197. Actual node2 job119319758250 reports TST-475201 failing with
   TypeError/unhandledRejection, not its intended business assertion: start at dashboard-app.mjs:918 -> renderTabs:766
   -> querySelectorAll('[role="tab"]').forEach -> link.removeAttribute("role") is not a function. The unchanged
   app-harness.mjs:197-209 control has getAttribute but no removeAttribute; its HTML-backed element query at328 returns
   those controls. Node4 job119319758890 also fails the two named dashboard-shell cases at that same node. Python1
   job119319758602 reports the same TypeError through test_progress_derived.py:92 -> run_page:85, not an assertion
   mismatch in item-state calculation. Browser TST-922001 passing does not establish compatibility of these existing
   component/workflow callers. Rework must provide the accepted ordinary-menu outcome through owned Frame code while
   preserving those callers and the named role-only expectations; no helper API patch, optional-call/stub waiver,
   fake result, old assertion weakening or unowned legacy in-place edit is authorized. Fresh actual head checks must
   satisfy the existing native green-head condition. No CI retry can substitute for correcting the failure.

2. The accepted scoped outcome has not been promoted from TODOs. The full candidate diff leaves RULE/PER_ROUTE/TODAY
   and the old whole-page test generator unchanged in site-accessibility.test.mjs:35-49,130-137. Acceptance explicitly
   says the todos are removed and the check passes; the REGISTER permits removing resolved menu/accepted-badge/summary
   reasons while retaining any other actual finding and the old empty-violations expectations. Actual node4 output
   shows #uc, #uc/UC-001, #arc, #arc/ARC-001, #arc/MOD-reader, #module and all three explanation edit routes clear at
   both widths, yet their generated whole-page cases still carry their old menu/contrast/summary TODO reasons.
   The same output retains target-size on #use-case/id=draft and the SPEC-entry edit return link at both widths,
   and color-contrast on #backlog's .b-superseded at both widths. These are not the selected accepted badge or summary
   faults. Rework must remove only resolved reasons/unneeded TODOs and truthfully name each remaining actual finding,
   without altering old [] assertions, engines, fixtures, helpers or case identifiers/levels. Do not force these
   unrelated links or superseded badges green by broadening Source. #decision/id=draft is clear in this candidate
   run despite its first-red target finding; distinguish the actual dated observations rather than assume it still fails.

The preserved first tests-only391fd30e45267edd7719ad97bf3184071860dcb9 has actual CI failure: run39626466642/node4
job119312898516 fails TST-922001 at line151 on #uc phone, aria-required-children (1: #tabs) versus []. SM's explicit
Source permission follows that inspection and tests-only1b918bcee9b0d8135fd8678a61fbfcd6c33cae31's bounded input
correction. Source92 additionally filters color-contrast by each.first.includes(".b-accepted"). This changes a new
case's input after the first red, not an old expected value: the [] expectation remains. Actual failed scoped baseline
and final browser output identify excluded .b-superseded as a different status, so that input narrowing is not itself
a requirement to fix that other badge or a separate rejection condition. The helper exposes only the first target
and a count per rule: this filter is not proof about every node or whole-page accessibility; the unchanged old whole-page
cases remain the unfiltered control and must retain truthful remaining-finding metadata as condition2 requires.

Every changed file was reviewed: docs/index.html is the accepted named entry page; dashboard-app.mjs and look.css are
Frame-owned; dashboard-shell and site-accessibility name Frame; dashboard-pending-release-report names TestPages.
The old shell changes remove only the authorized MENU_OF_TODAY/release-filter/UC-positive role literals; TST-289101
removes only its two authorized role literals. No TestPages production or TST-289102 change exists. Other old expected
results, real Settings tabs, TST-515001/2 colors, folded explanation label/body and ITM-920 wrap rules remain unchanged.
No formal contract change is needed for either rejection condition.

Read actual retained menu/contrast/summary fault and restored JUnit files from comment6320084773, then all six immutable
test-results receipts at396162b2e226098fa42be3e5bfa201b6201a2781 under runs/1b918bcee9b0d8135fd8678a61fbfcd6c33cae31/:
202610211547-on-demand-baseline-scope-2210.md, baseline-cd67.md, menu-fault-8136.md, contrast-fault-95a1.md,
summary-fault-5067.md and restored-2360.md (the latter five share that date/occasion prefix). All state on-demand and
uncommitted:true. The first scoped baseline's actual .b-superseded failure is preserved, followed by passing baseline.
The three distinct source faults are restored role=tablist in docs/index.html, .b-accepted foreground #77aa77 and
summary min-height0. Their raw outputs respectively fail at #uc/#tabs aria-required-children, #arc accepted-badge
color-contrast and the phone UC-002 edit summary target-size, at the new test's line154; restored output passes.
The updated PR body and failed receipts explicitly call 15:47 their recording time, not execution start/end;
those execution boundaries were not retained. Do not invent clocks, hashes or exits absent from a capture. The comment
reports fault exit1/restored exit0; raw JUnit corroborates failure/pass types and counts, not separate process exits.
These recorded feature counter-proofs do not erase the real old-caller CI regression or complete Acceptance.

Only this gate record is written by PO; no test/probe/fault/CI rerun, Source/test/helper/formal/SM-closure edit,
push or merge was performed. SM publishes this decision unchanged and returns the same Source job once for the two
conditions, preserving first-red history, all old measurements and the narrowly accepted scope. This is no whole-UC,
release, deployment or formal acceptance, and no permission for unrelated backlog work.
