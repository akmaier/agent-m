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
- Source scope: MainPage entry and owned parts; ProgressMeasures only its declared legacy-file removal and
  coverage migration after1175, not another statistics algorithm. Notifications is fixture-entry migration only;
  RepositoryHosts is the existing no-backend known-positive live Source path only. No production behavior change
  in Notifications or RepositoryHosts, and no Frame production change in this item.
- The first commit is focused tests-only, with actual intended automatic server red before SM Source permission.
  New cases require real owned-code fault/failure/exact restoration and truthful permanent records.
  No all-UC claim or invented run/hash obligation.

## Exact Old-Test Boundary

tests/test_main_page.py may change only the old root script/static cards/waits/menu markup expectations to
the actual native entry/runtime equivalents, preserving user outcomes, eight-stage navigation order and fixtures.
The old ended-job "done" row keeps that meaning before merge; after merge, the accepted build policy removes
the row. Name the native build/state cases retaining this coverage; do not keep an obsolete merged row merely
to preserve a legacy assertion.

tests/progress-measures-home-item-digits.test.mjs migrates off the removed progress file to native productFacts:
retain all three/four-digit ordering/counting outcomes and rejection of two-digit identifiers.
tests/main-page-no-token-requests.test.mjs may remove only the ancillary removed-old-page baseline/comparisons:
retain native TST842001/003 request1714 expectations, attributable701 reads, fixed13, 350-file delta coverage,
and TST842004's31 requests/19 batches/no single-file fetches. No-token fallback coverage remains.

tests/dashboard-notifications-wiring.test.mjs and dashboard-notifications.test.mjs may change only main-page
fixture entry from removed home to actual Frame/MainPage; preserve component/release levels, authorship and
all existing notification expectations. The UC047 system file changes only if its actual entry imports a removed
file, with identical behavioral expectations. tests/test_no_backend.py's NoServer.test_the_site_has_code_to_check
changes only its positive actual live-main Source path; retain all network findings, allowlists and negative
controls. Synthetic old path examples in test_jsrun_names.py and elsewhere remain unchanged.

Preserve all unrelated old expectations, IDs, levels, fixtures, route inputs, TODO findings, frozen TST922001,
native stored-overview TST943001/002/003 and go-call outcomes. No jsrun/app-harness/browser-helper changes.

## Readiness

Start only after1165 and1175 are independently gated and sprint-merged, on a fresh integrated base.
All other listed prerequisites are delivered. ITM-828's original REGISTER states its no-code outcome is already
provided by buildInProgress and default delivery, but its native state is still ready with no PR; do not fake done
or create redundant implementation. The prerequisite now names delivered ITM-864's actual build behavior instead.
No obsolete waiting-for-draft or Team2/102 blocker remains. One Responsibility separates owners; Nothing Twice
removes legacy duplicates; KISS reuses the accepted existing view, producer and Frame go.

