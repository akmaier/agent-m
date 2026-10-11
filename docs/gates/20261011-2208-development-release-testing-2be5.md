---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 910a52572a6768eb0fbd0b878185d32ceeb7b639
  - https://github.com/akmaier/agent-m/pull/439
date: 2026-10-11 22:08 UTC
---
# Development → Release testing: ITM-336, drafted use cases written open, their identifiers kept

**REGISTER**

## Reason

ITM-336, pull request #439 by developer-sonnet-d into `sprint/team1/22`, head `910a525`. The tests-only commits
`77a54e9` and `e17391e` were red on the new tests alone (runs 38178486207, 38178727604); CI is green on `910a525` (run
38178984852, 2017 tests, 0 failures). The code changes only `src/artifact-edits/`; the new test names MOD-artifact-edits
and its guards, and 30 faults are recorded, 28 killed and two equivalent. The Acceptance holds, case by case: two new use
cases past a number only the history holds, a change written into `UC-004`, a draft classed as its change written there,
an unknown realised name removed and noted, a use case realising nothing written and noted, a result equal to the head
committing nothing, `identifier-kept`, a module identifier the history holds refused, the due-diligence mark writing
nothing, the provenance lines in the commit and none in the files.

The readings weighed: MOD-artifact-edits' file writes as a change only a draft "the result's classes make a change or a
duplicate of an existing one"; a `conflict` is neither, so it is written as a new open file for the person to review,
which reads the file as it stands. A class names the drafted file by its path in `refs`; today `candidate-classes`
builds classes for requirements only, so use cases are classed once that check classes them — noted for the review. New
identifiers from the history and the head with every mention renumbered, `IdentifierTaken` for a module, the shape of
`DueDiligenceMissing`, and a realised name known only from the head's SPEC follow the file and ITM-299 and ITM-309.
