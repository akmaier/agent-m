---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0810d78798cb189e278c6a89fc1498bcba181cda
  - https://github.com/akmaier/agent-m/pull/562
date: 2026-10-16 07:51 UTC
---
# Development → Release testing: ITM-527, UC-006's system test waits by time, not by turns

**REGISTER**

## Reason

ITM-527, pull request #562 into `sprint/team1/38`, at head `0810d787`. developer-sonnet-e made the one commit.

1. **No red commit is required.** ITM-527 adds no behaviour and is an item of a system test, so check 1 does not apply,
   as the start decision named.
2. **CI is green on the head**: ten of ten jobs on the first attempt, run 38869655875. Locally, the file passes 22 of 22
   in five runs.
3. **The changes stay in the item's scope.** Only `until()` in `tests/system-uc-006-approve-spec-change.test.mjs`
   changed. It polls until ten seconds have passed, yielding with `setImmediate`, checks once more at the limit, and
   fails with `waited for <what>`. No expected result changed, and no other file. The six other files that wait by
   turns are named in the pull request and left unchanged.
4. **The counter-proof**, recorded in #562. A condition that never holds fails with "waited for a never-true condition"
   after 10,001 ms against the 10,000 ms limit. A condition that holds on its fourth poll returns at once.
5. **The Acceptance holds.**

**A gap in the process, for the retrospective.** The developer says it did not read chapter 13 of the book in full before
the work. `AGENTS.md` §1 ("What an agent reads for its work") requires that chapter for tests. That rule binds every
agent, but it is not among the checks of this gate (`docs/instructions/product-owner.md`), and `AGENTS.md` §6a.4 forbids
adding a check of my own. The change is a wait helper that changes nothing a test expects, so the gap is recorded, and
it does not decide the gate. The developer named it openly in the pull request.
