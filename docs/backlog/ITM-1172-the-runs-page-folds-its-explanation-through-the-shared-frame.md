---
id: ITM-1172
title: The runs page folds its explanation through the shared frame
level: module
realises:
  - UC-028
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-test-pages
  - MOD-site-frame
builds_on:
  - ITM-221
  - ITM-760
  - ITM-765
tests:
  - unit
origin:
  - TST-773112 in PR1269 and its recorded focused outcome on test-results at 4010e384967896fe8306248c848aa5d6549c944a
---
# ITM-1172 The runs page folds its explanation through the shared frame

**REGISTER**

## Outcome

The commit-detail page of MOD-test-pages' route `runs` carries a folded explanation through the existing
MOD-site-frame `explain(topic)` interface. Its topic lives once in MOD-site-frame's `explanations.md`, not as prose
or another explanation widget in `runs.mjs`.

Written for someone new to GitHub, the topic explains the displayed per-level and per-test results, a missing result
being not run rather than passed, the distinction between failed and flaky results, model-dependent rates beside the
previous release, and what choosing *Run on this commit* does. It does not change how any of those results is computed
or how a run is started.

This is the repair of the missing fold observed by TST-773112, not a new interface, a change to UC-028 or its formats,
or completion of the whole use case. MOD-test-pages already uses `MOD-site-frame.explain`; MOD-site-frame already owns
the topic file and the folded presentation.

## Acceptance

- A unit regression through the public `runs` route and the real shared `explain` mechanism finds a folded
  `details.explain` with its *What is this?* summary and nonempty topic text on a valid fixture commit's detail page.
  Its expected text or meanings are stated in the test itself, never read from a formal document at runtime.
- The topic is kept in `src/site-frame/explanations.md` and is found by the existing frame topic check. No duplicate
  explanatory prose or custom explanation widget is introduced in the runs route.
- The first commit is tests-only and has actual intended failing assertions on server CI before production is
  assigned. Each new automated case has a recorded planted-source-fault failure and restoration; final CI is green.
- Production changes are limited to `src/test-pages/runs.mjs` and the required topic in
  `src/site-frame/explanations.md`. New owned unit tests may name these modules; no other product source, interface,
  schema, consumer or runtime mechanism changes.
- Existing expectations stay unchanged, including the original five files of ITM-773. TST-773112 remains intact and
  is verified after this repair on the integrated sprint by the independent test participant, not rewritten to pass.
- The existing run/result paths, release audit embedding, release tests' authorship and all other topics are preserved.
