---
id: ITM-1048
title: A release is published whole, as a draft first
level: module
realises:
  - UC-044
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - A VERSION IS NOT REWRITTEN
modules:
  - MOD-repository-hosts
builds_on:
  - ITM-1046
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-3, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1048 A release is published whole, as a draft first

**REGISTER**

## Outcome

MOD-repository-hosts.md:248-255: "`publishRelease(tag, release: { name, notes, files }) -> Promise<Release>` — on GitHub,
creates the release of a tag that stands: first as a draft, then each file uploaded to it, then published, so that no
release is seen with only part of its files. ... An existing release of the tag is never replaced (`A VERSION IS NOT
REWRITTEN`). On a GitLab server and through a clone without a token it throws `NotSupported`." Not built.

## Acceptance

- Unit tests that name MOD-repository-hosts, over a fake GitHub API: a release is created as a draft, every file uploaded, then
  published, and the returned `Release` carries each file's address and SHA-256; a tag with a release throws `ReleaseExists`;
  a failed upload leaves the draft unpublished and throws `UploadFailed { file }`.
- Counter-proof: publishing before the last upload fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
