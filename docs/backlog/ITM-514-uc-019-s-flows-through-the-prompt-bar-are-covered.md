---
id: ITM-514
title: UC-019's flows through the prompt bar are covered
level: system
realises:
  - UC-019
modules:
  - MOD-review-pages
  - MOD-trace-pages
builds_on:
  - ITM-480
  - ITM-498
  - ITM-507
  - ITM-508
tests:
  - system
  - release
origin:
  - the pending findings ITM-480 leaves in UC-019's system and release tests
  - sprint team1/47: the order of ITM-507, ITM-508, ITM-514 and ITM-551 settled together
---
# ITM-514 UC-019's flows through the prompt bar are covered

**REGISTER**

## Outcome

Each pending finding ITM-480 left in UC-019's system and release tests is replaced by executable evidence through the
prompt bar and the review pages' route `draft`. Where the code does something else, it stays a finding that names what
the code does instead.

UC-019's tests also stop depending on the old prompt routes and the links *Change by prompt*, so that ITM-551 can remove
them. Four test files change:
- `tests/system-uc-019-change-by-prompt.test.mjs`: its evidence points at the tests of ITM-507 and ITM-508, where it now
  points at `tests/review-pages-prompt-use-case.test.mjs`.
- `tests/system-uc-019-change-requirements-by-prompt.test.mjs`: it goes through the prompt bar and `draft`, where it now
  goes through `#requirement/…/prompt=1` and *Change by prompt*.
- `tests/release-uc-019-change-by-prompt.test.mjs`, a release test: its evidence is repointed as above.
- `tests/release-uc-019-change-requirements-by-prompt.test.mjs`, a release test: its flow goes through the prompt bar and
  `draft`, where it now follows the public prompt route. Its planted faults go into the files of the route `draft`, where
  they now go into `src/review-pages/requirements-prompt.mjs`.

## Order

This item starts once ITM-507 and ITM-508 are merged, and ITM-551 starts once this item is merged. The tests then pass at
each step: the old routes still exist while this item is written, and nothing tests them by the time they are removed.

## Developer

developer-sonnet-e implements none of ITM-507, ITM-508 or ITM-551 (`RELEASE TESTS ARE NOT WRITTEN BY THE
IMPLEMENTER`).

## Acceptance

- **The tests pass on `main`**, except for findings the pull request names. Each new piece of evidence has a
  counter-proof.
- **No old route is used.** None of the four files names `/prompt`, `requirements-prompt.mjs` or *Change by prompt*.
- **Only test files change.** The two release tests record their local run before and after.
