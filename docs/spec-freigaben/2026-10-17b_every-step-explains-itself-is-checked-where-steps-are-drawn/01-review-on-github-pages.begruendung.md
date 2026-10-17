# 10. Review on GitHub Pages: every step explains itself is checked where steps are drawn

**The change.** In `EVERY STEP EXPLAINS ITSELF`, the *Check* names the tests of the modules that draw the steps:
- `tests/site-frame.test.mjs`, for the folded explanation `explain` gives and a missing topic;
- `tests/settings-pages-add-product.test.mjs` and `tests/settings-pages-setup.test.mjs`, for every step of the add-product
  page and of *Finish setting up*.

These replace `tests/test_step_explanations.py`. The requirement's text is unchanged.

**Why.** `tests/test_step_explanations.py` checks the live dashboard's own code (`docs/assets/dashboard-app.mjs`), whose
helper `stepHtml` drew the steps.
- Its known positive is "the views render their steps through stepHtml — the setup view's steps". The last view that
  called `stepHtml`, `docs/assets/dashboard/setup-view.mjs`, is removed by the pull request between jobs that makes the
  live `#setup` call MOD-settings-pages' route.
- After that pull request, the file's check that no view writes a step by hand has no positive left to prove it reads
  anything (AGENTS.md §6a.2), and no live view draws a step.
- The steps are drawn by the modules: MOD-settings-pages with MOD-site-frame's `explain`. Their tests already state each
  step's explanation (for example TST-588002).

**Against the rest of the SPEC.** It changes no requirement, only the tests that check one. Each named test states the
explanations it expects in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`).

**Impact list.**
- `tests/test_step_explanations.py` and `stepHtml` (`docs/assets/dashboard-app.mjs:82`) stay until this entry is
  accepted. The item that moves the live dashboard's code into the architecture (queue `2026-10-17d`) then removes
  both, together with the tests of what it removes:
  - `test_a_step_without_explanation_is_refused`;
  - the test of `stepHtml` in `tests/review-core.d/dashboard-app.test.mjs:233-237`.
