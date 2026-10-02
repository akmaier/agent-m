---
id: ITM-099
title: The bridge's HTTP protocol on both ends — loopback server and the dashboard's generic client
kind: implementation
level: 2
realises:
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST
  - UC-011
modules:
  - MOD-bridge-server
depends_on:
  - ITM-062
  - ITM-003
origin: backlog refinement 2026-10-01
---
# ITM-099 The bridge's HTTP protocol on both ends — loopback server and the dashboard's generic client

**REGISTER**

## Outcome

`serve` (loopback bind only, CORS for the paired origin only, host check, constant-time token compare, `Authorization` ignored, bodies never logged) and `bridgeClient({ route, token })` for the loopback and the HTTPS route, naming each refusal (blocked loopback, the web server's 401, the bridge's 401, a failed TLS connection); `pairing(store)` with *Pair anew*. Bridge modules run under `deno test` in Agent M's CI.

## Realises

- `THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY`
- `THE LOCAL BRIDGE REQUIRES A TOKEN`
- `A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST`
- UC-011 — Hand a job to a local CLI session

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-bridge-server; ARC-012.

Architecture decisions its modules follow: ARC-003, ARC-012, ARC-013.

## Modules

- MOD-bridge-server (adapters) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/bridge-server.mjs` (new)
- `tests/test_bridge_loopback.py`
- `tests/test_bridge_token.py` (created here)
- `tests/bridge-server.test.mjs` (new)
- `tools/run-tests.mjs` (Deno)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Tests the SPEC names

- `tests/test_bridge_loopback.py` — `THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY`
- `tests/test_bridge_token.py` — `THE LOCAL BRIDGE REQUIRES A TOKEN`
- `tests/test_bridge_tunnel.py` — `A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST`

## Acceptance criteria

From the SPEC's checks:

- `THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY` — `tests/test_bridge_loopback.py`
- `THE LOCAL BRIDGE REQUIRES A TOKEN` — `tests/test_bridge_token.py`
- `A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST` — `tests/test_bridge_tunnel.py` — through a test HTTPS proxy in front of a reverse tunnel, the dashboard's request reaches the bridge; counter-proofs: with the tunnel closed, the proxy answers with an error and no bridge is reached; behind a certificate the test browser does not trust, the request fails and the settings page names the certificate as a possible cause.

From the postcondition of UC-011 (Hand a job to a local CLI session), for the part this item builds:

> - The artifacts arrived as open; nothing counts as accepted before a person accepts it.
> - The bridge never listened on a non-loopback interface.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-062 — adds Deno to Agent M's test runner and generated CI
- ITM-003 — module layout

## Needs a person

No.
