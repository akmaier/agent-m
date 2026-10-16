---
id: ITM-542
title: The page's last lines stay clear of the prompt bar
level: module
realises:
  - UC-049
  - THE SITE WEARS THE PATTERN RECOGNITION LAB'S LOOK
modules:
  - MOD-site-frame
builds_on:
  - ITM-506
  - ITM-540
tests:
  - unit
origin:
  - the gate of #585 (ITM-540, sprint team1/44): with the bar fixed to the bottom of the window, a page's last lines can lie under it
  - MOD-site-frame, Parts: `look.css` — "the header, footer and menu of the lab's look"; Interfaces: startPage — the bar started "in the page's foot"
---
# ITM-542 The page's last lines stay clear of the prompt bar

**REGISTER**

## Outcome

MOD-site-frame keeps the route's last lines clear of the prompt bar, which ITM-540 fixed to the bottom of the window.
- **Why it is the frame's.** MOD-site-frame starts the bar "in the page's foot", the `footer` of class
  `site-frame-prompt-bar` (ITM-506). Its `look.css` holds "the header, footer and menu of the lab's look". MOD-prompt-bar
  places only its own bar.
- **What is built.** The footer takes the height of the bar it holds, so that the page can be scrolled until its last line
  stands above the bar.
- **The height.** It changes with what the bar shows — a selector, a conversation, a draft — so `look.css` cannot fix it.
  The frame sets the footer's height to the bar's, when the bar is drawn and again whenever it changes, with a
  `ResizeObserver` where the browser has one. Where it has none, it sets it once, when the bar is drawn.

## Acceptance

- In a small DOM with a bar of a given height, the footer takes that height, and takes the new height when the bar
  changes.
- The Bridge's window, which draws no bar, gets no such footer.
- Each test states its expected values in its own text.
