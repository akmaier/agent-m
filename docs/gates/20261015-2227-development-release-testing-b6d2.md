---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 7baa8eab11492195e24c41d0b6eb861c06312acf
  - https://github.com/akmaier/agent-m/pull/521
date: 2026-10-15 22:27 UTC
---
# Development → Release testing: ITM-515, In dark mode the menu's step badges are readable, and a section's buttons stand apart from its table

**REGISTER**

## Reason

ITM-515, for issue #519, pull request #521 by developer-sonnet-b into `sprint/team1/28`, head `7baa8eab`.

1. The tests-only commit `3f124e04` was red (run 38811470987).
2. CI is green on the head (run 38816980677, ten of ten jobs).
3. Changed are these files; `src/theme/lme.css` and `docs/assets/style.css` are unchanged:
   - `src/site-frame/look.css`, of MOD-site-frame;
   - `src/trace-pages/flow.mjs`, of MOD-trace-pages;
   - the new `tests/site-frame-menu-badges.test.mjs`;
   - TST-515003, added to `tests/trace-pages-edit-links.test.mjs`, a test of MOD-trace-pages.
4. TST-515001 to TST-515003 name their module and the requirement they guard; counter-proofs are recorded in #521.
5. The Acceptance holds:
   - I checked the cascade that the new test assumes. `startPage` appends `look.css` to the head through
     `sharedHeader`, after the static links of `docs/index.html` to `lme.css` and `style.css`. Its badge rules have the
     same specificity as those of `lme.css`, so they win. The more specific `.menu > a.active::before` of `lme.css`
     keeps the active badge as it was.
   - The contrasts: in dark mode 11.5:1 for the digit and 7.9:1 for the pill. Light mode is unchanged: 13.3:1 and
     4.39:1.
   - *+ Requirement* carries a bottom margin.

The new test's contrast bound was lowered from 4.5:1 to 4:1 in the code commit. It is the item's own new test, so no
existing expected result changed, and its red commit stands. The Acceptance asks for a contrasting colour and keeps light
mode unchanged, and the unchanged light pill is 4.39:1. The dark values would meet 4.5:1 as well.
