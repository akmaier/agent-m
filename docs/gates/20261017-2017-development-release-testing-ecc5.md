---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - ddbe312e1c7af3b65f092cbd52e29dd3b520cb2b
  - https://github.com/akmaier/agent-m/pull/764
date: 2026-10-17 20:17 UTC
---
# Development → Release testing: ITM-748, the host merges a pull request at the head that was read

**REGISTER**

## Reason

ITM-748, pull request #764 by developer-sonnet-i into `sprint/team2/78`, reworked once on the condition of the rejection
on `ddbe312e` (`docs/gates/20261017-2015-development-release-testing-b970.md`); the head is unchanged, `ddbe312e`.
Checks 1, 2, 3 and 5 hold as recorded there. Check 4 now holds: the description records 14 counter-proofs for the 12
new tests. Replayed on the head in my own checkout, each fault removed afterwards:
- 13, GitLab 409 mapped to Unreachable: only "mergePullRequest on GitLab — a head that moves after it was read is
  refused by the server and is Moved" fails (expected `Moved`, actual `Unreachable`).
- 14, GitHub 401 on the merge answered as PermissionMissing: only "mergePullRequest on GitHub — each failure is named,
  beside the success" fails (expected `TokenRefused`, actual `PermissionMissing`).
Without the faults, 12 of 12 pass.
