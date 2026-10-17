---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f0537a5e26a527be1dd671a782d48b0c06326143
  - https://github.com/akmaier/agent-m/pull/737
date: 2026-10-17 17:33 UTC
---
# Development → Release testing: ITM-720, the modules view draws its component diagram

**REGISTER**

## Reason

ITM-720, pull request #737 into `sprint/team1/73`, at head `f0537a5e`. It is mergeable, and run 39053971160 passed every
check. It changes 8 files, +250/−13: four of `src/trace-pages/` and four tests.

**Red first.** Both tests-only commits, `6177ce8f` and `46dbeccd`, were red on node (2) with `# fail 6`. The six
failures are the new tests TST-720001 to 720006 (the Scrum Master's saved logs). The second commit changes only the
input of TST-599203, 599009 and 600154. Their undrawn key `modules` became `audit`, since `modules` is now drawn. No
expected value changed.

**The acceptance, as narrowed at its stop, is met.**
- A `modules` descriptor offers the default branch only.
- `moduleFiles` maps `traceGraph`'s MOD nodes and their `follows` and `uses` edges.
- `drawModules` draws through `renderMermaid`. `componentDiagram` is unchanged.
- TST-720001 pins the fixture's diagram and its equality with `componentDiagram` on the same modules. A one-off probe on
  this repository's 54 modules gave the same text, 23126 characters each.
- Four planted faults are caught: `follows` dropped, `provides` dropped, `tagsOf` called, and the no-module branch.
  The nine MOD-trace-pages test files pass 134 of 134, release-sprint-04 among them. ITM-018 passes, and the fetch spy saw
  no network.
- TST-720005 shows one `readMany` for the modules and gaps views together.

**Readings.**
- **No explanation is needed.** `EVERY STEP EXPLAINS ITSELF` concerns "every step that asks something of the person".
  The modules view asks nothing: it offers no choice and only draws.
- **No link to it from the other views.** ITM-680 mounts the route for `#arc`.

**Modules.** `tests/system-itm-599-gaps-view.test.mjs` names MOD-site-frame as well, and its input changed. So
MOD-site-frame joins ITM-720's modules for that test. ITM-720 changes no code of it, and ITM-680's changed tests do not
include that file.

**Findings.** None new. The note that release-sprint-04 still drives the old `#arc` path is ITM-680's next step.
