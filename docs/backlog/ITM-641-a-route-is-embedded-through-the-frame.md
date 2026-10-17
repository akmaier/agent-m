---
id: ITM-641
title: A route is embedded through the frame
level: module
realises:
  - UC-013
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - ITM-590's gate (docs/gates/20261017-0406-development-release-testing-9d71.md), from developer-sonnet-e's findings on pull request #684
---
# ITM-641 A route is embedded through the frame

**REGISTER**

## Outcome

MOD-site-frame provides `embedRoute(name, target, params)`, and `src/site-frame/index.mjs:5` says it is not built.
MOD-test-pages' file has a view rendered "through the frame (`embedRoute`)". Which caller needs it first is read at the
start, against the Uses of the modules that name it.

## Acceptance

- `embedRoute` renders the named route into the target with its parameters, as MOD-site-frame's file states it.
- A route not loaded on the page gives `RouteNotLoaded`, and the frame puts a link to it in the target.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
