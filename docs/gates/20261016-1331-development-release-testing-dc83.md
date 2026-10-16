---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 792502e6ebf083af92512fd4999d022a756d42a2
  - https://github.com/akmaier/agent-m/pull/582
date: 2026-10-16 13:31 UTC
---
# Development → Release testing: ITM-506, Every route gives the prompt bar its subject, and the frame starts the bar

**REGISTER**

## Reason

ITM-506, pull request #582 into `sprint/team1/43`, at head `792502e6`. developer-sonnet-b made the four commits. It lists
AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `43.md`, MOD-site-frame, MOD-prompt-bar and UC-049 as read in
full. It names the callers it read: `startPromptBar` in `tests/prompt-bar.test.mjs`, and `registerStrategies` in
`src/site-frame/start.mjs`.

1. **The red commits.** The tests-only commit `652b9f90` was pushed alone, and CI was red on it (run 38905802322). Exactly
   TST-506001 to TST-506006 failed, on behaviour. After the send-back, the tests-only commit `797b880c` was red on exactly
   TST-506003 (its changed key) and the new TST-506007 (run 38907962566).
2. **CI is green on the head**: ten of ten jobs, run 38908169446. The pull request is mergeable. Locally, the release tests
   of MOD-site-frame, MOD-prompt-bar and UC-049 give 36 passing and none failing, as on the base. The other failures are
   the known ones.
3. **The changes stay in the item's scope.**
   - `src/site-frame/index.mjs` and the new `subject.mjs`, the item's module, and the new
     `tests/site-frame-prompt-bar.test.mjs`.
   - In ITM-531's tests and their shared fixture `tests/site-frame-start.d/dom.mjs`, which name MOD-site-frame, only how
     they prepare the page changed: an offline `fetch`. Every expected result stays.
   - TST-506008 and TST-506009 are new. They show that the pages, now with the bar, reach no network: no request leaves the
     fixture.
4. **The new tests.** TST-506001 to TST-506009 state their values in their own text. Fifteen planted faults are recorded in
   #582.
5. **The Acceptance holds.**
   - The bar is started on the main and the review pages, and not in the Bridge's window.
   - The subject follows the route shown, with `entry` the route's.
   - A hidden secret's value is not in the default page.

**The default key, settled from the texts at the send-back.** MOD-prompt-bar's Subject says `key` "names the subject, so
that a draft is shown only for the subject it was drafted on". MOD-site-frame's default page holds "the product". So the
key is the route's fragment with `product=<address>` where a product is chosen. That refines the start decision's "the
route's name with its parameters", which did not name the product. TST-506007 shows three keys for one route on the
instance and two products.

The other readings quoted in #582 are within the accepted texts:
- the bar starts after the first route is shown;
- the parameters are the shown route's;
- the default page's lines are in the order named;
- a "not built yet" page gives a stand-in route.
The bar's position is ITM-540.
