---
id: ITM-961
title: The Bridge's file of one platform is built, signed and checked
level: module
realises:
  - UC-044
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
modules:
  - MOD-bridge-build
builds_on:
  - ITM-459
tests:
  - unit
  - component
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-4, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-961 The Bridge's file of one platform is built, signed and checked

**REGISTER**

## Outcome

MOD-bridge-build.md:91-99: "`buildPlatform(config: { platform: "macos" | "windows" | "linux", checkout: string, tag: string, folder: string }) ->
  Promise<PlatformBuild>` — on a
runner of that platform, from the instance's checkout at the release tag: installs the app's packages from the lockfile;
builds the platform's files with electron-builder, signs them, and notarises the macOS ones; writes the platform's feed file,
the detached signatures and the checksums; checks each code signature with the platform's own verifier and each detached
signature with the public key; and runs the tunnel check above. ... Errors: `SecretMissing { name }` — before anything is
built —, `BuildFailed`, `NotarisationFailed`, `SignatureInvalid { file }`, `NativeAddonFound { file }`, `TunnelCheckFailed`".
Since ITM-955, `src/bridge-build/` holds `index.mjs`, `sign.mjs` (the detached signatures and checksums) and `publish.mjs`.
This item builds `builder.mjs` and `buildPlatform`, and reuses `sign.mjs`. Its `SecretMissing` carries the field ITM-955's
gate named, `secret`, while MOD-bridge-build's text says `name` (a text gap noted in sprint team2/94's review).

## Acceptance

- Unit tests that name MOD-bridge-build: a missing secret throws `SecretMissing` before anything is built; a detached
  signature that does not hold throws `SignatureInvalid`; a `.node` file in the app throws `NativeAddonFound`; the
  electron-builder configuration is made from `appDescription` and names the four files of MOD-bridge-build's table.
- A component test on the Linux runner builds the `.AppImage` with a test update key and checks its detached signature and
  `SHA256SUMS` line.
- Counter-proof: a build that hands on a file whose signature fails is caught.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/bridge-build/` and the tests that name MOD-bridge-build change.
