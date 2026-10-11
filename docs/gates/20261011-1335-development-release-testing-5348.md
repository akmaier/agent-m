---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b064d5915d111f98eb125a66fa7b470e9d166ca3
  - https://github.com/akmaier/agent-m/pull/356
date: 2026-10-11 13:35 UTC
---
# Development → Release testing: ITM-332

**REGISTER**

## Reason

ITM-332, pull request #356 by developer-sonnet-c into `sprint/team1/15`, on head `b064d59`, against the item and
MOD-approvals' accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `2574cf4`, holds only `tests/approvals-strategies.test.mjs`, and CI was red on it (run 38143196350):
  node failed on exactly its 4 tests — 1350 tests, 4 failed, 8 todo.
- CI is green on the head (run 38143459195): node 1350 tests, 0 failed; python 441 tests, OK.
- Only MOD-approvals' folder — the new `strategies.mjs`, the export and header of `index.mjs` — and the new test whose
  header names the module change; no existing test or expected result changes. The strategies call
  `artifactSchemas`, `readDocument`, `parseSpec` and `finding`, as the module file's uses state, and the catalogue's
  kinds already name `use-cases`, `use-case-with-neighbours` and `rests-on-accepted`.
- The 4 new tests name what they guard — UC-007, `A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS`, `NO USE CASE IS LEFT
  OUT OF A PROMPT SILENTLY` or `NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED` — and MOD-approvals, with 21
  counter-proofs.
- The Acceptance holds: one part per use case with its status, carrying the use case as an artifact with its key; a use
  case's neighbours with the text of each requirement it realises; an open requirement or use case in the selection
  named by `rests-on-accepted`; an accepted selection passing.

Noted for the sprint's review, no condition of this gate: the seven readings the pull request names, among them the
parameters `useCase`, `requirements` and `useCases`, a requirement's text composed from `parseSpec`'s fields, one
finding for the whole selection, and the failure `UseCaseNotFound`; and the parts of `use-case-with-neighbours` carry no
`artifacts`, where MOD-job-runner's `Part` has an empty list — the runner reads it as `part.artifacts ?? []`.
