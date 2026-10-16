---
id: ITM-567
title: The writer branch-and-pull-request
level: module
realises:
  - UC-024
  - UC-049
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
modules:
  - MOD-runtimes
builds_on:
  - ITM-537
tests:
  - unit
origin:
  - sprint team1/50, settling ITM-538: `implement`, `refactor`, `fix-bug` and `write-tests` name the writer `branch-and-pull-request`, and MOD-runtimes' `routeStrategies` and its part `pull-request.mjs` are not built (`src/runtimes/index.mjs:7`, no `src/runtimes/pull-request.mjs`); no item registered them
---
# ITM-567 The writer branch-and-pull-request

**REGISTER**

## Outcome

MOD-runtimes' `routeStrategies`, with the writer `branch-and-pull-request` in its part `pull-request.mjs`, as its file
states it:
- **What it reads.** The branch named after the job, and its commits.
- **With a host of a server's API.** It opens the pull request if the coding participant has not, and gives it a
  description. The description names the job, the plan step or backlog item, its modules, the requirements its new tests
  guard (read with MOD-test-document's `testDeclarations`), and the provenance lines. It returns the pull request's
  address.
- **With a local host.** On a Bridge's clone, which throws `NotSupported` for server requests, it opens nothing and returns
  the branch and the pull request the agent reports.
- **It never merges.**
- **It fails** with `NoBranch`, `NoCommits`, and what the host names.

Without it, a job of the four kinds that name it has no writer. So a hand-over's run without a pull request cannot be
told today from a writer that never ran, and ITM-538 waits for it.

**Not ready for a sprint yet.** Its readings were settled at sprint team1/53, and one waits for a draft's acceptance.
- **The branch** is the `branch` the participant's answer reports. Each kind that names this writer requires it, as
  `implement`'s `answer.schema.json` shows. No text fixes a form for the name, so the writer checks none. A branch the
  host does not hold is `NoBranch`, and one with no commit beyond the job's snapshot is `NoCommits`.
- **The host** is the job's `context.product.host`. In CI it is the checkout's clone with the person's token, which
  serves every function but the files through the server's REST API (MOD-repository-hosts, `connect`: "every other
  function uses the REST adapter where a token is given, or throws `NotSupported`"). The entry already reads pull
  requests through it (`refusedBranch`, `src/workflow-entries/product.mjs:88`). On a Bridge's clone, without a token,
  `NotSupported` is the "local host" case.
- **New tests** are the declarations, read with `testDeclarations`, in the files the branch adds or changes against the
  job's `context.product.snapshot`, whose identifier that snapshot's version of the file does not declare. This follows
  the check `test-declarations` (`src/job-runner/builtins.mjs:163–186`).
- **The base of a pull request the writer opens** is the default branch the host's `repositoryInfo` names.
  - In CI, the entry's host names the branch the workflow runs for (`checkoutHost`,
    `src/workflow-entries/compose.mjs:101`). That is the target branch UC-024 step 6 names: the default branch, or the
    phase's.
  - MOD-runtimes' Uses did not name `repositoryInfo`. The one-line draft that adds it waits for akmaier's acceptance,
    and the item waits for it.

**Also in this module's next change, from ITM-548's gate (`7bd2`).** In `src/runtimes/ci.mjs`, `GitlabCiNotList`'s
messages for an inline `inputs:` end with the sentence about an `include:` that is a list. That sentence does not fit
them. Each message is made to say only its own case.

## Acceptance

- **On a server.** Against a fixture server, it opens the pull request with the description and returns its address,
  and opens none where one exists.
- **On a clone.** It returns what the agent reports.
- **Its failures.** `NoBranch` and `NoCommits` are named, each beside a known positive.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
