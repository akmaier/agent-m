---
id: ITM-1224
title: The Tests entry opens on the schedule, and its browser and audit link back into it
level: module
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
  - UC-027
  - UC-029
  - UC-030
modules:
  - MOD-site-frame
  - MOD-trace-pages
builds_on:
  - ITM-1206
  - ITM-1223
tests:
  - unit
origin:
  - akmaier's request of 2026-10-26 (see ITM-1223)
---
# ITM-1224 The Tests entry opens on the schedule, and its browser and audit link back into it

**REGISTER**

## Outcome

- **MOD-site-frame:** the live menu's entry Tests opens the setup of the batteries first: its views are
  `["schedule", "runs", "generate"]` (`src/site/menu.mjs:13`), so that the entry leads to `#schedule`.
- **MOD-trace-pages:** the views `tests` and `audit` (UC-029, UC-030) draw, under their head, the same five links of the
  Tests entry as ITM-1223's routes — Schedule, Browser, Runs, Audit, Generate —, the one shown marked, through the
  descriptor's `links`; the audit's descriptor names the entry `tests` ("Tests → Audit", UC-030 1) instead of `releases`
  (`src/trace-pages/views.mjs:47`); its table is `table.list` with `data-label` (`src/trace-pages/audit.mjs:192`), its
  sections panels.

## Acceptance

- Unit tests naming MOD-site-frame: the menu's Tests link is `#schedule`. Unit tests naming MOD-trace-pages: the views
  `tests` and `audit` draw the five links in order with the one shown marked; the audit's table is `table.list` with
  `data-label`; the audit's descriptor names `tests`. Counter-proof: before the change each fails.
- The release tests that pin the menu or these views are changed by a participant other than the implementer, in a
  commit of its own.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/site/menu.mjs`, `src/trace-pages/` and the tests that name MOD-site-frame or MOD-trace-pages change.
