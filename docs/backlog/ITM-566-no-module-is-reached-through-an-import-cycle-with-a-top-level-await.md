---
id: ITM-566
title: No module is reached through an import cycle with a top-level await
level: component
realises:
  - MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE
modules:
  - MOD-model-catalogue
builds_on:
  - ITM-536
tests:
  - component
origin:
  - ITM-536's gate (#617): on Node 26, the review pages reach MOD-model-catalogue's module, which has a top-level await, through an import cycle, and a test fails with "Cannot access 'view' before initialization"; the known Node 26 failure of release-sprint-16 ("Cannot access 'routes' before initialization") is of the same kind
---
# ITM-566 No module is reached through an import cycle with a top-level await

**REGISTER**

## Outcome

On Node 26, a module evaluated inside an import cycle that holds a top-level `await` can be read before it is
initialised. Since ITM-536, `src/progress-measures/facts.mjs` imports `src/model-catalogue/index.mjs`, which awaits at
its top level. That module is reached on a path from the review pages through the site frame and the notifications. CI
runs Node 22 and passes.

**Not ready for a sprint yet.** Its readings are settled before it is selected:
- **Which cycle it is.** It is traced as the file paths of the cycle. `MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE` binds
  the modules' declared uses, and the trace shows whether the cycle lies in declared uses or only in files.
- **Which measure the texts allow.** Either MOD-model-catalogue reads its data without a top-level `await` (for example,
  synchronously in Node and on demand in a browser), or the cycle is broken where the trace shows it. `tests/test_no_backend`
  forbids `import()` in the module that would need it, so a lazy import is no measure.
- **The Node version.** Whether SPEC.md or the workflow names the Node versions the tests run on.

## Acceptance

- On Node 26 and Node 22, `tests/system-uc-019-change-by-prompt.test.mjs` and `tests/release-sprint-16-practice-workflow.test.mjs`
  pass, if the latter fails for the same cause.
- No expected result changes.
