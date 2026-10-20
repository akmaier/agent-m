---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 42c1958f06b1c65e8ab16e6bb6a3c0d8d81a3cb1
  - https://github.com/akmaier/agent-m/pull/1159
date: 2026-10-19 20:37 UTC
---
# Development → Release testing: ITM-1082, the release's notes name the publisher of each signed platform

**REGISTER**

## Reason

ITM-1082, pull request #1159 into `sprint/team2/97`, passes on `42c1958f`, after its rejection on the same head. CI is green, on
20 of 20 jobs. Only the pull request's body changed.

1. **The rejection's point is met.** g planted and recorded 8 faults, each caught, and every new case has its own:
   - TST-1082001: a kept prefix; the publisher not recorded; Linux recording a name.
   - TST-1082002: macOS or Windows accepting no name.
   - TST-1082003: a Linux line written; the Windows line dropped.
   - TST-1082004: a blank name accepted; the Windows line dropped.
2. **The local scaffold, accepted.**
   - TST-1082001 needs the tunnel check, which needs `ssh2`. So g commented out the call locally, outside the branch, to see
     that test's faults.
   - The scaffold alone failed none of the four tests. That is the control showing that it hides no fault.
   - CI runs the real tunnel check, and is green.
3. **The rest stands as accepted at the first gate:**
   - red first, `8e7e6627`;
   - the shared fake's change;
   - the readings;
   - the named limit, that the real codesign and PowerShell output are unverified.
