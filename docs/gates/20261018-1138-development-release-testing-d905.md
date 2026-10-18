---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2f4f37c28dc2bdabbfe9a8affaeb375f6ea7b4b7
  - https://github.com/akmaier/agent-m/pull/888
date: 2026-10-18 11:38 UTC
---
# Development → Release testing: ITM-905, the check that the site serves a screen reader

**REGISTER**

## Reason

ITM-905 (MOD-site-frame, tests only), pull request #888 into `sprint/team1/89`, passes on `2f4f37c2`.

1. **The check SPEC.md:944-949 names is built.** `tests/site-accessibility.test.mjs` runs axe-core 4.14.0 (MPL-2.0) with the
   tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa` over each route ITM-904 draws, in the same Electron.
   `ROUTES` and `show` move into `tests/site-usability.d/routes.mjs`, which both checks import. ITM-904's result is
   unchanged: 0 failures and 5 todos.
2. **The checker reaches the test without any change of text, so the stop clause passed.** It is installed at run time
   into a temporary folder (`npm install --no-save --prefix <temp> axe-core@4.14.0`), as the Electron of
   `tests/dashboard-backlog-layout.test.mjs:44` is.
   - Nothing is vendored into the site, so `NO SERVER`'s channels are not touched.
   - No workflow or package file changes.
   - **The pinned fetch at each CI run is accepted.** It is the repository's existing pattern for test-only engines, the
     version is pinned, and it never reaches the site. If the registry is unreachable, the test fails visibly rather than
     passing.
3. **Red-first for an item of tests only is met by its counter-proofs,** as for ITM-904:
   - a planted button with no name and an image with no `alt` are each caught (TST-905064, 905065), and the page without
     them has neither (TST-905063);
   - with `button-name` filtered out of the checker, exactly TST-905064 fails.
4. **Green.** CI on `2f4f37c2` passes all twelve jobs. The accessibility log shows `# tests 621`, `# fail 0` and
   `# todo 31`. `git merge-tree --write-tree` merges the head into `sprint/team1/89` without a conflict (tree `e7fc36b5`).
5. **The readings are accepted:**
   - "each route" as for ITM-904;
   - level AA includes the level A rules;
   - axe's "incomplete" results are not violations, since the check names violations.
6. **The 31 todos are the findings of today. They are registered as fix items, one per module** (ITM-921, ITM-922 and
   ITM-923), with the leads named as leads.
7. **Timing:** about 70 s of its own on CI. The two Electron checks together come near the two-minute limit if they ever
   share a shard (`A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES`). That is a known risk to watch in the sprint pull
   request's mode=all run.

**developer-sonnet-e takes ITM-878 once ITM-898 is merged.**
