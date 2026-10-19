---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 63fde37666c9ebac8bb34c94624ad5d3083972d5
  - https://github.com/akmaier/agent-m/pull/981
date: 2026-10-19 08:02 UTC
---
# Development → Release testing: ITM-863, rejected — the live main page would stop checking products

**REGISTER**

## Reason

ITM-863 (MOD-notifications, MOD-site-frame), pull request #981 into `sprint/team1/93`, is rejected on `63fde376`.

**What holds.**
- Both commits carry the trailer `developer-sonnet-a`. The red is `942f70fc` (run 39219139977): TST-863002 to 863004 and
  863101, with TST-863001 as the known positive.
- The frame's `productHostFollowingStore` connects each product's host through the stored token, its name and the
  secrets at each call, as the accepted text says.
- `checks.mjs` no longer connects hosts itself, and the fetch spy over the notifications files sees no call.

**What fails: a caller of `watchForAcceptance` that the item does not change.**
1. `docs/index.html:77` loads `src/home/home.mjs` for the live main page.
2. `home.mjs:126` calls `watchForAcceptance({ store, instance, addressOf })`, with no `productHost`.
3. With #981, `checks.mjs` calls `page.productHost(url)`. On the live main page that throws a `TypeError` for every
   product, and the check's per-repository catch absorbs it.
4. So the live main page stops telling a person what waits for their acceptance in a product. That is SPEC.md's
   `A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE`, and nothing shows it.
A change of what a function needs is checked at every caller of it. Team 2 holds the same as an agreement
(team2/92.md:165).

**What passes on the next head:**
- `home.mjs` hands `watchForAcceptance` a `productHost` the way the frame does, through
  `productHostFollowingStore` (MOD-main-page, accepted at `42f9973d`, whose Parts name `home.mjs`);
- a test shows the live main page's checks reaching a product, with a counter-proof;
- ITM-863's modules name MOD-main-page too.
