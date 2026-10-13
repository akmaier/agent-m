---
id: ITM-471
title: The spec-with-queues test classes a restated requirement of the SPEC
level: module
realises:
  - UC-005
  - EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
modules:
  - MOD-spec-changes
builds_on:
  - ITM-337
tests:
  - unit
origin:
  - ITM-450, #483
  - tests/spec-changes-requirement-recipes.test.mjs, "spec-with-queues — a draft is classified against its artifacts: a restated rule and a taken name are duplicates"
---
# ITM-471 The spec-with-queues test classes a restated requirement of the SPEC

**REGISTER**

## Outcome

The test "spec-with-queues — a draft is classified against its artifacts: a restated rule and a taken name are
duplicates" in `tests/spec-changes-requirement-recipes.test.mjs` shows that the part of `spec-with-queues` carries both a
requirement of an open entry and one of the SPEC, so that a draft is classified against each. Its second candidate takes
the name of A DECIDED RULE, which the SPEC holds, with another rule, and is expected a duplicate of A DECIDED RULE by
rule. That holds only while MOD-documents' `classifyCandidates` takes a matching name alone for a duplicate, which
ITM-450 reverses. The second candidate states instead the rule A DECIDED RULE states in the test's product, under its
name, so that it is a duplicate of A DECIDED RULE by its rule under either behaviour; the test's given line says so, and
its title names a restated requirement of the SPEC in place of a taken name. Its expected results stay as they are. It
changes how the test prepares its fixture, nothing else, and adds no behaviour.

## Acceptance

- Only that test's second candidate, its given line and its title in `tests/spec-changes-requirement-recipes.test.mjs`
  change; no expected result changes, and no other test or file changes.
- CI is green on the item's commit, and on that commit merged with ITM-450's code as #483 has it.
- The pull request records a counter-proof: the part of `spec-with-queues` planted without the SPEC's requirements fails
  the test with the new candidate.
- Since the item adds no behaviour, its first commit need not be red.
