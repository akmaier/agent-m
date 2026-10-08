---
id: ITM-268
title: The endpoint test in the Bridge composition
level: module
realises:
  - UC-003
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-desktop-shell
builds_on:
  - ITM-261
  - ITM-262
tests:
  - unit
origin:
  - UC-003
---
# ITM-268 The endpoint test in the Bridge composition

**REGISTER**

## Start condition

**Blocked.** An endpoint is never accessed through the Bridge. Endpoint configuration and its test use the direct browser-to-endpoint path. This item's endpoint-through-Bridge scope conflicts with that boundary; do not select or start it. UC-003 alternative 2a contains a contradictory Bridge route and must not be used to authorize this work.

## Outcome

Register the endpoint-test handler in MOD-desktop-shell's compose.mjs through the accepted server and handler interfaces. The actual Bridge entry must serve it for the configured instance origin, with the existing pairing controls and loopback binding. This is module work, not an unowned dashboard wiring change.

Before start, name the merged UC-044 delivery that supplies the runnable shell, its pairing window and lifecycle. If no such delivery exists, this item remains blocked: the full app is not implied by this small integration item. The architecture refinement must explicitly settle any proposed smaller source-mode composition and its dependencies before implementation or selection. No second server or test-only entry is accepted as the production composition.

## Acceptance

- New tests exercise the real composition and observe a short request arriving at a controlled endpoint through the registered handler; missing or incorrect registration fails the test.
- Pairing and origin enforcement remain intact. Endpoint keys and settings are absent from shell settings, exports, repository files and logs.
- The PR names the runnable shell's prerequisite revision and the production entry used; lifecycle behaviour remains unchanged.
- Only src/desktop-shell/ and new tests naming MOD-desktop-shell change.
- The tests-only first commit has red CI; final-head CI is green; every new test has a recorded planted-fault counter-proof. No paid service is called.
