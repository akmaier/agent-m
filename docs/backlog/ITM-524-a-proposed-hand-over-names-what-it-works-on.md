---
id: ITM-524
title: A proposed hand-over names what it works on
level: module
realises:
  - UC-049
  - ONE DEFINITION, THREE DRIVERS
modules:
  - MOD-job-catalogue
builds_on:
  - ITM-484
tests:
  - unit
origin:
  - MOD-job-runner, Data: the tool `hand-over` — "a kind of the catalogue with a participant, what it works on, and the task in the drafter's words"
  - Team 1's start decision of sprint 35
---
# ITM-524 A proposed hand-over names what it works on

**REGISTER**

## Outcome

The schema of the tool `hand-over`'s arguments in MOD-job-catalogue's `tools.md` asks for what the job it proposes works
on, beside its kind and its task. MOD-job-runner's file says the tool holds "a kind of the catalogue with a participant,
what it works on, and the task in the drafter's words". ITM-484 built the schema with `kind` and `task` only, so a
drafter cannot name what the job works on, and MOD-job-ledger's start record of the job needs it (`works_on`).

What the module files leave unstated, and what is built:
- **The argument's name and form.** It is `works_on`, a list of texts, required — the field of the job record's start
  that it fills.
- **What a drafter reads.** The tool's description says that `works_on` names the requirements, use cases or items the
  job works on.

The existing test whose expected result the accepted texts change, named here:

- TST-484001 (`tests/job-catalogue-tools.test.mjs`). It states `hand-over`'s required arguments as `kind` and `task`;
  they become `kind`, `works_on` and `task`.

No release test reads the tools.

## Acceptance

- `toolsOf(["hand-over"])` gives an argument schema that requires `kind`, `works_on` and `task`, `works_on` a list of
  texts.
- The first commit holds only the test changes, and CI is red on it.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); a
  further existing test that the change turns red is not changed here: the Developer stops and names it.
- Only `src/job-catalogue/` and the tests that name MOD-job-catalogue change.
