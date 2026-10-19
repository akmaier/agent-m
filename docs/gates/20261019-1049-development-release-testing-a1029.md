---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 3c48f495c30c14467cfd92629fbdcafdd267dfb5
  - https://github.com/akmaier/agent-m/pull/1016
date: 2026-10-19 10:49 UTC
---
# Development → Release testing: ITM-1029, rejected — the tests-only commit has no red on CI

**REGISTER**

## Reason

ITM-1029 (MOD-resource-list, MOD-job-catalogue), pull request #1016 into `sprint/team1/93`, is rejected on `3c48f495`.

**What holds.**
- **Commits.** Four, one parent each, with the trailer `developer-sonnet-a`.
  - `563995f7` holds only tests, and `4deee360` holds the code.
  - `a23c0b39` gives four tests of other modules a stand-in for the new recipe. They failed with `UnknownStrategy`.
  - `3c48f495` changes TST-642014's expected recipes.
  - These test changes are the item's output: no code outside the item's folders changes, and none of them is a release test.
- **The recipe meets MOD-resource-list.md:118-122.** `resource-pins` gives one part with each resource the route reaches and
  its pin. The kinds with `resources: product` name the recipe.
- **Counter-proofs.** TST-102902 shows that a resource the route does not reach is left out. TST-102903 shows that exactly
  the five kinds name the recipe.
- **CI** is green on the head (run 39239900490).

**What fails.**
- SPEC.md:1426-1427 asks that "the product's CI run on that commit is red".
- `563995f7` has no CI run, since it was pushed before the pull request. A local red is not that run.

**What passes on the next head.**
- `563995f7` alone gets its CI run through a draft pull request used only for CI, as #996 and #1018 did, and that run is
  red. The head may stay `3c48f495`.

**Open, outside this item's Acceptance.**
- MOD-resource-list.md:121-122 says the start record names the part "among its `inputs`". Nobody has shown how the runner
  puts the part there, and nothing here claims it.
- The route comes from `params.route`, which no text places.
- Both are read when a job of these kinds is started with resources.
