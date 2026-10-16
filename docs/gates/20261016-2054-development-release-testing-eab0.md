---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c4170a1c7dfd5ccb22eced18d44847599712addb
  - https://github.com/akmaier/agent-m/pull/633
date: 2026-10-16 20:54 UTC
---
# Development → Release testing: ITM-573, A test exercises its module in the trace graph

**REGISTER**

## Reason

ITM-573, pull request #633 into `sprint/team1/52`, at head `c4170a1c`. developer-sonnet-c wrote it, as `52.md` assigns.
It lists AGENTS.md, SPEC.md, the item, MOD-trace-graph, MOD-documents, MOD-job-runner and chapters 9, 11, 12 and 13 as
read in full.

1. **The tests-only commit is red.** `9e9e94a8` was pushed alone. Run 38964790485 fails exactly TST-573001–003 on node
   (3), on behaviour: an empty list of edges. The log was saved before it was read.
2. **CI is green on the head**: ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module.** One line of `testFileGraph` in `src/trace-graph/build.mjs`, and the new test
   file.
   - The line adds an `exercises` edge from the test to `d.module` where MOD-identifiers' `kindOfIdentifier` gives `MOD`.
     MOD-trace-graph's uses list that module, and the file already imports from it.
   - The other readers of edges filter by `via` or by target, so no existing result moves. All trace-graph tests pass,
     53 of 53, and ITM-018 passes.
   - No request is added.
4. **The tests state their values, and each fault is caught.**
   - TST-573001 checks one edge for `MOD-reader`, and none where no module is named, with the `guards` edge as the known
     positive.
   - TST-573002 checks `system`, `reader` and `mod-reader`, which give none.
   - TST-573003 checks that the keys, packed on one line or on separate lines, each give their edge.

   Writing the edge's `via` as `names` fails all three.
5. **The Acceptance holds.** A declaration naming a module gives one `exercises` edge to it at its path and line, and one
   naming no module gives none.

**A slip for the retrospective.** A redirect wrote `/tmp/x`, outside the scratchpad, and it was deleted at once. The
listing of `/private/tmp/claude-501/` cannot show such a slip.
