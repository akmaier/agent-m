---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f249c84b1a6e582397c2736e8123830f59b5d668
  - https://github.com/akmaier/agent-m/pull/670
date: 2026-10-17 01:47 UTC
---
# Development → Release testing: between jobs, the live #setup calls MOD-settings-pages' route

**REGISTER**

## Reason

Pull request #670 into `main`, at head `f249c84b`. developer-sonnet-e wrote it. It is a pull request between jobs
under `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` (SPEC.md:1421), after ITM-588, with no job of its own. The decision
checks it against the list in `docs/backlog/sprints/team1/58.md`.

**The files, against the list, one by one.** The pull request changes thirteen files. Each is on the list, and nothing on
the list is missing.

| File | What changes | Form |
|---|---|---|
| `docs/assets/dashboard-app.mjs` | the dispatch renders the route `setup`, with its `go` to `#settings`, `#add` and `#uc` | old code calls a module in place of its own |
| `docs/assets/dashboard/setup-view.mjs` | removed | removes what a module now provides |
| `docs/assets/dashboard/built.json`, `src/site/views.mjs` | `setup` is built-in | follows the dispatch |
| `docs/assets/style.css` | `#key-token` and `#key-expires` go | what it removes |
| `tests/dashboard-review-flows.test.mjs` | TST-474030, 474031 and 474032 go, and TST-474029 stays | the tests of what it removes |
| `tests/release-sprint-01-dashboard-app.test.mjs` | the three release tests of the live view go | the same, after ITM-627's stand-ins |
| `tests/review-core.d/dashboard-app.test.mjs` | the test of `createKeyStep` and its import go, and the test of `stepHtml` stays | the same |
| `tests/settings-pages-acknowledgement.test.mjs` | TST-290128 loses its half on the live setup | the same |
| `tests/test_settings_page.py` | `storeKeyStep` leaves the loop, and the count goes from two to one | the same |
| `tests/test_step_explanations.py` | the known positive of the removed view goes, and the negative check stays | the same |
| `tests/dashboard-shell.test.mjs` | `setup-view.mjs` leaves the list | the same |
| `tests/release-sprint-02-a-dashboard-app.test.mjs` | ITM-129's built-in views are `add` and `setup`, each with its dispatch check | the same, as `58.md` reads it |

The diff's removed test names are exactly the seven on the list: TST-474030, 474031, 474032, the three release tests and
the test of `createKeyStep`. Each assertion they made has its holder in the module's tests, as `58.md` maps them.

**Evidence.**
- **CI:** run 38992099838 passed ten of ten jobs on every level. Its log shows the new UC-014 release tests and both ITM-129
  tests `ok`, and `# fail 0` in all eight node logs the Scrum Master saved. GitHub reports the pull request mergeable.
- **Local runs on `main` and on the branch:**
  - the node suite has the same 29 environment failures on both sides, and the names differ by exactly the removed
    tests;
  - the Python suite fails only the known two cases of `test_bridge_mail`;
  - ITM-018 passes, and the fetch spy logged nothing.

**Merge** `f249c84b1a6e582397c2736e8123830f59b5d668` into `main`.

After it, the SPEC queue `2026-10-17b` waits for akmaier. Once it is accepted, a later pull request between jobs removes
`stepHtml` and `tests/test_step_explanations.py`.
