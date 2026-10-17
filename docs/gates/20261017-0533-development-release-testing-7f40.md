---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - d46f3810dc24ef50f773db32d04ce21e964876a0
  - https://github.com/akmaier/agent-m/pull/690
date: 2026-10-17 05:33 UTC
---
# Development → Release testing: ITM-597, An opened requirement shows its traces and open proposals, each linked

**REGISTER**

## Reason

ITM-597, pull request #690 into `sprint/team1/65`, at head `d46f3810`. developer-sonnet-d wrote it.

**What holds.**
- **Red.** Three tests-only commits were each pushed alone before the code, and each was red: runs 39004519195 (16),
  39004744506 (19) and 39005077231 (19).
  - `07818b4b` changed TST-597008's expected value after the second red, and ran red again before the code, as sprint
    56's agreement asks.
  - The two todos, TST-418121 and 418125, are existing ones.
- **The draft run** over 58 module and caller files changed no existing test (sprint 64's agreement).
- **CI and merging.** CI is green, ten of ten in run 39006355437, and the pull request is mergeable. TST-472516 and
  472518 pass before and after.
- **The measurement** (sprint 59's agreement: "states the measurement on the base it rests on"):
  - drawing `#spec` stays at 12 and 127 requests, on base and head;
  - opening a requirement costs 5 on the fixture, 11 GraphQL batches here with a token, and 1139 without a token;
  - reopening costs 0.

**Rulings.**
1. **The 1139 requests of a first opening without a token are accepted here, and bounded by ITM-574.**
   - The start's condition was that drawing must not grow, and it did not.
   - The graph is read once per version, on a person's click, and kept.
   - What a page load and an opening may cost is the rule ITM-574 brings, with the SPEC queue `2026-10-17` that waits
     for akmaier. ITM-574 now records this opening's count.
2. **The view's own folds are rejected.**
   - The notes of 2b and 5a are a `details` of the view's own. MOD-trace-pages' Uses name `MOD-site-frame.explain`
     (`docs/architecture/MOD-trace-pages.md`, Uses), so two rules for one fold stand side by side. ITM-588's first gate
     and ITM-643 were rejected for the same thing.
   - The developer's reason was that the topics belong to MOD-site-frame's `explanations.md`. That is so, and it is the
     start's gap: ITM-597 lacked MOD-site-frame among its modules, which ITM-643 had.
   - MOD-site-frame now joins ITM-597's modules.
3. **The view's own rule of what an open entry changes is rejected, and the open proposals are cut into ITM-648.**
   - `proposalsOf` reads each proposal as a SPEC section and compares it with the section of the entry's anchor,
     ignoring `until`.
   - MOD-spec-changes states that rule as `entryView`'s `impact` (`changed`, `withdrawn`, `added`). Sprint 60's agreement
     (`60.md:121-122`) reads: "where an item needs another module's rule, the start names its interface in the Uses, or
     the item waits for a draft".
   - `entryView` is not in MOD-trace-pages' Uses. So a draft for akmaier adding it is committed with this gate, and the
     open proposals with 5c wait in ITM-648.
   - The start named `queues` and not how "touching" is decided. That was the start's gap too.
4. **Links.**
   - The links to the review pages' routes (`use-case`, `decision`, `module`, `spec-entry`) and to `library` are accepted.
     They are the frame's routes, written in the frame's form (`src/site-frame/routing.mjs`, `fragmentOf`). The live page
     answers them once it starts the site through `start.mjs`, as `64.md`'s reachability reading takes it.
   - A test's link is asked to follow MOD-trace-pages' Interfaces, which give an opened row as "`trace/<key>/<row>`". So
     its parameter is `row`, not a `test` of the developer's own.
5. **Readings taken.**
   - **Items are not listed.** Neither the requirement nor UC-020 step 5 names them.
   - **5b lists the unknown names that the opened requirement's own artifacts name.** The view-wide list is UC-020 step
     7's, the gaps view (ITM-599).
   - **The proposal rules** go with point 3.

**What is asked, in new commits, with nothing rewritten.**
1. **The open proposals and 5c leave this pull request**, their code and their tests, for ITM-648.
2. **The notes of 2b and 5a become `explain` topics** in `src/site-frame/explanations.md`. Merge `sprint/team1/65` in
   first, with ITM-643's topics.
3. **A test's link uses `row`.**
4. **TST-597007's wait is bounded**, so that a fault fails it rather than hanging. This is the developer's own finding.

Each test that changes is run red against the code it replaces, or shown by a planted fault where no red is possible
(sprint 56's agreement).

**Findings registered with this gate** (sprint 63's agreement):
- **The 522 unknown names**, from `guards:` entries with a step in parentheses, are ITM-649. MOD-test-document's
  `guards` format is "the requirements it guards by name, or use cases by identifier".
- **`tests/test_expected_results_stated.py`, named by SPEC.md and missing,** is ITM-650.
- **`readProblem` is still not built.** ITM-601 now also holds this view's `problemLine`.
- **TST-597007's hang** is asked above.
