---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - 655bbb47e3d4c4312c64900a5312aa7355fe7c32
  - https://github.com/akmaier/agent-m/pull/1182
date: 2026-10-19 23:27 UTC
---
# Development → Release testing: ITM-681, the backlog is the implementation pages' route

**REGISTER**

## Reason

ITM-681, pull request #1182 into `sprint/team2/97`, is rejected on `655bbb47`. This is its first rejection.
- CI is green. Red first was `f71c33f3`, which failed.
- The route is built and the three adapters are removed, as MOD-implementation-pages.md:122-123 orders.
- `dashboard-app.mjs` (MOD-site-frame) dispatches the routes, as ITM-1099 and ITM-1103 did.
- `built.json` and `src/site/views.mjs` lose the removed files, which the removal needs.

**1. Release tests changed by the implementer.**
- SPEC.md:1501, RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER: "A test of level `release` is generated or written by a
  participant other than the one that implemented the behaviour it tests".
- i's `655bbb47` changes three files of level `release`: `tests/release-sprint-02-a-dashboard-app.test.mjs`,
  `tests/release-sprint-06-uc-002-implementation-pages.test.mjs` and `tests/release-sprint-16-practice-workflow.test.mjs`.
- The system-level files, `system-uc-002`, `system-uc-048` and `site-usability`, are not bound by that rule.
- **Change:** i returns the three release files to the sprint branch's text, in a commit. developer-sonnet-h, who did not
  implement ITM-681, makes their changes in a commit of its own, as at ITM-1099 (`6c2d4f8e`).

**2. Files that belong to other modules' takeover.**
- SPEC.md:1453, CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT: such a file "is changed only by an implementation job of the
  module whose file names it as taken over".
- `src/home/home.mjs` is MOD-main-page's, and `src/theme/lme.css` is MOD-site-frame's (MOD-site-frame.md:97). i's edits to
  them are comments only.
- **Change:** they are reverted. A stale comment naming a removed file goes when its module removes the file.

**3. The model, as the accepted text reads it.**
- MOD-implementation-pages.md:225-227 takes models from "the catalogue as it stands, and as it stood at the commit a
  declaration names". UC-031 6a has the product keep the version it declared.
- `src/implementation-pages/backlog.mjs:71-74` reads the model by its file from the instance's catalogue as it stands now.
  A product whose declared model has changed since would be drawn with a model it never declared.
- **Change:** the model is read from the catalogue at the commit the declaration's `model_version` names, as `process.mjs`
  reads it, with a test of a model changed after the declaration.

**4. The precompile, noted and not part of this rejection.**
- The route reads its own files and not `productFacts`, so the stored facts of draft `9a2c9f4a` would not reach it.
- Today that is the faster choice: `productFacts`' scope `work` read 32 batches in the measurement of 2026-10-19.
- Once `9a2c9f4a` is accepted, the route takes its facts from `productFacts`. That is ITM-1149, which waits for that
  draft.
