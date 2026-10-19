---
id: ITM-1031
title: A release's files are listed with their sizes and checksums
level: module
realises:
  - UC-044
  - THE BRIDGE IS ONE FILE PER PLATFORM
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-1, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1031 A release's files are listed with their sizes and checksums

**REGISTER**

## Outcome

MOD-repository-hosts.md:242-247: "`listReleaseAssets(tag: string | "latest") -> Promise<Release>` — a release and its files,
as the Bridge's download page offers them (UC-044): name, size, the download address, and the SHA-256 the server reports for
each file. ... where the server reports none the caller links the release's checksum file ... fails with `NotFound` when the
release does not exist, `TokenRefused`, `RateLimited`, `Unreachable`, and `NotSupported` through a clone." `Release` is
stated at MOD-repository-hosts.md:141-142. Neither is built (`listReleaseAssets` is in no file of `src/repository-hosts/`).

## Acceptance

- Unit tests that name MOD-repository-hosts, over a fake GitHub API: `latest` and a named tag give each asset's name, size,
  address and the server's SHA-256, `null` where it reports none; a missing release throws `NotFound`; a clone throws
  `NotSupported`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
