---
id: ITM-1049
title: A release tag builds and publishes the Bridge
level: module
realises:
  - UC-044
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - THE BRIDGE IS ONE FILE PER PLATFORM
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-955
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-6, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1049 A release tag builds and publishes the Bridge

**REGISTER**

## Outcome

MOD-workflow-entries.md:208-211: "`onReleaseTagged(env) -> Promise<EntryStatus>` — in the instance, on a release tag: on each
platform's runner, the Bridge's file of that platform, signed; then the files, checksums, signatures and update feed published
as the release of the tag (`THE BRIDGE IS SIGNED BY ITS PUBLISHER`); nothing is published when a signature cannot be
verified." Not built: `src/workflow-entries/instance.mjs` exports `onApprovalsCommitted` and `onSourcesCommitted` only. The
instance's workflow file under `.github/workflows/` that runs it on the three platforms' runners is part of this item.

## Acceptance

- Unit tests that name MOD-workflow-entries, with MOD-bridge-build's functions faked: a tag runs `buildPlatform` per platform
  and `publishRelease` once; a missing secret ends `not run` naming it; a failed signature ends `failed` with nothing
  published.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/workflow-entries/`, the instance's release workflow file and the tests that name MOD-workflow-entries change.
