---
id: ITM-117
title: Measure the dashboard's reach to a bridge on loopback in every browser
kind: measurement
level: 2
realises:
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
  - UC-044
modules: []
depends_on:
  - ITM-099
origin: backlog refinement 2026-10-01
---
# ITM-117 Measure the dashboard's reach to a bridge on loopback in every browser

**REGISTER**

## Outcome

ARC-012 open measurement 1: from `https://akmaier.github.io` to `http://127.0.0.1:<port>` with the bridge-token header and a JSON body — Chrome, Edge and Firefox on macOS and Windows (the prompt, whether it is remembered) and Safari 26 on macOS (its console message); `localhost` beside `127.0.0.1` as a check.

## Realises

- `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`
- UC-044 — Install and pair the Agent M Bridge

## Where it came from

ARC-012 consequences (open measurement 1).

## Modules

- none — a repository check or a measurement: the rule is checked across the repository or by a person, not by one module's code (ARC-020 decision 5).

Files it creates or changes:

- `docs/measurements/<date>_bridge-loopback-reachability.md` (new)

## Kind and level

- Job kind: **measurement** — not a coding job: a person measures or decides, and the result is a dated file in `docs/measurements/`.
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Checks of the SPEC this measurement bears on

- `tests/test_measurement_present.py` — `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`

## Acceptance criteria

From the SPEC's checks:

- `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED` — `tests/test_measurement_present.py` — a released runtime has a dated measurement file.

From the postcondition of UC-044 (Install and pair the Agent M Bridge), for the part this item builds:

> - The bridge runs as an app on this computer, paired with the person's dashboard; nothing was typed in a
>   terminal.
> - Its installed agents are available as participants and use their own login; no key passed through
>   Agent M.
> - If configured, its tunnel to the jump host is open and ends on the jump host's loopback; its private SSH key
>   never left this computer.

Further:

- The measurement file states its method, date, environment and every raw result, and is not edited afterwards.
- Where the result contradicts the architecture, it is reported as a finding to the PO; nothing in SPEC.md, the use cases or the architecture is changed by this item.

## Depends on

- ITM-099 — a bridge server to call

## Needs a person

A person at real browsers on macOS and Windows.
