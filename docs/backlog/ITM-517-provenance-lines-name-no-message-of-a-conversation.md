---
id: ITM-517
title: Provenance lines name no message of a conversation
level: module
realises:
  - UC-019
  - UC-049
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
  - AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
modules:
  - MOD-job-runner
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-job-runner, Data: the provenance lines; Interfaces: provenanceLines
  - TST-472342 (`provenanceLines` in tests/job-runner-records.test.mjs), failing on main at 7e893c63
---
# ITM-517 Provenance lines name no message of a conversation

**REGISTER**

## Outcome

On `main` at `7e893c63`, TST-472342 fails: it compares `provenanceLines` with MOD-job-runner's accepted module file,
whose lines no longer hold `Agent-M-Instruction`. Afterwards `provenanceLines` takes a `jobId` that may be `null`, then
without the line `Agent-M-Job`, and no line names the person's instruction or any other message of a conversation.

## Acceptance

- TST-472342 passes against the accepted module file; its expected result changes with it, and the pull request names
  the passage.
- A counter-proof: an instruction planted in the trailers is found by the test.

## Intake Decision

Registered, not selectable as the texts stand: the change turns red three tests of other modules that assert
`Agent-M-Instruction` in the commits their modules write — TST-472646 (`tests/review-pages-prompt-use-case.test.mjs`,
MOD-review-pages), TST-473198 (`tests/workflow-entries-design-kinds.test.mjs`, MOD-workflow-entries) and TST-476059
(`tests/specification-and-design-drafting-together.test.mjs`, MOD-approvals, MOD-spec-changes, MOD-artifact-edits). An
item of MOD-job-runner may not change them (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`), and its pull request
cannot show green CI while they fail; it waits for akmaier's decision.
