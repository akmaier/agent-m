---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - faef579e71782831eebb10368e3fbae3d309b55c
  - https://github.com/akmaier/agent-m/pull/1192
date: 2026-10-20 11:18 UTC
---
# Development → Release testing: TST-276901 expects the preload's onQuitRequested

**REGISTER**

## Reason

Pull request #1192 (`fix-tst-276901` into `sprint/team2/97`) passes on `faef579e`. CI is green, on 20 of 20 jobs, node (3)
and python (2) among them. The branch holds `sprint/team2/97`.

1. **The cause.** The rejection of #1191 (`6d54245a`) found that TST-276901 failed in node (3). ITM-1055 (#1128,
   developer-sonnet-i) added `onQuitRequested` to `src/desktop-shell/preload.cjs:2`, and the release test's expected
   list of `window.bridge` calls did not have it.
2. **The call is legitimate.** MOD-desktop-shell.md:80 calls `preload.cjs` "the fixed set of calls the window may make",
   and names no calls. *Quit* naming the jobs still running is ITM-1055's accepted behaviour, and it passed at its second
   gate.
3. **The change.** One line of `tests/release-itm-276-desktop-shell.test.mjs`: `onQuitRequested` joins the sorted
   list. The list now has the nine keys that `preload.cjs:2` exposes, no more. The test still checks that the
   renderer holds no Node (`process`, `require`).
4. **Not the implementer.** developer-sonnet-h changed the release test. h did not build ITM-1055.
