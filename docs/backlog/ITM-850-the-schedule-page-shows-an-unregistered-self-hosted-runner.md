---
id: ITM-850
title: The schedule page shows an unregistered self-hosted runner
level: module
realises:
  - UC-027
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-test-pages
builds_on:
  - ITM-758
tests:
  - unit
origin:
  - developer-sonnet-f's stop of ITM-758 in team 2's sprint 80, 2026-10-18
---
# ITM-850 The schedule page shows an unregistered self-hosted runner

**REGISTER**

## Outcome

MOD-test-pages' route `schedule`, UC-027 3b: for a row whose chosen runner is a self-hosted runner that is not
registered, the page shows the server's runner registration page and the command to run on that machine, with a folded
explanation; runs for that row wait until a runner is online, and the dashboard shows them as queued.

The item waits for akmaier's decision on MOD-repository-hosts: a Host function that gives a self-hosted runner's
registration and online state, and a `WebLinks` entry for the server's runner registration page. It cannot be settled
from the accepted texts: MOD-repository-hosts' Host functions name no runner and its `WebLinks` has no runner page;
MOD-participant-list's `eligible` and `participantsOf` judge capabilities and the route text only; MOD-runtimes'
`liveState` concerns jobs. Where the command to run on the machine comes from (the server's page, or a function of the
host) is part of the same decision.

## Acceptance

- With fake hosts, the tests state what the page shows for a row whose self-hosted runner is not registered, and for one
  whose runner is online.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-pages/` and the tests that name MOD-test-pages change.
