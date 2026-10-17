---
id: ITM-667
title: The release test of UC-020's gaps
level: system
realises:
  - UC-020
modules:
  - MOD-trace-pages
builds_on:
  - ITM-599
tests:
  - release
origin:
  - ITM-599's gate on pull request #708 (docs/gates/20261017-0836-development-release-testing-e7a1.md), from developer-sonnet-d's finding
---
# ITM-667 The release test of UC-020's gaps

**REGISTER**

## Outcome

ITM-599 builds the gaps view (UC-020 steps 7, 7a and 7b), and lists the release level, which its developer does not
write (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). The live page reaches `gaps` only once queue
`2026-10-17d` moves the live dashboard's code into the architecture. So the release test walks the view through
MOD-site-frame's route `trace` with `key=gaps`, as ITM-639 does for UC-015.

## Acceptance

- A release test, written by a participant other than ITM-599's developer, guards UC-020 7, 7a and 7b through the frame's route.
- Its counter-proof plants a fault in the gaps descriptor and fails.
- It is written by a participant other than developer-sonnet-d.
