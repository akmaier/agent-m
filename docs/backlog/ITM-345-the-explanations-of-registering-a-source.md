---
id: ITM-345
title: The explanations of registering a source
level: module
realises:
  - UC-004
  - EVERY STEP EXPLAINS ITSELF
  - A STANDARD IS REGISTERED BY ITS DESIGNATION
modules:
  - MOD-site-frame
builds_on:
  - ITM-221
tests:
  - unit
origin:
  - UC-004 steps 2 to 5
---
# ITM-345 The explanations of registering a source

**REGISTER**

## Outcome

The topics of MOD-site-frame's `explanations.md` that UC-004 names, written for someone new to them: the four kinds of
source, with an example each; name, kind, authority and licence, with examples; where a standard's designation stands on
its cover page and why the amendment matters; a file that is only hashed; what becomes public. The library page shows
them folded (ITM-350).

## Acceptance

- Unit tests that name MOD-site-frame state, before the code exists, that `explain` gives each new topic, folded, with
  its text.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
