---
id: ITM-102
title: The Agent M Bridge app — composition root, its one store, tray and window with a checked fallback, headless mode
kind: implementation
level: 2
realises:
  - THE BRIDGE IS PAIRED ONCE
  - THE BRIDGE RUNS AS AN APP
  - THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
  - THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE
  - UC-044
modules:
  - MOD-bridge-app
depends_on:
  - ITM-099
  - ITM-101
origin: backlog refinement 2026-10-01
---
# ITM-102 The Agent M Bridge app — composition root, its one store, tray and window with a checked fallback, headless mode

**REGISTER**

## Outcome

`bridge/main.mjs` imports the dashboard's modules and composes the route table; `bridgeStore(dir)` keeps port, jump host, session port, local model servers and the pairing token in owner-only files and imports only its own keys from a dashboard export; `appShell` reads `trayId` and keeps the window open when it is 0, or runs headless without a desktop session, and reports the mode in `GET /hello`; the window shows the pairing token with *Copy*, the agents and their install guides.

## Realises

- `THE BRIDGE IS PAIRED ONCE`
- `THE BRIDGE RUNS AS AN APP`
- `THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW`
- `THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT`
- `THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE`
- UC-044 — Install and pair the Agent M Bridge

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-bridge-app; ARC-011 decisions 1, 4–7.

Architecture decisions its modules follow: ARC-003, ARC-011, ARC-017.

## Modules

- MOD-bridge-app (shells) — uses MOD-bridge-server, MOD-bridge-tunnel, MOD-derivation, MOD-git-host, MOD-mailbox, MOD-participants, MOD-run-engine, MOD-settings-store, MOD-test-records

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `bridge/main.mjs` (new)
- `bridge/deno.json` (new, pinned Deno version)
- `bridge/store.mjs` (new)
- `bridge/window/` (new)
- `tests/test_bridge_token.py`
- `tests/test_bridge_settings.py`
- `tests/bridge-app.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Tests the SPEC names

- `tests/test_bridge_settings.py` — `THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT`
- `tests/test_bridge_token.py` — `THE BRIDGE IS PAIRED ONCE`
- `tests/test_single_definition.py` — `THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE`
- guarded at review only: `THE BRIDGE RUNS AS AN APP`; `THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW`

## Acceptance criteria

From the SPEC's checks:

- `THE BRIDGE IS PAIRED ONCE` — `tests/test_bridge_token.py` — after a restart the stored token is accepted and the file is readable by its owner only; counter-proof: after *pair anew* the old token is rejected.
- `THE BRIDGE RUNS AS AN APP` — no automatic check; at review.
- `THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW` — no automatic check; at review.
- `THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT` — `tests/test_bridge_settings.py`
- `THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE` — `tests/test_single_definition.py` — the bridge's build imports the dashboard's modules; no job definition exists twice.

From the postcondition of UC-044 (Install and pair the Agent M Bridge), for the part this item builds:

> - The bridge runs as an app on this computer, paired with the person's dashboard; nothing was typed in a
>   terminal.
> - Its installed agents are available as participants and use their own login; no key passed through
>   Agent M.
> - If configured, its tunnel to the jump host is open and ends on the jump host's loopback; its private SSH key
>   never left this computer.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-099 — server and pairing; extends tests/test_bridge_token.py
- ITM-101 — the agent routes it mounts

## Needs a person

No.
