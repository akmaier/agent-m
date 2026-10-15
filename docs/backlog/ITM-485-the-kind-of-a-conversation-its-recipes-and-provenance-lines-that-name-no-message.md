---
id: ITM-485
title: The kind of a conversation, its recipes, and provenance lines that name no message
level: module
realises:
  - UC-049
  - UC-019
  - ONE DEFINITION, THREE DRIVERS
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
  - AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
  - A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT
modules:
  - MOD-job-catalogue
  - MOD-job-runner
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-job-catalogue, Data: the table of kinds; MOD-job-runner, Data: the built-in strategies `conversation` and `page`, the provenance lines
  - TST-472282, TST-472283 and TST-472342, failing on main at 7e893c63
  - akmaier's decision of 2026-10-16 on Sprint 28's red base, delivered in one pull request with ITM-480
---
# ITM-485 The kind of a conversation, its recipes, and provenance lines that name no message

**REGISTER**

## Outcome

On `main` at `7e893c63`, three tests fail that compare code with the accepted module files: TST-472282 `kindNames` and
TST-472283 `kindOf` in `tests/job-catalogue.test.mjs` — MOD-job-catalogue's table now holds the kind `converse`, and
adds the recipe `conversation` and UC-049 to `change-requirements`, `change-use-case` and `change-architecture` —, and
TST-472342 `provenanceLines` in `tests/job-runner-records.test.mjs` — MOD-job-runner's lines no longer hold
`Agent-M-Instruction`.

Afterwards MOD-job-catalogue holds the kind `converse` — its definition, prompt and draft schema, serving UC-049 with the
recipes `page`, `conversation`, `instruction` and the optional `chapters-for-page`, and the checks, review and writer of
its row —, and the three change kinds name the recipe `conversation` and serve UC-049, as the table says. MOD-job-runner
offers the built-in recipes `conversation` — the conversation so far from the job's parameters, each message with who
wrote it, none for the first message — and `page` — the page as the route's subject gives it; `provenanceLines` takes a
`jobId` that may be `null`, then without the line `Agent-M-Job`, and no line names the person's instruction or any other
message of a conversation. The tools are ITM-484's.

The tests whose expected result the accepted module files change, each named here: TST-472282, TST-472283 and
TST-472342; and, since they assert `Agent-M-Instruction` in the commits their modules write, TST-472646
(`tests/review-pages-prompt-use-case.test.mjs`), TST-473198 (`tests/workflow-entries-design-kinds.test.mjs`) and
TST-476059 (`tests/specification-and-design-drafting-together.test.mjs`), which akmaier's decision puts in this item's
scope although their headers name other modules.

## Acceptance

- The six named tests pass; each states its expected values in its own text and reads no module file, the SPEC or a use
  case when it runs (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); the pull request names, for each, the
  passage of the accepted module file or use case that changes what it asserts — among them TST-472283's, that no recipe
  may be left out, which the row of `converse` with its optional `chapters-for-page` changes.
- Each recipe gives one part from fixture parameters, and `conversation` none for a first message.
- A counter-proof: an instruction planted in the trailers is found by TST-472342.
- It is delivered in one pull request into `sprint/team1/28` together with ITM-480's commits, unchanged and authored by
  ITM-480's Developer, and gated once.
