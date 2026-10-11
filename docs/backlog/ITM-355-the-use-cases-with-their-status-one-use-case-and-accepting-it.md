---
id: ITM-355
title: The use cases with their status, one use case, and accepting it
level: module
realises:
  - UC-008
  - STATUS IS DERIVED FROM THE RECORDS
  - AN APPROVAL NAMES THE EXACT TEXT
  - ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON
  - ONE CLICK PER DECISION
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
  - NO TEXT TRAVELS IN A URL
  - A GITLAB PRODUCT IS WRITTEN WITH A TOKEN
  - SEVERAL FILES ARE ACCEPTED IN ONE CLICK
  - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
  - THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-review-pages
builds_on:
  - ITM-333
  - ITM-334
  - ITM-342
  - ITM-347
tests:
  - unit
origin:
  - UC-008 steps 1 to 5, 1a, 2a, 3b, 3c, 3d, 4a, 5a
---
# ITM-355 The use cases with their status, one use case, and accepting it

**REGISTER**

## Outcome

MOD-review-pages, as its file states it, begun in `src/review-pages/`: `index.mjs`'s `view`, whose strategies stay empty
until a drafting kind needs them; `flow.mjs`'s list and file with ticks and *Accept ticked*; and `kinds.mjs` with the
use-case descriptor. Its two routes:

- `use-case` lists every use case with its status and a tick.
- `use-case/<id>` shows one use case: rendered with its diagram (ITM-342); when changed since acceptance, its
  difference to the last accepted text above it (ITM-334); *Accept*, naming the blob of the text shown (ITM-333);
  without a token on GitHub, the prefilled page, and the record with its path to copy; on GitLab without a token, no
  *Accept* and the token's step linked; without write access, the GitHub path; a private repository without a token
  that reaches it named, and nothing shown.

`viewUseCases`, `viewUseCase`, `acceptPanel`, `batchBar` and `wireAccept` in `docs/assets/dashboard/review-views.mjs`
are the model and stay. The descriptors of decisions, modules, SPEC entries and reports, *Review all*, editing, prompts,
drafting and arranging are not part of this item. Reaching these routes from the dashboard is a change between jobs.

## Acceptance

- Unit tests that name MOD-review-pages state, before the code exists, in the small DOM of
  `tests/site-frame.test.mjs`, on a fixture repository behind a Host of the tests' own: a list with an open, an
  accepted and a changed use case; a use case with its diagram and *Accept*; after *Accept*, one record naming the
  blob shown, and the use case accepted; two ticked use cases accepted in one commit, one changed after it was shown
  left out and named; a changed use case shown with its difference; without a token, a link that holds no text; GitLab
  without a token: no *Accept*; `PermissionMissing`: the GitHub path offered; nothing written without the person's
  click.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
