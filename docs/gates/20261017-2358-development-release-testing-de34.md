---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f57d1663ac2d2f9db88460777b160e9f9b8a2113
  - https://github.com/akmaier/agent-m/pull/818
date: 2026-10-17 23:58 UTC
---
# Development → Release testing: ITM-854, the notification checks stop using a cleared token

**REGISTER**

## Reason

ITM-854, pull request #818 into `sprint/team1/80`, at head `f57d1663`. It is mergeable, and run 39080717110 passed twelve of
twelve. It changes `src/site-frame/dashboard-app.mjs` (+18/−2) and adds a test file.

**The lead was a fault, shown at its node.**
- The frame connected the notifications' instance host once with the token of the moment (`dashboard-app.mjs:525`).
- `watchForAcceptance` kept that host for the page's life.
- After a clear on Settings, a check sent its two requests with the cleared token.
- Both tests-only commits were red on exactly their new cases: `e9d8711b` on TST-854001, then `35dd9554` on TST-854001 and both
  TST-854003 cases. The code was pushed after each run had ended.

**The fix stays in MOD-site-frame.**
- `instanceHostFollowingToken()` gives `watchForAcceptance` a host that calls through one connected with the GitHub token
  stored at that moment. It reconnects only when the token has changed.
- It uses `connect` and `parseAddress`, as `currentHost()` does.
- After a clear, the check's two requests carry no token. A page that never had one sends none. No request is added.

**Readings accepted.**
- `A CLEAR IS A REAL CLEAR`: no request after a clear carries the cleared value, as at ITM-825.
- **The host also follows a token stored or replaced after opening,** pinned by TST-854003. That is the same rule as
  `currentHost()` and ITM-853's accepted "after a token is stored", and is accepted.

**Checks.** Three planted faults are caught. One is not: reconnecting on every call, which would lose the host's memory
of texts read by blob. This fixture's later check reads no blob, so it cannot show it. The behaviour is correct and the
change keeps it, so the missing test is registered as ITM-862.

The 109 files of the frame and the app, and UC-042's and UC-047's files, give the same results apart from the new tests.
ITM-018 passes.

**Findings.**
- ITM-862: a test that the host keeps its memory while the token is unchanged.
- ITM-863: MOD-notifications' checks keep a product's cleared token. That was measured on the head with a probe, and is test
  first. It may need a draft.
- The old main page's connect-once is noted in ITM-684, which removes it.

**The refusal.** A heredoc append was refused, and the edit was made with the Edit tool, as `79.md` allows.
