---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9d7dedfb5f36376deece4001a6c47bc43b644321
  - https://github.com/akmaier/agent-m/pull/444
date: 2026-10-12 20:10 UTC
---
# Development → Release testing: ITM-327, the Bridge takes and runs the jobs of its agents

**REGISTER**

## Reason

ITM-327, pull request #444 by developer-sonnet-b into `sprint/team1/22`, head `9d7dedf`. The first commit `75dec78`
holds only `tests/bridge-jobs-watch.test.mjs`, and CI was red on it (run 38289929682): its ten tests fail, and no other
test does. `b15eac4` failed on "a job two watchers see is taken once" (run 38290343029), a race of two watchers, which
`9d7dedf` fixes; CI is green on it (run 38298786419, 2073 tests, 0 failures). The code changes only `src/bridge-jobs/`;
the new test names MOD-bridge-jobs and its guards. The Acceptance holds, case by case; its case of two watchers is pinned
by the fault w4, a job a second watcher sees run again, which the test kills.

The points weighed:
- Reviewers. The Bridge runs a job with its drafter and no reviewer, as ITM-365's entries do in CI. The texts give it no
  reviewer to run: a start record names its `participant` and states its `## Destinations` in words (MOD-job-ledger),
  and neither MOD-bridge-jobs' nor MOD-workflow-entries' file says how a job's reviewers run off the page. Yet
  MOD-job-ledger's file has "every route" run a job "from its record alone", and the SPEC asks a reviewing participant
  of every architecture draft (`THE ARCHITECTURE IS REVIEWED AGAINST THE SPECIFICATION`). So an architecture job
  handed to a Bridge or to CI would end unreviewed: a gap of the accepted texts, not of this item, which needs a change
  of the job record's format and of those modules' files — for akmaier, with the review.
- `startWatching` takes `instance`, the instance's address, and `onSkipped`, beside the config MOD-bridge-jobs' file
  states: the file has the Bridge keep a clone of the instance and say why a product is skipped, but gives neither
  through the config. Noted for akmaier, as a change of that file's interface.
- The race fixes w27 and w28 survive a run without load, 3 failures in 96 runs before the fix and none in 112 after;
  that no test pins them deterministically is noted for the review. The empty `places` and `gates`, the first reading
  after one interval, and the clone's default branch from its origin read the file as it stands.
