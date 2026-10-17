---
id: ITM-638
title: The product's view leads to its Requirement sources
level: module
realises:
  - UC-015
modules:
  - MOD-settings-pages
builds_on:
  - ITM-590
tests:
  - unit
  - system
origin:
  - ITM-590's gate (docs/gates/20261017-0406-development-release-testing-9d71.md), from developer-sonnet-e's findings on pull request #684
---
# ITM-638 The product's view leads to its Requirement sources

**REGISTER**

## Outcome

UC-015 step 1: "In the product's view, the author opens **Requirement sources**." The route `sources` (ITM-590) is
reached only by its address, and nothing links to it. Which view is "the product's view" is read at the start, against
MOD-settings-pages' file and the main page's menu (MOD-site-frame).

## Acceptance

- The product's view offers *Requirement sources*, which opens the route `sources` for that product.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
