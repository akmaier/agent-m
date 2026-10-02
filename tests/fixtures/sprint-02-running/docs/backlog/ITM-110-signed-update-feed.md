---
id: ITM-110
title: The bridge's signed update feed and an update installed only after the person's click
kind: implementation
level: 2
realises:
  - THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - UC-044
modules:
  - MOD-bridge-app
depends_on:
  - ITM-102
  - ITM-109
origin: backlog refinement 2026-10-01
---
# ITM-110 The bridge's signed update feed and an update installed only after the person's click

**REGISTER**

## Outcome

`updateFeed`, `verifyFeed` (Ed25519 feed signature with the public key compiled in, verified with Web Crypto) and `installUpdate` (feed signature, file SHA-256, platform signature, then the platform's install step; any failure installs nothing; nothing downloaded before the click).

## Realises

- `THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE`
- `THE BRIDGE IS SIGNED BY ITS PUBLISHER`
- UC-044 — Install and pair the Agent M Bridge

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-bridge-app (takes over the update feed of the withdrawn MOD-release); ARC-011 decision 8, ARC-017 decision 3.

Architecture decisions its modules follow: ARC-003, ARC-011, ARC-017.

## Modules

- MOD-bridge-app (shells) — uses MOD-bridge-server, MOD-bridge-tunnel, MOD-derivation, MOD-git-host, MOD-mailbox, MOD-participants, MOD-run-engine, MOD-settings-store, MOD-test-records

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `bridge/update.mjs` (new)
- `bridge/main.mjs`
- `tests/test_bridge_release.py` (created here)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Tests the SPEC names

- `tests/test_bridge_release.py` — `THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE`; `THE BRIDGE IS SIGNED BY ITS PUBLISHER`

## Acceptance criteria

From the SPEC's checks:

- `THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE` — `tests/test_bridge_release.py` — an update with an invalid signature is refused; counter-proof: a valid one is installed after the click.
- `THE BRIDGE IS SIGNED BY ITS PUBLISHER` — `tests/test_bridge_release.py` — the release refuses to publish a file whose signature or notarisation cannot be verified.

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

- ITM-102 — the app
- ITM-109 — wires the update offer into bridge/main.mjs after the mail routes

## Needs a person

No.
