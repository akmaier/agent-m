---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 798a10e54bbc0d397e814a51f28080d5504fc638
  - https://github.com/akmaier/agent-m/pull/394
date: 2026-10-11 18:27 UTC
---
# Development → Release testing: ITM-318, the routes a participant offers

**REGISTER**

## Reason

ITM-318, pull request #394 by developer-sonnet-c into `sprint/team1/18`, head `798a10e`. The first commit `4a1bfa4`
holds only `tests/runtimes-routes.test.mjs`, and CI was red on it (run 38163473238): its five tests fail, and no other
test does. CI is green on `798a10e` (run 38163615629, 1639 tests, 0 failures). The code changes only `src/runtimes/`
(the new `routes.mjs` and the export in `index.mjs`); every new test names MOD-runtimes and its guards, and 25
planted faults are recorded, one of them equivalent and named. The Acceptance holds: each route form with a private
and a public product, with and without the job workflow, and the needs `bridge workstation` and `runner:gpu`, among
them the runner refused for the public product.

The reading weighed: `internal` is refused for a self-hosted runner as `public` is. It rests on the text, not on an
added word: `A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY` says such a runner "is registered only
to a repository whose visibility is private", and MOD-runtimes' `routesFor`, whose product's visibility is "public" |
"private" | "internal", says a self-hosted runner "is offered only for a repository whose server reports it private,
and refused with the reason otherwise". An internal repository is not reported private, so the refusal follows. The
other readings named in the pull request each fill a point the texts leave open, without a change of an accepted text.
