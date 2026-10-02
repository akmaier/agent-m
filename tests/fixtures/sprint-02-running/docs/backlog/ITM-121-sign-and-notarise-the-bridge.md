---
id: ITM-121
title: Sign and notarise the bridge files, and create the update feed's key
kind: measurement
level: 2
realises:
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
modules: []
depends_on:
  - ITM-111
origin: backlog refinement 2026-10-01
---
# ITM-121 Sign and notarise the bridge files, and create the update feed's key

**REGISTER**

## Outcome

ARC-017 open measurements 1 and 2: the `.dmg` built with an identity in `deno.json`, notarised with `xcrun notarytool` and stapled, opened on a Mac that has never seen it (`spctl -a -vv`, `xcrun stapler validate`); the executables and the `.msi` signed with `signtool sign /fd SHA256`, checked with `signtool verify /pa`, installed on a fresh Windows 11 with what SmartScreen shows recorded; the Ed25519 key pair of the update feed created and its public key handed to the build.

## Realises

- `THE BRIDGE IS SIGNED BY ITS PUBLISHER`
- `THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE`

## Where it came from

ARC-017 consequences (open measurements 1, 2; the feed key).

## Modules

- none — a repository check or a measurement: the rule is checked across the repository or by a person, not by one module's code (ARC-020 decision 5).

Files it creates or changes:

- `docs/measurements/<date>_bridge-signing.md` (new)
- `bridge/deno.json` (the signing identity's name, never a key)

## Kind and level

- Job kind: **measurement** — not a coding job: a person measures or decides, and the result is a dated file in `docs/measurements/`.
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Checks of the SPEC this measurement bears on

- `tests/test_bridge_release.py` — `THE BRIDGE IS SIGNED BY ITS PUBLISHER`; `THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE`

## Acceptance criteria

From the SPEC's checks:

- `THE BRIDGE IS SIGNED BY ITS PUBLISHER` — `tests/test_bridge_release.py` — the release refuses to publish a file whose signature or notarisation cannot be verified.
- `THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE` — `tests/test_bridge_release.py` — an update with an invalid signature is refused; counter-proof: a valid one is installed after the click.

Further:

- The measurement file states its method, date, environment and every raw result, and is not edited afterwards.
- Where the result contradicts the architecture, it is reported as a finding to the PO; nothing in SPEC.md, the use cases or the architecture is changed by this item.

## Depends on

- ITM-111 — the files to sign

## Needs a person

Only the PO: the Apple Developer ID, the Windows code-signing certificate and the Ed25519 feed key are the PO's own and stay on the PO's machine.
