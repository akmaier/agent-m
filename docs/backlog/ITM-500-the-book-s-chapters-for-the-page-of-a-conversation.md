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

The recipe `chapters-for-page` gives the chapters of the row the menu entry of the job's `page` parameter names —
requirements for Requirements and Use cases, architecture for Architecture, implementation for Implementation, tests
for Tests and Releases — and no part for any other page.

## Acceptance

- For each menu entry, the recipe gives the row's chapters as the four existing recipes give them, and none for a page
  of another entry.
