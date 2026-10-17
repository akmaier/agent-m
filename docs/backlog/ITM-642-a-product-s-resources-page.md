---
id: ITM-642
title: A product's resources page
level: module
realises:
  - UC-040
modules:
  - MOD-settings-pages
builds_on:
tests:
  - unit
  - system
origin:
  - ITM-590's gate (docs/gates/20261017-0406-development-release-testing-9d71.md), from developer-sonnet-e's findings on pull request #684
---
# ITM-642 A product's resources page

**REGISTER**

## Outcome

MOD-settings-pages' Parts name `resources.mjs`, and its Interfaces the routes `resources` and `resources/instance`.
No such file exists, and no item builds it. ITM-460 to ITM-463 build MOD-resource-list, which the page uses. Its
readings are taken at its start.

## Acceptance

- The routes `resources` and `resources/instance` show and save a product's or the instance's resources as MOD-settings-pages' file states.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
