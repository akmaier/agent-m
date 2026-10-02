---
id: ITM-100
title: The jump host's web-server configuration and the HTTPS route of a remote session
kind: implementation
level: 2
realises:
  - THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN
  - THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE
  - A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST
  - THE DASHBOARD WRITES THE TUNNEL COMMANDS
modules:
  - MOD-bridge-tunnel
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-100 The jump host's web-server configuration and the HTTPS route of a remote session

**REGISTER**

## Outcome

`webServerConfig(jump, sessions, pagesOrigin)` writes the Apache and nginx blocks of ARC-013 decision 6 and the `htpasswd -B` command — never a password or hash — and refuses a block that would proxy without login, answer `*`, or proxy to a non-loopback address; `jumpHostProblem` and `tunnelCommands` know the HTTPS address and login name of the HTTPS route.

## Realises

- `THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN`
- `THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE`
- `A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST`
- `THE DASHBOARD WRITES THE TUNNEL COMMANDS`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-bridge-tunnel `webServerConfig`; ARC-013 decisions 5, 6.

Architecture decisions its modules follow: ARC-003, ARC-013.

## Modules

- MOD-bridge-tunnel (adapters) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/bridge-tunnel.mjs`
- `tests/test_bridge_tunnel.py`
- `tests/review-core.d/web-server-config.test.mjs`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `THE DASHBOARD WRITES THE TUNNEL COMMANDS`
- `tests/test_bridge_tunnel.py` — `THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN`; `THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE`; `A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST`

## Acceptance criteria

From the SPEC's checks:

- `THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN` — `tests/test_bridge_tunnel.py` — a request without the login is answered `401` and reaches no bridge; counter-proof: with the login and the bridge's token it is answered by the bridge.
- `THE JUMP HOST ALLOWS CROSS-ORIGIN REQUESTS ONLY FROM THE INSTANCE` — `tests/test_bridge_tunnel.py` — a preflight from the Pages origin is allowed; counter-proof: one from any other origin is refused.
- `A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST` — `tests/test_bridge_tunnel.py` — through a test HTTPS proxy in front of a reverse tunnel, the dashboard's request reaches the bridge; counter-proofs: with the tunnel closed, the proxy answers with an error and no bridge is reached; behind a certificate the test browser does not trust, the request fails and the settings page names the certificate as a possible cause.
- `THE DASHBOARD WRITES THE TUNNEL COMMANDS` — `tests/review-core.test.mjs`

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — adds its checks under tests/review-core.d/

## Needs a person

No.

## Notes

ARC-013 decision 6 is marked "proposed … the PO decides at acceptance of this file"; ARC-013 is accepted.
