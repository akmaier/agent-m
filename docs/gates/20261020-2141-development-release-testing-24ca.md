---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - c619bbad2d93be867a3f3773e6acc2c99a666fc0
  - https://github.com/akmaier/agent-m/pull/1244
date: 2026-10-20 21:41 UTC
---
# Development → Release testing: ITM-655, the main page's greeting offers Get your own Agent M

**REGISTER**

## Reason

ITM-655, pull request #1244 into `sprint/team2/99`, passes on `c619bbad`. CI is green on 23 of 23 checks.

1. **Red first.** The tests-only commit `a564bce8` was pushed by itself, and its CI (run 39501135594) failed. But it failed
   only in node (3), on TST-294001, a test this item does not touch.
   - That job's log ends after TST-294001, and no line of the run names TST-655.
   - So the red of the new tests is read here, at the commit itself. `tests/main-page-get-your-own.test.mjs` at
     `a564bce8` fails 3 of 3.
   - At `c619bbad`, it and `tests/main-page-home.test.mjs` pass, 42 of 42.
   - TST-294001's second flip is registered as ITM-1162 (agreement 94).
2. **The accepted text.** MOD-main-page's `home`: "*Get your own Agent M*, which leads to MOD-settings-pages'
   `get-your-own`" (blob `bb94e9e4`, accepted).
   - The link is the address `menuOf` gives with the route's name, `docs/index.html#get-your-own`. That is how the
     stages' links are built, and h's reading is confirmed.
3. **The live page.** `docs/index.html` still loads `dashboard-app.mjs`, which does not serve `#get-your-own`.
   - The route `home` that carries the link is not live either. Both are served by the frame (`start.mjs`), and go live
     together with ITM-684's switch.
   - The Acceptance names the greeting of the main page that MOD-main-page builds, and that greeting opens the route.
   - Nothing of this item depends on the old page.
4. **Scope.** The pull request changes `src/main-page/greeting.mjs`, `home.mjs`, a new test, and one comment line in
   `tests/main-page-home.test.mjs`. All are MOD-main-page's, and no expected value changes.
5. **Reading.** One passage each of AGENTS.md, SPEC.md and chapters 9, 11, 12 and 13 is named in the description.
