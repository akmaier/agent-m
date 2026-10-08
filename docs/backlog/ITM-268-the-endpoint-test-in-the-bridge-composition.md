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
  - ITM-276
tests:
  - unit
origin:
  - UC-003
---
# ITM-268 The endpoint test in the Bridge composition

**REGISTER**

## Outcome

Register the endpoint-test handler in MOD-desktop-shell's compose.mjs through the accepted server and handler interfaces. The actual Bridge entry must serve it for the configured instance origin, with the existing pairing controls and loopback binding. This is module work, not an unowned dashboard wiring change.

Before start, ITM-276 must be merged and its runnable source-folder Electron entry, pairing window and lifecycle named in the PR. MOD-desktop-shell explicitly permits that component-test start with command-line instance/origin and no updates. Register the handler into that same production main.mjs/compose.mjs; no second server or test-only entry substitutes for it. This integration does not complete UC-044's signed platform distribution, agent/tunnel/job features or updates.

## Acceptance

- New tests exercise the real composition and observe a short request arriving at a controlled endpoint through the registered handler; missing or incorrect registration fails the test.
- Pairing and origin enforcement remain intact. Endpoint keys and settings are absent from shell settings, exports, repository files and logs.
- The PR names the runnable shell's prerequisite revision and the production entry used; lifecycle behaviour remains unchanged.
- Only src/desktop-shell/ and new tests naming MOD-desktop-shell change.
- The tests-only first commit has red CI; final-head CI is green; every new test has a recorded planted-fault counter-proof. No paid service is called.
