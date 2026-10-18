---
id: ITM-930
title: The checks' browser boot sends again any call that is not answered
level: unit
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
  - THE SITE SERVES A SCREEN READER
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-site-frame
builds_on:
  - ITM-924
tests:
  - unit
origin:
  - the Scrum Master's reading of run 39131435264 (sprint team1/90)
---
# ITM-930 The checks' browser boot sends again any call that is not answered

**REGISTER**

## Outcome

After ITM-924, `tests/site-usability.test.mjs` failed all 128 of its tests again on CI. That was run 39131435264, ITM-916's
implementation head, which touches no browser code, in job node (6) 117687254017. The first error was "Page.navigate was not
answered within 30 s" (`tests/site-usability.d/browser.mjs:97`, in the hook). ITM-924 sends an unanswered
`Runtime.evaluate` again, but not `Page.navigate`. The same shard passed the file in the item's red run 39131190183. The
log is `ITM-916-green-node6.log`. ITM-905's `tests/site-accessibility.test.mjs` boots the same way.

**First task:** read the log for what the session did around the lost `Page.navigate`, and name the cause before any change.
- Is it the same lost answer as ITM-924's, in a DevTools call that is not an evaluation?
- Which other calls of the boot can be lost the same way?
The fix covers every call the boot makes and stays within the total wait, with no longer wait alone.

## Acceptance

- A call of the boot that is not answered, `Page.navigate` included, is sent again within the same total, or its effect is
  awaited by the page's own state. A test with a fake session that drops the first `Page.navigate` shows that the page is
  drawn, with a counter-proof (no resend).
- Both checks pass in a shard beside other Electron files.
