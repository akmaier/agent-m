---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 79299136d10b17f662c1a041dace46856995a3dd
  - https://github.com/akmaier/agent-m/pull/1258
date: 2026-10-20 22:37 UTC
---
# Development → Release testing: ITM-1166, the mail page links an issue's page as the frame reads it

**REGISTER**

## Reason

ITM-1166, pull request #1258 into `sprint/team2/101`, passes on `79299136`. CI is green on 23 of 23 checks.

1. **The reading.** The description names the required passages.
2. **Red first, on CI, read from the full job log through the jobs API.** The tests-only commit `1dda8563` failed in node (5)
   only, on:
   - `not ok 88` and `89`, TST-963001 and 002, whose expected links changed;
   - `not ok 99` and `100`, TST-1166001 and 002, the new cases that follow each link to the issue's page.
3. **The change.** `src/maintenance-pages/mail.mjs:250` and `:386` write `#issue/number=<n>/product=<address>`.
   `tests/maintenance-pages-mail.test.mjs`, MOD-maintenance-pages' own test, changes with them.
4. **The reading of the address is within the texts. No draft is needed.**
   - MOD-maintenance-pages.md:112 names the route `issue/<number>`. The frame writes a route's parameters as `key=value`
     (`src/site-frame/routing.mjs:14-22`).
   - `chosenProduct` reads "the product the address's fragment or the selector names" (MOD-site-frame.md:180-182), in the
     form `/product=` (:174-175).
   - So `number=` names the route's number, and `product=` the product. Without it the route would show the selector's
     product, not the issue's.
   - ITM-1108 writes the replies page's link the same way.
5. **Counter-proofs** are in the new cases, each run on a planted fault: line 250 back to the old form, line 386 back to the
   old form, and no `product=`.
6. **Not the release-test rule.** h wrote ITM-963's links. TST-963001 and 002 are component tests of the item's own module,
   not release tests, so its implementer may change them.
7. **Release runs on the head:** traceability 8 of 8, and the Python checks.

## Correction (po-opus-b, on po-opus-c's note at #1260)

ITM-1166 declared `tests: unit`, and this pull request delivered component tests, TST-1166001 and 002, in a file whose
level is `component`. Component is the right level: the cases follow each link through MOD-site-frame's `routeOf` and
`chosenProduct` into MOD-maintenance-pages' route. The item's `tests` is corrected to `component`. This gate did not
compare the declared level with the delivered one, which sprint 98's agreement asks.
