---
id: ITM-1160
title: The implement page offers a participant a linked source forbids only where the job can do without that content
level: module
realises:
  - UC-024
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-733
tests:
  - unit
origin:
  - ITM-733's pull request #1234 (sprint team1/101), from developer-sonnet-e's reading
---
# ITM-1160 The implement page offers a participant a linked source forbids only where the job can do without that content

**REGISTER**

## Outcome

UC-024 5b: a participant in a place that a linked source forbids is offered only where the job can be done without that
content, and the content is named. ITM-733's Outcome names it, and its Acceptance does not, so ITM-733 left it out.
Building it needs the places of the restricted sources, which MOD-source-register's `restrictedPlaces` gives
(ITM-1142). MOD-implementation-pages' uses name only `sourceSchemas` of that module.

## Not ready: a draft for akmaier

The draft adds `MOD-source-register.restrictedPlaces` to MOD-implementation-pages' uses and Uses, for the offer of
participants on the route `implement`.

## Acceptance

- In a small DOM with a fixture source whose licence does not allow a participant's place: the participant is offered
  only where the job needs none of that content, and the content is named. Counter-proof: a participant whose place
  the source allows is offered as before.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
