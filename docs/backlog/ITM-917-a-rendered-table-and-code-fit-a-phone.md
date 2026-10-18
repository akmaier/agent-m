---
id: ITM-917
title: A rendered table and a code run fit a phone
level: module
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
modules:
  - MOD-markdown-render
builds_on:
  - ITM-904
tests:
  - unit
origin:
  - ITM-904's findings (sprint team1/89), `tests/site-usability.test.mjs`
---
# ITM-917 A rendered table and a code run fit a phone

**REGISTER**

## Outcome

ITM-904's check finds, at a phone's width, that on `#uc/UC-001` a Markdown table and a code run are wider than the window.
Both are drawn by MOD-markdown-render's `renderArtifact`. Its todo stands in `tests/site-usability.test.mjs`.

**First task, the stop clause:** read whether the reflow can be given by the renderer's markup alone, or needs a rule in a
style sheet. `docs/assets/style.css` lies outside every module, and `look.css` does not reach the live page until it
switches to `start.mjs` (sprint team1/87). If a style rule is needed, the item waits for that switch, as ITM-886 does.

## Acceptance

- At a phone's width, a rendered Markdown table and code run hold no element wider than the window, without scrolling
  sideways. The todo for `#uc/UC-001` is removed from `tests/site-usability.test.mjs`, and the check passes there.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
