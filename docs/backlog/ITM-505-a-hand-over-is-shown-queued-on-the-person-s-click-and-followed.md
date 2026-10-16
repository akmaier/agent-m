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
  - ITM-545
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

**The readings, settled at sprint team1/50's start** from MOD-prompt-bar (Interfaces, `startPromptBar`), MOD-work-plans'
`startable` and the code it builds on:
- **What is shown.** The proposal's kind, what it works on, its task, the participant with its processing place
  (`placeOf`), and the route `routesFor` gives, or its reason where none is offered. *Hand over* is offered beside it.
- **When the start rules apply.** They apply where the hand-over works on an item or a step of the product's plan, that
  is, one that `productFacts(… { scope: "work" })` lists among `plan.states`. For each such item, the bar asks
  `startable(item, plan.states, context)`. The context holds:
  - the workflow from the facts;
  - the role assignment and the running sprint of the team whose sprint selects the item, or `null` for both where none
    does;
  - `held`, and the work-in-progress limit from the facts;
  - `participants: [the proposed participant]`.

  With that one participant, `startable`'s own check of "no holder of the implementing role in `assignment` with what the
  role needs" is the check that this participant holds the implementing role. It is made with `holdsRole`
  (`src/work-plans/states.mjs:229–243`), so the bar repeats no rule of the work plans. Any reason is shown, and nothing is
  queued.
- **Queuing.** Only on a person's click (`event.isTrusted`), `handOverJob(prepared, route, start, host, head, task,
  target)` is called, as `src/runtimes/hand-over.mjs:49` takes it. The head is the one the facts were read at.
- **Following.** After the hand-over, the bar reads the product's default branch every 15 seconds until the job has
  ended, and lists the job's row with `listJobs` and `liveState`. Fifteen seconds keeps one followed job within a few
  hundred requests an hour, under GitHub's 5,000.
  - On CI it shows *waiting for GitHub Actions* with the run's address, which `jobLog` gives as `{ address }`.
  - On a Bridge it shows the lines `jobLog`'s stream yields, as they come.
  - Once the record has its end, it shows the end's state and the commits it names, and stops following.
- ***Stop*** while it is followed calls `cancelJob`, and shows `cancelled` or `cancelling` as it answers.
- **The Bridges** are handed to the runtimes from their stored entries with `settingsOf` and `bridgeAt`, as the bar
  already does for a message.

**Existing test whose expected result changes:** TST-600030 (`tests/prompt-bar.test.mjs:418`), which expects no button
*Hand over*. UC-019's TST-377013 (S12) then holds as well. It stays `todo` until a developer who implements none of this
item turns it plain.

## Acceptance

- With fixtures, a hand-over refused for each reason names it and queues nothing; an allowed one is queued on the click
  only, followed to its end, and cancelled by *Stop*.
