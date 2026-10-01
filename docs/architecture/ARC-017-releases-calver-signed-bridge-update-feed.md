---
id: ARC-017
title: Releases — CalVer tags, the bridge built in CI and signed per platform by the publisher, and a signed update feed
forced_by:
  - CALENDAR VERSIONS
  - EVERY PRODUCT HAS ITS OWN VERSION LINE
  - A RELEASE IS TAGGED AND LOGGED
  - A VERSION IS NOT REWRITTEN
  - A RELEASE RUNS EVERY TEST AT EVERY LEVEL
  - THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
  - ACCEPTING THE RELEASE TEST REPORT RELEASES
  - A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
  - AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
  - A GATE NAMES WHO DECIDES IT
  - UC-013
  - UC-044
---
# ARC-017 Releases, the signed bridge, the update feed

## Context

Agent M and every product it manages use `YYYY.MINOR.PATCH` with a tag `vYYYY.MINOR.PATCH` and a
dated changelog entry; a tag never moves. A release is tagged only on the commit where every test at
every level ran, after a person accepts the release test report — and that acceptance is the release
(`ACCEPTING THE RELEASE TEST REPORT RELEASES`). For Agent M itself, a release also produces the bridge
files — a `.dmg`, an `.msi` and an `.AppImage` (ARC-011) —, signed by the PO personally with an Apple
Developer ID (notarised) and a Windows code-signing certificate, and a bridge only updates on the
person's click after checking the signature. The PO keeps signing and expects the bridge to be
installed widely and soon, which matters for how Windows treats a new signature (below).

How a product's — and Agent M's — version is computed, its release test report composed and accepted,
and its tag set is the one release flow of UC-013, owned by the module that keeps test evidence
(MOD-test-records); this decision is about what only Agent M's own release adds: the bridge's files,
their signatures, and the feed the bridges update from.

What Apple, Microsoft and Deno document about signing was read on 2026-09-30 and is recorded in
`docs/measurements/2026-09-30_architecture-open-points.md`, point 2 (*measurement §2*).

## Decision

1. **Agent M's bridge build** is an extra job of Agent M's own release workflow, run on the release
   candidate's commit: `deno desktop` for each target (ARC-011; the `.dmg` on a macOS runner, because it
   "shells out to `hdiutil`"), the platform start test (each file installed or started on a hosted
   runner of its operating system, with `--version` and the `trayId` check of ARC-011), and the SHA-256
   of each file.
2. **Signing is a person's step, not a CI secret.** The PO signs with keys held on their own machine,
   with the tools Apple, Microsoft and Deno document (measurement §2):
   - **macOS.** The `.app` inside the `.dmg` is signed with a Developer ID, the Hardened Runtime and a
     secure timestamp — `deno desktop` does this when an identity is set in `deno.json` ("the bundle is
     signed with Hardened Runtime and a secure timestamp"), and "**Notarization is still a separate
     step**" (`https://docs.deno.com/runtime/desktop/distribution.md`, read 2026-09-30). The `.dmg` is
     then submitted with `xcrun notarytool submit` and the ticket stapled to it. Apple: for a standalone
     binary "it's not currently possible to staple tickets to them", while a disk image or package can
     carry the ticket (`https://developer.apple.com/documentation/security/customizing-the-notarization-workflow`,
     read 2026-09-30). The file the person downloads is therefore the `.dmg`, which works offline at
     first start.
   - **Windows.** "sign the produced executables (the backend `.exe` and `denort.dll` …) externally"
     (Distribution page) with `signtool sign /fd SHA256`, then sign the `.msi` itself, which that page
     does not describe (open measurement below).
   - **`deno compile` output**, where it is used (the fallback of ARC-011): Deno documents
     `codesign -s "Developer ID Application: Your Name" ./main` and `signtool sign /fd SHA256 main.exe`
     (`https://docs.deno.com/runtime/reference/cli/compile.md`, section *Code Signing*, read
     2026-09-30); since PR #24604 (Deno 1.46.0) the program is embedded as a Mach-O segment or PE
     resource, so a signature covers it. Such a bare binary cannot carry a stapled ticket.

   The release workflow waits at a gate decided by the PO (`A GATE NAMES WHO DECIDES IT`) until the
   signed files are uploaded; it then verifies each signature with the platform's tool (`spctl -a -vv`
   and `xcrun stapler validate` for the `.dmg`, `signtool verify /pa` for the `.msi` and the executables
   inside it) and refuses to publish a file that does not verify.
3. **Update feed.** The release publishes, as release assets of Agent M's repository, the signed files
   and `bridge-feed.json`: version, date, release notes link, and per platform file name, size and
   SHA-256. The feed is signed with an Ed25519 key of the publisher (envelope `{signed, signature}`, the
   form Deno documents for its own updater); the public key is compiled into the bridge. The bridge
   checks the feed signature, then the file's SHA-256, then the platform signature, and installs only
   after the person's click (ARC-011).
4. The job and artifact records name the Agent M version that produced them; for a bridge job, both the
   instance's Agent M commit and the bridge's version.
5. **What the person sees on Windows is explained before the download.** Microsoft documents that a
   freshly signed file is "flagged as unrecognized until reputation accumulates", that "EV certificates
   no longer bypass SmartScreen", and that reputation "can take several weeks and hundreds of clean
   installs"; it can carry over "on new files signed by the same trusted certificate"
   (`https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation`, read
   2026-09-30). The publisher therefore keeps one certificate across releases, so that each release adds
   to the same reputation, and the dashboard's download step (UC-044 step 1) says, with a picture, that
   the first releases show SmartScreen's *unrecognized app* notice with the publisher's name, and how to
   continue (`EVERY STEP EXPLAINS ITSELF`).

## Alternatives

- **Signing in CI with the certificates as secrets** — rejected: the PO decided to sign personally; a
  signing key in CI signs whatever a compromised workflow builds.
- **Microsoft's Artifact Signing (formerly Trusted Signing)**, which Microsoft calls its "recommended
  code signing service for non-Store distribution", from $9.99 per month (SmartScreen page above) — not
  chosen: the PO signs personally; it is recorded as the option if the PO's own certificate cannot be
  kept across releases.
- **An EV certificate to avoid the warning** — rejected: "EV certificates no longer bypass SmartScreen"
  (above); an OV certificate kept across releases builds the same reputation.
- **Distributing the bare macOS binary** — rejected: it cannot be stapled, so Gatekeeper must look the
  ticket up online at first start (measurement §2); the `.dmg` carries it.
- **Deno's `Deno.autoUpdate()` with bsdiff patches** — rejected for the reasons in ARC-011 (installs
  without a click, Windows not supported per its documentation).
- **An update check against GitHub's "latest release" API without a signed feed** — rejected: TLS
  alone proves the server, not the publisher; the feed signature ties the file to the PO's key.

## Consequences

- The PO carries an Apple Developer ID (annual fee) and a Windows code-signing certificate (queue
  2026-09-30f rationale); releases of the bridge wait for the PO.
- The first Windows releases are shown as *unrecognized* until the certificate has gathered reputation
  — weeks and many clean installs, not a property a release can buy. Windows 11 Smart App Control "will
  block execution of unsigned files" (same page); a signed one is still subject to reputation. UC-044
  step 2 expects "the publisher's name, not a warning"; for a new certificate the documentation says
  otherwise, which is reported to the PO.
- The Ed25519 feed key is a third key the PO keeps; losing it means shipping a bridge with a new public
  key, which the old bridges cannot verify — they then tell the person to download the new file by hand.
- **Open measurement 1 — notarising the `deno desktop` `.dmg`.** Build with an identity in
  `deno.json` (Deno 2.9.7), notarise and staple the `.dmg`, open it on a Mac that has never seen it;
  record `spctl -a -vv`, `xcrun stapler validate` and whether the app starts. Known issues to watch
  (measurement §2): the bundle signature was invalid on arrival until Deno 2.9.6 (issue #36418, PR
  #36574); a signing error on `laufey_webview` is open (issue #36780); the JIT entitlement and the
  signing order are open in PR #36421 ("`mmap(MAP_JIT)` is denied without
  `com.apple.security.cs.allow-jit`").
- **Open measurement 2 — signing the `.msi`.** Sign the executables and the `.msi` with `signtool`,
  check with `signtool verify /pa`, install on a fresh Windows 11; record what SmartScreen shows.
- **Open measurement 3 — a Hardened-Runtime `deno compile` binary**, only if the fallback of ARC-011 is
  chosen: sign with `--options runtime`, with and without `com.apple.security.cs.allow-jit`, notarise,
  start on a Mac that has never seen the file; record whether V8 starts.
- The product's release flow and Agent M's are the same code (MOD-test-records); only Agent M's own
  release has the bridge job.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): decision 1, the release flow of every product, dropped, as it is the release module's; open until accepted.*
