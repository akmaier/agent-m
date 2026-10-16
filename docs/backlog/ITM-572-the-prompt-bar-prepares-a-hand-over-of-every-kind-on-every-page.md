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

**The design was accepted by akmaier** in `3aff8ad9` (ARC-038, MOD-prompt-bar, MOD-site-frame), and each decision names
the principle it rests on:
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
`handOverStrategies` names. Making them one list is not part of this item.

**The readings, settled at sprint team1/54:**
- **Which sets `handOverStrategies` holds.** Of the thirteen its file names, the sets that are built and exported today:
  - `approvalStrategies`, `specStrategies`, `editStrategies`;
  - `sourceStrategies`, `reuseStrategies`, `resourceStrategies`;
  - `runStrategies`.

  The others (`workStrategies`, `processStrategies`, `scheduleStrategies`, `resultStrategies`, `issueStrategies`,
  `routeStrategies`) join as the items that build them add them. `git grep -E "export const [a-zA-Z]+Strategies" -- src`
  lists the seven.
- **Registering each set once.**
  - `start.mjs` registers the views' sets and then `handOverStrategies`, the bar's under the owner `MOD-prompt-bar`, and
    skips a set object it has already registered on that load.
  - In a tab, `start.mjs` runs once. TST-531013 evaluates it a second time in the same process and expects the load not
    to reject. So a `DuplicateStrategy` whose first owner is the owner now registering (`error.owners[0]`) is a set
    already registered and is skipped. Any other `DuplicateStrategy` still throws.
- **Which hand-overs prepare.**
  - Every kind whose preconditions, recipes, checks, steps and writer are all among the handed sets and the runner's
    built-ins prepares without `UnknownStrategy`. Among them are the change kinds.
  - `implement` still meets `UnknownStrategy` for its writer `branch-and-pull-request` until ITM-567 builds
    `routeStrategies` and ITM-605 hands it. `prepareJob` names the writer among the strategies it checks
    (`src/job-runner/prepare.mjs:25-31`).
- **Existing tests.** The tests were grepped for `site-frame/start.mjs` and `DuplicateStrategy`.
  - TST-531012's fixture views share no set with the bar, so its owners hold.
  - TST-531013 holds by the second reading above.
  - `tests/system-uc-019-change-requirements-by-prompt.test.mjs:154` composes the views' sets itself and imports no
    `start.mjs`, so it holds.

## Acceptance

- On the main page and on the review pages, a hand-over of each kind whose strategies are all handed is prepared
  without `UnknownStrategy`.
- No strategy set is registered twice.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
