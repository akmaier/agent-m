---
id: ITM-538
title: A hand-over's branch is refused by its pull request's description, and without a pull request
level: module
realises:
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
  - UC-049
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-498
  - ITM-537
  - ITM-567
tests:
  - component
origin:
  - the gate of #583 (ITM-498, sprint team1/43)
  - MOD-workflow-entries, onDispatch — "a branch whose commit messages or pull request text hold the task's words is refused by name"; Uses drafted on main with `readHistory`
---
# ITM-538 A hand-over's branch is refused by its pull request's description, and without a pull request

**REGISTER**

## Outcome

Complete the existing onDispatch branch refusal of MOD-workflow-entries for a hand-over whose task is not recorded.
Keep the existing pull-request facts path, including its comparison of the description, and add a direct component
case for a task found only in that description. The genuine missing behavior is the branch returned without a pull
request: it is checked too, before the entry can end the handed-over job done.

The existing branch-and-pull-request writer exposes the agent's branch in written.shown.branch even when it returns
no pull request. Use that existing result and the public Host operations; introduce no public field or interface.
Pin that branch with readSnapshot. The base is the product snapshot supplied to the job's context before runJob,
the same snapshot against which the writer measures the branch's changes. Read both complete repository histories
with readHistory(null, { ref: pinnedCommit }) and no truncating limit. Inspect branch-history commits whose commit
identifiers are absent from the base history, including commits on merged side branches. Shared earlier history is
not attributed to this run. Reuse the entry's existing trimmed-task comparison and refusal/redaction path. A match
names the reported branch, ends the job failed and merges nothing; a clean branch is not refused. A history failure
uses the entry's existing failed-job path, not a clean result.

The default-branch queue-entries and open-files writers create no code branch to inspect. Their fixed messages use
provenanceLines, which emits no instruction text. Do not change these writers, their output, or MOD-job-runner.

Only src/workflow-entries/ and new component cases naming MOD-workflow-entries are in scope. The existing owned
tests/workflow-entries-hand-over.test.mjs already holds the controlled onDispatch/git/agent/fetch fixture: new cases
may be appended there to reuse it without copying it. Preserve every old case body, assertion, declaration and
header; only necessary fixture preparation for the new variants may change. A new owned test file/helper may instead
reuse the same fixture if that is simpler, without duplicating its implementation or rewriting old cases.
No existing expected result changes, production source in another module, workflow, dependency, API/type, SPEC,
use case or architecture change is selected.

One responsibility remains in the entry that owns the refusal; the existing writer result, history interface and
fixture are reused instead of copied (one responsibility, nothing twice, YAGNI/KISS).

## Acceptance

- A description holding the task, with clean title and commit messages, refuses the branch by name.
- With no pull request, a task in any new branch commit is refused and the job ends failed, with nothing merged.
- A clean no-PR branch succeeds; task text present only in shared base history is not attributed to the new run.
- Each search has a known positive, and literal expected values are readable before the case runs. The refusal's
  summary and End do not repeat the task. Preserve existing pairing, secret and task-redaction assertions.
- Existing expected results stay unchanged. The first implementation commit contains only tests and stops at the
  genuine intended server red before SM production assignment; every new case has its actual counter-proof.
