---
id: ITM-569
title: The prompt bar's and the frame's tests wait by time, not by turns
level: unit
realises:
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
modules:
  - MOD-prompt-bar
  - MOD-site-frame
builds_on:
  - ITM-505
tests:
  - unit
origin:
  - the end gate of sprint team1/50 (docs/gates/20261016-1928-release-testing-sprint-review-71ca.md): a turn-bounded until failed under CI's load
---
# ITM-569 The prompt bar's and the frame's tests wait by time, not by turns

**REGISTER**

## Outcome

These four test files each hold a copy of `until(condition, what)` that is bounded by 400 turns of the event loop, not by
time:
- `tests/prompt-bar.test.mjs:53`;
- `tests/prompt-bar-fixed.test.mjs:46`;
- `tests/site-frame-prompt-bar.test.mjs:44`;
- `tests/site-frame-prompt-bar-foot.test.mjs:35`.

One of the same kind, in `tests/prompt-bar-hand-over.test.mjs`, failed under CI's load at sprint 50's end gate.

**Not ready for a sprint yet.** Its readings are settled before it is selected:
- whether the four become one helper that both modules' tests import (AGENTS.md §2, "Nothing twice"), and under which
  module's header a helper shared by two modules' tests stands;
- the bound, 10 seconds of clock as ITM-527 set it, failing with what it waited for;
- whether `prompt-bar-hand-over.test.mjs`'s own `until`, mended in sprint 50, joins that helper.

## Acceptance

- Every `until` of these files is bounded by time and names what it waited for. A slowed condition that the old one
  fails by turns is waited for by the new one.
- No expected value changes.
