---
id: ITM-383
title: The source of the person who gives an instruction
level: module
realises:
  - UC-019
  - THE PERSON WHO PROMPTS IS A SOURCE
  - A REQUIREMENT HAS A REGISTERED SOURCE
modules:
  - MOD-source-register
builds_on:
  - ITM-315
tests:
  - unit
origin:
  - UC-019 step 6, 4b
---
# ITM-383 The source of the person who gives an instruction

**REGISTER**

## Outcome

MOD-source-register's `personSource(links, register, account)`, as its file states it, and the register entry's
`identifier` for a person, `<server>/<account>`, in the entry's schema: the identifier of the linked register entry of
kind `person` whose `identifier` is the account, or `null`. The prompt route of requirements (ITM-398) calls it to give
a job of `change-requirements` its parameter `source`.

## Acceptance

- Unit tests that name MOD-source-register state, before the code exists: this instance's `SRC-po-a-maier` found for
  `github.com/akmaier`; `null` for an account without an entry, for an entry the product does not link, and for an entry
  of another kind; a person's entry with its `identifier` passing the schema.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/source-register/` and the tests that name MOD-source-register change.
