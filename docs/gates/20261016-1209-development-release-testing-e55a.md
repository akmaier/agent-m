---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 603485f9903a69bf628285c02ab62b5da94a9fdb
  - https://github.com/akmaier/agent-m/pull/575
date: 2026-10-16 12:09 UTC
---
# Development → Release testing: ITM-494, The routes of a subagent and of an endpoint whose key is a CI secret

**REGISTER**

## Reason

ITM-494, pull request #575 into `sprint/team1/41`, at head `603485f9`. developer-sonnet-c made the tests and the code.
developer-sonnet-e, who built none of the routes, made the change of the release test TST-375101. Both list what they
read in full, SPEC.md and the chapters the work needs among it.

1. **The red commit.** The tests-only commit `51a20f86` was pushed alone, and CI was red on it (run 38896389759). It
   failed on exactly the item's 13 tests:
   - the five changed tests TST-472706 to TST-472710 and TST-472598, on the new signature;
   - the seven new tests TST-494001 to TST-494007.
   No other test failed. The developer's stub run — the old body behind the new signature — passes the six changed tests
   and fails the seven new ones on their expected values.
2. **CI is green on the head**: ten of ten jobs. The pull request is mergeable.
   - Locally, 444 tests of MOD-runtimes, MOD-resource-list, MOD-review-pages and MOD-participant-list pass.
   - Of the 60 release files, the branch now differs from the base only by TST-375101, fixed in `603485f9`. Its local run
     is 1 of 1, since release files do not run on a pull request into a sprint's branch.
3. **The changes stay in the item's scope**, MOD-runtimes, MOD-review-pages and MOD-resource-list.
   - `src/runtimes/routes.mjs`, with `routesFor(participant, participants, product, needs)` as accepted at `4345829a`.
   - `src/review-pages/jobs.mjs`, `prompt.mjs` and `requirements-prompt.mjs`, which pass the page's participants.
   - In the tests that call `routesFor` — TST-472706 to TST-472710, TST-472598 and TST-375101 — only the call changed, as
     the item names them, and every expected result stays.
   - The new TST-494001 to TST-494007.
   - The module imports only `eligible` and `reachedThrough`, both in its Uses.
4. **The new tests.** They state their values in their own text. Ten planted faults are recorded in #575, each caught.
5. **The Acceptance holds, with the values the start decision named.**
   - A subagent that `eligible` keeps gets its starter's offers; one it leaves out gets none.
   - `endpoint <name> secret <NAME>` gets the tab's offer and then the hosted runner's, by the CI agent's rule.

**The readings named in #575 are within the accepted texts.**
- A chain of subagents is followed, each step by `eligible`, and a ring gets no offer.
- The drafting page passes the whole register.
- TST-375101 holds no register, so its call passes the one CI agent it asks about.
- Naming the subagent in the job's input is left to ITM-495 and ITM-505, as named.
