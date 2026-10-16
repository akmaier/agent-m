---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - caec78546a16e98cfd6363206731db62abe03685
  - https://github.com/akmaier/agent-m/pull/583
date: 2026-10-16 13:28 UTC
---
# Development → Release testing: ITM-498, CI runs a task a conversation handed over

**REGISTER**

## Reason

ITM-498, pull request #583 into `sprint/team1/43`, at head `caec7854`. developer-sonnet-d made both commits. It lists
AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `43.md`, MOD-workflow-entries, MOD-runtimes and UC-049 as read in
full. It names the callers it read: `agentDriver` in `src/bridge-jobs/watch.mjs`, `diagnoseEndpoint` in `testEndpoint`
and the Bridge's handlers, and `pullRequestFacts` in `src/product-process/done.mjs`.

1. **The red commit.** The tests-only commit `037e151d` was pushed alone, and CI was red on it (run 38907340874, node
   (0)). Exactly TST-498001 to TST-498006 failed, on behaviour.
2. **CI is green on the head**: ten of ten jobs, run 38907643601. Locally, the tests of the job workflow and the release
   and system tests of UC-004, UC-006 and UC-010 pass. The exceptions are the known TST-320321902 and
   release-sprint-16, which fail the same way on the base.
3. **The changes stay in the item's scope.** `src/workflow-entries/product.mjs` and `compose.mjs`, and one new test file
   naming MOD-workflow-entries. No existing test changed.
4. **The new tests.** They state their values in their own text, and every search for the task has a known positive. Ten
   planted faults are recorded in #583.
5. **The Acceptance holds.**
   - A dispatched hand-over runs a fixture agent with the task and writes it nowhere.
   - A branch whose commit message holds the task is refused, with nothing merged.
   - `onRecordsChanged` leaves the job to `onDispatch`.
   - A dispatch without the task ends failed with the reason named.
   - An unreachable endpoint ends failed with `diagnoseEndpoint`'s reason and the routes that would work.

**The developer's three open points, settled from the texts.**
1. **`routesFor`.** MOD-workflow-entries names "the routes that would work — a self-hosted runner, or a Bridge", and its
   Uses has no `routesFor`. The code names exactly those. The item's wording, which named `routesFor`, is mine and is
   corrected.
2. **"Pull request text".** The module can read a pull request only through `pullRequestFacts`, whose `PullRequest` has a
   title and no description. And a run whose writer opens no pull request has no messages to read, since `readHistory`
   is not in its Uses. The code checks what the accepted interfaces reach: the commit messages and the title. Reading the
   description and a branch without a pull request needs a change of two module files. So:
   - both are drafted on `main` for akmaier's acceptance — `PullRequest.body` in MOD-repository-hosts, and `readHistory`
     in MOD-workflow-entries' Uses;
   - ITM-537 (the description) and ITM-538 (the refusal by it and without a pull request) are registered.
   This does not hold the gate: the item's Acceptance holds for what the accepted interfaces can read.
3. **The diagnosis of a failed endpoint.** The code passes `diagnoseEndpoint` an error without a status, so a refused key
   reads as unreachable. The Acceptance's case, an unreachable endpoint, holds. Naming the other reasons as
   `diagnoseEndpoint` gives them is registered as ITM-539.

Also registered, from #582's gate request: ITM-540, the prompt bar fixed to the bottom of the window, as MOD-prompt-bar's
file says.
