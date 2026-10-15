---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - eb3399d5135f1400313f550ae2b25c70240c6055
  - https://github.com/akmaier/agent-m/pull/524
date: 2026-10-15 22:23 UTC
---
# Development → Release testing: ITM-480 and ITM-485, in one pull request

**REGISTER**

## Reason

Pull request #524 into `sprint/team1/28`, head `eb3399d5`, carries two items in one pull request, as akmaier decided for
the sprint's red base (`b5df29f6`):

- ITM-480, UC-019's system and release coverage follows the accepted UC-019, by developer-sonnet-e. Its commit `2da546c2`
  is merged unchanged with `d0693dbc`.
- ITM-485, the kind of a conversation, its recipes, and provenance lines that name no message, by developer-sonnet-c.
  The release cases TST-418110, TST-418120 and TST-418124 were changed by developer-sonnet-e.

The checks:

1. ITM-480 holds test files only. ITM-485's tests-only commits `695fb326` and `3e6aeb01` were red (runs 38812870159 and
   38815076820).
2. CI is green on `eb3399d5` (run 38816432481, ten of ten jobs). On the head, the changed test files, the release cases
   among them, give 121 passing tests, none failing and 14 pending findings.
3. Changed are `src/job-catalogue/` and `src/job-runner/`, the item's modules; their tests; the tests ITM-485 names; and
   ITM-480's two UC-019 files. The tests ITM-485 names include TST-472283's changed expectation and the shared helpers'
   cases, named at `2d384d2b`. No other file changed.
4. The new tests TST-590101 and TST-590102 name their requirement and module. Counter-proofs are recorded in #524 and
   #523.
5. The Acceptance holds:
   - No test asserts `Agent-M-Instruction` as a written line.
   - The named tests state their values in their own text and read no module file.
   - ITM-480 keeps as evidence tests that press *Run* only to reach a draft. They then assert flows whose text the
     accepted UC-019 keeps: 6, 7, 8b, 8c, 6c and 7a. *Run* is their precondition, not what they assert, so the evidence
     still holds.

Noted for the review:

- TST-472343 still reads `docs/architecture/MOD-job-runner.md` for its expected result
  (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`).
- `tests/spec-changes-queue-entries.test.mjs:226` computes its expected trailers with `provenanceLines`.
- The findings UC019-R5 and UC019-R6 name evidence that no longer asserts the instruction.
- The callers in three modules still pass `instruction` to `provenanceLines`, which ignores it.
