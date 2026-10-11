---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c8870a0910e4cef352b5b62cfa5f3d699f06fa4a
  - https://github.com/akmaier/agent-m/pull/425
date: 2026-10-11 21:03 UTC
---
# Development → Release testing: ITM-390, a writer's notes, and a result that commits nothing

**REGISTER**

## Reason

ITM-390, pull request #425 by developer-sonnet-c into `sprint/team1/21`, head `c8870a0`. The first commit `a87b8a1`
holds only `tests/job-runner-writer-notes.test.mjs`, and CI was red on it (run 38174359534): one of its four tests
fails, `return-draft` handing back no notes, and no other test does. CI is green on `c8870a0` (run 38174605517, 1932
tests, 0 failures). The code changes only `src/job-runner/`: the type `WriteOutcome` names `notes`, and
`return-draft` returns `notes: []`. The new test names MOD-job-runner and its guards, and 17 faults are recorded. The
Acceptance holds: with fixture writers, the notes handed on, an outcome without a commit handed on as such, a writer's
failure thrown by name.

The points weighed:
- Three of the four tests were green before the code: the runner already hands a writer's outcome on as it is, and so
  hands on notes and an outcome without a commit. They pin that behaviour for this item's contract; check 1 asks that CI
  be red on the first commit, which it was, on the part the item changes. The Outcome is a contract — what a writer
  returns and what the runner hands on —, and the writers that fill `notes` and commit nothing are ITM-336's and
  ITM-338's, as it says.
- The runner adds no `notes: []` to another writer's outcome, as it hands every outcome on unchanged and an existing
  test asserts such an outcome whole.
- "An outcome without a commit" is `commits: []`, the field `WriteOutcome` has for it.

For the review: `tests/agent-processes-321` and TST-321001, team 2's, fail on macOS only, comparing `/var/folders` with
`/private/var/folders`; CI on Linux is green.
