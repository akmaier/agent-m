---
id: ITM-840
title: The release test that a person is named by account or with consent
level: system
realises:
  - A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
modules:
  - MOD-personal-data
builds_on:
  - ITM-838
tests:
  - release
origin:
  - SPEC.md names tests/test_collaborators.py for A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT, and it does not exist
---
# ITM-840 The release test that a person is named by account or with consent

**REGISTER**

## Outcome

`tests/test_collaborators.py`, the check SPEC.md names for `A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT`, is written. It
drives MOD-personal-data's `namedPersonFindings` (ITM-838) in Node with a collaborators file read by its schema.

## Acceptance

- A name in a generated artifact that is neither an account nor in `docs/collaborators.md` is reported, with the
  artifact and line; counter-proof: a listed collaborator's name passes.
- The test names the requirement it guards, the module it exercises and its level `release`; its cases stand in a
  Markdown data file beside it, and the Python file only loads them (AGENTS.md §7).
- It is written by a participant who implemented none of the behaviour it tests; its counter-proof — a fault planted in
  the module, and the test failing on it — is recorded in the pull request.
- Only the new test file and its data file change.
