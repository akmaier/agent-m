---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0cddf26803910dd56967a6218086535c179ec0ce
  - https://github.com/akmaier/agent-m/pull/662
date: 2026-10-17 00:49 UTC
---
# Development → Release testing: ITM-627, The release tests of UC-014 steps 7 to 9 run through the setup route

**REGISTER**

## Reason

ITM-627, pull request #662 into `sprint/team1/58`, at head `0cddf268`. developer-sonnet-b wrote it. It implemented none
of ITM-588 or ITM-575, as a release test requires.

1. **No red run is possible, and the planted faults stand in for it.** The route exists, so the thirteen tests pass on
   the base. Sixteen planted faults in copies of `setup.mjs` and `explanations.md` each fail a named test:
   - a permission dropped or added;
   - the expiry;
   - storing before the tick;
   - ready without a read;
   - the explanations;
   - the instance read without the token.

   The restored files pass all thirteen, and `diff -r src` is empty.
2. **CI is green on the head**: runs 38987452643 and 38987855825 passed ten of ten jobs. GitHub reports the pull request
   mergeable. A pull request into a sprint branch skips the release level, so this file first runs in CI on the
   sprint's pull request into `main`, whose Release testing gate reads it.
3. **The changes stay in the item's scope**: one new release test file of MOD-settings-pages. No source and no other test
   changes, and the three old release tests stay until the pull request between jobs.
   - The tests find the page by what the use case names, not by ids or classes.
   - ITM-018 and the Python checks pass, and UC-014's tests rise by the thirteen.
4. **The Acceptance holds.** Each assertion `ITM-627` names is stated, each guards its step or requirement, and a
   planted fault fails each.

**The readings are taken.**
- **The permissions' purposes.** Each is asserted word for word from UC-014 step 7. Metadata has no purpose there, so a
  reason of at least eight letters is asserted.
- **`target_name`** is not a permission.
- **Ready leads to `main`**, UC-014 step 9's main page.
- **TST-627007 clicks the disabled button**, as TST-588011 does.

**Found: the fold's label.** UC-014 step 7 says "A folded **Why these?** says what each is for". The route shows that
text in a fold labelled "What is this?", the label MOD-site-frame's `explain` always gives.
- The use case names the label, so the route misses it.
- No accepted text lets `explain` give another label: MOD-site-frame says it is "the folded *What is this?* of a topic".
- So it is a draft for akmaier, committed with this gate. `explain` takes an optional label, and MOD-settings-pages'
  Step A uses "Why these?" for the topic `setup-key`.
- ITM-628 builds it once the draft is accepted. The release tests here assert the fold's text, not its label, so they
  hold either way.
