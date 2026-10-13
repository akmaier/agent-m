---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c47142ea8f96669ce69a7c0db591f8e2e06028d7
  - https://github.com/akmaier/agent-m/pull/489
date: 2026-10-13 01:10 UTC
---
# Development → Release testing: ITM-360, Edit on a requirement in the specification browser

**REGISTER**

## Reason

ITM-360, pull request #489 by developer-sonnet-b into `sprint/team1/26`, head `c47142e`. The first commit
`3197c8c` adds only `tests/trace-pages-edit-links.test.mjs`, and CI is red on it with its four cases failing (run
38330142983). CI is green on `c47142e` (run 38330334202). The code changes only `src/trace-pages/flow.mjs`, which
the Parts name. The new test names MOD-trace-pages, and its cases carry the declarations `TST-360001` to
`TST-360004`. The existing trace-pages tests pass unchanged. 19 planted faults are recorded, all killed.

The Acceptance holds. On the default branch only, *Edit* stands beside each requirement and *+ Requirement* in each
section, as links to the review pages. The default branch is read from the host's `repositoryInfo`, and a tag or an
unknown ref offers no link. The links lead to the routes ITM-359 built, `requirement` with the parameter `name` and
`requirements` with `section` (`src/review-pages/kinds.mjs`, `edit.mjs`), so they open what the Outcome names.

Noted for the review, beyond this item: the address forms depart from the text.
- MOD-review-pages' accepted file writes its routes as paths: `requirement/<name>/edit`, `requirements/new`,
  `<k>/<id>/edit`, `<k>/<id>/prompt`.
- MOD-site-frame's `Route` takes "the first part of the address's fragment" as the route's name and "the rest" as its
  `params`, a `Record<string, string>`.
- The code since ITM-355 reads the rest as `key=value` parts, giving `#requirement/name=<NAME>`,
  `#spec-entry/id=<id>/edit=1` and `#use-case/id=<id>/prompt=1`, across several items.
- The code follows the frame. The review pages' file names forms that no route of the code has. Making the two texts
  agree is akmaier's.
