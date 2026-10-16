---
id: ITM-540
title: The prompt bar stands at the bottom of the window
level: module
realises:
  - UC-049
modules:
  - MOD-prompt-bar
builds_on:
  - ITM-504
tests:
  - unit
origin:
  - the gate request of #582 (ITM-506, sprint team1/43): the bar has no style that fixes it to the bottom
  - MOD-prompt-bar, Interfaces: startPromptBar — "draws the bar into `target`, fixed to the bottom of the window"
---
# ITM-540 The prompt bar stands at the bottom of the window

**REGISTER**

## Outcome

`startPromptBar` draws the bar fixed to the bottom of the window, as MOD-prompt-bar's file says. MOD-prompt-bar's Parts
name no style sheet, so the bar sets the style on its own root element: `position: fixed`, `bottom: 0`, `left: 0` and
`right: 0`.

## Acceptance

- In a small DOM, the bar's root element is fixed to the bottom, and stays fixed when the route changes.
- Each test states its expected values in its own text.
