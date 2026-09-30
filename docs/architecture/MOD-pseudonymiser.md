---
id: MOD-pseudonymiser
title: Finds a mail's people in a text and replaces personal data with consistent surrogates
realises:
  - A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
  - REPORT DATA IS PSEUDONYMISED BEFORE IT LEAVES THE MAILBOX
  - A SURROGATE IS THE SAME WITHIN A REPORT
  - THE SURROGATE MAPPING IS NEVER STORED
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
  - pseudonymise
---
# MOD-pseudonymiser Finds a mail's people in a text and replaces personal data with consistent surrogates

## Responsibility

The deterministic privacy filter of ARC-014. Pure core: it needs the mail at hand and nothing else;
the same mail gives the same surrogates every time, so no mapping is ever kept.

**Current state.** No code exists.

## Interfaces

- `peopleOf(mail) -> [datum]` — every address and display name from the headers, and every address, phone number, account and signature name found in the body by fixed patterns.
- `findPeople(text, people) -> [{ datum, at }]` — each occurrence of the mail's people in a text, normalised for case and typographic dashes; an empty list is the only result that allows writing.
- `pseudonymise(data, mail) -> data'` — each personal datum replaced by a surrogate numbered in order of first appearance in the mail (`user1`, `user1@example.org`, a reserved phone number, `/home/user1`, a documentation IP address), the same throughout the report; the mapping exists only during the call.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
