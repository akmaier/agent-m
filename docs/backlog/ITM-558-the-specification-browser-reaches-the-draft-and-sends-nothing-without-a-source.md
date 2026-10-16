---
id: ITM-558
title: The specification browser reaches the draft, and sends nothing without the person's source
level: module
realises:
  - UC-019
  - UC-049
  - THE PERSON WHO PROMPTS IS A SOURCE
modules:
  - MOD-trace-pages
builds_on:
  - ITM-508
  - ITM-507
  - ITM-514
tests:
  - unit
origin:
  - ITM-514's findings S7 (TST-418007) and S8 (TST-418008), gate docs/gates/20261016-1655-development-release-testing-70c2.md
---
# ITM-558 The specification browser reaches the draft, and sends nothing without the person's source

**REGISTER**

## Outcome

- **S7, the draft route.** MOD-prompt-bar's `Subject.draftRoute` is "the route of the review pages that shows a draft of
  this subject". The specification browser's subject (`src/trace-pages/subject.mjs`) gives `draft`, so the review pages'
  route reads no subject and shows that there is no draft.
  - It gives `draft/subject=<key>`, with the subject's `key` encoded as a fragment's parameter. That is the form the
    review pages' own subjects give (ITM-507), so the two modules name the route `draft` in one form.
- **S8, no source.** For a change of requirements without the person's own source, the subject sends nothing and names
  the missing step (UC-019 4b), as the review pages' subjects do (`NoPersonSource`, ITM-507).
  - Today `paramsFor` gives `source: null`, and the message is sent.

ITM-514's todo tests TST-418007 and TST-418008 then pass, and are turned into plain tests by a developer who implements
none of this item.

## Acceptance

- **S7.** In a small DOM, the draft route of a requirement's subject on the default branch is
  `draft/subject=<encoded key>`, and the review pages' route `draft` finds the draft by it.
- **S8.** Without a person's source, the subject names the missing step, and nothing is sent.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
- **Expected values in the tests.** Each test states its expected values in its own text.
