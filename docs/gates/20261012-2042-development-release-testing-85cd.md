---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f4327756d71f13cf5d61e6d26af87f377014fe68
  - https://github.com/akmaier/agent-m/pull/452
date: 2026-10-12 20:42 UTC
---
# Development → Release testing: ITM-366, the kinds of specification and design in a product's job workflow

**REGISTER**

## Reason

ITM-366, pull request #452 by developer-sonnet-d into `sprint/team1/23`, head `f432775`, one commit that adds only
`tests/workflow-entries-design-kinds.test.mjs`, green in run 38305504560. The Outcome already holds: ITM-365's
`registerStrategiesOnce` in `compose.mjs` registers every module's strategies by name, and ITM-336 and ITM-338 supplied
`editStrategies` and `specStrategies`. The three tests pin it — a `change-use-case` job ending in one commit of an open
file, a `change-requirements` job ending in a new queue with `SPEC.md` byte-identical, a `derive-use-cases` job ending
in a new open use case, each commit with its provenance lines —, and six faults planted in `compose.mjs` are killed.

The points weighed, against `docs/instructions/product-owner.md`:
- Check 1 asks that CI was red on the first commit, "except for an item of release or system tests, which adds no
  behaviour". This item adds no behaviour either, since what it describes was built by ITM-365, ITM-336 and ITM-338; a
  red commit could only be made by faking one. The reading taken: the exception's reason, no behaviour added, holds,
  and the item is done by the tests that pin its Outcome — merged, so the record of what holds stays in the branch.
  That check 1 has no case for an Outcome already built is noted for the review.
- The Acceptance's "fixture check `candidate-classes` registered" was there so that a `change-requirements` job has
  classes; the job runner's own built-in `candidate-classes` gives them, and a second registration under that name is
  refused as a duplicate. What the line asks for is met by the built-in; it is not a part left undone.
- `open-files` reads the history through the server's API, which the tests answer from git: the file's form.
