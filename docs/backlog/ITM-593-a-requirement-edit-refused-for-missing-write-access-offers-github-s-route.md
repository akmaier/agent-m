---
id: ITM-593
title: A requirement edit refused for missing write access offers GitHub's route
level: module
realises:
  - UC-018
modules:
  - MOD-spec-changes
builds_on:
  - ITM-611
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-593 A requirement edit refused for missing write access offers GitHub's route

**REGISTER**

## Outcome

UC-018 6b for a requirement: "the dashboard offers the GitHub route". `src/review-pages/edit.mjs:108-110` shows only the error's name and message. The use-case path offers the route (`file-edit.mjs:106`).

**The design, a draft for akmaier on `main`**, with ITM-611's (MOD-spec-changes, Interfaces, `proposeSection`).
- When GitHub refuses the commit for a missing write permission, `proposeSection` and `saveEntry` write nothing and
  return GitHub's pages, as without a token. On GitLab, `PermissionMissing` is thrown as now, since GitLab has no
  fallback.
- *Nothing twice:* the review pages already show a `fallback` (`edit.mjs`, through `fallbackPages` since ITM-592). So
  MOD-review-pages needs no change, and the route reaches the person through the path that exists.
- **Existing tests.** No test asserts that `proposeSection` throws `PermissionMissing`. A grep of the spec-changes tests
  for `PermissionMissing` finds none, while the same grep over `tests/approvals-accept.test.mjs` finds its known
  positive.
- **Ready to be selected** after ITM-611, once akmaier accepts the draft.

## Acceptance

- `PermissionMissing` on a requirement edit offers the GitHub route, as it does for a use case.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
