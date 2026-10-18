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
  - ITM-889
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

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): (b), module text changes only

The question for akmaier in this item's Outcome: a host function for a self-hosted runner's registration and online
state, a `WebLinks` entry for the registration page, and where the command comes from. UC-027 3b: "Agent M shows the
runner registration page of the server and the command to run on that machine, with a folded explanation; runs for that
row wait until a runner is online, and the dashboard shows them as queued" (UC-027:116-118).

**The reading that needs no SPEC change.** The use case names the page and the command, not a state Agent M reads. The
command is the one the server's registration page shows, with the server's own short-lived token. The runs that wait are
`listCiRuns`' runs in the state `queued` (`CiRun.state`, MOD-repository-hosts.md), which MOD-test-pages already uses. So
for each row on a self-hosted runner, the page shows the server's runner page, the label the runner must carry, and a
folded explanation, and the row's runs as queued until one is online. A host function that reads a runner's state is
not needed for 3b. On GitHub it would need the token's *Administration* permission, which SPEC.md:745-748 does not
grant.

**The drafts**, committed as `c2f0a91e`:
- MOD-repository-hosts' `WebLinks` gains `runners`, the page on which a self-hosted runner is registered to the
  repository, which shows the command to run on its machine.
- MOD-test-pages' route `schedule` shows, for a row on a self-hosted runner, the server's runner page with the label and
  a folded explanation, and the row's runs as queued until one is online.

Principles: *one responsibility* — the server's addresses stay in MOD-repository-hosts; *nothing twice* — the command and
token are the server page's own; *no special first case* — the same on GitHub and GitLab.

ITM-889 builds the entry in MOD-repository-hosts; this item builds on it and on the acceptance of both drafts. While team
1's sprint 87 runs, MOD-test-pages uses MOD-site-frame (ITM-878), so the item is held.
