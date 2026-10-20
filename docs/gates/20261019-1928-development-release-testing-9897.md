---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 80ae219f1e51b5b7f033a8b72fa9c2e4835d6f7d
  - https://github.com/akmaier/agent-m/pull/1140
date: 2026-10-19 19:28 UTC
---
# Development → Release testing: ITM-1105, the live dashboard hands #replies' issue to the route

**REGISTER**

## Reason

ITM-1105, pull request #1140 into `sprint/team2/97`, passes on `80ae219f`. CI is green on the head, on 20 of 20 jobs.

1. **Tests only, over built code.** g's 3 planted faults in the dispatch each fail the test, as the item asks.
2. **The address form, decided.**
   - MOD-maintenance-pages.md:117 names the route `replies/<issue>`. MOD-site-frame.md:133: "`name` is the first part of the
     address's fragment, the rest are its `params`", which the frame reads as `key=value`.
   - The route's own `go` writes `#replies/issue=12`.
   - So `replies/<issue>` names the route and its parameter, not a positional address. g tests `#replies/issue=12`, and that
     is right.
   - The item's `#replies/12` was the Product Owner's wording.
3. **A flaky test seen.** The first CI attempt failed in `tests/maintenance-pages-ask.test.mjs`, "Close and reply closes the open
   issue and shows its drafts", and passed on the rerun. That is not this pull request's file. It is registered as ITM-1106 for
   developer-sonnet-h, who wrote it (agreement 94).
