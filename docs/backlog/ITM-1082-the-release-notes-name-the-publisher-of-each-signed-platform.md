---
id: ITM-1082
title: The release's notes name the publisher of each signed platform
level: module
realises:
  - UC-044
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
modules:
  - MOD-bridge-build
builds_on:
tests:
  - unit
origin:
  - ITM-1079's stop (sprint team1/95), from developer-sonnet-b's draft d53be63b
---
# ITM-1082 The release's notes name the publisher of each signed platform

**REGISTER**

## Outcome

ITM-1079's route `bridge` shows the publisher from the line `Publisher (<system>): <name>` of the release's notes. The
draft for akmaier on `main` (d53be63b) has MOD-bridge-build's `publishRelease` write one such line for macOS and one for
Windows. Each name is the one the platform's own verifier reads from the signed file, and `BuildMissing` and
`SignatureInvalid` stand where it reads none. Linux gets no line.

It waits for akmaier's acceptance of that draft.

## Acceptance

- With fixture files whose verifier reads a name, the notes `publishRelease` writes hold `Publisher (macOS): <name>` and
  `Publisher (Windows): <name>`, and no line for Linux.
- Where a verifier reads no name, nothing is published. A test checks it, as a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
