---
id: ITM-838
title: Three checkers of a rewritten text, and a person named only by account or with consent
level: module
realises:
  - UC-038
  - A REWRITTEN TEXT IS CHECKED BY THREE LLMS
  - NO CHECKER IS THE REWRITER
  - A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
modules:
  - MOD-personal-data
builds_on:
  - ITM-550
tests:
  - unit
origin:
  - MOD-personal-data, Interfaces checkersFor and namedPersonFindings; no code gives them
---
# ITM-838 Three checkers of a rewritten text, and a person named only by account or with consent

**REGISTER**

## Outcome

MOD-personal-data provides `peopleIn`, `personHits`, `settingsSchemas` and `pseudonymisationOf`. Its accepted file also
states two pure functions, which are added as it states them:
- `checkersFor(participants, rewriter, places)` (`checkers.mjs`) gives three participants that work with a language
  model, each at one of the allowed places, with three different models, none of them the rewriter and none using its
  model — chosen through MOD-participant-list's `eligible` and `differs`; or `{ missing }`, a sentence naming what is
  missing, when there are not three.
- `namedPersonFindings(text, artifact, known, collaborators, accounts)` (`consent.mjs`) gives one error finding, in
  MOD-text-tools' form, for every name of a known person in the text that is neither an account nor a consenting
  collaborator of `docs/collaborators.md`; the finding names the artifact and the line.

## Acceptance

- New unit tests naming MOD-personal-data. Each states its input, precondition and expected result before it runs, with
  literal expected values:
  - three eligible participants with three other models are chosen;
  - a set that holds the rewriter, or a participant with the rewriter's model, or two with one model, gives no such
    checker; with fewer than three left, `missing` is given;
  - a participant at a place the mailbox does not allow is not chosen;
  - a known name in a text gives one finding with the artifact and line; a collaborator who agreed, and an account,
    give none.
- Where the module file leaves a value open — the wording of `missing` — the pull request names it and the test asserts
  no invented value.
- The existing tests naming MOD-personal-data stay green with no expected result changed.
- The first commit holds only tests, and CI is red on it; each new test's counter-proof is recorded in the pull request.
- Only `src/personal-data/` and tests naming MOD-personal-data change; no dependency changes.
