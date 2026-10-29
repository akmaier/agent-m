---
id: ITM-1306
title: The tests that stage Electron do not flip on a registry fault
level: module
realises:
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
modules:
  - MOD-site-frame
  - MOD-desktop-shell
  - MOD-markdown-render
builds_on: []
tests:
  - component
  - system
  - release
origin:
  - po-opus-c's gate of ITM-1275 (PR #1420), docs/gates/20261029-0834-development-release-testing-39fa.md, point 1
---
# ITM-1306 The tests that stage Electron do not flip on a registry fault

**REGISTER**

## Outcome

Run 40841875847 (attempt 1) on commit `eaabd0bf` failed seven jobs: component shards 1 to 3, system shards 1 and 2, and
release shards 1 and 2. The rerun of the same commit (attempt 2) passed them, so their tests flip on one commit. Every
failing case is in one of seven files:
- `site-usability`, `site-accessibility` and `release-itm-1174-917-rendered` (MOD-site-frame);
- `desktop-shell`, `desktop-shell-bridge-jobs` and `release-itm-276-desktop-shell` (MOD-desktop-shell);
- `markdown-render-918-diagram-drawn` (MOD-markdown-render).

Each fails at "Electron package acquisition". The tests install `electron@44.5.1` from the npm registry while they run,
and the registry answered 404 for
`https://registry.npmjs.org/@electron-internal/extract-zip/-/extract-zip-1.0.8.tgz`. Minutes later, it answered 200 for
the same address.

The installs stand in four places:
- `tests/site-usability.d/browser.mjs:74`;
- `tests/desktop-shell.test.mjs:119`;
- `tests/desktop-shell.d/electron.mjs:54`;
- `tests/release-itm-276-desktop-shell.test.mjs:123`.

So these tests' outcome on a commit depends on the registry at the moment they run.

The first task names, from these places and from how the pull-request jobs prepare the tests, where Electron could be
acquired so that a registry fault during the run cannot change a test's outcome. The change follows from the cause
named. No retry of the install is added. The task stops and names the missing sentence where the change needs one that
the module files do not hold, such as a step of the generated CI configuration (THE CI CONFIGURATION IS GENERATED FROM
THE SCHEDULE).

## Where the fix lies

Agent M's schedule already installs what the tests need before they run:
- its `setup` (`tests/test-schedule-setup.sh`, MOD-test-schedule) installs xvfb and openbox, "so that the tests that start
  Electron find openbox installed and install nothing (their own install stays the local fallback)";
- its `cache` keeps what the setup fetched, in the generated workflow's `actions/cache` steps
  (`.github/workflows/agent-m-tests.yml:37-46`).

Electron is not among what the setup installs. So the first place to look is the schedule's `setup` and `cache`, which
belong to MOD-test-schedule, a module this item does not name yet. Before the item is selected, it names MOD-test-schedule
and the files it would change, and its Acceptance names the tests of other modules that change.

## Acceptance

- The pull request names where Electron is acquired after the change, with the data-flow path from there to each of
  the four places.
- No expected result of the seven files changes.
- With the npm registry unreachable while the tests run, and Electron acquired as the change says, none of the seven
  files fails at "package acquisition". The counter-proof is the same run before the change, which fails there.
- Only the test helpers and test files named above change, and the files of the item's modules where the cause lies.
