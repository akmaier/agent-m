---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 1cd372056c6c1afb9264cc67feb5535a326ecc0b
  - https://github.com/akmaier/agent-m/pull/617
date: 2026-10-16 18:46 UTC
---
# Development → Release testing: ITM-536, A product's facts, read once

**REGISTER**

## Reason

ITM-536, pull request #617 into `sprint/team1/49`, at head `1cd37205`. developer-sonnet-d wrote it, as `49.md` assigns.
It lists AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `49.md` and MOD-progress-measures as read in full, with
the parts it uses of six other module files.

1. **The tests-only commit is red.** `d245fee7` was pushed alone. Run 38947703654 failed on it, with the new test file
   unable to load its export.
   - The stub run, returning `{}`, was not committed, and all 15 tests fail on their assertions.
   - After the red, the developer corrected one expectation of its own new TST-536013, and the pull request says so, as
     in ITM-535 and ITM-547.
2. **CI is green on the head**: run 38949366607, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module.** `src/progress-measures/facts.mjs` and `index.mjs`, and the new test file.
   - No existing test changes, as `49.md` said.
   - ITM-018 passes, and the `fetch` spy sees no network.
   - The whole suite fails as on the base.
   - The callers of each other module's function were read.
4. **The tests state their values, and each fault is caught.** Eight planted faults are each caught. Among them, asking
   `containsCommit` for every merged head fails TST-536006–008.
5. **The Acceptance holds.**
   - With the scope `work`, `productFacts` reads each fact the item names once.
   - It derives `plan.states` with `itemStates`, and `held` with `heldItems`, asking `containsCommit` for exactly the
     heads `undecidedHeads` names.
   - Every other field is `"unknown"`.
   - The scope `all`, or none, is refused before any request, as the item leaves it to a later item.

The readings in the pull request are within the item and the module file:
- `info` stays `"unknown"`, and the repository's information is used only for the branch's name;
- a plan is `docs/plan/order.md` or a step under `docs/plan/`, otherwise the backlog;
- a clone without the server's API gives `HEAD` and pull requests `"unknown"`;
- the gate states are `[]` for a workflow not known;
- the four failures of `instanceAt` that the file names are caught, and no other.

## Taken up outside this gate

- **An import cycle through a module with a top-level `await`.** On Node 26, locally,
  `tests/system-uc-019-change-by-prompt.test.mjs` fails with "Cannot access 'view' before initialization". CI runs Node 22
  and passes.
  - **The path.** `src/progress-measures/index.mjs` now loads `facts.mjs`, which imports `src/model-catalogue/index.mjs`,
    a module with a top-level `await`. That module sits on the path review pages → `conversation-draft` → site frame →
    notifications → `checks` → progress measures.
  - **Same kind as before.** The known Node 26 failure of `release-sprint-16` is of the same kind.
  - It does not hold this gate, since the declared CI passes. It becomes ITM-566.
- **The eighth path outside the scratchpad**, the second in this sprint, goes to the retrospective.
