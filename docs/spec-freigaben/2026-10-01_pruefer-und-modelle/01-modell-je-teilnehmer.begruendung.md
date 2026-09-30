# §5: a participant based on a language model names its model

**Finding (architecture change, PR #20).** `A REWRITTEN TEXT IS CHECKED BY THREE LLMS` requires "three
different models", but UC-017 records a model only for model endpoints; for CI, CLI and sandboxed agents the
model was not part of the participant, so the difference could not be checked. The architecture counted only
participants that declare a model.

**PO decision, 2026-10-01:** "2 OK" — UC-017 asks every participant that works with a language model for its
model.

**The change:** new rule `A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL`, placed after `A PARTICIPANT
DECLARES WHERE IT PROCESSES DATA`. The rest of §5 is carried over byte for byte.

**Impact list:** new name; UC-017 (step 3, realises) updated in the same commit; MOD-process-model (participant
register) and MOD-mail-flow (picking checkers) follow as an architecture change.
