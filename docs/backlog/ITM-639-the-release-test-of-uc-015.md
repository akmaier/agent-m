---
id: ITM-639
title: The release test of UC-015
level: module
realises:
  - UC-015
modules:
  - MOD-settings-pages
builds_on:
  - ITM-590
tests:
  - release
origin:
  - ITM-590's gate (docs/gates/20261017-0406-development-release-testing-9d71.md), from developer-sonnet-e's findings on pull request #684
---
# ITM-639 The release test of UC-015

**REGISTER**

## Outcome

ITM-590 lists the release level, and its developer wrote no release test, since a release test is written by another
participant (the pattern of ITM-627). This item is that test. It walks UC-015 through MOD-site-frame's route `sources`
against the host's interface: tick, version, part, *Save*, and a removed link with its requirements listed.

## Acceptance

- A release test, written by a participant other than ITM-590's developer, guards UC-015's main flow, 2a, 2b and 3a.
- Its counter-proof plants a fault in `src/settings-pages/sources.mjs` and fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
