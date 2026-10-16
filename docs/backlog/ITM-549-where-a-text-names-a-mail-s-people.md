---
id: ITM-549
title: Where a text names a mail's people
level: module
realises:
  - A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
  - NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY
modules:
  - MOD-personal-data
builds_on:
tests:
  - unit
origin:
  - MOD-personal-data, Interfaces: People, Hit, personHits
  - sprint team1/47: `src/personal-data/index.mjs` exports only settingsSchemas and pseudonymisationOf; ITM-510 needs personHits
---
# ITM-549 Where a text names a mail's people

**REGISTER**

## Outcome

MOD-personal-data's `personHits(text, people) -> Hit[]`, with the types `People` and `Hit`, as its file states them. It
is a pure function: no request, no file. `peopleIn`, which finds a mail's people, is ITM-550's.

The readings, settled from the module file ("every place in `text` where one of `people` appears: names also by their
parts, addresses also by their local part, phone numbers by their digits whatever the separators, regardless of case"):
- **A match** is case-insensitive and stands as a whole word. It is not a match where a letter or digit stands directly
  before or after it.
- **Names.** Each name is matched whole, and so is each of its parts. The parts are what blanks separate in the name,
  each kept as written, a period included.
- **Addresses.** Each address is matched whole, and so is its local part, the text before `@`.
- **Phone numbers.** In the text, a run of digits that may start with `+` and be separated by blanks, hyphens, slashes,
  dots or parentheses is a hit where its digits equal the digits of one of `people.phones`.
- **Accounts.** Each account is matched as given, with or without a leading `@`.
- **A hit.**
  - `kind` is the kind of what was found, and `value` the text as it stands in `text`.
  - `line` and `column` count from 1, where the hit begins.
  - Where a part of a name and the whole name are both found at the same place, the whole name is the hit.
- **The order.** Hits are given by line, then column. An empty list means the text names none of them.

No existing test's expected result changes.

## Acceptance

- **Each kind is found.** A planted name, one of its parts, an address, its local part, a phone number written with
  other separators, and an account with and without `@` are each found with their kind, value, line and column.
- **Counter-proofs.** A text without any of them gives `[]`. A word that only contains a name part, such as "Annabel"
  for "Anna", is no hit.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
- **Expected values in the tests.** Each test states its expected values in its own text.
