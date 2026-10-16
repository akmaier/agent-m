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

**Not ready for a sprint yet.** Its readings are settled before it is selected:
- the form of "the branch named after the job", read from the agents' prompts of MOD-agent-processes and the job
  workflow;
- which host a CI run's writer gets: the checkout's clone, which makes no server requests, or the server's API with the
  person's token;
- how "the requirements its new tests guard" are told new: against the base of the branch.

## Acceptance

- **On a server.** Against a fixture server, it opens the pull request with the description and returns its address,
  and opens none where one exists.
- **On a clone.** It returns what the agent reports.
- **Its failures.** `NoBranch` and `NoCommits` are named, each beside a known positive.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
