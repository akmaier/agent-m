---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 52f0a962e9d561d7a3b40ca49f5f449d29e29902
  - https://github.com/akmaier/agent-m/pull/1106
date: 2026-10-19 17:12 UTC
---
# Development → Release testing: ITM-1025, a job running in another browser's tab is listed with its record and that note

**REGISTER**

## Reason

ITM-1025, pull request #1106 into `sprint/team2/97`, passes on `52f0a962`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `f3ff239d` and `dafd6843` hold only tests, and CI failed on `f3ff239d`.
2. **The accepted text.** MOD-runtimes' Data, "This browser", accepted with `904e91b2`. The code follows it:
   - `queueJob` alone makes the identifier: `thisBrowser(true)` reads or makes `browser` in the store of the instance that
     `instanceOfPagesAddress` names.
   - Without a store, it makes this tab's own identifier, kept in memory (`tabOwn`).
   - `liveState` only reads: `tookOnTab` counts as this browser's a bare `tab`, this browser's identifier and this tab's own.
   - A job another browser took is `reachable: false`, with the reason that its live state and log exist only in that
     browser's tab.
   - It uses only what MOD-runtimes' uses name: `openStore`, `readSetting`, `writeSetting` and `instanceOfPagesAddress`.
3. **The tests that pin the change** (agreement 95). `tests/runtimes-tab.test.mjs` pinned `by: tab`. Its two pins now read
   `tab <16 hex>` (MOD-runtimes.md:172), each in its own commit. They are unit tests, not release tests.
4. **Reading accepted.** Such a job is listed through `listJobs`, with `source.reachable` false and its reason
   (TST-1025004). The note is the source's reason, and ITM-1078 is the explanation it folds.
5. **Scope.** `src/runtimes/` and the tests that name MOD-runtimes. The item's other modules need no change.
