---
id: ITM-1349
title: Only a file the reviewer has read gets a tick on the list
level: module
realises:
  - UC-008
  - SEVERAL FILES ARE ACCEPTED IN ONE CLICK
modules:
  - MOD-review-pages
builds_on:
  - ITM-372
tests:
  - unit
origin:
  - finding UC008-S1 of ITM-372's system test TST-372212 (#1605), ruled at its gate in team1's sprint 141 (docs/gates/20261101-0613-development-release-testing-0372.md)
---
# ITM-1349 Only a file the reviewer has read gets a tick on the list

**REGISTER**

## Outcome

UC-008 3d: "Each one read gets a tick; **Accept ticked** writes one commit with one record per ticked file, each naming the
text that was shown." Today the list offers a tick for every file that is not accepted, whether or not the reviewer has
opened it (`src/review-pages/flow.mjs:143`, `rowFor` at :258). *Accept ticked* can then record the blob of a text the
reviewer was never shown, against `SEVERAL FILES ARE ACCEPTED IN ONE CLICK` ("none for a file that was not shown").

## Acceptance

- The list offers a tick only for a file whose text the reviewer has been shown in this tab. The tick names the blob that
  was shown. A file not shown has no tick.
- A file that changed after it was shown is left out of *Accept ticked* and named, as UC-008 3d gives it.
- TST-372212 loses its `todo` in a commit by a participant other than the implementer, written after the code is pushed.
- Before the job starts, its probe reads MOD-review-pages' text on the list's ticks (MOD-review-pages.md:186-188). The
  reading taken: "each with its status and a tick" names the tick the list offers for a file read, as UC-008 3d gives
  it. What was shown is kept on the screen only.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
