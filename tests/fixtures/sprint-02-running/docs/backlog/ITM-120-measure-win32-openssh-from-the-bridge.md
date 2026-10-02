---
id: ITM-120
title: Measure Win32-OpenSSH run from the bridge's install folder
kind: measurement
level: 2
realises:
  - THE BRIDGE CREATES ITS OWN SSH KEY
  - THE BRIDGE OPENS ITS TUNNELS ITSELF
modules: []
depends_on:
  - ITM-103
  - ITM-111
origin: backlog refinement 2026-10-01
---
# ITM-120 Measure Win32-OpenSSH run from the bridge's install folder

**REGISTER**

## Outcome

ARC-013 open measurement 1: on a fresh Windows 11 without the OpenSSH feature, the bridge `.msi` with `ssh.exe`, `ssh-keygen.exe` and `libcrypto.dll` — the key's owner-only ACL, whether `ssh -N -R …` holds the tunnel, whether a Windows-feature `ssh.exe` on the path interferes, and how `deno desktop` places extra executables into its `.msi`.

## Realises

- `THE BRIDGE CREATES ITS OWN SSH KEY`
- `THE BRIDGE OPENS ITS TUNNELS ITSELF`

## Where it came from

ARC-013 consequences (open measurement 1).

## Modules

- none — a repository check or a measurement: the rule is checked across the repository or by a person, not by one module's code (ARC-020 decision 5).

Files it creates or changes:

- `docs/measurements/<date>_win32-openssh.md` (new)

## Kind and level

- Job kind: **measurement** — not a coding job: a person measures or decides, and the result is a dated file in `docs/measurements/`.
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Checks of the SPEC this measurement bears on

- `tests/test_bridge_tunnel.py` — `THE BRIDGE CREATES ITS OWN SSH KEY`; `THE BRIDGE OPENS ITS TUNNELS ITSELF`

## Acceptance criteria

From the SPEC's checks:

- `THE BRIDGE CREATES ITS OWN SSH KEY` — `tests/test_bridge_tunnel.py` — the private key file is readable by its owner only and appears in no export; counter-proof: an export containing it fails the test.
- `THE BRIDGE OPENS ITS TUNNELS ITSELF` — `tests/test_bridge_tunnel.py` — two bridges and a test SSH server: the dashboard's request reaches the far bridge without any command typed; counter-proof: with the far bridge's tunnel closed, nothing answers.

Further:

- The measurement file states its method, date, environment and every raw result, and is not edited afterwards.
- Where the result contradicts the architecture, it is reported as a finding to the PO; nothing in SPEC.md, the use cases or the architecture is changed by this item.

## Depends on

- ITM-103 — the tunnel code
- ITM-111 — the .msi that ships it

## Needs a person

A person with a fresh Windows 11 machine and a jump host.
