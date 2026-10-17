---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - bc787b436792bb3884ef4211b133acb99219d089
  - https://github.com/akmaier/agent-m/pull/804
date: 2026-10-17 22:54 UTC
---
# Development → Release testing: ITM-825, a cleared token is no longer used by the open page

**REGISTER**

## Reason

ITM-825, pull request #804 into `sprint/team1/79`, at head `bc787b43`. It is mergeable, and run 39076655057 is green. It
changes `src/settings-pages/settings.mjs` and adds a test file, +132/−3.

**The lead was a fault, and it is shown at its node.**
- After *Clear everything*, `context.instance.host` stayed connected with the token.
- `recordingControls` had captured that host when it was built.
- Opening the *Repositories* tab then sent three requests, each with the cleared token in its authorisation.
- A *Clear* on the token's line did the same.
- The tests-only commit `2591a469` was red in run 39076292175 on exactly TST-825001 and 825002. The code was pushed after
  the run had ended.

**The fix stays in MOD-settings-pages.**
- `reconnectHosts` reconnects the page's instance and product hosts after both clears, through `connect` and the module's
  `credentialsFor`, which are in its Uses.
- The page works on its own copies of the instance and product, so the caller's objects are not changed.
- `recordingControls` reads the host when it loads or saves.
- No request is added. After the clear, the three requests of the *Repositories* tab carry no token.
- Three planted faults are caught.
- The 76 files of MOD-settings-pages give the same results, and no release result changed:
  `release-uc-042-token-failures` passes 10 of 10. ITM-018 passes.

**Readings accepted.**
- `A CLEAR IS A REAL CLEAR` reads "removes the stored credentials from the browser, not only from the displayed form". So no
  request after a clear carries the cleared value.
- The token line's *Clear* is the same fault, so it is in scope.

**The refused command.** A Python heredoc chained with `git diff --stat` was refused as too complex. The edits were then
made with the Edit tool, the tool for editing a file. That is the normal path, not the same command run in another form, so
it is accepted.

**Findings, registered.**
- ITM-853: a product token's clear, and a token stored after a clear, are not followed until a reload
  (MOD-settings-pages).
- ITM-854: the notification checks may keep a cleared token (MOD-site-frame), test first.
