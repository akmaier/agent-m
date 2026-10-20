---
id: ITM-1116
title: The live dashboard loads its views as data-views names them, not by importing each page module
level: module
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-g's probe for ITM-1068 (sprint team2/97), on main at b1e4e7f4
---
# ITM-1116 The live dashboard loads its views as data-views names them, not by importing each page module

**REGISTER**

## Outcome

`src/site-frame/dashboard-app.mjs:42-46` imports the `view` of five page modules (settings, review, trace, test and
maintenance pages), which MOD-site-frame's `uses:` does not name. MOD-site-frame.md:109-110 has a page load its views through
`data-views`, the slugs of the view modules, by `start.mjs`. `dashboard-app.mjs` is taken over to be removed "with the app"
(:93-94). Its imports are the old app's own registry, not a use the text lacks.

**First task:** read which of the live app's views `start.mjs` can already load by `data-views`, and register the step that
moves the live page onto it, as ITM-682, ITM-1099 and ITM-1103 moved single routes.

## Acceptance

- The live app takes its views from `data-views`, and `dashboard-app.mjs` imports no page module. A test shows the page's menu
  and routes unchanged, with a counter-proof.
- Only MOD-site-frame's files and tests change. A release test that pins the built views is changed by a non-implementer.
