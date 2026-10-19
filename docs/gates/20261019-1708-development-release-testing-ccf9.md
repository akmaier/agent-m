---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 191e710a79fb2b77083c1289ab97731b33ffc853
  - https://github.com/akmaier/agent-m/pull/1104
date: 2026-10-19 17:08 UTC
---
# Development → Release testing: ITM-1004, the Bridge's window shows the origin it is paired with

**REGISTER**

## Reason

ITM-1004, pull request #1104 into `sprint/team2/97`, passes on `191e710a`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `50a9eef0` holds only the tests, and CI run 39289984491 failed on it.
2. **The accepted text.** MOD-desktop-shell.md:171-174: *paired with* the origin MOD-bridge-http's `pairedWith()` gives, or
   *not yet paired since this start*.
   - `main.mjs` passes `pairedWith()` into the window's state.
   - `window.mjs` shows "This Bridge is paired with <origin>." or "This Bridge is not yet paired since this start.".
3. **Readings accepted.**
   - The view's wording names the whole origin.
   - After *Pair anew*, the view says it is not yet paired until the next request with the new token. That is
     `pairedWith()`'s own behaviour (ITM-1003).
4. **Scope.**
   - `src/desktop-shell/` and tests naming MOD-desktop-shell.
   - The Electron the tests construct moves to `tests/desktop-shell.d/entry.mjs`, shared by
     `mod-desktop-shell-build-resources` and the new pairing test. That is a test helper, with no change of what either
     asserts.
