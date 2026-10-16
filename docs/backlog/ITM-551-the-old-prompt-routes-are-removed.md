---
id: ITM-551
title: The old prompt routes and Change by prompt are removed
level: module
realises:
  - UC-019
  - UC-049
modules:
  - MOD-review-pages
  - MOD-trace-pages
builds_on:
  - ITM-507
  - ITM-508
  - ITM-514
tests:
  - unit
origin:
  - MOD-review-pages and MOD-trace-pages as accepted with the prompt bar (7e893c63): the prompt routes and the buttons *Change by prompt* are gone
  - sprint team1/47: split from ITM-507 and ITM-508, so that it follows ITM-514
---
# ITM-551 The old prompt routes and Change by prompt are removed

**REGISTER**

## Outcome

The review pages lose the routes `<k>/<id>/prompt`, `requirement/<name>/prompt` and `requirements/prompt`, their files
`src/review-pages/prompt.mjs` and `src/review-pages/requirements-prompt.mjs`, and every link *Change by prompt*. The
specification browser loses its buttons *Change by prompt*. A change is asked for in the prompt bar and shown on `draft`.

**Existing tests whose expected result changes.** These are the tests of what this item removes:
- `tests/review-pages-prompt-requirements.test.mjs` and `tests/review-pages-prompt-use-case.test.mjs` (MOD-review-pages)
  are removed, together with what they test.
- In `tests/trace-pages-edit-links.test.mjs` (MOD-trace-pages), the cases that expect *Change by prompt* now expect no
  such button.

The prompt routes are the parameter `prompt` of the review pages' routes (`src/review-pages/flow.mjs:125` and `:133`),
as `#requirement/name=…/prompt=1` shows. The links are at `flow.mjs:343`, and the trace pages' buttons at
`src/trace-pages/flow.mjs:29` and `:78`. TST-472605's list of route names does not change.

UC-019's system and release tests no longer use the old routes, since ITM-514 moved them.

## Acceptance

- **Nothing old remains.** No route, file, link or button above is left. `git grep` for "Change by prompt" and `/prompt`
  in `src/` finds nothing, with a known positive shown before the removal.
- **Tests first.** The first commit holds only the changed tests, and CI is red on it. No stub is committed.
- **Expected values in the tests.** Each test states its expected values in its own text.
