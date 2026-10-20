---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 174c3d1f908e1245d283376ef603c67e893aab55
  - https://github.com/akmaier/agent-m/pull/1245
date: 2026-10-20 21:41 UTC
---
# Development → Release testing: ITM-798, what is blocked, each with its reason

**REGISTER**

## Reason

ITM-798, pull request #1245 into `sprint/team2/99`, passes on `174c3d1f`. CI is green on 23 of 23 checks.

1. **Red first.** The tests-only commit `56a0de25` was pushed by itself, and node (8) failed on
   `tests/progress-measures-blocked.test.mjs`, the new file, before `blocked` existed. No stub was committed.
2. **The accepted text.** MOD-progress-measures.md:236-240: every item or plan entry that cannot move, with its reason; for
   a gate, the role or check that decides it; for a held module, the other team's sprint and the module.
   - The facts it reads (`model.flow`, `plan.items[].fields.modules`, `jobs`) are `Facts`' own.
   - The brief named `gateStates`. The text decides, and a job waiting at a gate names its gate and its decider through
     the workflow.
3. **"Held by another team's sprint" is built in part.**
   - SPEC.md:1678-1680 holds an item when another team's held item changes a module that the item changes, or one that it
     uses, or uses a module that the item changes.
   - `blocked` covers the first and the last, `overviews.mjs:89-96`.
   - The middle needs the modules an item uses. `Facts` does not carry them, although `productFacts` reads the module
     files. g named this in the code (`:78-79`) and in the pull request, as AGENTS.md §6a.6 asks.
   - It needs a text change, so it is **ITM-1161**, which begins with a draft. It does not stop this item: every case this
     item can see from `Facts` is listed, and the Acceptance's fixture cases are.
4. **Reading.** One passage each of AGENTS.md, SPEC.md and chapters 9, 11, 12 and 13 is named in the description.
