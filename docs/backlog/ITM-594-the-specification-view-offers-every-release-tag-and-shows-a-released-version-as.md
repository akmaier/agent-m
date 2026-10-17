---
id: ITM-594
title: The specification view offers every release tag and shows a released version as of its tag
level: module
realises:
  - UC-020
  - THE BROWSER SHOWS ANY RELEASED VERSION
modules:
  - MOD-trace-pages
builds_on:
tests:
  - unit
  - component
  - system
  - release
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-594 The specification view offers every release tag and shows a released version as of its tag

**REGISTER**

## Outcome

UC-020 steps 1, 1a and 1c. `src/trace-pages/flow.mjs:126-135` takes the ref from its caller. MOD-trace-pages' descriptor names "branch and tags".

**The readings, settled on 2026-10-17 during sprint team1/63. Selectable.**
- **Reached on the live page.** `docs/assets/dashboard/spec-changes-view.mjs:17-24` renders this route under `#spec`. It
  passes `{ key: "specification", ref: app.T.ref }`, where `T.ref` is the page's `?ref=` or `main`
  (`docs/assets/dashboard-app.mjs:193-194`).
- **The choice is the route's own.**
  - Above the tree, the route offers the ref its caller hands and every tag `host.listTags()` gives. The tags are
    newest first, by their `vYYYY.MINOR.PATCH` numbers (UC-020 1a).
  - Choosing one draws the route again at that ref, through `readSnapshot`.
  - The ref the caller hands is *current* when `onDefaultBranch` (`flow.mjs:104`) finds it the default branch.
- **A tag is read-only.** `shown.onDefaultBranch` is false there, so *Edit* and *+ Requirement* are already hidden. The
  view says *as of <tag>*. No proposals are shown yet, so none needs hiding; ITM-597 hides them at a tag.
- **Without tags,** only *current* is offered (1c).
- **Uses** (sprint 57): `MOD-repository-hosts.listTags` and `readSnapshot`, both in MOD-trace-pages' Uses.
  - `listTags` is built with real calls in `github.mjs:176-185` and `gitlab.mjs:138-147`.
  - `readSnapshot` takes a tag on both hosts (`github.mjs:162-169`, `gitlab.mjs:123-131`).
  - The `repositoryInfo` call already in `flow.mjs:106` is old code, not this item's.
- **No rule of another module is copied.** Nothing else in `src` chooses a version. The release form of
  `src/test-pages/release.mjs:161` lists tags to name a new one, which is another rule.
- **The grep of what goes** (sprint 58):
  - The header `flow.mjs:1-2` says "It does not choose versions … the caller hands it the pinned ref". It is the only
    hit, in `src`, `tests` and `docs/architecture`, of `git grep "choose versions\|pinned ref"`.
  - The fakes have no `listTags`, so each gains `listTags` answering `[]` in the tests-only commit:
    - `tests/trace-pages-specification.test.mjs:127`
    - `tests/trace-pages-edit-links.test.mjs:52`
    - the fakes of `tests/trace-pages-subject.test.mjs` and `tests/trace-pages-subject-draft.test.mjs`
    - `tests/system-uc-018-edit-dashboard.test.mjs:164`
    - the hosts of `tests/uc-019-prompt-bar-harness.mjs`

    The grep's known positive is `tests/dashboard-pending-release-report.test.mjs`, which has `listTags`. A fake given
    `listTags` changes no expected result.
  - Any test whose expected result does change, because the choice is drawn, is named before the tests-only commit.
    Among the candidates are the release tests TST-472516 and TST-472518, which run through the live `#spec`.
- **Every behaviour it alters has a test** (sprint 62). These are the choice, a tag's read-only view, and *current*
  without tags.
- **Measurement:** no effect is claimed. It adds one `listTags` read per draw.
- **Reachable through the real host:** the live `#spec`, on a product whose repository has release tags.

## Acceptance

- The view offers the default branch and every release tag, newest first.
- A tag is shown read-only, *as of* it, with open proposals hidden.
- A product without tags is offered only *current*.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
