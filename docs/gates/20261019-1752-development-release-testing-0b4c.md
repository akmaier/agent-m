---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - c3dff34cc9324c29c99f142b0bf80d2dbfdb4a18
  - https://github.com/akmaier/agent-m/pull/1118
date: 2026-10-19 17:52 UTC
---
# Development → Release testing: ITM-1051, each view of the Bridge's window carries its own explanation

**REGISTER**

## Reason

ITM-1051, pull request #1118 into `sprint/team2/97`, passes on `c3dff34c`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `7259f03d` holds only the test, and CI failed on it.
2. **The change.** Each view names its own topic:
   - *Pairing* `bridge-pairing`;
   - *Agents* `bridge-own-login`, as the Acceptance says;
   - *Tunnels* `bridge-tunnels`;
   - *Settings* `bridge-import-export`.
   The merge of the sprint branch keeps #1117's *Check again*. Scope: `src/desktop-shell/window.mjs` and the test.
3. **i's first gap, ruled.**
   - The Acceptance names an *Updates* view too. MOD-desktop-shell.md:179 states it ("the running version, and a newer
     release when there is one"), but the window does not have it yet.
   - Building that view is ITM-1054's: the offer of a newer release, MOD-desktop-shell.md:183.
   - So the four views that exist are asserted here, and ITM-1054's view names `bridge-updates`, already in
     `explanations.md`. ITM-1054's item records it (this commit).
4. **i's second gap, ruled.** Four other Bridge topics stay unnamed by a view. The Acceptance asks that each view name its
   own topic, and the frame's own check finds every named topic. It does not ask that every topic be named by a view, so
   nothing is missing here.
