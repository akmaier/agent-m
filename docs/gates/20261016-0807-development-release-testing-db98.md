---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 89ea826a2dc4952a3a9d72f221156433ba451bd1
  - https://github.com/akmaier/agent-m/pull/564
date: 2026-10-16 08:07 UTC
---
# Development → Release testing: ITM-519, The checks the SPEC names for prompted changes and provenance

**REGISTER**

## Reason

ITM-519, pull request #564 into `sprint/team1/39`, at head `89ea826a`. developer-sonnet-e made the one commit. It lists
book chapters 9, 11, 12 and 13 as read in full.

1. **No red commit is required.** The item writes system checks of behaviour already built and adds none, as the start
   decision named.
2. **CI is green on the head**: ten of ten jobs, run 38871430858. Locally, the 14 checks pass, and so do
   `test_test_levels` and `test_test_battery`.
3. **The changes stay in the item's scope.** Only the two new files changed: `tests/test_prompted_change_context.py`
   (TST-519001 to TST-519008) and `tests/test_artifact_provenance.py` (TST-519011 to TST-519016).
4. **The tests.**
   - Each names the requirements it guards.
   - Each names `Module: system`, the header ten SPEC checks in Python carry, and names in its docstring the modules it
     exercises: MOD-job-runner, MOD-artifact-edits' `open-files` and MOD-spec-changes' `queue-entries`.
   - Each states its values in its own text.
   - Every counter-proof failed on a fault planted in a scratch copy of `src/`, and is recorded in #564.
5. **The Acceptance holds.**
   - A `change-use-case` job sees the use case, the requirements it realises and every other use case.
   - A drafter that cannot hold them is refused before anything is sent.
   - A CI agent's draft enters as an open use case or a queue entry, with `SPEC.md` byte-identical and no approval record
     naming it.
   - A writer's commit names the version, the participant and the model, and the artifact names none of them.

**Gap 1, which files are "the artifact", settled from the texts.**
- `AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT` asks that the commit name the version, the participant and the model,
  and its *Check:* that "the artifact's own text names none of them".
- MOD-spec-changes' Data asks that a drafted entry's rationale (`NN-<slug>.begruendung.md`) name the Agent M version, the
  participant, the model, the date and the rounds, and that the queue's `index.md` hold the decision taken.
- The two agree once the artifact is the generated document asked for — a use case, or a queue entry's section as
  proposed — and the rationale and index are the queue's records about it. `A RECORD IS EVIDENCE, NOT A PROPOSAL`
  separates records from what is proposed in the same way.
So the developer's reading holds, the two texts do not conflict, and nothing goes to akmaier.

**Gap 2, the undeclared field.** `open-files` (`src/artifact-edits/strategies.mjs`) passes `instruction` to
`provenanceLines`, which ignores it, as `src/spec-changes/propose.mjs` did until ITM-502 removed it. Nothing is written
from it, and no requirement is broken. It is noted for the review, and is removed when an item next changes MOD-artifact-
edits' writer.
