---
id: ITM-475
title: Team 2 integration CI runs the real increment
level: system
realises:
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
  - NO SERVER
modules:
  - MOD-settings-pages
  - MOD-desktop-shell
  - MOD-test-schedule
tests:
  - system
  - release
origin:
  - https://github.com/akmaier/agent-m/pull/495
---
# ITM-475 Team 2 integration CI runs the real increment

**REGISTER**

## Outcome

The accumulated Team 2 increment passes its required integration CI. The Bridge composition tests receive the runtime
packages their existing caller needs; the participant form's example address is a real example host; repository checks
resolve tracked paths from the repository root; the TLS reverse-tunnel fixture uses the current named-Bridge settings;
and native Electron tests execute the actual app in the Linux display environment.

## Acceptance

- Repair each failure at its observed node, with a working positive and the existing test's failure before the fix.
- Every required test remains in CI; job scheduling keeps each job within the existing two-minute limit.
- The integration pull request is green before its Product Owner merge decision.
- No SPEC, use-case, or architecture requirement changes.
