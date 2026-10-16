---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 5eca9aae9e7ef31a5e9ae8684a38a85b6f32c8b0
  - https://github.com/akmaier/agent-m/pull/642
date: 2026-10-16 22:43 UTC
---
# Development → Release testing: ITM-572, The prompt bar prepares a hand-over of every kind on every page

**REGISTER**

## Reason

ITM-572, pull request #642 into `sprint/team1/54`, at head `5eca9aae`. developer-sonnet-c wrote it. The head merges
the sprint branch after ITM-567 (`182d110b`), and no pushed commit was rewritten.

1. **The tests-only commit is red.** `a0c90f2f` was pushed alone, and run 38975114661 failed on it. The Scrum Master
   read the saved logs, and only the new tests failed:
   - TST-572001–003 in node (4);
   - TST-572005 and 572006 in node (3);
   - the file of TST-572007 in node (5), on the missing export. Against an uncommitted stub it fails on behaviour.

   TST-572004 passes on the base by design: it guards that a foreign `DuplicateStrategy` still throws.
2. **CI is green on the head**: run 38977109155 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's two modules**, with new tests and their fixtures, and no existing test changed.
   - MOD-prompt-bar: `handOverStrategies`, the seven built sets, exported.
   - MOD-site-frame: `start.mjs`, which registers each set once.

   TST-531012, 531013 and 506009 pass, as the start foresaw. ITM-018 and the Python checks pass.

   The UC-019 counter-proof table gives the same result on both bases and on the head: 29 faults caught, 42 tests, no
   failure, 2 todo. That follows sprint 53's agreement. The full local suite fails the same 57 tests on the base and on
   the head, which are the environment's coding-agent, mail and Bridge tests. CI runs everything green.
4. **Each of the six planted faults is caught.**
5. **The Acceptance holds.**
   - Nine kinds prepare without `UnknownStrategy` from the main and the review pages: derive-requirements,
     change-requirements, derive-use-cases, change-use-case, derive-architecture, review-architecture,
     check-for-persons, check-resource and converse.
   - No set is registered twice.
   - The tests show that the check still finds a missing strategy:
     - `implement` lacks its writer, which is ITM-605;
     - `draft-plan` lacks `architecture-and-model`.

**The readings are those the start settled.** `start.mjs` skips a set already registered on the load. It skips a
`DuplicateStrategy` only when its first owner is the owner now registering.

**Found: MOD-work-plans' `workStrategies` is not built, and no item held it.** `draft-plan` names its recipe
`architecture-and-model`, which MOD-work-plans' file gives with the rest of `workStrategies`. ITM-608 builds it.
