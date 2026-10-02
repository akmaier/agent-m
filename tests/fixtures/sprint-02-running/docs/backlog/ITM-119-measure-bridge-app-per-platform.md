---
id: ITM-119
title: Measure the bridge app on every platform — tray, window, backend, installer rights, Windows on ARM
kind: measurement
level: 2
realises:
  - THE BRIDGE RUNS AS AN APP
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - UC-044
modules: []
depends_on:
  - ITM-102
  - ITM-111
origin: backlog refinement 2026-10-01
---
# ITM-119 Measure the bridge app on every platform — tray, window, backend, installer rights, Windows on ARM

**REGISTER**

## Outcome

ARC-011 open measurements 1–3 (and 4 only if the `deno compile` fallback is chosen): a `deno desktop` build (pinned Deno) on macOS 15, Windows 11, Ubuntu 24.04 with GNOME and KDE Plasma 6 on Wayland — `tray.trayId`, a screenshot, the tray menu with the window minimised and hidden; the WebView2 and CEF backends on Windows with their `.msi` sizes; the Windows launcher and whether the per-machine `.msi` asks for an administrator; whether the x86-64 `.msi` runs on Windows 11 on ARM.

## Realises

- `THE BRIDGE RUNS AS AN APP`
- `THE BRIDGE IS ONE FILE PER PLATFORM`
- UC-044 — Install and pair the Agent M Bridge

## Where it came from

ARC-011 consequences (open point and open measurements 1–4).

## Modules

- none — a repository check or a measurement: the rule is checked across the repository or by a person, not by one module's code (ARC-020 decision 5).

Files it creates or changes:

- `docs/measurements/<date>_bridge-app-platforms.md` (new)

## Kind and level

- Job kind: **measurement** — not a coding job: a person measures or decides, and the result is a dated file in `docs/measurements/`.
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Checks of the SPEC this measurement bears on

- `tests/test_bridge_release.py` — `THE BRIDGE IS ONE FILE PER PLATFORM`
- guarded at review only: `THE BRIDGE RUNS AS AN APP`

## Acceptance criteria

From the SPEC's checks:

- `THE BRIDGE RUNS AS AN APP` — no automatic check; at review.
- `THE BRIDGE IS ONE FILE PER PLATFORM` — `tests/test_bridge_release.py` — the release build yields one file per platform, and each starts, after installation where it is an installer, on a machine without Node or Deno.

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

- ITM-102 — the app to build
- ITM-111 — the release build

## Needs a person

A person with these machines; afterwards the PO decides the Windows backend (CEF or a window that stays open) and whether Windows on ARM gets no bridge or a headless `deno compile` executable (ARC-011 open point).
