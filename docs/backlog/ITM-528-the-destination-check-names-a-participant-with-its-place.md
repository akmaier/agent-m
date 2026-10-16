---
id: ITM-528
title: The destination check names a participant with its place, and no test guards the withdrawn name
level: system
realises:
  - THE PAGE NAMES WHERE IT SENDS
modules:
  - MOD-site-frame
  - MOD-review-pages
  - MOD-job-runner
  - MOD-settings-pages
builds_on:
tests:
  - system
origin:
  - ITM-519, as cut in Sprint 39's start decision
  - sprint team1/46: the readings settled, and the check's file drafted for akmaier (docs/spec-freigaben/2026-10-16_the-destination-check-names-the-tests-that-check-it/)
---
# ITM-528 The destination check names a participant with its place, and no test guards the withdrawn name

**REGISTER**

## Outcome

Before a run, the review pages name each destination with its processing place. This is MOD-site-frame's `runPanel`
(`src/site-frame/run-panel.mjs`), whose `destinationOf` shows "processes data at: <place>", or that none is declared.
The review pages call it before a job starts (`src/review-pages/jobs.mjs:178` and `:219`). Its test,
`tests/site-frame-run-panel.test.mjs`, already states each destination's participant, role, model and place (TST-472846).

This item does two things, in tests only:
- **The counter-proof.** A planted fault in `runPanel` that shows a participant without its place makes TST-472846 fail.
  The fault is planted, run and restored, and the pull request records it.
- **The withdrawn name.** Every test header of the four modules that still guards `THE PAGE STATES WHAT IT SENDS WHERE`
  names `THE PAGE NAMES WHERE IT SENDS` in its place, and nothing else in the header changes. The files, found with
  `git grep -l` (known positive: `tests/site-frame-run-panel.test.mjs`):
  - MOD-site-frame: `tests/site-frame-run-panel.test.mjs`, `tests/site-frame-derivation-explanations.test.mjs`,
    `tests/site-frame-drafting-explanations.test.mjs`, `tests/site-frame-endpoint-explanations.test.mjs`,
    `tests/site-frame-participant-explanations.test.mjs`;
  - MOD-review-pages: `tests/review-pages-draft-architecture.test.mjs`, `tests/review-pages-draft-requirements.test.mjs`,
    `tests/review-pages-draft-use-cases.test.mjs`, `tests/review-pages-prompt-requirements.test.mjs`,
    `tests/review-pages-prompt-use-case.test.mjs`, and the release test
    `tests/release-uc-019-change-requirements-by-prompt.test.mjs`, whose header names MOD-review-pages among its modules;
  - MOD-job-runner: `tests/job-runner-left-out.test.mjs`, `tests/job-runner-prepare.test.mjs`,
    `tests/job-runner-run.test.mjs`;
  - MOD-settings-pages: `tests/mod-settings-pages-bridge-endpoint.test.mjs`, `tests/settings-pages-add-product.test.mjs`,
    `tests/settings-pages-endpoints.test.mjs`, and the release test
    `tests/release-sprint-09-uc-001-add-product.test.mjs`.

Left out:
- **`tests/test_destination_disclosure.py`.** The check SPEC.md names for the requirement. Its header names
  `MOD-git-host`, which the accepted architecture does not have, and it tests `docs/assets/git-host.mjs`, which no module
  owns. Under `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`, no implementation job may change it, and none of the kinds
  that rule allows between jobs writes a new check into it. A draft for akmaier names the module tests above as the
  requirement's check: `docs/spec-freigaben/2026-10-16_the-destination-check-names-the-tests-that-check-it/`.
- **The fixture under `tests/fixtures/sprint-02-running/`.** It is data, not a test header.
- **The conversation's part.** "before a message of a conversation is sent" is MOD-prompt-bar's
  (`tests/prompt-bar.test.mjs`), whose headers already name `THE PAGE NAMES WHERE IT SENDS`.

No existing test's expected result changes. No assertion changes, only header comments.

## Acceptance

- `git grep "THE PAGE STATES WHAT IT SENDS WHERE" -- tests` finds only `tests/test_destination_disclosure.py` and the
  fixture.
- The planted fault (a destination without its place) fails TST-472846, and that run is recorded.
- Only the listed test files change. No red commit is required, since the item adds no behaviour. The two release tests
  record their local run before and after.
- It is written by a Developer who implemented none of the run panel's behaviour.
