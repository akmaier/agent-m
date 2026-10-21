---
gate: Development → Release testing
job:
decider: po-sol
role: Product Owner
decision: passed
on:
  - 279a7fe26a40906c443c92160a2a1a90bac4cf38
  - https://github.com/akmaier/agent-m/pull/1289
date: 2026-10-21 22:03 UTC
---
## Reason

ITM-684 passes on this exact combined canonical head under JOB-20261021-2111-978c.
Independent po-sol wrote none of its Source, tests or proof executions. Original Start, published684
and its bounded refinements, accepted MainPage/Frame/ProgressMeasures/Notifications/RepositoryHosts,
affected use cases, process/DoD/readings, full PR description/commits/diff, old tests and actual records
were read. This decision authorizes only this head's sprint integration by SM, not default delivery,
formal acceptance, sprint closure or either final sprint gate.

Native Host.pullRequestFacts at2026-10-21T22:01:07.427Z returns exact279a headCI success and all23 checks
success, matching automatic39682682620. First86e191b3dbcb5dd5da1aec1833629347e8b104d7 changes only the
root test; actual39674092281/node5 job119479275731 fails001 because index.html still loads legacy home,
not the native Frame/MainPage entry. Later fixture, declaration, root accessibility/menu, numeric-order
and tests/tests DOM-path failures remain history, not infrastructure excuses or CI reruns.

Every changed path is within the published five-module takeover and named test boundaries:
- index.html starts Frame start.mjs with main/main-page and loads the module-owned stylesheet.
- src/home/home.mjs, src/home/cards.mjs and src/home/progress.mjs are removed; src/home/home.css moves
  to src/main-page/home.css, adapted to native greeting/stage-link/build/wait markup and responsive fill.
- src/main-page/home.mjs reuses the instance snapshot only for its own card and matching ref. Existing
  storedOverview selects scope build, absent overview retains all; no second producer or copied statistics.
- src/main-page/reread.mjs compares current docs/jobs/ blobs, reuses served initial text, prefetches only
  changed/new texts with Snapshot.readMany and delegates parsing/live states to existing public services.
  Current maps replace wrapper chains and omit removed paths. Polling still changes jobs/build only;
  hidden-page, no-token, rate-limit and per-card behavior remain on their existing paths.
- src/progress-measures/facts.mjs normalizes numeric item inputs before public itemStates in all/work/build,
  raw and stored paths. WorkPlans still determines explicit plan/dependency order and all states.
- src/site-frame/index.mjs names the product selector and exposes existing menuOf keys; its public API,
  product routing, eight canonical main links and loaded routes are preserved.
- src/site-frame/dashboard-app.mjs reuses owned MENU/stageView and existing routeOf. Only bare/product-only
  canonical entries normalize; unbuilt entries say not built, unknown legacy routes keep their fallback,
  and parameterized loaded routes retain both section/product orders. No copied mapping or serializer.
- tests/main-page-root-entry.test.mjs adds component001/002/003/005;002 uses the real public cache producer,
  separate request/log boundaries and excludes both file and batch initial job reads. It retains unchanged
  commit/tree-only polling and changed-job-only batching;003 counts the initial own head/tree once.
- tests/site-frame-start-page.test.mjs adds unit004; tests/site-frame-legacy-navigation.test.mjs adds
  component006/007/008 with actual receiver positives, ARC-file reads, unbuilt-entry and both parameter orders.
  Existing003-006 outcomes/tokenless coverage stay; repository metadata forwarding is fixture preparation.
- tests/site-usability.test.mjs changes only920001 MAIN destination/disabled literals to the published
  canonical eight linked entries. Collector/geometry/review920002/frozen922/TODOs stay unchanged.
- tests/main-page-home.test.mjs changes only847002/005 changed-job file-to-batch log kinds and matching prose.
  Counts, paths, other399 records, token routing, rows/stages/waits, clocks and Bridge assertions remain.
- tests/main-page-no-token-requests.test.mjs removes only legacy-page comparisons, preserving native1714,
  attributable701/fixed13,350-file delta and31 requests/19 batches/no single-file fetches.
- tests/dashboard-notifications-wiring.test.mjs and tests/dashboard-notifications.test.mjs are Turing's
  native-entry fixture migration, preserving component/release levels and outcomes.472134 keeps its actual
  store alive through assertions and restores on startup failure; token clearing and permission-on-click stay.
- tests/test_main_page.py, tests/progress-measures-home-item-digits.test.mjs and tests/test_no_backend.py
  are Turing's bounded native adapters. Running/elapsed, done-before-merge, rendered own/product cards,
  stage/wait outcomes, numeric100/999/1000 counts/done and single1000/backlog positives remain. The live
  dashboard NoServer positive remains. Finala1ff changes only absolute fixture/module paths for CI's cwd.
No helper, fixture file, WorkPlans Source, cache format, unrelated expectation or formal text changed.
Both independent support jobs retain developer-terra-a/model/job trailers and cherry-pick provenance;
their support branches are not standalone item completion. No new proof obligation is added to old-fixture maintenance.

Read actual failed/restored captures and immutable remote bare-ID records for all eight new cases:
001 entry attribute fault;002 changed-job batch omitted;003 own snapshot handoff fault gives2 versus1;
004 selector Repository versus Product;005 added-job batch omitted;006 canonical architecture falls to
Use cases despite working legacy ARC-file positive;007 missing not-built handling falls to Use cases;
008 old first-part alias guard fails the product-first New requirement receiver after section-first positive.
Each effective fault fails at its intended assertion and its restoration passes. Historical001-005 proofs
under816 and006/007 undera1 remain relevant to unchanged guarded Source; strengthened002 has its actual
dirty pass capture, and008 has a fresh product-order failed capture/restoration on final279a. No universal
eight-case replay is claimed or required.003's earlier non-effective fault and004's component-labelled
records remain immutable; corrected004 fault/restoration unit records were read from the same captures.

Remote records read ate3ae484a9618690952ada86633d10dbbbd92f3e3 all have schema findings[]. Faults retain
uncommitted:true and actual clocks. The first canonical publication observation had only restore008 under
279a; PR comment6327478350 was a proof index, not a canonical result record. That gap was closed before
this decision: at2026-10-21T22:02:40.818Z actual remote b080afba02f1d8e2d8219316dbabc96dc49ecd54 holds
runs/279a7fe26a40906c443c92160a2a1a90bac4cf38/20261021-2156-pull-request-ci39682682620-7419.md,
blob47825ac8f4308dba68ca88866b439d7dd56cc8df. Read its actual text: occasion pull-request, participant ci,
run39682682620, actual start21:56:01.9337288Z, all eight passed at declared levels. Schema findings[];
native resultsAt returns component7/unit1 passed, failed0/flaky0/notRun0. This is publication of existing
CI outcomes, not a new execution. Earlier not-run/publication/level observations are preserved dated facts.

Read actual controlled-Electron capture /private/tmp/itm684-card-browser-measure-a1ff.json and its caller:
the real root/card at390 and1280 has six stages, current Requirements, computed Architecture50% and
Implementation40% pseudo-fills, and fits the document/stage bounds. Its21:51:54.194-21:51:56.137Z reading
is on unchanged CSS/card blobs through279a, not merely menu geometry or a new independent release test.

Concrete canonical pins: index6daf9a7835267429447c377a68cd5c6aa14dd2b3;
homeb01f2544ad7ddc4558c28446d6f087ef33c5be15; rereadd1f94c34c152bc25cbe567802de4696e22229880;
CSSd57e9be506824df1431c36f878708db27f821906; PM3ce05d5f61caebeb4b1ad54b2c3e87d659a33781;
Frame index65b99d2868532cee556c0d9c6de9974f53b28da0; receiver6396a44e05eac11ef8b3320263f61f7dbfd0726d;
root test188522d0881a65345a9fe90034ed618628720e12; receiver test854508433d8da3536838d1748993dab5eee65f9e.
Packets: /private/tmp/agent-m-po108-978c-pre-review-1792620069203.json and
/private/tmp/agent-m-po108-978c-canonical-final-1792620160818.json, plus the earlier dated pre-review packet.

Residuals are explicit: existing unrelated TODO findings remain, unavailable menu entries truthfully remain
unbuilt, and the migrated1088 titles still lack TST prefixes (their actual three-case evidence is retained,
not invented native per-case outcomes). Independent Notifications release provenance is preserved; these
component/unit proofs and limited rendered measurements are not whole-UC, whole-AA/phone or new release
coverage. SM must publish unchanged and freshly guard exact279a before merging. PO ran no tests, probes,
faults or CI, wrote no Source/tests/REGISTER/closure and issues no final sprint gate here.
