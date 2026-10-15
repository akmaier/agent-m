---
id: ITM-485
title: The kind of a conversation and its recipes
level: module
realises:
  - UC-049
  - UC-019
  - ONE DEFINITION, THREE DRIVERS
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
modules:
  - MOD-job-catalogue
  - MOD-job-runner
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-job-catalogue, Data: the table of kinds; MOD-job-runner, Data: the built-in strategies `conversation` and `page`
  - TST-472282 and TST-472283, failing on main at 7e893c63
---
# ITM-485 The kind of a conversation and its recipes

**REGISTER**

## Outcome

On `main` at `7e893c63`, `node --test tests/job-catalogue.test.mjs` fails TST-472282 `kindNames` and TST-472283
`kindOf`, which compare MOD-job-catalogue's code with its accepted module file: the table now holds the kind `converse`,
and adds the recipe `conversation` and UC-049 to `change-requirements`, `change-use-case` and `change-architecture`.

Afterwards MOD-job-catalogue holds the kind `converse` — its definition, prompt and draft schema, serving UC-049 with the
recipes `page`, `conversation`, `instruction` and the optional `chapters-for-page`, and the checks, review and writer of
its row —, and the three change kinds name the recipe `conversation` and serve UC-049, as the table says. MOD-job-runner
offers the built-in recipes those kinds name: `conversation` — the conversation so far from the job's parameters, each
message with who wrote it, none for the first message — and `page` — the page as the route's subject gives it. The tools
are ITM-484's; the provenance lines without the instruction are ITM-517's.

## Acceptance

- TST-472282 and TST-472283 pass against the accepted module file. TST-472283's expected result, that no recipe of the
  table may be left out, changes with the accepted row of `converse`, which names `chapters-for-page` as optional; the
  pull request names that passage.
- Each recipe gives one part from fixture parameters, and `conversation` none for a first message.
