---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 49ff63b3e3f4ac72b0cb82717a42567ed92afc0b
  - https://github.com/akmaier/agent-m/pull/634
date: 2026-10-16 21:14 UTC
---
# Development → Release testing: ITM-568, The recipe implementation-inputs

**REGISTER**

## Reason

ITM-568, as cut, in pull request #634 into `sprint/team1/52`, at head `49ff63b3`. developer-sonnet-c wrote it.

1. **The tests-only commit is red.** `cc5b57f4` was pushed alone. Run 38966242006 on that commit failed four shards, and
   the logs were saved before they were read:
   - node (0) and node (2) failed TST-367002;
   - node (5) failed TST-568009;
   - node (6) failed `tests/run-planner-inputs.test.mjs` on the missing `src/run-planner/`.

   An uncommitted stub, a recipe returning `[]`, fails all nine new tests on behaviour.
2. **CI is green on the head.** Run 38967509978 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's three modules.**
   - MOD-run-planner: `index.mjs` and `inputs.mjs`, both parts that its file names.
   - MOD-workflow-entries: `OFFERED` gains one entry.
   - MOD-desktop-shell: `STRATEGIES` gains one entry.

   TST-367002 is the one existing test whose expected result changes, and the item names it. Its header changed with it,
   and ITM-018 passes.
   - The three tests that register their own stand-in `implementation-inputs` pass with no `DuplicateStrategy`.
   - `test_no_backend` passes, and the `fetch` spy saw no request.
4. **Each of the four planted faults is caught.**
5. **The Acceptance holds.**
   - TST-568001 gives the exact parts for an item with two modules, each naming its sources.
   - `implement` prepares without `UnknownStrategy`.

**How the developer read an item's modules is taken.** The item said to read them with `artifactSchemas().item`.
MOD-run-planner's accepted Uses do not name `artifactSchemas`, so the item named an interface the module may not call.
That was the Product Owner's miss. The developer read the same field through an interface the Uses do name:
- `traceGraph`'s `changes` edges are built from an item's `modules` (`src/trace-graph/build.mjs:48`);
- its `level` is a fact of the node (`:49`).

**How the developer found the subsystem is taken.** The decision is the one that `designs` the step's modules; the code
does not read `integrates`. The cases agree for every step that UC-045 produces.
- MOD-run-planner's accepted text gives "the subsystem's decision".
- MOD-trace-graph's check holds that "A module belongs to the subsystem of the one decision that designs it"
  (`src/trace-graph/checks.mjs:96`). It reports a module that more than one decision designs.
- UC-045's table says a subsystem step integrates "the subsystem's modules".

They would differ only for a step whose modules span two subsystems, or whose `integrates` names another decision. Such
a plan contradicts UC-045, and no text asks this recipe to refuse it (AGENTS.md §6a.4). So this needs no draft and no
further test.

The item's condition "a step that names a subsystem's decision and no module" was a second miss of the Product Owner's.
The item schema requires `modules` to be "not empty" (MOD-documents, the item schema). Dispatching on `level`
(`module`, `subsystem`, `system`), as UC-045's table divides the steps, is the reading the texts support.

**For the retrospective:**
- **A partial reading.** MOD-desktop-shell was read only from Responsibility to Uses, though the item names it. AGENTS.md
  §1 asks for the architecture affected by a change to be read before editing it, and the developer named the gap
  plainly.
- **A test file in two shards.** TST-367002 failed in two shards, node (0) and node (2), so its file seems to run twice.
  The shard split is a question for the test configuration.
