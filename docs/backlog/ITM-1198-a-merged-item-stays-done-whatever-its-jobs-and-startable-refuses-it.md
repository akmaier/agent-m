---
id: ITM-1198
title: A merged item stays done whatever jobs or pull requests of it follow, and startable refuses a job on a done item
level: module
realises:
  - UC-032
modules:
  - MOD-work-plans
builds_on:
  - ITM-1196
tests:
  - unit
origin:
  - the residue of ITM-1196 (#1321), 41 merged items not done; akmaier, 2026-10-23, "make sure this does never happen again"
---
# ITM-1198 A merged item stays done whatever jobs or pull requests of it follow, and startable refuses a job on a done item

**REGISTER**

## Outcome

After ITM-1196, 41 items with a merged pull request are still not done: 17 in progress, 17 waiting for an item they build
on and 7 waiting for acceptance (g's count at #1321, productFacts' scope `work`, `main` at `54a044c9`).
- **The cause** is the newest-job rule of ITM-864 (the accepted text `d480c4eb`). After an item's newest job ended `done`
  or is running, a merged pull request opened before that job's start no longer counts.
- **Example:** ITM-245's #208 was opened on 10-07 and merged. A job on 10-17 ended done.
- So a new job on a done item reopens it, the reopening akmaier asked to stop.
- **Pinned by TST-864002 and TST-864004.**

## Not ready: a draft for akmaier

The draft `19a16c1c`, with its follow-up, states that a merged pull request decides over jobs and later pull requests too,
and that `startable` refuses a job on a done item. This item is built once akmaier accepts it. Until then, the accepted
newest-job rule holds.

## Acceptance

- An item with a merged pull request is `done`, whatever job or pull request of it starts or opens later.
- `startable` names "the item is done" as a reason, and no job starts on a done item.
- TST-864002 and TST-864004 change with the accepted text, by a participant who did not write them. The change is named
  at the start.
- The derivation's count of done items is recorded before and after, from the repository.
- The first commit holds only the tests, and CI is red on it.
