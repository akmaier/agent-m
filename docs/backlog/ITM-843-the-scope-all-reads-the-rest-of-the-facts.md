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
  - ITM-745
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

**Stopped before any code (team 2's sprint 103, developer-sonnet-h), and corrected by the texts (po-opus-b).**
- **A missing prerequisite.** `Facts.ci.drift` is MOD-test-schedule's `configurationDrift` (MOD-progress-measures.md:152-155,
  :324-325; MOD-test-schedule.md:133), accepted and not built (`src/test-schedule/index.mjs:7`). It is ITM-745, which now
  stands in this item's builds_on.
  - Computing the drift here would be a second copy.
  - Setting `ci` to `"unknown"` is not what the text allows.
- **No live state.** The Outcome above says the scope `all` reads the jobs' live state, and the note below it says `home`
  takes them from `Facts` once this item gives them. Both contradict the accepted text: `productFacts` "asks no job's
  live state … a caller that asks the live states … derives the rows again with `listJobs`" (MOD-progress-measures.md:150-152,
  :204-207). This item reads no live state. `home` keeps deriving its rows as it does (`src/main-page/home.mjs:68-69`).
- **h's notes for the developer:**
  - `Facts.modules` is ITM-1161's.
  - The load fake has no `/actions/runs` and no history.
  - The pinned counts that move are TST-826001, 005 and 006, TST-842001 to 004, TST-827006 and 007, and TST-847003. A
    test outside the item's module among them is named at the start.

