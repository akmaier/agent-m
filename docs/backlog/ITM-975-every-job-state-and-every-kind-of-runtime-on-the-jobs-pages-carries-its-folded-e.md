---
id: ITM-975
title: Every job state and every kind of runtime on the jobs pages carries its folded explanation
level: module
realises:
  - UC-036
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-main-page
builds_on:
  - ITM-509
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-036-10, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-975 Every job state and every kind of runtime on the jobs pages carries its folded explanation

**REGISTER**

## Outcome

UC-036:109: "Every state, and every kind of runtime, carries a folded **What is this?**." MOD-main-page.md:115 uses
"MOD-site-frame.explain — the folded explanations of the page, its states and runtimes". `src/main-page/jobs.mjs` calls no
`explain` (grep finds none in `src/main-page/`; the same grep finds it in `src/settings-pages/bridge.mjs`). The topics'
text lives in MOD-site-frame's `explanations.md`; a missing topic shows nothing and is reported by the frame's own check
(ITM-646).

## Acceptance

- The route `jobs` draws the folded explanation of each of the seven states and of the tab, CI and Bridge runtimes,
  once each, with a counter-proof that a state without one fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/main-page/` and the tests that name MOD-main-page change, plus the topics in `explanations.md` if MOD-site-frame's
  text lets this module add them; otherwise the item stops and names the topics for a MOD-site-frame item.
