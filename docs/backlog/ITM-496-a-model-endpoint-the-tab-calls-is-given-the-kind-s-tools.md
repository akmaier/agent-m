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
  - component
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-runtimes, Interfaces: runOnTab
---
# ITM-496 A model endpoint the tab calls is given the kind's tools

**REGISTER**

## Outcome

`runOnTab` gives the driver of an endpoint the tab calls directly the kind's `ToolUse`, so that its tool loop runs in
the tab; no other driver is given tools.

Its Outcome already holds through ITM-486 and ITM-488:
- MOD-job-runner's loop gives the drafter's `send` the `ToolUse` (`tools`);
- `runOnTab`'s `driverOf` hands a direct endpoint `endpointDriver` unchanged (`src/runtimes/tab.mjs`);
- `endpointDriver` runs the tool loop.
So the item writes the component test of that composition. Since it adds no behaviour, its first commit need not be red.
Its counter-proof — `driverOf` wrapping the driver so that `tools` is dropped — fails it. It is written by a Developer
who built none of ITM-486, ITM-488 or `runOnTab`.

A reading, quoted: "no other driver is given tools". MOD-job-runner's file gives a `ToolUse` also to an endpoint "through
the Bridge its configuration names", and ITM-497 builds that loop. So "no other driver" is read as: no agent on a
Bridge.

## Acceptance

- A fixture endpoint called directly is offered the kind's tools and its calls are carried out in the tab; an agent on a
  Bridge is offered none.
