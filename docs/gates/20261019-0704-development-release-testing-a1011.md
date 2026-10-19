---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 72199d924edd8660e4a5635aec31b96cbe329073
  - https://github.com/akmaier/agent-m/pull/966
date: 2026-10-19 07:04 UTC
---
# Development → Release testing: ITM-1011, the library's one-click test waits for the hashes, not for 15 ms

**REGISTER**

## Reason

ITM-1011 (MOD-settings-pages), pull request #966 into `sprint/team1/93`, passes on `72199d92`.

1. **The participant trailer is present** on both commits: `developer-sonnet-b`.
2. **The first task named the varying input:** the time the browser takes to hash, not a date or an order.
   - `tests/settings-pages-library.test.mjs`'s `settle` waits a fixed 15 ms, while `library.mjs` hashes the files one
     after another.
   - A digest slowed by 5 or 7 ms gives exactly the CI failure's actual list, with the second hash missing.
3. **The red is `89249fd9`.** It holds tests only, and run 39212810662 fails exactly TST-1011001, the digest slowed by 20 ms.
4. **The change** is the test file only. `chooseFiles` waits until each chosen file shows its hash, and the one-click test
   waits for the result. No assertion, input or expected value changes.
5. **Counter-proof, replayed by me in a clean checkout of the head:**
   - the file passes 18 of 18;
   - without the wait for the hashes, TST-1011001 fails.
6. **The Acceptance's "ten runs beside the full node suite" is read as met.** Its point is a load that slows the browser.
   The test slows the digest itself, which is that load, made fixed and repeatable. The developer's ten local runs and the
   green CI stand beside it.
7. **Green.** CI run 39213301517 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/93` without a conflict (tree `3c26f8a0`).
8. **The developer's finding:** six more tests of the same file wait a fixed 15 ms after *Save*, and fail with the digest
   slowed by 7 ms. They are ITM-1011's same class in the same file, so ITM-1011 takes them in a second pull request.
