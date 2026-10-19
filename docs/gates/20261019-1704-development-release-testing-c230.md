---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - e261627b353b1f6258d913a586f78074b3df505d
  - https://github.com/akmaier/agent-m/pull/1097
date: 2026-10-19 17:04 UTC
---
# Development → Release testing: ITM-1087, the backlog page lists items of four or more digits, in the order of their numbers

**REGISTER**

## Reason

ITM-1087, pull request #1097 into `sprint/team2/97`, is rejected on `e261627b`. This is its first rejection.

**The ordering sentence of the Acceptance is not met.** The Acceptance says: "Wherever this reader orders items, it orders
them by number, as ITM-1000 does, not as text."
- `backlog-view.mjs:77` sorts the item paths as text, and `:85` reads `ctx.items` in that order.
- f's finding holds for the panel, the *Plan sprint* list and the sprint rows: those take their order from `buildOrder`.
- But *Start sprint* does not. `:429` builds the `selection` it writes, through `startSprint`, into the sprint record as
  `ctx.items.map(idOf).filter(…)`, so in `:77`'s text order.
- So a sprint started from the page with ITM-101 and ITM-1000 writes ITM-1000 first.
- None of TST-1087001 to 003 starts a sprint, which is why planting a text sort at `:77` was not caught.

**Wanted.** Order the items by number where `:77` and `:85` read them, so that every list built from `ctx.items` follows
the numbers. Add a test that starts a sprint with ITM-101 and ITM-1000 ticked, and finds them written in that order. The
planted text sort at `:77` is its counter-proof.

**Accepted as it stands.**
- Red first: `ceb68327`, run 39288780483, red. TST-1087003 is the known positive.
- The fix of `ITEM_FILE` at `:44`.
- The scope.
