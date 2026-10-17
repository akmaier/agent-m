---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 85209d00fa4f8d9f9708e961c9ec36a6786840bd
  - https://github.com/akmaier/agent-m/pull/708
date: 2026-10-17 08:36 UTC
---
# Development → Release testing: ITM-599, The gaps view shows the derived matrix and its gaps at the chosen version

**REGISTER**

## Reason

ITM-599, pull request #708 into `sprint/team1/68`, at head `85209d00`. developer-sonnet-d wrote it.

**Red.** Three tests-only commits came before the code. The last red is run 39017184691 (`failure` on `e61554c5`):
- node (1): `# fail 3`, which are TST-599201 to 599203, the token and no-token counts;
- node (7): `# fail 8`, which are TST-599001 to 599008.

They fail on behaviour, against the base's "No current requirements…". The second and third tests-only commits
corrected the developer's own tests: hanging DOM-list comparisons became counts, and planted fault 11 found a missing
assertion. Each ran red again before the code (sprint 56's agreement).

**The token budget** (sprint 66), measured by the committed test TST-599006, as sprint 67's agreement asks:
- with a token, the first opening at the default branch costs 5 REST and 17 GraphQL requests, and a second one 5 REST;
- without a token, the first costs 4 REST and 1641 raw reads outside the API, and a second 4 REST and 1 raw read.

The specification and gaps views share the graph. This is the bound the start named: at most 17 GraphQL batches, once
per version.

**Rulings.**
1. **Keeping the graph by `context.store` is within MOD-trace-pages' interfaces.**
   - The code (`flow.mjs:93-102`) keys a `WeakMap` by the identity of `context.store`, or of the Host where a context
     has none. It keeps the graph in memory, under the commit.
   - It calls no function of the store and writes nothing to it, so it uses no interface of MOD-browser-store.
   - `ViewContext` gives every route its `store` (MOD-site-frame, Data), and holding that object as a key is using what
     the route is given.
   - The reason, a new Host at every navigation, is registered as ITM-669.
2. **TST-600154 is accepted as changed.** "A view the route does not draw" is now `tests`, since `gaps` is drawn, and its
   expected values are unchanged.
3. **Lines open in place, from the version's snapshot.** UC-020 step 7 reads: "Each line leads to the requirement or use
   case as it read in that version." The review pages read only the default branch, so a link there would show today's
   text. Opening in place meets "as it read in that version".
4. **The harness move is accepted.** The new gaps tests share the DOM and fixtures with the specification tests, and
   sprint 56's agreement reads: "A shared test harness lives in a helper file of its own, never in a test file." The 24
   tests of `trace-pages-specification.test.mjs` are unchanged.

**What else holds.**
- CI is green, ten of ten in run 39017780813, and the pull request is mergeable.
- Twelve planted faults are caught.
- TST-472516, 472518 and 473167 pass before and after.
- ITM-018 passes, and the fetch spy saw no call over 201 tests.

**Findings** (sprint 63's agreement):
- **No release test of the gaps:** ITM-667, through the frame's route, by another participant.
- **No way from the specification view to Gaps:** ITM-668.
- **Comparing two versions** is ITM-600, already registered.
- **The frame's new Host per navigation:** ITM-669, which measures first.
- **24 tests import `./site-frame.test.mjs` as a harness**, the three of MOD-trace-pages among them, against sprint 56's
  agreement: ITM-670.
- **The memory of each visited commit's graph: no item.** It lasts one page load, and holds the commits a person
  chooses. No limit is claimed or measured, and none is asked.
