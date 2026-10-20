---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - a2924474cdb5f4458031588988c6b6ab9e68ef63
  - https://github.com/akmaier/agent-m/pull/1143
date: 2026-10-19 19:45 UTC
---
# Development → Release testing: ITM-1036, the steps of changed, added or removed modules are marked after an architecture change

**REGISTER**

## Reason

ITM-1036, pull request #1143 into `sprint/team2/97`, passes on `a2924474`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `3ec3c53f` holds only tests, and CI run 39311946888 failed on it.
2. **The accepted text.** MOD-implementation-pages.md:163-165: the route `plan` marks a step where `planFindings` with the
   history names its module or subsystem changed or removed since the step was saved, and names a module without a step.
   - `plan.mjs` asks `planFindings` with the host's history, and shows its findings under AN IMPLEMENTATION PLAN ASSEMBLES THE
     SYSTEM FROM ITS MODULES as marks. Those are the findings the text names (ITM-613's reading 4).
   - It writes nothing. A history that cannot be read draws the page without marks.
3. **f's reading, accepted.**
   - The page passes no workflow (`null`), so the phase check and the graph's checks stay with `plan-checks`, on a drafted
     plan.
   - `planFindings` reads the workflow only for the phase check (`workflow?.phases`). The page shows only the findings above,
     so the result is the same.
4. **Planted faults.** f planted 7. The one first uncaught got TST-1036005.
5. **Scope.** `src/implementation-pages/plan.mjs` and its tests.
