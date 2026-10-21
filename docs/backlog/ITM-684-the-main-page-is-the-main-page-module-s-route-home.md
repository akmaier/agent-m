---
id: ITM-684
title: The main page is the main-page module's route home
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
  - THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE
modules:
  - MOD-main-page
  - MOD-progress-measures
  - MOD-notifications
  - MOD-repository-hosts
  - MOD-site-frame
builds_on:
  - ITM-685
  - ITM-826
  - ITM-827
  - ITM-864
  - ITM-829
  - ITM-809
  - ITM-655
  - ITM-842
  - ITM-1165
  - ITM-1175
tests:
  - unit
  - component
  - system
  - release
origin:
  - The accepted main-page takeover and the human request to fix Load failed and use commit-updated precomputed statistics
---
# ITM-684 The main page is the main-page module's route home

**REGISTER**

## Outcome

index.html starts the existing MOD-main-page view through the native Frame start entry. Its cards, waits,
jobs, greeting and six-stage overview are the live main page, not the legacy src/home implementation.
Use storedOverview at the product's exact default commit and productFacts scope build; when absent, use
the existing scope all fallback. The existing main-changed producer updates statistics on each main commit;
do not add a second producer, copy cache values or force an old observed count.

Accepted MainPage Parts own index.html and removal of src/home/home.mjs, cards.mjs and home.css.
ProgressMeasures Parts own removal of src/home/progress.mjs. Accepted contracts already permit this takeover.
MainPage retains public go; ITM-1165 supplies cross-page navigation. No public addressOf or ITM-1111 is needed.

## Acceptance

- The real root entry renders the existing native home view, including stored overview and fallback,
  instance/product cards, waits and own job routes. Its existing review/settings links reach their actual
  destinations through Frame; retain selected-product routing, eight process menu destinations and errors.
- Remove the four taken-over legacy files only after their requirement coverage is retained by named native
  module cases in the PR. Preserve notifications following the current store/token and permission only on click.
  Existing page release tests must pass; system cases are not independent release coverage.
- Cached initial facts followed by the first minute job poll have focused unchanged/changed-record request-count
  cases. Unchanged job blobs reuse served facts without individual record fetches; only changed job texts are
  read through existing Snapshot/readMany batching. This is a code-derived risk to verify, not a claimed executed
  failure. Preserve job/live-only polling, no PR/stage/waits polling, hidden-page pause/resume and no-token no-poll.
  No new public API, cache format, custom staging or helper changes.
- Source scope: MainPage entry and owned parts; ProgressMeasures only its declared legacy-file removal,
  coverage migration after1175 and the bounded internal item-input ordering below, not another statistics algorithm.
  Notifications is fixture-entry migration only;
  RepositoryHosts is the existing no-backend known-positive live Source path only. No production behavior change
  in Notifications or RepositoryHosts. Frame owns the shared product selector's accessible name and process-menu
  entry keys, not MainPage. Its actual root selector must have an accessible name; TST905033 retains its unfiltered
  empty violation expectation at both widths, with no new TODO or checker filter. Each shared menu entry exposes
  its existing menuOf key as data-entry; preserve labels, order, product semantics and destinations.
- Canonical menu-entry receiving paths are a code-derived risk, not a claimed executed failure. Before repairing
  one, demonstrate an actual focused public receiver failure against a working known-positive route. Only the
  smallest Frame-owned repair of its existing entry-to-loaded-route fallback is in scope: preserve menuOf's
  canonical links, selected product, loaded-route behavior and truthful not-built result. Reuse existing private
  routing/address writing; no new public API, serializer, copied route mapping or embedRoute exception. MainPage
  must not manipulate Frame's private DOM or compensate for its routing. Keep Frame writers serialized and the
  independently assigned Notifications fixture files reserved to their writer.
- The first commit is focused tests-only, with actual intended automatic server red before SM Source permission.
  New cases require real owned-code fault/failure/exact restoration and truthful permanent records.
  No all-UC claim or invented run/hash obligation.

## Exact Old-Test Boundary

tests/test_main_page.py may change only the old root script/static cards/waits/menu markup expectations to
the actual native entry/runtime equivalents, preserving user outcomes, eight-stage navigation order and fixtures.
The old ended-job "done" row keeps that meaning before merge; after merge, the accepted build policy removes
the row. Name the native build/state cases retaining this coverage; do not keep an obsolete merged row merely
to preserve a legacy assertion.

In tests/site-usability.test.mjs, only TST920001's PHONE_MENU_EXPECTED.main destination/disabled literals may
migrate from the legacy docs/# routes and disabled Tests entry to the accepted main menu's eight linked entries:
requirements, use-cases, architecture, implementation, tests, releases, maintenance, settings, in that order;
each href is docs/index.html# followed by that key, and each disabled value is false. Retain the literal keys,
all eight entries and system level. Preserve the existing PHONE_MENU collector and all visibility, rendered-box,
390 px viewport and fits/no-sideways-scrolling assertions. PHONE_MENU_EXPECTED.review and TST920002 remain
unchanged; so do frozen TST922001, all other old expectations, TODO metadata and browser helpers. This is only
the accepted main-entry migration, not permission to alter geometry or waive a missing entry key.

tests/progress-measures-home-item-digits.test.mjs migrates off the removed progress file to native productFacts:
retain all three/four-digit ordering/counting outcomes and rejection of two-digit identifiers.
For TST1088001/002, preserve the literal numeric order [ITM-100, ITM-999, ITM-1000], total3 and done3;
ITM-99 remains excluded. TST1088003 retains the single ITM-1000 backlog/total1/done1 positive. ProgressMeasures
may normalize its item inputs by numeric identifier before calling public WorkPlans.itemStates, consistently
for all/work/build scopes and raw/stored facts. This is only the deterministic input order where no declared
plan order or dependency dictates otherwise: explicit plan order and backlog dependency order still come from
public WorkPlans, and the returned state order must not be re-sorted around them. No WorkPlans Source change,
second ordering/state algorithm, public API, cache-format or statistics change. Keep every old expected value,
ID, unit level, fixture, helper and other assertion intact; use the existing actual red and known positive,
without imposing a new whole-CI-red cycle. One Responsibility keeps normalization in its existing facts owner;
DRY and KISS retain public WorkPlans as the sole plan/dependency ordering and state derivation.
tests/main-page-no-token-requests.test.mjs may remove only the ancillary removed-old-page baseline/comparisons:
retain native TST842001/003 request1714 expectations, attributable701 reads, fixed13, 350-file delta coverage,
and TST842004's31 requests/19 batches/no single-file fetches. No-token fallback coverage remains.

In tests/main-page-home.test.mjs, TST847002 and TST847005 may change only the changed-job request-log kind
from file to batch, with matching prose describing existing Snapshot.readMany prefetching. The third log entry
remains exactly [batch, record]: docs/jobs/JOB-20261014-0900-0001.md for TST847002 and
docs/jobs/JOB-20261016-1000-ffff.md for TST847005. Preserve the commit/tree entries, two requests for the unchanged
poll and three for the changed poll, no reread of the other399 records, token routing and all initial-load counts.
Keep all rows, stages and waits, no use-case/approval reads during polling, redraw counter-positive, clocks,
Bridge request counts, IDs, unit levels, helpers and every other assertion unchanged. This permits no general
request-bound relaxation or new public API: the existing current-snapshot docs/jobs/ prefix-prefetch then public
listJobs pattern suffices without copying its private record matcher, parser or state derivation.

tests/dashboard-notifications-wiring.test.mjs and dashboard-notifications.test.mjs may change only main-page
fixture entry from removed home to actual Frame/MainPage; preserve component/release levels, authorship and
all existing notification expectations. The UC047 system file changes only if its actual entry imports a removed
file, with identical behavioral expectations. tests/test_no_backend.py's NoServer.test_the_site_has_code_to_check
changes only its positive actual live-main Source path; retain all network findings, allowlists and negative
controls. Synthetic old path examples in test_jsrun_names.py and elsewhere remain unchanged.

In tests/release-sprint-02-a-dashboard-app.test.mjs, only the existing release case "release · ITM-129 UC-024:
every menu entry and view of today is shown; a view whose file is not built is not" may replace its missing-view
Use-case-list expectation for the canonical #tests entry with the literal "The Tests entry is not built yet",
and align only the matching expected-result prose. Accepted Frame startPage and menuOf already require that
truthful not-built result. All other unknown legacy-view fallback expectations remain unchanged. Preserve the
case name and identifiers, release level and independent authorship, route inputs, menu order, built-view and
file-recorder known positives, no-missing-file assertions and every other assertion; no helper, fixture, filter
or production change. This is bounded old-release-case maintenance, not a new case or counterproof obligation.
Develop Against Interfaces and KISS align this one expectation with the existing accepted Frame contract,
without another routing rule or a Source rollback.

In that same existing release case, HANDED may additionally name only get-your-own: Frame already dispatches
#get-your-own to the accepted public SettingsPages route, as UC-014 requires, rather than its absent legacy file.
Align only the matching handed-route prose. Preserve the built-view assertions that its rendered page differs
from the Use-case-list fallback and is nonempty; do not skip the view or classify it as unknown. Keep every
other HANDED entry, route input, unknown legacy fallback, canonical #tests not-built expectation, menu/order,
file-recorder positive, no-missing-file check, case identity, release level and independent authorship unchanged.
#step is not in VIEWS and is not added. No Source, helper, fixture, filter, new case or counterproof change is
authorized. Develop Against Interfaces and KISS retain the existing public dispatch, not a second routing rule.

Preserve all unrelated old expectations, IDs, levels, fixtures, route inputs, TODO findings, frozen TST922001,
native stored-overview TST943001/002/003 and go-call outcomes. No jsrun/app-harness/browser-helper changes.

## Readiness

Start only after1165 and1175 are independently gated and sprint-merged, on a fresh integrated base.
All other listed prerequisites are delivered. ITM-828's original REGISTER states its no-code outcome is already
provided by buildInProgress and default delivery, but its native state is still ready with no PR; do not fake done
or create redundant implementation. The prerequisite now names delivered ITM-864's actual build behavior instead.
No obsolete waiting-for-draft or Team2/102 blocker remains. One Responsibility separates owners; Nothing Twice
removes legacy duplicates; KISS reuses the accepted existing view, producer and Frame go.

