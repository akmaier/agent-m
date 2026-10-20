---
id: ITM-1171
title: An item's pull request targets its sprint's branch where the sprint has one
level: module
realises:
  - UC-034
modules:
  - MOD-runtimes
builds_on:
tests:
  - unit
origin:
  - the gate of #1267 (ITM-734, team 2's sprint 102), developer-sonnet-f's finding
---
# ITM-1171 An item's pull request targets its sprint's branch where the sprint has one

**REGISTER**

## Outcome

UC-034 8a reads: "The sprint has a branch of its own. The item's pull request targets that branch"
(`docs/use-cases/UC-034-*.md:201-203`).
- The process model's gate reads "the item's pull request into the sprint branch" (`docs/process-models/scrum-wip.md:53`).
- MOD-runtimes' writer of a job's pull request opens every pull request into the default branch that `repositoryInfo`
  names (`src/runtimes/pull-request.mjs:56`, `:87`).
- MOD-runtimes' text names no sprint's branch.

So this item begins with a draft of MOD-runtimes for akmaier. It gives the writer the base: the branch of the sprint that
holds the item (MOD-work-plans' sprint record, `branch`), and the default branch where there is none. That has to be
stated with the interface it reads, so that the module does not read sprint records by hand.

## Acceptance

- An implementation job for an item of a sprint with a branch opens its pull request into that branch. Without one, it
  opens into the default branch. A test checks both, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
