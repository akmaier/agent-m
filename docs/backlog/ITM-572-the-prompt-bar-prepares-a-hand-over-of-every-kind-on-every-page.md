---
id: ITM-572
title: The prompt bar prepares a hand-over of every kind on every page
level: module
realises:
  - UC-049
modules:
  - MOD-site-frame
  - MOD-prompt-bar
builds_on:
  - ITM-505
  - ITM-568
tests:
  - unit
origin:
  - ITM-568's settling at sprint team1/52: a hand-over is prepared in the tab, with the kind's recipes and preconditions, and the tab holds only the strategies of the page's views
---
# ITM-572 The prompt bar prepares a hand-over of every kind on every page

**REGISTER**

## Outcome

The prompt bar prepares a hand-over in the tab (`prepareJob` in `src/prompt-bar/hand-over.mjs`) before `handOverJob`
queues it. The tab holds only the strategies that the page's views hand `start.mjs`, as ARC-038 has it ("The entry
pages register the strategies of the modules the views include"). So a hand-over of `implement` from a page whose views
do not include its recipes and preconditions is refused with `UnknownStrategy` at the click, even once ITM-568 builds
`implementation-inputs`. Its recipes are `implementation-inputs`, `chapters-for-implementation` and `instruction?`, and
its precondition is `rests-on-accepted`.

Two facts bind the design:
- MOD-job-runner refuses a strategy registered twice (`DuplicateStrategy`, `src/job-runner/registry.mjs:18`).
- MOD-implementation-pages' view is to hand `runStrategies` too.

**Not ready for a sprint yet.** It waits for akmaier's acceptance of the draft committed on `main` with sprint
team1/53. The draft changes ARC-038, MOD-site-frame and MOD-prompt-bar, and each decision names the principle it rests on:
- **One responsibility.** The frame registers every strategy set in the tab, in `start.mjs`, as ARC-038 has the entry
  pages do. A view or the bar only names the sets its kinds need.
- **No special first case.** The bar names its sets the way a view does: MOD-prompt-bar's new `handOverStrategies`. These
  are the sets the job workflow registers in CI, since a handed-over job runs on CI or on a Bridge.
- **Nothing twice.** Each set is registered once per tab, however many views or the bar hand it. The accepted texts
  already have several views on the review page hand the same set (`approvalStrategies` from MOD-review-pages,
  MOD-implementation-pages and MOD-test-pages). Registered once per view, that throws `DuplicateStrategy`
  (`src/job-runner/registry.mjs:18`).
- **Adding one of a kind changes nothing of another kind.** A new view, or a new set a view hands, changes neither the
  frame nor the bar.

The lists of CI (MOD-workflow-entries) and of the Bridge (MOD-desktop-shell) name the same thirteen sets that
`handOverStrategies` names. Making them one list is not part of this draft.

## Acceptance

- On the main page and on the review pages, a hand-over of each kind the bar may hand over is prepared without
  `UnknownStrategy`.
- No strategy set is registered twice.
