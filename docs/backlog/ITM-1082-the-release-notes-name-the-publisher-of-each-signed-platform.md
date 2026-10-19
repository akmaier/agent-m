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
  - ITM-961
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

akmaier accepted that draft (`48e16178`).

## Acceptance

- With fixture files whose verifier reads a name, the notes `publishRelease` writes hold `Publisher (macOS): <name>` and
  `Publisher (Windows): <name>`, and no line for Linux.
- Where a verifier reads no name, nothing is published. A test checks it, as a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Stopped before its first commit (sprint team1/96, developer-sonnet-d): the accepted text cannot be built as written.**
- `publishRelease` runs after the three platforms, on one runner. The verifiers of macOS and Windows run only on their
  own platform's runner (MOD-bridge-build.md:91-95).
- What travels from each platform's run to `publishRelease` is `platform-build.json`, a `PlatformBuild` (:88-90). It
  has no publisher.
- `buildPlatform`, which runs the verifier, is not built (`src/bridge-build/index.mjs:3`; ITM-961).
- **The draft for akmaier,** written by developer-sonnet-d, on `main` as `da3014b5`:
  - `PlatformBuild` gains `publisher: string | null`, which `buildPlatform` fills from its own verifier, `null` on
    Linux;
  - `publishRelease` writes the two lines from it;
  - a macOS or Windows build without a name stops with `BuildMissing { platform }`.
- akmaier accepted that draft (`2b0e024e`). It waits for ITM-961, which builds `buildPlatform`.
