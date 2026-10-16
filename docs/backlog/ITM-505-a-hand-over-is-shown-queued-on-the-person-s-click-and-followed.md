---
id: ITM-505
title: A hand-over is shown, queued on the person's click and followed
level: module
realises:
  - UC-049
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
  - A JOB GOES ONLY TO A HOLDER OF ITS ROLE
  - A CANCELLED JOB WRITES NOTHING MORE
modules:
  - MOD-prompt-bar
builds_on:
  - ITM-486
  - ITM-495
  - ITM-504
  - ITM-535
  - ITM-536
tests:
  - unit
  - component
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-prompt-bar, Interfaces: startPromptBar (a hand-over)
---
# ITM-505 A hand-over is shown, queued on the person's click and followed

**REGISTER**

## Outcome

A hand-over the participant proposed is shown with its kind, what it works on, its task, the participant with its
place and its route from `routesFor`; *Hand over* queues it with `handOverJob` only where `startable` and `holdsRole` let a
kind of the product's workflow start, showing the reasons otherwise; the bar follows the job by its record and
`liveState` until it ends — *waiting for GitHub Actions* with the run's address, or for the Bridge —, shows its log's
answer and its commits, and *Stop* cancels it with `cancelJob`.

## Acceptance

- With fixtures, a hand-over refused for each reason names it and queues nothing; an allowed one is queued on the click
  only, followed to its end, and cancelled by *Stop*.
