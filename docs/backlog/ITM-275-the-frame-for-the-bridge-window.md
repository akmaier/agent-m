---
id: ITM-275
title: The frame for the Bridge window
level: module
realises:
  - UC-044
  - UC-003
  - EVERY STEP EXPLAINS ITSELF
  - ONE CLICK PER DECISION
modules:
  - MOD-identifiers
  - MOD-site-frame
builds_on:
  - ITM-204
  - ITM-205
  - ITM-220
  - ITM-221
  - ITM-232
tests:
  - unit
origin:
  - UC-044
  - UC-003
---
# ITM-275 The frame for the Bridge window

**REGISTER**

## Outcome

Build MOD-site-frame's PageSetup, startPage, instanceOf, notice and confirmDecision for the Bridge window, using its
accepted View, Route and ViewContext. PageSetup stays { page, views, menuViews }; the page is bridge and every view has
strategies: []. Draw the shared header/look, route the loaded views by the fragment and give them the actual instance,
store, host and go callback. Reuse the delivered renderer, explanations, browser store and repository-host interfaces.
No job runner, runPanel, main/review acceptance watcher or repository write is needed for this Bridge-only slice.

Build only MOD-identifiers' missing pure instanceOfPagesAddress({ hostname, pathname }) export: the owner from a
Pages hostname and the repository from the first path segment, or null for another host. The working extraction in
src/site/instance-repository.mjs is a reference pattern, not a new import or an owned change. Frame instanceOf calls
the accepted identifiers export and applies its declared upstream fallback. Implement neither the rest of identifiers
nor new PageSetup fields. The shell can supply an own-protocol location with the configured Pages hostname/path;
its origin and controls remain private app metadata behind its fixed preload.

The bounded window has no chosen product initially; use the real store's empty state. Keep existing schemaForm and
explain behaviour and supply the pairing explanations the shell needs. Do not import absent future functions merely
to render this page, fake a strategy registry, or claim the remaining main/review frame is delivered.

## Acceptance

- New unit tests exercise startPage with page bridge, real module interfaces and controlled DOM/storage: the header,
  loaded route and subsequent fragment/go navigation, the configured non-upstream instance and empty product state.
- Tests name MOD-identifiers and cover Pages identity and a non-Pages null; frame tests cover that export's result and
  the declared upstream fallback. No repository request or job registration occurs for the empty-strategy Bridge page.
- Notices show their supplied text/link. A decision shows its title/lines and returns confirmed/reason only on the
  person's choice; cancellation stays cancelled. Pairing explanations use the shared renderer.
- The implementation PR changes only src/site-frame/, src/identifiers/ and new tests naming the module they guard. The separate whole-check PR below changes no owned source or tests. Existing expected results
  stay unchanged; none of the legacy src/site/ module changes.
- The tests-only first commit has actual red CI; final-head CI is green; each new case has an executed planted-fault
  counter-proof and restored positive. No paid service is called.

## Whole-repository check integration

Before the corrected source gate, make a separate between-jobs PR into sprint/15 changing only
`tests/test_no_backend.py`. Under SPEC's WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS, recognise the accepted
MOD-site-frame local `look.css` and `brand/` loading. Permit at most three loading-element sites across
`src/site-frame/`: the stylesheet link and the picture's light/dark logo img/source. Require semantic evidence that
the actual href/src/srcset resolve only `./look.css` or `./brand/` assets against the module's own import.meta.url.
No arbitrary or foreign asset address, indirect loading bypass, extra loading site or inline CSS workaround is allowed.

Keep the existing own-data fetch predicate and all prior foreign-address/channel guards unchanged. The frame must
use its own `./brand/` files, with the reused asset bytes and terms. The checker permits no load when the module is
absent and requires none; exercise actual corrected frame source as an independent diagnostic outside that PR.
New bounded checker counter-proofs cover accepted local assets, wrong destination/missing evidence and excess sites.
After independently approved green checker merge, integrate the sprint base ordinarily into the owned275 branch
before its corrected source gate. Preserve original tests-first history, fixed limit3 and independent release coverage.
