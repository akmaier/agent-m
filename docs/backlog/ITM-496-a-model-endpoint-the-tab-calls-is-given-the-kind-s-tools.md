---
id: ITM-496
title: A model endpoint the tab calls is given the kind's tools
level: module
realises:
  - UC-049
  - ONE DEFINITION, THREE DRIVERS
modules:
  - MOD-runtimes
builds_on:
  - ITM-486
  - ITM-488
  - ITM-493
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-runtimes, Interfaces: runOnTab
---
# ITM-496 A model endpoint the tab calls is given the kind's tools

**REGISTER**

## Outcome

`runOnTab` gives the driver of an endpoint the tab calls directly the kind's `ToolUse`, so that its tool loop runs in
the tab; no other driver is given tools.

## Acceptance

- A fixture endpoint called directly is offered the kind's tools and its calls are carried out in the tab; an agent on a
  Bridge is offered none.
