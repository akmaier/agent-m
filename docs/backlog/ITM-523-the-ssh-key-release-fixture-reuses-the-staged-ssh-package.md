---
id: ITM-523
title: The SSH-key release fixture reuses the staged SSH package
level: module
realises:
  - UC-044
  - THE BRIDGE CREATES ITS OWN SSH KEY
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-tunnels
builds_on:
  - ITM-284
tests:
  - release
origin:
  - PR549 all-level CI38858266988 node4 job116834499811, existing SSH-key fixture preparation
  - ITM-284 and accepted MOD-tunnels.ensureKey
  - Existing staged-dependency callers tests/release-itm-276-desktop-shell.test.mjs and tests/desktop-shell.test.mjs
---
# ITM-523 The SSH-key release fixture reuses the staged SSH package

**REGISTER**

## Outcome

Change only dependency preparation in the existing tests/release-itm-284-tunnels-key.test.mjs runtime/ordinary-child setup, whose header names MOD-tunnels. TST-284901, TST-284902 and TST-284903 keep their IDs, release level, inputs, expected results, product/security assertions and existing known-positive check.

Reuse the already staged src/bridge-build/node_modules ssh2 package when present, following the existing NODE_PATH staging pattern. The manifest and lock pin ssh2 to 1.17.0. Preserve the existing exact-version and real key-generation/parse-correspondence check before exercising public ensureKey. When the staged package is absent, retain the existing temporary-cache installation fallback. A present package's failed positive check remains a failure, not a reason to bypass it. The child still calls real public ensureKey, with no substitute implementation.

No production, helper, workflow, manifest/lockfile, header/module reassignment, expected-result, other test, SPEC, use-case or architecture change. ITM-487 and ITM-489 scopes remain unchanged.

## Acceptance

- All three existing release cases pass through the real public ensureKey path with the staged exact package. Matching/public-only keys, persistence/0600 and NotWritable assertions remain unchanged.
- The existing version/key-correspondence positive check still executes for the selected package; standalone preparation retains the existing fallback when staged ssh2 is absent. No failing check is swallowed or skipped.
- Only fixture-preparation bytes in tests/release-itm-284-tunnels-key.test.mjs change. No new test is introduced; unchanged IDs create no new-test counter-proof or behaviour-implementation first-red obligation.
- Preserve actual local TAP and exact source/test/executor pins. The repaired combined main-target PR supplies the already-required actual all-level green CI before the separate Release gate; no old-head blind rerun or failed-check waiver substitutes for it.
