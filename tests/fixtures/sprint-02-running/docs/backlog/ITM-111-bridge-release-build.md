---
id: ITM-111
title: The bridge release build — deno desktop per platform, start test, checksums, a gate for the publisher's signatures
kind: implementation
level: 2
realises:
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
modules:
  - MOD-bridge-app
depends_on:
  - ITM-110
  - ITM-026
  - ITM-058
origin: backlog refinement 2026-10-01
---
# ITM-111 The bridge release build — deno desktop per platform, start test, checksums, a gate for the publisher's signatures

**REGISTER**

## Outcome

ARC-017 decisions 1 and 2: on the release candidate's commit, `deno desktop` builds the `.dmg` (on a macOS runner), the `.msi` and the `.AppImage`; each is started on a hosted runner of its system (`--version`, the `trayId` check); SHA-256 per file; the workflow waits at a gate decided by the PO until the signed files are uploaded, verifies each signature and refuses to publish one that does not verify; then publishes the files and the signed `bridge-feed.json`.

## Realises

- `THE BRIDGE IS ONE FILE PER PLATFORM`
- `THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE`
- `THE BRIDGE IS SIGNED BY ITS PUBLISHER`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — ARC-011 decision 2, ARC-017 decisions 1–3.

Architecture decisions its modules follow: ARC-003, ARC-011, ARC-017.

## Modules

- MOD-bridge-app (shells) — uses MOD-bridge-server, MOD-bridge-tunnel, MOD-derivation, MOD-git-host, MOD-mailbox, MOD-participants, MOD-run-engine, MOD-settings-store, MOD-test-records

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `.github/workflows/release-bridge.yml` (new)
- `bridge/build/` (new)
- `tests/test_bridge_release.py`
- `tests/test_single_definition.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Tests the SPEC names

- `tests/test_bridge_release.py` — `THE BRIDGE IS ONE FILE PER PLATFORM`; `THE BRIDGE IS SIGNED BY ITS PUBLISHER`
- `tests/test_single_definition.py` — `THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE`

## Acceptance criteria

From the SPEC's checks:

- `THE BRIDGE IS ONE FILE PER PLATFORM` — `tests/test_bridge_release.py` — the release build yields one file per platform, and each starts, after installation where it is an installer, on a machine without Node or Deno.
- `THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE` — `tests/test_single_definition.py` — the bridge's build imports the dashboard's modules; no job definition exists twice.
- `THE BRIDGE IS SIGNED BY ITS PUBLISHER` — `tests/test_bridge_release.py` — the release refuses to publish a file whose signature or notarisation cannot be verified.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-110 — extends tests/test_bridge_release.py
- ITM-026 — extends tests/test_single_definition.py
- ITM-058 — the release flow it is an extra job of

## Needs a person

Signing is the PO's step on the PO's own machine (Apple Developer ID with notarisation, Windows code-signing certificate, the Ed25519 feed key) — see ITM-121.
