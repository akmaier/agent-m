---
id: ITM-858
title: The main page pauses its re-reads while the tab is hidden
level: module
realises:
  - UC-046
modules:
  - MOD-main-page
builds_on:
  - ITM-847
tests:
  - unit
origin:
  - ITM-847's draft stop (sprint team1/79), from developer-sonnet-e's findings
---
# ITM-858 The main page pauses its re-reads while the tab is hidden

**REGISTER**

## Outcome

ITM-847 re-reads each card with a token once a minute while `home` is open: 120 requests an hour per card. A background tab
keeps that up. `MOD-main-page.md:71-73` reads "While the page is open", and a hidden tab is still open. So pausing while
hidden would change the module's text. A draft for akmaier comes first, under his standing priority of the token budget.

## Acceptance

- The accepted draft's rule is built: the re-reads pause while the tab is hidden, and resume once it is shown again,
  with tests.
