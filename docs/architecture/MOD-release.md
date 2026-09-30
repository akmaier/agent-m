---
id: MOD-release
title: Computes versions, release test reports and changelog entries, tags releases, and publishes and verifies the bridge's update feed
realises:
  - CALENDAR VERSIONS
  - EVERY PRODUCT HAS ITS OWN VERSION LINE
  - A RELEASE IS TAGGED AND LOGGED
  - A VERSION IS NOT REWRITTEN
  - THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
  - ACCEPTING THE RELEASE TEST REPORT RELEASES
  - A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - UC-013
  - UC-030
follows:
  - ARC-003
  - ARC-017
uses:
  - MOD-test-records.commitOutcomes
  - MOD-test-records.rateComparison
  - MOD-traceability.auditRows
  - MOD-git-host.tags
  - MOD-git-host.commitFiles
provides:
  - nextVersion
  - releaseReport
  - acceptRelease
  - updateFeed
  - verifyFeed
---
# MOD-release Computes versions, release test reports and changelog entries, tags releases, and publishes and verifies the bridge's update feed

## Responsibility

The release flow of ARC-017 for every product and for Agent M, and the bridge's update feed. Pure
core apart from the calls into MOD-git-host; signing itself is the publisher's step outside Agent M.

**Current state.** No code exists; releases have been made by hand.

## Interfaces

- `nextVersion(tags, today, step) -> "YYYY.MINOR.PATCH"` — of this product's own line; a new year restarts at `YYYY.1.0`.
- `releaseReport(outcomes, audit, candidate) -> text` — every test, level, outcome or rate, guarded identifiers, commit; failures and worse rates first.
- `acceptRelease({ report, limitations, changelog, candidate, click }) -> { commit, tag }` — one commit with report, approval record and changelog entry, then the tag on the tested commit; a failing test or worse rate without a recorded reason, or an existing tag, stops it.
- `updateFeed(files, version, notes) -> feed` — the bridge feed: per platform name, size and SHA-256, to be signed with the publisher's Ed25519 key.
- `verifyFeed(envelope, publicKey) -> feed | null` — Ed25519 verification with Web Crypto over the exact `signed` string.

Uses, as declared above: `MOD-test-records.commitOutcomes`, `MOD-test-records.rateComparison`, `MOD-traceability.auditRows`, `MOD-git-host.tags`, `MOD-git-host.commitFiles`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
