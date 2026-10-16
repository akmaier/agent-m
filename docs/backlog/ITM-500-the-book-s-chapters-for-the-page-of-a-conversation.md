---
id: ITM-500
title: The book's chapters for the page of a conversation
level: module
realises:
  - UC-049
  - A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING
  - A TEST JOB RECEIVES THE CHAPTER ON TESTING
  - AN ARCHITECTURE JOB RECEIVES THE CHAPTERS ON MODELING, ARCHITECTURE, DESIGN AND IMPLEMENTATION
  - AN IMPLEMENTATION JOB RECEIVES THE CHAPTERS ON MODELING, DESIGN, IMPLEMENTATION AND TESTING
modules:
  - MOD-source-register
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-source-register, Data: the book's chapters for a kind of work
---
# ITM-500 The book's chapters for the page of a conversation

**REGISTER**

## Outcome

The recipe `chapters-for-page` gives the chapters of the row of the menu entry that the job's `entry` parameter names, as
MOD-source-register's file accepted at blob `fea35b0a1ae5` states it:
- requirements for Requirements and Use cases;
- architecture for Architecture;
- implementation for Implementation;
- tests for Tests and Releases.
It gives no part for any other entry, which leaves the optional part out.

This item covers MOD-source-register's recipe only. The parameter is set by other items:
- MOD-prompt-bar adds the subject's `entry` to the job's parameters in ITM-504.
- MOD-site-frame sets `Subject.entry` from `Route.entry` in ITM-506.

What the module file leaves unstated, and what is built:
- **The form of `entry`.** It is the key of `Route.entry` (MOD-site-frame): `requirements`, `use-cases`, `architecture`,
  `implementation`, `tests` or `releases` take their row. `maintenance`, `settings`, `null`, a missing `entry` and any
  other value give no part.
- **The chapters.** They are those of the four existing recipes for the same row. The recipe reads them the same way,
  through the same register entry, version and hash, so its parts equal theirs.

No existing test's expected result changes, release tests included:
- `tests/source-register-chapters.test.mjs` iterates over the four recipes it names.
- `tests/test_job_reading.py` and `tests/test_job_reading_checkout.py` take every recipe beginning with `chapters-for-`,
  and with no `entry` the new one gives no part.
- `tests/job-runner-conversation-recipes.test.mjs` registers its own stand-in of `chapters-for-page`, catching the
  duplicate.
## Acceptance

- For each of the six keys, the recipe gives the row's chapters as the four existing recipes give them. For
  `maintenance`, `settings`, `null` and a missing `entry`, it gives none.
- The first commit holds only the tests, and CI is red on it. If it fails only because the recipe does not exist yet, the
  Developer runs it once locally against an uncommitted stub and lists the tests that fail on behaviour.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); an
  existing test that the change turns red is not changed here: the Developer stops and names it.
- Only `src/source-register/` and the tests that name MOD-source-register change.
