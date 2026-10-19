---
id: ITM-955
title: publishRelease checks every platform's build, its signatures and licences, and publishes the release
level: module
realises:
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - UC-044
modules:
  - MOD-bridge-build
builds_on:
tests:
  - unit
origin:
  - akmaier's question of 2026-10-18 whether team 2 can work on topics independent of team 1; MOD-bridge-build's interface is accepted and not built (src/bridge-build/ holds only its packages)
---
# ITM-955 publishRelease checks every platform's build, its signatures and licences, and publishes the release

**REGISTER**

## Outcome

MOD-bridge-build is accepted at blob `279df7dc` (`docs/approvals/MOD-bridge-build-279df7dcc3c6.md`). `src/bridge-build/`
holds only `package.json` and `package-lock.json`. This item builds `index.mjs`, `sign.mjs` and `publish.mjs`:
`PlatformBuild` and `publishRelease(host, { tag, folders })` as MOD-bridge-build.md:88-112 states them.
- It "checks that each platform's build is there and that every checksum and detached signature still holds".
- It "reads again the due diligence of every package the app carries ... and publishes nothing when a licence is no
  longer known to be compatible with Agent M's".
- It "writes `SHA256SUMS` and its signature".
- It publishes every file with its signature and the feed through Access's `publishRelease`, and then "compares the
  SHA-256 the server reports for each file with its own".
- Errors: `BuildMissing`, `SignatureInvalid`, `LicenceNotCompatible` (nothing is published then), and `ChecksumMismatch`.
- The detached signature is "the Ed25519 signature of the file's bytes by the publisher's update key, in base64 on one
  line" (Data).

Its inputs are accepted interfaces:
- MOD-reuse-facts' `registryFacts` (built);
- MOD-repository-hosts' `publishRelease` (MOD-repository-hosts.md:248), which is not built yet. The tests use a fake
  host of its accepted signature.
`buildPlatform` is not part of this item: it needs electron-builder and each platform's runner.

**Independent of team 1** (agreement 91). MOD-bridge-build uses MOD-desktop-shell, MOD-repository-hosts and
MOD-reuse-facts. It changes none of them, and none of team 1's held or claimed modules uses it.

## Acceptance

- Unit tests that name MOD-bridge-build, over three fake platform folders with an Ed25519 key made in the test and a
  fake host:
  - with every file and signature in place, the release is published with `SHA256SUMS` and its `.sig`;
  - one changed byte gives `SignatureInvalid` naming the file, with nothing published;
  - a missing platform gives `BuildMissing`;
  - an incompatible licence from a fake `registryFacts` gives `LicenceNotCompatible`, with nothing published;
  - a server SHA-256 that differs gives `ChecksumMismatch`.
- Counter-proof: a check that skips the detached signatures fails.
- No secret is read from a file, and none is written to a log.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/bridge-build/` and the tests that name MOD-bridge-build change.
