---
id: ITM-709
title: A view names the files it reads
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-site-frame
builds_on:
  - ITM-574
tests:
  - unit
origin:
  - ITM-574's gate on pull request #728 (sprint team1/72)
---
# ITM-709 A view names the files it reads

**REGISTER**

## Outcome

ITM-574's `readAhead` in `src/site-frame/dashboard-app.mjs` holds, for each route, a second copy of what that route's view
reads. For `#backlog`, for example, it reads the module files "for a product with more than one team (backlog-view.mjs
context)". Once a view changes what it reads, the copy is wrong and nothing fails.

If a view named the files it reads, the frame could read them in one wave and keep no copy. MOD-site-frame's `View`
offers no such field, so this item waits for a draft of it for akmaier.

## Acceptance

- MOD-site-frame's accepted `View` lets a view name its reads, and `readAhead` keeps no list of its own.
- The counts of `load-per-view.test.mjs` stay as they are.
