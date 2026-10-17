---
id: ITM-671
title: Leaving a draft with unsaved edits asks first
level: module
realises:
  - UC-018
  - UC-019
modules:
  - MOD-review-pages
builds_on:
  - ITM-603
tests:
  - unit
origin:
  - ITM-603's gate on pull request #712 (docs/gates/20261017-0907-development-release-testing-c71d.md), from developer-sonnet-e's finding
---
# ITM-671 Leaving a draft with unsaved edits asks first

**REGISTER**

## Outcome

UC-018 7a: "The author leaves the editor with unsaved changes. The dashboard asks before discarding". ITM-603 gives
MOD-review-pages' edit routes a `leave` that closes their editor. The routes `draft` and `<k>/draft` also show editors,
the edited text of a drafted change, and give no `leave`, so leaving one with edits discards them without asking. They
give the same `leave`, through their editors' `close`.

## Acceptance

- Leaving `draft` or `<k>/draft` with an unsaved edit asks first, and a refusal keeps the page and its address.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
