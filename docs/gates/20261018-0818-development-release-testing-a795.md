---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 9f39e01d5ed76b679f4095b0622050e4d918726b
  - https://github.com/akmaier/agent-m/pull/863
date: 2026-10-18 08:18 UTC
---
# Development → Release testing: ITM-881, a job whose runtime is unreachable is listed with its source not reachable

**REGISTER**

## Reason

ITM-881, pull request #863 into `sprint/team2/89`, at head `9f39e01d`. Its acceptance was widened in ad98d2fd to MOD-main-page and MOD-prompt-bar.

- **Red first.** The tests-only commits `9ef9fca2` (TST-881001) and `fbb0bc7d` (TST-881002) were red in runs 39109859166 and 39110407694.
- **CI.** Run 39110493954 passed 12 of 12 jobs on the head merged into `e001d8f2`. The sprint's head has since moved to `dccd7cc3`, a docs-only change, and the head still merges cleanly.
- **Scope.** The five changed files are all within the widened scope. `tests/main-page-jobs.test.mjs` is unchanged, so TST-509001 and TST-509003 pass with no expected value changed.
- **Fix.** `listJobs` gives the source as not reachable, with the live state's reason. `listOf` and `followJob` check the live state before `source.reachable`. The pull request gives the call path for both callers.

**Replayed on the head with LC_ALL=C**, after the bridge-build install:
- 206 test files that import or read the changed files, including 21 release tests among which are release-uc-017 and both release-uc-019 tests.
- Result: 2025 tests, 0 fail.
- Four counter-proofs failed as expected: follow.mjs order (TST-881002), jobs.mjs order (TST-509001/003), the ledger condition widened, and the reason set to null (TST-881001).

**For a new item:**
- When a CI server fails every call, a failing `jobLog` in `followJob`'s `logOf` replaces "The runtime is not reachable" with "The job could not be followed". TST-881002's fixture fails only the first call, so this case stays hidden.
- `tests/bridge-job-task-492.test.mjs` does not use `listJobs`. It passed 44 of 44 runs, so its flake was not reproduced.
