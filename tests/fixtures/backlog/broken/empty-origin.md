---
id: ITM-014
title: Export the thesis as PDF
kind: implementation
level: 1
realises:
  - EXPORT IS A PDF
  - UC-003
modules:
  - MOD-export
depends_on:
  - ITM-016
origin:
---
# ITM-014 Export the thesis as PDF

**REGISTER**

## Outcome

The thesis is exported as one PDF file, figures included.

## Realises

- `EXPORT IS A PDF`
- UC-003 — Export the thesis

## Where it came from

The issue https://github.com/alice/thesis-tool/issues/57, classified as a bug.

## Modules

- MOD-export

## Kind and level

- Job kind: **implementation**
- Level: **1**

## Acceptance criteria

- A thesis with two figures is exported as a PDF that shows both.

## Depends on

- ITM-016 — the reader

## Needs a person

No.
