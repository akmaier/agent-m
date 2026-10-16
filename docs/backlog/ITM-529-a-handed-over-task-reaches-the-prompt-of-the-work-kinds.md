---
id: ITM-529
title: A handed-over task reaches the prompt of the work kinds
level: module
realises:
  - UC-049
  - ONE DEFINITION, THREE DRIVERS
modules:
  - MOD-job-catalogue
builds_on:
tests:
  - unit
origin:
  - MOD-job-catalogue, accepted by akmaier at 4345829a (draft 2fcb4a2e): `implement`, `refactor`, `write-tests` and `fix-bug` take an optional `instruction`
---
# ITM-529 A handed-over task reaches the prompt of the work kinds

**REGISTER**

## Outcome

The kinds `implement`, `refactor`, `write-tests` and `fix-bug` name the recipe `instruction?` first among their recipes,
as MOD-job-catalogue's accepted table states. Their prompts hold a named place `{{instruction}}`, so that a task handed
over from a conversation, which MOD-runtimes, MOD-workflow-entries and MOD-bridge-jobs give a job as its instruction,
reaches the participant's prompt. A job without the parameter gets no part there, and its prompt reads `(none)` in that
place, as for every recipe that gives none.

What the module file leaves unstated, and what is built:
- **Where the place stands in each prompt.** Before the inputs, under the heading `## The task as the person gave it`.
- **What a participant reads in it.** One sentence before the place: the task, where one is given, is the work asked
  for, within what the inputs below allow.

The existing test whose expected result the accepted texts change, named here:

- TST-472283 (`tests/job-catalogue.test.mjs`). Its stated table gives the four kinds' recipes, which gain
  `instruction?` first.

TST-472284 (each prompt has a named place for exactly its recipes) keeps its expected result and holds with the new
places. `tests/test_job_reading.py` and `tests/test_job_reading_checkout.py` register a stand-in for every strategy a
kind names, and `instruction` is built into MOD-job-runner, so their chapter parts are unchanged. No release test reads
these kinds' recipes.

## Acceptance

- `kindOf` of each of the four kinds gives `instruction` first, optional, then the recipes it named before.
- `prepareJob` of `implement` with `instruction: "Add a footer"` holds the part `instruction` with that text, and without
  it holds no such part and leaves nothing out.
- The first commit holds only the test changes, and CI is red on it.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); a
  further existing test that the change turns red is not changed here: the Developer stops and names it.
- Only `src/job-catalogue/` and the tests that name MOD-job-catalogue change.
