---
id: ITM-556
title: A drafted architecture file shows its impact list
level: module
realises:
  - UC-019
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
modules:
  - MOD-review-pages
builds_on:
  - ITM-507
  - ITM-554
tests:
  - unit
origin:
  - ITM-507's gate (#602): its route `draft` shows an architecture file with its rounds and due diligence, but no impact list, since architectureImpact is not built
---
# ITM-556 A drafted architecture file shows its impact list

**REGISTER**

## Outcome

On the route `draft`, an architecture file of the conversation's draft shows its impact list beside its rounds and its
due diligence, as MOD-review-pages states it ("an architecture file with its rounds, the due diligence and the impact
list of a change, as the descriptor's sections show them"). The list comes from MOD-trace-graph's `architectureImpact`
(ITM-554), built from the draft's files against the current ones, as `sections.mjs` already shows an architecture
change's impact list.

## Acceptance

- In a small DOM with a fixture draft of a module file, the route shows its impact list, a breaking use marked.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Each test states its expected values in its own text.
