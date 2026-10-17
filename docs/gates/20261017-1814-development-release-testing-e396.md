---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 917f3b2e23f4087079255ae018dcca7e1a1bf9cc
  - https://github.com/akmaier/agent-m/pull/741
date: 2026-10-17 18:14 UTC
---
# Development → Release testing: ITM-808, the browser store names the tokens that expire soon

**REGISTER**

## Reason

ITM-808, pull request #741 into `sprint/team1/74`, at head `917f3b2e`. It is mergeable, and run 39057004046 passed every
check. It changes two files, +212/−1: `src/browser-store/index.mjs` and the new
`tests/browser-store-expiring-soon.test.mjs`.

**Red, then code.** The tests-only commit `566386a5` was red in run 39056757355. Its one top-level failure is the new
file, whose export was missing. An uncommitted stub returning `[]` failed six of the nine cases on behaviour, as the
brief asks when a red is only a missing name. The code was pushed after that run had ended and been read (sprint 73's
agreement).

**The acceptance is met.**
- `expiringSoon(store, now)` names the instance's and each product's tokens whose recorded expiry is within fourteen days
  or past, as `MOD-browser-store.md:130` states.
- It reads through the module's own `listSettings`, makes no request and no write, and returns no token value.
- TST-808001 to 009 pin the bounds: 14 days and 15 days, today, past, no expiry, the three kinds, foreign keys, an empty
  store, and the time of day.
- Ten planted faults are caught.
- The 41 files that name MOD-browser-store give the same results on the base and the head. No release result changed, and
  ITM-018 passes.

**Readings.**
- **"Within fourteen days of `now`" is whole UTC days between the dates.** This is accepted. The text names no time
  zone, and it keeps the day count of the old `expiryWarning`, so the live warning does not move. ITM-683's frame test
  uses the same convention.
- **A date such as 2026-02-31 rolls over,** as the old rule does. No text excludes it.
- **The order of the result** is not stated, and the tests sort by key.

**Findings, none new.**
- The Check file missing from the SPEC (`tests/test_expected_results_stated.py`, SPEC.md:1466) is ITM-650 already.
- Fresh worktrees lacking `imapflow` is the known environment gap.
