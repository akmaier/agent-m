---
id: MOD-pseudonymiser
title: Personal data — whether a text may enter a repository with respect to persons — the search for its mail's people, the three model checks as a loop check, the write gate, and who consented to be named
realises:
  - THE PRODUCT ISSUE CARRIES NO PERSONAL DATA
  - NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY
  - A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
  - REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS
  - A REWRITTEN TEXT IS CHECKED BY THREE LLMS
  - NO CHECKER IS THE REWRITER
  - PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF
  - A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
  - UC-038
follows:
  - ARC-003
  - ARC-007
  - ARC-014
uses:
  - MOD-job-harness.loadDefinition
  - MOD-job-harness.validateOutput
  - MOD-job-harness.mayReceive
  - MOD-job-harness.formatFinding
provides:
  - peopleOf
  - findPeople
  - personChecks
  - checkers
  - writeGate
  - parseCollaborators
  - formatCollaborators
  - namedPersons
  - PRODUCT_SETTINGS_PATH
  - COLLABORATORS_PATH
  - pseudonymisationOn
  - setProductSetting
  - addCollaborator
  - removeCollaborator
---
# MOD-pseudonymiser Personal data: whether a text may enter a repository

## Responsibility

Feature. Everything that decides whether a text may enter an issue tracker or a repository with respect to
persons. For a text drawn from a mail: the search for that mail's own people, without a model; the three
checks by LLM participants of three different models, supplied as one check to the correction loop; the
choice of those three among the instance's participants; and the write gate that lets a text through only
when the search found no one and three verdicts name exactly that text. For every repository: who agreed
to be named, kept in `docs/collaborators.md`, and the names in a generated artifact that are neither an
account nor a consenting collaborator. It rewrites nothing and keeps no list of people anywhere; the
identifier stays although no surrogate is made any more (`THE NAME IS THE ID AND IT SURVIVES`), and the
product setting it obeys still carries the name *pseudonymisation*.

## Interfaces

- `peopleOf(mail) -> [datum]` — every address and display name from the headers, and every name, address, phone number and account found in the body and its signature by fixed patterns.
- `findPeople(text, people) -> [{ datum, at }]` — each occurrence of the mail's people in a text, normalised for case and typographic dashes; an empty list is the only result that lets a text be written; a hit is returned to the caller only, never part of a record.
- `personChecks({ people, checkers }) -> check` — the check a drafting job's loop runs each round: `findPeople` on every text, and the job `check-for-persons` sent through each checker's driver with the rewritten texts and nothing else; every mention found becomes a finding for the rewriting participant; unreadable checker output is an error finding, never an empty verdict.
- `checkers(participants, allowedPlaces, rewriter) -> { checkers: [three] } | { missing, reasons }` — three participants that are not persons, can draft text, declare their model and process data at a place the mailbox allows; three different models; the rewriting participant is not one of them (`A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS`); fewer than three is `missing`, with what each other participant lacks. None of the three is the rewriting participant or declares its model (`NO CHECKER IS THE REWRITER`); models are compared by the names the participants declare.
- `writeGate({ texts, people, verdicts, allowedPlaces, rewriting }) -> { write: true } | { write: false, hits, findings, missing }` — every text must have an empty `findPeople`; a text a participant drafted or rewrote is written only when verdicts of three checkers with three different models, each at an allowed place, name its SHA-256 and report nothing; with `rewriting` on — the default — report data is written only as a participant's rewriting; with it off, report data passes unchanged and only the issue text is gated.
- `parseCollaborators(text) -> [{ name, account, agreed }]` — `docs/collaborators.md`, one row per person who agreed to be named.
- `formatCollaborators(list, product) -> text` — the canonical file; a person is added only with the tick that they agreed, and an account in the syntax of the product's server.
- `namedPersons(text, collaborators, accounts) -> [finding]` — a name in a generated artifact that is neither an account nor a listed collaborator, reported as a warning.
- `PRODUCT_SETTINGS_PATH -> "docs/settings.md"` — the product's settings file, one line `- name: value` per setting; a setting not listed has its default.
- `COLLABORATORS_PATH -> "docs/collaborators.md"` — the file of the people who agreed to be named.
- `pseudonymisationOn(settingsText) -> boolean` — on unless the product's settings file says `- pseudonymisation: off`.
- `setProductSetting(text, name, value, product) -> text` — the settings file with one setting's line set, or removed for `null`; every other line stays as it was; a missing file is started with its heading.
- `addCollaborator(list, { name, account, agreed, consent, gitlab? }) -> list` — the list with one more person; refused without the tick that they agreed, for a name with `|`, an account not in the syntax of the product's server, a date not `YYYY-MM-DD`, or an account already listed.
- `removeCollaborator(list, account) -> list` — the list without that account.

## Testing

Unit tests over fixture mails and texts (`tests/test_mail_privacy.py`, `tests/test_collaborators.py`): an
issue text containing the sender's name or a name from the signature is refused and the hit named, the
same text without it passes; with three scripted checkers of which one reports a name, nothing is written
and the finding goes back; a verdict for another text, a second verdict of the same model or one from a
place the mailbox does not allow does not count; a product without the setting gets rewritten report data.
The seams are the checkers' drivers. Whether a person slips through all three checkers depends on models
and is measured as a rate on a fixed set of mails, reported, not gated (ARC-016 kind 4); the gate itself is
deterministic given the verdicts.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 8b299337b2e61b80cb4a4415ff4e7c865d7a2dfe — SPEC queue 2026-09-30k as accepted: report data rewritten without persons and checked by three LLMs, surrogates withdrawn; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 2e6d8e4752b55b0707ec5e69c229914cb5d15fe8 — the mail's rewriting and checking kept inside the mail modules, at the PO's request; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): the three checks as a loop check, the choice of checkers, and the collaborators; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 069522c1cd5696307322bea74bad3953924a38e0 — PO follow-up: the CI runtime's entry as a shell of its own (MOD-ci-entry), and the three rules of queues 2026-10-01 and 2026-10-01b cited; revised on 2026-10-03 by Claude (claude-opus-5-5) against commit 230662f4a7d0fe40cae0b00b8973d1d752eb609f — ITM-138, akmaier's option A: the names other modules use are provided and used as the code has them; open until accepted.*
