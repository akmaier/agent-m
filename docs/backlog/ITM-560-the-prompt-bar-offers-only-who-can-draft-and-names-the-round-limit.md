---
id: ITM-560
title: The prompt bar offers only a participant that can do the kind, and names the round limit first
level: module
realises:
  - UC-019
  - UC-049
  - THE CORRECTION LOOP HAS A FIXED LIMIT
  - A PARTICIPANT DECLARES ITS CAPABILITIES
modules:
  - MOD-prompt-bar
builds_on:
  - ITM-514
tests:
  - unit
origin:
  - ITM-514's findings S9 (TST-377010) and S13 (TST-418125), gate docs/gates/20261016-1655-development-release-testing-70c2.md
---
# ITM-560 The prompt bar offers only a participant that can do the kind, and names the round limit first

**REGISTER**

## Outcome

- **S9.** A participant whose capabilities lack what the subject's kind needs is offered by the bar today, and refused
  only on *Send*, without a pointer to where a participant is configured (UC-017).
- **S13.** The bar never names the correction loop's round limit before the first round.

**Not ready for a sprint yet.** Its readings are settled from UC-019, UC-049, MOD-prompt-bar and MOD-participant-list
before it is selected:
- whether S9 is not offering, or offering with the reason and a link to UC-017's page;
- where the round limit is shown, and from which value.

## Acceptance

- ITM-514's todo tests TST-377010 and TST-418125 pass, with counter-proofs.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Read by developer-sonnet-a (sprint team1/92).**
- **S13 needs no draft.** The bar names `prepared.limit` (MOD-job-runner.md:230-232, :260-261; `kindOf` gives 5 for
  `converse` and the `change-*` kinds) in the conversation with its destinations, before *Send* (UC-019 step 7).
  TST-418125 states the wording "at most 5".
- **S9 needs a draft,** prepared as a patch: MOD-prompt-bar's uses gain MOD-participant-list.eligible and
  MOD-job-catalogue.kindOf, and the bar offers only the participants `eligible` admits for the kind's needs (UC-019 2),
  with the reason and a link to `participants` where none can (UC-019 3a).
- The item builds S13 first and S9 after the draft's acceptance, in two pull requests.
- **It is held back today:** MOD-prompt-bar uses MOD-progress-measures, which team 2's ITM-873 changes.

