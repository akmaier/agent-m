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
  - UC-013
  - UC-044
---
# ARC-017 Releases, the signed bridge, the update feed

## Context

Agent M and every product it manages use `YYYY.MINOR.PATCH` with a tag `vYYYY.MINOR.PATCH` and a
dated changelog entry; a tag never moves. A release is tagged only on the commit where every test at
every level ran, after a person accepts the release test report — and that acceptance is the release
(`ACCEPTING THE RELEASE TEST REPORT RELEASES`). For Agent M itself, a release also produces the bridge
files, signed by the PO personally with an Apple Developer ID (notarised) and a Windows code-signing
certificate, and a bridge only updates on the person's click after checking the signature.

## Decision

1. **One release flow for products and for Agent M** (`MOD-release`, UC-013): the next version is
   computed from the last tag of that product's own line (a new year restarts at `YYYY.1.0`); the
   release candidate is the commit; the complete run is started on it (ARC-015); the release test
   report is composed from the result records; accepting it commits report, approval record and
   changelog entry in one commit and sets the tag on the tested commit. An existing tag stops the
   release.
2. **Agent M's bridge build** is an extra job of Agent M's own release workflow, run on the release
   candidate's commit: `deno compile` for each target (ARC-011), the platform start test (each binary
   started on a hosted runner of its operating system with `--version`), and SHA-256 of each file.
3. **Signing is a person's step, not a CI secret.** The PO signs with keys held on their own machine,
   with the tools the Deno documentation names (read 2026-09-30,
   `https://docs.deno.com/runtime/reference/cli/compile.md`, section *Code Signing*): `codesign -s
   "Developer ID Application: …"` and Apple's notarisation (the page links Apple's "Notarizing macOS
   software before distribution"), and `signtool sign /fd SHA256` on Windows. The release workflow
   waits at a gate decided by the PO (`A GATE NAMES WHO DECIDES IT`) until the signed files are
   uploaded; it then verifies each signature with the platform's verification tool and refuses to
   publish a file that does not verify. Which verification commands prove notarisation is part of the
   open measurement below.
4. **Update feed.** The release publishes, as release assets of Agent M's repository, the signed files
   and `bridge-feed.json`: version, date, release notes link, and per platform file name, size and
   SHA-256. The feed is signed with an Ed25519 key of the publisher (envelope `{signed, signature}`, the
   form Deno documents for its own updater); the public key is compiled into the bridge. The bridge
   checks the feed signature, then the file's SHA-256, then the platform signature, and replaces itself
   only after the person's click (ARC-011).
5. The job and artifact records name the Agent M version that produced them; for a bridge job, both the
   instance's Agent M commit and the bridge's version.

## Alternatives

- **Signing in CI with the certificates as secrets** — rejected: the PO decided to sign personally; a
  signing key in CI signs whatever a compromised workflow builds.
- **Deno's `Deno.autoUpdate()` with bsdiff patches** — rejected for the reasons in ARC-011 (installs
  without a click, Windows not supported per its documentation).
- **An update check against GitHub's "latest release" API without a signed feed** — rejected: TLS
  alone proves the server, not the publisher; the feed signature ties the file to the PO's key.

## Consequences

- The PO carries an Apple Developer ID (annual fee) and a Windows code-signing certificate (queue
  2026-09-30f rationale); releases of the bridge wait for the PO.
- The Ed25519 feed key is a third key the PO keeps; losing it means shipping a bridge with a new public
  key, which the old bridges cannot verify — they then tell the person to download the new file by hand.
- **Open measurement — signing a `deno compile` or `deno desktop` output** (ARC-011, measurement 3):
  whether notarisation accepts it and whether Windows shows the publisher without a warning is measured
  on the first release candidate, recorded in `docs/measurements/`.
- The product's release flow and Agent M's are the same code; only Agent M's own release has the bridge
  job.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
