---
id: ITM-508
title: The specification browser gives the prompt bar its subject
level: module
realises:
  - UC-020
  - UC-019
  - UC-049
  - THE PERSON WHO PROMPTS IS A SOURCE
modules:
  - MOD-trace-pages
builds_on:
  - ITM-506
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-trace-pages, the specification view; Interfaces: view
  - sprint team1/47: cut — the buttons *Change by prompt* are removed by ITM-551, after ITM-514
---
# ITM-508 The specification browser gives the prompt bar its subject

**REGISTER**

## Outcome

The specification view gives the prompt bar its subject:
- **On the default branch:** the open requirement, or the group with the names it holds, with the kind
  `change-requirements`, the person's own source (`personSource`), and the draft route `draft`.
- **At a released version:** the requirement as it read there, with the kind `converse`.
- **Every other trace view:** the frame's default, with the version shown.

The draft route is the name `draft`, which ITM-507 builds. The subject calls no function of ITM-507, so this item does
not wait for it.

**Cut.** The buttons *Change by prompt* stay until ITM-551. `tests/system-uc-019-change-requirements-by-prompt.test.mjs`
still follows them, and ITM-514 moves it to the prompt bar first.

No existing test's expected result changes.

## Acceptance

- **The subjects.** In a small DOM, each view's subject is as stated, on the default branch and at a tag.
- **The person's source.** A requirement's subject carries the person's own source.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
- **Expected values in the tests.** Each test states its expected values in its own text.
