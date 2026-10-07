---
id: ITM-258
title: A model's kinds with their explanations, and no time box
level: module
realises:
  - UC-002
  - A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED
modules:
  - MOD-model-catalogue
  - MOD-implementation-pages
builds_on:
  - ITM-215
  - ITM-229
  - ITM-222
tests:
  - unit
origin:
  - UC-002
---
# ITM-258 A model's kinds with their explanations, and no time box

**REGISTER**

## Outcome

MOD-model-catalogue's model schema and `Model`, as its file states them since akmaier accepted the change in `3557461`,
in `src/model-catalogue/`: a kind in a phase's `Produces` may be followed by an explanation in parentheses — the kind is
what stands before it, `Model.produces` holds the kinds without their explanations, and no check reads an explanation —;
and a `Time box` of `none` is no time box, `flow.timeBox` `null`. So Agent M's own model,
`docs/process-models/scrum-wip.md`, reads as it is written, and UC-002's page lets Agent M save its own declaration. The
test of MOD-implementation-pages that states the seven error findings of that model, as the module's file stood before
the change, follows the accepted file; no code of MOD-implementation-pages changes. Nothing else of either module is part
of this item.

## Acceptance

- Unit tests that name MOD-model-catalogue state, before the code exists: a phase whose `Produces` names kinds, each
  followed by an explanation in parentheses, read as those kinds, and a gate that checks such a kind finding it produced;
  a word before the parenthesis that is no kind, still a finding; a `Time box` of `none` read as `null`, so that pulled
  work with a WIP limit and a `Time box` of `none` has no finding of both; and this repository's own
  `docs/process-models/scrum-wip.md`, as it stands, without an error finding.
- In `tests/implementation-pages.test.mjs`, the test of the page of a product with Agent M's own declaration states what
  the accepted file gives for its text in place of the seven error findings; no other expected result changes.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- Only `src/model-catalogue/` and the tests that name MOD-model-catalogue or MOD-implementation-pages change
  (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
