---
id: ITM-273
title: The add-product write requires a person click
level: module
realises:
  - UC-001
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
modules:
  - MOD-settings-pages
builds_on:
  - ITM-207
tests:
  - unit
origin:
  - UC-001
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
---
# ITM-273 The add-product write requires a person click

**REGISTER**

## Outcome

Correct the add-product Step C write boundary in MOD-settings-pages. A synthetic click must not reach the repository
layout commit or rememberProduct; a person's trusted click still performs the accepted UC-001 action. Keep the other
add-product behaviour and accepted public view interface. The failure path is products.mjs Step C click listener →
reviewLayoutCommit → rememberProduct: the listener currently takes no event and checks no isTrusted value.

## Acceptance

- New unit tests through the public add-product route cover an untrusted click after the review/preconditions are
  complete, for GitHub and GitLab. Neither repository write nor local product persistence occurs. The tests observe
  both write boundaries and retain the no-write expectation of the independent dashboard route regression.
- Positive cases with the same completed preconditions and a trusted person action still commit the reviewed layout
  and remember the product exactly as UC-001 requires. A guard that blocks every action fails the positive cases.
- Only src/settings-pages/ and tests naming MOD-settings-pages change. The existing add-product unit fixture may be
  corrected to model a trusted person action for its person-click inputs: its current dispatch of new Event('click')
  has isTrusted false. Every existing asserted expected result remains unchanged; the fixture must also expose actual
  untrusted events for the new negative cases. No production override for event trust is introduced. No unowned
  migration, repository-hosts, browser-store, SPEC or architecture file changes belong to this item.
- The first commit contains only tests, including that bounded fixture-input correction, and has actual red CI on the
  synthetic-write regression before implementation. Final exact-head CI is green. Each new test names its unique TST
  identifier, guarded requirement/use case, module, unit level, precondition, input and expected result. The PR records
  the concrete call/data path and actual individual planted-fault failures followed by restoration. Removing the
  trusted-click guard is observed failing each negative case; blocking trusted writes is observed failing positives.
  No paid service is called, and no existing expected result is weakened to obtain green CI.
