---
id: ITM-564
title: A change kind takes the conversation's draft as it stands
level: module
realises:
  - UC-019
  - UC-049
modules:
  - MOD-job-catalogue
builds_on:
  - ITM-529
tests:
  - unit
origin:
  - ITM-559's stop in sprint team1/48 (#609): a follow-up from the route draft runs a change kind whose recipes hold no draft, so the draft as it stands is not sent (TST-377007, TST-418104)
  - architecture draft for akmaier: change-requirements, change-use-case and change-architecture take `draft?`
---
# ITM-564 A change kind takes the conversation's draft as it stands

**REGISTER**

## Outcome

`change-requirements`, `change-use-case` and `change-architecture` name the recipe `draft?` after `conversation` in their
`kind.md`, as the draft of MOD-job-catalogue's table states it.
- **The recipe.** It is MOD-job-runner's existing `draft`, made optional as `instruction?` is (ITM-529).
- **With a draft.** A follow-up from the route `draft` hands the conversation's draft as it stands, and the participant
  changes it further.
- **Without one.** The recipe gives nothing.

It waits for akmaier's acceptance of the draft. ITM-559's S11 builds on it.

**Existing tests whose expected result changes:** TST-472283, whose stated table lists the kinds' recipes
(`tests/job-catalogue.test.mjs:39`), and TST-472284, a prompt's named place for each recipe.

TST-476059 (`tests/specification-and-design-drafting-together.test.mjs:278`) lists a `change-use-case` job's parts, and
holds, since a job started without a draft gets no `draft` part.

## Acceptance

- **The recipe in the prompt.** Each of the three kinds' prompts holds the draft where one is handed, and nothing where
  none is handed.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
- **Expected values in the tests.** Each test states its expected values in its own text.
