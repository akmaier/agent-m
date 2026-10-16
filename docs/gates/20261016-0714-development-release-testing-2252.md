---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 806ecb6b044836fed89c28bf26f8ef506c8ec85d
  - https://github.com/akmaier/agent-m/pull/556
date: 2026-10-16 07:14 UTC
---
# Development → Release testing: ITM-492, The Bridge runs a handed-over task and keeps it in memory only

**REGISTER**

## Reason

ITM-492, pull request #556 into `sprint/team1/35`, at head `806ecb6b`. developer-sonnet-a made both commits.

1. **The red commit.** The tests-only commit `4ca0246f` holds only `tests/bridge-job-task-492.test.mjs`, and CI was red
   on it (run 38865521532, node (0)).
   - TST-492001, 002, 003 and 005 fail on behaviour.
   - TST-492004 passes, because it guards what already held.
2. **CI is green on the head**: ten of ten jobs, run 38865707739. The pull request is mergeable against
   `sprint/team1/35`, which holds #555.
   - Locally, the known TST-367001 to TST-367003 fail, and so do the release and system tests of UC-003, on
     `Cannot find module 'imapflow'`. Run on the sprint branch's base, they fail the same way: the cause of TST-407001
     in #555.
3. **The changes stay in the item's scope.** `src/bridge-jobs/watch.mjs` and `handlers.mjs` are the item's module, and
   the new test file names it. No existing test changed.
4. **The new tests.** TST-492001 to TST-492005 state their values in their own text. Seven counter-proofs are recorded in
   #556.
5. **The Acceptance holds, with the values the start decision named.**
   - A hand-over with its task runs the fixture agent with the task as `instruction`, held in an in-memory map until the
     job ends.
   - No file, log line or record the Bridge writes holds the task.
   - The job's end has `draft: null`.
   - The Bridge's own reading leaves such a record queued until its hand-over brings the task.
   - A hand-over without the task is `invalid-request`.

**The developer's findings.**
- **The `converse` kind names the check `document-schema`, whose code reads `draft.files`.** A converse answer has
  `answer` and `edits`, and no `files`, so the check throws and the job ends failed. That defect lies in MOD-job-runner,
  outside this item, and the test's `files: []` only steps around it. It is registered as ITM-525, the
  `document-schema` check reading a conversation's proposed edits. It changes MOD-job-runner and can be built as the
  accepted texts say: the check is "on every drafted document".
- **"No module registers `chapters-for-page`" is the test's own context only.** ITM-500 registered the recipe in
  MOD-source-register (`src/source-register/strategies.mjs`), and the Bridge's test runner does not load that module.
  This is no finding.
