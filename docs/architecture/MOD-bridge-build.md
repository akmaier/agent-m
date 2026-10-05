---
id: MOD-bridge-build
title: The Bridge's release — one signed file per platform, and its update feed
folder: src/bridge-build/
realises:
follows:
  - ARC-040
  - ARC-050
  - ARC-052
uses:
  - MOD-desktop-shell.appDescription
  - MOD-repository-hosts.Host
  - MOD-repository-hosts.publishRelease
  - MOD-reuse-facts.Candidate
  - MOD-reuse-facts.DueDiligence
  - MOD-reuse-facts.registryFacts
provides:
  - PlatformBuild
  - buildPlatform
  - publishRelease
---
# MOD-bridge-build The Bridge's release — one signed file per platform, and its update feed

## Responsibility

It belongs to the Bridge (ARC-040). It makes the Bridge's release in the instance's release workflow, which
MOD-workflow-entries runs on a release tag: on the runner of each platform, the one file a person downloads for it,
built with electron-builder (ARC-050) from the modules the dashboard uses (`THE BRIDGE IS BUILT FROM THE DASHBOARD'S
CODE`, `THE BRIDGE IS ONE FILE PER PLATFORM`) and signed by the publisher (`THE BRIDGE IS SIGNED BY ITS PUBLISHER`); then
the checksums, a detached signature for every file, and the update feed electron-updater reads. Nothing is published
unless every signature holds. It decides, for ARC-052, that ssh2's optional native dependencies stay out of the build. It
runs in Node, on the instance's CI runners.

## Parts

- `index.mjs` — the interface.
- `package.json`, `package-lock.json` — the Bridge app's packages at exact versions: electron, electron-builder and
  electron-updater (ARC-050); imapflow, nodemailer and postal-mime (ARC-051); ssh2 (ARC-052).
- `builder.mjs` — electron-builder's configuration, made from `appDescription` and the release.
- `sign.mjs` — the detached signatures and the checksums, and their checks.
- `publish.mjs` — the release's files and their publication.

## Data

**The release's files.** `V` is the release tag's version, `YYYY.minor.patch`, which electron-updater compares as a
semantic version.

| File | For | Signed with |
|---|---|---|
| `Agent-M-Bridge-V-macos.dmg` | the person on macOS — Apple silicon and Intel in one file | the Developer ID, notarised |
| `Agent-M-Bridge-V-macos.zip` | electron-updater on macOS only, which updates from a zip; no person downloads it | the Developer ID, notarised |
| `Agent-M-Bridge-V-windows.exe` | the person on Windows x64 — an installer for the person alone, which asks for no administrator's rights | the code-signing certificate |
| `Agent-M-Bridge-V-linux.AppImage` | the person on Linux x64 | — the system checks no code signature |
| `*.blockmap` | electron-updater's differential download | — |
| `latest-mac.yml`, `latest.yml`, `latest-linux.yml` | the update feed, as electron-builder writes it: the version, each file with its SHA-512 and size, the release date | — |
| `SHA256SUMS` | one line per file, `<sha256>  <name>`, which the dashboard shows beside the file | — |

Every file of the table has its **detached signature**, `<file>.sig`: the Ed25519 signature of the file's bytes by the
publisher's update key, in base64 on one line. On Linux, the detached signature and the checksum are the publisher's
signature. Other processors are not built.

**What the app carries**: the main entry and the window `appDescription` names, every module folder they reach through
the modules' `index.mjs`, and the packages above that the app needs at run time, with the licence file of each beside
Agent M's own `LICENSE`. Among its resources the build places `build.json` and `update-key.pem` as MOD-desktop-shell
defines them — the instance, the app's identifier `io.github.<owner>.<repository>.bridge`, the instance's Pages origin,
the version and its commit; the public half of the publisher's update key — and electron-builder's `app-update.yml`,
which names the instance repository's releases as the feed. Electron's fuses are set so that the signed binary does not
run as plain Node, ignores `NODE_OPTIONS` and debugger switches, and loads its code only from its own archive, whose
integrity it checks on macOS and Windows.

**ssh2's optional native dependencies** (ARC-052) do not go into the build. The app's packages are installed from the
lockfile without optional dependencies, so neither `cpu-features` nor `nan` is there, and the crypto binding ssh2's
install script tries to compile with `nan` is not built: these are native code, which would have to be compiled on each
platform's runner for Electron's Node — ssh2's install script compiles for the Node that runs it — and ssh2 works
without them, choosing its default cipher list without `cpu-features`. A build whose app holds a compiled Node addon, a
`.node` file, fails. The choice is measured on every release: each platform's packaged app opens a reverse tunnel and a
forward to a test SSH server and answers a request through them before anything is published.

**The secrets**, read from the release workflow's environment, never from a file: `BRIDGE_MACOS_CERTIFICATE` and
`BRIDGE_MACOS_CERTIFICATE_PASSWORD` — the Developer ID Application certificate —; `BRIDGE_NOTARY_KEY`,
`BRIDGE_NOTARY_KEY_ID` and `BRIDGE_NOTARY_ISSUER` — the App Store Connect API key for notarisation —;
`BRIDGE_WINDOWS_CERTIFICATE` and `BRIDGE_WINDOWS_CERTIFICATE_PASSWORD` — the code-signing certificate —; and
`BRIDGE_UPDATE_KEY` — the publisher's private update key, Ed25519 in PEM, from which the public half the app carries is
derived. No key enters a repository, a log or a published file.

## Interfaces

- `PlatformBuild` — `{ platform: "macos" | "windows" | "linux", version: string, folder: string, files: { name: string,
  size: number, sha256: string, signature: string }[] }`: the files one platform's build wrote into its folder, with
  their checksums and detached signatures; the build also writes it there as `platform-build.json`.
- `buildPlatform(config: { platform: "macos" | "windows" | "linux", checkout: string, tag: string, folder: string }) ->
  Promise<PlatformBuild>` — on a runner of that platform, from the instance's checkout at the release tag: installs the
  app's packages from the lockfile; builds the platform's files with electron-builder, signs them, and notarises the
  macOS ones; writes the platform's feed file, the detached signatures and the checksums; checks each code signature
  with the platform's own verifier and each detached signature with the public key; and runs the tunnel check above.
  Crosses the network to the npm registry, to Apple's notary service and to the certificate's timestamp service.
  Errors: `SecretMissing { name }` — before anything is built —, `BuildFailed { reason }`, `NotarisationFailed { reason
  }`, `SignatureInvalid { file }`, `NativeAddonFound { file }`, `TunnelCheckFailed { reason }`; with any of them the
  platform's files are not handed on.
- `publishRelease(host: Host, config: { tag: string, folders: string[] }) -> Promise<{ published: string[], facts:
  DueDiligence[] }>` — after the three platforms, with `host` the instance repository: checks that each platform's
  build is there and that every checksum and detached signature still holds; reads again the due diligence of every
  package the app carries (ARC-052), and publishes nothing when a licence is no longer known to be compatible with Agent
  M's; writes `SHA256SUMS` and its signature; and publishes every file with its signature, and the feed, as the release
  `Agent M V` of the tag, its notes naming the version, its commit and the due diligence read, through Access's
  `publishRelease` — a draft release that becomes public only once every file is uploaded, so that no Bridge is offered
  a release whose files are missing. It then compares the SHA-256 the server reports for each file with its own. The
  facts it read are returned for the entry's status. Crosses
  the network to the package registries and to the instance's server. Errors: `BuildMissing { platform }`,
  `SignatureInvalid { file }`, `LicenceNotCompatible { package }` — nothing is published then —, `ChecksumMismatch {
  file }`, and what Access names; a file the server holds with other bytes is never installed, since its detached
  signature does not hold.

## Files

Reads, from the instance's checkout at the tag, the folders the app carries and its own manifest and lockfile; reads the
secrets from the environment. Writes the release's files into the folder it is given on the runner, and publishes them
as the release of the tag. Writes no repository file.

## Uses

- `MOD-desktop-shell.appDescription` — what the app is: its name, its entries, its icons, and where the build places
  `build.json` and the public update key.
- `MOD-repository-hosts.Host`, `publishRelease` — the release of the tag in the instance repository: a draft, its files
  uploaded, then published, with each file's SHA-256 as the server reports it.
- `MOD-reuse-facts.Candidate`, `DueDiligence`, `registryFacts` — the due diligence of the packages the app carries, read
  again before each release.
