---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b63cf2ced00cf42d3175552febe6a1001589ca6d
  - https://github.com/akmaier/agent-m/pull/482
date: 2026-10-13 00:06 UTC
---
# Development → Release testing: ITM-369, specification and design together, for the kinds that draft their artifacts

**REGISTER**

## Reason

ITM-369, pull request #482 by developer-sonnet-e into `sprint/team1/26`, head `b63cf2c`, an item of component tests:
one commit adds only `tests/specification-and-design-drafting-together.test.mjs`, level component, naming
MOD-approvals, MOD-spec-changes and MOD-artifact-edits and what it guards. As at #472 (ITM-368), check 1 of
`docs/instructions/product-owner.md` is read as asking no red first commit of an item that adds no behaviour; this one
tests behaviour that exists, written by a Developer who implemented none of it. CI is green on `b63cf2c` (run
38325285917): the file's eight tests pass, and the ninth is a todo. Ten planted faults (7a and 7b counted apart, eleven)
are recorded, each test failing under at least one. The todo's counter-proof is the converse: with `classifyCandidates`
planted not to take a change as a duplicate, the todo test passes.

The Acceptance holds as far as the change shows: each kind runs from preparation to its writer's commit, with the parts
of its recipes, the candidates classed, a finding sent back and fixed (UC-043's changed identifier, the restated
requirement classed new), and the provenance lines on the commit; each test states given, input and expected result,
with the use cases' own example data; no existing test changes.

The todo, FINDING ITM-369-1: `classifyCandidates` (`src/documents/candidates.mjs`) takes a candidate under an existing
requirement's name as an exact duplicate, so `candidate-classes` sends a change under the existing name back. It is
not fixed here, and that is right for this item: the fault lies in MOD-documents and MOD-job-runner, outside the item's
three modules (check 3), and it rests on two requirements of SPEC.md, `EXACT DUPLICATES ARE FOUND WITHOUT A MODEL` and
`A CHANGE IS PROPOSED UNDER THE EXISTING NAME`, which the Scrum Master puts to akmaier. The test keeps the use case's
own data and names the defect, as sprint 25's team agreement asks. Noted for the review: the todo marks a test that fails
today, to be decided once akmaier has.
