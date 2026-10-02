---
id: ITM-103
title: The bridge opens and keeps its SSH tunnels with its own key and an OpenSSH client
kind: implementation
level: 2
realises:
  - THE BRIDGE OPENS ITS TUNNELS ITSELF
  - THE BRIDGE CREATES ITS OWN SSH KEY
  - A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL
  - REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL
  - A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK
modules:
  - MOD-bridge-tunnel
  - MOD-bridge-app
depends_on:
  - ITM-100
  - ITM-102
origin: backlog refinement 2026-10-01
---
# ITM-103 The bridge opens and keeps its SSH tunnels with its own key and an OpenSSH client

**REGISTER**

## Outcome

`sshClient(platform, appDir)` (system `ssh` on macOS and Linux; on Windows the Win32-OpenSSH files shipped in the install folder, never whatever is on the path), `ensureKey(dir)` (Ed25519, owner-only, private key never returned) and `superviseTunnel(argv, dir)` (argument array, own `known_hosts`, restart with backoff, state in `GET /tunnels`).

## Realises

- `THE BRIDGE OPENS ITS TUNNELS ITSELF`
- `THE BRIDGE CREATES ITS OWN SSH KEY`
- `A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL`
- `REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL`
- `A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-bridge-tunnel; ARC-013 decisions 1–4.

Architecture decisions its modules follow: ARC-003, ARC-011, ARC-013, ARC-017.

## Modules

- MOD-bridge-tunnel (adapters) — uses no other module
- MOD-bridge-app (shells) — uses MOD-bridge-server, MOD-bridge-tunnel, MOD-derivation, MOD-git-host, MOD-mailbox, MOD-participants, MOD-run-engine, MOD-settings-store, MOD-test-records

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/bridge-tunnel/bridge.mjs` (new)
- `bridge/main.mjs`
- `tests/test_bridge_tunnel.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Tests the SPEC names

- `tests/test_bridge_tunnel.py` — `THE BRIDGE OPENS ITS TUNNELS ITSELF`; `THE BRIDGE CREATES ITS OWN SSH KEY`; `A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL`; `REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL`; `A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK`

## Acceptance criteria

From the SPEC's checks:

- `THE BRIDGE OPENS ITS TUNNELS ITSELF` — `tests/test_bridge_tunnel.py` — two bridges and a test SSH server: the dashboard's request reaches the far bridge without any command typed; counter-proof: with the far bridge's tunnel closed, nothing answers.
- `THE BRIDGE CREATES ITS OWN SSH KEY` — `tests/test_bridge_tunnel.py` — the private key file is readable by its owner only and appears in no export; counter-proof: an export containing it fails the test.
- `A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL` — `tests/test_bridge_tunnel.py` — through a reverse and a forward tunnel over a test SSH server, the dashboard's request reaches the bridge; counter-proof: without the forward, nothing answers.
- `REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL` — `tests/test_bridge_tunnel.py` — the bridge answers through a forwarded loopback port and on no non-loopback interface.
- `A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK` — `tests/test_bridge_tunnel.py` — the generated reverse-tunnel command names the loopback address; counter-proof: a command with `0.0.0.0` or an empty bind address fails.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-100 — extends tests/test_bridge_tunnel.py after it
- ITM-102 — mounts the supervisor in bridge/main.mjs

## Needs a person

No.
