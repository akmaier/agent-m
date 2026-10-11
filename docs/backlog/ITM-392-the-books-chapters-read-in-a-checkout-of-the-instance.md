---
id: ITM-392
title: The book's chapters read in a checkout of the instance
level: module
realises:
  - UC-010
  - UC-011
  - A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE
  - A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING
  - A TEST JOB RECEIVES THE CHAPTER ON TESTING
  - AN ARCHITECTURE JOB RECEIVES THE CHAPTERS ON MODELING, ARCHITECTURE, DESIGN AND IMPLEMENTATION
  - AN IMPLEMENTATION JOB RECEIVES THE CHAPTERS ON MODELING, DESIGN, IMPLEMENTATION AND TESTING
modules:
  - MOD-source-register
builds_on:
  - ITM-391
tests:
  - unit
origin:
  - UC-011 step 3
  - UC-010 step 3
---
# ITM-392 The book's chapters read in a checkout of the instance

**REGISTER**

## Outcome

The four chapter recipes of `sourceStrategies`, as MOD-source-register's file now states them: for a job whose context
names `instance.checkout` (ITM-391), each part holds the path of the chapter's file in that checkout and none of its
text, once the file read there has the SHA-256 the version records; in a browser, the text as before. None of these
parts may be left out; a file whose hash differs fails by name.

## Acceptance

- Unit tests that name MOD-source-register state, before the code exists, with a fixture checkout: each recipe giving
  the paths of its chapters; a chapter file whose bytes differ failing by name; without a checkout, the whole texts as
  the existing cases assert.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/source-register/` and the tests that name MOD-source-register change.
