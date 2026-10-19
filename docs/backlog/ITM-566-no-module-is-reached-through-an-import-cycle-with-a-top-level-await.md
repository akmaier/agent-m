---
id: ITM-566
title: The release test of sprint 16 imports its page module once, so it passes on Node 26
level: release
realises:
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
modules:
  - MOD-product-process
builds_on:
  - ITM-536
tests:
  - release
origin:
  - ITM-536's gate (#617): on Node 26, the review pages reach MOD-model-catalogue's module, which has a top-level await, through an import cycle, and a test fails with "Cannot access 'view' before initialization"; the known Node 26 failure of release-sprint-16 ("Cannot access 'routes' before initialization") is of the same kind
---
# ITM-566 The release test of sprint 16 imports its page module once, so it passes on Node 26

**REGISTER**

## Outcome

**Measured by developer-sonnet-d (sprint team1/92).** The item named the wrong cause.
- Declared uses hold no cycle: `graphFindings` over the architecture gives no finding, while a planted cycle is found.
- MOD-model-catalogue's top-level `await` lies in no traced cycle.
- What fails on Node 26 is only `tests/release-sprint-16-practice-workflow.test.mjs`, at "Cannot access 'routes' before
  initialization". It imports `tests/dashboard-process-view.test.mjs` statically (`:20`) and
  `docs/assets/dashboard/process-view.mjs` statically (`:22`), while that test file imports the same module dynamically.
- A minimal case with no cycle and no MOD-model-catalogue fails the same way: a static and a dynamic import of one module
  under a top-level `await`.
- SPEC.md names no Node version, and the workflows run Node 22.

## Acceptance

- `tests/release-sprint-16-practice-workflow.test.mjs:22` imports `process-view.mjs` dynamically, as the test file it
  imports does, and the file passes on Node 22 and on Node 26.
- It is changed by a participant who built none of sprint 16's increment and none of this item's earlier work.
- The test names MOD-product-process first in its header. It changes no file of any module (92.md, "What changes a
  module covers").
