---
id: ITM-475
title: Team 2 integration CI runs the real increment
level: system
realises:
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
  - NO SERVER
  - A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
  - AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
modules:
  - MOD-settings-pages
  - MOD-desktop-shell
  - MOD-tunnels
  - MOD-test-schedule
  - MOD-repository-hosts
builds_on: []
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
and native Electron tests execute the actual app in the Linux display environment. The tunnel runtime resolves ssh2
from the Bridge's package manifest, as the existing mail runtime does, rather than relying on Node's environment-only
search path that Electron does not use.

A repository-token Test records a credential refusal only when the host names TokenRefused. A rate limit, missing
permission or transport failure keeps the previous conclusive test and its timestamp, or leaves an absent test absent,
while the current request's answer is shown separately. An HTTP 401 names the rejected authentication and token with
its renewal link without asserting an unobserved expiry, regeneration or deletion.

## Acceptance

- Repair each failure at its observed node, with a working positive and the existing test's failure before the fix.
- Every required test remains in CI; job scheduling keeps each job within the existing two-minute limit.
- The integration pull request is green before its Product Owner merge decision.
- No SPEC, use-case, or architecture requirement changes.
