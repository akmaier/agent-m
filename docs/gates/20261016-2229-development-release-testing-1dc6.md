---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 341aa75372a00844ce11fa95e3c0ddbbf08a808d
  - https://github.com/akmaier/agent-m/pull/641
date: 2026-10-16 22:29 UTC
---
# Development → Release testing: ITM-567, The writer branch-and-pull-request

**REGISTER**

## Reason

ITM-567, pull request #641 into `sprint/team1/54`, at head `341aa753`. developer-sonnet-a wrote it.

1. **The tests-only commit is red.** `3c88de46` was pushed alone, and run 38975053300 failed on it. The Scrum Master
   read the five saved logs: exactly the eight new tests TST-567001 to 567008 failed, and TST-367002, whose change the
   start named (its file runs in two shards). Against an uncommitted stub, the six writer tests failed on behaviour.
2. **CI is green on the head**: run 38975682984 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's three modules.**
   - MOD-runtimes: the new part `pull-request.mjs`, re-exported.
   - MOD-workflow-entries and MOD-desktop-shell: one entry each.
   - TST-367002 changes as named, with its header.

   The whole suite fails the same seven known tests on the base and on the head. ITM-018, the Python checks and
   `test_no_backend` pass, and the fetch spy saw only loopback requests.
4. **Each of the eleven planted faults is caught.**
5. **The Acceptance holds.**
   - On a server: it opens the pull request with the description, or returns the one that stands.
   - On a clone: it returns what the agent reports.
   - `NoBranch` and `NoCommits` are named.
   - The writer is registered in CI and on a Bridge.

**The readings are taken.**
- The branch is the answer's, read with `readSnapshot`; `NotFound` becomes `NoBranch`.
- `NoCommits` means the branch stands at the job's snapshot. `readHistory` is not in the Uses.
- New tests are new against the snapshot's version of each file.
- A local host is one whose `listPullRequests` throws `NotSupported`.
- A pull request that stands open or merged is returned, not opened again.
- The base is the branch `repositoryInfo` names.
- The description carries nothing of the instruction.

**One reading departs from the text, and is taken as interim.** MOD-runtimes says the description names "the plan step
or backlog item, its modules". The writer names the modules the new tests declare instead, because MOD-runtimes' Uses
give it no way to read an item's modules.
- That is the developer's honest limit of the Uses, named in the pull request.
- The draft committed with this gate adds `MOD-trace-graph.traceGraph` to MOD-runtimes' Uses, as MOD-run-planner reads
  an item's modules.
- ITM-607 changes the writer once the draft is accepted.

**A test's expected value changed between the red and the code.** `d38029d0` corrected TST-567001's order of modules
and requirements to "the order the new tests are found", before the implementation commit. No text fixes that order,
and the header states it. It goes to the sprint's feedback all the same: an expected value is fixed before the red run.

**Found: no adapter opens a pull request.** `openPullRequest` throws `NotSupported` for every host
(`src/repository-hosts/index.mjs:354`). So in CI the writer returns a pull request that stands and otherwise throws.
ITM-606 builds the GitHub and GitLab adapters.
