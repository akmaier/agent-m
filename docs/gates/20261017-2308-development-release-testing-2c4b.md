---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 43b22f68094e04f4d5da40f52b45cf2466b501eb
  - https://github.com/akmaier/agent-m/pull/810
date: 2026-10-17 23:08 UTC
---
# Development → Release testing: ITM-847, the main page reads the jobs' states again while it is open

**REGISTER**

## Reason

ITM-847, pull request #810 into `sprint/team1/79`, at head `43b22f68`. It is mergeable, and run 39077701632 passed twelve of
twelve. It changes five files, +496/−29, among them the new `src/main-page/reread.mjs`.

**Red, then code.** The tests-only commit `b20330b5` was red in run 39077492110 on exactly TST-847001 to 013. The code was
pushed after the run had ended.

**The draft stop's decisions are built.**
- Every 60 seconds, each card with a token reads its commit and tree again: 2 requests, or 3 with a changed record. Only
  the build's rows move. A card without a token is not re-read.
- **A used-up limit waits until `resetsAt`,** card by card, since each token has its own limit (TST-847011, 012).
- **With no reset time it waits a minute** (TST-847013). The module's text says nothing for that case, and this reading is
  accepted.
- The old TST-847008 used the limit as its general failure, which the wait now contradicts. It now uses an answer of 500,
  a named change.
- Four planted faults are caught.
- **The fetch spy,** a preload checked against its known positive, saw no request over 86 tests in seven files.
- `home` keeps its 56 requests with a token. The TST-827 tests are unchanged, `test_main_page.py` passes, and ITM-018
  passes.

**The refusal.** A compound command was refused with "Split it into plain, separate commands". The edits were made with
the Edit tool, which `79.md`'s ruling allows.

**Findings.**
- **A long-hidden page re-reads at its first tick.** That is ITM-858's.
- **`liveStatesOf` shows a job as not reachable** when `liveState`'s run listing meets a used-up limit. A used-up limit is
  not an unreachable runtime (UC-046 4a). This is noted in ITM-857, which changes those listings.
