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

ITM-498 refuses a hand-over's branch whose commit messages or pull request title hold the task. MOD-workflow-entries' file
says "pull request text". Two cases are not yet checked:
- **The description.** `PullRequest` has no body until ITM-537.
- **A run whose writer returns no pull request.** Its branch's commit messages are not read. MOD-workflow-entries' Uses has
  no `readHistory`, which the draft committed with #583's gate adds.
Once both drafts are accepted, the entry checks the description too, and reads the commit messages of the run's branch
with `readHistory` when no pull request was opened.

**What ITM-537 already brought.** `refusedBranch` (`src/workflow-entries/product.mjs:88–95`) searches
`Object.values(facts.pullRequest)`. Since ITM-537 gave `PullRequest` its `body`, a description that holds the task's
words is already refused as "the pull request's text". This item therefore adds a test that holds that case, and the
branch of a run whose writer returned no pull request. Which commits of that branch are read, and against which base, is
settled before its start.

**Which runs have no pull request**, read at sprint team1/50:
- **The kinds that write code.** `implement`, `refactor`, `fix-bug` and `write-tests` name the writer
  `branch-and-pull-request`. On a local host it "opens nothing and returns the branch and the pull request the agent
  reports", so an agent that reports none leaves a branch without a pull request, and nothing merged. That writer is not
  built, which is ITM-567, and this item waits for it.
- **The change kinds handed to CI.** These are `change-requirements`, `change-use-case` and `change-architecture` (UC-019
  6b). Their writers `queue-entries` and `open-files` commit on the default branch with Agent M's own messages. They
  make no branch to refuse.
  - **A question to settle first.** The entry gives the job's context the task as `instruction`
    (`src/workflow-entries/product.mjs:127`), and `provenanceLines` takes an `instruction`. So before this item starts,
    it is read whether those writers' commit messages carry the task. If they do, that leak is this item's too.

## Acceptance

- A description holding the task's words refuses the branch by name.
- A run with no pull request whose branch's commit message holds them is refused as well, with nothing merged.
- Each test states its expected values in its own text, and each search has a known positive.
