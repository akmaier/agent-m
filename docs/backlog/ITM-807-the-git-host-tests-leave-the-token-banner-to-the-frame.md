---
id: ITM-807
title: The git-host tests leave the token banner to the frame
level: unit
realises:
  - CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - sprint team1/74's start, under sprint 72's agreement, for ITM-683
---
# ITM-807 The git-host tests leave the token banner to the frame

**REGISTER**

## Outcome

ITM-683 removes `docs/assets/dashboard/settings-view.mjs`, as MOD-settings-pages' Parts say: "the token banner is
MOD-site-frame's `notice`". `tests/review-core.d/git-host.test.mjs:21` imports `expiryWarning` and `tokenBannerHtml` from
it, and asserts them for a GitLab product at `:373-378`.

That test names `MOD-git-host`, which has no module file. MOD-repository-hosts' Parts take it over
(`MOD-repository-hosts.md:78`), so only a job of MOD-repository-hosts may change it, and only by moving it into the
module (sprint 72's agreement). ITM-689 is that job, and it builds on ITM-683. So this part goes first, as an item of its
own:
- the test's header names MOD-repository-hosts, and its item history goes (sprint 67's agreement);
- the two banner assertions and the import go;
- the requirement they guarded, the expiry warning and the renewal page of a GitLab product's token, is kept by
  ITM-683's test of the frame's notice, named in this pull request.

It changes no code of MOD-repository-hosts, and no other test.

## Acceptance

- The test imports nothing from `settings-view.mjs`, its header names MOD-repository-hosts, and every other case keeps
  its expected result.
- It is declared as refactoring: CI is green on every commit.
