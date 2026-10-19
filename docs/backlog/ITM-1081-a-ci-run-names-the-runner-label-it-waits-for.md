---
id: ITM-1081
title: A CI run names the runner label it waits for, so that the schedule page shows a row's own queued runs
level: module
realises:
  - UC-027
modules:
  - MOD-repository-hosts
  - MOD-test-pages
builds_on:
  - ITM-850
tests:
  - unit
origin:
  - the gate of #1072 (ITM-850), sprint team2/96, on main at 309c8ee7
---
# ITM-1081 A CI run names the runner label it waits for, so that the schedule page shows a row's own queued runs

**REGISTER**

## Outcome

MOD-test-pages.md:109-110: for a row on a self-hosted runner, "the row's runs shown as queued until one is online". The
`CiRun` of MOD-repository-hosts (MOD-repository-hosts.md:135-136) has no runner or label, so ITM-850 lists every queued run
of the default branch under each self-hosted row, and reads no runner's state.

## Not ready: it needs a draft

`CiRun` would need the labels a run waits for. That is a change to MOD-repository-hosts' text for akmaier. Team 1 has two
drafts pending on that file (`3ad7308e`, `7784bb9c`), so a team 2 draft waits until akmaier decides them.

## Acceptance

- Written once the draft is accepted: the queued runs under a row are those whose labels match the row's runner label.
