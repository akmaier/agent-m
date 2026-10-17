---
id: ITM-843
title: The scope all reads the rest of the facts
level: module
realises:
  - UC-046
modules:
  - MOD-progress-measures
builds_on:
  - ITM-826
tests:
  - unit
origin:
  - ITM-826's draft stop (sprint team1/77), from developer-sonnet-e's count
---
# ITM-843 The scope all reads the rest of the facts

**REGISTER**

## Outcome

`MOD-progress-measures.md:150` reads: "With the scope `all`, the default, it reads everything once". ITM-826 builds the six
sources the stages need. `modelSince` (through `readHistory`), `schedule`, `ci`, `resourceNeeds` and the jobs' live state
stay `"unknown"`. This item reads them as the text says, in batches where they are files. The start counts the
requests at this repository's size, before and after. Their callers are the progress page (ITM-800) and MOD-run-planner.

## Acceptance

- Every field of `Facts` is read in the scope `all`, or is `"unknown"` only where its text says so, with tests and the
  counts.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Added at ITM-827's draft stop (sprint team1/78, 2026-10-17, po-opus).** `productFacts` gives `jobs` without their live
state (`src/progress-measures/facts.mjs:186` passes `new Map()`), against the module's text. ITM-827's `home` reads the live
states itself. Once this item gives them, `home` takes them from `Facts`, and its own reading goes.
