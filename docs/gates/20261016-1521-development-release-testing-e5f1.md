---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 654e3ee61373c05bb394bad5c3031f218d9f05cb
  - https://github.com/akmaier/agent-m/pull/594
date: 2026-10-16 15:21 UTC
---
# Development → Release testing: ITM-546, The host lists, follows and cancels CI runs

**REGISTER**

## Reason

ITM-546, pull request #594 into `sprint/team1/46`, at head `654e3ee6`. developer-sonnet-d wrote it, as `46.md` assigns.
It lists AGENTS.md, SPEC.md, the item, `46.md`, MOD-repository-hosts and chapters 9, 11, 12 and 13 as read in full.

1. **The tests-only commit is red.** `6cb9bc05` was pushed alone. Run 38918106282 failed on it: node (4) has 16 failures
   from `not ok 147` on, because the three functions were missing.
   - The stub was pushed as a commit of its own, `3ba3baf7`, where the team agreement asks for an uncommitted stub run.
     Run 38918389737 failed on it with the same 16 tests, now on their assertions.
   - Nothing was rewritten, and the implementation replaces the stub. So the red stays recorded and the head holds no
     stub. It is a deviation from the agreement, not a failed check, and it goes to the retrospective.
2. **CI is green on the head**: run 38922923682, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's scope.** `src/repository-hosts/github.mjs`, `gitlab.mjs` and `index.mjs`
   (MOD-repository-hosts), and the new `tests/repository-hosts-ci-runs.test.mjs`.
   - The adapters build `listCiRuns`, `cancelCiRun` and a private `jobLogs` over their existing `call`, `read` and
     `everyPage`.
   - The host builds `ciRunLog` from `jobLogs`.
   - GitLab's `startWorkflow` now uses the same `ciRunOf` mapping, and its tests are unchanged.
   - Through a clone, the three use the REST adapter where there is a token, and throw `NotSupported` otherwise.
   - No other module is used. The fetch spy over 150 files records no request that leaves the machine. The library's
     tests pass 33 of 33, and the four release tests that name MOD-repository-hosts pass.
4. **The tests name their requirement and module, and each fault is caught.** TST-546001–016 run against a fetch
   fixture, with a known positive beside each failure, and each of 34 planted faults is caught. The implementation
   commit fixed TST-546012's known positive and changed no expected value.
5. **The Acceptance holds.** The checks above cover each server's fields and states, the filters, the cancel and its
   409 for an ended run, the jobs' texts in order, `null` where no log is kept, the named failures, and `NotSupported`
   through a clone without a token.

The readings are within the item and the module file:
- **Without a clone and without a token, the REST adapter is used**, as `listPullRequests` does. The `NotSupported`
  rule of `connect` is about a clone, so an unauthenticated cancel goes to the server, and the server's refusal is
  named.
- **`workflow` is the last part of the run's `path`**, the item's reading. A suffix such as `@main` would stay in it;
  no caller reads it.
- **The other readings follow the item:**
  - an unknown conclusion is `failure`, and an unlisted status is `queued`;
  - a GitHub 409 means the run is read, and returns where it has ended;
  - the GitLab dates;
  - the log's format;
  - `TypeError`s before any request;
  - `Actions` as the permission's name.

For the retrospective: the developer used `pkill -f` to stop a hung test run, which could have ended another agent's
run of the same file.
