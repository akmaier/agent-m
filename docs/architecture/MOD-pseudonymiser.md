---
id: MOD-pseudonymiser
title: Finds a mail's people in a text, and lets a text from a mail be written only when that search and three LLM checks found no person
realises:
  - A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
  - REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS
  - A REWRITTEN TEXT IS CHECKED BY THREE LLMS
  - PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF
  - THE PRODUCT ISSUE CARRIES NO PERSONAL DATA
  - NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY
  - UC-038
follows:
  - ARC-003
  - ARC-014
uses: []
provides:
  - peopleOf
  - findPeople
  - writeGate
---
# MOD-pseudonymiser Finds a mail's people in a text, and lets a text from a mail be written only when that search and three LLM checks found no person

## Responsibility

The last step before a text drawn from a mail — a neutral issue text, report data — is written to an
issue tracker or a repository (ARC-014). It does two things and changes no text: it searches a text for
the people of the mail at hand, without a model; and it decides whether the text may be written, from
that search and from the verdicts of the three checking participants. It rewrites nothing — rewriting is
a participant's job (MOD-job-definitions), and the rounds that correct it are the harness's
(MOD-job-harness). Pure core: it needs the mail at hand and the verdicts, nothing else, and keeps no list
of people anywhere. The identifier stays although no surrogate is made any more
(`THE NAME IS THE ID AND IT SURVIVES`); the product setting it obeys still carries the name
*pseudonymisation* (`PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF`).

**Current state.** No code exists.

## Interfaces

- `peopleOf(mail) -> [datum]` — every address and display name from the headers, and every name, address, phone number and account found in the body and its signature by fixed patterns.
- `findPeople(text, people) -> [{ datum, at }]` — each occurrence of the mail's people in a text, normalised for case and typographic dashes; an empty list is the only result that lets a text be written. A hit is returned to the caller only — it is never part of a record.
- `writeGate({ texts, people, verdicts, allowedPlaces, rewriting }) -> { write: true } | { write: false, hits, findings, missing }` — the write decision for one issue. `texts` are `[{ name, text, origin, kind }]`, `origin` *participant* (drafted or rewritten by a participant) or *person* (typed by the author), `kind` *issue* or *report data*; `verdicts` are `[{ checker: { name, model, place }, sha256, findings }]`. Every text must have an empty `findPeople`. A text of origin *participant* is written only when verdicts of three checkers with three different models, each at a place in `allowedPlaces`, name the SHA-256 of exactly that text and report no finding; a verdict for another text, a second verdict of the same model, or one from a place the mailbox does not allow does not count, and what is missing is named. With `rewriting` *on* (the default), report data is written only as a participant's rewriting; typed by a person, it is refused (UC-038 6c). With `rewriting` *off*, report data passes unchanged and only the issue text is gated.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit 8b299337b2e61b80cb4a4415ff4e7c865d7a2dfe — SPEC queue 2026-09-30k as accepted: report data rewritten without persons and checked by three LLMs, surrogates withdrawn; open until accepted.*
