---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 3a0489426d303839115ce4cf24b8b559fe2de633
  - https://github.com/akmaier/agent-m/pull/1318
date: 2026-10-22 23:52 UTC
---
# Development → Release testing: ITM-615, the recipe backlog-inputs

**REGISTER**

## Reason

ITM-615, pull request #1318 into `sprint/team2/105`, passes on `3a048942`. CI is green on 28 of 28.

1. **The reading, checked first.** The description quotes one passage of each text with file and line: AGENTS.md, SPEC.md
   in full, chapters 9, 11, 12 and 13, process.md, sprints 101 and 105, the item, MOD-work-plans, UC-032 and
   `strategies.mjs`.
2. **Red first, from the full job logs.** The tests-only commit `00d6c51d` fails in two jobs:
   - job 120155047663: `not ok 394` to `401`, TST-615001 to 008, with `# fail 8`;
   - job 120155047435: `not ok 433` and `443`, the pins TST-616010 and TST-619009 of the recipes' keys, with
     `# fail 2`.
3. **The text:** MOD-work-plans.md:259-260, "recipe `backlog-inputs` — the accepted requirements and use cases, those no
   item realises yet, the architecture, and the existing items, which its part carries as artifacts keyed by their
   title".
4. **The functions my readiness reading listed and i does not call: i is right on all three.**
   - **`coverageGaps`** (`src/trace-graph/derive.mjs:157`, MOD-trace-graph.md:201) gives requirements without a use case,
     module or test, and use cases without a requirement. It does not give what no item realises. So "those no item
     realises yet" is the set difference over the existing items' `realises`, computed in the recipe.
     - MOD-work-plans' Uses line names `coverageGaps` for "what no item realises", which `coverageGaps` does not give.
       That line is stale; a text matter, not this item's.
   - **`traceGraph`** serves `moduleOrder` in that Uses line. This recipe orders no modules.
   - **`queues`** is not needed for requirements. SPEC.md:835-837, A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS
     WRITTEN, makes a requirement the SPEC holds an accepted one. Use cases are accepted by `statuses`.
5. **Question 4 is settled by the texts, with no question to akmaier.** A requirement the SPEC holds while an open entry
   proposes to change it is accepted in the text the SPEC holds. The entry is a proposal until it is accepted and written
   (SPEC.md:835-837). The recipe gives the held text, and TST-615003 shows that a requirement standing only in an open
   queue is not given.
6. **Only the items' part carries artifacts. That is what the text says.**
   - MOD-work-plans.md:260 gives artifacts to the items' part only.
   - MOD-job-runner.md:234-236 makes `artifacts` what `candidate-classes` classifies a draft against. `propose-items`
     drafts items, so it is classified against items, not requirements.
   - So for this kind `notFitting` counts no requirements or use cases (MOD-job-runner.md:115-118). This follows from the
     two texts, and the prompt bar's "how many requirements and use cases fit" (UC-019 4a) says 0 for it. It is noted,
     not a finding of this item.
7. **`sourcesFor`** moves `architecture-and-model`'s rule for a part's sources into one helper of the same file, which both
   recipes call. That is principle 2, nothing twice, inside the item's own file, and `architecture-and-model`'s tests
   pass unchanged.
8. **Pins.** TST-619009 and TST-616010 (`tests/work-plans-backlog-checks.test.mjs:180-190`) are MOD-work-plans tests,
   within the item's module. Both are named in the description.
9. **`propose-items`** now prepares past its recipes, and meets UnknownStrategy at its writer `backlog-items` (ITM-617).
   TST-615008 shows it.
